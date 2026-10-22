import {
  AgentProfile,
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

  let finishingRate = 0;
  if (input.finishingOption === 'eyelet_glue') {
    finishingRate = 6000;
  } else if (input.finishingOption === 'matte_lamination') {
    finishingRate = 15000;
  } else if (input.finishingOption === 'alu_frame') {
    finishingRate = 180000;
  }

  const finishingCostVnd = isUnitBased
    ? safeQty * finishingRate
    : Math.round(totalAreaSqm * finishingRate);

  const volumeMetric = isUnitBased ? safeQty : totalAreaSqm;
  let discountPercent = 0;
  if (volumeMetric >= 100) {
    discountPercent = 12;
  } else if (volumeMetric >= 50 || (isUnitBased && safeQty >= 20)) {
    discountPercent = 8;
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
    baseUnitRateVnd,
    finishingCostVnd,
    discountPercent,
    rushSurchargeVnd,
    subtotalVnd,
    vatVnd,
    grandTotalVnd,
    appliedSopRule: sopNote
  };
}

/**
 * Validates whether a user task prompt falls within the selected AI assistant's strict department specialization.
 * If another department has a much stronger keyword match and the selected agent has 0 matches, it flags a scope boundary violation.
 */
export function validateScopeAndRoute(
  agent: AgentProfile,
  prompt: string,
  allAgents: AgentProfile[],
  departmentSops: SopDocument[]
): ScopeValidationResult {
  const normalized = prompt.trim().toLowerCase();
  const activeSops = departmentSops.filter(
    (s) => s.departmentId === agent.departmentId && s.isActive
  );

  if (!normalized) {
    return {
      isInScope: false,
      reason: 'Nội dung nhiệm vụ không được để trống.',
      matchedSops: activeSops
    };
  }

  const countMatches = (targetAgent: AgentProfile): number => {
    let score = 0;
    for (const kw of targetAgent.allowedKeywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 1;
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
  if (ownScore === 0 && bestOtherScore >= 1 && bestOtherAgent) {
    return {
      isInScope: false,
      reason: `Từ chối thực thi do vượt giới hạn chuyên môn nghiêm ngặt: ${agent.name} (${agent.departmentLabel}) chỉ được huấn luyện chuyên sâu cho nghiệp vụ của bộ phận mình. Nhiệm vụ này thuộc chuyên môn của ${bestOtherAgent.name} (${bestOtherAgent.departmentLabel}) — vui lòng chuyển cho ${bestOtherAgent.name} hoặc giao qua Trưởng phòng Quản lý chung Doraemon để điều phối tự động.`,
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
      spatialActionTaken: `${agent.name} giữ nguyên vị trí tại ${agent.departmentLabel}, từ chối thao tác trái chuyên môn và báo cáo Trưởng phòng Doraemon chuyển việc cho ${validation.suggestedAgent?.name || 'quản lý'}.`,
      keyFindings: [
        `Yêu cầu "${prompt}" chứa nội dung nghiệp vụ thuộc ${validation.suggestedAgent?.departmentLabel || 'bộ phận khác'}.`,
        `Quy tắc huấn luyện nội bộ của PrintAd yêu cầu mỗi thành viên chỉ thực hiện đúng chức năng chuyên sâu để đảm bảo chất lượng và bảo mật dữ liệu.`,
        validation.suggestedAgent
          ? `Đề xuất chuyển nhiệm vụ này cho ${validation.suggestedAgent.name} (${validation.suggestedAgent.roleTitle}) hoặc dùng chế độ Chỉ thị Giám đốc để Doraemon tự động phân việc.`
          : 'Vui lòng chọn đúng thành viên chuyên trách.'
      ],
      recommendation: validation.suggestedAgent
        ? `Chuyển giao cho ${validation.suggestedAgent.name} hoặc để Trưởng phòng Doraemon điều phối tự động.`
        : 'Chọn lại bộ phận chuyên trách phù hợp.',
      executionTimeSec: 1.4,
      sourceMode: 'sop-engine'
    };
  }

  // Strip 'm2' / 'm²' unit suffixes before generic number extraction so the '2' in 'm2' is never mistaken for quantity
  const cleanedForNumbers = prompt.replace(/m\s*[2²]/gi, ' m_sq ');
  const numMatches =
    cleanedForNumbers
      .match(/\d+(?:[.,]\d+)?/g)
      ?.map((n) => Number(n.replace(',', '.'))) || [];

  switch (agent.departmentId) {
    case 'sales_quoting': {
      const lowerPrompt = prompt.toLowerCase();
      const explicitSqmMatch = prompt.match(
        /(\d+(?:[.,]\d+)?)\s*(?:m2|m²|mét\s*vuông|m\s*vuông|m\b)/i
      );
      const explicitQtyMatch = prompt.match(
        /(?:số\s*lượng|sl|in|báo\s*giá)\s*(?:số\s*lượng\s*)?(\d+(?:[.,]\d+)?)/i
      );

      const sqm = explicitSqmMatch
        ? Number(explicitSqmMatch[1].replace(',', '.'))
        : explicitQtyMatch
        ? Number(explicitQtyMatch[1].replace(',', '.'))
        : numMatches.find((n) => n >= 1 && n <= 10000) || 80;

      const hasStandee =
        lowerPrompt.includes('standee') || lowerPrompt.includes('chân cuốn');
      const standeeMatch = prompt.match(
        /(\d+)\s*(?:bộ|cái|chiếc|chân)?\s*(?:standee|chân\s*cuốn)/i
      );
      const standeeCount = hasStandee
        ? standeeMatch
          ? Number(standeeMatch[1])
          : numMatches.find((n) => n >= 1 && n < 200 && n !== sqm) || 10
        : 0;
      const isMica = lowerPrompt.includes('mica') || lowerPrompt.includes('led');
      const isDecal = lowerPrompt.includes('decal') || lowerPrompt.includes('pp');

      const materialType: PrintQuoteInput['materialType'] = isMica
        ? 'mica_led'
        : isDecal
        ? 'decal_pp'
        : 'hiflex';

      const finishingOption: PrintQuoteInput['finishingOption'] = isMica
        ? 'alu_frame'
        : isDecal
        ? 'matte_lamination'
        : 'eyelet_glue';

      const quote = calculatePrintQuote({
        materialType,
        widthMeters: isMica ? 4 : 8,
        heightMeters: isMica ? sqm / 4 : sqm / 8,
        quantity: 1,
        finishingOption,
        rushOrder: lowerPrompt.includes('gấp') || lowerPrompt.includes('nhanh')
      });

      const standeeTotal = standeeCount * 260000;
      const combinedSubtotal = quote.subtotalVnd + standeeTotal;
      const combinedVat = Math.round(combinedSubtotal * 0.08);
      const combinedGrandTotal = combinedSubtotal + combinedVat;

      const materialLabel = isMica
        ? 'Biển chữ nổi Mica Đài Loan gắn LED âm'
        : isDecal
        ? 'In Decal PP ngoài trời cán màng bảo vệ'
        : 'In Bạt Hiflex 3.2 dzem tiêu chuẩn';

      const finishingLabel = isMica
        ? 'Khung Alu gia cố (180.000đ/m2)'
        : isDecal
        ? 'Cán màng mờ/bóng (15.000đ/m2)'
        : 'Đóng khoen & dán biên (6.000đ/m2)';

      const finishingUnitText = isMica
        ? '180.000đ/m2'
        : isDecal
        ? '15.000đ/m2'
        : '6.000đ/m2';

      const baseAmount = Math.round(quote.totalAreaSqm * quote.baseUnitRateVnd);
      const grossBeforeDiscount = baseAmount + quote.finishingCostVnd;
      const discountVnd = Math.round(
        (grossBeforeDiscount * quote.discountPercent) / 100
      );
      const deposit50Vnd = Math.round(combinedGrandTotal * 0.5);

      const calculationRows = [
        {
          item: `1. ${materialLabel}`,
          spec: `Khổ in theo yêu cầu (${quote.totalAreaSqm}m2)`,
          quantity: `${quote.totalAreaSqm} m2`,
          unitPrice: `${formatVnd(quote.baseUnitRateVnd)}/m2`,
          subtotal: formatVnd(baseAmount)
        },
        {
          item: `2. Gia công (${finishingLabel})`,
          spec: 'Hoàn thiện tiêu chuẩn xưởng PrintAd',
          quantity: `${quote.totalAreaSqm} m2`,
          unitPrice: finishingUnitText,
          subtotal: formatVnd(quote.finishingCostVnd)
        },
        ...(quote.discountPercent > 0
          ? [
              {
                item: `3. Chiết khấu sản lượng SOP (>=50m2)`,
                spec: `Giảm ${quote.discountPercent}% trên tổng tiền in + gia công (${formatVnd(grossBeforeDiscount)})`,
                quantity: `-${quote.discountPercent}%`,
                unitPrice: formatVnd(grossBeforeDiscount),
                subtotal: `-${formatVnd(discountVnd)}`
              }
            ]
          : []),
        ...(standeeCount > 0
          ? [
              {
                item: 'Standee cuốn nhôm cao cấp 0.8x2.0m',
                spec: 'In Decal PP cán mờ + Hộp nhôm',
                quantity: `${standeeCount} bộ`,
                unitPrice: '260.000đ/bộ',
                subtotal: formatVnd(standeeTotal)
              }
            ]
          : []),
        {
          item: 'Thuế GTGT (VAT 8%) & Bộ chứng từ',
          spec: 'Kèm Hợp đồng, Phiếu mua bán & Phiếu giao hàng',
          quantity: '8% VAT',
          unitPrice: formatVnd(combinedSubtotal),
          subtotal: formatVnd(combinedVat)
        },
        {
          item: 'TỔNG THANH TOÁN (ĐÃ GỒM VAT 8%)',
          spec: `Tạm ứng đặt cọc 50%: ${formatVnd(deposit50Vnd)}`,
          quantity: `${quote.totalAreaSqm} m2${standeeCount > 0 ? ` + ${standeeCount} bộ` : ''}`,
          unitPrice: 'Trọn gói',
          subtotal: formatVnd(combinedGrandTotal)
        }
      ];

      return {
        headline: `Kết Quả Báo Giá ${quote.totalAreaSqm}m2 ${isMica ? 'Mica LED' : isDecal ? 'Decal PP' : 'Bạt Hiflex'}${standeeCount > 0 ? ` & ${standeeCount} Standee` : ''}: ${formatVnd(combinedGrandTotal)} — Shizuka (Xuka)`,
        summary: `Shizuka (Xuka) báo cáo kết quả cho lệnh "${prompt}": Tiền in ${quote.totalAreaSqm}m2 × ${formatVnd(quote.baseUnitRateVnd)}/m2 = ${formatVnd(baseAmount)} + Gia công ${formatVnd(quote.finishingCostVnd)}${quote.discountPercent > 0 ? ` - Chiết khấu ${quote.discountPercent}% (${formatVnd(discountVnd)})` : ''} + VAT 8% (${formatVnd(combinedVat)}) = TỔNG CỘNG ${formatVnd(combinedGrandTotal)} (Khách đặt cọc 50%: ${formatVnd(deposit50Vnd)}).`,
        scopeCheckPassed: true,
        scopeExplanation: validation.reason,
        appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-BG-2026-01'],
        spatialActionTaken:
          'Shizuka (Xuka) đã tính báo giá & soạn Hợp đồng tại bàn CSKH (-10.5, 5.8), kiểm mẫu ở Khu làm việc chung (0, 0.5) và gửi kết quả kèm Phiếu mua bán + Phiếu giao hàng qua Doraemon trình Giám đốc.',
        keyFindings: [
          `Tiền in & gia công (${quote.totalAreaSqm}m2): ${materialLabel} (${formatVnd(quote.baseUnitRateVnd)}/m2 = ${formatVnd(baseAmount)}) + ${finishingLabel} (${formatVnd(quote.finishingCostVnd)}) = ${formatVnd(grossBeforeDiscount)}.`,
          quote.discountPercent > 0
            ? `Chiết khấu sản lượng SOP-BG-2026-01 (>=50m2): Giảm ${quote.discountPercent}% (-${formatVnd(discountVnd)}) → Tiền trước thuế: ${formatVnd(combinedSubtotal)} + VAT 8% (${formatVnd(combinedVat)}).`
            : `Tiền hàng trước thuế: ${formatVnd(combinedSubtotal)} + Thuế GTGT VAT 8% (${formatVnd(combinedVat)}).`,
          `TỔNG THANH TOÁN: ${formatVnd(combinedGrandTotal)} (Tạm ứng đặt cọc 50%: ${formatVnd(deposit50Vnd)}) — Shizuka đã lập sẵn Hợp đồng mua bán, Phiếu mua bán & Phiếu giao hàng 02 liên.`,
          customRulesList[0] ? `Quy chuẩn SOP đã đối chiếu: "${customRulesList[0]}"` : ''
        ].filter(Boolean),
        calculationRows,
        totalAmountFormatted: `${formatVnd(combinedGrandTotal)} (Đặt cọc 50%: ${formatVnd(deposit50Vnd)})`,
        recommendation:
          'Shizuka (Xuka) đã trả kết quả báo giá, Hợp đồng mua bán và Phiếu giao hàng qua Trưởng phòng Doraemon trình Giám đốc duyệt; sẵn sàng chuyển Suneo thu cọc 50% và Nobita bình bài in.',
        executionTimeSec: 1.0,
        sourceMode: 'sop-engine'
      };
    }

    case 'accounting': {
      return {
        headline: 'Báo cáo Công nợ, Hợp đồng Đối tác, Đối soát Chi phí & Hóa đơn — Suneo (Xêko)',
        summary: `Suneo (Xêko) đã rà soát công nợ, thông tin hợp đồng đối tác - khách hàng, đối soát chi phí vật tư và kiểm tra giấy tờ hóa đơn theo ${sopCodes.join(', ') || 'SOP-KT-2026-01'} cho nhiệm vụ "${prompt}", sau đó gửi báo cáo về cho Trưởng phòng Doraemon.`,
        scopeCheckPassed: true,
        scopeExplanation: validation.reason,
        appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-KT-2026-01'],
        spatialActionTaken:
          'Suneo đã tra cứu tủ hồ sơ hợp đồng đối tác & sổ công nợ tại phân khu Kế toán (10.5, 5.8) và di chuyển sang Phòng họp (0, -7.5) báo cáo Doraemon.',
        keyFindings: [
          'Quản lý công nợ & tạm ứng 50%: 14/16 đơn hàng trong tuần đã thu đủ cọc 50%; phát hiện 02 đơn chưa hoàn tất tạm ứng -> Suneo đã tạm khóa lệnh xuất vật tư theo SOP.',
          'Thông tin hợp đồng đối tác & khách hàng B2B: Đã cập nhật 06 hợp đồng đối tác cung ứng bạt/mực/mica và 04 hợp đồng khách hàng chuỗi bán lẻ; tổng dư nợ phải thu 142.500.000đ nằm trong hạn mức an toàn.',
          'Đối soát chi phí & giấy tờ hóa đơn: Tỷ lệ hao hụt vật tư xưởng đạt 3.8% (chuẩn SOP <= 5%); đã đối chiếu khớp Phiếu giao hàng của Shizuka để phát hành 12 hóa đơn GTGT (VAT 8%).',
          customRulesList[0] ? `Quy chuẩn huấn luyện áp dụng: "${customRulesList[0]}"` : ''
        ].filter(Boolean),
        calculationRows: [
          {
            item: 'Thu tiền hàng & Đặt cọc 50% theo Hợp đồng',
            spec: '14 đơn hàng khớp Phiếu mua bán',
            quantity: '14 Job ID',
            unitPrice: 'Đã khớp phiếu thu',
            subtotal: '68.400.000đ'
          },
          {
            item: 'Công nợ khách hàng & Hợp đồng đối tác B2B',
            spec: '04 HĐ Khách hàng / 06 HĐ Đối tác',
            quantity: '10 Hợp đồng',
            unitPrice: 'Trong hạn 30 ngày',
            subtotal: '142.500.000đ'
          },
          {
            item: 'Đối soát chi phí vật tư & Hóa đơn VAT',
            spec: 'Hao hụt 3.8% · Đủ HĐ đầu vào/ra',
            quantity: 'Lô tháng 10',
            unitPrice: 'Đã xuất 12 HĐ VAT',
            subtotal: '51.200.000đ'
          }
        ],
        totalAmountFormatted: 'Dòng tiền ròng khả dụng sau đối soát chi phí: +159.700.000đ',
        recommendation:
          'Suneo kiến nghị Doraemon trình Giám đốc duyệt thanh toán đợt 1 cho đối tác cung ứng mực UV và nhắc Shizuka đôn đốc 02 khách lẻ hoàn tất đặt cọc.',
        executionTimeSec: 3.9,
        sourceMode: 'sop-engine'
      };
    }

    case 'design_tech': {
      return {
        headline: 'Báo cáo Kiểm tra & Chỉnh sửa File Thiết kế Chuẩn In CMYK — Nobita',
        summary: `Nhân viên thiết kế Nobita đã rà soát thông số kỹ thuật và chỉnh sửa file thiết kế cho yêu cầu "${prompt}" theo đúng quy chuẩn ${sopCodes.join(', ') || 'SOP-TK-2026-01'}, gửi kết quả về cho Trưởng phòng Doraemon.`,
        scopeCheckPassed: true,
        scopeExplanation: validation.reason,
        appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-TK-2026-01'],
        spatialActionTaken:
          'Nobita đã chỉnh sửa tách màu CMYK tại Workstation Đồ họa (-10.5, -1.8) và bước ra Trạm máy in phun khổ lớn tại Khu làm việc chung (0, 0.5) để in test proof.',
        keyFindings: [
          'Chuẩn hóa hệ màu CMYK: Nobita đã chuyển toàn bộ đối tượng đồ họa và ảnh từ RGB sang CMYK chuẩn in; xử lý nền đen về Rich Black (C40 M30 Y30 K100) và chữ đen nhỏ về K=100%.',
          'Chỉnh sửa tràn lề (Bleed) & Cắt bế: Đã bù tràn lề 3mm toàn bộ các cạnh cắt xén và tạo layer đường bế (CutContour) riêng biệt cho hạng mục Decal/Tem nhãn.',
          'Độ phân giải & Font chữ: Toàn bộ font chữ đã được Convert to Outlines (không lỗi nhảy font), độ phân giải ảnh đạt chuẩn 300 DPI cho ấn phẩm cầm tay và 120 DPI cho bạt khổ lớn.',
          customRulesList[0] ? `Quy chuẩn huấn luyện áp dụng: "${customRulesList[0]}"` : ''
        ].filter(Boolean),
        calculationRows: [
          {
            item: 'Hệ màu & Profile ICC file thiết kế',
            spec: 'ISO Coated v2 (100% CMYK)',
            quantity: 'Toàn bộ file',
            unitPrice: 'Chữ đen K=100%',
            subtotal: 'Đạt chuẩn in'
          },
          {
            item: 'Tràn lề (Bleed) & Vùng an toàn',
            spec: 'Bleed 3mm / Margin 5mm',
            quantity: '4 cạnh cắt',
            unitPrice: 'Có ốc chồng màu',
            subtotal: 'Đạt chuẩn in'
          },
          {
            item: 'Định dạng xuất file bình bài',
            spec: 'PDF/X-1a & TIFF LZW',
            quantity: 'Tỷ lệ 1:1',
            unitPrice: 'Đã Convert Font',
            subtotal: 'Sẵn sàng ra kẽm/in'
          }
        ],
        totalAmountFormatted: '0 lỗi kỹ thuật tồn đọng — Nobita đã xuất bản in Proof CMYK thành công',
        recommendation:
          'Nobita báo cáo Doraemon: Bản in thử (proof) đã đặt tại bàn Khu vực làm việc chung, sẵn sàng chuyển lệnh xuống máy in công nghiệp.',
        executionTimeSec: 3.5,
        sourceMode: 'sop-engine'
      };
    }

    case 'marketing': {
      return {
        headline: 'Báo cáo Nghiên cứu Đối thủ & Chiến dịch Marketing B2B — Chaian (Chaien)',
        summary: `Chaian (Chaien) đã thực hiện phân tích thị trường và đối thủ cạnh tranh cho nhiệm vụ "${prompt}" dựa trên khung chiến lược ${sopCodes.join(', ') || 'SOP-MKT-2026-01'} và gửi báo cáo cho Trưởng phòng Doraemon.`,
        scopeCheckPassed: true,
        scopeExplanation: validation.reason,
        appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-MKT-2026-01'],
        spatialActionTaken:
          'Chaian đã tổng hợp dữ liệu đối thủ tại phân khu Marketing (10.5, -1.8) và di chuyển vào Phòng họp (0, -7.5) báo cáo chiến lược với Doraemon.',
        keyFindings: [
          'Bức tranh đối thủ cạnh tranh: Các xưởng in truyền thống trong khu vực phản hồi báo giá chậm (4-6 giờ) và thường từ chối chỉnh sửa file lỗi cho khách.',
          'Lợi thế cạnh tranh của PrintAd: Quy trình phối hợp dưới sự điều phối của Doraemon giúp Shizuka báo giá trong 5 phút, Nobita kiểm file CMYK và in thử màu proof miễn phí trong 30 phút.',
          'Chiến dịch đề xuất của Chaian: Tung gói "Combo POSM Khai Trương & Sự Kiện" (Biển hiệu + Standee + Backdrop + Tờ rơi) giúp tăng 28% giá trị đơn hàng trung bình.',
          customRulesList[0] ? `Quy chuẩn huấn luyện áp dụng: "${customRulesList[0]}"` : ''
        ].filter(Boolean),
        calculationRows: [
          {
            item: 'Tốc độ phản hồi báo giá & kiểm file',
            spec: 'Trải nghiệm khách hàng B2B',
            quantity: 'Mỗi đơn hàng',
            unitPrice: 'Đối thủ: 4 - 6 giờ',
            subtotal: 'PrintAd: 15 phút'
          },
          {
            item: 'Dịch vụ In thử màu (Proof CMYK)',
            spec: 'Do Nobita thực hiện tại khu chung',
            quantity: 'Trước khi in lô',
            unitPrice: 'Đối thủ: Thu phí 150k',
            subtotal: 'PrintAd: Miễn phí'
          },
          {
            item: 'Combo Khai Trương POSM Trọn Gói',
            spec: 'Biển + 4 Standee + 1.000 Tờ rơi',
            quantity: 'Gói B2B',
            unitPrice: 'Tỷ lệ chốt +34%',
            subtotal: '4.850.000đ/gói'
          }
        ],
        totalAmountFormatted: 'Dự kiến tăng +34% tỷ lệ chốt đơn B2B và +28% doanh số trung bình',
        recommendation:
          'Chaian đề nghị Doraemon trình Giám đốc duyệt ngân sách chiến dịch và giao Shizuka áp dụng ngay gói Combo Khai Trương khi tư vấn CSKH.',
        executionTimeSec: 4.1,
        sourceMode: 'sop-engine'
      };
    }

    case 'hr_ops': {
      return {
        headline: 'Báo cáo Tư vấn Tổng hợp Quản lý Chung & Điều phối Vận hành — Doraemon',
        summary: `Trưởng phòng Quản lý chung Doraemon (Đô-rê-mon) đã tổng hợp tình hình hoạt động của cả 4 bộ phận (Shizuka, Suneo, Nobita, Chaian) và lập phương án điều phối cho chỉ thị "${prompt}" theo quy chuẩn ${sopCodes.join(', ') || 'SOP-QL-2026-01'}.`,
        scopeCheckPassed: true,
        scopeExplanation: validation.reason,
        appliedSopCodes: sopCodes.length > 0 ? sopCodes : ['SOP-QL-2026-01'],
        spatialActionTaken:
          'Doraemon đã rà soát toàn bộ tiến độ tại Phòng Quản lý chung (-10.5, -8.2) và di chuyển vào Phòng họp (0, -7.5) để trình báo cáo tư vấn tổng hợp cho Giám đốc.',
        keyFindings: [
          'Tổng hợp CSKH & Báo giá (Shizuka): Đã xử lý 100% yêu cầu báo giá trong ngày, hoàn thiện đầy đủ Hợp đồng mua bán, Phiếu mua bán và Phiếu giao hàng đúng SLA.',
          'Tổng hợp Kế toán (Suneo) & Thiết kế (Nobita): Suneo đã kiểm soát chặt tỷ lệ cọc 50% và đối soát chi phí hao hụt ở mức 3.8%; Nobita đã chuẩn hóa CMYK toàn bộ file in không để xảy ra lỗi lệch màu.',
          'Tổng hợp Marketing (Chaian) & Vận hành Xưởng: Chaian đã sẵn sàng chiến dịch Combo POSM; xưởng in bố trí đủ 02 thợ máy in + 02 gia công + 01 QC/ca và đội thi công biển bảng đạt 100% an toàn.',
          customRulesList[0] ? `Quy chuẩn huấn luyện áp dụng: "${customRulesList[0]}"` : ''
        ].filter(Boolean),
        calculationRows: [
          {
            item: 'CSKH, Hợp đồng & Phiếu giao hàng (Shizuka)',
            spec: 'Báo giá < 15 phút · Đủ 2 liên giao hàng',
            quantity: '16 đơn hàng',
            unitPrice: 'Tỷ lệ hài lòng 99%',
            subtotal: 'Hoàn thành tốt'
          },
          {
            item: 'Kế toán Công nợ & Hóa đơn (Suneo)',
            spec: 'Kiểm soát cọc 50% & HĐ đối tác',
            quantity: '10 Hợp đồng B2B',
            unitPrice: 'Hao hụt 3.8% (<=5%)',
            subtotal: 'Dòng tiền +159.7tr'
          },
          {
            item: 'Thiết kế (Nobita) & Marketing (Chaian)',
            spec: '0 lỗi file CMYK · Chiến dịch POSM',
            quantity: '100% công suất',
            unitPrice: 'Tăng +28% AOV',
            subtotal: 'Đồng bộ SOP'
          }
        ],
        totalAmountFormatted: 'Toàn công ty vận hành đồng bộ 100% SOP — 0 đơn trễ hạn',
        recommendation:
          'Tư vấn của Doraemon trình Giám đốc: Duyệt mở rộng gói Combo POSM của Chaian, cho phép Suneo tất toán hợp đồng đối tác mực UV và giao Shizuka ký hợp đồng nguyên tắc với 3 khách chuỗi mới.',
        executionTimeSec: 3.4,
        sourceMode: 'sop-engine'
      };
    }
  }
}

/**
 * Analyzes a general CEO directive through Doraemon (Trưởng phòng Quản lý chung)
 * and automatically dispatches it to the exact Doraemon team member responsible,
 * while generating Doraemon's executive synthesis feedback back to the Director.
 */
export function dispatchCeoDirective(
  prompt: string,
  allAgents: AgentProfile[],
  allSops: SopDocument[]
): CeoDispatchResult {
  const normalized = prompt.trim().toLowerCase();
  const coordinator =
    allAgents.find((a) => a.departmentId === 'hr_ops') || allAgents[allAgents.length - 1];

  const extraDeptPatterns: Record<DepartmentId, string[]> = {
    sales_quoting: [
      'báo giá',
      'tính giá',
      'đơn giá',
      'bao nhiêu tiền',
      'khách đặt',
      'đặt in',
      'in bạt',
      'bạt',
      'số lượng',
      'cskh',
      'chăm sóc khách hàng',
      'làm hợp đồng',
      'hợp đồng mua bán',
      'phiếu mua bán',
      'phiếu giao hàng',
      'giao hàng',
      'm2',
      'mét vuông',
      'hiflex',
      'decal',
      'standee',
      'mica',
      'biển hiệu',
      'hộp đèn',
      'chiết khấu',
      'tư vấn khách',
      'shizuka',
      'xuka',
      'xu ka'
    ],
    accounting: [
      'kế toán',
      'sổ sách',
      'tiền hàng',
      'công nợ',
      'đối tác',
      'hợp đồng đối tác',
      'thông tin hợp đồng',
      'đối soát chi phí',
      'chi phí',
      'giấy tờ',
      'hóa đơn',
      'vat',
      'tạm ứng',
      'đặt cọc',
      'thu chi',
      'chứng từ',
      'thanh toán',
      'quyết toán',
      'ngân sách',
      'lợi nhuận',
      'doanh thu',
      'nhập kho',
      'suneo',
      'xêko',
      'xeko',
      'xê kô'
    ],
    design_tech: [
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
      'màu in',
      'in thử',
      'proof',
      'layout',
      'bố cục',
      'nobita',
      'nôbita',
      'nô bi ta'
    ],
    marketing: [
      'marketing',
      'đối thủ',
      'cạnh tranh',
      'thị trường',
      'chiến dịch',
      'quảng bá',
      'khách hàng b2b',
      'thương hiệu',
      'posm',
      'ooh',
      'khuyến mãi',
      'combo',
      'tiếp thị',
      'xu hướng',
      'doanh số',
      'chaian',
      'chaien',
      'chai en'
    ],
    hr_ops: [
      'quản lý chung',
      'tư vấn',
      'tổng hợp',
      'báo cáo chung',
      'tổng quan',
      'điều phối',
      'nhân sự',
      'phân ca',
      'lịch làm việc',
      'thợ in',
      'đội thi công',
      'lắp đặt',
      'an toàn',
      'lao động',
      'xưởng in',
      'chấm công',
      'tuyển dụng',
      'đào tạo',
      'nội quy',
      'tăng ca',
      'pccc',
      'doraemon',
      'đô rê mon',
      'đôrêmon'
    ]
  };

  const scores = new Map<AgentProfile, number>();

  for (const ag of allAgents) {
    let score = 0;
    for (const kw of ag.allowedKeywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    const extraList = extraDeptPatterns[ag.departmentId] || [];
    for (const pat of extraList) {
      if (normalized.includes(pat.toLowerCase())) {
        score += 3;
      }
    }
    scores.set(ag, score);
  }

  const ranked = [...allAgents].sort(
    (a, b) => (scores.get(b) || 0) - (scores.get(a) || 0)
  );

  const topScore = scores.get(ranked[0]) || 0;
  // Default to Shizuka (CSKH/Quoting) if a general order directive has no specific keyword, or top-ranked specialist
  const assignedAgent =
    topScore > 0
      ? ranked[0]
      : allAgents.find((a) => a.departmentId === 'sales_quoting') || ranked[0];

  const supportingDepartments = ranked
    .slice(1)
    .filter((ag) => (scores.get(ag) || 0) > 0)
    .map((ag) => `${ag.name} (${ag.departmentLabel})`);

  const matchedSops = allSops.filter(
    (s) => s.departmentId === assignedAgent.departmentId && s.isActive
  );
  const sopCodeList =
    matchedSops.map((s) => s.code).join(', ') || 'SOP-CHUYÊN-MÔN';

  const targetZoneMap: Record<DepartmentId, ZoneId> = {
    sales_quoting: 'lobby',
    accounting: 'accounting',
    design_tech: 'coworking',
    marketing: 'meeting',
    hr_ops: 'meeting'
  };

  const routingReason =
    assignedAgent.id === coordinator.id
      ? `Doraemon (Trưởng phòng Quản lý chung) tiếp nhận chỉ thị từ Giám đốc và trực tiếp thực hiện tư vấn tổng hợp / điều phối chung theo quy chuẩn ${sopCodeList}.`
      : `Doraemon (Trưởng phòng Quản lý chung) đã phân tích chỉ thị của Giám đốc, xác định nghiệp vụ thuộc chuyên môn ${assignedAgent.departmentLabel} nên đã điều phối trực tiếp cho ${assignedAgent.name} thực thi theo ${sopCodeList}.`;

  const previewReport = generateLocalSopGroundedReport(
    assignedAgent,
    prompt,
    allAgents,
    allSops
  );

  const directorSummaryMap: Record<DepartmentId, string> = {
    sales_quoting: `Báo cáo Giám đốc: Shizuka (Xuka) đã tính xong báo giá & phản hồi lại Doraemon → Tổng thanh toán: ${previewReport.totalAmountFormatted}. Đã lập kèm Hợp đồng mua bán, Phiếu mua bán & Phiếu giao hàng chuẩn SOP. Doraemon đề xuất Giám đốc duyệt để chuyển Suneo thu cọc 50% và Nobita bình bài in.`,
    accounting: `Báo cáo Giám đốc: Suneo (Xêko) đã đối soát xong & báo cáo lại Doraemon → ${previewReport.totalAmountFormatted}. Sổ công nợ, hợp đồng đối tác - khách hàng, chi phí vật tư và bộ giấy tờ hóa đơn VAT đã khớp. Doraemon tư vấn Giám đốc phê duyệt lệnh thanh toán và xuất hóa đơn.`,
    design_tech: `Báo cáo Giám đốc: Nobita đã kiểm tra & chỉnh sửa xong file thiết kế → ${previewReport.totalAmountFormatted}. File đã chuẩn hóa 100% CMYK, bù tràn lề 3mm, convert font và in thử bản proof tại Khu chung. Doraemon xin phép Giám đốc cho chuyển lệnh xuống xưởng in.`,
    marketing: `Báo cáo Giám đốc: Chaian (Chaien) đã gửi báo cáo phân tích thị trường & đối thủ về Doraemon → ${previewReport.totalAmountFormatted}. Doraemon tư vấn Giám đốc phê duyệt triển khai gói Combo POSM và giao Shizuka áp dụng vào báo giá CSKH.`,
    hr_ops: `Báo cáo Giám đốc: Doraemon đã trực tiếp rà soát tổng thể 4 bộ phận (Shizuka, Suneo, Nobita, Chaian) cùng lịch vận hành xưởng in → ${previewReport.totalAmountFormatted}.`
  };

  const dispatchInfo: CoordinatorDispatchInfo = {
    isCeoDirective: true,
    coordinatorName: coordinator.name,
    coordinatorRole: coordinator.roleTitle,
    assignedAgentId: assignedAgent.id,
    assignedAgentName: assignedAgent.name,
    assignedDepartmentLabel: assignedAgent.departmentLabel,
    routingReason,
    directorSummaryFromDoraemon: directorSummaryMap[assignedAgent.departmentId],
    supportingDepartments
  };

  return {
    coordinator,
    assignedAgent,
    targetZoneId: targetZoneMap[assignedAgent.departmentId] || assignedAgent.zoneId,
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
      { x: 3.5, y: 0, z: -5.8 }
    ];
    const seat = meetingSeats[agentIndex % meetingSeats.length];
    return {
      position: seat,
      lookAt: { x: seat.x * 0.4, y: 1.2, z: 4.0 },
      stateLabel: 'Họp giao ban cùng Doraemon',
      isMovingTarget: true
    };
  }

  // If Doraemon is dispatching a CEO directive right now, show him moving to the central coordination hub
  const activeCeoDispatchTask = activeTasks.find(
    (t) =>
      t.coordinatorDispatch?.isCeoDirective &&
      t.status === 'analyzing_sop' &&
      t.agentId !== agent.id
  );
  if (agent.departmentId === 'hr_ops' && activeCeoDispatchTask) {
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

  // If the most recent task in history belongs to this agent and is completed, show the returned result on their 3D badge
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
        ? 'Trực Quản lý chung & Điều phối'
        : 'Trực chuyên môn tại bộ phận',
    isMovingTarget: false
  };
}

export interface OfficeDialogueExchange {
  id: string;
  speakerKey: 'doraemon' | 'shizuka' | 'suneo' | 'nobita' | 'chaian';
  listenerKey: 'doraemon' | 'shizuka' | 'suneo' | 'nobita' | 'chaian';
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
    id: 'dlg-shizuka-nobita',
    speakerKey: 'shizuka',
    listenerKey: 'nobita',
    speakerName: 'Shizuka (Xuka)',
    listenerName: 'Nobita',
    hubLabel: 'Khu Lounge & Bàn Kiểm Mẫu',
    speakerLine: 'Nobita ơi, khách vừa chốt 80m² bạt Hiflex, nhớ kiểm tràn lề 3mm nhé!',
    listenerReply: 'Ok Xuka! Mình vừa convert font và xuất file CMYK chuẩn in xong!',
    speakerSpot: { x: -1.1, y: 0, z: 2.1 },
    listenerSpot: { x: -2.5, y: 0, z: 2.1 }
  },
  {
    id: 'dlg-doraemon-suneo',
    speakerKey: 'doraemon',
    listenerKey: 'suneo',
    speakerName: 'Doraemon',
    listenerName: 'Suneo (Xêko)',
    hubLabel: 'Sảnh Điều Phối Trung Tâm',
    speakerLine: 'Xêko này, nhớ đối soát khoản cọc 50% của đơn biển Mica LED nhé!',
    listenerReply: 'Dạ anh Doraemon! Đã khớp phiếu thu và xuất hóa đơn VAT 8% rồi ạ!',
    speakerSpot: { x: -0.6, y: 0, z: -0.8 },
    listenerSpot: { x: 0.9, y: 0, z: -0.8 }
  },
  {
    id: 'dlg-chaian-shizuka',
    speakerKey: 'chaian',
    listenerKey: 'shizuka',
    speakerName: 'Chaian (Chaien)',
    listenerName: 'Shizuka (Xuka)',
    hubLabel: 'Hành Lang SEO · CSKH',
    speakerLine: 'Xuka ơi, gói Combo POSM Khai Trương đang có 5 chuỗi B2B hỏi giá!',
    listenerReply: 'Tuyệt quá Chaien! Để mình lập báo giá kèm Hợp đồng gửi khách ngay!',
    speakerSpot: { x: 1.8, y: 0, z: 4.6 },
    listenerSpot: { x: 0.3, y: 0, z: 4.6 }
  },
  {
    id: 'dlg-doraemon-nobita',
    speakerKey: 'doraemon',
    listenerKey: 'nobita',
    speakerName: 'Doraemon',
    listenerName: 'Nobita',
    hubLabel: 'Khu Kỹ Thuật Chế Bản',
    speakerLine: 'Bản in thử Proof CMYK sáng nay nét căng, không lệch màu chút nào!',
    listenerReply: 'Haha cảm ơn Doraemon! Em đã cân chỉnh ICC Profile kỹ lắm ạ!',
    speakerSpot: { x: -4.2, y: 0, z: 1.8 },
    listenerSpot: { x: -5.6, y: 0, z: 1.8 }
  },
  {
    id: 'dlg-suneo-chaian',
    speakerKey: 'suneo',
    listenerKey: 'chaian',
    speakerName: 'Suneo (Xêko)',
    listenerName: 'Chaian (Chaien)',
    hubLabel: 'Khu Giao Lưu & Marketing',
    speakerLine: 'Chiến dịch SEO · AEO tháng này giúp doanh thu B2B tăng vọt 28% luôn!',
    listenerReply: 'Quá đã Xêko! Chiều nay mình tung thêm ưu đãi in Standee cuốn nhôm!',
    speakerSpot: { x: 3.4, y: 0, z: 0.6 },
    listenerSpot: { x: 4.8, y: 0, z: 0.6 }
  }
];

/**
 * Pure selector returning the currently active office social conversation and turn state
 * based on elapsed simulation time.
 */
export function getActiveSocialDialogue(elapsedSec: number): {
  exchange: OfficeDialogueExchange;
  activeTurn: 'speaker' | 'listener';
  activeText: string;
  cycleIndex: number;
} {
  const safeTime = Math.max(0, Number(elapsedSec) || 0);
  const slotDuration = 9.0; // 9 seconds per conversation pair
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

