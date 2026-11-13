# Kết quả chạy nghiệm thu Sprint 1

Ngày UTC: 2026-11-13T04:57:28.566Z

Commit: 0b258455e94d4abc413cfb3467e5aa3b78cdc50f

Môi trường: win32 10.0.26100 x64, Node v24.22.2

Kết quả: **PASS**, 12/12 bước đạt.

| ID    | Đầu vào                                                 | Mong đợi                                         | Thực tế                                                               | Pass/Fail |
| ----- | ------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------- | --------- |
| AC-01 | Cấu hình từ .env.example; migration hai lần             | Một ledger, DB mới không có sách                 | Migration 2 lần thành công; ledger=1, books=0.                        | PASS      |
| AC-02 | Seed hai lần theo README                                | Thêm 6 rồi 0 sách, không trùng                   | Seed thêm 6 rồi 0; tổng 6 sách.                                       | PASS      |
| AC-03 | Khởi động server thật và GET /books                     | HTTP 200, 6 sách, đủ nút và ô tìm                | Server khởi động; HTTP 200; 6 sách và đủ điều khiển.                  | PASS      |
| AC-04 | Thêm MAY2, tên tiếng Việt, tổng 3                       | DB lưu đủ field; tổng/số còn=3                   | MAY2 lưu đủ field; tổng=3, số còn=3.                                  | PASS      |
| AC-05 | Mã trùng; thiếu mã/tên; năm sai; tổng âm/lẻ; gửi số còn | 409/422, không có bản ghi phụ                    | 1 ca mã trùng trả 409; 7 ca dữ liệu sai trả 422; DB giữ nguyên.       | PASS      |
| AC-06 | Tìm mã/tên hoa/thường Việt, NFC/NFD, ký tự %            | Khớp đúng, giữ dấu và tìm % như ký tự thường     | Tìm mã/tên Việt đúng qua 5 query; không bỏ dấu hoặc mở rộng wildcard. | PASS      |
| AC-07 | Sửa tổng MAY2 từ 3 lên 5                                | Tổng/số còn=5 trong DB                           | Lưu tổng=5, số còn=5.                                                 | PASS      |
| AC-08 | Mở xác nhận rồi quay lại danh sách, chưa POST           | Hủy giữ sách active và còn hiển thị              | GET xác nhận không đổi DB; quay lại vẫn thấy MAY2.                    | PASS      |
| AC-09 | POST xóa không xác nhận rồi xác nhận yes                | 422 trước xác nhận; sau đó ẩn, giữ row, chặn sửa | Xác nhận bắt buộc; row inactive vẫn giữ; danh sách ẩn và sửa trả 404. | PASS      |
| AC-10 | Dừng và khởi động lại tiến trình                        | Giữ 6 mẫu và MAY2 inactive, tổng/số còn=5        | Sau restart còn 7 row, 6 active; MAY2 inactive, tổng/số còn=5.        | PASS      |
| AC-11 | Thêm lại mã đã xóa; chạy lại seed                       | Mã vẫn trùng 409; seed không ghi đè dữ liệu      | Mã inactive trả 409; seed thêm 0; giữ nguyên mọi row.                 | PASS      |
| AC-12 | Audit DB có sách active và inactive                     | ok=true, không đổi dữ liệu                       | Audit đạt trên 7 row; không sửa dữ liệu.                              | PASS      |
