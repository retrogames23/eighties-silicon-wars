// ============================================================================
// CompetitorAI — deterministische Konkurrenz-Simulation.
//
// Ersetzt die alte, eingefrorene INITIAL_COMPETITORS-Liste: Jede Firma hat ein
// echtes Produktportfolio, veröffentlicht im Takt neue Modelle, altert und
// wächst technologisch mit dem Markt. Alles rein deterministisch aus
// (Jahr, Quartal, Difficulty-Profil) ableitbar — kein RNG, kein LLM, damit
// Headless-Balance-Tests exakt dasselbe Verhalten sehen wie das echte Spiel.
// ============================================================================

import type { Competitor } from "@/lib/game/GameMechanics";
import type { DifficultyProfile } from "@/lib/game/Difficulty";
import { quarterIndex } from "@/lib/game/Difficulty";

export type RivalSegment = "gamer" | "business" | "workstation";

export interface RivalModel {
  name: string;
  price: number;
  performance: number;
  segment: RivalSegment;
  releaseYear: number;
  releaseQuarter: number;
  /** Geschätzte Quartalsstückzahl — nur für Marktanteils-Normalisierung. */
  unitsSold: number;
}

export interface RivalFirm {
  id: string;
  name: string;
  segment: RivalSegment;
  reputation: number;
  marketShare: number;
  models: RivalModel[];
}

interface FirmBlueprint {
  id: string;
  name: string;
  segment: RivalSegment;
  /** Preisanker des ersten Modells (1983er Dollar). */
  priceAnchor: number;
  /** Performance des ersten Modells. */
  perfBase: number;
  /** Performance-Zuwachs je Produktgeneration. */
  perfStep: number;
  /** Offset im Release-Takt (Quartale), damit nicht alle gleichzeitig launchen. */
  cadenceOffset: number;
  reputation: number;
  baseShare: number;
  /** Modellnamen-Serie. */
  series: string;
  /** Quartals-Absatz einer frischen Generation (für Marktanteils-Gewichtung). */
  baseUnits: number;
}

const FIRMS: FirmBlueprint[] = [
  {
    id: "apple", name: "Apple Computer", segment: "workstation",
    priceAnchor: 1395, perfBase: 65, perfStep: 11, cadenceOffset: 2,
    reputation: 80, baseShare: 22, series: "Apple", baseUnits: 9000,
  },
  {
    id: "commodore", name: "Commodore", segment: "gamer",
    priceAnchor: 595, perfBase: 55, perfStep: 9, cadenceOffset: 0,
    reputation: 75, baseShare: 28, series: "CBM", baseUnits: 22000,
  },
  {
    id: "ibm", name: "IBM", segment: "business",
    priceAnchor: 4995, perfBase: 85, perfStep: 8, cadenceOffset: 3,
    reputation: 90, baseShare: 20, series: "PC", baseUnits: 7000,
  },
  {
    id: "atari", name: "Atari", segment: "gamer",
    priceAnchor: 899, perfBase: 50, perfStep: 10, cadenceOffset: 1,
    reputation: 60, baseShare: 13, series: "XL", baseUnits: 11000,
  },
];

const INFLATION = 1.03;

/** Lebensdauer eines Konkurrenzmodells am Markt (Quartale). */
const MODEL_LIFETIME_Q = 14;
/** Maximal gleichzeitig aktive Modelle pro Firma. */
const MAX_ACTIVE_PER_FIRM = 3;

function inflation(year: number): number {
  return Math.pow(INFLATION, Math.max(0, year - 1983));
}

function yearQuarterFromIndex(idx: number): { year: number; quarter: number } {
  return { year: 1983 + Math.floor(idx / 4), quarter: (idx % 4) + 1 };
}

/**
 * Erzeugt für eine Firma alle Modell-Generationen bis (year, quarter) und gibt
 * die noch marktrelevanten zurück (jüngste zuerst).
 */
