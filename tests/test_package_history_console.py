from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class PackageHistoryConsoleTest(unittest.TestCase):
    def test_package_history_console_contains_required_panels_and_actions(self):
        page_path = ROOT / "agenticflow/frontend/src/pages/PackageHistoryConsole.tsx"
        self.assertTrue(page_path.exists())
        page = page_path.read_text(encoding="utf-8")

        for required in [
            "Package History & Approval Console",
            "package run list",
            "selected package detail panel",
            "risk classification panel",
            "approval gate panel",
            "approval decision panel",
            "audit event table",
            "model-role audit event table",
            "export metadata panel",
            "Shop Drawing Assistant Summary panel",
            "Part List",
            "Hole Schedule",
            "Weld Notes",
            "Drawing-to-BOQ Summary panel",
            "Drawing-to-Manufacturing Package panel",
            "cutting list table",
            "production route panel",
            "manufacturing warnings panel",
            "item number",
            "warnings panel",
            "Approve package",
            "Reject package",
            "Export HTML",
            "Print / Save as PDF instruction",
            "Approver selector",
            "Selected approver role",
            "Approval authority result",
            "Blocked approval message",
            "Status:",
            "Approver:",
            "Reason:",
            "Timestamp:",
            "package-run-bp-01-001",
            "Senior Structural Engineer approval",
            "current user panel",
            "role display",
            "workspace display",
            "current user role-based approval authority",
            "logout button",
        ]:
            self.assertIn(required, page)


    def test_project_dashboard_contains_required_cards_panels_and_quick_links(self):
        page_path = ROOT / "agenticflow/frontend/src/pages/ProjectDashboard.tsx"
        self.assertTrue(page_path.exists())
        page = page_path.read_text(encoding="utf-8")

        for required in [
            "Valor Struct / AgenticFlow Project Dashboard",
            "total projects card",
            "package runs card",
            "pending approvals card",
            "approved packages card",
            "rejected packages card",
            "risk level summary",
            "recent audit events panel",
            "recent model-role audit events panel",
            "recent exports panel",
            "EngineeringPackageConsole",
            "PackageHistoryConsole",
            "Multi-Part Package Console",
            "Create project-level packages from multiple drawing-note parts.",
            "current user panel",
            "role display",
            "workspace display",
            "logout button",
        ]:
            self.assertIn(required, page)


    def test_multi_part_package_console_contains_required_project_package_surface(self):
        page_path = ROOT / "agenticflow/frontend/src/pages/MultiPartPackageConsole.tsx"
        self.assertTrue(page_path.exists())
        page = page_path.read_text(encoding="utf-8")

        for required in [
            "Valor Struct / AgenticFlow",
            "current user/workspace panel",
            "project name input",
            "multiline drawing notes input",
            "deterministic BP-01/BP-02/BR-01 demo notes prefilled",
            "run project package button",
            "parsed project parts table",
            "per-part BOQ panel",
            "combined BOQ totals panel",
            "per-part manufacturing panel",
            "combined manufacturing totals panel",
            "combined quotation summary panel",
            "project-level approval status panel",
            "warnings panel",
            "export JSON/Markdown/HTML affordance text",
            "link or instruction to package history",
            "BP-01 Plate 400x400x20 S275",
            "BP-02 Plate 400x400x20 S275",
            "BR-01 RHS80x40x2.8 S275 length 2.5m",
        ]:
            self.assertIn(required, page)

    def test_login_page_and_auth_context_exist_for_mvp_auth_flow(self):
        login_path = ROOT / "agenticflow/frontend/src/pages/LoginPage.tsx"
        auth_path = ROOT / "agenticflow/frontend/src/state/AuthContext.tsx"
        self.assertTrue(login_path.exists())
        self.assertTrue(auth_path.exists())
        login_page = login_path.read_text(encoding="utf-8")
        auth_context = auth_path.read_text(encoding="utf-8")

        for required in [
            "Email input",
            "Password input",
            "login button",
            "demo user hint section",
            "login status/error message",
        ]:
            self.assertIn(required, login_page)

        for required in [
            "currentUser",
            "token",
            "workspace",
            "login",
            "logout",
            "isAuthenticated",
            "hasRole",
            "Valor Struct Demo Workspace",
        ]:
            self.assertIn(required, auth_context)

    def test_engineering_console_contains_current_user_workspace_panel(self):
        page_path = ROOT / "agenticflow/frontend/src/pages/EngineeringPackageConsole.tsx"
        self.assertTrue(page_path.exists())
        page = page_path.read_text(encoding="utf-8")

        for required in [
            "current user panel",
            "role display",
            "workspace display",
            "logout button",
            "logged-in current user",
        ]:
            self.assertIn(required, page)


if __name__ == "__main__":
    unittest.main()
