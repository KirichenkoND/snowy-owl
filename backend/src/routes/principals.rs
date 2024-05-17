use super::{Json, RouteResult, RouteState};
use crate::{fail, models::Employee, AppState};
use argon2::{password_hash::SaltString, Argon2, PasswordHasher};
use axum::{
    extract::{Path, Query, State},
    routing::*,
};
use rand::rngs::OsRng;
use serde::Deserialize;
use utoipa::{IntoParams, ToSchema};

#[derive(Deserialize, IntoParams)]
struct Fetch {
    name: Option<String>,
    id: Option<i32>,
    count: Option<i64>,
    offset: Option<i64>,
}

/// Fetches pricipals
#[utoipa::path(
    get,
    path = "/principals",
    params(Fetch),
    responses(
        (status = 200, body = Vec<Employee>)
    )
)]
async fn fetch(
    State(state): RouteState,
    Query(query): Query<Fetch>,
) -> RouteResult<Json<Vec<Employee>>> {
    let Fetch {
        name,
        id,
        count,
        offset,
    } = query;

    let count = count.unwrap_or(50).max(0);
    let offset = offset.unwrap_or(0).max(0);

    let results = sqlx::query_as::<_, Employee>(
        "
            SELECT * FROM Employees
            WHERE
                coalesce(first_name || last_name || coalesce(middle_name, '') ILIKE ('%' || $3 || '%'), true) AND
                coalesce(id = $4, true) AND
                role = 'pricipal'
            LIMIT $1 OFFSET $2
        ",
    )
    .bind(count)
    .bind(offset)
    .bind(name)
    .bind(id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(results))
}

#[derive(Deserialize)]
struct CreatePrincipalRequest {
    first_name: String,
    last_name: String,
    middle_name: Option<String>,
    phone: String,
    password: String,
}

async fn create(
    State(state): RouteState,
    Json(data): Json<CreatePrincipalRequest>,
) -> RouteResult<Json<Employee>> {
    let CreatePrincipalRequest {
        first_name,
        last_name,
        middle_name,
        phone,
        password,
    } = data;

    let password_hash = Argon2::default()
        .hash_password(password.as_bytes(), &SaltString::generate(OsRng))
        .unwrap()
        .to_string();

    let result = sqlx::query_as::<_, Employee>(
        "INSERT INTO Employees(first_name, last_name, middle_name, phone, password_hash, role) VALUES(
            $1, $2, $3,
            $4, $5, 'principal'
        ) RETURNING *",
    )
    .bind(first_name)
    .bind(last_name)
    .bind(middle_name)
    .bind(phone)
    .bind(password_hash)
    .fetch_one(&state.db)
    .await;

    match result.map(Json) {
        Ok(val) => Ok(val),
        Err(err) if matches!(err.as_database_error(), Some(err) if err.is_unique_violation()) =>
            fail!(
                !BAD_REQUEST,
                "Завуч с таким номером телефона уже существует"
            ),
        Err(err) => Err(err.into()),
    }
}

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
struct UpdatePrincipalRequest {
    first_name: String,
    last_name: String,
    middle_name: Option<String>,
    phone: String,
    password: Option<String>,
}

async fn update(
    State(state): RouteState,
    Path(id): Path<i32>,
    Json(data): Json<UpdatePrincipalRequest>,
) -> RouteResult<Json<Employee>> {
    let UpdatePrincipalRequest {
        first_name,
        last_name,
        middle_name,
        phone,
        password,
    } = data;

    let password_hash = password.map(|pass| {
        Argon2::default()
            .hash_password(pass.as_bytes(), &SaltString::generate(OsRng))
            .unwrap()
            .to_string()
    });

    let result = sqlx::query_as::<_, Employee>(
        "
            UPDATE Employees SET
            first_name = $2,
            last_name = $3,
            middle_name = $4,
            phone = $5,
            password_hash = coalesce($6, password_hash)
            WHERE id = $1
            RETURNING *
        ",
    )
    .bind(id)
    .bind(first_name)
    .bind(last_name)
    .bind(middle_name)
    .bind(phone)
    .bind(password_hash)
    .fetch_optional(&state.db)
    .await;

    match result {
        Ok(Some(val)) => Ok(Json(val)),
        Ok(None) => fail!(!NOT_FOUND, "Завуч с таким ИД не существует"),
        Err(err) if matches!(err.as_database_error(), Some(err) if err.is_unique_violation()) =>
            fail!(
                !BAD_REQUEST,
                "Завуч с таким номером телефона уже существует"
            ),
        Err(err) => Err(err.into()),
    }
}

/// Removes an employee by id
#[utoipa::path(
    delete,
    path = "/principals/{id}",
    params(
        ("id" = i32, Path, description = "Id of the employee to remove")
    ),
    responses(
        (status = 200)
    )
)]
async fn remove(State(state): RouteState, Path(id): Path<i32>) -> RouteResult {
    let result = sqlx::query("DELETE FROM Employees WHERE id = $1 AND role = 'principal'")
        .bind(id)
        .execute(&state.db)
        .await?;
    if result.rows_affected() == 0 {
        fail!(!NOT_FOUND, "Завуча с таким ИД не существует");
    }

    Ok(())
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(fetch).post(create))
        .route("/:id", put(update).delete(remove))
}
