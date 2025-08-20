#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs, path::PathBuf};

use chrono::Local;
use csv::Writer;
use directories_next::UserDirs;
use rusqlite::{params, Connection};

// ---------- paths ----------
fn user_dirs() -> Result<UserDirs, String> {
  UserDirs::new().ok_or_else(|| "Could not resolve user directories".to_string())
}

fn old_db_path_home() -> Result<PathBuf, String> {
  // your previous location: ~/hhireg.db
  let home = user_dirs()?.home_dir().to_path_buf();
  Ok(home.join("hhireg.db"))
}

fn app_db_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
  // ~/Library/Application Support/HHI Registration/hhireg.db (macOS)
  app.path_resolver()
    .app_data_dir()
    .ok_or_else(|| "Could not resolve app data dir".to_string())
    .map(|p| p.join("hhireg.db"))
}

fn downloads_dir() -> Result<PathBuf, String> {
  user_dirs()
    .and_then(|u| u.download_dir().map(|p| p.to_path_buf())
      .ok_or_else(|| "Downloads folder not found".to_string()))
}

// open DB with WAL mode, create parent dir if needed
fn open_db(db_file: &PathBuf) -> Result<Connection, String> {
  if let Some(parent) = db_file.parent() {
    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
  }
  let conn = Connection::open(db_file).map_err(|e| e.to_string())?;
  conn.pragma_update(None, "journal_mode", &"WAL").map_err(|e| e.to_string())?;
  Ok(conn)
}

// ---------- commands ----------
#[tauri::command]
fn initialize_db(app: tauri::AppHandle) -> Result<(), String> {
  // migrate old DB if it exists in ~/ and not yet in app data dir
  let new_path = app_db_path(&app)?;
  let old_path = old_db_path_home()?;
  if old_path.exists() && !new_path.exists() {
    if let Some(parent) = new_path.parent() { fs::create_dir_all(parent).map_err(|e| e.to_string())?; }
    fs::copy(&old_path, &new_path).map_err(|e| e.to_string())?;
  }

  let conn = open_db(&new_path)?;
  conn.execute_batch(
    r#"
      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first TEXT NOT NULL,
        surname TEXT NOT NULL,
        phone TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_reg_created_at ON registrations(created_at);
    "#
  ).map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
fn add_registration(app: tauri::AppHandle, first: String, surname: String, phone: String) -> Result<(), String> {
  if first.trim().is_empty() || surname.trim().is_empty() || phone.trim().is_empty() {
    return Err("Please fill in First, Surname and Phone.".into());
  }
  let conn = open_db(&app_db_path(&app)?)?;
  conn.execute(
    "INSERT INTO registrations (first, surname, phone) VALUES (?1, ?2, ?3);",
    params![first.trim(), surname.trim(), phone.trim()],
  ).map_err(|e| e.to_string())?;
  Ok(())
}

#[derive(serde::Serialize)]
struct Person { id: i64, first: String, surname: String, phone: String }

#[tauri::command]
fn list_registrations(app: tauri::AppHandle) -> Result<Vec<Person>, String> {
  let conn = open_db(&app_db_path(&app)?)?;
  let mut stmt = conn.prepare(
    "SELECT id, first, surname, phone FROM registrations ORDER BY id DESC"
  ).map_err(|e| e.to_string())?;

  let rows = stmt.query_map([], |row| {
    Ok(Person {
      id: row.get(0)?,
      first: row.get(1)?,
      surname: row.get(2)?,
      phone: row.get(3)?,
    })
  }).map_err(|e| e.to_string())?;

  let mut out = Vec::new();
  for r in rows { out.push(r.map_err(|e| e.to_string())?); }
  Ok(out)
}

#[tauri::command]
fn delete_registration(app: tauri::AppHandle, id: i64) -> Result<(), String> {
  let conn = open_db(&app_db_path(&app)?)?;
  conn.execute("DELETE FROM registrations WHERE id = ?1", params![id])
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
fn export_csv(app: tauri::AppHandle) -> Result<String, String> {
  let conn = open_db(&app_db_path(&app)?)?;
  let mut stmt = conn.prepare(
    "SELECT id, first, surname, phone, created_at FROM registrations ORDER BY id ASC"
  ).map_err(|e| e.to_string())?;

  let downloads = downloads_dir()?;
  let filename = format!("HHI_Registrations_{}.csv", Local::now().format("%Y%m%d_%H%M"));
  let file_path = downloads.join(filename);

  let mut wtr: Writer<std::fs::File> = Writer::from_path(&file_path).map_err(|e| e.to_string())?;
  wtr.write_record(["id","first","surname","phone","created_at"]).map_err(|e| e.to_string())?;

  let mut rows = stmt.query([]).map_err(|e| e.to_string())?;
  while let Some(row) = rows.next().map_err(|e| e.to_string())? {
    let id: i64 = row.get(0).map_err(|e| e.to_string())?;
    let first: String = row.get(1).map_err(|e| e.to_string())?;
    let surname: String = row.get(2).map_err(|e| e.to_string())?;
    let phone: String = row.get(3).map_err(|e| e.to_string())?;
    let created_at: String = row.get(4).map_err(|e| e.to_string())?;
    wtr.write_record(&[id.to_string(), first, surname, phone, created_at]).map_err(|e| e.to_string())?;
  }
  wtr.flush().map_err(|e| e.to_string())?;
  Ok(file_path.display().to_string())
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      initialize_db,
      add_registration,
      list_registrations,
      delete_registration,
      export_csv
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}