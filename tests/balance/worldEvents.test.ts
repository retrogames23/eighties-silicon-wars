import { describe, it, expect } from "vitest";
import { worldEventsToSimEffects } from "@/lib/game/WorldDirector";
import type { AiWorldEvent } from "@/services/LivingWorldService";

const ev = (segments: string[], demand: number, price = 1, remaining = 2) =>
  ({ id: "x", remaining_quarters: remaining, affected_segments: segments,
     applied_effects: { segments, demand_delta: demand, price_multiplier: price, effect_kind: "demand_up" } } as unknown as AiWorldEvent);

describe("world events feed the sales sim", () => {
  it("maps gaming demand to the gamer segment only", () => {
    const r = worldEventsToSimEffects([ev(["gaming"], 0.1)]);
    expect(r.segmentDemandMultiplier.gamer).toBeCloseTo(1.1);
    expect(r.segmentDemandMultiplier.business).toBe(1);
  });
  it("caps stacked demand at ±20%", () => {
    const r = worldEventsToSimEffects([ev(["all"], -0.15), ev(["business"], -0.15)]);
    expect(r.segmentDemandMultiplier.business).toBeCloseTo(0.8);
  });
  it("caps component price effect at 1.2", () => {
    expect(worldEventsToSimEffects([ev(["all"], 0, 1.15), ev(["all"], 0, 1.15)]).bomMultiplier).toBe(1.2);
  });
  it("ignores expired events", () => {
    expect(worldEventsToSimEffects([ev(["all"], 0.2, 1, 0)]).segmentDemandMultiplier.gamer).toBe(1);
  });
});
