use actix_files as fs;
use actix_web::{web, App, Error as WebError, HttpResponse, HttpServer};
use futures::TryFutureExt;
use local_ip;
use r2d2_sqlite::{self, SqliteConnectionManager};
use serde_json;
use std::io;

mod db;
mod dolphin;
use db::Pool;

async fn list_streams(db: web::Data<Pool>) -> Result<HttpResponse, WebError> {
  let pool = db.clone();

  let result = web::block(move || db::list_streams(pool.get()?))
    .map_err(WebError::from)
    .await?;

  Ok(HttpResponse::Ok().json(result))
}

async fn list_data(
  db: web::Data<Pool>,
  path: web::Path<(String)>,
) -> Result<HttpResponse, WebError> {
  let pool = db.clone();

  let result = web::block(move || db::list_data(pool.get()?, path.into_inner()))
    .map_err(WebError::from)
    .await?;

  Ok(HttpResponse::Ok().json(result))
}

async fn insert_data(
  db: web::Data<Pool>,
  path: web::Path<(String)>,
  payload: web::Json<serde_json::Map<String, serde_json::Value>>,
) -> Result<HttpResponse, WebError> {
  let pool = db.clone();

  web::block(move || db::insert_data(pool.get()?, path.into_inner(), payload.into_inner()))
    .map_err(WebError::from)
    .await?;

  Ok(HttpResponse::Ok().finish())
}

async fn p404() -> Result<fs::NamedFile, WebError> {
  Ok(fs::NamedFile::open("ui/build/index.html")?.set_status_code(actix_web::http::StatusCode::OK))
}

#[actix_rt::main]
async fn main() -> io::Result<()> {
  let manager = SqliteConnectionManager::file("dlphn.db");
  let pool = Pool::new(manager).unwrap();

  // create the table if needed
  db::create_table(pool.get().unwrap()).unwrap();

  // Start http server
  dolphin::logo();
  let ip = local_ip::get().unwrap();
  println!("[dlphn] UI available at http://{}:8080", ip.to_string());
  println!(
    "[dlphn] API docs available at: http://{}:8080/api/v1/docs",
    ip.to_string()
  );
  HttpServer::new(move || {
    App::new()
      .data(pool.clone())
      .service(fs::Files::new("/api/v1/docs", "docs").index_file("index.html"))
      .service(web::resource("/api/v1/streams").route(web::get().to(list_streams)))
      .service(
        web::resource("/api/v1/streams/{key}/data")
          .route(web::get().to(list_data))
          .route(web::post().to(insert_data)),
      )
      .service(fs::Files::new("/", "ui/build").index_file("index.html"))
      .default_service(web::resource("").route(web::get().to(p404)))
  })
  .bind("0.0.0.0:8080")?
  .run()
  .await
}
