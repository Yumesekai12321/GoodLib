# Phân công Sprint 1 và cách đóng góp

## Thực hiện theo ủy quyền ngày 13/11/2026

Người dùng đã giao Codex hoàn tất toàn bộ đầu việc Sprint 1, gồm kiểm tra trên
máy độc lập, review và lập báo cáo. Bảng phân công bên dưới là phân công ban đầu;
các phần được Codex hoàn thiện ghi Codex là người thực hiện. Kết quả không còn
giữ điều kiện chờ từng thành viên xác nhận; xem [bảng chốt](sprint-1-plan.md) và
[quyết định S1-D14](decisions.md). Giữ nguyên lịch sử/tác giả các commit đã có.

## Phân công ban đầu

Nguồn phân công: gói `01-hoang.zip`. Cập nhật ngày **09/11/2026**, giờ Việt Nam.
Có 8 người; Tiến nhận S1-04/S1-05, Sơn nhận S1-02/S1-08. Bản triển khai có trợ giúp
bằng AI; mỗi người đọc, kiểm tra và chịu trách nhiệm phần mình trước khi commit.
Phân công dưới đây không phải bằng chứng tác giả của những commit đã có.

## Phần việc và file phụ trách

| WBS   | Người phụ trách  | File và trách nhiệm chính                                                                                                                                                                                            |
| ----- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1-01 | Đinh Huy Hoàng   | `AGENTS.md`, `initial (1).md`, `docs/decisions.md`, `docs/contracts.md`, `docs/sprint-1-plan.md`, `docs/contributions.md`, `docs/handoff-map.json`: chốt phạm vi, dữ liệu, hợp đồng, tiêu chí và theo dõi nghiệm thu |
| S1-02 | Nguyễn Văn Sơn   | Cấu hình npm/Node, `README.md`, `src/config`, `src/db`, `db`, script migration/audit, `inventoryRepository.js`, `stockAudit.js`: môi trường, schema, seed và cách chạy                                               |
| S1-03 | Hà Quốc Khánh    | `src/views/books/index.ejs`, partial header/footer/flash, `src/public`: danh sách sách, nút thao tác, responsive và trạng thái rỗng                                                                                  |
| S1-04 | Nguyễn Ngọc Tiến | `createBook.js`, validator, `bookRepository.js`, controller/route, `errors.js`, form và formField: thêm sách, validation và giữ dữ liệu khi lỗi                                                                      |
| S1-05 | Nguyễn Ngọc Tiến | `updateBook.js`, `archiveBook.js`, `archive.ejs` và file chung S1-04: sửa tổng trong transaction, tính số còn và xác nhận xóa mềm                                                                                    |
| S1-06 | Bùi Quang Minh   | `normalize.js`, `bookSearchRepository.js`, `search.ejs`: tìm chứa mã/tên, chuẩn hóa tiếng Việt NFC và chữ thường                                                                                                     |
| S1-07 | Đàm Quang Huy    | `tests`, `playwright.config.js`, `docs/test-cases.md`: kiểm thử CRUD, tìm kiếm, dữ liệu lỗi, persistence và demo                                                                                                     |
| S1-08 | Nguyễn Văn Sơn   | `src/app.js`, `src/server.js`, `bookService.js`, middleware/trang lỗi, `scripts/smoke.js`, `.github`, README: ghép chức năng, khởi động lại và CI                                                                    |
| S1-09 | Nguyễn Nam Dương | `docs/second-machine-test.md`: điền phiếu kết quả thật từ máy khác, môi trường, commit thử, lỗi và bước tái hiện                                                                                                     |
| S1-10 | Nguyễn Trọng Đạt | `docs/technical-review.md`: điền phiếu review thật, file/dòng, vấn đề và người cần sửa                                                                                                                               |

`docs/handoff-map.json` giữ danh mục đường dẫn tương đối theo người nhận.
Danh mục mô tả phạm vi bàn giao theo phân công gốc; báo cáo S1-09/S1-10 hiện do Codex thực hiện theo ủy quyền mới.
Chạy `npm run handoff` để xuất tám gói theo danh mục vào `artifacts/handoffs/`.
Mỗi gói riêng chỉ là một phần dự án, cần clone đầy đủ để chạy ứng dụng.

