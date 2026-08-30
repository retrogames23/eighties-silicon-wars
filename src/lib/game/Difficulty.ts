// ============================================================================
// Difficulty.ts — Single Source of Truth für Schwierigkeitsgrade.
//
// Eine Stufe ist ein reines Daten-Objekt mit allen Stellschrauben, die
// EconomyModel, GameMechanics, LoanService und der Headless-Balance-Runner
// gleichermaßen verwenden.
//
// Designprinzip: KEINE verstreuten `if (difficulty === 'hard')`-Abfragen im
// Code. Jeder Konsument liest die für ihn relevanten Felder aus dem Profil.
// ============================================================================

export type DifficultyId = "easy" | "normal" | "hard";

export interface DifficultyProfile {
  id: DifficultyId;
  /** Sichtbarer Name (DE — i18n übersetzt das im UI separat). */
  label: string;
  /** Kurzbeschreibung für die Auswahl-Karte. */
  tagline: string;

  // ----- Wirtschaft -----
  /** Startkapital in $. */
  startingCash: number;
  /** Multiplikator für Gehälter, Portfolio-Wartung, Overhead. */
  fixedCostMultiplier: number;
  /** Sättigungspunkt der Marketing-Wirkung (nominal $, vor Inflation). */
  marketingSaturationPoint: number;

  // ----- Risiko / Game Over -----
  /**
   * Cash-Schwelle für Bankrott (negativer Wert!). Erreicht der Spieler
   * dieses Cash-Level, wird je nach `bankruptcyMode` reagiert.
   */
  bankruptcyCashThreshold: number;
  /**
   *  - "game_over": sofortiges Spielende.
   *  - "emergency_loan_then_game_over": einmaliger Pflicht-Notkredit;
   *    bei erneutem Unterschreiten Game Over.
   */
  bankruptcyMode: "game_over" | "emergency_loan_then_game_over";
  /** Höhe des Notkredits (Mindestbetrag, nur bei emergency_loan_then_game_over). */
  emergencyLoanAmount: number;
  /**
   * Obergrenze des Notkredits. Der tatsächliche Betrag richtet sich nach dem
   * echten Loch (Fehlbetrag + Puffer), damit ein Notkredit nie in einen
   * garantierten Folge-Bankrott führt.
   */
  emergencyLoanMaxAmount: number;
  /** Jahres-Zinssatz des Notkredits (z. B. 0.12 = 12 %). */
  emergencyLoanInterest: number;
  /** Laufzeit des Notkredits in Quartalen. */
  emergencyLoanQuarters: number;
  /**
   * Zusätzliche Insolvenzprüfung auf die Nettoposition (Cash − Schulden).
   * Negativer Wert. Verhindert "technisch insolvent, aber Cash noch okay".
   */
  bankruptcyNetWorthThreshold: number;

  // ----- Welt / KI -----
  /** Maximaler KI-Druck pro Segment (0..1). 0 = keine KI-Konkurrenz. */
  aiPressureCeiling: number;
  /** KI-Druck zu Spielbeginn (0..1). Der Druck rampt bis zum Ceiling hoch. */
  aiPressureFloor: number;
  /** Takt, in dem jede Konkurrenzfirma ein neues Modell veröffentlicht (Quartale). */
  aiReleaseCadenceQuarters: number;
  /** Aggressivität der KI-Preise/Specs (1 = neutral). */
  aiAggression: number;
  /** Faktor für Stärke von Welt-Krisen (Rezession, RAM-Knappheit, …). */
  crisisMagnitudeMultiplier: number;
  /** Erwartete Pflicht-Schocks im 1983–1992-Bogen (informativ + Headless). */
  scheduledCrises: number;
  /** Fester Krisenkalender — Single Source für Live-Spiel UND Headless-Tests. */
  crisisCalendar: ScheduledCrisis[];

  // ----- Reputation -----
  /** Multiplikator für Reputations-Verlust bei Quartalsverlust. */
  reputationLossMultiplier: number;
}

/** Ein geplanter Weltschock (deterministisch, kein LLM). */
export interface ScheduledCrisis {
  /** i18n-Key-Suffix, z. B. "recession1985". */
  key: string;
  year: number;
  quarter: number;
  /** Dauer in Quartalen. */
  durationQuarters: number;
  /** Nachfrage-Delta pro Quartal (negativ = Einbruch), vor Magnitude-Skalierung. */
  demandDeltaPerQuarter: number;
  /** Optionaler BOM-Multiplikator (z. B. RAM-Knappheit 1.25). */
  bomMultiplier?: number;
}

const CRISES_EASY: ScheduledCrisis[] = [
  { key: "dip1985", year: 1985, quarter: 1, durationQuarters: 3, demandDeltaPerQuarter: -0.08 },
  { key: "ramShortage1988", year: 1988, quarter: 2, durationQuarters: 2, demandDeltaPerQuarter: 0, bomMultiplier: 1.10 },
  { key: "techShift1986", year: 1986, quarter: 1, durationQuarters: 4, demandDeltaPerQuarter: -0.05 },
  { key: "recession1990", year: 1990, quarter: 4, durationQuarters: 3, demandDeltaPerQuarter: -0.06 },
];

