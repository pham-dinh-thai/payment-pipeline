# Yêu cầu phi chức năng

> Các con số dưới đây là **mục tiêu cho bản demo**, không phải cam kết SLA thương
> mại. Khi chưa có đo đạc, trạng thái ghi là "mục tiêu".

## 1. Bảo mật

| Mã | Yêu cầu | Cách đáp ứng | Trạng thái |
|---|---|---|---|
| NFR-SEC-01 | Mật khẩu không lưu plaintext | Argon2id | ✅ |
| NFR-SEC-02 | Access token ngắn hạn, refresh token xoay vòng | JWT 15m + refresh 7d trong Redis | ✅ |
| NFR-SEC-03 | Refresh token không đọc được bằng JS | Cookie `httpOnly`, `sameSite=strict` | ✅ |
| NFR-SEC-04 | Phân quyền theo permission ở mọi endpoint nghiệp vụ | `AuthGuard` + `PermissionsGuard` | ✅ |
| NFR-SEC-05 | Chống mass assignment/field lạ | `ValidationPipe` với `whitelist`, `forbidNonWhitelisted` | ✅ |
| NFR-SEC-06 | Security headers | `app.useSecurityHeaders()` | ✅ |
| NFR-SEC-07 | Không lưu credential trong repo | `.env` gitignored; không có seeder chứa mật khẩu | ✅ |
| NFR-SEC-08 | Rate limit đăng nhập/API | Chưa có | ⬜ |
| NFR-SEC-09 | CORS chỉ cho origin tin cậy | Chưa cấu hình | ⬜ |
| NFR-SEC-10 | HTTPS bắt buộc khi triển khai | Thuộc hạ tầng | ⬜ |
| NFR-SEC-11 | Chống SQL injection | MikroORM query builder/parameter hoá | ✅ |
| NFR-SEC-12 | Không trả stack trace/chi tiết nội bộ cho client | Exception filter mặc định của Nest | 🟡 cần kiểm tra production |

**Ghi chú:** repo từng chứa mật khẩu demo trong lịch sử git. Mật khẩu đó đã
được thay; không dùng lại cho bất kỳ tài khoản thật nào.

## 2. Hiệu năng

| Mã | Mục tiêu | Ghi chú |
|---|---|---|
| NFR-PERF-01 | API đọc đơn giản p95 < 300 ms | Với DB local, dữ liệu demo |
| NFR-PERF-02 | API ghi p95 < 500 ms (không tính giao hàng/thanh toán) | Transaction + outbox |
| NFR-PERF-03 | Outbox relay trễ tối đa ~1 giây | `OUTBOX_POLL_INTERVAL_MS=1000` |
| NFR-PERF-04 | Chịu 100 người dùng đồng thời ở mức demo | Mục tiêu, chưa load test |
| NFR-PERF-05 | Danh sách phải phân trang, tối đa 100 bản ghi/trang | Audit log đã có; sản phẩm chưa |
| NFR-PERF-06 | Không N+1 query ở luồng đọc chính | Cần kiểm tra khi thêm orders |

**Biện pháp đã có**

- Index cho `audit_logs.actor_id`, `occurred_at`; GIN cho `roles.permissions`,
  `users.role_ids`; unique cho email, mã nhà cung cấp/phiếu nhập.
- View `inventories` tổng hợp tồn theo sản phẩm thay vì tính lại ở ứng dụng.
- `findByProductId(..., { forUpdate: true })` khoá lô khi xuất/kiểm kê.

## 3. Độ tin cậy và toàn vẹn dữ liệu

| Mã | Yêu cầu | Cách đáp ứng | Trạng thái |
|---|---|---|---|
| NFR-REL-01 | Nghiệp vụ ghi nằm trong một transaction | `MikroUnitOfWork` | ✅ |
| NFR-REL-02 | Event và dữ liệu nghiệp vụ commit cùng nhau | Outbox trong cùng transaction | ✅ |
| NFR-REL-03 | Consumer xử lý lặp không tạo dữ liệu trùng | Batch id sinh trước, `markProcessed` cùng transaction | ✅ |
| NFR-REL-04 | Lỗi tạm thời được retry | Tối đa `OUTBOX_MAX_ATTEMPTS`, ghi lỗi | ✅ |
| NFR-REL-05 | Không cho tồn kho âm | `StockQuantity.decrease` kiểm tra | ✅ |
| NFR-REL-06 | Ràng buộc unique ở DB | Email, mã nghiệp vụ, dòng phiếu nhập | ✅ |
| NFR-REL-07 | Tiền không mất chính xác | `bigint` VND | ✅ |
| NFR-REL-08 | Health check | Chưa có `/health` | ⬜ |
| NFR-REL-09 | Graceful shutdown | Nest mặc định; chưa cấu hình hooks | 🟡 |
| NFR-REL-10 | Backup/restore có quy trình | Docker volume; cần script `pg_dump` | ⬜ |

**Sự cố đã biết**

- Nếu outbox event không có consumer đăng ký, relay chỉ log cảnh báo và **không**
  đánh dấu processed; event sẽ được thử lại mỗi vòng.
