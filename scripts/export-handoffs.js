import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { projectRoot } from '../src/config/paths.js';

const owners = JSON.parse(readFileSync(path.join(projectRoot, 'docs/handoff-map.json'), 'utf8'));
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
    `# ${owner.name} · ${owner.tasks}\n\nCác file trong gói giữ nguyên đường dẫn tương đối của GoodLib.\nĐây là phần bàn giao, cần ghép với các phần khác để chạy ứng dụng.\nĐọc docs/contributions.md trong bản đầy đủ để biết hàm, kiểm thử và cách commit.\nTự kiểm tra phần phụ trách rồi dùng danh tính GitHub của chính mình.\nPhiếu máy khác/review phải điền kết quả thực tế trước khi commit hoàn thành.\n`,
  );
  console.log(`${owner.name}: ${path.relative(projectRoot, folder)}`);
}
