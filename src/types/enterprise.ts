import { DepartmentId, FormalDocument, TaskReport, ZoneId } from './office';

export type ApprovalRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';

export interface ApprovalCard {
  id: string;
  taskId: string;
  orderId?: string;
  title: string;
  departmentId: DepartmentId;
  agentId: string;
  agentName: string;
  requiredApprover: string;
  riskLevel: ApprovalRiskLevel;
  triggers: string[];
  details: {
    totalAmountFormatted: string;
    rawAmountVnd: number;
    discountPercent: number;
    customerName?: string;
    productSummary: string;
    isRushOrder?: boolean;
    documentType?: string;
  };
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
}

export interface ApprovalEvaluation {
  requiresApproval: boolean;
  riskLevel: ApprovalRiskLevel;
  triggers: string[];
  recommendation: string;
}

export interface OrderRecord {
  id: string;
  taskId: string;
  customerName: string;
  productType: string;
  specsSummary: string;
  quantity: number;
  subtotalVnd: number;
  discountPercent: number;
  vatVnd: number;
  grandTotalVnd: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'in_production' | 'completed';
  formalDocumentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  orderId?: string;
  documentType: string;
  title: string;
  documentNumber: string;
  content: string;
  legalBasis: string;
  createdAt: string;
}

export interface AutomationJob {
  id: string;
  title: string;
  code: string;
  cronSchedule: string;
  departmentId: DepartmentId;
  assignedAgentKey: string;
  assignedAgentName: string;
  description: string;
  targetZoneId: ZoneId;
  lastRunAt?: string;
  lastStatus?: 'success' | 'failed' | 'idle';
  lastSummary?: string;
  runCount: number;
}

export interface AutomationRunLog {
  id: string;
  jobId: string;
  title: string;
  status: 'success' | 'failed';
  executedAt: string;
  durationMs: number;
  summary: string;
  reportHeadline: string;
  keyFindings: string[];
  totalAmountFormatted?: string;
}

export interface ExternalOrderPayload {
  source: 'telegram' | 'zalo' | 'web_portal';
  externalId: string;
  senderName: string;
  senderContact?: string;
  rawMessage: string;
  materialType?: string;
  widthMeters?: number;
  heightMeters?: number;
  quantity?: number;
  finishingOption?: string;
  rushOrder?: boolean;
  requestedDiscountPercent?: number;
}

export interface ExternalOrderResult {
  success: boolean;
  orderId: string;
  assignedAgentName: string;
  assignedDepartment: string;
  totalAmountFormatted: string;
  requiresApproval: boolean;
  approvalCard?: ApprovalCard;
  botResponseMessage: string;
  processedAt: string;
}
