import {
  parsePrintingPrompt,
  executePrintQuote,
  CLOUD_PRINT_QUOTE_URL,
  RealPrintQuoteRequest
} from './printQuoteEngine';
import {
  AgentProfile,
  CalculationRow,
  FormalDocument,
  CoordinatorDispatchInfo,
  DepartmentId,
  OfficeZone,
  PrintQuoteInput,
  PrintQuoteResult,
  SopDocument,
  TaskAssignment,
  TaskReport,
  Vector3Tuple,
  ZoneId
} from '../types/office';

export interface ScopeValidationResult {
  isInScope: boolean;
  reason: string;
  suggestedAgent?: AgentProfile;
  matchedSops: SopDocument[];
}

export interface CeoDispatchResult {
  coordinator: AgentProfile;
  assignedAgent: AgentProfile;
  targetZoneId: ZoneId;
  dispatchInfo: CoordinatorDispatchInfo;
  matchedSops: SopDocument[];
}

export interface NewSopInput {
  departmentId: DepartmentId;
  code: string;
  title: string;
  category: string;
  summary: string;
  rulesText: string;
}

export interface SopValidationResult {
  valid: boolean;
  error?: string;
  parsedRules: string[];
}

/**
 * Formats a number in VND currency with tabular clarity.
 */
export function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString('vi-VN')}đ`;
}

/**
 * Pure domain calculator for Printing & Advertising quotes following SOP-BG-2026-01.
 */
export function calculatePrintQuote(input: PrintQuoteInput): PrintQuoteResult {
  const safeWidth = Math.max(0.1, Number(input.widthMeters) || 1);
  const safeHeight = Math.max(0.1, Number(input.heightMeters) || 1);
  const safeQty = Math.max(1, Math.floor(Number(input.quantity) || 1));

  // Check if this is an offset or digital product handled by print-quote engine
  const isOffsetOrDigital = [
    'flyer',
    'catalogue',
    'bag',
    'folder',
    'envelope',
    'lixi',
    'uv_dtf'
  ].includes(input.materialType as string);

  if (isOffsetOrDigital) {
    const realReq: RealPrintQuoteRequest = {
      printTech: input.materialType === 'uv_dtf' ? 'digital' : (safeQty < 200 && input.materialType === 'catalogue' ? 'digital' : 'offset'),
      productType: input.materialType as any,
      productNameVi: input.materialType as string,
      quantity: safeQty,
      productSize: {
        w: input.widthCm || (safeWidth * 100),
        h: input.heightCm || (safeHeight * 100),
        d: input.bagDepthCm || 10,
        flap: input.materialType === 'folder' ? 7 : 3.5
      },
      paperId: input.paperId || (input.materialType === 'bag' ? 'ivory250_79x109' : input.materialType === 'folder' ? 'chk300_79x109' : 'chk150_65x86'),
      paperName: input.paperName || 'Couche Hi-kote',
      printSides: input.printSides || (input.materialType === 'folder' || input.materialType === 'bag' ? 1 : 2),
      printColors: input.printColors || 4,
      finishingOptions: {
        laminationType: input.finishingOption === 'glossy_lamination' ? 'glossy' : input.finishingOption === 'matte_lamination' ? 'matte' : 'none',
        cutting: true,
        gluing: input.materialType === 'bag' || input.materialType === 'folder' || input.materialType === 'envelope',
        dieCut: input.materialType === 'bag' || input.materialType === 'folder' || input.materialType === 'envelope',
        bindingType: input.bindingType || 'saddleStitch'
      },
      catalogueData: input.materialType === 'catalogue' ? {
        totalPages: input.totalPages || 16,
        coverPaperId: 'chk250_79x109',
        contentPaperId: 'chk150_79x109',
        coverPrintColors: 4,
        contentPrintColors: 4,
        bindingType: input.bindingType || 'saddleStitch',
        catalogueSize: (safeWidth <= 0.16) ? 'A5' : 'A4'
      } : undefined
    };

    const quote = executePrintQuote(realReq);
    const subtotalVnd = quote.totalCost;
    const vatVnd = Math.round(subtotalVnd * 0.08);
    const grandTotalVnd = subtotalVnd + vatVnd;

    return {
      areaSqmPerUnit: Number((safeWidth * safeHeight).toFixed(3)),
      totalAreaSqm: Number((safeWidth * safeHeight * safeQty).toFixed(2)),
      baseCost: Math.round(quote.details.paperCost || 0),
      baseUnitRateVnd: Math.round(quote.costPerUnit),
      finishingCostVnd: quote.details.finishingCost || 0,
      discountPercent: 0,
      rushSurchargeVnd: input.rushOrder ? Math.round(subtotalVnd * 0.15) : 0,
      subtotalVnd: subtotalVnd + (input.rushOrder ? Math.round(subtotalVnd * 0.15) : 0),
      vatVnd,
      grandTotalVnd: grandTotalVnd + (input.rushOrder ? Math.round(subtotalVnd * 0.15 * 1.08) : 0),
      appliedSopRule: `Hệ thống Báo Giá Tự Động baogiainan.88qm.top: ${quote.details.machine || 'Offset'} — ${quote.details.paperName || 'Giấy in tiêu chuẩn'}`,
      machineName: quote.details.machine,
      paperName: quote.details.paperName,
      unitPriceVnd: quote.costPerUnit,
      paperCostVnd: quote.details.paperCost,
      printingCostVnd: quote.details.printingCost,
      profitVnd: quote.profitVnd,
      productsPerSheet: quote.details.productsPerSheet,
      totalSheets: quote.details.grossSheets,
      wasteSheets: quote.details.wasteSheets,
      printStyle: quote.details.printStyle,
      cloudAppUrl: CLOUD_PRINT_QUOTE_URL
    };
  }

  const isUnitBased =
    input.materialType === 'standee' || input.materialType === 'catalog_offset';

  const areaSqmPerUnit = isUnitBased
    ? Number((safeWidth * safeHeight).toFixed(2))
    : Number((safeWidth * safeHeight).toFixed(2));

  const totalAreaSqm = isUnitBased
    ? safeQty
    : Number((areaSqmPerUnit * safeQty).toFixed(2));

  let baseUnitRateVnd = 45000;
  let sopNote = 'SOP-BG-2026-01: In bạt Hiflex tiêu chuẩn 45.000đ/m2';

  switch (input.materialType) {
    case 'hiflex':
      baseUnitRateVnd = 45000;
      sopNote = 'SOP-BG-2026-01: In bạt Hiflex 3.2 dzem (45.000đ/m2)';
      break;
    case 'decal_pp':
      baseUnitRateVnd = 75000;
      sopNote = 'SOP-BG-2026-01: In Decal PP cán màng bảo vệ (75.000đ/m2)';
      break;
    case 'mica_led':
      baseUnitRateVnd = 1150000;
      sopNote = 'SOP-BG-2026-01: Biển chữ nổi Mica Đài Loan gắn LED âm (1.150.000đ/m2)';
      break;
    case 'standee':
      baseUnitRateVnd = 260000;
      sopNote = 'SOP-BG-2026-01: Standee cuốn nhôm cao cấp 0.8x2.0m (260.000đ/bộ)';
      break;
    case 'catalog_offset':
      baseUnitRateVnd = 18000;
      sopNote = 'SOP-BG-2026-01: In Catalog giấy Couche in Offset (18.000đ/cuốn)';
      break;
  }

  const baseCost = isUnitBased
    ? safeQty * baseUnitRateVnd
    : totalAreaSqm * baseUnitRateVnd;

  let finishingCostVnd = 0;
  switch (input.finishingOption) {
    case 'eyelet_glue':
      finishingCostVnd = isUnitBased ? 0 : Math.round(totalAreaSqm * 6000);
      break;
    case 'matte_lamination':
    case 'glossy_lamination':
      finishingCostVnd = isUnitBased ? 0 : Math.round(totalAreaSqm * 15000);
      break;
    case 'alu_frame':
      finishingCostVnd = isUnitBased ? 0 : Math.round(totalAreaSqm * 180000);
      break;
    case 'none':
    default:
      finishingCostVnd = 0;
      break;
  }

  let discountPercent = 0;
  if (!isUnitBased) {
    if (totalAreaSqm >= 100) {
      discountPercent = 12;
    } else if (totalAreaSqm >= 50) {
      discountPercent = 8;
    }
  } else {
    if (safeQty >= 50) {
      discountPercent = 12;
    } else if (safeQty >= 20) {
      discountPercent = 8;
    }
  }

  const grossBeforeDiscount = baseCost + finishingCostVnd;
  const discountAmount = Math.round((grossBeforeDiscount * discountPercent) / 100);
  const afterDiscount = grossBeforeDiscount - discountAmount;

  const rushSurchargeVnd = input.rushOrder ? Math.round(afterDiscount * 0.15) : 0;
  const subtotalVnd = afterDiscount + rushSurchargeVnd;
  const vatVnd = Math.round(subtotalVnd * 0.08);
  const grandTotalVnd = subtotalVnd + vatVnd;

  return {
    areaSqmPerUnit,
    totalAreaSqm,
    baseCost,
    baseUnitRateVnd,
    finishingCostVnd,
    discountPercent,
    rushSurchargeVnd,
    subtotalVnd,
    vatVnd,
    grandTotalVnd,
    appliedSopRule: sopNote,
    cloudAppUrl: CLOUD_PRINT_QUOTE_URL
  };
}

export function validateScopeAndRoute(
  agent: AgentProfile,
  prompt: string,
  allAgents: AgentProfile[],
  departmentSops: SopDocument[]
): ScopeValidationResult {
  const normalized = prompt.trim().toLowerCase();
  const activeSops = departmentSops.filter(
    (s) => (s.departmentId === agent.departmentId ||
      (agent.departmentId === 'board_executive' && s.departmentId === 'hr_ops') ||
      (agent.departmentId === 'customer_service' && s.departmentId === 'sales_quoting') ||
      (agent.departmentId === 'sales_b2b' && s.departmentId === 'sales_quoting')) &&
      s.isActive
  );

  if (!normalized) {
    return {
      isInScope: false,
      reason: 'Nội dung nhiệm vụ không được để trống.',
      matchedSops: activeSops
    };
  }

  // 1. Direct slash command matching
  const commandMatch = normalized.match(/^(\/[a-z0-9_-]+)/i);
  if (commandMatch) {
    const cmd = commandMatch[1].toLowerCase();
    const targetedAgent = allAgents.find((a) => a.slashCommand?.toLowerCase() === cmd);
    if (targetedAgent) {
      if (targetedAgent.id === agent.id) {
        return {
          isInScope: true,
          reason: `Lệnh "${cmd}" khớp chính xác vai trò ${agent.name} (${agent.departmentLabel}). Đang thực thi theo bộ kỹ năng chuẩn hóa.`,
          matchedSops: activeSops
        };
      } else {
        return {
          isInScope: false,
          reason: `Lệnh "${cmd}" thuộc thẩm quyền của ${targetedAgent.name} (${targetedAgent.departmentLabel}). Vui lòng chuyển sang ${targetedAgent.name} hoặc dùng chế độ Chỉ thị Giám đốc để Doraemon điều phối tự động.`,
          suggestedAgent: targetedAgent,
          matchedSops: activeSops
        };
      }
    }
  }

  // 2. Skill-based matching from .claude/skills
  if (agent.skills && agent.skills.some((sk) => normalized.includes(sk.toLowerCase()))) {
    return {
      isInScope: true,
      reason: `Nhiệm vụ kích hoạt kỹ năng chuyên môn trong bộ kỹ năng của ${agent.name} (${agent.departmentLabel}).`,
      matchedSops: activeSops
    };
  }

  const countMatches = (targetAgent: AgentProfile): number => {
    let score = 0;
    if (targetAgent.slashCommand && normalized.includes(targetAgent.slashCommand.toLowerCase())) {
      score += 10;
    }
    if (targetAgent.skills) {
      for (const sk of targetAgent.skills) {
        if (normalized.includes(sk.toLowerCase())) {
          score += 6;
        }
      }
    }
    for (const kw of targetAgent.allowedKeywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    return score;
  };

  const ownScore = countMatches(agent);
  let bestOtherAgent: AgentProfile | undefined;
  let bestOtherScore = 0;

  for (const candidate of allAgents) {
    if (candidate.id === agent.id) continue;
    const score = countMatches(candidate);
    if (score > bestOtherScore) {
      bestOtherScore = score;
      bestOtherAgent = candidate;
    }
  }

  // Strict specialization check: if user asks an agent to do another department's clear specialty
  if (ownScore === 0 && bestOtherScore >= 2 && bestOtherAgent) {
    return {
      isInScope: false,
      reason: `Từ chối thực thi do vượt giới hạn chuyên môn: ${agent.name} (${agent.departmentLabel}) chỉ được huấn luyện chuyên sâu cho nghiệp vụ của bộ phận mình. Nhiệm vụ này thuộc chuyên môn của ${bestOtherAgent.name} (${bestOtherAgent.departmentLabel} - ${bestOtherAgent.slashCommand}) — vui lòng chuyển cho ${bestOtherAgent.name} hoặc giao qua Master Agent Doraemon (/bgd) để điều phối tự động.`,
      suggestedAgent: bestOtherAgent,
      matchedSops: activeSops
    };
  }

  return {
    isInScope: true,
    reason: `Đúng chuyên môn của ${agent.name} (${agent.departmentLabel}). Đã kích hoạt ${activeSops.length} tài liệu quy chuẩn SOP để thực thi.`,
    matchedSops: activeSops
  };
}

/**
 * Validates input when adding a new SOP training document for a department.
 */
export function validateSopDocumentInput(input: NewSopInput): SopValidationResult {
  const title = input.title.trim();
  const code = input.code.trim().toUpperCase();
  const rawRules = input.rulesText
    .split('\n')
    .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter((line) => line.length > 0);

  if (title.length < 5) {
    return {
      valid: false,
      error: 'Tiêu đề tài liệu quy chuẩn SOP phải có ít nhất 5 ký tự.',
      parsedRules: []
    };
  }

  if (code.length < 3) {
    return {
      valid: false,
      error: 'Mã tài liệu SOP không hợp lệ (ví dụ: SOP-BG-03).',
      parsedRules: []
    };
  }

  if (rawRules.length === 0 || rawRules.every((r) => r.length < 8)) {
    return {
      valid: false,
      error: 'Vui lòng nhập ít nhất 1 quy chuẩn huấn luyện chi tiết (tối thiểu 8 ký tự).',
      parsedRules: []
    };
  }

  return {
    valid: true,
    parsedRules: rawRules.map((r) => (r.endsWith('.') ? r : `${r}.`)),
    error: undefined
  };
}

/**
 * Generates a deterministic, SOP-grounded report for a given AI assistant and task prompt.
 */

/**
 * Generates a formal, legally grounded Vietnamese B2B Commercial Contract
 * compliant with Vietnamese Commercial Law 2005 & Civil Code 2015.
 */
export function buildFormalContractDocument(
  prompt: string,
  totalAmountFormatted: string,
  calculationRows?: CalculationRow[]
): FormalDocument {
  const contractNum = Math.floor(100 + Math.random() * 900);
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  let itemsDetailText = '';
  if (calculationRows && calculationRows.length > 0) {
    itemsDetailText = calculationRows
      .filter((r) => !r.item.startsWith('TỔNG') && !r.item.startsWith('Thuế'))
      .map(
        (r, idx) =>
          `  1.${idx + 1}. ${r.item} | Quy cách: ${r.spec} | Khối lượng: ${r.quantity} | Đơn giá: ${r.unitPrice} | Thành tiền: ${r.subtotal}`
      )
      .join('\n');
  } else {
    itemsDetailText = '  1.1. In ấn bạt Hiflex ngoài trời khổ lớn 3.2m CMYK, gia công gấp mép xỏ que đục khoen nhôm.';
  }

  const content = `                   CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                      Độc lập - Tự do - Hạnh phúc
                               ---***---

                          HỢP ĐỒNG KINH TẾ
                  (Số: ${contractNum}/${year}/HĐKT-PRINTAD3D)
  V/v: In ấn, gia công và cung cấp sản phẩm truyền thông quảng cáo ngoài trời

