import {
  AgentKpiRecord,
  KpiSummaryMetrics,
  StaleTaskAlert
} from '../types/enterprise';
import { DepartmentId, TaskAssignment } from '../types/office';
import { quotaManager } from './aiQuotaManager';

const INITIAL_AGENT_METRICS: Array<{
  agentId: string;
  agentName: string;
  characterKey: string;
  departmentId: DepartmentId;
  roleTier: string;
  tasksCompleted: number;
  tasksRejected: number;
  avgLatencyMs: number;
  tokensUsed: number;
  tokensSaved: number;
}> = [
  { agentId: 'agent-doraemon', agentName: 'Doraemon (CEO)', characterKey: 'doraemon', departmentId: 'board_executive', roleTier: 'ceo', tasksCompleted: 142, tasksRejected: 2, avgLatencyMs: 185, tokensUsed: 42100, tokensSaved: 112000 },
  { agentId: 'agent-shizuka', agentName: 'Shizuka (Sales B2B)', characterKey: 'shizuka', departmentId: 'sales_b2b', roleTier: 'manager', tasksCompleted: 98, tasksRejected: 3, avgLatencyMs: 210, tokensUsed: 28400, tokensSaved: 74500 },
  { agentId: 'agent-dekisugi', agentName: 'Dekisugi (KCS/8D)', characterKey: 'dekisugi', departmentId: 'customer_service', roleTier: 'manager', tasksCompleted: 85, tasksRejected: 1, avgLatencyMs: 195, tokensUsed: 24500, tokensSaved: 68000 },
  { agentId: 'agent-suneo', agentName: 'Suneo (Marketing)', characterKey: 'suneo', departmentId: 'marketing', roleTier: 'manager', tasksCompleted: 64, tasksRejected: 4, avgLatencyMs: 230, tokensUsed: 19200, tokensSaved: 51000 },
  { agentId: 'agent-dorami', agentName: 'Dorami (Kế Toán/Tài Chính)', characterKey: 'dorami', departmentId: 'accounting', roleTier: 'manager', tasksCompleted: 110, tasksRejected: 0, avgLatencyMs: 170, tokensUsed: 31000, tokensSaved: 88000 },
  { agentId: 'agent-chaian', agentName: 'Chaian (Xưởng In Offset)', characterKey: 'chaian', departmentId: 'sales_quoting', roleTier: 'manager', tasksCompleted: 76, tasksRejected: 2, avgLatencyMs: 245, tokensUsed: 22100, tokensSaved: 59000 },
  { agentId: 'agent-nobita', agentName: 'Nobita (Xưởng Gia Công)', characterKey: 'nobita', departmentId: 'warehouse_supply', roleTier: 'manager', tasksCompleted: 58, tasksRejected: 5, avgLatencyMs: 260, tokensUsed: 17500, tokensSaved: 46000 },
  { agentId: 'agent-sensei', agentName: 'Thầy Giáo (Nhân Sự/HR)', characterKey: 'sensei', departmentId: 'human_resources', roleTier: 'manager', tasksCompleted: 45, tasksRejected: 1, avgLatencyMs: 190, tokensUsed: 13000, tokensSaved: 35000 },
  { agentId: 'agent-kaminari', agentName: 'Bác Kaminari (Kho Vật Tư)', characterKey: 'kaminari', departmentId: 'administration_ehs', roleTier: 'manager', tasksCompleted: 52, tasksRejected: 1, avgLatencyMs: 215, tokensUsed: 15400, tokensSaved: 41000 },
  { agentId: 'agent-jaiko', agentName: 'Jaiko (Thiết Kế/Prepress)', characterKey: 'jaiko', departmentId: 'design_tech', roleTier: 'executive', tasksCompleted: 41, tasksRejected: 2, avgLatencyMs: 220, tokensUsed: 12100, tokensSaved: 32000 },
  { agentId: 'agent-minidora_red', agentName: 'Mini-Dora Đỏ (Trợ Lý Điều Hành)', characterKey: 'minidora_red', departmentId: 'board_executive', roleTier: 'executive', tasksCompleted: 63, tasksRejected: 0, avgLatencyMs: 140, tokensUsed: 14200, tokensSaved: 48000 },
  { agentId: 'agent-minidora_yellow', agentName: 'Mini-Dora Vàng (Kiểm Toán)', characterKey: 'minidora_yellow', departmentId: 'accounting', roleTier: 'executive', tasksCompleted: 57, tasksRejected: 0, avgLatencyMs: 155, tokensUsed: 13800, tokensSaved: 44000 },
  { agentId: 'agent-tamako', agentName: 'Mẹ Nobita (Thủ Quỹ)', characterKey: 'tamako', departmentId: 'accounting', roleTier: 'executive', tasksCompleted: 39, tasksRejected: 1, avgLatencyMs: 180, tokensUsed: 9800, tokensSaved: 28000 },
  { agentId: 'agent-nobisuke', agentName: 'Bố Nobita (An Toàn EHS)', characterKey: 'nobisuke', departmentId: 'administration_ehs', roleTier: 'executive', tasksCompleted: 34, tasksRejected: 0, avgLatencyMs: 190, tokensUsed: 8900, tokensSaved: 25000 },
  { agentId: 'agent-sewashi', agentName: 'Sewashi (R&D Công Nghệ)', characterKey: 'sewashi', departmentId: 'design_tech', roleTier: 'executive', tasksCompleted: 29, tasksRejected: 1, avgLatencyMs: 210, tokensUsed: 7800, tokensSaved: 22000 },
  { agentId: 'agent-sunetsugu', agentName: 'Sunetsugu (Truyền Thông B2B)', characterKey: 'sunetsugu', departmentId: 'marketing', roleTier: 'executive', tasksCompleted: 31, tasksRejected: 2, avgLatencyMs: 225, tokensUsed: 8400, tokensSaved: 23500 },
  { agentId: 'agent-goda_mom', agentName: 'Mẹ Chaian (Giao Hàng/Logistics)', characterKey: 'goda_mom', departmentId: 'warehouse_supply', roleTier: 'executive', tasksCompleted: 44, tasksRejected: 1, avgLatencyMs: 205, tokensUsed: 10500, tokensSaved: 29000 }
];

