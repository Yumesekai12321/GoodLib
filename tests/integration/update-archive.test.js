import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { fixture, validBook, addLoanFixture } from '../fixtures/database.js';
import { auditStock } from '../../src/services/stockAudit.js';

test('BK-03A: edit all metadata and total updates available stock in S1', async (t) => {
  const { app, db, create } = fixture(t);
  const id = create();
  await request(app)
    .post(`/books/${id}`)
    .type('form')
    .send(
      validBook({
        code: 'NEW',
        title: 'Tên sách mới',
        author: 'Tác giả mới',
        category: 'Mới',
        published_year: '2026',
        total_quantity: '7',
      }),
    )
    .expect(303);
  const book = db.prepare('SELECT * FROM books WHERE id=?').get(id);
  assert.equal(book.code, 'NEW');
  assert.equal(book.title, 'Tên sách mới');
  assert.equal(book.author, 'Tác giả mới');
  assert.equal(book.category, 'Mới');
  assert.equal(book.published_year, 2026);
  assert.equal(book.total_quantity, 7);
  assert.equal(book.available_quantity, 7);
  assert.deepEqual(auditStock(db), []);
});

test('BK-03: total below open loans is rejected atomically; valid edit subtracts only unreturned copies', async (t) => {
  const { app, db, create } = fixture(t);
  const id = create();
  addLoanFixture(db, id);
  db.prepare('INSERT INTO loans (book_id, returned_on) VALUES (?, ?)').run(id, '2026-11-08');
  const before = db.prepare('SELECT * FROM books WHERE id=?').get(id);
  await request(app)
    .post(`/books/${id}`)
    .type('form')
    .send(validBook({ title: 'Must not save', total_quantity: '1' }))
    .expect(409);
  assert.deepEqual(db.prepare('SELECT * FROM books WHERE id=?').get(id), before);
  await request(app)
    .post(`/books/${id}`)
    .type('form')
    .send(validBook({ total_quantity: '2' }))
    .expect(303);
  assert.equal(
    db.prepare('SELECT available_quantity FROM books WHERE id=?').get(id).available_quantity,
    0,
  );
  assert.deepEqual(auditStock(db), []);
});

test('BK-03B: invalid and duplicate edits cannot change stock or metadata', async (t) => {
  const { app, db, create } = fixture(t);
  const id = create();
  create({ code: 'BK002' });
  const before = db.prepare('SELECT * FROM books WHERE id=?').get(id);
  for (const data of [{ total_quantity: '-1' }, { available_quantity: '0' }, { title: '' }]) {
    await request(app).post(`/books/${id}`).type('form').send(validBook(data)).expect(422);
  }
  await request(app)
    .post(`/books/${id}`)
    .type('form')
    .send(validBook({ code: 'BK002' }))
    .expect(409);
  assert.deepEqual(db.prepare('SELECT * FROM books WHERE id=?').get(id), before);
});

test('BK-04: archiving with an open loan conflicts and preserves loan history', async (t) => {
  const { app, db, create } = fixture(t);
  const id = create();
  addLoanFixture(db, id, 1);
  await request(app).post(`/books/${id}/archive`).type('form').send({ confirm: 'yes' }).expect(409);
  assert.equal(db.prepare('SELECT is_active FROM books WHERE id=?').get(id).is_active, 1);
  assert.equal(db.prepare('SELECT count(*) AS n FROM loans').get().n, 1);
  db.prepare("UPDATE loans SET returned_on='2026-11-08'").run();
  db.prepare('UPDATE books SET available_quantity=total_quantity').run();
  await request(app).post(`/books/${id}/archive`).type('form').send({ confirm: 'yes' }).expect(303);
  assert.equal(db.prepare('SELECT count(*) AS n FROM loans').get().n, 1);
});

test('BK-06: confirmation required; soft deletion hides book, prevents edits and retains code uniqueness', async (t) => {
  const { app, db, create } = fixture(t);
  const id = create();
  await request(app).get(`/books/${id}/archive`).expect(200);
  await request(app).post(`/books/${id}/archive`).type('form').send({}).expect(422);
  assert.equal(db.prepare('SELECT is_active FROM books').get().is_active, 1);
  await request(app).post(`/books/${id}/archive`).type('form').send({ confirm: 'yes' }).expect(303);
  assert.equal(db.prepare('SELECT is_active FROM books').get().is_active, 0);
  assert.equal(db.prepare('SELECT count(*) AS n FROM books').get().n, 1);
  const response = await request(app).get('/books?q=BK001').expect(200);
  assert.doesNotMatch(response.text, /class="book-code">BK001/);
  await request(app).get(`/books/${id}/edit`).expect(404);
  await request(app).post(`/books/${id}`).type('form').send(validBook()).expect(404);
  await request(app).post(`/books/${id}/archive`).type('form').send({ confirm: 'yes' }).expect(404);
  await request(app).post('/books').type('form').send(validBook()).expect(409);
});

test('TX-01: injected write failure rolls back metadata and stock without partial updates', (t) => {
  const { db, service, create } = fixture(t);
  const id = create();
  const before = db.prepare('SELECT * FROM books WHERE id=?').get(id);
  db.exec(
    "CREATE TRIGGER fail_update AFTER UPDATE ON books BEGIN SELECT RAISE(ABORT, 'injected failure'); END",
  );
  assert.throws(
    () => service.update(id, { ...before, title: 'Must roll back', total_quantity: 10 }),
    /injected failure/,
  );
  assert.deepEqual(db.prepare('SELECT * FROM books WHERE id=?').get(id), before);
  assert.deepEqual(auditStock(db), []);
});
