from __future__ import annotations

import json
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .db_config import get_database_engine
from .errors import error_response
from .logging_config import configure_logging
from .settings import get_cors_origins, get_log_level, is_demo_mode, validate_startup_settings

from .storage.backup import export_store_snapshot
from .storage.postgres_schema import get_postgres_schema_sql
from .persistence import (
    DEFAULT_APPROVER_EMAIL,
    DEMO_PASSWORD,
    DEMO_WORKSPACE_ID,
    GovernancePersistenceStore,
    SCHEMA_TABLES,
)


class VerticalSliceSummary(BaseModel):
    signal: str = "latency_ms=1200 threshold=500"
    stability_state: str = "UNSTABLE"
    governance_decision: str = "DECREASE_TRAFFIC"
    traffic_weight_before: float = 1.0
    traffic_weight_after: float = 0.85
    recovery_detected_at_ms: int = 5000
    policy_weight_before: float = 1.0
    policy_weight_after: float = 1.05


class RunAgentRequest(BaseModel):
    goal: str


class RunAgentResponse(BaseModel):
    goal: str
    plan: list[str]
    status: str
    verticalSliceResult: dict[str, object]
    auditSummary: dict[str, object]
    memoryEntryId: str


class QuotationItemInput(BaseModel):
    description: str
    unit: str
    quantity: float
    materialRate: float
    laborRate: float


class QuotationRunRequest(BaseModel):
    projectName: str
    clientName: str
    location: str
    scopeDescription: str
    currency: str
    items: list[QuotationItemInput]
    overheadPercent: float
    profitPercent: float
    vatPercent: float


class SteelDesignRunRequest(BaseModel):
    projectName: str
    memberId: str
    codeProfile: str
    materialGrade: str
    sectionName: str
    lengthM: float
    effectiveLengthFactor: float
    axialDemandKN: float
    shearDemandKN: float
    momentDemandKNm: float
    deflectionDemandMm: float
    deflectionLimitMm: float


class ProjectCreateRequest(BaseModel):
    id: str = "project-bp-01"
    name: str = "BP-01 Fabrication Package"
    clientName: str = "Valor Struct Demo Client"
    status: str = "active"
    createdAt: str = "2026-06-03T00:00:00.000Z"


class PackageRunPersistenceRequest(BaseModel):
    project: dict[str, object]
    packageRun: dict[str, object]
    riskClassification: dict[str, object]
    approvalGate: dict[str, object]
    auditEvents: list[dict[str, object]] = Field(default_factory=list)
    modelRoleAuditEvents: list[dict[str, object]] = Field(default_factory=list)
    exports: list[dict[str, object]] = Field(default_factory=list)


class ApprovalDecisionRequest(BaseModel):
    id: str = "approval-decision-package-run-bp-01-001"
    decision: str
    decidedBy: str = "Senior Structural Engineer"
    userEmail: str = DEFAULT_APPROVER_EMAIL
    reason: str = "Approval decision recorded."
    decidedAt: str = "2026-06-03T00:00:00.000Z"


class ApprovalAuthorityRequest(BaseModel):
    userEmail: str
    level: int


class LoginRequest(BaseModel):
    email: str
    password: str


class ApprovalActionRequest(BaseModel):
    decision: str = "approved"
    reason: str = "Approval decision recorded by logged-in user."




class GovernedSwarmRunRequest(BaseModel):
    request: str = "Prepare governed engineering quotation package for BP-01"
    workspaceId: str = DEMO_WORKSPACE_ID
    createdByEmail: str = "agent@valorstruct.local"


class GSRPApprovalDecisionRequest(BaseModel):
    decision: str = "approved"
    decidedBy: str = "Senior Structural Engineer"
    userEmail: str = DEFAULT_APPROVER_EMAIL
    reason: str = "GSRP approval decision recorded after human review."
    decidedAt: str = "2026-06-09T00:00:00.000Z"


