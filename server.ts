import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { INITIAL_AGENTS, INITIAL_SOP_DOCUMENTS } from './src/data/officeData';
import {
  generateLocalSopGroundedReport,
  validateScopeAndRoute
} from './src/utils/officeLogic';
import {
  executeMultiModelTask,
  getAgentModelConfig,
  getModelConfigByTier,
  getAgentTier
} from './src/utils/aiMultiModelDispatcher';
import { AgentProfile, SopDocument, TaskReport } from './src/types/office';
import { db } from './src/utils/database';
import {
  createApprovalCard,
  evaluateApprovalRequired,
  resolveApprovalCard
} from './src/utils/approvalEngine';
import {
  INITIAL_AUTOMATION_JOBS,
  executeAutomationJob
} from './src/utils/automationEngine';
import { processExternalIncomingOrder } from './src/utils/channelGateway';
import { ExternalOrderPayload, OrderRecord } from './src/types/enterprise';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // Endpoint to inspect active multi-model role tier configurations & key statuses
  app.get('/api/agent/models-config', (_req, res) => {
    const isKeyValid = (k?: string) =>
      !!k &&
      !k.startsWith('MY_') &&
      k.trim().length > 6;

    const ceoConfig = getModelConfigByTier('ceo');
    const managerConfig = getModelConfigByTier('manager');
    const execConfig = getModelConfigByTier('executive');

    res.json({
      tiers: {
        ceo: {
          title: ceoConfig.roleTierTitle,
          assignedCharacters: ['Doraemon (Giám Đốc Điều Hành)'],
          provider: ceoConfig.provider,
          providerName: ceoConfig.providerName,
          model: ceoConfig.modelName,
          hasKey:
            ceoConfig.provider === 'openai'
              ? isKeyValid(process.env.OPENAI_API_KEY)
              : ceoConfig.provider === 'gemini'
              ? isKeyValid(process.env.GEMINI_API_KEY)
              : isKeyValid(process.env.ANTHROPIC_API_KEY),
          badgeLabel: ceoConfig.badgeLabel,
          badgeColor: ceoConfig.badgeColor,
          description: ceoConfig.description
        },
        manager: {
          title: managerConfig.roleTierTitle,
          assignedCharacters: [
            'Dekisugi (Kinh Doanh B2B)',
            'Chaian (Marketing & QC)',
            'Shizuka (CSKH & Báo Giá)',
            'Suneo (Kế Toán & Chi Phí)',
            'Dorami (Nhân Sự & Đào Tạo)',
            'Bác Kaminari (Kho & Cung Ứng)',
            'Thầy Sensei (Hành Chính & EHS)',
            'Nobita (Kỹ Thuật Chế Bản & TK)'
          ],
          provider: managerConfig.provider,
          providerName: managerConfig.providerName,
          model: managerConfig.modelName,
          hasKey:
            managerConfig.provider === 'anthropic'
              ? isKeyValid(process.env.ANTHROPIC_API_KEY)
              : managerConfig.provider === 'openai'
              ? isKeyValid(process.env.OPENAI_API_KEY)
              : isKeyValid(process.env.GEMINI_API_KEY),
          badgeLabel: managerConfig.badgeLabel,
          badgeColor: managerConfig.badgeColor,
          description: managerConfig.description
        },
        executive: {
          title: execConfig.roleTierTitle,
          assignedCharacters: [
            'Jaiko (Nội dung MKT)',
            'Tamako (Kế toán thanh toán)',
            'Sewashi (Phân tích Data/CRM)',
            'Sunetsugu (Thu mua vật tư)',
            'Minidora Đỏ (Vận hành in Offset)',
            'Nobisuke (Bảo trì cơ điện)',
            'Minidora Vàng (An toàn 5S)',
            'Mẹ Chaian (Thủ kho)'
          ],
          provider: execConfig.provider,
          providerName: execConfig.providerName,
          model: execConfig.modelName,
          hasKey:
            execConfig.provider === 'gemini'
              ? isKeyValid(process.env.GEMINI_API_KEY)
              : execConfig.provider === 'openai'
              ? isKeyValid(process.env.OPENAI_API_KEY)
              : isKeyValid(process.env.ANTHROPIC_API_KEY),
          badgeLabel: execConfig.badgeLabel,
          badgeColor: execConfig.badgeColor,
          description: execConfig.description
        }
      }
    });
  });

  app.post('/api/agent/execute-task', async (req, res) => {
    try {
      const { agent, prompt, sops, allAgents } = req.body as {
        agent?: AgentProfile;
        prompt?: string;
        sops?: SopDocument[];
        allAgents?: AgentProfile[];
      };

      const targetAgent = agent || INITIAL_AGENTS[0];
      const taskPrompt = String(prompt || '').trim();
      const activeSops = Array.isArray(sops) ? sops : INITIAL_SOP_DOCUMENTS;
      const agentList = Array.isArray(allAgents) ? allAgents : INITIAL_AGENTS;

      if (!taskPrompt) {
        res.status(400).json({ error: 'Nội dung nhiệm vụ không được để trống.' });
        return;
      }

      // Execute via the multi-model role tier dispatcher
      const report = await executeMultiModelTask({
        agent: targetAgent,
        prompt: taskPrompt,
        sops: activeSops,
        allAgents: agentList
      });

      // Parse raw numeric amount if present
      let rawAmount = 0;
      if (report.totalAmountFormatted) {
        const cleaned = report.totalAmountFormatted.replace(/[^\d]/g, '');
        rawAmount = parseInt(cleaned, 10) || 0;
      }

      // Check Approval Gate evaluation
      const evaluation = evaluateApprovalRequired({
        rawAmountVnd: rawAmount,
        taskPrompt,
        report,
        documentType: report.formalDocument?.documentType
      });

      let approvalCard = undefined;
      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      const taskId = `task-${Date.now()}`;

      if (evaluation.requiresApproval) {
        approvalCard = createApprovalCard({
          taskId,
          orderId,
          title: `Duyệt: ${report.headline} (${report.totalAmountFormatted || 'Văn bản B2B'})`,
          departmentId: targetAgent.departmentId,
          agentId: targetAgent.id,
          agentName: targetAgent.name,
          evaluation,
          totalAmountFormatted: report.totalAmountFormatted || 'Theo quy chuẩn SOP',
          rawAmountVnd: rawAmount,
          discountPercent: rawAmount > 50000000 ? 18 : 10,
          customerName: 'Khách hàng B2B PrintAd',
          productSummary: report.headline,
          documentType: report.formalDocument?.documentType
        });
        db.saveApprovalCard(approvalCard);
      }

      // Persist Document if exists
      if (report.formalDocument) {
        db.saveDocument({
          id: report.formalDocument.id || `doc-${Date.now()}`,
          orderId,
          documentType: report.formalDocument.documentType,
          title: report.formalDocument.title,
          documentNumber: report.formalDocument.documentNumber || `PA-${Date.now().toString().slice(-4)}`,
          content: report.formalDocument.content,
          legalBasis: 'Nghị định 30/2020/NĐ-CP & Luật Thương mại 2005',
          createdAt: new Date().toISOString()
        });
      }

      // Persist Order
      const orderRec: OrderRecord = {
        id: orderId,
        taskId,
        customerName: 'Khách hàng B2B Doanh Nghiệp',
        productType: targetAgent.departmentId,
        specsSummary: report.headline,
        quantity: 1,
        subtotalVnd: rawAmount,
        discountPercent: 10,
        vatVnd: Math.round(rawAmount * 0.08),
        grandTotalVnd: rawAmount,
        status: evaluation.requiresApproval ? 'pending_approval' : 'approved',
        formalDocumentId: report.formalDocument?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.saveOrder(orderRec);

      res.json({ report, approvalCard, order: orderRec });
    } catch (err: any) {
      console.error('[ExecuteTask] Error:', err);
      const { agent, prompt, sops, allAgents } = req.body || {};
      const fallback = generateLocalSopGroundedReport(
        agent || INITIAL_AGENTS[0],
        String(prompt || 'Thực thi nhiệm vụ chuẩn SOP'),
        Array.isArray(allAgents) ? allAgents : INITIAL_AGENTS,
        Array.isArray(sops) ? sops : INITIAL_SOP_DOCUMENTS
      );
      res.json({ report: fallback });
    }
  });

  // --- APPROVAL GATE ENDPOINTS ---
  app.get('/api/approvals', (req, res) => {
    const statusFilter = req.query.status as any;
    const cards = db.listApprovalCards(statusFilter && statusFilter !== 'all' ? statusFilter : undefined);
    const stats = db.getStats();
    res.json({ approvals: cards, stats });
  });

  app.post('/api/approvals/:id/decision', (req, res) => {
    const { id } = req.params;
    const { decision, note, reviewerName } = req.body as {
      decision: 'approved' | 'rejected' | 'revision_requested';
      note?: string;
      reviewerName?: string;
    };

    const card = db.getApprovalCard(id);
    if (!card) {
      res.status(404).json({ error: 'Không tìm thấy thẻ phê duyệt.' });
      return;
    }

    const resolved = resolveApprovalCard(card, decision, reviewerName || 'Doraemon (Giám Đốc)', note);
    db.saveApprovalCard(resolved);

    if (resolved.orderId) {
      const orderStatus = decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'draft';
      db.updateOrderStatus(resolved.orderId, orderStatus);
    }

    res.json({ success: true, approvalCard: resolved });
  });

  // --- DATABASE & ORDERS ENDPOINTS ---
  app.get('/api/database/orders', (req, res) => {
    const limit = parseInt(String(req.query.limit || '50'), 10);
    const orders = db.listOrders(limit);
    const stats = db.getStats();
    res.json({ orders, stats });
  });

  app.get('/api/database/documents', (req, res) => {
    const limit = parseInt(String(req.query.limit || '30'), 10);
    const documents = db.listDocuments(limit);
    res.json({ documents });
  });

  // --- AUTOMATIONS & CRON ENDPOINTS ---
  app.get('/api/automations', (_req, res) => {
    const history = db.listAutomationRuns(20);
    res.json({ jobs: INITIAL_AUTOMATION_JOBS, history });
  });

  app.post('/api/automations/:id/trigger', async (req, res) => {
    try {
      const { id } = req.params;
      const log = await executeAutomationJob(id, INITIAL_SOP_DOCUMENTS, INITIAL_AGENTS);
      res.json({ success: true, log });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Lỗi thực thi automation.' });
    }
  });

  // --- EXTERNAL CHANNELS / WEBHOOK ENDPOINT ---
  app.post('/api/channels/incoming', (req, res) => {
    try {
      const payload = req.body as ExternalOrderPayload;
      if (!payload || !payload.senderName) {
        res.status(400).json({ error: 'Payload không hợp lệ, thiếu tên người gửi.' });
        return;
      }
      const result = processExternalIncomingOrder(payload, INITIAL_AGENTS, INITIAL_SOP_DOCUMENTS);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || 'Lỗi tiếp nhận đơn hàng ngoại vi.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PrintAd 3D Virtual Office server running on http://localhost:${PORT}`);
  });
}

startServer();
