import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePrintQuote,
  computeAgentWaypoint,
  dispatchCeoDirective,
  generateLocalSopGroundedReport,
  getActiveSocialDialogue,
  OFFICE_SOCIAL_DIALOGUES,
  validateScopeAndRoute,
  validateSopDocumentInput
} from './officeLogic';
import { INITIAL_AGENTS, INITIAL_SOP_DOCUMENTS, OFFICE_ZONES } from '../data/officeData';

test('dispatchCeoDirective accurately routes general CEO directives via Doraemon to Shizuka, Nobita, Suneo, Chaian, or Doraemon', () => {
  const quoteDispatch = dispatchCeoDirective(
    'Báo giá gấp đơn hàng 80m2 bạt Hiflex, làm hợp đồng mua bán và phiếu giao hàng cho khách',
    INITIAL_AGENTS,
    INITIAL_SOP_DOCUMENTS
  );
  assert.equal(quoteDispatch.coordinator.characterKey, 'doraemon');
  assert.equal(quoteDispatch.assignedAgent.departmentId, 'sales_quoting');
  assert.equal(quoteDispatch.assignedAgent.characterKey, 'shizuka');
  assert.ok(quoteDispatch.dispatchInfo.directorSummaryFromDoraemon.includes('Shizuka'));

  const designDispatch = dispatchCeoDirective(
    'Kiểm tra và chỉnh sửa file thiết kế Poster hệ màu CMYK và tràn lề bleed 3mm trước khi bình bài',
    INITIAL_AGENTS,
    INITIAL_SOP_DOCUMENTS
  );
  assert.equal(designDispatch.assignedAgent.departmentId, 'design_tech');
  assert.equal(designDispatch.assignedAgent.characterKey, 'nobita');

  const accDispatch = dispatchCeoDirective(
    'Đối soát công nợ, thông tin hợp đồng đối tác, chi phí vật tư và giấy tờ hóa đơn VAT tháng 10',
    INITIAL_AGENTS,
    INITIAL_SOP_DOCUMENTS
  );
  assert.equal(accDispatch.assignedAgent.departmentId, 'accounting');
  assert.equal(accDispatch.assignedAgent.characterKey, 'suneo');

  const mktDispatch = dispatchCeoDirective(
    'Tìm hiểu về đối thủ cạnh tranh và lập chiến dịch Marketing quảng cáo POSM',
    INITIAL_AGENTS,
    INITIAL_SOP_DOCUMENTS
  );
  assert.equal(mktDispatch.assignedAgent.departmentId, 'marketing');
  assert.equal(mktDispatch.assignedAgent.characterKey, 'chaian');

  const hrDispatch = dispatchCeoDirective(
    'Tư vấn tổng hợp chung công việc các bộ phận với giám đốc và điều phối phân ca xưởng in',
    INITIAL_AGENTS,
    INITIAL_SOP_DOCUMENTS
  );
  assert.equal(hrDispatch.assignedAgent.departmentId, 'hr_ops');
  assert.equal(hrDispatch.assignedAgent.characterKey, 'doraemon');
});

test('calculatePrintQuote computes Hiflex area, volume discount, and VAT 8% accurately', () => {
  const result = calculatePrintQuote({
    materialType: 'hiflex',
    widthMeters: 10,
    heightMeters: 6,
    quantity: 1,
    finishingOption: 'eyelet_glue',
    rushOrder: false
  });

  assert.equal(result.totalAreaSqm, 60);
  assert.equal(result.baseUnitRateVnd, 45000);
  // 60m2 >= 50m2 triggers 8% volume discount
  assert.equal(result.discountPercent, 8);
  assert.ok(result.grandTotalVnd > result.subtotalVnd);
  assert.equal(result.vatVnd, Math.round(result.subtotalVnd * 0.08));
});

test('validateScopeAndRoute allows in-scope tasks and blocks cross-department violations', () => {
  const marketingAgent = INITIAL_AGENTS.find((a) => a.departmentId === 'marketing')!;
  const designAgent = INITIAL_AGENTS.find((a) => a.departmentId === 'design_tech')!;

  const validCheck = validateScopeAndRoute(
    marketingAgent,
    'Tìm hiểu về đối thủ cạnh tranh trong ngành in quảng cáo',
    INITIAL_AGENTS,
    INITIAL_SOP_DOCUMENTS
  );
  assert.equal(validCheck.isInScope, true);

  const crossDeptCheck = validateScopeAndRoute(
    designAgent,
    'Đối soát công nợ sổ sách tiền hàng và xuất hóa đơn VAT tháng 10',
    INITIAL_AGENTS,
    INITIAL_SOP_DOCUMENTS
  );
  assert.equal(crossDeptCheck.isInScope, false);
  assert.equal(crossDeptCheck.suggestedAgent?.departmentId, 'accounting');
});

