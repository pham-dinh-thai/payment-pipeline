# Data Model

## Nguyên tắc

- Mỗi bảng đều có `id` (UUID), `created_at`, `updated_at`
- `ledger_entries` là **append-only**: không `UPDATE/DELETE`, chỉ `INSERT`
- Mọi giao dịch tiền phải có `reference_id` để trace ngược về `payment`/`order`
- Idempotency: dùng unique constraint để tránh ghi trùng (vd `payments.external_id`, `ledger_entries.idempotency_key`)
- Enum dùng `varchar` hoặc `enum` type (tùy DB)

## ERD

```mermaid
erDiagram
    orders ||--o{ payments : "has many"
    payments ||--o{ ledger_entries : "generates"
    orders ||--o{ payouts : "paid via"

    orders {
        uuid id PK
        uuid customer_id
        varchar status "pending|confirm|failed|cancelled"
        decimal total_amount
        varchar currency
        timestamp created_at
        timestamp updated_at
    }

    payments {
        uuid id PK
        uuid order_id FK
        varchar provider "vnpay|momo"
        varchar status "pending|success|failed|expired"
        decimal amount
        varchar external_id UK "id của PSP gửi về"
        varchar signature
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
    }

    ledger_entries {
        uuid id PK
        uuid transaction_id "gom nhóm nhiều entry thành 1 bút toán"
        varchar bucket "psp_receivable|cash|merchant_payable|platform_fee"
        decimal amount "dương = vào, âm = ra"
        varchar reference_type "payment|settlement|refund|payout"
        uuid reference_id
        varchar idempotency_key UK
        timestamp created_at
    }

    payouts {
        uuid id PK
        uuid order_id FK
        uuid merchant_id
        decimal amount
        varchar status "pending|processing|done|failed"
        varchar bank_account
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
    }
}
```

## Giải thích bảng

| Bảng | Ý nghĩa |
|---|---|
| `orders` | Đơn hàng khách tạo (sau checkout) |
| `payments` | Lần thử thanh toán với PSP (1 order có thể nhiều attempt) |
| `ledger_entries` | Sổ cái — mỗi dòng là 1 bucket + amount, gom theo `transaction_id` để biết 1 bút toán kép gồm những dòng nào |
| `payouts` | Bảng theo dõi việc trả tiền cho merchant (tách riêng với settlement) |

## Quy tắc quan trọng

- `ledger_entries` **append-only**: chỉ INSERT. Không trigger UPDATE/DELETE
- Mỗi `transaction_id` phải có **tổng amount = 0** (check ở ứng dụng)
- `idempotency_key` unique để chống ghi trùng IPN/webhook
- `external_id` của `payments` unique để tránh xử lý lại IPN trùng
- `amount` luôn dùng `decimal(19,4)` hoặc `decimal(10,0)` (VNĐ) tránh float
