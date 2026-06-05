from __future__ import annotations

import importlib
import os
from pathlib import Path
import unittest
from unittest.mock import patch

from agenticflow.backend import settings
from agenticflow.backend.errors import error_response
from agenticflow.backend.main import health, ready, version

ROOT = Path(__file__).resolve().parents[1]


class DeploymentHardeningTest(unittest.TestCase):
    def test_environment_templates_exist_with_required_keys(self):
        backend_env = ROOT / ".env.example"
        frontend_env = ROOT / "agenticflow/frontend/.env.example"
        self.assertTrue(backend_env.exists())
        self.assertTrue(frontend_env.exists())

        backend_text = backend_env.read_text(encoding="utf-8")
        for key in [
            "AGENTICFLOW_ENV=development",
            "AGENTICFLOW_DB_ENGINE=sqlite",
            "AGENTICFLOW_AUTH_SECRET=change-me-for-production",
            "AGENTICFLOW_CORS_ORIGINS=http://localhost:5173,http://localhost:3000",
            "AGENTICFLOW_LOG_LEVEL=INFO",
            "AGENTICFLOW_DEMO_MODE=true",
        ]:
            self.assertIn(key, backend_text)
        self.assertIn("VITE_AGENTICFLOW_API_BASE_URL=http://localhost:8000", frontend_env.read_text(encoding="utf-8"))

    def test_settings_defaults_and_cors_parsing(self):
        with patch.dict(os.environ, {}, clear=True):
            importlib.reload(settings)
            self.assertEqual(settings.get_environment(), "development")
            self.assertEqual(settings.get_log_level(), "INFO")
            self.assertEqual(settings.get_cors_origins(), ["http://localhost:5173", "http://localhost:3000"])
            self.assertEqual(settings.is_demo_mode(), True)

        with patch.dict(os.environ, {"AGENTICFLOW_CORS_ORIGINS": "https://app.example.com, https://admin.example.com"}, clear=True):
            importlib.reload(settings)
            self.assertEqual(settings.get_cors_origins(), ["https://app.example.com", "https://admin.example.com"])

    def test_startup_validation_warns_for_production_demo_mismatch(self):
        with patch.dict(
            os.environ,
            {
                "AGENTICFLOW_ENV": "production",
                "AGENTICFLOW_DB_ENGINE": "sqlite",
                "AGENTICFLOW_AUTH_SECRET": "change-me-for-production",
                "AGENTICFLOW_DEMO_MODE": "true",
            },
            clear=True,
        ):
            importlib.reload(settings)
            validation = settings.validate_startup_settings()
            self.assertEqual(validation["environment"], "production")
            self.assertEqual(validation["databaseEngine"], "sqlite")
            self.assertGreaterEqual(len(validation["warnings"]), 3)
            self.assertTrue(any("demo auth secret" in warning for warning in validation["warnings"]))
            self.assertTrue(any("DEMO_MODE=true" in warning for warning in validation["warnings"]))
            self.assertTrue(any("SQLite" in warning for warning in validation["warnings"]))

    def test_health_ready_and_version_helpers(self):
        self.assertEqual(health()["status"], "ok")
        readiness = ready()
        self.assertEqual(readiness["status"], "ready")
        self.assertIn("databaseEngine", readiness)
        self.assertIn("persistenceReady", readiness)
        version_payload = version()
        self.assertEqual(version_payload["appName"], "AgenticFlow")
        self.assertIn("0.1.0-pilot-rc", version_payload["version"])
        self.assertIn("five-layer governed AI organism", version_payload["architecture"])

    def test_error_response_helper_returns_standard_shape(self):
        payload = error_response("AUTH_TOKEN_REQUIRED", "Authentication token is required.", {"route": "/packages"})
        self.assertEqual(payload["error"]["code"], "AUTH_TOKEN_REQUIRED")
        self.assertEqual(payload["error"]["message"], "Authentication token is required.")
        self.assertEqual(payload["error"]["details"], {"route": "/packages"})

    def test_deployment_docs_and_readme_references_exist(self):
        deployment_doc = ROOT / "agenticflow/docs/deployment-hardening.md"
        self.assertTrue(deployment_doc.exists())
        doc_text = deployment_doc.read_text(encoding="utf-8")
        for required in [
            "local backend startup",
            "health/readiness checks",
            "production hardening checklist",
            "auth hardening warning",
            "backup / snapshot instruction",
        ]:
            self.assertIn(required.lower(), doc_text.lower())
        self.assertIn("Phase 6.3 — Deployment Hardening MVP", (ROOT / "README.md").read_text(encoding="utf-8"))

    def test_frontend_config_helper_exists(self):
        config = ROOT / "agenticflow/frontend/src/config.ts"
        self.assertTrue(config.exists())
        text = config.read_text(encoding="utf-8")
        self.assertIn("AGENTICFLOW_API_BASE_URL", text)
        self.assertIn("AGENTICFLOW_DEMO_MODE", text)


if __name__ == "__main__":
    unittest.main()
