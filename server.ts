import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_AGENTS, INITIAL_SOP_DOCUMENTS } from './src/data/officeData';
import {
  generateLocalSopGroundedReport,
  validateScopeAndRoute
} from './src/utils/officeLogic';
import { AgentProfile, SopDocument, TaskReport } from './src/types/office';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  app.post('/api/agent/execute-task', async (req, res) => {
    try {
      const { agent, prompt, sops, allAgents } = req.body as {
        agent?: AgentProfile;
        prompt?: string;
        sops?: SopDocument[];
        allAgents?: AgentProfile[];
      };

      const targetAgent =
        agent || INITIAL_AGENTS[0];
      const taskPrompt = String(prompt || '').trim();
      const activeSops = Array.isArray(sops) ? sops : INITIAL_SOP_DOCUMENTS;
      const agentList = Array.isArray(allAgents) ? allAgents : INITIAL_AGENTS;

      if (!taskPrompt) {
        res.status(400).json({ error: 'Nội dung nhiệm vụ không được để trống.' });
        return;
      }

      // First check strict department specialization boundaries
      const scopeCheck = validateScopeAndRoute(
        targetAgent,
        taskPrompt,
        agentList,
        activeSops
      );

      const fallbackReport = generateLocalSopGroundedReport(
        targetAgent,
        taskPrompt,
        agentList,
        activeSops
      );

      // If out of scope, immediately return the strict role boundary rejection report
      if (!scopeCheck.isInScope) {
        res.json({ report: fallbackReport });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
        res.json({ report: fallbackReport });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const deptSopsText = scopeCheck.matchedSops
        .map(
          (doc) =>
            `[${doc.code}] ${doc.title}:\n` +
            doc.rules.map((r, idx) => `  ${idx + 1}. ${r}`).join('\n')
        )
        .join('\n\n');

      const systemInstruction = `Bạn là ${targetAgent.name} — ${targetAgent.roleTitle} thuộc ${targetAgent.departmentLabel} tại Công ty In ấn & Quảng cáo PrintAd.
Nhiệm vụ chính của bạn: ${targetAgent.primaryMission}
Giới hạn chuyên môn nghiêm ngặt: ${targetAgent.strictBoundary}
Đặc điểm tính cách: ${targetAgent.personalityTraits.join('; ')}
Hành vi tương tác trong văn phòng 3D: ${targetAgent.spatialBehavior}

TÀI LIỆU QUY CHUẨN HUẤN LUYỆN (SOP) BẮT BUỘC TUÂN THỦ:
${deptSopsText}

Hãy thực hiện nhiệm vụ người dùng giao theo đúng quy chuẩn SOP trên và trả về báo cáo ngắn gọn, súc tích, chuyên nghiệp bằng tiếng Việt.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Nhiệm vụ được giao: "${taskPrompt}"`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: {
                type: Type.STRING,
                description: 'Tiêu đề báo cáo kết quả nhiệm vụ'
              },
              summary: {
                type: Type.STRING,
                description: 'Tóm tắt ngắn gọn kết quả thực hiện theo SOP'
              },
              spatialActionTaken: {
                type: Type.STRING,
                description: 'Mô tả hành động tương tác của trợ lý trong không gian văn phòng 3D'
              },
              keyFindings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 kết quả hoặc điểm chính đã thực hiện theo SOP'
              },
              totalAmountFormatted: {
                type: Type.STRING,
                description: 'Tổng kết con số định lượng, báo giá hoặc chỉ số đạt được'
              },
              recommendation: {
                type: Type.STRING,
                description: 'Đề xuất bước tiếp theo hoặc phối hợp phòng ban'
              }
            },
            required: [
              'headline',
              'summary',
              'spatialActionTaken',
              'keyFindings',
              'totalAmountFormatted',
              'recommendation'
            ]
          }
        }
      });

      const rawText = response.text;
      if (!rawText) {
        res.json({ report: fallbackReport });
        return;
      }

      const parsed = JSON.parse(rawText);
      const mergedReport: TaskReport = {
        ...fallbackReport,
        headline: parsed.headline || fallbackReport.headline,
        summary: parsed.summary || fallbackReport.summary,
        spatialActionTaken:
          parsed.spatialActionTaken || fallbackReport.spatialActionTaken,
        keyFindings:
          Array.isArray(parsed.keyFindings) && parsed.keyFindings.length > 0
            ? parsed.keyFindings
            : fallbackReport.keyFindings,
        totalAmountFormatted:
          parsed.totalAmountFormatted || fallbackReport.totalAmountFormatted,
        recommendation: parsed.recommendation || fallbackReport.recommendation,
        sourceMode: 'gemini-api'
      };

      res.json({ report: mergedReport });
    } catch (err) {
      // Fallback to deterministic SOP engine so user experience is never broken
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
