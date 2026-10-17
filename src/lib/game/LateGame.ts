// ============================================================================
// LateGame — Skalierungskosten, Marktdisruptionen/Preiskriege, Großprojekte.
//
// Rein deterministisch (keine RNG, kein LLM): wird identisch vom Live-Spiel
// (GameMechanics.processQuarterTurn) und vom Headless-Balance-Runner genutzt.
// Alle Texte laufen über i18n-Keys (namespace "lategame").
// ============================================================================

import { quarterIndex } from "@/lib/game/Difficulty";

export type Seg = "gamer" | "business" | "workstation";
const SEGS: Seg[] = ["gamer", "business", "workstation"];

const infl = (year: number) => Math.pow(1.03, Math.max(0, year - 1983));

// ---------------------------------------------------------------------------
// 1. Skalierungskosten
// ---------------------------------------------------------------------------

/** Wie viele Quartale ein verkauftes Gerät Garantie/Support erzeugt. */
export const WARRANTY_QUARTERS = 8;
/** Support-Budget pro Gerät der aktiven Basis für volle Abdeckung (1983er $). */
export const SUPPORT_PER_UNIT_FULL = 3;
/** Garantiekosten pro Gerät und Quartal: voll abgedeckt vs. unbetreut. */
export const WARRANTY_COST_COVERED = 1.5;
export const WARRANTY_COST_UNCOVERED = 10.5;
export const BUREAUCRACY_HEADCOUNT_FREE = 20;
export const BUREAUCRACY_REVENUE_FREE = 5_000_000;
export const PORTFOLIO_FREE_MODELS = 4;
export const PORTFOLIO_EXTRA_RATE = 0.08;

export interface ScaleCostInput {
  year: number;
  /** Absatz der letzten Quartale inkl. aktuellem (neueste zuletzt). */
  unitHistory: number[];
  supportBudget: number;
  employees: number;
  quarterRevenue: number;
  activeModels: number;
  /** Basis der Portfolio-Wartung (Bestandsposten), auf den der Zuschlag wirkt. */
  periodCostBase: number;
}

export interface ScaleCostResult {
  installedBase: number;
  supportCoverage: number; // 0..1
  warrantyCost: number;
  bureaucracyCost: number;
  portfolioComplexityCost: number;
  reputationDelta: number; // ≤ 0
}

export function computeScaleCosts(i: ScaleCostInput): ScaleCostResult {
  const f = infl(i.year);
  const installedBase = i.unitHistory.slice(-WARRANTY_QUARTERS).reduce((s, u) => s + Math.max(0, u), 0);
  const needed = installedBase * SUPPORT_PER_UNIT_FULL * f;
  const supportCoverage = needed <= 0 ? 1 : Math.max(0, Math.min(1, i.supportBudget / needed));
  // Unterdeckung wirkt überproportional (quadratisch).
  const gap = 1 - supportCoverage;
  const perUnit = (WARRANTY_COST_COVERED + (WARRANTY_COST_UNCOVERED - WARRANTY_COST_COVERED) * gap * gap) * f;
  const warrantyCost = Math.round(installedBase * perUnit);

  const extraHeads = Math.max(0, i.employees - BUREAUCRACY_HEADCOUNT_FREE);
  const extraRev = Math.max(0, i.quarterRevenue - BUREAUCRACY_REVENUE_FREE * f);
  // Progressiv: Kosten je Kopf wachsen mit der Größe, Umsatz-Overhead 1,5 %.
  const bureaucracyCost = Math.round(extraHeads * (2000 + extraHeads * 40) * f + extraRev * 0.015);

  const extraModels = Math.max(0, i.activeModels - PORTFOLIO_FREE_MODELS);
  const portfolioComplexityCost = Math.round(i.periodCostBase * PORTFOLIO_EXTRA_RATE * extraModels);

  // Bis −3 Reputation/Quartal bei massiver Unterdeckung und relevanter Basis.
  const reputationDelta = installedBase > 500 && supportCoverage < 0.5 ? -Math.round((0.5 - supportCoverage) * 6 * 10) / 10 : 0;

  return { installedBase, supportCoverage, warrantyCost, bureaucracyCost, portfolioComplexityCost, reputationDelta };
}

// ---------------------------------------------------------------------------
// 2. Disruptionen & Preiskriege
// ---------------------------------------------------------------------------

