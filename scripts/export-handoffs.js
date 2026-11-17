import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { projectRoot } from '../src/config/paths.js';

const owners = JSON.parse(readFileSync(path.join(projectRoot, 'scripts/handoff-map.json'), 'utf8'));
const output = path.join(projectRoot, 'artifacts/handoffs');
for (const owner of owners) {
  const folder = path.join(output, owner.folder);
  mkdirSync(folder, { recursive: true });
  for (const file of owner.files) {
    const destination = path.join(folder, file);
    mkdirSync(path.dirname(destination), { recursive: true });
    cpSync(path.join(projectRoot, file), destination, { recursive: true });
  }
  writeFileSync(
    path.join(folder, 'HANDOFF.md'),
    `# ${owner.name} · ${owner.tasks}\n\nCác file trong gói giữ nguyên đường dẫn tương đối của GoodLib.\nĐây là phần bàn giao, cần ghép với các phần khác để chạy ứng dụng.\nĐọc README.md và docs/sprint-1-report.md trong bản đầy đủ để xem cách chạy, kiểm thử và kết quả cuối cùng.\nBảng phân gói theo phân công công việc trong dự án.\nTự kiểm tra phần phụ trách rồi dùng danh tính GitHub của chính mình.\n`,
  );
  console.log(`${owner.name}: ${path.relative(projectRoot, folder)}`);
}
