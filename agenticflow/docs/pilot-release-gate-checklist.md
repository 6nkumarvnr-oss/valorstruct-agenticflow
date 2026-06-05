# Pilot Release Gate Checklist — AgenticFlow v0.1.0 Pilot RC

Use this final gate before presenting AgenticFlow v0.1.0 Pilot RC to investors, internal stakeholders, or pilot customers. Every item should be checked against the current branch and demo environment before the session starts.

## Automated verification

- [ ] All tests pass via the documented release commands: `npm run test:ts`, `npm test`, `npm run vertical-slice`, targeted Python regression suites, `python -m compileall agenticflow/backend tests`, and `git diff --check`.
- [ ] Deterministic demo totals are verified: material `48.92 kg`, cutting `4 nos`, drilling `8 nos`, welding `3.20 m`, coating `1.10 m2`, labor `3.30 hr`, production `9.80 hr`, quotation `837.94 SAR`.

## Demo workflow gate

- [ ] Login demo verified with the Senior Structural Engineer demo account.
- [ ] Project Dashboard opens with the correct current user/workspace context.
- [ ] Pilot Demo Checklist opens from the dashboard.
- [ ] Multi-Part Package Console runs the Canopy Base Plates Demo without changing deterministic BP-01/BP-02/BR-01 behavior.
- [ ] Approval workflow verified: package requires review and can be approved by Senior Structural Engineer/Admin/Owner authority.
- [ ] Export workflow verified for JSON/Markdown/HTML affordances and browser Print / Save as PDF.

## Deployment and readiness gate

- [ ] Deployment env templates are present: `.env.example` and `agenticflow/frontend/.env.example`.
- [ ] Health, readiness, and version endpoints verified: `/health`, `/ready`, and `/version`.
- [ ] `/version` reports `0.1.0-pilot-rc` and the five-layer governed AI organism architecture.

## Scope and disclaimer gate

- [ ] Known limitations are documented in `agenticflow/docs/known-limitations-v0.1.0.md`.
- [ ] Not-for-final-engineering-use warning is visible in release/demo materials.
- [ ] Preliminary and review-required warnings remain visible in the demo flow.
- [ ] No CAD/OCR/App Factory scope has been added or implied.
- [ ] No external auth provider, live PostgreSQL requirement, or external model-provider dependency is required for the pilot demo.

## Release decision

- [ ] Release candidate ready for pilot presentation.
