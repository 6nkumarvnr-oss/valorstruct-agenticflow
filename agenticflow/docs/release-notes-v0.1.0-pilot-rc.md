# AgenticFlow v0.1.0 Pilot RC — Release Notes

## Release objective

AgenticFlow v0.1.0 Pilot RC packages the current MVP as a deterministic, governed engineering AI platform demo suitable for investors, internal stakeholders, and pilot customers. The release demonstrates login, workspace context, multi-part drawing-note processing, BOQ extraction, manufacturing planning, quotation, approval authority, audit/model-role traceability, and export review.

## Completed capabilities

- MVP local auth and Valor Struct Demo Workspace context.
- Project Dashboard, Pilot Demo Checklist, Multi-Part Package Console, Engineering Package Console, and Package History Console.
- Deterministic drawing-note parsing for BP-01, BP-02, and BR-01 pilot parts.
- Drawing-to-BOQ extraction with combined project totals.
- Drawing-to-manufacturing package generation with combined labor and production totals.
- Deterministic quotation summary for the pilot package.
- Role-based approval authority requiring Senior Structural Engineer/Admin/Owner for Level 3 package release.
- Audit and model-role audit event surfaces.
- JSON, Markdown, and HTML export affordances with browser Print / Save as PDF workflow.
- Deployment hardening MVP: env templates, settings, CORS, logging, health/readiness/version endpoints.
- PostgreSQL migration path documentation and SQL-first schema while SQLite remains the default demo store.

## Demo workflow

1. Login as `senior.engineer@valorstruct.local` with `ValorDemo123!`.
2. Open Project Dashboard and confirm workspace/user context.
3. Open Pilot Demo Checklist.
4. Run the Canopy Base Plates Demo in the Multi-Part Package Console.
5. Verify expected totals: material `48.92 kg`, cutting `4 nos`, drilling `8 nos`, welding `3.20 m`, coating `1.10 m2`, labor `3.30 hr`, production `9.80 hr`, quotation `837.94 SAR`.
6. Review package history, audit/model-role events, and approval gate.
7. Approve as Senior Structural Engineer.
8. Export HTML and use browser Print / Save as PDF.

## Known limitations

- Deterministic demo data only; no customer data ingestion is included.
- Preliminary engineering checks only.
- No final code-compliant design or sealed engineering output.
- No CAD, DWG, DXF, OCR, IFC, Revit, Tekla, or full detailing automation.
- MVP local auth only; no external identity providers or production SSO.
- SQLite remains the default local database.
- PostgreSQL schema is prepared but no live migration runtime is required yet.
- No external model provider calls are required in the deterministic demo.
- App Factory, Agent Marketplace, Digital Marketing AI, and Business Consultant AI remain deferred.

## Review-required disclaimer

All outputs are preliminary and review-required. The pilot package is not for final engineering use, construction issue, fabrication release, or contractual approval without licensed professional review and normal QA/QC controls.

## Not-for-final-engineering-use warning

AgenticFlow v0.1.0 Pilot RC is a product demonstration release candidate. It must not be used as a final code-compliant engineering design system or as a substitute for qualified engineering judgment.

## Next planned phases

- Production-grade auth/session hardening.
- PostgreSQL-backed production persistence path.
- Richer package review UX and export packaging.
- Expanded deterministic part families after pilot validation.
- Deployment automation and operational monitoring.
