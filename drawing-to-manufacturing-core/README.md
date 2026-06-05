# Drawing-to-Manufacturing Core

Phase 5.9 turns deterministic drawing intelligence and Drawing-to-BOQ outputs into a preliminary fabrication package.

This core is text-based only. It does not add OCR, DWG/DXF parsing, IFC/Revit/Tekla integration, CAD libraries, or full CAD automation.

## BP-01 deterministic output

For `BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.` it emits:

- Cutting list: S275 plate, 400x400x20, qty 1, plasma, 0.25 hr
- Drilling schedule: 4-M20 holes, drill press, 0.30 hr
- Weld schedule: 6mm fillet weld, 1.60 m, GMAW, 0.45 hr
- Coating schedule: Paint System C3, 0.32 m2, 0.20 hr
- Inspection plan with dimensional, hole, weld, and coating checks
- Production route from material receiving through packing / release
- Total estimated labor: 1.40 hr
- Total estimated production time: 4.20 hr

Outputs are preliminary and review-required before external fabrication release.
