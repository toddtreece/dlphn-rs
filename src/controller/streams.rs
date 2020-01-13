use std::sync::Mutex;

use actix_web::{web, Error as WebError, HttpResponse, Responder};
use futures::TryFutureExt;

use crate::db::{self, Pool};
use crate::services::sse::Broadcaster;

pub async fn list(db: web::Data<Pool>) -> Result<HttpResponse, WebError> {
  let pool = db.clone();

  let result = web::block(move || db::list_streams(pool.get()?))
    .map_err(WebError::from)
    .await?;

  Ok(HttpResponse::Ok().json(result))
}

pub async fn subscribe(
  path: web::Path<String>,
  broadcaster: web::Data<Mutex<Broadcaster>>,
) -> impl Responder {
  let rx = broadcaster.lock().unwrap().new_client(path.into_inner());

  HttpResponse::Ok()
    .header("content-type", "text/event-stream")
    .no_chunking()
    .streaming(rx)
}
