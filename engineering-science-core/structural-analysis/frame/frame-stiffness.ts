export function calculateAxialBarStiffness(elasticModulusMpa: number, areaMm2: number, lengthM: number) {
  const stiffnessNPerMm = (elasticModulusMpa * areaMm2) / (lengthM * 1000);
  return { elasticModulusMpa, areaMm2, lengthM, stiffnessNPerMm: Number(stiffnessNPerMm.toFixed(6)) };
}
