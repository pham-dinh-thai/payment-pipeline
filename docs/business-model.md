# Mô hình kinh doanh

## 1. Tóm tắt

**Pharmacy OTC** là mô hình bán lẻ trực tuyến **một nhà thuốc** (single-vendor),
tập trung vào nhóm sản phẩm **không kê đơn**: thuốc OTC, thực phẩm chức năng,
mỹ phẩm dược và thiết bị y tế dùng tại nhà.

Khách hàng đặt hàng qua website, nhà thuốc tự quản lý tồn kho theo lô, hạn sử
dụng, nhà cung cấp và giao hàng. Hệ thống không phải sàn thương mại điện tử,
không có merchant thứ ba, không bán thuốc kê đơn.

Giá trị cốt lõi:

> Mua thuốc/kem/vitamin đúng thứ mình cần, biết rõ nguồn gốc và hạn dùng, đặt
> nhanh và được giao trong ngày — không cần đến quầy xếp hàng.

## 2. Vấn đề của khách hàng

| Vấn đề | Hệ quả |
|---|---|
| Hiệu thuốc gần nhà hết hàng hoặc không có đúng loại | Phải đi nhiều nơi, nhất là khi trẻ nhỏ đang sốt |
| Không rõ hạn dùng, lô sản xuất | Lo mua phải hàng cận hạn, hàng giả |
| Giá và hướng dẫn dùng không minh bạch | Mua sai liều, mua thừa |
| Đi lại, chờ đợi, trông con nhỏ | Mất thời gian, trải nghiệm kém |
| Sản phẩm cho cả gia đình nằm rải rác nhiều nơi | Khó mua một lần đủ |

## 3. Giải pháp / tuyên bố giá trị

- **Danh mục có chọn lọc**: chỉ OTC, TPCN, mỹ phẩm dược, thiết bị y tế — không
  trộn thuốc kê đơn hay dịch vụ y tế.
- **Minh bạch theo lô**: mỗi sản phẩm gắn lô, hạn dùng, giá nhập; tồn kho hiển
  thị theo lô còn bán được.
- **Giao nhanh trong đô thị**: nội thành giao trong ngày, đơn gấp giao 2–4 giờ.
- **Hướng dẫn dùng rõ ràng**: thông tin sản phẩm, liều dùng tham khảo, cảnh báo
  đối tượng cần hỏi dược sĩ/bác sĩ.
- **Mua lặp lại dễ**: danh sách sản phẩm thường dùng, nhắc mua lại, nhiều địa
  chỉ giao.

## 4. Mô hình kinh doanh (Business Model Canvas rút gọn)

| Thành phần | Nội dung |
|---|---|
| **Customer segments** | Chính: phụ huynh có con nhỏ 25–40 tuổi ở đô thị. Phụ: nhân viên văn phòng 22–35, người chăm sóc/mua hộ người lớn tuổi. Xem [customers.md](customers.md). |
| **Value propositions** | Đúng hàng, rõ lô/hạn dùng, giao nhanh, giá minh bạch, mua được cả giỏ cho gia đình |
| **Channels** | Website responsive (kênh chính của đồ án), điện thoại/hotline, cửa hàng vật lý để nhận hàng |
| **Customer relationships** | Tự phục vụ trên web; hỗ trợ qua hotline/chat; dược sĩ tư vấn khi cần; chương trình khách quen |
| **Revenue streams** | Chênh lệch giá bán – giá nhập; phí giao hàng; không thu phí sàn, không quảng cáo |
| **Key resources** | Danh mục sản phẩm, tồn kho theo lô, nhà thuốc đạt chuẩn, dược sĩ, hệ thống đặt hàng |
| **Key activities** | Chọn và nhập hàng, kiểm soát hạn dùng, xử lý đơn, giao hàng, chăm sóc khách, kiểm kê |
| **Key partners** | Nhà phân phối/nhà thuốc đầu mối, đơn vị vận chuyển, cổng thanh toán (giai đoạn sau) |
| **Cost structure** | Giá vốn hàng bán, mặt bằng/kho, lương dược sĩ và nhân viên, vận chuyển, marketing, hao hụt/hết hạn |

## 5. Cách tạo doanh thu

Nguồn thu chính là **lợi nhuận gộp trên sản phẩm**:

```
Lợi nhuận gộp = Giá bán - Giá nhập (theo lô)
Doanh thu thuần = Doanh thu bán hàng - Giảm giá - Hoàn trả
```

Nguồn thu phụ:

- **Phí giao hàng**: miễn phí cho đơn từ ngưỡng nhất định, thu phí với đơn nhỏ
  hoặc giao gấp.
- **Combo/giỏ gia đình**: bán theo nhóm (hạ sốt + ORS + nhiệt kế) để tăng giá
  trị đơn trung bình.

Chủ động **không** làm:

