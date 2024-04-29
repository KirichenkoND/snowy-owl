use crate::error::Error;
use axum::{
    extract::{FromRequest, FromRequestParts, State},
    response::{IntoResponse, Response},
};
use serde::Serialize;
use serde_json::json;

pub mod classes;
pub mod marks;
pub mod principals;
pub mod rooms;
pub mod students;
pub mod subjects;
pub mod teachers;

#[derive(FromRequest)]
#[from_request(via(axum::Json), rejection(Error))]
pub struct Json<T>(pub T);

impl<T: Serialize> IntoResponse for Json<T> {
    fn into_response(self) -> Response {
        axum::Json(json!({
            "data": self.0,
            "success": true
        }))
        .into_response()
    }
}

#[derive(FromRequestParts)]
#[from_request(via(axum_extra::extract::Query), rejection(Error))]
pub struct Query<T>(pub T);

#[derive(FromRequestParts)]
#[from_request(via(axum::extract::Path), rejection(Error))]
pub struct Path<T>(pub T);

pub type RouteState = State<crate::AppState>;
pub type RouteResult<T = ()> = Result<T, Error>;
