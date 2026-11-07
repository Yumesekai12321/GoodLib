import { openDatabase } from '../src/db/connection.js';
import { migrate } from '../src/db/migrate.js';

const db = openDatabase();
try {
  migrate(db);
  console.log('Migration complete.');
} finally {
  db.close();
}
