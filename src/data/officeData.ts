import { AgentProfile, OfficeZone, SopDocument, TaskAssignment } from '../types/office';

export const OFFICE_ZONES: OfficeZone[] = [
  {
    id: 'overview',
    name: 'Toàn cảnh PrintAd Agency 3D — Biệt đội Doraemon & 17 Nhân sự',
    shortLabel: 'Toàn cảnh',
    category: 'common',
    accentHex: '#f59e0b',
    center: { x: 0, y: 0, z: 0 },
    size: { width: 34, depth: 23 },
    cameraPosition: { x: -2.4, y: 16.2, z: 24.6 },
    cameraTarget: { x: 0.5, y: -0.2, z: 1.0 },
    description:
      'Không gian văn phòng 3D nổi trên mặt nước hồ sen đêm của PrintAd Agency với 17 nhân sự (dẫn đầu bởi Trưởng phòng Quản lý chung Doraemon cùng Shizuka, Suneo, Nobita, Chaian), tích hợp Quầy Cà Phê, Khu Kỹ Thuật - Thiết Kế, Khu CSKH - SEO/AEO, Khu Kế Toán, Lounge Trung Tâm và Game Zone (Turbo Kart & Arcade).',
    keyEquipment: [
      'Quầy Cà Phê gỗ ấm áp kèm bảng đèn Neon "CÀ PHÊ" & bàn tròn thư giãn',
      'Khu Game Zone với màn hình lớn "TURBO KART", sofa đỏ & dàn máy thùng Arcade phát sáng',
      'Các cụm bàn làm việc 4 chỗ trên thảm bo tròn (Kỹ thuật, SEO · AEO / CSKH, Kế toán)',
      'Hồ nước đêm bao quanh văn phòng với lá sen xanh, bồn cây nhiệt đới & phòng họp vách kính'
    ],
    aiSpatialInteraction:
      'Nhân sự tự động đi lại, ngồi uống cà phê, chơi game giải trí hoặc làm việc tại bàn. Khi Giám đốc bấm "Giao brief", Doraemon lập tức điều phối cho Shizuka, Suneo, Nobita hoặc Chaian thực thi và trả kết quả báo cáo trực tiếp.'
  },
  {
    id: 'lobby',
    name: 'Khu Cà Phê & Giao Dịch Khách Hàng (CÀ PHÊ BAR)',
    shortLabel: 'Quầy Cà Phê',
    category: 'common',
    accentHex: '#f59e0b',
    center: { x: -8.5, y: 0, z: 7.4 },
    size: { width: 11, depth: 5.8 },
    cameraPosition: { x: -7.5, y: 5.2, z: 14.5 },
    cameraTarget: { x: -8.2, y: 1.0, z: 6.8 },
    description:
      'Không gian Quầy Cà Phê gỗ lam ấm áp ngay góc trái tiền sảnh với đèn Neon "CÀ PHÊ", máy pha Espresso và các bàn tròn nơi Shizuka tiếp khách, trao đổi Hợp đồng mua bán, Phiếu giao hàng và nhân sự ngồi thưởng thức cà phê.',
    keyEquipment: [
      'Quầy Bar Cà Phê ốp gỗ lam dọc kèm máy pha Espresso & tủ bánh',
      'Bảng hiệu đèn Neon "CÀ PHÊ" phát sáng trên khung vách ngăn',
      'Cụm bàn tròn gỗ & ghế bistro nơi nhân sự ngồi uống cà phê, trao đổi brief'
    ],
    aiSpatialInteraction:
      'Nhân viên thường xuyên đi bộ ra quầy pha cà phê, ngồi trò chuyện tại bàn tròn; Shizuka (Xuka) dùng khu vực này để đón khách và bàn giao Hợp đồng, Phiếu giao hàng.'
  },
  {
    id: 'coworking',
    name: 'Khu Giải Trí Game Zone (TURBO KART & ARCADE) & Lounge Trung Tâm',
    shortLabel: 'Game Zone & Lounge',
    category: 'common',
    accentHex: '#ec4899',
    center: { x: 11.2, y: 0, z: 3.6 },
    size: { width: 9.5, depth: 7.2 },
    cameraPosition: { x: 10.5, y: 5.5, z: 12.2 },
    cameraTarget: { x: 10.5, y: 1.1, z: 3.2 },
    description:
      'Góc thư giãn sáng tạo bên phải văn phòng với bảng hiệu đèn Neon "GAME ZONE", màn hình lớn đang chạy game đua xe "TURBO KART", sofa đỏ, 2 máy điện tử thùng Arcade phát sáng và khu sofa tròn ở trung tâm.',
    keyEquipment: [
      'Màn hình TV lớn hiển thị game đua xe "TURBO KART" & đèn Neon GAME ZONE',
      'Dàn máy điện tử thùng Arcade (Tím & Vàng) và tủ máy gắp thú phát sáng',
      'Sofa cong trắng & ghế bành cam tại Lounge trung tâm văn phòng'
    ],
    aiSpatialInteraction:
      'Trong thời gian nghỉ, các nhân viên di chuyển sang Game Zone ngồi sofa chơi Turbo Kart hoặc đứng bấm máy thùng Arcade để tái tạo năng lượng sáng tạo.'
  },
  {
    id: 'meeting',
    name: 'Phòng Họp Vách Kính & Điều Phối Chiến Lược',
    shortLabel: 'Phòng họp Kính',
    category: 'common',
    accentHex: '#6366f1',
    center: { x: -10.5, y: 0, z: -6.2 },
    size: { width: 9.5, depth: 6.2 },
    cameraPosition: { x: -6.5, y: 6.2, z: 1.5 },
    cameraTarget: { x: -10.0, y: 0.8, z: -6.0 },
    description:
      'Phòng họp và điều hành vách kính khung đen sang trọng phía sau bên trái với thảm xanh lam, kệ sách gỗ phát sáng và cụm bàn họp nơi Trưởng phòng Doraemon triệu tập Shizuka, Suneo, Nobita, Chaian báo cáo Giám đốc.',
    keyEquipment: [
      'Hệ vách kính khung nhôm đen cách âm & đèn thả trần ấm áp',
      'Cụm bàn họp điều phối & màn hình kiểm duyệt kế hoạch toàn công ty',
      'Hệ tủ kệ sách gỗ âm tường trưng bày hồ sơ quy chuẩn SOP'
    ],
    aiSpatialInteraction:
      'Khi Giám đốc triệu tập họp hoặc cần tư vấn tổng hợp, Doraemon cùng Shizuka, Suneo, Nobita và Chaian sẽ di chuyển vào phòng vách kính.'
  },
  {
    id: 'sales_quoting',
    name: 'Phân khu CSKH, Báo giá & SEO · AEO — Shizuka (Xuka)',
    shortLabel: 'CSKH & Báo giá (Shizuka)',
    category: 'department',
    departmentId: 'sales_quoting',
    accentHex: '#f472b6',
    center: { x: 2.6, y: 0, z: 5.5 },
    size: { width: 8.2, depth: 5.8 },
    cameraPosition: { x: 1.2, y: 2.15, z: 9.2 },
    cameraTarget: { x: 2.2, y: 1.05, z: 6.2 },
    description:
      'Đặt trên thảm xanh lá đậm phía trước trung tâm (khu SEO · AEO & CSKH) do Shizuka (Xuka) phụ trách: Chăm sóc khách hàng, bóc tách kích thước (m2) tính báo giá đơn hàng in, soạn thảo Hợp đồng mua bán, lập Phiếu mua bán và Phiếu giao hàng.',
    keyEquipment: [
      'Cụm 4 bàn làm việc trắng hiện đại kèm khung giàn cây xanh treo',
      'Trạm máy tính phần mềm tính báo giá in ấn & in Phiếu giao hàng',
      'Cặp hồ sơ Hợp đồng mua bán, Phiếu xuất kho kiêm Phiếu giao hàng'
    ],
    aiSpatialInteraction:
      'Shizuka (Xuka) đứng điều hành cạnh cụm bàn CSKH/SEO, tra cứu bảng giá SOP theo từng m2 vật tư, lập hợp đồng/phiếu giao hàng và gửi kết quả qua Doraemon trình Giám đốc.'
  },
  {
    id: 'accounting',
    name: 'Phân khu Kế toán, Công nợ & Hóa đơn — Suneo (Xêko)',
    shortLabel: 'Kế toán (Suneo)',
    category: 'department',
    departmentId: 'accounting',
    accentHex: '#10b981',
    center: { x: 5.5, y: 0, z: -4.2 },
    size: { width: 8.0, depth: 5.6 },
    cameraPosition: { x: 3.8, y: 2.15, z: -0.2 },
    cameraTarget: { x: 5.2, y: 1.05, z: -3.2 },
    description:
      'Đặt trên thảm tím Lavender phía sau trung tâm do Suneo (Xêko) phụ trách: Quản lý công nợ phải thu/phải trả, lưu trữ thông tin hợp đồng đối tác & khách hàng, đối soát chi phí sản xuất - vật tư và phát hành hóa đơn VAT.',
    keyEquipment: [
      'Cụm 4 bàn kế toán trắng dưới ánh đèn thả trần ấm áp',
      'Tủ hồ sơ lưu trữ thông tin hợp đồng đối tác, khách hàng B2B & sổ công nợ',
      'Hệ thống kiểm soát chứng từ thanh toán & đối soát chi phí vật tư'
    ],
    aiSpatialInteraction:
      'Suneo (Xêko) kiểm tra công nợ, đối soát chi phí và thông tin hợp đồng đối tác tại khu Kế toán trước khi gửi báo cáo tài chính cho Doraemon trình Giám đốc.'
  },
  {
    id: 'design_tech',
    name: 'Phân khu Kỹ thuật & Thiết kế Chế bản CMYK — Nobita',
    shortLabel: 'Kỹ thuật & Thiết kế (Nobita)',
    category: 'department',
    departmentId: 'design_tech',
    accentHex: '#facc15',
    center: { x: -8.5, y: 0, z: 1.4 },
    size: { width: 8.5, depth: 5.8 },
    cameraPosition: { x: -5.8, y: 2.15, z: 4.8 },
    cameraTarget: { x: -7.2, y: 1.05, z: 1.8 },
    description:
      'Đặt trên thảm xanh rêu "KỸ THUẬT" bên trái do Nobita phụ trách: Nhân viên thiết kế quản lý, kiểm tra kỹ thuật (preflight) và chỉnh sửa file thiết kế quảng cáo (AI, CorelDRAW, PDF), chuyển đổi hệ màu CMYK, kiểm tra tràn lề (bleed 3mm) và bình bài in.',
    keyEquipment: [
      'Cụm 4 bàn Workstation đồ họa trên thảm chữ nổi 3D "KỸ THUẬT"',
      'Bảng vẽ điện tử Wacom, quạt màu Pantone CMYK & đèn thả chao nón',
      'Trạm kiểm tra file vector & bình bài xuất in khổ lớn'
    ],
    aiSpatialInteraction:
      'Nobita đeo kính cận tỉ mỉ chỉnh sửa file thiết kế tại khu Kỹ thuật, kiểm tra chuẩn màu CMYK và gửi báo cáo hoàn thành cho Doraemon.'
  },
  {
    id: 'marketing',
    name: 'Phân khu Marketing, SEO · AEO & Thị trường — Chaian (Chaien)',
    shortLabel: 'Marketing & SEO (Chaian)',
    category: 'department',
    departmentId: 'marketing',
    accentHex: '#f97316',
    center: { x: 5.2, y: 0, z: 4.8 },
    size: { width: 8.2, depth: 5.8 },
    cameraPosition: { x: 7.2, y: 2.15, z: 8.0 },
    cameraTarget: { x: 5.5, y: 1.05, z: 4.5 },
    description:
      'Đặt tại khu vực chữ nổi 3D "SEO · AEO" phía trước do Trưởng nhóm Chaian (Chaien) phụ trách: Nghiên cứu đối thủ cạnh tranh ngành in ấn – quảng cáo, tối ưu chiến dịch SEO/AEO, xây dựng gói combo POSM sự kiện và mở rộng thị trường B2B.',
    keyEquipment: [
      'Cụm bàn chiến dịch SEO · AEO & Marketing kèm giàn khung cây xanh',
      'Màn hình phân tích từ khóa, thị phần & bảng giá đối thủ cạnh tranh',
      'Loa truyền thông chiến dịch & bộ mẫu POSM khai trương'
    ],
    aiSpatialInteraction:
      'Chaian (Chaien) chỉ huy nhóm SEO · Marketing, thu thập dữ liệu đối thủ cạnh tranh, xây dựng chiến dịch bùng nổ và báo cáo qua Doraemon.'
  },
  {
    id: 'hr_ops',
    name: 'Trung tâm Quản lý Chung & Điều phối — Doraemon',
    shortLabel: 'Quản lý Chung (Doraemon)',
    category: 'department',
    departmentId: 'hr_ops',
    accentHex: '#38bdf8',
    center: { x: -3.2, y: 0, z: -2.2 },
    size: { width: 7.5, depth: 6.0 },
    cameraPosition: { x: -1.8, y: 2.15, z: 1.2 },
    cameraTarget: { x: -3.2, y: 1.05, z: -2.2 },
    description:
      'Đặt tại Lounge Điều Phối Trung Tâm do Trưởng phòng Quản lý chung Doraemon (Đô-rê-mon) phụ trách: Tiếp nhận chỉ thị chung (Brief) từ Giám đốc, điều phối công việc chính xác cho từng thành viên chuyên trách (Shizuka, Suneo, Nobita, Chaian) và tổng hợp báo cáo trình Giám đốc.',
    keyEquipment: [
      'Khu vực Sofa Lounge tròn trung tâm kết nối trực tiếp mọi phòng ban',
      'Máy tính bảng điều phối thông minh & bảo bối chong chóng tre',
      'Hệ thống giám sát tiến độ 17 nhân sự toàn văn phòng theo thời gian thực'
    ],
    aiSpatialInteraction:
      'Doraemon đứng tại trung tâm điều phối văn phòng, nhận chỉ thị từ Giám đốc, phân việc tự động cho Shizuka, Suneo, Nobita, Chaian và tổng hợp kết quả trình Giám đốc.'
  }
];

