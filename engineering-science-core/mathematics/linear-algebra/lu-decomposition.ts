import type { Matrix } from './matrix-solver.js';

export function luDecomposition(matrix: Matrix): { lower: Matrix; upper: Matrix } {
  const n = matrix.length;
  const lower: Matrix = Array.from({ length: n }, () => Array(n).fill(0));
  const upper: Matrix = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i += 1) {
    for (let k = i; k < n; k += 1) upper[i][k] = matrix[i][k] - Array.from({ length: i }, (_, j) => lower[i][j] * upper[j][k]).reduce((a, b) => a + b, 0);
    for (let k = i; k < n; k += 1) lower[k][i] = i === k ? 1 : (matrix[k][i] - Array.from({ length: i }, (_, j) => lower[k][j] * upper[j][i]).reduce((a, b) => a + b, 0)) / upper[i][i];
  }
  return { lower, upper };
}
