import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateApprovalRequired,
  createApprovalCard,
  resolveApprovalCard
} from './approvalEngine';
import { EnterpriseDatabase } from './database';
import {
  INITIAL_AUTOMATION_JOBS,
  executeAutomationJob
} from './automationEngine';
import { processExternalIncomingOrder } from './channelGateway';
import { INITIAL_AGENTS, INITIAL_SOP_DOCUMENTS } from '../data/officeData';

describe('Enterprise Features: Approval Gate, SQLite DB, Automations & Webhooks', () => {
  describe('1. Approval Gate Engine', () => {
    it('flags orders >= 30,000,000 VND and >= 50,000,000 VND as requiring CEO approval', () => {
      const eval50M = evaluateApprovalRequired({ rawAmountVnd: 68_000_000 });
      assert.equal(eval50M.requiresApproval, true);
      assert.equal(eval50M.riskLevel, 'critical');
      assert.ok(eval50M.triggers.some((t) => t.includes('50.000.000đ')));

      const eval30M = evaluateApprovalRequired({ rawAmountVnd: 35_000_000 });
      assert.equal(eval30M.requiresApproval, true);
      assert.equal(eval30M.riskLevel, 'high');
      assert.ok(eval30M.triggers.some((t) => t.includes('30.000.000đ')));
    });

    it('flags discount > 15% and rush orders', () => {
      const evalDiscount = evaluateApprovalRequired({
        rawAmountVnd: 5_000_000,
        discountPercent: 18,
        isRushOrder: true
      });
      assert.equal(evalDiscount.requiresApproval, true);
      assert.ok(evalDiscount.triggers.some((t) => t.includes('18%')));
      assert.ok(evalDiscount.triggers.some((t) => t.includes('hỏa tốc')));
    });

    it('flags B2B contracts and 8D defect complaints', () => {
      const evalContract = evaluateApprovalRequired({
        taskPrompt: 'Soạn thảo Hợp đồng kinh tế B2B cung ứng 2.000m2 bạt phạt trần 8%',
        documentType: 'contract'
      });
      assert.equal(evalContract.requiresApproval, true);
      assert.ok(evalContract.triggers.some((t) => t.includes('Hợp đồng kinh tế B2B')));

      const eval8D = evaluateApprovalRequired({
        taskPrompt: 'Khách hàng phản ánh lô hàng in bạt bị trầy xước kích hoạt quy trình 8D'
      });
      assert.equal(eval8D.requiresApproval, true);
      assert.ok(eval8D.triggers.some((t) => t.includes('8D')));
    });

    it('allows routine small tasks without approval', () => {
      const evalRoutine = evaluateApprovalRequired({
        rawAmountVnd: 450_000,
        discountPercent: 5,
        isRushOrder: false,
        taskPrompt: 'In 5m2 bạt hiflex bình thường'
      });
      assert.equal(evalRoutine.requiresApproval, false);
      assert.equal(evalRoutine.riskLevel, 'low');
    });

    it('creates and resolves approval cards cleanly', () => {
      const evalHigh = evaluateApprovalRequired({ rawAmountVnd: 42_000_000, discountPercent: 16 });
      const card = createApprovalCard({
        taskId: 'task-test-01',
        title: 'Duyệt Báo giá Takata 42.000.000đ',
        departmentId: 'sales_b2b',
        agentId: 'agent-dekisugi',
        agentName: 'Dekisugi',
        evaluation: evalHigh,
        totalAmountFormatted: '42.000.000đ',
        rawAmountVnd: 42_000_000,
        discountPercent: 16,
        customerName: 'Takata Vietnam',
        productSummary: 'In Bạt Hiflex 2000m2'
      });

      assert.equal(card.status, 'pending');
      assert.ok(card.id.startsWith('appr-'));
      assert.equal(card.details.rawAmountVnd, 42_000_000);

      const approved = resolveApprovalCard(card, 'approved', 'Doraemon (CEO)', 'Đồng ý duyệt giá đối tác');
      assert.equal(approved.status, 'approved');
      assert.equal(approved.reviewedBy, 'Doraemon (CEO)');
      assert.equal(approved.reviewNote, 'Đồng ý duyệt giá đối tác');
      assert.ok(approved.reviewedAt);
    });
  });

  describe('2. Embedded SQLite Database', () => {
    it('initializes in memory and performs full CRUD for orders, documents and approvals', () => {
      const testDb = new EnterpriseDatabase(':memory:');

      // 1. Order CRUD
      const order = testDb.saveOrder({
        id: 'ORD-TEST-001',
        taskId: 'task-001',
        customerName: 'Tập đoàn Vingroup',
        productType: 'hiflex',
        specsSummary: 'Hiflex 3.2m x 50m, 10 cuộn',
        quantity: 10,
        subtotalVnd: 50_000_000,
        discountPercent: 10,
        vatVnd: 4_000_000,
        grandTotalVnd: 49_000_000,
        status: 'pending_approval',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      assert.equal(order.id, 'ORD-TEST-001');

      const fetchedOrder = testDb.getOrder('ORD-TEST-001');
      assert.ok(fetchedOrder);
      assert.equal(fetchedOrder?.customerName, 'Tập đoàn Vingroup');
      assert.equal(fetchedOrder?.grandTotalVnd, 49_000_000);

      testDb.updateOrderStatus('ORD-TEST-001', 'approved');
      const updatedOrder = testDb.getOrder('ORD-TEST-001');
      assert.equal(updatedOrder?.status, 'approved');

      // 2. Document CRUD
      testDb.saveDocument({
        id: 'DOC-TEST-001',
        orderId: 'ORD-TEST-001',
        documentType: 'contract',
        title: 'Hợp Đồng Kinh Tế In Ấn 2026',
        documentNumber: 'HĐ-2026/01/VIN',
        content: 'Nội dung hợp đồng cam kết chất lượng...',
        legalBasis: 'Luật Thương mại 2005',
        createdAt: new Date().toISOString()
      });

      const docs = testDb.listDocuments(10);
      assert.ok(docs.some((d) => d.id === 'DOC-TEST-001' && d.title === 'Hợp Đồng Kinh Tế In Ấn 2026'));

      // 3. Approval Card CRUD
      const card = testDb.saveApprovalCard({
        id: 'appr-test-123',
        taskId: 'task-001',
        orderId: 'ORD-TEST-001',
        title: 'Duyệt Đơn Hàng 49M',
        departmentId: 'sales_b2b',
        agentId: 'agent-1',
        agentName: 'Dekisugi',
        requiredApprover: 'CEO',
        riskLevel: 'high',
        triggers: ['Vượt 30M'],
        details: {
          totalAmountFormatted: '49.000.000đ',
          rawAmountVnd: 49_000_000,
          discountPercent: 10,
          productSummary: 'In Bạt'
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      assert.equal(card.id, 'appr-test-123');

      const pendingCards = testDb.listApprovalCards('pending');
      assert.ok(pendingCards.some((c) => c.id === 'appr-test-123'));

      // 4. Stats
      const stats = testDb.getStats();
      assert.ok(stats.totalOrders >= 1);
      assert.ok(stats.totalRevenueVnd >= 49_000_000);
      assert.ok(stats.pendingApprovals >= 1);
      assert.ok(stats.totalDocuments >= 1);
    });
  });

  describe('3. Automated Recurring Jobs Engine', () => {
    it('contains all 4 predefined industrial automations', () => {
      assert.equal(INITIAL_AUTOMATION_JOBS.length, 4);
      const codes = INITIAL_AUTOMATION_JOBS.map((j) => j.code);
      assert.ok(codes.includes('AUTO-MON-0830'));
      assert.ok(codes.includes('AUTO-DAY-1130'));
      assert.ok(codes.includes('AUTO-FRI-1630'));
      assert.ok(codes.includes('AUTO-DAY-1730'));
    });

    it('executes Monday All-Hands Planning automation and returns valid run log', async () => {
      const log = await executeAutomationJob(
        'cron-mon-planning',
        INITIAL_SOP_DOCUMENTS,
        INITIAL_AGENTS
      );
      assert.equal(log.status, 'success');
      assert.ok(log.reportHeadline.length > 0);
      assert.ok(log.keyFindings.length > 0);
      assert.ok(log.durationMs >= 0);
    });

    it('executes Daily Inventory Check automation', async () => {
      const log = await executeAutomationJob(
        'cron-daily-inventory',
        INITIAL_SOP_DOCUMENTS,
        INITIAL_AGENTS
      );
      assert.equal(log.status, 'success');
      assert.ok(log.summary.length > 0);
    });
  });

  describe('4. External Channels & Webhook Ingestion Gateway', () => {
    it('ingests high-value Telegram order, quotes it and routes through Approval Gate', () => {
      const result = processExternalIncomingOrder(
        {
          source: 'telegram',
          externalId: 'tg-user-998877',
          senderName: 'Anh Tuấn Giám Đốc Chuỗi Siêu Thị',
          rawMessage: 'Cần in gấp 1.500m2 bạt Hiflex khổ 3.2m và giao hàng trong 24h',
          materialType: 'hiflex',
          widthMeters: 50,
          heightMeters: 30, // 1500m2
          quantity: 1,
          rushOrder: true
        },
        INITIAL_AGENTS,
        INITIAL_SOP_DOCUMENTS
      );

      assert.equal(result.success, true);
      assert.ok(result.orderId.startsWith('PO-'));
      assert.equal(result.requiresApproval, true); // > 30M and rush order!
      assert.ok(result.approvalCard);
      assert.equal(result.approvalCard?.status, 'pending');
      assert.ok(result.botResponseMessage.includes('CHI TIẾT BÁO GIÁ KỸ THUẬT'));
      assert.ok(result.botResponseMessage.includes('CỔNG PHÊ DUYỆT BAN GIÁM ĐỐC'));
    });

    it('ingests routine small Zalo order without approval requirement', () => {
      const result = processExternalIncomingOrder(
        {
          source: 'zalo',
          externalId: 'zalo-0912345678',
          senderName: 'Chị Mai Cửa Hàng Thời Trang',
          rawMessage: 'In giúp em 1 tấm bạt 2m x 1m treo biển hiệu',
          materialType: 'hiflex',
          widthMeters: 2,
          heightMeters: 1,
          quantity: 1,
          rushOrder: false
        },
        INITIAL_AGENTS,
        INITIAL_SOP_DOCUMENTS
      );

      assert.equal(result.success, true);
      assert.equal(result.requiresApproval, false);
      assert.ok(result.botResponseMessage.includes('✅ Đơn hàng đã được Trưởng phòng'));
    });
  });
});
