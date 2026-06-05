import type { SectionProfile } from '../types.js';
import { HEA } from './HEA.js';
import { IPE } from './IPE.js';
import { RHS } from './RHS.js';
import { SHS } from './SHS.js';
import { W } from './W.js';

export const sectionCatalog: SectionProfile[] = [...SHS, ...RHS, ...IPE, ...HEA, ...W];

export function findSection(sectionName: string): SectionProfile | undefined {
  return sectionCatalog.find((section) => section.sectionName.toLowerCase() === sectionName.toLowerCase());
}
