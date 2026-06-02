// Budget Rules — V2.
//
// - Each area (development, research, marketing, support) has an independent budget.
// - Each area is *gated* by a matching staff role; without that role budget has no effect.
// - Soft cap scales with the SUM of role skill points (so growing the team really grows the cap).
// - Spending above the cap suffers diminishing returns (sqrt curve).
// - Personnel salaries are a separate line item, not part of these budgets.
// - Heuristics expose: recommended budget, utilization %, and how much extra effective spend
//   ONE additional hire would unlock — used by the advisor to push the player to scale the team.

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

// Effective $-throughput per "skill point" inside a role (per quarter).
// 50 skill ≈ a junior → 50 * 700 = 35k cap; two juniors ≈ 70k; one senior (85) ≈ 60k.
const CAP_PER_SKILL_POINT = 700;
// Assumed skill of a hypothetical new mid-level hire — used for "hireWouldUnlock" math.
const MEDIAN_NEW_HIRE_SKILL = 55;

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
  utilizationPct: number;    // currentBudget / cap, capped 999
  hireWouldUnlock: number;   // extra effective spend if one median hire joined this role
  saturation: "below" | "in-cap" | "saturated";
}

export interface BudgetSummary {
  areas: Record<BudgetArea, AreaState>;
  totalBudget: number;
  totalSalaries: number;
  totalOutflow: number; // budgets + salaries
}

function moraleMultiplier(avgMorale: number): number {
  if (avgMorale <= 0) return 1.0; // no team yet → don't penalize
  // 0 → 0.5, 50 → 0.85, 100 → 1.1 (linear)
  return Math.max(0.5, Math.min(1.1, 0.5 + (avgMorale / 100) * 0.6));
}

