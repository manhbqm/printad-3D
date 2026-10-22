import { AgentProfile, OfficeZone, SkillCatalogItem, SopDocument, TaskAssignment } from '../types/office';

export const OFFICE_ZONES: OfficeZone[] = [
  {
    id: 'overview',
    name: 'Toàn cảnh Doanh nghiệp 3D — Biệt đội Doraemon 8 Phòng Ban & 17 Nhân sự',
    shortLabel: 'Toàn cảnh',
    category: 'common',
    accentHex: '#f59e0b',
    center: { x: 0, y: 0, z: 0 },
    size: { width: 34, depth: 23 },
    cameraPosition: { x: -2.4, y: 16.2, z: 24.6 },
    cameraTarget: { x: 0.5, y: -0.2, z: 1.0 },
    description:
      'Không gian văn phòng 3D tích hợp Hệ thống 8 Phòng Ban Sub-Agents Claude với 17 nhân sự thuộc vũ trụ Doraemon: Ban Giám Đốc (Doraemon), Kinh Doanh B2B (Dekisugi), CSKH & 8D (Shizuka), Kế Toán (Suneo), Marketing (Chaian), Nhân Sự (Dorami), Kho & Mua Hàng (Bác Kaminari), Hành Chính & EHS (Thầy Giáo) cùng Kỹ Thuật (Nobita).',
    keyEquipment: [
      'Quầy Cà Phê gỗ ấm áp kèm bảng đèn Neon "CÀ PHÊ" & bàn tròn tiếp khách',
      'Khu Game Zone với màn hình lớn "TURBO KART", sofa đỏ & dàn máy thùng Arcade phát sáng',
      'Cụm bàn làm việc tiêu chuẩn 8 phòng ban (Kinh Doanh, Kế Toán, Kỹ Thuật, CSKH, Marketing, Kho, Nhân Sự, Hành Chính)',
      'Hồ nước đêm bao quanh văn phòng với lá sen xanh, bồn cây nhiệt đới & phòng họp vách kính Ban Giám Đốc'
    ],
    aiSpatialInteraction:
      'Nhân sự Doraemon tự động đi lại, giao dịch cà phê, giải trí Game Zone và làm việc chuyên trách theo 30 Kỹ Năng Doanh Nghiệp Sản Xuất. Nhấp chuột vào bất kỳ nhân sự nào để kiểm tra chức danh, slash command (/bgd, /kd, /cskh, /kt, /mkt, /ns, /kho, /hc, /tk) và bộ skill tương ứng.'
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
      'Quầy Bar Cà Phê gỗ lam ấm áp với đèn Neon "CÀ PHÊ", máy pha Espresso và các bàn tròn nơi Shizuka (CSKH) cùng Dekisugi (Kinh doanh) tiếp đón đối tác B2B, ký kết hợp đồng và nhân sự giao lưu.',
    keyEquipment: [
      'Quầy Bar Cà Phê ốp gỗ lam dọc kèm máy pha Espresso & tủ bánh',
      'Bảng hiệu đèn Neon "CÀ PHÊ" phát sáng trên khung vách ngăn',
      'Cụm bàn tròn gỗ & ghế bistro nơi nhân sự ngồi uống cà phê, đàm phán hợp đồng'
    ],
    aiSpatialInteraction:
      'Nhân viên thường xuyên đi bộ ra quầy pha cà phê, ngồi trò chuyện tại bàn tròn; Shizuka và Dekisugi dùng khu vực này để đón khách B2B và ký kết thỏa thuận.'
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
    name: 'Phòng Họp Vách Kính & Điều Hành Ban Giám Đốc (Doraemon)',
    shortLabel: 'Phòng họp Ban Giám Đốc',
    category: 'common',
    accentHex: '#6366f1',
    center: { x: -10.5, y: 0, z: -6.2 },
    size: { width: 9.5, depth: 6.2 },
    cameraPosition: { x: -6.5, y: 6.2, z: 1.5 },
    cameraTarget: { x: -10.0, y: 0.8, z: -6.0 },
    description:
      'Phòng họp điều hành vách kính khung đen sang trọng phía sau bên trái với thảm xanh lam, kệ sách gỗ phát sáng và cụm bàn họp nơi Master Agent Doraemon triệu tập 8 Trưởng phòng báo cáo chỉ số OTIF, ROI và giải quyết sự cố 8D.',
    keyEquipment: [
      'Hệ vách kính khung nhôm đen cách âm & đèn thả trần ấm áp',
      'Cụm bàn họp điều phối & màn hình kiểm duyệt kế hoạch toàn công ty',
      'Hệ tủ kệ sách gỗ âm tường trưng bày hồ sơ pháp lý & quy chuẩn SOP 8 phòng ban'
    ],
    aiSpatialInteraction:
      'Khi Giám đốc triệu tập họp hoặc phát lệnh khẩn cấp qua /bgd, Doraemon sẽ triệu tập các Trưởng phòng ban vào phòng vách kính để bàn giao nhiệm vụ.'
  },
  {
    id: 'sales_quoting',
    name: 'Phân khu 04-CSKH & 02-Kinh Doanh — Shizuka & Dekisugi',
    shortLabel: 'CSKH & Kinh Doanh',
    category: 'department',
    departmentId: 'customer_service',
    accentHex: '#f472b6',
    center: { x: 2.6, y: 0, z: 5.5 },
    size: { width: 8.2, depth: 5.8 },
    cameraPosition: { x: 1.2, y: 2.15, z: 9.2 },
    cameraTarget: { x: 2.2, y: 1.05, z: 6.2 },
    description:
      'Đặt trên thảm xanh lá đậm phía trước trung tâm do Shizuka (CSKH) và Dekisugi (Kinh doanh B2B) phụ trách: Tiếp nhận khiếu nại chất lượng 8D, soạn thảo hợp đồng thương mại quốc tế, bóc tách báo giá kỹ thuật và quản lý công nợ khách hàng.',
    keyEquipment: [
      'Cụm 4 bàn làm việc trắng hiện đại kèm khung giàn cây xanh treo',
      'Trạm máy tính tính báo giá kỹ thuật, lập phiếu giao hàng và theo dõi đơn hàng RFQ',
      'Hồ sơ Hợp đồng thương mại B2B, biên bản nghiệm thu và phiếu bảo hành chất lượng 8D'
    ],
    aiSpatialInteraction:
      'Shizuka và Dekisugi túc trực tại cụm bàn mặt tiền, tra cứu bảng giá định mức, soạn thảo email B2B và giải quyết khiếu nại khách hàng trong vòng 2 giờ.'
  },
  {
    id: 'accounting',
    name: 'Phân khu 05-Kế Toán Sản Xuất & Tài Chính — Suneo (Xêko)',
    shortLabel: 'Kế toán (Suneo)',
    category: 'department',
    departmentId: 'accounting',
    accentHex: '#10b981',
    center: { x: 5.5, y: 0, z: -4.2 },
    size: { width: 8.0, depth: 5.6 },
    cameraPosition: { x: 3.8, y: 2.15, z: -0.2 },
    cameraTarget: { x: 5.2, y: 1.05, z: -3.2 },
    description:
      'Đặt trên thảm tím Lavender phía sau trung tâm do Suneo (Kế toán trưởng) phụ trách: Tính giá thành định mức (Standard Costing: 621, 622, 627), đối chiếu số liệu kho - kế toán, kiểm soát tỷ lệ chi phí NVL <= 62% và bảo mật dữ liệu PII.',
    keyEquipment: [
      'Cụm 4 bàn kế toán trắng dưới ánh đèn thả trần ấm áp',
      'Tủ hồ sơ lưu trữ thông tin hợp đồng đối tác, khách hàng B2B & sổ công nợ',
      'Hệ thống phần mềm kế toán quản trị dòng tiền & hóa đơn điện tử VAT'
    ],
    aiSpatialInteraction:
      'Suneo kiểm tra công nợ, đối soát chi phí vật tư và bảo mật thông tin nhạy cảm trước khi gửi báo cáo tài chính cho Doraemon trình Giám đốc.'
  },
  {
    id: 'design_tech',
    name: 'Phân khu Kỹ Thuật & Thiết Kế Chế Bản CMYK — Nobita',
    shortLabel: 'Kỹ thuật (Nobita)',
    category: 'department',
    departmentId: 'design_tech',
    accentHex: '#facc15',
    center: { x: -8.5, y: 0, z: 1.4 },
    size: { width: 8.5, depth: 5.8 },
    cameraPosition: { x: -5.8, y: 2.15, z: 4.8 },
    cameraTarget: { x: -7.2, y: 1.05, z: 1.8 },
    description:
      'Đặt trên thảm xanh rêu "KỸ THUẬT" bên trái do Nobita phụ trách: Kiểm tra kỹ thuật file (Preflight), chuẩn hóa hệ màu 100% CMYK, bù tràn lề bleed 3mm, Rich Black, độ phân giải DPI 300 và in test proof mẫu màu trước khi sản xuất.',
    keyEquipment: [
      'Cụm 4 bàn Workstation đồ họa trên thảm chữ nổi 3D "KỸ THUẬT"',
      'Bảng vẽ Wacom, quạt màu Pantone CMYK & máy đo quang phổ màu',
      'Trạm kiểm tra file vector & máy in proof thử màu khổ lớn'
    ],
    aiSpatialInteraction:
      'Nobita đeo kính cận tỉ mỉ chỉnh sửa file kỹ thuật tại khu Kỹ thuật, kiểm tra chuẩn màu CMYK và gửi bản in proof cho Doraemon nghiệm thu.'
  },
  {
    id: 'marketing',
    name: 'Phân khu 03-Marketing Công Nghiệp & B2B — Chaian (Chaien)',
    shortLabel: 'Marketing (Chaian)',
    category: 'department',
    departmentId: 'marketing',
    accentHex: '#f97316',
    center: { x: 5.2, y: 0, z: 4.8 },
    size: { width: 8.2, depth: 5.8 },
    cameraPosition: { x: 7.2, y: 2.15, z: 8.0 },
    cameraTarget: { x: 5.5, y: 1.05, z: 4.5 },
    description:
      'Đặt tại khu vực chữ nổi 3D "SEO · AEO" phía trước do Trưởng phòng Chaian (Chaien) phụ trách: Xây dựng Company Profile chuẩn quốc tế, soạn thảo Case study công nghệ cao, đóng gói tài liệu thương hiệu và nghiên cứu thị trường B2B.',
    keyEquipment: [
      'Cụm bàn chiến dịch SEO · AEO & Marketing kèm giàn khung cây xanh',
      'Màn hình phân tích từ khóa, năng lực đối thủ cạnh tranh & hồ sơ thầu RFP',
      'Bộ tài liệu Company Profile in Offset cao cấp & bộ mẫu POSM sự kiện'
    ],
    aiSpatialInteraction:
      'Chaian chỉ huy nhóm Marketing, thu thập dữ liệu đối thủ cạnh tranh, xây dựng slide thuyết trình năng lực kỹ thuật và báo cáo qua Doraemon.'
  },
  {
    id: 'hr_ops',
    name: 'Trung tâm Quản lý 01-Ban Giám Đốc & Điều Phối Master Agent — Doraemon',
    shortLabel: 'Quản lý Chung (Doraemon)',
    category: 'department',
    departmentId: 'board_executive',
    accentHex: '#38bdf8',
    center: { x: -3.2, y: 0, z: -2.2 },
    size: { width: 7.5, depth: 6.0 },
    cameraPosition: { x: -1.8, y: 2.15, z: 1.2 },
    cameraTarget: { x: -3.2, y: 1.05, z: -2.2 },
    description:
      'Đặt tại Lounge Điều Phối Trung Tâm do Master Agent Doraemon phụ trách: Tiếp nhận chỉ thị từ Tổng Giám Đốc, tự động phân rã tác vụ qua 8 Sub-Agents phòng ban (/bgd, /kd, /cskh, /kt, /mkt, /ns, /kho, /hc), kiểm tra chéo chống bịa đặt và tổng hợp báo cáo điều hành 1 trang.',
    keyEquipment: [
      'Khu vực Sofa Lounge tròn trung tâm kết nối trực tiếp mọi phòng ban',
      'Máy tính bảng điều phối thông minh & bảo bối chong chóng tre',
      'Hệ thống giám sát tiến độ 17 nhân sự toàn doanh nghiệp theo thời gian thực'
    ],
    aiSpatialInteraction:
      'Doraemon đứng tại trung tâm điều phối, kích hoạt các Sub-Agent phòng ban, kiểm soát tiến độ pipeline liên phòng ban và báo cáo Giám đốc.'
  }
];

