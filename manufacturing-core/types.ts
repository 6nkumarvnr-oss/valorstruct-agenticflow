export type ManufacturingCurrency = 'SAR' | 'USD' | 'AED';

export interface PlateHoleInput {
  count: number;
  diameterMm: number;
}

export interface BasePlateManufacturingInput {
  partName: string;
  widthMm: number;
  lengthMm: number;
  thicknessMm: number;
  holes: PlateHoleInput;
  materialGrade: string;
  coatingSystem: string;
  currency?: ManufacturingCurrency;
}

export interface ManufacturingOperation {
  name: string;
  machine: string;
  laborHours: number;
  productionHours: number;
  notes: string;
}

export interface InspectionStep {
  name: string;
  acceptance: string;
}

export interface ManufacturingEstimate {
  status: 'completed';
  input: BasePlateManufacturingInput;
  material: { grade: string; densityKgPerM3: number; unitCostSarPerKg: number };
  weightKg: number;
  operations: ManufacturingOperation[];
  inspection: InspectionStep[];
  estimatedLaborHours: number;
  estimatedCostSar: number;
  estimatedProductionHours: number;
  warnings: string[];
}
