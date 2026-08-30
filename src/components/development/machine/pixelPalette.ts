// Palette helpers for the 16-bit pixel machine preview.
// Every color is derived from semantic tokens in index.css — no hardcoded colors.
import { caseColorVar, slotColorVar, type SlotType } from '../partTokens';

const base = (cssVar: string, alpha = 1) => `hsl(var(${cssVar}) / ${alpha})`;

/** Mix a token color towards white (amount > 0) or black (amount < 0). */
export const tone = (color: string, amount: number) => {
  if (amount === 0) return color;
  const target = amount > 0 ? 'white' : 'black';
  const pct = Math.min(90, Math.round(Math.abs(amount) * 100));
  return `color-mix(in srgb, ${color} ${100 - pct}%, ${target})`;
};

export interface Shades {
  light: string;
  bright: string;
  bases: string;
  dark: string;
  deep: string;
}

const shadesFrom = (color: string): Shades => ({
  bright: tone(color, 0.42),
  light: tone(color, 0.2),
  bases: color,
  dark: tone(color, -0.25),
  deep: tone(color, -0.5),
});

export const partShades = (slot: SlotType): Shades => shadesFrom(base(slotColorVar[slot]));

export const caseShades = (caseId?: string): Shades =>
  shadesFrom(base(caseColorVar[caseId ?? ''] ?? '--case-beige'));

export const pcb = {
  board: base('--pcb'),
  boardDark: tone(base('--pcb'), -0.3),
  trace: base('--pcb-trace'),
  pad: base('--pcb-pad'),
};

export const screen = {
  phosphor: base('--screen-phosphor'),
  glow: base('--screen-phosphor', 0.35),
  off: tone(base('--pcb'), -0.55),
};

export const led = {
  on: base('--neon-green'),
  rgb: base('--neon-magenta'),
  cyan: base('--neon-cyan'),
};

/** Map a sprite matrix character set to concrete colors. */
export const spriteColors = (s: Shades, extra: Record<string, string> = {}) => ({
  L: s.bright,
  l: s.light,
  B: s.bases,
  D: s.dark,
  K: s.deep,
  P: pcb.pad,
  ...extra,
});
