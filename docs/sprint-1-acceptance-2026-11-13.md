# Kết quả tích hợp và nghiệm thu kỹ thuật Sprint 1

- Ngày kiểm tra: 13/11/2026.
- Bản đầu vào: `990e7d975d9b875baa3da6624f11a16f91a201f7` trên `main`; đã tích hợp và kiểm tra lại như mô tả dưới đây.
- Môi trường: Windows NT 10.0.26200.0, Node.js 24.19.0, npm 11.17.0.
- Người thực hiện: Codex trên máy hiện tại. Đây không phải kết quả chạy trên máy khác của Dương hoặc phê duyệt kỹ thuật của Đạt.
- Các test dùng cơ sở dữ liệu tạm riêng, không dùng dữ liệu ứng dụng hiện có.

## Kết luận

**Đạt các luồng kỹ thuật đã kiểm tra trên máy hiện tại sau tích hợp.** 19 integration
tests, smoke kiểm tra tiến trình thật sau restart và 3 E2E đạt. Migration/seed lặp
và audit với dữ liệu mẫu đạt. Đã xem ảnh giao diện desktop, form và mobile.

Nghiệm thu của nhóm còn chờ xác nhận của người được phân công: Dương chạy trên
máy khác, Đạt review và Hoàng quyết định bản nghiệm thu. Báo cáo này ghi kết quả
Codex thực hiện, không thay chữ ký của họ hoặc xác nhận các mốc lịch sử đã hoàn thành.

## Thay đổi tích hợp

- Merge nhánh UI `b03d9c0`, quản lý sách `7db5855`, kiểm thử `5d0def8`, giữ nguyên lịch sử và tác giả các nhánh.
- Khôi phục `bookSearchRepository.js`, `normalize.js`, `search.ejs` cùng đặc tả, hợp đồng, kế hoạch và cấu hình bàn giao từ `940f231`.
- Định dạng hai file CSS và thêm `*.css text eol=lf` trong `.gitattributes`: Windows với `core.autocrlf=true` trước đó checkout CSS thành CRLF, khiến Prettier báo lỗi dù nội dung Git không đổi.
- Thay lệnh test bằng runner kiểm tra sự tồn tại của file test trước khi gọi Node test runner. Đã kiểm tra trường hợp thư mục test rỗng: exit khác 0.
- Bỏ qua thư mục sinh tự động `artifacts/` trong ESLint; kiểm tra sau xuất handoff phát hiện ESLint đang đọc các bản sao nguồn trong đó và báo lỗi globals không phù hợp.
- Thêm benchmark tìm kiếm có thể chạy lại bằng `npm run test:search-performance`; CI lưu ảnh E2E theo từng hệ điều hành.

## Kết quả sau tích hợp

| Kiểm tra                       | Kết quả                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| `npm ci`                       | Cài được 171 packages trên Node 24.19.0/npm 11.17.0.                                           |
| Migration hai lần trên DB mới  | Một ledger `001_books.sql`, không tạo lặp.                                                     |
| Seed hai lần                   | Thêm 6 rồi 0 sách, vẫn chỉ 6 bản ghi.                                                          |
| `npm run db:audit` trên 6 sách | `ok: true`, không có dòng sai tổng/số còn.                                                     |
| `npm test`                     | 19 passed, 0 failed; bao gồm validation, Unicode, phân trang, rollback, tồn kho và xóa mềm.    |
| `npm run test:smoke`           | `SMOKE PASS`: HTTP CRUD, tắt/mở lại tiến trình, số còn 5 và bản ghi xóa mềm được giữ.          |
| `npm run test:e2e`             | 3 passed, 0 failed; luồng CRUD/tìm, mã trùng, giữ dữ liệu form, focus lỗi, mobile và bàn phím. |
| Lint và format                 | Cả hai lệnh exit 0 sau sửa cấu hình ESLint và xuống dòng CSS.                                  |
| `npm run handoff`              | Exit 0, tạo đủ 8 gói trong `artifacts/handoffs/`.                                              |

## Hiệu năng tìm kiếm

- Windows 10.0.26200 x64, Intel Core i7-9750H CPU 2.60 GHz, Node 24.19.0.
- DB tạm 10.000 sách; 7 query gồm rỗng, mã khớp nhiều/ít, tiếng Việt NFC/NFD, `%` và không có kết quả.
- 14 request làm nóng, 140 request đo, concurrency 1 qua HTTP loopback.
- p95 tổng hợp **24,01 ms**, tối đa **34,80 ms**; p95 cao nhất theo query **27,00 ms**, dưới 2 giây trong phạm vi phép đo.
- Đo cả truy vấn, SSR và đọc toàn bộ HTML; chưa đo mạng ngoài, nhiều người đồng thời hoặc thời gian render trình duyệt. JSON thô lưu cục bộ tại `artifacts/search-benchmark.json`.

## Kiểm tra môi trường sạch qua CI

Chờ chạy workflow của bản tích hợp trên GitHub Actions Windows và Ubuntu. Kết quả
và liên kết run sẽ được cập nhật sau khi quan sát trạng thái thực tế.

## Kết quả ban đầu tại `990e7d9` trước tích hợp

| Bước                                          | Kết quả thực tế                                                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                                      | Thành công.                                                                                                                           |
| `npm run db:migrate` hai lần                  | Cả hai lệnh thành công; bảng `schema_migrations` có một dòng cho `001_books.sql`.                                                     |
| `npm run db:seed`                             | Thất bại ngay lần đầu: thiếu `src/repositories/bookRepository.js`, được import gián tiếp từ `bookService.js`. Chưa chạy seed lần hai. |
| `npm run db:audit`                            | Trả `ok: true` trên DB tạm có 0 sách. Kết quả này chưa chứng minh tính đúng đắn của tồn kho với dữ liệu sách.                         |
| `npm start`                                   | Thất bại: `ERR_MODULE_NOT_FOUND` cho `src/routes/books.js`, được import từ `src/app.js`.                                              |
| `npm run lint`                                | Thành công.                                                                                                                           |
| `npm run format:check`                        | Thành công trên bản được kiểm tra.                                                                                                    |
| `npm test`                                    | Exit 0 nhưng báo **0 tests**, không phải bằng chứng kiểm thử đạt.                                                                     |
| `npm run test:smoke`                          | Thất bại vì server không khởi động được do thiếu route sách.                                                                          |
| `npm run test:e2e`                            | Thất bại với `Error: No tests found`.                                                                                                 |
| Danh sách, thêm, sửa, tìm, xóa mềm và restart | Chưa kiểm tra được vì ứng dụng không khởi động.                                                                                       |

Ở lần chạy đầu, các nhánh UI/CRUD/test chưa nằm trên `main`. Các lỗi thiếu file và
thiếu test nêu trong bảng trên đã được xử lý ở bản tích hợp; bảng được giữ để có
lịch sử tái hiện và đối chiếu.

Phiếu chạy trên máy khác và review của người được phân công vẫn cần kết quả thực tế của họ; lần chạy này không thay thế các xác nhận đó.