export const INITIAL_SOP_DOCUMENTS: SopDocument[] = [
  {
    id: 'sop-quote-01',
    departmentId: 'sales_quoting',
    code: 'SOP-BG-2026-01',
    title: 'Quy chuẩn Báo giá In Ấn, Lập Hợp đồng Mua bán & Phiếu Giao Hàng (Shizuka)',
    category: 'CSKH, Báo giá & Hợp đồng',
    summary:
      'Quy định cách tính diện tích m2, đơn giá vật tư in chuẩn, lập hợp đồng mua bán, phiếu mua bán và phiếu giao hàng xuất xưởng.',
    rules: [
      'In bạt Hiflex tiêu chuẩn (3.2 dzem): 45.000đ/m2; Hiflex dày không gân xuyên sáng: 85.000đ/m2. In Decal PP cán màng: 75.000đ/m2.',
      'Biển chữ nổi Mica gắn LED âm: 1.150.000đ/m2; Standee cuốn nhôm 0.8x2.0m: 260.000đ/bộ; Catalog in Offset: 18.000đ/cuốn.',
      'Chính sách chiết khấu: Tổng diện tích >= 50m2 (hoặc >= 20 bộ) giảm 8%; >= 100m2 giảm 12%. Đơn gấp cộng phụ phí 15%. VAT mặc định 8%.',
      'Mọi đơn hàng từ 5.000.000đ trở lên bắt buộc Shizuka lập Hợp đồng mua bán (ghi rõ quy cách vật liệu, tiến độ, điều khoản bảo hành màu 12-24 tháng).',
      'Khi xuất hàng giao khách, Shizuka bắt buộc lập Phiếu mua bán kiêm Phiếu giao hàng đủ 02 liên (ghi rõ số lượng m2/bộ, phụ kiện đi kèm và chữ ký người nhận).'
    ],
    updatedAt: '2026-10-15',
    isActive: true
  },
  {
    id: 'sop-quote-02',
    departmentId: 'sales_quoting',
    code: 'SOP-BG-2026-02',
    title: 'Quy chuẩn CSKH, Tư vấn Vật liệu & Cam kết SLA Giao hàng',
    category: 'Chăm sóc Khách hàng',
    summary:
      'Hướng dẫn Shizuka tư vấn đúng vật liệu theo môi trường lắp đặt và quy trình bàn giao phiếu giao hàng.',
    rules: [
      'Biển bảng ngoài trời trên 12 tháng bắt buộc tư vấn mực dầu (Eco-Solvent/UV) trên chất liệu Decal ngoài trời hoặc Hiflex dày, không dùng mực nước.',
      'Đơn hàng dưới 30m2 bạt/decal: trả hàng kèm Phiếu giao hàng trong 24 giờ sau khi khách duyệt file và Suneo xác nhận tiền cọc.',
      'Mọi báo giá và hợp đồng gửi khách hàng phải ghi rõ điều kiện vận chuyển nội/ngoại thành và chi phí lắp đặt.'
    ],
    updatedAt: '2026-10-18',
    isActive: true
  },
  {
    id: 'sop-acc-01',
    departmentId: 'accounting',
    code: 'SOP-KT-2026-01',
    title: 'Quy chuẩn Kế toán Công nợ, Hợp đồng Đối tác, Đối soát Chi phí & Hóa đơn (Suneo)',
    category: 'Kế toán, Công nợ & Hóa đơn',
    summary:
      'Quy định bắt buộc cho Suneo về quản lý công nợ, thông tin hợp đồng đối tác/khách hàng, đối soát chi phí vật tư và phát hành hóa đơn VAT.',
    rules: [
      'Đơn hàng khách lẻ hoặc khách mới bắt buộc thu tạm ứng đặt cọc tối thiểu 50% giá trị hợp đồng/phiếu mua bán trước khi duyệt lệnh xuất vật tư in.',
      'Quản lý hồ sơ hợp đồng đối tác & khách hàng B2B: Công nợ tối đa 30 ngày với hạn mức không vượt quá 80.000.000đ/đối tác; rà soát đối chiếu công nợ định kỳ hàng tuần.',
      'Đối soát chi phí sản xuất: Mọi chi phí nhập cuộn bạt, decal, tấm mica, mực in phải khớp với mã đơn hàng (Job ID) và định mức hao hụt không quá 5%.',
      'Khi phát hành giấy tờ hóa đơn GTGT (VAT 8%), Suneo bắt buộc đối chiếu Hợp đồng mua bán, Biên bản nghiệm thu và Phiếu giao hàng có chữ ký khách hàng từ Shizuka.'
    ],
    updatedAt: '2026-10-14',
    isActive: true
  },
  {
    id: 'sop-des-01',
    departmentId: 'design_tech',
    code: 'SOP-TK-2026-01',
    title: 'Quy chuẩn Kiểm tra File Thiết kế (Preflight), Hệ màu CMYK & Bình bài In (Nobita)',
    category: 'Thiết kế & Kỹ thuật File',
    summary:
      'Tiêu chuẩn kỹ thuật bắt buộc cho nhân viên thiết kế Nobita trước khi xuất lệnh in Offset hoặc in phun khổ lớn.',
    rules: [
      'Hệ màu bắt buộc: 100% CMYK. Tuyệt đối chuyển đổi toàn bộ đối tượng và ảnh bitmap từ RGB sang CMYK trước khi xuất file in để tránh lệch màu.',
      'Màu đen chữ nhỏ (dưới 14pt) phải đặt thông số C=0, M=0, Y=0, K=100 (1 kênh K); nền đen diện tích lớn dùng Rich Black (C=40, M=30, Y=30, K=100).',
      'Tràn lề (Bleed) và vùng an toàn: Ấn phẩm cắt xén (Namecard, Tờ rơi, Catalog, Decal bế) bắt buộc chừa tràn lề 2mm - 3mm mỗi cạnh; nội dung chữ cách mép cắt tối thiểu 4mm.',
      'Độ phân giải ảnh (DPI): Ấn phẩm cầm tay đạt tối thiểu 300 DPI; Standee/Poster nhìn gần đạt 150-200 DPI; Bạt Hiflex pano khổ lớn nhìn xa đạt 72-100 DPI ở kích thước thật 1:1.',
      'Font chữ và liên kết: Toàn bộ text phải Convert to Curves / Create Outlines và Embed toàn bộ ảnh link trước khi lưu PDF/X-1a hoặc TIFF.'
    ],
    updatedAt: '2026-10-16',
    isActive: true
  },
  {
    id: 'sop-mkt-01',
    departmentId: 'marketing',
    code: 'SOP-MKT-2026-01',
    title: 'Khung Phân tích Đối thủ Cạnh tranh & Chiến dịch Marketing B2B (Chaian)',
    category: 'Marketing & Thị trường',
    summary:
      'Phương pháp để Chaian đánh giá đối thủ cạnh tranh ngành in quảng cáo và triển khai các chiến dịch thu hút khách hàng doanh nghiệp.',
    rules: [
      'Khi phân tích đối thủ cạnh tranh ngành in quảng cáo, Chaian bắt buộc đánh giá theo 4 trụ cột: (1) Năng lực máy móc & tốc độ trả hàng, (2) Khung giá/m2 các dòng chủ lực, (3) Chính sách công nợ & bảo hành màu sắc, (4) Kênh thu hút khách hàng B2B.',
      'Định vị khác biệt của PrintAd: Cam kết in thử mẫu màu (proof) miễn phí trong 30 phút, bảo hành phai màu mực UV 24 tháng và hỗ trợ kiểm tra file kỹ thuật miễn phí.',
      'Chiến dịch tiếp thị trọng tâm Quý 4: Tập trung gói "Combo Khai Trương & POSM Điểm Bán" (Biển hiệu Alu chữ nổi + 4 Standee + 1.000 Tờ rơi + Backdrop) giúp tăng 28% giá trị đơn hàng trung bình.'
    ],
    updatedAt: '2026-10-17',
    isActive: true
  },
  {
    id: 'sop-hr-01',
    departmentId: 'hr_ops',
    code: 'SOP-QL-2026-01',
    title: 'Quy chuẩn Quản lý Chung, Điều phối Chỉ thị Giám đốc & Vận hành Xưởng (Doraemon)',
    category: 'Quản lý Chung & Điều phối',
    summary:
      'Quy định quy trình Doraemon tiếp nhận chỉ thị từ Giám đốc, phân công đúng chuyên môn cho các thành viên, nghiệm thu báo cáo và tư vấn tổng hợp.',
    rules: [
      'Khi Giám đốc ra chỉ thị chung, Doraemon phải phân tích từ khóa nghiệp vụ để giao việc chính xác cho: Shizuka (CSKH, báo giá, hợp đồng mua bán, phiếu giao hàng), Suneo (Kế toán, công nợ, hợp đồng đối tác, chi phí, hóa đơn), Nobita (Thiết kế, chỉnh sửa file CMYK), hoặc Chaian (Marketing, đối thủ).',
      'Sau khi thành viên chuyên trách thực hiện xong, Doraemon tiếp nhận báo cáo chi tiết, kiểm tra mức độ tuân thủ SOP và đúc kết phần "Báo cáo Tổng hợp của Doraemon trình Giám đốc".',
      'Đối với các yêu cầu tư vấn tổng hợp, điều phối liên phòng ban hoặc quản lý phân ca nhân sự xưởng in (02 thợ máy in + 02 gia công + 01 QC/ca, an toàn thi công biển bảng), Doraemon trực tiếp lập phương án tham mưu cho Giám đốc.'
    ],
    updatedAt: '2026-10-12',
    isActive: true
  }
];

