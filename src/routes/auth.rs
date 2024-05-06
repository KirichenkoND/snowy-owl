use super::{Json, Query};
use crate::{error::Error, fail, middleware::Claims, models::Role, ENCODING_KEY};
use axum::extract::State;
use axum_extra::extract::{cookie::Cookie, CookieJar};
use jsonwebtoken::Header;
use serde::Deserialize;
use sqlx::PgPool;
use time::{Duration, OffsetDateTime};

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct LoginRequest {
    phone: String,
    password: String,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct LoginParams {
    role: Role,
}

async fn login(
    State(db): State<PgPool>,
    Query(params): Query<LoginParams>,
    mut jar: CookieJar,
    Json(data): Json<LoginRequest>,
) -> Result<CookieJar, Error> {
    let LoginRequest { phone, password } = data;
    let LoginParams { role } = params;

    let claims: Claims;
    let expires_at = OffsetDateTime::now_utc() + Duration::days(3);
    let err = fail!(BAD_REQUEST, "Неправильный телефон или пароль");

    let row = sqlx::query("SELECT password_hash, role FROM Employees WHERE phone = $1")
        .bind(phone)
        .fetch_optional(&db)
        .await?
        .ok_or(err)?;

    let token =
        jsonwebtoken::encode(&Header::default(), &claims, ENCODING_KEY.get().unwrap()).unwrap();
    let cookie = Cookie::build("token")
        .expires(expires_at)
        .secure(true)
        .http_only(true)
        .path("/");

    jar = jar.remove("token").add(cookie);
    Ok(jar)
}