export const INITIAL_SOP_DOCUMENTS: SopDocument[] = [
  {
    id: 'sop-bgd-01',
    departmentId: 'board_executive',
    code: 'SOP-BGD-2026-01',
    title: 'Quy chuẩn Chỉ thị Điều hành Ban Giám Đốc, Đánh giá Rủi ro OTIF & Tỷ suất hoàn vốn ROI (Doraemon)',
    category: '01 - Ban Giám Đốc',
    summary:
      'Quy trình Master Agent Doraemon rà soát báo cáo 8 phòng ban, nhận diện điểm nghẽn sản xuất, chỉ thị khẩn cấp và kiểm tra chéo chống bịa đặt.',
    rules: [
      'Mọi văn bản chỉ đạo điều hành phải mở đầu bằng Executive Summary dưới 150 từ: Tình hình cốt lõi - Số liệu mấu chốt - Đề xuất quyết định hành động.',
      'Luôn chỉ rõ tác động định lượng: Chi phí phát sinh (VND) - Thời gian ảnh hưởng (Ngày/Giờ) - Bộ phận chịu trách nhiệm chính theo ma trận RACI.',
      'Tuyệt đối tuân thủ Zero-Hallucination: Kích hoạt skill kiem-tra-chong-bia và doi-chieu-so-lieu trước khi ký duyệt chỉ thị hoặc báo cáo HĐQT.',
      'Đánh giá dự án tự động hóa: Bắt buộc tính toán thời gian thu hồi vốn (Payback period) và tỷ suất hoàn vốn nội bộ (IRR/ROI) trước khi trình Hội đồng Quản trị.'
    ],
    updatedAt: '2026-10-21',
    isActive: true
  },
  {
    id: 'sop-kd-01',
    departmentId: 'sales_b2b',
    code: 'SOP-KD-2026-01',
    title: 'Quy chuẩn Báo giá Kỹ thuật B2B, Hạn mức Công nợ & Đàm phán Hợp đồng Thương mại (Dekisugi)',
    category: '02 - Kinh Doanh',
    summary:
      'Tiêu chuẩn tiếp nhận RFQ, bóc tách định mức BOM, phân bậc MOQ, soạn thảo hợp đồng thương mại và theo dõi công nợ B2B.',
    rules: [
      'Báo giá kỹ thuật phải nêu rõ: Đơn giá chưa VAT, thời hạn hiệu lực báo giá (15-30 ngày), điều kiện giao hàng Incoterms 2020 (EXW, FOB, DDP).',
      'Chính sách phân bậc MOQ: Chiết khấu 5% cho đơn hàng >= 1.000 sản phẩm, 8% cho >= 5.000 sản phẩm; đơn hàng tùy chỉnh khuôn mẫu yêu cầu đặt cọc 50%.',
      'Giao dịch quốc tế & đối tác FDI: Kích hoạt skill viet-song-ngu-viet-anh và viet-thu-dien-tu để soạn thảo hồ sơ thầu chuẩn mực thương mại.',
      'Thời hạn công nợ B2B tối đa 30-45 ngày; khách hàng mới bắt buộc thu tạm ứng tối thiểu 50% trước khi chuyển lệnh sang bộ phận Mua hàng & Sản xuất.'
    ],
    updatedAt: '2026-10-21',
    isActive: true
  },
  {
    id: 'sop-mkt-01',
    departmentId: 'marketing',
    code: 'SOP-MKT-2026-01',
    title: 'Quy chuẩn Hồ sơ Năng lực Nhà máy Company Profile, B2B Case Study & Nhận diện Thương hiệu (Chaian)',
    category: '03 - Marketing',
    summary:
      'Phương pháp đóng gói Company Profile cho đối tác FDI, xây dựng Case Study chứng minh năng lực kỹ thuật và triển lãm công nghiệp.',
    rules: [
      'Hồ sơ năng lực nhà máy (Company Profile) bắt buộc cập nhật danh mục máy móc hiện đại (CNC, máy dập, máy in UV), chứng chỉ ISO 9001, ISO 14001, IATF 16949.',
      'Case study kỹ thuật phải có số liệu định lượng chứng minh: Giảm tỷ lệ phế phẩm (Scrap rate), tăng chỉ số giao hàng đúng hẹn (OTIF) và tối ưu chi phí cho khách hàng.',
      'Kích hoạt skill dong-goi-tai-lieu-thuong-hieu để chuẩn hóa màu sắc nhận diện, font chữ và phong cách chuyên nghiệp khi tiếp đón đoàn kiểm toán FDI.',
      'Khảo sát năng lực và khung giá đối thủ cạnh tranh định kỳ hàng quý, đề xuất các gói giải pháp gia công và combo POSM gia tăng giá trị.'
    ],
    updatedAt: '2026-10-21',
    isActive: true
  },
  {
    id: 'sop-cskh-01',
    departmentId: 'customer_service',
    code: 'SOP-CSKH-2026-01',
    title: 'Quy chuẩn Tiếp nhận Khiếu nại, Cam kết SLA 2 Giờ & Báo cáo Sự cố 8D Problem Solving (Shizuka)',
    category: '04 - Chăm Sóc Khách Hàng',
    summary:
      'Quy trình xử lý khiếu nại chất lượng sản phẩm, điều phối QC kho, lập báo cáo 8D và đề xuất phương án bồi thường/bù hàng.',
    rules: [
      'Cam kết thời gian phản hồi (SLA): Tiếp nhận thông tin khiếu nại và gửi thư xác nhận chính thức cho khách hàng trong vòng tối đa 02 giờ làm việc.',
      'Thu thập đầy đủ bằng chứng sự cố: Hình ảnh lỗi thực tế, số lô sản xuất (Lot No.), ngày giao hàng, tỷ lệ lỗi trên tổng số lượng nhận.',
      'Áp dụng quy trình giải quyết sự cố 8D: Phối hợp QC kho cô lập lô hàng nghi vấn, áp dụng kỹ thuật 5 Whys tìm nguyên nhân gốc rễ và đề xuất hành động khắc phục phòng ngừa (CAPA).',
      'Đề xuất phương án xử lý thỏa đáng: Bù hàng mới trong 24h, cấn trừ công nợ hoặc cử kỹ sư kỹ thuật sang tận nhà xưởng khách hàng hỗ trợ khắc phục.'
    ],
    updatedAt: '2026-10-21',
    isActive: true
  },
  {
    id: 'sop-quote-01',
    departmentId: 'customer_service',
    code: 'SOP-BG-2026-01',
    title: 'Quy chuẩn Báo giá In Ấn & Vật Liệu Quảng Cáo, Lập Hợp đồng Mua bán & Phiếu Giao Hàng (Shizuka)',
    category: 'CSKH, Báo giá & Hợp đồng',
    summary:
      'Quy định cách tính diện tích m2, đơn giá vật tư in chuẩn, lập hợp đồng mua bán, phiếu mua bán và phiếu giao hàng xuất xưởng.',
    rules: [
      'In bạt Hiflex tiêu chuẩn (3.2 dzem): 45.000đ/m2; Hiflex dày không gân xuyên sáng: 85.000đ/m2. In Decal PP cán màng: 75.000đ/m2.',
      'Biển chữ nổi Mica gắn LED âm: 1.150.000đ/m2; Standee cuốn nhôm 0.8x2.0m: 260.000đ/bộ; Catalog in Offset: 18.000đ/cuốn.',
      'Chính sách chiết khấu: Tổng diện tích >= 50m2 (hoặc >= 20 bộ) giảm 8%; >= 100m2 giảm 12%. Đơn gấp cộng phụ phí 15%. VAT mặc định 8%.',
      'Mọi đơn hàng từ 5.000.000đ trở lên bắt buộc lập Hợp đồng mua bán (ghi rõ quy cách vật liệu, tiến độ, điều khoản bảo hành màu 12-24 tháng).'
    ],
    updatedAt: '2026-10-15',
    isActive: true
  },
  {
    id: 'sop-kt-01',
    departmentId: 'accounting',
    code: 'SOP-KT-2026-01',
    title: 'Quy chuẩn Kế toán Chi phí Standard Costing (621, 622, 627), Đối chiếu Kho & Ẩn thông tin PII (Suneo)',
    category: '05 - Kế Toán',
    summary:
      'Quy chuẩn tính giá thành định mức, đối chiếu số liệu sổ cái với thẻ kho WMS, kiểm soát tỷ lệ NVL <= 62% và bảo mật PII.',
    rules: [
      'Tính toán giá thành sản phẩm theo phương pháp Standard Costing: Bóc tách chi phí NVL trực tiếp (621), chi phí nhân công trực tiếp (622) và chi phí sản xuất chung (627).',
      'Kiểm soát tỷ lệ chi phí nguyên vật liệu trên doanh thu thuần đảm bảo không vượt quá ngưỡng trần 62%; hao hụt NVL thực tế <= 3.8%.',
      'Kích hoạt skill doi-chieu-so-lieu định kỳ hàng tuần giữa sổ kế toán và thẻ kho WMS, phát hiện ngay các khoản chênh lệch tồn và nợ quá hạn.',
      'Kích hoạt skill an-thong-tin-nhay-cam: Che giấu toàn bộ thông tin giá vốn thực, số tài khoản ngân hàng và dữ liệu cá nhân PII trước khi xuất báo cáo công khai.'
    ],
    updatedAt: '2026-10-21',
    isActive: true
  },
  {
    id: 'sop-ns-01',
    departmentId: 'human_resources',
    code: 'SOP-NS-2026-01',
    title: 'Quy chuẩn Tuyển dụng Kỹ sư/Công nhân, Ma trận Chấm điểm CV & Quản trị 3 Ca Kíp (Dorami)',
    category: '06 - Nhân Sự',
    summary:
      'Quy trình lập JD chuẩn kỹ thuật, ma trận chấm điểm năng lực ứng viên, lịch phân ca 3 kíp và giám sát OT không quá 40h/tháng.',
    rules: [
      'Kích hoạt skill mo-ta-cong-viec-va-sang-loc-cv: Thiết lập bản mô tả công việc (JD) chuẩn và ma trận thang điểm chấm CV theo khung năng lực & kỷ luật nhà xưởng.',
      'Quản trị lịch làm việc 3 ca liên tục: Ca 1 (06h-14h), Ca 2 (14h-22h), Ca 3 (22h-06h); đảm bảo bố trí đủ nhân sự then chốt và bảo vệ tại mọi ca.',
      'Kiểm soát giờ làm thêm (OT) tuân thủ Bộ luật Lao động: Thời gian OT không vượt quá 40 giờ/tháng và 200 giờ/năm cho mỗi công nhân.',
      'Checklist an toàn đầu vào: 100% công nhân và nhân sự mới phải hoàn thành khóa đào tạo 5S, an toàn vệ sinh lao động (ATVSLĐ) và PCCC trước khi vào dây chuyền.'
    ],
    updatedAt: '2026-10-21',
    isActive: true
  },
  {
    id: 'sop-kho-01',
    departmentId: 'warehouse_supply',
    code: 'SOP-KHO-2026-01',
    title: 'Quy chuẩn Quản trị Tồn kho An toàn Min-Max, Đặt hàng PO & Nguyên tắc Xuất kho FIFO (Bác Kaminari)',
    category: '07 - Kho & Mua Hàng',
    summary:
      'Quy định tính điểm đặt hàng lại ROP, lập đơn mua PO, kiểm kê định kỳ cuối tháng, kiểm soát Lot No và chống thất thoát vật tư.',
    rules: [
      'Thiết lập mức dự trữ tồn kho an toàn (Safety Stock) và điểm đặt hàng lại (Re-Order Point - ROP) cho các nhóm vật tư chủ lực (phôi thép, bạt in, decal, hạt nhựa).',
      'Tuân thủ tuyệt đối nguyên tắc xuất nhập kho FIFO (First In - First Out); kiểm soát chặt chẽ tem nhãn Lot No., ngày nhập và vị trí kệ kho chuẩn 5S.',
      'Lập đơn đặt hàng mua nguyên vật liệu (Purchase Order - PO) gửi nhà cung ứng, theo dõi tiến độ giao hàng và đánh giá chất lượng NCC định kỳ hàng quý.',
      'Kiểm kê kho định kỳ cuối mỗi tháng: Kích hoạt skill tao-bang-kiem đối soát thực tế với phần mềm, biên bản giải trình chênh lệch hao hụt <= 0.2%.'
    ],
    updatedAt: '2026-10-21',
    isActive: true
  },
  {
    id: 'sop-hc-01',
    departmentId: 'administration_ehs',
    code: 'SOP-HC-2026-01',
    title: 'Quy chuẩn Cấp phát BHLĐ, An toàn Môi trường 5S, Diễn tập PCCC & Đón tiếp Kiểm toán FDI (Thầy Giáo)',
    category: '08 - Hành Chính & EHS',
    summary:
      'Tiêu chuẩn quản lý trang thiết bị BHLĐ, quy trình ra vào cổng an ninh, quản lý suất ăn công nghiệp và đón tiếp đoàn audit nhà máy.',
    rules: [
      'Cấp phát định kỳ và kiểm tra sử dụng Trang bị Bảo hộ Lao động (BHLĐ): Giày mũi sắt chống đinh, kính bảo hộ, khẩu trang than hoạt tính và nút tai chống ồn.',
      'Kiểm tra định kỳ trang thiết bị PCCC, hệ thống cảnh báo khói, lối thoát hiểm và tổ chức diễn tập ứng phó sự cố khẩn cấp định kỳ 6 tháng/lần.',
      'Quản lý vệ sinh an toàn thực phẩm nhà ăn công nghiệp ca kíp, lưu mẫu thức ăn 24 giờ và điều phối phương tiện đưa đón cán bộ, chuyên gia đúng giờ.',
      'Kích hoạt skill chuan-bi-cuoc-hop và tao-bang-kiem: Chuẩn bị chu đáo hồ sơ pháp lý môi trường, đánh giá tác động DTM khi tiếp đón đoàn kiểm toán FDI.'
    ],
    updatedAt: '2026-10-21',
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
      'Tràn lề (Bleed) và vùng an toàn: Ấn phẩm cắt xén bắt buộc chừa tràn lề 2mm - 3mm mỗi cạnh; nội dung chữ cách mép cắt tối thiểu 4mm.',
      'Độ phân giải ảnh (DPI): Ấn phẩm cầm tay đạt tối thiểu 300 DPI; Standee/Poster nhìn gần đạt 150-200 DPI; Pano khổ lớn đạt 72-100 DPI ở kích thước thật 1:1.',
      'Font chữ và liên kết: Toàn bộ text phải Convert to Curves / Create Outlines và Embed toàn bộ ảnh link trước khi lưu PDF/X-1a hoặc TIFF.'
    ],
    updatedAt: '2026-10-16',
    isActive: true
  },
  {
    id: 'sop-vp-01',
    departmentId: 'sales_b2b',
    code: 'SOP-VP-2026-01',
    title: 'Quy chuẩn Soạn thảo Thư điện tử Thương mại B2B & Báo giá Kỹ thuật (Dekisugi)',
    category: '12 Kỹ Năng Văn Phòng (01-viet-thu-dien-tu)',
    summary:
      'Quy chuẩn viết email giao dịch B2B: tiêu đề chuẩn hóa, cấu trúc RFQ, chào giá FOB/EXW, đôn đốc công nợ và chữ ký số.',
    rules: [
      'Tiêu đề email bắt buộc tuân theo chuẩn: [Tên Doanh Nghiệp] - [Nội dung cốt lõi] - [Mã đơn hàng PO/RFQ].',
      'Cấu trúc thư phải có đủ 4 phần: Lời chào trang trọng -> Căn cứ RFQ/Bản vẽ -> Bảng báo giá chi phí & điều kiện Incoterms -> Lời kêu gọi hành động (CTA) có thời hạn cụ thể.',
      'Khi đôn đốc công nợ, dùng ngôn từ lịch thiệp, đính kèm biên bản đối chiếu công nợ có xác nhận 2 bên và số hotline kế toán.',
      'Chữ ký thư điện tử phải có đầy đủ: Họ tên, chức danh, hotline, email công ty, địa chỉ nhà xưởng và đường dẫn hồ sơ năng lực.'
    ],
    updatedAt: '2026-10-22',
    isActive: true
  },
  {
    id: 'sop-vp-02',
    departmentId: 'board_executive',
    code: 'SOP-VP-2026-02',
    title: 'Quy chuẩn Lập Biên bản Họp Giao ban Điều hành Sản xuất & Phân công RACI (Doraemon)',
    category: '12 Kỹ Năng Văn Phòng (03-ghi-chu-hop)',
    summary:
      'Phương pháp ghi chép biên bản cuộc họp giao ban tuần, tổng hợp quyết định then chốt và lập ma trận phân công hành động RACI.',
    rules: [
      'Biên bản họp bắt buộc ghi rõ: Thời gian, địa điểm, chủ trì, thư ký và danh sách đại diện các phòng ban tham dự.',
      'Phần I (Key Decisions): Tóm tắt ngắn gọn các quyết định đã được Giám đốc chốt (tăng ca, duyệt ngân sách, kỷ luật, quy chuẩn mới).',
      'Phần II (Action Items): Lập bảng phân công 6 cột: STT, Nhiệm vụ cụ thể, Người chịu trách nhiệm chính (Owner), Bộ phận phối hợp, Hạn chót (Deadline), Tiêu chí hoàn thành (DoD).',
      'Biên bản phải được gửi email cho toàn bộ thành viên trong vòng tối đa 02 giờ sau khi kết thúc cuộc họp.'
    ],
    updatedAt: '2026-10-22',
    isActive: true
  },
  {
    id: 'sop-vp-03',
    departmentId: 'customer_service',
    code: 'SOP-VP-2026-03',
    title: 'Quy chuẩn Kịch bản Phản hồi CSKH & Báo cáo Giải trình Sự cố 8D (Shizuka)',
    category: '12 Kỹ Năng Văn Phòng (09-phan-hoi-khach-hang)',
    summary:
      'Quy trình 3 giai đoạn xử lý khiếu nại chất lượng hàng (phản hồi trong 30p, xuất hàng thay thế trong 4h, gửi báo cáo 8D trong 48h).',
    rules: [
      'Giai đoạn 1 (Trong vòng 30 phút): Gọi điện thoại trực tiếp xác nhận sự cố, hỏi thăm mức độ ảnh hưởng dây chuyền và cử kỹ sư sang hiện trường.',
      'Giai đoạn 2 (Trong vòng 04 giờ): Xuất kho khẩn cấp lô hàng đệm an toàn (Buffer stock) để khách hàng không bị gián đoạn sản xuất/kinh doanh.',
      'Giai đoạn 3 (Trong vòng 48 giờ): Soạn thảo báo cáo giải trình sự cố theo biểu mẫu chuẩn 8D có chữ ký của Tổng Giám Đốc và Quản đốc xưởng.',
      'Áp dụng phương pháp 5 Whys để tìm nguyên nhân gốc rễ và đề xuất hành động khắc phục phòng ngừa vĩnh viễn (CAPA).'
    ],
    updatedAt: '2026-10-22',
    isActive: true
  },
  {
    id: 'sop-vp-04',
    departmentId: 'administration_ehs',
    code: 'SOP-VP-2026-04',
    title: 'Quy chuẩn Xây dựng Quy trình Vận hành Tiêu chuẩn SOP Chuẩn ISO 9001:2015 (Thầy Giáo)',
    category: '12 Kỹ Năng Văn Phòng (08-viet-quy-trinh)',
    summary:
      'Phương pháp biên soạn quy trình SOP chuẩn công nghiệp: mã hiệu, mục tiêu, lưu đồ, thao tác từng bước và tiêu chuẩn nghiệm thu.',
    rules: [
      'Mỗi quy trình SOP phải có mã hiệu chuẩn (SOP-XX-YY), số lần ban hành, ngày hiệu lực và người phê duyệt có thẩm quyền.',
      'Mô tả thao tác theo công thức: [Ai làm] - [Làm gì] - [Tại bước nào] - [Bằng công cụ gì] - [Tiêu chuẩn đánh giá đạt/không đạt].',
      'Đính kèm bảng kiểm checklist 1 trang để công nhân/nhân viên có thể in ra dán tại vị trí làm việc hoặc máy móc.',
      'Định kỳ rà soát và cập nhật quy trình 6 tháng/lần dựa trên các đề xuất cải tiến Kaizen từ hiện trường sản xuất.'
    ],
    updatedAt: '2026-10-22',
    isActive: true
  },
  {
    id: 'sop-vp-05',
    departmentId: 'warehouse_supply',
    code: 'SOP-VP-2026-05',
    title: 'Quy chuẩn Quản trị Tiến độ Đơn hàng Sản xuất theo Bảng Kanban 4 Cột (Bác Kaminari)',
    category: '12 Kỹ Năng Văn Phòng (10-theo-doi-cong-viec)',
    summary:
      'Phương pháp quản lý đơn hàng trực quan theo 4 cột Kanban (Backlog, Chuẩn bị phôi, Đang sản xuất 3 ca, Hoàn thành nghiệm thu).',
    rules: [
      'Mỗi thẻ đơn hàng trên bảng Kanban phải thể hiện: Mã đơn hàng, Tên khách hàng, Quy cách kỹ thuật, Số lượng, Hạn giao hàng (Due date) và Người phụ trách.',
      'Giới hạn khối lượng công việc đang xử lý (WIP limit) tại công đoạn in/dập không quá 5 đơn hàng cùng lúc để tránh tắc nghẽn cục bộ.',
      'Đánh dấu nhãn màu cảnh báo: Xanh (Đúng tiến độ), Vàng (Có nguy cơ chậm trong 24h), Đỏ (Khẩn cấp/Sự cố máy cần giải phóng ngay).',
      'Cập nhật trạng thái thẻ Kanban 2 lần mỗi ngày vào đầu ca sáng (08h00) và đầu ca chiều (13h30).'
    ],
    updatedAt: '2026-10-22',
    isActive: true
  },
  {
    id: 'sop-cty-01',
    departmentId: 'board_executive',
    code: 'SOP-CTY-2026-01',
    title: 'Quy chế Bảo mật Dữ liệu Doanh nghiệp PII/NDA & Zero-Hallucination Policy (Doraemon)',
    category: '00 - Doanh Nghiệp & Chính Sách Chung',
    summary:
      'Chính sách bắt buộc bảo vệ thông tin bí mật thương mại, ẩn thông tin PII khách hàng và kiểm tra chéo độ chính xác số liệu trước khi xuất bản.',
    rules: [
      'Bảo mật PII & NDA: Tuyệt đối không để lộ giá vốn thực tế, công thức vật liệu độc quyền, thông tin cá nhân khách hàng và tài khoản ngân hàng nội bộ.',
      'Zero-Hallucination: Kích hoạt skill kiem-tra-chong-bia và doi-chieu-so-lieu; không tự suy diễn số liệu kỹ thuật ngoài phạm vi tài liệu đầu vào.',
      'Khi thiếu dữ liệu đầu vào, bắt buộc ghi chú rõ: [Giả định kỹ thuật / Cần xác nhận lại với phụ trách bộ phận].',
      'Mọi tài liệu chính thức xuất bản đều phải lưu bản sao lưu trữ tại ket-qua/ theo quy chuẩn phân cấp thư mục.'
    ],
    updatedAt: '2026-10-22',
    isActive: true
  }
];