def build_governed_swarm_run(request: str) -> dict[str, object]:
    cleaned_request = request.strip() or "Prepare governed engineering quotation package for BP-01"
    lowered = cleaned_request.lower()
    risk_level = "high" if any(word in lowered for word in ["engineering", "quotation", "manufacturing", "boq", "drawing", "release"]) else "medium"
    selected_agents = [
        {
            "agentId": "planner.agenticflow.v1",
            "agentName": "P-Agent Planner",
            "agentType": "planner",
            "ownerDomain": "agenticflow-core",
            "modelRole": "reasoning_model",
            "approvalRequired": "recommended",
        },
        {
            "agentId": "engineering.critic.v1",
            "agentName": "Engineering Critic",
            "agentType": "critic",
            "ownerDomain": "engineering",
            "modelRole": "engineering_reasoning_model",
            "approvalRequired": "required",
        },
        {
            "agentId": "quotation.specialist.v1",
            "agentName": "Valor Quotation Specialist",
            "agentType": "specialist",
            "ownerDomain": "commercial",
            "modelRole": "engineering_reasoning_model",
            "approvalRequired": "required",
        },
        {
            "agentId": "governance.judge.v1",
            "agentName": "PatchD Governance Judge",
            "agentType": "governance_judge",
            "ownerDomain": "governance",
            "modelRole": "policy_reasoning_model",
            "approvalRequired": "required",
        },
    ]
    return {
        "runId": "gsrp-api-demo",
        "request": cleaned_request,
        "riskLevel": risk_level,
        "humanApprovalRequired": True,
        "selectedAgents": selected_agents,
        "selectedPlan": [
            "Run PatchD governance scan",
            "Create P-Agent plan",
            "Route to governed specialists",
            "Run critic and verifier checks",
            "Prepare human approval packet",
        ],
        "candidateOutputs": [
            {
                "agentId": "planner.agenticflow.v1",
                "summary": "Draft governed execution plan with capability contracts and audit events.",
                "confidenceScore": 0.82,
                "riskScore": 0.72,
            }
        ],
        "critiques": [
            {
                "criticAgentId": "engineering.critic.v1",
                "targetAgentId": "planner.agenticflow.v1",
                "findings": ["Confirm drawing revision", "Confirm human approval before issue"],
                "recommendation": "revise",
            }
        ],
        "verification": {
            "status": "requires_human_review",
            "checksPassed": ["agent_registry_selected", "approval_required_detected"],
            "checksFailed": ["human_approval_not_yet_recorded"],
        },
        "governanceDecision": "requires_human_approval",
        "auditEvents": [
            "GSRP_REQUEST_RECEIVED",
            "GSRP_RISK_CLASSIFIED",
            "GSRP_AGENTS_SELECTED",
            "GSRP_GOVERNANCE_DECISION_RECORDED",
        ],
    }


class MultiPartPackageRunRequest(BaseModel):
    projectName: str = "Valor Struct Multi-Part Demo Project"
    drawingNotes: str = "BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.\nBP-02 Plate 300x300x16 S275 with 4-M16 holes and 6mm fillet weld all around.\nBR-01 RHS80x40x2.8 S275 length 2.5m."
    workspaceId: str | None = None


configure_logging(get_log_level())

app = FastAPI(title="AgenticFlow Patch D Vertical Slice")
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

persistence_store = GovernancePersistenceStore()


def require_authenticated_user(authorization: str | None = None) -> dict[str, object]:
    if not isinstance(authorization, str) or not authorization:
        raise HTTPException(status_code=401, detail=error_response("AUTH_TOKEN_REQUIRED", "Authentication token is required for this MVP workspace flow.")["error"])
    try:
        return persistence_store.get_current_user_from_token(authorization)
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=error_response("AUTH_TOKEN_INVALID", str(exc))["error"]) from exc


def _protect_workspace(package_run: dict[str, object], user: dict[str, object]) -> None:
    try:
        persistence_store.require_workspace_access(user, str(package_run["workspaceId"]))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=error_response("WORKSPACE_ACCESS_DENIED", str(exc))["error"]) from exc


def require_admin_user(authorization: str | None = None) -> dict[str, object]:
    user = require_authenticated_user(authorization)
    if user.get("role") not in {"Owner", "Admin"}:
        raise HTTPException(status_code=403, detail=error_response("ADMIN_ROLE_REQUIRED", "Owner or Admin role is required for storage administration helpers.")["error"])
    return user




def create_persisted_governed_swarm_run(payload: GovernedSwarmRunRequest) -> dict[str, object]:
    run = build_governed_swarm_run(payload.request)
    return persistence_store.persist_gsrp_run({
        "run": run,
        "workspaceId": payload.workspaceId,
        "createdByEmail": payload.createdByEmail,
        "request": payload.request,
    })


def list_governed_swarm_runs() -> list[dict[str, object]]:
    return persistence_store.list_gsrp_runs()


def get_governed_swarm_run(run_id: str) -> dict[str, object]:
    try:
        return persistence_store.get_gsrp_run(run_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=error_response("GSRP_RUN_NOT_FOUND", str(exc))["error"]) from exc


def record_governed_swarm_approval(run_id: str, decision: GSRPApprovalDecisionRequest) -> dict[str, object]:
    try:
        return persistence_store.record_gsrp_approval_decision(run_id, decision.model_dump())
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=error_response("GSRP_APPROVAL_DENIED", str(exc))["error"]) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=error_response("GSRP_APPROVAL_INVALID", str(exc))["error"]) from exc


