export interface BisectionInput {
  fn: (x: number) => number;
  lower: number;
  upper: number;
  tolerance?: number;
  maxIterations?: number;
}

export function findRootBisection(input: BisectionInput) {
  let lower = input.lower;
  let upper = input.upper;
  const tolerance = input.tolerance ?? 1e-6;
  const maxIterations = input.maxIterations ?? 100;
  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const midpoint = (lower + upper) / 2;
    const value = input.fn(midpoint);
    if (Math.abs(value) <= tolerance || (upper - lower) / 2 <= tolerance) {
      return { root: Number(midpoint.toFixed(6)), iterations: iteration };
    }
    if (input.fn(lower) * value < 0) upper = midpoint;
    else lower = midpoint;
  }
  return { root: Number(((lower + upper) / 2).toFixed(6)), iterations: maxIterations };
}