export interface Disruption {
  id: "macintosh" | "sixteenBit" | "ps2vga" | "multimedia";
  year: number;
  quarter: number;
  segment: Seg;
  /** Zusätzlicher KI-Druck im Segment (0..1), abklingend. */
  pressure: number;
  durationQ: number;
}

export const DISRUPTIONS: Disruption[] = [
  { id: "macintosh", year: 1984, quarter: 1, segment: "workstation", pressure: 0.25, durationQ: 4 },
  { id: "sixteenBit", year: 1985, quarter: 3, segment: "gamer", pressure: 0.25, durationQ: 5 },
  { id: "ps2vga", year: 1987, quarter: 2, segment: "business", pressure: 0.2, durationQ: 4 },
  { id: "multimedia", year: 1990, quarter: 2, segment: "gamer", pressure: 0.2, durationQ: 4 },
];

/** Ab diesem Spieler-Anteil (am Gesamtmarkt, %) startet ein Preiskrieg. */
export const PRICE_WAR_SHARE_THRESHOLD = 35;
export const PRICE_WAR_PRESSURE = 0.2;
export const PRICE_WAR_DURATION_Q = 3;

export interface PriceWar {
  firmId: string;
  segment: Seg;
  startIdx: number;
  endIdx: number;
}

const SEG_LEADER: Record<Seg, string> = { gamer: "commodore", business: "ibm", workstation: "apple" };

export interface MarketThreatState {
  /** Zusatzdruck je Segment für dieses Quartal. */
  pressure: Record<Seg, number>;
  activeDisruptions: Disruption["id"][];
  activePriceWars: PriceWar[];
}

export function computeMarketThreats(
  year: number,
  quarter: number,
  aiAggression: number,
  priceWars: PriceWar[],
  priceWarDampen: number,
): MarketThreatState {
  const now = quarterIndex(year, quarter);
  const pressure: Record<Seg, number> = { gamer: 0, business: 0, workstation: 0 };
  const activeDisruptions: Disruption["id"][] = [];
  if (aiAggression > 0) {
    for (const d of DISRUPTIONS) {
      const age = now - quarterIndex(d.year, d.quarter);
      if (age < 0 || age >= d.durationQ) continue;
      activeDisruptions.push(d.id);
      pressure[d.segment] += d.pressure * (1 - age / d.durationQ) * Math.min(1, aiAggression + 0.3);
    }
  }
  const activePriceWars = priceWars.filter(w => now >= w.startIdx && now <= w.endIdx);
  for (const w of activePriceWars) pressure[w.segment] += PRICE_WAR_PRESSURE * priceWarDampen;
  return { pressure, activeDisruptions, activePriceWars };
}

/**
 * Prüft nach dem Quartal, ob ein neuer Preiskrieg startet: Spieler dominiert
 * ein Segment (größter Absatz-Anteil) und hat Marktanteil ≥ Schwelle. Startet
 * mit einem Quartal Vorwarnung.
 */
export function maybeStartPriceWar(
  year: number,
  quarter: number,
  aiAggression: number,
  playerShare: number,
  segmentUnits: Record<Seg, number>,
  existing: PriceWar[],
): PriceWar | null {
  if (aiAggression <= 0 || playerShare < PRICE_WAR_SHARE_THRESHOLD) return null;
  const now = quarterIndex(year, quarter);
  // Cooldown: höchstens ein Preiskrieg alle 6 Quartale.
  if (existing.some(w => now - w.startIdx < 6)) return null;
  const seg = SEGS.reduce((a, b) => (segmentUnits[b] > segmentUnits[a] ? b : a), "gamer" as Seg);
  if (segmentUnits[seg] <= 0) return null;
  return { firmId: SEG_LEADER[seg], segment: seg, startIdx: now + 2, endIdx: now + 1 + PRICE_WAR_DURATION_Q };
}

export interface ThreatWarning {
  kind: "disruption" | "priceWar";
  id: string;
  segment: Seg;
  firmId?: string;
  quartersAhead: number;
}

