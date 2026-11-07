import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { openDatabase } from '../src/db/connection.js';

const folder = mkdtempSync(path.join(tmpdir(), 'goodlib-smoke-'));
const filename = path.join(folder, 'smoke.db');
const reservation = net.createServer();
reservation.listen(0, '127.0.0.1');
await once(reservation, 'listening');
const port = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const baseURL = `http://127.0.0.1:${port}`;
let child;

async function start() {
  child = spawn(process.execPath, ['src/server.js'], {
    env: { ...process.env, DB_PATH: filename, HOST: '127.0.0.1', PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server start timeout')), 15000);
    child.stdout.on('data', (chunk) => {
      if (chunk.toString().includes('GoodLib:')) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.stderr.on('data', (chunk) => process.stderr.write(chunk));
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited ${code}`));
    });
  });
}
async function stop() {
  const running = child;
  child = null;
  if (!running || running.exitCode !== null || running.signalCode !== null) return;
  const exited = once(running, 'exit');
  running.kill();
  await exited;
}
async function post(route, data) {
  const result = await fetch(baseURL + route, {
    method: 'POST',
    body: new URLSearchParams(data),
    redirect: 'manual',
  });
  assert.equal(result.status, 303);
  await result.text();
}

try {
  await start();
  await post('/books', {
    code: 'RESTART',
    title: 'Sách sau khởi động lại',
    total_quantity: '3',
    published_year: '',
  });
  await post('/books', {
    code: 'ARCHIVED',
    title: 'Sách đã xóa mềm',
    total_quantity: '2',
    published_year: '',
  });
  await post('/books/1', {
    code: 'RESTART',
    title: 'Sách sau khởi động lại',
    total_quantity: '5',
    published_year: '',
  });
  await post('/books/2/archive', { confirm: 'yes' });
  await stop();
  await start();
  const html = await (await fetch(baseURL + '/books')).text();
  assert.match(html, /class="book-code">RESTART/);
  assert.doesNotMatch(html, /class="book-code">ARCHIVED/);
  await stop();
  const db = openDatabase(filename, { readonly: true });
  try {
    assert.equal(
      db.prepare('SELECT available_quantity FROM books WHERE id=1').get().available_quantity,
      5,
    );
    assert.equal(db.prepare('SELECT is_active FROM books WHERE id=2').get().is_active, 0);
  } finally {
    db.close();
  }
  console.log(
    'SMOKE PASS: fresh migration, HTTP CRUD, process restart, stock and archived row persisted.',
  );
} finally {
  await stop();
  rmSync(folder, { recursive: true, force: true });
}
