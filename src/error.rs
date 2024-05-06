use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use std::{borrow::Cow, io};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("Jwt: {0}")]
    Jwt(#[from] jsonwebtoken::errors::Error),
    #[error("Io: {0}")]
    Io(#[from] io::Error),

    #[error("{}", .0.body_text())]
    JsonRejection(#[from] axum::extract::rejection::JsonRejection),
    #[error("{0}")]
    QueryRejection(#[from] axum_extra::extract::QueryRejection),
    #[error("{}", .0.body_text())]
    PathRejection(#[from] axum::extract::rejection::PathRejection),

    #[error("Необходима двухвакторная авторизация")]
    #[allow(dead_code)]
    Mfa,

    #[error("{message}")]
    Custom {
        field: Option<&'static str>,
        message: Cow<'static, str>,
        status: StatusCode,
    },
}

impl Error {
    fn status(&self) -> StatusCode {
        match self {
            Error::Io(_) | Error::Sqlx(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Error::Jwt(_)
            | Error::PathRejection(_)
            | Error::JsonRejection(_)
            | Error::QueryRejection(_)
            | Error::Mfa => StatusCode::BAD_REQUEST,
            Error::Custom { status, .. } => *status,
        }
    }
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let status = self.status();

        let message = if status.is_server_error() {
            tracing::error!("{self}");
            "Внутренняя серверная ошибка, обратитесь к администрации".to_owned()
        } else {
            format!("{self}")
        };

        let field = match self {
            Error::Custom { field, .. } => field.map(ToOwned::to_owned),
            Error::Mfa => Some("2fa".to_owned()),
            _ => None,
        };

        let value = json! {{
            "message": message,
            "field": field,
            "success": false
        }};
        (status, Json(value)).into_response()
    }
}

#[macro_export]
macro_rules! fail {
    ($code:ident, $message:expr $(, $field:expr)?) => {
        $crate::error::Error::Custom {
            status: axum::http::StatusCode::$code,
            message: $message.into(),
            field: None $(.or(Some($field)))?
        }
    };
    (!$code:ident, $message:expr $(, $field:expr)?) => {
        return Err(fail!($code, $message $(, $field)?))
    }
}
