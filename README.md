# Vietnam Atlas · Hệ sinh thái du lịch Việt Nam 2026

Hệ sinh thái nền tảng du lịch kết nối khách du lịch trong và ngoài nước qua 11 vùng điểm đến và 34 đơn vị hành chính Việt Nam (cập nhật 2026). Thiết kế theo phong cách **Sunlit Limestone** tươi sáng, nhẹ nhàng, tối ưu trải nghiệm cuộn điện ảnh đa bình diện với công nghệ **ScrollCraft**.

---

## 🌟 Kiến trúc 3 trang web liên thông

1. **Khám phá (`index.html`)**:
   - **Hero Parallax 5 lớp**: Thuyền buồm trên Vịnh Hạ Long, header trong suốt hòa quyện vào cảnh quan thiên nhiên.
   - **Expedition Launcher**: Bộ tìm kiếm nhanh chặng bay Round-Trip (Khứ hồi) / One-way (Một chiều) với hiệu ứng trượt mượt mà.
   - **Interactive S-Curve Map & Workbench**: Bản đồ chữ S tương tác bằng vector SVG, tích hợp mùa nắng mưa, cảnh báo bão và lưới dịch vụ.
   - **Scenic Triptych & Flagship Peak Showcase**: Tour vịnh ngọc Hạ Long lên thung lũng mây Mai Châu (2N1Đ) với video scrub đồng bộ theo cuộn.
   - **Pan Rail 12 tuyến Tour chọn lọc**: Cuộn ngang mượt mà thêm tour trực tiếp vào lộ trình.
   - **Studio eSIM 5G & E-Giftcards**: Thẻ quà tặng điện tử và tư vấn SIM số theo địa hình vùng núi/biển đảo.
   - **Ground-Truth Protocols (Supports 112–115)**: Số liệu thực tế tự động chạy mượt khi cuộn tới và giữ nguyên hiển thị.
   - **S-Curve Route Ledger**: Sổ lộ trình chữ S ghim góc màn hình, tự động cập nhật chi phí và số mục.

2. **Đặt dịch vụ (`explore.html` - Booking Portal)**:
   - Cổng chi tiết đặt vé máy bay, phòng khách sạn (Hotels & Homes), tour trọn gói, eSIM và thẻ quà tặng.
   - Lọc đa chiều: Khoảng giá, loại hình lưu trú, khu vực, thời gian đi/về.
   - Lưu trữ và đồng bộ tức thì vào giỏ hành trình qua `VietnamAtlasStore`.

3. **Quản trị CMS (`admin.html`)**:
   - Trang quản trị dành cho đối tác / điều hành: quản lý danh sách booking, trạng thái duyệt đơn, doanh thu và cấu hình giá vé.
   - Tự động đồng bộ 2 chiều với Portal và Landing Page qua `localStorage` và `BroadcastChannel`.

---

## 🚀 Hướng dẫn khởi chạy nhanh

### Cách 1: Sử dụng Node.js / npm
```bash
# Cài đặt (nếu cần)
npm install

# Khởi chạy server tĩnh
npm start
# Server sẽ lắng nghe tại: http://localhost:4512
```

### Cách 2: Sử dụng Python
```bash
python -m http.server 4512 -d scrollcraft/builds/vietnam-atlas
# Truy cập http://localhost:4512 trên trình duyệt
```

### Cách 3: Mở trực tiếp
Mở file `index.html` ở thư mục gốc hoặc truy cập trực tiếp `scrollcraft/builds/vietnam-atlas/index.html`.

---

## 📁 Cấu trúc thư mục

```text
webtour/
├── index.html                   # Redirect thông minh vào portal chính
├── package.json                 # Cấu hình script npm start & dev
├── README.md                    # Tài liệu hướng dẫn dự án
├── .gitignore                   # Loại trừ node_modules, lab screenshots và file nén
└── scrollcraft/
    └── builds/
        └── vietnam-atlas/       # Toàn bộ mã nguồn sản phẩm
            ├── index.html       # Landing page (Khám phá)
            ├── explore.html     # Cổng Đặt dịch vụ (Portal)
            ├── admin.html       # Cổng Quản trị CMS
            ├── styles.css       # CSS chính (Sunlit Coastal Theme)
            ├── explore.css      # CSS cho cổng Đặt dịch vụ
            ├── admin.css        # CSS cho cổng Quản trị CMS
            ├── app.js           # Logic Landing page & tương tác
            ├── explore.js       # Logic cổng Đặt dịch vụ
            ├── admin.js         # Logic Quản trị CMS
            ├── store.js         # Store quản lý trạng thái đồng bộ
            ├── data.js          # Dữ liệu 11 vùng, tour, khách sạn, chuyến bay
            ├── scrollcraft.js   # Scroll engine lõi
            ├── scrollcraft.css  # CSS hiệu ứng cuộn ScrollCraft
            └── assets/
                ├── clips/       # Video scrub & poster mượt (H.264 no B-frames)
                ├── gen/         # Hình ảnh phối cảnh chiều sâu
                └── photos/      # Ảnh thực địa điểm đến Việt Nam
```

---

## 🎨 Tiêu chuẩn thiết kế
- **Bảng màu Sunlit Limestone**: Tông giấy sáng `#FAFBF9`, xanh ngọc bích `#096B5C`, mực rừng sâu `#102421`, tránh hoàn toàn darkmode gắt hoặc style công nghệ khô cứng.
- **Tối ưu 60fps**: Các hoạt ảnh được tính toán qua `requestAnimationFrame`, không dùng filter nặng gây drop frame khi cuộn.
- **Đa thiết bị & Khả năng truy cập**: Responsive hoàn chỉnh từ Desktop (1440px) tới Mobile (390px) và hỗ trợ chế độ giảm chuyển động (`prefers-reduced-motion`).
