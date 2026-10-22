import { GoogleGenAI, Type } from '@google/genai';
import { AgentProfile, SopDocument, TaskReport, AiRoleTier, AiModelProvider, AgentModelConfig } from '../types/office';
import { generateLocalSopGroundedReport, validateScopeAndRoute } from './officeLogic';

export interface MultiModelExecutionInput {
  agent: AgentProfile;
  prompt: string;
  sops: SopDocument[];
  allAgents: AgentProfile[];
}

export function getAgentTier(agent: AgentProfile): AiRoleTier {
  if (agent.roleTier) return agent.roleTier;
  if (agent.departmentId === 'board_executive' || agent.characterKey === 'doraemon') {
    return 'ceo';
  }
  const managerKeys = [
    'dekisugi',
    'chaian',
    'shizuka',
    'suneo',
    'dorami',
    'kaminari',
    'sensei',
    'nobita'
  ];
  if (managerKeys.includes(agent.characterKey)) {
    return 'manager';
  }
  return 'executive';
}

export function getAgentModelConfig(agent: AgentProfile): AgentModelConfig {
  const tier = getAgentTier(agent);
  if (agent.aiModelConfig) return agent.aiModelConfig;

  if (tier === 'ceo') {
    const provider = (process.env.CEO_MODEL_PROVIDER || 'openai') as AiModelProvider;
    const modelName = process.env.CEO_MODEL || 'gpt-4o';
    return {
      roleTier: 'ceo',
      roleTierTitle: 'Ban Giám Đốc (CEO)',
      provider,
      providerName: provider === 'openai' ? 'OpenAI' : provider === 'anthropic' ? 'Anthropic' : 'Google Gemini',
      modelName,
      badgeLabel: `👑 CEO • ${provider === 'openai' ? 'OpenAI GPT-4o / Codex' : modelName}`,
      badgeColor: '#a855f7',
      description: 'Định hướng chiến lược, ra chỉ thị vĩ mô, điều phối toàn công ty'
    };
  }

  if (tier === 'manager') {
    const provider = (process.env.MANAGER_MODEL_PROVIDER || 'anthropic') as AiModelProvider;
    const modelName = process.env.MANAGER_MODEL || 'claude-3-5-sonnet-latest';
    return {
      roleTier: 'manager',
      roleTierTitle: 'Trưởng Phòng (Manager)',
      provider,
      providerName: provider === 'anthropic' ? 'Anthropic' : provider === 'openai' ? 'OpenAI' : 'Google Gemini',
      modelName,
      badgeLabel: `👔 Manager • ${provider === 'anthropic' ? 'Claude 3.5 Sonnet' : modelName}`,
      badgeColor: '#f97316',
      description: 'Quản lý chuyên môn sâu, tuân thủ SOP, phân tích 8D, bóc tách kỹ thuật'
    };
  }

  const provider = (process.env.EXECUTIVE_MODEL_PROVIDER || 'gemini') as AiModelProvider;
  const modelName = process.env.EXECUTIVE_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  return {
    roleTier: 'executive',
    roleTierTitle: 'Chuyên Viên (Executive)',
    provider,
    providerName: provider === 'gemini' ? 'Google Gemini' : provider === 'openai' ? 'OpenAI' : 'Anthropic',
    modelName,
    badgeLabel: `⚡ Executive • ${provider === 'gemini' ? 'Gemini 2.5 Flash' : modelName}`,
    badgeColor: '#38bdf8',
    description: 'Thực thi tác vụ nhanh, bóc tách định mức bài in, kiểm kho thời gian thực'
  };
}

export function getSystemInstruction(targetAgent: AgentProfile, deptSopsText: string): string {
  const modelCfg = getAgentModelConfig(targetAgent);
  return `Bạn là ${targetAgent.name} — ${targetAgent.roleTitle} thuộc ${targetAgent.departmentLabel} tại Công ty In ấn & Quảng cáo PrintAd.
CẤP BẬC MÔ HÌNH AI: ${modelCfg.roleTierTitle} (Vận hành bởi mô hình ${modelCfg.providerName} - ${modelCfg.modelName}).
Nhiệm vụ chính: ${targetAgent.primaryMission}
Ranh giới chuyên môn nghiêm ngặt: ${targetAgent.strictBoundary}
Đặc điểm tính cách: ${targetAgent.personalityTraits.join('; ')}
Hành vi văn phòng 3D: ${targetAgent.spatialBehavior}

QUY CHUẨN ĐÀO TẠO SOP BẮT BUỘC:
${deptSopsText}

Hãy thực hiện nhiệm vụ người dùng giao và trả về JSON thuần túy (không kèm markdown) gồm các trường:
- headline: string (Tiêu đề báo cáo kết quả)
- summary: string (Tóm tắt ngắn gọn quy chuẩn đã áp dụng)
- spatialActionTaken: string (Hành động trong văn phòng 3D)
- keyFindings: string[] (3-4 kết quả định lượng cụ thể)
- totalAmountFormatted: string (Con số tổng hợp, doanh thu, giá trị PO hoặc chỉ số)
- recommendation: string (Đề xuất bước tiếp theo cho Ban Giám Đốc)`;
}

