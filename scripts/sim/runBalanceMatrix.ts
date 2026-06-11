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
import { INITIAL_COMPETITORS, type Competitor } from "@/lib/game/GameMechanics";
import { quarterSeed } from "@/lib/game/rng";
import { ScriptedWorldDirector } from "./scriptedDirector";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const FIXTURE = resolve(import.meta.dirname ?? ".", "fixtures/events-1983-1995.json");
const OUT = "/mnt/documents/balance-matrix";
mkdirSync(OUT, { recursive: true });

const SEEDS = 20;
const QUARTERS = 40;
const START_CASH = 1_500_000;
const SEGMENTS = ["gamer", "business", "workstation"] as const;

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
  seed: number;
  finalCash: number;
  peakCash: number;
  minCash: number;
  totalRevenue: number;
  totalUnits: number;
  bankruptQuarter: number | null;
  lossQuarters: number;
}

async function runOnce(s: Strategy, seedSalt: string): Promise<RunResult> {
  const director = new ScriptedWorldDirector(FIXTURE);
  const competitors: Competitor[] = INITIAL_COMPETITORS as unknown as Competitor[];
  const models: Model[] = [];
  let cash = START_CASH, reputation = 50, brandAwareness = 0;
  let peak = cash, min = cash, totalRev = 0, totalUnits = 0, lossQ = 0;
  let bankruptQ: number | null = null;
  let qIdx = 0;

  outer: for (let year = 1983; year <= 1992; year++) {
    for (let q = 1; q <= 4; q++) {
      qIdx++;
      if (qIdx > QUARTERS) break outer;
      for (const m of s.releases(year, q)) { cash -= m.developmentCost; models.push(m); }
      if (bankruptQ !== null) continue;

      // Welt-Events (scripted) — beeinflussen Marketing-Effektivität als grobe Annäherung.
      const events = await director.generate({ userId: seedSalt, year, quarter: q });
      let demandBoost = 0;
      for (const ev of events) demandBoost += ev.applied_effects?.demand_delta ?? 0;
      const marketingEffective = Math.round(s.marketing * (1 + Math.max(-0.2, Math.min(0.2, demandBoost))));

      const rngSeed = quarterSeed(seedSalt + "-" + s.id, year, q);
      const activeModelCount = models.length;

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
          { rngSeed, brandAwareness, activeModelCount, segmentShareOverride: shareOverride } as never,
        );
        revenue += res.revenue;
        profit += res.profitBreakdown.netProfit;
        units += res.unitsSold;
      }

      const infl = Math.pow(1.03, Math.max(0, year - 1983));
      const salaries = Math.round(s.employees * 6000 * infl);
      const portfolio = Math.round(activeModelCount * 3000 * infl);
      const overhead = Math.round((10_000 + s.employees * 1000) * infl);
      const expenses = marketingEffective + s.development + s.research + salaries + portfolio + overhead;
      const net = profit - expenses;
      cash += net;
      totalRev += revenue;
      totalUnits += units;
      if (net < 0) lossQ++;

      const buildup = Math.min(8, (marketingEffective / (200_000 * infl)) * 4);
      const decay = marketingEffective < 50_000 * infl ? 5 : 0;
      brandAwareness = Math.max(0, Math.min(100, brandAwareness + buildup - decay));
      reputation = Math.max(0, Math.min(100, reputation + (units > 0 ? 2 : -1)));

      if (cash > peak) peak = cash;
      if (cash < min) min = cash;
      if (cash < -2_000_000 && bankruptQ === null) bankruptQ = qIdx;
    }
  }

  return {
    strategy: s.id, seed: parseInt(seedSalt.replace(/\D/g, "")) || 0,
    finalCash: Math.round(cash), peakCash: Math.round(peak), minCash: Math.round(min),
    totalRevenue: Math.round(totalRev), totalUnits, bankruptQuarter: bankruptQ, lossQuarters: lossQ,
  };
}

