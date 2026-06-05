from __future__ import annotations

import os
import shutil


def resolve_node_command(command_name: str) -> str:
    """Resolve npm/npx command names across POSIX shells and Windows PowerShell."""
    if os.name == "nt":
        windows_command = shutil.which(f"{command_name}.cmd")
        if windows_command:
            return windows_command

    resolved = shutil.which(command_name)
    if resolved:
        return resolved

    return command_name