/**
 * Call OpenAI API (Codex / GPT-4o / GPT-4o-mini)
 */
async function callOpenAi(params: {
  apiKey: string;
  model: string;
  systemInstruction: string;
  prompt: string;
}): Promise<any> {
  const baseUrl = process.env.OPENAI_BASE_URL?.replace(/\/$/, '') || 'https://api.openai.com/v1';
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.apiKey}`
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        { role: 'system', content: params.systemInstruction },
        {
          role: 'user',
          content: `Nhiệm vụ cần thực hiện: "${params.prompt}". Hãy phân tích theo đúng vai trò và trả về DUY NHẤT một chuỗi JSON hợp lệ tuân thủ các trường đã quy định.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    }),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const json: any = await response.json();
  const rawContent = json?.choices?.[0]?.message?.content;
  if (!rawContent) throw new Error('OpenAI returned empty message content');
  return JSON.parse(rawContent);
}

/**
 * Call Anthropic Claude API (Claude 3.5 / 3.7 Sonnet)
 */
async function callAnthropic(params: {
  apiKey: string;
  model: string;
  systemInstruction: string;
  prompt: string;
}): Promise<any> {
  const baseUrl = process.env.ANTHROPIC_BASE_URL?.replace(/\/$/, '') || 'https://api.anthropic.com/v1';
  const response = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': params.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: params.model,
      max_tokens: 2048,
      system: params.systemInstruction,
      messages: [
        {
          role: 'user',
          content: `Nhiệm vụ cần thực hiện: "${params.prompt}". Hãy phân tích và trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown backticks) gồm các trường: headline, summary, spatialActionTaken, keyFindings (mảng chuỗi), totalAmountFormatted, recommendation.`
        }
      ],
      temperature: 0.3
    }),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic Claude API error (${response.status}): ${errText}`);
  }

  const json: any = await response.json();
  const rawText = json?.content?.[0]?.text;
  if (!rawText) throw new Error('Anthropic returned empty content');

  // Strip possible markdown code fence
  const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(cleanJson);
}

/**
 * Call Google Gemini API (Gemini 2.5 Flash / 3.8 Flash)
 */
async function callGemini(params: {
  apiKey: string;
  model: string;
  systemInstruction: string;
  prompt: string;
}): Promise<any> {
  const ai = new GoogleGenAI({
    apiKey: params.apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  const response = await ai.models.generateContent({
    model: params.model,
    contents: `Nhiệm vụ được giao: "${params.prompt}"`,
    config: {
      systemInstruction: params.systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          summary: { type: Type.STRING },
          spatialActionTaken: { type: Type.STRING },
          keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
          totalAmountFormatted: { type: Type.STRING },
          recommendation: { type: Type.STRING }
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
  if (!rawText) throw new Error('Gemini returned empty text');
  return JSON.parse(rawText);
}

/**
 * Main Role-Based Multi-Model Dispatcher
 */
export async function executeMultiModelTask(input: MultiModelExecutionInput): Promise<TaskReport> {
  const { agent, prompt, sops, allAgents } = input;
  const targetAgent = agent || allAgents[0];
  const taskPrompt = String(prompt || '').trim();

  // 1. Validate Scope
  const scopeCheck = validateScopeAndRoute(targetAgent, taskPrompt, allAgents, sops);
  const fallbackReport = generateLocalSopGroundedReport(targetAgent, taskPrompt, allAgents, sops);

  if (!scopeCheck.isInScope) {
    return fallbackReport;
  }

  // 2. Identify Role Tier & Model Config
  const modelConfig = getAgentModelConfig(targetAgent);
  const deptSopsText = scopeCheck.matchedSops
    .map((doc) => `[${doc.code}] ${doc.title}:\n` + doc.rules.map((r, idx) => `  ${idx + 1}. ${r}`).join('\n'))
    .join('\n\n');
  const systemInstruction = getSystemInstruction(targetAgent, deptSopsText);

  // 3. Check Available Keys
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  const isKeyValid = (k?: string) => !!k && k !== 'MY_GEMINI_API_KEY' && k !== 'MY_OPENAI_API_KEY' && k !== 'MY_ANTHROPIC_API_KEY' && k.length > 5;

  let parsedResult: any = null;
  let providerUsed: AiModelProvider | 'local-engine' = 'local-engine';
  let modelUsed = modelConfig.modelName;

  // Primary execution based on Role Tier & Provider
  try {
    if (modelConfig.provider === 'openai' && isKeyValid(openaiKey)) {
      parsedResult = await callOpenAi({
        apiKey: openaiKey!,
        model: modelConfig.modelName,
        systemInstruction,
        prompt: taskPrompt
      });
      providerUsed = 'openai';
      modelUsed = modelConfig.modelName;
    } else if (modelConfig.provider === 'anthropic' && isKeyValid(anthropicKey)) {
      parsedResult = await callAnthropic({
        apiKey: anthropicKey!,
        model: modelConfig.modelName,
        systemInstruction,
        prompt: taskPrompt
      });
      providerUsed = 'anthropic';
      modelUsed = modelConfig.modelName;
    } else if (modelConfig.provider === 'gemini' && isKeyValid(geminiKey)) {
      parsedResult = await callGemini({
        apiKey: geminiKey!,
        model: modelConfig.modelName,
        systemInstruction,
        prompt: taskPrompt
      });
      providerUsed = 'gemini';
      modelUsed = modelConfig.modelName;
    }
  } catch (primaryErr: any) {
    console.warn(`[MultiModelGateway] Primary provider (${modelConfig.provider}) failed: ${primaryErr?.message || primaryErr}. Attempting fallback...`);
  }

  // Fallback to any other configured LLM provider if primary failed or key missing
  if (!parsedResult) {
    if (isKeyValid(geminiKey) && modelConfig.provider !== 'gemini') {
      try {
        parsedResult = await callGemini({
          apiKey: geminiKey!,
          model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
          systemInstruction,
          prompt: taskPrompt
        });
        providerUsed = 'gemini';
        modelUsed = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      } catch (e: any) {
        console.warn(`[MultiModelGateway] Gemini fallback failed: ${e?.message}`);
      }
    } else if (isKeyValid(anthropicKey) && modelConfig.provider !== 'anthropic') {
      try {
        parsedResult = await callAnthropic({
          apiKey: anthropicKey!,
          model: process.env.MANAGER_MODEL || 'claude-3-5-sonnet-latest',
          systemInstruction,
          prompt: taskPrompt
        });
        providerUsed = 'anthropic';
        modelUsed = process.env.MANAGER_MODEL || 'claude-3-5-sonnet-latest';
      } catch (e: any) {
        console.warn(`[MultiModelGateway] Anthropic fallback failed: ${e?.message}`);
      }
    } else if (isKeyValid(openaiKey) && modelConfig.provider !== 'openai') {
      try {
        parsedResult = await callOpenAi({
          apiKey: openaiKey!,
          model: process.env.CEO_MODEL || 'gpt-4o',
          systemInstruction,
          prompt: taskPrompt
        });
        providerUsed = 'openai';
        modelUsed = process.env.CEO_MODEL || 'gpt-4o';
      } catch (e: any) {
        console.warn(`[MultiModelGateway] OpenAI fallback failed: ${e?.message}`);
      }
    }
  }

  // If parsed from an LLM
  if (parsedResult) {
    const sourceModeMap = {
      openai: 'openai-api' as const,
      anthropic: 'anthropic-api' as const,
      gemini: 'gemini-api' as const,
      'local-engine': 'sop-engine' as const
    };

    return {
      ...fallbackReport,
      headline: parsedResult.headline || fallbackReport.headline,
      summary: parsedResult.summary || fallbackReport.summary,
      spatialActionTaken: parsedResult.spatialActionTaken || fallbackReport.spatialActionTaken,
      keyFindings:
        Array.isArray(parsedResult.keyFindings) && parsedResult.keyFindings.length > 0
          ? parsedResult.keyFindings
          : fallbackReport.keyFindings,
      totalAmountFormatted: parsedResult.totalAmountFormatted || fallbackReport.totalAmountFormatted,
      recommendation: parsedResult.recommendation || fallbackReport.recommendation,
      sourceMode: sourceModeMap[providerUsed],
      modelUsed,
      providerUsed,
      roleTierUsed: modelConfig.roleTier
    };
  }

  // Deterministic local fallback
  return {
    ...fallbackReport,
    modelUsed: modelConfig.modelName,
    providerUsed: 'local-engine',
    roleTierUsed: modelConfig.roleTier
  };
}
