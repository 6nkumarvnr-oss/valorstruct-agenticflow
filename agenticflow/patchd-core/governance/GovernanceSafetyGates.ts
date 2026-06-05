import type { GatewayRequest, GatewayRouteDecision, ModelRole } from '../../ai-gateway/ModelRoleGateway.js';

export type GovernancePermissionLevel = 0 | 1 | 2 | 3 | 4;

export interface CapabilityExecutionPermission {
  level: GovernancePermissionLevel;
  label: string;
  allowedToExecute: boolean;
  allowedExternalUse: boolean;
  requiredApproval: string;
  description: string;
}

export interface WorkflowRiskClassification {
  workflowType: string;
  level: GovernancePermissionLevel;
  label: string;
  requiredApprover: string;
  rationale: string;
  blocked: boolean;
}

export interface HumanApprovalGate {
  gateId: string;
  required: boolean;
  requiredApprover: string;
  status: 'not-required' | 'pending-human-approval' | 'pending-licensed-expert-approval' | 'prohibited-without-authorization';
  reason: string;
}

export interface ModelRoleFallbackRule {
  role: ModelRole;
  fallbackRole: ModelRole;
  trigger: string;
  policy: string;
}

export interface SensitiveDataRoutingRule {
  containsSensitiveData: boolean;
  localPrivateModelRequired: boolean;
  trigger: string;
  routeRole: ModelRole;
  reason: string;
}

export interface ModelRoleAuditTrailEvent {
  order: number;
  capability: string;
  task: string;
  requestedRole: ModelRole;
  selectedModelRef: GatewayRouteDecision['selectedModelRef'];
  fallbackRole: ModelRole;
  sensitiveDataRouteRole: ModelRole;
  reason: string;
}

export interface FinalOutputApprovalStatus {
  status: 'draft-only' | 'internal-recommendation' | 'requires-human-approval' | 'requires-licensed-expert-approval' | 'prohibited-without-authorization';
  level: GovernancePermissionLevel;
  requiredApprover: string;
  externalUseAllowed: boolean;
  reason: string;
}

export const CAPABILITY_EXECUTION_PERMISSIONS: Record<GovernancePermissionLevel, CapabilityExecutionPermission> = {
  0: {
    level: 0,
    label: 'Draft only',
    allowedToExecute: true,
    allowedExternalUse: false,
    requiredApproval: 'Author review',
    description: 'May generate internal drafts only; no external reliance or release.',
  },
  1: {
    level: 1,
    label: 'Internal recommendation',
    allowedToExecute: true,
    allowedExternalUse: false,
    requiredApproval: 'Internal review',
    description: 'May run automatically for internal recommendations and triage.',
  },
  2: {
    level: 2,
    label: 'Human approval required before external use',
    allowedToExecute: true,
    allowedExternalUse: false,
    requiredApproval: 'Named human approver',
    description: 'May run automatically, but external use requires human approval.',
  },
  3: {
    level: 3,
    label: 'Licensed expert approval required',
    allowedToExecute: true,
    allowedExternalUse: false,
    requiredApproval: 'Licensed expert approval',
    description: 'May run as a preliminary workflow, but release requires licensed expert approval.',
  },
  4: {
    level: 4,
    label: 'Prohibited without explicit authorization',
    allowedToExecute: false,
    allowedExternalUse: false,
    requiredApproval: 'Explicit governance authorization',
    description: 'Must not execute or release unless explicitly authorized by governance.',
  },
};

export const MODEL_ROLE_FALLBACK_RULES: Record<ModelRole, ModelRoleFallbackRule> = {
  fast_low_cost_model: {
    role: 'fast_low_cost_model',
    fallbackRole: 'fallback_model',
    trigger: 'Primary lightweight classifier unavailable or confidence below threshold.',
    policy: 'Retry through fallback_model and mark the audit event for governance review.',
  },
  policy_reasoning_model: {
    role: 'policy_reasoning_model',
    fallbackRole: 'orchestration_model',
    trigger: 'Policy reasoner unavailable for governance decision support.',
    policy: 'Route to orchestration_model and require human review for externally visible outcomes.',
  },
  reasoning_model: {
    role: 'reasoning_model',
    fallbackRole: 'fallback_model',
    trigger: 'Planning or adaptive reasoning model unavailable.',
    policy: 'Use fallback_model for draft outputs only and keep approval gates closed.',
  },
  engineering_reasoning_model: {
    role: 'engineering_reasoning_model',
    fallbackRole: 'local_private_model',
    trigger: 'Engineering explanation requires sensitive project context or provider route is unavailable.',
    policy: 'Route through local_private_model and require licensed expert approval.',
  },
  code_generation_model: {
    role: 'code_generation_model',
    fallbackRole: 'fallback_model',
    trigger: 'Code generation route unavailable.',
    policy: 'Use fallback_model for scaffold drafts only; no production deployment without review.',
  },
  orchestration_model: {
    role: 'orchestration_model',
    fallbackRole: 'fallback_model',
    trigger: 'Multi-step workflow reasoning route unavailable.',
    policy: 'Continue deterministic plan where possible and flag orchestration review.',
  },
  local_private_model: {
    role: 'local_private_model',
    fallbackRole: 'local_private_model',
    trigger: 'Sensitive or private enterprise workload detected.',
    policy: 'Keep data on private route; do not fall back to external providers automatically.',
  },
  fallback_model: {
    role: 'fallback_model',
    fallbackRole: 'fallback_model',
    trigger: 'Provider/model failure or backup route requested.',
    policy: 'Return draft-only output and require governance review before release.',
  },
};

