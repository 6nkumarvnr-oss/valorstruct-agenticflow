# Engineering Knowledge Core — Phase 4

The Engineering Knowledge Core is the first focused knowledge layer for Valor Struct / AgenticFlow. It keeps engineering codes, material catalogs, section catalogs, lightweight calculators, and governed validators in one small typed package.

## Structure

```text
engineering-core/
├── codes/        SBC, AISC, Eurocode references
├── materials/    steel, bolts, anchors, grout catalogs
├── sections/     SHS, RHS, IPE, HEA, W starter section tables
├── calculators/  member-weight, plate-weight, bolt-group, anchor-load
└── validators/   code-check, design-check
```

This is not full structural design software yet. It is a reusable knowledge foundation for later governed engineering capability packs.
