use super::{Json, Query, RouteResult, RouteState};
use crate::{
    fail,
    middleware::Claims,
    models::{Mark, Role},
    AppState,
};
use axum::{extract::State, routing::*};
use serde::Deserialize;
use time::OffsetDateTime;
use utoipa::{IntoParams, OpenApi, ToSchema};

#[derive(Deserialize, IntoParams)]
#[serde(deny_unknown_fields)]
struct Fetch {
    #[serde(default)]
    student_ids: Vec<i32>,
    #[serde(default)]
    teachers_ids: Vec<i32>,
    #[serde(default)]
    subject_ids: Vec<i32>,
    least: Option<i16>,
    most: Option<i16>,
    #[serde(with = "time::serde::rfc3339::option", default)]
    after: Option<OffsetDateTime>,
    #[serde(with = "time::serde::rfc3339::option", default)]
    before: Option<OffsetDateTime>,
    count: Option<i64>,
    offset: Option<i64>,
}

/// Fetch student marks
#[utoipa::path(
    get,
    path = "/marks",
    tag = "Marks management",
    params(Fetch),
    responses((status = 200, body = Vec<Mark>))
)]
async fn fetch(
    State(state): RouteState,
    Query(query): Query<Fetch>,
) -> RouteResult<Json<Vec<Mark>>> {
    let Fetch {
        student_ids,
        teachers_ids,
        subject_ids,
        least,
        most,
        after,
        before,
        count,
        offset,
    } = query;

    let count = count.map(|s| s.clamp(0, 500));
    let offset = offset.unwrap_or(0).clamp(0, 10000);

    let marks = sqlx::query_as::<_, Mark>(
        r#"
            SELECT * FROM Marks
            WHERE
                (student_id = any($3) OR cardinality($3) = 0) AND
                (teacher_id = any($4) OR cardinality($4) = 0) AND
                (subject_id = any($5) OR cardinality($5) = 0) AND
                mark BETWEEN coalesce($6, 2) AND coalesce($7, 5) AND
                time BETWEEN coalesce($8, '-infinity'::timestamptz) AND coalesce($9, '+infinity'::timestamptz)
            LIMIT $1 OFFSET $2
        "#,
    )
    .bind(count)
    .bind(offset)
    .bind(student_ids)
    .bind(teachers_ids)
    .bind(subject_ids)
    .bind(least)
    .bind(most)
    .bind(after)
    .bind(before)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(marks))
}

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
struct CreateMarkRequest {
    teacher_id: Option<i32>,
    student_id: i32,
    subject_id: i32,
    mark: i8,
}

/// Create a new mark
/// If authenticated as a principal, teacher_id is required
#[utoipa::path(
    post,
    path = "/marks",
    tag = "Marks management",
    request_body = CreateMarkRequest,
    responses((status = 200))
)]
async fn create(
    State(state): RouteState,
    claims: Claims,
    Json(data): Json<CreateMarkRequest>,
) -> RouteResult {
    let CreateMarkRequest {
        teacher_id,
        student_id,
        subject_id,
        mark,
    } = data;

    let teacher_id = match claims.role {
        Role::Teacher => claims.employee_id,
        Role::Principal => teacher_id.ok_or(fail!(BAD_REQUEST, "teacher_id is required"))?,
    };

    sqlx::query(
        "
            INSERT INTO Marks(teacher_id, student_id, subject_id, mark)
            VALUES($1, $2, $3, $4)
        ",
    )
    .bind(teacher_id)
    .bind(student_id)
    .bind(subject_id)
    .bind(mark)
    .execute(&state.db)
    .await?;

    Ok(())
}

pub fn openapi() -> utoipa::openapi::OpenApi {
    #[derive(OpenApi)]
    #[openapi(paths(fetch, create), components(schemas(Mark, CreateMarkRequest)))]
    struct Api;

    Api::openapi()
}

pub fn router() -> Router<AppState> {
    Router::new().route("/", get(fetch).post(create))
}
