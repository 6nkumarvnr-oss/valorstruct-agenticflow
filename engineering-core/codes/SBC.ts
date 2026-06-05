import type { EngineeringCodeProfile } from '../types.js';

export const SBC: EngineeringCodeProfile = {
  id: 'SBC',
  name: 'Saudi Building Code',
  jurisdiction: 'Saudi Arabia',
  designBasis: 'Local Saudi code alignment for future governed engineering checks.',
  supportedChecks: ['code-check', 'design-check', 'member-weight', 'plate-weight'],
};
