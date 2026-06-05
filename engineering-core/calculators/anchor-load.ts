export interface AnchorLoadInput {
  factoredLoadKn: number;
  anchorCount: number;
  eccentricityFactor?: number;
}

export function calculateAnchorLoad(input: AnchorLoadInput) {
  const eccentricityFactor = input.eccentricityFactor ?? 1;
  const demandPerAnchorKn = (input.factoredLoadKn * eccentricityFactor) / input.anchorCount;
  return {
    ...input,
    eccentricityFactor,
    demandPerAnchorKn: Number(demandPerAnchorKn.toFixed(2)),
  };
}
