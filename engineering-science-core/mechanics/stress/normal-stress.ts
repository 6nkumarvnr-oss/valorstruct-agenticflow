export function calculateNormalStress(forceKn: number, areaMm2: number) {
  const stressMpa = (forceKn * 1000) / areaMm2;
  return { forceKn, areaMm2, stressMpa: Number(stressMpa.toFixed(6)) };
}
