# PrintAd 3D Virtual Office — Văn Phòng Ảo 3D & Điều Phối AI Ngành In Ấn Quảng Cáo

Ứng dụng mô phỏng **Văn phòng ảo 3D tương tác thời gian thực** dành cho **Công ty In Ấn & Quảng Cáo PrintAd**, kết hợp đội ngũ **5 Trưởng bộ phận chủ đề Doraemon** và **12 chuyên viên agency** (`17 nhân sự` hoạt động trực tiếp trong không gian 3D) cùng hệ thống huấn luyện quy chuẩn **SOP** và tính báo giá tự động.

---

## 1. Tính năng nổi bật

* **Không gian Văn phòng 3D Sống động (`Three.js` / `WebGL`):**
  * 4 thảm phân khu chuyên biệt (**SEO · AEO & CSKH**, **Kế Toán**, **Kỹ Thuật Chế Bản**, **Trung Tâm Điều Phối Lounge**) cùng **Cafe Zone** và **Game Zone (`TURBO KART`)**.
  * **17 nhân vật 3D tạo hình hữu cơ chân thực:** Sử dụng `LatheGeometry`, `CapsuleGeometry`, `TubeGeometry` và vật liệu `MeshPhysicalMaterial` (clearcoat, sheen), có chuyển động chớp mắt, đánh tay chân khi bước đi và cử chỉ gật đầu/vung tay khi trò chuyện.
* **Tự động Đi lại & Giao tiếp Nhóm (`Autonomous Social Patrol`):**
  * Nhân sự tự động di chuyển giữa các điểm hội thoại, quay mặt trực diện vào nhau (`lookAt`), hiển thị bong bóng thoại 3D (`chatBubbleSprite`) và bảng hội thoại trực tiếp trên góc trái màn hình.
  * Nút **`💬 Tụ họp giao lưu`** cho phép triệu tập toàn bộ 5 trưởng phòng Doraemon về khu vực Trung tâm để họp nhanh.
* **Điều phối Nhiệm vụ Qua Doraemon & Bảng Báo Giá Ngành In (`SOP-Grounded Engine`):**
  * Giao việc trực tiếp cho **Doraemon (Quản lý chung)** hoặc từng trưởng bộ phận:
    1. **Doraemon** — Quản lý chung & Điều phối (`Central Lounge`)
    2. **Shizuka (Xuka)** — CSKH, Báo giá & Hợp đồng (`Bạt Hiflex, Decal PP, Standee, Offset, UV`)
    3. **Suneo (Xêko)** — Kế toán, Thu chi, Công nợ & Thuế VAT 8%
    4. **Nobita** — Kỹ thuật, Thiết kế & Kiểm tra file in Preflight (`CMYK, 300 DPI, tràn lề 3mm`)
    5. **Chaian (Chaien)** — Marketing, SEO, AEO & Chiến dịch quảng cáo

---

## 2. Cấu trúc thư mục

```text
├── server.ts                              # Server Express + Vite middleware + API /api/agent/execute-task
├── src/
│   ├── App.tsx                            # Giao diện HUD điều khiển nổi & quản lý trạng thái nhiệm vụ
│   ├── components/
│   │   ├── VirtualOffice3D.tsx            # Cảnh văn phòng 3D, camera, nhân sự & bong bóng hội thoại
│   │   └── BottomControlDock.tsx          # Bảng điều khiển Giao brief, Nhân sự, Sản phẩm & Quy chuẩn SOP
│   ├── data/
│   │   └── officeData.ts                  # Dữ liệu 5 trưởng phòng Doraemon, 6 phân khu & 6 tài liệu SOP
│   ├── types/
│   │   └── office.ts                      # Định nghĩa TypeScript interfaces cho toàn hệ thống
│   └── utils/
│       ├── doraemonCharacterBuilder.ts    # Bộ dựng mô hình 3D chi tiết cho 5 nhân vật Doraemon
│       ├── officeLogic.ts                 # Logic tính báo giá in ấn, định tuyến brief & kịch bản hội thoại
│       └── officeLogic.test.ts            # Bộ Unit Test kiểm thử các hàm tính toán nghiệp vụ
```

---

## 3. Hướng dẫn cài đặt và chạy trên máy tính (Local)

### Yêu cầu hệ thống
* **Node.js** phiên bản `18.x` hoặc `20.x+`

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
   * *Lưu ý:* Ngay cả khi chưa điền `GEMINI_API_KEY`, ứng dụng vẫn hoạt động đầy đủ 100% nhờ bộ máy tính báo giá và quy chuẩn SOP nội bộ (`src/utils/officeLogic.ts`).

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
