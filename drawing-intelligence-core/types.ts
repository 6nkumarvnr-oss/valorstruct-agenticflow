export type DrawingShapeType = 'Plate' | 'SHS' | 'RHS' | 'CHS' | 'Angle' | 'Channel' | 'I-Beam' | 'Unknown';

export interface DrawingDimensions {
  widthMm?: number;
  lengthMm?: number;
  thicknessMm?: number;
  depthMm?: number;
  flangeWidthMm?: number;
  diameterMm?: number;
}

export interface DrawingSection {
  family: DrawingShapeType;
  designation: string;
  dimensions: DrawingDimensions;
}

export interface DrawingHole {
  count: number;
  diameterMm: number;
  label: string;
}

export interface DrawingWeld {
  type: 'fillet' | 'butt' | 'unknown';
  sizeMm?: number;
  note: string;
}

export interface DrawingMetadataResult {
  drawingNo?: string;
  revision?: string;
  title?: string;
  partMark?: string;
  materialGrade?: string;
  lengthM?: number;
  quantity?: number;
  rawNotes: string;
}

export interface DrawingPartHandoffs {
  manufacturingInput?: {
    partName: string;
    widthMm: number;
    lengthMm: number;
    thicknessMm: number;
    holes: { count: number; diameterMm: number };
    materialGrade: string;
    coatingSystem: string;
    currency: 'SAR';
  };
  steelDesignInputSeed?: {
    sectionName: string;
    materialGrade: string;
    codeProfile: 'SBC';
  };
  quotationItemSeed?: {
    description: string;
    unit: string;
    quantity: number;
  };
}

export interface DrawingPartObject {
  id: string;
  partMark?: string;
  shapeType: DrawingShapeType;
  description: string;
  dimensions: DrawingDimensions;
  section?: DrawingSection;
  holes: DrawingHole[];
  welds: DrawingWeld[];
  materialGrade?: string;
  lengthM?: number;
  quantity?: number;
  metadata: DrawingMetadataResult;
  handoffs: DrawingPartHandoffs;
  warnings: string[];
}
