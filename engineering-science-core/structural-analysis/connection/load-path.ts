export function distributeConnectionLoad(totalLoadKn: number, paths: Array<{ id: string; stiffness: number }>) {
  const stiffnessSum = paths.reduce((sum, path) => sum + path.stiffness, 0);
  return paths.map((path) => ({ id: path.id, loadKn: Number(((totalLoadKn * path.stiffness) / stiffnessSum).toFixed(6)) }));
}
