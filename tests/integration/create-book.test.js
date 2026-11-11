import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { fixture, validBook } from '../fixtures/database.js';

test('BK-01: create normalizes code and stock, redirects and displays the persisted book', async (t) => {
  const { app, db } = fixture(t);
  await request(app)
    .post('/books')
    .type('form')
    .send(validBook({ code: ' bk001 ' }))
    .expect(303)
    .expect('Location', '/books?notice=created');
  const book = db.prepare('SELECT * FROM books').get();
  assert.equal(book.code, 'BK001');
  assert.equal(book.total_quantity, 3);
  assert.equal(book.available_quantity, 3);
  const response = await request(app).get('/books?notice=created').expect(200);
  assert.match(response.text, /Dế Mèn phiêu lưu ký/);
  assert.match(response.text, /Đã thêm sách/);
});

test('BK-02: duplicate normalized code conflicts without a partial insert and keeps form input', async (t) => {
  const { app, db, create } = fixture(t);
  create();
  const response = await request(app)
    .post('/books')
    .type('form')
    .send(validBook({ code: 'bk001', title: 'Tên mới' }))
    .expect(409);
  assert.match(response.text, /Mã sách đã tồn tại/);
  assert.match(response.text, /Tên mới/);
  assert.equal(db.prepare('SELECT count(*) AS n FROM books').get().n, 1);
});

test('BK-02: missing, malformed and out-of-range fields are rejected on the server', async (t) => {
  const { app, db } = fixture(t);
  const invalid = [
    { code: '' },
    { title: '   ' },
    { code: 'SÁCH 1' },
    { title: 'a'.repeat(201) },
    { total_quantity: '-1' },
    { total_quantity: '1.5' },
    { total_quantity: '3e2' },
    { total_quantity: '' },
    { total_quantity: '2147483648' },
    { total_quantity: 'abc' },
    { published_year: '-1' },
    { published_year: '10000' },
    { published_year: '20ab' },
    { published_year: '1.5' },
    { available_quantity: '99' },
    { is_active: '0' },
  ];
  for (const data of invalid)
    await request(app).post('/books').type('form').send(validBook(data)).expect(422);
  await request(app)
    .post('/books')
    .type('form')
    .send({ title: 'Missing code', total_quantity: '3' })
    .expect(422);
  assert.equal(db.prepare('SELECT count(*) AS n FROM books').get().n, 0);
});

test('BK-02B: zero quantity, year zero and optional year are valid boundaries', async (t) => {
  const { app, db } = fixture(t);
  await request(app)
    .post('/books')
    .type('form')
    .send(validBook({ total_quantity: '0', published_year: '0' }))
    .expect(303);
  await request(app)
    .post('/books')
    .type('form')
    .send(validBook({ code: 'BK002', published_year: '' }))
    .expect(303);
  const rows = db.prepare('SELECT * FROM books ORDER BY id').all();
  assert.equal(rows[0].available_quantity, 0);
  assert.equal(rows[0].published_year, 0);
  assert.equal(rows[1].published_year, null);
});

test('SEC-S1: user titles are HTML escaped and stock has no editable input', async (t) => {
  const { app, create } = fixture(t);
  const id = create({ title: '<script>alert(1)</script>' });
  const response = await request(app).get('/books').expect(200);
  assert.match(response.text, /&lt;script&gt;/);
  assert.doesNotMatch(response.text, /<script>alert/);
  const form = await request(app).get(`/books/${id}/edit`).expect(200);
  assert.doesNotMatch(form.text, /name="available_quantity"/);
});