export const INITIAL_AGENTS: AgentProfile[] = [
  {
    id: 'agent-hr',
    characterKey: 'doraemon',
    roleTier: 'ceo',
    name: 'Doraemon (Đô-rê-mon)',
    roleTitle: 'Master Agent & Trợ Lý Cấp Cao Ban Giám Đốc',
    departmentId: 'board_executive',
    departmentLabel: '01 - Ban Giám Đốc',
    zoneId: 'hr_ops',
    accentHex: '#38bdf8',
    suitColorHex: 0x0284c7,
    hairColorHex: 0x0284c7,
    accessoryType: 'clipboard',
    slashCommand: '/bgd',
    subAgentModule: '01-ban-giam-doc',
    skills: [
      'tom-tat-cho-quan-ly',
      'tim-diem-dang-chu-y',
      'ra-soat-hop-dong',
      'chuan-bi-cuoc-hop',
      'ghi-chu-hop',
      'tao-bao-cao-tuan',
      'kiem-tra-chong-bia'
    ],
    primaryMission:
      'Master Agent Điều Phối Trung Tâm: Tiếp nhận chỉ thị từ Tổng Giám Đốc, tự động phân tích và điều phối công việc chính xác cho 8 Sub-Agents phòng ban (/bgd, /kd, /cskh, /kt, /mkt, /ns, /kho, /hc); tổng hợp báo cáo điều hành 1 trang (Executive Summary) và tư vấn chiến lược.',
    strictBoundary:
      'Chuyên trách điều phối cấp cao và tổng hợp chiến lược. Khi chỉ thị thuộc chuyên môn kỹ thuật sâu của phòng ban nào, Doraemon tự động chuyển giao cho Sub-Agent chuyên trách và giám sát theo dõi tiến độ.',
    personalityTraits: [
      'Thông thái, tận tâm, điều phối nhịp nhàng như lấy bảo bối từ túi thần kỳ 4 chiều',
      'Nắm vững chuyên môn SOP của cả 8 phòng ban để giao đúng người đúng việc',
      'Tổng hợp báo cáo phản hồi từ nhân viên kèm lời khuyên tư vấn chiến lược rõ ràng trình Giám đốc'
    ],
    spatialBehavior:
      'Túc trực tại Trung tâm điều phối (-3.2, -2.2) và Phòng họp Ban Giám Đốc vách kính (-10.5, -6.2). Khi nhận chỉ thị, Doraemon phân rã quy trình và tổng hợp kết quả.',
    allowedKeywords: [
      '/bgd',
      'ban giám đốc',
      'giám đốc',
      'điều phối',
      'quản lý chung',
      'tổng hợp',
      'chỉ thị',
      'nghị quyết',
      'báo cáo tuần',
      'điểm nghẽn',
      'chiến lược',
      'rủi ro',
      'doraemon',
      'đô rê mon'
    ],
    homePosition: { x: -3.2, y: 0, z: -2.2 },
    workstationLookAt: { x: -1.2, y: 1.2, z: 2.2 },
    collaborationPoint: { x: -0.5, y: 0, z: 0.8 },
    sampleTasks: [
      {
        id: 'task-bgd-summary',
        label: 'Tóm tắt điều hành 1 trang & Đánh giá điểm nghẽn toàn công ty',
        prompt:
          '/bgd Hãy tổng hợp báo cáo điều hành tuần của 8 phòng ban, chỉ rõ các điểm nghẽn sản xuất, biến động chi phí và tỷ lệ giao hàng đúng hạn OTIF.',
        targetZoneId: 'meeting',
        priority: 'high'
      },
      {
        id: 'task-bgd-directive',
        label: 'Dự thảo Chỉ thị khẩn cấp nâng công suất phục vụ mùa cao điểm',
        prompt:
          '/bgd Soạn thảo chỉ thị điều hành khẩn cấp của Tổng Giám Đốc yêu cầu các bộ phận phối hợp tăng công suất xưởng thêm 25% phục vụ đơn hàng xuất khẩu.',
        targetZoneId: 'hr_ops',
        priority: 'urgent'
      }
    ]
  },
  {
    id: 'agent-business',
    characterKey: 'dekisugi',
    roleTier: 'manager',
    name: 'Dekisugi (Đê-khi)',
    roleTitle: 'Trưởng phòng Kinh Doanh B2B & Quản Trị Dự Án',
    departmentId: 'sales_b2b',
    departmentLabel: '02 - Kinh Doanh B2B',
    zoneId: 'sales_quoting',
    accentHex: '#3b82f6',
    suitColorHex: 0x2563eb,
    hairColorHex: 0x1e293b,
    accessoryType: 'clipboard',
    slashCommand: '/kd',
    subAgentModule: '02-kinh-doanh',
    skills: [
      'viet-thu-dien-tu',
      'viet-song-ngu-viet-anh',
      'bao-cao-chi-so',
      'ra-soat-hop-dong',
      'thu-thap-thong-tin'
    ],
    primaryMission:
      'Phụ trách Kinh doanh B2B: Tiếp nhận và phân tích yêu cầu báo giá (RFQ), bóc tách chi phí định mức, xây dựng bảng báo giá kỹ thuật, đàm phán hợp đồng thương mại quốc tế (Incoterms 2020) và quản lý tiến độ đơn hàng.',
    strictBoundary:
      'Chuyên trách báo giá B2B, hợp đồng thương mại và quan hệ đối tác. KHÔNG trực tiếp sửa file thiết kế CMYK (thuộc Nobita) và KHÔNG hạch toán sổ cái kế toán (thuộc Suneo).',
    personalityTraits: [
      'Thông minh xuất chúng, giao tiếp lịch lãm, am hiểu sâu sắc quy chuẩn thương mại quốc tế',
      'Tính toán phân bậc MOQ và biên lợi nhuận sắc sảo, bảo vệ tối đa quyền lợi doanh nghiệp',
      'Soạn thảo văn bản song ngữ Việt - Anh chuẩn mực, chuyên nghiệp với khách hàng FDI'
    ],
    spatialBehavior:
      'Làm việc tại cụm bàn Kinh Doanh (2.6, 5.5) và Quầy Cà Phê đàm phán (-8.5, 7.4). Khi nhận yêu cầu RFQ, Dekisugi phối hợp cùng Kỹ thuật và Kế toán để chốt giá.',
    allowedKeywords: [
      '/kd',
      'kinh doanh',
      'b2b',
      'rfq',
      'báo giá b2b',
      'hợp đồng thương mại',
      'đàm phán',
      'incoterms',
      'moq',
      'fdi',
      'xuất khẩu',
      'đơn hàng',
      'dekisugi',
      'đê khi'
    ],
    homePosition: { x: 3.4, y: 0, z: 6.2 },
    workstationLookAt: { x: 2.2, y: 1.2, z: 9.8 },
    collaborationPoint: { x: -4.8, y: 0, z: 6.8 },
    sampleTasks: [
      {
        id: 'task-kd-rfq',
        label: 'Phân tích RFQ & Báo giá lô 20.000 sản phẩm hộp kỹ thuật cho đối tác FDI',
        prompt:
          '/kd Tiếp nhận RFQ đơn hàng 20.000 sản phẩm vỏ hộp kỹ thuật cho đối tác FDI Nhật Bản. Lập bảng báo giá chi tiết, phân bậc chiết khấu MOQ và điều kiện giao hàng Incoterms 2020.',
        targetZoneId: 'sales_quoting',
        priority: 'high'
      },
      {
        id: 'task-kd-contract',
        label: 'Soạn thảo Hợp đồng thương mại nguyên tắc & Điều khoản thanh toán B2B',
        prompt:
          '/kd Soạn dự thảo Hợp đồng thương mại cung ứng dài hạn cho đối tác B2B, ràng buộc dung sai kỹ thuật +/- 2% và điều kiện tạm ứng 50%.',
        targetZoneId: 'lobby',
        priority: 'normal'
      }
    ]
  },
  {
    id: 'agent-marketing',
    characterKey: 'chaian',
    roleTier: 'manager',
    name: 'Chaian (Chaien)',
    roleTitle: 'Trưởng phòng Marketing Công Nghiệp & Phát Triển Thị Trường',
    departmentId: 'marketing',
    departmentLabel: '03 - Marketing B2B',
    zoneId: 'marketing',
    accentHex: '#f97316',
    suitColorHex: 0xea580c,
    hairColorHex: 0x1c1917,
    accessoryType: 'badge',
    slashCommand: '/mkt',
    subAgentModule: '03-marketing',
    skills: [
      'dong-goi-tai-lieu-thuong-hieu',
      'tao-slide',
      'phan-loai-noi-dung',
      'thu-thap-thong-tin',
      'tao-kho-hoi-dap'
    ],
    primaryMission:
      'Phụ trách Marketing Công Nghiệp: Xây dựng Profile năng lực nhà máy (Company Profile) chuẩn quốc tế, soạn thảo Case study công nghệ, lập kế hoạch tham gia triển lãm sản xuất chế tạo và quét năng lực đối thủ cạnh tranh.',
    strictBoundary:
      'Chuyên trách Marketing, nhận diện thương hiệu và nghiên cứu thị trường B2B. KHÔNG quyết toán thuế (thuộc Suneo), KHÔNG nhận khiếu nại bảo hành (thuộc Shizuka).',
    personalityTraits: [
      'Mạnh mẽ, nhiệt huyết, quyết tâm đưa thương hiệu doanh nghiệp dẫn đầu thị trường',
      'Tổng hợp số liệu đối thủ cạnh tranh và năng lực máy móc sắc bén',
      'Thiết kế dàn slide giới thiệu nhà máy uy lực, cuốn hút đoàn khách VIP'
    ],
    spatialBehavior:
      'Làm việc tại khu vực Marketing (5.2, 4.8) trước màn hình phân tích thị trường. Khi hoàn thành tài liệu, Chaian di chuyển sang Phòng họp trình bày chiến dịch.',
    allowedKeywords: [
      '/mkt',
      'marketing',
      'company profile',
      'hồ sơ năng lực',
      'case study',
      'thương hiệu',
      'đối thủ',
      'triển lãm',
      'slide',
      'thị trường',
      'chaian',
      'chaien',
      'jaian'
    ],
    homePosition: { x: 5.5, y: 0, z: 4.5 },
    workstationLookAt: { x: 7.6, y: 1.2, z: 8.5 },
    collaborationPoint: { x: 0.8, y: 0, z: -1.5 },
    sampleTasks: [
      {
        id: 'task-mkt-profile',
        label: 'Biên soạn Company Profile chuẩn nhận diện nhà máy phục vụ đoàn kiểm toán FDI',
        prompt:
          '/mkt Xây dựng đề cương Company Profile năng lực nhà máy đạt chuẩn ISO 9001, nêu bật hệ thống máy móc CNC và máy in công nghệ cao để tiếp đón đối tác FDI.',
        targetZoneId: 'marketing',
        priority: 'high'
      },
      {
        id: 'task-mkt-competitor',
        label: 'Nghiên cứu đối thủ cạnh tranh & Đề xuất gói giải pháp B2B',
        prompt:
          '/mkt Thu thập thông tin và phân tích năng lực 3 đối thủ cạnh tranh trực tiếp trong ngành, đề xuất gói Combo nhận diện POSM trọn gói.',
        targetZoneId: 'meeting',
        priority: 'normal'
      }
    ]
  },
  {
    id: 'agent-sales',
    characterKey: 'shizuka',
    roleTier: 'manager',
    name: 'Shizuka (Xuka)',
    roleTitle: 'Trưởng phòng Chăm Sóc Khách Hàng & Dịch Vụ Hậu Mãi',
    departmentId: 'customer_service',
    departmentLabel: '04 - Chăm Sóc Khách Hàng (CSKH)',
    zoneId: 'sales_quoting',
    accentHex: '#f472b6',
    suitColorHex: 0xec4899,
    hairColorHex: 0x1e1b4b,
    accessoryType: 'headset',
    slashCommand: '/cskh',
    subAgentModule: '04-cskh',
    skills: [
      'phan-hoi-khach-hang',
      'viet-bao-cao',
      'tao-kho-hoi-dap',
      'theo-doi-cong-viec',
      'chuan-bi-cuoc-hop',
      'viet-thu-dien-tu'
    ],
    primaryMission:
      'Phụ trách Chăm Sóc Khách Hàng & Giải quyết Sự Cố Chất Lượng: Tiếp nhận cuộc gọi/email khiếu nại, phản hồi ân cần trong vòng 2 giờ, phối hợp bộ phận QC lập Báo cáo sự cố chuẩn 8D (5 Whys), đề xuất bù hàng hoặc bồi thường thỏa đáng.',
    strictBoundary:
      'Chuyên trách chăm sóc khách hàng, giải quyết khiếu nại 8D và báo giá đơn lẻ. KHÔNG sửa file thiết kế đồ họa (thuộc Nobita) và KHÔNG duyệt chi ngân sách lớn (thuộc Doraemon).',
    personalityTraits: [
      'Dịu dàng, chu đáo, đồng cảm sâu sắc với khách hàng ngay cả khi khách hàng giận dữ',
      'Tuân thủ nghiêm ngặt quy trình 8D, tìm đúng nguyên nhân gốc rễ để nhà máy không tái phạm',
      'Soạn thảo thư phúc đáp và biên bản thỏa thuận rõ ràng, bảo vệ uy tín lâu dài của công ty'
    ],
    spatialBehavior:
      'Túc trực tại bàn CSKH (2.2, 6.2) và Quầy Cà Phê (-8.5, 7.4). Khi có khiếu nại, Shizuka nhanh chóng phối hợp cùng QC và gửi báo cáo 8D cho Giám đốc.',
    allowedKeywords: [
      '/cskh',
      'cskh',
      'chăm sóc khách hàng',
      'khiếu nại',
      'hậu mãi',
      'báo cáo 8d',
      'chất lượng',
      'phản hồi',
      'bảo hành',
      'bù hàng',
      'xin lỗi',
      'shizuka',
      'xuka',
      'xu ka'
    ],
    homePosition: { x: 2.2, y: 0, z: 6.2 },
    workstationLookAt: { x: 0.8, y: 1.2, z: 9.8 },
    collaborationPoint: { x: -4.8, y: 0, z: 6.8 },
    sampleTasks: [
      {
        id: 'task-cskh-8d',
        label: 'Tiếp nhận khiếu nại lỗi bavia 4.2% & Lập Báo cáo giải trình sự cố 8D',
        prompt:
          '/cskh Tiếp nhận khiếu nại từ khách hàng về lô hàng có tỷ lệ lỗi bavia 4.2% vượt chuẩn 0.5%. Hãy kích hoạt skill phan-hoi-khach-hang và viet-bao-cao lập Báo cáo 8D phân tích 5 Whys.',
        targetZoneId: 'sales_quoting',
        priority: 'urgent'
      },
      {
        id: 'task-cskh-faq',
        label: 'Xây dựng cẩm nang hỏi đáp FAQ xử lý thắc mắc bảo hành và đổi trả',
        prompt:
          '/cskh Biên soạn cẩm nang câu hỏi thường gặp (FAQ) hướng dẫn nhân viên CSKH xử lý các trường hợp hàng trễ tiến độ hoặc đổi trả sản phẩm.',
        targetZoneId: 'coworking',
        priority: 'normal'
      }
    ]
  },
  {
    id: 'agent-accounting',
    characterKey: 'suneo',
    roleTier: 'manager',
    name: 'Suneo (Xêko)',
    roleTitle: 'Kế Toán Trưởng & Quản Trị Tài Chính Doanh Nghiệp',
    departmentId: 'accounting',
    departmentLabel: '05 - Kế Toán Sản Xuất',
    zoneId: 'accounting',
    accentHex: '#10b981',
    suitColorHex: 0x0d9488,
    hairColorHex: 0x0f172a,
    accessoryType: 'glasses',
    slashCommand: '/kt',
    subAgentModule: '05-ke-toan',
    skills: [
      'doi-chieu-so-lieu',
      'lam-sach-du-lieu',
      'goi-y-bieu-do',
      'an-thong-tin-nhay-cam',
      'bao-cao-chi-so'
    ],
    primaryMission:
      'Phụ trách Kế Toán Sản Xuất & Tài Chính: Tính toán giá thành định mức (Standard Costing: 621, 622, 627), đối chiếu số liệu kho - kế toán, kiểm soát tỷ lệ chi phí NVL <= 62%, theo dõi công nợ đối tác và bảo vệ thông tin PII/giá vốn.',
    strictBoundary:
      'Chuyên trách số liệu kế toán, giá thành và quản trị dòng tiền. KHÔNG sửa file thiết kế CMYK (thuộc Nobita) và KHÔNG đi bán hàng thị trường (thuộc Chaian/Dekisugi).',
    personalityTraits: [
      'Sắc sảo, chi ly từng con số, nắm chắc mọi khoản chi phí và biên lợi nhuận ròng',
      'Cực kỳ cẩn trọng trong bảo mật dữ liệu, tự động ẩn thông tin nhạy cảm trước khi công bố',
      'Trình bày biểu đồ cơ cấu chi phí trực quan, thuyết phục Tổng Giám Đốc'
    ],
    spatialBehavior:
      'Làm việc tại phân khu Kế Toán (5.2, -3.2) cạnh tủ sổ sách công nợ. Khi nhận lệnh đối soát, Suneo vào Phòng họp kính báo cáo chi tiết dòng tiền.',
    allowedKeywords: [
      '/kt',
      'kế toán',
      'tài chính',
      'giá thành',
      'costing',
      '621',
      '622',
      '627',
      'đối chiếu',
      'công nợ',
      'hóa đơn',
      'dòng tiền',
      'pii',
      'suneo',
      'xêko',
      'xeko'
    ],
    homePosition: { x: 5.2, y: 0, z: -3.2 },
    workstationLookAt: { x: 3.4, y: 1.2, z: 0.4 },
    collaborationPoint: { x: -1.2, y: 0, z: -2.2 },
    sampleTasks: [
      {
        id: 'task-kt-costing',
        label: 'Tính giá thành định mức Standard Costing & Kiểm soát chi phí NVL <= 62%',
        prompt:
          '/kt Tính toán bảng giá thành định mức (Standard Costing) gồm NVL trực tiếp (621), nhân công (622) và chi phí chung (627). Đối chiếu tỷ lệ NVL trên doanh thu.',
        targetZoneId: 'accounting',
        priority: 'high'
      },
      {
        id: 'task-kt-reconcile',
        label: 'Đối chiếu số liệu sổ cái kế toán với thẻ kho WMS tháng 10',
        prompt:
          '/kt Kích hoạt skill doi-chieu-so-lieu và an-thong-tin-nhay-cam để đối chiếu số liệu giữa sổ cái kế toán và phần mềm quản lý kho, lập báo cáo chênh lệch tồn.',
        targetZoneId: 'meeting',
        priority: 'normal'
      }
    ]
  },
  {
    id: 'agent-hr-staff',
    characterKey: 'dorami',
    roleTier: 'manager',
    name: 'Dorami (Đô-rê-mi)',
    roleTitle: 'Trưởng phòng Nhân Sự & Quản Trị Lao Động Nhà Máy',
    departmentId: 'human_resources',
    departmentLabel: '06 - Nhân Sự',
    zoneId: 'meeting',
    accentHex: '#eab308',
    suitColorHex: 0xfacc15,
    hairColorHex: 0xfacc15,
    accessoryType: 'bow',
    slashCommand: '/ns',
    subAgentModule: '06-nhan-su',
    skills: [
      'mo-ta-cong-viec-va-sang-loc-cv',
      'soan-thong-bao-noi-bo',
      'tao-bang-kiem',
      'lap-ke-hoach-ngay-tuan',
      'viet-quy-trinh'
    ],
    primaryMission:
      'Phụ trách Nhân Sự & Quản Trị Lao Động: Soạn thảo bản mô tả công việc (JD), sàng lọc hồ sơ ứng viên kỹ thuật, quản lý lịch làm việc 3 ca kíp, kiểm soát giờ làm thêm OT không quá 40h/tháng và tổ chức đào tạo an toàn lao động đầu vào 5S.',
    strictBoundary:
      'Chuyên trách tuyển dụng, ca kíp và chính sách lao động. KHÔNG can thiệp báo giá bán hàng (thuộc Dekisugi) và KHÔNG kiểm kê tồn kho vật tư (thuộc Bác Kaminari).',
    personalityTraits: [
      'Chu đáo, thông minh, ân cần chăm lo đời sống và an toàn cho toàn thể công nhân viên',
      'Tổ chức ca kíp khoa học, cân đối giữa năng suất nhà máy và sức khỏe người lao động',
      'Xây dựng tiêu chí chấm điểm ứng viên khách quan, kỷ luật và đúng pháp luật'
    ],
    spatialBehavior:
      'Làm việc tại khu vực điều phối và phòng họp (-10.0, -5.5). Dorami thường xuyên đi lại giữa các khu vực để kiểm tra nề nếp và phúc lợi nhân sự.',
    allowedKeywords: [
      '/ns',
      'nhân sự',
      'tuyển dụng',
      'jd',
      'cv',
      'ca kíp',
      'tăng ca',
      'ot',
      'lương thưởng',
      'đào tạo',
      'kỷ luật',
      'dorami',
      'đô rê mi'
    ],
    homePosition: { x: -8.2, y: 0, z: -5.5 },
    workstationLookAt: { x: -10.0, y: 1.2, z: -6.0 },
    collaborationPoint: { x: -3.2, y: 0, z: -2.2 },
    sampleTasks: [
      {
        id: 'task-ns-recruitment',
        label: 'Lập JD Thợ vận hành máy CNC & Ma trận chấm điểm ứng viên',
        prompt:
          '/ns Kích hoạt skill mo-ta-cong-viec-va-sang-loc-cv xây dựng JD chi tiết cho vị trí Kỹ sư vận hành CNC và thiết lập ma trận chấm điểm CV theo khung năng lực.',
        targetZoneId: 'meeting',
        priority: 'high'
      },
      {
        id: 'task-ns-shifts',
        label: 'Lập lịch phân bổ 3 ca kíp & Giám sát trần giờ tăng ca OT',
        prompt:
          '/ns Lập phương án phân bổ 3 ca làm việc cho xưởng cơ khí, đảm bảo đầy đủ nhân sự nòng cốt và kiểm soát giờ OT không vượt quá 40h/tháng theo luật lao động.',
        targetZoneId: 'hr_ops',
        priority: 'normal'
      }
    ]
  },
  {
    id: 'agent-warehouse',
    characterKey: 'kaminari',
    roleTier: 'manager',
    name: 'Bác Kaminari (Bác Sấm Sét)',
    roleTitle: 'Trưởng phòng Quản Trị Kho Bãi & Mua Hàng Vật Tư',
    departmentId: 'warehouse_supply',
    departmentLabel: '07 - Kho & Mua Hàng',
    zoneId: 'meeting',
    accentHex: '#854d0e',
    suitColorHex: 0x78350f,
    hairColorHex: 0x94a3b8,
    accessoryType: 'clipboard',
    slashCommand: '/kho',
    subAgentModule: '07-kho-mua-hang',
    skills: [
      'theo-doi-cong-viec',
      'thu-thap-thong-tin',
      'tao-bang-kiem',
      'doi-chieu-so-lieu',
      'an-thong-tin-nhay-cam'
    ],
    primaryMission:
      'Phụ trách Kho Bãi & Mua Hàng Vật Tư: Lập đơn đặt hàng PO gửi nhà cung cấp, thiết lập mức tồn kho an toàn Min-Max, giám sát nhập - xuất - tồn theo nguyên tắc FIFO, kiểm soát tem nhãn Lot No và chủ trì kiểm kê kho định kỳ cuối tháng.',
    strictBoundary:
      'Chuyên trách kho bãi, nguyên vật liệu và mua hàng. KHÔNG làm chiến dịch tiếp thị (thuộc Chaian) và KHÔNG giải quyết khiếu nại dịch vụ khách hàng (thuộc Shizuka).',
    personalityTraits: [
      'Nghiêm khắc, trung thực tuyệt đối, bảo vệ từng mét vật tư không để thất thoát hay hư hao',
      'Kỷ luật thép trong việc dán tem Lot No và sắp xếp kho hàng ngăn nắp chuẩn 5S',
      'Đàm phán giá mua nguyên vật liệu rắn rỏi, đảm bảo hàng về đúng hạn (Lead time)'
    ],
    spatialBehavior:
      'Túc trực tại khu vực kho và kiểm tra hàng (-1.2, -0.8). Bác Kaminari thường xuyên cầm bảng kiểm kê đi rà soát từng kệ hàng.',
    allowedKeywords: [
      '/kho',
      'kho',
      'kho bãi',
      'mua hàng',
      'vật tư',
      'po',
      'tồn kho',
      'fifo',
      'safety stock',
      'kiểm kê',
      'nhà cung ứng',
      'kaminari',
      'bác sấm sét'
    ],
    homePosition: { x: -6.5, y: 0, z: -3.8 },
    workstationLookAt: { x: -5.0, y: 1.2, z: 0.0 },
    collaborationPoint: { x: -1.2, y: 0, z: -2.2 },
    sampleTasks: [
      {
        id: 'task-kho-po',
        label: 'Lập đơn đặt hàng Purchase Order (PO) 50 tấn phôi thép & Bạt in',
        prompt:
          '/kho Kiểm tra mức tồn kho an toàn, lập đơn hàng PO mua bù đắp 50 cuộn bạt Hiflex và 20 thùng mực in UV, đàm phán tiến độ giao hàng trong 5 ngày làm việc.',
        targetZoneId: 'meeting',
        priority: 'high'
      },
      {
        id: 'task-kho-inventory',
        label: 'Tổ chức kiểm kê kho định kỳ cuối tháng & Báo cáo tỷ lệ hao hụt',
        prompt:
          '/kho Kích hoạt skill tao-bang-kiem xây dựng checklist kiểm kê toàn diện kho nguyên vật liệu và kho thành phẩm theo nguyên tắc FIFO chuẩn 5S.',
        targetZoneId: 'meeting',
        priority: 'normal'
      }
    ]
  },
  {
    id: 'agent-admin',
    characterKey: 'sensei',
    roleTier: 'manager',
    name: 'Thầy Giáo Chủ Nhiệm (Sensei)',
    roleTitle: 'Trưởng phòng Hành Chính Quản Trị & An Toàn EHS',
    departmentId: 'administration_ehs',
    departmentLabel: '08 - Hành Chính & EHS',
    zoneId: 'meeting',
    accentHex: '#64748b',
    suitColorHex: 0x475569,
    hairColorHex: 0x0f172a,
    accessoryType: 'glasses',
    slashCommand: '/hc',
    subAgentModule: '08-hanh-chinh',
    skills: [
      'viet-quy-trinh',
      'lap-ke-hoach-ngay-tuan',
      'chuan-bi-cuoc-hop',
      'tao-bang-kiem',
      'soan-thong-bao-noi-bo'
    ],
    primaryMission:
      'Phụ trách Hành Chính & An Toàn Môi Trường (EHS): Quản lý cấp phát trang thiết bị BHLĐ, giám sát an toàn lao động 5S, kiểm tra hệ thống PCCC, điều phối nhà ăn công nghiệp, xe đưa đón và hậu cần tiếp đón đoàn audit đối tác FDI.',
    strictBoundary:
      'Chuyên trách hành chính, cơ sở vật chất và an toàn lao động. KHÔNG hạch toán doanh thu bán hàng (thuộc Suneo) và KHÔNG ký hợp đồng kinh tế (thuộc Doraemon).',
    personalityTraits: [
      'Mẫu mực, kỷ luật cao, luôn đề cao nề nếp văn hóa doanh nghiệp và an toàn tuyệt đối',
      'Chuẩn bị hậu cần chu đáo, chỉn chu đến từng chi tiết phòng họp và tiếp khách',
      'Nghiêm khắc nhắc nhở mọi cá nhân tuân thủ quy tắc 5S và nội quy an toàn lao động'
    ],
    spatialBehavior:
      'Làm việc tại khu vực Hành chính (-10.0, -7.0) và phòng họp. Thầy giáo thường xuyên rà soát bảng kiểm tra an toàn và cơ sở vật chất.',
    allowedKeywords: [
      '/hc',
      'hành chính',
      'ehs',
      'an toàn lao động',
      'bhlđ',
      '5s',
      'pccc',
      'hậu cần',
      'nhà ăn',
      'xe đưa đón',
      'kiểm toán',
      'sensei',
      'thầy giáo'
    ],
    homePosition: { x: -10.5, y: 0, z: -4.5 },
    workstationLookAt: { x: -8.0, y: 1.2, z: -5.0 },
    collaborationPoint: { x: -3.2, y: 0, z: -2.2 },
    sampleTasks: [
      {
        id: 'task-hc-ehs',
        label: 'Kế hoạch cấp phát BHLĐ & Kiểm tra hệ thống PCCC định kỳ',
        prompt:
          '/hc Kích hoạt skill viet-quy-trinh và tao-bang-kiem lập quy trình cấp phát BHLĐ mới cho 3 ca sản xuất và kế hoạch diễn tập PCCC định kỳ Quý 4.',
        targetZoneId: 'meeting',
        priority: 'high'
      },
      {
        id: 'task-hc-audit',
        label: 'Hậu cần tiếp đón đoàn audit đánh giá nhà máy của khách hàng FDI',
        prompt:
          '/hc Chuẩn bị chương trình và checklist hậu cần tiếp đón đoàn chuyên gia kiểm toán nhà máy theo tiêu chuẩn ISO 14001 và an toàn môi trường.',
        targetZoneId: 'meeting',
        priority: 'normal'
      }
    ]
  },
  {
    id: 'agent-design',
    characterKey: 'nobita',
    roleTier: 'manager',
    name: 'Nobita',
    roleTitle: 'Kỹ Sư Thiết Kế Đồ Họa & Preflight CMYK',
    departmentId: 'design_tech',
    departmentLabel: 'Kỹ Thuật Chế Bản & Thiết Kế',
    zoneId: 'design_tech',
    accentHex: '#facc15',
    suitColorHex: 0xeab308,
    hairColorHex: 0x18181b,
    accessoryType: 'glasses',
    slashCommand: '/tk',
    skills: [
      'lam-sach-du-lieu',
      'kiem-tra-chong-bia',
      'dong-goi-tai-lieu-thuong-hieu',
      'tao-bang-kiem'
    ],
    primaryMission:
      'Kỹ sư thiết kế phụ trách quản lý, kiểm tra kỹ thuật file (Preflight) và chuẩn hóa chế bản in: Chuyển đổi 100% CMYK, kiểm tra tràn lề bleed 3mm, Rich Black, độ phân giải DPI 300, convert font chữ, bình bài in và in test proof màu chuẩn.',
    strictBoundary:
      'Chuyên trách kỹ thuật thiết kế, bình bài chế bản và in proof. KHÔNG tính báo giá thương mại (thuộc Dekisugi/Shizuka) và KHÔNG thu tiền cọc công nợ (thuộc Suneo).',
    personalityTraits: [
      'Tập trung cao độ khi đeo kính rà soát từng chi tiết vector, font chữ và hệ màu CMYK',
      'Thực hiện đúng răm rắp checklist SOP kỹ thuật chế bản và hướng dẫn của Doraemon',
      'Chỉnh sửa file nhanh, luôn in thử bản proof tại máy in trung tâm trước khi xuất lệnh in'
    ],
    spatialBehavior:
      'Làm việc tại Workstation đồ họa khu Kỹ Thuật (-7.2, 1.8). Nobita thường xuyên bước ra trạm máy in test proof để kiểm tra màu sắc.',
    allowedKeywords: [
      '/tk',
      'kỹ thuật',
      'thiết kế',
      'chế bản',
      'preflight',
      'cmyk',
      'rgb',
      'tràn lề',
      'bleed',
      'dpi',
      'bình bài',
      'in thử',
      'proof',
      'nobita',
      'nôbita'
    ],
    homePosition: { x: -7.2, y: 0, z: 1.8 },
    workstationLookAt: { x: -5.2, y: 1.2, z: 5.5 },
    collaborationPoint: { x: -3.2, y: 0, z: 0.2 },
    sampleTasks: [
      {
        id: 'task-des-preflight',
        label: 'Chỉnh sửa file thiết kế Poster & Catalog chuẩn in CMYK',
        prompt:
          '/tk Kiểm tra kỹ thuật (preflight) và chỉnh sửa bộ file thiết kế khách gửi gồm: 01 file Poster quảng cáo đang để hệ màu RGB chưa có tràn lề và 01 file Catalog 16 trang chưa convert font chữ.',
        targetZoneId: 'coworking',
        priority: 'high'
      },
      {
        id: 'task-des-proof',
        label: 'Bình bài & In test mẫu màu proof cho đơn in hộp bao bì cao cấp',
        prompt:
          '/tk Bình bài in hộp giấy Ivory 350gsm trên khổ in Offset 79x109cm, kiểm tra ốc chồng màu, vạch canh mép và in test proof đạt chuẩn màu ISO Coated v2.',
        targetZoneId: 'design_tech',
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
    prompt: '/cskh Cho báo giá số lượng 80m2 bạt Hiflex tiêu chuẩn',
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
      coordinatorRole: 'Master Agent Ban Giám Đốc',
      assignedAgentId: 'agent-sales',
      assignedAgentName: 'Shizuka (Xuka)',
      assignedDepartmentLabel: '04 - Chăm Sóc Khách Hàng (CSKH)',
      routingReason:
        'Master Agent Doraemon đã phân tích chỉ thị của Giám đốc, xác định thuộc nghiệp vụ CSKH & Báo giá nên đã điều phối cho Shizuka thực thi theo SOP-BG-2026-01.',
      directorSummaryFromDoraemon:
        'Báo cáo Giám đốc: Shizuka (Xuka) đã tính xong báo giá 80m2 bạt Hiflex & phản hồi lại Doraemon → Tổng thanh toán: 4.053.888đ (Đặt cọc 50%: 2.026.944đ). Đã lập kèm Hợp đồng mua bán, Phiếu mua bán & Phiếu giao hàng chuẩn SOP. Doraemon đề xuất duyệt để Suneo thu cọc 50% và Nobita bình bài in.',
      supportingDepartments: ['Suneo (Xêko) (Kế toán)', 'Nobita (Thiết kế)']
    },
    report: {
      headline: 'Kết Quả Báo Giá 80m2 Bạt Hiflex: 4.053.888đ — Shizuka (Xuka)',
      summary:
        'Shizuka (Xuka) báo cáo kết quả: Tiền in 80m2 × 45.000đ/m2 = 3.600.000đ + Gia công 480.000đ - Chiết khấu 8% (326.400đ) + VAT 8% (300.288đ) = TỔNG CỘNG 4.053.888đ (Khách đặt cọc 50%: 2.026.944đ).',
      scopeCheckPassed: true,
      scopeExplanation:
        'Đúng chuyên môn của Shizuka (Xuka) (04-CSKH). Đã kích hoạt SOP-BG-2026-01 để thực thi.',
      appliedSopCodes: ['SOP-BG-2026-01'],
      spatialActionTaken:
        'Shizuka (Xuka) đã tính báo giá & soạn Hợp đồng tại bàn CSKH (2.2, 6.2), kiểm mẫu ở Khu làm việc chung và gửi kết quả kèm Phiếu giao hàng qua Doraemon trình Giám đốc.',
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
          item: '2. Gia công đóng khoen dán biên',
          spec: 'Hoàn thiện xưởng chuẩn',
          quantity: '80 m2',
          unitPrice: '6.000đ/m2',
          subtotal: '480.000đ'
        },
        {
          item: '3. Chiết khấu sản lượng (>=50m2)',
          spec: 'Giảm 8% trên tổng tiền in + gia công',
          quantity: '-8%',
          unitPrice: '4.080.000đ',
          subtotal: '-326.400đ'
        },
        {
          item: 'Thuế GTGT (VAT 8%) & Chứng từ',
          spec: 'Kèm Hợp đồng & Phiếu giao hàng',
          quantity: '8% VAT',
          unitPrice: '3.753.600đ',
          subtotal: '300.288đ'
        },
        {
          item: 'TỔNG THANH TOÁN (GỒM VAT 8%)',
          spec: 'Tạm ứng cọc 50%: 2.026.944đ',
          quantity: '80 m2',
          unitPrice: 'Trọn gói',
          subtotal: '4.053.888đ'
        }
      ],
      totalAmountFormatted: '4.053.888đ (Đặt cọc 50%: 2.026.944đ)',
      recommendation:
        'Shizuka đã trả kết quả báo giá và phiếu giao hàng qua Master Agent Doraemon trình Giám đốc duyệt; sẵn sàng chuyển Suneo thu cọc 50% và Nobita bình bài in.',
      executionTimeSec: 1.0,
      sourceMode: 'sop-engine'
    }
  },
  {
    id: 'task-seed-02',
    agentId: 'agent-business',
    title: 'Phân tích RFQ B2B đơn 20.000 sản phẩm & Incoterms',
    prompt: '/kd Phân tích RFQ đơn hàng 20.000 sản phẩm vỏ hộp kỹ thuật cho đối tác FDI',
    priority: 'high',
    targetZoneId: 'sales_quoting',
    status: 'completed',
    progress: 100,
    appliedSopIds: ['sop-kd-01'],
    spatialStepText: 'Dekisugi đã hoàn thành phân tích RFQ và lập dự thảo hợp đồng B2B',
    createdAt: '09:20',
    completedAt: '09:21',
    coordinatorDispatch: {
      isCeoDirective: true,
      coordinatorName: 'Doraemon (Đô-rê-mon)',
      coordinatorRole: 'Master Agent Ban Giám Đốc',
      assignedAgentId: 'agent-business',
      assignedAgentName: 'Dekisugi (Đê-khi)',
      assignedDepartmentLabel: '02 - Kinh Doanh B2B',
      routingReason:
        'Doraemon định tuyến chỉ thị B2B RFQ cho Trưởng phòng Kinh doanh Dekisugi thực thi theo SOP-KD-2026-01.',
      directorSummaryFromDoraemon:
        'Báo cáo Giám đốc: Dekisugi đã hoàn tất phương án báo giá RFQ xuất khẩu FOB Hải Phòng, MOQ 20.000 đơn vị, biên lợi nhuận kỳ vọng 22.4%. Đề xuất duyệt mở thư đàm phán thương mại.',
      supportingDepartments: ['Bác Kaminari (Kho & Mua Hàng)', 'Suneo (Kế toán)']
    },
    report: {
      headline: 'Báo Giá Kỹ Thuật RFQ: 20.000 SP — Dekisugi (Kinh Doanh B2B)',
      summary:
        'Dekisugi đã hoàn tất phân tích RFQ: Đơn giá 18.500đ/SP (Incoterms 2020: FOB Hải Phòng), tổng giá trị 370.000.000đ. Đã áp dụng phân bậc MOQ chiết khấu 8% và điều khoản tạm ứng 50%.',
      scopeCheckPassed: true,
      scopeExplanation: 'Đúng chuyên môn của Dekisugi (02-Kinh Doanh B2B).',
      appliedSopCodes: ['SOP-KD-2026-01'],
      spatialActionTaken: 'Dekisugi đã hoàn thiện bảng tính RFQ và soạn thảo thư thương mại song ngữ Việt - Anh.',
      keyFindings: [
        'Quy cách kỹ thuật: Vỏ hộp dập định hình chính xác, dung sai +/- 1.5mm đạt chuẩn ISO 9001.',
        'Điều kiện thương mại: Tạm ứng 50% khi ký HĐ, 50% thanh toán qua L/C sau khi kiểm định chất lượng (QC Passed).',
        'Thời gian vật tư về xưởng (Lead time): 12 ngày sau khi Bác Kaminari phát hành PO nguyên liệu.'
      ],
      totalAmountFormatted: '370.000.000đ (FOB Hải Phòng)',
      recommendation: 'Chuyển thông tin định mức sang Suneo (Kế toán) và Bác Kaminari (Kho) để đặt trước phôi thép.',
      executionTimeSec: 1.2,
      sourceMode: 'sop-engine'
    }
  }
];

