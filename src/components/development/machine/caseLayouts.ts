// Presentational layout data for the workbench stage.
// Maps each chassis to its closed/open artwork plus normalized (0..1) positions
// for the interactive part overlay. No game logic here.
import type { SlotType } from '../partTokens';

import beigeTower from '@/assets/workbench/case-beige-tower.png';
import blackDesktop from '@/assets/workbench/case-black-desktop.png';
import gamerRgb from '@/assets/workbench/case-gamer-rgb.png';
import retroWood from '@/assets/workbench/case-retro-wood.png';
import premiumMetal from '@/assets/workbench/case-premium-metal.png';
import compactMini from '@/assets/workbench/case-compact-mini.png';
import beigeBreadbox from '@/assets/workbench/case-beige-breadbox.png';
import beigePizzabox from '@/assets/workbench/case-beige-pizzabox.png';

import insideBeigeTower from '@/assets/workbench/inside-beige-tower.png';
import insideBlackDesktop from '@/assets/workbench/inside-black-desktop.png';
import insideGamerRgb from '@/assets/workbench/inside-gamer-rgb.png';
import insideRetroWood from '@/assets/workbench/inside-retro-wood.png';
import insidePremiumMetal from '@/assets/workbench/inside-premium-metal.png';
import insideCompactMini from '@/assets/workbench/inside-compact-mini.png';
import insideBeigeBreadbox from '@/assets/workbench/inside-beige-breadbox.png';
import insideBeigePizzabox from '@/assets/workbench/inside-beige-pizzabox.png';

export type OverlaySlot = Exclude<SlotType, 'case' | 'display'>;

export interface Point {
  /** Center X as a fraction of the stage width. */
  x: number;
  /** Center Y as a fraction of the stage height. */
  y: number;
}

export interface Rect extends Point {
  w: number;
  h: number;
}

export interface CaseLayout {
  closed: string;
  open: string;
  /** Screen area of the artwork (top-left based), used for the display overlay. */
  screen: Rect;
  /** Where each installed part snaps onto the visible mainboard. */
  slots: Record<OverlaySlot, Point>;
}

export const CASE_LAYOUTS: Record<string, CaseLayout> = {
  'beige-breadbox': {
    closed: beigeBreadbox,
    open: insideBeigeBreadbox,
    screen: { x: 0.4, y: 0.13, w: 0.28, h: 0.32 },
    slots: {
      cpu: { x: 0.38, y: 0.6 },
      memory: { x: 0.3, y: 0.55 },
      gpu: { x: 0.46, y: 0.66 },
      sound: { x: 0.52, y: 0.58 },
      storage: { x: 0.78, y: 0.68 },
    },
  },
  'beige-pizzabox': {
    closed: beigePizzabox,
    open: insideBeigePizzabox,
    screen: { x: 0.36, y: 0.15, w: 0.27, h: 0.32 },
    slots: {
      cpu: { x: 0.4, y: 0.58 },
      memory: { x: 0.34, y: 0.53 },
      gpu: { x: 0.72, y: 0.55 },
      sound: { x: 0.78, y: 0.6 },
      storage: { x: 0.58, y: 0.63 },
    },
  },
  'beige-tower': {
    closed: beigeTower,
    open: insideBeigeTower,
    screen: { x: 0.378, y: 0.14, w: 0.2, h: 0.23 },
    slots: {
      cpu: { x: 0.712, y: 0.672 },
      memory: { x: 0.745, y: 0.588 },
      gpu: { x: 0.795, y: 0.632 },
      sound: { x: 0.662, y: 0.706 },
      storage: { x: 0.53, y: 0.686 },
    },
  },
  'black-desktop': {
    closed: blackDesktop,
    open: insideBlackDesktop,
    screen: { x: 0.383, y: 0.167, w: 0.217, h: 0.27 },
    slots: {
      cpu: { x: 0.672, y: 0.652 },
      memory: { x: 0.752, y: 0.618 },
      gpu: { x: 0.802, y: 0.662 },
      sound: { x: 0.602, y: 0.702 },
      storage: { x: 0.44, y: 0.6 },
    },
  },
  'gamer-rgb': {
    closed: gamerRgb,
    open: insideGamerRgb,
    screen: { x: 0.183, y: 0.3, w: 0.283, h: 0.22 },
    slots: {
      cpu: { x: 0.722, y: 0.282 },
      memory: { x: 0.772, y: 0.322 },
      gpu: { x: 0.722, y: 0.382 },
      sound: { x: 0.682, y: 0.425 },
      storage: { x: 0.632, y: 0.47 },
    },
  },
  'retro-wood': {
    closed: retroWood,
    open: insideRetroWood,
    screen: { x: 0.417, y: 0.167, w: 0.225, h: 0.16 },
    slots: {
      cpu: { x: 0.452, y: 0.482 },
      memory: { x: 0.382, y: 0.522 },
      gpu: { x: 0.502, y: 0.552 },
      sound: { x: 0.555, y: 0.502 },
      storage: { x: 0.72, y: 0.552 },
    },
  },
  'premium-metal': {
    closed: premiumMetal,
    open: insidePremiumMetal,
    screen: { x: 0.49, y: 0.12, w: 0.33, h: 0.48 },
    slots: {
      cpu: { x: 0.332, y: 0.352 },
      memory: { x: 0.372, y: 0.312 },
      gpu: { x: 0.352, y: 0.442 },
      sound: { x: 0.322, y: 0.492 },
      storage: { x: 0.245, y: 0.285 },
    },
  },
  'compact-mini': {
    closed: compactMini,
    open: insideCompactMini,
    screen: { x: 0.375, y: 0.3, w: 0.16, h: 0.21 },
    slots: {
      cpu: { x: 0.642, y: 0.432 },
      memory: { x: 0.682, y: 0.402 },
      gpu: { x: 0.632, y: 0.492 },
      sound: { x: 0.602, y: 0.532 },
      storage: { x: 0.44, y: 0.62 },
    },
  },
};

export const OVERLAY_SLOTS: OverlaySlot[] = ['cpu', 'memory', 'gpu', 'sound', 'storage'];

export const layoutFor = (caseId?: string): CaseLayout =>
  CASE_LAYOUTS[caseId ?? ''] ?? CASE_LAYOUTS['beige-tower'];