/** Warnungen für die nächsten 1–2 Quartale (für den Berater). */
export function upcomingThreats(year: number, quarter: number, aiAggression: number, priceWars: PriceWar[]): ThreatWarning[] {
  if (aiAggression <= 0) return [];
  const now = quarterIndex(year, quarter);
  const out: ThreatWarning[] = [];
  for (const d of DISRUPTIONS) {
    const ahead = quarterIndex(d.year, d.quarter) - now;
    if (ahead >= 1 && ahead <= 2) out.push({ kind: "disruption", id: d.id, segment: d.segment, quartersAhead: ahead });
  }
  for (const w of priceWars) {
    const ahead = w.startIdx - now;
    if (ahead >= 1 && ahead <= 2) out.push({ kind: "priceWar", id: w.firmId, segment: w.segment, firmId: w.firmId, quartersAhead: ahead });
  }
  return out;
}

// ---------------------------------------------------------------------------
// 3. Großprojekte
// ---------------------------------------------------------------------------

export type MegaProjectId = "fab" | "os" | "distribution" | "risc";

export interface MegaProjectDef {
  id: MegaProjectId;
  cost: number;          // Gesamtkosten (nominal, wird über buildQuarters verteilt)
  buildQuarters: number;
  upkeep: number;        // pro Quartal nach Fertigstellung (1983er $)
  minYear: number;
  minResearchStaff: number;
}

export const MEGA_PROJECTS: MegaProjectDef[] = [
  { id: "distribution", cost: 4_000_000, buildQuarters: 2, upkeep: 100_000, minYear: 1985, minResearchStaff: 0 },
  { id: "os", cost: 5_000_000, buildQuarters: 4, upkeep: 150_000, minYear: 1986, minResearchStaff: 3 },
  { id: "fab", cost: 8_000_000, buildQuarters: 4, upkeep: 400_000, minYear: 1987, minResearchStaff: 2 },
  { id: "risc", cost: 12_000_000, buildQuarters: 6, upkeep: 250_000, minYear: 1988, minResearchStaff: 4 },
];

export interface MegaProjectState {
  status: "building" | "done";
  quartersDone: number;
}
export type MegaProjects = Partial<Record<MegaProjectId, MegaProjectState>>;

export interface MegaEffects {
  bomMultiplier: number;
  demandMultiplier: number;
  pressureMultiplier: number;
  priceWarDampen: number;
  licenseIncome: number;
  upkeep: number;
  /** Bau-Raten in diesem Quartal. */
  buildCost: number;
}

export function canStartProject(
  def: MegaProjectDef, year: number, cash: number, researchStaff: number, projects: MegaProjects,
): { ok: boolean; reason?: "year" | "cash" | "staff" | "active" } {
  if (projects[def.id]) return { ok: false, reason: "active" };
  if (year < def.minYear) return { ok: false, reason: "year" };
  if (researchStaff < def.minResearchStaff) return { ok: false, reason: "staff" };
  if (cash < def.cost / def.buildQuarters + 250_000) return { ok: false, reason: "cash" };
  return { ok: true };
}

/** Wendet ein Quartal an: Baufortschritt + Effekte fertiger Projekte. */
export function advanceMegaProjects(projects: MegaProjects, year: number, activeModels: number): { next: MegaProjects; effects: MegaEffects } {
  const f = infl(year);
  const e: MegaEffects = { bomMultiplier: 1, demandMultiplier: 1, pressureMultiplier: 1, priceWarDampen: 1, licenseIncome: 0, upkeep: 0, buildCost: 0 };
  const next: MegaProjects = {};
  for (const def of MEGA_PROJECTS) {
    const s = projects[def.id];
    if (!s) continue;
    if (s.status === "building") {
      e.buildCost += Math.round(def.cost / def.buildQuarters);
      const q = s.quartersDone + 1;
      next[def.id] = q >= def.buildQuarters ? { status: "done", quartersDone: q } : { status: "building", quartersDone: q };
      continue;
    }
    next[def.id] = s;
    e.upkeep += Math.round(def.upkeep * f);
    switch (def.id) {
      case "fab": e.bomMultiplier *= 0.8; break;
      case "os": e.demandMultiplier *= 1.15; e.licenseIncome += Math.round(350_000 * f); break;
      case "distribution": e.demandMultiplier *= 1.2; e.priceWarDampen *= 0.5; break;
      case "risc": e.demandMultiplier *= activeModels > 0 ? 1.15 : 1; e.pressureMultiplier *= 0.75; break;
    }
  }
  return { next, effects: e };
}
