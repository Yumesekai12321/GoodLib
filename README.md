# GoodLib · Nhóm 11

Ứng dụng quản lý sách Sprint 1 bằng **Node.js 24 / Express / EJS / SQLite**.
Giao diện tiếng Việt, chạy cục bộ tại <http://127.0.0.1:3000/books>.

## Cài và chạy

Cài Node.js **24.x** và Git. Không cần cài SQLite riêng. Mở terminal tại thư mục
chứa `package.json`, kiểm tra `node --version`, rồi chạy:

```powershell
npm ci
Copy-Item .env.example .env
npm run db:migrate
npm run db:seed
npm start
```

Trên macOS/Linux thay dòng sao chép bằng `cp .env.example .env`. Nếu đã có `.env`,
giữ cấu hình đang dùng. `npm run dev` tự khởi động lại khi sửa mã nguồn.
Nhấn `Ctrl+C` để dừng. Không xóa `data/goodlib.db` khi khởi động lại.

`npm start` tự chạy migration chưa áp dụng và kiểm tra số lượng trước khi mở cổng.
Seed là thao tác riêng, thêm 6 sách mẫu tiếng Việt; chạy nhiều lần không ghi đè sách
đã sửa hoặc đã xóa mềm. Dữ liệu nằm tại `data/goodlib.db`, không đưa lên Git.

Giữ file `.npmrc` khi chia sẻ repo. better-sqlite3 13 đã kèm binary Node-API;
cấu hình này bỏ dependency install hooks, tránh npm 11 gọi build native không cần
thiết trên máy chưa có Windows SDK. Khi thêm dependency cần install hook, Sơn
cần đánh giá lại cấu hình này và kiểm tra cài mới.

## Tính năng và quy tắc

- Danh sách sách từ SQLite, phân trang 10 đầu sách; thêm, sửa và xóa mềm có xác nhận.
- Mã, tên, tác giả, thể loại, năm xuất bản, tổng số cuốn và số còn.
- Mã/tên bắt buộc. Mã được trim, chuyển chữ hoa, dùng 1–32 ký tự `A–Z`, `0–9`, `_`, `-`.
  Mã duy nhất kể cả bản ghi đã xóa mềm. Tác giả/thể loại/năm có thể để trống.
- Năm nếu có là số nguyên 0–9999; tổng là số nguyên 0–2147483647.
- **Số còn = tổng − số cuốn chưa trả**. Form không có trường nhập số còn; server
  từ chối request có `available_quantity`. Sprint 1 chưa có mượn nên số còn bằng tổng.
- Sửa tổng và xóa mềm dùng transaction. Đã có điểm nối để đếm `loans.returned_on IS NULL`
  khi Sprint 2 thêm bảng mượn: không giảm tổng thấp hơn số chưa trả, không xóa khi còn mượn.
- Tìm chứa từ khóa theo **mã hoặc tên**, không phân biệt hoa/thường tiếng Việt.
  Chuẩn hóa NFC, giữ dấu; `%` và `_` được tìm như ký tự thường.
- Xóa mềm đặt `is_active=0`, ẩn sách khỏi danh sách và chặn sửa; vẫn giữ bản ghi sau restart.
  Sprint 1 không có màn hình khôi phục. Kiểm tra bản ghi ẩn bằng script/test SQLite.

Các chức năng độc giả, mượn/trả, tài khoản, gia hạn và thống kê thuộc sprint sau.
Sprint 1 mặc định chỉ lắng nghe `127.0.0.1`; chưa có đăng nhập/CSRF hoàn chỉnh để triển khai công khai.

## Cấu hình

| Biến      | Mặc định            | Ý nghĩa                                                       |
| --------- | ------------------- | ------------------------------------------------------------- |
| `HOST`    | `127.0.0.1`         | Địa chỉ lắng nghe cục bộ                                      |
| `PORT`    | `3000`              | Cổng 1–65535                                                  |
| `DB_PATH` | `./data/goodlib.db` | File SQLite cục bộ; đường dẫn tương đối tính từ thư mục dự án |

