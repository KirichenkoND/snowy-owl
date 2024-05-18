use super::{Json, Path, Query, RouteResult, RouteState};
use crate::{
    fail,
    models::{Employee, Teacher},
    AppState,
};
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
    subject_ids: Vec<i32>,
    #[serde(default)]
    room_ids: Vec<i32>,
    count: Option<i64>,
    offset: Option<i64>,
}

/// Fetches teachers
#[utoipa::path(
    get,
    path = "/teachers",
    tag = "Teachers management",
    params(Fetch),
    responses((status = 200, body = Vec<Teacher>))
)]
async fn fetch(
    State(state): RouteState,
    Query(query): Query<Fetch>,
) -> RouteResult<Json<Vec<Teacher>>> {
    let Fetch {
        name,
        id,
        subject_ids,
        room_ids,
        count,
        offset,
    } = query;

    let count = count.unwrap_or(50).clamp(0, 100);
    let offset = offset.unwrap_or(0).clamp(0, 2000);

    let teachers = sqlx::query_as::<_, Teacher>(
        r#"
            SELECT * FROM Teachers
            JOIN Employees ON Employees.id = Teachers.employee_id
            WHERE
                coalesce(id = $3, true) AND
                coalesce(first_name || last_name || coalesce(middle_name, '') ILIKE ('%' || $4 || '%'), true) AND
                (subject_id = any($5) OR cardinality($5) = 0) AND
                (room_id = any($6) OR cardinality($6) = 0)
            LIMIT $1 OFFSET $2
        "#,
    )
    .bind(count)
    .bind(offset)
    .bind(id)
    .bind(name)
    .bind(subject_ids)
    .bind(room_ids)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(teachers))
}

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
struct CreateTeacherRequest {
    first_name: String,
    last_name: String,
    middle_name: Option<String>,
    subject_id: i32,
    room_id: Option<i32>,
    phone: String,
    password: String,
}

/// Create new teacher
#[utoipa::path(
    post,
    path = "/teachers",
    tag = "Teachers management",
    request_body = CreateTeacherRequest,
    responses((status = 200, body = Teacher))
)]
async fn create(
    State(state): RouteState,
    Json(data): Json<CreateTeacherRequest>,
) -> RouteResult<Json<Teacher>> {
    let CreateTeacherRequest {
        first_name,
        last_name,
        middle_name,
        subject_id,
        room_id,
        password,
        phone,
    } = data;

    let password_hash = Argon2::default()
        .hash_password(password.as_bytes(), &SaltString::generate(OsRng))
        .unwrap()
        .to_string();

    let mut tx = state.db.begin().await?;
    let result = sqlx::query_as::<_, Employee>(
        r#"
            INSERT INTO Employees(first_name, last_name, middle_name, phone, password_hash, role)
            VALUES (
                $1, $2, $3, $4, $5, 'teacher'
            ) RETURNING *
        "#,
    )
    .bind(first_name)
    .bind(last_name)
    .bind(middle_name)
    .bind(phone)
    .bind(password_hash)
    .bind(subject_id)
    .bind(room_id)
    .fetch_one(&mut *tx)
    .await;

    let employee = match result {
        Ok(val) => val,
        Err(err) if matches!(err.as_database_error(), Some(err) if err.is_unique_violation()) =>
            fail!(
                !BAD_REQUEST,
                "Работник с таким номером телефона уже существует"
            ),
        Err(err) => return Err(err.into()),
    };

    let result =
        sqlx::query("INSERT INTO Teachers(employee_id, subject_id, room_id) VALUES($1, $2, $3)")
            .bind(employee.id)
            .bind(subject_id)
            .bind(room_id)
            .execute(&mut *tx)
            .await;
    match result {
        Ok(_) => {}
        Err(err)
            if matches!(err.as_database_error(), Some(err) if
                err.is_foreign_key_violation() &&
                err.constraint() == Some("teachers_subject_id_fkey")
            ) =>
            fail!(!BAD_REQUEST, "Предмета с таким ИД не существует"),
        Err(err)
            if matches!(err.as_database_error(), Some(err) if
                err.is_foreign_key_violation() &&
                err.constraint() == Some("teachers_room_id_fkey")
            ) =>
            fail!(!BAD_REQUEST, "Кабинета с таким ИД не существует"),
        Err(err) => return Err(err.into()),
    }

    tx.commit().await?;

    Ok(Json(Teacher {
        employee,
        room_id,
        subject_id,
    }))
}

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
struct UpdateTeacherRequest {
    first_name: String,
    last_name: String,
    middle_name: Option<String>,
    subject_id: i32,
    room_id: Option<i32>,
    phone: String,
    password: Option<String>,
}

