use std::sync::Mutex;

use actix_web::{web, Error as WebError, HttpResponse};
use futures::TryFutureExt;
use serde_json::to_string;

use crate::db::{self, Pool};
use crate::services::sse::Broadcaster;

pub async fn list(db: web::Data<Pool>, path: web::Path<String>) -> Result<HttpResponse, WebError> {
  let pool = db.clone();

  let result = web::block(move || db::list_data(pool.get()?, path.into_inner()))
    .map_err(WebError::from)
    .await?;

  Ok(HttpResponse::Ok().json(result))
}

pub async fn insert(
  db: web::Data<Pool>,
  path: web::Path<String>,
  payload: web::Json<serde_json::Map<String, serde_json::Value>>,
  broadcaster: web::Data<Mutex<Broadcaster>>,
) -> Result<HttpResponse, WebError> {
  let pool = db.clone();

  let key = path.into_inner().clone();
  let value = payload.into_inner();
  let payload_string = &to_string(&value)?;

  broadcaster.lock().unwrap().send(&key, &payload_string);

  web::block(move || db::insert_data(pool.get()?, key, value))
    .map_err(WebError::from)
    .await?;

  Ok(HttpResponse::Ok().finish())
}
