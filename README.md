# Pharmacy OTC

Hệ thống bán thuốc không kê đơn (OTC) — đồ án demo backend với NestJS, CQRS và MikroORM.

## Phạm vi

- Bán **thuốc không kê đơn**, thực phẩm chức năng, mỹ phẩm và thiết bị y tế.
- Không kê đơn, không bán thuốc đặc trị.
- Toàn bộ dữ liệu là seed data phục vụ demo, không phải hệ thống vận hành thật.

## Tính năng đã có

| Module | Nội dung |
|---|---|
| `authentication` | Đăng ký, đăng nhập, refresh token bằng JWT + cookie |
| `authorization` | RBAC: role, permission, quản lý quyền theo resource/action |
| `users`, `customers` | Tài khoản nội bộ và khách hàng |
| `products` | Danh mục thuốc: SKU, category, đơn vị, giá, tồn |
| `suppliers` | Nhà phân phối |
| `goods-receipts` | Nhập hàng theo lô, xác nhận/hủy phiếu nhập |
| `inventories` | Batch + hạn dùng, xuất kho theo lô, kiểm kê |
| `orders` | Đơn hàng và trạng thái |
| `expenses` | Chi phí vận hành: thuê mặt bằng, lương, marketing… |
| `audit-logs` | Ghi nhận hành động qua outbox, truy vết theo entity |

Thanh toán và ledger mới ở mức thiết kế, xem `docs/payment` và `docs/ledger`.

## Kiến trúc

- **NestJS + CQRS**: mỗi use case là một command/query handler.
- **Clean Architecture**: mỗi module chia `domain` / `application` / `infrastructure` / `presentation`.
- **MikroORM + PostgreSQL**: entity `Mikro*` ở tầng infrastructure, domain không phụ thuộc ORM.
- **Outbox pattern**: ghi audit event cùng transaction với nghiệp vụ, relay xử lý bất đồng bộ.
- **Unit of Work**: gom thao tác ghi vào một transaction.
- **Money dạng bigint VND**: không dùng số thực cho tiền tệ.

## Chạy local

```bash
cp .env.example .env       # điền biến môi trường
docker compose up -d       # PostgreSQL + Redis
cd backend
npm install
npm run migration:up
npm run start:dev
```

API chạy tại `http://localhost:3000/api`.

## Kiểm thử

```bash
cd backend
npm test
npm run lint
npm run build
```
