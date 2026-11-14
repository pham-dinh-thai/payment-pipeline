# Yêu cầu chức năng

## 1. Quy ước

- Mỗi yêu cầu có mã `FR-<MODULE>-<số>`.
- Trạng thái: ✅ đã có · 🟡 một phần · ⬜ kế hoạch · ❌ không làm.
- API prefix: `/api`.
- Các endpoint nghiệp vụ đều yêu cầu `Authorization: Bearer <accessToken>`
  và permission tương ứng, trừ đăng ký/đăng nhập/refresh.

## 2. Tổng quan module

| Module | Trạng thái | Ghi chú |
|---|---|---|
| Authentication | 🟡 | Đủ đăng ký/đăng nhập/refresh; thiếu logout, reset mật khẩu |
| Authorization (RBAC) | ✅ | Role, permission, super admin |
| Users | 🟡 | Tạo, đổi email, gán/bỏ role; thiếu list/detail, vô hiệu hoá |
| Customers | 🟡 | Tự tạo khi đăng ký; thiếu hồ sơ/địa chỉ/API |
| Products | 🟡 | Tạo/list cơ bản; thiếu SKU, category, đơn vị, mô tả, ảnh, sửa/xoá |
| Suppliers | ✅ | Tạo/list/sửa/ngưng/kích hoạt |
| Goods receipts | 🟡 | Tạo/xác nhận/huỷ; thiếu list/detail |
| Inventories | 🟡 | Xuất/kiểm kê theo lô; thiếu API đọc tồn/lô |
| Orders | ⬜ | Module rỗng |
| Expenses | 🟡 | Tạo; domain có duyệt/chi/huỷ nhưng chưa có API |
| Audit logs | ✅ | List/filter + detail |
| Reports | ⬜ | Chỉ có permission |
| Payments/Ledger | ⬜ | Chỉ có tài liệu thiết kế |

## 3. Authentication

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| FR-AUTH-01 | Đăng ký bằng email/mật khẩu, tạo `user` + `account` + `customer` trong một transaction | ✅ |
| FR-AUTH-02 | Đăng nhập, trả access token (JWT) và set refresh token vào cookie `httpOnly` | ✅ |
| FR-AUTH-03 | Làm mới access token bằng refresh token trong cookie | ✅ |
| FR-AUTH-04 | Đăng xuất, thu hồi refresh token | ⬜ |
| FR-AUTH-05 | Giới hạn số lần đăng nhập sai/rate limit | ⬜ |
| FR-AUTH-06 | Quên/đổi mật khẩu qua email | ⬜ |
| FR-AUTH-07 | Ghi audit cho đăng ký/đăng nhập | ✅ |

**Quy tắc**

- Mật khẩu hash Argon2id, không lưu plaintext.
- Email unique, không phân biệt hoa/thường ở tầng kiểm tra.
- Refresh token lưu Redis, TTL 7 ngày; access token 15 phút (cấu hình qua env).
- Cookie `sameSite=strict`, `path=/api/authentication/refresh`,
  `secure` khi `NODE_ENV=production`.

## 4. Authorization (RBAC)

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| FR-RBAC-01 | Tạo role với danh sách permission | ✅ |
| FR-RBAC-02 | Xem danh sách/chi tiết role | ✅ |
| FR-RBAC-03 | Đổi tên role | ✅ |
| FR-RBAC-04 | Cấp/thu permission cho role | ✅ |
| FR-RBAC-05 | Đặt/bỏ cờ Super Admin | ✅ |
| FR-RBAC-06 | Chặn endpoint theo permission | ✅ |
| FR-RBAC-07 | Seed role mặc định (quản trị, kho, kế toán…) | ⬜ |

**Quy tắc**

- Permission hợp lệ theo catalog; permission lạ bị từ chối.
- Không cho trùng permission trong một role.
- Super Admin bỏ qua kiểm tra permission.
- Xoá role đang được gán cho user: chưa hỗ trợ (chưa có endpoint xoá role).

## 5. Users

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| FR-USER-01 | Quản trị tạo người dùng nội bộ (họ tên, email) | ✅ |
| FR-USER-02 | Đổi email người dùng | ✅ |
| FR-USER-03 | Gán role cho người dùng | ✅ |
| FR-USER-04 | Bỏ role khỏi người dùng | ✅ |
| FR-USER-05 | Danh sách/chi tiết người dùng | ⬜ (có permission `users:read`) |
| FR-USER-06 | Vô hiệu hoá/xoá người dùng | ⬜ |
| FR-USER-07 | Cấp tài khoản/mật khẩu ban đầu hoặc lời mời | ⬜ |

