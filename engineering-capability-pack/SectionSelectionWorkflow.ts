import { sectionCatalog } from '../engineering-core/sections/index.js';
import type { SectionProfile } from '../engineering-core/types.js';

export interface SectionSelectionInput {
  requiredWeightKgPerM?: number;
  minimumAreaCm2?: number;
  family?: SectionProfile['family'];
}

export function runSectionSelectionWorkflow(input: SectionSelectionInput) {
  const candidates = sectionCatalog
    .filter((section) => !input.family || section.family === input.family)
    .filter((section) => !input.requiredWeightKgPerM || section.weightKgPerM >= input.requiredWeightKgPerM)
    .filter((section) => !input.minimumAreaCm2 || section.areaCm2 >= input.minimumAreaCm2)
    .sort((a, b) => a.weightKgPerM - b.weightKgPerM);
  return {
    status: 'completed' as const,
    workflow: 'SectionSelectionWorkflow' as const,
    input,
    selectedSection: candidates[0],
    candidates,
  };
}
