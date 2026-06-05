# Manufacturing Core — Phase 4.4

`manufacturing-core` is the first lightweight fabrication intelligence layer for AgenticFlow.
It models material lookup, base-plate dimensions, cutting, drilling, welding, coating, inspection, routing and cost estimation.

The current MVP is intentionally deterministic and preliminary. It supports the future fabrication-shop workflow:

```text
Base Plate 400 x 400 x 20, 4-M20 holes, S275 steel
→ material S275
→ weight 25.12 kg
→ Plasma Cut, Drill 4 Holes, Edge Grind, Fit-Up, Weld, Paint
→ Dimension/Hole/Weld/DFT checks
→ 1.4 labor hours, SAR 195, 4.2 production hours
```

This is not a final production planning, ERP, welding procedure, coating specification, or code-compliant fabrication release system yet. It is the reusable manufacturing core that later capability packs can govern with Patch D and execute through P-Agent.
