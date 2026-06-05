from __future__ import annotations

import os
import unittest
from unittest.mock import patch

try:
    import command_utils
except ModuleNotFoundError:
    from tests import command_utils  # type: ignore[no-redef]

resolve_node_command = command_utils.resolve_node_command


class CommandUtilsTest(unittest.TestCase):
    def test_resolve_node_command_prefers_cmd_on_windows(self):
        with patch.object(command_utils.os, "name", "nt"), patch.object(command_utils.shutil, "which") as which:
            which.side_effect = lambda command: "C:/node/npm.cmd" if command == "npm.cmd" else "C:/node/npm"
            self.assertEqual(resolve_node_command("npm"), "C:/node/npm.cmd")

    def test_resolve_node_command_uses_regular_binary_on_posix(self):
        with patch.object(command_utils.os, "name", "posix"), patch.object(command_utils.shutil, "which") as which:
            which.side_effect = lambda command: "/usr/bin/npx" if command == "npx" else None
            self.assertEqual(resolve_node_command("npx"), "/usr/bin/npx")

    def test_resolve_node_command_falls_back_to_name(self):
        with patch.object(command_utils.os, "name", os.name), patch.object(command_utils.shutil, "which", return_value=None):
            self.assertEqual(resolve_node_command("npm"), "npm")


if __name__ == "__main__":
    unittest.main()