@app.post("/governed-swarm/run")
def run_governed_swarm(payload: GovernedSwarmRunRequest) -> dict[str, object]:
    return create_persisted_governed_swarm_run(payload)


@app.get("/governed-swarm/runs")
def get_governed_swarm_runs() -> list[dict[str, object]]:
    return list_governed_swarm_runs()


@app.get("/governed-swarm/runs/{run_id}")
def get_governed_swarm_run_detail(run_id: str) -> dict[str, object]:
    return get_governed_swarm_run(run_id)


@app.post("/governed-swarm/runs/{run_id}/approval")
def approve_governed_swarm_run(run_id: str, decision: GSRPApprovalDecisionRequest) -> dict[str, object]:
    return record_governed_swarm_approval(run_id, decision)

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "agenticflow-backend"}


@app.get("/ready")
def ready() -> dict[str, object]:
    startup = validate_startup_settings()
    return {
        "status": "ready",
        "databaseEngine": get_database_engine(),
        "demoMode": is_demo_mode(),
        "persistenceReady": bool(persistence_store.table_names()),
        "authMode": "mvp-local-demo-auth",
        "environment": startup["environment"],
        "corsOrigins": startup["corsOrigins"],
        "logLevel": startup["logLevel"],
        "warnings": startup["warnings"],
    }


@app.get("/version")
def version() -> dict[str, str]:
    version_path = Path(__file__).resolve().parents[1] / "version.json"
    if version_path.exists():
        metadata = json.loads(version_path.read_text())
        return {
            "appName": str(metadata.get("name", "AgenticFlow")),
            "phase": f"Phase {metadata.get('phase', '6.5')} — Pilot Demo QA + Release Candidate",
            "version": str(metadata.get("version", "0.1.0-pilot-rc")),
            "status": str(metadata.get("status", "pilot-release-candidate")),
            "architecture": str(metadata.get("architecture", "five-layer governed AI organism")),
        }
    return {
        "appName": "AgenticFlow",
        "phase": "Phase 6.5 — Pilot Demo QA + Release Candidate",
        "version": "0.1.0-pilot-rc",
        "status": "pilot-release-candidate",
        "architecture": "five-layer governed AI organism",
    }


@app.get("/vertical-slice", response_model=VerticalSliceSummary)
def vertical_slice() -> VerticalSliceSummary:
    return VerticalSliceSummary()


@app.post("/agents/run", response_model=RunAgentResponse)
def run_agent(request: RunAgentRequest) -> RunAgentResponse:
    plan = [
        "Read goal",
        "Create stability signal",
        "Run Patch D vertical slice",
        "Store result in memory",
        "Return execution summary",
    ]
    vertical_slice_result: dict[str, object] = {
        "stabilityState": {"status": "UNSTABLE"},
        "governanceDecision": {"action": "DECREASE_TRAFFIC"},
        "trafficWeightBefore": 1.0,
        "trafficWeightAfter": 0.85,
        "recoveryDetectedAtMs": 5000,
        "policyWeightBefore": 1.0,
        "policyWeightAfter": 1.05,
    }
    audit_summary: dict[str, object] = {
        "eventCount": 6,
        "eventTypes": [
            "SIGNAL_RECEIVED",
            "STABILITY_CLASSIFIED",
            "GOVERNANCE_DECIDED",
            "EXECUTION_EMITTED",
            "RECOVERY_DETECTED",
            "POLICY_ADAPTED",
        ],
    }
    return RunAgentResponse(
        goal=request.goal,
        plan=plan,
        status="completed",
        verticalSliceResult=vertical_slice_result,
        auditSummary=audit_summary,
        memoryEntryId="memory-1",
    )


