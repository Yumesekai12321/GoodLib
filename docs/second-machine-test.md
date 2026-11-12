# S1-09 · Nguyễn Nam Dương · Chạy trên máy khác

**Trạng thái: CHƯA CHẠY TRÊN MÁY KHÁC.** Đây là phiếu bàn giao, không phải bằng
chứng Dương đã hoàn thành. Dương chạy theo README trên máy khác, điền kết quả thật,
commit phiếu này và gửi Hoàng **trước khi chốt 09/11/2026**.
Ngày **10/11 Dương không có nhiệm vụ mới**; Hoàng nghiệm thu lúc 06:45.

| Thông tin                        | Kết quả Dương điền |
| -------------------------------- | ------------------ |
| Ngày giờ Việt Nam                | Chưa ghi           |
| Người chạy                       | Nguyễn Nam Dương   |
| Commit (`git rev-parse HEAD`)    | Chưa ghi           |
| Hệ điều hành / máy khác          | Chưa ghi           |
| Node / npm (`node -v`, `npm -v`) | Chưa ghi           |
| Trình duyệt / phiên bản          | Chưa ghi           |

| Bước / đầu vào                                    | Mong đợi                                  | Thực tế   | Pass/Fail     |
| ------------------------------------------------- | ----------------------------------------- | --------- | ------------- |
| Clone repo, `npm ci`, sao chép `.env` theo README | Cài được trên Node 24                     | Chưa chạy | Chưa đánh giá |
| `npm run db:migrate` hai lần                      | Không lỗi, không tạo lặp bảng/mất dữ liệu | Chưa chạy | Chưa đánh giá |
| `npm run db:seed` hai lần                         | Chỉ 6 sách mẫu, không trùng               | Chưa chạy | Chưa đánh giá |
| `npm start`, mở `/books`                          | Có dữ liệu SQLite, nút và tìm kiếm        | Chưa chạy | Chưa đánh giá |
| Thêm `MAY2`, tên tiếng Việt, tổng 3               | Lưu; số còn 3                             | Chưa chạy | Chưa đánh giá |
| Thêm lại `may2`; thiếu mã/tên; tổng âm/lẻ         | Bị từ chối, không có bản ghi phụ          | Chưa chạy | Chưa đánh giá |
| Tìm hoa/thường tiếng Việt theo mã/tên             | Kết quả đúng, giữ dấu                     | Chưa chạy | Chưa đánh giá |
| Sửa tổng 3→5                                      | Tổng 5, số còn 5                          | Chưa chạy | Chưa đánh giá |
| Xóa mềm: Hủy, rồi xác nhận                        | Hủy giữ sách; xác nhận ẩn sách            | Chưa chạy | Chưa đánh giá |
| Dừng/mở lại app                                   | Giữ dữ liệu, sách đã ẩn không xuất hiện   | Chưa chạy | Chưa đánh giá |
| `npm run db:audit`                                | `ok: true`, exit code 0                   | Chưa chạy | Chưa đánh giá |
| lint, format:check, test, test:smoke, test:e2e    | Tất cả thành công                         | Chưa chạy | Chưa đánh giá |

## Lỗi gửi cho Hoàng và người sở hữu

| Mã lỗi   | Commit / bước tái hiện / đầu vào | Mong đợi | Thực tế / ảnh / log | Mức độ | Người sửa | Kết quả kiểm tra lại |
| -------- | -------------------------------- | -------- | ------------------- | ------ | --------- | -------------------- |
| Chưa ghi | —                                | —        | —                   | —      | —         | —                    |

Chủ sở hữu: nền tảng/khởi động/tích hợp → Sơn; UI danh sách → Khánh; form/CRUD/tồn
kho/xóa mềm → Tiến; tìm kiếm Unicode → Minh; test → Huy. Hoàng theo dõi việc chốt.
Không xóa DB để che lỗi persistence; giữ dữ liệu/log và nêu rõ cách tái hiện.

Kết luận / thời điểm gửi Hoàng: **Chưa xác nhận**.
