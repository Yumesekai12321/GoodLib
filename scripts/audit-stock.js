import { openDatabase } from '../src/db/connection.js';
import { auditStock } from '../src/services/stockAudit.js';

const db = openDatabase(undefined, { readonly: true });
try {
  const errors = auditStock(db);
  console.log(JSON.stringify({ ok: errors.length === 0, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
} finally {
  db.close();
}