(async () => {
  const all: RunResult[] = [];
  for (const s of STRATEGIES) {
    for (let i = 0; i < SEEDS; i++) {
      const r = await runOnce(s, `seed${String(i).padStart(3, "0")}`);
      all.push(r);
    }
  }

  // Aggregate
  const byStrat = new Map<string, RunResult[]>();
  for (const r of all) {
    if (!byStrat.has(r.strategy)) byStrat.set(r.strategy, []);
    byStrat.get(r.strategy)!.push(r);
  }
  const agg = Array.from(byStrat.entries()).map(([id, rs]) => {
    const survive = rs.filter(r => r.bankruptQuarter === null).length / rs.length;
    const avg = rs.reduce((a, r) => a + r.finalCash, 0) / rs.length;
    const median = [...rs].sort((a, b) => a.finalCash - b.finalCash)[Math.floor(rs.length / 2)].finalCash;
    const std = Math.sqrt(rs.reduce((a, r) => a + Math.pow(r.finalCash - avg, 2), 0) / rs.length);
    return { id, surviveRate: survive, avgFinal: avg, median, std, runs: rs.length };
  });

  // Win-Rate Matrix: für jedes Seed das beste Final-Cash → Strategie
  const seedSet = new Set(all.map(r => r.seed));
  const wins = new Map<string, number>();
  for (const seed of seedSet) {
    const here = all.filter(r => r.seed === seed);
    const winner = here.reduce((b, r) => (r.finalCash > b.finalCash ? r : b), here[0]);
    wins.set(winner.strategy, (wins.get(winner.strategy) ?? 0) + 1);
  }
  const winRates = Object.fromEntries(STRATEGIES.map(s => [s.id, (wins.get(s.id) ?? 0) / seedSet.size]));

  // Balance-Gates
  const failures: string[] = [];
  for (const s of STRATEGIES) {
    const wr = winRates[s.id] ?? 0;
    if (wr > 0.8) failures.push(`Strategie "${s.id}" dominiert: Win-Rate ${(wr * 100).toFixed(1)}% > 80%`);
    const a = agg.find(x => x.id === s.id)!;
    if (a.surviveRate < 0.05) failures.push(`Strategie "${s.id}" chancenlos: Überlebensrate ${(a.surviveRate * 100).toFixed(1)}% < 5%`);
  }

  // Report
  const md = [
    "# Balance-Matrix Report",
    "",
    `Generiert: ${new Date().toISOString()}`,
    `Konfiguration: ${STRATEGIES.length} Strategien × ${SEEDS} Seeds × ${QUARTERS} Quartale`,
    "",
    "## Aggregat pro Strategie",
    "",
    "| Strategie | Überlebt | Win-Rate | Ø Final-Cash | Median | σ |",
    "|---|---:|---:|---:|---:|---:|",
    ...agg.map(a => `| ${a.id} | ${(a.surviveRate * 100).toFixed(0)}% | ${((winRates[a.id] ?? 0) * 100).toFixed(0)}% | $${Math.round(a.avgFinal).toLocaleString()} | $${a.median.toLocaleString()} | $${Math.round(a.std).toLocaleString()} |`),
    "",
    "## Balance-Gates",
    "",
    failures.length === 0 ? "PASS — kein Dominator, niemand chancenlos." : failures.map(f => `- FAIL: ${f}`).join("\n"),
    "",
    "Rohdaten: raw.json",
  ].join("\n");

  writeFileSync(`${OUT}/REPORT.md`, md);
  writeFileSync(`${OUT}/raw.json`, JSON.stringify({ agg, winRates, all }, null, 2));
  console.info(`Wrote ${OUT}/REPORT.md and raw.json`);
  console.info(failures.length === 0 ? "BALANCE: PASS" : `BALANCE: FAIL\n${failures.join("\n")}`);
  if (failures.length > 0) process.exit(1);
})();
