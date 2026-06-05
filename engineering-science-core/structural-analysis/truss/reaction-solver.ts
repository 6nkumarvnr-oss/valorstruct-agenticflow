export interface VerticalPointLoad { xM: number; loadKn: number }

export function solveSimplySupportedReactions(spanM: number, loads: VerticalPointLoad[]) {
  const totalLoadKn = loads.reduce((sum, load) => sum + load.loadKn, 0);
  const momentAboutLeftKnM = loads.reduce((sum, load) => sum + load.loadKn * load.xM, 0);
  const rightReactionKn = momentAboutLeftKnM / spanM;
  const leftReactionKn = totalLoadKn - rightReactionKn;
  return { leftReactionKn: Number(leftReactionKn.toFixed(3)), rightReactionKn: Number(rightReactionKn.toFixed(3)), totalLoadKn };
}
