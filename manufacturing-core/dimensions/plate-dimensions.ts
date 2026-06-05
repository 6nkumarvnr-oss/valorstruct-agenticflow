export function calculatePlateVolumeM3(widthMm: number, lengthMm: number, thicknessMm: number): number {
  return (widthMm * lengthMm * thicknessMm) / 1_000_000_000;
}

export function validatePlateDimensions(widthMm: number, lengthMm: number, thicknessMm: number): string[] {
  const warnings: string[] = [];
  if (widthMm <= 0 || lengthMm <= 0 || thicknessMm <= 0) warnings.push('Plate dimensions must be positive.');
  if (thicknessMm < 6) warnings.push('Plate thickness is below common structural base-plate practice; review manually.');
  return warnings;
}
