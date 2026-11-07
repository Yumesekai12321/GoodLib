import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { databasePath } from '../config/paths.js';

export function openDatabase(filename = databasePath(), { readonly = false } = {}) {
  if (!readonly && filename !== ':memory:') mkdirSync(path.dirname(filename), { recursive: true });
  const db = new Database(filename, { readonly, fileMustExist: readonly });
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  if (!readonly) db.pragma('journal_mode = WAL');
  return db;
}
