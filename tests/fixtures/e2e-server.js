import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openDatabase } from '../../src/db/connection.js';
import { migrate } from '../../src/db/migrate.js';
import { createApp } from '../../src/app.js';
import { seed } from '../../db/seeds/demo.js';

const folder = mkdtempSync(path.join(tmpdir(), 'goodlib-e2e-'));
const db = openDatabase(path.join(folder, 'browser.db'));
migrate(db);
seed(db);
const server = createApp(db).listen(3107, '127.0.0.1');
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () =>
    server.close(() => {
      db.close();
      rmSync(folder, { recursive: true, force: true });
      process.exit(0);
    }),
  );
