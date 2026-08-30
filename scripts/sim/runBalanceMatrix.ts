// ============================================================================
// runBalanceMatrix — N seeds × M strategien, headless, 0 LLM-Credits.
//
// Nutzt headlessEconomySim.runStrategy nicht direkt (das Skript ist ein Top-
// Level-Driver), sondern repliziert die Mindest-Pipeline mit ScriptedWorldDirector
// und EconomyModel. Erzeugt:
//   - /mnt/documents/balance-matrix/REPORT.md  (Heatmap-Tabelle)
//   - /mnt/documents/balance-matrix/raw.json   (alle Endmetriken)
//
// Balance-Kriterien werden geprüft und der Prozess exitet mit Code 1, wenn
// eine Strategie dominiert oder chancenlos ist. CI-tauglich.
//
// Run: bun run scripts/sim/runBalanceMatrix.ts
// ============================================================================

import { EconomyModel } from "@/components/EconomyModel";
import { type Competitor } from "@/lib/game/GameMechanics";
import { getCompetitorsAt } from "@/lib/game/CompetitorAI";
import { quarterSeed } from "@/lib/game/rng";
import {
  DIFFICULTY_PROFILES,
  getActiveCrises,
  aiPressureAt as difficultyAiPressureAt,
  type DifficultyId,
  type DifficultyProfile,
} from "@/lib/game/Difficulty";

import { ScriptedWorldDirector } from "./scriptedDirector";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const FIXTURE = resolve(import.meta.dirname ?? ".", "fixtures/events-1983-1995.json");
const OUT = "/mnt/documents/balance-matrix";
mkdirSync(OUT, { recursive: true });

const SEEDS = 20;
const QUARTERS = 40;
const SEGMENTS = ["gamer", "business", "workstation"] as const;

/**
 * Headless-Szenarien spiegeln die drei Schwierigkeitsgrade aus Difficulty.ts.
 * Krisenkalender und KI-Druck kommen jetzt DIREKT aus `Difficulty.ts` —
 * Single Source of Truth, damit der Runner exakt das misst, was Spieler erleben.
 */
interface Scenario {
  id: DifficultyId;
  label: string;
  profile: DifficultyProfile;
}

const SCENARIOS: Scenario[] = (["easy", "normal", "hard"] as DifficultyId[]).map(id => {
  const profile = DIFFICULTY_PROFILES[id];
  return {
    id,
    label: `${profile.label} (Startkapital $${profile.startingCash.toLocaleString()}, KI-Cap ${Math.round(profile.aiPressureCeiling * 100)}%)`,
    profile,
  };
});


interface Model {
  name: string;
  cpu: string; gpu: string; ram: string; sound: string;
  accessories: string[];
  price: number; developmentCost: number;
  releaseYear: number; releaseQuarter: number;
  status: "released";
}

interface Strategy {
  id: string;
  label: string;
  marketing: number;
  research: number;
  development: number;
  employees: number;
  releases: (y: number, q: number) => Model[];
}

const baseModel = (over: Partial<Model>): Model => ({
  name: "", cpu: "Intel 8086", gpu: "VGA Graphics", ram: "256KB RAM", sound: "Sound Blaster",
  accessories: [], price: 1000, developmentCost: 200_000,
  releaseYear: 1983, releaseQuarter: 1, status: "released", ...over,
});

