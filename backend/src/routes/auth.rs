use super::Json;
use super::RouteResult;
use super::RouteState;
use crate::models::Employee;
use crate::models::Role;
use crate::models::Teacher;
use crate::AppState;
use crate::{error::Error, fail, middleware::Claims, ENCODING_KEY};
use argon2::Argon2;
use argon2::PasswordVerifier;
use axum::{extract::State, routing::*};
use axum_extra::either::Either;
use axum_extra::extract::{cookie::Cookie, CookieJar};
use jsonwebtoken::Header;
use serde::Deserialize;
use sqlx::prelude::FromRow;
use sqlx::Row;
use time::{Duration, OffsetDateTime};
use utoipa::OpenApi;
use utoipa::ToSchema;

#[derive(Deserialize, FromRow, ToSchema)]
struct MeResponse {
    first_name: String,
    last_name: String,
    middle_name: Option<String>,
    role: Role,
}

async fn me(
    State(state): RouteState,
    claims: Claims,
) -> RouteResult<Either<Json<Teacher>, Json<Employee>>> {
    let resp = match claims.role {
        Role::Teacher => {
            let tch = sqlx::query_as::<_, Teacher>(
                "
                SELECT * FROM Employees
                JOIN Teachers ON employee_id = id
                WHERE role = 'teacher' AND id = $1
            ",
            )
            .bind(claims.employee_id)
            .fetch_one(&state.db)
            .await?;

            Either::E1(Json(tch))
        }
        Role::Principal => {
            let emp = sqlx::query_as::<_, Employee>(
                "
                    SELECT * FROM Employees
                    WHERE role = 'principal' AND id = $1
                ",
            )
            .bind(claims.employee_id)
            .fetch_one(&state.db)
            .await?;

            Either::E2(Json(emp))
        }
        Role::Student => todo!(),
    };

    Ok(resp)
}

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
struct LoginRequest {
    phone: String,
    password: String,
}

/// Login as an employee
#[utoipa::path(
    post,
    path = "/auth/login",
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

/// Log out
#[utoipa::path(
    post,
    path = "/auth/logout",
    tag = "Authentication",
    responses((status = 200))
)]
async fn logout(jar: CookieJar) -> CookieJar {
    jar.remove("token")
}

pub fn openapi() -> utoipa::openapi::OpenApi {
    #[derive(OpenApi)]
    #[openapi(paths(login, logout), components(schemas(LoginRequest)))]
    struct Api;

    Api::openapi()
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/login", post(login))
        .route("/logout", post(logout))
}
