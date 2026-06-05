from __future__ import annotations
from contextlib import closing

import importlib
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from agenticflow.backend import db_config
from agenticflow.backend.main import LoginRequest, get_admin_db_schema, get_admin_storage_snapshot, login
from agenticflow.backend.persistence import GovernancePersistenceStore
from agenticflow.backend.storage import (
    POSTGRES_SCHEMA_SQL,
    GovernanceStore,
    SQLiteGovernanceStore,
    create_sqlite_store,
    export_store_snapshot,
    export_store_snapshot_json,
    get_postgres_schema_sql,
    seed_demo_data,
)

ROOT = Path(__file__).resolve().parents[1]


class StorageMigrationTest(unittest.TestCase):
    def test_db_config_defaults_to_sqlite_and_reads_sqlite_path(self):
        with patch.dict(os.environ, {}, clear=True):
            importlib.reload(db_config)
            self.assertEqual(db_config.get_database_engine(), "sqlite")
            self.assertEqual(db_config.get_sqlite_path(), "agenticflow_demo.db")
            self.assertEqual(db_config.is_postgres_enabled(), False)

        with patch.dict(os.environ, {"AGENTICFLOW_SQLITE_PATH": "custom_demo.db"}, clear=True):
            importlib.reload(db_config)
            self.assertEqual(db_config.get_sqlite_path(), "custom_demo.db")

    def test_db_config_detects_postgres_without_connection(self):
        with patch.dict(
            os.environ,
            {
                "AGENTICFLOW_DB_ENGINE": "postgres",
                "AGENTICFLOW_DATABASE_URL": "postgresql://agenticflow:secret@localhost:5432/agenticflow",
            },
            clear=True,
        ):
            importlib.reload(db_config)
            self.assertEqual(db_config.get_database_engine(), "postgres")
            self.assertEqual(db_config.get_database_url(), "postgresql://agenticflow:secret@localhost:5432/agenticflow")
            self.assertEqual(db_config.is_postgres_enabled(), True)

    def test_postgres_schema_and_migration_file_include_required_tables(self):
        migration_path = ROOT / "agenticflow/backend/migrations/001_initial_postgres_schema.sql"
        self.assertTrue(migration_path.exists())
        schema = get_postgres_schema_sql()
        self.assertEqual(POSTGRES_SCHEMA_SQL, schema)
        for table in [
            "users",
            "company_workspaces",
            "workspace_memberships",
            "package_runs",
            "project_level_package_runs",
            "approval_decisions",
            "audit_events",
            "model_role_audit_events",
            "exports",
        ]:
            self.assertIn(f"CREATE TABLE IF NOT EXISTS {table}", schema)
            self.assertIn(f"CREATE TABLE IF NOT EXISTS {table}", migration_path.read_text())
        for index_hint in ["workspace_id", "project_id", "package_run_id", "approval_status", "level"]:
            self.assertIn(index_hint, schema)

    def test_store_abstraction_and_sqlite_store_wrapper_exist(self):
        self.assertTrue(hasattr(GovernanceStore, "create_project"))
        with tempfile.TemporaryDirectory() as directory:
            with closing(create_sqlite_store(Path(directory) / "agenticflow.db")) as store:
                self.assertIsInstance(store, SQLiteGovernanceStore)
                self.assertIn("users", store.table_names())
                project = store.create_project({"id": "project-storage-test", "name": "Storage Test", "clientName": "Valor Struct"})
                self.assertEqual(project["id"], "project-storage-test")
                self.assertGreaterEqual(len(store.list_projects()), 1)

    def test_seed_demo_data_adds_workspace_users_and_demo_packages(self):
        with tempfile.TemporaryDirectory() as directory:
            with closing(GovernancePersistenceStore(Path(directory) / "agenticflow.db")) as store:
                seeded = seed_demo_data(store)
                emails = {user["email"] for user in seeded["users"]}
                self.assertIn("owner@valorstruct.local", emails)
                self.assertIn("admin@valorstruct.local", emails)
                self.assertIn("senior.engineer@valorstruct.local", emails)
                self.assertEqual(seeded["workspaces"][0]["workspaceId"], "valor-demo-workspace")
                self.assertEqual(seeded["packageRun"]["packageRun"]["id"], "package-run-bp-01-001")
                self.assertEqual([part["partId"] for part in seeded["projectLevelPackageRun"]["parts"]], ["BP-01", "BP-02", "BR-01"])

    def test_export_store_snapshot_and_json_include_governance_tables(self):
        with tempfile.TemporaryDirectory() as directory:
            with closing(GovernancePersistenceStore(Path(directory) / "agenticflow.db")) as store:
                seed_demo_data(store)
                snapshot = export_store_snapshot(store)
                snapshot_json = export_store_snapshot_json(store)
                parsed = json.loads(snapshot_json)

                for key in ["users", "workspaces", "package_runs", "audit_events", "exports"]:
                    self.assertIn(key, snapshot)
                    self.assertIn(key, parsed)
                    self.assertGreaterEqual(len(snapshot[key]), 1)
                self.assertIn("project_parts", snapshot)
                self.assertIn("project_level_package_runs", snapshot)
                self.assertIsInstance(snapshot_json, str)

    def test_admin_storage_helpers_require_owner_or_admin(self):
        owner_session = login(LoginRequest(email="owner@valorstruct.local", password="ValorDemo123!"))
        owner_auth = f"Bearer {owner_session['token']}"
        snapshot = get_admin_storage_snapshot(authorization=owner_auth)
        schema = get_admin_db_schema(authorization=owner_auth)
        self.assertEqual(snapshot["requestedBy"], "owner@valorstruct.local")
        self.assertIn("snapshot", snapshot)
        self.assertIn("postgresSchemaSql", schema)


if __name__ == "__main__":
    unittest.main()