const workflowRiskRules: Record<string, Omit<WorkflowRiskClassification, 'workflowType'>> = {
  'structural-design-report': {
    level: 3,
    label: CAPABILITY_EXECUTION_PERMISSIONS[3].label,
    requiredApprover: 'Senior Structural Engineer approval',
    rationale: 'Structural design reports can affect life-safety and code compliance.',
    blocked: false,
  },
  'quotation-draft': {
    level: 2,
    label: CAPABILITY_EXECUTION_PERMISSIONS[2].label,
    requiredApprover: 'Commercial approval',
    rationale: 'Quotation packages can create commercial commitments before external issue.',
    blocked: false,
  },
  'crm-lead-summary': {
    level: 1,
    label: CAPABILITY_EXECUTION_PERMISSIONS[1].label,
    requiredApprover: 'Internal review',
    rationale: 'CRM summaries are internal recommendations.',
    blocked: false,
  },
  'public-marketing-content': {
    level: 2,
    label: CAPABILITY_EXECUTION_PERMISSIONS[2].label,
    requiredApprover: 'Brand approval',
    rationale: 'Public content requires review before publication.',
    blocked: false,
  },
  'explicitly-prohibited-release': {
    level: 4,
    label: CAPABILITY_EXECUTION_PERMISSIONS[4].label,
    requiredApprover: 'Explicit governance authorization',
    rationale: 'The request asks for external release without required authorization.',
    blocked: true,
  },
};

export function classifyWorkflowRisk(workflowType: string): WorkflowRiskClassification {
  const rule = workflowRiskRules[workflowType] ?? workflowRiskRules['structural-design-report'];
  return {
    workflowType,
    ...rule,
  };
}

export function evaluateHumanApprovalGate(risk: WorkflowRiskClassification): HumanApprovalGate {
  const permission = CAPABILITY_EXECUTION_PERMISSIONS[risk.level];
  const status: HumanApprovalGate['status'] = risk.level === 4
    ? 'prohibited-without-authorization'
    : risk.level === 3
      ? 'pending-licensed-expert-approval'
      : risk.level >= 2
        ? 'pending-human-approval'
        : 'not-required';

  return {
    gateId: `gate-level-${risk.level}`,
    required: risk.level >= 2,
    requiredApprover: risk.requiredApprover,
    status,
    reason: `${permission.label}: ${risk.rationale}`,
  };
}

export function evaluateSensitiveDataRouting(payload: Record<string, unknown> = {}): SensitiveDataRoutingRule {
  const sensitiveKeys = ['clientName', 'confidential', 'privateProjectData', 'personalData', 'licensedDesignData'];
  const matchedKey = sensitiveKeys.find((key) => Boolean(payload[key]));
  const containsSensitiveData = Boolean(matchedKey);
  return {
    containsSensitiveData,
    localPrivateModelRequired: containsSensitiveData,
    trigger: matchedKey ?? 'none',
    routeRole: containsSensitiveData ? 'local_private_model' : 'fallback_model',
    reason: containsSensitiveData
      ? `Sensitive-data routing trigger matched ${matchedKey}; route through local_private_model.`
      : 'No sensitive-data trigger detected; default provider-agnostic role routing may proceed.',
  };
}

export function createModelRoleAuditTrailEvent(
  order: number,
  request: GatewayRequest,
  route: GatewayRouteDecision,
  payload: Record<string, unknown> = {},
): ModelRoleAuditTrailEvent {
  const fallback = MODEL_ROLE_FALLBACK_RULES[request.role];
  const sensitiveRouting = evaluateSensitiveDataRouting(payload);
  return {
    order,
    capability: request.capability,
    task: request.task,
    requestedRole: request.role,
    selectedModelRef: route.selectedModelRef,
    fallbackRole: fallback.fallbackRole,
    sensitiveDataRouteRole: sensitiveRouting.routeRole,
    reason: `${route.reason} Fallback policy: ${fallback.policy} Sensitive routing: ${sensitiveRouting.reason}`,
  };
}

export function evaluateFinalOutputApproval(risk: WorkflowRiskClassification): FinalOutputApprovalStatus {
  const permission = CAPABILITY_EXECUTION_PERMISSIONS[risk.level];
  const status: FinalOutputApprovalStatus['status'] = risk.level === 4
    ? 'prohibited-without-authorization'
    : risk.level === 3
      ? 'requires-licensed-expert-approval'
      : risk.level === 2
        ? 'requires-human-approval'
        : risk.level === 1
          ? 'internal-recommendation'
          : 'draft-only';

  return {
    status,
    level: risk.level,
    requiredApprover: risk.requiredApprover,
    externalUseAllowed: permission.allowedExternalUse,
    reason: `${permission.label}: ${risk.rationale}`,
  };
}
