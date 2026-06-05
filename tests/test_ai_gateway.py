import json
import subprocess
from pathlib import Path
import unittest
try:
    from command_utils import resolve_node_command
except ModuleNotFoundError:
    from tests.command_utils import resolve_node_command

ROOT = Path(__file__).resolve().parents[1]


class AIGatewayTest(unittest.TestCase):
    def test_patchd_uses_provider_agnostic_model_roles(self):
        subprocess.run([resolve_node_command("npx"), "tsc", "-p", "agenticflow/tsconfig.json"], cwd=ROOT, check=True, capture_output=True, text=True)
        output = subprocess.run(
            [
                "node",
                "--input-type=module",
                "-e",
                """
import { createGatewayRequest, patchDGatewayRoleMap, routeGatewayRequest } from './.tmp/agenticflow/ai-gateway/ModelRoleGateway.js';
const request = createGatewayRequest('PatchD StabilityEngine', 'classify_stability', { signalId: 'demo' });
const route = routeGatewayRequest(request);
console.log(JSON.stringify({ request, route, patchDGatewayRoleMap }));
""",
            ],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout
        result = json.loads(output)

        self.assertEqual(result["request"]["role"], "fast_low_cost_model")
        self.assertEqual(result["route"]["providerAgnostic"], True)
        self.assertEqual(result["route"]["selectionStage"], "Capability → AI Role → Gateway → Best Available Model")
        self.assertEqual(result["route"]["selectedModelRef"], "best_available_model")
        self.assertEqual(result["patchDGatewayRoleMap"]["stabilityEngine"], "fast_low_cost_model")
        self.assertEqual(result["patchDGatewayRoleMap"]["governancePolicy"], "policy_reasoning_model")
        self.assertEqual(result["patchDGatewayRoleMap"]["adaptivePolicy"], "reasoning_model")
        self.assertEqual(result["patchDGatewayRoleMap"]["metaGovernance"], "orchestration_model")

    def test_ai_gateway_docs_use_roles_not_provider_routing(self):
        gateway = (ROOT / "agenticflow/ai-gateway/README.md").read_text()
        architecture = (ROOT / "agenticflow/docs/valor-struct-ecosystem-architecture.md").read_text()
        gateway_section = architecture.split("## AI Gateway Strategy", 1)[1].split("## Engineering Knowledge Base", 1)[0]

        for role in [
            "fast_low_cost_model",
            "policy_reasoning_model",
            "engineering_reasoning_model",
            "orchestration_model",
            "local_private_model",
            "fallback_model",
        ]:
            self.assertIn(role, gateway)
            self.assertIn(role, gateway_section)

        for provider in ["Claude", "Gemini", "DeepSeek", "Qwen"]:
            self.assertNotIn(provider, gateway_section)


if __name__ == "__main__":
    unittest.main()
