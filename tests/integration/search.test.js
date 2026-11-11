import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { fixture } from '../fixtures/database.js';

test('BK-05: Vietnamese case-insensitive contains search supports NFC/NFD and retains accents', async (t) => {
  const { app, create } = fixture(t);
  create({ title: 'ĐẤT RỪNG PHƯƠNG NAM' });
  for (const q of ['đất rừng', 'ĐẤT rỪng', 'RỪNG'.normalize('NFD'), 'bk00', 'BK001']) {
    const response = await request(app).get('/books').query({ q }).expect(200);
    assert.match(response.text, /class="book-code">BK001/);
  }
  const unaccented = await request(app).get('/books').query({ q: 'dat rung' }).expect(200);
  assert.match(unaccented.text, /Không tìm thấy sách phù hợp/);
});

test('BK-05B: search only matches code/title and treats wildcard and SQL text literally', async (t) => {
  const { app, create } = fixture(t);
  create({ author: 'Secret author', category: 'Secret category' });
  for (const q of ['Secret', '%', '_', "' OR 1=1 --"]) {
    const response = await request(app).get('/books').query({ q }).expect(200);
    assert.match(response.text, /Không tìm thấy sách phù hợp/);
  }
});

test('UI-01: pagination handles page boundaries and malformed inputs safely', async (t) => {
  const { app, create } = fixture(t);
  for (let i = 1; i <= 12; i++) create({ code: `BK${i}` });
  const first = await request(app).get('/books').expect(200);
  assert.equal((first.text.match(/class="book-code"/g) || []).length, 10);
  const last = await request(app).get('/books?page=999').expect(200);
  assert.equal((last.text.match(/class="book-code"/g) || []).length, 2);
  assert.match(last.text, /Trang 2 \/ 2/);
  for (const path of [
    '/books?page=0',
    '/books?page=1.5',
    '/books?page=1000001',
    '/books?q=a&q=b',
    '/books?q=' + 'a'.repeat(201),
  ])
    await request(app).get(path).expect(400);
  for (const id of ['0', '-1', '1.5', 'abc', '9007199254740992'])
    await request(app).get(`/books/${id}/edit`).expect(400);
  await request(app).get('/books/999/edit').expect(404);
  await request(app).get('/unknown').expect(404);
});
