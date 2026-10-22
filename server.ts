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
  getAgentTier
} from './src/utils/aiMultiModelDispatcher';
import { AgentProfile, SopDocument, TaskReport } from './src/types/office';

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

    res.json({
      tiers: {
        ceo: {
          title: 'Ban Giám Đốc (CEO)',
          assignedCharacters: ['Doraemon (Giám Đốc Điều Hành)'],
          provider: process.env.CEO_MODEL_PROVIDER || 'openai',
          model: process.env.CEO_MODEL || 'gpt-4o',
          hasKey: isKeyValid(process.env.OPENAI_API_KEY),
          badgeLabel: '👑 CEO • OpenAI GPT-4o / Codex',
          badgeColor: '#a855f7',
          description: 'Định hướng chiến lược, ra chỉ thị vĩ mô, điều phối 8 phòng ban'
        },
        manager: {
          title: 'Trưởng Phòng (Manager)',
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
          provider: process.env.MANAGER_MODEL_PROVIDER || 'anthropic',
          model: process.env.MANAGER_MODEL || 'claude-3-5-sonnet-latest',
          hasKey: isKeyValid(process.env.ANTHROPIC_API_KEY),
          badgeLabel: '👔 Manager • Claude 3.5 Sonnet',
          badgeColor: '#f97316',
          description: 'Quản lý chuyên môn sâu, tuân thủ SOP, phân tích 8D, bóc tách kỹ thuật'
        },
        executive: {
          title: 'Chuyên Viên (Executive)',
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
          provider: process.env.EXECUTIVE_MODEL_PROVIDER || 'gemini',
          model: process.env.EXECUTIVE_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
          hasKey: isKeyValid(process.env.GEMINI_API_KEY),
          badgeLabel: '⚡ Executive • Gemini 2.5 Flash',
          badgeColor: '#38bdf8',
          description: 'Thực thi tác vụ nhanh, bóc tách định mức bài in, kiểm kho thời gian thực'
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

      res.json({ report });
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
