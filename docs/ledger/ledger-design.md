# Ledger Design

## 1. Mục đích

- **Payment** = lịch sử sự kiện (lần thu tiền này thành công hay chưa)
- **Ledger** = số dư hiện tại (tiền đang ở đâu, của ai, còn bao nhiêu)

Ledger là bảng **append-only**: chỉ INSERT, không UPDATE/DELETE. Ghi sai thì
ghi thêm transaction đảo (reversal).

Mọi sự kiện tiền chạy qua nền tảng đều ghi vào ledger: capture, settlement,
refund, payout. Chi tiêu nội bộ công ty (mua sắm, lương...) **không** thuộc
ledger này.

## 2. Buckets (tài khoản)

Mỗi bucket là 1 ô tiền, balance = tổng các dòng liên quan.

| Bucket            | Loại      | Ý nghĩa                                    |
|-------------------|-----------|--------------------------------------------|
| `psp_receivable`  | Asset     | PSP đang nợ mình (đã trừ phí PSP)          |
| `cash`            | Asset     | Tiền thật trong bank                        |
| `merchant_payable`| Liability | Tiền mình đang giữ hộ, phải trả merchant   |
| `platform_fee`    | Revenue   | Phí nền tảng mình thu                      |

Không cần bucket `psp_fee` ở v1: PSP trừ phí tại nguồn (100k vào, chỉ 97.5k
là tiền của mình), phần 2.5k không bao giờ vào sổ mình. Nếu sau này PSP xuất
hóa đơn phí riêng (bill theo tháng) thì mới thêm bucket `psp_fee_expense`.

## 3. Ghi sổ theo thời điểm

Case mẫu: client trả 100k → merchant 97k, platform 0.5k, PSP giữ 2.5k.

Mỗi transaction gồm nhiều dòng `(bucket, amount)`, quy ước:
**amount > 0 = tiền vào bucket, amount < 0 = tiền ra bucket**, tổng mỗi
transaction luôn = 0.

### Capture — nhận event `payment.success`

| Bucket             | Amount  |
|--------------------|---------|
| `psp_receivable`   | +97,500 |
| `merchant_payable` | -97,000 |
| `platform_fee`     |    -500 |
| **Tổng**           | **0**   |

Ý nghĩa: PSP nợ mình 97.5k; trong đó 97k là nợ merchant, 0.5k là doanh thu.

### Settlement — PSP chuyển tiền về bank

| Bucket           | Amount  |
|------------------|---------|
| `psp_receivable` | -97,500 |
| `cash`           | +97,500 |
| **Tổng**         | **0**   |

### Refund — hoàn tiền cho client

TODO (quyết định của mày):
- PSP có hoàn phí 2.5k không? → quyết định số tiền hoàn cho client
  (100k nếu PSP hoàn phí, 97.5k nếu không)
- Platform có hoàn phí 0.5k không?
- Merchant chịu phần nào?

Cách ghi: transaction đảo tương ứng với capture và/hoặc settlement (amount
đảo dấu), không sửa dòng cũ.

### Payout — chuyển tiền cho merchant rút

| Bucket             | Amount  |
|--------------------|---------|
| `merchant_payable` | +100,000 |
| `cash`             | -100,000 |
| **Tổng**           | **0**    |

(Amount tùy số merchant rút.)

## 4. Idempotency

Mỗi ledger transaction có `idempotency_key`, ví dụ:
- `capture:{payment_id}`
- `settlement:{psp_settlement_id}`
- `refund:{payment_id}:{refund_seq}`

DB có UNIQUE constraint trên key này. IPN gửi 10 lần → lần 2 insert fail →
bỏ qua, không ghi trùng.

Trigger ghi sổ: lắng nghe event `payment.success` (đã mô tả ở
payment-lifecycle.md), không ghi trực tiếp trong webhook handler.

## 5. Kiểm tra đúng/sai

2 tầng, khác nhau:

1. **Tại thời điểm ghi** (code): mỗi transaction check `sum(amount) == 0`,
   lệch thì reject. Bắt lỗi bug ngay lập tức.
2. **Đối soát** (Reconciliation, module riêng): so ledger với file
   settlement của PSP và bank statement. Bắt lỗi thiếu/trùng/lệch mà tầng 1
   không thấy.

Sổ cân (`tổng = 0`) chỉ là điều kiện cần, không đủ: webhook mất → không ghi
gì → vẫn cân nhưng thiếu giao dịch; IPN trùng → ghi đôi → vẫn cân nhưng sai.
Tầng 2 mới bắt được các case đó.

## 6. Truy vấn thường dùng

- Merchant còn bao nhiêu chưa trả: `SUM(amount)` của `merchant_payable`
  (âm = mình nợ merchant)
- Doanh thu platform: `SUM(amount)` của `platform_fee`
- Tiền đang chờ PSP trả: `SUM(amount)` của `psp_receivable`
- Mọi dòng của 1 payment: filter theo `reference_id = payment_id`

## 7. Ngoài scope v1

- Multi-currency
- Chargeback
- PSP bill phí riêng (thêm bucket `psp_fee_expense`)
- Đối soát từng merchant (chỉ đối soát tổng với PSP)