const STRATEGIES: Strategy[] = [
  {
    // Massenmarkt: kleine Marge, große Stückzahl, schlanke Org, regelmäßige Refreshes.
    id: "cheap_spam", label: "Cheap-Spam",
    marketing: 90_000, research: 10_000, development: 40_000, employees: 6,
    releases: (y, q) => (
      y === 1983 && q === 1 ? [baseModel({ name: "ZX-Lite",    cpu: "Zilog Z80",  gpu: "MOS VIC",     ram: "16KB RAM",  sound: "PC Speaker", price: 349 })] :
      y === 1984 && q === 3 ? [baseModel({ name: "ZX-Lite+",   cpu: "Zilog Z80",  gpu: "Atari GTIA",  ram: "64KB RAM",  sound: "AY-3-8910",  price: 449, releaseYear: 1984, releaseQuarter: 3 })] :
      y === 1986 && q === 1 ? [baseModel({ name: "ZX-Lite II", cpu: "Intel 8088", gpu: "EGA",         ram: "256KB RAM", sound: "AY-3-8910",  price: 599, releaseYear: 1986 })] :
      y === 1988 && q === 1 ? [baseModel({ name: "ZX-Lite III",cpu: "Intel 8088", gpu: "EGA",         ram: "256KB RAM", sound: "Sound Blaster", price: 699, releaseYear: 1988 })] :
      y === 1990 && q === 1 ? [baseModel({ name: "ZX-Lite IV", cpu: "Intel 80286",gpu: "VGA Graphics",ram: "512KB RAM", sound: "Sound Blaster", price: 799, releaseYear: 1990 })] : []),
  },
  {
    id: "premium_niche", label: "Premium-Niche",
    marketing: 150_000, research: 80_000, development: 120_000, employees: 12,
    releases: (y, q) => (y === 1983 && q === 2 ? [baseModel({ name: "Vega-One", cpu: "Motorola 68000", gpu: "VGA Graphics", ram: "512KB RAM", sound: "Sound Blaster", price: 2499, releaseQuarter: 2 })] :
                        y === 1987 && q === 1 ? [baseModel({ name: "Vega-Pro", cpu: "Intel 80386", gpu: "VGA Graphics", ram: "1MB RAM", sound: "Sound Blaster Pro", price: 3499, releaseYear: 1987 })] : []),
  },
  {
    id: "tech_leader", label: "Tech-Leader",
    marketing: 200_000, research: 200_000, development: 200_000, employees: 18,
    releases: (y, q) => (y === 1984 && q === 1 ? [baseModel({ name: "Apex-A", cpu: "Motorola 68000", gpu: "VGA Graphics", ram: "1MB RAM", sound: "Sound Blaster", price: 1999, releaseYear: 1984 })] :
                        y === 1988 && q === 1 ? [baseModel({ name: "Apex-B", cpu: "Intel 80486", gpu: "SVGA", ram: "4MB RAM", sound: "Sound Blaster Pro", price: 3999, releaseYear: 1988 })] : []),
  },
  {
    id: "fast_follower", label: "Fast-Follower",
    marketing: 180_000, research: 50_000, development: 100_000, employees: 10,
    releases: (y, q) => (y === 1984 && q === 3 ? [baseModel({ name: "Echo-1", cpu: "Intel 8088", gpu: "EGA", ram: "256KB RAM", sound: "PC Speaker", price: 899, releaseYear: 1984, releaseQuarter: 3 })] :
                        y === 1987 && q === 3 ? [baseModel({ name: "Echo-2", cpu: "Intel 80286", gpu: "VGA Graphics", ram: "1MB RAM", sound: "Sound Blaster", price: 1599, releaseYear: 1987, releaseQuarter: 3 })] : []),
  },
  {
    id: "cashflow_king", label: "Cashflow-King",
    marketing: 60_000, research: 25_000, development: 50_000, employees: 5,
    releases: (y, q) => (y === 1983 && q === 1 ? [baseModel({ name: "Penny", cpu: "Zilog Z80", gpu: "MOS VIC", ram: "64KB RAM", sound: "PC Speaker", price: 499 })] :
                        y === 1988 && q === 1 ? [baseModel({ name: "Penny-II", cpu: "Intel 8088", gpu: "EGA", ram: "256KB RAM", sound: "PC Speaker", price: 799, releaseYear: 1988 })] : []),
  },
  {
    id: "boom_bust", label: "Boom-Bust-Leverage",
    marketing: 400_000, research: 120_000, development: 250_000, employees: 20,
    releases: (y, q) => (y === 1983 && q === 1 ? [baseModel({ name: "Blitz", cpu: "Motorola 68000", gpu: "VGA Graphics", ram: "512KB RAM", sound: "Sound Blaster", price: 1799 })] :
                        y === 1985 && q === 3 ? [baseModel({ name: "Blitz-X", cpu: "Intel 80286", gpu: "VGA Graphics", ram: "1MB RAM", sound: "Sound Blaster", price: 2499, releaseYear: 1985, releaseQuarter: 3 })] : []),
  },
];

interface RunResult {
  strategy: string;
  scenario: DifficultyId;
  seed: number;
  finalCash: number;
  peakCash: number;
  minCash: number;
  totalRevenue: number;
  totalUnits: number;
  bankruptQuarter: number | null;
  lossQuarters: number;
  emergencyLoanUsed: boolean;
}

