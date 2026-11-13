import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { arch, cpus, platform, release, tmpdir } from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db/connection.js';
import { migrate } from '../src/db/migrate.js';
import { bookService } from '../src/services/bookService.js';

const folder = mkdtempSync(path.join(tmpdir(), 'goodlib-search-benchmark-'));
const db = openDatabase(path.join(folder, 'benchmark.db'));
let server;
const queries = [
  '',
  'BK000',
  'bk09999',
  'đất rừng',
  'ĐẤT RỪNG'.normalize('NFD'),
  '%',
  'không có sách',
];
const percentile95 = (samples) =>
  [...samples].sort((a, b) => a - b)[Math.ceil(samples.length * 0.95) - 1];
const round = (value) => Number(value.toFixed(2));

try {
  migrate(db);
  const service = bookService(db);
  db.transaction(() => {
    for (let i = 0; i < 10000; i++)
      service.create({
        code: `BK${String(i).padStart(5, '0')}`,
        title: `${i % 2 ? 'ĐẤT RỪNG PHƯƠNG NAM' : 'Tủ sách khoa học'} ${i}`,
        author: 'Tác giả mẫu',
        category: 'Sách mẫu',
        published_year: 2026,
        total_quantity: 3,
      });
  }).immediate();
  server = createApp(db).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const baseURL = `http://127.0.0.1:${server.address().port}/books`;
  const samples = queries.map(() => []);
  // Two warmup requests and twenty measured requests per query, interleaved.
  for (let roundIndex = -2; roundIndex < 20; roundIndex++) {
    for (const [index, q] of queries.entries()) {
      const started = performance.now();
      const response = await fetch(`${baseURL}?${new URLSearchParams({ q })}`);
      await response.text();
      const elapsed = performance.now() - started;
      assert.equal(response.status, 200);
      if (roundIndex >= 0) samples[index].push(elapsed);
    }
  }
  const all = samples.flat();
  const result = {
    environment: {
      node: process.version,
      os: `${platform()} ${release()} ${arch()}`,
      cpu: cpus()[0]?.model,
    },
    books: 10000,
    concurrency: 1,
    measuredRequests: all.length,
    warmupRequests: queries.length * 2,
    scope:
      'Local HTTP response including SSR and full response body; excludes browser rendering and external network.',
    p95Ms: round(percentile95(all)),
    maxMs: round(Math.max(...all)),
    queries: queries.map((q, index) => ({
      q,
      requests: samples[index].length,
      p95Ms: round(percentile95(samples[index])),
    })),
  };
  console.log(JSON.stringify(result, null, 2));
  for (const row of result.queries)
    assert.ok(row.p95Ms < 2000, `Search p95 exceeded 2 seconds: ${row.q}`);
} finally {
  if (server?.listening) await new Promise((resolve) => server.close(resolve));
  db.close();
  rmSync(folder, { recursive: true, force: true });
}
