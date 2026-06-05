# Workflow Orchestration Core — Phase 4.7 MVP

This package is not a visual no-code builder. It is the deterministic multi-step coordination layer in the five-layer governed AI organism.

Valor Struct is a governed engineering AI organism that uses PatchD governance, P-Agent execution, an AI Gateway, and domain capability packs to generate audited engineering, manufacturing, quotation, drawing, and application outputs.

MVP flow:

```text
User Request
↓
PatchD Governance Organ
↓
P-Agent Execution Organ
↓
Workflow Orchestration Core
↓
Graph query
↓
Capability selection
↓
Execution plan
↓
Run capabilities
↓
Return governed package
```

Example request:

```text
Prepare fabrication and quotation package for BP-01
```

Expected capability chain:

1. Query Knowledge Graph for BP-01
2. Run Manufacturing Core estimate
3. Run Steel Design Pack preliminary check
4. Run Quotation Pack
5. Generate consolidated markdown report
6. Store result in P-Agent memory
7. Return audit summary

Phase 4.7 stays within the corrected path: User Request → PatchD Governance Organ → P-Agent Execution Organ → Workflow Orchestration Core → AI Gateway + Capability Registry → Governed Capability Specialists → Audit.

## Patch E governance-controlled execution

Workflow orchestration now carries Patch E governance controls with the generated package:

- capability execution permission level
- workflow risk classification
- human approval gate
- model-role request audit trail
- fallback rule reference per requested AI Gateway role
- sensitive-data routing decision
- local/private model routing trigger
- final-output approval status

For the BP-01 structural package, the workflow is classified as **Level 3 — Licensed expert approval required**, with Senior Structural Engineer approval required before external use.
