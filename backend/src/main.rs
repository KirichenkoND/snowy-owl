use axum::{extract::FromRef, Router};
use dotenvy::var;
use jsonwebtoken::{DecodingKey, EncodingKey};
use sqlx::{migrate, PgPool};
use std::{panic, sync::OnceLock};
use tokio::{
    net::TcpListener,
    signal::unix::{signal, SignalKind},
};
use tracing::{info, Level};
use tracing_subscriber::{fmt, prelude::*, registry, EnvFilter};
use utoipa_swagger_ui::SwaggerUi;

mod error;
mod middleware;
mod models;
mod routes;

#[derive(Clone, FromRef)]
struct AppState {
    db: PgPool,
}

fn init_tracing() {
    #[cfg(debug_assertions)]
    let level = Level::DEBUG;
    #[cfg(not(debug_assertions))]
    let level = Level::WARN;

    let env = EnvFilter::builder()
        .with_default_directive(level.into())
        .from_env_lossy();
    registry().with(fmt::layer().with_filter(env)).init();

    panic::set_hook(Box::new(|pi| tracing::error!("{pi}")));
}

static ENCODING_KEY: OnceLock<EncodingKey> = OnceLock::new();
static DECODING_KEY: OnceLock<DecodingKey> = OnceLock::new();

#[tokio::main]
async fn main() -> Result<(), error::Error> {
    init_tracing();

    let jwtkey = var("JWT_KEY").expect("Env `JWT_KEY` is required");
    let ek =
        EncodingKey::from_base64_secret(&jwtkey).expect("Env `JWT_KEY` must be BASE64 encoded");
    let dk = DecodingKey::from_base64_secret(&jwtkey).unwrap();

    _ = ENCODING_KEY.set(ek);
    _ = DECODING_KEY.set(dk);

    let port = var("PORT")
        .map(|s| s.parse::<u16>())
        .unwrap_or(Ok(9000))
        .expect("Invalid value of `PORT`");
    let host = var("HOST").unwrap_or_else(|_| "0.0.0.0".to_owned());

    let pgurl = var("DATABASE_URL").expect("Env `DATABASE_URL` is required");
    let db = PgPool::connect(&pgurl).await?;

    migrate!("./migrations")
        .run(&db)
        .await
        .expect("Failed to migrate database schema");

    let state = AppState { db };

    let listener = TcpListener::bind(format!("{host}:{port}")).await?;
    info!("Listening on {}", listener.local_addr()?);

    let (mut s1, mut s2) = (
        signal(SignalKind::interrupt())?,
        signal(SignalKind::terminate())?,
    );
    let shutdown = async move {
        tokio::select! {
            _ = s1.recv() => {},
            _ = s2.recv() => {}
        }
    };

    let mut openapi = routes::subjects::openapi();
    openapi.merge(routes::classes::openapi());
    openapi.merge(routes::rooms::openapi());
    openapi.merge(routes::students::openapi());
    openapi.merge(routes::teachers::openapi());
    openapi.merge(routes::marks::openapi());
    openapi.merge(routes::auth::openapi());

    let app = Router::new()
        .nest("/subjects", routes::subjects::router())
        .nest("/classes", routes::classes::router())
        .nest("/rooms", routes::rooms::router())
        .nest("/students", routes::students::router())
        .nest("/teachers", routes::teachers::router())
        .nest("/principals", routes::principals::router())
        .nest("/marks", routes::marks::router())
        .nest("/auth", routes::auth::router())
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", openapi))
        .with_state(state);

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown)
        .await?;

    Ok(())
}
