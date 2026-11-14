# Pharmacy OTC

Hệ thống bán thuốc không kê đơn (OTC) — đồ án demo backend với NestJS, CQRS và MikroORM.

## Phạm vi

- Bán **thuốc không kê đơn**, thực phẩm chức năng, mỹ phẩm dược và thiết bị y tế.
- Không kê đơn, không bán thuốc đặc trị, không cung cấp dịch vụ khám chữa bệnh.
- Toàn bộ dữ liệu chỉ phục vụ demo, không phải hệ thống vận hành thật.

## Tài liệu

| Tài liệu | Nội dung |
|---|---|
| [docs/business-model.md](docs/business-model.md) | Mô hình kinh doanh, dòng tiền, chi phí, chỉ số |
| [docs/customers.md](docs/customers.md) | Đối tượng khách hàng, persona, hành trình |
| [docs/scope.md](docs/scope.md) | Phạm vi kinh doanh và phân kỳ |
| [docs/actors.md](docs/actors.md) | Tác nhân và phân quyền |
| [docs/functional-requirements.md](docs/functional-requirements.md) | Yêu cầu chức năng theo module |
| [docs/non-functional-requirements.md](docs/non-functional-requirements.md) | Bảo mật, hiệu năng, độ tin cậy |
| [docs/architecture.md](docs/architecture.md) | Kiến trúc, CQRS, outbox, transaction |
| [docs/tech-stack.md](docs/tech-stack.md) | Công nghệ và lý do chọn |
| [docs/data-model.md](docs/data-model.md) | ERD và mô tả bảng |

## Trạng thái module

| Module | Trạng thái | Nội dung |
|---|---|---|
| `authentication` | 🟡 | Đăng ký, đăng nhập, refresh token; chưa có logout/reset mật khẩu |
| `authorization` | ✅ | RBAC: role, permission, super admin |
| `users` | 🟡 | Tạo, đổi email, gán/bỏ role; chưa có list/detail |
| `customers` | 🟡 | Tự tạo khi đăng ký; chưa có hồ sơ/địa chỉ/API |
| `products` | 🟡 | Tạo/list cơ bản; chưa có SKU, category, đơn vị, mô tả, ảnh |
| `suppliers` | ✅ | Tạo/list/sửa/ngưng/kích hoạt |
| `goods-receipts` | 🟡 | Tạo/xác nhận/huỷ phiếu nhập; chưa có list/detail |
| `inventories` | 🟡 | Lô, tồn kho, xuất/kiểm kê; chưa có API đọc tồn |
| `orders` | ⬜ | Chưa triển khai |
| `expenses` | 🟡 | Tạo chi phí; chưa có API duyệt/chi/huỷ/list |
| `audit-logs` | ✅ | Ghi qua outbox, tra cứu theo actor/entity/thời gian |
| `reports` | ⬜ | Chưa triển khai |

Thanh toán và ledger mới ở mức thiết kế, xem `docs/payment` và `docs/ledger`.

## Kiến trúc

- **NestJS + CQRS**: mỗi use case là một command/query handler.
- **Clean Architecture**: mỗi module chia `domain` / `application` / `infrastructure` / `presentation`.
- **MikroORM + PostgreSQL**: entity `Mikro*` ở tầng infrastructure, domain không phụ thuộc ORM.
- **Outbox pattern**: ghi audit event cùng transaction với nghiệp vụ, relay xử lý bất đồng bộ.
- **Unit of Work**: gom thao tác ghi vào một transaction.
- **Money dạng bigint VND**: không dùng số thực cho tiền tệ.
- **RBAC**: permission theo `resource:action`, Super Admin bỏ qua kiểm tra.

Chi tiết: [docs/architecture.md](docs/architecture.md).

## Chạy local

```bash
cp .env.example .env       # điền biến môi trường
docker compose up -d       # PostgreSQL + Redis + RedisInsight
cd backend
npm install
npm run migration:up
npm run start:dev
```

API chạy tại `http://localhost:3000/api`.

### Tài khoản quản trị

Repo **không chứa seeder/tài khoản mặc định**. Sau khi migrate DB rỗng, cần tạo
tài khoản quản trị một lần bằng công cụ DB hoặc script chạy ngoài repo, rồi gán
role Super Admin. Không commit thông tin đăng nhập vào repository.

### Outbox relay

Mặc định relay tắt. Bật bằng biến môi trường:

```dotenv
OUTBOX_RELAY_ENABLED=true
```

Nếu tắt, nghiệp vụ vẫn ghi event vào `outbox_events`, nhưng audit/inventory
consumer sẽ chưa xử lý cho đến khi bật relay.

## Kiểm thử

```bash
cd backend
npm test
npm run lint
npm run build
```

## Cấu trúc repo

```
.
├── backend/          # NestJS API
├── docs/             # tài liệu dự án
├── docker-compose.yaml
└── README.md
```
