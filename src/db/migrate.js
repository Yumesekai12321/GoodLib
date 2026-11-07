import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { projectRoot } from '../config/paths.js';

export function migrate(db) {
  const folder = path.join(projectRoot, 'db/migrations');
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY, applied_at TEXT NOT NULL
  ) STRICT`);
  for (const file of readdirSync(folder)
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort()) {
    db.transaction(() => {
      if (db.prepare('SELECT 1 FROM schema_migrations WHERE version = ?').get(file)) return;
      db.exec(readFileSync(path.join(folder, file), 'utf8'));
      db.prepare('INSERT INTO schema_migrations VALUES (?, ?)').run(file, new Date().toISOString());
    }).immediate();
  }
}
