import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openDatabase } from '../../src/db/connection.js';
import { migrate } from '../../src/db/migrate.js';
import { createApp } from '../../src/app.js';
import { bookSchema } from '../../src/validators/bookSchemas.js';
import { bookService } from '../../src/services/bookService.js';

export const validBook = (overrides = {}) => ({
  code: 'BK001',
  title: 'Dế Mèn phiêu lưu ký',
  author: 'Tô Hoài',
  category: 'Thiếu nhi',
  published_year: '1941',
  total_quantity: '3',
  ...overrides,
});

export function fixture(t) {
  const folder = mkdtempSync(path.join(tmpdir(), 'goodlib-test-'));
  const filename = path.join(folder, 'test.db');
  const db = openDatabase(filename);
  migrate(db);
  t.after(() => {
    if (db.open) db.close();
    rmSync(folder, { recursive: true, force: true });
  });
  const service = bookService(db);
  return {
    db,
    filename,
    app: createApp(db),
    service,
    create: (data = {}) => service.create(bookSchema.parse(validBook(data))),
  };
}

export function addLoanFixture(db, bookId, count = 2) {
  // Test-only minimal S2 adapter contract; no readers/loans feature is shipped in S1.
  db.exec(
    'CREATE TABLE loans (id INTEGER PRIMARY KEY, book_id INTEGER NOT NULL REFERENCES books(id), returned_on TEXT) STRICT',
  );
  for (let i = 0; i < count; i++) db.prepare('INSERT INTO loans (book_id) VALUES (?)').run(bookId);
  db.prepare('UPDATE books SET available_quantity=total_quantity-? WHERE id=?').run(count, bookId);
}
