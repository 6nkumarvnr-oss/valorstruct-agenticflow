# Pilot Customer Demo Walkthrough — Canopy Base Plates Demo

## Demo objective

Show AgenticFlow as a governed engineering AI platform that can move from login to a reviewed, approval-ready, exported multi-part engineering package using deterministic drawing-note inputs.

The pilot demo is deterministic and text-based. It does not use OCR, DWG/DXF parsing, CAD automation, or external identity providers.

## Demo login credentials

Use the MVP local auth flow:

- Email: `senior.engineer@valorstruct.local`
- Password: `ValorDemo123!`
- Role: Senior Structural Engineer
- Workspace: Valor Struct Demo Workspace

## Demo project name

`Canopy Base Plates Demo`

## Demo parts

1. `BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.`
2. `BP-02 Plate 300x300x16 S275 with 4-M16 holes and 6mm fillet weld all around.`
3. `BR-01 RHS80x40x2.8 S275 length 2.5m.`

## Step-by-step demo script

1. Open the Login page and sign in as `senior.engineer@valorstruct.local`.
2. Confirm the current user panel shows the Senior Structural Engineer role and Valor Struct Demo Workspace.
3. Open the Project Dashboard and point out the governed project/package/audit/export summary.
4. Open the Pilot Demo Checklist to frame the customer walkthrough.
5. Open the Multi-Part Package Console.
6. Confirm Demo Mode is enabled and the Canopy Base Plates Demo label is visible.
7. Run the deterministic project package using the three prefilled drawing-note parts.
8. Review the parsed project parts table.
9. Review per-part BOQ lines and combined BOQ totals.
10. Review per-part manufacturing schedules and combined labor/production totals.
11. Review the combined quotation summary.
12. Open Package History and approve the package as the Senior Structural Engineer.
13. Review audit/model-role audit trails and export metadata.
14. Use the HTML export and browser Print / Save as PDF for a customer-facing review packet.

## Expected outputs

- Material: `48.92 kg`
- Cutting: `4 nos`
- Drilling: `8 nos`
- Welding: `3.20 m`
- Coating: `1.10 m2`
- Labor: `3.30 hr`
- Production: `9.80 hr`
- Quotation: `837.94 SAR`

## Approval behavior

The generated project-level package starts as `requires-review`. Level 3 engineering approval is allowed for Senior Structural Engineer, Admin, or Owner roles. Engineer, Reviewer, Viewer, and Agent users cannot approve a Level 3 package in the governed approval flow.

## Export behavior

The demo package can be reviewed as JSON, Markdown, and print-ready HTML. For the MVP browser workflow, open the HTML export and use browser Print / Save as PDF.

## Limitations and review-required disclaimer

This pilot demo is preliminary and review-required. It is deterministic, text-based, and intended for product demonstration only. It does not replace licensed engineering review, code-compliant final design, production detailing, formal QA/QC, or customer contractual approval. No OCR, CAD, DWG/DXF, IFC, Revit, Tekla, or external auth provider integration is included in this phase.
