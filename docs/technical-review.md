# S1-10 · Review kỹ thuật Sprint 1

**Hoàn tất review bởi Codex ngày 13/11/2026**, theo yêu cầu người dùng giao thực hiện
hết công việc. Đạt là người được phân công ban đầu; đây là kết quả review của Codex.

Bản nguồn được review: `0b258455e94d4abc413cfb3467e5aa3b78cdc50f`.
Các commit bổ sung tài liệu và bằng chứng sau bản này không thay đổi nguồn ứng dụng.

## Checklist đã đối chiếu

| Luồng                    | Điểm đọc                                                  | Kết quả và bằng chứng                                                                                                    |
| ------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Cài và chạy              | `package.json`, `.npmrc`, README, connection/migrate/seed | Node 24 ESM; SQLite local; migration/seed lặp an toàn; AC-01/02/03, DB-01/02 đạt                                         |
| Danh mục                 | route/controller, `books/index.ejs`, CSS và partials      | Đọc sách active từ DB, có thêm/sửa/xóa/tìm/phân trang; UI-01, E2E-01/03 đạt                                              |
| Thêm sách                | `bookSchemas.js`, `createBook.js`, `bookRepository.js`    | Thiếu mã/tên, mã trùng cả inactive, năm/tổng sai bị từ chối; field số còn không được nhận; BK-01/02 và AC-04/05 đạt      |
| Sửa và tồn kho           | `updateBook.js`, `inventoryRepository.js`                 | `BEGIN IMMEDIATE`, đếm lượt chưa trả trong transaction, không giảm dưới số đang mượn; BK-03/BK-03B và rollback TX-01 đạt |
| Xóa mềm                  | `archiveBook.js`, controller và `archive.ejs`             | GET không ghi, POST cần xác nhận, giữ row và mã duy nhất, chặn khi có mượn; BK-04/06, AC-08/09/11 đạt                    |
| Tìm kiếm Việt            | `normalize.js`, `bookSearchRepository.js`                 | NFC/lower tiếng Việt ở ghi/query, bind SQL, `instr()` tìm ký tự thường; BK-05/05B và AC-06 đạt                           |
| Restart và audit         | `server.js`, `stockAudit.js`, smoke và acceptance         | Dữ liệu bền sau restart; audit chỉ đọc, lỗi tồn kho chặn startup; DB-01/AUD-01 và AC-10/12 đạt                           |
| Lỗi ngoài dự kiến        | `errorHandler.js`, test HTTP-02/03                        | Lỗi DB trả 500 chung, có log server, không lộ SQL; transaction rollback. Form lớn trả 413, DB không đổi                  |
| Hiển thị và dữ liệu nhập | EJS escaping, validator, headers, `forms.js`              | Escape dữ liệu người dùng; focus vùng lỗi; không có input số còn; SEC-S1, HTTP-01, E2E-02 đạt                            |
| Bằng chứng               | integration, smoke, acceptance, E2E, CI                   | Local và hai runner Windows/Ubuntu: 21 integration, 12 acceptance, 3 E2E, smoke/lint/format đạt; CI 43368764046 success  |

## Phản hồi theo phạm vi người sở hữu ban đầu

Các phản hồi đã ghi vào repo; Codex xử lý theo yêu cầu làm hết, không giao lại phần
triển khai hoặc giữ lỗi chờ thành viên khác.

| Mã   | Phát hiện                                                      | Phạm vi ban đầu        | Xử lý / kiểm tra lại                                                                   |
| ---- | -------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| R-01 | `main` thiếu module, không khởi động/seed được                 | Sơn, Khánh, Tiến, Minh | Ghép ba nhánh, khôi phục search và partial; smoke, AC-01–12 và E2E đạt                 |
| R-02 | `npm test` từng báo exit 0 với 0 tests                         | Huy/Sơn                | Runner từ chối khi thiếu file test; kiểm tra thư mục rỗng trả lỗi; hiện 21 bài đạt     |
| R-03 | Windows checkout CSS CRLF làm Prettier thất bại                | Khánh/Sơn              | `.gitattributes` pin CSS LF; lint/format và CI bản tích hợp đạt                        |
| R-04 | ESLint đọc các bản sao trong handoff                           | Sơn                    | Ignore `artifacts/**`; xuất handoff rồi lint đạt                                       |
| R-05 | Chưa có ca HTTP kiểm tra lỗi DB 500 và form 413                | Huy/Sơn                | Thêm HTTP-02/03, xác minh rollback, log và phản hồi không lộ SQL; cả hai đạt           |
| R-06 | Phiếu máy khác chỉ có ô trống, thiếu quy trình tái chạy đầy đủ | Dương/Sơn              | Thêm `test:acceptance`, báo cáo 12 bước và artifact trên từng OS; liên kết trong S1-09 |
| R-07 | Dùng lại DEMO01 sau xóa mềm khiến demo lặp bị trùng mã         | Sơn/Huy                | README hướng dẫn chọn mã chưa dùng; nghiệm thu tự dùng DB tạm mỗi lần                  |

## Kết luận

**Đạt review kỹ thuật trong phạm vi Sprint 1; không phát hiện lỗi chặn demo còn mở.**
Các hợp đồng dữ liệu/HTTP được giữ ổn định. Điểm nối bảng mượn chỉ kiểm tra bằng
fixture, không phát hành tính năng mượn của Sprint 2. App chạy local; xác thực/phân
quyền và triển khai công khai thuộc sprint sau.

Kết quả không khẳng định đã hoàn thành trước 09/11 hoặc buổi báo cáo 10/11 đã diễn
ra. Ngày hoàn tất thực tế và bản chốt ghi trong báo cáo tổng hợp.
