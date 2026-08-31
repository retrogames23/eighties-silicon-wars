// Runden-Bereitschaftsprüfung ("Readiness Check").
//
// Reine Funktion — keine Spiellogik, keine Ökonomie: prüft nur, ob der Spieler
// vor dem Rundenabschluss offensichtliche Anfängerfehler macht. In der Lernphase
// (erste 4 Quartale) blockieren fundamentale Lücken den Rundenwechsel,
// danach sind es nur noch Warnungen.

import type { Budget, BudgetArea } from "@/lib/game/BudgetRules";
import { AREA_TO_ROLE } from "@/lib/game/BudgetRules";
import type { StaffRole } from "@/services/StaffService";

export type ReadinessSeverity = "blocker" | "warning";

/** Ziel-Tab im Dashboard, zu dem der Hinweis springen kann. */
export type ReadinessTab = "account" | "development" | "market" | "management" | "financing";

export interface ReadinessIssue {
  id: string;
  severity: ReadinessSeverity;
  /** i18n-Key (Namespace advisor), z.B. "companion.readiness.issues.noStaff". */
  i18nKey: string;
  params?: Record<string, string | number>;
  tab: ReadinessTab;
}

export interface TurnReadinessInput {
  year: number;
  quarter: number;
  /** Startjahr der Partie (Standard 1983). */
  startYear?: number;
  startQuarter?: number;
  budget: Budget;
  models: Array<{ status?: string }>;
  cash: number;
  /** Erwartete Quartalskosten (Budgets + Gehälter). */
  quarterlyOutflow?: number;
  headcount: number;
  byRole: Record<StaffRole, number>;
}

export interface TurnReadinessResult {
  blockers: ReadinessIssue[];
  warnings: ReadinessIssue[];
  /** true, solange die Lernphase läuft (erste 4 Quartale). */
  learningPhase: boolean;
  hasIssues: boolean;
}

const LEARNING_PHASE_QUARTERS = 4;

const AREA_TAB: Record<BudgetArea, ReadinessTab> = {
  marketing: "account",
  development: "account",
  research: "account",
  support: "account",
};

function elapsedQuarters(input: TurnReadinessInput): number {
  const sy = input.startYear ?? 1983;
  const sq = input.startQuarter ?? 1;
  return (input.year - sy) * 4 + (input.quarter - sq);
}

export function evaluateTurnReadiness(input: TurnReadinessInput): TurnReadinessResult {
  const learningPhase = elapsedQuarters(input) < LEARNING_PHASE_QUARTERS;
  const issues: ReadinessIssue[] = [];

  const push = (
    id: string,
    severity: ReadinessSeverity,
    tab: ReadinessTab,
    params?: Record<string, string | number>,
  ) => {
    issues.push({
      id,
      // Nach der Lernphase werden Blocker zu Warnungen.
      severity: severity === "blocker" && !learningPhase ? "warning" : severity,
      i18nKey: `companion.readiness.issues.${id}`,
      params,
      tab,
    });
  };

  const models = input.models ?? [];
  const inDevelopment = models.filter((m) => m.status === "development").length;
  const released = models.filter((m) => m.status === "released").length;

  // --- Fundamentale Lücken (in der Lernphase blockierend) ---
  if (input.headcount <= 0) {
    push("noStaff", "blocker", "management");
  }
  if (inDevelopment === 0 && released === 0) {
    push("noModel", "blocker", "development");
  }

  // --- Warnungen ---
  if (released > 0 && (input.budget.marketing ?? 0) <= 0) {
    push("noMarketingBudget", "warning", "account");
  }
  if (inDevelopment > 0 && (input.budget.development ?? 0) <= 0) {
    push("noDevelopmentBudget", "warning", "account");
  }

  (Object.keys(AREA_TO_ROLE) as BudgetArea[]).forEach((area) => {
    const spend = (input.budget as Record<string, number | undefined>)[area] ?? 0;
    const role = AREA_TO_ROLE[area];
    if (spend > 0 && (input.byRole?.[role] ?? 0) === 0) {
      push(`missingRole.${area}`, "warning", AREA_TAB[area], { area, role });
    }
  });

  if (released > 0 && (input.byRole?.support ?? 0) === 0 && (input.budget.support ?? 0) <= 0) {
    push("noSupport", "warning", "management");
  }

  const outflow = input.quarterlyOutflow ?? 0;
  if (outflow > 0 && input.cash < outflow) {
    push("cashTight", "warning", "financing");
  }

  const blockers = issues.filter((i) => i.severity === "blocker");
  const warnings = issues.filter((i) => i.severity === "warning");

  return {
    blockers,
    warnings,
    learningPhase,
    hasIssues: issues.length > 0,
  };
}
