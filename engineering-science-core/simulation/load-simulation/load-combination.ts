export interface LoadCase { name: string; valueKn: number; factor: number }

export function combineLoads(loads: LoadCase[]) {
  const factoredLoadKn = loads.reduce((sum, load) => sum + load.valueKn * load.factor, 0);
  return { factoredLoadKn: Number(factoredLoadKn.toFixed(3)), loads };
}
