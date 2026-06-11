// ============================================================================
// ScriptedWorldDirector — deterministischer Director für Headless-Balance-Tests.
// Liest Fixture-Events aus JSON, mappt Magnitude → Effekt (gleiche Tabelle wie
// LivingWorldService) und klemmt alles via clampEventShape/enforceSegmentDemandBudget.
// Kein LLM-Call, keine Netzwerk-Latenz, kostet 0 Credits.
// ============================================================================

import { readFileSync } from "node:fs";
import {
  type WorldDirector,
  EFFECT_CAPS,
  clampEventShape,
  enforceSegmentDemandBudget,
  clampLlmEffect,
} from "@/lib/game/WorldDirector";
import type { AiWorldEvent, AppliedEffect, EffectKind, EventCategory, Segment } from "@/services/LivingWorldService";

interface FixtureEvent {
  year: number;
  quarter: number;
  category: EventCategory;
  headline: string;
  body: string;
  affected_segments: Segment[];
  magnitude: number;
  duration_quarters: number;
  effect_kind: EffectKind;
  rationale: string;
}

const PRICE_DELTA: Record<number, number> = { 1: 0.02, 2: 0.05, 3: 0.08, 4: 0.12, 5: 0.18 };
const DEMAND_DELTA: Record<number, number> = { 1: 0.01, 2: 0.03, 3: 0.06, 4: 0.10, 5: 0.15 };

function magnitudeToEffect(ev: FixtureEvent): AppliedEffect {
  const m = Math.max(EFFECT_CAPS.MAGNITUDE_MIN, Math.min(EFFECT_CAPS.MAGNITUDE_MAX, Math.round(ev.magnitude)));
  const p = PRICE_DELTA[m] ?? 0;
  const d = DEMAND_DELTA[m] ?? 0;
  let price = 1, demand = 0;
  switch (ev.effect_kind) {
    case "price_up": price = 1 + p; break;
    case "price_down": price = 1 - p; break;
    case "demand_up": demand = +d; break;
    case "demand_down": demand = -d; break;
    case "tech_unlock": demand = +d * 0.5; price = 1 + p * 0.3; break;
    case "neutral_news": default: break;
  }
  return clampLlmEffect({
    effect_kind: ev.effect_kind,
    price_multiplier: price,
    demand_delta: demand,
    segments: ev.affected_segments,
    rationale: ev.rationale,
  });
}

export class ScriptedWorldDirector implements WorldDirector {
  private fixtures: FixtureEvent[];

  constructor(fixturePath: string) {
    const raw = readFileSync(fixturePath, "utf8");
    this.fixtures = JSON.parse(raw) as FixtureEvent[];
  }

  async generate({ userId, year, quarter }: { userId: string; year: number; quarter: number }): Promise<AiWorldEvent[]> {
    const fired = this.fixtures
      .filter(f => f.year === year && f.quarter === quarter)
      .slice(0, EFFECT_CAPS.MAX_EVENTS_PER_QUARTER);

    const events: AiWorldEvent[] = fired.map((f, idx) => {
      const shaped = clampEventShape<Partial<AiWorldEvent>>({
        id: `scripted-${userId}-${year}-${quarter}-${idx}`,
        game_quarter: quarter,
        game_year: year,
        category: f.category,
        headline: f.headline,
        body: f.body,
        affected_segments: f.affected_segments,
        magnitude: f.magnitude,
        duration_quarters: f.duration_quarters,
        remaining_quarters: f.duration_quarters,
        applied_effects: magnitudeToEffect(f),
        created_at: new Date(Date.UTC(year, (quarter - 1) * 3, 1)).toISOString(),
      });
      return shaped as AiWorldEvent;
    });

    return enforceSegmentDemandBudget(events);
  }
}
