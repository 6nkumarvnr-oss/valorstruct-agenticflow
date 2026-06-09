export type AgentRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AgentType = 'planner' | 'specialist' | 'critic' | 'verifier' | 'synthesizer' | 'governance_judge' | 'human_approver';
export type HumanApprovalRequirement = 'not_required' | 'recommended' | 'required';

export interface AgentRegistryEntry {
  agentId: string;
  agentName: string;
  agentType: AgentType;
  ownerDomain: string;
  allowedInputs: string[];
  allowedOutputs: string[];
  capabilityPackIds: string[];
  riskLevel: AgentRiskLevel;
  approvalRequired: HumanApprovalRequirement;
  modelRole: string;
  toolsAllowed: string[];
  dataAccessScope: string;
  auditLevel: 'standard' | 'strict';
  fallbackAgentId?: string;
}

export interface CapabilityContract {
  capabilityId: string;
  name: string;
  ownerDomain: string;
  inputs: string[];
  outputs: string[];
  preconditions: string[];
  postconditions: string[];
  riskFlags: string[];
  auditEvents: string[];
  humanApproval: HumanApprovalRequirement;
  rollbackMethod: string;
}

export interface SwarmCandidateOutput {
  agentId: string;
  title: string;
  summary: string;
  confidenceScore: number;
  riskScore: number;
  assumptions: string[];
  evidence: string[];
}

export interface SwarmCritique {
  criticAgentId: string;
  targetAgentId: string;
  findings: string[];
  riskScore: number;
  recommendation: 'accept' | 'revise' | 'reject';
}

export interface SwarmVerification {
  verifierAgentId: string;
  checksPassed: string[];
  checksFailed: string[];
  deterministicChecksApplied: string[];
  status: 'passed' | 'requires_human_review' | 'failed';
}

export interface GovernedSwarmRun {
  runId: string;
  request: string;
  riskLevel: AgentRiskLevel;
  humanApprovalRequired: boolean;
  selectedAgents: AgentRegistryEntry[];
  capabilityContracts: CapabilityContract[];
  candidateOutputs: SwarmCandidateOutput[];
  critiques: SwarmCritique[];
  verification: SwarmVerification;
  selectedPlan: string[];
  rejectedAlternatives: string[];
  disagreementLog: string[];
  governanceDecision: 'approved_for_draft' | 'requires_human_approval' | 'blocked';
  finalOutputPackage: {
    title: string;
    summary: string;
    nextActions: string[];
    approvalPacket: string[];
  };
  auditEvents: string[];
}

export const AGENT_REGISTRY: AgentRegistryEntry[] = [
  {
    agentId: 'planner.agenticflow.v1',
    agentName: 'P-Agent Planner',
    agentType: 'planner',
    ownerDomain: 'agenticflow-core',
    allowedInputs: ['user_goal', 'project_context', 'risk_policy'],
    allowedOutputs: ['execution_plan', 'capability_chain', 'approval_requirements'],
    capabilityPackIds: ['workflow-orchestration-core'],
    riskLevel: 'medium',
    approvalRequired: 'recommended',
    modelRole: 'reasoning_model',
    toolsAllowed: ['capability_registry', 'policy_reader'],
    dataAccessScope: 'project_metadata_only',
    auditLevel: 'strict',
  },
  {
    agentId: 'quotation.specialist.v1',
    agentName: 'Valor Quotation Specialist',
    agentType: 'specialist',
    ownerDomain: 'commercial',
    allowedInputs: ['boq_lines', 'rate_card', 'scope_description'],
    allowedOutputs: ['quotation_summary', 'rate_calculation', 'commercial_assumptions'],
    capabilityPackIds: ['valor-quotation-pack', 'drawing_to_boq_extractor'],
    riskLevel: 'medium',
    approvalRequired: 'required',
    modelRole: 'engineering_reasoning_model',
    toolsAllowed: ['quotation_calculator', 'boq_generator'],
    dataAccessScope: 'commercial_project_data',
    auditLevel: 'strict',
  },
  {
    agentId: 'engineering.critic.v1',
    agentName: 'Engineering Critic',
    agentType: 'critic',
    ownerDomain: 'engineering',
    allowedInputs: ['engineering_summary', 'drawing_notes', 'manufacturing_plan'],
    allowedOutputs: ['technical_findings', 'missing_information', 'risk_flags'],
    capabilityPackIds: ['engineering-capability-pack', 'steel-design-pack'],
    riskLevel: 'high',
    approvalRequired: 'required',
    modelRole: 'engineering_reasoning_model',
    toolsAllowed: ['engineering_checklist', 'code_validation_workflow'],
    dataAccessScope: 'engineering_project_data',
    auditLevel: 'strict',
  },
  {
    agentId: 'governance.judge.v1',
    agentName: 'PatchD Governance Judge',
    agentType: 'governance_judge',
    ownerDomain: 'governance',
    allowedInputs: ['candidate_outputs', 'critiques', 'verification_results', 'risk_policy'],
    allowedOutputs: ['governance_decision', 'approval_packet', 'audit_events'],
    capabilityPackIds: ['patchd-core'],
    riskLevel: 'critical',
    approvalRequired: 'required',
    modelRole: 'policy_reasoning_model',
    toolsAllowed: ['governance_policy_engine', 'audit_log'],
    dataAccessScope: 'governance_metadata_and_summaries',
    auditLevel: 'strict',
  },
];