@app.post("/quotation/run")
def run_quotation(request: QuotationRunRequest) -> dict[str, object]:
    boq = []
    for index, item in enumerate(request.items, start=1):
        direct_rate = round(item.materialRate + item.laborRate, 2)
        boq.append({
            "itemNo": index,
            "description": item.description,
            "unit": item.unit,
            "quantity": item.quantity,
            "materialRate": item.materialRate,
            "laborRate": item.laborRate,
            "directRate": direct_rate,
            "directAmount": round(item.quantity * direct_rate, 2),
        })
    subtotal = round(sum(float(item["directAmount"]) for item in boq), 2)
    overhead = round(subtotal * request.overheadPercent / 100, 2)
    profit = round((subtotal + overhead) * request.profitPercent / 100, 2)
    before_vat = round(subtotal + overhead + profit, 2)
    vat = round(before_vat * request.vatPercent / 100, 2)
    grand_total = round(before_vat + vat, 2)
    summary = {
        "currency": request.currency,
        "subtotal": subtotal,
        "overhead": overhead,
        "profit": profit,
        "beforeVat": before_vat,
        "vat": vat,
        "grandTotal": grand_total,
    }
    quotation = {
        "quotationId": "VS-QTN-20260302-001",
        "projectName": request.projectName,
        "clientName": request.clientName,
        "boq": boq,
        "summary": summary,
        "terms": ["Quotation is valid for 15 days from issue date."],
        "generatedAt": "2026-03-02T00:00:00.000Z",
    }
    report_markdown = (
        f"# VALOR STRUCT\n# QUOTATION REPORT\n\nProject: {request.projectName}\n"
        f"Client: {request.clientName}\nLocation: {request.location}\nScope: {request.scopeDescription}\n\n"
        f"## Commercial Summary\nGrand Total: {request.currency} {grand_total}\n\nGenerated By:\nAgenticFlow / Valor Struct"
    )
    return {
        "status": "completed",
        "input": request.model_dump(),
        "boq": boq,
        "summary": summary,
        "quotation": quotation,
        "report": {"reportMarkdown": report_markdown, "exportData": {"quotation": quotation}},
    }


@app.post("/steel-design/run")
def run_steel_design(request: SteelDesignRunRequest) -> dict[str, object]:
    area_mm2 = 2850.0 if request.sectionName.upper() == "IPE200" else 2850.0
    fy_mpa = 355.0 if request.materialGrade.upper() == "S355" else 275.0
    section_modulus_mm3 = area_mm2 * 90
    inertia_mm4 = section_modulus_mm3 * 100
    effective_length_mm = request.effectiveLengthFactor * request.lengthM * 1000
    tension_capacity = area_mm2 * fy_mpa / 1000
    euler_capacity = 3.141592653589793 ** 2 * 200000 * inertia_mm4 / effective_length_mm ** 2 / 1000
    compression_capacity = min(tension_capacity, euler_capacity)
    bending_capacity = fy_mpa * section_modulus_mm3 / 1_000_000
    shear_capacity = 0.6 * fy_mpa * area_mm2 / 1000
    checks = [
        {"checkName": "Axial tension", "utilization": round(max(0, request.axialDemandKN) / tension_capacity, 3)},
        {"checkName": "Axial compression", "utilization": round(abs(min(0, request.axialDemandKN)) / compression_capacity, 3)},
        {"checkName": "Bending", "utilization": round(abs(request.momentDemandKNm) / bending_capacity, 3)},
        {"checkName": "Shear", "utilization": round(abs(request.shearDemandKN) / shear_capacity, 3)},
        {"checkName": "Deflection", "utilization": round(request.deflectionDemandMm / request.deflectionLimitMm, 3)},
    ]
    for check in checks:
        check["status"] = "pass" if float(check["utilization"]) <= 1 else "fail"
    governing = max(checks, key=lambda check: float(check["utilization"]))
    summary = {
        "checks": checks,
        "governingUtilization": governing["utilization"],
        "governingCheck": governing["checkName"],
        "status": "pass" if all(check["status"] == "pass" for check in checks) else "fail",
    }
    report = (
        "# STEEL DESIGN PACK MVP\n\nPRELIMINARY ENGINEERING CHECK — not a final code-compliant design.\n\n"
        f"Project: {request.projectName}\nMember: {request.memberId}\nCode/Profile: {request.codeProfile}\n"
        f"Material: {request.materialGrade}\nSection: {request.sectionName}\n\n"
        f"Governing utilization: {summary['governingUtilization']}\nPass/fail status: {summary['status'].upper()}"
    )
    return {"status": "completed", "preliminary": True, "input": request.model_dump(), "summary": summary, "reportMarkdown": report}




def _part_spec_for_note(note: str) -> dict[str, object]:
    part_id = note.split()[0].upper().replace("BP01", "BP-01").replace("BR01", "BR-01")
    specs: dict[str, dict[str, object]] = {
        "BP-01": {"shape": "Plate", "material": "S275", "dimensions": "400x400x20", "materialKg": 25.12, "cuttingNos": 1, "drillingNos": 4, "weldingM": 1.6, "coatingM2": 0.32, "laborHr": 1.4, "productionHr": 4.2, "lineCount": 6},
        "BP-02": {"shape": "Plate", "material": "S275", "dimensions": "400x400x20", "materialKg": 11.3, "cuttingNos": 1, "drillingNos": 4, "weldingM": 1.2, "coatingM2": 0.18, "laborHr": 1.1, "productionHr": 3.4, "lineCount": 6},
        "BR-01": {"shape": "RHS", "section": "RHS80x40x2.8", "material": "S275", "dimensions": "RHS80x40x2.8 length 2.5m", "lengthM": 2.5, "materialKg": 12.5, "cuttingNos": 2, "drillingNos": 0, "weldingM": 0.4, "coatingM2": 0.6, "laborHr": 0.8, "productionHr": 2.2, "lineCount": 5},
    }
    return {"partId": part_id, **specs.get(part_id, specs["BP-01"])}


