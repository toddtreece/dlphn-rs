use std::pin::Pin;
use std::sync::Mutex;
use std::task::{Context, Poll};
use std::time::Duration;

use actix_web::web::{Bytes, Data};
use actix_web::Error;
use futures::Stream;
use tokio::sync::mpsc::{channel, Receiver, Sender};
use tokio::time::{interval_at, Instant};

#[derive(Debug, Clone)]
pub struct DlphnSender {
  sender: Sender<Bytes>,
  key: String,
}

pub struct Broadcaster {
  clients: Vec<DlphnSender>,
}

impl Broadcaster {
  pub fn create() -> Data<Mutex<Self>> {
    let instance = Data::new(Mutex::new(Broadcaster::new()));
    Broadcaster::spawn_ping(instance.clone());
    instance
  }

  fn new() -> Self {
    Broadcaster {
      clients: Vec::new(),
    }
  }

  fn spawn_ping(instance: Data<Mutex<Self>>) {
    actix_rt::spawn(async move {
      let mut task = interval_at(Instant::now(), Duration::from_secs(10));
      loop {
        task.tick().await;
        instance.lock().unwrap().check_clients();
      }
    })
  }

  fn check_clients(&mut self) {
    let mut connected_clients = Vec::new();
    for client in self.clients.iter() {
      let result = client
        .sender
        .clone()
        .try_send(Bytes::from("data: ping\n\n"));

      if let Ok(()) = result {
        connected_clients.push(client.clone());
      }
    }
    self.clients = connected_clients;
  }

  pub fn new_client(&mut self, key: String) -> Client {
    let (tx, rx) = channel(100);

    tx.clone()
      .try_send(Bytes::from("data: connected\n\n"))
      .unwrap();

    let sender = DlphnSender { sender: tx, key };
    self.clients.push(sender);
    Client(rx)
  }

  pub fn send(&self, key: &str, msg: &str) {
    let msg = Bytes::from(["data: ", msg, "\n\n"].concat());

    for client in self.clients.iter() {
      if key == client.key {
        client.sender.clone().try_send(msg.clone()).unwrap_or(());
      }
    }
  }
}

pub struct Client(Receiver<Bytes>);

impl Stream for Client {
  type Item = Result<Bytes, Error>;

  fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
    match Pin::new(&mut self.0).poll_next(cx) {
      Poll::Ready(Some(v)) => Poll::Ready(Some(Ok(v))),
      Poll::Ready(None) => Poll::Ready(None),
      Poll::Pending => Poll::Pending,
    }
  }
}
