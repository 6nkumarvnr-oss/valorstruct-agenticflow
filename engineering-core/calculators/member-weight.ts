import { findSection } from '../sections/index.js';

export interface MemberWeightInput {
  sectionName: string;
  lengthM: number;
  weightKgPerM?: number;
}

export interface MemberWeightResult {
  sectionName: string;
  lengthM: number;
  weightKgPerM: number;
  totalWeightKg: number;
}

export function calculateMemberWeight(input: MemberWeightInput): MemberWeightResult {
  const weightKgPerM = input.weightKgPerM ?? findSection(input.sectionName)?.weightKgPerM;
  if (!weightKgPerM) {
    throw new Error(`Missing weightKgPerM for section ${input.sectionName}.`);
  }
  return {
    sectionName: input.sectionName,
    lengthM: input.lengthM,
    weightKgPerM,
    totalWeightKg: Number((input.lengthM * weightKgPerM).toFixed(2)),
  };
}
