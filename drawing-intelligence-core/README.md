# Drawing Intelligence Core — Phase 4.5 MVP

`drawing-intelligence-core` converts text-based drawing notes into structured part objects.

Supported MVP parsers:

- `DimensionParser`
- `ShapeParser`
- `SectionParser`
- `HoleParser`
- `WeldParser`
- `PartExtractor`
- `DrawingMetadata`

Supported part families are Plate, SHS, RHS, CHS, Angle, Channel and I-Beam.

The current output is intentionally deterministic and text-based. It creates handoff seeds for the next layers:

```text
Drawing Core
↓
Manufacturing Core
↓
Steel Design Pack
↓
Quotation Pack
```

This is not OCR, CAD geometry extraction, Tekla/Revit parsing or shop drawing automation yet. It is the first clean parsing core for notes such as `Base Plate 400 x 400 x 20, 4-M20 Holes, S275 Steel`.