Hôm nay, ngày ${day} tháng ${month} năm ${year}, tại trụ sở Công ty TNHH In Ấn & Quảng Cáo PrintAd 3D, chúng tôi gồm có:

BÊN A (BÊN ĐẶT IN - KHÁCH HÀNG DOANH NGHIỆP):
- Đơn vị: CÔNG TY ĐỐI TÁC THƯƠNG MẠI B2B & DỰ ÁN
- Địa chỉ: Trụ sở văn phòng đại diện khách hàng theo hồ sơ RFQ
- Đại diện theo pháp luật: Ông/Bà Giám Đốc Điều Hành
- Tài khoản ngân hàng: Tài khoản doanh nghiệp mở tại Ngân hàng Thương mại
- Điện thoại liên hệ: Theo thông tin đơn đặt hàng

BÊN B (BÊN NHẬN IN - NHÀ SẢN XUẤT):
- Đơn vị: CÔNG TY TNHH IN ẤN & QUẢNG CÁO PRINTAD 3D
- Địa chỉ xưởng: Lô K-08, Khu Công Nghiệp Kỹ Thuật Số, TP. Hà Nội
- Mã số thuế: 0108998877
- Đại diện pháp luật: Ông NGUYỄN VĂN AN - Chức vụ: Tổng Giám Đốc
- Chuyên viên thụ lý HĐ: Dekisugi (Trưởng phòng Kinh Doanh B2B)
- Tài khoản: 190368889999 tại Ngân hàng Techcombank - Chi nhánh Thăng Long
- Hotline CSKH & Kỹ thuật: 0988.123.456

Hai bên cùng thống nhất ký kết Hợp đồng kinh tế với các điều khoản cụ thể sau:

ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG VÀ QUY CÁCH KỸ THUẬT
Bên A chỉ định và Bên B đồng ý nhận in ấn gia công các hạng mục sau:
${itemsDetailText}
- Yêu cầu kỹ thuật: In phun kỹ thuật số khổ lớn 3.2m, hệ màu CMYK độ phân giải 1440 DPI.
- Tiêu chuẩn màu sắc: Đạt chuẩn ISO Coated v2, độ lệch màu Delta-E < 1.5 so với bản in test proof được Bên A ký duyệt.
- Gia công thành phẩm: Bù tràn lề bleed 3mm, may viền chịu lực, đục khoen nhôm cách đều 30cm.

ĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG VÀ PHƯƠNG THỨC THANH TOÁN
1. Tổng giá trị hợp đồng (Đã bao gồm thuế GTGT VAT 8%): ${totalAmountFormatted}
2. Phương thức thanh toán (02 đợt qua chuyển khoản ngân hàng):
   - Đợt 1 (Tạm ứng): Bên A thanh toán 50% tổng giá trị hợp đồng ngay sau khi ký kết để Bên B nhập phôi vật tư và xuất file in.
   - Đợt 2 (Tất toán): Bên A thanh toán 50% còn lại trong vòng 03 ngày làm việc kể từ ngày Bên B bàn giao đủ hàng hóa kèm Phiếu giao hàng và Hóa đơn điện tử VAT hợp lệ.

ĐIỀU 3: THỜI GIAN, ĐỊA ĐIỂM VÀ PHƯƠNG THỨC GIAO NHẬN
1. Thời gian giao hàng: Trong vòng 24 - 48 giờ làm việc kể từ thời điểm duyệt bản in test proof và nhận tiền tạm ứng Đợt 1.
2. Địa điểm giao hàng: Tại kho hoặc địa chỉ công trình chỉ định của Bên A.
3. Nghiệm thu: Hai bên lập Phiếu giao hàng kiêm Biên bản nghiệm thu kiểm tra kích thước, chất lượng bề mặt và độ chuẩn màu sắc tại chỗ.

ĐIỀU 4: CAM KẾT BẢO HÀNH CHẤT LƯỢNG
1. Bên B cam kết bảo hành độ bền màu mực ngoài trời tối thiểu 12 tháng.
2. Trường hợp lỗi do kỹ thuật xưởng in (sai màu nghiêm trọng Delta-E > 2.0, nhòe mực, lệch khổ), Bên B cam kết in bù mới 100% trong vòng 12 giờ làm việc mà Bên A không phải chịu bất kỳ chi phí phát sinh nào.

ĐIỀU 5: PHẠT VI PHẠM VÀ TRÁCH NHIỆM BỒI THƯỜNG
1. Tuân thủ Điều 300 & 301 Luật Thương mại 2005: Trường hợp chậm giao hàng không do bất khả kháng, bên vi phạm chịu phạt 0.2%/ngày chậm trễ, nhưng tổng mức phạt không vượt quá trần luật định 8% giá trị phần nghĩa vụ bị vi phạm.
2. Giới hạn bồi thường: Trách nhiệm bồi thường thiệt hại tối đa của Bên B không vượt quá 100% giá trị lô hàng có lỗi.

ĐIỀU 6: ĐIỀU KHOẢN CHUNG VÀ HIỆU LỰC HỢP ĐỒNG
1. Hợp đồng có hiệu lực kể từ ngày ký và tự động thanh lý khi hai bên hoàn tất nghĩa vụ giao hàng và thanh toán.
2. Hợp đồng được lập thành 04 bản có giá trị pháp lý như nhau, mỗi bên giữ 02 bản.

          ĐẠI DIỆN BÊN A                               ĐẠI DIỆN BÊN B
   (Ký, ghi rõ họ tên, đóng dấu)                (Ký, ghi rõ họ tên, đóng dấu)`;

  return {
    id: `doc-contract-${contractNum}`,
    documentType: 'contract',
    title: `HỢP ĐỒNG KINH TẾ SỐ ${contractNum}/${year}/HĐKT-PRINTAD3D`,
    documentNumber: `${contractNum}/${year}/HĐKT-PRINTAD3D`,
    issueDate: `${day}/${month}/${year}`,
    parties: {
      partyA: 'Khách hàng Doanh nghiệp B2B',
      partyB: 'Công ty TNHH In Ấn & Quảng Cáo PrintAd 3D'
    },
    content
  };
}

/**
 * Generates a formal, standardized Vietnamese Delivery & Acceptance Note (Phiếu Giao Hàng Kiêm Biên Bản Nghiệm Thu)
 */
export function buildFormalDeliveryNoteDocument(
  prompt: string,
  totalAmountFormatted: string,
  calculationRows?: CalculationRow[]
): FormalDocument {
  const deliveryNum = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  let tableRowsText = '';
  if (calculationRows && calculationRows.length > 0) {
    tableRowsText = calculationRows
      .filter((r) => !r.item.startsWith('TỔNG') && !r.item.startsWith('Thuế'))
      .map(
        (r, idx) =>
          `| ${String(idx + 1).padStart(2, '0')} | ${r.item.padEnd(38, ' ')} | ${r.quantity.padEnd(10, ' ')} | ${r.quantity.padEnd(10, ' ')} | Đạt chuẩn test proof ISO Coated v2 |`
      )
      .join('\n');
  } else {
    tableRowsText =
      '| 01 | Bạt Hiflex không gân ngoài trời khổ lớn  | 80 m²      | 80 m²      | Đạt chuẩn màu, may viền đục khoen |\n' +
      '| 02 | Chân Standee cuốn nhôm cao cấp 0.8x2.0m | 12 bộ      | 12 bộ      | Nguyên kiện, lò xo đàn hồi tốt    |';
  }

  const content = `              CÔNG TY TNHH IN ẤN & QUẢNG CÁO PRINTAD 3D
       Địa chỉ xưởng: Lô K-08, Khu Công Nghiệp Kỹ Thuật Số, TP. Hà Nội
                     Hotline CSKH / Giao vận: 0988.123.456
                                  ---***---

               PHIẾU GIAO HÀNG KIÊM BIÊN BẢN BÀN GIAO SẢN PHẨM
                         Số phiếu: ${deliveryNum}/${year}/PGH-PRINTAD
                         Ngày lập: ${day}/${month}/${year}
                         Căn cứ HĐ / Đơn hàng: ĐH-${year}-${day}${month}

1. THÔNG TIN BÊN GIAO HÀNG (PRINTAD 3D):
- Đơn vị giao: CÔNG TY TNHH IN ẤN & QUẢNG CÁO PRINTAD 3D
- Người phụ trách giao vận: Đội vận chuyển xưởng in PrintAd
- Phụ trách CSKH / Điều phối: Shizuka (Trưởng phòng CSKH) & Bác Kaminari (Kho)
- Phương tiện vận chuyển: Xe tải giao nhận chuyên dụng xưởng in

2. THÔNG TIN BÊN NHẬN HÀNG (KHÁCH HÀNG):
- Tên khách hàng / Đơn vị nhận: Chuỗi cửa hàng / Đại diện đối tác B2B
- Địa chỉ giao hàng: Theo địa chỉ bàn giao công trình
- Người trực tiếp nhận hàng & kiểm đếm: Đại diện phụ trách nghiệm thu

3. BẢNG KÊ CHI TIẾT SẢN PHẨM THỰC TẾ BÀN GIAO:
+----+----------------------------------------+------------+------------+-------------------------------------+
| ST | Tên Hàng Hóa & Quy Cách Kỹ Thuật       | SL Đặt Hàng| SL Thực Giao| Tình Trạng Chất Lượng & Màu Sắc    |
+----+----------------------------------------+------------+------------+-------------------------------------+
${tableRowsText}
| 03 | Bản in Test Proof CMYK đối chứng màu   | 01 Bản     | 01 Bản     | Đã ký duyệt màu sắc trước in        |
+----+----------------------------------------+------------+------------+-------------------------------------+

4. KẾT LUẬN NGHIỆM THU HIỆN TRƯỜNG & CAM KẾT:
- Đại diện Khách hàng đã kiểm tra thực tế: Số lượng thực giao đúng với đơn hàng; bạt không trầy xước, không rách mép; màu sắc in chuẩn xác so với mẫu proof đã ký duyệt.
- Hai bên thống nhất ký nhận bàn giao để làm cơ sở thanh quyết toán công nợ theo Hợp đồng.
- Sản phẩm được áp dụng chính sách bảo hành màu sắc ngoài trời 12 tháng của xưởng PrintAd 3D.
- Phiếu giao hàng được lập thành 02 liên (Liên 1: Xưởng lưu kế toán; Liên 2: Giao khách hàng lưu trữ).

  NGƯỜI LẬP PHIẾU        THỦ KHO XUẤT HÀNG       NHÂN VIÊN GIAO HÀNG       ĐẠI DIỆN KHÁCH HÀNG
 (Shizuka ký nhận)      (Bác Kaminari ký)         (Ký & ghi rõ họ tên)    (Ký nhận & Nghiệm thu)`;

  return {
    id: `doc-delivery-${deliveryNum}`,
    documentType: 'delivery_note',
    title: `PHIẾU GIAO HÀNG KIÊM BIÊN BẢN BÀN GIAO SẢN PHẨM SỐ ${deliveryNum}`,
    documentNumber: `${deliveryNum}/${year}/PGH-PRINTAD`,
    issueDate: `${day}/${month}/${year}`,
    parties: {
      partyA: 'Đại diện Khách hàng nhận hàng',
      partyB: 'Xưởng in PrintAd 3D (Shizuka & Kho bãi)'
    },
    content
  };
}


/**
 * Generates a formal B2B Business Email (Thư Điện Tử Thương Mại B2B)
 */
export function buildFormalB2bEmailDocument(
  prompt: string,
  totalAmountFormatted?: string,
  isDebtReminder?: boolean
): FormalDocument {
  const emailId = Math.floor(100 + Math.random() * 900);
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  let subject = '';
  let content = '';

  if (isDebtReminder || prompt.toLowerCase().includes('nợ') || prompt.toLowerCase().includes('công nợ')) {
    subject = `[PrintAd 3D] - Đề nghị Đối chiếu & Thanh toán Đợt 2 Đơn hàng PO-${year}-JP${emailId}`;
    content = `Tiêu đề: ${subject}
Người gửi: phong.ketoan@printad3d.vn (Suneo - Kế Toán Trưởng)
Người nhận: Phong-Ke-Toan-Doi-Tac@company.com
Ngày gửi: ${day}/${month}/${year}

Kính gửi: Quý Ban Giám Đốc và Bộ phận Kế toán Doanh nghiệp Đối tác,

Lời đầu tiên, Công ty TNHH In Ấn & Quảng Cáo PrintAd 3D xin gửi lời chào trân trọng và lời chúc sức khỏe, thành công đến Quý công ty!

