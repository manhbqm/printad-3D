import { ApprovalCard, ApprovalEvaluation, ApprovalRiskLevel, ApprovalStatus } from '../types/enterprise';
import { DepartmentId, TaskReport } from '../types/office';

export interface EvaluationInput {
  rawAmountVnd?: number;
  discountPercent?: number;
  isRushOrder?: boolean;
  documentType?: string;
  taskPrompt?: string;
  report?: TaskReport;
}

/**
 * Evaluates whether an order or task report requires human-in-the-loop CEO approval
 */
export function evaluateApprovalRequired(input: EvaluationInput): ApprovalEvaluation {
  const triggers: string[] = [];
  let riskLevel: ApprovalRiskLevel = 'low';

  const amount = input.rawAmountVnd || 0;
  const discount = input.discountPercent || 0;
  const prompt = (input.taskPrompt || '').toLowerCase();
  const summary = (input.report?.summary || '').toLowerCase();
  const headline = (input.report?.headline || '').toLowerCase();

  // 1. Threshold: Value > 30,000,000 VND
  if (amount >= 50_000_000) {
    triggers.push(`Giá trị hợp đồng đặc biệt lớn: ${amount.toLocaleString('vi-VN')}đ (≥ 50.000.000đ)`);
    riskLevel = 'critical';
  } else if (amount >= 30_000_000) {
    triggers.push(`Giá trị đơn hàng vượt hạn mức tự duyệt: ${amount.toLocaleString('vi-VN')}đ (≥ 30.000.000đ)`);
    riskLevel = 'high';
  }

  // 2. Threshold: Commercial Discount > 15%
  if (discount > 20) {
    triggers.push(`Mức chiết khấu đặc biệt cao: ${discount}% (vượt trần thẩm quyền Trưởng phòng 15%)`);
    riskLevel = 'critical';
  } else if (discount > 15) {
    triggers.push(`Chiết khấu thương mại vượt khung chuẩn: ${discount}% (> 15%)`);
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  // 3. Threshold: Rush Production (< 24h)
  if (input.isRushOrder || prompt.includes('hỏa tốc') || prompt.includes('lấy gấp') || prompt.includes('giao ngay')) {
    triggers.push('Đơn hàng sản xuất hỏa tốc: Cần Giám đốc xưởng phê duyệt chen lịch máy in Offset');
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  // 4. Threshold: B2B Contract with Penalty / SLA Guarantee
  if (
    input.documentType === 'contract' ||
    prompt.includes('hợp đồng') ||
    prompt.includes('phạt trần') ||
    prompt.includes('bảo lãnh') ||
    summary.includes('hợp đồng') ||
    headline.includes('hợp đồng')
  ) {
    triggers.push('Hợp đồng kinh tế B2B: Ràng buộc trách nhiệm pháp chế & điều khoản phạt vi phạm SLA');
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  // 5. Threshold: Quality Defect Complaint 8D (High/Critical)
  if (
    input.documentType === 'complaint_8d' ||
    prompt.includes('khiếu nại') ||
    prompt.includes('8d') ||
    prompt.includes('trầy xước') ||
    prompt.includes('chênh màu')
  ) {
    triggers.push('Sự cố chất lượng sản phẩm (Quy trình 8D): Đề xuất xuất hàng đệm bù và bồi hoàn chi phí');
    if (riskLevel !== 'critical') riskLevel = 'high';
  }

  const requiresApproval = triggers.length > 0;
  let recommendation = 'Tác vụ nằm trong thẩm quyền tự duyệt của Trưởng bộ phận theo quy chuẩn SOP.';
  if (requiresApproval) {
    recommendation = `Chuyển thẻ phê duyệt đến Ban Giám Đốc (Doraemon) xem xét do phát hiện ${triggers.length} điều kiện rủi ro kiểm soát.`;
  }

  return {
    requiresApproval,
    riskLevel,
    triggers,
    recommendation
  };
}

/**
 * Creates an Approval Card for Human-in-the-Loop governance
 */
export function createApprovalCard(params: {
  taskId: string;
  orderId?: string;
  title: string;
  departmentId: DepartmentId;
  agentId: string;
  agentName: string;
  evaluation: ApprovalEvaluation;
  totalAmountFormatted: string;
  rawAmountVnd: number;
  discountPercent: number;
  customerName?: string;
  productSummary: string;
  isRushOrder?: boolean;
  documentType?: string;
}): ApprovalCard {
  return {
    id: `appr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    taskId: params.taskId,
    orderId: params.orderId,
    title: params.title,
    departmentId: params.departmentId,
    agentId: params.agentId,
    agentName: params.agentName,
    requiredApprover: 'Doraemon — Giám Đốc Điều Hành (CEO)',
    riskLevel: params.evaluation.riskLevel,
    triggers: params.evaluation.triggers,
    details: {
      totalAmountFormatted: params.totalAmountFormatted,
      rawAmountVnd: params.rawAmountVnd,
      discountPercent: params.discountPercent,
      customerName: params.customerName || 'Khách hàng Doanh nghiệp B2B',
      productSummary: params.productSummary,
      isRushOrder: params.isRushOrder,
      documentType: params.documentType
    },
    status: 'pending',
    createdAt: new Date().toISOString()
  };
}

/**
 * Resolves an approval card with decision: approved | rejected | revision_requested
 */
export function resolveApprovalCard(
  card: ApprovalCard,
  decision: ApprovalStatus,
  reviewerName: string = 'Doraemon (Giám Đốc Điều Hành)',
  note?: string
): ApprovalCard {
  return {
    ...card,
    status: decision,
    reviewedBy: reviewerName,
    reviewedAt: new Date().toISOString(),
    reviewNote: note || (decision === 'approved' ? 'Ban Giám Đốc đồng ý phê duyệt triển khai theo đề xuất.' : decision === 'rejected' ? 'Ban Giám Đốc từ chối phê duyệt.' : 'Ban Giám Đốc yêu cầu đàm phán lại các điều khoản.')
  };
}
