import {
  TerseAction,
  TerseMessageParsed,
  TerseMessagePayload,
  TerseStatus,
  TokenSavingsEstimate
} from '../types/enterprise';

export const STATUS_EMOJI_MAP: Record<TerseStatus, string> = {
  OK: '🟢',
  REJECT: '🔴',
  WAIT: '⏳',
  REST: '☕',
  LOCK: '🔒',
  RUSH: '⚡'
};

export const ACTION_LABEL_MAP: Record<TerseAction, string> = {
  DIRECTIVE: 'Điều phối Chỉ đạo CEO',
  CALC_QUOTE: 'Tính giá Sản xuất In ấn',
  CHECK_SOP: 'Kiểm tra Chuẩn Quy trình SOP',
  GATE_APPROVAL: 'Yêu cầu Duyệt Cổng An toàn',
  QC_8D: 'Báo cáo Kiểm soát Lỗi 8D',
  REPORT_RESULT: 'Báo cáo Kết quả Nghiệp vụ',
  REST_COOLDOWN: 'Tạm nghỉ Phục hồi Quota'
};

/**
 * Format structured payload into high-efficiency 1-line Terse dialect (BAMshort for PrintAd).
 * Format: [ACTION] @from -> @to [#REF_ID] STATUS {key=val,...} : note
 */
export function formatTerseMessage(payload: TerseMessagePayload): string {
  const metricsStr = payload.metrics && Object.keys(payload.metrics).length > 0
    ? '{' +
      Object.entries(payload.metrics)
        .map(([k, v]) => `${k}=${v}`)
        .join(',') +
      '}'
    : '{}';

  const emoji = STATUS_EMOJI_MAP[payload.status] || '🟢';
  const cleanFrom = payload.from.startsWith('@') ? payload.from : `@${payload.from}`;
  const cleanTo = payload.to.startsWith('@') ? payload.to : `@${payload.to}`;
  const cleanRef = payload.refId.startsWith('#') ? payload.refId : `#${payload.refId}`;

  return `[${payload.action}] ${cleanFrom} -> ${cleanTo} [${cleanRef}] ${emoji} ${payload.status} ${metricsStr} : ${payload.note.trim()}`;
}

/**
 * Parse a 1-line Terse message back into structured payload.
 */
export function parseTerseMessage(raw: string): TerseMessageParsed | null {
  if (!raw || typeof raw !== 'string') return null;

  const trimmed = raw.trim();
  // Regex pattern matching: [ACTION] @from -> @to [#REF_ID] [EMOJI]? STATUS {metrics} : note
  const regex = /^\[([A-Z_]+)\]\s+@([\w\-]+)\s*->\s*@([\w\-]+)\s+\[#([^\]]+)\]\s*(?:[^\w\s]+\s*)?([A-Z]+)\s*(\{.*?\})?\s*:\s*(.*)$/i;
  const match = trimmed.match(regex);

  if (!match) return null;

  const action = match[1].toUpperCase() as TerseAction;
  const from = match[2];
  const to = match[3];
  const refId = match[4];
  const status = match[5].toUpperCase() as TerseStatus;
  const rawMetrics = match[6] || '{}';
  const note = match[7].trim();

  const metrics: Record<string, string | number> = {};
  const innerMetrics = rawMetrics.replace(/^\{|\}$/g, '').trim();
  if (innerMetrics) {
    const pairs = innerMetrics.split(',');
    for (const pair of pairs) {
      const [k, v] = pair.split('=').map((s) => s.trim());
      if (k && v !== undefined) {
        const numVal = Number(v);
        metrics[k] = !isNaN(numVal) && !v.includes('%') && !v.toLowerCase().includes('m') ? numVal : v;
      }
    }
  }

  return {
    from,
    to,
    action,
    refId,
    status,
    metrics,
    note,
    raw: trimmed,
    timestamp: new Date().toISOString()
  };
}

/**
 * Expand a compact Terse message into human-friendly, professional Vietnamese
 * when presenting summaries or customer reports to the user.
 */
export function expandTerseToUserFacing(parsed: TerseMessageParsed): string {
  const actionName = ACTION_LABEL_MAP[parsed.action] || parsed.action;
  const emoji = STATUS_EMOJI_MAP[parsed.status] || '';

  const metricLines = parsed.metrics && Object.keys(parsed.metrics).length > 0
    ? Object.entries(parsed.metrics)
        .map(([k, v]) => `• ${k.toUpperCase()}: ${v}`)
        .join('\n')
    : '';

  let statusText = 'Đã hoàn tất chính xác';
  if (parsed.status === 'LOCK') statusText = 'Yêu cầu Cổng Phê Duyệt (Risk Gate)';
  if (parsed.status === 'REJECT') statusText = 'Từ chối thực hiện do vượt thẩm quyền/sai SOP';
  if (parsed.status === 'REST') statusText = 'Tạm dừng tác vụ do hạn mức quota mô hình';
  if (parsed.status === 'WAIT') statusText = 'Đang xếp hàng chờ xử lý';
  if (parsed.status === 'RUSH') statusText = 'Ưu tiên đặc biệt (Đơn giao gấp)';

  return `[Báo cáo Điều Hành PrintAd 3D]\n` +
    `📌 Tác vụ: ${actionName} (Mã: #${parsed.refId})\n` +
    `👤 Người gửi: @${parsed.from} ➔ Người nhận: @${parsed.to}\n` +
    `📊 Trạng thái: ${emoji} ${statusText}\n` +
    (metricLines ? `📐 Thông số kỹ thuật:\n${metricLines}\n` : '') +
    `💬 Ghi chú chi tiết: ${parsed.note}`;
}

/**
 * Calculate token savings compared to verbose multi-paragraph natural language logs.
 * Uses ~3.8 characters per token approximation (Vietnamese + punctuation heuristic).
 */
export function estimateTokenSavings(verboseText: string, terseText: string): TokenSavingsEstimate {
  const verboseTokens = Math.max(1, Math.round(verboseText.length / 3.8));
  const terseTokens = Math.max(1, Math.round(terseText.length / 3.8));
  const savedTokens = Math.max(0, verboseTokens - terseTokens);
  const savingPercent = Math.min(95, Math.max(0, Math.round((savedTokens / verboseTokens) * 100)));

  return {
    verboseTokens,
    terseTokens,
    savedTokens,
    savingPercent
  };
}
