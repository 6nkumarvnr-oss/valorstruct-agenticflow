export function calculateKineticEnergy(massKg: number, velocityMps: number) {
  return { massKg, velocityMps, kineticEnergyJ: Number((0.5 * massKg * velocityMps ** 2).toFixed(6)) };
}
