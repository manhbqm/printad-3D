export type ZoneId =
  | 'overview'
  | 'lobby'
  | 'coworking'
  | 'meeting'
  | 'sales_quoting'
  | 'accounting'
  | 'design_tech'
  | 'marketing'
  | 'hr_ops'
  | 'warehouse_supply'
  | 'admin_ehs';

export type DepartmentId =
  | 'board_executive'
  | 'sales_b2b'
  | 'marketing'
  | 'customer_service'
  | 'accounting'
  | 'human_resources'
  | 'warehouse_supply'
  | 'administration_ehs'
  | 'design_tech'
  | 'sales_quoting'
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
  | 'chaian'
  | 'dekisugi'
  | 'dorami'
  | 'jaiko'
  | 'kaminari'
  | 'sensei'
  | 'tamako'
  | 'nobisuke'
  | 'minidora_red'
  | 'minidora_yellow'
  | 'sewashi'
  | 'sunetsugu'
  | 'goda_mom';

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
  accessoryType:
    | 'glasses'
    | 'headset'
    | 'visor'
    | 'badge'
    | 'clipboard'
    | 'bow'
    | 'beret'
    | 'tie';
  primaryMission: string;
  strictBoundary: string;
  personalityTraits: string[];
  spatialBehavior: string;
  allowedKeywords: string[];
  slashCommand?: string;
  skills?: string[];
  subAgentModule?: string;
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

export interface FormalDocument {
  id: string;
  documentType: 'contract' | 'delivery_note' | 'quotation' | 'b2b_email' | 'meeting_minutes' | 'complaint_8d' | 'iso_sop' | 'kanban_tracking' | 'company_profile' | 'general';
  title: string;
  documentNumber: string;
  issueDate: string;
  parties?: {
    partyA: string;
    partyB: string;
  };
  content: string;
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
  formalDocument?: FormalDocument;
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

export type PrintQuoteProductType =
  | 'hiflex'
  | 'decal_pp'
  | 'mica_led'
  | 'standee'
  | 'catalog_offset'
  | 'flyer'
  | 'catalogue'
  | 'bag'
  | 'folder'
  | 'envelope'
  | 'lixi'
  | 'uv_dtf';

export interface PrintQuoteInput {
  materialType: PrintQuoteProductType;
  widthMeters: number;
  heightMeters: number;
  quantity: number;
  finishingOption:
    | 'none'
    | 'eyelet_glue'
    | 'matte_lamination'
    | 'alu_frame'
    | 'glossy_lamination'
    | 'gluing'
    | 'die_cut'
    | 'saddle_stitch'
    | 'perfect_bind';
  rushOrder: boolean;
  paperId?: string;
  paperName?: string;
  printSides?: 1 | 2;
  printColors?: number;
  totalPages?: number;
  bindingType?: 'saddleStitch' | 'perfectBind' | 'hardCover';
  bagDepthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export interface PrintQuoteResult {
  areaSqmPerUnit: number;
  totalAreaSqm: number;
  baseCost?: number;
  baseUnitRateVnd: number;
  finishingCostVnd: number;
  discountPercent: number;
  rushSurchargeVnd: number;
  subtotalVnd: number;
  vatVnd: number;
  grandTotalVnd: number;
  appliedSopRule: string;
  machineName?: string;
  paperName?: string;
  unitPriceVnd?: number;
  paperCostVnd?: number;
  printingCostVnd?: number;
  profitVnd?: number;
  productsPerSheet?: number;
  totalSheets?: number;
  wasteSheets?: number;
  printStyle?: string;
  cloudAppUrl?: string;
}

export interface SkillCatalogItem {
  id: string;
  code: string;
  name: string;
  category: 'office_12' | 'deep_30' | 'department_8';
  categoryLabel: string;
  assignedAgentName: string;
  assignedAgentKey: DoraemonCharacterKey;
  slashCommand: string;
  description: string;
  samplePrompt: string;
  templateFileName?: string;
}
