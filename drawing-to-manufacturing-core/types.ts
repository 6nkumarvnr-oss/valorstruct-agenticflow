export interface CuttingListItem {
  itemNo: number;
  partId: string;
  material: string;
  shape: string;
  dimensions: string;
  quantity: number;
  cuttingMethod: 'plasma' | 'laser' | 'saw' | 'shear' | 'manual';
  estimatedCuttingTimeHr: number;
  warnings: string[];
}

export interface DrillingScheduleItem {
  itemNo: number;
  partId: string;
  holeType: string;
  holeDiameterMm: number;
  quantity: number;
  drillingMethod: 'drill_press' | 'magnetic_drill' | 'cnc_drill' | 'manual';
  estimatedDrillingTimeHr: number;
  warnings: string[];
}

export interface WeldScheduleItem {
  itemNo: number;
  partId: string;
  weldType: 'fillet' | 'groove' | 'plug' | 'spot' | 'unknown';
  weldSizeMm: number;
  weldLengthM: number;
  process: 'SMAW' | 'GMAW' | 'FCAW' | 'SAW' | 'unknown';
  estimatedWeldingTimeHr: number;
  warnings: string[];
}

export interface CoatingScheduleItem {
  itemNo: number;
  partId: string;
  coatingSystem: string;
  areaM2: number;
  preparation: string;
  estimatedCoatingTimeHr: number;
  warnings: string[];
}

export interface ManufacturingInspectionItem {
  itemNo: number;
  partId: string;
  inspectionType: string;
  acceptanceCriteria: string;
  holdPoint: boolean;
}

export interface ProductionRouteStep {
  stepNo: number;
  operation: string;
  station: string;
  estimatedTimeHr: number;
  dependsOn?: number[];
  qualityHoldPoint: boolean;
}

export interface DrawingManufacturingPackage {
  source: 'drawing_note' | 'shop_drawing_assistant' | 'drawing_to_boq';
  partId: string;
  cuttingList: CuttingListItem[];
  drillingSchedule: DrillingScheduleItem[];
  weldSchedule: WeldScheduleItem[];
  coatingSchedule: CoatingScheduleItem[];
  inspectionPlan: ManufacturingInspectionItem[];
  productionRoute: ProductionRouteStep[];
  totalEstimatedLaborHr: number;
  totalEstimatedProductionHr: number;
  warnings: string[];
  generatedAt: string;
}
