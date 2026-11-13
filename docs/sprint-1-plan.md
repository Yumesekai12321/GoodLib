# S1-01 · Kế hoạch theo dõi Sprint 1

## Cập nhật tích hợp ngày 13/11/2026

Codex đã ghép ba nhánh UI/CRUD/test, khôi phục phần tìm kiếm, tài liệu và cấu hình
bàn giao từ lịch sử Git. Trên máy hiện tại đã đạt 19 integration tests, smoke,
3 E2E; đã kiểm tra migration/seed lặp và audit với 6 sách. CSS đã được định dạng
lại. Chi tiết bản chốt, lint/format và CI trong
[báo cáo nghiệm thu](sprint-1-acceptance-2026-11-13.md).

Các mốc bên dưới là kế hoạch và ghi nhận lịch sử; không ghi lùi ngày hoàn thành.
Xác nhận máy khác của Dương, review Đạt và quyết định nghiệm thu của Hoàng vẫn
cần do đúng người phụ trách thực hiện.

## Kế hoạch và ghi nhận ngày 09/11/2026

Người theo dõi xuyên suốt: **Đinh Huy Hoàng**. Ngày cập nhật: 09/11/2026.
Phân công theo thứ tự S1-01 → S1-10 trong gói `01-hoang.zip`.
Mốc đối chiếu GitHub trước phần Hoàng: `main` tại commit `68ad1c2`.

| WBS   | Người phụ trách  | Đầu ra / bằng chứng cần có                                                  |
| ----- | ---------------- | --------------------------------------------------------------------------- |
| S1-01 | Đinh Huy Hoàng   | Chốt dữ liệu/quy tắc, `decisions.md`, tiêu chí chấp nhận, theo dõi kế hoạch |
| S1-02 | Nguyễn Văn Sơn   | Repo, Node/Express/EJS/SQLite, schema, seed, README; hợp đồng trước 31/10   |
| S1-03 | Hà Quốc Khánh    | Danh sách SQLite, nút thêm/sửa/xóa, ô tìm; thống nhất form/route với Sơn    |
| S1-04 | Nguyễn Ngọc Tiến | Thêm sách + validation; bản ghép đầu tiên trước 04/11                       |
| S1-05 | Nguyễn Ngọc Tiến | Sửa tổng an toàn, số còn tự tính, xóa mềm xác nhận                          |
| S1-06 | Bùi Quang Minh   | Tìm mã/tên chứa từ khóa, Unicode hoa/thường tiếng Việt                      |
| S1-07 | Đàm Quang Huy    | Test CRUD/tìm/mã trùng/số âm/xóa mềm, bảng thực tế và demo                  |
| S1-08 | Nguyễn Văn Sơn   | Ghép sớm; 07–09/11 rà tích hợp, phân lỗi đúng người, persistence, README    |
| S1-09 | Nguyễn Nam Dương | Chạy theo README trên máy khác, gửi lỗi/kết quả cho Hoàng trước chốt 09/11  |
| S1-10 | Nguyễn Trọng Đạt | Review kỹ thuật luồng chính/dữ liệu/cách chạy, phản hồi đúng chủ sở hữu     |

## Các mốc

- Trước 31/10: chốt schema và route. Không có log lịch sử để chứng minh đã đạt mốc này.
- Trước 04/11: bàn giao thêm sách đầu tiên, ghép ngay khi chạy được.
- 07–09/11: rà tích hợp, sửa theo chủ sở hữu, kiểm tra sau khởi động, hoàn thiện README.
- Trước tối **09/11/2026**: Hoàng nhận phiếu chạy máy khác từ Dương, nhận review Đạt,
  đối chiếu test/defect còn mở và chốt bản chạy sau khi có review.
- **10/11/2026, 06:45 (giờ Việt Nam)**: Hoàng thay nhóm nghiệm thu, báo cáo với cô.
  **Dương không có nhiệm vụ mới ngày 10/11**.

## Gate nghiệm thu

- [x] Repo tại `68ad1c2` có code danh mục sách, README và test tự động cho phạm vi S1-02 đến S1-08.
- [x] Đã đối chiếu và chuẩn bị tài liệu S1-01 từ gói Hoàng; không đưa `HANDOFF.md` lên repo.
- [ ] Từng người đọc, kiểm tra và nhận phần bàn giao; tạo commit/PR đúng danh tính.
- [ ] Dương điền và gửi `second-machine-test.md` với kết quả từ máy khác.
- [ ] Đạt điền `technical-review.md`, phản hồi cho người sở hữu lỗi.
- [x] CI GitHub Windows/Ubuntu chạy thành công ngày 13/11/2026 tại commit `aa9f868`; [run 43366981541](https://github.com/Yumesekai12321/GoodLib/actions/runs/43366981541) cả hai job đều success. Run cũ `42407972093` đã được thay bằng bằng chứng của bản tích hợp.
- [ ] Hoàng chốt bản chạy trước tối 09/11 sau review, ghi commit/tag được nhóm duyệt.

Các mốc chưa xác nhận giữ trạng thái chờ; không tự đánh dấu xong thay nhóm.
Hai phiếu `second-machine-test.md` và `technical-review.md` hiện đã có;
Dương/Đạt cần điền bằng chứng thực tế. Test tự động không thay thế hai việc này.
Chi tiết bằng chứng test cũ tại `test-cases.md`, phân file tại `contributions.md`.
Lần đối chiếu này không sửa kết quả test lịch sử của Huy.

## Kiểm tra phần Hoàng ngày 09/11/2026

Chạy trên Windows với Node **v24.22.2**, bản `68ad1c2` cộng 7 file tài liệu S1-01.
Các test dùng SQLite tạm, không thay dữ liệu ứng dụng.

| Kiểm tra                                   | Kết quả quan sát                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `npm ci`                                   | Exit 0, cài 171 packages                                                                                     |
| `npm run lint`                             | Exit 0                                                                                                       |
| `npm test`                                 | 19 passed, 0 failed                                                                                          |
| `npm run test:smoke`                       | Exit 0, `SMOKE PASS`                                                                                         |
| `npm run test:e2e`                         | 3 passed, 0 failed sau khi cài Chromium                                                                      |
| Prettier trên 6 file S1-01 không bị ignore | Pass; `initial (1).md` được repo bỏ qua theo `.prettierignore`                                               |
| `npm run format:check` toàn repo           | Fail ở `src/public/css/app.css`, `src/public/css/tokens.css`; đây là file có sẵn, không sửa trong phần Hoàng |
| `git diff --check`                         | Pass                                                                                                         |

Lỗi định dạng hai file CSS trùng với run CI cũ trên Windows. Sơn/Khánh cần xử lý
trong phần tích hợp/giao diện, rồi chạy CI lại; chưa đánh dấu gate CI hoàn tất.
