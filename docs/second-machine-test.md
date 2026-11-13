# S1-09 · Kiểm tra trên máy khác

Người thực hiện: **Codex**, theo ủy quyền của người dùng ngày **13/11/2026**.
Phân công ban đầu thuộc Dương; lần thực hiện này ghi đúng Codex và các runner
GitHub Actions, không ghi Dương đã chạy hoặc ký thay Dương.

## Môi trường và phiên bản

- Bản nguồn: `0b258455e94d4abc413cfb3467e5aa3b78cdc50f`.
- Máy local: Windows 10.0.26200 x64, Node 24.19.0, 12/12 bước đạt.
- Máy độc lập: GitHub-hosted `windows-latest` và `ubuntu-latest`, checkout sạch,
  `npm ci`, Node 24, SQLite local trên từng runner.
- Workflow: [run 43368764046](https://github.com/Yumesekai12321/GoodLib/actions/runs/43368764046).
- Trạng thái chạy độc lập: **Đạt trên cả hai máy**, checkout sạch tại đúng commit nêu trên.

| Máy độc lập    | Hệ điều hành thực tế       | Node    | Kết quả                                                     |
| -------------- | -------------------------- | ------- | ----------------------------------------------------------- |
| GitHub Windows | win32 10.0.26100 x64       | 24.22.2 | 21 integration, 12 acceptance, 3 E2E; smoke/lint/format đạt |
| GitHub Ubuntu  | linux 7.0.0-1019-azure x64 | 24.22.2 | 21 integration, 12 acceptance, 3 E2E; smoke/lint/format đạt |

Kết quả được tải từ artifact sau khi run thành công, xác minh commit và
`workingTreeDirty: false`, rồi lưu trong repo để tra lại:

- Windows: [bảng đầu vào/mong đợi/thực tế](evidence/sprint-1-win32.md), [JSON](evidence/sprint-1-win32.json).
- Ubuntu: [bảng đầu vào/mong đợi/thực tế](evidence/sprint-1-linux.md), [JSON](evidence/sprint-1-linux.json).
- [Trạng thái CI và hai job](evidence/sprint-1-ci.json).

## Quy trình tái hiện

Theo README, cài Node 24/Git rồi clone repo, chạy `npm ci`, lint/format/test/smoke,
`npm run test:acceptance`, cài Chromium và chạy E2E. Bộ nghiệm thu sao chép
`.env.example` vào thư mục tạm, chạy cùng các entry point migration/seed/server/audit
mà các lệnh npm trong README sử dụng; mọi DB được tạo riêng, không xóa dữ liệu demo.

| ID    | Đầu vào                                                 | Mong đợi                                                |
| ----- | ------------------------------------------------------- | ------------------------------------------------------- |
| AC-01 | Cấu hình mẫu, migration hai lần                         | Một ledger, DB không bị tạo lặp                         |
| AC-02 | Seed hai lần                                            | Thêm 6 rồi 0 sách                                       |
| AC-03 | Khởi động server thật, mở `/books`                      | HTTP 200, đọc SQLite, đủ nút và ô tìm                   |
| AC-04 | Thêm MAY2, tên Việt, tổng 3                             | Đủ thông tin trong DB; tổng/số còn 3                    |
| AC-05 | Mã trùng, thiếu mã/tên, năm sai, tổng âm/lẻ, gửi số còn | 409/422, DB giữ nguyên                                  |
| AC-06 | Query mã/tên hoa/thường Việt, NFC/NFD và `%`            | Khớp đúng, giữ dấu, không mở rộng wildcard              |
| AC-07 | Sửa tổng 3→5                                            | Tổng/số còn 5                                           |
| AC-08 | Mở xác nhận rồi quay lại danh sách                      | Hủy giữ sách active                                     |
| AC-09 | Xóa thiếu xác nhận rồi xác nhận yes                     | 422 trước xác nhận; sau đó inactive, ẩn, không sửa được |
| AC-10 | Dừng rồi khởi động lại tiến trình                       | Giữ 6 mẫu và sách đã ẩn; tổng/số còn vẫn 5              |
| AC-11 | Thêm lại mã đã ẩn; seed lại                             | 409; seed không ghi đè dữ liệu                          |
| AC-12 | Audit 7 row active/inactive                             | `ok: true`; không sửa dữ liệu                           |

JSON và Markdown chứa kết quả thực tế, Pass/Fail của từng bước được tạo trong
`artifacts/acceptance-*.json` và `.md`, đồng thời lưu trong artifact của mỗi job.
E2E riêng kiểm tra thao tác Hủy/xác nhận bằng trình duyệt và giao diện mobile.

## Phản hồi lỗi và xử lý

Các lỗi chặn ban đầu (thiếu module, test không có, định dạng CSS Windows) đã sửa
trước bản nguồn trên. Lần nghiệm thu local mới đạt 12/12; không có lỗi chặn demo
trong các luồng đã kiểm tra. Hai máy độc lập cũng đều đạt đủ 12 bước, không có lỗi
chặn mới. **S1-09 hoàn tất bởi Codex theo ủy quyền người dùng**. Các máy kiểm tra
là runner GitHub-hosted độc lập, không mô tả thành máy cá nhân của thành viên được
phân công ban đầu.

Báo cáo và bằng chứng được bàn giao trong repo theo ủy quyền hoàn tất toàn bộ công việc.
