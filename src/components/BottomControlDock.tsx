import React, { useState } from 'react';
import {
  Building2,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  FolderPlus,
  Layers,
  Play,
  Send,
  ShieldAlert,
  Users,
  Video
} from 'lucide-react';
import { SKILLS_CATALOG } from '../data/officeData';
import { CLOUD_PRINT_QUOTE_URL } from '../utils/printQuoteEngine';
import {
  AgentProfile,
  DepartmentId,
  OfficeZone,
  PrintQuoteInput,
  SopDocument,
  TaskAssignment,
  ZoneId
} from '../types/office';
import {
  calculatePrintQuote,
  formatVnd,
  validateSopDocumentInput
} from '../utils/officeLogic';

export type DockTab = 'zones' | 'agents' | 'tasks' | 'sops';

interface BottomControlDockProps {
  activeTab: DockTab;
  setActiveTab: (tab: DockTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  zones: OfficeZone[];
  activeZoneId: ZoneId;
  onSelectZone: (zoneId: ZoneId) => void;
  agents: AgentProfile[];
  selectedAgentId: string;
  onSelectAgent: (agentId: string) => void;
  tasks: TaskAssignment[];
  selectedTaskId: string;
  onSelectTask: (taskId: string) => void;
  onAssignTask: (
    agentId: string,
    prompt: string,
    targetZoneId: ZoneId,
    priority: 'normal' | 'high' | 'urgent'
  ) => void;
  onIssueCeoDirective: (
    prompt: string,
    priority: 'normal' | 'high' | 'urgent'
  ) => void;
  sops: SopDocument[];
  onAddSop: (newSop: SopDocument) => void;
  onToggleSop: (sopId: string) => void;
  isAllHandsMeeting: boolean;
  onToggleAllHandsMeeting: () => void;
}

const CEO_DIRECTIVE_PRESETS: {
  id: string;
  label: string;
  prompt: string;
  expectedDeptHint: string;
}[] = [
  {
    id: 'ceo-bgd',
    label: '/bgd — Tổng hợp điều hành 1 trang & Đánh giá điểm nghẽn toàn công ty',
    prompt:
      '/bgd Hãy tổng hợp báo cáo điều hành tuần của 8 phòng ban, chỉ rõ các điểm nghẽn sản xuất, biến động chi phí và tỷ lệ giao hàng đúng hạn OTIF.',
    expectedDeptHint: '→ Doraemon (Ban Giám Đốc)'
  },
  {
    id: 'ceo-bgd-minutes',
    label: '/bgd — Soạn Biên bản họp giao ban tuần 43 và phân công hành động RACI',
    prompt:
      '/bgd Lập biên bản họp giao ban điều hành sản xuất tuần 43, tổng hợp các quyết định then chốt và lập bảng ma trận phân công hành động RACI.',
    expectedDeptHint: '→ Doraemon (Ghi chú họp & RACI)'
  },
  {
    id: 'ceo-kd',
    label: '/kd — Lập Hợp đồng kinh tế B2B in 2.000m² bạt & bảo lãnh điều khoản SLA',
    prompt:
      '/kd Hãy soạn thảo Hợp đồng kinh tế B2B cung ứng 2.000m² bạt Hiflex và 30 bộ Standee cho khách hàng chuỗi siêu thị, rà soát điều khoản phạt trần 8% theo luật định.',
    expectedDeptHint: '→ Dekisugi (Kinh Doanh & Pháp Chế)'
  },
  {
    id: 'ceo-kd-email',
    label: '/kd — Soạn thư điện tử gửi Báo giá gia công B2B chuẩn mực cho đối tác FDI',
    prompt:
      '/kd Soạn thư điện tử thương mại B2B gửi bảng báo giá in ấn và gia công cho đối tác Takata Vietnam, nêu rõ điều kiện giao hàng Incoterms 2020 và thời hạn hiệu lực.',
    expectedDeptHint: '→ Dekisugi (Email B2B)'
  },
  {
    id: 'ceo-cskh',
    label: '/cskh — Lập Phiếu giao hàng kiêm Biên bản bàn giao & nghiệm thu 02 liên',
    prompt:
      '/cskh Lập phiếu giao hàng kiêm biên bản bàn giao sản phẩm cho lô hàng 80m² bạt Hiflex và 12 bộ Standee cuốn nhôm, đầy đủ 4 chữ ký xác nhận.',
    expectedDeptHint: '→ Shizuka (CSKH & Phiếu giao hàng)'
  },
  {
    id: 'ceo-cskh-8d',
    label: '/cskh — Kích hoạt quy trình 8D xử lý khiếu nại sản phẩm in bị xước bề mặt',
    prompt:
      '/cskh Khách hàng phản ánh lô hàng in bạt 80m² bị trầy xước bề mặt. Hãy kích hoạt kịch bản xử lý khiếu nại 8D, cô lập lô hàng lỗi, xuất hàng đệm bù trong 4h và lập báo cáo CAPA.',
    expectedDeptHint: '→ Shizuka (Giải quyết sự cố 8D)'
  },
  {
    id: 'ceo-kt-debt',
    label: '/kt — Soạn thư đôn đốc đối chiếu và thu hồi công nợ đến hạn đợt 2',
    prompt:
      '/kt Lập thư điện tử lịch sự gửi Kế toán trưởng đối tác đề nghị đối chiếu công nợ và thanh toán đợt 2 số tiền 135.000.000đ cho đơn hàng bạt quảng cáo.',
    expectedDeptHint: '→ Suneo (Kế toán & Công nợ)'
  },
  {
    id: 'ceo-kho-kanban',
    label: '/kho — Lập bảng Kanban quản trị tiến độ đơn hàng sản xuất 4 cột',
    prompt:
      '/kho Lập bảng theo dõi tiến độ sản xuất đơn hàng theo phương pháp Kanban 4 cột (Backlog, Chuẩn bị phôi, Đang in 3 ca, Hoàn tất bàn giao).',
    expectedDeptHint: '→ Bác Kaminari (Kho & Kanban)'
  },
  {
    id: 'ceo-hc-sop',
    label: '/hc — Soạn Quy trình vận hành tiêu chuẩn SOP chuẩn ISO 9001:2015',
    prompt:
      '/hc Biên soạn Quy trình vận hành tiêu chuẩn SOP kiểm tra an toàn PCCC, bảo dưỡng máy in đầu ca và tiêu chuẩn 5S hiện trường sản xuất.',
    expectedDeptHint: '→ Thầy Giáo (Hành chính & ISO)'
  },
  {
    id: 'ceo-cty',
    label: '/cty — Tra cứu Hồ sơ năng lực pháp nhân, chứng chỉ ISO & chính sách bảo mật PII',
    prompt:
      '/cty Tra cứu hồ sơ năng lực pháp lý công ty PrintAd 3D, danh mục máy móc thiết bị nhà xưởng và quy chế bảo mật thông tin doanh nghiệp PII/NDA.',
    expectedDeptHint: '→ Doraemon & Thầy Giáo (/cty 00-cong-ty)'
  }
];

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  zones,
  activeZoneId,
  onSelectZone,
  agents,
  selectedAgentId,
  onSelectAgent,
  tasks,
  selectedTaskId,
  onSelectTask,
  onAssignTask,
  onIssueCeoDirective,
  sops,
  onAddSop,
  onToggleSop,
  isAllHandsMeeting,
  onToggleAllHandsMeeting
}) => {
  const selectedAgent =
    agents.find((a) => a.id === selectedAgentId) || agents[0];
  const activeZone =
    zones.find((z) => z.id === activeZoneId) || zones[0];
  const selectedTask =
    tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  // Dispatch mode: 'ceo_auto' (Director issues general directive -> Lan Hương dispatches) vs 'direct'
  const [dispatchMode, setDispatchMode] = useState<'ceo_auto' | 'direct'>('ceo_auto');
  const [taskPrompt, setTaskPrompt] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<'normal' | 'high' | 'urgent'>('high');
  const [taskZoneId, setTaskZoneId] = useState<ZoneId>('coworking');
  const [taskFormError, setTaskFormError] = useState<string>('');

  // Quick print quote calculator state (for Sales/Quoting department)
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [quoteInput, setQuoteInput] = useState<PrintQuoteInput>({
    materialType: 'hiflex',
    widthMeters: 6,
    heightMeters: 10,
    quantity: 1,
    finishingOption: 'eyelet_glue',
    rushOrder: false
  });

  // SOP Training Document form state
  const [sopDeptId, setSopDeptId] = useState<DepartmentId>(selectedAgent.departmentId);
  const [sopCode, setSopCode] = useState<string>('SOP-IN-2026-05');
  const [sopTitle, setSopTitle] = useState<string>('');
  const [sopCategory, setSopCategory] = useState<string>('Quy chuẩn Chuyên môn');
  const [sopRulesText, setSopRulesText] = useState<string>('');
  const [sopError, setSopError] = useState<string>('');
  const [sopSuccess, setSopSuccess] = useState<string>('');
  const [skillsViewMode, setSkillsViewMode] = useState<'sops' | 'skills_catalog'>('sops');
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<'all' | 'office_12' | 'deep_30'>('all');
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>('');

  const quoteResult = calculatePrintQuote(quoteInput);

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskPrompt.trim()) {
      setTaskFormError('Vui lòng nhập nội dung chỉ thị hoặc nhiệm vụ cần giao.');
      return;
    }
    setTaskFormError('');
    if (dispatchMode === 'ceo_auto') {
      onIssueCeoDirective(taskPrompt.trim(), taskPriority);
    } else {
      onAssignTask(selectedAgent.id, taskPrompt.trim(), taskZoneId, taskPriority);
    }
    setTaskPrompt('');
  };

  const handleSopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSopSuccess('');
    const validation = validateSopDocumentInput({
      departmentId: sopDeptId,
      code: sopCode,
      title: sopTitle,
      category: sopCategory,
      summary: sopTitle,
      rulesText: sopRulesText
    });

    if (!validation.valid) {
      setSopError(validation.error || 'Dữ liệu SOP không hợp lệ.');
      return;
    }

    setSopError('');
    const created: SopDocument = {
      id: `sop-custom-${Date.now()}`,
      departmentId: sopDeptId,
      code: sopCode.trim().toUpperCase(),
      title: sopTitle.trim(),
      category: sopCategory.trim() || 'Quy chuẩn Nội bộ',
      summary: `Tài liệu huấn luyện bổ sung cho bộ phận (${validation.parsedRules.length} quy tắc).`,
      rules: validation.parsedRules,
      updatedAt: '2026-10-20',
      isActive: true
    };

    onAddSop(created);
    setSopTitle('');
    setSopRulesText('');
    setSopCode(`SOP-IN-2026-0${sops.length + 2}`);
    setSopSuccess(`Đã nạp tài liệu "${created.code}" vào bộ nhớ huấn luyện bộ phận!`);
  };

  const handleFileUploadSop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '').trim();
      if (content) {
        setSopTitle(file.name.replace(/\.[^/.]+$/, ''));
        setSopRulesText(content);
        setSopError('');
      }
    };
    reader.readAsText(file);
  };

  const deptSops = sops.filter((s) => s.departmentId === sopDeptId);

  return (
    <section
      aria-label="Bảng điều khiển trung tâm Văn phòng ảo 3D"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 w-[96vw] max-w-[1160px] pointer-events-auto"
    >
      {/* Collapse / Expand Handle Bar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3.5 py-1.5 bg-slate-900 border border-b-0 border-slate-700 rounded-t-xl">
        <div className="flex items-center gap-2 text-xs text-slate-300 truncate min-w-0">
          <span className="font-semibold text-amber-400 truncate">
            Khu vực: {activeZone.shortLabel}
          </span>
          <span aria-hidden="true" className="hidden md:inline">·</span>
          <span className="hidden md:inline truncate">
            Trợ lý: <strong className="text-white">{selectedAgent.name}</strong> ({selectedAgent.departmentLabel})
          </span>
          <span aria-hidden="true" className="hidden lg:inline">·</span>
          <span className="hidden lg:inline text-slate-400 tabular-nums">
            {sops.filter((s) => s.isActive).length} tài liệu SOP đang kích hoạt
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            type="button"
            onClick={onToggleAllHandsMeeting}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isAllHandsMeeting
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {isAllHandsMeeting ? 'Giải tán Họp' : 'Họp Phòng Họp'}
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-expanded={!isCollapsed}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Mở HUD</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Thu gọn HUD</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Dock Container */}
      {!isCollapsed && (
        <div className="bg-slate-950/95 border border-slate-700 rounded-b-xl shadow-2xl overflow-hidden">
          {/* Segmented Navigation Tabs */}
          <div
            role="tablist"
            aria-label="Chức năng văn phòng ảo"
            className="flex items-center justify-between gap-2 px-4 py-2 bg-slate-900/90 border-b border-slate-800 overflow-x-auto"
          >
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'zones'}
                onClick={() => setActiveTab('zones')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'zones'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Không gian 3D & Khu vực (9)</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'agents'}
                onClick={() => setActiveTab('agents')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'agents'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Hồ sơ 5 Trợ lý AI</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'tasks'}
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'tasks'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Giao nhiệm vụ & Báo cáo ({tasks.length})</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'sops'}
                onClick={() => setActiveTab('sops')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'sops'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Huấn luyện Quy chuẩn SOP ({sops.length})</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap shrink-0">
              <Video className="w-3.5 h-3.5 text-amber-400" />
              <span>Kéo chuột để xoay 3D · Cuộn để thu phóng · Phím WASD di chuyển</span>
            </div>
          </div>

          {/* TAB 1: 3D ZONES & SPATIAL INTERACTION */}
          {activeTab === 'zones' && (
            <div className="p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3.5 max-h-[235px] overflow-y-auto">
              {/* Zone Selector Buttons */}
              <div className="lg:col-span-5 flex flex-col gap-2">
                <div className="text-xs font-semibold text-slate-400">
                  Chọn Khu vực Chức năng & Phòng ban (Di chuyển Camera 3D)
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {zones.map((z) => {
                    const isSelected = z.id === activeZoneId;
                    return (
                      <button
                        key={z.id}
                        type="button"
                        onClick={() => {
                          onSelectZone(z.id);
                          if (z.departmentId) {
                            const deptAgent = agents.find(
                              (a) => a.departmentId === z.departmentId
                            );
                            if (deptAgent) onSelectAgent(deptAgent.id);
                          }
                        }}
                        className={`px-2.5 py-2 text-xs font-medium rounded-lg border text-left truncate transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 text-white border-amber-400 font-semibold'
                            : 'bg-slate-900/70 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        {z.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Zone Description & AI Spatial Interaction */}
              <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-white font-display">
                      {activeZone.name}
                    </h2>
                    <span className="text-xs text-slate-400 tabular-nums">
                      Toạ độ 3D: ({activeZone.center.x}, {activeZone.center.z}) · {activeZone.size.width}m × {activeZone.size.depth}m
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {activeZone.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <div className="font-semibold text-slate-200 mb-1">
                      Trang thiết bị 3D trong khu vực:
                    </div>
                    <ul className="space-y-0.5 text-slate-400">
                      {activeZone.keyEquipment.slice(0, 3).map((eq, i) => (
                        <li key={i} className="truncate">
                          - {eq}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-amber-300 mb-1">
                      Cách Trợ lý AI tương tác không gian này:
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {activeZone.aiSpatialInteraction}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 5 AI ASSISTANT PROFILES */}
          {activeTab === 'agents' && (
            <div className="p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3.5 max-h-[245px] overflow-y-auto">
              {/* Left list of 5 AI Assistants */}
              <div className="lg:col-span-4 flex flex-col gap-1.5">
                {agents.map((ag) => {
                  const isSel = ag.id === selectedAgent.id;
                  return (
                    <button
                      key={ag.id}
                      type="button"
                      onClick={() => {
                        onSelectAgent(ag.id);
                        onSelectZone(ag.zoneId);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                        isSel
                          ? 'bg-slate-800 border-amber-400 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span className="truncate">{ag.name}</span>
                          {ag.slashCommand && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono shrink-0">
                              {ag.slashCommand}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {ag.departmentLabel}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {ag.roleTitle}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-amber-400 shrink-0">
                        Chọn
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Detailed Profile of Selected Assistant */}
              <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between gap-2.5">
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      {selectedAgent.name} — {selectedAgent.roleTitle}
                    </h3>
                    <div className="text-xs text-slate-400">
                      Bộ phận: <strong className="text-slate-200">{selectedAgent.departmentLabel}</strong> · Vị trí 3D: ({selectedAgent.homePosition.x}, {selectedAgent.homePosition.z})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSopDeptId(selectedAgent.departmentId);
                        setActiveTab('sops');
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Xem tài liệu SOP
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tasks')}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Giao việc cho {selectedAgent.name}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5">
                    {selectedAgent.slashCommand && (
                      <div className="flex items-center gap-2 pb-1">
                        <span className="text-xs font-semibold text-sky-400">Lệnh Sub-Agent:</span>
                        <code className="text-xs font-mono font-bold bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-700">
                          {selectedAgent.slashCommand}
                        </code>
                        {selectedAgent.subAgentModule && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            ({selectedAgent.subAgentModule})
                          </span>
                        )}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold text-slate-200">Nhiệm vụ chính: </span>
                      <span className="text-slate-300">{selectedAgent.primaryMission}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-amber-300">Giới hạn chuyên môn nghiêm ngặt: </span>
                      <span className="text-slate-300">{selectedAgent.strictBoundary}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-200">
                      Đặc điểm tính cách nổi bật & Tương tác 3D:
                    </div>
                    <ul className="space-y-1 text-slate-300">
                      {selectedAgent.personalityTraits.map((trait, idx) => (
                        <li key={idx}>• {trait}</li>
                      ))}
                    </ul>
                    <div className="text-slate-400 pt-0.5">
                      {selectedAgent.spatialBehavior}
                    </div>
                  </div>
                </div>

                {selectedAgent.skills && selectedAgent.skills.length > 0 && (
                  <div className="border-t border-slate-800 pt-2.5 mt-1">
                    <div className="text-xs font-semibold text-amber-400 mb-1.5 flex items-center justify-between">
                      <span>Bộ Skills Chuyên Môn Claude SubAgent ({selectedAgent.skills.length} skills):</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Module: {selectedAgent.subAgentModule || '8-phong-ban'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {selectedAgent.skills.map((skillName) => (
                        <span
                          key={skillName}
                          className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded font-mono hover:border-amber-400/60 transition-colors"
                        >
                          {skillName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CEO DIRECTIVE (DORAEMON AUTO-DISPATCH), SIMULATION & EXECUTIVE REPORT */}
          {activeTab === 'tasks' && (
            <div className="p-3.5 grid grid-cols-1 md:grid-cols-12 gap-3.5 max-h-[270px] overflow-y-auto">
              {/* Left Column: CEO Directive via Doraemon (Default) or Direct Task */}
              <div className="md:col-span-5 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setDispatchMode('ceo_auto')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        dispatchMode === 'ceo_auto'
                          ? 'bg-amber-400 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Chỉ thị Giám đốc (Doraemon điều phối)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDispatchMode('direct')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        dispatchMode === 'direct'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Giao trực tiếp
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>{showCalculator ? 'Đóng tính giá' : 'Tính giá m2'}</span>
                  </button>
                </div>

                {dispatchMode === 'ceo_auto' ? (
                  <div className="px-2.5 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-sky-400">Trưởng phòng Quản lý chung Doraemon:</strong> Nhận chỉ thị chung từ Giám đốc → Tự động giao đúng thành viên (<strong className="text-white">Shizuka, Suneo, Nobita, Chaian</strong>) → Nhận báo cáo từ nhân viên và tổng hợp tư vấn lại cho Giám đốc.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      id="agent-select-task"
                      aria-label="Chọn Trợ lý AI nhận nhiệm vụ"
                      value={selectedAgent.id}
                      onChange={(e) => onSelectAgent(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} — {a.departmentLabel}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Khu vực thực thi 3D"
                      value={taskZoneId}
                      onChange={(e) => setTaskZoneId(e.target.value as ZoneId)}
                      className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                    >
                      <option value="coworking">Thực thi tại: Khu chung / Máy in</option>
                      <option value="meeting">Thực thi tại: Phòng họp</option>
                      <option value="lobby">Thực thi tại: Sảnh chính</option>
                      <option value={selectedAgent.zoneId}>
                        Tại bàn bộ phận ({selectedAgent.departmentLabel})
                      </option>
                    </select>
                  </div>
                )}

                {showCalculator ? (
                  <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg space-y-2 text-xs">
                    <div className="font-semibold text-amber-400">
                      Công cụ Bóc tách Báo giá Nhanh (SOP-BG-2026-01)
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400">Chất liệu</label>
                        <select
                          aria-label="Chất liệu in"
                          value={quoteInput.materialType}
                          onChange={(e) =>
                            setQuoteInput({
                              ...quoteInput,
                              materialType: e.target.value as PrintQuoteInput['materialType']
                            })
                          }
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white"
                        >
                          <option value="hiflex">Bạt Hiflex (45k/m2)</option>
                          <option value="decal_pp">Decal PP (75k/m2)</option>
                          <option value="mica_led">Mica LED (1.15tr/m2)</option>
                          <option value="standee">Standee (260k/bộ)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400">Ngang × Cao (m)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            aria-label="Chiều ngang mét"
                            min={0.5}
                            step={0.5}
                            value={quoteInput.widthMeters}
                            onChange={(e) =>
                              setQuoteInput({
                                ...quoteInput,
                                widthMeters: Number(e.target.value)
                              })
                            }
                            className="w-full px-1.5 py-1 bg-slate-950 border border-slate-700 rounded text-white tabular-nums"
                          />
                          <input
                            type="number"
                            aria-label="Chiều cao mét"
                            min={0.5}
                            step={0.5}
                            value={quoteInput.heightMeters}
                            onChange={(e) =>
                              setQuoteInput({
                                ...quoteInput,
                                heightMeters: Number(e.target.value)
                              })
                            }
                            className="w-full px-1.5 py-1 bg-slate-950 border border-slate-700 rounded text-white tabular-nums"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400">Số lượng</label>
                        <input
                          type="number"
                          aria-label="Số lượng in"
                          min={1}
                          value={quoteInput.quantity}
                          onChange={(e) =>
                            setQuoteInput({
                              ...quoteInput,
                              quantity: Number(e.target.value)
                            })
                          }
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-white tabular-nums"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-300 tabular-nums">
                        Tổng ({quoteResult.totalAreaSqm}m2, CK {quoteResult.discountPercent}%, VAT 8%):{' '}
                        <strong className="text-emerald-400">{formatVnd(quoteResult.grandTotalVnd)}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onIssueCeoDirective(
                            `Tính báo giá đơn hàng in ${quoteInput.materialType.toUpperCase()} kích thước ${quoteInput.widthMeters}m x ${quoteInput.heightMeters}m, số lượng ${quoteInput.quantity} (${quoteResult.totalAreaSqm}m2). Tổng dự kiến ${formatVnd(quoteResult.grandTotalVnd)}.`,
                            'high'
                          );
                          setShowCalculator(false);
                        }}
                        className="px-2.5 py-1 bg-amber-400 text-slate-950 font-semibold rounded cursor-pointer"
                      >
                        Ra chỉ thị lập báo giá
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Custom Directive / Task Form placed right near top for fast access */}
                    <form onSubmit={handleTaskSubmit} className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          aria-label="Nhập nhiệm vụ giao cho trợ lý AI"
                          placeholder={
                            dispatchMode === 'ceo_auto'
                              ? 'Nhập chỉ thị (VD: Cho báo giá số lượng 80m2 bạt)...'
                              : `Giao nhiệm vụ trực tiếp cho ${selectedAgent.name}...`
                          }
                          value={taskPrompt}
                          onChange={(e) => {
                            setTaskPrompt(e.target.value);
                            if (taskFormError) setTaskFormError('');
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{dispatchMode === 'ceo_auto' ? 'Ra chỉ thị' : 'Thực thi'}</span>
                        </button>
                      </div>
                      {taskFormError && (
                        <p role="alert" className="text-xs text-rose-400">
                          {taskFormError}
                        </p>
                      )}
                    </form>

                    {/* Immediate Inline Result Summary right under the input box so user never misses it */}
                    {selectedTask && selectedTask.report && (
                      <div className="px-2.5 py-1.5 bg-emerald-950/70 border border-emerald-500/50 rounded-lg text-[11px] flex flex-col gap-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-emerald-300 truncate">
                            ✓ Phản hồi từ{' '}
                            {selectedTask.coordinatorDispatch?.assignedAgentName ||
                              agents.find((a) => a.id === selectedTask.agentId)?.name}
                            :
                          </span>
                          <span className="text-[10px] font-mono text-amber-300 shrink-0">
                            {selectedTask.status === 'completed'
                              ? 'Đã trả kết quả'
                              : `Đang xử lý ${selectedTask.progress}%`}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-emerald-400 tabular-nums">
                          {selectedTask.report.totalAmountFormatted ||
                            selectedTask.report.headline}
                        </div>
                      </div>
                    )}

                    {/* Preset Directives / Tasks */}
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-400">
                        {dispatchMode === 'ceo_auto'
                          ? 'Chỉ thị mẫu (Bấm để giao ngay qua Doraemon):'
                          : `Nhiệm vụ mẫu của ${selectedAgent.name}:`}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {dispatchMode === 'ceo_auto'
                          ? CEO_DIRECTIVE_PRESETS.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() =>
                                  onIssueCeoDirective(preset.prompt, 'high')
                                }
                                className="px-2 py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-md text-left truncate max-w-full transition-colors cursor-pointer"
                              >
                                <span className="text-amber-300 font-medium">
                                  + {preset.label}
                                </span>{' '}
                                <span className="text-slate-400">
                                  {preset.expectedDeptHint}
                                </span>
                              </button>
                            ))
                          : selectedAgent.sampleTasks.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() =>
                                  onAssignTask(
                                    selectedAgent.id,
                                    preset.prompt,
                                    preset.targetZoneId,
                                    preset.priority
                                  )
                                }
                                className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded-md text-left truncate max-w-full transition-colors cursor-pointer"
                              >
                                + {preset.label}
                              </button>
                            ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right Column: Live Task Simulation & Executive Report Output */}
              <div className="md:col-span-7 bg-slate-900/85 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between gap-2.5">
                {/* Task Selector Bar */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {tasks.slice(0, 4).map((t) => {
                      const ag = agents.find((a) => a.id === t.agentId);
                      const isSel = t.id === selectedTask?.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onSelectTask(t.id)}
                          className={`px-2.5 py-1 text-xs rounded-md border whitespace-nowrap shrink-0 cursor-pointer ${
                            isSel
                              ? 'bg-slate-800 text-amber-300 border-amber-400 font-semibold'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {t.coordinatorDispatch?.isCeoDirective ? 'Chỉ thị GĐ → ' : ''}
                          {ag?.name}: {t.title.slice(0, 22)}...
                        </button>
                      );
                    })}
                  </div>
                  {selectedTask && (
                    <span className="text-xs font-mono text-slate-400 tabular-nums shrink-0">
                      Tiến độ: {selectedTask.progress}%
                    </span>
                  )}
                </div>

                {/* Selected Task Details & Report */}
                {selectedTask ? (
                  <div className="space-y-2 text-xs overflow-y-auto max-h-[215px] pr-1">
                    {/* Headline & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-sm text-white">
                        {selectedTask.report?.headline || selectedTask.title}
                      </div>
                      <span
                        className={`text-xs font-semibold shrink-0 ${
                          selectedTask.status === 'rejected_scope'
                            ? 'text-rose-400'
                            : selectedTask.status === 'completed'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {selectedTask.status === 'rejected_scope'
                          ? 'Từ chối trái chuyên môn'
                          : selectedTask.status === 'completed'
                          ? 'Đã trả kết quả Báo cáo'
                          : selectedTask.spatialStepText}
                      </span>
                    </div>

                    {/* Prominent Final Result Banner right at the top */}
                    {selectedTask.report?.totalAmountFormatted && (
                      <div className="px-3 py-2 bg-emerald-950/60 border border-emerald-500/50 rounded-lg flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] text-emerald-300 font-medium block">
                            KẾT QUẢ BÁO CÁO / BÁO GIÁ TỪ{' '}
                            {(
                              selectedTask.coordinatorDispatch
                                ?.assignedAgentName ||
                              agents.find((a) => a.id === selectedTask.agentId)
                                ?.name ||
                              'TRỢ LÝ'
                            ).toUpperCase()}
                            :
                          </span>
                          <span className="text-sm font-bold text-emerald-400 tabular-nums">
                            {selectedTask.report.totalAmountFormatted}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-amber-300">
                          {selectedTask.report.appliedSopCodes.join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Calculation Table placed immediately above the fold */}
                    {selectedTask.report?.calculationRows &&
                      selectedTask.report.calculationRows.length > 0 && (
                        <div className="overflow-x-auto border border-slate-800 rounded-md">
                          <table className="w-full text-left border-collapse text-[11px] tabular-nums">
                            <thead>
                              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                                <th className="py-1.5 px-2">Hạng mục</th>
                                <th className="py-1.5 px-2">Chi tiết định mức SOP</th>
                                <th className="py-1.5 px-2 text-right">Khối lượng</th>
                                <th className="py-1.5 px-2 text-right">Đơn giá / CK</th>
                                <th className="py-1.5 px-2 text-right">Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedTask.report.calculationRows.map((row, idx) => {
                                const isTotalRow = row.item.startsWith('TỔNG');
                                return (
                                  <tr
                                    key={idx}
                                    className={`border-b border-slate-800/60 ${
                                      isTotalRow
                                        ? 'bg-emerald-950/40 text-emerald-300 font-bold'
                                        : 'text-slate-200'
                                    }`}
                                  >
                                    <td className="py-1 px-2 font-medium">{row.item}</td>
                                    <td className="py-1 px-2 text-slate-400">{row.spec}</td>
                                    <td className="py-1 px-2 text-right">{row.quantity}</td>
                                    <td className="py-1 px-2 text-right">{row.unitPrice}</td>
                                    <td className="py-1 px-2 text-right font-semibold text-amber-300">
                                      {row.subtotal}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                    {/* Coordinator Dispatch Summary Box if routed by Doraemon */}
                    {(selectedTask.coordinatorDispatch ||
                      selectedTask.report?.coordinatorDispatch) && (
                      <div className="p-2.5 bg-slate-950/90 border border-slate-800 rounded-lg space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                          <span className="font-semibold text-sky-400">
                            Trưởng phòng Quản lý chung: Doraemon (Đô-rê-mon)
                          </span>
                          <span className="text-emerald-400 font-semibold">
                            Đã điều phối →{' '}
                            {
                              (
                                selectedTask.coordinatorDispatch ||
                                selectedTask.report?.coordinatorDispatch
                              )?.assignedAgentName
                            }{' '}
                            (
                            {
                              (
                                selectedTask.coordinatorDispatch ||
                                selectedTask.report?.coordinatorDispatch
                              )?.assignedDepartmentLabel
                            }
                            )
                          </span>
                        </div>
                        {(
                          selectedTask.coordinatorDispatch ||
                          selectedTask.report?.coordinatorDispatch
                        )?.directorSummaryFromDoraemon && (
                          <div className="text-[11px] text-amber-200 leading-relaxed">
                            <strong className="text-amber-400">
                              Doraemon báo cáo Giám đốc:{' '}
                            </strong>
                            {
                              (
                                selectedTask.coordinatorDispatch ||
                                selectedTask.report?.coordinatorDispatch
                              )?.directorSummaryFromDoraemon
                            }
                          </div>
                        )}
                      </div>
                    )}

                    {selectedTask.report && (
                      <>
                        <p className="text-slate-300 leading-relaxed">
                          {selectedTask.report.summary}
                        </p>

                        <ul className="space-y-1 text-slate-200 pl-1">
                          {selectedTask.report.keyFindings.map((finding, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              {selectedTask.report?.scopeCheckPassed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                              )}
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                          Đề xuất tiếp theo: {selectedTask.report.recommendation}
                        </div>

                        {selectedTask.report?.formalDocument && (
                          <div className="mt-3 border border-amber-500/40 rounded-xl bg-slate-950/95 overflow-hidden shadow-2xl">
                            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-950/60 to-slate-900 border-b border-amber-500/30">
                              <div className="flex items-center gap-2">
                                <span className="text-base">
                                  {(() => {
                                  const t = selectedTask.report.formalDocument.documentType;
                                  if (t === 'contract') return '📜';
                                  if (t === 'delivery_note') return '📦';
                                  if (t === 'b2b_email') return '✉️';
                                  if (t === 'meeting_minutes') return '📋';
                                  if (t === 'complaint_8d') return '🛡️';
                                  if (t === 'iso_sop') return '⚙️';
                                  if (t === 'kanban_tracking') return '📊';
                                  if (t === 'company_profile') return '🏛️';
                                  return '📄';
                                })()}
                                </span>
                                <div>
                                  <div className="text-xs font-bold text-amber-300">
                                    {selectedTask.report.formalDocument.title}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    Quy chuẩn văn bản hành chính · Đạt tiêu chuẩn Luật Thương mại & Nghị định 30/2020/NĐ-CP
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (navigator.clipboard && selectedTask.report?.formalDocument) {
                                      navigator.clipboard.writeText(selectedTask.report.formalDocument.content);
                                      alert('Đã sao chép toàn bộ văn bản vào bộ nhớ tạm! Bạn có thể dán (Ctrl+V) vào Word hoặc gửi khách hàng.');
                                    }
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 rounded shadow cursor-pointer transition-colors"
                                >
                                  📋 Sao chép văn bản
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const printWin = window.open('', '_blank');
                                    if (printWin && selectedTask.report?.formalDocument) {
                                      printWin.document.write(`
                                        <html>
                                          <head>
                                            <title>${selectedTask.report.formalDocument.title}</title>
                                            <style>
                                              body { font-family: 'Courier New', Courier, monospace; font-size: 13px; line-height: 1.6; margin: 40px; white-space: pre-wrap; color: #111; }
                                              @media print { body { margin: 20mm; font-size: 12pt; } }
                                            </style>
                                          </head>
                                          <body>${selectedTask.report.formalDocument.content}</body>
                                        </html>
                                      `);
                                      printWin.document.close();
                                      printWin.focus();
                                      printWin.print();
                                    }
                                  }}
                                  className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 rounded cursor-pointer transition-colors"
                                >
                                  🖨️ In / Xuất PDF
                                </button>
                              </div>
                            </div>
                            <div className="p-3.5 max-h-72 overflow-y-auto bg-slate-950/80 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed select-text border-t border-slate-900">
                              {selectedTask.report.formalDocument.content}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Chưa có nhiệm vụ nào được chọn. Hãy giao nhiệm vụ mới ở cột bên trái.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TRAINING SOP DOCUMENTS & 42 SKILLS CATALOG */}
          {activeTab === 'sops' && (
            <div className="p-3.5 flex flex-col gap-3 max-h-[265px] overflow-y-auto">
              {/* Header Switcher between Department SOPs vs 42 Skills Catalog */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSkillsViewMode('sops')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      skillsViewMode === 'sops'
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    📋 Quy chuẩn SOP theo Bộ phận ({deptSops.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkillsViewMode('skills_catalog')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      skillsViewMode === 'skills_catalog'
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span>📚 Thư viện 42 Skills & Biểu Mẫu (AccKit Claude)</span>
                    <span className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                      Mới
                    </span>
                  </button>
                </div>

                {skillsViewMode === 'skills_catalog' ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Tìm kiếm skill, biểu mẫu..."
                      value={skillSearchQuery}
                      onChange={(e) => setSkillSearchQuery(e.target.value)}
                      className="px-2.5 py-0.8 bg-slate-950 text-slate-200 border border-slate-700 rounded-md text-xs w-44 focus:outline-none focus:border-amber-400"
                    />
                    {(['all', 'office_12', 'deep_30'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSkillCategoryFilter(cat)}
                        className={`px-2 py-0.8 text-[11px] rounded transition-colors whitespace-nowrap cursor-pointer ${
                          skillCategoryFilter === cat
                            ? 'bg-sky-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {cat === 'all'
                          ? 'Tất cả (42)'
                          : cat === 'office_12'
                          ? '12 Kỹ năng Văn phòng'
                          : '30 Skills Chuyên sâu'}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 overflow-x-auto max-w-full">
                    {agents.map((ag) => (
                      <button
                        key={ag.departmentId}
                        type="button"
                        onClick={() => setSopDeptId(ag.departmentId)}
                        className={`px-2 py-0.8 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          sopDeptId === ag.departmentId
                            ? 'bg-amber-400 text-slate-950 font-semibold'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {ag.name.split(' ')[0]} ({ag.slashCommand || ''})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View 1: 42 Skills & Templates Catalog */}
              {skillsViewMode === 'skills_catalog' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pr-1 overflow-y-auto max-h-[195px]">
                  {SKILLS_CATALOG.filter((sk) => {
                    const matchCat =
                      skillCategoryFilter === 'all' || sk.category === skillCategoryFilter;
                    const matchQ =
                      !skillSearchQuery.trim() ||
                      sk.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
                      sk.description.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
                      sk.code.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
                      sk.assignedAgentName.toLowerCase().includes(skillSearchQuery.toLowerCase());
                    return matchCat && matchQ;
                  }).map((sk) => (
                    <div
                      key={sk.id}
                      className="p-2.5 bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 rounded-lg flex flex-col justify-between gap-1.5 text-xs transition-colors group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono font-bold text-amber-300 text-[11px]">
                            {sk.code}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sky-950 text-sky-400 border border-sky-800 rounded">
                            {sk.slashCommand}
                          </span>
                        </div>
                        <div className="font-bold text-white text-xs">
                          {sk.name}
                        </div>
                        <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                          {sk.description}
                        </p>
                      </div>

                      <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-1">
                        <span className="text-[10px] text-slate-400 truncate">
                          Phụ trách: <strong className="text-slate-200">{sk.assignedAgentName.split(' ')[0]}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setTaskPrompt(sk.samplePrompt);
                            const assignedAgent = agents.find(
                              (a) => a.characterKey === sk.assignedAgentKey
                            );
                            if (assignedAgent) {
                              onSelectAgent(assignedAgent.id);
                              onSelectZone(assignedAgent.zoneId);
                            }
                            setActiveTab('tasks');
                          }}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded shadow cursor-pointer transition-colors whitespace-nowrap"
                        >
                          ⚡ Giao việc ngay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* View 2: Existing SOP Documents */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 max-h-[195px] overflow-y-auto">
                  <div className="lg:col-span-7 space-y-2 pr-1">
                    {deptSops.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold text-white">
                            [{doc.code}] {doc.title}
                          </div>
                          <button
                            type="button"
                            onClick={() => onToggleSop(doc.id)}
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded border cursor-pointer whitespace-nowrap shrink-0 ${
                              doc.isActive
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {doc.isActive ? 'Đang áp dụng' : 'Tạm tắt'}
                          </button>
                        </div>
                        <p className="text-slate-400 text-[11px]">{doc.summary}</p>
                        <ul className="space-y-0.5 text-slate-200 pl-1 text-[11px]">
                          {doc.rules.map((r, i) => (
                            <li key={i}>• {r}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Right Form: Add New Training SOP */}
                  <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                    <form onSubmit={handleSopSubmit} className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <FolderPlus className="w-4 h-4 text-amber-400" />
                          <span>Nạp SOP Mới</span>
                        </span>
                        <label className="text-[11px] text-amber-400 hover:underline cursor-pointer">
                          <span>Tải file (.txt/.md)</span>
                          <input
                            type="file"
                            accept=".txt,.md,.csv,.json"
                            onChange={handleFileUploadSop}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Mã SOP</label>
                          <input
                            type="text"
                            value={sopCode}
                            onChange={(e) => setSopCode(e.target.value)}
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-400 mb-0.5">Tiêu đề</label>
                          <input
                            type="text"
                            value={sopTitle}
                            onChange={(e) => setSopTitle(e.target.value)}
                            placeholder="Tên quy chuẩn..."
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Các quy tắc SOP (mỗi dòng 1 quy tắc)</label>
                        <textarea
                          rows={2}
                          value={sopRulesText}
                          onChange={(e) => setSopRulesText(e.target.value)}
                          placeholder="Quy tắc 1...&#10;Quy tắc 2..."
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-1 bg-amber-400 text-slate-950 font-bold rounded hover:bg-amber-300 transition-colors cursor-pointer text-xs"
                      >
                        + Nạp vào Bộ Nhớ Bộ Phận
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};