Căn cứ Hợp đồng kinh tế số ${emailId}/${year}/HĐKT-PRINTAD và Biên bản nghiệm thu bàn giao lô sản phẩm truyền thông ngoài trời ngày 15/${month}/${year}; theo thỏa thuận điều khoản thanh toán, khoản công nợ đợt 2 trị giá ${totalAmountFormatted || '135.000.000 VNĐ'} đã đến hạn thanh toán vào ngày ${day}/${month}/${year}.

Chúng tôi xin gửi kèm Biên bản đối chiếu công nợ chi tiết có xác nhận của hai bên tại file đính kèm: [Doi_Chieu_Cong_No_PrintAd_${year}.pdf].

Kính nhờ Quý công ty kiểm tra và sắp xếp phê duyệt lệnh chuyển tiền trong tuần này vào tài khoản:
- Tên tài khoản: CÔNG TY TNHH IN ẤN & QUẢNG CÁO PRINTAD 3D
- Số tài khoản: 190368889999 tại Ngân hàng Techcombank - Chi nhánh Thăng Long

Nếu có bất kỳ thắc mắc nào về hóa đơn GTGT điện tử hoặc chứng từ bàn giao, xin vui lòng liên hệ trực tiếp với em qua số Hotline: 0988.111.222.

Trân trọng cảm ơn sự phối hợp chu đáo và tin cậy của Quý đối tác!

--
Phòng Kế toán - Tài chính PrintAd 3D
Hotline: 0988.111.222 | Email: ketoan@printad3d.vn
Xưởng sản xuất: Lô K-08, Khu Công Nghiệp Kỹ Thuật Số, TP. Hà Nội`;
  } else {
    subject = `[PrintAd 3D] - Bảng Báo Giá Gia Công In Ấn Kỹ Thuật Số Đơn Hàng RFQ-${year}-${emailId}`;
    content = `Tiêu đề: ${subject}
Người gửi: kinhdoanh@printad3d.vn (Dekisugi - Trưởng phòng Kinh Doanh B2B)
Người nhận: Dai-Dien-Thu-Mua@khachhang.com
Ngày gửi: ${day}/${month}/${year}

Kính gửi: Ông/Bà Giám Đốc Thu Mua & Quản Lý Dự Án,

Lời đầu tiên, Công ty TNHH In Ấn & Quảng Cáo PrintAd 3D xin gửi lời chào trân trọng và lời chúc hợp tác thịnh vượng đến Quý công ty!

Căn cứ vào Bản vẽ thiết kế và Yêu cầu báo giá (RFQ) nhận được từ Quý công ty, chúng tôi trân trọng gửi đến Quý khách Bảng báo giá in ấn và gia công quảng cáo chi tiết:
- Hạng mục: In ấn bạt Hiflex không gân ngoài trời & Hệ thống Standee cuốn nhôm cao cấp.
- Quy cách: In phun kỹ thuật số khổ 3.2m, hệ màu CMYK độ phân giải 1440 DPI, may viền chịu lực, đục khoen nhôm cách đều 30cm.
- Tổng giá trị đơn hàng: ${totalAmountFormatted || '45.000.000 VNĐ'} (Đã bao gồm thuế GTGT VAT 8%).
- Thời gian giao hàng: Trong vòng 24 - 48 giờ kể từ thời điểm ký duyệt bản in test proof ISO Coated v2.
- Bảng phân tích chi phí định mức BOM được đính kèm tại file: [Bao_Gia_PrintAd_${year}_${emailId}.pdf].

Báo giá trên có hiệu lực trong vòng 30 ngày kể từ ngày phát hành. Kính đề nghị Quý khách phản hồi xác nhận để chúng tôi kịp thời giữ slot máy in và điều phối vật tư.

Trân trọng cảm ơn sự tin tưởng và hợp tác của Quý đối tác!

--
Nguyễn Dekisugi
Trưởng phòng Kinh Doanh B2B & Quản Trị Dự Án - PrintAd 3D
Hotline: 0912.888.999 | Email: dekisugi.b2b@printad3d.vn
Nhà xưởng: Lô K-08, KCN Kỹ Thuật Số, TP. Hà Nội`;
  }

  return {
    id: `doc-email-${emailId}`,
    documentType: 'b2b_email',
    title: subject,
    documentNumber: `EMAIL-${year}-${emailId}`,
    issueDate: `${day}/${month}/${year}`,
    content
  };
}

/**
 * Generates a formal Meeting Minutes document with RACI action matrix (Biên Bản Họp Giao Ban Sản Xuất)
 */
export function buildFormalMeetingMinutesDocument(
  prompt: string,
  weekNumber = 43
): FormalDocument {
  const meetingNum = Math.floor(10 + Math.random() * 90);
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  const content = `              CÔNG TY TNHH IN ẤN & QUẢNG CÁO PRINTAD 3D
                                 ---***---

              BIÊN BẢN HỌP GIAO BAN ĐIỀU HÀNH SẢN XUẤT TUẦN ${weekNumber}
                        Số biên bản: ${meetingNum}/${year}/BBH-PRINTAD
- Thời gian: 08h00 - 09h30, Thứ Hai ngày ${day}/${month}/${year}
- Địa điểm: Phòng họp vách kính Ban Giám Đốc - Trụ sở xưởng in PrintAd 3D
- Chủ trì: Ông NGUYỄN VĂN AN - Tổng Giám Đốc
- Thư ký ghi biên bản: Doraemon (Master Agent & Trợ lý Ban Giám Đốc)
- Thành phần tham dự: Trưởng các phòng ban: Kinh doanh (Dekisugi), CSKH (Shizuka), Kế toán (Suneo), Marketing (Chaian), Nhân sự (Dorami), Kho (Bác Kaminari), Hành chính (Thầy Giáo), Kỹ thuật (Nobita).

I. ĐÁNH GIÁ TÌNH HÌNH TUẦN QUA & CÁC QUYẾT ĐỊNH THEN CHỐT (KEY DECISIONS):
1. Tỷ lệ hoàn thành đơn hàng đúng hạn (OTIF) đạt 97.8%; chất lượng màu sắc sau in kiểm tra đạt 100% dung sai Delta-E < 1.5.
2. Thống nhất kích hoạt phương án vận hành 3 ca kíp liên tục tại xưởng in kể từ tuần tới để đáp ứng sản lượng 20.000m² bạt cho chiến dịch POSM của khách hàng chuỗi.
3. Phê duyệt hạn mức chi tạm ứng 250.000.000 VNĐ cho Phòng Kho & Mua hàng nhập phôi bạt và mực in UV chất lượng cao theo nguyên tắc FIFO.
4. Khen thưởng Biệt đội Kỹ thuật chế bản (Nobita & Mini-Dora Đỏ) đã tối ưu hóa bình bài, tiết kiệm 8.2% diện tích phôi bạt thừa.

II. BẢNG MA TRẬN PHÂN CÔNG HÀNH ĐỘNG (ACTION ITEMS RACI MATRIX):
+----+-----------------------------------------------+----------------------+------------------+------------+------------------------------------------+
| ST | Nhiệm vụ cụ thể                               | Phụ trách (Owner)    | Phối hợp         | Hạn chót   | Tiêu chí bàn giao hoàn thành (DoD)       |
+----+-----------------------------------------------+----------------------+------------------+------------+------------------------------------------+
| 01 | Lên danh sách phân bổ 18 thợ in chạy ca 3     | Dorami (Nhân sự)     | Quản đốc xưởng   | Thứ Tư     | Bảng phân ca có chữ ký cam kết an toàn   |
| 02 | Soạn thảo hợp đồng B2B cung ứng 2.000m² bạt   | Dekisugi (Kinh doanh)| Pháp chế Sunetsugu| Thứ Năm   | Hợp đồng hoàn thiện gửi khách hàng ký    |
| 03 | Đối soát công nợ đợt 2 và gửi thư đôn đốc     | Suneo (Kế toán)      | Tamako (Mẹ Nobita)| Thứ Sáu   | Tiền cọc 50% vào tài khoản công ty       |
| 04 | Kiểm tra bảo trì máy in & bình bọt PCCC 5S    | Thầy Giáo (Hành chính)| Mẹ Chaian       | Thứ Ba     | Biên bản kiểm định đạt chuẩn an toàn 100%|
| 05 | Kiểm tra Preflight CMYK và xuất file in proof | Nobita (Kỹ thuật)    | Mini-Dora Đỏ     | 24h tới    | Bản in test proof có chữ ký duyệt màu    |
+----+-----------------------------------------------+----------------------+------------------+------------+------------------------------------------+

III. KẾT LUẬN & CHỈ ĐẠO CỦA TỔNG GIÁM ĐỐC:
Toàn thể 8 phòng ban nghiêm túc thực hiện nhiệm vụ theo đúng quy chuẩn SOP, phối hợp nhịp nhàng và báo cáo tiến độ hàng ngày qua Master Agent Doraemon.

          THƯ KÝ CUỘC HỌP                              CHỦ TRÌ CUỘC HỌP
      (Doraemon ký biên bản)                      (Tổng Giám Đốc ký phê chuẩn)`;

  return {
    id: `doc-minutes-${meetingNum}`,
    documentType: 'meeting_minutes',
    title: `BIÊN BẢN HỌP GIAO BAN ĐIỀU HÀNH SẢN XUẤT TUẦN ${weekNumber}`,
    documentNumber: `${meetingNum}/${year}/BBH-PRINTAD`,
    issueDate: `${day}/${month}/${year}`,
    content
  };
}

/**
 * Generates an 8D Problem Solving Report for customer complaints (Báo Cáo Giải Trình Sự Cố 8D)
 */
export function buildFormal8DComplaintDocument(
  prompt: string,
  issueTitle = 'Sự cố lệch sắc độ màu bản in bạt ngoài trời'
): FormalDocument {
  const reportNum = Math.floor(100 + Math.random() * 900);
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  const content = `              CÔNG TY TNHH IN ẤN & QUẢNG CÁO PRINTAD 3D
       Địa chỉ xưởng: Lô K-08, Khu Công Nghiệp Kỹ Thuật Số, TP. Hà Nội
                                 ---***---

          BÁO CÁO GIẢI TRÌNH SỰ CỐ & HÀNH ĐỘNG KHẮC PHỤC THEO PHƯƠNG PHÁP 8D
                       (EIGHT DISCIPLINES PROBLEM SOLVING REPORT)
                    Số báo cáo: 8D-${reportNum}/${year}/PRINTAD
                    Ngày phát hành: ${day}/${month}/${year}
                    Khách hàng: Chuỗi cửa hàng bán lẻ B2B
                    Mã đơn hàng liên quan: PO-${year}-${reportNum}

D1. THÀNH LẬP ĐỘI ĐẶC NHIỆM GIẢI QUYẾT SỰ CỐ (CHAMPION & CORE TEAM):
- Trưởng nhóm (Leader): Shizuka (Trưởng phòng CSKH & Giải quyết khiếu nại)
- Thành viên Kỹ thuật: Nobita (Kỹ sư Thiết kế & Preflight CMYK)
- Thành viên Sản xuất: Bác Kaminari (Kho bãi & Tiếp liệu vật tư)
- Giám sát chất lượng: Thầy Giáo Chủ Nhiệm (Trưởng phòng EHS & ISO)
- Cố vấn điều phối: Doraemon (Master Agent Ban Giám Đốc)

D2. MÔ TẢ HIỆN TƯỢNG SỰ CỐ (PROBLEM DESCRIPTION):
- Hiện tượng: Khách hàng phản ánh lô hàng in bạt Hiflex 80m² nhận sáng nay có tone màu xanh cyan đậm hơn 12% so với bản in test proof đã duyệt.
- Tần suất: Xảy ra trên 01 cuộn bạt số lô Lot-202610-B02; các lô khác đạt chuẩn.
- Mức độ ảnh hưởng: Chưa gây gián đoạn thi công biển hiệu của khách hàng.

D3. BIỆN PHÁP NGĂN CHẶN TẠM THỜI TRONG VÒNG 04 GIỜ (INTERIM CONTAINMENT ACTIONS):
- Lập tức niêm phong và dừng xuất xưởng toàn bộ lô cuộn Lot-202610-B02 tại kho.
- Xuất kho khẩn cấp lô hàng đệm an toàn (Buffer stock) 80m² đã in test đạt chuẩn 100% để giao ngay cho khách hàng thi công trước 14h00 chiều nay.
- Chi phí vận chuyển hỏa tốc do xưởng PrintAd 3D chịu 100%.

D4. PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ BẰNG 5 WHYS (ROOT CAUSE ANALYSIS):
- Why 1: Tại sao bản in có màu xanh đậm hơn bản proof? -> Do lưu lượng mực đầu phun Cyan ra nhiều hơn bình thường.
- Why 2: Tại sao đầu phun Cyan ra mực nhiều hơn? -> Do nhiệt độ sấy đầu phun tăng thêm 4°C so với cài đặt chuẩn.
- Why 3: Tại sao nhiệt độ sấy tăng 4°C? -> Do cảm biến nhiệt độ cụm sấy bị bám bụi mực lâu ngày dẫn đến đo sai lệch.
- Why 4: Tại sao cảm biến bị bám bụi mực? -> Kỹ thuật viên bảo trì ca đêm bỏ qua bước dùng súng khí thổi bụi sensor.
- Why 5 (Nguyên nhân gốc rễ): Chưa có bảng kiểm checklist trực quan dán tại thân máy in để ký xác nhận vệ sinh sensor đầu ca.

D5. HÀNH ĐỘNG KHẮC PHỤC VĨNH VIỄN (PERMANENT CORRECTIVE ACTIONS - PCA):
- Thay thế cảm biến nhiệt độ sấy mới cho máy in phun số 2; hiệu chuẩn lại profile ICC bằng máy đo quang phổ spectrophotometer.
- Ban hành quy định bắt buộc đo Delta-E mỗi 50m² in liên tục.

D6. THỰC HIỆN VÀ XÁC NHẬN HIỆU QUẢ CỦA BIỆN PHÁP (VALIDATE PCA):
- Chạy thử nghiệm 10 bản in liên tục ở các khổ khác nhau: Độ lệch màu Delta-E đo được = 0.82 (Đạt chuẩn < 1.5 của ISO Coated v2).

