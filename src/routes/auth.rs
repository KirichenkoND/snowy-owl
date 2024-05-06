use super::Json;
use super::RouteState;
use crate::AppState;
use crate::{error::Error, fail, middleware::Claims, ENCODING_KEY};
use argon2::Argon2;
use argon2::PasswordVerifier;
use axum::{extract::State, routing::*};
use axum_extra::extract::{cookie::Cookie, CookieJar};
use jsonwebtoken::Header;
use serde::Deserialize;
use sqlx::Row;
use time::{Duration, OffsetDateTime};
use utoipa::OpenApi;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
struct LoginRequest {
    phone: String,
    password: String,
}

/// Login as an employee
#[utoipa::path(
    get,
    path = "/login",
    tag = "Authentication",
    request_body = LoginRequest,
    responses((status = 200), (status = 400))
)]
async fn login(
    State(state): RouteState,
    mut jar: CookieJar,
    Json(data): Json<LoginRequest>,
) -> Result<CookieJar, Error> {
    let LoginRequest { phone, password } = data;

    let row = sqlx::query("SELECT id, password_hash, role FROM Employees WHERE phone = $1")
        .bind(phone)
        .fetch_optional(&state.db)
        .await?
        .ok_or(fail!(BAD_REQUEST, "Неправильный телефон или пароль"))?;
    let password_hash = row.get::<String, _>("password_hash");

    Argon2::default()
        .verify_password(
            password.as_bytes(),
            &password_hash.as_str().try_into().unwrap(),
        )
        .map_err(|_| fail!(BAD_REQUEST, "Неправильный телефон или пароль"))?;

    let expires_at = OffsetDateTime::now_utc() + Duration::days(3);
    let claims = Claims {
        expires_at,
        role: row.get("role"),
        employee_id: row.get("id"),
    };

    let token =
        jsonwebtoken::encode(&Header::default(), &claims, ENCODING_KEY.get().unwrap()).unwrap();
    let cookie = Cookie::build(("token", token))
        .expires(expires_at)
        .secure(true)
        .http_only(true)
        .path("/");

    jar = jar.remove("token").add(cookie);
    Ok(jar)
}

pub fn openapi() -> utoipa::openapi::OpenApi {
    #[derive(OpenApi)]
    #[openapi(paths(login), components(schemas(LoginRequest)))]
    struct Api;

    Api::openapi()
}

pub fn router() -> Router<AppState> {
    Router::new().route("/login", post(login))
}
