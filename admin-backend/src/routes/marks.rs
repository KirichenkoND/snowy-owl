use super::{Json, Query, RouteResult, RouteState};
use crate::{models::Mark, AppState};
use axum::{extract::State, routing::*};
use serde::Deserialize;
use time::OffsetDateTime;
use utoipa::{IntoParams, OpenApi};

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

pub fn openapi() -> utoipa::openapi::OpenApi {
    #[derive(OpenApi)]
    #[openapi(paths(fetch), components(schemas(Mark)))]
    struct Api;

    Api::openapi()
}

pub fn router() -> Router<AppState> {
    Router::new().route("/", get(fetch))
}
