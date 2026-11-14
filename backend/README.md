# Pharmacy OTC — Backend

API của hệ thống bán thuốc không kê đơn. Xem [README gốc](../README.md) để biết tổng quan.

## Cấu trúc

```
src/
  modules/         # từng bounded context
    <module>/
      domain/          # aggregate, value object, repository interface
      application/     # command, query, handler
      infrastructure/  # MikroORM entity, repository implementation
      presentation/    # controller, request DTO
  shared/          # unit of work, outbox, security, value objects
  migrations/      # MikroORM migrations
```

## Lệnh thường dùng

```bash
npm run start:dev
npm test
npm run lint
npm run build

npm run migration:create -- --name <ten_migration>
npm run migration:up
npm run migration:fresh
```