- Relay chạy trong cùng process với API; khi tắt app, event còn tồn sẽ chờ lần
  khởi động sau.

## 4. Khả năng quan sát

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| NFR-OBS-01 | Log có ngữ cảnh module/actor | 🟡 Nest logger mặc định |
| NFR-OBS-02 | Log thay đổi nghiệp vụ | ✅ `audit_logs` |
| NFR-OBS-03 | Log lỗi outbox kèm số lần thử | ✅ |
| NFR-OBS-04 | Metrics (latency, error rate, queue) | ⬜ |
| NFR-OBS-05 | Distributed tracing | ⬜ |
| NFR-OBS-06 | Cảnh báo khi outbox failed/permanent | ⬜ |
| NFR-OBS-07 | Truy vết request qua `requestId` | 🟡 audit có trường, chưa gắn middleware |

## 5. Khả năng bảo trì và kiểm thử

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| NFR-MNT-01 | Tách lớp domain/application/infrastructure/presentation | ✅ |
| NFR-MNT-02 | Domain không phụ thuộc ORM | ✅ |
| NFR-MNT-03 | Mỗi use case là command/query riêng | ✅ |
| NFR-MNT-04 | Test domain + handler + controller | ✅ (~398 test) |
| NFR-MNT-05 | Build/lint/type-check chạy được | ✅ |
| NFR-MNT-06 | Migration có snapshot, chạy được từ DB rỗng | ✅ |
| NFR-MNT-07 | Test tích hợp với PostgreSQL thật | ⬜ chủ yếu dùng mock/unit |
| NFR-MNT-08 | Coverage tối thiểu 80% cho domain/application | ⬜ chưa đặt ngưỡng |

## 6. Khả năng triển khai và vận hành

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| NFR-OPS-01 | Chạy local bằng Docker Compose | ✅ PostgreSQL 18, Redis 8, RedisInsight |
| NFR-OPS-02 | Cấu hình qua biến môi trường | ✅ `.env.example` |
| NFR-OPS-03 | Migration tự động khi deploy | ⬜ chạy tay `npm run migration:up` |
| NFR-OPS-04 | Container hoá API | ⬜ chỉ có hạ tầng |
| NFR-OPS-05 | Chạy nhiều instance API | 🟡 outbox relay có thể chạy trùng; cần khoá/queue chuyên dụng |
| NFR-OPS-06 | Redis AOF | ✅ `appendonly yes` |
| NFR-OPS-07 | Dữ liệu Postgres bền vững qua restart | ✅ named volume |

## 7. Khả năng sử dụng và truy cập

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| NFR-UX-01 | Thông báo lỗi rõ ràng, không lộ chi tiết hệ thống | 🟡 |
| NFR-UX-02 | API trả JSON nhất quán | 🟡 chưa có response envelope chung |
| NFR-UX-03 | Hỗ trợ tiếng Việt (thông báo, danh mục) | 🟡 domain dùng tiếng Anh, nội dung sản phẩm tiếng Việt |
| NFR-UX-04 | Responsive, dùng được trên điện thoại | ⬜ frontend chưa có |
| NFR-UX-05 | Hỗ trợ bàn phím/screen reader | ⬜ |
| NFR-UX-06 | Hiển thị rõ hạn dùng/cảnh báo | ⬜ |

## 8. Tuân thủ và riêng tư

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| NFR-PRI-01 | Chỉ thu thập dữ liệu tối thiểu để giao hàng | 🟡 hiện chỉ có email/user |
| NFR-PRI-02 | Không lưu dữ liệu sức khoẻ nhạy cảm | ✅ |
| NFR-PRI-03 | Audit truy cập/thay đổi dữ liệu quan trọng | ✅ |
| NFR-PRI-04 | Chính sách xoá/ẩn dữ liệu khách | ⬜ |
| NFR-PRI-05 | Thông báo cookie/điều khoản | ⬜ |
| NFR-PRI-06 | Không bán thuốc kê đơn | ✅ ràng buộc danh mục |

## 9. Ràng buộc kỹ thuật

- **Một process API** cho demo; outbox relay chạy trong process.
- **Không dùng `decimal`/float** cho tiền; mọi phép tính tiền dùng `bigint`.
- **Không cache** ở phiên bản hiện tại; đọc thẳng PostgreSQL.
- **Không có frontend** trong repo này; API là backend.
- **Không có seeder**; DB mới cần tạo dữ liệu quản trị thủ công một lần.
- **Thời gian**: lưu `timestamptz`; ngày hạn dùng lưu `date`.

## 10. Tiêu chí kiểm chứng

| Nhóm | Cách kiểm |
|---|---|
| Bảo mật | Test guard/permission, test login sai, kiểm tra cookie |
| Toàn vẹn | Test domain (âm kho, trùng lô, trạng thái), test transaction |
| Outbox | Test relay retry/failed, test consumer idempotent |
| Hiệu năng | Đo bằng `autocannon`/`k6` trên dữ liệu demo (chưa làm) |
| Hồi quy | `npm test`, `npm run lint`, `npm run build` trước khi merge |