async function runOnce(s: Strategy, sc: Scenario, seedSalt: string): Promise<RunResult> {
  const profile = sc.profile;
  const director = new ScriptedWorldDirector(FIXTURE);
  const models: Model[] = [];
  let cash = profile.startingCash, reputation = 50, brandAwareness = 0;
  let peak = cash, min = cash, totalRev = 0, totalUnits = 0, lossQ = 0;
  let bankruptQ: number | null = null;
  let qIdx = 0;
  let emergencyLoanUsed = false;
  let emergencyLoanQuarterlyPayment = 0;
  let emergencyLoanQuartersRemaining = 0;

  outer: for (let year = 1983; year <= 1992; year++) {
    for (let q = 1; q <= 4; q++) {
      qIdx++;
      if (qIdx > QUARTERS) break outer;
      for (const m of s.releases(year, q)) { cash -= m.developmentCost; models.push(m); }
      if (bankruptQ !== null) continue;

      // Konkurrenz-Feld dieses Quartals (neue Generationen, alternde Modelle).
      const competitors: Competitor[] = getCompetitorsAt(profile, year, q);

      const events = await director.generate({ userId: seedSalt, year, quarter: q });
      let demandBoost = 0;
      for (const ev of events) demandBoost += ev.applied_effects?.demand_delta ?? 0;

      // Geplante Krisen aus dem gemeinsamen Difficulty-Kalender.
      const crisis = getActiveCrises(profile, year, q);
      const bomMult = crisis.bomMultiplier;
      const shockDemand = crisis.demandMultiplier - 1;
      const combinedDemand = Math.max(-0.35, Math.min(0.20, demandBoost + shockDemand));

      const marketingEffective = Math.round(s.marketing * (1 + combinedDemand));

      const rngSeed = quarterSeed(seedSalt + "-" + s.id + "-" + sc.id, year, q);
      const activeModelCount = models.length;
      const aiPressure = difficultyAiPressureAt(profile, year);

      // Portfolio-Shares pro Segment
      const appealTotals: Record<string, { m: Model; a: number }[]> = { gamer: [], business: [], workstation: [] };
      for (const m of models) {
        for (const seg of SEGMENTS) {
          const a = EconomyModel.calculateSegmentAppeal(m as never, seg, year, q);
          const maxP = EconomyModel.getSegmentMaxPrice(seg, year, q);
          const el = EconomyModel.calculatePriceElasticity(m.price, maxP, seg);
          appealTotals[seg].push({ m, a: a * el });
        }
      }
      let revenue = 0, profit = 0, units = 0;
      for (const m of models) {
        const shareOverride: Record<string, number> = {};
        for (const seg of SEGMENTS) {
          const total = appealTotals[seg].reduce((acc, x) => acc + x.a, 0);
          const own = appealTotals[seg].find(x => x.m === m)?.a ?? 0;
          shareOverride[seg] = total > 0 ? own / total : 0;
        }
        const res = EconomyModel.simulateModelSales(
          m as never, marketingEffective, reputation, competitors, year, q, 1_000_000,
          {
            rngSeed, brandAwareness, activeModelCount,
            segmentShareOverride: shareOverride,
            bomMultiplier: bomMult,
            demandMultiplier: 1 + combinedDemand,
            aiCompetitorPressure: aiPressure,
            marketingSaturationPoint: profile.marketingSaturationPoint,
          } as never,
        );
        revenue += res.revenue;
        profit += res.profitBreakdown.netProfit;
        units += res.unitsSold;
      }

      // Fixkosten skalieren mit Schwierigkeit (Gehälter, Portfolio, Overhead).
      const infl = Math.pow(1.03, Math.max(0, year - 1983));
      const fcm = profile.fixedCostMultiplier;
      const salaries = Math.round(s.employees * 6000 * infl * fcm);
      const portfolio = Math.round(activeModelCount * 3000 * infl * fcm);
      const overhead = Math.round((10_000 + s.employees * 1000) * infl * fcm);
      // Notkredit-Annuität (nur Normal-Modus).
      let loanPayment = 0;
      if (emergencyLoanQuartersRemaining > 0) {
        loanPayment = emergencyLoanQuarterlyPayment;
        emergencyLoanQuartersRemaining--;
      }
      const expenses = marketingEffective + s.development + s.research + salaries + portfolio + overhead + loanPayment;
      const net = profit - expenses;
      cash += net;
      totalRev += revenue;
      totalUnits += units;
      if (net < 0) lossQ++;

      const buildup = Math.min(8, (marketingEffective / (200_000 * infl)) * 4);
      const decay = marketingEffective < 50_000 * infl ? 5 : 0;
      brandAwareness = Math.max(0, Math.min(100, brandAwareness + buildup - decay));
      // Reputations-Verlust skaliert mit Schwierigkeits-Profil.
      const baseRep = (units > 0 ? 2 : -1);
      const repHit = baseRep < 0 ? baseRep * profile.reputationLossMultiplier : baseRep;
      reputation = Math.max(0, Math.min(100, reputation + repHit));

      if (cash > peak) peak = cash;
      if (cash < min) min = cash;

      // Bankrott-Check je nach Profil. Normal kennt einmaligen Notkredit,
      // dessen Höhe das echte Loch plus Puffer deckt (wie im Live-Spiel).
      if (cash < profile.bankruptcyCashThreshold && bankruptQ === null) {
        if (profile.bankruptcyMode === "emergency_loan_then_game_over" && !emergencyLoanUsed && profile.emergencyLoanMaxAmount > 0) {
          const principal = Math.round(Math.min(
            profile.emergencyLoanMaxAmount,
            Math.max(profile.emergencyLoanAmount, Math.max(0, -cash) + Math.max(250_000, expenses * 2)),
          ));
          cash += principal;
          emergencyLoanUsed = true;
          const r = profile.emergencyLoanInterest / 4;
          const n = profile.emergencyLoanQuarters;
          emergencyLoanQuarterlyPayment = Math.round(
            principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
          );
          emergencyLoanQuartersRemaining = n;
        } else {
          bankruptQ = qIdx;
        }
      }

    }
  }

  return {
    strategy: s.id, scenario: sc.id, seed: parseInt(seedSalt.replace(/\D/g, "")) || 0,
    finalCash: Math.round(cash), peakCash: Math.round(peak), minCash: Math.round(min),
    totalRevenue: Math.round(totalRev), totalUnits, bankruptQuarter: bankruptQ, lossQuarters: lossQ,
    emergencyLoanUsed,
  };
}