const CRISES_NORMAL: ScheduledCrisis[] = [
  { key: "recession1985", year: 1985, quarter: 1, durationQuarters: 4, demandDeltaPerQuarter: -0.15 },
  { key: "techShift1986", year: 1986, quarter: 1, durationQuarters: 6, demandDeltaPerQuarter: -0.10 },
  { key: "ramShortage1988", year: 1988, quarter: 2, durationQuarters: 3, demandDeltaPerQuarter: 0, bomMultiplier: 1.25 },
  { key: "priceWar1989", year: 1989, quarter: 2, durationQuarters: 3, demandDeltaPerQuarter: -0.08 },
  { key: "recession1990", year: 1990, quarter: 4, durationQuarters: 4, demandDeltaPerQuarter: -0.12 },
];

const CRISES_HARD: ScheduledCrisis[] = [
  { key: "priceWar1984", year: 1984, quarter: 3, durationQuarters: 3, demandDeltaPerQuarter: -0.10 },
  { key: "recession1985", year: 1985, quarter: 1, durationQuarters: 5, demandDeltaPerQuarter: -0.18 },
  { key: "techShift1986", year: 1986, quarter: 1, durationQuarters: 8, demandDeltaPerQuarter: -0.12 },
  { key: "ramShortage1988", year: 1988, quarter: 2, durationQuarters: 4, demandDeltaPerQuarter: 0, bomMultiplier: 1.45 },
  { key: "patentFight1989", year: 1989, quarter: 3, durationQuarters: 3, demandDeltaPerQuarter: -0.08 },
  { key: "recession1990", year: 1990, quarter: 4, durationQuarters: 5, demandDeltaPerQuarter: -0.20 },
  { key: "rateShock1991", year: 1991, quarter: 2, durationQuarters: 3, demandDeltaPerQuarter: -0.05, bomMultiplier: 1.20 },
];


export const DIFFICULTY_PROFILES: Record<DifficultyId, DifficultyProfile> = {
  easy: {
    id: "easy",
    label: "Leicht",
    tagline: "Entspannt aufbauen, jeder Fehler ist verzeihbar.",
    startingCash: 1_500_000,
    fixedCostMultiplier: 1.0,
    marketingSaturationPoint: 500_000,
    bankruptcyCashThreshold: -2_000_000,
    bankruptcyMode: "game_over",
    emergencyLoanAmount: 0,
    emergencyLoanInterest: 0,
    emergencyLoanQuarters: 0,
    aiPressureCeiling: 0,
    crisisMagnitudeMultiplier: 1.0,
    scheduledCrises: 4,
    reputationLossMultiplier: 1.0,
  },
  normal: {
    id: "normal",
    label: "Normal",
    tagline: "Klassische Marktwirtschaft mit echter Konkurrenz und einem Rettungsnetz.",
    startingCash: 1_000_000,
    fixedCostMultiplier: 1.10,
    marketingSaturationPoint: 400_000,
    bankruptcyCashThreshold: -1_000_000,
    bankruptcyMode: "emergency_loan_then_game_over",
    emergencyLoanAmount: 500_000,
    emergencyLoanInterest: 0.12,
    emergencyLoanQuarters: 8,
    aiPressureCeiling: 0.40,
    crisisMagnitudeMultiplier: 1.4,
    scheduledCrises: 5,
    reputationLossMultiplier: 1.5,
  },
  hard: {
    id: "hard",
    label: "Schwer",
    tagline: "Hardcore: wenig Kapital, harte KI, häufige Krisen, kein Rettungsnetz.",
    startingCash: 750_000,
    fixedCostMultiplier: 1.25,
    marketingSaturationPoint: 300_000,
    bankruptcyCashThreshold: -500_000,
    bankruptcyMode: "game_over",
    emergencyLoanAmount: 0,
    emergencyLoanInterest: 0,
    emergencyLoanQuarters: 0,
    aiPressureCeiling: 0.70,
    crisisMagnitudeMultiplier: 1.8,
    scheduledCrises: 7,
    reputationLossMultiplier: 2.0,
  },
};

export const DEFAULT_DIFFICULTY: DifficultyId = "normal";

/**
 * Liest ein Difficulty-Profil aus einem (möglicherweise alten) GameState.
 * Falls keine difficulty gesetzt ist (Legacy-Save), wird "easy" angenommen —
 * Legacy-Saves wurden mit den großzügigen Werten der alten Welt erstellt.
 */
export function getDifficultyFromGameState(gs: { difficulty?: DifficultyId } | undefined | null): DifficultyProfile {
  const id = gs?.difficulty ?? "easy";
  return DIFFICULTY_PROFILES[id] ?? DIFFICULTY_PROFILES.easy;
}