export class KpiTracker {
  private kpiMap: Map<string, AgentKpiRecord> = new Map();

  constructor() {
    this.seedInitialMetrics();
  }

  private seedInitialMetrics() {
    INITIAL_AGENT_METRICS.forEach((item) => {
      const assigned = item.tasksCompleted + item.tasksRejected;
      this.kpiMap.set(item.agentId, {
        agentId: item.agentId,
        agentName: item.agentName,
        characterKey: item.characterKey,
        departmentId: item.departmentId,
        roleTier: item.roleTier,
        tasksAssigned: assigned,
        tasksCompleted: item.tasksCompleted,
        tasksRejected: item.tasksRejected,
        totalLatencyMs: item.avgLatencyMs * item.tasksCompleted,
        avgLatencyMs: item.avgLatencyMs,
        tokensUsed: item.tokensUsed,
        tokensSaved: item.tokensSaved,
        rateLimitHits: 0,
        isResting: false,
        restRemainingSec: 0,
        lastActiveAt: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString()
      });
    });
  }

  /**
   * Record a completed or rejected task execution for an agent.
   */
  public recordTaskExecution(params: {
    taskId: string;
    agentId: string;
    agentName: string;
    characterKey?: string;
    departmentId?: DepartmentId;
    roleTier?: string;
    executionTimeMs: number;
    status: 'completed' | 'rejected';
    tokensUsed: number;
    isTerseOptimized?: boolean;
  }): AgentKpiRecord {
    let record = this.kpiMap.get(params.agentId);

    if (!record) {
      record = {
        agentId: params.agentId,
        agentName: params.agentName,
        characterKey: params.characterKey || 'doraemon',
        departmentId: params.departmentId || 'board_executive',
        roleTier: params.roleTier || 'manager',
        tasksAssigned: 0,
        tasksCompleted: 0,
        tasksRejected: 0,
        totalLatencyMs: 0,
        avgLatencyMs: 0,
        tokensUsed: 0,
        tokensSaved: 0,
        rateLimitHits: 0,
        isResting: false,
        restRemainingSec: 0,
        lastActiveAt: new Date().toISOString()
      };
      this.kpiMap.set(params.agentId, record);
    }

    record.tasksAssigned += 1;
    if (params.status === 'completed') {
      record.tasksCompleted += 1;
      record.totalLatencyMs += Math.max(1, params.executionTimeMs);
      record.avgLatencyMs = Math.round(record.totalLatencyMs / record.tasksCompleted);
    } else {
      record.tasksRejected += 1;
    }

    record.tokensUsed += Math.max(0, params.tokensUsed);
    if (params.isTerseOptimized) {
      // Estimated ~75% tokens saved through Terse compression protocol
      const saved = Math.round(params.tokensUsed * 2.5);
      record.tokensSaved += saved;
    }

    record.lastActiveAt = new Date().toISOString();
    return { ...record };
  }

