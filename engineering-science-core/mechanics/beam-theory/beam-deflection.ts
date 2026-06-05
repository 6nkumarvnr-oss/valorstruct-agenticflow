export interface SimplySupportedBeamInput {
  spanM: number;
  pointLoadKn: number;
  elasticModulusMpa: number;
  inertiaMm4: number;
}

export function calculateMidspanPointLoadDeflection(input: SimplySupportedBeamInput) {
  const loadN = input.pointLoadKn * 1000;
  const spanMm = input.spanM * 1000;
  const deflectionMm = (loadN * spanMm ** 3) / (48 * input.elasticModulusMpa * input.inertiaMm4);
  return { ...input, deflectionMm: Number(deflectionMm.toFixed(3)) };
}
