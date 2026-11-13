# GoodLib · Báo cáo Sprint 1

Ngày chốt kỹ thuật thực tế: **13/11/2026**. Thực hiện: **Codex theo ủy quyền người dùng**.
Lịch báo cáo ban đầu là 06:45 ngày 10/11/2026; tài liệu này cung cấp nội dung báo
cáo, không xác nhận buổi báo cáo với cô đã diễn ra.

## Sản phẩm bàn giao

GoodLib là ứng dụng web tiếng Việt quản lý danh mục sách bằng Node.js 24,
Express/EJS và SQLite. Có danh sách phân trang, thêm/sửa sách, tìm chứa mã/tên
không phân biệt hoa/thường tiếng Việt và xóa mềm có xác nhận. Các field gồm mã,
tên, tác giả, thể loại, năm xuất bản, tổng số cuốn; số còn do hệ thống tính.

Sprint 1 chưa có mượn nên số còn bằng tổng. Server từ chối chỉnh riêng số còn,
chặn dữ liệu không hợp lệ và mã trùng kể cả sách đã ẩn. Sửa tổng/xóa mềm dùng
transaction và có adapter kiểm tra lượt chưa trả để tiếp nối Sprint 2.

## Chất lượng và bằng chứng

Trên máy hiện tại và trên **cả hai runner GitHub Windows/Ubuntu**: 21 integration
tests, 12 bước nghiệm thu, 3 E2E và smoke/lint/format đều đạt. Đã kiểm tra dữ liệu
sau khi dừng rồi khởi động lại; không còn lỗi chặn demo trong phạm vi đã kiểm tra.
Bản nguồn chốt: `0b258455e94d4abc413cfb3467e5aa3b78cdc50f`.
[CI 43368764046](https://github.com/Yumesekai12321/GoodLib/actions/runs/43368764046)
hoàn thành success trên cả hai hệ điều hành. Review kỹ thuật đã hoàn tất.
Chi tiết từng đầu việc ở [bảng chốt](sprint-1-plan.md), kết quả máy độc lập và bản
JSON/Markdown thực tế ở [báo cáo máy khác](second-machine-test.md).

Benchmark đã đo trước đó trên 10.000 sách: p95 HTTP loopback khoảng 24 ms với
concurrency 1; đây là kết quả theo môi trường đã ghi, không suy rộng sang nhiều
người đồng thời hoặc mạng ngoài.

## Kịch bản demo 3–5 phút

1. Theo README: `npm ci`, sao chép cấu hình nếu chưa có, migration, seed rồi `npm start`.
2. Mở `http://127.0.0.1:3000/books`: có 6 mẫu ở DB mới.
3. Thêm một mã chưa từng dùng, tên `ĐƯỜNG ĐẾN THƯ VIỆN`, tổng 3; kiểm tra số còn 3.
4. Tìm `đường đến` để chứng minh tìm tiếng Việt hoa/thường.
5. Sửa tổng thành 5; tổng và số còn cùng là 5.
6. Mở xóa mềm và chọn Hủy; sách vẫn còn. Mở lại và xác nhận; sách ẩn.
7. Dừng bằng Ctrl+C, chạy lại `npm start`; các sách khác còn nguyên, sách đã xóa vẫn ẩn.
8. Chạy `npm run test:acceptance` để tái hiện đầy đủ trên DB tạm và xuất bảng Pass–Fail.

Mỗi lần demo thủ công chọn mã mới vì mã đã xóa mềm vẫn duy nhất. Các test tự tạo
DB riêng; không cần xóa DB thật để demo lại.

## Phạm vi sau Sprint 1

Độc giả, mượn/trả, gia hạn, tài khoản/phân quyền và thống kê dành cho sprint sau.
Bản này dùng cục bộ, không phải cấu hình triển khai công khai.