export const CAPABILITY_CONTRACTS: CapabilityContract[] = [
  {
    capabilityId: 'workflow-orchestration-core',
    name: 'Workflow Orchestration Core',
    ownerDomain: 'agenticflow-core',
    inputs: ['user_request', 'optional_project_context'],
    outputs: ['intent', 'capability_chain', 'workflow_plan', 'audit_summary'],
    preconditions: ['request_must_be_non_empty'],
    postconditions: ['plan_contains_at_least_one_step', 'audit_events_created'],
    riskFlags: ['ambiguous_scope', 'missing_domain_data'],
    auditEvents: ['INTENT_CLASSIFIED', 'CAPABILITY_CHAIN_SELECTED', 'PLAN_BUILT'],
    humanApproval: 'recommended',
    rollbackMethod: 'discard_draft_plan_and_restore_previous_approved_package',
  },
  {
    capabilityId: 'valor-quotation-pack',
    name: 'Valor Quotation Pack',
    ownerDomain: 'commercial',
    inputs: ['scope_description', 'boq_lines', 'rate_card'],
    outputs: ['boq', 'rate_calculation', 'quotation_report'],
    preconditions: ['quantities_reviewed', 'rate_card_available'],
    postconditions: ['quote_totals_calculated', 'commercial_assumptions_listed'],
    riskFlags: ['pricing_error', 'missing_scope_item', 'currency_or_tax_mismatch'],
    auditEvents: ['BOQ_GENERATED', 'RATE_CALCULATED', 'QUOTATION_REPORT_GENERATED'],
    humanApproval: 'required',
    rollbackMethod: 'mark_package_revision_superseded_and_keep_previous_approved_revision',
  },
  {
    capabilityId: 'engineering-capability-pack',
    name: 'Engineering Capability Pack',
    ownerDomain: 'engineering',
    inputs: ['member_data', 'loads', 'design_code_profile'],
    outputs: ['engineering_check_summary', 'utilization', 'warnings'],
    preconditions: ['design_inputs_declared', 'code_profile_selected'],
    postconditions: ['warnings_must_be_visible', 'human_engineer_review_required'],
    riskFlags: ['life_safety', 'missing_load_case', 'unverified_design_assumption'],
    auditEvents: ['ENGINEERING_INPUTS_READ', 'CHECKS_RUN', 'WARNINGS_RECORDED'],
    humanApproval: 'required',
    rollbackMethod: 'block_release_until_engineer_approval',
  },
];

function classifySwarmRisk(request: string): AgentRiskLevel {
  const normalized = request.toLowerCase();
  if (['approve', 'release', 'construction', 'final', 'stamp', 'legal', 'safety'].some((word) => normalized.includes(word))) return 'critical';
  if (['engineering', 'quotation', 'manufacturing', 'boq', 'drawing'].some((word) => normalized.includes(word))) return 'high';
  if (['plan', 'draft', 'review'].some((word) => normalized.includes(word))) return 'medium';
  return 'low';
}

function selectAgentsForRequest(request: string): AgentRegistryEntry[] {
  const normalized = request.toLowerCase();
  const selected = [AGENT_REGISTRY[0], AGENT_REGISTRY[3]];
  if (['quotation', 'boq', 'commercial', 'price'].some((word) => normalized.includes(word))) selected.splice(1, 0, AGENT_REGISTRY[1]);
  if (['engineering', 'drawing', 'manufacturing', 'steel', 'safety'].some((word) => normalized.includes(word))) selected.splice(1, 0, AGENT_REGISTRY[2]);
  return Array.from(new Map(selected.map((agent) => [agent.agentId, agent])).values());
}

