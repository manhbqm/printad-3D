# PrintAd 3D Virtual Office — Văn Phòng Ảo 3D & Điều Phối AI Ngành In Ấn Quảng Cáo

Ứng dụng mô phỏng **Văn phòng ảo 3D tương tác thời gian thực** dành cho **Công ty In Ấn & Quảng Cáo PrintAd**, kết hợp hệ thống **8 Phòng Ban Chuẩn Doanh Nghiệp (AccKit)**, đội ngũ **17 Nhân sự 3D chủ đề Doraemon** (9 Trưởng phòng & 8 Chuyên viên), hệ thống **42 Kỹ năng chuyên môn**, **16 Quy chuẩn SOP**, bộ máy **Xuất văn bản quy chuẩn pháp lý** và **Engine tính giá in ấn tự động** tích hợp trực tiếp từ [print-quote (baogiainan.88qm.top)](https://baogiainan.88qm.top/).

---

## 1. Tính năng nổi bật

* **Không gian Văn phòng 3D Sống động (`Three.js` / `WebGL`):**
  * Hệ thống phân khu 8 phòng ban tiêu chuẩn: **01-Ban Giám Đốc**, **02-Kinh Doanh B2B**, **03-Marketing & Quảng Cáo**, **04-CSKH & Dịch Vụ**, **05-Kế Toán & Chi Phí**, **06-Nhân Sự & Đào Tạo**, **07-Kho & Chuỗi Cung Ứng**, **08-Hành Chính & An Toàn**, cùng **Kỹ Thuật Chế Bản & Thiết Kế**, **Cafe Lounge** và **Game Zone (`TURBO KART`)**.
  * **17 Nhân vật 3D Doraemon tạo hình chi tiết:**
    * **9 Trưởng bộ phận:** Doraemon (CEO), Dekisugi (Kinh doanh B2B), Chaian (Marketing), Shizuka (CSKH), Suneo (Kế toán), Dorami (Nhân sự), Bác Kaminari (Kho), Thầy giáo Sensei (Hành chính), Nobita (Kỹ thuật/Thiết kế).
    * **8 Chuyên viên:** Jaiko (Nội dung), Mẹ Nobita Tamako (Kế toán thanh toán), Sewashi (Phân tích dữ liệu), Sunetsugu (Thu mua), Minidora Đỏ (Vận hành in), Bố Nobita Nobisuke (Cơ điện bảo trì), Minidora Vàng (An toàn lao động), Mẹ Chaian (Thủ kho).
    * Mô hình hữu cơ với vật liệu `MeshPhysicalMaterial` (clearcoat, sheen), chuyển động chớp mắt, đánh tay chân khi tuần tra và cử chỉ gật đầu/vung tay khi trò chuyện.

* **Tự động Đi lại & Giao tiếp Nhóm (`Autonomous Social Patrol`):**
  * Nhân sự tự động di chuyển giữa các điểm làm việc và giao tiếp, quay mặt trực diện vào nhau (`lookAt`), hiển thị bong bóng thoại 3D (`chatBubbleSprite`) và bảng hội thoại thời gian thực.
  * Nút **`💬 Tụ họp giao lưu`** cho phép triệu tập toàn bộ các trưởng phòng về sảnh trung tâm để họp nhanh.

* **Engine Tính Giá Báo Giá In Ấn Tự Động ([baogiainan.88qm.top](https://baogiainan.88qm.top/)):**
  * Tích hợp toàn diện thuật toán từ dự án [print-quote](https://github.com/manhbqm/print-quote):
    * **6 Dòng máy in:** Listron 4, Listron 8 (1 & 4 màu), Misu Diamond, Komori Lithrone, Heidelberg (72×102) và hệ KTS.
    * **93 Loại giấy & vật tư:** Couche Hi-kote/Pindo, Offset, Ivory Ningbo, Kraft, Duplex, Bristol, Decal Amazon cuộn/tờ, tem UV DTF.
    * **8 Chiến lược sản phẩm:** Tờ rơi (`flyer`), Catalogue bìa+ruột (`catalogue`), Túi giấy 1-2 mảnh (`bag`), Kẹp file Folder tai gấp 7cm (`folder`), Phong bì thư A4/A5/A6 & Lì xì (`envelope`/`lixi`), Tem UV DTF khổ tờ & cuộn mét (`uv_dtf`), In nhanh KTS (`digital`), Bạt Hiflex/Decal PP/Mica LED (`hiflex`).
    * **Bóc tách 5 dòng minh bạch:** Tiền giấy tối ưu, công in ấn, gia công hoàn thiện (cán màng mờ/bóng, bế dán, đóng ghim/keo), lợi nhuận định mức động theo MOQ và thuế VAT 8%.

* **Hệ thống 42 Kỹ Năng AccKit & 16 Quy chuẩn SOP:**
  * **12 Kỹ năng văn phòng chung:** Trả lời email, lập báo cáo, quản lý công việc, chuẩn bị cuộc họp, kho hỏi đáp, xử lý dữ liệu...
  * **30 Kỹ năng chuyên sâu:** Bóc tách BOM, đàm phán hợp đồng, phân tích RFQ, kế toán chi phí Standard Costing, bảo mật PII/giá vốn, quản lý kho an toàn, báo cáo sự cố chất lượng 8D, tối ưu SEO/AEO...
  * **Xuất văn bản quy chuẩn pháp lý 1 chạm:** Hợp đồng kinh tế thương mại, Phiếu giao hàng kiêm biên bản bàn giao 02 liên, Báo cáo xử lý khiếu nại 8D, Email phản hồi B2B song ngữ, Biên bản cuộc họp ban giám đốc, Quy trình thao tác chuẩn ISO SOP, Bảng Kanban theo dõi sản xuất, Hồ sơ năng lực công ty.

---

## 2. Cấu trúc thư mục

```text
├── server.ts                                  # Server Express + Vite middleware + API /api/agent/execute-task
├── src/
│   ├── App.tsx                                # Giao diện HUD điều khiển nổi, modal văn bản pháp lý & thông tin nhân sự
│   ├── components/
│   │   ├── VirtualOffice3D.tsx                # Cảnh văn phòng 3D, camera, 17 nhân vật Doraemon & bong bóng hội thoại
│   │   └── BottomControlDock.tsx              # Bảng điều khiển Giao brief, Bộ công cụ báo giá nhanh, AccKit 42 kỹ năng & SOPs
│   ├── data/
│   │   └── officeData.ts                      # Dữ liệu 17 nhân sự Doraemon, 8 phòng ban, 42 kỹ năng AccKit & 16 tài liệu SOP
│   ├── types/
│   │   └── office.ts                          # Định nghĩa TypeScript interfaces cho toàn bộ hệ thống
│   └── utils/
│       ├── doraemonCharacterBuilder.ts        # Bộ dựng mô hình 3D chi tiết cho 17 nhân vật Doraemon
│       ├── printQuoteEngine.ts                # Cầu nối tích hợp Engine Báo Giá In Ấn Tự Động (baogiainan.88qm.top)
│       ├── printQuote/                        # Thuật toán bình trang, 6 dòng máy in, 93 loại giấy & 8 chiến lược bóc tách
│       ├── officeLogic.ts                     # Logic tính toán, định tuyến chỉ thị CEO, bộ máy sinh văn bản pháp lý
│       └── officeLogic.test.ts                # Bộ 12 Unit Tests kiểm thử toàn diện các hàm nghiệp vụ
```

---

## 3. Hướng dẫn cài đặt và chạy trên máy tính (Local)

### Yêu cầu hệ thống
* **Node.js** phiên bản `18.x` hoặc `20.x+`
* **npm** phiên bản `9.x+`

### Các bước thực hiện

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường (Tùy chọn):**
   * Sao chép file `.env.example` thành `.env`:
     ```bash
     cp .env.example .env
     ```
   * Mở file `.env` và điền `GEMINI_API_KEY` nếu muốn sử dụng Gemini AI sinh báo cáo mở rộng (nếu chạy ở máy cá nhân có thể mở chú thích `GEMINI_MODEL="gemini-2.5-flash"`).
   * *Lưu ý:* Ngay cả khi chưa điền `GEMINI_API_KEY`, ứng dụng vẫn hoạt động đầy đủ 100% nhờ bộ máy tính báo giá và quy chuẩn SOP nội bộ (`src/utils/officeLogic.ts` & `src/utils/printQuoteEngine.ts`).

3. **Chạy server phát triển (Development):**
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại địa chỉ: `http://localhost:3000`

4. **Chạy kiểm thử đơn vị (Unit Tests) & Kiểm tra kiểu (Typecheck):**
   ```bash
   npm test
   npm run lint
   ```

5. **Build đóng gói sản xuất (Production Build):**
   ```bash
   npm run build
   ```
