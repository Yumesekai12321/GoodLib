# S1-07 / S1-08 · Test case và kết quả thực tế

## Lần tích hợp và kiểm tra lại ngày 13/11/2026

Codex đã tích hợp ba nhánh giao diện/CRUD/test và khôi phục phần tìm kiếm từ lịch
sử Git. Trên Windows, Node 24.19.0, npm 11.17.0: **19 integration tests và 3 E2E
đều đạt**, smoke kiểm tra tiến trình thật sau restart đạt. Đã xem ảnh desktop,
form và mobile do Playwright tạo. Migration hai lần giữ một ledger; seed hai lần
cho kết quả thêm 6 rồi 0 sách, audit sạch trên 6 sách.

`npm test` đã có chốt từ chối báo thành công khi không có file test. Đã kiểm tra
nhánh lỗi này trên bản sao runner với thư mục test rỗng.

Benchmark tìm kiếm: 10.000 sách, 7 query, 140 request sau 14 warmup, concurrency 1;
p95 HTTP tổng hợp **24,01 ms**, p95 cao nhất theo query **27 ms** trên Intel
Core i7-9750H, Windows 10.0.26200. Không suy rộng thành kết quả mạng ngoài hoặc
render trình duyệt. Chi tiết bản chốt và CI tại
[báo cáo nghiệm thu](sprint-1-acceptance-2026-11-13.md).

## Kết quả lịch sử ngày 08/11/2026

Người sở hữu test: **Đàm Quang Huy**. Tích hợp/khởi động: **Nguyễn Văn Sơn**.
Các test được chạy bằng công cụ tại workspace ngày **08/11/2026**; đây không phải
chữ ký xác nhận Huy, Sơn, Dương hoặc Đạt đã tự chạy.

Môi trường: Windows 11 Home Single Language 64-bit, Node **v24.19.0**, npm **11.17.0**,
SQLite qua better-sqlite3 **13.0.3**, Chromium do Playwright **1.65.0** cài.
Test integration/E2E/smoke dùng file SQLite tạm, tách khỏi dữ liệu demo của app.

## Đầu vào → mong đợi → thực tế

