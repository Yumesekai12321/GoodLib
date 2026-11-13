import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import { arch, platform, release, tmpdir } from 'node:os';
import path from 'node:path';
import { projectRoot } from '../src/config/paths.js';
import { openDatabase } from '../src/db/connection.js';

const folder = mkdtempSync(path.join(tmpdir(), 'goodlib-acceptance-'));
const filename = path.join(folder, 'acceptance.db');
const envFile = path.join(folder, '.env');
copyFileSync(path.join(projectRoot, '.env.example'), envFile);
const reservation = net.createServer();
reservation.listen(0, '127.0.0.1');
await once(reservation, 'listening');
const port = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const env = { ...process.env, DB_PATH: filename, HOST: '127.0.0.1', PORT: String(port) };
const baseURL = `http://127.0.0.1:${port}`;
const gitCommit = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: projectRoot, encoding: 'utf8' });
const gitStatus = spawnSync('git', ['status', '--porcelain'], {
  cwd: projectRoot,
  encoding: 'utf8',
});
const report = {
  date: new Date().toISOString(),
  commit: process.env.GITHUB_SHA || gitCommit.stdout.trim(),
  workingTreeDirty: Boolean(gitStatus.stdout.trim()),
  executor: 'Codex acceptance runner',
  environment: {
    os: `${platform()} ${release()} ${arch()}`,
    node: process.version,
    mode: process.env.CI ? 'GitHub Actions' : 'local',
    runURL: process.env.GITHUB_RUN_ID
      ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : null,
  },
  steps: [],
  status: 'FAIL',
};
let child;
let bookId;
const book = {
  code: 'MAY2',
  title: 'ĐƯỜNG ĐẾN THƯ VIỆN',
  author: 'Nhóm GoodLib',
  category: 'Văn học',
  published_year: '2026',
  total_quantity: '3',
};

