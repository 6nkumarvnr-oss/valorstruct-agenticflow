# Known Limitations — AgenticFlow v0.1.0 Pilot RC

AgenticFlow v0.1.0 Pilot RC is a deterministic pilot demo release candidate. The following limitations must be communicated clearly before stakeholder or pilot customer demos.

## Engineering limitations

- Deterministic demo data only.
- Preliminary engineering checks only.
- No final code-compliant design.
- No sealed calculations, construction issue, or fabrication release output.
- Review-required warnings must remain visible.

## Drawing and CAD limitations

- No CAD/DWG/DXF/OCR support.
- No IFC, Revit, Tekla, or full CAD automation.
- Drawing intelligence is text-based and deterministic for the supported demo notes.

## Auth and deployment limitations

- No production auth yet.
- MVP local auth uses deterministic demo users and demo password.
- No external auth providers or SSO.
- SQLite is the default local/demo database.
- PostgreSQL schema is prepared but not live-migrated in this release candidate.

## AI/provider limitations

- No external model provider calls yet.
- The AI Gateway is role-based and provider-agnostic, but demo capability outputs are deterministic.

## Product scope limitations

- No App Factory yet.
- No Agent Marketplace yet.
- Digital Marketing AI and Business Consultant AI remain roadmap items only.