| ID      | Đầu vào / thao tác                                                                                                                      | Kết quả mong đợi                                                              | Kết quả thực tế                                            | Pass/Fail |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- | --------- |
| BK-01   | Thêm `bk001`, tên Việt, tổng 3                                                                                                          | 303; mã BK001, tổng/còn 3, hiển thị ở danh sách                               | Đúng DB và HTTP, thông báo thêm thành công                 | Pass      |
| BK-02A  | Thêm `bk001` khi BK001 đã có                                                                                                            | 409, không chèn thêm, giữ tên vừa nhập                                        | 1 bản ghi, báo mã trùng, giữ tên                           | Pass      |
| BK-02B  | Thiếu mã/tên; mã có dấu/khoảng trắng; tên quá 200; tổng âm/lẻ/rỗng/chữ/số mũ/quá giới hạn; năm âm/lẻ/chữ/quá 9999; gửi số còn/is_active | 422, không chèn dữ liệu                                                       | Tất cả bị từ chối; DB trống                                | Pass      |
| BK-02C  | Tổng 0, năm 0 hoặc rỗng                                                                                                                 | Lưu được; số còn 0; năm rỗng NULL                                             | Đúng giá trị SQLite                                        | Pass      |
| SEC-S1  | Tên `<script>alert(1)</script>`; mở form sửa                                                                                            | Escape tên; không có input số còn                                             | Có `&lt;script&gt;`, không có script thực thi/input số còn | Pass      |
| BK-03A  | Sửa mã/tên/tác giả/thể loại/năm; tổng 3→7, không có mượn                                                                                | Metadata đổi; tổng/còn 7                                                      | Đúng; audit sạch                                           | Pass      |
| BK-03   | Fixture có 2 lượt chưa trả, 1 đã trả; tổng 3→1 rồi →2                                                                                   | Lần đầu 409 không đổi dữ liệu; lần sau tổng 2/còn 0                           | Đúng toàn bộ bản ghi và số còn                             | Pass      |
| BK-03B  | Sửa mã trùng, tên rỗng, tổng âm, hoặc gửi số còn                                                                                        | 409/422; dữ liệu giữ nguyên                                                   | Không có thay đổi một phần                                 | Pass      |
| BK-04   | Xóa sách đang có lượt chưa trả; sau đó fixture trả sách và thử lại                                                                      | Chặn lần đầu; cho phép sau trả; giữ lịch sử                                   | 409 rồi 303; dòng loans vẫn còn                            | Pass      |
| BK-06   | Xem trang xác nhận, POST chưa xác nhận, xác nhận xóa, sửa/thêm lại mã                                                                   | GET không đổi; thiếu xác nhận 422; xóa đặt inactive/ẩn; sửa 404; mã vẫn trùng | Đúng; row vẫn có, `is_active=0`                            | Pass      |
| TX-01   | Trigger test cố tình gây lỗi lúc update tổng/metadata                                                                                   | Rollback toàn bộ                                                              | Bản ghi bằng trước khi sửa; audit sạch                     | Pass      |
| BK-05   | Tên `ĐẤT RỪNG PHƯƠNG NAM`, query `đất rừng`, chữ hoa/thường trộn, Unicode NFD, mã hoa/thường                                            | Có kết quả; query không dấu không bắt buộc khớp                               | Tất cả biến thể có dấu khớp; `dat rung` không khớp         | Pass      |
| BK-05B  | Từ chỉ có trong tác giả/thể loại; `%`, `_`, chuỗi SQL injection                                                                         | Không khớp lan rộng; không thực thi SQL                                       | Empty state đúng, không lỗi dữ liệu                        | Pass      |
| UI-01   | 12 sách, trang 1/999; page âm/0/lẻ/quá lớn; query lặp/quá dài; ID lỗi/không tồn tại                                                     | 10+2 dòng, clamp trang; 400/404 phù hợp                                       | Đúng phân trang và mã HTTP                                 | Pass      |
| DB-01   | Chạy migration nhiều lần, sửa/xóa, đóng và mở lại kết nối/app                                                                           | 1 ledger; dữ liệu và trạng thái ẩn giữ nguyên                                 | Đúng bản ghi/số còn sau mở lại                             | Pass      |
| DB-02   | Seed 2 lần, sửa/xóa mềm một mẫu trước lần hai                                                                                           | Chỉ 6 bản ghi, không ghi đè                                                   | Lần đầu thêm 6, lần sau thêm 0, giữ chỉnh sửa              | Pass      |
| AUD-01  | Audit DB sạch rồi cố tình đặt số còn 1 thay vì 3 trong DB test                                                                          | CLI 0 rồi 1; báo expected=3; không sửa dữ liệu                                | Đúng exit code/báo cáo; vẫn còn giá trị sai 1              | Pass      |
| DB-03   | Ghi SQL trực tiếp: tổng âm/lẻ, còn âm/vượt tổng, năm quá giới hạn, is_active=2                                                          | CHECK/STRICT từ chối, không phá tồn kho                                       | Các lệnh đều bị chặn; audit sạch                           | Pass      |
| HTTP-01 | POST có Origin khác host                                                                                                                | 403, không ghi dữ liệu                                                        | DB giữ trống                                               | Pass      |
| SMOKE   | Tiến trình app thật: DB mới, thêm 2 sách, sửa tổng 5, xóa mềm 1 sách, dừng/mở lại                                                       | HTTP đúng; total/còn 5; sách ẩn vẫn tồn tại inactive                          | Script báo `SMOKE PASS`, đọc lại DB đúng                   | Pass      |
| E2E-01  | Trình duyệt thêm → tìm Việt → sửa tổng → Hủy xóa → xác nhận xóa → reload                                                                | Toàn bộ luồng chạy, tổng/còn 3→5, sách ẩn sau xóa                             | Trình duyệt xác nhận từng bước                             | Pass      |
| E2E-02  | Mã VN001 trùng; tên vừa nhập                                                                                                            | Inline error; giữ tên; focus vùng báo lỗi                                     | Đúng thông báo, giá trị và focus                           | Pass      |
| E2E-03  | Viewport 390×844; dùng bàn phím tìm không có kết quả rồi về tất cả                                                                      | Không tràn toàn trang; bảng cuộn; empty state và Enter hoạt động              | Các assertion trình duyệt đúng                             | Pass      |