export function capForArea(area: BudgetArea, agg: StaffAggregate): number {
  const role = AREA_TO_ROLE[area];
  const sumSkill = agg.byRoleSumSkill?.[role] ?? 0;
  if (sumSkill <= 0) return 0;
  return Math.round(sumSkill * CAP_PER_SKILL_POINT * moraleMultiplier(agg.averageMorale));
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
 * Suggest sensible per-area budgets. Numbers scale with cash, revenue and team size,
 * so a growing company gets nudged toward bigger budgets (and bigger teams).
 */
export function recommendBudget(ctx: RecommendationContext): Budget {
  const { cash, lastQuarterRevenue, hasActiveModels, agg } = ctx;
  const safeCash = Math.max(0, cash);
  const cashShare = Math.round(safeCash * 0.05);
  const revenueFloor = Math.round(lastQuarterRevenue * 0.08);

  const baseSuggestion = Math.max(5_000, Math.min(cashShare, 80_000));

  // Pull recommendation toward the team's current cap, so adding people actually
  // shifts the advisor's idea of "sensible spend".
  const aimAtCap = (area: BudgetArea, share: number) => {
    const c = capForArea(area, agg);
    return Math.round(c * share);
  };

  const marketing = agg.byRole.marketer > 0
    ? clamp(
        Math.max(revenueFloor, aimAtCap("marketing", 0.9)),
        5_000,
        Math.min(safeCash * 0.15, 250_000),
      )
    : lastQuarterRevenue > 0
      ? clamp(revenueFloor, 5_000, Math.min(safeCash * 0.1, 200_000))
      : baseSuggestion;

  const development = hasActiveModels && agg.byRole.engineer > 0
    ? clamp(
        Math.max(Math.round(safeCash * 0.08), aimAtCap("development", 0.9)),
        10_000,
        200_000,
      )
    : hasActiveModels
      ? clamp(Math.round(safeCash * 0.08), 10_000, 150_000)
      : 0;

  const research = agg.byRole.researcher > 0
    ? clamp(
        Math.max(Math.round(safeCash * 0.03), aimAtCap("research", 0.8)),
        5_000,
        120_000,
      )
    : 0;

  const support = agg.byRole.support > 0 && lastQuarterRevenue > 0
    ? clamp(
        Math.max(Math.round(lastQuarterRevenue * 0.03), aimAtCap("support", 0.7)),
        3_000,
        80_000,
      )
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
  const moraleMul = moraleMultiplier(agg.averageMorale);
  (Object.keys(AREA_TO_ROLE) as BudgetArea[]).forEach(area => {
    const role = AREA_TO_ROLE[area];
    const headcountInRole = agg.byRole[role] ?? 0;
    const hasGate = headcountInRole > 0;
    const cap = capForArea(area, agg);
    const currentBudget = budget[area] ?? 0;
    const eff = effectiveSpend(currentBudget, cap, hasGate);
    const efficiencyPct = currentBudget > 0 ? Math.round((eff / currentBudget) * 100) : 0;
    const utilizationPct = cap > 0
      ? Math.min(999, Math.round((currentBudget / cap) * 100))
      : (currentBudget > 0 ? 999 : 0);
    // What would one extra median-skill hire unlock?
    const capWithHire = Math.round(
      ((agg.byRoleSumSkill?.[role] ?? 0) + MEDIAN_NEW_HIRE_SKILL) * CAP_PER_SKILL_POINT * moraleMul
    );
    const effWithHire = effectiveSpend(currentBudget, capWithHire, true);
    const hireWouldUnlock = Math.max(0, effWithHire - eff);
    const saturation: AreaState["saturation"] =
      !hasGate || currentBudget === 0 ? "below" :
      currentBudget <= cap ? "in-cap" : "saturated";
    areas[area] = {
      area, role, headcountInRole, hasGate, cap,
      recommended: recommended[area],
      currentBudget,
      effectiveSpend: eff,
      efficiencyPct,
      utilizationPct,
      hireWouldUnlock,
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

// ---------- Hiring recommendation ----------

export type HireReason = "gate" | "utilization" | "growth" | "multi-model" | "support-missing";

export interface HireSuggestion {
  role: StaffRole;
  reason: HireReason;
  priority: number;       // higher = more urgent
  /** Extra effective $ a median hire would unlock for the matching area (if applicable). */
  unlockEstimate: number;
}

export interface HiringContext {
  activeModelsCount: number;
  reputation?: number;
  competitorAvgMarketShare?: number;   // average share among AI competitors (0..100)
  ownMarketShare?: number;             // 0..100
}

export function recommendHiring(
  summary: BudgetSummary,
  agg: StaffAggregate,
  ctx: HiringContext,
): HireSuggestion[] {
  const out: HireSuggestion[] = [];

  // 1) Gate missing but money already budgeted there.
  (Object.keys(summary.areas) as BudgetArea[]).forEach(area => {
    const s = summary.areas[area];
    if (!s.hasGate && s.currentBudget > 0) {
      out.push({ role: s.role, reason: "gate", priority: 100, unlockEstimate: s.currentBudget });
    }
  });

  // 2) Near-cap utilization with meaningful unlock potential.
  (Object.keys(summary.areas) as BudgetArea[]).forEach(area => {
    const s = summary.areas[area];
    if (s.hasGate && s.utilizationPct >= 80 && s.hireWouldUnlock >= 10_000) {
      out.push({
        role: s.role,
        reason: "utilization",
        priority: 70 + Math.min(20, Math.round(s.hireWouldUnlock / 5_000)),
        unlockEstimate: s.hireWouldUnlock,
      });
    }
  });

  // 3) Many active models, too few engineers.
  if (ctx.activeModelsCount >= 2 && agg.byRole.engineer <= 1) {
    out.push({ role: "engineer", reason: "multi-model", priority: 85, unlockEstimate: 0 });
  }

  // 4) Reputation rutscht und kein Support-Team.
  if ((ctx.reputation ?? 100) < 55 && agg.byRole.support === 0) {
    out.push({ role: "support", reason: "support-missing", priority: 75, unlockEstimate: 0 });
  }

  // 5) Konkurrenz wächst stärker — eigener Marktanteil unter dem Schnitt.
  if (
    ctx.competitorAvgMarketShare != null &&
    ctx.ownMarketShare != null &&
    ctx.ownMarketShare + 1 < ctx.competitorAvgMarketShare &&
    agg.headcount < 4
  ) {
    // Empfehle die noch fehlende oder schwächste Rolle.
    const weakestRole: StaffRole = ((): StaffRole => {
      const order: StaffRole[] = ["engineer", "marketer", "support", "researcher"];
      return order.sort((a, b) => agg.byRole[a] - agg.byRole[b])[0];
    })();
    out.push({ role: weakestRole, reason: "growth", priority: 60, unlockEstimate: 0 });
  }

  // Deduplicate by (role, reason): keep highest priority.
  const seen = new Map<string, HireSuggestion>();
  for (const s of out) {
    const k = `${s.role}-${s.reason}`;
    const prev = seen.get(k);
    if (!prev || prev.priority < s.priority) seen.set(k, s);
  }
  return [...seen.values()].sort((a, b) => b.priority - a.priority);
}
