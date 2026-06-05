from __future__ import annotations

from pathlib import Path
import tempfile
import unittest

from agenticflow.backend.persistence import GovernancePersistenceStore
from agenticflow.backend.storage.seed import seed_demo_data

ROOT = Path(__file__).resolve().parents[1]


class PilotDemoTest(unittest.TestCase):
    def test_pilot_demo_walkthrough_exists_with_parts_and_expected_totals(self):
        walkthrough = ROOT / "agenticflow/docs/pilot-demo-walkthrough.md"
        self.assertTrue(walkthrough.exists())
        text = walkthrough.read_text()
        lower_text = text.lower()
        for required in [
            "demo objective",
            "demo login credentials",
            "Canopy Base Plates Demo",
            "BP-01 Plate 400x400x20 S275 with 4-M20 holes",
            "BP-02 Plate 300x300x16 S275 with 4-M16 holes",
            "BR-01 RHS80x40x2.8 S275 length 2.5m",
            "48.92 kg",
            "4 nos",
            "8 nos",
            "3.20 m",
            "1.10 m2",
            "3.30 hr",
            "9.80 hr",
            "837.94 SAR",
            "requires-review",
            "Print / Save as PDF",
            "review-required disclaimer",
        ]:
            self.assertIn(required.lower(), lower_text)

    def test_pilot_demo_checklist_exists_with_guided_steps(self):
        checklist = ROOT / "agenticflow/frontend/src/pages/PilotDemoChecklist.tsx"
        self.assertTrue(checklist.exists())
        text = checklist.read_text()
        lower_text = text.lower()
        for required in [
            "Pilot Demo Checklist",
            "login step",
            "dashboard step",
            "multi-part package step",
            "review BOQ step",
            "review manufacturing step",
            "review quotation step",
            "approval step",
            "export step",
            "expected totals panel",
            "limitations/disclaimer panel",
            "48.92 kg",
            "837.94 SAR",
        ]:
            self.assertIn(required.lower(), lower_text)

    def test_project_dashboard_and_console_include_pilot_demo_polish(self):
        dashboard = (ROOT / "agenticflow/frontend/src/pages/ProjectDashboard.tsx").read_text()
        console = (ROOT / "agenticflow/frontend/src/pages/MultiPartPackageConsole.tsx").read_text()
        for required in [
            "Pilot Demo Checklist",
            "Guided login-to-approved/exported package walkthrough for the Canopy Base Plates Demo.",
        ]:
            self.assertIn(required, dashboard)
        for required in [
            "Demo Mode badge",
            "Canopy Base Plates Demo label",
            "expected totals hint",
            "review-required badge",
            "BP-02 Plate 300x300x16 S275",
        ]:
            self.assertIn(required, console)

    def test_seed_helper_creates_canopy_project_three_parts_and_review_status(self):
        with tempfile.TemporaryDirectory() as directory:
            store = GovernancePersistenceStore(Path(directory) / "agenticflow.db")
            seeded = seed_demo_data(store)
            pilot = seeded["pilotDemoProject"]

            self.assertEqual(pilot["projectId"], "canopy-demo-project")
            self.assertEqual(pilot["projectName"], "Canopy Base Plates Demo")
            self.assertEqual(pilot["approvalStatus"], "requires-review")
            self.assertEqual(pilot["createdByEmail"], "senior.engineer@valorstruct.local")
            self.assertEqual([part["partId"] for part in pilot["parts"]], ["BP-01", "BP-02", "BR-01"])
            self.assertEqual(len(store.list_project_parts("canopy-demo-project")), 3)
            self.assertEqual(pilot["combinedBOQSummary"]["materialKg"], 48.92)
            self.assertEqual(pilot["combinedManufacturingSummary"]["totalEstimatedLaborHr"], 3.3)
            self.assertEqual(pilot["combinedManufacturingSummary"]["totalEstimatedProductionHr"], 9.8)
            self.assertEqual(pilot["combinedQuotationSummary"]["grandTotal"], 837.94)


if __name__ == "__main__":
    unittest.main()