## Lệnh đã chạy và bằng chứng

Đã kiểm tra lại **từ cài mới**: `npm ci` (sau cấu hình `.npmrc`) cài 171 packages,
exit 0. Sau đó lint, `format:check`, 19 integration tests, smoke, 3 E2E và
`npm audit` đều thành công. `format:check` báo tất cả file được hỗ trợ đúng định dạng.

| Lệnh                              | Kết quả đã quan sát                                                           |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `npm install` với lockfile        | Cài được native better-sqlite3 trên Node 24; `npm audit` sạch sau pin công cụ |
| `npm run lint`                    | Exit 0                                                                        |
| `npm test`                        | **19 passed, 0 failed**                                                       |
| `npm run test:smoke`              | Exit 0, `SMOKE PASS` sau dừng/mở lại tiến trình                               |
| `npx playwright install chromium` | Cài được Chromium cho Playwright                                              |
| `npm run test:e2e`                | **3 passed, 0 failed**, gồm desktop/mobile                                    |

Ảnh kiểm tra giao diện được tạo ở `artifacts/books-desktop.png`, `books-form.png`,
`books-mobile.png`; đã xem ảnh desktop/form/mobile. Artifacts và DB không được commit.

## Lỗi đã tìm và sửa trong kiểm thử

Lượt cài mới ban đầu thất bại vì npm 11.17.0 gọi `node-gyp rebuild` dù
better-sqlite3 13 kèm binary; máy thiếu Windows SDK. Đã thêm `.npmrc` bỏ dependency
install hooks, giữ binary của package. Cài mới và toàn bộ check sau đó đều pass.

| Lỗi                                                            | Cách sửa                                               | Kiểm tra lại              |
| -------------------------------------------------------------- | ------------------------------------------------------ | ------------------------- |
| Lint chưa nhận globals của callback trình duyệt trong E2E      | Thêm browser globals đúng phạm vi file E2E             | Lint exit 0               |
| Smoke gọi stop hai lần trên Windows và chờ tiến trình đã thoát | Bỏ tham chiếu child trước khi chờ exit; xét signalCode | Smoke exit 0              |
| Test tìm label exact không khớp dấu `*` trong text nhãn        | Dùng role + accessible name của textbox/spinbutton     | E2E 3/3 pass              |
| Advisory minimatch ở dependency của ESLint 10                  | Override minimatch 11.0.5, giữ ESLint 10 còn hỗ trợ    | Lint chạy; npm audit sạch |

## Các xác nhận còn chờ và giới hạn phạm vi

- Dương chạy trên **máy khác**: chờ điền `second-machine-test.md`.
- Đạt review/phê duyệt: chờ `technical-review.md`.
- CI GitHub Windows/Ubuntu: đã success tại `aa9f868`, [run 43366981541](https://github.com/Yumesekai12321/GoodLib/actions/runs/43366981541), ngày 13/11/2026.
- Yêu cầu tìm dưới 2 giây: đã có benchmark ngày 13/11 với phạm vi và môi trường nêu trên.
- Tính năng Sprint 2 trở đi: chỉ kiểm tra điểm nối bằng fixture; chưa triển khai.
