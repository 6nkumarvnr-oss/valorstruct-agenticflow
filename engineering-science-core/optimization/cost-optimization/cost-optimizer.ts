export interface CostOption { id: string; materialCost: number; fabricationCost: number; installationCost: number }

export function selectLowestCostOption(options: CostOption[]) {
  const ranked = options
    .map((option) => ({ ...option, totalCost: option.materialCost + option.fabricationCost + option.installationCost }))
    .sort((a, b) => a.totalCost - b.totalCost);
  return { selected: ranked[0], ranked };
}
