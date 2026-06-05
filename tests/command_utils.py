from __future__ import annotations

import os
import shutil


def resolve_node_command(command_name: str) -> list[str]:
    """Return a subprocess argv prefix for local Node package commands.

    Windows resolves npm/npx through .cmd shims. Returning an argv prefix keeps
    tests shell-free while allowing callers to append package-script arguments.
    """
    executable = shutil.which(command_name) or command_name
    if os.name == "nt" and executable.lower().endswith((".cmd", ".bat")):
        return ["cmd.exe", "/d", "/s", "/c", executable]
    return [executable]
