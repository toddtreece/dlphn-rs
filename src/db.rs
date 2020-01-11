use chrono::{DateTime, Utc};
use failure::Error;
use r2d2;
use r2d2_sqlite;
use rusqlite::{ToSql, NO_PARAMS};
use serde_derive::{Deserialize, Serialize};
use serde_json::{Map, Value};

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;

#[derive(Debug, Deserialize, Serialize)]
pub struct Stream {
  id: i64,
  key: String,
  created: DateTime<Utc>,
  updated: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Data {
  id: i64,
  payload: Value,
  created: DateTime<Utc>,
  updated: DateTime<Utc>,
}

pub fn create_table(conn: Connection) -> Result<(), Error> {
  conn.execute_batch(
    "CREATE TABLE IF NOT EXISTS streams (
       id              INTEGER PRIMARY KEY AUTOINCREMENT,
       key             TEXT NOT NULL UNIQUE,
       created         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS data (
       id              INTEGER PRIMARY KEY AUTOINCREMENT,
       stream_id       INTEGER NOT NULL,
       payload         TEXT NOT NULL,
       created         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY(stream_id) REFERENCES streams(id)
    );",
  )?;

  Ok(())
}

pub fn list_streams(conn: Connection) -> Result<Vec<Stream>, Error> {
  let mut stmt = conn.prepare("SELECT id, key, created, updated FROM streams")?;

  let results = stmt
    .query_map(NO_PARAMS, |row| {
      Ok(Stream {
        id: row.get(0)?,
        key: row.get(1)?,
        created: row.get(2)?,
        updated: row.get(3)?,
      })
    })
    .and_then(|mapped_rows| Ok(mapped_rows.map(|row| row.unwrap()).collect::<Vec<Stream>>()))?;

  Ok(results)
}

pub fn list_data(conn: Connection, key: String) -> Result<Vec<Data>, Error> {
  let mut stmt = conn.prepare(
    "SELECT 
      data.id, data.payload, data.created, data.updated 
    FROM data 
    INNER JOIN streams ON streams.id = data.stream_id 
    WHERE streams.key = ?
    ORDER BY data.updated DESC, data.id DESC",
  )?;

  let results = stmt
    .query_map(&[key], |row| {
      Ok(Data {
        id: row.get(0)?,
        payload: row.get(1)?,
        created: row.get(2)?,
        updated: row.get(3)?,
      })
    })
    .and_then(|mapped_rows| Ok(mapped_rows.map(|row| row.unwrap()).collect::<Vec<Data>>()))?;

  Ok(results)
}

pub fn insert_data(conn: Connection, key: String, data: Map<String, Value>) -> Result<i64, Error> {
  conn.execute("INSERT OR IGNORE INTO streams (key) VALUES (?)", &[&key])?;

  let mut stmt = conn.prepare(
    "INSERT INTO data (payload, stream_id)
    VALUES (?, (SELECT streams.id FROM streams WHERE streams.key = ?))",
  )?;

  Ok(stmt.insert(&[&Value::Object(data) as &dyn ToSql, &key])?)
}
