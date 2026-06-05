from __future__ import annotations

import os

DEFAULT_SQLITE_PATH = "agenticflow_demo.db"
DEFAULT_DATABASE_URL = "postgresql://user:password@localhost:5432/agenticflow"


def get_database_engine() -> str:
    """Return the configured database engine for the MVP data layer."""
    return os.getenv("AGENTICFLOW_DB_ENGINE", "sqlite").strip().lower() or "sqlite"


def get_sqlite_path() -> str:
    """Return the SQLite database path used for local/demo mode."""
    return os.getenv("AGENTICFLOW_SQLITE_PATH", DEFAULT_SQLITE_PATH)


def get_database_url() -> str:
    """Return the configured PostgreSQL database URL without opening a connection."""
    return os.getenv("AGENTICFLOW_DATABASE_URL", DEFAULT_DATABASE_URL)


def is_postgres_enabled() -> bool:
    """Detect PostgreSQL mode without requiring a live PostgreSQL server."""
    return get_database_engine() in {"postgres", "postgresql"}
