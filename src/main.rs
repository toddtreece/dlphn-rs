use actix_web::{web, App, HttpServer};
use std::io;

mod controller;
mod db;
mod services;
mod utils;
use controller::{data, static_files, streams};
use services::sse;

#[actix_rt::main]
async fn main() -> io::Result<()> {
  utils::log::init();

  let db_pool = db::init().unwrap();
  let broadcaster = sse::Broadcaster::create();

  HttpServer::new(move || {
    App::new()
      .app_data(broadcaster.clone())
      .data(db_pool.clone())
      .service(web::resource("/api/v1/docs").route(web::get().to(static_files::docs_index)))
      .service(web::resource("/api/v1/docs/{_:.*}").route(web::get().to(static_files::docs)))
      .service(web::resource("/api/v1/streams").route(web::get().to(streams::list)))
      .service(
        web::resource("/api/v1/streams/{key}/subscribe").route(web::get().to(streams::subscribe)),
      )
      .service(
        web::resource("/api/v1/streams/{key}/data")
          .route(web::get().to(data::list))
          .route(web::post().to(data::insert)),
      )
      .service(web::resource("/{_:.*}").route(web::get().to(static_files::ui)))
  })
  .bind("0.0.0.0:8080")?
  .run()
  .await
}
