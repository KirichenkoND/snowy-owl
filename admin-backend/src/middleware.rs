use crate::{error::Error, fail, models::Role, DECODING_KEY};
use axum::{extract::FromRequestParts, http::request::Parts, RequestPartsExt};
use axum_extra::extract::CookieJar;
use jsonwebtoken::Validation;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    #[serde(rename = "eid")]
    pub employee_id: i32,
    #[serde(rename = "r")]
    pub role: Role,
    #[serde(rename = "exp", with = "time::serde::timestamp")]
    pub expires_at: OffsetDateTime,
}

#[axum::async_trait]
impl<S> FromRequestParts<S> for Claims {
    type Rejection = Error;

    async fn from_request_parts(parts: &mut Parts, _: &S) -> Result<Self, Self::Rejection> {
        let jar = parts.extract::<CookieJar>().await.unwrap();

        let token = jar
            .get("token")
            .ok_or(fail!(UNAUTHORIZED, "Необходима авторизация"))?
            .value();
        let token = jsonwebtoken::decode::<Self>(
            token,
            DECODING_KEY.get().unwrap(),
            &Validation::default(),
        )?;

        Ok(token.claims)
    }
}
