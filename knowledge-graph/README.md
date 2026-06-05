# Engineering Knowledge Graph MVP — Phase 4.6

`knowledge-graph` is a Knowledge Graph Specialist inside the Governed Capability Specialists layer. It supports AgenticFlow reasoning across engineering, drawing, manufacturing, inspection, cost and risk information.

## Node types

Project, Material, Section, Part, Drawing, Connection, Fabrication, Inspection, Supplier, Cost, Code and Risk.

## MVP example

```text
BP-01
→ Plate 400x400x20
→ S275
→ 25.12kg
→ Plasma Cut
→ 4-M20 Holes
→ Paint System C3
→ Inspection Plan
→ SAR 195
```

The graph exposes query and reasoning helpers so P-Agent can trace relationships before selecting a capability. Phase 4.7 can use this as the input layer for the future orchestration engine:

```text
User Request → PatchD Governance Organ → P-Agent Execution Organ → Workflow Orchestration Core → AI Gateway + Capability Registry → Knowledge Graph Specialist → Audit
```
