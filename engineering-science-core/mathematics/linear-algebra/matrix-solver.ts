export type Matrix = number[][];

export interface LinearSystemResult {
  solution: number[];
  residuals: number[];
}

export function solveLinearSystem(matrix: Matrix, vector: number[]): LinearSystemResult {
  const n = matrix.length;
  const augmented = matrix.map((row, index) => [...row, vector[index]]);
  for (let pivot = 0; pivot < n; pivot += 1) {
    const pivotValue = augmented[pivot][pivot];
    if (Math.abs(pivotValue) < 1e-9) throw new Error('Matrix is singular or ill-conditioned.');
    for (let column = pivot; column <= n; column += 1) augmented[pivot][column] /= pivotValue;
    for (let row = 0; row < n; row += 1) {
      if (row === pivot) continue;
      const factor = augmented[row][pivot];
      for (let column = pivot; column <= n; column += 1) augmented[row][column] -= factor * augmented[pivot][column];
    }
  }
  const solution = augmented.map((row) => Number(row[n].toFixed(6)));
  const residuals = matrix.map((row, rowIndex) => Number((row.reduce((sum, value, column) => sum + value * solution[column], 0) - vector[rowIndex]).toFixed(6)));
  return { solution, residuals };
}
