import { pathToFileURL } from 'node:url';
import { openDatabase } from '../../src/db/connection.js';
import { migrate } from '../../src/db/migrate.js';
import { bookService } from '../../src/services/bookService.js';

export const demoBooks = [
  ['VN001', 'Dế Mèn phiêu lưu ký', 'Tô Hoài', 'Thiếu nhi', 1941, 5],
  ['VN002', 'Tôi thấy hoa vàng trên cỏ xanh', 'Nguyễn Nhật Ánh', 'Văn học', 2010, 3],
  ['VN003', 'ĐẤT RỪNG PHƯƠNG NAM', 'Đoàn Giỏi', 'Văn học', 1957, 4],
  ['VN004', 'Số đỏ', 'Vũ Trọng Phụng', 'Tiểu thuyết', 1936, 2],
  ['VN005', 'Tuổi thơ dữ dội', 'Phùng Quán', 'Văn học', 1988, 0],
  ['IT001', 'Nhập môn lập trình', 'Nhóm GoodLib', 'Tin học', 2026, 6],
];

export function seed(db) {
  // Never overwrite edited or archived sample books; one atomic, repeatable seed.
  return db
    .transaction(() => {
      let inserted = 0;
      const service = bookService(db);
      for (const [code, title, author, category, published_year, total_quantity] of demoBooks) {
        if (db.prepare('SELECT 1 FROM books WHERE code=?').get(code)) continue;
        service.create({ code, title, author, category, published_year, total_quantity });
        inserted++;
      }
      return inserted;
    })
    .immediate();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const db = openDatabase();
  try {
    migrate(db);
    console.log(`Seed complete: ${seed(db)} sample books added; existing rows unchanged.`);
  } finally {
    db.close();
  }
}
