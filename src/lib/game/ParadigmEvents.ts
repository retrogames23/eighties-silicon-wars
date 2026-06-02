// Paradigm-Events: deterministische historische Markt-Schocks der 80er-Jahre.
// Wirken auf calculateSegmentAppeal & getSegmentMaxPrice. Keine Math.random —
// Events sind an (Jahr, Quartal) gebunden und damit reproduzierbar.

export type Segment = 'gamer' | 'business' | 'workstation';

export interface ParadigmEvent {
  id: string;
  startYear: number;
  startQuarter: number;
  endYear: number;
  endQuarter: number;
  /** Multiplikatoren auf Segment-Max-Price (Preis-Toleranz). */
  maxPriceMultiplier?: Partial<Record<Segment, number>>;
  /** Additiver Appeal-Boost/-Malus pro Segment (in Appeal-Punkten, vor Clamp). */
  appealDelta?: Partial<Record<Segment, number>>;
  /** Multiplikator auf Segment-Größe (Volumen). */
  segmentSizeMultiplier?: Partial<Record<Segment, number>>;
  /** Spezial-Flag: Modelle ohne ausreichend RAM/GPU verlieren Appeal (1989 GUI). */
  requireGui?: boolean;
}

// Historische Events — bewusst hart kodiert, keine RNG.
export const PARADIGM_EVENTS: ParadigmEvent[] = [
  {
    // Heimcomputer-Crash 1983/84 (Atari/Commodore Preisschlacht).
    id: 'home_computer_crash_1983',
    startYear: 1983, startQuarter: 3,
    endYear: 1984, endQuarter: 4,
    maxPriceMultiplier: { gamer: 0.7 },          // −30 % Preis-Toleranz
    segmentSizeMultiplier: { gamer: 1.15 },      // mehr Volumen, aber billiger
  },
  {
    // PC-Clones-Welle 1985–1987.
    id: 'pc_clones_wave_1985',
    startYear: 1985, startQuarter: 1,
    endYear: 1987, endQuarter: 4,
    segmentSizeMultiplier: { business: 1.5 },    // +50 % Volumen Business
    maxPriceMultiplier: { business: 0.85 },      // aber Preisdruck
  },
  {
    // GUI-Erwartung ab 1989 (Mac, Windows 2/3).
    id: 'gui_expectation_1989',
    startYear: 1989, startQuarter: 1,
    endYear: 1992, endQuarter: 4,
    appealDelta: { business: -8, workstation: -10 },
    requireGui: true,
  },
];

/** Liefert alle Events, die zu (year, quarter) aktiv sind. */
export function getActiveParadigmEvents(year: number, quarter: number): ParadigmEvent[] {
  const t = year * 4 + quarter;
  return PARADIGM_EVENTS.filter(e => {
    const start = e.startYear * 4 + e.startQuarter;
    const end = e.endYear * 4 + e.endQuarter;
    return t >= start && t <= end;
  });
}

/** Kombinierter Max-Price-Multiplikator pro Segment. */
export function getParadigmMaxPriceMultiplier(
  segment: Segment, year: number, quarter: number
): number {
  let m = 1;
  for (const ev of getActiveParadigmEvents(year, quarter)) {
    m *= ev.maxPriceMultiplier?.[segment] ?? 1;
  }
  return m;
}

/** Kombinierter Segment-Size-Multiplikator. */
export function getParadigmSegmentSizeMultiplier(
  segment: Segment, year: number, quarter: number
): number {
  let m = 1;
  for (const ev of getActiveParadigmEvents(year, quarter)) {
    m *= ev.segmentSizeMultiplier?.[segment] ?? 1;
  }
  return m;
}

/** Additiver Appeal-Delta (in Punkten). Inkl. GUI-Malus für RAM/GPU-arme Modelle. */
export function getParadigmAppealDelta(
  model: any, segment: Segment, year: number, quarter: number,
  modelRamPerf: number, modelGpuPerf: number
): number {
  let delta = 0;
  for (const ev of getActiveParadigmEvents(year, quarter)) {
    delta += ev.appealDelta?.[segment] ?? 0;
    // GUI-Anforderung: braucht ≥40 RAM-Perf UND ≥35 GPU-Perf.
    if (ev.requireGui && (modelRamPerf < 40 || modelGpuPerf < 35)) {
      delta -= 15;
    }
  }
  return delta;
}
