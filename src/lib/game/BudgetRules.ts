// Budget Rules — V1 of the new budget allocation system.
//
// - Each area (development, research, marketing, support) has an independent budget.
// - Each area is *gated* by a matching staff role; without that role budget has no effect.
// - Each area has a soft cap proportional to team size & skill.
// - Spending above the cap suffers diminishing returns (sqrt curve).
// - Personnel salaries are a separate line item, not part of these budgets.
// - A heuristic produces a "recommended" budget per area based on revenue and cash —
//   the advisor uses these numbers to nudge the player.

import type { StaffAggregate, StaffRole } from "@/services/StaffService";

export type BudgetArea = "marketing" | "development" | "research" | "support";

export interface Budget {
  marketing: number;
  development: number;
  research: number;
  support: number;
}

export const EMPTY_BUDGET: Budget = {
  marketing: 0,
  development: 0,
  research: 0,
  support: 0,
};

export const AREA_TO_ROLE: Record<BudgetArea, StaffRole> = {
  marketing: "marketer",
  development: "engineer",
  research: "researcher",
  support: "support",
};

// Base cap a single expert can effectively spend per quarter ($).
const BASE_CAP_PER_AREA = 50_000;

export interface AreaState {
  area: BudgetArea;
  role: StaffRole;
  headcountInRole: number;
  hasGate: boolean;          // true if at least one matching expert is hired
  cap: number;               // soft cap = where diminishing returns start
  recommended: number;       // suggested budget for this quarter
  currentBudget: number;
  effectiveSpend: number;    // budget converted into "useful" spend
  efficiencyPct: number;     // 0..100, share of currentBudget that's effective
  saturation: "below" | "in-cap" | "saturated";
}

export interface BudgetSummary {
  areas: Record<BudgetArea, AreaState>;
  totalBudget: number;
  totalSalaries: number;
  totalOutflow: number; // budgets + salaries
}

// avgSkillFactor: skill 50 ≈ 1.0, scales 0.6..1.4
function avgSkillFactor(avgSkillPct: number): number {
  return 0.6 + Math.max(0, Math.min(100, avgSkillPct)) / 100 * 0.8;
}

// Approx. avg skill for a role from aggregate bonus (4% bonus per 100 skill points, capped 40%).
// Inverse heuristic — good enough for cap sizing.
function approxAvgSkill(bonusPct: number, headcount: number): number {
  if (headcount === 0) return 0;
  // bonusPct ≈ min(40, (sumSkill/100)*4) → sumSkill ≈ bonusPct/4*100
  const sumSkill = (bonusPct / 4) * 100;
  return Math.min(100, sumSkill / headcount);
}

export function capForArea(area: BudgetArea, agg: StaffAggregate): number {
  const headcount = agg.byRole[AREA_TO_ROLE[area]] ?? 0;
  if (headcount === 0) return 0;
  const bonusPct =
    area === "marketing"   ? agg.marketerBonusPct :
    area === "development" ? agg.engineerBonusPct :
    area === "research"    ? agg.researcherBonusPct :
                             agg.supportBonusPct;
  const moraleMul = agg.averageMorale < 40 ? 0.6 : 1.0;
  const skillFactor = avgSkillFactor(approxAvgSkill(bonusPct, headcount));
  return Math.round(
    BASE_CAP_PER_AREA *
    (1 + 0.5 * (headcount - 1)) *
    skillFactor *
    moraleMul
  );
}

/**
 * Convert raw budget into effective spend.
 * - Without the team role gate: 0 (money still leaves the bank, but no effect).
 * - Below cap: 1:1.
 * - Above cap: sqrt diminishing returns on the excess.
 */
export function effectiveSpend(budget: number, cap: number, hasGate: boolean): number {
  if (!hasGate || budget <= 0 || cap <= 0) return 0;
  if (budget <= cap) return budget;
  const excess = budget - cap;
  return Math.round(cap + Math.sqrt(excess * cap));
}

export interface RecommendationContext {
  cash: number;
  lastQuarterRevenue: number;   // company revenue last quarter
  hasActiveModels: boolean;
  agg: StaffAggregate;
}

/**
 * Suggest sensible per-area budgets. Numbers are conservative defaults
 * — the player can always go higher.
 */
export function recommendBudget(ctx: RecommendationContext): Budget {
  const { cash, lastQuarterRevenue, hasActiveModels, agg } = ctx;
  const safeCash = Math.max(0, cash);
  const cashShare = Math.round(safeCash * 0.05); // up to 5% of cash per area as floor
  const revenueFloor = Math.round(lastQuarterRevenue * 0.08); // ~8% of last revenue

  const baseSuggestion = Math.max(5_000, Math.min(cashShare, 80_000));
  const marketing = lastQuarterRevenue > 0
    ? clamp(revenueFloor, 5_000, Math.min(safeCash * 0.1, 200_000))
    : baseSuggestion;

  const development = hasActiveModels
    ? clamp(Math.round(safeCash * 0.08), 10_000, 150_000)
    : 0;

  const research = agg.byRole.researcher > 0
    ? clamp(Math.round(safeCash * 0.03), 5_000, 80_000)
    : 0;

  const support = agg.byRole.support > 0 && lastQuarterRevenue > 0
    ? clamp(Math.round(lastQuarterRevenue * 0.03), 3_000, 60_000)
    : 0;

  return {
    marketing: roundTo(marketing, 1_000),
    development: roundTo(development, 1_000),
    research: roundTo(research, 1_000),
    support: roundTo(support, 1_000),
  };
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}
function roundTo(x: number, step: number): number {
  return Math.round(x / step) * step;
}

export function summarize(
  budget: Budget,
  agg: StaffAggregate,
  ctx: Omit<RecommendationContext, "agg">
): BudgetSummary {
  const recommended = recommendBudget({ ...ctx, agg });
  const areas = {} as Record<BudgetArea, AreaState>;
  (Object.keys(AREA_TO_ROLE) as BudgetArea[]).forEach(area => {
    const role = AREA_TO_ROLE[area];
    const headcountInRole = agg.byRole[role] ?? 0;
    const hasGate = headcountInRole > 0;
    const cap = capForArea(area, agg);
    const currentBudget = budget[area] ?? 0;
    const eff = effectiveSpend(currentBudget, cap, hasGate);
    const efficiencyPct = currentBudget > 0 ? Math.round((eff / currentBudget) * 100) : 0;
    const saturation: AreaState["saturation"] =
      !hasGate || currentBudget === 0 ? "below" :
      currentBudget <= cap ? "in-cap" : "saturated";
    areas[area] = {
      area, role, headcountInRole, hasGate, cap,
      recommended: recommended[area],
      currentBudget,
      effectiveSpend: eff,
      efficiencyPct,
      saturation,
    };
  });
  const totalBudget =
    budget.marketing + budget.development + budget.research + budget.support;
  return {
    areas,
    totalBudget,
    totalSalaries: agg.totalSalary,
    totalOutflow: totalBudget + agg.totalSalary,
  };
}
