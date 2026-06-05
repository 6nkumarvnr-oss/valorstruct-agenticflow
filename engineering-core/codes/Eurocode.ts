import type { EngineeringCodeProfile } from '../types.js';

export const Eurocode: EngineeringCodeProfile = {
  id: 'Eurocode',
  name: 'Eurocode structural design basis',
  jurisdiction: 'European Union / international projects',
  designBasis: 'EN-based structural checks for future governed validation workflows.',
  supportedChecks: ['code-check', 'design-check', 'anchor-load', 'plate-weight'],
};
