// Balance/Determinismus-Sanity-Tests für den Sim-Core.
// Schneller Unit-Lauf, keine LLM-Calls.

import { describe, it, expect } from "vitest";
import { quarterRng, quarterSeed } from "@/lib/game/rng";
import { clampLlmEffect, clampEventShape, enforceSegmentDemandBudget, EFFECT_CAPS } from "@/lib/game/WorldDirector";
import type { AiWorldEvent } from "@/services/LivingWorldService";

describe("rng determinism", () => {
  it("liefert für gleichen Seed identische Sequenz", () => {
    const a = quarterRng("user-1", 1985, 2, "sales");
    const b = quarterRng("user-1", 1985, 2, "sales");
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("unterschiedliche Salts → unterschiedliche Streams", () => {
    expect(quarterSeed("u", 1990, 1, "sales")).not.toBe(quarterSeed("u", 1990, 1, "events"));
  });
});

describe("LLM effect clamps (B1)", () => {
  it("preis-multiplier wird in [0.8, 1.2] gezwungen", () => {
    expect(clampLlmEffect({ price_multiplier: 5, demand_delta: 0, segments: ["all"] }).price_multiplier).toBe(EFFECT_CAPS.PRICE_MAX);
    expect(clampLlmEffect({ price_multiplier: 0.1, demand_delta: 0, segments: ["all"] }).price_multiplier).toBe(EFFECT_CAPS.PRICE_MIN);
  });

  it("demand_delta auf ±0.20 begrenzt", () => {
    expect(clampLlmEffect({ price_multiplier: 1, demand_delta: 0.9, segments: ["all"] }).demand_delta).toBeCloseTo(0.2);
    expect(clampLlmEffect({ price_multiplier: 1, demand_delta: -3, segments: ["all"] }).demand_delta).toBeCloseTo(-0.2);
  });

  it("invalides Segment wird durch 'all' ersetzt", () => {
    const e = clampLlmEffect({ price_multiplier: 1, demand_delta: 0, segments: ["pirates" as never] });
    expect(e.segments).toEqual(["all"]);
  });

  it("clampEventShape klemmt magnitude & duration", () => {
    const shaped = clampEventShape({ magnitude: 99, duration_quarters: 1000, applied_effects: { price_multiplier: 99, demand_delta: 0, segments: ["all"], effect_kind: "price_up", rationale: "" } });
    expect(shaped.magnitude).toBe(EFFECT_CAPS.MAGNITUDE_MAX);
    expect(shaped.duration_quarters).toBe(EFFECT_CAPS.MAX_DURATION_QUARTERS);
    expect(shaped.applied_effects?.price_multiplier).toBe(EFFECT_CAPS.PRICE_MAX);
  });

  it("enforceSegmentDemandBudget skaliert wenn ein Segment >0.20 Summe hat", () => {
    const mk = (d: number, segs: string[]): AiWorldEvent => ({
      id: "x", game_quarter: 1, game_year: 1983, category: "world",
      headline: "", body: "", affected_segments: segs as never, magnitude: 3,
      duration_quarters: 2, remaining_quarters: 2,
      applied_effects: { effect_kind: "demand_up", price_multiplier: 1, demand_delta: d, segments: segs as never, rationale: "" },
      created_at: "",
    });
    const evs = [mk(0.18, ["business"]), mk(0.18, ["business"])];
    const out = enforceSegmentDemandBudget(evs);
    const sum = out.reduce((a, e) => a + Math.abs(e.applied_effects.demand_delta), 0);
    expect(sum).toBeLessThanOrEqual(EFFECT_CAPS.DEMAND_DELTA_MAX_PER_SEGMENT + 1e-9);
  });
});