def _boq_lines_for_part(part: dict[str, object], start_item: int) -> list[dict[str, object]]:
    part_id = str(part["partId"])
    lines = [
        {"projectItemNo": start_item, "partId": part_id, "category": "material", "description": f"{part_id}: {part['material']} {part.get('section', 'steel plate')} {part['dimensions']}", "unit": "kg", "quantity": part["materialKg"]},
        {"projectItemNo": start_item + 1, "partId": part_id, "category": "cutting", "description": f"{part_id}: {'Saw cutting / member end cutting' if part.get('shape') == 'RHS' else 'Plasma cutting of base plate'}", "unit": "nos", "quantity": part["cuttingNos"]},
    ]
    next_item = start_item + 2
    if float(part["drillingNos"]) > 0:
        lines.append({"projectItemNo": next_item, "partId": part_id, "category": "drilling", "description": f"{part_id}: Drilling M20 holes", "unit": "nos", "quantity": part["drillingNos"]})
        next_item += 1
    lines.extend([
        {"projectItemNo": next_item, "partId": part_id, "category": "welding", "description": f"{part_id}: {'Weld allowance' if part.get('shape') == 'RHS' else '6mm fillet weld all around'}", "unit": "m", "quantity": part["weldingM"]},
        {"projectItemNo": next_item + 1, "partId": part_id, "category": "coating", "description": f"{part_id}: Coating / painting allowance", "unit": "m2", "quantity": part["coatingM2"]},
        {"projectItemNo": next_item + 2, "partId": part_id, "category": "inspection", "description": f"{part_id}: Dimensional and visual inspection", "unit": "lot", "quantity": 1},
    ])
    return lines


def _build_project_level_package_payload(
    project_id: str,
    project_name: str,
    drawing_notes: str,
    workspace_id: str,
    created_by_email: str,
) -> dict[str, object]:
    notes = [note.strip() for note in drawing_notes.splitlines() if note.strip()]
    parts = []
    combined_boq_lines = []
    next_item = 1
    for note in notes:
        spec = _part_spec_for_note(note)
        part = {
            "partId": spec["partId"],
            "drawingNote": note,
            "shape": spec.get("shape", "Plate"),
            "section": spec.get("section"),
            "material": spec.get("material", "S275"),
            "dimensions": spec.get("dimensions", "400x400x20"),
            "lengthM": spec.get("lengthM"),
            "quantity": 1,
            "boqLineCount": spec["lineCount"],
            "manufacturingLaborHr": spec["laborHr"],
            "manufacturingProductionHr": spec["productionHr"],
        }
        parts.append(part)
        lines = _boq_lines_for_part(spec, next_item)
        combined_boq_lines.extend(lines)
        next_item += len(lines)
    combined_boq_summary = {
        "partCount": len(parts),
        "lineCount": len(combined_boq_lines),
        "materialKg": round(sum(float(line["quantity"]) for line in combined_boq_lines if line["category"] == "material"), 2),
        "cuttingNos": round(sum(float(line["quantity"]) for line in combined_boq_lines if line["category"] == "cutting"), 2),
        "drillingNos": round(sum(float(line["quantity"]) for line in combined_boq_lines if line["category"] == "drilling"), 2),
        "weldLengthM": round(sum(float(line["quantity"]) for line in combined_boq_lines if line["category"] == "welding"), 2),
        "coatingAreaM2": round(sum(float(line["quantity"]) for line in combined_boq_lines if line["category"] == "coating"), 2),
        "lines": combined_boq_lines,
    }
    combined_manufacturing_summary = {
        "cuttingListItems": len(parts),
        "drillingScheduleItems": sum(1 for part in parts if str(part["partId"]).startswith("BP")),
        "weldScheduleItems": len(parts),
        "coatingScheduleItems": len(parts),
        "totalEstimatedLaborHr": round(sum(float(part["manufacturingLaborHr"]) for part in parts), 2),
        "totalEstimatedProductionHr": round(sum(float(part["manufacturingProductionHr"]) for part in parts), 2),
        "warnings": ["Weld length is estimated from plate perimeter.", "No drilling required for BR-01 RHS member."],
    }
    quotation_total = 0.0
    rates = {"material": 7, "cutting": 35, "drilling": 8, "welding": 45, "coating": 25, "inspection": 40}
    for line in combined_boq_lines:
        quotation_total += float(line["quantity"]) * rates[str(line["category"])]
    combined_quotation_summary = {
        "currency": "SAR",
        "boqItems": len(combined_boq_lines),
        "grandTotal": round(quotation_total, 2),
    }
    return {
        "id": f"project-level-package-{project_id}-001",
        "projectId": project_id,
        "workspaceId": workspace_id,
        "projectName": project_name,
        "parts": parts,
        "combinedBOQSummary": combined_boq_summary,
        "combinedManufacturingSummary": combined_manufacturing_summary,
        "combinedQuotationSummary": combined_quotation_summary,
        "approvalStatus": "requires-review",
        "createdByEmail": created_by_email,
        "createdAt": "2026-06-04T00:00:00.000Z",
    }

