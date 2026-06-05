export function numericalDerivative(fn: (x: number) => number, x: number, step = 1e-5): number {
  return Number(((fn(x + step) - fn(x - step)) / (2 * step)).toFixed(6));
}
