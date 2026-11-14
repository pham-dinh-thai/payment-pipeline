# Tác nhân hệ thống

## 1. Danh sách tác nhân

| Tác nhân | Loại | Mô tả | Trạng thái |
|---|---|---|---|
| **Khách (Guest)** | Con người | Chưa đăng nhập, xem sản phẩm/nội dung | 🟡 hiện tại API sản phẩm yêu cầu đăng nhập |
| **Khách hàng** | Con người | Đã đăng ký, mua hàng cho cá nhân/gia đình | 🟡 có tài khoản, chưa có đơn hàng |
| **Dược sĩ** | Nội bộ | Kiểm tra sản phẩm, tư vấn, xử lý cảnh báo | ⬜ chưa có role/use case riêng |
| **Nhân viên kho** | Nội bộ | Nhập hàng, xuất kho, kiểm kê | ✅ qua permission |
| **Kế toán/vận hành** | Nội bộ | Ghi nhận và duyệt chi phí, xem báo cáo | 🟡 tạo chi phí; duyệt/báo cáo chưa có API |
| **Quản trị viên** | Nội bộ | Quản lý người dùng, phân quyền, danh mục | ✅ |
| **Super Admin** | Nội bộ | Toàn quyền, bỏ qua kiểm tra permission | ✅ |
| **Hệ thống** | Phần mềm | Outbox relay, audit consumer, refresh token store | ✅ |
| **PSP/cổng thanh toán** | Bên ngoài | Xử lý thanh toán, gửi IPN | ⬜ thiết kế |
| **Nhà cung cấp** | Bên ngoài | Cung cấp hàng, không đăng nhập hệ thống | ✅ dữ liệu, không có portal |
| **Đơn vị vận chuyển** | Bên ngoài | Giao hàng, cập nhật trạng thái | ⬜ thiết kế |

## 2. Phân quyền hiện có

Permission được khai báo trong
`backend/src/modules/authorization/domain/permission/permission-catalog.ts`
theo dạng `resource:action`. Ngoài các action cụ thể còn có `resource:manage`
(bao trùm mọi action của resource).

| Resource | Actions |
|---|---|
| `accounts` | `read`, `update` |
| `users` | `create`, `read`, `update`, `delete` |
| `customers` | `create`, `read`, `update`, `delete` |
| `roles` | `create`, `read`, `update`, `delete` |
| `orders` | `read`, `process`, `cancel`, `refund` |
| `products` | `read`, `create`, `update`, `delete` |
| `suppliers` | `read`, `create`, `update`, `delete` |
| `goods_receipts` | `read`, `create`, `confirm`, `cancel` |
| `inventories` | `read`, `issue`, `reconcile` |
| `expenses` | `read`, `create`, `update`, `delete`, `approve`, `pay`, `cancel` |
| `audit_logs` | `read` |
| `reports` | `view_sales`, `view_inventory`, `export` |

Lưu ý:

- Permission **chưa có endpoint nào** vẫn được khai báo để dùng ở giai đoạn sau
  (`orders`, `reports`).
- Role không được seed sẵn. Quản trị viên tạo role và gán permission qua API.
- `Super Admin` được đánh dấu bằng `roles.is_super_admin = true`, bỏ qua kiểm
  tra permission.

## 3. Vai trò gợi ý và quyền

Đây là gợi ý triển khai, không phải dữ liệu seed:

| Vai trò | Quyền chính |
|---|---|
| **Quản trị viên** | `users:manage`, `roles:manage`, `accounts:*`, toàn bộ danh mục |
| **Dược sĩ** | `products:read`, `customers:read`, `orders:read`, `orders:process`, `audit_logs:read` |
| **Nhân viên kho** | `products:read`, `suppliers:read`, `goods_receipts:*`, `inventories:read`, `inventories:issue`, `inventories:reconcile` |
| **Kế toán** | `expenses:*`, `reports:view_sales`, `reports:view_inventory`, `reports:export`, `suppliers:read` |
| **Nhân viên bán hàng** | `products:read`, `customers:read`, `orders:read`, `orders:process` |
| **Khách hàng** | Không dùng RBAC nội bộ; chỉ truy cập tài nguyên của mình (khi có API) |

## 4. Use case theo tác nhân

### Khách hàng

- Đăng ký, đăng nhập, làm mới phiên.
- Xem danh mục, tìm sản phẩm, xem chi tiết và hạn dùng (kế hoạch).
- Quản lý hồ sơ/địa chỉ (kế hoạch).
- Đặt hàng, theo dõi đơn, huỷ đơn (kế hoạch).
- Xem lịch sử mua, mua lại (kế hoạch).

### Nhân viên kho

- Tạo phiếu nhập từ nhà cung cấp.
- Xác nhận phiếu nhập → sinh lô + tăng tồn.
- Huỷ phiếu nhập còn `pending`.
- Xuất kho theo lô khi bán/hủy hàng.
- Kiểm kê và điều chỉnh tồn theo lô.
- Xem tồn kho, lô sắp hết hạn (kế hoạch).

### Kế toán/vận hành

- Ghi nhận chi phí (thuê mặt bằng, lương, marketing, vận chuyển...).
- Duyệt/chi/huỷ chi phí (domain đã có, API chưa có).
- Xem báo cáo doanh thu/tồn kho (kế hoạch).

### Quản trị viên

- Tạo người dùng nội bộ, đổi email, gán/bỏ role.
- Tạo role, đổi tên, cấp/thu quyền, đặt Super Admin.
- Quản lý sản phẩm, nhà cung cấp.
- Xem audit log theo actor/entity/thời gian.

### Hệ thống

- Outbox relay lấy event chưa xử lý, gọi consumer, đánh dấu đã xử lý trong cùng
  transaction.
- Audit consumer ghi `audit_logs` từ event.
- Hết số lần thử: đánh dấu failed, ghi lỗi.
- Refresh token lưu trong Redis, cookie `httpOnly`.

## 5. Phân tách trách nhiệm

| Nguyên tắc | Cách thực hiện |
|---|---|
| Người tạo phiếu nhập không tự xác nhận? | Hiện chưa chặn; có thể bổ sung rule nếu cần |
| Người tạo chi phí không tự duyệt? | Hiện chưa chặn; domain cho phép cùng người nếu có quyền |
| Quyền tối thiểu | Mỗi endpoint khai báo permission cụ thể, không dùng chung `manage` cho role thường |
| Truy vết | Mọi thao tác ghi quan trọng ghi audit với actor/IP/user-agent |
| Bảo vệ tài khoản | Mật khẩu hash Argon2id; refresh token `httpOnly`, `sameSite=strict` |

Các quy tắc tách nhiệm vụ (segregation of duties) nên được bổ sung khi làm
nghiệp vụ duyệt chi phí/phiếu nhập ở giai đoạn sau.