(async () => {
  const all: RunResult[] = [];
  for (const sc of SCENARIOS) {
    for (const s of STRATEGIES) {
      for (let i = 0; i < SEEDS; i++) {
        const r = await runOnce(s, sc, `seed${String(i).padStart(3, "0")}`);
        all.push(r);
      }
    }
  }

  // Aggregat pro (Szenario, Strategie).
  interface Agg { scenario: DifficultyId; id: string; surviveRate: number; avgFinal: number; median: number; std: number; runs: number; emergencyLoanRate: number; }
  const aggAll: Agg[] = [];
  for (const sc of SCENARIOS) {
    const byStrat = new Map<string, RunResult[]>();
    for (const r of all.filter(x => x.scenario === sc.id)) {
      if (!byStrat.has(r.strategy)) byStrat.set(r.strategy, []);
      byStrat.get(r.strategy)!.push(r);
    }
    for (const [id, rs] of byStrat.entries()) {
      const survive = rs.filter(r => r.bankruptQuarter === null).length / rs.length;
      const avg = rs.reduce((a, r) => a + r.finalCash, 0) / rs.length;
      const median = [...rs].sort((a, b) => a.finalCash - b.finalCash)[Math.floor(rs.length / 2)].finalCash;
      const std = Math.sqrt(rs.reduce((a, r) => a + Math.pow(r.finalCash - avg, 2), 0) / rs.length);
      const emRate = rs.filter(r => r.emergencyLoanUsed).length / rs.length;
      aggAll.push({ scenario: sc.id, id, surviveRate: survive, avgFinal: avg, median, std, runs: rs.length, emergencyLoanRate: emRate });
    }
  }

  // Balance-Gates pro Schwierigkeitsgrad — bewusst stufen-spezifisch.
  //  - easy:   alle 6 Strategien überleben (≥95 %), kein 3×-Dominator.
  //  - normal: ≥4/6 Strategien überleben mit ≥70 %, kein Dominator >2.5×,
  //            mind. 1 Strategie braucht in ≥10 % der Seeds den Notkredit.
  //            (Hochbrennige Strategien dürfen sterben — das macht Normal aus.)
  //  - hard:   ≥3/6 Strategien überleben mit ≥30 %, ≥2 Strategien sterben (<50 %),
  //            kein Median-Dominator >3.5× (Geld zählt weniger als Überleben).
  const failures: string[] = [];

  // easy
  {
    const here = aggAll.filter(a => a.scenario === "easy");
    const survivors = here.filter(a => a.surviveRate >= 0.5);
    const medMed = survivors.length
      ? [...survivors].sort((a, b) => a.median - b.median)[Math.floor(survivors.length / 2)].median
      : 1;
    const top = Math.max(...here.map(a => a.median));
    for (const a of here) {
      if (a.surviveRate < 0.95) failures.push(`[easy] "${a.id}" stirbt: Überleben ${(a.surviveRate * 100).toFixed(0)}% < 95%`);
      const ratio = a.median / Math.max(1, medMed);
      if (a.median === top && ratio > 3.0) failures.push(`[easy] "${a.id}" dominiert: ${ratio.toFixed(2)}× > 3×`);
    }
  }

  // normal
  {
    const here = aggAll.filter(a => a.scenario === "normal");
    const surviving70 = here.filter(a => a.surviveRate >= 0.70).length;
    if (surviving70 < 4) failures.push(`[normal] zu hart: nur ${surviving70}/${here.length} Strategien schaffen ≥70 % Überleben`);
    const survivors = here.filter(a => a.surviveRate >= 0.5);
    const medMed = survivors.length
      ? [...survivors].sort((a, b) => a.median - b.median)[Math.floor(survivors.length / 2)].median
      : 1;
    const top = Math.max(...survivors.map(a => a.median));
    const winner = survivors.find(a => a.median === top);
    if (winner) {
      const ratio = winner.median / Math.max(1, medMed);
      if (ratio > 2.5) failures.push(`[normal] "${winner.id}" dominiert: ${ratio.toFixed(2)}× > 2.5×`);
    }
    const anyLoan = here.some(a => a.emergencyLoanRate >= 0.10);
    if (!anyLoan) failures.push(`[normal] zu leicht: keine Strategie braucht in ≥10 % der Seeds den Notkredit`);
  }

  // hard
  {
    const here = aggAll.filter(a => a.scenario === "hard");
    const surviving30 = here.filter(a => a.surviveRate >= 0.30).length;
    const weak = here.filter(a => a.surviveRate < 0.50).length;
    if (surviving30 < 3) failures.push(`[hard] zu hart: nur ${surviving30}/${here.length} Strategien schaffen ≥30 % Überleben`);
    if (weak < 2) failures.push(`[hard] zu leicht: nur ${weak} Strategien <50 % Überleben (echtes Aussieben fehlt)`);
    const survivors = here.filter(a => a.surviveRate >= 0.5);
    const medMed = survivors.length
      ? [...survivors].sort((a, b) => a.median - b.median)[Math.floor(survivors.length / 2)].median
      : 1;
    const top = Math.max(...survivors.map(a => a.median));
    const winner = survivors.find(a => a.median === top);
    if (winner && winner.median / Math.max(1, medMed) > 3.5) {
      failures.push(`[hard] "${winner.id}" dominiert: ${(winner.median / medMed).toFixed(2)}× > 3.5×`);
    }
  }

  // Report
  const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
  const sections: string[] = [
    "# Balance-Matrix Report",
    "",
    `Generiert: ${new Date().toISOString()}`,
    `Konfiguration: ${SCENARIOS.length} Schwierigkeitsgrade × ${STRATEGIES.length} Strategien × ${SEEDS} Seeds × ${QUARTERS} Quartale`,
    "",
  ];
  for (const sc of SCENARIOS) {
    sections.push(`## ${sc.label}`, "");
    const here = aggAll.filter(a => a.scenario === sc.id);
    sections.push("| Strategie | Überlebt | Notkredit | Ø Final-Cash | Median | σ |");
    sections.push("|---|---:|---:|---:|---:|---:|");
    for (const a of here) {
      sections.push(`| ${a.id} | ${(a.surviveRate * 100).toFixed(0)}% | ${(a.emergencyLoanRate * 100).toFixed(0)}% | ${fmt(a.avgFinal)} | ${fmt(a.median)} | ${fmt(a.std)} |`);
    }
    sections.push("");
  }
  sections.push("## Balance-Gates", "");
  sections.push(failures.length === 0 ? "PASS — alle drei Schwierigkeitsgrade im Toleranzkorridor." : failures.map(f => `- FAIL: ${f}`).join("\n"));
  sections.push("", "Rohdaten: raw.json");

  const md = sections.join("\n");
  writeFileSync(`${OUT}/REPORT.md`, md);
  writeFileSync(`${OUT}/raw.json`, JSON.stringify({ agg: aggAll, all }, null, 2));
  console.info(`Wrote ${OUT}/REPORT.md and raw.json`);
  console.info(failures.length === 0 ? "BALANCE: PASS" : `BALANCE: FAIL\n${failures.join("\n")}`);
  if (failures.length > 0) process.exit(1);
})();
