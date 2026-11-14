# Phạm vi kinh doanh

## 1. Tuyên bố phạm vi

Hệ thống là website bán lẻ **thuốc không kê đơn (OTC)**, thực phẩm chức năng,
mỹ phẩm dược và thiết bị y tế dùng tại nhà, do **một nhà thuốc** vận hành.

- Khách hàng: cá nhân/hộ gia đình mua lẻ.
- Thị trường: khu vực đô thị (giả định TP.HCM) trong đồ án.
- Kênh: website responsive; nhận hàng tại cửa hàng hoặc giao tận nơi.
- Ngôn ngữ/tiền tệ: tiếng Việt, VND.

## 2. Ngành hàng trong phạm vi

| Nhóm | Ví dụ | Ghi chú |
|---|---|---|
| **Thuốc OTC** | Paracetamol, ibuprofen, ORS, thuốc ho, kháng histamine, thuốc nhỏ mắt/mũi thông thường, sát khuẩn ngoài da | Chỉ sản phẩm bán không cần đơn; có cảnh báo đối tượng đặc biệt |
| **Thực phẩm chức năng** | Vitamin, khoáng chất, men vi sinh, omega-3, sản phẩm tăng đề kháng | Không thay thế thuốc chữa bệnh; ghi rõ "thực phẩm bảo vệ sức khoẻ" |
| **Mỹ phẩm dược** | Kem chống nắng, sữa rửa mặt, dưỡng ẩm, sản phẩm cho da nhạy cảm | Ưu tiên sản phẩm bán tại nhà thuốc |
| **Thiết bị y tế** | Nhiệt kế, máy đo huyết áp, máy nebulizer, máy hút mũi, khẩu trang, bộ sơ cứu | Thiết bị dùng tại nhà, không phải thiết bị cấy ghép |

Trong code, bốn nhóm này tương ứng enum `ProductCategory`:
`otc_medicine`, `supplement`, `cosmetics`, `medical_device`.

## 3. Ngành hàng ngoài phạm vi

| Loại | Lý do |
|---|---|
| **Thuốc kê đơn** | Cần đơn/bác sĩ, kiểm soát pháp lý, không phù hợp bán tự động |
| Thuốc gây nghiện/hướng thần | Quản lý đặc biệt, ngoài phạm vi |
| Thuốc tiêm, vaccine, sinh phẩm | Cần bảo quản lạnh và nhân sự chuyên môn |
| Thuốc đặc trị/ung thư/thuốc hiếm | Không thuộc danh mục bán lẻ |
| Dịch vụ khám/chữa bệnh, xét nghiệm | Không phải cơ sở y tế |
| Bảo hiểm y tế, thanh toán BHYT | Ngoài phạm vi đồ án |
| Bán sỉ/B2B, công nợ nhà thuốc | Mô hình B2C |
| Sàn nhiều merchant | Một chủ sở hữu, không chia hoa hồng |
| Giao hàng quốc tế | Chỉ nội địa/khu vực đô thị |
| Hàng tươi sống, thực phẩm thường | Không thuộc nhóm sản phẩm |

## 4. Phạm vi kênh và vận hành

### Kênh bán

- Website (bắt buộc đăng nhập ở phiên bản hiện tại).
- Hotline/điện thoại: nhân viên nhập đơn hộ (kế hoạch).
- Cửa hàng vật lý: nhận hàng/đổi trả.

### Vận hành trong phạm vi

- Quản lý danh mục sản phẩm và giá bán.
- Quản lý nhà cung cấp.
- Lập phiếu nhập hàng theo lô, xác nhận nhập kho.
- Quản lý tồn kho theo lô và hạn dùng.
- Xuất kho theo lô, kiểm kê/điều chỉnh tồn.
- Quản lý chi phí vận hành.
- Ghi nhật ký thao tác (audit) qua outbox.
- Phân quyền theo vai trò.

### Vận hành ngoài phạm vi (giai đoạn sau)

- Thanh toán online qua PSP, đối soát, hoàn tiền.
- Đơn vị vận chuyển, mã vận đơn, theo dõi realtime.
- Hoá đơn điện tử, kế toán thuế.
- Quản lý ca làm, lương nhân viên.
- CRM, marketing automation, loyalty.
- Ứng dụng mobile native.

