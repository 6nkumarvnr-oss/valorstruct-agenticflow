from __future__ import annotations

import logging


def configure_logging(level: str = "INFO") -> None:
    normalized = (level or "INFO").upper()
    numeric_level = getattr(logging, normalized, logging.INFO)
    logging.basicConfig(
        level=numeric_level,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
    logging.getLogger("agenticflow").setLevel(numeric_level)
