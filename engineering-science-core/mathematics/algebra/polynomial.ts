export function evaluatePolynomial(coefficients: number[], x: number): number {
  return Number(coefficients.reduce((sum, coefficient, power) => sum + coefficient * x ** power, 0).toFixed(6));
}
