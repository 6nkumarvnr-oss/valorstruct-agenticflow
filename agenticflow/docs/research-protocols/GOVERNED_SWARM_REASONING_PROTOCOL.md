# Governed Swarm Reasoning Protocol — GSRP

Status: Research protocol draft for human review and approval.

## Objective

GSRP defines how AgenticFlow coordinates multiple governed agents without becoming an uncontrolled multi-agent chat system.

The protocol keeps the existing architecture intact:

```text
PatchD Governance → P-Agent Runtime → Workflow Orchestration → AI Gateway → Governed Capability Specialists
```

GSRP adds a controlled swarm layer above the existing runtime.

## Core roles

```text
Planner agent
Specialist agent
Critic agent
Verifier agent
Synthesizer agent
Governance judge
Human approver
```

## Execution flow

```text
1. Receive user request.
2. Run PatchD risk and policy scan.
3. P-Agent creates the execution plan.
4. Swarm coordinator selects registry-approved agents.
5. Specialists produce candidate outputs.
6. Critics inspect assumptions, errors, missing data, and risks.
7. Verifiers run deterministic checks and contract checks.
8. Synthesizer creates one consolidated package.
9. PatchD Governance Judge records decision.
10. Human approval is required for engineering, commercial, legal, deployment, or public-release risk.
11. Memory and audit records are updated.
```

## Non-negotiable governance rules

- No agent may execute outside its registry permission.
- No capability may run without a capability contract.
- Engineering, quotation, manufacturing, legal, deployment, IAM, and public-release outputs require human approval.
- AI Gateway routes by model role, not provider name.
- Deterministic engines must be preferred for calculations, validation, and repeatable checks.
- All swarm disagreements must be retained in the audit trail.

## MVP scope

```text
Agent Registry
Capability Contract Registry
One deterministic GSRP run function
Backend endpoint
Frontend review console
Research archive export
```

## Future scope

```text
Persistent swarm memory
Agent performance scoring
Cost/quota-aware model routing
Parallel specialist execution
Formal vote/ranking mechanism
Human approval workflow persistence
Company/workspace isolation
```

Software architecture draft prepared for human review and approval.
