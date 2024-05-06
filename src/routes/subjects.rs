use super::{Json, Path, Query, RouteResult, RouteState};
use crate::{fail, models::Subject, AppState};
use axum::{extract::State, routing::*};
use serde::Deserialize;
use utoipa::{IntoParams, OpenApi, ToSchema};

#[derive(Deserialize, IntoParams)]
#[serde(deny_unknown_fields)]
struct Fetch {
    name: Option<String>,
    id: Option<i32>,
    count: Option<i64>,
    offset: Option<i64>,
}

/// Fetches subject names and ids
#[utoipa::path(
    get,
    path = "/subjects",
    tag = "Subjects management",
    params(Fetch),
    responses((status = 200, body = Vec<Subject>))
)]
async fn fetch(
    State(state): RouteState,
    Query(query): Query<Fetch>,
) -> RouteResult<Json<Vec<Subject>>> {
    let Fetch {
        name,
        id,
        count,
        offset,
    } = query;

    let count = count.unwrap_or(50).clamp(0, 50);
    let offset = offset.unwrap_or(0).clamp(0, 5000);

    let subjects = sqlx::query_as::<_, Subject>(
        r#"
        SELECT * FROM Subjects
        WHERE
            coalesce(subject ILIKE ('%' || $3 || '%'), true) AND
            coalesce(id = $4, true)
        LIMIT $1 OFFSET $2
    "#,
    )
    .bind(count)
    .bind(offset)
    .bind(name)
    .bind(id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(subjects))
}

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
struct CreateOrUpdateSubjectRequest {
    name: String,
}

/// Creates new subject with specified name
#[utoipa::path(
    post,
    path = "/subjects",
    tag = "Subjects management",
    request_body = CreateOrUpdateSubjectRequest,
    responses((status = 200, body = Subject))
)]
async fn create(
    State(state): RouteState,
    Json(data): Json<CreateOrUpdateSubjectRequest>,
) -> RouteResult<Json<Subject>> {
    let CreateOrUpdateSubjectRequest { name } = data;

    let result =
        sqlx::query_as::<_, Subject>("INSERT INTO Subjects(subject) VALUES($1) RETURNING *")
            .bind(name)
            .fetch_one(&state.db)
            .await;

    match result {
        Ok(subject) => Ok(Json(subject)),
        Err(err) if matches!(err.as_database_error(), Some(err) if err.is_unique_violation()) =>
            fail!(!BAD_REQUEST, "Такой предмет уже существует"),
        Err(err) => Err(err.into()),
    }
}

/// Update a subject with specified id
#[utoipa::path(
    put,
    path = "/subjects/{id}",
    tag = "Subjects management",
    request_body = CreateOrUpdateSubjectRequest,
    responses((status = 200, body = Subject))
)]
async fn update(
    Path(id): Path<i32>,
    State(state): RouteState,
    Json(data): Json<CreateOrUpdateSubjectRequest>,
) -> RouteResult<Json<Subject>> {
    let CreateOrUpdateSubjectRequest { name } = data;

    let Some(class) =
        sqlx::query_as::<_, Subject>("UPDATE Subjects SET subject = $2 WHERE id = $1 RETURNING *")
            .bind(id)
            .bind(name)
            .fetch_optional(&state.db)
            .await?
    else {
        fail!(!BAD_REQUEST, "Предмета с таким ИД не существует")
    };

    Ok(Json(class))
}

/// Deletes a subject by id
#[utoipa::path(
    delete,
    path = "/subjects/{id}",
    tag = "Subjects management",
    params(("id" = i32, Path, description = "Id of the subject to delete")),
    responses((status = 200))
)]
async fn remove(Path(id): Path<i32>, State(state): RouteState) -> RouteResult {
    let result = sqlx::query("DELETE FROM Subjects WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        fail!(!BAD_REQUEST, "Такого предмета не существует");
    }

    Ok(())
}

pub fn openapi() -> utoipa::openapi::OpenApi {
    #[derive(OpenApi)]
    #[openapi(
        paths(remove, fetch, update, create),
        components(schemas(CreateOrUpdateSubjectRequest, Subject))
    )]
    struct Api;

    Api::openapi()
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(fetch).post(create))
        .route("/:subject", put(update).delete(remove))
}
