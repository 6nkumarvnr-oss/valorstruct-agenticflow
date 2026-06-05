from __future__ import annotations

from typing import Any


PILOT_DEMO_PROJECT_ID = "canopy-demo-project"
PILOT_DEMO_PROJECT_NAME = "Canopy Base Plates Demo"
PILOT_DEMO_DRAWING_NOTES = "BP-01 Plate 400x400x20 S275 with 4-M20 holes and 6mm fillet weld all around.\nBP-02 Plate 300x300x16 S275 with 4-M16 holes and 6mm fillet weld all around.\nBR-01 RHS80x40x2.8 S275 length 2.5m."


def seed_demo_data(store: Any) -> dict[str, Any]:
    """Seed deterministic MVP demo data into a store.

    Existing SQLite stores already seed demo users, workspace, and memberships on
    initialization. This helper makes that behavior explicit and also adds the
    BP-01 package run plus BP-01/BP-02/BR-01 project-level package when those
    helpers are available.
    """
    from ..main import MultiPartPackageRunRequest, _build_project_level_package_payload, build_demo_package_run_payload
    from ..persistence import DEMO_WORKSPACE_ID

    package_run = store.create_package_run(build_demo_package_run_payload())
    project_package = store.persist_project_level_package_run(
        _build_project_level_package_payload(
            "valor-demo-project-multi-part",
            "Valor Struct Multi-Part Demo Project",
            MultiPartPackageRunRequest().drawingNotes,
            DEMO_WORKSPACE_ID,
            "agent@valorstruct.local",
        )
    ) if hasattr(store, "persist_project_level_package_run") else None
    pilot_project_package = store.persist_project_level_package_run(
        _build_project_level_package_payload(
            PILOT_DEMO_PROJECT_ID,
            PILOT_DEMO_PROJECT_NAME,
            PILOT_DEMO_DRAWING_NOTES,
            DEMO_WORKSPACE_ID,
            "senior.engineer@valorstruct.local",
        )
    ) if hasattr(store, "persist_project_level_package_run") else None

    return {
        "users": store.list_users() if hasattr(store, "list_users") else [],
        "workspaces": store.list_workspaces_for_user("user-owner") if hasattr(store, "list_workspaces_for_user") else [],
        "packageRun": package_run,
        "projectLevelPackageRun": project_package,
        "pilotDemoProject": pilot_project_package,
    }
