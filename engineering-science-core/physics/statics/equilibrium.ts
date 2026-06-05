export interface Force2D { fx: number; fy: number; xM?: number; yM?: number }

export function checkForceEquilibrium(forces: Force2D[]) {
  const sumFx = forces.reduce((sum, force) => sum + force.fx, 0);
  const sumFy = forces.reduce((sum, force) => sum + force.fy, 0);
  const sumMoment = forces.reduce((sum, force) => sum + (force.xM ?? 0) * force.fy - (force.yM ?? 0) * force.fx, 0);
  return {
    sumFx: Number(sumFx.toFixed(6)),
    sumFy: Number(sumFy.toFixed(6)),
    sumMoment: Number(sumMoment.toFixed(6)),
    isBalanced: Math.abs(sumFx) < 1e-6 && Math.abs(sumFy) < 1e-6 && Math.abs(sumMoment) < 1e-6,
  };
}
