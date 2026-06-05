# Drawing-to-BOQ Core

Phase 5.8 converts deterministic text-based drawing notes and Shop Drawing Assistant output into structured BOQ lines and quotation item seeds.

## Scope

- Text-based only: no OCR, DWG, DXF, IFC, Revit, Tekla, or CAD dependencies.
- Deterministic BP-01 demo extraction from notes such as:
  `BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.`
- Preliminary and review-required: generated quantities are demo takeoff seeds, not released construction quantities.

## Flow

```text
Drawing Notes
↓
Part Extraction
↓
Shop Drawing Summary
↓
BOQ Extraction
↓
Quotation Item Seeds
↓
Governed Engineering Package
```

## Deterministic BP-01 outputs

- S275 steel plate, 400x400x20: 25.12 kg
- Plasma cutting of base plate: 1 nos
- Drilling M20 holes: 4 nos
- 6mm fillet weld all around: 1.60 m
- Coating / painting allowance: 0.32 m2
- Dimensional and visual inspection: 1 lot

The weld length carries this warning: `Weld length is estimated from perimeter because detailed weld path is not available.`
