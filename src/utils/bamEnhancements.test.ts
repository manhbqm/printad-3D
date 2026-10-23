import test, { describe } from 'node:test';
import assert from 'node:assert';
import { quotaManager, AiQuotaManager } from './aiQuotaManager';
import {
  formatTerseMessage,
  parseTerseMessage,
  expandTerseToUserFacing,
  estimateTokenSavings
} from './terseProtocol';
import { kpiTracker, KpiTracker } from './kpiTracker';
import { computeAgentWaypoint } from './officeLogic';
import { INITIAL_AGENTS, OFFICE_ZONES } from '../data/officeData';
import { EnterpriseDatabase } from './database';
import { TaskAssignment } from '../types/office';

describe('BAM Innovations: Quota Management, Terse Dialect & KPI Performance', () => {
  // -------------------------------------------------------------
  // 1. Quota Manager & 3D Rest Walk
  // -------------------------------------------------------------
  describe('1. AI Quota Manager & 3D Rest Walk', () => {
    test('triggers rate limit, records rest status, and calculates remaining seconds', () => {
      const qm = new AiQuotaManager();
      const rec = qm.triggerRateLimit(
        'agent-shizuka',
        'Shizuka (Sales B2B)',
        'shizuka',
        'groq',
        30,
        'Chạm giới hạn 429 TPM của Groq Cloud'
      );

      assert.strictEqual(rec.status, 'resting');
      assert.strictEqual(qm.isAgentResting('agent-shizuka'), true);

      const status = qm.getAgentRestStatus('agent-shizuka');
      assert.ok(status);
      assert.strictEqual(status.isResting, true);
      assert.ok(status.remainingSec > 0 && status.remainingSec <= 30);
      assert.strictEqual(status.provider, 'groq');
    });

    test('wakes agent manually before cooldown expiration', () => {
      const qm = new AiQuotaManager();
      qm.triggerRateLimit('agent-dekisugi', 'Dekisugi', 'dekisugi', 'gemini', 120);
      assert.strictEqual(qm.isAgentResting('agent-dekisugi'), true);

      const woken = qm.wakeAgent('agent-dekisugi');
      assert.strictEqual(woken, true);
      assert.strictEqual(qm.isAgentResting('agent-dekisugi'), false);
    });

    test('auto-recovers agent once cooldown timestamp has passed', () => {
      const qm = new AiQuotaManager();
      // Set 0 seconds cooldown so it expires immediately
      qm.triggerRateLimit('agent-chaian', 'Chaian', 'chaian', 'groq', 0);

      // isAgentResting should detect expiration, mark recovered and return false
      assert.strictEqual(qm.isAgentResting('agent-chaian'), false);
    });

    test('computeAgentWaypoint routes resting agent to Central Lounge / Coffee area', () => {
      const agent = INITIAL_AGENTS.find((a) => a.characterKey === 'shizuka')!;
      const normalWp = computeAgentWaypoint(agent, [], OFFICE_ZONES, false, 1, false);
      const restingWp = computeAgentWaypoint(
        agent,
        [],
        OFFICE_ZONES,
        false,
        1,
        true,
        '☕ Nghỉ ngơi Lounge (Reset sau 45s)'
      );

      assert.notDeepStrictEqual(normalWp.position, restingWp.position);
      assert.ok(restingWp.stateLabel.includes('Nghỉ ngơi Lounge'));
      assert.strictEqual(restingWp.isMovingTarget, true);
    });
  });

  // -------------------------------------------------------------
  // 2. Terse Inter-Agent Communication Protocol (BAMshort)
  // -------------------------------------------------------------
  describe('2. BAMshort Terse Inter-Agent Protocol', () => {
    test('formats payload into single-line compact syntax with emojis and metrics', () => {
      const line = formatTerseMessage({
        from: 'doraemon',
        to: 'shizuka',
        action: 'CALC_QUOTE',
        refId: 'PO-8812',
        status: 'OK',
        metrics: { m2: 2000, vat: '8%', total: '68M' },
        note: 'Báo giá bạt hiflex Takata hoàn tất'
      });

      assert.ok(line.startsWith('[CALC_QUOTE] @doraemon -> @shizuka [#PO-8812]'));
      assert.ok(line.includes('🟢 OK'));
      assert.ok(line.includes('{m2=2000,vat=8%,total=68M}'));
      assert.ok(line.includes(': Báo giá bạt hiflex Takata hoàn tất'));
    });

    test('parses terse 1-line message back into structured object with extracted numbers', () => {
      const raw = '[CALC_QUOTE] @doraemon -> @shizuka [#PO-8812] 🟢 OK {m2=2000,total=68000000} : Đã tính toán xong';
      const parsed = parseTerseMessage(raw);

      assert.ok(parsed);
      assert.strictEqual(parsed.action, 'CALC_QUOTE');
      assert.strictEqual(parsed.from, 'doraemon');
      assert.strictEqual(parsed.to, 'shizuka');
      assert.strictEqual(parsed.refId, 'PO-8812');
      assert.strictEqual(parsed.status, 'OK');
      assert.strictEqual(parsed.metrics?.m2, 2000);
      assert.strictEqual(parsed.metrics?.total, 68000000);
      assert.strictEqual(parsed.note, 'Đã tính toán xong');
    });

    test('expands parsed terse message into polite user-facing Vietnamese summary', () => {
      const raw = '[GATE_APPROVAL] @shizuka -> @doraemon [#ORD-991] 🔒 LOCK {total=45M,discount=18%} : Cần phê duyệt chiết khấu';
      const parsed = parseTerseMessage(raw);
      assert.ok(parsed);

      const userText = expandTerseToUserFacing(parsed);
      assert.ok(userText.includes('[Báo cáo Điều Hành PrintAd 3D]'));
      assert.ok(userText.includes('Yêu cầu Duyệt Cổng An toàn'));
      assert.ok(userText.includes('🔒 Yêu cầu Cổng Phê Duyệt'));
      assert.ok(userText.includes('Cần phê duyệt chiết khấu'));
    });

    test('estimates token savings accurately (>60% reduction)', () => {
      const verboseText = `
        Kính chào Giám đốc Doraemon,
        Tôi là Shizuka phụ trách Bộ phận Kinh Doanh B2B.
        Vừa qua tôi đã nhận được chỉ đạo tính toán đơn hàng cho khách hàng Takata Vietnam.
        Sau khi đối chiếu quy chuẩn kỹ thuật và kiểm tra tồn kho tại xưởng in, tôi xin phép gửi bảng chiết tính chi tiết đơn hàng số lượng 2000m2 bạt hiflex với tổng kinh phí là 68.000.000 VNĐ đã bao gồm thuế VAT 8%.
        Rất mong nhận được phản hồi sớm từ Ban Giám Đốc.
      `;
      const terseText = '[CALC_QUOTE] @doraemon -> @shizuka [#PO-8812] 🟢 OK {m2=2000,vat=8%,total=68M} : Báo giá bạt Takata hoàn tất';

      const est = estimateTokenSavings(verboseText, terseText);
      assert.ok(est.verboseTokens > est.terseTokens);
      assert.ok(est.savingPercent >= 60, `Expected >= 60% savings, got ${est.savingPercent}%`);
    });
  });

  // -------------------------------------------------------------
  // 3. AI Personnel Performance & KPI Tracker
  // -------------------------------------------------------------
  describe('3. AI Personnel Performance & KPI Tracker', () => {
    test('records task execution and computes accurate latency and token metrics', () => {
      const tracker = new KpiTracker();
      tracker.resetAll();

      tracker.recordTaskExecution({
        taskId: 'task-test-01',
        agentId: 'agent-shizuka',
        agentName: 'Shizuka',
        departmentId: 'sales_b2b',
        roleTier: 'manager',
        executionTimeMs: 250,
        status: 'completed',
        tokensUsed: 120,
        isTerseOptimized: true
      });

      const kpi = tracker.getAgentKpi('agent-shizuka');
      assert.ok(kpi);
      assert.strictEqual(kpi.tasksCompleted, 99); // 98 baseline + 1
      assert.ok(kpi.tokensSaved > 0);
    });

    test('detects stale tasks exceeding execution threshold (BAM StaleMin)', () => {
      const tracker = new KpiTracker();
      const pastTime = new Date(Date.now() - 90 * 1000).toISOString(); // 90 seconds ago

      const mockTasks: TaskAssignment[] = [
        {
          id: 'stale-task-01',
          agentId: 'agent-chaian',
          title: 'In 50.000 tờ rơi Offset',
          prompt: 'Tiến hành in trên máy Komori',
          priority: 'high',
          targetZoneId: 'sales_quoting',
          status: 'analyzing_sop',
          progress: 30,
          appliedSopIds: ['SOP-01'],
          spatialStepText: 'Đang kiểm tra...',
          createdAt: pastTime
        },
        {
          id: 'fresh-task-02',
          agentId: 'agent-shizuka',
          title: 'Báo giá nhanh Decal',
          prompt: 'Báo giá decal',
          priority: 'normal',
          targetZoneId: 'sales_quoting',
          status: 'analyzing_sop',
          progress: 10,
          appliedSopIds: [],
          spatialStepText: 'Đang tính...',
          createdAt: new Date().toISOString()
        }
      ];

      const staleAlerts = tracker.checkStaleTasks(mockTasks, 60);
      assert.strictEqual(staleAlerts.length, 1);
      assert.strictEqual(staleAlerts[0].taskId, 'stale-task-01');
      assert.strictEqual(staleAlerts[0].isStale, true);
      assert.ok(staleAlerts[0].elapsedSec >= 89);
    });

    test('getKpiSummary aggregates overall metrics and VND cost savings', () => {
      const tracker = new KpiTracker();
      const summary = tracker.getKpiSummary();

      assert.ok(summary.totalTasksProcessed > 500);
      assert.ok(summary.overallAvgLatencyMs > 0 && summary.overallAvgLatencyMs < 400);
      assert.ok(summary.overallSopComplianceRate >= 90);
      assert.ok(summary.estimatedVndSaved > 100000);
    });
  });

  // -------------------------------------------------------------
  // 4. SQLite KPI Table Persistence
  // -------------------------------------------------------------
  describe('4. SQLite Database KPI Persistence', () => {
    test('persists and retrieves agent KPI records in SQLite database', () => {
      const db = new EnterpriseDatabase(':memory:');
      const testKpi = {
        agentId: 'agent-test-doraemon',
        agentName: 'Doraemon Test',
        characterKey: 'doraemon',
        departmentId: 'board_executive' as const,
        roleTier: 'ceo',
        tasksAssigned: 10,
        tasksCompleted: 9,
        tasksRejected: 1,
        totalLatencyMs: 1800,
        avgLatencyMs: 200,
        tokensUsed: 5000,
        tokensSaved: 12000,
        rateLimitHits: 1,
        isResting: false,
        restRemainingSec: 0,
        lastActiveAt: new Date().toISOString()
      };

      db.upsertAgentKpi(testKpi);
      const loaded = db.getAgentKpis();
      assert.ok(loaded.length >= 1);

      const found = loaded.find((k) => k.agentId === 'agent-test-doraemon');
      assert.ok(found);
      assert.strictEqual(found.tasksCompleted, 9);
      assert.strictEqual(found.avgLatencyMs, 200);
      assert.strictEqual(found.tokensSaved, 12000);
    });
  });
});
