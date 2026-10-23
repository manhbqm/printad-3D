import { AutomationJob, AutomationRunLog } from '../types/enterprise';
import { AgentProfile, SopDocument } from '../types/office';
import { generateLocalSopGroundedReport } from './officeLogic';
import { db } from './database';

export const INITIAL_AUTOMATION_JOBS: AutomationJob[] = [
  {
    id: 'cron-mon-planning',
    code: 'AUTO-MON-0830',
    title: 'Sáng Thứ 2 (08:30) — Giao ban Điều hành Tuần & Đo lường OTIF',
    cronSchedule: '30 8 * * 1',
    departmentId: 'board_executive',
    assignedAgentKey: 'doraemon',
    assignedAgentName: 'Doraemon (Giám Đốc Điều Hành)',
    description: 'Tự động quét chỉ số hoàn thành đơn hàng đúng hạn OTIF của 8 phòng ban, tổng hợp điểm nghẽn và xuất bảng phân công RACI đầu tuần.',
    targetZoneId: 'meeting',
    runCount: 0
  },
  {
    id: 'cron-daily-inventory',
    code: 'AUTO-DAY-1130',
    title: 'Trưa Hằng Ngày (11:30) — Rà soát Định mức An toàn Kho Bạt, Decal & Mực in',
    cronSchedule: '30 11 * * *',
    departmentId: 'warehouse_supply',
    assignedAgentKey: 'kaminari',
    assignedAgentName: 'Bác Kaminari (Kho & Cung Ứng)',
    description: 'Kiểm tra tồn kho định mức cuộn bạt Hiflex 3.2m, decal PP trong nhà/ngoài trời, mực in CMYK; tự động lập đề xuất mua sắm khi dưới ngưỡng an toàn 200m².',
    targetZoneId: 'warehouse_supply',
    runCount: 0
  },
  {
    id: 'cron-fri-debt',
    code: 'AUTO-FRI-1630',
    title: 'Chiều Thứ 6 (16:30) — Đối chiếu Công nợ B2B & Lập Thư Đôn đốc Thanh toán',
    cronSchedule: '30 16 * * 5',
    departmentId: 'accounting',
    assignedAgentKey: 'suneo',
    assignedAgentName: 'Suneo (Kế Toán & Chi Phí)',
    description: 'Rà soát danh mục hóa đơn và hợp đồng đến hạn thanh toán đợt 2 (50% còn lại), soạn thảo thư điện tử đối chiếu công nợ chuẩn mực gửi kế toán đối tác.',
    targetZoneId: 'accounting',
    runCount: 0
  },
  {
    id: 'cron-daily-qc',
    code: 'AUTO-DAY-1730',
    title: 'Chiều Hằng Ngày (17:30) — Kiểm định Tỷ lệ Phế phẩm & Báo cáo Sự cố 8D',
    cronSchedule: '30 17 * * *',
    departmentId: 'marketing',
    assignedAgentKey: 'chaian',
    assignedAgentName: 'Chaian (Marketing & Kiểm Định QC)',
    description: 'Tổng kết tỷ lệ lỗi in (chênh màu Delta E > 3, trầy xước, sai khổ màng), kích hoạt kịch bản cô lập lỗi CAPA 8D cho ca sản xuất tiếp theo.',
    targetZoneId: 'coworking',
    runCount: 0
  }
];

export async function executeAutomationJob(
  jobId: string,
  sops: SopDocument[],
  allAgents: AgentProfile[]
): Promise<AutomationRunLog> {
  const startTime = Date.now();
  const job = INITIAL_AUTOMATION_JOBS.find((j) => j.id === jobId);

  if (!job) {
    throw new Error(`Automation job ${jobId} not found.`);
  }

  const assignedAgent =
    allAgents.find((a) => a.characterKey === job.assignedAgentKey) || allAgents[0];

  let prompt = '';
  if (jobId === 'cron-mon-planning') {
    prompt = '/bgd Tổng hợp báo cáo điều hành tuần của 8 phòng ban, chỉ số OTIF và ma trận RACI';
  } else if (jobId === 'cron-daily-inventory') {
    prompt = '/kho Kiểm kê tồn kho bạt Hiflex và mực in, lập cảnh báo nhập hàng an toàn';
  } else if (jobId === 'cron-fri-debt') {
    prompt = '/kt Soạn thư đối chiếu và đôn đốc thu hồi công nợ đến hạn đợt 2 cho các hợp đồng B2B';
  } else {
    prompt = '/cskh Tổng hợp tỷ lệ phế phẩm xưởng in và kích hoạt quy trình kiểm soát lỗi 8D';
  }

  const report = generateLocalSopGroundedReport(assignedAgent, prompt, allAgents, sops);
  const durationMs = Date.now() - startTime;

  const log: AutomationRunLog = {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    jobId: job.id,
    title: job.title,
    status: 'success',
    executedAt: new Date().toISOString(),
    durationMs,
    summary: report.summary,
    reportHeadline: report.headline,
    keyFindings: report.keyFindings,
    totalAmountFormatted: report.totalAmountFormatted
  };

  // Update job stats
  job.lastRunAt = log.executedAt;
  job.lastStatus = 'success';
  job.lastSummary = report.headline;
  job.runCount += 1;

  // Persist to SQLite DB
  db.saveAutomationRun(log);

  return log;
}
