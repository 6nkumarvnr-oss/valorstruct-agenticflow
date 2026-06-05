import type { QuotationInput } from './QuotationInput.js';

export const sampleQuotationInput: QuotationInput = {
  projectName: 'Sample Steel Platform',
  clientName: 'ABC Contracting',
  location: 'Saudi Arabia',
  scopeDescription: 'Fabrication and installation of steel platform',
  currency: 'SAR',
  items: [
    {
      description: 'Steel fabrication',
      unit: 'kg',
      quantity: 1000,
      materialRate: 5,
      laborRate: 2,
    },
  ],
  overheadPercent: 10,
  profitPercent: 15,
  vatPercent: 15,
  simpleCalculation: {
    sectionName: 'IPE200',
    lengthM: 12,
    weightKgPerM: 22.4,
  },
};

export function validateQuotationInput(input: QuotationInput): void {
  if (!input.projectName || !input.clientName || !input.location || !input.scopeDescription) {
    throw new Error('Project, client, location, and scope are required.');
  }
  if (!input.items.length) {
    throw new Error('At least one BOQ item is required.');
  }
  for (const item of input.items) {
    if (item.quantity < 0 || item.materialRate < 0 || item.laborRate < 0) {
      throw new Error('Quantity and rates must be non-negative.');
    }
  }
}
