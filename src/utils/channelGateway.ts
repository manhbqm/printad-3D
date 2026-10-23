import { ExternalOrderPayload, ExternalOrderResult, OrderRecord } from '../types/enterprise';
import { AgentProfile, PrintQuoteInput, SopDocument } from '../types/office';
import { calculatePrintQuote, formatVnd } from './officeLogic';
import { createApprovalCard, evaluateApprovalRequired } from './approvalEngine';
import { db } from './database';

export function processExternalIncomingOrder(
  payload: ExternalOrderPayload,
  allAgents: AgentProfile[],
  sops: SopDocument[]
): ExternalOrderResult {
  const shizuka =
    allAgents.find((a) => a.characterKey === 'shizuka') ||
    allAgents.find((a) => a.departmentId === 'sales_b2b') ||
    allAgents[0];

  const materialType = (payload.materialType || 'hiflex') as any;
  const widthM = payload.widthMeters && payload.widthMeters > 0 ? payload.widthMeters : 4;
  const heightM = payload.heightMeters && payload.heightMeters > 0 ? payload.heightMeters : 2;
  const quantity = payload.quantity && payload.quantity > 0 ? payload.quantity : 1;
  const finishingOption = (payload.finishingOption || 'eyelet_glue') as any;
  const rushOrder = !!payload.rushOrder;

  const quoteInput: PrintQuoteInput = {
    materialType,
    widthMeters: widthM,
    heightMeters: heightM,
    quantity,
    finishingOption,
    rushOrder
  };

  const quoteResult = calculatePrintQuote(quoteInput);
  const discountPercent = payload.requestedDiscountPercent || quoteResult.discountPercent;
  const grandTotal = quoteResult.grandTotalVnd;

  // 1. Evaluate Approval Gate
  const evaluation = evaluateApprovalRequired({
    rawAmountVnd: grandTotal,
    discountPercent,
    isRushOrder: rushOrder,
    taskPrompt: payload.rawMessage
  });

  const orderId = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const taskId = `task-ext-${Date.now()}`;

  let approvalCard = undefined;
  if (evaluation.requiresApproval) {
    approvalCard = createApprovalCard({
      taskId,
      orderId,
      title: `Duyệt Đơn Hàng Ngoại Vi từ ${payload.source.toUpperCase()}: ${payload.senderName} (${formatVnd(grandTotal)})`,
      departmentId: 'sales_b2b',
      agentId: shizuka.id,
      agentName: shizuka.name,
      evaluation,
      totalAmountFormatted: formatVnd(grandTotal),
      rawAmountVnd: grandTotal,
      discountPercent,
      customerName: payload.senderName,
      productSummary: `In ${materialType.toUpperCase()} (${widthM}m x ${heightM}m, SL: ${quantity})`,
      isRushOrder: rushOrder
    });
    db.saveApprovalCard(approvalCard);
  }

  // 2. Persist Order to SQLite DB
  const orderRecord: OrderRecord = {
    id: orderId,
    taskId,
    customerName: payload.senderName,
    productType: materialType,
    specsSummary: `${materialType.toUpperCase()} ${widthM}m x ${heightM}m, Số lượng: ${quantity}, Gia công: ${finishingOption}`,
    quantity,
    subtotalVnd: quoteResult.subtotalVnd,
    discountPercent,
    vatVnd: quoteResult.vatVnd,
    grandTotalVnd: grandTotal,
    status: evaluation.requiresApproval ? 'pending_approval' : 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.saveOrder(orderRecord);

  // 3. Format Telegram / Zalo Bot Response Message
  let botMessage = `👋 Chào ${payload.senderName}! Công ty In ấn & Quảng cáo PrintAd 3D đã tiếp nhận đơn hàng của bạn qua kênh ${payload.source.toUpperCase()}.\n\n`;
  botMessage += `📋 CHI TIẾT BÁO GIÁ KỸ THUẬT (Mã đơn: ${orderId}):\n`;
  botMessage += `• Sản phẩm: ${materialType.toUpperCase()}\n`;
  botMessage += `• Kích thước: ${widthM}m x ${heightM}m (${quoteResult.totalAreaSqm}m²)\n`;
  botMessage += `• Số lượng: ${quantity} sản phẩm\n`;
  botMessage += `• Đơn giá cơ sở: ${formatVnd(quoteResult.baseUnitRateVnd)}/m²\n`;
  if (discountPercent > 0) {
    botMessage += `• Chiết khấu sản lượng: ${discountPercent}%\n`;
  }
  botMessage += `• Thuế VAT 8%: ${formatVnd(quoteResult.vatVnd)}\n`;
  botMessage += `👉 TỔNG GIÁ TRỊ: ${formatVnd(grandTotal)}\n`;
  botMessage += `• Đặt cọc 50%: ${formatVnd(Math.round(grandTotal * 0.5))}\n\n`;

  if (evaluation.requiresApproval) {
    botMessage += `⚠️ Đơn hàng có giá trị hoặc điều kiện đặc biệt đang được chuyển qua [CỔNG PHÊ DUYỆT BAN GIÁM ĐỐC]. Giám đốc Doraemon sẽ duyệt trong 15 phút.`;
  } else {
    botMessage += `✅ Đơn hàng đã được Trưởng phòng Shizuka tự động phê duyệt hợp lệ. Lệnh in đã được chuyển sang xưởng sản xuất!`;
  }

  return {
    success: true,
    orderId,
    assignedAgentName: shizuka.name,
    assignedDepartment: shizuka.departmentLabel,
    totalAmountFormatted: formatVnd(grandTotal),
    requiresApproval: evaluation.requiresApproval,
    approvalCard,
    botResponseMessage: botMessage,
    processedAt: new Date().toISOString()
  };
}