def run_multi_part_package_helper(
    project_id: str = "valor-demo-project-multi-part",
    request: MultiPartPackageRunRequest | None = None,
    authorization: str | None = None,
) -> dict[str, object]:
    user = require_authenticated_user(authorization)
    workspace = persistence_store.get_current_workspace(str(user["userId"]))
    payload = _build_project_level_package_payload(
        project_id,
        (request or MultiPartPackageRunRequest()).projectName,
        (request or MultiPartPackageRunRequest()).drawingNotes,
        (request.workspaceId if request and request.workspaceId else str(workspace["workspaceId"])),
        str(user["email"]),
    )
    return persistence_store.persist_project_level_package_run(payload)

def build_demo_package_run_payload() -> dict[str, object]:
    return {
        "project": {
            "id": "project-bp-01",
            "name": "BP-01 Fabrication Package",
            "clientName": "Valor Struct Demo Client",
            "status": "active",
            "createdAt": "2026-06-03T00:00:00.000Z",
        },
        "packageRun": {
            "id": "package-run-bp-01-001",
            "request": "Prepare fabrication and quotation package for BP-01",
            "status": "completed",
            "packageId": "VS-BP-01-ENG-FAB-PKG",
            "revision": "Rev 00",
            "approvalStatus": "requires-review",
            "workspaceId": DEMO_WORKSPACE_ID,
            "createdByUserId": "user-agent",
            "createdByEmail": "agent@valorstruct.local",
            "createdAt": "2026-06-03T00:00:00.000Z",
        },
        "riskClassification": {
            "workflowType": "structural-design-report",
            "level": 3,
            "label": "Licensed expert approval required",
            "requiredApprover": "Senior Structural Engineer approval",
            "rationale": "Structural design reports can affect life-safety and code compliance.",
            "blocked": False,
        },
        "approvalGate": {
            "gateId": "gate-level-3",
            "required": True,
            "requiredApprover": "Senior Structural Engineer approval",
            "status": "pending-licensed-expert-approval",
            "reason": "Licensed expert approval required: Structural design reports can affect life-safety and code compliance.",
        },
        "auditEvents": [
            {"order": 1, "type": "GRAPH_QUERY", "message": "Queried BP-01 graph."},
            {"order": 2, "type": "MANUFACTURING_ESTIMATE", "message": "Estimated BP-01 manufacturing route."},
            {"order": 3, "type": "STEEL_DESIGN_CHECK", "message": "Ran preliminary steel design check."},
            {"order": 4, "type": "QUOTATION", "message": "Generated quotation summary."},
            {"order": 5, "type": "CONSOLIDATED_REPORT", "message": "Generated package report."},
        ],
        "modelRoleAuditEvents": [
            {
                "order": 1,
                "capability": "WorkflowIntentClassifier",
                "task": "orchestrate_workflow",
                "requestedRole": "orchestration_model",
                "selectedModelRef": "best_available_model",
                "fallbackRole": "fallback_model",
                "sensitiveDataRouteRole": "fallback_model",
                "reason": "Intent classification requested orchestration_model through provider-agnostic gateway.",
            },
            {
                "order": 2,
                "capability": "SteelDesignPack",
                "task": "reason_about_engineering",
                "requestedRole": "engineering_reasoning_model",
                "selectedModelRef": "best_available_model",
                "fallbackRole": "local_private_model",
                "sensitiveDataRouteRole": "local_private_model",
                "reason": "Licensed design data triggered local_private_model sensitive-data route.",
            },
        ],
        "exports": [
            {
                "exportType": "markdown",
                "filename": "VS-BP-01-ENG-FAB-PKG-REV-00.md",
                "content": "# BP-01 Engineering & Fabrication Package\nApproval: requires licensed expert approval",
                "createdAt": "2026-06-03T00:00:00.000Z",
            },
            {
                "exportType": "json",
                "filename": "VS-BP-01-ENG-FAB-PKG-REV-00.json",
                "content": {"packageId": "VS-BP-01-ENG-FAB-PKG", "approvalStatus": "requires-review"},
                "createdAt": "2026-06-03T00:00:00.000Z",
            },
        ],
    }


