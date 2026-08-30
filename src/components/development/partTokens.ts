// Presentational token maps for the visual computer workbench.
// Colors are semantic CSS tokens defined in index.css (no hardcoded colors).
import type { HardwareComponent } from '@/utils/HardwareManager';

export type PartType = HardwareComponent['type'];
export type SlotType = PartType | 'case';

export const SLOT_ORDER: SlotType[] = ['cpu', 'gpu', 'memory', 'case', 'sound', 'storage', 'display'];

export const REQUIRED_SLOTS: SlotType[] = ['cpu', 'gpu', 'memory', 'case'];

export const slotColorVar: Record<SlotType, string> = {
  cpu: '--part-cpu',
  gpu: '--part-gpu',
  memory: '--part-memory',
  sound: '--part-sound',
  storage: '--part-storage',
  display: '--part-display',
  case: '--part-case',
};

export const slotColor = (slot: SlotType, alpha = 1) =>
  `hsl(var(${slotColorVar[slot]}) / ${alpha})`;

export const caseColorVar: Record<string, string> = {
  'beige-tower': '--case-beige',
  'black-desktop': '--case-black',
  'gamer-rgb': '--case-rgb',
  'retro-wood': '--case-wood',
  'premium-metal': '--case-metal',
  'compact-mini': '--case-mini',
};

export const caseColor = (caseId?: string, alpha = 1) =>
  `hsl(var(${caseColorVar[caseId ?? ''] ?? '--case-beige'}) / ${alpha})`;

export interface WorkbenchCase {
  id: string;
  name: string;
  type: 'gamer' | 'office';
  quality: number;
  design: number;
  price: number;
  description: string;
}