export const INITIAL_AGENTS: AgentProfile[] = [
  {
    id: 'agent-sales',
    characterKey: 'shizuka',
    name: 'Shizuka (Xuka)',
    roleTitle: 'Phụ trách CSKH, Báo giá, Hợp đồng & Phiếu giao hàng',
    departmentId: 'sales_quoting',
    departmentLabel: 'CSKH - Báo giá & Hợp đồng',
    zoneId: 'sales_quoting',
    accentHex: '#f472b6',
    suitColorHex: 0xec4899,
    hairColorHex: 0x1e1b4b,
    accessoryType: 'headset',
    primaryMission:
      'Phụ trách Chăm sóc khách hàng (CSKH), tính toán báo giá đơn hàng in ấn quảng cáo theo m2, soạn thảo Hợp đồng mua bán, lập Phiếu mua bán và Phiếu giao hàng xuất xưởng gửi khách.',
    strictBoundary:
      'CHỈ thực hiện CSKH, tính toán báo giá, làm hợp đồng mua bán, phiếu mua bán và phiếu giao hàng. KHÔNG tự ý chỉnh sửa file thiết kế đồ họa (thuộc Nobita), KHÔNG đối soát sổ sách công nợ/chi phí/hóa đơn thuế (thuộc Suneo), và KHÔNG lập chiến dịch Marketing (thuộc Chaian).',
    personalityTraits: [
      'Dịu dàng, chu đáo trong CSKH, tính toán báo giá diện tích (m2) cực kỳ cẩn thận',
      'Soạn thảo hợp đồng mua bán, phiếu mua bán và phiếu giao hàng rõ ràng, đầy đủ điều khoản',
      'Luôn gửi báo cáo kết quả báo giá & tình trạng giao hàng về cho Doraemon tổng hợp trình Giám đốc'
    ],
    spatialBehavior:
      'Ngồi tại phân khu CSKH & Báo giá (-10.5, 5.8). Khi nhận lệnh từ Doraemon, Shizuka di chuyển sang Khu làm việc chung (0, 0.5) kiểm mẫu rồi ra Sảnh chính (0, 8.5) bàn giao báo giá, hợp đồng và phiếu giao hàng.',
    allowedKeywords: [
      'báo giá',
      'tính giá',
      'cskh',
      'chăm sóc khách hàng',
      'phiếu mua bán',
      'phiếu giao hàng',
      'giao hàng',
      'làm hợp đồng',
      'hợp đồng mua bán',
      'đơn hàng',
      'bạt',
      'in bạt',
      'số lượng',
      'hiflex',
      'decal',
      'pp',
      'mica',
      'standee',
      'catalog',
      'tờ rơi',
      'm2',
      'kích thước',
      'khách hàng',
      'tư vấn vật liệu',
      'chiết khấu',
      'đặt in',
      'hộp đèn',
      'biển hiệu',
      'shizuka',
      'xuka',
      'xu ka'
    ],
    homePosition: { x: 2.2, y: 0, z: 6.2 },
    workstationLookAt: { x: 0.8, y: 1.2, z: 9.8 },
    collaborationPoint: { x: -4.8, y: 0, z: 6.8 },
    sampleTasks: [
      {
        id: 'task-quote-hiflex',
        label: 'Báo giá 60m2 bạt Hiflex, lập Hợp đồng & Phiếu giao hàng',
        prompt:
          'Tính báo giá chi tiết cho đơn hàng 60m2 bạt Hiflex tiêu chuẩn (đóng khoen dán biên) và 10 bộ Standee cuốn nhôm 0.8x2.0m; đồng thời lập dự thảo Hợp đồng mua bán, Phiếu mua bán và Phiếu giao hàng cho khách.',
        targetZoneId: 'lobby',
        priority: 'high'
      },
      {
        id: 'task-quote-mica',
        label: 'CSKH & Báo giá biển chữ nổi Mica LED âm 12m2 kèm phiếu mua bán',
        prompt:
          'Tư vấn CSKH, tính báo giá biển quảng cáo chữ nổi Mica Đài Loan gắn LED âm diện tích 12m2 lấy gấp, lập phiếu mua bán và lịch bàn giao phiếu giao hàng.',
        targetZoneId: 'coworking',
        priority: 'urgent'
      }
    ]
  },
  {
    id: 'agent-accounting',
    characterKey: 'suneo',
    name: 'Suneo (Xêko)',
    roleTitle: 'Phụ trách Kế toán, Công nợ, Hợp đồng Đối tác & Hóa đơn',
    departmentId: 'accounting',
    departmentLabel: 'Kế toán & Công nợ',
    zoneId: 'accounting',
    accentHex: '#10b981',
    suitColorHex: 0x0d9488,
    hairColorHex: 0x0f172a,
    accessoryType: 'glasses',
    primaryMission:
      'Phụ trách kế toán công nợ phải thu/phải trả, quản lý thông tin hợp đồng đối tác & khách hàng, đối soát chi phí sản xuất - vật tư, kiểm tra sổ sách tiền hàng, tạm ứng cọc 50% và xuất giấy tờ hóa đơn VAT.',
    strictBoundary:
      'CHỈ xử lý nghiệp vụ kế toán: công nợ, thông tin hợp đồng đối tác/khách hàng, đối soát chi phí, sổ sách tiền hàng và giấy tờ hóa đơn chứng từ. KHÔNG chỉnh sửa file thiết kế CMYK (thuộc Nobita), KHÔNG làm chiến dịch Marketing (thuộc Chaian).',
    personalityTraits: [
      'Nhạy bén về tài chính, quản lý chặt chẽ từng đồng công nợ và chi phí vật tư',
      'Nắm rõ hồ sơ hợp đồng đối tác cung ứng bạt/mực/mica và hạn mức tín dụng khách hàng B2B',
      'Trình bày bảng đối soát chi phí, công nợ và hóa đơn sắc sảo để báo cáo qua Doraemon lên Giám đốc'
    ],
    spatialBehavior:
      'Làm việc tại khu Kế toán (10.5, 5.8) cạnh tủ hồ sơ hợp đồng đối tác & hóa đơn. Khi nhận điều phối từ Doraemon, Suneo đối soát sổ sách và di chuyển tới Phòng họp (0, -7.5) báo cáo số liệu.',
    allowedKeywords: [
      'kế toán',
      'công nợ',
      'đối tác',
      'hợp đồng đối tác',
      'thông tin hợp đồng',
      'đối soát chi phí',
      'chi phí',
      'giấy tờ',
      'hóa đơn',
      'vat',
      'sổ sách',
      'tiền hàng',
      'tạm ứng',
      'đặt cọc',
      'thu chi',
      'chứng từ',
      'thanh toán',
      'nhà cung cấp',
      'quyết toán',
      'doanh thu'
    ],
    homePosition: { x: 5.2, y: 0, z: -3.2 },
    workstationLookAt: { x: 3.4, y: 1.2, z: 0.4 },
    collaborationPoint: { x: -1.2, y: 0, z: -2.2 },
    sampleTasks: [
      {
        id: 'task-acc-receivable',
        label: 'Đối soát công nợ, hợp đồng đối tác & giấy tờ hóa đơn tháng 10',
        prompt:
          'Rà soát công nợ khách hàng B2B và thông tin hợp đồng đối tác cung ứng vật tư tháng 10; đối soát chi phí sản xuất, kiểm tra các đơn chưa thu đủ 50% cọc và lập danh sách xuất giấy tờ hóa đơn VAT 8%.',
        targetZoneId: 'accounting',
        priority: 'high'
      },
      {
        id: 'task-acc-material',
        label: 'Đối soát chi phí nhập kho bạt Hiflex, mực UV & chứng từ thanh toán',
        prompt:
          'Đối soát chi phí và thông tin hợp đồng đối tác cho lô 50 cuộn bạt Hiflex, 20 thùng mực in UV; kiểm tra định mức hao hụt thực tế và hoàn thiện bộ giấy tờ hóa đơn đầu vào.',
        targetZoneId: 'meeting',
        priority: 'normal'
      }
    ]
  },
  {
    id: 'agent-design',
    characterKey: 'nobita',
    name: 'Nobita',
    roleTitle: 'Nhân viên Thiết kế Đồ họa & Kỹ thuật Chế bản',
    departmentId: 'design_tech',
    departmentLabel: 'Thiết kế & Chế bản File',
    zoneId: 'design_tech',
    accentHex: '#facc15',
    suitColorHex: 0xeab308,
    hairColorHex: 0x18181b,
    accessoryType: 'glasses',
    primaryMission:
      'Nhân viên thiết kế phụ trách quản lý, kiểm tra kỹ thuật (preflight) và chỉnh sửa file thiết kế in ấn (AI, Corel, PDF): chuẩn hóa hệ màu CMYK, kiểm tra tràn lề (bleed 3mm), độ phân giải DPI, convert font chữ và bình bài xuất in.',
    strictBoundary:
      'CHỈ thực hiện thiết kế đồ họa, quản lý & chỉnh sửa file thiết kế, chuẩn hóa màu CMYK, bình bài chế bản và in test proof. KHÔNG tính báo giá hay lập phiếu giao hàng (thuộc Shizuka), KHÔNG đối soát công nợ hóa đơn (thuộc Suneo).',
    personalityTraits: [
      'Tập trung cao độ khi đeo kính rà soát từng chi tiết vector, font chữ và hệ màu CMYK',
      'Thực hiện đúng răm rắp checklist SOP kỹ thuật chế bản và hướng dẫn của Doraemon',
      'Chỉnh sửa file nhanh, luôn in thử bản proof tại máy in trung tâm trước khi báo cáo hoàn thành'
    ],
    spatialBehavior:
      'Ngồi tại Workstation đồ họa khu Thiết kế (-10.5, -1.8). Khi nhận việc từ Doraemon, Nobita chỉnh sửa file CMYK rồi bước ra Trạm máy in phun khổ lớn tại Khu làm việc chung (0, 0.5) để in test màu proof.',
    allowedKeywords: [
      'thiết kế',
      'file',
      'chỉnh sửa',
      'cmyk',
      'rgb',
      'tràn lề',
      'bleed',
      'dpi',
      'độ phân giải',
      'bình bài',
      'chế bản',
      'vector',
      'corel',
      'illustrator',
      'pdf',
      'font',
      'convert',
      'màu sắc',
      'in thử',
      'proof',
      'poster',
      'banner',
      'layout'
    ],
    homePosition: { x: -7.2, y: 0, z: 1.8 },
    workstationLookAt: { x: -5.2, y: 1.2, z: 5.5 },
    collaborationPoint: { x: -3.2, y: 0, z: 0.2 },
    sampleTasks: [
      {
        id: 'task-des-preflight',
        label: 'Chỉnh sửa file thiết kế Poster & Catalog chuẩn in CMYK',
        prompt:
          'Kiểm tra kỹ thuật (preflight) và chỉnh sửa bộ file thiết kế khách gửi gồm: 01 file Poster quảng cáo đang để hệ màu RGB chưa có tràn lề và 01 file Catalog 16 trang chưa convert font chữ.',
        targetZoneId: 'coworking',
        priority: 'high'
      },
      {
        id: 'task-des-billboard',
        label: 'Bình bài & tối ưu file đại cảnh Pano Hiflex 15m x 5m',
        prompt:
          'Chỉnh sửa và bình bài file TIFF cho Pano ngoài trời kích thước 15m x 5m: kiểm tra tỷ lệ 1:1, độ phân giải DPI, thông số màu đen Rich Black và chừa biên xỏ cây.',
        targetZoneId: 'design_tech',
        priority: 'normal'
      }
    ]
  },
  {
    id: 'agent-marketing',
    characterKey: 'chaian',
    name: 'Chaian (Chaien)',
    roleTitle: 'Phụ trách Marketing & Phát triển Thị trường',
    departmentId: 'marketing',
    departmentLabel: 'Marketing & Thị trường',
    zoneId: 'marketing',
    accentHex: '#f97316',
    suitColorHex: 0xea580c,
    hairColorHex: 0x1c1917,
    accessoryType: 'badge',
    primaryMission:
      'Phụ trách Marketing: nghiên cứu đối thủ cạnh tranh trong lĩnh vực in ấn – quảng cáo, phân tích xu hướng POSM/OOH, thiết kế chiến dịch quảng bá và gói combo sản phẩm thu hút khách hàng doanh nghiệp B2B.',
    strictBoundary:
      'CHỈ thực hiện nghiên cứu thị trường, phân tích đối thủ cạnh tranh, lập kế hoạch chiến dịch Marketing và phát triển gói sản phẩm quảng cáo. KHÔNG hạch toán công nợ hóa đơn (thuộc Suneo), KHÔNG sửa file kỹ thuật in (thuộc Nobita).',
    personalityTraits: [
      'Mạnh mẽ, nhiệt huyết, luôn muốn chiến dịch Marketing của công ty压 đảo đối thủ cạnh tranh',
      'Tổng hợp bảng so sánh giá và năng lực đối thủ rõ ràng, quyết liệt',
      'Báo cáo kết quả chiến dịch và đề xuất gói Combo POSM trực tiếp qua Doraemon lên Giám đốc'
    ],
    spatialBehavior:
      'Làm việc tại khu Marketing (10.5, -1.8) trước bảng chiến dịch. Khi hoàn thành nghiên cứu đối thủ, Chaian bước vào Phòng họp (0, -7.5) để trình bày chiến lược.',
    allowedKeywords: [
      'marketing',
      'đối thủ',
      'cạnh tranh',
      'thị trường',
      'chiến dịch',
      'quảng cáo',
      'quảng bá',
      'khách hàng b2b',
      'thương hiệu',
      'posm',
      'ooh',
      'khuyến mãi',
      'combo',
      'doanh số',
      'tiếp thị',
      'xu hướng',
      'phân tích'
    ],
    homePosition: { x: 5.5, y: 0, z: 4.5 },
    workstationLookAt: { x: 7.6, y: 1.2, z: 8.5 },
    collaborationPoint: { x: 0.8, y: 0, z: -1.5 },
    sampleTasks: [
      {
        id: 'task-mkt-competitor',
        label: 'Tìm hiểu về đối thủ cạnh tranh ngành in ấn quảng cáo',
        prompt:
          'Tìm hiểu về đối thủ cạnh tranh trực tiếp trong mảng in nhanh kỹ thuật số và thi công biển hiệu quảng cáo tại khu vực. So sánh khung giá, tốc độ giao hàng và đề xuất gói Combo POSM.',
        targetZoneId: 'meeting',
        priority: 'high'
      },
      {
        id: 'task-mkt-campaign',
        label: 'Triển khai chiến dịch Marketing Combo POSM Khai Trương Quý 4',
        prompt:
          'Xây dựng kế hoạch Marketing gói "Combo Khai Trương Trọn Gói" hướng tới chuỗi cửa hàng F&B và thời trang theo đúng quy chuẩn SOP.',
        targetZoneId: 'marketing',
        priority: 'normal'
      }
    ]
  },
  {
    id: 'agent-hr',
    characterKey: 'doraemon',
    name: 'Doraemon (Đô-rê-mon)',
    roleTitle: 'Trưởng phòng Quản lý Chung & Điều phối Toàn Công ty',
    departmentId: 'hr_ops',
    departmentLabel: 'Quản lý Chung & Điều phối',
    zoneId: 'hr_ops',
    accentHex: '#38bdf8',
    suitColorHex: 0x0284c7,
    hairColorHex: 0x0284c7,
    accessoryType: 'clipboard',
    primaryMission:
      'Trưởng phòng Quản lý chung: Nhận chỉ thị chung từ Giám đốc, phân tích và điều phối công việc chính xác cho từng thành viên chuyên trách (Shizuka, Suneo, Nobita, Chaian); nhận báo cáo phản hồi từ nhân viên để tổng hợp trình lại Giám đốc; đồng thời tư vấn tổng hợp chung về công việc, nhân sự và vận hành xưởng in với Giám đốc.',
    strictBoundary:
      'Phụ trách Quản lý chung, nhận chỉ thị Giám đốc để giao việc tự động cho đúng bộ phận chuyên trách, tiếp nhận & tổng hợp báo cáo từ nhân viên trình Giám đốc, tư vấn điều hành tổng thể và quản lý phân ca xưởng in. Khi chỉ thị thuộc nghiệp vụ chuyên sâu của thành viên nào, Doraemon sẽ tự động điều phối cho thành viên đó.',
    personalityTraits: [
      'Thông thái, tận tâm, luôn có giải pháp điều phối nhịp nhàng như lấy bảo bối từ túi thần kỳ 4 chiều',
      'Nắm vững chuyên môn SOP của cả 4 thành viên (Shizuka, Suneo, Nobita, Chaian) để giao đúng người đúng việc',
      'Tổng hợp báo cáo phản hồi từ nhân viên kèm lời khuyên tư vấn chiến lược rõ ràng trình Giám đốc'
    ],
    spatialBehavior:
      'Trực tại Phòng Quản lý chung (-10.5, -8.2). Khi Giám đốc ra chỉ thị, Doraemon di chuyển ra vị trí điều phối trung tâm (-3.2, -3.2) để phân việc cho các thành viên và vào Phòng họp (0, -7.5) báo cáo tổng hợp.',
    allowedKeywords: [
      'quản lý chung',
      'tư vấn',
      'tổng hợp',
      'điều phối',
      'giám đốc',
      'báo cáo chung',
      'tổng quan',
      'nhân sự',
      'phân ca',
      'lịch làm việc',
      'thợ in',
      'thi công',
      'an toàn',
      'lao động',
      'xưởng in',
      'nội quy',
      'pccc',
      'nhân viên'
    ],
    homePosition: { x: -3.2, y: 0, z: -2.2 },
    workstationLookAt: { x: -1.2, y: 1.2, z: 2.2 },
    collaborationPoint: { x: -0.5, y: 0, z: 0.8 },
    sampleTasks: [
      {
        id: 'task-hr-consult',
        label: 'Tư vấn tổng hợp tình hình vận hành các bộ phận & điều phối xưởng in',
        prompt:
          'Tư vấn tổng hợp chung cho Giám đốc về tình hình phối hợp công việc giữa CSKH (Shizuka), Kế toán (Suneo), Thiết kế (Nobita), Marketing (Chaian) và phương án điều phối nhân sự xưởng in tuần cao điểm.',
        targetZoneId: 'meeting',
        priority: 'high'
      },
      {
        id: 'task-hr-safety',
        label: 'Kiểm tra tiến độ chung & giám sát an toàn thi công biển bảng SOP',
        prompt:
          'Tổng hợp báo cáo tiến độ đơn hàng trong ngày, rà soát lịch phân ca thợ in và kiểm tra an toàn lao động của đội thi công biển hiệu trình Giám đốc.',
        targetZoneId: 'hr_ops',
        priority: 'normal'
      }
    ]
  }
];

