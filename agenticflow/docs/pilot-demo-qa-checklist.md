# Pilot Demo QA Checklist — AgenticFlow v0.1.0 Pilot RC

Use this checklist before showing the Canopy Base Plates Demo to investors, internal stakeholders, or pilot customers.

## Environment setup

- [ ] Install dependencies with `npm install`.
- [ ] Copy `.env.example` to `.env` for backend configuration.
- [ ] Copy `agenticflow/frontend/.env.example` to `agenticflow/frontend/.env` for frontend configuration.
- [ ] Run backend with `uvicorn agenticflow.backend.main:app --reload` when FastAPI/Uvicorn are installed.
- [ ] Run frontend with `npm run dev` from `agenticflow/frontend` when frontend dependencies are installed.
- [ ] Check `/health`, `/ready`, and `/version`.

## Guided demo flow

- [ ] Login as Senior Structural Engineer (`senior.engineer@valorstruct.local` / `ValorDemo123!`).
- [ ] Open Project Dashboard.
- [ ] Confirm current user/workspace panel is visible.
- [ ] Open Pilot Demo Checklist.
- [ ] Open Multi-Part Package Console.
- [ ] Confirm Canopy Base Plates Demo label is visible.
- [ ] Run the multi-part package workflow.

## Expected totals verification

- [ ] Verify material `48.92 kg`.
- [ ] Verify cutting `4 nos`.
- [ ] Verify drilling `8 nos`.
- [ ] Verify welding `3.20 m`.
- [ ] Verify coating `1.10 m2`.
- [ ] Verify labor `3.30 hr`.
- [ ] Verify production `9.80 hr`.
- [ ] Verify quotation `837.94 SAR`.

## Approval, history, and export verification

- [ ] Verify approval required / `requires-review` status is displayed.
- [ ] Approve package as Senior Structural Engineer.
- [ ] Review Package History Console.
- [ ] Check audit events.
- [ ] Check model-role audit events.
- [ ] Export HTML.
- [ ] Print / Save as PDF from browser.
- [ ] Verify limitations displayed.
- [ ] Verify review-required disclaimer is visible.

## Release-candidate signoff

- [ ] Confirm this is clearly marked as preliminary and review-required.
- [ ] Confirm no CAD/DWG/DXF/OCR claims are made.
- [ ] Confirm no production auth or external provider claims are made.