**Ghi chú:** người dùng do quản trị tạo hiện **chưa có account/mật khẩu**, nên
chưa đăng nhập được. Cần bổ sung luồng mời/đặt mật khẩu.

## 6. Customers

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| FR-CUST-01 | Tự tạo hồ sơ khách khi đăng ký | ✅ |
| FR-CUST-02 | Hồ sơ: họ tên, SĐT, ngày sinh, giới tính | ⬜ |
| FR-CUST-03 | Sổ địa chỉ giao hàng (nhiều địa chỉ, mặc định) | ⬜ |
| FR-CUST-04 | Khách tự xem/sửa hồ sơ | ⬜ |
| FR-CUST-05 | Quản trị xem/tìm khách hàng | ⬜ |
| FR-CUST-06 | Guest checkout | ⬜ |
| FR-CUST-07 | Ghi audit thay đổi hồ sơ | ⬜ |

## 7. Products

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| FR-PROD-01 | Tạo sản phẩm: tên, giá bán, số lượng | ✅ |
| FR-PROD-02 | Danh sách sản phẩm | ✅ |
| FR-PROD-03 | Thêm `sku` unique | ⬜ |
| FR-PROD-04 | Thêm `category` (OTC/TPCN/mỹ phẩm/thiết bị) | 🟡 enum đã tạo, chưa gắn entity/API |
| FR-PROD-05 | Thêm `unit` (viên, hộp, chai, tuýp…) | ⬜ |
| FR-PROD-06 | Thêm mô tả, ảnh, thông tin hạn dùng/cảnh báo | ⬜ |
| FR-PROD-07 | Sửa/xoá/ngừng bán sản phẩm | ⬜ |
| FR-PROD-08 | Tìm kiếm/lọc theo category, khoảng giá, còn hàng | ⬜ |
| FR-PROD-09 | Phân trang | ⬜ |
| FR-PROD-10 | Danh mục công khai cho khách chưa đăng nhập | ⬜ |
| FR-PROD-11 | Không cho giá/số lượng âm | ✅ |

## 8. Suppliers

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| FR-SUP-01 | Tạo nhà cung cấp, sinh mã `SUP-0001` | ✅ |
| FR-SUP-02 | Danh sách nhà cung cấp | ✅ |
| FR-SUP-03 | Sửa thông tin | ✅ |
| FR-SUP-04 | Ngưng/kích hoạt | ✅ |
| FR-SUP-05 | Xoá nhà cung cấp | ⬜ |
| FR-SUP-06 | Tìm kiếm/lọc theo trạng thái | ⬜ |

## 9. Goods receipts (phiếu nhập)

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| FR-GR-01 | Tạo phiếu nhập `pending` với ≥ 1 dòng | ✅ |
| FR-GR-02 | Mỗi dòng: sản phẩm, số lô, số lượng, giá nhập, hạn dùng | ✅ |
| FR-GR-03 | Sinh mã `GR-0001` | ✅ |
| FR-GR-04 | Chặn trùng `(sản phẩm, số lô)` trong cùng phiếu | ✅ |
| FR-GR-05 | Xác nhận phiếu → sinh lô + nhập kho | ✅ |
| FR-GR-06 | Huỷ phiếu `pending` | ✅ |
| FR-GR-07 | Chỉ xác nhận/huỷ phiếu `pending` | ✅ |
| FR-GR-08 | Danh sách/chi tiết phiếu nhập | ⬜ |
| FR-GR-09 | Sửa phiếu `pending` | ⬜ |
| FR-GR-10 | Ghi audit tạo/xác nhận/huỷ | ✅ |

## 10. Inventories (tồn kho theo lô)

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| FR-INV-01 | Mỗi lô có số lô, số lượng, giá nhập, hạn dùng, trạng thái | ✅ |
| FR-INV-02 | Nhập kho từ phiếu nhập đã xác nhận (consumer outbox) | ✅ |
| FR-INV-03 | Xuất kho theo `batchId`, không cho âm | ✅ |
| FR-INV-04 | Kiểm kê/điều chỉnh số lượng theo lô | ✅ |
| FR-INV-05 | Xem tồn tổng hợp theo sản phẩm (view `inventories`) | 🟡 có view, chưa có API |
| FR-INV-06 | Xem danh sách lô của sản phẩm | ⬜ |
| FR-INV-07 | Gợi ý/chặn xuất theo FEFO | ⬜ |
| FR-INV-08 | Tự chuyển lô sang `expired`/`out`, chặn bán hàng hết hạn | ⬜ |
| FR-INV-09 | Cảnh báo tồn thấp/lô cận hạn | ⬜ |
| FR-INV-10 | Ghi audit xuất/kiểm kê | ✅ |

**Quy tắc**

