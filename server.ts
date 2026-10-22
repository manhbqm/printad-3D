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

    const doraemon = INITIAL_AGENTS.find(a => a.characterKey === 'doraemon') || INITIAL_AGENTS[0];
    const dekisugi = INITIAL_AGENTS.find(a => a.characterKey === 'dekisugi') || INITIAL_AGENTS[1];
    const jaiko = INITIAL_AGENTS.find(a => a.characterKey === 'jaiko') || INITIAL_AGENTS[8];

    const ceoConfig = getAgentModelConfig(doraemon);
    const managerConfig = getAgentModelConfig(dekisugi);
    const execConfig = getAgentModelConfig(jaiko);

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
