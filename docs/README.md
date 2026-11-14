# Tài liệu dự án Pharmacy OTC

Bộ tài liệu cho đồ án demo website nhà thuốc bán **thuốc không kê đơn (OTC)**,
thực phẩm chức năng, mỹ phẩm dược và thiết bị y tế.

> Đây là đồ án học tập/portfolio. Dữ liệu và số liệu trong tài liệu chỉ để minh
> hoạ, không phải hệ thống đang vận hành thật và không dùng để tư vấn y tế.

## Đọc theo thứ tự

| # | Tài liệu | Nội dung |
|---|---|---|
| 1 | [business-model.md](business-model.md) | Mô hình kinh doanh, giá trị, dòng tiền, chi phí, chỉ số |
| 2 | [customers.md](customers.md) | Chân dung khách hàng, nhu cầu, hành vi, ảnh hưởng tới thiết kế |
| 3 | [scope.md](scope.md) | Phạm vi kinh doanh, phân kỳ, ràng buộc pháp lý |
| 4 | [actors.md](actors.md) | Tác nhân hệ thống và quyền tương ứng |
| 5 | [functional-requirements.md](functional-requirements.md) | Yêu cầu chức năng theo module và trạng thái |
| 6 | [non-functional-requirements.md](non-functional-requirements.md) | Bảo mật, hiệu năng, độ tin cậy, khả năng bảo trì |
| 7 | [architecture.md](architecture.md) | Kiến trúc, luồng CQRS, outbox, transaction boundary |
| 8 | [tech-stack.md](tech-stack.md) | Công nghệ, phiên bản, lý do chọn |
| 9 | [data-model.md](data-model.md) | ERD và mô tả bảng hiện có |

## Quy ước trạng thái

| Ký hiệu | Nghĩa |
|---|---|
| ✅ | Đã triển khai và có test |
| 🟡 | Đã có một phần (domain/entity/API chưa đủ) |
| ⬜ | Chưa triển khai, nằm trong kế hoạch |
| ❌ | Chủ động không làm trong phạm vi đồ án |

## Tài liệu thiết kế tham khảo

Các thư mục dưới đây là thiết kế chi tiết cho giai đoạn thanh toán/đơn hàng và
**chưa được triển khai trong code**:

- [checkout/](checkout/) — luồng chốt đơn
- [payment/](payment/) — vòng đời thanh toán với PSP
- [ledger/](ledger/) — sổ cái

Mô hình trong các tài liệu này được viết cho nền tảng nhiều merchant. Khi áp
dụng cho nhà thuốc bán lẻ một chủ, cần bỏ các bucket/khái niệm
`merchant_payable`, `platform_fee`, `payout` và chỉnh lại theo luồng bán lẻ.
