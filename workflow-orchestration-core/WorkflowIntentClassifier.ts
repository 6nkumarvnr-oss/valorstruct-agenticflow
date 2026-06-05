export interface WorkflowIntent {
  name: 'fabrication-quotation-package' | 'general-workflow';
  subject: string;
  confidence: number;
  request: string;
  includeShopDrawingAssistant: boolean;
  includeDrawingBOQExtractor: boolean;
  includeDrawingManufacturingPackage: boolean;
}

export function requestIncludesShopDrawingTerms(request: string): boolean {
  return /shop drawing|drawing notes|fabrication notes|hole schedule|weld notes/i.test(request);
}

export function requestIncludesDrawingBOQTerms(request: string): boolean {
  return /\bBOQ\b|quantity|takeoff|drawing to BOQ|material takeoff|drawing quantity/i.test(request);
}

export function requestIncludesDrawingManufacturingTerms(request: string): boolean {
  return /manufacturing package|production package|cutting list|drilling schedule|weld schedule|coating schedule|production route|fabrication package/i.test(request);
}

export function classifyWorkflowIntent(request: string): WorkflowIntent {
  const normalized = request.toLowerCase();
  const includeDrawingManufacturingPackage = requestIncludesDrawingManufacturingTerms(request);
  const includeDrawingBOQExtractor = requestIncludesDrawingBOQTerms(request) || includeDrawingManufacturingPackage;
  const includeShopDrawingAssistant = requestIncludesShopDrawingTerms(request) || includeDrawingBOQExtractor;
  if (/fabrication|quotation|package|bp-?01|base plate/.test(normalized) || includeShopDrawingAssistant || includeDrawingBOQExtractor) {
    return { name: 'fabrication-quotation-package', subject: /bp-?01/i.test(request) ? 'BP-01' : 'BP-01', confidence: 0.92, request, includeShopDrawingAssistant, includeDrawingBOQExtractor, includeDrawingManufacturingPackage };
  }
  return { name: 'general-workflow', subject: 'demo-capability', confidence: 0.5, request, includeShopDrawingAssistant, includeDrawingBOQExtractor, includeDrawingManufacturingPackage };
}
