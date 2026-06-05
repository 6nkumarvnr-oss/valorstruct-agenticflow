from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class EcosystemDocsTest(unittest.TestCase):
    def test_end_state_architecture_documents_novelty_and_gateway(self):
        doc = (ROOT / "agenticflow/docs/valor-struct-ecosystem-architecture.md").read_text(encoding="utf-8")

        self.assertIn("governance-driven agentic operating system", doc.lower())
        self.assertIn("AI Gateway", doc)
        self.assertIn("Engineering Knowledge Base", doc)
        self.assertIn("Digital Marketing AI", doc)
        self.assertIn("Business Consultant AI", doc)

    def test_commercial_roadmap_defers_business_and_marketing_modules(self):
        roadmap = (ROOT / "agenticflow/docs/commercial-roadmap.md").read_text(encoding="utf-8")
        next_stage = (ROOT / "agenticflow/docs/next-stage-plan.md").read_text(encoding="utf-8")

        self.assertIn("Valor Struct Business Growth AI for Engineering Companies", roadmap)
        self.assertIn("Business Consultant AI and Digital Marketing AI should be Phase 2 commercial modules", roadmap)
        self.assertIn("Digital Marketing AI and Business Consultant AI should become revenue modules", next_stage)

    def test_five_layer_ai_organism_architecture_note(self):
        doc_path = ROOT / "agenticflow/docs/five-layer-ai-organism.md"
        self.assertTrue(doc_path.exists())
        doc = doc_path.read_text(encoding="utf-8")

        for required in [
            "Valor Struct Five-Layer AI Organism Architecture",
            "PatchD — Governance",
            "P-Agent — Execution",
            "Workflow Orchestration — Multi-step coordination",
            "AI Gateway — Model-role routing",
            "Capability Packs — Domain specialists",
            "Valor Struct is not an LLM",
            "Specialists are governed capability specialists, not fixed AI model names.",
            "1. PatchD Governance Organ",
            "5. Capability Packs / Domain Specialists",
            "Specialists = Governed Capability Specialists",
            "Not every specialist is an LLM. Some are deterministic engineering engines.",
        ]:
            self.assertIn(required, doc)

        for role in [
            "fast_low_cost_model",
            "policy_reasoning_model",
            "reasoning_model",
            "engineering_reasoning_model",
            "orchestration_model",
            "code_generation_model",
            "local_private_model",
            "fallback_model",
        ]:
            self.assertIn(role, doc)

        forbidden_fixed_mappings = [
            "Claude Haiku → Stability Engine",
            "GPT-mini → Policy Engine",
            "Claude Sonnet → Planner",
            "Claude Opus → Orchestration",
            "GPT-5.2 → Engineering Math",
            "GPT-5.5 / Codex → App Factory",
        ]
        for mapping in forbidden_fixed_mappings:
            self.assertNotIn(mapping, doc)

    def test_docs_standardize_five_layer_provider_agnostic_language(self):
        docs = [
            ROOT / "README.md",
            ROOT / "agenticflow/README.md",
            ROOT / "agenticflow/docs/valor-struct-ecosystem-architecture.md",
            ROOT / "agenticflow/docs/next-stage-plan.md",
            ROOT / "agenticflow/docs/commercial-roadmap.md",
            ROOT / "agenticflow/ai-gateway/README.md",
            ROOT / "workflow-orchestration-core/README.md",
            ROOT / "knowledge-graph/README.md",
        ]
        combined = "\n".join(path.read_text(encoding="utf-8") for path in docs)

        root_readme = (ROOT / "README.md").read_text(encoding="utf-8")
        architecture = (ROOT / "agenticflow/docs/valor-struct-ecosystem-architecture.md").read_text(encoding="utf-8")
        gateway = (ROOT / "agenticflow/ai-gateway/README.md").read_text(encoding="utf-8")

        self.assertIn("five-layer", root_readme.lower())
        self.assertIn("provider-agnostic AI Gateway", root_readme)
        self.assertIn("Valor Struct is not an LLM", root_readme)

        self.assertIn("Valor Struct is not an LLM", combined)
        self.assertIn("PatchD — Governance", combined)
        self.assertIn("AI Gateway — Model-role routing", combined)
        self.assertIn("Governed Capability Specialists", combined)
        for required_architecture_text in [
            "PatchD Governance Organ",
            "P-Agent Execution Organ",
            "Workflow Orchestration Core",
            "AI Gateway + Capability Registry",
            "Governed Capability Specialists",
        ]:
            self.assertIn(required_architecture_text, architecture)

        for gateway_text in [
            "Capabilities do not call providers directly.",
            "Capabilities request an AI role.",
            "The AI Gateway selects the best available model based on role, cost, risk, privacy, and fallback policy.",
            "Provider/model names are hidden from capability code.",
            "Capability Request",
            "Audit / Evaluation Store",
        ]:
            self.assertIn(gateway_text, gateway)

        self.assertNotIn("Specialists = AI Model Packs", combined)
        self.assertIn("Specialists = Governed Capability Specialists", combined)

        for mapping in [
            "Claude Haiku → Stability Engine",
            "GPT-mini → Policy Engine",
            "Claude Sonnet → Planner",
            "Claude Opus → Orchestration",
            "GPT-5.2 → Engineering Math",
            "GPT-5.5 / Codex → App Factory",
        ]:
            self.assertNotIn(mapping, combined)


if __name__ == "__main__":
    unittest.main()