- Không thu phí hoa hồng từ nhà cung cấp.
- Không bán vị trí quảng cáo trong danh mục.
- Không bán thuốc kê đơn, không cung cấp dịch vụ khám/chữa bệnh.
- Không mở sàn cho merchant khác bán.

## 6. Kinh tế đơn vị (số minh hoạ cho đồ án)

Các số dưới đây là **giả định để trình bày**, không phải dữ liệu thực:

| Chỉ số | Giả định |
|---|---|
| Giá trị đơn trung bình (AOV) | 250.000 ₫ |
| Tỷ lệ lợi nhuận gộp | 22–28% |
| Lợi nhuận gộp/đơn | ~60.000 ₫ |
| Chi phí giao hàng/đơn | 18.000–25.000 ₫ |
| Chi phí thu hút khách (CAC) | 40.000–70.000 ₫ |
| Số đơn/năm của khách quay lại | 4–6 |
| Điểm hoà vốn lý thuyết | ~2–3 đơn/khách/năm |

Hàm ý: mô hình phụ thuộc vào **tỷ lệ mua lặp lại** và **giỏ hàng đủ lớn**, không
phụ thuộc vào việc bán thật nhiều SKU.

## 7. Lợi thế cạnh tranh

1. **Kiểm soát lô và hạn dùng ở mức hệ thống** — đúng thứ các hiệu thuốc nhỏ
   thường làm thủ công.
2. **Danh mục hẹp, sâu** — tập trung vào nhu cầu gia đình thay vì bán mọi thứ.
3. **Trải nghiệm đặt hàng nhanh** — giỏ hàng nhỏ, ít bước, phù hợp phụ huynh
   đang bận.
4. **Minh bạch thông tin** — giá, đơn vị, hạn dùng, lô; giảm lo lắng hàng giả.
5. **Dữ liệu vận hành** — biết sản phẩm nào sắp hết hạn, bán chậm, cần nhập lại.

## 8. Chỉ số theo dõi

| Nhóm | Chỉ số |
|---|---|
| Tăng trưởng | Số đơn/ngày, khách mới, tỷ lệ quay lại |
| Bán hàng | AOV, số sản phẩm/đơn, tỷ lệ huỷ đơn |
| Tồn kho | Tỷ lệ hết hàng, giá trị tồn, số lô sắp hết hạn, hao hụt |
| Vận hành | Thời gian xử lý đơn, thời gian giao, tỷ lệ giao trễ |
| Chất lượng | Tỷ lệ hoàn/đổi, khiếu nại, điểm hài lòng |
| Tài chính | Lợi nhuận gộp, chi phí vận hành, dòng tiền |

## 9. Rủi ro và cách giảm thiểu

| Rủi ro | Giảm thiểu |
|---|---|
| Bán nhầm thuốc kê đơn | Danh mục chỉ chứa OTC; kiểm duyệt sản phẩm; cảnh báo rõ trên web |
| Hàng giả, hàng trôi nổi | Chỉ nhập từ nhà phân phối có hợp đồng; lưu lô, nhà cung cấp, chứng từ |
| Hàng hết hạn | Quản lý theo lô + hạn dùng; báo cáo cận hạn; xuất kho theo FEFO |
| Tư vấn sai | Nội dung chỉ mang tính tham khảo; chuyển dược sĩ/bác sĩ khi có dấu hiệu nguy hiểm |
| Giao hàng trễ | Đặt SLA theo khu vực; theo dõi trạng thái đơn |
| Giá cạnh tranh từ chuỗi lớn | Tập trung vào nhóm khách gia đình, dịch vụ và giao nhanh |
| Phụ thuộc một vài nhà cung cấp | Duy trì ít nhất 2 nguồn cho nhóm bán chạy |

## 10. Vì sao mô hình này phù hợp với đồ án

- Có **nghiệp vụ đủ sâu** để thể hiện kiến trúc: lô, hạn dùng, nhập kho, xuất
  kho, kiểm kê, nhà cung cấp, chi phí, audit.
- Có **ràng buộc thực tế** buộc phải thiết kế đúng: tiền là số nguyên VND, tồn
  kho không được âm, không bán hàng hết hạn.
- Có **phạm vi rõ ràng** để không sa vào bài toán kê đơn, bảo hiểm, bệnh án.
- Phù hợp để trình bày cả **backend** (CQRS, transaction, outbox) và **sản phẩm**
  (persona, hành trình, phạm vi).

## 11. Giới hạn của đồ án

- Không có giấy phép kinh doanh dược thật, không vận hành thật.
- Không tích hợp thanh toán, vận chuyển, hoá đơn điện tử trong phiên bản hiện
  tại; đây là thiết kế ở giai đoạn sau.
- Dữ liệu sản phẩm/khách hàng chỉ để demo.
- Các thông tin về liều dùng/chỉ định trên website (nếu có) chỉ là nội dung
  tham khảo, không thay thế tư vấn của dược sĩ/bác sĩ.
