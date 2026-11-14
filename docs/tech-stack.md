# Tech stack

## 1. Tổng quan

| Lớp | Công nghệ | Phiên bản | Vai trò |
|---|---|---|---|
| Runtime | Node.js | 26.x (môi trường phát triển) | Chạy API |
| Ngôn ngữ | TypeScript | ^6.0.3 | Type safety |
| Framework | NestJS | ^12.2.0 | Module, DI, HTTP |
| CQRS | `@nestjs/cqrs` | ^12.1.1 | Command/query bus |
| ORM | MikroORM | ^7.2.5 | Entity, repository, migration |
| Database | PostgreSQL | 18 | Dữ liệu chính |
| Cache/token | Redis | 8 | Refresh token, AOF |
| Redis client | ioredis | ^6.0.0 | Kết nối Redis |
| Auth | `@nestjs/jwt` | ^12.0.4 | Access token |
| Hash | argon2 | ^0.45.2 | Argon2id |
| Validation | class-validator + class-transformer | ^0.15 / ^0.5 | DTO |
| Cookie | cookie-parser | ^1.4.7 | Refresh cookie |
| Test | Jest + ts-jest + supertest | ^30 / ^29 / ^7 | Unit/HTTP test |
| Lint/format | ESLint 9 + Prettier 3 | ^9.39 / ^3.9 | Chất lượng code |
| Hạ tầng local | Docker Compose | — | Postgres, Redis, RedisInsight |

## 2. Lý do chọn

### NestJS + CQRS

- Có sẵn module/DI/guard, phù hợp chia module theo bounded context.
- Command/query bus tách rõ luồng ghi và đọc; mỗi use case một handler dễ test.
- Không cần dựng microservice cho phạm vi đồ án.

### MikroORM

- Hỗ trợ entity, unit of work, identity map, migration và `bigint`.
- Cho phép viết domain sạch, mapper thủ công giữa `Mikro*` và aggregate.
- Hỗ trợ `SELECT ... FOR UPDATE`, view mapping (`inventories`).

### PostgreSQL

- Transaction mạnh, phù hợp outbox + audit.
- Kiểu `bigint`, `jsonb`, `text[]`, `timestamptz`, `date` đúng nhu cầu.
- Dễ chạy local bằng Docker, có nhiều công cụ backup/restore.

### Redis

- Lưu refresh token có TTL, thu hồi tức thời.
- AOF bật để không mất token khi restart (đánh đổi hiệu năng nhỏ).

### `bigint` thay vì decimal/float

- VND không có phần lẻ; dùng số nguyên tránh sai số.
- API nhận/trả tiền dạng chuỗi số (`"250000"`), domain parse thành `bigint`.
- Không dùng `decimal.js`, không dùng `number` cho tiền.

### Argon2id

- Thuật toán hash mật khẩu hiện đại, khuyến nghị cho ứng dụng mới.
- Tham số mặc định của thư viện `argon2` (memory cost 19456, time cost 2).

## 3. Không dùng / cố ý tránh

| Công nghệ | Lý do không dùng |
|---|---|
| `decimal.js` / `decimal` cho tiền | VND là số nguyên; `bigint` đủ và nhanh |
| Mongoose/MongoDB | Cần transaction và quan hệ chặt |
| TypeORM/Prisma | Đã chọn MikroORM, tránh trùng lặp |
| Kafka/RabbitMQ | Outbox trong Postgres đủ cho đồ án |
| GraphQL | REST đơn giản, ít client |
| Microservice | Tăng độ phức tạp vận hành không cần thiết |
| Event sourcing đầy đủ | Không cần replay toàn bộ trạng thái |
| `passport` | JWT verify trực tiếp qua `JwtService` đủ dùng |
| Seeder chứa tài khoản | Tránh lộ thông tin đăng nhập trong repo |

## 4. Cấu hình môi trường

Các biến trong `.env` (xem `.env.example`):

```dotenv
# PostgreSQL
POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

# Redis
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Outbox relay
OUTBOX_RELAY_ENABLED=false
OUTBOX_BATCH_SIZE=50
OUTBOX_POLL_INTERVAL_MS=1000
OUTBOX_MAX_ATTEMPTS=5
```

Không commit `.env`. Khi triển khai, secret phải lấy từ secret manager/biến môi
trường của nền tảng, không hard-code.

## 5. Hạ tầng local

`docker-compose.yaml`:

| Service | Image | Port | Volume |
|---|---|---|---|
| `postgresql` | `postgres:18` | 5432 | `postgre_data` |
| `redis` | `redis:8` | 6379 | `redis_data` |
| `redisinsight` | `redis/redisinsight:latest` | 5540 | `redisinsight_data` |

Redis chạy với `--appendonly yes` và yêu cầu mật khẩu.

## 6. Lệnh thường dùng

```bash
# Hạ tầng
docker compose up -d

# Backend
cd backend
npm install
npm run migration:up
npm run start:dev

# Chất lượng
npm test
npm run lint
npm run build

# Migration
npm run migration:create -- --name <ten>
npm run migration:up
npm run migration:down
npm run migration:list
```

## 7. Quy ước code

- Mỗi module chia `domain` / `application` / `infrastructure` / `presentation`.
- Tên file: `kebab-case`; class: `PascalCase`; command: `<Action><Entity>Command`.
- Entity ORM đặt tiền tố `Mikro`.
- Repository interface đặt trong `domain`, implementation trong
  `infrastructure`.
- DTO request đặt trong `presentation/.../requests`.
- Read model là class/interface riêng, không trả aggregate qua HTTP.
- Test cạnh file (`*.spec.ts`), ưu tiên domain + handler + controller.

## 8. Phiên bản và nâng cấp

- `package-lock.json` được commit để tái lập môi trường.
- Node local là 26.x; nếu deploy nền tảng khác, nên ghim phiên bản trong
  `.nvmrc`/Docker image (chưa làm).
- NestJS 12 và MikroORM 7 là các phiên bản mới; khi nâng cấp cần chạy lại toàn
  bộ test + migration trên DB rỗng.
- PostgreSQL 18 dùng volume mount `/var/lib/postgresql` (theo image mới).

## 9. Công cụ tài liệu

- Markdown + Mermaid cho sơ đồ trong repo.
- Các sơ đồ checkout/payment cũ dùng PlantUML (`.uxf`, `.wsd`) và ảnh PNG.