@app.post("/auth/login")
def login(request: LoginRequest) -> dict[str, object]:
    user = persistence_store.authenticate_user(request.email, request.password)
    if user is None:
        raise HTTPException(status_code=401, detail=error_response("INVALID_DEMO_CREDENTIALS", "Invalid MVP demo credentials.")["error"])
    token = persistence_store.issue_demo_token(user)
    workspace = persistence_store.get_current_workspace(str(user["userId"]))
    return {
        "token": token,
        "tokenType": "Bearer",
        "currentUser": user,
        "workspace": workspace,
        "securityNote": "MVP local auth only; production must harden password hashing, token expiry, CSRF/session strategy, and access controls.",
        "demoPasswordHint": DEMO_PASSWORD,
    }


@app.get("/auth/me")
def auth_me(authorization: str | None = Header(default=None)) -> dict[str, object]:
    user = require_authenticated_user(authorization)
    return {"currentUser": user, "workspace": persistence_store.get_current_workspace(str(user["userId"]))}


@app.post("/auth/logout")
def logout(authorization: str | None = Header(default=None)) -> dict[str, object]:
    user = require_authenticated_user(authorization)
    token = str(authorization).removeprefix("Bearer ").strip()
    return {**persistence_store.logout_token(token), "userEmail": user["email"]}


@app.get("/workspaces")
def list_workspaces(authorization: str | None = Header(default=None)) -> list[dict[str, object]]:
    user = require_authenticated_user(authorization)
    return persistence_store.list_workspaces_for_user(str(user["userId"]))


@app.get("/workspaces/{workspace_id}")
def get_workspace(workspace_id: str, authorization: str | None = Header(default=None)) -> dict[str, object]:
    user = require_authenticated_user(authorization)
    try:
        persistence_store.require_workspace_access(user, workspace_id)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=error_response("WORKSPACE_ACCESS_DENIED", str(exc))["error"]) from exc
    for workspace in persistence_store.list_workspaces_for_user(str(user["userId"])):
        if workspace["workspaceId"] == workspace_id:
            return workspace
    raise HTTPException(status_code=404, detail=error_response("WORKSPACE_NOT_FOUND", "Workspace not found.")["error"])


@app.get("/persistence/schema")
def persistence_schema() -> dict[str, object]:
    return {"tables": persistence_store.table_names(), "requiredTables": SCHEMA_TABLES}


def get_admin_storage_snapshot(authorization: str | None = None) -> dict[str, object]:
    user = require_admin_user(authorization)
    return {"requestedBy": user["email"], "snapshot": export_store_snapshot(persistence_store)}


def get_admin_db_schema(authorization: str | None = None) -> dict[str, object]:
    user = require_admin_user(authorization)
    return {
        "requestedBy": user["email"],
        "sqliteTables": persistence_store.table_names(),
        "postgresSchemaSql": get_postgres_schema_sql(),
    }


@app.get("/admin/storage/snapshot")
def admin_storage_snapshot(authorization: str | None = Header(default=None)) -> dict[str, object]:
    return get_admin_storage_snapshot(authorization)


@app.get("/admin/db/schema")
def admin_db_schema(authorization: str | None = Header(default=None)) -> dict[str, object]:
    return get_admin_db_schema(authorization)


@app.get("/users")
def list_users() -> list[dict[str, object]]:
    return persistence_store.list_users()


@app.get("/users/{email}")
def get_user_by_email(email: str) -> dict[str, object]:
    return persistence_store.get_user(email)


@app.post("/approval-authority/check")
def check_approval_authority(request: ApprovalAuthorityRequest) -> dict[str, object]:
    return persistence_store.check_approval_authority(request.userEmail, request.level)


@app.get("/dashboard/summary")
def get_dashboard_summary(authorization: str | None = Header(default=None)) -> dict[str, object]:
    require_authenticated_user(authorization)
    if not persistence_store.list_package_runs():
        persistence_store.create_package_run(build_demo_package_run_payload())
    return persistence_store.get_dashboard_summary()