/// Update teacher with id
#[utoipa::path(
    put,
    path = "/teachers/{id}",
    tag = "Teachers management",
    params(("id" = i32, Path, description = "Id of the teacher to update")),
    responses((status = 200, body = Teacher)))
]
async fn update(
    Path(id): Path<i32>,
    State(state): RouteState,
    Json(data): Json<UpdateTeacherRequest>,
) -> RouteResult<Json<Teacher>> {
    let UpdateTeacherRequest {
        first_name,
        last_name,
        middle_name,
        subject_id,
        room_id,
        phone,
        password,
    } = data;

    let password_hash = password.map(|pass| {
        Argon2::default()
            .hash_password(pass.as_bytes(), &SaltString::generate(OsRng))
            .unwrap()
            .to_string()
    });

    let mut tx = state.db.begin().await?;
    let result = sqlx::query_as::<_, Employee>(
        r#"
            UPDATE Employees
            SET
                first_name = $2,
                last_name = $3,
                middle_name = $4,
                phone = $5,
                password_hash = coalesce($6, password_hash)
            WHERE id = $1 AND role = 'teacher'
            RETURNING *
        "#,
    )
    .bind(id)
    .bind(first_name)
    .bind(last_name)
    .bind(middle_name)
    .bind(phone)
    .bind(password_hash)
    .fetch_optional(&mut *tx)
    .await;

    let employee = match result {
        Ok(Some(val)) => val,
        Ok(None) => fail!(!BAD_REQUEST, "Учителя с таким ИД не существует"),
        Err(err) => return Err(err.into()),
    };

    let result =
        sqlx::query("UPDATE Teachers SET room_id = $2, subject_id = $3 WHERE employee_id = $1")
            .bind(id)
            .bind(room_id)
            .bind(subject_id)
            .execute(&mut *tx)
            .await;
    match result {
        Ok(_) => {}
        Err(err)
            if matches!(
                err.as_database_error(),
                Some(err) if err.is_foreign_key_violation() && err.constraint() == Some("teachers_subject_id_fkey")
            ) =>
            fail!(!BAD_REQUEST, "Предмета с таким ИД не существует"),
        Err(err)
            if matches!(
                err.as_database_error(),
                Some(err) if err.is_foreign_key_violation() && err.constraint() == Some("teachers_room_id_fkey")
            ) =>
            fail!(!BAD_REQUEST, "Кабинета с таким ИД не существует"),
        Err(err) => return Err(err.into()),
    }
    tx.commit().await?;

    Ok(Json(Teacher {
        employee,
        room_id,
        subject_id,
    }))
}

/// Deletes a teacher by id
#[utoipa::path(
    delete,
    path = "/teachers/{id}",
    params(("id" = i32, Path, description = "Id of the teacher to delete")),
    tag = "Teachers management",
    responses((status = 200))
)]
async fn remove(Path(id): Path<i32>, State(state): RouteState) -> RouteResult {
    let result = sqlx::query("DELETE FROM Employees WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;
    if result.rows_affected() == 0 {
        fail!(!BAD_REQUEST, "Учителя с таким ИД не существует");
    }

    Ok(())
}

pub fn openapi() -> utoipa::openapi::OpenApi {
    #[derive(OpenApi)]
    #[openapi(
        paths(fetch, create, update, remove),
        components(schemas(Teacher, CreateTeacherRequest, UpdateTeacherRequest))
    )]
    struct Api;

    Api::openapi()
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(fetch).post(create))
        .route("/:id", put(update).delete(remove))
}
