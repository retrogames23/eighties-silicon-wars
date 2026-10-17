import { describe, it, expect } from "vitest";
import { computeScaleCosts, maybeStartPriceWar, canStartProject, advanceMegaProjects, MEGA_PROJECTS, upcomingThreats } from "@/lib/game/LateGame";

const base = { year: 1983, unitHistory: [1000], supportBudget: 0, employees: 10, quarterRevenue: 0, activeModels: 1, periodCostBase: 100_000 };

describe("LateGame rules", () => {
  it("unsupported installed base costs far more warranty than a covered one", () => {
    const none = computeScaleCosts(base);
    const full = computeScaleCosts({ ...base, supportBudget: 3000 });
    expect(none.warrantyCost).toBe(10_500);
    expect(full.warrantyCost).toBe(1_500);
  });
  it("no bureaucracy cost up to 20 employees", () => {
    expect(computeScaleCosts({ ...base, employees: 20 }).bureaucracyCost).toBe(0);
    expect(computeScaleCosts({ ...base, employees: 21 }).bureaucracyCost).toBeGreaterThan(0);
  });
  it("each model beyond 4 adds 8% of period costs", () => {
    expect(computeScaleCosts({ ...base, activeModels: 5 }).portfolioComplexityCost).toBe(8_000);
  });
  it("price war only starts at 35% market share", () => {
    const seg = { gamer: 100, business: 0, workstation: 0 };
    expect(maybeStartPriceWar(1986, 1, 1, 34, seg, [])).toBeNull();
    expect(maybeStartPriceWar(1986, 1, 1, 35, seg, [])?.firmId).toBe("commodore");
  });
  it("advisor warns 1-2 quarters before the Macintosh disruption", () => {
    expect(upcomingThreats(1983, 3, 1, []).some(t => t.id === "macintosh")).toBe(true);
    expect(upcomingThreats(1983, 3, 0, [])).toHaveLength(0);
  });
  it("chip factory unlocks 1987 and cuts component costs by 20% when done", () => {
    const fab = MEGA_PROJECTS.find(p => p.id === "fab")!;
    expect(canStartProject(fab, 1986, 1e8, 10, {}).reason).toBe("year");
    expect(canStartProject(fab, 1987, 1e8, 10, {}).ok).toBe(true);
    const r = advanceMegaProjects({ fab: { status: "done", quartersDone: 4 } }, 1983, 1);
    expect(r.effects.bomMultiplier).toBeCloseTo(0.8);
  });
});