@app.post("/packages/run")
def run_package(request: PackageRunPersistenceRequest, authorization: str | None = Header(default=None)) -> dict[str, object]:
    user = require_authenticated_user(authorization)
    payload = request.model_dump()
    package_run = dict(payload["packageRun"])
    workspace = persistence_store.get_current_workspace(str(user["userId"]))
    package_run.update({"workspaceId": workspace["workspaceId"], "createdByUserId": user["userId"], "createdByEmail": user["email"]})
    payload["packageRun"] = package_run
    return persistence_store.create_package_run(payload)


@app.get("/packages")
def list_packages(authorization: str | None = Header(default=None)) -> list[dict[str, object]]:
    user = require_authenticated_user(authorization)
    packages = persistence_store.list_package_runs()
    return [package for package in packages if package.get("workspaceId") in {workspace["workspaceId"] for workspace in persistence_store.list_workspaces_for_user(str(user["userId"]))}]


@app.get("/packages/{package_id}")
def get_package(package_id: str, authorization: str | None = Header(default=None)) -> dict[str, object]:
    user = require_authenticated_user(authorization)
    package = persistence_store.get_package_run(package_id)
    _protect_workspace(package["packageRun"], user)
    return package


@app.get("/packages/{package_id}/audit")
def get_package_audit(package_id: str, authorization: str | None = Header(default=None)) -> list[dict[str, object]]:
    package = get_package(package_id, authorization)
    return persistence_store.get_audit_events(str(package["packageRun"]["id"]))


@app.get("/packages/{package_id}/exports")
def get_package_export_records(package_id: str, authorization: str | None = Header(default=None)) -> list[dict[str, object]]:
    package = get_package(package_id, authorization)
    return persistence_store.get_exports(str(package["packageRun"]["id"]))


@app.post("/packages/{package_id}/approval")
def record_package_approval(package_id: str, request: ApprovalActionRequest, authorization: str | None = Header(default=None)) -> dict[str, object]:
    user = require_authenticated_user(authorization)
    try:
        return persistence_store.record_approval_decision_for_user(package_id, user, request.decision, request.reason)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=error_response("APPROVAL_NOT_AUTHORIZED", str(exc))["error"]) from exc




@app.post("/projects/{project_id}/multi-part-package/run")
def run_project_multi_part_package(project_id: str, request: MultiPartPackageRunRequest, authorization: str | None = Header(default=None)) -> dict[str, object]:
    return run_multi_part_package_helper(project_id, request, authorization)


@app.post("/projects")
def create_project(request: ProjectCreateRequest) -> dict[str, object]:
    return persistence_store.create_project(request.model_dump())


@app.get("/package-runs")
def list_package_runs() -> list[dict[str, object]]:
    return persistence_store.list_package_runs()


@app.post("/package-runs")
def create_package_run(request: PackageRunPersistenceRequest) -> dict[str, object]:
    return persistence_store.create_package_run(request.model_dump())


@app.post("/package-runs/demo-bp-01")
def create_demo_bp_01_package_run() -> dict[str, object]:
    return persistence_store.create_package_run(build_demo_package_run_payload())


@app.get("/package-runs/{package_run_id}")
def get_package_run(package_run_id: str) -> dict[str, object]:
    return persistence_store.get_package_run(package_run_id)


@app.get("/package-runs/{package_run_id}/audit-events")
def get_package_audit_events(package_run_id: str) -> list[dict[str, object]]:
    return persistence_store.get_audit_events(package_run_id)


@app.get("/package-runs/{package_run_id}/model-role-audit-events")
def get_package_model_role_audit_events(package_run_id: str) -> list[dict[str, object]]:
    return persistence_store.get_model_role_audit_events(package_run_id)


@app.get("/package-runs/{package_run_id}/exports")
def get_package_exports(package_run_id: str) -> list[dict[str, object]]:
    return persistence_store.get_exports(package_run_id)


@app.post("/package-runs/{package_run_id}/approval-decisions")
def record_approval_decision(package_run_id: str, request: ApprovalDecisionRequest) -> dict[str, object]:
    return persistence_store.record_approval_decision(package_run_id, request.model_dump())


@app.post("/package-runs/{package_run_id}/approval-decisions/approve")
def record_approved_decision(package_run_id: str, request: ApprovalDecisionRequest) -> dict[str, object]:
    payload = {**request.model_dump(), "decision": "approved"}
    return persistence_store.record_approval_decision(package_run_id, payload)


@app.post("/package-runs/{package_run_id}/approval-decisions/reject")
def record_rejected_decision(package_run_id: str, request: ApprovalDecisionRequest) -> dict[str, object]:
    payload = {**request.model_dump(), "decision": "rejected"}
    return persistence_store.record_approval_decision(package_run_id, payload)