function snapshot() {
  const db = openDatabase(filename, { readonly: true });
  try {
    return {
      migrations: db.prepare('SELECT count(*) AS n FROM schema_migrations').get().n,
      books: db.prepare('SELECT * FROM books ORDER BY id').all(),
    };
  } finally {
    db.close();
  }
}
function run(script) {
  const result = spawnSync(process.execPath, [`--env-file=${envFile}`, script], {
    cwd: projectRoot,
    env,
    encoding: 'utf8',
    timeout: 20000,
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${script}: ${result.stderr}\n${result.stdout}`);
  return result.stdout;
}
async function start() {
  child = spawn(process.execPath, [`--env-file=${envFile}`, 'src/server.js'], {
    cwd: projectRoot,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    let output = '';
    let errors = '';
    const timer = setTimeout(() => reject(new Error(`Server startup timeout: ${errors}`)), 15000);
    child.stdout.on('data', (chunk) => {
      output += chunk.toString();
      if (output.includes('GoodLib:')) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.stderr.on('data', (chunk) => {
      errors += chunk.toString();
    });
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Server exited ${code}: ${errors}`));
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
async function get(route) {
  const response = await fetch(baseURL + route, { signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200);
  return response.text();
}
async function post(route, values, expected = 303) {
  const response = await fetch(baseURL + route, {
    method: 'POST',
    body: new URLSearchParams(values),
    redirect: 'manual',
    signal: AbortSignal.timeout(10000),
  });
  const html = await response.text();
  assert.equal(response.status, expected, html.slice(0, 300));
}
async function step(id, input, expected, check) {
  const row = { id, input, expected, actual: '', status: 'FAIL' };
  report.steps.push(row);
  try {
    row.actual = await check();
    row.status = 'PASS';
    console.log(`PASS ${id}: ${row.actual}`);
  } catch (error) {
    row.actual = error.message;
    throw error;
  }
}

try {
  await step(
    'AC-01',
    'Cấu hình từ .env.example; migration hai lần',
    'Một ledger, DB mới không có sách',
    () => {
      run('scripts/migrate.js');
      run('scripts/migrate.js');
      const data = snapshot();
      assert.equal(data.migrations, 1);
      assert.equal(data.books.length, 0);
      return 'Migration 2 lần thành công; ledger=1, books=0.';
    },
  );
  await step('AC-02', 'Seed hai lần theo README', 'Thêm 6 rồi 0 sách, không trùng', () => {
    assert.match(run('db/seeds/demo.js'), /6 sample books added/);
    assert.match(run('db/seeds/demo.js'), /0 sample books added/);
    assert.equal(snapshot().books.length, 6);
    return 'Seed thêm 6 rồi 0; tổng 6 sách.';
  });
  await step(
    'AC-03',
    'Khởi động server thật và GET /books',
    'HTTP 200, 6 sách, đủ nút và ô tìm',
    async () => {
      await start();
      const html = await get('/books');
      assert.equal((html.match(/class="book-code"/g) || []).length, 6);
      for (const pattern of [/\/books\/new/, /\/edit/, /\/archive/, /name="q"/])
        assert.match(html, pattern);
      return 'Server khởi động; HTTP 200; 6 sách và đủ điều khiển.';
    },
  );
  await step(
    'AC-04',
    'Thêm MAY2, tên tiếng Việt, tổng 3',
    'DB lưu đủ field; tổng/số còn=3',
    async () => {
      await post('/books', book);
      const saved = snapshot().books.find((row) => row.code === 'MAY2');
      bookId = saved.id;
      for (const key of ['code', 'title', 'author', 'category'])
        assert.equal(saved[key], book[key]);
      assert.equal(saved.published_year, 2026);
      assert.equal(saved.total_quantity, 3);
      assert.equal(saved.available_quantity, 3);
      return 'MAY2 lưu đủ field; tổng=3, số còn=3.';
    },
  );
  await step(
    'AC-05',
    'Mã trùng; thiếu mã/tên; năm sai; tổng âm/lẻ; gửi số còn',
    '409/422, không có bản ghi phụ',
    async () => {
      const before = snapshot();
      await post('/books', { ...book, code: 'may2' }, 409);
      const invalid = [
        { code: '' },
        { title: '' },
        { published_year: '2026.5' },
        { published_year: '10000' },
        { total_quantity: '-1' },
        { total_quantity: '1.5' },
        { available_quantity: '99' },
      ];
      for (const values of invalid) await post('/books', { ...book, ...values }, 422);
      assert.deepEqual(snapshot(), before);
      return '1 ca mã trùng trả 409; 7 ca dữ liệu sai trả 422; DB giữ nguyên.';
    },
  );
  await step(
    'AC-06',
    'Tìm mã/tên hoa/thường Việt, NFC/NFD, ký tự %',
    'Khớp đúng, giữ dấu và tìm % như ký tự thường',
    async () => {
      for (const q of ['may2', 'đường đến', 'ĐƯỜNG ĐẾN'.normalize('NFD')]) {
        assert.match(await get(`/books?${new URLSearchParams({ q })}`), /class="book-code">MAY2/);
      }
      for (const q of ['duong den', '%'])
        assert.doesNotMatch(
          await get(`/books?${new URLSearchParams({ q })}`),
          /class="book-code">MAY2/,
        );
      return 'Tìm mã/tên Việt đúng qua 5 query; không bỏ dấu hoặc mở rộng wildcard.';
    },
  );
  await step('AC-07', 'Sửa tổng MAY2 từ 3 lên 5', 'Tổng/số còn=5 trong DB', async () => {
    await post(`/books/${bookId}`, { ...book, total_quantity: '5' });
    const saved = snapshot().books.find((row) => row.id === bookId);
    assert.equal(saved.total_quantity, 5);
    assert.equal(saved.available_quantity, 5);
    return 'Lưu tổng=5, số còn=5.';
  });
  await step(
    'AC-08',
    'Mở xác nhận rồi quay lại danh sách, chưa POST',
    'Hủy giữ sách active và còn hiển thị',
    async () => {
      await get(`/books/${bookId}/archive`);
      assert.match(await get('/books'), /class="book-code">MAY2/);
      assert.equal(snapshot().books.find((row) => row.id === bookId).is_active, 1);
      return 'GET xác nhận không đổi DB; quay lại vẫn thấy MAY2.';
    },
  );
  await step(
    'AC-09',
    'POST xóa không xác nhận rồi xác nhận yes',
    '422 trước xác nhận; sau đó ẩn, giữ row, chặn sửa',
    async () => {
      await post(`/books/${bookId}/archive`, {}, 422);
      assert.equal(snapshot().books.find((row) => row.id === bookId).is_active, 1);
      await post(`/books/${bookId}/archive`, { confirm: 'yes' });
      assert.doesNotMatch(await get('/books'), /class="book-code">MAY2/);
      assert.equal(snapshot().books.find((row) => row.id === bookId).is_active, 0);
      const response = await fetch(`${baseURL}/books/${bookId}/edit`);
      await response.text();
      assert.equal(response.status, 404);
      return 'Xác nhận bắt buộc; row inactive vẫn giữ; danh sách ẩn và sửa trả 404.';
    },
  );
  await step(
    'AC-10',
    'Dừng và khởi động lại tiến trình',
    'Giữ 6 mẫu và MAY2 inactive, tổng/số còn=5',
    async () => {
      await stop();
      await start();
      const html = await get('/books');
      assert.doesNotMatch(html, /class="book-code">MAY2/);
      assert.equal((html.match(/class="book-code"/g) || []).length, 6);
      const data = snapshot();
      assert.equal(data.books.length, 7);
      const saved = data.books.find((row) => row.id === bookId);
      assert.equal(saved.is_active, 0);
      assert.equal(saved.total_quantity, 5);
      assert.equal(saved.available_quantity, 5);
      return 'Sau restart còn 7 row, 6 active; MAY2 inactive, tổng/số còn=5.';
    },
  );
  await step(
    'AC-11',
    'Thêm lại mã đã xóa; chạy lại seed',
    'Mã vẫn trùng 409; seed không ghi đè dữ liệu',
    async () => {
      const before = snapshot();
      await post('/books', book, 409);
      assert.match(run('db/seeds/demo.js'), /0 sample books added/);
      assert.deepEqual(snapshot(), before);
      return 'Mã inactive trả 409; seed thêm 0; giữ nguyên mọi row.';
    },
  );
  await step('AC-12', 'Audit DB có sách active và inactive', 'ok=true, không đổi dữ liệu', () => {
    const before = snapshot();
    const audit = JSON.parse(run('scripts/audit-stock.js'));
    assert.equal(audit.ok, true);
    assert.deepEqual(audit.errors, []);
    assert.deepEqual(snapshot(), before);
    return 'Audit đạt trên 7 row; không sửa dữ liệu.';
  });
  report.status = 'PASS';
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await stop();
  const outputFolder = path.join(projectRoot, 'artifacts');
  mkdirSync(outputFolder, { recursive: true });
  const reportPath = path.join(outputFolder, `acceptance-${platform()}`);
  writeFileSync(`${reportPath}.json`, JSON.stringify(report, null, 2) + '\n');
  const cell = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', '<br>');
  const rows = report.steps.map(
    (row) =>
      `| ${[row.id, row.input, row.expected, row.actual, row.status].map(cell).join(' | ')} |`,
  );
  writeFileSync(
    `${reportPath}.md`,
    `# Kết quả chạy nghiệm thu Sprint 1\n\nNgày UTC: ${report.date}\n\nCommit: ${report.commit}\n\nMôi trường: ${report.environment.os}, Node ${report.environment.node}\n\nKết quả: **${report.status}**, ${report.steps.filter((row) => row.status === 'PASS').length}/12 bước đạt.\n\n| ID | Đầu vào | Mong đợi | Thực tế | Pass/Fail |\n| --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`,
  );
  console.log(`Acceptance ${report.status}: ${reportPath}.json`);
  rmSync(folder, { recursive: true, force: true });
}
