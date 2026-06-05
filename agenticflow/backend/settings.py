from __future__ import annotations

import os
from typing import Any

from .db_config import get_database_engine

DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://localhost:3000"
DEMO_AUTH_SECRET = "change-me-for-production"


def get_environment() -> str:
    return os.getenv("AGENTICFLOW_ENV", "development").strip().lower() or "development"


def is_demo_mode() -> bool:
    value = os.getenv("AGENTICFLOW_DEMO_MODE", "true").strip().lower()
    return value in {"1", "true", "yes", "on"}


def get_cors_origins() -> list[str]:
    raw = os.getenv("AGENTICFLOW_CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    return origins or DEFAULT_CORS_ORIGINS.split(",")


def get_log_level() -> str:
    return os.getenv("AGENTICFLOW_LOG_LEVEL", "INFO").strip().upper() or "INFO"


def get_auth_secret() -> str:
    return os.getenv("AGENTICFLOW_AUTH_SECRET", DEMO_AUTH_SECRET)


def validate_startup_settings() -> dict[str, Any]:
    """Return non-fatal startup warnings for deployment hardening checks."""
    environment = get_environment()
    database_engine = get_database_engine()
    demo_mode = is_demo_mode()
    auth_secret = get_auth_secret()
    warnings: list[str] = []

    if environment == "production" and auth_secret == DEMO_AUTH_SECRET:
        warnings.append("Production is using the demo auth secret; set AGENTICFLOW_AUTH_SECRET to a strong private value.")
    if environment == "production" and demo_mode:
        warnings.append("Production is running with AGENTICFLOW_DEMO_MODE=true; disable demo mode before production use.")
    if environment == "production" and database_engine == "sqlite":
        warnings.append("Production is using SQLite; PostgreSQL is recommended for production/SaaS deployments.")

    return {
        "environment": environment,
        "databaseEngine": database_engine,
        "demoMode": demo_mode,
        "corsOrigins": get_cors_origins(),
        "logLevel": get_log_level(),
        "warnings": warnings,
    }