export const SKILLS_CATALOG: SkillCatalogItem[] = [
  // --- 12 KỸ NĂNG VĂN PHÒNG THỰC CHIẾN (AccKit-12-Skill-Van-Phong-Claude) ---
  {
    id: 'sk-vp-01',
    code: 'SKILL-VP-01',
    name: 'viet-thu-dien-tu',
    category: 'office_12',
    categoryLabel: '12 Kỹ Năng Văn Phòng',
    assignedAgentName: 'Dekisugi (Đê-khi)',
    assignedAgentKey: 'dekisugi',
    slashCommand: '/kd',
    description: 'Soạn thảo email thương mại B2B chuyên nghiệp: gửi báo giá sản xuất, đôn đốc công nợ lịch thiệp, thư xác nhận hợp tác.',
    samplePrompt: '/kd Soạn thư điện tử thương mại B2B gửi bảng báo giá in 500m2 bạt Hiflex cho đối tác Takata Vietnam',
    templateFileName: 'mau-email-thuc-te.md'
  },
  {
    id: 'sk-vp-02',
    code: 'SKILL-VP-02',
    name: 'tom-tat-tai-lieu',
    category: 'office_12',
    categoryLabel: '12 Kỹ Năng Văn Phòng',
    assignedAgentName: 'Doraemon (Đô-rê-mon)',
    assignedAgentKey: 'doraemon',
    slashCommand: '/bgd',
    description: 'Tóm lược báo cáo kỹ thuật, đề án kinh doanh, hồ sơ dự thầu 20-50 trang thành bản tóm tắt 1 trang A4 cô đọng cho Ban Giám Đốc.',
    samplePrompt: '/bgd Tóm tắt tài liệu báo cáo kỹ thuật dây chuyền in UV phẳng 3.2m và đề xuất phương án đầu tư',
    templateFileName: 'SKILL.md'
  },
  {
    id: 'sk-vp-03',
    code: 'SKILL-VP-03',
    name: 'ghi-chu-hop',
    category: 'office_12',
    categoryLabel: '12 Kỹ Năng Văn Phòng',
    assignedAgentName: 'Doraemon (Đô-rê-mon)',
    assignedAgentKey: 'doraemon',
    slashCommand: '/bgd',
    description: 'Lập biên bản họp giao ban điều hành tuần: tổng hợp quyết định then chốt (Key Decisions) và bảng phân công hành động RACI.',
    samplePrompt: '/bgd Lập biên bản họp giao ban tuần 43 điều hành sản xuất xưởng in và phân công nhiệm vụ RACI',
    templateFileName: 'mau-bien-ban-hop-giao-ban.md'
  },
  {
    id: 'sk-vp-04',
    code: 'SKILL-VP-04',
    name: 'lap-ke-hoach',
    category: 'office_12',
    categoryLabel: '12 Kỹ Năng Văn Phòng',
    assignedAgentName: 'Dorami (Đô-rê-mi)',
    assignedAgentKey: 'dorami',
    slashCommand: '/ns',
    description: 'Lập kế hoạch công việc tuần, phân bổ nguồn lực 3 ca kíp, xác định các mốc tiến độ then chốt (Milestones).',
    samplePrompt: '/ns Lập kế hoạch phân bổ nhân sự 3 ca kíp cho xưởng in chạy 24/7 trong tuần cao điểm',
    templateFileName: 'mau-ke-hoach-cong-viec-tuan.md'
  },
  {
    id: 'sk-vp-05',
    code: 'SKILL-VP-05',
    name: 'viet-bao-cao',
    category: 'office_12',
    categoryLabel: '12 Kỹ Năng Văn Phòng',
    assignedAgentName: 'Suneo (Xêko)',
    assignedAgentKey: 'suneo',
    slashCommand: '/kt',
    description: 'Soạn báo cáo định kỳ tuần/tháng/quý: phân tích chỉ số chi phí vật tư, tỷ lệ phế phẩm và tiến độ hoàn thành mục tiêu.',
    samplePrompt: '/kt Soạn báo cáo chi phí giá thành Standard Costing và tiến độ thu hồi công nợ tháng 10',
    templateFileName: 'mau-bao-cao-tien-do-du-an.md'
  },
  {
    id: 'sk-vp-06',
    code: 'SKILL-VP-06',
    name: 'xu-ly-bang-tinh',
    category: 'office_12',
    categoryLabel: '12 Kỹ Năng Văn Phòng',
    assignedAgentName: 'Suneo (Xêko)',
    assignedAgentKey: 'suneo',
    slashCommand: '/kt',
    description: 'Xử lý dữ liệu bảng tính Excel nhà máy: bóc tách định mức BOM, áp dụng công thức tính khấu hao máy móc và đối soát số liệu.',
    samplePrompt: '/kt Bóc tách định mức vật tư bạt Hiflex và mực in UV cho đơn hàng 1.200m2',
    templateFileName: 'cam-nang-ham-excel-nha-may.md'
  },
  {
    id: 'sk-vp-07',
    code: 'SKILL-VP-07',
    name: 'phan-tich-du-lieu',
    category: 'office_12',
    categoryLabel: '12 Kỹ Năng Văn Phòng',
    assignedAgentName: 'Sewashi (Cháu Nobita)',
    assignedAgentKey: 'sewashi',
    slashCommand: '/bgd',
    description: 'Phân tích dữ liệu vận hành sản xuất: tìm nguyên nhân gốc rễ lỗi bằng phương pháp 5 Whys, biểu đồ xương cá Ishikawa và biểu đồ Pareto.',
    samplePrompt: '/bgd Phân tích nguyên nhân gốc rễ sự cố lệch màu bản in lô hàng số 88 bằng phương pháp 5 Whys',
    templateFileName: 'mau-phan-tich-nguyen-nhan-loi.md'
  },
  {
    id: 'sk-vp-08',
    code: 'SKILL-VP-08',
    name: 'viet-quy-trinh',
    category: 'office_12',
    categoryLabel: '12 Kỹ Năng Văn Phòng',
    assignedAgentName: 'Thầy Giáo (Sensei)',
    assignedAgentKey: 'sensei',
    slashCommand: '/hc',
    description: 'Biên soạn quy trình vận hành tiêu chuẩn (SOP) chuẩn ISO 9001/14001: lưu đồ thao tác, tiêu chuẩn chấp thuận và checklist kiểm tra.',
    samplePrompt: '/hc Soạn thảo quy trình vận hành tiêu chuẩn SOP kiểm tra an toàn PCCC và 5S đầu ca làm việc',
    templateFileName: 'mau-quy-trinh-sop-chuan-iso.md'
  },
  {
    id: 'sk-vp-09',
    code: 'SKILL-VP-09',
    name: 'phan-hoi-khach-hang',
    category: 'office_12',
    categoryLabel: '12 Kỹ Năng Văn Phòng',
    assignedAgentName: 'Shizuka (Xuka)',
    assignedAgentKey: 'shizuka',
    slashCommand: '/cskh',
    description: 'Kịch bản giao tiếp giải quyết khiếu nại chất lượng hàng (SLA 30 phút phản hồi, xuất hàng đệm trong 4h, gửi báo cáo 8D trong 48h).',
    samplePrompt: '/cskh Soạn kịch bản phản hồi khách hàng khiếu nại lô bạt in bị xước và đề xuất giải pháp bù hàng',
    templateFileName: 'kich-ban-xu-ly-khieu-nai.md'
  },
  {
    id: 'sk-vp-10',
    code: 'SKILL-VP-10',
    name: 'theo-doi-cong-viec',
    category: 'office_12',
    categoryLabel: '12 Kỹ Năng Văn Phòng',
    assignedAgentName: 'Bác Kaminari',
    assignedAgentKey: 'kaminari',
    slashCommand: '/kho',
    description: 'Quản trị tiến độ đơn hàng theo bảng Kanban 4 cột (Backlog, Chuẩn bị phôi, Đang in/dập 3 ca, Nghiệm thu hoàn tất).',
    samplePrompt: '/kho Lập bảng Kanban theo dõi tiến độ sản xuất 15 đơn hàng bạt và standee tuần này',
    templateFileName: 'mau-bang-kanban-don-hang.md'
  },
  {
    id: 'sk-vp-11',
    code: 'SKILL-VP-11',
    name: 'de-cuong-trinh-bay',
    category: 'office_12',
    categoryLabel: '12 Kỹ Năng Văn Phòng',
    assignedAgentName: 'Chaian (Chaien)',
    assignedAgentKey: 'chaian',
    slashCommand: '/mkt',
    description: 'Thiết kế đề cương bài thuyết trình slide dự án, hồ sơ năng lực nhà máy (Company Profile) phục vụ hội chợ triển lãm B2B.',
    samplePrompt: '/mkt Lập đề cương thuyết trình hồ sơ năng lực xưởng in kỹ thuật số cho đối tác chuỗi bán lẻ',
    templateFileName: 'mau-de-cuong-thuyet-trinh.md'
  },
  {
    id: 'sk-vp-12',
    code: 'SKILL-VP-12',
    name: 'workspace-ca-nhan',
    category: 'office_12',
    categoryLabel: '12 Kỹ Năng Văn Phòng',
    assignedAgentName: 'Nobita',
    assignedAgentKey: 'nobita',
    slashCommand: '/tk',
    description: 'Sổ tay quản trị công việc cá nhân: ghi chép to-do list hàng ngày, ưu tiên theo ma trận Eisenhower và tổng kết bài học kinh nghiệm.',
    samplePrompt: '/tk Lập sổ tay công việc hàng ngày quản lý 8 file thiết kế CMYK cần bình bài hôm nay',
    templateFileName: 'mau-so-tay-cong-viec-hang-ngay.md'
  },

  // --- THƯ VIỆN KỸ NĂNG CHUYÊN SÂU ĐỘC LẬP (AccKit-Thu-Vien-30-Skills-Chuyen-Sau-Claude) ---
  {
    id: 'sk-deep-01',
    code: 'SKILL-LEG-15',
    name: 'ra-soat-hop-dong',
    category: 'deep_30',
    categoryLabel: '30 Kỹ Năng Chuyên Sâu',
    assignedAgentName: 'Dekisugi (Đê-khi)',
    assignedAgentKey: 'dekisugi',
    slashCommand: '/kd',
    description: 'Rà soát chuyên sâu 6 bẫy pháp lý trong hợp đồng sản xuất: trần phạt giao chậm 8%, bồi thường gián tiếp, điều kiện giao hàng Incoterms 2020.',
    samplePrompt: '/kd Rà soát dự thảo hợp đồng mua bán với đối tác ABC, kiểm tra điều khoản phạt vi phạm theo Điều 301 Luật Thương mại',
    templateFileName: 'SKILL.md'
  },
  {
    id: 'sk-deep-02',
    code: 'SKILL-SEC-01',
    name: 'an-thong-tin-nhay-cam',
    category: 'deep_30',
    categoryLabel: '30 Kỹ Năng Chuyên Sâu',
    assignedAgentName: 'Doraemon (Đô-rê-mon)',
    assignedAgentKey: 'doraemon',
    slashCommand: '/bgd',
    description: 'Tự động phát hiện và che giấu thông tin bảo mật bí mật kinh doanh: giá vốn thực, công thức vật liệu, PII nhân sự, tài khoản ngân hàng nội bộ.',
    samplePrompt: '/bgd Kiểm tra và ẩn toàn bộ thông tin nhạy cảm PII trong báo cáo tài chính trước khi gửi đối tác',
    templateFileName: 'SKILL.md'
  },
  {
    id: 'sk-deep-03',
    code: 'SKILL-AUD-02',
    name: 'kiem-tra-chong-bia',
    category: 'deep_30',
    categoryLabel: '30 Kỹ Năng Chuyên Sâu',
    assignedAgentName: 'Doraemon (Đô-rê-mon)',
    assignedAgentKey: 'doraemon',
    slashCommand: '/bgd',
    description: 'Kiểm toán chống bịa đặt Zero-Hallucination: đối soát mọi số liệu kỹ thuật, đơn giá và chỉ số với tài liệu gốc trước khi phê chuẩn.',
    samplePrompt: '/bgd Kích hoạt kiểm tra chống bịa đặt cho bảng tổng hợp chi phí dự án mở rộng nhà xưởng',
    templateFileName: 'SKILL.md'
  },
  {
    id: 'sk-deep-04',
    code: 'SKILL-AUD-03',
    name: 'doi-chieu-so-lieu',
    category: 'deep_30',
    categoryLabel: '30 Kỹ Năng Chuyên Sâu',
    assignedAgentName: 'Suneo (Xêko)',
    assignedAgentKey: 'suneo',
    slashCommand: '/kt',
    description: 'Đối chiếu chéo số liệu giữa sổ cái kế toán và thẻ kho WMS, bóc tách chênh lệch hao hụt thực tế và công nợ quá hạn.',
    samplePrompt: '/kt Đối chiếu số liệu xuất kho bạt Hiflex giữa sổ kế toán và phần mềm kho tuần vừa qua',
    templateFileName: 'SKILL.md'
  },
  {
    id: 'sk-deep-05',
    code: 'SKILL-PRD-01',
    name: 'quy-trinh-8d-su-co-in',
    category: 'deep_30',
    categoryLabel: '30 Kỹ Năng Chuyên Sâu',
    assignedAgentName: 'Shizuka (Xuka)',
    assignedAgentKey: 'shizuka',
    slashCommand: '/cskh',
    description: 'Xử lý sự cố chất lượng theo phương pháp 8D Problem Solving chuẩn công nghiệp, cô lập lô hàng lỗi và lập kế hoạch CAPA.',
    samplePrompt: '/cskh Lập báo cáo xử lý sự cố 8D cho lô hàng in bạt 80m2 bị sai lệch màu sắc',
    templateFileName: 'SKILL.md'
  },
  {
    id: 'sk-deep-06',
    code: 'SKILL-MKT-01',
    name: 'dong-goi-tai-lieu-thuong-hieu',
    category: 'deep_30',
    categoryLabel: '30 Kỹ Năng Chuyên Sâu',
    assignedAgentName: 'Chaian (Chaien)',
    assignedAgentKey: 'chaian',
    slashCommand: '/mkt',
    description: 'Đóng gói tài liệu nhận diện thương hiệu công nghiệp: chuẩn hóa font chữ, bảng mã màu, logo và layout Company Profile đón đoàn kiểm toán.',
    samplePrompt: '/mkt Đóng gói bộ tài liệu hồ sơ năng lực Company Profile chuẩn nhận diện cho đối tác quốc tế',
    templateFileName: 'SKILL.md'
  },
  {
    id: 'sk-deep-07',
    code: 'SKILL-OPS-01',
    name: 'kiem-ke-kho-fifo',
    category: 'deep_30',
    categoryLabel: '30 Kỹ Năng Chuyên Sâu',
    assignedAgentName: 'Bác Kaminari',
    assignedAgentKey: 'kaminari',
    slashCommand: '/kho',
    description: 'Kiểm soát nhập - xuất - tồn kho theo nguyên tắc FIFO, dán tem nhãn Lot No, tính điểm đặt hàng lại ROP và tồn an toàn Safety Stock.',
    samplePrompt: '/kho Kiểm kê kho vật tư bạt và decal theo nguyên tắc FIFO, lập danh sách các mã hàng chạm ngưỡng ROP',
    templateFileName: 'SKILL.md'
  },
  {
    id: 'sk-deep-08',
    code: 'SKILL-HR-01',
    name: 'mo-ta-cong-viec-va-sang-loc-cv',
    category: 'deep_30',
    categoryLabel: '30 Kỹ Năng Chuyên Sâu',
    assignedAgentName: 'Dorami (Đô-rê-mi)',
    assignedAgentKey: 'dorami',
    slashCommand: '/ns',
    description: 'Xây dựng bản mô tả công việc (JD) thợ in/kỹ sư nhà máy và ma trận thang điểm chấm CV theo khung năng lực & kỷ luật lao động.',
    samplePrompt: '/ns Soạn thảo bản mô tả công việc JD kỹ sư vận hành máy in phun khổ lớn 3.2m và ma trận chấm điểm CV',
    templateFileName: 'SKILL.md'
  },
  {
    id: 'sk-deep-09',
    code: 'SKILL-CTY-01',
    name: 'tra-cuu-ho-so-doanh-nghiep',
    category: 'deep_30',
    categoryLabel: '30 Kỹ Năng Chuyên Sâu',
    assignedAgentName: 'Doraemon (Đô-rê-mon)',
    assignedAgentKey: 'doraemon',
    slashCommand: '/cty',
    description: 'Tra cứu thông tin hồ sơ pháp nhân, chính sách chất lượng ISO 9001/14001, năng lực thiết bị nhà máy và sổ tay nhân viên.',
    samplePrompt: '/cty Tra cứu hồ sơ năng lực pháp nhân công ty và danh mục máy móc in ấn tại xưởng',
    templateFileName: 'ho-so-doanh-nghiep.md'
  }
];
