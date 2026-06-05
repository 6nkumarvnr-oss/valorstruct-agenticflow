from __future__ import annotations

import json
from pathlib import Path
import unittest

from agenticflow.backend.main import version

ROOT = Path(__file__).resolve().parents[1]


class PilotReleaseCandidateTest(unittest.TestCase):
    def test_release_candidate_docs_exist(self):
        for relative_path in [
            "agenticflow/docs/release-notes-v0.1.0-pilot-rc.md",
            "agenticflow/docs/pilot-demo-qa-checklist.md",
            "agenticflow/docs/known-limitations-v0.1.0.md",
            "agenticflow/docs/pilot-pitch-summary.md",
            "agenticflow/docs/pilot-release-gate-checklist.md",
        ]:
            self.assertTrue((ROOT / relative_path).exists(), relative_path)

    def test_version_json_and_endpoint_report_pilot_rc(self):
        version_json = ROOT / "agenticflow/version.json"
        self.assertTrue(version_json.exists())
        metadata = json.loads(version_json.read_text())
        self.assertEqual(metadata["version"], "0.1.0-pilot-rc")
        self.assertEqual(metadata["status"], "pilot-release-candidate")
        self.assertEqual(metadata["architecture"], "five-layer governed AI organism")

        endpoint_payload = version()
        self.assertEqual(endpoint_payload["version"], "0.1.0-pilot-rc")
        self.assertEqual(endpoint_payload["status"], "pilot-release-candidate")
        self.assertIn("five-layer governed AI organism", endpoint_payload["architecture"])

    def test_readmes_reference_pilot_rc_docs_sequence_and_totals(self):
        for path in [ROOT / "README.md", ROOT / "agenticflow/README.md"]:
            text = path.read_text()
            self.assertIn("v0.1.0 Pilot RC", text)
            self.assertIn("release-notes-v0.1.0-pilot-rc.md", text)
            self.assertIn("pilot-demo-qa-checklist.md", text)
            self.assertIn("known-limitations-v0.1.0.md", text)
            self.assertIn("pilot-pitch-summary.md", text)
            self.assertIn("Quick demo sequence", text)
            self.assertIn("48.92 kg", text)
            self.assertIn("837.94 SAR", text)

    def test_qa_checklist_includes_expected_totals_and_release_flow(self):
        text = (ROOT / "agenticflow/docs/pilot-demo-qa-checklist.md").read_text()
        lower_text = text.lower()
        for required in [
            "install dependencies",
            "run backend",
            "run frontend",
            "Login as Senior Structural Engineer",
            "Open Project Dashboard",
            "Open Pilot Demo Checklist",
            "Run the multi-part package workflow",
            "48.92 kg",
            "4 nos",
            "8 nos",
            "3.20 m",
            "1.10 m2",
            "3.30 hr",
            "9.80 hr",
            "837.94 SAR",
            "Verify approval required",
            "Approve package",
            "Review Package History Console",
            "Export HTML",
            "Print / Save as PDF",
            "audit events",
            "model-role audit events",
            "Verify limitations displayed",
        ]:
            self.assertIn(required.lower(), lower_text)

    def test_known_limitations_include_required_warnings(self):
        text = (ROOT / "agenticflow/docs/known-limitations-v0.1.0.md").read_text()
        lower_text = text.lower()
        for required in [
            "Deterministic demo data only",
            "Preliminary engineering checks only",
            "No final code-compliant design",
            "No CAD/DWG/DXF/OCR",
            "No production auth yet",
            "SQLite is the default",
            "PostgreSQL schema is prepared but not live-migrated",
            "No external model provider calls yet",
            "No App Factory yet",
        ]:
            self.assertIn(required.lower(), lower_text)

    def test_release_gate_checklist_includes_required_gates(self):
        text = (ROOT / "agenticflow/docs/pilot-release-gate-checklist.md").read_text()
        lower_text = text.lower()
        for required in [
            "all tests pass",
            "deterministic demo totals",
            "48.92 kg",
            "837.94 SAR",
            "login demo verified",
            "approval workflow verified",
            "export workflow verified",
            "deployment env templates",
            "/health",
            "/ready",
            "/version",
            "known limitations",
            "not-for-final-engineering-use",
            "no cad/ocr/app factory",
            "release candidate ready for pilot presentation",
        ]:
            self.assertIn(required.lower(), lower_text)


if __name__ == "__main__":
    unittest.main()
