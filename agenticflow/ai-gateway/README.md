# AgenticFlow AI Gateway

The AI Gateway is provider-agnostic. Capabilities ask for model roles, not vendor or model names.

Capabilities do not call providers directly.
Capabilities request an AI role.
The AI Gateway selects the best available model based on role, cost, risk, privacy, and fallback policy.
Provider/model names are hidden from capability code.

## Gateway flow

```text
Capability Request
      ↓
AI Role
      ↓
Gateway Route Decision
      ↓
Best Available Model
      ↓
Response
      ↓
Audit / Evaluation Store
```

Core routing pattern:

```text
Capability → AI Role → Gateway → Best Available Model
```

## Roles

- `fast_low_cost_model`
- `policy_reasoning_model`
- `reasoning_model`
- `engineering_reasoning_model`
- `code_generation_model`
- `orchestration_model`
- `local_private_model`
- `fallback_model`

## Patch D role mapping

- Stability Engine → `fast_low_cost_model`
- Governance Policy → `policy_reasoning_model`
- Adaptive Policy → `reasoning_model`
- Meta-Governance → `orchestration_model`

The gateway can later map these roles to any approved provider, deployment, or private local model without changing capability code.

## Governed Capability Specialists

Specialists are governed capability specialists, not fixed AI model names. The gateway routes roles to the best available model while deterministic engineering, manufacturing, drawing, quotation, and knowledge graph packs remain capability specialists.

## Patch E fallback and sensitive-data routing

Patch E keeps provider routing governed through role policy instead of provider names:

- every model-role request can be recorded in an audit trail
- each role has a fallback rule before any provider/model fallback is attempted
- sensitive project data triggers the `local_private_model` route
- `local_private_model` does not automatically fall back to an external provider
- final outputs remain blocked for external use until the applicable approval gate is satisfied
