import { runCodeValidationWorkflow } from './CodeValidationWorkflow.js';
import { runConnectionSizingWorkflow } from './ConnectionSizingWorkflow.js';
import { runMaterialTakeoffWorkflow } from './MaterialTakeoffWorkflow.js';
import { runPlateOptimizationWorkflow } from './PlateOptimizationWorkflow.js';
import { runSectionSelectionWorkflow } from './SectionSelectionWorkflow.js';
import { runSteelWeightWorkflow } from './SteelWeightWorkflow.js';
import { runSteelDesignWorkflow } from './steel-design-pack/runSteelDesignWorkflow.js';

export type EngineeringCapabilityWorkflowName =
  | 'SteelWeightWorkflow'
  | 'MaterialTakeoffWorkflow'
  | 'PlateOptimizationWorkflow'
  | 'SectionSelectionWorkflow'
  | 'ConnectionSizingWorkflow'
  | 'CodeValidationWorkflow'
  | 'SteelDesignWorkflow';

export interface EngineeringCapabilityWorkflowResult {
  status: 'completed';
  selectedWorkflow: EngineeringCapabilityWorkflowName;
  goal: string;
  governanceRequired: true;
  result: unknown;
}

function selectWorkflow(goal: string): EngineeringCapabilityWorkflowName {
  if (/steel design|member check|axial|bending|shear|deflection/i.test(goal)) return 'SteelDesignWorkflow';
  if (/takeoff|material|mto/i.test(goal)) return 'MaterialTakeoffWorkflow';
  if (/plate|optimization|optimisation/i.test(goal)) return 'PlateOptimizationWorkflow';
  if (/section|select|profile/i.test(goal)) return 'SectionSelectionWorkflow';
  if (/connection|bolt|anchor/i.test(goal)) return 'ConnectionSizingWorkflow';
  if (/code|validation|check/i.test(goal)) return 'CodeValidationWorkflow';
  return 'SteelWeightWorkflow';
}

export function runEngineeringCapabilityWorkflow(goal: string): EngineeringCapabilityWorkflowResult {
  const selectedWorkflow = selectWorkflow(goal);
  const resultByWorkflow = {
    SteelWeightWorkflow: () => runSteelWeightWorkflow({ sectionName: 'IPE200', lengthM: 12 }),
    MaterialTakeoffWorkflow: () => runMaterialTakeoffWorkflow({
      members: [{ sectionName: 'IPE200', lengthM: 12 }],
      plates: [{ widthMm: 200, lengthMm: 300, thicknessMm: 10, quantity: 2 }],
    }),
    PlateOptimizationWorkflow: () => runPlateOptimizationWorkflow({
      widthMm: 200,
      lengthMm: 300,
      thicknessMm: 10,
      quantity: 2,
      stockWidthMm: 1000,
      stockLengthMm: 2000,
    }),
    SectionSelectionWorkflow: () => runSectionSelectionWorkflow({ family: 'IPE', requiredWeightKgPerM: 20 }),
    ConnectionSizingWorkflow: () => runConnectionSizingWorkflow({
      shearDemandKn: 250,
      boltCount: 4,
      boltDiameterMm: 20,
      axialDemandKn: 240,
      anchorCount: 4,
    }),
    CodeValidationWorkflow: () => runCodeValidationWorkflow({
      codeId: 'SBC',
      checks: [{ label: 'Member axial', demand: 200, capacity: 300 }],
    }),
    SteelDesignWorkflow: () => runSteelDesignWorkflow(),
  } satisfies Record<EngineeringCapabilityWorkflowName, () => unknown>;

  return {
    status: 'completed',
    selectedWorkflow,
    goal,
    governanceRequired: true,
    result: resultByWorkflow[selectedWorkflow](),
  };
}