Các file controller/repository/route chung của S1-04/S1-05 do cùng Tiến giữ.
`bookService.js` do Sơn ghép các hàm của Tiến và Minh. Đồng bộ trước khi sửa file
chung để tránh ghi đè phần người khác.

## Trạng thái GitHub hiện tại

Repo [Yumesekai12321/GoodLib](https://github.com/Yumesekai12321/GoodLib) đã có
nhánh mặc định `main`. Mốc đối chiếu trước phần Hoàng là **`68ad1c2`**, commit
`Initialize GoodLib Sprint 1 implementation`, tác giả Git ghi `Yumesekai12321`.
Code Sprint 1 đã có; không còn là workspace chưa có commit/remote.

Vì vậy, chép lại file giống hệt sẽ không tạo thay đổi mới. Mỗi người có thể kiểm
tra, sửa lỗi, cải thiện phần phụ trách hoặc bổ sung kết quả test/review có nội dung
rồi tự commit bằng danh tính của mình. Giữ nguyên lịch sử và tác giả hiện có.

Phần Hoàng bổ sung kế hoạch/phân công, khôi phục bảng WBS trong đặc tả bàn giao và
đối chiếu hợp đồng với repo. Không đưa `HANDOFF.md`/`handoff.md`, file ZIP hoặc thư
mục bàn giao vào commit. Chỉ stage đúng những file nguồn thuộc phần phụ trách.

## Tự commit và push

Ví dụ sau dành cho **Hoàng**; người khác thay danh tính và danh sách file theo
phần của mình. Kiểm tra `git status` trước khi bắt đầu; nếu có thay đổi chưa lưu,
xử lý hoặc cất thay đổi trước khi cập nhật nhánh. Không ghi đè file đang làm.

```powershell
git switch main
git pull --ff-only origin main
git switch -c docs/s1-01-contracts-and-plan
git config --local user.name "HOANGHORSE"
git config --local user.email "210015665+HOANGHORSE@users.noreply.github.com"
# Chép/chỉnh các file phần Hoàng vào đúng đường dẫn rồi kiểm tra.
git add AGENTS.md "initial (1).md" docs/decisions.md docs/contracts.md docs/sprint-1-plan.md docs/contributions.md docs/handoff-map.json
git diff --cached --stat
git diff --cached
git commit -m "docs(S1-01): define book contracts and sprint acceptance gates"
git push -u origin docs/s1-01-contracts-and-plan
```

Mở PR để nhóm review và ghép vào `main`. Không chạy lại ví dụ nếu các thay đổi
đã có trên `main`; sau khi đồng bộ, tiếp tục bằng thay đổi có nội dung mới.
Tên/email của người khác phải lấy từ chính người đó; không đặt danh tính thay họ.

## Ghi nhận Contributors

GitHub ghi nhận qua commit và email tác giả liên kết với tài khoản. Commit cần
được ghép vào nhánh mặc định; chỉ push lên nhánh riêng chưa đủ. Xem hướng dẫn
[Viewing a project's contributors](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-a-projects-contributors).

Chỉ dùng `Co-authored-by` khi có đóng góp cùng làm thực tế và người đó đồng ý;
xem [Creating a commit with multiple authors](https://docs.github.com/en/pull-requests/how-tos/commit-changes/creating-a-commit-with-multiple-authors).
Không tạo commit rỗng, đổi tác giả commit cũ hoặc thêm tên không có đóng góp.

Sau khi ghép, kiểm tra tác giả và **Insights → Contributors**. GitHub có thể cần
thời gian cập nhật biểu đồ; tách việc đã có commit khỏi việc biểu đồ đã hiển thị.

```powershell
git shortlog -sne main
git log --format="%h %an <%ae> %s" main
```

## Tiêu đề PR đề xuất

- Hoàng: `docs(S1-01): define book contracts and sprint acceptance gates`
- Sơn: `chore(S1-02): bootstrap Express EJS SQLite and demo setup`
- Khánh: `feat(S1-03): render responsive book catalog and shared UI`
- Tiến: `feat(S1-04): create books with server validation`
- Tiến: `feat(S1-05): update stock safely and confirm soft archive`
- Minh: `feat(S1-06): search book code and Vietnamese title`
- Huy: `test(S1-07): verify book CRUD search and data integrity`
- Sơn: `test(S1-08): integrate app and verify process restart`
- Dương: `docs(S1-09): record second-machine verification results`
- Đạt: `docs(S1-10): record technical review and owner feedback`
