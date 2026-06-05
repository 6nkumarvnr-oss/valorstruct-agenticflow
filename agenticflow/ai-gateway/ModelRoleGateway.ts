export type ModelRole =
  | 'fast_low_cost_model'
  | 'policy_reasoning_model'
  | 'reasoning_model'
  | 'engineering_reasoning_model'
  | 'code_generation_model'
  | 'orchestration_model'
  | 'local_private_model'
  | 'fallback_model';

export type GatewayTask =
  | 'classify_stability'
  | 'decide_governance_policy'
  | 'adapt_policy'
  | 'coordinate_meta_governance'
  | 'reason_about_engineering'
  | 'generate_code'
  | 'orchestrate_workflow'
  | 'handle_private_data'
  | 'fallback_completion';

export interface GatewayRequest {
  capability: string;
  task: GatewayTask;
  role: ModelRole;
  payload?: Record<string, unknown>;
}

export interface GatewayRouteDecision {
  capability: string;
  role: ModelRole;
  task: GatewayTask;
  providerAgnostic: true;
  selectionStage: 'Capability → AI Role → Gateway → Best Available Model';
  selectedModelRef: 'best_available_model';
  reason: string;
}

const taskRoleMap: Record<GatewayTask, ModelRole> = {
  classify_stability: 'fast_low_cost_model',
  decide_governance_policy: 'policy_reasoning_model',
  adapt_policy: 'reasoning_model',
  coordinate_meta_governance: 'orchestration_model',
  reason_about_engineering: 'engineering_reasoning_model',
  generate_code: 'code_generation_model',
  orchestrate_workflow: 'orchestration_model',
  handle_private_data: 'local_private_model',
  fallback_completion: 'fallback_model',
};

export const patchDGatewayRoleMap = {
  stabilityEngine: taskRoleMap.classify_stability,
  governancePolicy: taskRoleMap.decide_governance_policy,
  adaptivePolicy: taskRoleMap.adapt_policy,
  metaGovernance: taskRoleMap.coordinate_meta_governance,
} as const;

export function selectModelRole(task: GatewayTask): ModelRole {
  return taskRoleMap[task];
}

export function createGatewayRequest(capability: string, task: GatewayTask, payload?: Record<string, unknown>): GatewayRequest {
  return {
    capability,
    task,
    role: selectModelRole(task),
    payload,
  };
}

export function routeGatewayRequest(request: GatewayRequest): GatewayRouteDecision {
  return {
    capability: request.capability,
    role: request.role,
    task: request.task,
    providerAgnostic: true,
    selectionStage: 'Capability → AI Role → Gateway → Best Available Model',
    selectedModelRef: 'best_available_model',
    reason: `${request.capability} requests ${request.role} for ${request.task}; AI Gateway selects the best available model without exposing provider choice to capability code.`,
  };
}
