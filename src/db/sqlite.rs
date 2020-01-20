use super::models::{Data, Stream};
use failure::Error;
use r2d2;
use r2d2_sqlite::{self, SqliteConnectionManager};
use rusqlite::{ToSql, NO_PARAMS};
use serde_json::{Map, Value};

pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;
pub type Connection = r2d2::PooledConnection<r2d2_sqlite::SqliteConnectionManager>;

pub fn init() -> Result<Pool, Error> {
  let manager = SqliteConnectionManager::file("dlphn.db");
  let pool = Pool::new(manager)?;

  create_table(pool.get()?)?;

  Ok(pool)
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
    );
    PRAGMA synchronous = OFF;",
  )?;

  Ok(())
}

pub fn list_streams(conn: Connection) -> Result<Vec<Stream>, Error> {
  let mut stmt = conn.prepare(
    "SELECT 
      streams.id, 
      streams.key, 
      streams.created,
      streams.updated,
      max(data.updated) as last_insert,
      max(data.payload) as last_payload
    FROM streams
    INNER JOIN data on data.stream_id = streams.id
    GROUP BY streams.id
    ORDER BY data.created DESC, data.id DESC",
  )?;

  let results = stmt
    .query_map(NO_PARAMS, |row| {
      Ok(Stream {
        id: row.get(0)?,
        key: row.get(1)?,
        created: row.get(2)?,
        updated: row.get(3)?,
        last_insert: row.get(4)?,
        last_payload: row.get(5)?,
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
    ORDER BY data.created DESC, data.id DESC",
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

pub fn insert_data(
  mut conn: Connection,
  key: String,
  data: Map<String, Value>,
) -> Result<(), Error> {
  let tx = conn.transaction()?;

  tx.execute("INSERT OR IGNORE INTO streams (key) VALUES (?)", &[&key])?;

  tx.execute(
    "INSERT INTO data (payload, stream_id)
    SELECT ?, streams.id FROM streams WHERE streams.key = ?",
    &[&Value::Object(data) as &dyn ToSql, &key],
  )?;

  tx.commit()?;

  Ok(())
}
