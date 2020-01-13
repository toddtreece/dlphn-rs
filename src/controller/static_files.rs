use actix_web::body::Body;
use actix_web::{HttpRequest, HttpResponse};
use mime_guess::from_path;
use rust_embed::RustEmbed;
use std::borrow::Cow;

#[derive(RustEmbed)]
#[folder = "ui/build/"]
struct UIAsset;

#[derive(RustEmbed)]
#[folder = "docs/"]
struct DocAsset;

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

pub fn ui(req: HttpRequest) -> HttpResponse {
  let path = &req.path()["/".len()..];
  handle_static_file::<UIAsset>(path)
}

pub fn docs_index(_req: HttpRequest) -> HttpResponse {
  handle_static_file::<DocAsset>("index.html")
}

pub fn docs(req: HttpRequest) -> HttpResponse {
  let path = &req.path()["/api/v1/docs/".len()..];
  handle_static_file::<DocAsset>(path)
}
