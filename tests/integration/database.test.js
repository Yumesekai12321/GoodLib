import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import request from 'supertest';
import { fixture } from '../fixtures/database.js';
import { openDatabase } from '../../src/db/connection.js';
import { migrate } from '../../src/db/migrate.js';
import { auditStock } from '../../src/services/stockAudit.js';
import { seed } from '../../db/seeds/demo.js';
import { createApp } from '../../src/app.js';

test('DB-01: repeated migration preserves data; closing/reopening DB keeps edited and archived rows', async (t) => {
  const { db, filename, create, service } = fixture(t);
  const id = create();
  const archived = create({ code: 'OLD' });
  service.update(id, { ...service.get(id), total_quantity: 5 });
  service.archive(archived);
  migrate(db);
  migrate(db);
  assert.equal(db.prepare('SELECT count(*) AS n FROM schema_migrations').get().n, 1);
  db.close();
  const reopened = openDatabase(filename);
  try {
    const response = await request(createApp(reopened)).get('/books').expect(200);
    assert.match(response.text, /class="book-code">BK001/);
    assert.doesNotMatch(response.text, /class="book-code">OLD/);
    assert.equal(
      reopened.prepare('SELECT available_quantity FROM books WHERE id=?').get(id)
        .available_quantity,
      5,
    );
    assert.equal(
      reopened.prepare('SELECT is_active FROM books WHERE id=?').get(archived).is_active,
      0,
    );
  } finally {
    reopened.close();
  }
});

test('DB-02: demo seed is repeatable and preserves edited/archived samples', (t) => {
  const { db } = fixture(t);
  assert.equal(seed(db), 6);
  db.prepare("UPDATE books SET title='Custom', is_active=0 WHERE code='VN001'").run();
  assert.equal(seed(db), 0);
  assert.equal(db.prepare("SELECT title FROM books WHERE code='VN001'").get().title, 'Custom');
  assert.equal(db.prepare('SELECT count(*) AS n FROM books').get().n, 6);
});

test('AUD-01: read-only CLI detects corruption, returns nonzero and never repairs it', (t) => {
  const { db, filename, create } = fixture(t);
  create();
  const run = () =>
    spawnSync(process.execPath, ['scripts/audit-stock.js'], {
      env: { ...process.env, DB_PATH: filename },
      encoding: 'utf8',
    });
  assert.equal(run().status, 0);
  db.prepare('UPDATE books SET available_quantity=1').run();
  assert.equal(auditStock(db).length, 1);
  const result = run();
  assert.equal(result.status, 1, result.stderr);
  assert.equal(JSON.parse(result.stdout).errors[0].expected, 3);
  assert.equal(db.prepare('SELECT available_quantity FROM books').get().available_quantity, 1);
});

test('DB-03: constraints reject invalid quantities, years and hard data types', (t) => {
  const { db, create } = fixture(t);
  create();
  for (const sql of [
    'UPDATE books SET total_quantity=-1',
    'UPDATE books SET available_quantity=4',
    'UPDATE books SET available_quantity=-1',
    'UPDATE books SET published_year=10000',
    'UPDATE books SET total_quantity=1.5',
    'UPDATE books SET is_active=2',
  ])
    assert.throws(() => db.exec(sql));
  assert.deepEqual(auditStock(db), []);
});

test('HTTP-01: foreign-origin writes are rejected without mutations', async (t) => {
  const { app, db } = fixture(t);
  await request(app)
    .post('/books')
    .set('Origin', 'https://example.com')
    .type('form')
    .send({})
    .expect(403);
  assert.equal(db.prepare('SELECT count(*) AS n FROM books').get().n, 0);
});
