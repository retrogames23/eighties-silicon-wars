// ============================================================================
// WorldDirector — Schnittstelle zwischen Sim-Core und narrativer LLM-Welt.
// ============================================================================
// Zwei Implementierungen:
//   - LiveWorldDirector      → ruft die "world-director" Edge Function (Produktion)
//   - ScriptedWorldDirector  → liest deterministische Fixture-Events (Headless-Tests, 0 LLM-Credits)
//
// Jeder Director liefert validierte/geclampte Events. Der Sim-Core kann nicht
// durch LLM-Halluzinationen aus dem Balance-Korsett gerissen werden.
// ============================================================================

import type { AiWorldEvent, AppliedEffect, EventCategory, Segment } from "@/services/LivingWorldService";

export interface WorldDirector {
  /** Liefert Events für (year, quarter). Best-effort, leeres Array bei Fehler. */
  generate(params: {
    userId: string;
    year: number;
    quarter: number;
    recentHeadlines?: string[];
  }): Promise<AiWorldEvent[]>;
}

// ============================================================================
// Hartes Effekt-Korsett — NICHT im LLM-Prompt, sondern im Code erzwungen.
// ============================================================================

export const EFFECT_CAPS = {
  /** price_multiplier pro Segment muss in [PRICE_MIN, PRICE_MAX] liegen. */
  PRICE_MIN: 0.8,
  PRICE_MAX: 1.2,
  /** Summe |demand_delta| über alle Events pro Quartal/Segment. */
  DEMAND_DELTA_MAX_PER_SEGMENT: 0.20,
  /** Max Magnitude eines Einzel-Events. */
  MAGNITUDE_MAX: 5,
  MAGNITUDE_MIN: 1,
  /** Max Events pro Quartal. */
  MAX_EVENTS_PER_QUARTER: 3,
  /** Max Quartale Wirkung eines Events. */
  MAX_DURATION_QUARTERS: 8,
} as const;

const VALID_CATEGORIES: EventCategory[] = ["tech", "market", "world", "competitor"];
const VALID_SEGMENTS: Segment[] = ["home", "business", "workstation", "gaming", "education", "all"];

/** Validiert + clampt einen LLM-Effekt. Gibt eine sichere Variante zurück. */
export function clampLlmEffect(raw: Partial<AppliedEffect>): AppliedEffect {
  const segments = (Array.isArray(raw.segments) ? raw.segments : ["all"])
    .filter((s): s is Segment => VALID_SEGMENTS.includes(s as Segment));
  const price = Number.isFinite(raw.price_multiplier) ? (raw.price_multiplier as number) : 1;
  const demand = Number.isFinite(raw.demand_delta) ? (raw.demand_delta as number) : 0;
  return {
    effect_kind: raw.effect_kind ?? "neutral_news",
    price_multiplier: clamp(price, EFFECT_CAPS.PRICE_MIN, EFFECT_CAPS.PRICE_MAX),
    demand_delta: clamp(demand, -EFFECT_CAPS.DEMAND_DELTA_MAX_PER_SEGMENT, EFFECT_CAPS.DEMAND_DELTA_MAX_PER_SEGMENT),
    segments: segments.length ? segments : ["all"],
    rationale: typeof raw.rationale === "string" ? raw.rationale.slice(0, 400) : "",
  };
}

/** Sicherheitsnetz für Event-Felder, das auch Magnitude/Dauer/Kategorie klemmt. */
export function clampEventShape<T extends Partial<AiWorldEvent>>(raw: T): T {
  const out = { ...raw };
  if (typeof out.magnitude === "number") {
    out.magnitude = Math.round(clamp(out.magnitude, EFFECT_CAPS.MAGNITUDE_MIN, EFFECT_CAPS.MAGNITUDE_MAX));
  }
  if (typeof out.duration_quarters === "number") {
    out.duration_quarters = Math.max(1, Math.min(EFFECT_CAPS.MAX_DURATION_QUARTERS, Math.round(out.duration_quarters)));
  }
  if (out.category && !VALID_CATEGORIES.includes(out.category)) out.category = "world";
  if (Array.isArray(out.affected_segments)) {
    out.affected_segments = out.affected_segments.filter((s): s is Segment => VALID_SEGMENTS.includes(s as Segment));
    if (out.affected_segments.length === 0) out.affected_segments = ["all"];
  }
  if (out.applied_effects) out.applied_effects = clampLlmEffect(out.applied_effects);
  return out;
}

/** Erzwingt das Segment-Demand-Cap über eine Event-Liste. */
export function enforceSegmentDemandBudget(events: AiWorldEvent[]): AiWorldEvent[] {
  const sums = new Map<Segment, number>();
  for (const ev of events) {
    const segs = ev.applied_effects?.segments ?? ["all"];
    const delta = Math.abs(ev.applied_effects?.demand_delta ?? 0);
    for (const s of segs) sums.set(s, (sums.get(s) ?? 0) + delta);
  }
  let scale = 1;
  for (const [, sum] of sums) {
    if (sum > EFFECT_CAPS.DEMAND_DELTA_MAX_PER_SEGMENT) {
      scale = Math.min(scale, EFFECT_CAPS.DEMAND_DELTA_MAX_PER_SEGMENT / sum);
    }
  }
  if (scale >= 1) return events;
  return events.map(ev => ({
    ...ev,
    applied_effects: ev.applied_effects
      ? { ...ev.applied_effects, demand_delta: ev.applied_effects.demand_delta * scale }
      : ev.applied_effects,
  }));
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ============================================================================
// Brücke LLM-Welt → Sim-Core: aktive (bereits geclampte) Events in Sim-Multiplikatoren.
// Rein deterministisch; Gesamtwirkung erneut hart begrenzt.
// ============================================================================
export type SimSegment = "gamer" | "business" | "workstation";

const SEGMENT_MAP: Record<Segment, SimSegment[]> = {
  home: ["gamer"],
  gaming: ["gamer"],
  education: ["gamer"],
  business: ["business"],
  workstation: ["workstation"],
  all: ["gamer", "business", "workstation"],
};

export function worldEventsToSimEffects(events: AiWorldEvent[]): {
  bomMultiplier: number;
  segmentDemandMultiplier: Record<SimSegment, number>;
} {
  const demand: Record<SimSegment, number> = { gamer: 0, business: 0, workstation: 0 };
  let price = 1;
  for (const ev of events) {
    if ((ev.remaining_quarters ?? 1) <= 0) continue;
    const fx = ev.applied_effects;
    if (!fx) continue;
    price *= fx.price_multiplier ?? 1;
    const raw = (fx.segments?.length ? fx.segments : ev.affected_segments?.length ? ev.affected_segments : ["all"]) as Segment[];
    const targets = new Set<SimSegment>();
    for (const s of raw) for (const t of SEGMENT_MAP[s] ?? []) targets.add(t);
    for (const t of targets) demand[t] += fx.demand_delta ?? 0;
  }
  const cap = EFFECT_CAPS.DEMAND_DELTA_MAX_PER_SEGMENT;
  return {
    bomMultiplier: clamp(price, EFFECT_CAPS.PRICE_MIN, EFFECT_CAPS.PRICE_MAX),
    segmentDemandMultiplier: {
      gamer: 1 + clamp(demand.gamer, -cap, cap),
      business: 1 + clamp(demand.business, -cap, cap),
      workstation: 1 + clamp(demand.workstation, -cap, cap),
    },
  };
}
