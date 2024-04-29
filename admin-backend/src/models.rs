use serde::{Deserialize, Serialize};
use sqlx::{prelude::FromRow, Type};
use time::OffsetDateTime;
use utoipa::ToSchema;

#[derive(Serialize, FromRow, ToSchema)]
pub struct Subject {
    pub id: i32,
    #[serde(rename = "name")]
    pub subject: String,
}

#[derive(Serialize, FromRow, ToSchema)]
pub struct Room {
    pub id: i32,
    #[serde(rename = "name")]
    pub room: String,
    pub subject_id: i32,
}

#[derive(Debug, Type, Serialize, Deserialize)]
#[sqlx(rename_all = "lowercase")]
pub enum Role {
    Teacher,
    Principal,
}

#[derive(Serialize, FromRow, ToSchema)]
pub struct Employee {
    pub id: i32,
    pub first_name: String,
    pub last_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub middle_name: Option<String>,
    #[serde(with = "time::serde::rfc3339")]
    pub employed_at: OffsetDateTime,
    pub phone: String,
    pub mfa: bool,
    pub role: Role,
}

#[derive(Serialize, FromRow, ToSchema)]
pub struct Teacher {
    #[serde(flatten)]
    #[sqlx(flatten)]
    pub employee: Employee,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub room_id: Option<i32>,
    pub subject_id: i32,
}

#[derive(Serialize, FromRow, ToSchema)]
pub struct Class {
    pub id: i32,
    #[serde(rename = "name")]
    pub class: String,
}

#[derive(Serialize, FromRow, ToSchema)]
pub struct Student {
    pub id: i32,
    pub first_name: String,
    pub last_name: String,
    pub middle_name: Option<String>,
    #[serde(with = "time::serde::rfc3339")]
    pub enrolled_at: OffsetDateTime,
    pub class_id: i32,
}

#[derive(Serialize, FromRow, ToSchema)]
pub struct Mark {
    pub id: i32,
    pub mark: i16,
    pub student_id: i32,
    pub subject_id: i32,
    pub teacher_id: i32,
    #[serde(with = "time::serde::rfc3339")]
    pub time: OffsetDateTime,
}
