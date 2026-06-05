export function calculateSingleDegreeNaturalFrequency(stiffnessNPerM: number, massKg: number) {
  const omegaRadPerSec = Math.sqrt(stiffnessNPerM / massKg);
  return { omegaRadPerSec: Number(omegaRadPerSec.toFixed(6)), frequencyHz: Number((omegaRadPerSec / (2 * Math.PI)).toFixed(6)) };
}
