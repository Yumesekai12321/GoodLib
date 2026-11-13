# Sprint 1 · Hợp đồng dữ liệu và HTTP

Đây là hợp đồng triển khai từ đặc tả gốc và yêu cầu Sprint 1 hiện tại, để Sơn,
Khánh, Tiến và Minh đối chiếu khi bàn giao. Chưa có bằng chứng cuộc họp chốt trước
31/10; không ghi lùi ngày xác nhận.

Đối chiếu schema, validator và route ở commit `68ad1c2` ngày 09/11/2026.
Phần này ghi lại hợp đồng đang triển khai, không thay đổi API hay schema.

## Dữ liệu sách

Migration `db/migrations/001_books.sql`, ledger `schema_migrations`; runner chỉ áp
dụng mỗi migration một lần, trong transaction. Không sửa migration đã phát hành;
tạo migration mới khi đổi schema.

| Field                       | Kiểu / ý nghĩa                                              |
| --------------------------- | ----------------------------------------------------------- |
| `id`                        | INTEGER PRIMARY KEY, tự tạo                                 |
| `code`                      | TEXT UNIQUE, trim, uppercase ASCII, 1–32 ký tự `[A-Z0-9_-]` |
| `title` / `title_search`    | Tên hiển thị / tên NFC + lowercase tiếng Việt để tìm        |
| `author` / `category`       | TEXT, tùy chọn, tối đa 200 / 100 ký tự                      |
| `published_year`            | INTEGER 0–9999 hoặc NULL                                    |
| `total_quantity`            | INTEGER ≥ 0; giới hạn form/server 2147483647                |
| `available_quantity`        | INTEGER 0..total, do service tính; không nhận từ POST       |
| `is_active`                 | INTEGER 1 hoặc 0 (SQLite lưu boolean dưới dạng số)          |
| `created_at` / `updated_at` | UTC ISO 8601                                                |

S1 không tạo `loans`. `openLoanCount(db, bookId)` trả 0 khi chưa có bảng; khi S2
có bảng thì đếm `book_id = ? AND returned_on IS NULL`, mỗi dòng là một cuốn.
Hai thao tác sửa tổng/xóa mềm dùng `BEGIN IMMEDIATE` để đọc lượt chưa trả và ghi
trong cùng transaction. Fixture S2 chỉ có trong test, không phát hành tính năng mượn.

## Endpoint và phản hồi

| Method | URL                  | Hành vi                                                |
| ------ | -------------------- | ------------------------------------------------------ |
| GET    | `/`                  | Redirect `/books`                                      |
| GET    | `/books?q=&page=`    | Chỉ sách active; mã/tên chứa từ khóa; trang 10 dòng    |
| GET    | `/books/new`         | Form thêm                                              |
| POST   | `/books`             | Thêm, thành công 303 → `/books?notice=created`         |
| GET    | `/books/:id/edit`    | Form sửa sách active                                   |
| POST   | `/books/:id`         | Sửa, 303 → `/books?notice=updated`                     |
| GET    | `/books/:id/archive` | Trang xác nhận, không thay đổi dữ liệu                 |
| POST   | `/books/:id/archive` | Bắt buộc `confirm=yes`; 303 → `/books?notice=archived` |

Body thêm/sửa đúng sáu field: `code`, `title`, `author`, `category`,
`published_year`, `total_quantity`; tất cả gửi dạng chuỗi từ HTML form.
Năm trống → NULL. Thiếu author/category → chuỗi trống. Tổng/mã/tên bắt buộc.
Zod `.strict()` từ chối field dư, kể cả `available_quantity`, `is_active`, `id`.

- Sai dữ liệu form: **422**, giữ giá trị nhập và báo lỗi tại field.
- Mã trùng, tổng thấp hơn số đang mượn, xóa khi có mượn: **409**.
- ID/query sai: **400**; sách không có hoặc đã ẩn: **404**.
- Lỗi ngoài dự kiến: **500**, thông báo chung ở UI, chi tiết ở log server.
- `q` tối đa 200 ký tự; `page` 1–1000000. Trang vượt số trang thực tế về trang cuối.
- `notice` chỉ nhận ba thông báo cố định, không render HTML từ query.

View model dùng `pageTitle`, `flash`, `values`, `errors`, `id`, `books`,
`pagination`, `q` theo màn hình. Mọi dữ liệu người dùng được escape bằng `<%=`.
`<%- include(...) %>` chỉ dùng cho partial do dự án kiểm soát.

## Tìm kiếm và tồn kho

`normalizeSearch()` dùng NFC + `toLocaleLowerCase('vi-VN')` ở cả ghi/query;
SQLite `instr()` so khớp chuỗi đã chuẩn hóa, không dựa `NOCASE` cho tiếng Việt.
Mã đã là ASCII nên có thể `lower(code)`. Không tìm tác giả/thể loại; không bỏ dấu,
không sửa chính tả. `%`/`_` không có tác dụng wildcard. Tìm chứa có thể scan toàn bảng;
benchmark 10.000 sách đã được ghi trong báo cáo nghiệm thu ngày 13/11/2026,
với p95 HTTP loopback khoảng 24 ms ở concurrency 1; không suy rộng cho tải khác.

Audit chỉ đọc toàn bộ sách, kể cả inactive, kiểm tra:
`available_quantity = total_quantity - openLoanCount`. Startup từ chối chạy nếu
có sai lệch. Không tự sửa số liệu.