File `.env` được các lệnh `start`, `dev`, `db:*` nạp bằng Node. Không đặt DB đang
ghi trên thư mục mạng. Khi sao lưu đơn giản cho demo: dừng app trước rồi sao chép
file DB; không chỉ sao chép file `.db` trong lúc WAL đang có ghi.

## Kiểm tra

```powershell
npm run lint
npm run format:check
npm test
npm run test:smoke
npx playwright install chromium
npm run test:e2e
npm run db:audit
```

`db:audit` cần migration đã chạy, chỉ đọc và trả exit code 1 nếu số còn sai;
không sửa dữ liệu. Các test khác tự dùng DB tạm, không dùng `data/goodlib.db`.
Smoke tạo tiến trình app thật, thêm/sửa/xóa mềm, dừng và mở lại để kiểm tra dữ liệu.
Playwright dùng cổng **3107**, phải đang trống. Trên Linux mới cài dùng
`npx playwright install --with-deps chromium` nếu thiếu thư viện trình duyệt.

CI được cấu hình cho Windows và Ubuntu, Node 24. Việc có file workflow chưa có
nghĩa là CI từ xa đã chạy. Bảng kết quả thực tế: [docs/test-cases.md](docs/test-cases.md).

## Demo và bàn giao

1. Chạy migration/seed, mở danh mục.
2. Thêm `DEMO01`, tên `ĐƯỜNG ĐẾN THƯ VIỆN`, tổng `3`; kiểm tra số còn `3`.
3. Tìm `đường đến`; xác nhận tìm được sách có chữ hoa tiếng Việt.
4. Sửa tổng thành `5`; kiểm tra tổng/số còn đều `5`.
5. Chọn xóa mềm, thử Hủy rồi mở lại và xác nhận. Sách biến mất khỏi danh mục.
6. Dừng và chạy `npm start` lại. Sách đã xóa vẫn ẩn, các sách khác vẫn còn.
7. Chạy `npm run test:smoke` để có bằng chứng tự động về bản ghi ẩn và số lượng sau restart.

Phân công chính xác theo người, file/hàm và cách chia commit:
[docs/contributions.md](docs/contributions.md).
Chạy `npm run handoff` để xuất tám gói file theo người vào `artifacts/handoffs/`.
Kế hoạch/chốt bản chạy: [docs/sprint-1-plan.md](docs/sprint-1-plan.md).
Dương dùng [phiếu chạy máy khác](docs/second-machine-test.md), Đạt dùng
[phiếu review kỹ thuật](docs/technical-review.md). Hai phiếu cần người phụ trách
điền kết quả thật trước khi Hoàng chốt nghiệm thu.

## Cấu trúc và hợp đồng

`routes → controllers → services → repositories → SQLite`; EJS chỉ hiển thị.
[docs/contracts.md](docs/contracts.md) mô tả schema, endpoint và tên field.
[docs/decisions.md](docs/decisions.md) ghi lựa chọn cho Sprint 1 và giới hạn phạm vi.
Đặc tả gốc được giữ nguyên tại [initial (1).md](<initial (1).md>).

## Xử lý lỗi khi cài/chạy

- Sai Node: chuyển sang Node 24, chạy lại `npm ci`. `better-sqlite3` là native module;
  nếu tải binary không được, kiểm tra kết nối/proxy và hướng dẫn build chính thức
  của [better-sqlite3](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md).
- `EADDRINUSE`: dừng tiến trình đang dùng cổng hoặc đổi `PORT` trong `.env`.
- `Stock audit failed`: chạy `npm run db:audit`, gửi kết quả cho Sơn/Hoàng; giữ DB
  để điều tra, không xóa hay chạy lệnh sửa dữ liệu tùy tiện.
- `SQLITE_BUSY`: kiểm tra có công cụ/tiến trình khác giữ transaction; app chờ tối đa 5 giây.
- Không tìm thấy sách không dấu: tìm đúng dấu tiếng Việt; Sprint 1 chưa yêu cầu bỏ dấu.
