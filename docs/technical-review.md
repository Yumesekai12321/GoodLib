# S1-10 · Nguyễn Trọng Đạt · Review kỹ thuật

**Trạng thái: CHỜ ĐẠT REVIEW.** Checklist được chuẩn bị để review ngắn và gửi
phản hồi cho chủ sở hữu. Đây không phải phê duyệt hay kết quả review của Đạt.
Đạt không gánh phần triển khai; người sở hữu tự sửa lỗi được phản hồi.

Commit được review: **Chưa ghi**. Ngày giờ / người xác nhận: **Chưa ghi**.

| Luồng / điểm đọc           | File/hàm                                          | Cần xác minh                                                     | Kết quả / chủ sở hữu               |
| -------------------------- | ------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------- |
| Cài từ đầu, migration/seed | README, connection, migrate, demo seed            | Node24; file SQLite local; ledger; seed không ghi đè             | Chờ review / Sơn                   |
| Danh mục                   | `books/index.ejs`, CSS, partials                  | Đọc DB; chỉ active; nút/nhãn/focus; mobile/empty                 | Chờ review / Khánh                 |
| Thêm sách                  | `createBook`, `bookSchema`, controller/repository | Thiếu mã/tên, trùng mã inactive, năm/tổng sai; không nhận số còn | Chờ review / Tiến                  |
| Sửa tổng                   | `updateBook`, `openLoanCount`                     | BEGIN IMMEDIATE; tổng ≥ open loans; số còn = tổng − chưa trả     | Chờ review / Tiến, Sơn giữ adapter |
| Xóa mềm                    | `archiveBook`, `archive.ejs`                      | Có xác nhận; inactive; không xóa row; chặn khi có mượn           | Chờ review / Tiến                  |
| Tìm kiếm                   | normalize + search repository                     | NFC/lower Việt; chứa mã/tên; query SQL bind; giữ dấu             | Chờ review / Minh                  |
| Lỗi và dữ liệu sau restart | server, errorHandler, stockAudit, smoke           | 400/404/409/422/500; không lộ SQL; audit chỉ đọc; dữ liệu bền    | Chờ review / Sơn                   |
| Bằng chứng test            | integration/e2e, `test-cases.md`                  | Negative/rollback/persistence; báo đúng test đã/chưa chạy        | Chờ review / Huy                   |

## Phản hồi cho từng người

| Mã       | File:dòng / bước tái hiện | Nhận xét / mức độ | Người sửa | Phản hồi / kiểm tra lại |
| -------- | ------------------------- | ----------------- | --------- | ----------------------- |
| Chưa ghi | —                         | —                 | —         | —                       |

Kết luận: **Chờ review**, chưa phê duyệt merge/chốt bản chạy. Gửi Hoàng và chủ sở
hữu trước khi chốt tối 09/11; Hoàng quyết định bản nghiệm thu sau khi lỗi được xử lý.
