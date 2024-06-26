use super::{Json, Path, Query, RouteResult, RouteState};
use crate::{fail, models::Student, AppState};
use argon2::{password_hash::SaltString, Argon2, PasswordHasher};
use axum::{extract::State, routing::*};
use rand::rngs::OsRng;
use serde::Deserialize;
use utoipa::{IntoParams, OpenApi, ToSchema};

#[derive(Deserialize, IntoParams)]
#[serde(deny_unknown_fields)]
struct Fetch {
    name: Option<String>,
    id: Option<i32>,
    #[serde(default)]
    class_ids: Vec<i32>,
    count: Option<i64>,
    offset: Option<i64>,
}

/// Fetches students
#[utoipa::path(
    get,
    path = "/students",
    tag = "Students management",
    params(Fetch),
    responses((status = 200, body = Vec<Student>))
)]
async fn fetch(
    State(state): RouteState,
    Query(query): Query<Fetch>,
) -> RouteResult<Json<Vec<Student>>> {
    let Fetch {
        name,
        id,
        class_ids,
        count,
        offset,
    } = query;

    let count = count.unwrap_or(50).clamp(0, 100);
    let offset = offset.unwrap_or(0).clamp(0, 10000);

    let students = sqlx::query_as::<_, Student>(
        r#"
            SELECT * FROM Students
            WHERE
                coalesce(id = $3, true) AND
                coalesce(first_name || last_name || middle_name ILIKE ('%' || $4 || '%'), true) AND
                (class_id = ANY($5) OR cardinality($5) = 0)
            LIMIT $1 OFFSET $2
        "#,
    )
    .bind(count)
    .bind(offset)
    .bind(id)
    .bind(name)
    .bind(class_ids)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(students))
}

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
struct CreateOrUpdateStudentRequest {
    pub first_name: String,
    pub last_name: String,
    pub middle_name: Option<String>,
    pub class_id: i32,
    pub phone: String,
    pub password: Option<String>,
}

/// Creates new student
#[utoipa::path(
    post,
    path = "/students",
    tag = "Students management",
    request_body = CreateOrUpdateStudentRequest,
    responses((status = 200, body = Student)),
)]
async fn create(
    State(state): RouteState,
    Json(data): Json<CreateOrUpdateStudentRequest>,
) -> RouteResult<Json<Student>> {
    let CreateOrUpdateStudentRequest {
        first_name,
        last_name,
        middle_name,
        class_id,
        phone,
        password,
    } = data;

    let password_hash = Argon2::default()
        .hash_password(
            password
                .ok_or(fail!(BAD_REQUEST, "Необходим пароль для ученика"))?
                .as_bytes(),
            &SaltString::generate(OsRng),
        )
        .unwrap()
        .to_string();

    let result = sqlx::query_as::<_, Student>(
        r#"
            INSERT INTO Students(first_name, last_name, middle_name, class_id, phone, password_hash)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        "#,
    )
    .bind(first_name)
    .bind(last_name)
    .bind(middle_name)
    .bind(class_id)
    .bind(phone)
    .bind(password_hash)
    .fetch_one(&state.db)
    .await;

    match result {
        Ok(student) => Ok(Json(student)),
        Err(err) if matches!(err.as_database_error(), Some(err) if err.is_foreign_key_violation()) =>
            fail!(!BAD_REQUEST, "Класс с таким ИД не существует"),
        Err(err) if matches!(err.as_database_error(), Some(err) if err.is_unique_violation()) =>
            fail!(!BAD_REQUEST, "Такой ученик уже существует в данном классе"),
        Err(err) => Err(err.into()),
    }
}

/// Updates a student by id
#[utoipa::path(
    put,
    path = "/students/{id}",
    tag = "Students management",
    params(("id" = i32, Path, description = "Id of the student to update")),
    request_body = CreateOrUpdateStudentRequest,
    responses((status = 200, body = Student)),
)]
async fn update(
    Path(id): Path<i32>,
    State(state): RouteState,
    Json(data): Json<CreateOrUpdateStudentRequest>,
) -> RouteResult<Json<Student>> {
    let CreateOrUpdateStudentRequest {
        first_name,
        last_name,
        middle_name,
        class_id,
        phone,
        password,
    } = data;

    let password_hash = password.map(|p| {
        Argon2::default()
            .hash_password(p.as_bytes(), &SaltString::generate(OsRng))
            .unwrap()
            .to_string()
    });

    let result = sqlx::query_as::<_, Student>(
        r#"
            UPDATE Students
            SET
                first_name = $2,
                last_name = $3,
                middle_name = $4,
                class_id = $5,
                phone = $6,
                password_hash = coalesce($7, password_hash)
            WHERE
                id = $1
            RETURNING *
        "#,
    )
    .bind(id)
    .bind(first_name)
    .bind(last_name)
    .bind(middle_name)
    .bind(class_id)
    .bind(phone)
    .bind(password_hash)
    .fetch_optional(&state.db)
    .await;

    match result {
        Ok(Some(student)) => Ok(Json(student)),
        Ok(None) => fail!(!BAD_REQUEST, "Ученик с таким ИД не существует"),
        Err(err) if matches!(err.as_database_error(), Some(err) if err.is_unique_violation()) =>
            fail!(!BAD_REQUEST, "Такой ученик уже существует в данном классе"),
        Err(err) if matches!(err.as_database_error(), Some(err) if err.is_foreign_key_violation()) =>
            fail!(!BAD_REQUEST, "Класс с таким ИД не существует"),
        Err(err) => Err(err.into()),
    }
}

/// Deletes a student by id
#[utoipa::path(
    delete,
    path = "/students/{id}",
    tag = "Students management",
    params(("id" = i32, Path, description = "Id of the student to delete")),
    responses((status = 200)),
)]
async fn remove(Path(id): Path<i32>, State(state): RouteState) -> RouteResult {
    let result = sqlx::query("DELETE FROM Students WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;
    if result.rows_affected() == 0 {
        fail!(!BAD_REQUEST, "Ученик с таким ИД не существует")
    }

    Ok(())
}

pub fn openapi() -> utoipa::openapi::OpenApi {
    #[derive(OpenApi)]
    #[openapi(
        paths(fetch, create, update, remove),
        components(schemas(Student, CreateOrUpdateStudentRequest))
    )]
    struct Api;

    Api::openapi()
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(fetch).post(create))
        .route("/:id", put(update).delete(remove))
}