export const INITIAL_TASK_HISTORY: TaskAssignment[] = [
  {
    id: 'task-seed-quote-80m2',
    agentId: 'agent-sales',
    title: 'Cho báo giá số lượng 80m2 bạt Hiflex tiêu chuẩn',
    prompt: 'Cho báo giá số lượng 80m2 bạt',
    priority: 'high',
    targetZoneId: 'lobby',
    status: 'completed',
    progress: 100,
    appliedSopIds: ['sop-quote-01'],
    spatialStepText:
      'Hoàn tất: Shizuka (Xuka) đã trả kết quả báo giá 80m2 bạt qua Doraemon trình Giám đốc',
    createdAt: '09:10',
    completedAt: '09:11',
    coordinatorDispatch: {
      isCeoDirective: true,
      coordinatorName: 'Doraemon (Đô-rê-mon)',
      coordinatorRole: 'Trưởng phòng Quản lý Chung & Điều phối',
      assignedAgentId: 'agent-sales',
      assignedAgentName: 'Shizuka (Xuka)',
      assignedDepartmentLabel: 'CSKH, Báo giá & Hợp đồng',
      routingReason:
        'Doraemon (Trưởng phòng Quản lý chung) đã phân tích chỉ thị "Cho báo giá số lượng 80m2 bạt" của Giám đốc, xác định thuộc nghiệp vụ CSKH & Báo giá nên đã điều phối trực tiếp cho Shizuka (Xuka) thực thi theo SOP-BG-2026-01.',
      directorSummaryFromDoraemon:
        'Báo cáo Giám đốc: Shizuka (Xuka) đã tính xong báo giá 80m2 bạt Hiflex & phản hồi lại Doraemon → Tổng thanh toán: 4.053.888đ (Đặt cọc 50%: 2.026.944đ). Đã lập kèm Hợp đồng mua bán, Phiếu mua bán & Phiếu giao hàng chuẩn SOP. Doraemon đề xuất Giám đốc duyệt để chuyển Suneo thu cọc 50% và Nobita bình bài in.',
      supportingDepartments: ['Suneo (Xêko) (Kế toán & Công nợ)', 'Nobita (Thiết kế & Chế bản File)']
    },
    report: {
      headline: 'Kết Quả Báo Giá 80m2 Bạt Hiflex: 4.053.888đ — Shizuka (Xuka)',
      summary:
        'Shizuka (Xuka) báo cáo kết quả cho lệnh "Cho báo giá số lượng 80m2 bạt": Tiền in 80m2 × 45.000đ/m2 = 3.600.000đ + Gia công 480.000đ - Chiết khấu 8% (326.400đ) + VAT 8% (300.288đ) = TỔNG CỘNG 4.053.888đ (Khách đặt cọc 50%: 2.026.944đ).',
      scopeCheckPassed: true,
      scopeExplanation:
        'Đúng chuyên môn của Shizuka (Xuka) (CSKH, Báo giá & Hợp đồng). Đã kích hoạt SOP-BG-2026-01 để thực thi.',
      appliedSopCodes: ['SOP-BG-2026-01'],
      spatialActionTaken:
        'Shizuka (Xuka) đã tính báo giá & soạn Hợp đồng tại bàn CSKH (-10.5, 5.8), kiểm mẫu ở Khu làm việc chung (0, 0.5) và gửi kết quả kèm Phiếu mua bán + Phiếu giao hàng qua Doraemon trình Giám đốc.',
      keyFindings: [
        'Tiền in & gia công (80m2): In Bạt Hiflex 3.2 dzem tiêu chuẩn (45.000đ/m2 = 3.600.000đ) + Đóng khoen & dán biên (6.000đ/m2 = 480.000đ) = 4.080.000đ.',
        'Chiết khấu sản lượng SOP-BG-2026-01 (>=50m2): Giảm 8% (-326.400đ) → Tiền trước thuế: 3.753.600đ + VAT 8% (300.288đ).',
        'TỔNG THANH TOÁN: 4.053.888đ (Tạm ứng đặt cọc 50%: 2.026.944đ) — Shizuka đã lập sẵn Hợp đồng mua bán, Phiếu mua bán & Phiếu giao hàng 02 liên.'
      ],
      calculationRows: [
        {
          item: '1. In Bạt Hiflex 3.2 dzem tiêu chuẩn',
          spec: 'Khổ in theo yêu cầu (80m2)',
          quantity: '80 m2',
          unitPrice: '45.000đ/m2',
          subtotal: '3.600.000đ'
        },
        {
          item: '2. Gia công (Đóng khoen & dán biên (6.000đ/m2))',
          spec: 'Hoàn thiện tiêu chuẩn xưởng PrintAd',
          quantity: '80 m2',
          unitPrice: '6.000đ/m2',
          subtotal: '480.000đ'
        },
        {
          item: '3. Chiết khấu sản lượng SOP (>=50m2)',
          spec: 'Giảm 8% trên tổng tiền in + gia công (4.080.000đ)',
          quantity: '-8%',
          unitPrice: '4.080.000đ',
          subtotal: '-326.400đ'
        },
        {
          item: 'Thuế GTGT (VAT 8%) & Bộ chứng từ',
          spec: 'Kèm Hợp đồng, Phiếu mua bán & Phiếu giao hàng',
          quantity: '8% VAT',
          unitPrice: '3.753.600đ',
          subtotal: '300.288đ'
        },
        {
          item: 'TỔNG THANH TOÁN (ĐÃ GỒM VAT 8%)',
          spec: 'Tạm ứng đặt cọc 50%: 2.026.944đ',
          quantity: '80 m2',
          unitPrice: 'Trọn gói',
          subtotal: '4.053.888đ'
        }
      ],
      totalAmountFormatted: '4.053.888đ (Đặt cọc 50%: 2.026.944đ)',
      recommendation:
        'Shizuka (Xuka) đã trả kết quả báo giá, Hợp đồng mua bán và Phiếu giao hàng qua Trưởng phòng Doraemon trình Giám đốc duyệt; sẵn sàng chuyển Suneo thu cọc 50% và Nobita bình bài in.',
      executionTimeSec: 1.0,
      sourceMode: 'sop-engine'
    }
  },
  {
    id: 'task-seed-01',
    agentId: 'agent-marketing',
    title: 'Tìm hiểu về đối thủ cạnh tranh mảng In nhanh & POSM',
    prompt:
      'Tìm hiểu về đối thủ cạnh tranh trực tiếp trong mảng in nhanh kỹ thuật số và thi công biển hiệu quảng cáo tại khu vực.',
    priority: 'high',
    targetZoneId: 'meeting',
    status: 'completed',
    progress: 100,
    appliedSopIds: ['sop-mkt-01'],
    spatialStepText: 'Doraemon đã nhận báo cáo từ Chaian (Marketing) và tổng hợp trình Giám đốc',
    createdAt: '09:15',
    completedAt: '09:16',
    coordinatorDispatch: {
      isCeoDirective: true,
      coordinatorName: 'Doraemon (Đô-rê-mon)',
      coordinatorRole: 'Trưởng phòng Quản lý Chung & Điều phối',
      assignedAgentId: 'agent-marketing',
      assignedAgentName: 'Chaian (Chaien)',
      assignedDepartmentLabel: 'Marketing & Thị trường',
      routingReason:
        'Doraemon tiếp nhận chỉ thị chung của Giám đốc, phân tích nội dung thuộc mảng khảo sát đối thủ và phát triển thị trường nên đã giao trực tiếp cho Chaian (Phụ trách Marketing) thực hiện theo SOP-MKT-2026-01.',
      directorSummaryFromDoraemon:
        'Báo cáo Giám đốc: Doraemon đã nghiệm thu báo cáo khảo sát đối thủ từ Chaian. Điểm mấu chốt là giá in Hiflex/PP của ta đang tốt hơn đối thủ 6-8% và lợi thế lớn nhất là Nobita kiểm file CMYK + in thử proof miễn phí trong 30 phút. Doraemon kiến nghị Giám đốc duyệt triển khai ngay gói Combo POSM Khai Trương và giao Shizuka cập nhật bảng báo giá.',
      supportingDepartments: ['Shizuka (Xuka) (CSKH - Báo giá & Hợp đồng)', 'Nobita (Thiết kế & Chế bản File)']
    },
    report: {
      headline: 'Báo cáo Phân tích Đối thủ Cạnh tranh Ngành In Ấn & Thi Công Quảng Cáo',
      summary:
        'Chaian (Chaien) đã khảo sát 3 nhóm đối thủ cạnh tranh trực tiếp trong bán kính 10km theo đúng khung 4 trụ cột của quy chuẩn SOP-MKT-2026-01 và gửi báo cáo về cho Trưởng phòng Doraemon.',
      scopeCheckPassed: true,
      scopeExplanation:
        'Nhiệm vụ thuộc đúng thẩm quyền chuyên môn của Bộ phận Marketing & Thị trường — Chaian (Chaien).',
      appliedSopCodes: ['SOP-MKT-2026-01'],
      spatialActionTaken:
        'Chaian đã tổng hợp bảng dữ liệu thị trường tại trạm Marketing (10.5, -1.8) và di chuyển sang Phòng họp (0, -7.5) báo cáo cho Doraemon trình Giám đốc.',
      keyFindings: [
        'Về giá bán lẻ m2: Đối thủ đang chào giá bạt Hiflex 48.000đ/m2 và Decal PP 80.000đ/m2 (cao hơn định mức chuẩn của PrintAd từ 6% - 7%), nhưng họ miễn phí giao nội thành cho đơn từ 3 triệu.',
        'Về tốc độ & chất lượng: 2/3 đối thủ mất 36-48 giờ cho đơn hàng POSM sự kiện và không hỗ trợ in thử mẫu màu (proof) miễn phí trước khi chạy hàng loạt.',
        'Điểm nghẽn của đối thủ: Dịch vụ kiểm tra file thiết kế còn thụ động, thường in luôn file RGB của khách dẫn đến sai lệch màu thương hiệu.',
        'Cơ hội cho PrintAd: Đẩy mạnh gói "Combo Khai Trương & POSM Điểm Bán" kèm cam kết in test mẫu CMYK trong 30 phút và bảo hành mực UV 24 tháng.'
      ],
      calculationRows: [
        {
          item: 'In Bạt Hiflex 3.2 dzem',
          spec: 'Khổ 3.2m, mực dầu ngoài trời',
          quantity: '1 m2',
          unitPrice: 'Đối thủ: 48.000đ',
          subtotal: 'PrintAd: 45.000đ (-6.2%)'
        },
        {
          item: 'In Decal PP cán màng',
          spec: 'Cán bóng/mờ bảo vệ',
          quantity: '1 m2',
          unitPrice: 'Đối thủ: 82.000đ',
          subtotal: 'PrintAd: 75.000đ (-8.5%)'
        },
        {
          item: 'Standee cuốn nhôm 0.8x2m',
          spec: 'Chân nhôm dày + túi chuyên dụng',
          quantity: '1 bộ',
          unitPrice: 'Đối thủ: 285.000đ',
          subtotal: 'PrintAd: 260.000đ (-8.8%)'
        }
      ],
      totalAmountFormatted: 'Tăng +28% giá trị đơn hàng trung bình (AOV) nhờ gói Combo POSM',
      recommendation:
        'Chaian đề xuất Doraemon trình Giám đốc phê duyệt gói Combo Khai Trương và phối hợp Shizuka (CSKH) gửi báo giá cho chuỗi cửa hàng mới.',
      executionTimeSec: 4.2,
      sourceMode: 'sop-engine'
    }
  },
  {
    id: 'task-seed-02',
    agentId: 'agent-design',
    title: 'Kiểm tra kỹ thuật file thiết kế Bộ nhận diện & Standee Khai trương',
    prompt:
      'Kiểm tra file thiết kế Standee 0.8x2.0m và tờ rơi A5 khách hàng gửi qua, chuẩn hóa hệ màu CMYK và tràn lề theo SOP.',
    priority: 'normal',
    targetZoneId: 'coworking',
    status: 'completed',
    progress: 100,
    appliedSopIds: ['sop-des-01'],
    spatialStepText: 'Nobita đã kiểm tra preflight, in proof tại Khu chung và báo cáo Doraemon',
    createdAt: '10:05',
    completedAt: '10:06',
    coordinatorDispatch: {
      isCeoDirective: true,
      coordinatorName: 'Doraemon (Đô-rê-mon)',
      coordinatorRole: 'Trưởng phòng Quản lý Chung & Điều phối',
      assignedAgentId: 'agent-design',
      assignedAgentName: 'Nobita',
      assignedDepartmentLabel: 'Thiết kế & Chế bản File',
      routingReason:
        'Doraemon tiếp nhận yêu cầu kiểm tra file in của Giám đốc và phân công ngay cho Nhân viên thiết kế Nobita xử lý kỹ thuật CMYK & tràn lề theo SOP-TK-2026-01.',
      directorSummaryFromDoraemon:
        'Báo cáo Giám đốc: Nobita đã hoàn thành chỉnh sửa 2 file thiết kế (chuyển RGB sang CMYK, bù tràn lề 3mm, convert font) và in thử bản proof đạt chuẩn tại Khu chung. Doraemon đã chỉ đạo chuyển sang xưởng in và báo Shizuka chuẩn bị Phiếu giao hàng.',
      supportingDepartments: ['Shizuka (Xuka) (CSKH - Báo giá & Hợp đồng)']
    },
    report: {
      headline: 'Biên bản Kiểm tra Kỹ thuật File (Preflight) & Bình bài Chế bản — Nobita',
      summary:
        'Nobita đã hoàn tất rà soát và chuẩn hóa 02 file thiết kế theo tiêu chuẩn kỹ thuật SOP-TK-2026-01 trước khi xuất lệnh in và báo cáo lại cho Trưởng phòng Doraemon.',
      scopeCheckPassed: true,
      scopeExplanation:
        'Nhiệm vụ đúng chuyên môn quản lý & chỉnh sửa file thiết kế in ấn của Nhân viên Thiết kế Nobita.',
      appliedSopCodes: ['SOP-TK-2026-01'],
      spatialActionTaken:
        'Nobita đã xử lý hệ màu tại Workstation đồ họa (-10.5, -1.8) và di chuyển ra Trạm máy in khổ lớn CMYK (0, 0.5) để xuất bản in thử kiểm chứng.',
      keyFindings: [
        'Hệ màu: Phát hiện 03 ảnh sản phẩm trong file Tờ rơi A5 đang ở hệ RGB -> Nobita đã chuyển sang CMYK (ISO Coated v2) và cân chỉnh lại độ tươi của tông đỏ/vàng.',
        'Tràn lề (Bleed): File gốc chưa chừa biên cắt -> Đã mở rộng tràn lề đủ 3mm cả 4 cạnh và lùi cụm chữ hotline vào vùng an toàn cách mép cắt 5mm.',
        'Màu đen chữ: Đã tách phần chữ mô tả 10pt từ 4 màu về chuẩn 1 kênh K=100% để tránh nhòe chữ khi in Offset.',
        'Font chữ & Độ phân giải: Đã Convert toàn bộ font sang đường cong (Outlines); độ phân giải Standee đạt chuẩn 180 DPI ở kích thước thật 80x200cm.'
      ],
      recommendation:
        'File đã đạt chuẩn xuất PDF/X-1a và TIFF CMYK. Nobita đã gửi bản in thử (proof) để Doraemon nghiệm thu và chuyển Shizuka lập phiếu giao hàng.',
      executionTimeSec: 3.8,
      sourceMode: 'sop-engine'
    }
  }
];
