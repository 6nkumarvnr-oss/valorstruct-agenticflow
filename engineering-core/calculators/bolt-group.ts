import { getBoltMaterial } from '../materials/bolts.js';

export interface BoltGroupInput {
  boltCount: number;
  boltDiameterMm: number;
  grade?: string;
  shearFactor?: number;
}

export function calculateBoltGroup(input: BoltGroupInput) {
  const material = getBoltMaterial(input.grade);
  const tensileStrengthMpa = material.tensileStrengthMpa ?? 800;
  const shearFactor = input.shearFactor ?? 0.6;
  const boltAreaMm2 = (Math.PI * input.boltDiameterMm ** 2) / 4;
  const singleBoltShearKn = (boltAreaMm2 * tensileStrengthMpa * shearFactor) / 1000;
  return {
    ...input,
    grade: material.grade,
    singleBoltShearKn: Number(singleBoltShearKn.toFixed(2)),
    groupShearKn: Number((singleBoltShearKn * input.boltCount).toFixed(2)),
  };
}
