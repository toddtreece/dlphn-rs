use actix_web::body::Body;
use actix_web::{web, App, Error as WebError, HttpRequest, HttpResponse, HttpServer};
use futures::TryFutureExt;
use local_ip;
use mime_guess::from_path;
use r2d2_sqlite::{self, SqliteConnectionManager};
use rust_embed::RustEmbed;
use serde_json;
use std::borrow::Cow;
use std::io;

mod db;
mod dolphin;
use db::Pool;

#[derive(RustEmbed)]
#[folder = "ui/build/"]
struct UIAsset;

#[derive(RustEmbed)]
#[folder = "docs/"]
struct DocAsset;

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

fn handle_static_file<E: RustEmbed>(path: &str) -> HttpResponse {
  match E::get(path) {
    Some(content) => {
      let body: Body = match content {
        Cow::Borrowed(bytes) => bytes.into(),
        Cow::Owned(bytes) => bytes.into(),
      };
      HttpResponse::Ok()
        .content_type(from_path(path).first_or_octet_stream().as_ref())
        .body(body)
    }
    None => handle_static_file::<UIAsset>("index.html"),
  }
}

fn ui(req: HttpRequest) -> HttpResponse {
  let path = &req.path()["/".len()..];
  handle_static_file::<UIAsset>(path)
}

fn docs_index(_req: HttpRequest) -> HttpResponse {
  handle_static_file::<DocAsset>("index.html")
}

fn docs(req: HttpRequest) -> HttpResponse {
  let path = &req.path()["/api/v1/docs/".len()..];
  handle_static_file::<DocAsset>(path)
}

#[actix_rt::main]
async fn main() -> io::Result<()> {
  let manager = SqliteConnectionManager::file("dlphn.db");
  let pool = Pool::new(manager).unwrap();

  db::create_table(pool.get().unwrap()).unwrap();
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
      .service(web::resource("/api/v1/docs").route(web::get().to(docs_index)))
      .service(web::resource("/api/v1/docs/{_:.*}").route(web::get().to(docs)))
      .service(web::resource("/api/v1/streams").route(web::get().to(list_streams)))
      .service(
        web::resource("/api/v1/streams/{key}/data")
          .route(web::get().to(list_data))
          .route(web::post().to(insert_data)),
      )
      .service(web::resource("/{_:.*}").route(web::get().to(ui)))
  })
  .bind("0.0.0.0:8080")?
  .run()
  .await
}
