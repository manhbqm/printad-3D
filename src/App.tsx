/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  INITIAL_AGENTS,
  INITIAL_SOP_DOCUMENTS,
  INITIAL_TASK_HISTORY,
  OFFICE_ZONES
} from './data/officeData';
import {
  AgentProfile,
  CoordinatorDispatchInfo,
  SopDocument,
  TaskAssignment,
  ZoneId
} from './types/office';
import {
  dispatchCeoDirective,
  generateLocalSopGroundedReport
} from './utils/officeLogic';
import {
  LiveDialogueBannerInfo,
  OfficeActivityStats,
  VirtualOffice3D
} from './components/VirtualOffice3D';
import { BottomControlDock, DockTab } from './components/BottomControlDock';

export default function App() {
  const [zones] = useState(OFFICE_ZONES);
  const [agents] = useState<AgentProfile[]>(INITIAL_AGENTS);
  const [sops, setSops] = useState<SopDocument[]>(INITIAL_SOP_DOCUMENTS);
  const [tasks, setTasks] = useState<TaskAssignment[]>(INITIAL_TASK_HISTORY);

  const [activeZoneId, setActiveZoneId] = useState<ZoneId>('overview');
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    INITIAL_AGENTS[0].id
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    INITIAL_TASK_HISTORY[0].id
  );
  const [showLiveResultCard, setShowLiveResultCard] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<DockTab>('tasks');
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(true);
  const [isAllHandsMeeting, setIsAllHandsMeeting] = useState<boolean>(false);
  const [isSocialGathering, setIsSocialGathering] = useState<boolean>(false);

  const [activityStats, setActivityStats] = useState<OfficeActivityStats>({
    workingCount: 0,
    totalStaff: 17,
    cafeCount: 3,
    gameCount: 2,
    talkingCount: 4
  });

  const [activeDialogue, setActiveDialogue] = useState<LiveDialogueBannerInfo>({
    speakerName: 'Shizuka (Xuka)',
    listenerName: 'Nobita',
    hubLabel: 'Khu Lounge & Bàn Kiểm Mẫu',
    line: 'Nobita ơi, khách vừa chốt 80m² bạt Hiflex, nhớ kiểm tràn lề 3mm nhé!',
    speakerKey: 'shizuka'
  });

  const activeZone = zones.find((z) => z.id === activeZoneId) || zones[0];
  const selectedAgent =
    agents.find((a) => a.id === selectedAgentId) || agents[0];
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];
  const taskAgent =
    agents.find((a) => a.id === selectedTask?.agentId) || selectedAgent;

  const isAnyTaskRunning = tasks.some(
    (t) => t.status === 'analyzing_sop' || t.status === 'executing_3d'
  );

  const handleSelectZone = (zoneId: ZoneId) => {
    setIsSocialGathering(false);
    setActiveZoneId(zoneId);
    const zoneObj = zones.find((z) => z.id === zoneId);
    if (zoneObj?.departmentId) {
      const deptAgent = agents.find(
        (a) => a.departmentId === zoneObj.departmentId
      );
      if (deptAgent) {
        setSelectedAgentId(deptAgent.id);
      }
    }
  };

  const handleSelectAgent = (agentId: string) => {
    setIsSocialGathering(false);
    setSelectedAgentId(agentId);
    const agentObj = agents.find((a) => a.id === agentId);
    if (agentObj) {
      setActiveZoneId(agentObj.zoneId);
    }
  };

  const handleOpenBriefPanel = () => {
    setIsDockCollapsed(false);
    setActiveTab('tasks');
    setShowLiveResultCard(true);
  };

  const handleToggleAllHandsMeeting = () => {
    const nextState = !isAllHandsMeeting;
    setIsAllHandsMeeting(nextState);
    setIsSocialGathering(false);
    if (nextState) {
      setActiveZoneId('meeting');
    } else {
      setActiveZoneId('overview');
    }
  };

  const handleAddSop = (newSop: SopDocument) => {
    setSops((prev) => [newSop, ...prev]);
  };

  const handleToggleSop = (sopId: string) => {
    setSops((prev) =>
      prev.map((doc) =>
        doc.id === sopId ? { ...doc, isActive: !doc.isActive } : doc
      )
    );
  };

  const handleAssignTask = async (
    agentId: string,
    prompt: string,
    targetZoneId: ZoneId,
    priority: 'normal' | 'high' | 'urgent',
    coordinatorDispatch?: CoordinatorDispatchInfo
  ) => {
    setIsSocialGathering(false);
    const targetAgent = agents.find((a) => a.id === agentId) || agents[0];
    const newTaskId = `task-${Date.now()}`;
    const nowTime = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const deptSops = sops.filter(
      (s) => s.departmentId === targetAgent.departmentId && s.isActive
    );

    const baseLocalReport = generateLocalSopGroundedReport(
      targetAgent,
      prompt,
      agents,
      sops
    );
    const initialReport = coordinatorDispatch
      ? { ...baseLocalReport, coordinatorDispatch }
      : baseLocalReport;

    const initialStepText = coordinatorDispatch?.isCeoDirective
      ? `Bước 1/3: Doraemon tiếp nhận brief → Giao ${targetAgent.name} (${targetAgent.departmentLabel})`
      : `Bước 1/3: ${targetAgent.name} đang đối chiếu quy chuẩn SOP...`;

    const initialTask: TaskAssignment = {
      id: newTaskId,
      agentId: targetAgent.id,
      title: prompt.length > 56 ? `${prompt.slice(0, 56)}...` : prompt,
      prompt,
      priority,
      targetZoneId,
      status: 'analyzing_sop',
      progress: 45,
      appliedSopIds: deptSops.map((s) => s.id),
      spatialStepText: initialStepText,
      report: initialReport,
      createdAt: nowTime,
      coordinatorDispatch
    };

    setSelectedAgentId(targetAgent.id);
    setTasks((prev) => [initialTask, ...prev]);
    setSelectedTaskId(newTaskId);
    setShowLiveResultCard(true);
    setIsDockCollapsed(false);
    setActiveTab('tasks');
    setActiveZoneId(targetAgent.zoneId);

    // Stage 2: Move in 3D space to execute
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === newTaskId && t.status === 'analyzing_sop'
            ? {
                ...t,
                status: 'executing_3d',
                progress: 80,
                spatialStepText: coordinatorDispatch?.isCeoDirective
                  ? `Bước 2/3: ${targetAgent.name} đang tính toán & gửi kết quả về Doraemon...`
                  : `Bước 2/3: ${targetAgent.name} đang thực thi nhiệm vụ trong không gian 3D...`
              }
            : t
        )
      );
      if (targetZoneId !== targetAgent.zoneId) {
        setActiveZoneId(targetZoneId);
      }
    }, 300);

    // Stage 3: Complete deterministically at 700ms so UI immediately shows final result
    setTimeout(() => {
      const doneTime = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });

      setTasks((prev) =>
        prev.map((t) =>
          t.id === newTaskId
            ? {
                ...t,
                status: initialReport.scopeCheckPassed
                  ? 'completed'
                  : 'rejected_scope',
                progress: 100,
                spatialStepText: initialReport.scopeCheckPassed
                  ? `Đã trả kết quả: ${targetAgent.name} đã hoàn thành & báo cáo qua Doraemon`
                  : `Từ chối thực thi: Nhiệm vụ vượt giới hạn chuyên môn bộ phận`,
                completedAt: doneTime
              }
            : t
        )
      );
    }, 700);

    // Optional background enrichment from server-side Gemini endpoint with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const response = await fetch('/api/agent/execute-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: targetAgent,
          prompt,
          sops,
          allAgents: agents
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        if (data?.report) {
          const enrichedReport = {
            ...initialReport,
            ...data.report,
            calculationRows:
              initialReport.calculationRows || data.report.calculationRows,
            totalAmountFormatted:
              targetAgent.departmentId === 'sales_quoting'
                ? initialReport.totalAmountFormatted
                : data.report.totalAmountFormatted ||
                  initialReport.totalAmountFormatted,
            coordinatorDispatch
          };
          setTasks((prev) =>
            prev.map((t) =>
              t.id === newTaskId ? { ...t, report: enrichedReport } : t
            )
          );
        }
      }
    } catch {
      // Deterministic SOP report is already displayed
    }
  };

  const handleIssueCeoDirective = async (
    prompt: string,
    priority: 'normal' | 'high' | 'urgent'
  ) => {
    const dispatch = dispatchCeoDirective(prompt, agents, sops);
    await handleAssignTask(
      dispatch.assignedAgent.id,
      prompt,
      dispatch.targetZoneId,
      priority,
      dispatch.dispatchInfo
    );
  };

  return (
    <div
      data-state="office-active"
      className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col select-none"
    >
      {/* Full-Viewport 3D Agency Scene */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <VirtualOffice3D
          zones={zones}
          agents={agents}
          activeZoneId={activeZoneId}
          selectedAgentId={selectedAgentId}
          tasks={tasks}
          isAllHandsMeeting={isAllHandsMeeting}
          isSocialGathering={isSocialGathering}
          onSelectZone={handleSelectZone}
          onSelectAgent={handleSelectAgent}
          onActivityStatsChange={setActivityStats}
          onActiveDialogueChange={setActiveDialogue}
        />

        {/* 1 & 2. Responsive Top Header Wrapper (Prevents Mobile Overlap while keeping Desktop 1:1) */}
        <div className="absolute top-3 inset-x-3 z-20 pointer-events-none flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          {/* 1. Top-Left Floating Agency Status Card (Matching Video 1:1 + Live Character Interaction Feed) */}
          <div className="pointer-events-auto w-full sm:max-w-[380px] bg-neutral-950/90 border border-neutral-800 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-2xl">
            <div className="text-[11px] font-bold tracking-wider uppercase text-amber-400">
              PRINTAD AGENCY · TRỰC TIẾP
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white font-display leading-snug mt-0.5">
              {isAnyTaskRunning
                ? 'Đang xử lý Brief'
                : isSocialGathering
                ? 'Đang tụ họp giao lưu'
                : activeZoneId === 'overview'
                ? 'Đi lại & Giao tiếp'
                : activeZone.shortLabel}
            </h1>
            <p className="hidden sm:block text-xs text-neutral-400 mt-0.5 leading-relaxed">
              Nhân sự tự động đi lại, gặp gỡ và trao đổi công việc trực tiếp.
            </p>
            <div
              data-testid="agency-live-counter"
              className="mt-1 text-[11px] sm:text-xs font-semibold text-amber-400 tabular-nums"
            >
              {activityStats.workingCount} làm việc · {activityStats.totalStaff}{' '}
              nhân sự · {activityStats.talkingCount ?? 4} đang giao tiếp ·{' '}
              {activityStats.cafeCount} cà phê · {activityStats.gameCount} chơi game
            </div>

            {/* Live Social Conversation Feed Banner */}
            <div
              data-testid="live-social-dialogue-banner"
              className="mt-1.5 sm:mt-2 px-2.5 py-1.5 rounded-lg bg-slate-900/95 border border-sky-500/35 text-[11px]"
            >
              <div className="flex items-center justify-between gap-1 text-sky-300 font-semibold">
                <span>
                  💬 {activeDialogue.speakerName.split(' ')[0]} ↔{' '}
                  {activeDialogue.listenerName.split(' ')[0]}
                </span>
                <span className="text-[10px] text-neutral-400 truncate">
                  {activeDialogue.hubLabel}
                </span>
              </div>
              <div className="text-neutral-200 mt-0.5 leading-snug line-clamp-2">
                "{activeDialogue.line}"
              </div>
            </div>

            {/* Quick 1-Click 3D Doraemon Character Close-Up & Social Gathering Selector */}
            <div className="mt-2 pt-2 border-t border-neutral-800/90 flex flex-wrap items-center gap-1">
              <button
                type="button"
                data-testid="closeup-overview"
                onClick={() => {
                  setShowLiveResultCard(false);
                  setIsSocialGathering(false);
                  handleSelectZone('overview');
                }}
                className={`px-2 py-0.5 text-[11px] font-medium rounded border cursor-pointer transition-colors ${
                  activeZoneId === 'overview' && !isSocialGathering
                    ? 'bg-amber-400 text-neutral-950 border-amber-300 font-bold'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:text-white'
                }`}
              >
                Toàn cảnh
              </button>
              <button
                type="button"
                data-testid="toggle-social-gathering"
                onClick={() => {
                  setShowLiveResultCard(false);
                  setIsSocialGathering(!isSocialGathering);
                }}
                className={`px-2 py-0.5 text-[11px] font-medium rounded border cursor-pointer transition-colors ${
                  isSocialGathering
                    ? 'bg-emerald-400 text-neutral-950 border-emerald-300 font-bold'
                    : 'bg-neutral-900 text-emerald-300 border-emerald-700/70 hover:text-white'
                }`}
              >
                💬 Tụ họp giao lưu
              </button>
              {agents.map((ag) => {
                const isFocused =
                  !isSocialGathering &&
                  selectedAgentId === ag.id &&
                  activeZoneId === ag.zoneId;
                const shortName = ag.name.split(' ')[0];
                return (
                  <button
                    key={ag.id}
                    type="button"
                    data-testid={`closeup-${ag.characterKey}`}
                    onClick={() => {
                      setShowLiveResultCard(false);
                      handleSelectAgent(ag.id);
                    }}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded border cursor-pointer transition-colors flex items-center gap-1 ${
                      isFocused
                        ? 'bg-sky-400 text-neutral-950 border-sky-300 font-bold'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:text-white'
                    }`}
                  >
                    <span>{shortName}</span>
                    {ag.slashCommand && (
                      <span className="text-[10px] font-mono opacity-80">{ag.slashCommand}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Top-Right Floating Action Bar (Matching Video 1:1) */}
          <nav
            aria-label="Thanh công cụ điều hành Agency"
            className="pointer-events-auto flex flex-wrap items-center sm:justify-end gap-1.5"
          >
            <button
              type="button"
              data-testid="top-action-brief"
              onClick={handleOpenBriefPanel}
              className="px-3 py-1.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition-colors cursor-pointer whitespace-nowrap"
            >
              Giao brief
            </button>

            <button
              type="button"
              data-testid="top-action-staff"
              onClick={() => {
                setIsDockCollapsed(false);
                setActiveTab('agents');
              }}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                !isDockCollapsed && activeTab === 'agents'
                  ? 'bg-neutral-800 text-amber-400 border-amber-400/70'
                  : 'bg-neutral-900/90 text-neutral-200 border-neutral-700 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              + Nhân viên
            </button>

            <button
              type="button"
              data-testid="top-action-deliverables"
              onClick={() => setShowLiveResultCard(!showLiveResultCard)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                showLiveResultCard
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/70 font-semibold'
                  : 'bg-neutral-900/90 text-neutral-200 border-neutral-700 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              Sản phẩm ({tasks.length})
            </button>

            <button
              type="button"
              data-testid="top-action-departments"
              onClick={() => {
                setIsDockCollapsed(false);
                setActiveTab('zones');
              }}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                !isDockCollapsed && activeTab === 'zones'
                  ? 'bg-neutral-800 text-amber-400 border-amber-400/70'
                  : 'bg-neutral-900/90 text-neutral-200 border-neutral-700 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              Phòng ban
            </button>

            <button
              type="button"
              data-testid="top-action-costs"
              onClick={() => {
                setIsDockCollapsed(false);
                setActiveTab('sops');
              }}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                !isDockCollapsed && activeTab === 'sops'
                  ? 'bg-neutral-800 text-amber-400 border-amber-400/70'
                  : 'bg-neutral-900/90 text-neutral-200 border-neutral-700 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              Chi phí & SOP
            </button>

            <button
              type="button"
              data-testid="top-action-overview"
              onClick={() => {
                handleSelectZone('overview');
                setShowLiveResultCard(false);
                setIsDockCollapsed(true);
              }}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                activeZoneId === 'overview' && isDockCollapsed
                  ? 'bg-neutral-800 text-white border-neutral-500 font-semibold'
                  : 'bg-neutral-900/90 text-neutral-200 border-neutral-700 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              Toàn cảnh
            </button>
          </nav>
        </div>

        {/* 3. Top-Right Prominent Live Task Result & Quote Output Card (Below Action Bar) */}
        {showLiveResultCard && selectedTask && selectedTask.report && (
          <aside
            aria-label="Kết quả phản hồi từ trợ lý AI"
            data-testid="live-task-result-card"
            className="absolute top-14 right-3 z-20 pointer-events-auto w-[92vw] sm:w-[430px] max-h-[52vh] overflow-y-auto bg-slate-950/95 border border-emerald-500/70 rounded-xl p-3.5 shadow-2xl text-xs space-y-2"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <div className="font-bold text-emerald-400 uppercase tracking-wide text-[11px]">
                  {selectedTask.status === 'completed'
                    ? `ĐÃ TRẢ KẾT QUẢ TỪ ${taskAgent.name.toUpperCase()}`
                    : selectedTask.status === 'rejected_scope'
                    ? 'TỪ CHỐI TRÁI CHUYÊN MÔN'
                    : `ĐANG XỬ LÝ (${selectedTask.progress}%)`}
                </div>
                <h2 className="text-sm font-bold text-white mt-0.5 leading-snug">
                  {selectedTask.report.headline}
                </h2>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Brief đã nhận:{' '}
                  <span className="text-slate-200">"{selectedTask.prompt}"</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLiveResultCard(false)}
                aria-label="Thu gọn bảng kết quả"
                className="px-2 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded cursor-pointer shrink-0"
              >
                Thu gọn
              </button>
            </div>

            {selectedTask.report.totalAmountFormatted && (
              <div className="px-3 py-2 bg-emerald-950/80 border border-emerald-500/60 rounded-lg">
                <div className="text-[11px] text-emerald-300 font-medium">
                  KẾT QUẢ BÁO GIÁ / BÁO CÁO CHÍNH THỨC ({taskAgent.name}):
                </div>
                <div className="text-base font-bold text-emerald-400 tabular-nums mt-0.5">
                  {selectedTask.report.totalAmountFormatted}
                </div>
              </div>
            )}

            {selectedTask.report.calculationRows &&
              selectedTask.report.calculationRows.length > 0 && (
                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left border-collapse text-[11px] tabular-nums">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <th className="py-1 px-2">Hạng mục</th>
                        <th className="py-1 px-2 text-right">KL</th>
                        <th className="py-1 px-2 text-right">Đơn giá</th>
                        <th className="py-1 px-2 text-right">Thành tiền</th>
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
                            <td className="py-1 px-2">
                              <div>{row.item}</div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {row.spec}
                              </div>
                            </td>
                            <td className="py-1 px-2 text-right whitespace-nowrap">
                              {row.quantity}
                            </td>
                            <td className="py-1 px-2 text-right whitespace-nowrap">
                              {row.unitPrice}
                            </td>
                            <td className="py-1 px-2 text-right font-semibold text-amber-300 whitespace-nowrap">
                              {row.subtotal}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            {(selectedTask.coordinatorDispatch ||
              selectedTask.report.coordinatorDispatch) && (
              <div className="p-2 bg-slate-900/95 border border-sky-500/30 rounded-lg text-[11px] text-slate-200 leading-relaxed">
                <strong className="text-sky-400">
                  Trưởng phòng Doraemon trình Giám đốc:{' '}
                </strong>
                {
                  (
                    selectedTask.coordinatorDispatch ||
                    selectedTask.report.coordinatorDispatch
                  )?.directorSummaryFromDoraemon
                }
              </div>
            )}

            <p className="text-slate-300 leading-relaxed text-[11px]">
              {selectedTask.report.summary}
            </p>
          </aside>
        )}

        {/* 4. Bottom-Left Subtle Camera & Interaction Guide (Matching Video 1:1) */}
        {isDockCollapsed && (
          <div className="hidden md:block absolute bottom-12 left-4 z-10 pointer-events-none text-xs text-neutral-400/90 bg-neutral-950/75 px-3 py-1 rounded-md border border-neutral-800/70">
            Kéo để xoay · Cuộn để thu phóng · Bấm vào nhân viên để giao việc · Nhấp đúp để đến gần
          </div>
        )}

        {/* 5. Unified Collapsible Bottom Control Dock */}
        <BottomControlDock
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isDockCollapsed}
          setIsCollapsed={setIsDockCollapsed}
          zones={zones}
          activeZoneId={activeZoneId}
          onSelectZone={handleSelectZone}
          agents={agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={handleSelectAgent}
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={(tid) => {
            setSelectedTaskId(tid);
            setShowLiveResultCard(true);
          }}
          onAssignTask={handleAssignTask}
          onIssueCeoDirective={handleIssueCeoDirective}
          sops={sops}
          onAddSop={handleAddSop}
          onToggleSop={handleToggleSop}
          isAllHandsMeeting={isAllHandsMeeting}
          onToggleAllHandsMeeting={handleToggleAllHandsMeeting}
        />
      </main>
    </div>
  );
}
