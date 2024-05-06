use super::{Json, Path, Query, RouteResult, RouteState};
use crate::{fail, models::Class, AppState};
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

/// Fetches classes names and ids
#[utoipa::path(get, path = "/classes", tag = "Classes management", params(Fetch))]
async fn fetch(
    State(state): RouteState,
    Query(query): Query<Fetch>,
) -> RouteResult<Json<Vec<Class>>> {
    let Fetch {
        name,
        id,
        count,
        offset,
    } = query;

    let count = count.unwrap_or(50).clamp(0, 50);
    let offset = offset.unwrap_or(0).clamp(0, 5000);

    let classes = sqlx::query_as::<_, Class>(
        r#"
        SELECT * FROM Classes
        WHERE
            coalesce(class ILIKE ('%' || $3 || '%'), true) AND
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

    Ok(Json(classes))
}

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
struct CreateOrUpdateClassRequest {
    name: String,
}

/// Creates new class with specified name
#[utoipa::path(
    post,
    path = "/classes",
    tag = "Classes management",
    responses((status = 200, body = Class))
)]
async fn create(
    State(state): RouteState,
    Json(data): Json<CreateOrUpdateClassRequest>,
) -> RouteResult<Json<Class>> {
    let CreateOrUpdateClassRequest { name } = data;

    let result = sqlx::query_as::<_, Class>("INSERT INTO Classes(class) VALUES($1) RETURNING *")
        .bind(name)
        .fetch_one(&state.db)
        .await;

    match result {
        Ok(class) => Ok(Json(class)),
        Err(err) if matches!(err.as_database_error(), Some(err) if err.is_unique_violation()) =>
            fail!(!BAD_REQUEST, "Такой класс уже существует"),
        Err(err) => Err(err.into()),
    }
}

/// Updates a class with specified id
#[utoipa::path(
    put,
    path = "/classes/{id}",
    tag = "Classes management",
    params(("id" = i32, Path, description = "Id of the new class to update")),
    responses((status = 200, body = Class))
)]
async fn update(
    Path(id): Path<i32>,
    State(state): RouteState,
    Json(data): Json<CreateOrUpdateClassRequest>,
) -> RouteResult<Json<Class>> {
    let CreateOrUpdateClassRequest { name } = data;

    let Some(class) =
        sqlx::query_as::<_, Class>("UPDATE Classes SET class = $2 WHERE id = $1 RETURNING *")
            .bind(id)
            .bind(name)
            .fetch_optional(&state.db)
            .await?
    else {
        fail!(!BAD_REQUEST, "Класса с таким ИД не существует");
    };

    Ok(Json(class))
}

/// Deletes a class by id
#[utoipa::path(delete, path = "/classes/{id}", tag = "Classes management", params(("id" = i32, Path, description = "Id of the class to delete")))]
async fn remove(Path(id): Path<i32>, State(state): RouteState) -> RouteResult {
    let result = sqlx::query("DELETE FROM Classes WHERE id = $1")
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
        components(schemas(CreateOrUpdateClassRequest))
    )]
    struct Api;

    Api::openapi()
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(fetch).post(create))
        .route("/:id", put(update).delete(remove))
}
