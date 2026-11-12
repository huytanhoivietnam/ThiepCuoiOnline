# Thiệp cưới Quang Huy & Ngọc Lan

## Mở và chỉnh sửa thiệp

Giải nén toàn bộ project, sau đó mở `dist/index.html` bằng trình duyệt. Bấm **Mở thiệp** để xem hiệu ứng cánh hoa và nghe **Em Đồng Ý (I Do)**.

Để chạy qua máy chủ cục bộ, mở Terminal tại thư mục chứa README này và chạy:

```sh
python3 -m http.server 8000 --directory dist
```

Mở `http://localhost:8000`. Bạn có thể sửa nội dung trong `dist/index.html`, kiểu chữ và hiệu ứng trong `dist/styles.css`, tương tác trong `dist/app.js`. Ảnh, nhạc và mã QR nhà trai nằm trong `dist/assets/`. Để triển khai lên dịch vụ lưu trữ web tĩnh, dùng `dist/` làm thư mục xuất bản.

Mã QR trong `chia-se/` mở đường dẫn thiệp hiện tại. Nếu đổi tên miền, hãy tạo lại mã này. Bản đồ Google Maps và các phông chữ tải từ Google Fonts cần kết nối Internet.

Website tĩnh HTML/CSS/JavaScript, triển khai từ thư mục `dist`. Thiết kế được chỉnh theo mẫu [Hồng Phong của ZenLove](https://zenlove.me/template/hong-phong), dùng nền giấy, kiến trúc, phong bì đỏ và hoa từ mẫu tham chiếu. Các asset nguồn được ghi trong `ASSETS.md`.

## Thông tin đã thay theo thiệp người dùng cung cấp

- Chú rể: **Nguyễn Đào Quang Huy** (đã được người dùng xác nhận chữ đệm Đào).
- Cô dâu: **Nguyễn Thị Ngọc Lan**.
- Nhà trai: ông **Nguyễn Văn Quang**, bà **Ngô Thị Tâm**.
- Nhà gái: bà **Vũ Thị Duyên**. Không thêm thông tin bố cô dâu vì ảnh không có.
- Chủ nhật **29/11/2026**, âm lịch **21/10 năm Bính Ngọ** theo thiệp in.
- Tiệc cưới **10:00**; lễ thành hôn **15:00**, múi giờ Việt Nam UTC+7.
- Địa điểm: **Nhà Văn Hóa Cụm 1, Thôn Vĩnh Kỳ, Tân Hội, xã Ô Diên, Hà Nội**.
- Bản đồ nhà trai: https://maps.app.goo.gl/LovpuDx6ZJKAN22P7 . Link chuyển hướng đến tọa độ `21.099740,105.697812`. QR mã hóa chính xác link gốc; đã giải mã kiểm tra bằng zxing-cpp cả bản gốc và kích thước hiển thị.
- Đã bỏ toàn bộ phần mừng cưới, nút và hộp thoại liên quan.

## Chức năng

Mở thiệp, nhạc tùy chọn, lịch và đếm ngược đến tiệc cưới 10:00, QR bản đồ và nút mở Google Maps, Google Maps nhúng, album phóng to ảnh. Dùng `?khach=Tên%20khách` để thay tên khách mời an toàn bằng `textContent`.

**Ảnh cưới hiện vẫn là ảnh minh họa Unsplash.** Form RSVP **chỉ lưu trên thiết bị** bằng localStorage, chưa có máy chủ nhận hồi đáp; trạng thái này được ghi rõ cạnh nút gửi. Giữ chế độ riêng tư của Site khi triển khai.