  /**
   * Record a rate limit hit event.
   */
  public recordRateLimitHit(agentId: string): void {
    const record = this.kpiMap.get(agentId);
    if (record) {
      record.rateLimitHits += 1;
    }
  }

  /**
   * Get single agent KPI record with real-time resting status from AiQuotaManager.
   */
  public getAgentKpi(agentId: string): AgentKpiRecord | undefined {
    const record = this.kpiMap.get(agentId);
    if (!record) return undefined;

    const restStatus = quotaManager.getAgentRestStatus(agentId);
    return {
      ...record,
      isResting: !!restStatus?.isResting,
      restRemainingSec: restStatus?.remainingSec || 0
    };
  }

  /**
   * Get all 17 agent KPIs with current rest status.
   */
  public getAllAgentKpis(): AgentKpiRecord[] {
    return Array.from(this.kpiMap.values()).map((record) => {
      const restStatus = quotaManager.getAgentRestStatus(record.agentId);
      return {
        ...record,
        isResting: !!restStatus?.isResting,
        restRemainingSec: restStatus?.remainingSec || 0
      };
    });
  }

  /**
   * Aggregate overall KPI summary metrics.
   */
  public getKpiSummary(): KpiSummaryMetrics {
    const all = this.getAllAgentKpis();
    let totalCompleted = 0;
    let totalAssigned = 0;
    let totalLatency = 0;
    let totalTokensUsed = 0;
    let totalTokensSaved = 0;

    all.forEach((r) => {
      totalCompleted += r.tasksCompleted;
      totalAssigned += r.tasksAssigned;
      totalLatency += r.totalLatencyMs;
      totalTokensUsed += r.tokensUsed;
      totalTokensSaved += r.tokensSaved;
    });

    const overallAvgLatencyMs = totalCompleted > 0 ? Math.round(totalLatency / totalCompleted) : 0;
    const overallSopComplianceRate = totalAssigned > 0
      ? Number(((totalCompleted / totalAssigned) * 100).toFixed(1))
      : 100;

    // Cost saved: 1 token ~ 0.25 VND (commercial blended LLM API rate: ~10 USD / 1M tokens)
    const estimatedVndSaved = Math.round(totalTokensSaved * 0.25);
    const currentlyRestingAgents = quotaManager.getAllRestingAgents().length;

    return {
      totalTasksProcessed: totalCompleted,
      overallAvgLatencyMs,
      overallSopComplianceRate,
      totalTokensConsumed: totalTokensUsed,
      totalTokensSaved,
      estimatedVndSaved,
      currentlyRestingAgents,
      staleTasksCount: 0
    };
  }

  /**
   * Check for stale / blocked tasks that exceed the SLA execution threshold (BAM StaleMin pattern).
   */
  public checkStaleTasks(tasks: TaskAssignment[], thresholdSeconds: number = 60): StaleTaskAlert[] {
    const now = Date.now();
    const alerts: StaleTaskAlert[] = [];

    tasks.forEach((t) => {
      if (t.status === 'analyzing_sop' || t.status === 'executing_3d') {
        const createdTime = new Date(t.createdAt).getTime();
        const elapsedSec = Math.max(0, Math.floor((now - createdTime) / 1000));

        if (elapsedSec >= thresholdSeconds) {
          const agentKpi = this.kpiMap.get(t.agentId);
          alerts.push({
            taskId: t.id,
            agentId: t.agentId,
            agentName: agentKpi?.agentName || t.agentId,
            taskTitle: t.title,
            pendingSince: t.createdAt,
            elapsedSec,
            isStale: true,
            recommendedAction:
              elapsedSec > 180
                ? 'Nhiệm vụ tắc nghẽn nghiêm trọng (>3m): Tự động chuyển giao cho nhân sự dự phòng hoặc Fallback sang Local SOP Engine.'
                : 'Cảnh báo chậm trễ: Đề xuất kiểm tra kết nối API hoặc chuyển trạng thái sang Chờ duyệt.'
          });
        }
      }
    });

    return alerts;
  }

  /**
   * Reset all metrics to baseline (for testing).
   */
  public resetAll(): void {
    this.kpiMap.clear();
    this.seedInitialMetrics();
  }
}

export const kpiTracker = new KpiTracker();
