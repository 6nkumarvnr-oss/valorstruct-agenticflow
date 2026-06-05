export interface MemberCandidate { sectionName: string; capacityKn: number; weightKgPerM: number; costPerM: number }

export function selectLightestPassingMember(candidates: MemberCandidate[], demandKn: number) {
  const passing = candidates.filter((candidate) => candidate.capacityKn >= demandKn).sort((a, b) => a.weightKgPerM - b.weightKgPerM);
  return { demandKn, selected: passing[0], candidates: passing };
}
