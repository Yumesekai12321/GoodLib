import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { fixture, validBook } from '../fixtures/database.js';

test('HTTP-02: unexpected database failure returns generic 500, logs the error and rolls back', async (t) => {
  const { app, db } = fixture(t);
  const log = t.mock.method(console, 'error', () => {});
  db.exec(
    "CREATE TRIGGER fail_insert AFTER INSERT ON books BEGIN SELECT RAISE(ABORT, 'PRIVATE_SQL_MARKER'); END",
  );
  const response = await request(app).post('/books').type('form').send(validBook()).expect(500);
  assert.match(response.text, /Không thể xử lý yêu cầu/);
  assert.doesNotMatch(response.text, /PRIVATE_SQL_MARKER|CREATE TRIGGER|SqliteError/);
  assert.equal(log.mock.callCount(), 1);
  assert.equal(db.prepare('SELECT count(*) AS n FROM books').get().n, 0);
});

test('HTTP-03: oversized form is rejected with 413 and no database mutation', async (t) => {
  const { app, db } = fixture(t);
  const response = await request(app)
    .post('/books')
    .type('form')
    .send(validBook({ title: 'a'.repeat(20000) }))
    .expect(413);
  assert.match(response.text, /Biểu mẫu quá lớn/);
  assert.equal(db.prepare('SELECT count(*) AS n FROM books').get().n, 0);
});
