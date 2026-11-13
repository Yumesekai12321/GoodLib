# S1-01 · Quyết định và phạm vi

Nguồn: `initial (1).md` và phân công S1-01 → S1-10 trong gói bàn giao
`01-hoang.zip`. Đối chiếu repo GoodLib ngày **09/11/2026**, giờ Việt Nam.
Đinh Huy Hoàng theo dõi kế hoạch xuyên suốt. Tài liệu này ghi baseline triển khai,
không xác nhận thay người phụ trách rằng các mốc lịch sử đã được hoàn thành.

| ID     | Quyết định áp dụng                                                                                                               |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| S1-D01 | Chỉ triển khai Sprint 1: danh mục sách và các phụ thuộc cần thiết                                                                |
| S1-D02 | Node 24 ESM; Express/EJS; SQLite local; better-sqlite3; Zod                                                                      |
| S1-D03 | Field mã/tên/tác giả/thể loại/năm/tổng; số còn tính tự động                                                                      |
| S1-D04 | Không nhận `available_quantity` từ POST; S1 không có mượn nên số còn = tổng                                                      |
| S1-D05 | Mã trim/uppercase `[A-Z0-9_-]{1,32}`, không tái dùng mã đã xóa mềm, theo hợp đồng đề xuất của đặc tả                             |
| S1-D06 | Tên bắt buộc; tác giả/thể loại/năm tùy chọn. Năm 0–9999 theo schema gốc; tổng nguyên không âm                                    |
| S1-D07 | Xóa mềm có xác nhận ở trang riêng, `is_active=0`; không có chức năng khôi phục ở S1                                              |
| S1-D08 | Tìm chứa mã/tên, NFC/lowercase tiếng Việt; giữ dấu; không tìm tác giả hay sửa chính tả                                           |
| S1-D09 | Chặn sửa tổng dưới số chưa trả; có sẵn adapter đếm loans cho S2, không thêm UI mượn/trả                                          |
| S1-D10 | Chỉ chạy cục bộ trong S1; xác thực/RBAC/CSRF đầy đủ thuộc S3                                                                     |
| S1-D11 | Repo GitHub `Yumesekai12321/GoodLib` đã có nhánh mặc định `main`; mốc đối chiếu S1-01 là commit `68ad1c2`                        |
| S1-D12 | ESLint 10 được giữ ở dòng còn hỗ trợ; override minimatch 11.0.5 xử lý advisory GHSA-g3hv-75wg-m249; kiểm tra lại khi nâng ESLint |

S1-D12 chỉ ảnh hưởng công cụ lint. Lockfile pin dependency; lint và `npm ci` phải
được kiểm tra sau thay đổi override. Không áp dụng `npm audit fix --force` tự động.

S1-D13: Giữ `.npmrc` với `ignore-scripts=true`. better-sqlite3 13.0.3 đóng gói sẵn
binary Node-API và khai báo `gypfile=false`. Kiểm tra thực tế cho thấy npm 11.17.0
vẫn chạy implicit `node-gyp rebuild` khi dùng `npm ci` mặc định; máy thiếu Windows
SDK nên thất bại. Bỏ dependency install hooks trong repo giải quyết bước build dư;
không sửa cấu hình npm toàn máy. Khi nâng/thêm dependency cần xem lại lựa chọn này.
Nguồn package: [better-sqlite3 13.0.3](https://github.com/WiseLibs/better-sqlite3/blob/v13.0.3/package.json).

Các quyết định chưa cần cho Sprint 1: gia hạn, phạt, phân quyền chi tiết, đặt chỗ.
Không triển khai các phần đó trong bản này. Quy tắc 10 lượt mượn và hạn 4 tháng
trong baseline giữ cho S2, chưa được coi là tính năng đã hoàn thành.

## S1-D14 · Ủy quyền hoàn tất ngày 13/11/2026

Người dùng yêu cầu Codex thực hiện toàn bộ đầu việc Sprint 1 còn lại và commit
lên GitHub, sau đó xác nhận: **“không cần chờ ai làm gì nữa cả, bạn làm hết luôn đi”**.
Codex trực tiếp thực hiện kiểm tra trên các máy GitHub-hosted Windows/Ubuntu độc
lập với máy local, review kỹ thuật và lập báo cáo chốt theo bằng chứng thực tế.
Phân công ban đầu được giữ như lịch sử; kết quả mới ghi Codex là người thực hiện.
Không còn điều kiện chờ Dương/Đạt/Hoàng xác nhận để chốt phần kỹ thuật.

Mốc 31/10, 04/11, 09/11 và báo cáo cô lúc 06:45 ngày 10/11 là lịch dự kiến đã qua.
Không ghi lùi ngày hoặc xác nhận một buổi báo cáo đã diễn ra khi không có bằng chứng.