function selectedContractsForAgents(agents: AgentRegistryEntry[]): CapabilityContract[] {
  const capabilityIds = new Set(agents.flatMap((agent) => agent.capabilityPackIds));
  return CAPABILITY_CONTRACTS.filter((contract) => capabilityIds.has(contract.capabilityId));
}

export function runGovernedSwarmReasoning(request: string): GovernedSwarmRun {
  const cleanedRequest = request.trim() || 'Prepare governed engineering quotation package for BP-01';
  const riskLevel = classifySwarmRisk(cleanedRequest);
  const selectedAgents = selectAgentsForRequest(cleanedRequest);
  const capabilityContracts = selectedContractsForAgents(selectedAgents);
  const humanApprovalRequired = ['high', 'critical'].includes(riskLevel) || selectedAgents.some((agent) => agent.approvalRequired === 'required');

  const candidateOutputs: SwarmCandidateOutput[] = selectedAgents
    .filter((agent) => ['planner', 'specialist'].includes(agent.agentType))
    .map((agent, index) => ({
      agentId: agent.agentId,
      title: `${agent.agentName} candidate ${index + 1}`,
      summary: `${agent.agentName} proposes a governed package flow using ${agent.capabilityPackIds.join(', ')}.`,
      confidenceScore: agent.agentType === 'planner' ? 0.82 : 0.78,
      riskScore: riskLevel === 'critical' ? 0.86 : riskLevel === 'high' ? 0.72 : 0.42,
      assumptions: ['Inputs are draft-stage only.', 'Human review remains mandatory before release.'],
      evidence: agent.capabilityPackIds,
    }));

  const critiques: SwarmCritique[] = selectedAgents
    .filter((agent) => agent.agentType === 'critic')
    .flatMap((critic) => candidateOutputs.map((candidate) => ({
      criticAgentId: critic.agentId,
      targetAgentId: candidate.agentId,
      findings: ['Confirm source drawing revision.', 'Confirm rate card and engineering assumptions before approval.'],
      riskScore: Math.max(candidate.riskScore, 0.75),
      recommendation: 'revise' as const,
    })));

  const verification: SwarmVerification = {
    verifierAgentId: 'governance.judge.v1',
    checksPassed: ['agent_registry_entries_selected', 'capability_contracts_attached', 'audit_events_prepared'],
    checksFailed: humanApprovalRequired ? ['human_approval_not_yet_recorded'] : [],
    deterministicChecksApplied: ['risk_classification', 'approval_requirement_check', 'capability_contract_presence'],
    status: humanApprovalRequired ? 'requires_human_review' : 'passed',
  };

  const selectedPlan = [
    'Run PatchD governance scan.',
    'Create P-Agent execution plan.',
    'Route work through selected governed specialists.',
    'Run critic and verification pass.',
    'Prepare consolidated approval package.',
    'Require human approval before release when engineering/commercial risk is high.',
  ];

  return {
    runId: `gsrp-${cleanedRequest.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 42) || 'default'}`,
    request: cleanedRequest,
    riskLevel,
    humanApprovalRequired,
    selectedAgents,
    capabilityContracts,
    candidateOutputs,
    critiques,
    verification,
    selectedPlan,
    rejectedAlternatives: ['Direct single-agent answer without audit.', 'Provider-specific model routing inside capability code.'],
    disagreementLog: critiques.length ? ['Engineering critic requires revision before final approval.'] : [],
    governanceDecision: humanApprovalRequired ? 'requires_human_approval' : 'approved_for_draft',
    finalOutputPackage: {
      title: 'Governed Swarm Reasoning Package',
      summary: 'Draft package created through registry-controlled agents, capability contracts, critique, verification, and PatchD governance.',
      nextActions: ['Confirm source inputs.', 'Attach project documents.', 'Record human approval decision.', 'Store audit package.'],
      approvalPacket: ['risk classification', 'selected agents', 'capability contracts', 'candidate outputs', 'critic findings', 'verification results'],
    },
    auditEvents: ['GSRP_REQUEST_RECEIVED', 'GSRP_RISK_CLASSIFIED', 'GSRP_AGENTS_SELECTED', 'GSRP_CANDIDATES_CREATED', 'GSRP_CRITIQUE_COMPLETE', 'GSRP_VERIFICATION_COMPLETE', 'GSRP_GOVERNANCE_DECISION_RECORDED'],
  };
}
