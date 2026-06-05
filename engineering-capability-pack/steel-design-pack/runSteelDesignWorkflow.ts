import { getSteelMaterial } from '../../engineering-core/materials/steel.js';
import { findSection } from '../../engineering-core/sections/index.js';
import { runAxialCompressionCheck } from './AxialCompressionCheck.js';
import { runAxialTensionCheck } from './AxialTensionCheck.js';
import { runBendingCheck } from './BendingCheck.js';
import { runDeflectionCheck } from './DeflectionCheck.js';
import { generateSteelDesignReport } from './SteelDesignReport.js';
import type { SteelDesignInput } from './SteelDesignInput.js';
import { runShearCheck } from './ShearCheck.js';
import { summarizeUtilization } from './UtilizationSummary.js';
import type { SteelDesignContext, UtilizationSummaryResult } from './types.js';

export interface SteelDesignWorkflowResult {
  status: 'completed';
  preliminary: true;
  input: SteelDesignInput;
  context: SteelDesignContext;
  summary: UtilizationSummaryResult;
  reportMarkdown: string;
}

export const sampleSteelDesignInput: SteelDesignInput = {
  projectName: 'Sample Canopy Member Check',
  memberId: 'B1',
  codeProfile: 'SBC',
  materialGrade: 'S355',
  sectionName: 'IPE200',
  lengthM: 6,
  effectiveLengthFactor: 1,
  axialDemandKN: -120,
  shearDemandKN: 45,
  momentDemandKNm: 25,
  deflectionDemandMm: 12,
  deflectionLimitMm: 20,
};

function estimateSectionModulusMm3(areaMm2: number, sectionName: string): number {
  const familyFactor = sectionName.startsWith('IPE') || sectionName.startsWith('HEA') || sectionName.startsWith('W') ? 90 : 55;
  return areaMm2 * familyFactor;
}

function buildContext(input: SteelDesignInput): SteelDesignContext {
  const section = findSection(input.sectionName);
  const material = getSteelMaterial(input.materialGrade);
  const warnings: string[] = [];
  if (!section) warnings.push(`Section ${input.sectionName} was not found; fallback IPE200 properties were used.`);
  if (material.grade !== input.materialGrade) warnings.push(`Material ${input.materialGrade} was not found; fallback ${material.grade} was used.`);
  if (!input.deflectionDemandMm) warnings.push('Deflection demand was not provided; simple estimated deflection was used.');
  if (!input.deflectionLimitMm) warnings.push('Deflection limit is missing or zero; check will fail until a limit is provided.');
  const areaMm2 = (section?.areaCm2 ?? 28.5) * 100;
  const estimatedSectionModulusMm3 = estimateSectionModulusMm3(areaMm2, section?.sectionName ?? input.sectionName);
  return {
    input,
    areaMm2,
    yieldStrengthMpa: material.yieldStrengthMpa ?? 275,
    estimatedInertiaMm4: estimatedSectionModulusMm3 * 100,
    estimatedSectionModulusMm3,
    warnings,
  };
}

export function runSteelDesignWorkflow(input: SteelDesignInput = sampleSteelDesignInput): SteelDesignWorkflowResult {
  const context = buildContext(input);
  const checks = [
    runAxialTensionCheck(context),
    runAxialCompressionCheck(context),
    runBendingCheck(context),
    runShearCheck(context),
    runDeflectionCheck(context),
  ];
  const summary = summarizeUtilization(checks);
  const reportMarkdown = generateSteelDesignReport(input, context, summary);
  return { status: 'completed', preliminary: true, input, context, summary, reportMarkdown };
}
