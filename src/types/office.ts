export type ZoneId =
  | 'overview'
  | 'lobby'
  | 'coworking'
  | 'meeting'
  | 'sales_quoting'
  | 'accounting'
  | 'design_tech'
  | 'marketing'
  | 'hr_ops';

export type DepartmentId =
  | 'sales_quoting'
  | 'accounting'
  | 'design_tech'
  | 'marketing'
  | 'hr_ops';

export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

export interface OfficeZone {
  id: ZoneId;
  name: string;
  shortLabel: string;
  category: 'common' | 'department';
  departmentId?: DepartmentId;
  accentHex: string;
  center: Vector3Tuple;
  size: { width: number; depth: number };
  cameraPosition: Vector3Tuple;
  cameraTarget: Vector3Tuple;
  description: string;
  keyEquipment: string[];
  aiSpatialInteraction: string;
}

export interface SopDocument {
  id: string;
  departmentId: DepartmentId;
  code: string;
  title: string;
  category: string;
  summary: string;
  rules: string[];
  updatedAt: string;
  isActive: boolean;
}

export interface SampleTaskPreset {
  id: string;
  label: string;
  prompt: string;
  targetZoneId: ZoneId;
  priority: 'normal' | 'high' | 'urgent';
}

export type DoraemonCharacterKey =
  | 'doraemon'
  | 'shizuka'
  | 'suneo'
  | 'nobita'
  | 'chaian';

export interface AgentProfile {
  id: string;
  characterKey: DoraemonCharacterKey;
  name: string;
  roleTitle: string;
  departmentId: DepartmentId;
  departmentLabel: string;
  zoneId: ZoneId;
  accentHex: string;
  suitColorHex: number;
  hairColorHex: number;
  accessoryType: 'glasses' | 'headset' | 'visor' | 'badge' | 'clipboard';
  primaryMission: string;
  strictBoundary: string;
  personalityTraits: string[];
  spatialBehavior: string;
  allowedKeywords: string[];
  homePosition: Vector3Tuple;
  workstationLookAt: Vector3Tuple;
  collaborationPoint: Vector3Tuple;
  sampleTasks: SampleTaskPreset[];
}

export type TaskStatus =
  | 'analyzing_sop'
  | 'executing_3d'
  | 'completed'
  | 'rejected_scope';

export interface CalculationRow {
  item: string;
  spec: string;
  quantity: string;
  unitPrice: string;
  subtotal: string;
}

export interface CoordinatorDispatchInfo {
  isCeoDirective: boolean;
  coordinatorName: string;
  coordinatorRole: string;
  assignedAgentId: string;
  assignedAgentName: string;
  assignedDepartmentLabel: string;
  routingReason: string;
  directorSummaryFromDoraemon: string;
  supportingDepartments: string[];
}

export interface TaskReport {
  headline: string;
  summary: string;
  scopeCheckPassed: boolean;
  scopeExplanation: string;
  appliedSopCodes: string[];
  spatialActionTaken: string;
  keyFindings: string[];
  calculationRows?: CalculationRow[];
  totalAmountFormatted?: string;
  recommendation: string;
  executionTimeSec: number;
  sourceMode: 'gemini-api' | 'sop-engine';
  coordinatorDispatch?: CoordinatorDispatchInfo;
}

export interface TaskAssignment {
  id: string;
  agentId: string;
  title: string;
  prompt: string;
  priority: 'normal' | 'high' | 'urgent';
  targetZoneId: ZoneId;
  status: TaskStatus;
  progress: number;
  appliedSopIds: string[];
  spatialStepText: string;
  report?: TaskReport;
  createdAt: string;
  completedAt?: string;
  coordinatorDispatch?: CoordinatorDispatchInfo;
}

export interface PrintQuoteInput {
  materialType: 'hiflex' | 'decal_pp' | 'mica_led' | 'standee' | 'catalog_offset';
  widthMeters: number;
  heightMeters: number;
  quantity: number;
  finishingOption: 'none' | 'eyelet_glue' | 'matte_lamination' | 'alu_frame';
  rushOrder: boolean;
}

export interface PrintQuoteResult {
  areaSqmPerUnit: number;
  totalAreaSqm: number;
  baseUnitRateVnd: number;
  finishingCostVnd: number;
  discountPercent: number;
  rushSurchargeVnd: number;
  subtotalVnd: number;
  vatVnd: number;
  grandTotalVnd: number;
  appliedSopRule: string;
}
