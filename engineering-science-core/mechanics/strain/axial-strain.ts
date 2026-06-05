export function calculateAxialStrain(deltaLengthMm: number, originalLengthMm: number) {
  return { deltaLengthMm, originalLengthMm, strain: Number((deltaLengthMm / originalLengthMm).toFixed(8)) };
}