D7. HÀNH ĐỘNG PHÒNG NGỪA TÁI DIỄN (PREVENT RECURRENCE):
- Cập nhật quy trình SOP bảo trì máy in đầu ca (SOP-MT-012) có mục kiểm tra cảm biến nhiệt độ.
- Dán bảng kiểm checklist 1 trang chống nước ngay trên thân máy.

D8. GHI NHẬN ĐÓNG GÓP & ĐÓNG HỒ SƠ SỰ CỐ (TEAM RECOGNITION & CLOSURE):
- Khách hàng đã ký nghiệm thu hài lòng với lô hàng bù mới; CSAT đạt 5/5 sao. Hồ sơ sự cố chính thức được đóng.

       TRƯỞNG NHÓM 8D                              TỔNG GIÁM ĐỐC PHÊ DUYỆT
      (Shizuka ký tên)                                (Ký tên và đóng dấu)`;

  return {
    id: `doc-8d-${reportNum}`,
    documentType: 'complaint_8d',
    title: `BÁO CÁO GIẢI TRÌNH SỰ CỐ CHẤT LƯỢNG 8D SỐ 8D-${reportNum}`,
    documentNumber: `8D-${reportNum}/${year}/PRINTAD`,
    issueDate: `${day}/${month}/${year}`,
    content
  };
}

/**
 * Generates an ISO 9001:2015 Standard Operating Procedure document (Quy Trình Tác Nghiệp SOP)
 */
export function buildFormalIsoSopDocument(
  prompt: string,
  sopCode = 'SOP-PRD-2026-05',
  sopTitle = 'Quy trình Vận hành Tiêu chuẩn In Phun Khổ Lớn & Kiểm soát Màu Sắc CMYK'
): FormalDocument {
  const docId = Math.floor(100 + Math.random() * 900);
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  const content = `              CÔNG TY TNHH IN ẤN & QUẢNG CÁO PRINTAD 3D
       Hệ thống Quản lý Chất lượng Tiêu chuẩn Quốc tế ISO 9001:2015
                                 ---***---

                   QUY TRÌNH VẬN HÀNH TIÊU CHUẨN (SOP)
           ${sopTitle.toUpperCase()}
           Mã số: ${sopCode} | Lần ban hành: 03 | Ngày hiệu lực: ${day}/${month}/${year}
           Người biên soạn: Thầy Giáo (Phòng EHS & ISO) | Người phê duyệt: Tổng Giám Đốc

1. MỤC ĐÍCH:
Quy chuẩn hóa toàn bộ các bước thao tác vận hành máy in, kiểm soát độ chính xác của hệ màu CMYK và loại trừ hoàn toàn các rủi ro lệch màu, nhăn rách vật liệu.

2. PHẠM VI ÁP DỤNG:
Áp dụng cho toàn bộ kỹ sư thiết kế chế bản, thợ vận hành máy in và nhân viên kiểm tra chất lượng (QC) tại xưởng sản xuất PrintAd 3D.

3. TRÁCH NHIỆM:
- Kỹ sư thiết kế chế bản (Nobita): Chịu trách nhiệm kiểm tra Preflight CMYK 300 DPI, bù tràn lề bleed 3mm và convert font chữ.
- Thợ in (Mini-Dora Đỏ): Chịu trách nhiệm bảo dưỡng đầu ca và kiểm soát độ căng phôi bạt khi máy chạy.
- Trưởng phòng QC (Thầy Giáo): Chịu trách nhiệm đo kiểm dung sai Delta-E và đóng dấu phê duyệt First Article Inspection (FAI).

4. CÁC BƯỚC TIẾN HÀNH CHI TIẾT:
BƯỚC 1: KIỂM TRA MỨC DẦU & ÁP SUẤT ĐẦU CA (5 PHÚT TRƯỚC CA)
- Kiểm tra bình mực cấp tự động 4 màu CMYK, đảm bảo lượng mực luôn trên 60%.
- Kiểm tra áp suất khí nén đạt chuẩn $\\ge 0.6$ MPa và nhiệt độ sấy đạt 45°C $\\pm$ 2°C.

BƯỚC 2: TIẾP NHẬN PHÔI BẠT THEO NGUYÊN TẮC FIFO
- Quét mã QR Lot No. phôi bạt xuất từ kho; kiểm tra bề mặt phôi không bám bụi hoặc trầy xước.

BƯỚC 3: IN THỬ MẪU ĐẦU TIÊN (FIRST ARTICLE INSPECTION - FAI)
- In bản test proof dài 50cm có dải đo màu FOGRA 39. Dùng máy quang phổ đo độ lệch màu Delta-E.
- Tiêu chuẩn chấp thuận: Delta-E < 1.5. Chỉ khi có chữ ký duyệt FAI mới được bấm máy chạy đại trà.

BƯỚC 4: SẢN XUẤT ĐẠI TRÀ & GIA CÔNG
- Bật đèn sấy hồng ngoại chống lem mực; thợ in kiểm tra mép bạt mỗi 20m.
- Gia công may gấp mép nhiệt, đục khoen nhôm chịu lực cách đều 30cm.

5. BIỂU MẪU ĐÍNH KÈM:
- BM-01: Bảng kiểm tra checklist bảo dưỡng máy in đầu ca.
- BM-02: Phiếu nghiệm thu chất lượng bản in FAI.

         NGƯỜI BIÊN SOẠN                               TỔNG GIÁM ĐỐC PHÊ DUYỆT
      (Thầy Giáo Chủ Nhiệm)                              (Ký tên và đóng dấu)`;

  return {
    id: `doc-sop-${docId}`,
    documentType: 'iso_sop',
    title: `QUY TRÌNH VẬN HÀNH TIÊU CHUẨN ${sopCode}`,
    documentNumber: sopCode,
    issueDate: `${day}/${month}/${year}`,
    content
  };
}

/**
 * Generates a Kanban Order Tracking document (Bảng Quản Trị Tiến Độ Đơn Hàng Kanban)
 */
export function buildFormalKanbanDocument(
  prompt: string
): FormalDocument {
  const kanbanId = Math.floor(100 + Math.random() * 900);
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  const content = `              CÔNG TY TNHH IN ẤN & QUẢNG CÁO PRINTAD 3D
       Địa chỉ xưởng: Lô K-08, Khu Công Nghiệp Kỹ Thuật Số, TP. Hà Nội
                                 ---***---

              BẢNG QUẢN TRỊ TIẾN ĐỘ ĐƠN HÀNG SẢN XUẤT THEO KANBAN
                    Mã quản lý: KANBAN-${year}-W43-${kanbanId}
                    Thời điểm cập nhật: ${day}/${month}/${year}
                    Người điều phối: Bác Kaminari (Kho) & Shizuka (CSKH)

+-------------------------------------------------------------------------------------------------------+
| [CỘT 1: BACKLOG - ĐANG CHỜ PHÔI VẬT TƯ] (3 Đơn hàng)                                                 |
| - DH-2026-081: 200m² bạt Hiflex dày xuyên sáng | Khách: Tập đoàn F | Due: 28/10 | Chờ phôi về kho     |
| - DH-2026-082: 50 bộ Standee chữ X cường lực  | Khách: Cty Dược P  | Due: 29/10 | Đang nhập khẩu      |
| - DH-2026-083: 30 hộp đèn siêu mỏng Mica LED   | Khách: Chuỗi Cafe  | Due: 30/10 | Chờ duyệt bản vẽ    |
+-------------------------------------------------------------------------------------------------------+
| [CỘT 2: CHẾ BẢN DTP & IN TEST PROOF] (4 Đơn hàng)                                                    |
| - DH-2026-077: 80m² Poster quảng cáo CMYK 300 DPI | Phụ trách: Nobita | Đã convert font, bù tràn 3mm |
| - DH-2026-078: 500 cuốn Catalog Offset 16 trang   | Phụ trách: Mini-Dora Đỏ | Bản proof màu Delta-E 0.9|
| - DH-2026-079: 15 Backdrop hội nghị khổ 6x3m      | Phụ trách: Nobita | Khách đã ký duyệt bản mẫu FAI|
| - DH-2026-080: 100m² Decal PP cán màng mờ         | Phụ trách: Mini-Dora Đỏ | Đang bình bài máy in UV |
+-------------------------------------------------------------------------------------------------------+
| [CỘT 3: ĐANG IN & GIA CÔNG 3 CA] (WIP Limit <= 5) (3 Đơn hàng) [ĐANG CHẠY MÁY]                        |
| - DH-2026-074: [ƯU TIÊN GẤP] 500m² bạt chuỗi bán lẻ | Máy in số 1 (Ca 2) | Tiến độ: 85% hoàn thành   |
| - DH-2026-075: 30 Standee cuốn nhôm gia công xỏ cây | Bàn gia công số 2   | Đang đóng khoen nhôm      |
| - DH-2026-076: 40 Biển Mica hút nổi viền Inox       | Xưởng dập nhiệt     | Tiến độ: 60%              |
+-------------------------------------------------------------------------------------------------------+
| [CỘT 4: HOÀN TẤT & ĐÃ XUẤT PHIẾU GIAO HÀNG] (4 Đơn hàng) [SẴN SÀNG GIAO]                             |
| - DH-2026-070: 80m² bạt Hiflex giao khách hàng XYZ | Đã lập Phiếu giao hàng số 88 | Bác Kaminari ký |
| - DH-2026-071: 12 bộ Standee cuốn nhôm             | Đã bàn giao xe tải số 2     | Khách nhận 10h00  |
| - DH-2026-072: 200m² Decal dán kính tòa nhà        | Đã nghiệm thu đạt 100%       | Lưu kế toán Suneo |
| - DH-2026-073: 50 Bảng chỉ dẫn thoát hiểm phát quang| Đã giao công trình          | Đạt chuẩn PCCC    |
+-------------------------------------------------------------------------------------------------------+

QUY ĐỊNH VẬN HÀNH BẢNG KANBAN:
1. Giới hạn khối lượng đang sản xuất (WIP Limit) tại Cột 3 tối đa 5 đơn hàng; không nhận thêm khi chưa giải phóng.
2. Thẻ có dải màu đỏ thể hiện đơn hàng gấp cần ưu tiên dây chuyền máy in công suất cao.
3. Cập nhật thẻ trạng thái 2 lần mỗi ngày: 08h00 sáng và 13h30 chiều.

          NGƯỜI ĐIỀU PHỐI KHO                          TRƯỞNG PHÒNG ĐIỀU HÀNH
         (Bác Kaminari ký tên)                          (Doraemon ký phê duyệt)`;

  return {
    id: `doc-kanban-${kanbanId}`,
    documentType: 'kanban_tracking',
    title: `BẢNG THEO DÕI TIẾN ĐỘ ĐƠN HÀNG KANBAN SỐ ${kanbanId}`,
    documentNumber: `KANBAN-${year}-W43-${kanbanId}`,
    issueDate: `${day}/${month}/${year}`,
    content
  };
}

/**
 * Generates Company Legal Profile & Quality Capability (/cty 00-cong-ty)
 */
export function buildFormalCompanyProfileDocument(
  prompt: string
): FormalDocument {
  const profileId = 2026;
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  const content = `              CÔNG TY TNHH IN ẤN & QUẢNG CÁO PRINTAD 3D
       Hợp tác công nghệ & Hệ sinh thái Doanh nghiệp GlobalTech Corp
                                 ---***---

                   HỒ SƠ NĂNG LỰC DOANH NGHIỆP & CHÍNH SÁCH CHẤT LƯỢNG
                         (COMPANY PROFILE & OPERATING CAPABILITY)
                         Mã định danh: CTY-${profileId}-VN
                         Ngày cập nhật: ${day}/${month}/${year}

1. THÔNG TIN PHÁP LÝ DOANH NGHIỆP:
- Tên đăng ký: CÔNG TY TNHH IN ẤN & QUẢNG CÁO PRINTAD 3D
- Tên giao dịch quốc tế: PRINTAD 3D ADVERTISING & DIGITAL PRINTING CO., LTD
- Mã số thuế (MST): 0108998877
- Địa chỉ trụ sở & Nhà xưởng: Lô K-08, Khu Công Nghiệp Kỹ Thuật Số, TP. Hà Nội
- Đại diện theo pháp luật: Ông NGUYỄN VĂN AN - Chức vụ: Tổng Giám Đốc
- Hotline điều hành: 0988.123.456 | Email: info@printad3d.vn | Website: www.printad3d.vn

2. NĂNG LỰC TRANG THIẾT BỊ MÁY MÓC SẢN XUẤT:
- 04 Dàn máy in phun kỹ thuật số công nghiệp khổ lớn 3.2m (Đầu phun Konica 512i / Nhật Bản).
- 02 Máy in phẳng & cuộn công nghệ UV đa năng 4 màu CMYK + White (Độ phân giải 1440 DPI).
- 01 Máy in nhanh kỹ thuật số Konica Minolta và dây chuyền in Offset 4 màu khổ A2.
- 03 Máy cắt CNC đa năng, máy laser cắt Mica kim loại và máy uốn chân chữ tự động.
- Năng lực đáp ứng sản lượng: 8.000m² - 12.000m² bạt và decal/ngày; vận hành 3 ca 4 kíp liên tục.

3. HỆ THỐNG QUẢN LÝ CHẤT LƯỢNG & AN TOÀN:
- Chứng nhận Quản lý Chất lượng Quốc tế: ISO 9001:2015.
- Chứng nhận Quản lý Môi trường: ISO 14001:2015.
- Tuân thủ tiêu chuẩn an toàn EHS, phòng cháy chữa cháy PCCC và quy chuẩn 5S hiện trường.