test('validateSopDocumentInput rejects empty or short inputs and parses valid rules', () => {
  const invalid = validateSopDocumentInput({
    departmentId: 'sales_quoting',
    code: 'S',
    title: 'Ngắn',
    category: 'Báo giá',
    summary: '',
    rulesText: 'Quá ngắn'
  });
  assert.equal(invalid.valid, false);

  const valid = validateSopDocumentInput({
    departmentId: 'sales_quoting',
    code: 'SOP-BG-2026-09',
    title: 'Quy chuẩn báo giá in UV phẳng trên Mica 5mm',
    category: 'Định mức in UV',
    summary: 'Quy định đơn giá in UV phẳng cao cấp',
    rulesText: '- Đơn giá in UV phẳng trên Mica 5mm là 320.000đ/m2.\n- Đơn hàng trên 30m2 giảm 10%.'
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.parsedRules.length, 2);
});

test('generateLocalSopGroundedReport produces structured report for each department', () => {
  for (const agent of INITIAL_AGENTS) {
    const samplePrompt = agent.sampleTasks[0].prompt;
    const report = generateLocalSopGroundedReport(
      agent,
      samplePrompt,
      INITIAL_AGENTS,
      INITIAL_SOP_DOCUMENTS
    );
    assert.equal(report.scopeCheckPassed, true);
    assert.ok(report.headline.length > 10);
    assert.ok(report.keyFindings.length >= 2);
    assert.ok(report.appliedSopCodes.length >= 1);
  }
});

test('computeAgentWaypoint moves agent to meeting room during all-hands meeting', () => {
  const salesAgent = INITIAL_AGENTS[0];
  const normalWp = computeAgentWaypoint(salesAgent, [], OFFICE_ZONES, false, 0);
  assert.equal(normalWp.position.x, salesAgent.homePosition.x);

  const meetingWp = computeAgentWaypoint(salesAgent, [], OFFICE_ZONES, true, 0);
  assert.equal(meetingWp.position.z, -5.8);
  assert.equal(meetingWp.isMovingTarget, true);
});

test('cho báo giá số lượng 80m2 bạt routes to Shizuka (Xuka) and returns full 5-row quote breakdown', () => {
  const dispatch = dispatchCeoDirective(
    'cho báo giá số lượng 80m2 bạt',
    INITIAL_AGENTS,
    INITIAL_SOP_DOCUMENTS
  );
  assert.equal(dispatch.assignedAgent.characterKey, 'shizuka');

  const report = generateLocalSopGroundedReport(
    dispatch.assignedAgent,
    'cho báo giá số lượng 80m2 bạt',
    INITIAL_AGENTS,
    INITIAL_SOP_DOCUMENTS
  );
  assert.equal(report.scopeCheckPassed, true);
  assert.ok(report.totalAmountFormatted?.includes('4.053.888đ'));
  assert.ok(report.totalAmountFormatted?.includes('2.026.944đ'));
  assert.equal(report.calculationRows?.length, 5);
  assert.equal(report.calculationRows?.[0].subtotal, '3.600.000đ');
  assert.equal(report.calculationRows?.[1].subtotal, '480.000đ');
  assert.equal(report.calculationRows?.[2].subtotal, '-326.400đ');
  assert.equal(report.calculationRows?.[3].subtotal, '300.288đ');
  assert.equal(report.calculationRows?.[4].subtotal, '4.053.888đ');
});

test('getActiveSocialDialogue cycles through character conversation pairs and speaker/listener turns', () => {
  assert.ok(OFFICE_SOCIAL_DIALOGUES.length >= 5);
  const firstSlotSpeaker = getActiveSocialDialogue(1.0);
  assert.equal(firstSlotSpeaker.cycleIndex, 0);
  assert.equal(firstSlotSpeaker.activeTurn, 'speaker');
  assert.equal(firstSlotSpeaker.exchange.speakerKey, 'shizuka');
  assert.equal(firstSlotSpeaker.exchange.listenerKey, 'nobita');
  assert.equal(firstSlotSpeaker.activeText, firstSlotSpeaker.exchange.speakerLine);

  const firstSlotListener = getActiveSocialDialogue(6.5);
  assert.equal(firstSlotListener.cycleIndex, 0);
  assert.equal(firstSlotListener.activeTurn, 'listener');
  assert.equal(firstSlotListener.activeText, firstSlotListener.exchange.listenerReply);

  const secondSlot = getActiveSocialDialogue(10.0);
  assert.equal(secondSlot.cycleIndex, 1);
  assert.equal(secondSlot.exchange.speakerKey, 'doraemon');
  assert.equal(secondSlot.exchange.listenerKey, 'suneo');
});

