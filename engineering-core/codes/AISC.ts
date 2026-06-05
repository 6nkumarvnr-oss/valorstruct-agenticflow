import type { EngineeringCodeProfile } from '../types.js';

export const AISC: EngineeringCodeProfile = {
  id: 'AISC',
  name: 'AISC Steel Construction Manual',
  jurisdiction: 'United States / international steel practice',
  designBasis: 'Steel member, connection, bolt, and plate checks for future expansion.',
  supportedChecks: ['code-check', 'design-check', 'bolt-group', 'member-weight'],
};