4. 5 NGUYÊN TẮC CỐT LÕI (CORE OPERATING GUARDRAILS):
1. Bảo mật Thông tin Doanh nghiệp Tuyệt đối (Data Privacy & PII Protection): Ẩn toàn bộ giá vốn thực, PII nhân sự và thông tin ngân hàng trước khi công khai.
2. Chính xác Số liệu - Chống Bịa Đặt (Zero-Hallucination Policy): Đối soát 100% số liệu với tài liệu gốc; không tự suy diễn đơn giá kỹ thuật.
3. Tác nghiệp Chuẩn Sản xuất (Lean & SOP): Vận hành theo SOP, OEE, OTIF, quản trị chất lượng 8D.
4. Tối ưu Bàn giao (Actionable Artifacts): Mọi sản phẩm đều xuất ra biểu mẫu chuẩn ký kết, có giá trị pháp lý và nghiệm thu tức thì.
5. Phối hợp Đa phòng ban (Multi-Agent Synergy): Doraemon điều phối nhịp nhàng sang 8 phòng ban chức năng.

           ĐẠI DIỆN BAN GIÁM ĐỐC                       TRƯỞNG BAN PHÁP CHẾ & ISO
        (Tổng Giám Đốc ký phê chuẩn)                     (Thầy Giáo Chủ Nhiệm ký)`;

  return {
    id: `doc-profile-${profileId}`,
    documentType: 'company_profile',
    title: 'HỒ SƠ NĂNG LỰC DOANH NGHIỆP PRINTAD 3D & CHÍNH SÁCH CHẤT LƯỢNG',
    documentNumber: `CTY-${profileId}-VN`,
    issueDate: `${day}/${month}/${year}`,
    content
  };
}

export function generateLocalSopGroundedReport(
  agent: AgentProfile,
  prompt: string,
  allAgents: AgentProfile[],
  allSops: SopDocument[]
): TaskReport {
  const validation = validateScopeAndRoute(agent, prompt, allAgents, allSops);
  const sopCodes = validation.matchedSops.map((s) => s.code);
  const customRulesList = validation.matchedSops.flatMap((s) => s.rules);

  if (!validation.isInScope) {
    return {
      headline: `Cảnh báo Giới hạn Chuyên môn: Chuyển hướng sang ${validation.suggestedAgent?.name || 'Bộ phận phù hợp'}`,
      summary: validation.reason,
      scopeCheckPassed: false,
      scopeExplanation: agent.strictBoundary,
      appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-ROLE-BOUNDARY'],
      spatialActionTaken: `${agent.name} giữ nguyên vị trí tại ${agent.departmentLabel}, từ chối thao tác trái chuyên môn và báo cáo Master Agent Doraemon chuyển việc cho ${validation.suggestedAgent?.name || 'quản lý'}.`,
      keyFindings: [
        `Yêu cầu "${prompt}" chứa nội dung nghiệp vụ thuộc ${validation.suggestedAgent?.departmentLabel || 'bộ phận khác'}.`,
        `Quy tắc huấn luyện doanh nghiệp yêu cầu mỗi thành viên chỉ thực hiện đúng chức năng chuyên sâu để đảm bảo chất lượng và bảo mật số liệu PII.`,
        validation.suggestedAgent
          ? `Đề xuất chuyển nhiệm vụ này cho ${validation.suggestedAgent.name} (${validation.suggestedAgent.slashCommand}) hoặc dùng lệnh /bgd để Doraemon tự động phân rã pipeline.`
          : 'Vui lòng chọn đúng thành viên chuyên trách.'
      ],
      recommendation: validation.suggestedAgent
        ? `Chuyển giao cho ${validation.suggestedAgent.name} (${validation.suggestedAgent.slashCommand}) hoặc để Master Agent Doraemon điều phối tự động.`
        : 'Chọn lại bộ phận chuyên trách phù hợp.',
      executionTimeSec: 1.4,
      sourceMode: 'sop-engine'
    };
  }

  switch (agent.departmentId) {
    case 'sales_b2b': {
      return {
        headline: 'Báo Cáo Báo Giá Kỹ Thuật B2B & Điều Khoản Thương Mại — Dekisugi (Đê-khi)',
        summary: `Dekisugi đã phân tích RFQ cho nhiệm vụ "${prompt}" theo quy chuẩn ${sopCodes.join(', ') || 'SOP-KD-2026-01'}, bóc tách định mức BOM, phân bậc MOQ chiết khấu và thiết lập điều kiện giao nhận Incoterms 2020.`,
        scopeCheckPassed: true,
        scopeExplanation: validation.reason,
        appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-KD-2026-01'],
        spatialActionTaken:
          'Dekisugi đã làm việc tại cụm bàn Kinh Doanh (2.6, 5.5), hoàn thiện báo giá kỹ thuật và soạn thảo thư thương mại song ngữ gửi đối tác.',
        keyFindings: [
          'Phân bậc sản lượng (MOQ): Đơn hàng đạt mức chiết khấu 8% nhờ số lượng lớn; đơn giá chưa VAT đã tính đủ chi phí vật tư và nhân công trực tiếp.',
          'Điều kiện giao hàng (Incoterms 2020): Giao hàng theo điều kiện FOB Hải Phòng / EXW nhà xưởng; thời hạn hiệu lực báo giá 30 ngày.',
          'Điều khoản thanh toán & bảo vệ rủi ro: Tạm ứng 50% ngay khi ký kết hợp đồng thương mại, 50% thanh toán trước khi bàn giao chứng từ xuất xưởng.',
          customRulesList[0] ? `Quy chuẩn áp dụng: "${customRulesList[0]}"` : ''
        ].filter(Boolean),
        calculationRows: [
          {
            item: '1. Sản phẩm cơ khí/vỏ hộp dập định hình',
            spec: 'Theo bản vẽ kỹ thuật CAD/PDF chuẩn ISO',
            quantity: '20.000 SP',
            unitPrice: '18.500đ/SP',
            subtotal: '370.000.000đ'
          },
          {
            item: '2. Chiết khấu sản lượng MOQ (>=10.000 SP)',
            spec: 'Chiết khấu 8% trực tiếp theo SOP-KD',
            quantity: '-8%',
            unitPrice: '370.000.000đ',
            subtotal: '-29.600.000đ'
          },
          {
            item: '3. Phí đóng gói pallet xuất khẩu & khử trùng',
            spec: 'Pallet gỗ tiêu chuẩn ISPM 15',
            quantity: '10 Pallet',
            unitPrice: '450.000đ/pallet',
            subtotal: '4.500.000đ'
          },
          {
            item: 'Thuế GTGT (VAT 8%) & Chứng từ CO/CQ',
            spec: 'Hóa đơn điện tử + Chứng nhận xuất xưởng',
            quantity: '8% VAT',
            unitPrice: '344.900.000đ',
            subtotal: '27.592.000đ'
          },
          {
            item: 'TỔNG GIÁ TRỊ HỢP ĐỒNG THƯƠNG MẠI',
            spec: 'Tạm ứng đặt cọc 50%: 186.246.000đ',
            quantity: 'Trọn gói FOB',
            unitPrice: 'Đã gồm VAT 8%',
            subtotal: '372.492.000đ'
          }
        ],
        totalAmountFormatted: '372.492.000đ (Đặt cọc 50%: 186.246.000đ)',
        formalDocument: buildFormalContractDocument(
          prompt,
          '372.492.000đ (Đặt cọc 50%: 186.246.000đ)'
        ),
        recommendation:
          'Dekisugi kiến nghị Master Agent Doraemon phê duyệt dự thảo hợp đồng kinh tế và báo giá kỹ thuật để ký kết chính thức với khách hàng.',
        executionTimeSec: 1.2,
        sourceMode: 'sop-engine'
      };
    }

    case 'customer_service':
    case 'sales_quoting': {
      const lowerPrompt = prompt.toLowerCase();
      const is8DComplaint =
        lowerPrompt.includes('khiếu nại') ||
        lowerPrompt.includes('lỗi') ||
        lowerPrompt.includes('8d') ||
        lowerPrompt.includes('bảo hành') ||
        lowerPrompt.includes('sự cố');

      if (is8DComplaint) {
        return {
          headline: 'Báo Cáo Tiếp Nhận Khiếu Nại & Xử Lý Sự Cố Chất Lượng 8D — Shizuka (Xuka)',
          summary: `Shizuka đã tiếp nhận khiếu nại khách hàng cho nhiệm vụ "${prompt}", phát hành thư phúc đáp trong 2 giờ và lập Báo cáo 8D phân tích nguyên nhân gốc rễ theo quy chuẩn ${sopCodes.join(', ') || 'SOP-CSKH-2026-01'}.`,
          scopeCheckPassed: true,
          scopeExplanation: validation.reason,
          appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-CSKH-2026-01'],
          spatialActionTaken:
            'Shizuka đã gửi thư phúc đáp cho khách hàng tại bàn CSKH (2.2, 6.2), phối hợp QC kho cô lập lô hàng nghi vấn và chuyển báo cáo 8D cho Ban Giám Đốc.',
          keyFindings: [
            'Cam kết phản hồi (SLA 2h): Đã gửi thư xác nhận chính thức và số tiếp nhận sự cố (Ticket ID: CSKH-8D-202610).',
            'Phân tích 5 Whys: Lỗi phát sinh do dao cắt/khuôn dập bị mài mòn vượt chu kỳ bảo dưỡng dự phòng mà chưa được thay thế kịp thời.',
            'Hành động khắc phục (CAPA): Thu hồi và bù lô hàng mới 100% đạt chuẩn trong 24h; cập nhật quy trình bảo dưỡng TPM vào sổ tay sản xuất.',
            customRulesList[0] ? `Quy chuẩn áp dụng: "${customRulesList[0]}"` : ''
          ].filter(Boolean),
          calculationRows: [
            {
              item: '1. Sản phẩm khiếu nại cần thu hồi bù mới',
              spec: 'Bù 100% đạt chuẩn kiểm định QC',
              quantity: '500 SP',
              unitPrice: 'Miễn phí bồi thường',
              subtotal: '0đ'
            },
            {
              item: '2. Chi phí kiểm định & vận chuyển hỏa tốc',
              spec: 'Giao tận kho khách hàng trong 24h',
              quantity: '1 Chuyến',
              unitPrice: 'Bên bán chịu',
              subtotal: '1.200.000đ'
            },
            {
              item: '3. Phiếu giảm giá tri ân đơn hàng tiếp theo',
              spec: 'Giảm 5% cho PO tiếp theo',
              quantity: '01 Voucher',
              unitPrice: 'Chính sách CSKH',
              subtotal: 'Áp dụng PO sau'
            }
          ],
          totalAmountFormatted: 'Xử lý thành công trong cam kết SLA 2 giờ — Bù hàng trong 24h',
          recommendation:
            'Shizuka đề xuất Ban Giám Đốc ký duyệt Báo cáo 8D gửi khách hàng và giao Bác Kaminari xuất bù 500 SP từ kho an toàn.',
          executionTimeSec: 1.1,
          sourceMode: 'sop-engine'
        };
      }

      // 1. Check if user prompt is asking for Offset / Digital products from the print-quote engine
      const realQuoteReq = parsePrintingPrompt(prompt);
      if (realQuoteReq) {
        const realQuote = executePrintQuote(realQuoteReq);
        const subtotalVnd = realQuote.totalCost;
        const vatVnd = Math.round(subtotalVnd * 0.08);
        const grandTotalVnd = subtotalVnd + vatVnd;
        const deposit50Vnd = Math.round(grandTotalVnd * 0.5);

        return {
          headline: `Báo Giá Tự Động ${realQuoteReq.productNameVi}: ${formatVnd(grandTotalVnd)} (ĐG: ${formatVnd(realQuote.costPerUnit)}/SP) — Shizuka (Xuka)`,
          summary: `Shizuka báo cáo kết quả bóc tách từ Hệ thống Báo Giá In Ấn Tự Động (baogiainan.88qm.top) cho nhiệm vụ "${prompt}": Tổng cộng ${formatVnd(grandTotalVnd)} (Khách đặt cọc 50%: ${formatVnd(deposit50Vnd)}). Sử dụng ${realQuote.details.machine}, ${realQuote.details.paperName}, ${realQuote.details.printStyle}.`,
          scopeCheckPassed: true,
          scopeExplanation: validation.reason,
          appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-BG-2026-01', 'PRINT-QUOTE-AUTO'],
          spatialActionTaken: `Shizuka đã bóc tách định mức bài in trên máy ${realQuote.details.machine} và kết nối hệ thống báo giá đám mây baogiainan.88qm.top.`,
          keyFindings: [
            `Quy cách: ${realQuoteReq.productNameVi}, Số lượng: ${realQuoteReq.quantity.toLocaleString('vi-VN')} SP.`,
            `Máy in tối ưu: ${realQuote.details.machine} (${realQuote.details.printStyle}, ${realQuote.details.grossSheets} tờ in, bù hao ${realQuote.details.wasteSheets} tờ).`,
            `Vật tư & Giấy: ${realQuote.details.paperName} — Tiền giấy: ${formatVnd(realQuote.details.paperCost || 0)}.`,
            `Công in: ${formatVnd(realQuote.details.printingCost || 0)}, Gia công sau in: ${formatVnd(realQuote.details.finishingCost || 0)}.`,
            `Lợi nhuận định mức ${realQuote.profitMarginPercent}%: ${formatVnd(realQuote.profitVnd)}.`,
            `TỔNG THANH TOÁN (Gồm VAT 8%): ${formatVnd(grandTotalVnd)} (Đặt cọc 50%: ${formatVnd(deposit50Vnd)}).`,
            `🌐 Hệ thống đám mây: ${CLOUD_PRINT_QUOTE_URL}`
          ],
          calculationRows: realQuote.calculationRows,
          totalAmountFormatted: `${formatVnd(grandTotalVnd)} (Đặt cọc 50%: ${formatVnd(deposit50Vnd)})`,
          formalDocument: lowerPrompt.includes('hợp đồng')
            ? buildFormalContractDocument(prompt, `${formatVnd(grandTotalVnd)} (Đặt cọc 50%: ${formatVnd(deposit50Vnd)})`)
            : buildFormalDeliveryNoteDocument(prompt, `${formatVnd(grandTotalVnd)}`),
          recommendation: `Đã tính toán chi tiết theo thuật toán công thức chuẩn của baogiainan.88qm.top. Chuyển Suneo (Kế toán) ghi nhận báo giá và Nobita (Kỹ thuật) kiểm tra bình trang trước khi ra kẽm.`,
          executionTimeSec: 0.9,
          sourceMode: 'sop-engine'
        };
      }

      // 2. Default to standard wide-format (Hiflex, Decal PP, Mica, Standee)
      const cleanedForNumbers = prompt.replace(/m\s*[2²]/gi, ' m_sq ');
      const numMatches =
        cleanedForNumbers
          .match(/\d+(?:[.,]\d+)?/g)
          ?.map((n) => Number(n.replace(',', '.'))) || [];

      const explicitSqmMatch = prompt.match(
        /(\d+(?:[.,]\d+)?)\s*(?:m2|m²|mét\s*vuông|m\s*vuông|m\b)/i
      );
      const sqm = explicitSqmMatch
        ? Number(explicitSqmMatch[1].replace(',', '.'))
        : numMatches.find((n) => n >= 1 && n <= 10000) || 80;

      const hasStandee = lowerPrompt.includes('standee') || lowerPrompt.includes('chân cuốn');
      const standeeMatch = prompt.match(/(\d+)\s*(?:bộ|cái|chiếc|chân)?\s*(?:standee|chân\s*cuốn)/i);
      const standeeCount = hasStandee
        ? standeeMatch
          ? Number(standeeMatch[1])
          : 10
        : 0;

      const isMica = lowerPrompt.includes('mica') || lowerPrompt.includes('led');
      const isDecal = lowerPrompt.includes('decal') || lowerPrompt.includes('pp');

      const materialType: PrintQuoteInput['materialType'] = isMica
        ? 'mica_led'
        : isDecal
        ? 'decal_pp'
        : 'hiflex';

      const quote = calculatePrintQuote({
        materialType,
        widthMeters: isMica ? 4 : 8,
        heightMeters: isMica ? sqm / 4 : sqm / 8,
        quantity: 1,
        finishingOption: isMica ? 'alu_frame' : isDecal ? 'matte_lamination' : 'eyelet_glue',
        rushOrder: lowerPrompt.includes('gấp') || lowerPrompt.includes('nhanh')
      });

      const standeeTotal = standeeCount * 260000;
      const combinedSubtotal = quote.subtotalVnd + standeeTotal;
      const combinedVat = Math.round(combinedSubtotal * 0.08);
      const combinedGrandTotal = combinedSubtotal + combinedVat;
      const deposit50Vnd = Math.round(combinedGrandTotal * 0.5);

      const baseCost = quote.baseCost || (quote.totalAreaSqm * quote.baseUnitRateVnd);
      const grossBeforeDiscount = baseCost + quote.finishingCostVnd;
      const discountAmount = Math.round((grossBeforeDiscount * quote.discountPercent) / 100);

      return {
        headline: `Kết Quả Báo Giá ${quote.totalAreaSqm}m2: ${formatVnd(combinedGrandTotal)} — Shizuka (Xuka)`,
        summary: `Shizuka báo cáo kết quả: Tổng cộng ${formatVnd(combinedGrandTotal)} (Khách đặt cọc 50%: ${formatVnd(deposit50Vnd)}). Đã lập Hợp đồng mua bán, Phiếu mua bán và Phiếu giao hàng 02 liên.`,
        scopeCheckPassed: true,
        scopeExplanation: validation.reason,
        appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-BG-2026-01'],
        spatialActionTaken: 'Shizuka đã tính báo giá tại bàn CSKH và chuyển kết quả qua Master Agent Doraemon trình Giám đốc.',
        keyFindings: [
          `Tiền in & gia công (${quote.totalAreaSqm}m2): ${formatVnd(quote.subtotalVnd)}.`,
          `Thuế GTGT VAT 8%: ${formatVnd(combinedVat)}.`,
          `TỔNG THANH TOÁN: ${formatVnd(combinedGrandTotal)} (Đặt cọc 50%: ${formatVnd(deposit50Vnd)}).`
        ],
        calculationRows: [
          {
            item: `1. In ấn theo quy cách yêu cầu (${quote.totalAreaSqm}m2)`,
            spec: 'Đạt chuẩn màu xưởng PrintAd 720DPI',
            quantity: `${quote.totalAreaSqm} m2`,
            unitPrice: `${formatVnd(quote.baseUnitRateVnd)}/m2`,
            subtotal: formatVnd(baseCost)
          },
          {
            item: '2. Gia công gấp mép xỏ que / hoàn thiện',
            spec: 'Gia công theo SOP-BG-2026-01',
            quantity: `${quote.totalAreaSqm} m2`,
            unitPrice: '6.000đ/m2',
            subtotal: formatVnd(quote.finishingCostVnd)
          },
          {
            item: '3. Chiết khấu sản lượng (>50m2)',
            spec: `Chiết khấu ${quote.discountPercent}% trực tiếp`,
            quantity: `-${quote.discountPercent}%`,
            unitPrice: formatVnd(grossBeforeDiscount),
            subtotal: `-${formatVnd(discountAmount)}`
          },
          {
            item: '4. Thuế GTGT (VAT 8%)',
            spec: 'Hóa đơn GTGT điện tử',
            quantity: '8% VAT',
            unitPrice: formatVnd(quote.subtotalVnd),
            subtotal: formatVnd(quote.vatVnd)
          },
          {
            item: '5. TỔNG CỘNG THANH TOÁN',
            spec: `Đặt cọc 50%: ${formatVnd(deposit50Vnd)}`,
            quantity: 'Trọn gói',
            unitPrice: 'Đã gồm VAT 8%',
            subtotal: formatVnd(combinedGrandTotal)
          }
        ],
        totalAmountFormatted: `${formatVnd(combinedGrandTotal)} (Đặt cọc 50%: ${formatVnd(deposit50Vnd)})`,
        formalDocument: lowerPrompt.includes('hợp đồng')
          ? buildFormalContractDocument(prompt, `${formatVnd(combinedGrandTotal)} (Đặt cọc 50%: ${formatVnd(deposit50Vnd)})`)
          : buildFormalDeliveryNoteDocument(prompt, `${formatVnd(combinedGrandTotal)}`),
        recommendation: lowerPrompt.includes('hợp đồng')
          ? 'Đã soạn thảo sẵn Bản Hợp Đồng Kinh Tế chuẩn ký kết. Chuyển thông tin cho Suneo thu tiền cọc 50%.'
          : 'Đã xuất Phiếu Giao Hàng Kiêm Biên Bản Bàn Giao 02 liên. Chuyển Bác Kaminari (Kho) xuất kho cho đội vận chuyển.',
        executionTimeSec: 1.0,
        sourceMode: 'sop-engine'
      };
    }

    case 'accounting': {
      return {
        headline: 'Báo Cáo Kế Toán Chi Phí Standard Costing & Công Nợ — Suneo (Xêko)',
        summary: `Suneo đã tính giá thành định mức, đối chiếu số liệu kho và rà soát công nợ theo ${sopCodes.join(', ') || 'SOP-KT-2026-01'} cho nhiệm vụ "${prompt}". Đã kích hoạt skill an-thong-tin-nhay-cam để bảo vệ số liệu giá vốn.`,
        scopeCheckPassed: true,
        scopeExplanation: validation.reason,
        appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-KT-2026-01'],
        spatialActionTaken:
          'Suneo đã tra cứu số cái và thẻ kho WMS tại phân khu Kế Toán (5.2, -3.2), sau đó vào Phòng họp kính báo cáo Doraemon.',
        keyFindings: [
          'Tỷ lệ chi phí NVL trực tiếp (621): Đạt 58.4% trên doanh thu, nằm trong giới hạn an toàn quy định (<= 62%).',
          'Đối chiếu kho - sổ cái: Khớp 99.8% số liệu với thẻ kho của Bác Kaminari; tỷ lệ hao hụt thực tế 0.18% đạt chuẩn SOP.',
          'Bảo mật PII & Giá vốn: Đã che toàn bộ số tài khoản ngân hàng nội bộ và giá vốn phôi liệu trước khi chia sẻ văn bản.',
          customRulesList[0] ? `Quy chuẩn áp dụng: "${customRulesList[0]}"` : ''
        ].filter(Boolean),
        calculationRows: [
          {
            item: 'Chi phí Nguyên vật liệu trực tiếp (TK 621)',
            spec: 'Phôi thép, bạt in, hạt nhựa, mực UV',
            quantity: 'Kỳ kế toán',
            unitPrice: 'Tỷ lệ 58.4%',
            subtotal: '218.400.000đ'
          },
          {
            item: 'Chi phí Nhân công trực tiếp (TK 622)',
            spec: 'Lương 3 ca công nhân sản xuất',
            quantity: '3 Ca / 30 ngày',
            unitPrice: 'Theo định mức',
            subtotal: '64.800.000đ'
          },
          {
            item: 'Chi phí Sản xuất chung (TK 627)',
            spec: 'Khấu hao máy dập/in, điện nước xưởng',
            quantity: 'Định mức tháng',
            unitPrice: 'Phân bổ theo ca',
            subtotal: '38.200.000đ'
          }
        ],
        totalAmountFormatted: 'Dòng tiền thuần khả dụng: +159.700.000đ · Tỷ lệ NVL 58.4% (<=62%)',
        recommendation: 'Suneo đề xuất Doraemon trình Tổng Giám Đốc phê duyệt thanh toán tiền vật tư đợt 1 cho nhà cung ứng.',
        executionTimeSec: 1.1,
        sourceMode: 'sop-engine'
      };
    }

    case 'human_resources': {
      return {
        headline: 'Báo Cáo Kế Hoạch Nhân Sự, Tuyển Dụng & Quản Trị 3 Ca Kíp — Dorami (Đô-rê-mi)',
        summary: `Dorami đã xây dựng hồ sơ tuyển dụng JD, thiết lập ma trận chấm điểm CV và lập phương án bố trí 3 ca làm việc theo quy chuẩn ${sopCodes.join(', ') || 'SOP-NS-2026-01'} cho nhiệm vụ "${prompt}".`,
        scopeCheckPassed: true,
        scopeExplanation: validation.reason,
        appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-NS-2026-01'],
        spatialActionTaken:
          'Dorami đã hoàn tất kế hoạch nhân sự tại Phòng họp (-8.2, -5.5) và gửi báo cáo phân ca lên Master Agent Doraemon.',
        keyFindings: [
          'Bản mô tả công việc (JD): Đã xây dựng khung năng lực cho vị trí Kỹ sư CNC và Thợ in, nêu rõ tiêu chí kỹ thuật và kỷ luật 5S.',
          'Phân bổ 3 ca kíp: Ca 1 (06h-14h), Ca 2 (14h-22h), Ca 3 (22h-06h); bố trí mỗi ca 2 kỹ sư nòng cốt + 1 phụ trách an toàn.',
          'Kiểm soát giờ làm thêm (OT): 100% công nhân được giám sát không vượt quá trần 40 giờ OT/tháng theo Bộ luật Lao động 2019.',
          customRulesList[0] ? `Quy chuẩn áp dụng: "${customRulesList[0]}"` : ''
        ].filter(Boolean),
        calculationRows: [
          {
            item: 'Định biên nhân sự 3 ca sản xuất',
            spec: 'Ca 1: 18 người · Ca 2: 14 người · Ca 3: 10 người',
            quantity: '3 Ca kíp',
            unitPrice: '42 công nhân',
            subtotal: 'Đủ 100% công suất'
          },
          {
            item: 'Chỉ tiêu tuyển dụng bổ sung tháng này',
            spec: 'Kỹ sư CNC, thợ khuôn & nhân viên QC',
            quantity: '06 Ứng viên',
            unitPrice: 'Ma trận điểm >= 80',
            subtotal: 'Đang sàng lọc'
          },
          {
            item: 'Quỹ lương tăng ca (OT) dự kiến',
            spec: 'Tuân thủ trần <= 40h/tháng/người',
            quantity: 'Tối đa 32h/người',
            unitPrice: 'Hệ số 1.5x - 2.0x',
            subtotal: '24.500.000đ'
          }
        ],
        totalAmountFormatted: '100% ca kíp được phủ kín · Giờ OT trung bình 28h/người (<=40h/tháng)',
        recommendation:
          'Dorami đề xuất mở đăng tin tuyển dụng 6 chỉ tiêu trên các kênh kỹ thuật và phối hợp Thầy Giáo đào tạo 5S cho công nhân mới.',
        executionTimeSec: 1.1,
        sourceMode: 'sop-engine'
      };
    }

    case 'warehouse_supply': {
      return {
        headline: 'Báo Cáo Đặt Hàng PO Vật Tư, Mức Dự Trữ Min-Max & Kiểm Kê FIFO — Bác Kaminari',
        summary: `Bác Kaminari đã rà soát mức tồn kho an toàn, lập đơn hàng Purchase Order (PO) và kiểm tra hạn mức Min-Max theo quy chuẩn ${sopCodes.join(', ') || 'SOP-KHO-2026-01'} cho nhiệm vụ "${prompt}".`,
        scopeCheckPassed: true,
        scopeExplanation: validation.reason,
        appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-KHO-2026-01'],
        spatialActionTaken:
          'Bác Kaminari đã dùng bảng kiểm kê rà soát kệ kho vật tư (-6.5, -3.8) và gửi biên bản đối soát cho Doraemon.',
        keyFindings: [
          'Điểm đặt hàng lại (ROP): Tồn kho thép cuộn và bạt in chạm ngưỡng tối thiểu (Min), Bác Kaminari đã kích hoạt lệnh PO bù đắp.',
          'Nguyên tắc xuất kho FIFO: 100% cuộn vật tư được gắn tem Lot No., kiểm soát ngày nhập để xuất dùng đúng thứ tự.',
          'Tỷ lệ hao hụt kiểm kê: Chênh lệch giữa số lượng thực tế và phần mềm chỉ 0.12% (chuẩn cho phép <= 0.2%).',
          customRulesList[0] ? `Quy chuẩn áp dụng: "${customRulesList[0]}"` : ''
        ].filter(Boolean),
        calculationRows: [
          {
            item: 'Đơn hàng mua Purchase Order (PO) mới',
            spec: 'Phôi thép tấm SPCC 1.2mm & bạt in cao cấp',
            quantity: 'Lô PO-2026-10',
            unitPrice: 'Thời gian về 5 ngày',
            subtotal: '94.500.000đ'
          },
          {
            item: 'Mức dự trữ an toàn tồn kho (Safety Stock)',
            spec: 'Đủ sản xuất liên tục 15 ngày làm việc',
            quantity: 'Mức Min-Max',
            unitPrice: 'Kiểm soát 5S',
            subtotal: 'Đạt an toàn'
          },
          {
            item: 'Kiểm kê định kỳ & Xử lý phế liệu',
            spec: 'Tỷ lệ hao hụt thực tế 0.12%',
            quantity: 'Toàn kho',
            unitPrice: 'Chuẩn FIFO',
            subtotal: 'Khớp 99.88%'
          }
        ],
        totalAmountFormatted: 'Tồn kho an toàn 15 ngày sản xuất · Lô PO 94.500.000đ sẵn sàng phát hành',
        recommendation:
          'Bác Kaminari đề nghị Doraemon phê duyệt đơn PO để chuyển tiền đặt cọc vật tư và nhắc xưởng chuẩn bị vị trí bốc dỡ.',
        executionTimeSec: 1.2,
        sourceMode: 'sop-engine'
      };
    }

    case 'administration_ehs': {
      return {
        headline: 'Báo Cáo An Toàn Lao Động EHS, Cấp Phát BHLĐ & Hậu Cần — Thầy Giáo (Sensei)',
        summary: `Thầy Giáo Chủ Nhiệm đã lập quy trình cấp phát trang bị BHLĐ, kiểm tra an toàn 5S, hệ thống PCCC và kế hoạch đón đoàn audit theo ${sopCodes.join(', ') || 'SOP-HC-2026-01'} cho nhiệm vụ "${prompt}".`,
        scopeCheckPassed: true,
        scopeExplanation: validation.reason,
        appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-HC-2026-01'],
        spatialActionTaken:
          'Thầy Giáo đã rà soát trang thiết bị PCCC, nhà ăn công nghiệp (-10.5, -4.5) và trình biên bản an toàn lên Doraemon.',
        keyFindings: [
          'Trang bị Bảo hộ Lao động (BHLĐ): 100% công nhân 3 ca đã được cấp phát giày mũi sắt, kính bảo hộ và nút tai chống ồn.',
          'An toàn PCCC & 5S: Hệ thống cảnh báo khói, bình chữa cháy CO2 và lối thoát hiểm đạt 100% tiêu chuẩn sẵn sàng ứng phó.',
          'Đón tiếp kiểm toán FDI: Đã chuẩn bị đầy đủ hồ sơ pháp lý môi trường, báo cáo quan trắc định kỳ và quy trình đón tiếp chu đáo.',
          customRulesList[0] ? `Quy chuẩn áp dụng: "${customRulesList[0]}"` : ''
        ].filter(Boolean),
        calculationRows: [
          {
            item: 'Cấp phát BHLĐ định kỳ cho 3 ca sản xuất',
            spec: 'Giày mũi sắt, kính, găng tay da, nút tai',
            quantity: '42 Bộ BHLĐ',
            unitPrice: 'Đạt chuẩn TCVN',
            subtotal: '12.600.000đ'
          },
          {
            item: 'Bảo trì hệ thống PCCC & Diễn tập thoát hiểm',
            spec: 'Kiểm định bình CO2 & chuông báo động',
            quantity: 'Toàn nhà máy',
            unitPrice: 'Định kỳ Quý 4',
            subtotal: '4.800.000đ'
          },
          {
            item: 'Hậu cần suất ăn công nghiệp & trạm y tế',
            spec: 'Lưu mẫu thực phẩm 24h chuẩn VSATTP',
            quantity: '120 Suất/ngày',
            unitPrice: 'Nhà ăn sạch 5S',
            subtotal: 'Hoàn thành tốt'
          }
        ],
        totalAmountFormatted: '100% đạt chuẩn an toàn EHS & PCCC — Sẵn sàng đón đoàn kiểm toán FDI',
        recommendation:
          'Thầy Giáo đề xuất Ban Giám Đốc ký thông báo nhắc nhở toàn thể cán bộ công nhân viên duy trì nề nếp 5S trước ngày đón đoàn kiểm toán.',
        executionTimeSec: 1.1,
        sourceMode: 'sop-engine'
      };
    }

    case 'design_tech': {
      return {
        headline: 'Báo Cáo Kiểm Tra File Preflight CMYK & In Thử Mẫu Proof — Nobita',
        summary: `Nobita đã rà soát thông số kỹ thuật và chỉnh sửa file cho nhiệm vụ "${prompt}" theo đúng quy chuẩn ${sopCodes.join(', ') || 'SOP-TK-2026-01'}, in test proof màu chuẩn trước khi chuyển lệnh in xưởng.`,
        scopeCheckPassed: true,
        scopeExplanation: validation.reason,
        appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-TK-2026-01'],
        spatialActionTaken:
          'Nobita đã chỉnh sửa tách màu CMYK tại Workstation Đồ họa (-7.2, 1.8) và in thử màu proof tại Trạm máy in trung tâm.',
        keyFindings: [
          'Chuẩn hóa 100% CMYK: Đã chuyển toàn bộ ảnh bitmap và vector sang hệ màu CMYK chuẩn in ISO Coated v2, không bị lệch màu.',
          'Bù tràn lề (Bleed 3mm): Đã chừa biên cắt 3mm mỗi cạnh và tạo layer bế khuôn riêng biệt cho ấn phẩm tem nhãn/decal.',
          'Độ phân giải & Font chữ: Convert toàn bộ font chữ sang Outlines, độ phân giải ảnh đạt chuẩn 300 DPI.',
          customRulesList[0] ? `Quy chuẩn áp dụng: "${customRulesList[0]}"` : ''
        ].filter(Boolean),
        calculationRows: [
          {
            item: 'Kiểm tra hệ màu & ICC Profile',
            spec: 'ISO Coated v2 (100% CMYK)',
            quantity: 'Toàn bộ file',
            unitPrice: 'Chữ đen K=100%',
            subtotal: 'Đạt chuẩn in'
          },
          {
            item: 'Tràn lề (Bleed) & Ốc chồng màu',
            spec: 'Bleed 3mm / Margin an toàn 5mm',
            quantity: '4 Cạnh cắt',
            unitPrice: 'Có ốc canh mép',
            subtotal: 'Đạt chuẩn in'
          },
          {
            item: 'In thử mẫu màu Proof CMYK',
            spec: 'Bản in test trên máy in phun khổ lớn',
            quantity: '01 Bản test',
            unitPrice: 'Delta-E < 1.2',
            subtotal: 'Màu chuẩn 100%'
          }
        ],
        totalAmountFormatted: '0 lỗi kỹ thuật tồn đọng — Nobita đã xuất bản in Proof CMYK thành công',
        recommendation: 'Bản in thử proof đã đạt chuẩn màu, sẵn sàng chuyển lệnh xuống xưởng in hàng loạt.',
        executionTimeSec: 1.2,
        sourceMode: 'sop-engine'
      };
    }

    case 'marketing': {
      return {
        headline: 'Báo Cáo Marketing Công Nghiệp, Company Profile & Đối Thủ — Chaian (Chaien)',
        summary: `Chaian đã thực hiện phân tích thị trường, đóng gói Company Profile và khảo sát đối thủ cho nhiệm vụ "${prompt}" theo quy chuẩn ${sopCodes.join(', ') || 'SOP-MKT-2026-01'}.`,
        scopeCheckPassed: true,
        scopeExplanation: validation.reason,
        appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-MKT-2026-01'],
        spatialActionTaken:
          'Chaian đã tổng hợp dữ liệu tại phân khu Marketing (5.5, 4.5) và di chuyển vào Phòng họp báo cáo chiến lược với Doraemon.',
        keyFindings: [
          'Hồ sơ năng lực nhà máy (Company Profile): Đã hoàn thiện slide giới thiệu hệ thống máy móc CNC và chứng chỉ ISO cho đối tác FDI.',
          'Khảo sát đối thủ cạnh tranh: Các đối thủ phản hồi chậm (4-6h), trong khi PrintAd cam kết báo giá trong 15 phút và in proof miễn phí.',
          'Gói giải pháp đề xuất: Tung gói Combo POSM Khai Trương giúp tăng 28% giá trị đơn hàng trung bình (AOV).',
          customRulesList[0] ? `Quy chuẩn áp dụng: "${customRulesList[0]}"` : ''
        ].filter(Boolean),
        calculationRows: [
          {
            item: 'Company Profile & Slide thuyết trình FDI',
            spec: 'Chuẩn nhận diện thương hiệu công nghiệp',
            quantity: '01 Bộ Profile',
            unitPrice: 'Song ngữ Anh - Việt',
            subtotal: 'Hoàn tất'
          },
          {
            item: 'Khảo sát năng lực đối thủ cạnh tranh',
            spec: '3 Đối thủ trực tiếp trong khu vực',
            quantity: 'Báo cáo ma trận',
            unitPrice: 'Lợi thế: Tốc độ & Proof',
            subtotal: 'Ưu thế vượt trội'
          },
          {
            item: 'Gói Combo POSM Sự kiện Khai trương',
            spec: 'Biển hiệu + 4 Standee + 1.000 Tờ rơi',
            quantity: 'Gói B2B',
            unitPrice: 'Tăng 28% AOV',
            subtotal: '4.850.000đ/gói'
          }
        ],
        totalAmountFormatted: 'Dự kiến tăng +34% tỷ lệ chốt đơn B2B và +28% giá trị đơn hàng',
        recommendation:
          'Chaian đề nghị Doraemon phê duyệt bộ Company Profile để Dekisugi gửi kèm hồ sơ báo giá cho khách hàng FDI.',
        executionTimeSec: 1.2,
        sourceMode: 'sop-engine'
      };
    }

    case 'board_executive':
    case 'hr_ops':
    default: {
      return {
        headline: 'Báo Cáo Tóm Tắt Điều Hành 1 Trang & Ma Trận Phối Hợp — Doraemon',
        summary: `Master Agent Doraemon đã phân tích chỉ thị "${prompt}" của Giám đốc, tổng hợp số liệu từ 8 Sub-Agents phòng ban (/bgd, /kd, /cskh, /kt, /mkt, /ns, /kho, /hc) và lập phương án điều phối theo ${sopCodes.join(', ') || 'SOP-BGD-2026-01'}.`,
        scopeCheckPassed: true,
        scopeExplanation: validation.reason,
        appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-BGD-2026-01'],
        spatialActionTaken:
          'Doraemon đã điều phối từ Trung tâm chỉ huy (-3.2, -2.2) và Phòng họp vách kính (-10.5, -6.2), tổng hợp báo cáo điều hành 1 trang trình Giám đốc.',
        keyFindings: [
          'Kinh Doanh (Dekisugi) & CSKH (Shizuka): Đã tiếp nhận các đơn hàng RFQ B2B, phản hồi báo giá dưới 15 phút và xử lý sự cố chất lượng 8D đúng SLA 2h.',
          'Kế Toán (Suneo) & Kho (Bác Kaminari): Suneo kiểm soát tỷ lệ chi phí NVL ở mức 58.4% (<=62%); Bác Kaminari đảm bảo tồn kho an toàn 15 ngày theo chuẩn FIFO.',
          'Nhân Sự (Dorami), Hành Chính (Thầy Giáo), Kỹ Thuật (Nobita) & Marketing (Chaian): Đảm bảo 100% 3 ca sản xuất, an toàn PCCC 5S và xuất file in proof chuẩn màu.',
          customRulesList[0] ? `Quy chuẩn áp dụng: "${customRulesList[0]}"` : ''
        ].filter(Boolean),
        calculationRows: [
          {
            item: 'Kinh Doanh (/kd - Dekisugi) & CSKH (/cskh - Shizuka)',
            spec: 'RFQ B2B & Giải quyết khiếu nại 8D',
            quantity: 'Toàn bộ đơn hàng',
            unitPrice: 'SLA < 2 Giờ',
            subtotal: 'Hoàn thành tốt'
          },
          {
            item: 'Kế Toán (/kt - Suneo) & Kho (/kho - Kaminari)',
            spec: 'Định mức 621, 622, 627 & Tồn kho FIFO',
            quantity: 'Toàn nhà máy',
            unitPrice: 'Hao hụt 0.18%',
            subtotal: 'Dòng tiền +159.7tr'
          },
          {
            item: 'Nhân Sự (/ns - Dorami) & Hành Chính (/hc - Sensei)',
            spec: '3 Ca kíp, BHLĐ & Kiểm tra PCCC',
            quantity: '42 Công nhân',
            unitPrice: 'OT < 40h/tháng',
            subtotal: '100% An toàn 5S'
          }
        ],
        totalAmountFormatted: 'Toàn hệ thống 8 Phòng Ban vận hành đồng bộ 100% SOP — 0 lỗi chậm trễ',
        recommendation:
          'Tư vấn của Doraemon: Tổng Giám Đốc duyệt phê chuẩn đơn PO mua vật tư của Bác Kaminari, phát hành báo giá FOB của Dekisugi và ban hành chỉ thị 5S của Thầy Giáo.',
        executionTimeSec: 1.3,
        sourceMode: 'sop-engine'
      };
    }
  }
}

/**
 * Analyzes a general CEO directive through Master Agent Doraemon
 * and automatically dispatches it to the exact Doraemon team specialist responsible.
 */
export function dispatchCeoDirective(
  prompt: string,
  allAgents: AgentProfile[],
  allSops: SopDocument[]
): CeoDispatchResult {
  const normalized = prompt.trim().toLowerCase();
  const coordinator =
    allAgents.find((a) => a.departmentId === 'board_executive' || a.departmentId === 'hr_ops') || allAgents[0];

  // 1. Direct slash command routing
  const commandMap: Record<string, string> = {
    '/bgd': 'agent-hr',
    '/kd': 'agent-business',
    '/mkt': 'agent-marketing',
    '/cskh': 'agent-sales',
    '/kt': 'agent-accounting',
    '/ns': 'agent-hr-staff',
    '/kho': 'agent-warehouse',
    '/hc': 'agent-admin',
    '/tk': 'agent-design',
    '/cty': 'agent-hr'
  };

  for (const [cmd, agentId] of Object.entries(commandMap)) {
    if (normalized.startsWith(cmd) || normalized.includes(cmd)) {
      const targetAgent = allAgents.find((a) => a.id === agentId);
      if (targetAgent) {
        const matchedSops = allSops.filter(
          (s) => (s.departmentId === targetAgent.departmentId ||
            (targetAgent.departmentId === 'board_executive' && s.departmentId === 'hr_ops') ||
            (targetAgent.departmentId === 'customer_service' && s.departmentId === 'sales_quoting') ||
            (targetAgent.departmentId === 'sales_b2b' && s.departmentId === 'sales_quoting')) &&
            s.isActive
        );
        const previewReport = generateLocalSopGroundedReport(targetAgent, prompt, allAgents, allSops);

        const dispatchInfo: CoordinatorDispatchInfo = {
          isCeoDirective: true,
          coordinatorName: coordinator.name,
          coordinatorRole: coordinator.roleTitle,
          assignedAgentId: targetAgent.id,
          assignedAgentName: targetAgent.name,
          assignedDepartmentLabel: targetAgent.departmentLabel,
          routingReason: `Master Agent Doraemon tiếp nhận lệnh "${cmd}" từ Giám đốc, lập tức kích hoạt Sub-Agent ${targetAgent.name} (${targetAgent.departmentLabel}) thực thi quy trình chuẩn hóa.`,
          directorSummaryFromDoraemon: `Báo cáo Giám đốc: ${targetAgent.name} đã hoàn tất tác vụ theo lệnh "${cmd}" → ${previewReport.totalAmountFormatted}. Doraemon đã nghiệm thu và trình Giám đốc phê chuẩn.`,
          supportingDepartments: allAgents
            .filter((a) => a.id !== targetAgent.id && a.id !== coordinator.id)
            .slice(0, 3)
            .map((a) => `${a.name} (${a.departmentLabel})`)
        };

        return {
          coordinator,
          assignedAgent: targetAgent,
          targetZoneId: targetAgent.zoneId,
          dispatchInfo,
          matchedSops
        };
      }
    }
  }

  // 2. Keyword & skill scoring
  const scores = new Map<AgentProfile, number>();

  for (const ag of allAgents) {
    let score = 0;
    if (ag.skills) {
      for (const sk of ag.skills) {
        if (normalized.includes(sk.toLowerCase())) {
          score += 6;
        }
      }
    }
    for (const kw of ag.allowedKeywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
        // Domain intent boosts for sales vs b2b
    if (ag.id === 'agent-sales' || ag.characterKey === 'shizuka') {
      if (normalized.includes('báo giá') || normalized.includes('bạt') || normalized.includes('hiflex') || normalized.includes('tờ rơi') || normalized.includes('phiếu giao hàng')) {
        score += 15;
      }
    }
    if (ag.id === 'agent-sales-b2b' || ag.characterKey === 'dekisugi') {
      if (normalized.includes('b2b') || normalized.includes('fdi') || normalized.includes('fob') || normalized.includes('incoterms') || normalized.includes('thương mại quốc tế')) {
        score += 15;
      }
    }
    scores.set(ag, score);
  }

  const ranked = [...allAgents].sort(
    (a, b) => (scores.get(b) || 0) - (scores.get(a) || 0)
  );

  const topScore = scores.get(ranked[0]) || 0;
  const assignedAgent =
    topScore > 0
      ? ranked[0]
      : allAgents.find((a) => a.id === 'agent-sales') || ranked[0];

  const supportingDepartments = ranked
    .slice(1)
    .filter((ag) => (scores.get(ag) || 0) > 0)
    .map((ag) => `${ag.name} (${ag.departmentLabel})`);

  const matchedSops = allSops.filter(
    (s) => (s.departmentId === assignedAgent.departmentId ||
      (assignedAgent.departmentId === 'board_executive' && s.departmentId === 'hr_ops') ||
      (assignedAgent.departmentId === 'customer_service' && s.departmentId === 'sales_quoting') ||
      (assignedAgent.departmentId === 'sales_b2b' && s.departmentId === 'sales_quoting')) &&
      s.isActive
  );
  const sopCodeList =
    matchedSops.map((s) => s.code).join(', ') || 'SOP-CHUYÊN-MÔN';

  const previewReport = generateLocalSopGroundedReport(
    assignedAgent,
    prompt,
    allAgents,
    allSops
  );

  const routingReason =
    assignedAgent.id === coordinator.id
      ? `Master Agent Doraemon tiếp nhận chỉ thị trực tiếp từ Tổng Giám Đốc và thực thi điều phối chiến lược 8 phòng ban theo ${sopCodeList}.`
      : `Master Agent Doraemon đã phân tích chỉ thị của Giám đốc, xác định nghiệp vụ thuộc ${assignedAgent.departmentLabel} nên đã điều phối cho ${assignedAgent.name} (${assignedAgent.slashCommand}) thực thi theo ${sopCodeList}.`;

  const dispatchInfo: CoordinatorDispatchInfo = {
    isCeoDirective: true,
    coordinatorName: coordinator.name,
    coordinatorRole: coordinator.roleTitle,
    assignedAgentId: assignedAgent.id,
    assignedAgentName: assignedAgent.name,
    assignedDepartmentLabel: assignedAgent.departmentLabel,
    routingReason,
    directorSummaryFromDoraemon: `Báo cáo Giám đốc: ${assignedAgent.name} (${assignedAgent.departmentLabel}) đã hoàn tất xử lý → ${previewReport.totalAmountFormatted}. Doraemon đã nghiệm thu kết quả và tư vấn Giám đốc duyệt triển khai.`,
    supportingDepartments
  };

  return {
    coordinator,
    assignedAgent,
    targetZoneId: assignedAgent.zoneId,
    dispatchInfo,
    matchedSops
  };
}

/**
 * Computes the target 3D position and lookAt coordinate for an AI assistant in the 3D scene.
 */
export function computeAgentWaypoint(
  agent: AgentProfile,
  activeTasks: TaskAssignment[],
  zones: OfficeZone[],
  isAllHandsMeeting: boolean,
  agentIndex: number
): { position: Vector3Tuple; lookAt: Vector3Tuple; stateLabel: string; isMovingTarget: boolean } {
  if (isAllHandsMeeting) {
    const meetingSeats: Vector3Tuple[] = [
      { x: -3.5, y: 0, z: -5.8 },
      { x: -1.75, y: 0, z: -6.1 },
      { x: 0.0, y: 0, z: -5.6 },
      { x: 1.75, y: 0, z: -6.1 },
      { x: 3.5, y: 0, z: -5.8 },
      { x: -2.5, y: 0, z: -4.5 },
      { x: 2.5, y: 0, z: -4.5 },
      { x: -0.5, y: 0, z: -4.2 },
      { x: 0.5, y: 0, z: -4.2 }
    ];
    const seat = meetingSeats[agentIndex % meetingSeats.length];
    return {
      position: seat,
      lookAt: { x: seat.x * 0.4, y: 1.2, z: 4.0 },
      stateLabel: 'Họp giao ban 8 Phòng Ban cùng Doraemon',
      isMovingTarget: true
    };
  }

  const activeCeoDispatchTask = activeTasks.find(
    (t) =>
      t.coordinatorDispatch?.isCeoDirective &&
      t.status === 'analyzing_sop' &&
      t.agentId !== agent.id
  );
  if ((agent.departmentId === 'board_executive' || agent.departmentId === 'hr_ops') && activeCeoDispatchTask) {
    const targetAssignee = activeCeoDispatchTask.coordinatorDispatch?.assignedAgentName || 'Bộ phận';
    return {
      position: { x: -3.2, y: 0, z: -3.2 },
      lookAt: { x: 0, y: 1.0, z: 0 },
      stateLabel: `Điều phối lệnh GĐ → ${targetAssignee}`,
      isMovingTarget: true
    };
  }

  const runningTask = activeTasks.find(
    (t) =>
      t.agentId === agent.id &&
      (t.status === 'analyzing_sop' || t.status === 'executing_3d')
  );

  if (runningTask) {
    if (runningTask.status === 'analyzing_sop') {
      return {
        position: agent.homePosition,
        lookAt: agent.workstationLookAt,
        stateLabel: runningTask.coordinatorDispatch?.isCeoDirective
          ? 'Nhận điều phối từ Doraemon...'
          : 'Đang đối chiếu tài liệu SOP...',
        isMovingTarget: false
      };
    }

    const targetZone = zones.find((z) => z.id === runningTask.targetZoneId);
    if (targetZone && targetZone.id !== agent.zoneId) {
      return {
        position: agent.collaborationPoint,
        lookAt: { x: targetZone.center.x, y: 1.0, z: targetZone.center.z },
        stateLabel: `Thực thi & báo cáo Doraemon`,
        isMovingTarget: true
      };
    }

    return {
      position: agent.collaborationPoint,
      lookAt: { x: 0, y: 1.0, z: 0.5 },
      stateLabel: 'Thực thi & gửi báo cáo Doraemon...',
      isMovingTarget: true
    };
  }

  const latestTask = activeTasks[0];
  if (
    latestTask &&
    latestTask.agentId === agent.id &&
    latestTask.status === 'completed' &&
    latestTask.report?.totalAmountFormatted
  ) {
    const shortTotal = latestTask.report.totalAmountFormatted.split('(')[0].trim();
    return {
      position: agent.homePosition,
      lookAt: agent.workstationLookAt,
      stateLabel: `Đã trả KQ: ${shortTotal}`,
      isMovingTarget: false
    };
  }

  return {
    position: agent.homePosition,
    lookAt: agent.workstationLookAt,
    stateLabel:
      agent.characterKey === 'doraemon'
        ? 'Master Agent Ban Giám Đốc'
        : `Trực ${agent.departmentLabel} (${agent.slashCommand || ''})`,
    isMovingTarget: false
  };
}

export interface OfficeDialogueExchange {
  id: string;
  speakerKey: string;
  listenerKey: string;
  speakerName: string;
  listenerName: string;
  hubLabel: string;
  speakerLine: string;
  listenerReply: string;
  speakerSpot: Vector3Tuple;
  listenerSpot: Vector3Tuple;
}

export const OFFICE_SOCIAL_DIALOGUES: OfficeDialogueExchange[] = [
  {
    id: 'dlg-shizuka-dekisugi',
    speakerKey: 'shizuka',
    listenerKey: 'dekisugi',
    speakerName: 'Shizuka (Xuka)',
    listenerName: 'Dekisugi (Đê-khi)',
    hubLabel: 'Khu CSKH & Kinh Doanh B2B',
    speakerLine: 'Đê-khi ơi, khách hàng FDI vừa gửi RFQ 20.000 sản phẩm, cậu đã tính giá FOB chưa?',
    listenerReply: 'Mình vừa bóc tách xong BOM và lập dự thảo Hợp đồng song ngữ Việt - Anh rồi Xuka nhé!',
    speakerSpot: { x: 2.2, y: 0, z: 6.2 },
    listenerSpot: { x: 3.4, y: 0, z: 6.2 }
  },
  {
    id: 'dlg-doraemon-suneo',
    speakerKey: 'doraemon',
    listenerKey: 'suneo',
    speakerName: 'Doraemon',
    listenerName: 'Suneo (Xêko)',
    hubLabel: 'Sảnh Điều Phối Trung Tâm',
    speakerLine: 'Xêko này, nhớ kiểm soát tỷ lệ chi phí NVL trực tiếp (621) không vượt quá 62% nhé!',
    listenerReply: 'Dạ anh Doraemon! Em đã đối chiếu với thẻ kho của Bác Kaminari, tỷ lệ chỉ 58.4% rất an toàn ạ!',
    speakerSpot: { x: -0.6, y: 0, z: -0.8 },
    listenerSpot: { x: 0.9, y: 0, z: -0.8 }
  },
  {
    id: 'dlg-dorami-sensei',
    speakerKey: 'dorami',
    listenerKey: 'sensei',
    speakerName: 'Dorami (Đô-rê-mi)',
    listenerName: 'Thầy Giáo (Sensei)',
    hubLabel: 'Phòng Họp & Hành Chính EHS',
    speakerLine: 'Thầy ơi, khóa đào tạo 5S và an toàn đầu vào cho 6 công nhân mới sáng nay thế nào ạ?',
    listenerReply: 'Rất nghiêm túc Dorami nhé! 100% công nhân mới đã đạt bài kiểm tra PCCC và nhận đủ BHLĐ!',
    speakerSpot: { x: -8.2, y: 0, z: -5.5 },
    listenerSpot: { x: -10.5, y: 0, z: -4.5 }
  },
  {
    id: 'dlg-kaminari-nobita',
    speakerKey: 'kaminari',
    listenerKey: 'nobita',
    speakerName: 'Bác Kaminari',
    listenerName: 'Nobita',
    hubLabel: 'Hành Lang Kho & Kỹ Thuật',
    speakerLine: 'Nobita! Lô bạt in mới nhập theo chuẩn FIFO đã lưu vị trí kệ A3, nhớ kiểm tra bề mặt trước khi in nhé!',
    listenerReply: 'Dạ cháu cảm ơn Bác Kaminari! Cháu đang in thử màu proof kiểm tra độ bám mực ngay đây ạ!',
    speakerSpot: { x: -6.5, y: 0, z: -3.8 },
    listenerSpot: { x: -7.2, y: 0, z: 1.8 }
  },
  {
    id: 'dlg-chaian-dekisugi',
    speakerKey: 'chaian',
    listenerKey: 'dekisugi',
    speakerName: 'Chaian (Chaien)',
    listenerName: 'Dekisugi (Đê-khi)',
    hubLabel: 'Khu Marketing & Dự Án',
    speakerLine: 'Đê-khi! Bộ Company Profile đạt chuẩn ISO mình vừa đóng gói xong, cậu đính kèm gửi đối tác Nhật nhé!',
    listenerReply: 'Tuyệt vời Chaien! Thiết kế slide năng lực máy móc sắc nét thế này chắc chắn khách sẽ duyệt!',
    speakerSpot: { x: 5.5, y: 0, z: 4.5 },
    listenerSpot: { x: 3.4, y: 0, z: 6.2 }
  }
];

export function getActiveSocialDialogue(elapsedSec: number): {
  exchange: OfficeDialogueExchange;
  activeTurn: 'speaker' | 'listener';
  activeText: string;
  cycleIndex: number;
} {
  const safeTime = Math.max(0, Number(elapsedSec) || 0);
  const slotDuration = 9.0;
  const cycleIndex =
    Math.floor(safeTime / slotDuration) % OFFICE_SOCIAL_DIALOGUES.length;
  const exchange = OFFICE_SOCIAL_DIALOGUES[cycleIndex];
  const phaseInSlot = safeTime % slotDuration;
  const activeTurn: 'speaker' | 'listener' =
    phaseInSlot < slotDuration * 0.52 ? 'speaker' : 'listener';
  const activeText =
    activeTurn === 'speaker' ? exchange.speakerLine : exchange.listenerReply;

  return {
    exchange,
    activeTurn,
    activeText,
    cycleIndex
  };
}
