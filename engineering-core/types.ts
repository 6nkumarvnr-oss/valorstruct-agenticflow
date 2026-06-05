export type EngineeringCodeId = 'SBC' | 'AISC' | 'Eurocode';

export interface EngineeringCodeProfile {
  id: EngineeringCodeId;
  name: string;
  jurisdiction: string;
  designBasis: string;
  supportedChecks: string[];
}

export interface MaterialProfile {
  id: string;
  name: string;
  grade: string;
  densityKgPerM3?: number;
  yieldStrengthMpa?: number;
  tensileStrengthMpa?: number;
  compressiveStrengthMpa?: number;
  notes: string;
}

export interface SectionProfile {
  sectionName: string;
  family: 'SHS' | 'RHS' | 'IPE' | 'HEA' | 'W';
  areaCm2: number;
  weightKgPerM: number;
}

export interface ValidationResult {
  status: 'pass' | 'review' | 'fail';
  message: string;
  utilisation?: number;
}
