export interface EulerBucklingInput {
  elasticModulusMpa: number;
  inertiaMm4: number;
  effectiveLengthM: number;
  kFactor?: number;
}

export function calculateEulerBucklingLoad(input: EulerBucklingInput) {
  const effectiveLengthMm = (input.kFactor ?? 1) * input.effectiveLengthM * 1000;
  const criticalLoadN = (Math.PI ** 2 * input.elasticModulusMpa * input.inertiaMm4) / effectiveLengthMm ** 2;
  return { ...input, criticalLoadKn: Number((criticalLoadN / 1000).toFixed(2)) };
}
