export type SteelDesignCodeProfile = 'AISC' | 'Eurocode' | 'SBC';

export interface SteelDesignInput {
  projectName: string;
  memberId: string;
  codeProfile: SteelDesignCodeProfile;
  materialGrade: string;
  sectionName: string;
  lengthM: number;
  effectiveLengthFactor: number;
  axialDemandKN: number;
  shearDemandKN: number;
  momentDemandKNm: number;
  deflectionDemandMm: number;
  deflectionLimitMm: number;
}