function buildFirmModels(
  fb: FirmBlueprint,
  profile: DifficultyProfile,
  year: number,
  quarter: number,
): RivalModel[] {
  const now = quarterIndex(year, quarter);
  const cadence = Math.max(3, profile.aiReleaseCadenceQuarters);
  const models: RivalModel[] = [];

  for (let gen = 0; ; gen++) {
    const releaseIdx = fb.cadenceOffset + gen * cadence;
    if (releaseIdx > now) break;
    const { year: ry, quarter: rq } = yearQuarterFromIndex(releaseIdx);
    const age = now - releaseIdx;
    if (age >= MODEL_LIFETIME_Q) continue;

    const perf = Math.min(
      100,
      Math.round(fb.perfBase + gen * fb.perfStep * profile.aiAggression),
    );
    // Preise: Inflation nach oben, Lernkurve/Preiskampf nach unten.
    const aggressiveDiscount = Math.pow(0.96, gen * profile.aiAggression);
    const agePriceDrop = Math.max(0.6, 1 - age * 0.025);
    const price = Math.round(fb.priceAnchor * inflation(ry) * aggressiveDiscount * agePriceDrop);

    // Absatz: frische Generation stark, danach abklingend.
    const units = Math.round(fb.baseUnits * Math.max(0.25, 1 - age * 0.06) * profile.aiAggression);

    models.push({
      name: `${fb.series} ${1000 + gen * 100}`,
      price,
      performance: perf,
      segment: fb.segment,
      releaseYear: ry,
      releaseQuarter: rq,
      unitsSold: units,
    });
  }

  return models
    .sort((a, b) => quarterIndex(b.releaseYear, b.releaseQuarter) - quarterIndex(a.releaseYear, a.releaseQuarter))
    .slice(0, MAX_ACTIVE_PER_FIRM);
}

/**
 * Vollständiges Konkurrenz-Feld zum Zeitpunkt (year, quarter).
 * Marktanteile sind untereinander konsistent (Summe = Restmarkt ohne Spieler).
 */
export function getRivalFirms(
  profile: DifficultyProfile,
  year: number,
  quarter: number,
): RivalFirm[] {
  const t = Math.max(0, Math.min(1, (year - 1983) / 9));
  const firms = FIRMS.map(fb => {
    const models = buildFirmModels(fb, profile, year, quarter);
    // Firmen mit frischen Produkten gewinnen über die Zeit Anteil, Nachzügler verlieren.
    const freshness = models.length > 0
      ? Math.max(0, 1 - (quarterIndex(year, quarter) - quarterIndex(models[0].releaseYear, models[0].releaseQuarter)) / MODEL_LIFETIME_Q)
      : 0;
    const share = fb.baseShare * (0.7 + 0.6 * freshness) * (1 + 0.25 * t * profile.aiAggression);
    return {
      id: fb.id,
      name: fb.name,
      segment: fb.segment,
      reputation: Math.min(100, Math.round(fb.reputation + gen0Bonus(models) )),
      marketShare: share,
      models,
    };
  });

  // Normalisieren: KI-Firmen teilen sich gemeinsam maximal 92 % des Marktes.
  const total = firms.reduce((s, f) => s + f.marketShare, 0) || 1;
  return firms.map(f => ({ ...f, marketShare: Number(((f.marketShare / total) * 92).toFixed(2)) }));
}

function gen0Bonus(models: RivalModel[]): number {
  if (models.length === 0) return -10;
  return Math.min(8, models.length * 2);
}

/**
 * Adapter auf die Legacy-`Competitor`-Struktur, die EconomyModel und
 * GameMechanics bereits konsumieren.
 */
export function getCompetitorsAt(
  profile: DifficultyProfile,
  year: number,
  quarter: number,
): Competitor[] {
  return getRivalFirms(profile, year, quarter).map(f => ({
    id: f.id,
    name: f.name,
    marketShare: f.marketShare,
    reputation: f.reputation,
    marketingBudget: Math.round(300_000 * inflation(year) * profile.aiAggression),
    developmentBudget: Math.round(400_000 * inflation(year) * profile.aiAggression),
    models: f.models.map(m => ({
      name: m.name,
      price: m.price,
      performance: m.performance,
      unitsSold: m.unitsSold,
      releaseQuarter: m.releaseQuarter,
      releaseYear: m.releaseYear,
    })),
  }));
}