- Tồn kho thật lấy từ `batches`; `products.quantity` là trường cũ, không phải
  nguồn sự thật.
- Xuất kho hiện yêu cầu truyền đúng `batchId`; hệ thống chưa tự chọn lô FEFO.
- Không có endpoint đọc tồn kho trong code hiện tại.

## 11. Orders

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| FR-ORD-01 | Tạo đơn từ giỏ hàng, backend tự tính giá | ⬜ |
| FR-ORD-02 | Địa chỉ giao, phí giao, ghi chú | ⬜ |
| FR-ORD-03 | Trạng thái đơn và lịch sử | ⬜ |
| FR-ORD-04 | Trừ tồn theo lô khi xác nhận đơn | ⬜ |
| FR-ORD-05 | Huỷ đơn và hoàn tồn | ⬜ |
| FR-ORD-06 | Khách xem đơn của mình | ⬜ |
| FR-ORD-07 | Quản trị xử lý đơn | ⬜ |
| FR-ORD-08 | Ghi audit | ⬜ |

## 12. Expenses

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| FR-EXP-01 | Tạo chi phí: tên, nhóm, số tiền VND, ngày, nhà cung cấp, phương thức, ghi chú | ✅ |
| FR-EXP-02 | Trạng thái `pending → approved → paid` | 🟡 domain có, API chưa |
| FR-EXP-03 | Huỷ chi phí chưa thanh toán | 🟡 domain có, API chưa |
| FR-EXP-04 | Chỉ sửa chi phí `pending` | 🟡 domain có, API chưa |
| FR-EXP-05 | Danh sách/tìm kiếm chi phí | ⬜ |
| FR-EXP-06 | Báo cáo chi phí theo nhóm/thời gian | ⬜ |
| FR-EXP-07 | Ghi audit tạo/duyệt/chi/huỷ | 🟡 mới có audit tạo |

**Nhóm chi phí:** thuê mặt bằng, điện nước, lương, vận chuyển, marketing, văn
phòng phẩm, khác.

## 13. Audit logs

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| FR-AUD-01 | Ghi audit bất đồng bộ qua outbox, không chặn nghiệp vụ | ✅ |
| FR-AUD-02 | Lưu actor, action, entity, before/after, metadata, IP, user-agent | ✅ |
| FR-AUD-03 | Danh sách có filter actor/entity/action/status/thời gian + phân trang | ✅ |
| FR-AUD-04 | Xem chi tiết | ✅ |
| FR-AUD-05 | Không cho sửa/xoá audit | ✅ (chỉ có API đọc) |
| FR-AUD-06 | Retry khi consumer lỗi, dừng sau N lần | ✅ |

## 14. Reports

| Mã | Yêu cầu | Trạng thái |
|---|---|---|
| FR-RPT-01 | Báo cáo doanh thu/lợi nhuận gộp | ⬜ |
| FR-RPT-02 | Báo cáo tồn kho/giá trị tồn | ⬜ |
| FR-RPT-03 | Báo cáo hàng cận hạn/hết hạn | ⬜ |
| FR-RPT-04 | Xuất CSV/Excel | ⬜ |

## 15. Quy tắc nghiệp vụ xuyên suốt

| Mã | Quy tắc |
|---|---|
| BR-01 | Tiền là số nguyên VND (`bigint`), không dùng số thực |
| BR-02 | Số lượng tồn/phiếu nhập là số nguyên dương |
| BR-03 | Không xuất quá số lượng còn lại của lô |
| BR-04 | Phiếu nhập chỉ xác nhận/huỷ khi `pending` |
| BR-05 | Một phiếu nhập không có dòng trùng `(sản phẩm, số lô)` |
| BR-06 | Mỗi lần ghi nghiệp vụ quan trọng phát ra outbox event trong cùng transaction |
| BR-07 | Consumer xử lý event và đánh dấu processed trong cùng transaction |
| BR-08 | Lỗi consumer được ghi nhận, retry tối đa `OUTBOX_MAX_ATTEMPTS` |
| BR-09 | Endpoint ghi yêu cầu permission cụ thể |
| BR-10 | Không bán thuốc kê đơn (ràng buộc danh mục) |
| BR-11 | Không hiển thị/bán lô đã hết hạn (mục tiêu giai đoạn sau) |

## 16. Ưu tiên tiếp theo

1. Mở rộng `products`: `sku`, `category`, `unit`, `description`, `imageUrl` +
   migration + test.
2. Hồ sơ `customers` + địa chỉ.
3. `orders` + giỏ hàng + trừ tồn theo lô.
4. API đọc tồn kho/lô, cảnh báo cận hạn.
5. Hoàn thiện chi phí (duyệt/chi/huỷ/list).