## 5. Phân kỳ triển khai

### Giai đoạn 1 — Nền tảng (đã có)

- Xác thực: đăng ký, đăng nhập, refresh token.
- Phân quyền RBAC: role, permission, super admin.
- Người dùng nội bộ và khách hàng.
- Sản phẩm cơ bản (tên, giá, số lượng).
- Nhà cung cấp.
- Phiếu nhập hàng + lô + tồn kho + xuất/kiểm kê.
- Chi phí vận hành (tạo).
- Audit log qua outbox.

### Giai đoạn 2 — Danh mục và khách hàng (đang làm)

- Mở rộng sản phẩm: `sku`, `category`, `unit`, `description`, `imageUrl`.
- Tìm kiếm/lọc/phân trang danh mục.
- Hồ sơ khách hàng: tên, SĐT, ngày sinh.
- Sổ địa chỉ giao hàng.
- Trang danh mục công khai (không bắt đăng nhập).

### Giai đoạn 3 — Đơn hàng và thanh toán (kế hoạch)

- Giỏ hàng, đặt hàng, tính phí giao.
- Trạng thái đơn: `pending → confirmed → delivering → completed/cancelled`.
- Trừ tồn theo lô khi xác nhận đơn.
- Thanh toán COD/chuyển khoản; tích hợp PSP.
- Hoàn/đổi trả cơ bản.

### Giai đoạn 4 — Vận hành và báo cáo (kế hoạch)

- Danh sách/chi tiết phiếu nhập, tồn kho, lô sắp hết hạn.
- Duyệt/chi/cancel chi phí.
- Báo cáo doanh thu, lợi nhuận gộp, tồn kho, hàng cận hạn.
- Cảnh báo tồn thấp/hết hạn.

## 6. Ràng buộc pháp lý và an toàn

Đây là đồ án demo, nhưng phạm vi được thiết kế theo các nguyên tắc sau:

1. **Không bán thuốc kê đơn** — danh mục chỉ chứa OTC/TPCN/mỹ phẩm/thiết bị.
2. **Không đưa ra chẩn đoán/điều trị** — nội dung chỉ mang tính tham khảo.
3. **Cảnh báo nhóm nguy cơ** — trẻ nhỏ, phụ nữ mang thai, người bệnh nền,
   người dị ứng; khuyến nghị hỏi dược sĩ/bác sĩ.
4. **Truy xuất nguồn gốc** — lưu nhà cung cấp, số lô, hạn dùng cho từng lô.
5. **Không bán hàng hết hạn** — kiểm tra hạn dùng trước khi xuất kho (mục tiêu;
   hiện tại API xuất kho nhận batchId cụ thể, chưa tự chặn theo hạn).
6. **Bảo vệ dữ liệu cá nhân** — không đưa thông tin sức khoẻ nhạy cảm vào demo;
   dữ liệu khách chỉ ở mức tối thiểu để giao hàng.

> Trong vận hành thật, cần tuân thủ Luật Dược, quy định về thương mại điện tử,
> bảo vệ dữ liệu cá nhân và các yêu cầu của cơ quan quản lý địa phương. Đồ án
> không đại diện cho tư vấn pháp lý.

## 7. Tiêu chí hoàn thành bản demo

- Khách đăng ký/đăng nhập được.
- Quản trị tạo được sản phẩm, nhà cung cấp, phiếu nhập; xác nhận phiếu nhập
  sinh ra lô và tồn kho.
- Xuất kho/kiểm kê cập nhật đúng tồn theo lô.
- Tạo được chi phí và xem được audit log.
- Phân quyền chặn được người không có quyền.
- Có migration, test, build và hướng dẫn chạy trong README.
- Tài liệu mô tả rõ phần đã làm, phần chưa làm.

## 8. Không phải là gì

- Không phải hệ thống bệnh án/EMR.
- Không phải sàn thương mại điện tử nhiều người bán.
- Không phải hệ thống kê đơn/liên thông đơn thuốc quốc gia.
- Không phải hệ thống kế toán/tài chính đầy đủ.
- Không phải sản phẩm y tế đã được cấp phép để kinh doanh thật.
