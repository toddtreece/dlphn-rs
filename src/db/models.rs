use chrono::{DateTime, Utc};
use serde_derive::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Deserialize, Serialize)]
pub struct Stream {
  pub id: i64,
  pub key: String,
  pub created: DateTime<Utc>,
  pub updated: DateTime<Utc>,
  pub last_insert: DateTime<Utc>,
  pub last_payload: Value,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Data {
  pub id: i64,
  pub payload: Value,
  pub created: DateTime<Utc>,
  pub updated: DateTime<Utc>,
}
