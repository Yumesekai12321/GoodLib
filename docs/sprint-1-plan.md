# Sprint 1 · Bảng chốt đầu việc

Người thực hiện và chốt kỹ thuật: **Codex, ngày 13/11/2026**, theo yêu cầu người dùng
làm hết công việc, không giữ bước chờ người được phân công ban đầu. Quyết định
ủy quyền được ghi ở [S1-D14](decisions.md).

## Đối chiếu đầy đủ với danh sách người dùng

| WBS   | Đầu việc                                                                          | Trạng thái thực tế                | Bằng chứng                                                      |
| ----- | --------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------- |
| S1-01 | Chốt mã/tên/tác giả/thể loại/năm/tổng; số còn tự tính; theo dõi kế hoạch          | Đạt nội dung và kế hoạch cập nhật | `contracts.md`, `decisions.md`, schema/validator, bảng này      |
| S1-02 | GitHub; Node/Express/EJS/SQLite; is_active/tổng/số còn; mẫu và README             | Đạt                               | Migration/seed, AC-01–03/12, README, repo `main`                |
| S1-03 | Danh sách từ DB, thêm/sửa/xóa/tìm; form/endpoint thống nhất                       | Đạt                               | Controller/route, UI-01, E2E-01/03, hợp đồng HTTP               |
| S1-04 | Form lưu DB; chặn thiếu mã/tên, trùng, năm/số lượng sai                           | Đạt                               | BK-01/02, AC-04/05, validation server                           |
| S1-05 | Sửa tổng an toàn; số còn không sửa riêng; xóa mềm xác nhận; chuẩn bị chặn có mượn | Đạt                               | BK-03/04/06, TX-01, AC-07–11, adapter loans bằng fixture        |
| S1-06 | Tìm chứa mã/tên, hoa/thường Việt, giữ dấu                                         | Đạt                               | BK-05/05B, AC-06, NFC/lower ở lớp ứng dụng                      |
| S1-07 | Test case đủ đầu vào/mong đợi/thực tế/Pass–Fail; demo đầy đủ                      | Đạt                               | `test-cases.md`, 21 integration tests, 3 E2E, 12 acceptance     |
| S1-08 | Tích hợp, sửa lỗi theo phạm vi, kiểm tra restart, hoàn thiện README               | Đạt                               | Merge các nhánh, smoke, AC-10, không còn lỗi chặn demo          |
| S1-09 | Chạy theo README trên máy khác và ghi kết quả/lỗi                                 | Đạt trên Windows và Ubuntu        | `second-machine-test.md`, CI 43368764046, JSON/Markdown 12 bước |
| S1-10 | Review luồng chính, dữ liệu, cách chạy; phản hồi theo phạm vi                     | Đạt, Codex thực hiện              | `technical-review.md`, 7 phản hồi đã xử lý, không còn lỗi chặn  |

## Definition of Done

- [x] CRUD sách và tìm kiếm chạy được, source/test/README đã ghép vào `main`.
- [x] Ca bắt buộc: thêm/sửa/xóa mềm, mã trùng, dữ liệu sai, tồn kho, tìm Việt, rollback và persistence đạt.
- [x] Trình duyệt desktop/mobile, xử lý lỗi form và demo thêm → tìm → sửa → xóa → mở lại đạt.
- [x] Kiểm tra 12 bước từ checkout sạch trên máy Windows và Ubuntu độc lập: [CI 43368764046](https://github.com/Yumesekai12321/GoodLib/actions/runs/43368764046) success trên cả hai máy tại `0b25845`.
- [x] Review kỹ thuật đã có kết quả, lỗi chặn đã xử lý.
- [x] Không còn điều kiện chờ thành viên khác theo ủy quyền mới của người dùng.

## Ngày kế hoạch và ngày thực tế

Mốc chốt schema/route trước 31/10, ghép bản thêm trước 04/11, hoàn tất tối 09/11
và báo cáo cô **06:45 ngày 10/11/2026** là lịch gốc. Bảng này chốt kết quả kiểm tra
thực tế ngày **13/11/2026**, không xác nhận các mốc đã qua đã được đáp ứng đúng hạn.
Nội dung và kịch bản dùng để báo cáo được chuẩn bị tại [báo cáo Sprint 1](sprint-1-report.md).

Kết quả chi tiết: [kiểm thử](test-cases.md), [máy khác](second-machine-test.md),
[review](technical-review.md), [lịch sử tích hợp](sprint-1-acceptance-2026-11-13.md).
