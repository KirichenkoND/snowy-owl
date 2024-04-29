use super::{Json, Path, Query, RouteResult, RouteState};
use crate::{fail, models::Room, AppState};
use axum::{extract::State, routing::*};
use serde::Deserialize;
use utoipa::{IntoParams, OpenApi, ToSchema};

#[derive(Deserialize, IntoParams)]
#[serde(deny_unknown_fields)]
struct Fetch {
    name: Option<String>,
    id: Option<i32>,
    #[serde(default)]
    subject_ids: Vec<i32>,
    count: Option<i64>,
    offset: Option<i64>,
}

/// Fetches rooms
#[utoipa::path(
    get,
    path = "/rooms",
    tag = "Room management",
    params(Fetch),
    responses((status = 200, body = Vec<Room>))
)]
async fn fetch(
    State(state): RouteState,
    Query(query): Query<Fetch>,
) -> RouteResult<Json<Vec<Room>>> {
    let Fetch {
        name,
        id,
        subject_ids,
        count,
        offset,
    } = query;

    let count = count.unwrap_or(50).clamp(0, 100);
    let offset = offset.unwrap_or(0).clamp(0, 5000);

    let rooms = sqlx::query_as::<_, Room>(
        r#"
            SELECT * FROM Rooms
            WHERE
                coalesce(room ILIKE ('%' || $3 || '%'), true) AND
                coalesce(id = $4, true) AND
                (subject_id = any($5) OR cardinality($5) = 0)
            LIMIT $1 OFFSET $2
        "#,
    )
    .bind(count)
    .bind(offset)
    .bind(name)
    .bind(id)
    .bind(subject_ids)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(rooms))
}

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
struct CreateOrUpdateRoomRequest {
    name: String,
    subject_id: Option<i32>,
}

/// Creates new room
#[utoipa::path(
    post,
    path = "/rooms",
    tag = "Room management",
    request_body = CreateOrUpdateRoomRequest,
    responses((status = 200, body = Room))
)]
async fn create(
    State(state): RouteState,
    Json(data): Json<CreateOrUpdateRoomRequest>,
) -> RouteResult<Json<Room>> {
    let CreateOrUpdateRoomRequest { name, subject_id } = data;

    let result =
        sqlx::query_as::<_, Room>("INSERT INTO Rooms(room, subject_id) VALUES($1, $2) RETURNING *")
            .bind(name)
            .bind(subject_id)
            .fetch_one(&state.db)
            .await;

    match result.map(Json) {
        Ok(value) => Ok(value),
        Err(err) if matches!(err.as_database_error(), Some(err) if err.is_unique_violation()) =>
            fail!(!BAD_REQUEST, "Такой кабинет уже существует"),
        Err(err) if matches!(err.as_database_error(), Some(err) if err.is_foreign_key_violation()) =>
            fail!(!BAD_REQUEST, "Предмет с данным ИД не существует"),
        Err(err) => Err(err.into()),
    }
}

/// Updates a room with specified id
#[utoipa::path(
    put,
    path = "/rooms/{id}",
    tag = "Room management",
    params(("id" = i32, Path, description = "Id of the room to update")),
    request_body = CreateOrUpdateRoomRequest,
    responses((status = 200, body = Room))
)]
async fn update(
    Path(id): Path<i32>,
    State(state): RouteState,
    Json(data): Json<CreateOrUpdateRoomRequest>,
) -> RouteResult<Json<Room>> {
    let CreateOrUpdateRoomRequest { name, subject_id } = data;

    let result = sqlx::query_as::<_, Room>(
        "UPDATE Rooms SET room = $2, subject_id = $3 WHERE id = $1 RETURNING *",
    )
    .bind(id)
    .bind(name)
    .bind(subject_id)
    .fetch_optional(&state.db)
    .await;

    match result {
        Ok(Some(room)) => Ok(Json(room)),
        Ok(None) => fail!(!BAD_REQUEST, "Комнаты с таким ИД не существует"),
        Err(err) if matches!(err.as_database_error(), Some(err) if err.is_foreign_key_violation()) =>
            fail!(!BAD_REQUEST, "Предмета с таким ИД не существует"),
        Err(err) => Err(err.into()),
    }
}

/// Delete a room
#[utoipa::path(
    delete,
    path = "/rooms/{id}",
    tag = "Room management",
    params(("id" = i32, Path, description = "Id of the room to delete")),
    responses((status = 200))
)]
async fn remove(Path(id): Path<i32>, State(state): RouteState) -> RouteResult {
    let result = sqlx::query("DELETE FROM Rooms WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;
    if result.rows_affected() == 0 {
        fail!(!BAD_REQUEST, "Такого кабинета не существует");
    }

    Ok(())
}

pub fn openapi() -> utoipa::openapi::OpenApi {
    #[derive(OpenApi)]
    #[openapi(
        paths(fetch, create, update, remove),
        components(schemas(CreateOrUpdateRoomRequest, Room))
    )]
    struct Api;

    Api::openapi()
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(fetch).post(create))
        .route("/:id", put(update).delete(remove))
}
