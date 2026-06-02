/**
 * Headless economy simulation comparing pre-Step-2 vs. post-Step-2 balancing.
 * Runs 3 strategies × 40 quarters in both configurations and writes:
 *  - CSV trajectories per (config, strategy)
 *  - Markdown summary report
 *
 * Run:  bun run scripts/sim/headlessEconomySim.ts
 */

import { EconomyModel } from "@/components/EconomyModel";
import { INITIAL_COMPETITORS, type Competitor } from "@/lib/game/GameMechanics";
import { quarterSeed } from "@/lib/game/rng";
import { calcQuarterlyAnnuity } from "@/types/financing";
import { writeFileSync, mkdirSync } from "node:fs";

type Mode = "before" | "after";

interface SimModel {
  name: string;
  cpu: string; gpu: string; ram: string; sound: string;
  accessories: string[];
  price: number;
  developmentCost: number;
  releaseYear: number; releaseQuarter: number;
  status: "released";
  unitsSold?: number;
}

interface LoanPlan {
  principal: number; annualRate: number; quartersTotal: number;
  takeYear: number; takeQuarter: number;
}

interface Strategy {
  id: string;
  label: string;
  description: string;
  marketingBudget: (q: number) => number;
  researchBudget: (q: number) => number;
  developmentBudget: (q: number) => number;
  /** Returns list of new models to add at start of given (year,quarter). */
  releases: (year: number, quarter: number) => SimModel[];
  /** Initial employees. */
  employees: number;
  /** Optional bank loan plan (Step-2-Validierung). */
  loan?: LoanPlan;
}

// ---------- Strategy definitions ----------

const stratA: Strategy = {
  id: "cheap_z80",
  label: "Cheap Z80 spam",
  description: "$299 Z80 home computer, mass marketing, no R&D.",
  marketingBudget: () => 250_000,
  researchBudget: () => 0,
  developmentBudget: () => 50_000,
  employees: 8,
  releases: (y, q) => {
    if (y === 1983 && q === 1) {
      return [{
        name: "ZX-Lite",
        cpu: "Zilog Z80", gpu: "MOS VIC", ram: "16KB RAM", sound: "PC Speaker",
        accessories: ["Kassettenlaufwerk", "RF Modulator"],
        price: 299, developmentCost: 200_000,
        releaseYear: 1983, releaseQuarter: 1, status: "released",
      }];
    }
    if (y === 1985 && q === 1) {
      return [{
        name: "ZX-Lite II",
        cpu: "Zilog Z80", gpu: "Atari GTIA", ram: "64KB RAM", sound: "AY-3-8910",
        accessories: ["Diskettenlaufwerk 5.25\"", "Composite Monitor"],
        price: 399, developmentCost: 300_000,
        releaseYear: 1985, releaseQuarter: 1, status: "released",
      }];
    }
    return [];
  },
};

const stratB: Strategy = {
  id: "mid_premium",
  label: "Mid-tech premium",
  description: "8086 business box at $1899, balanced marketing+R&D.",
  marketingBudget: (q) => 150_000 + Math.min(q, 16) * 10_000,
  researchBudget: () => 80_000,
  developmentBudget: () => 120_000,
  employees: 12,
  releases: (y, q) => {
    if (y === 1984 && q === 2) {
      return [{
        name: "Vector 86",
        cpu: "Intel 8086", gpu: "TI TMS9918", ram: "64KB RAM", sound: "AY-3-8910",
        accessories: ["Diskettenlaufwerk 5.25\"", "RGB Monitor"],
        price: 1899, developmentCost: 500_000,
        releaseYear: 1984, releaseQuarter: 2, status: "released",
      }];
    }
    if (y === 1986 && q === 3) {
      return [{
        name: "Vector 286",
        cpu: "Intel 80286", gpu: "EGA Graphics", ram: "256KB RAM", sound: "AdLib Sound",
        accessories: ["Diskettenlaufwerk 3.5\"", "EGA Monitor", "Festplatte 10MB"],
        price: 2499, developmentCost: 800_000,
        releaseYear: 1986, releaseQuarter: 3, status: "released",
      }];
    }
    return [];
  },
};

const stratC: Strategy = {
  id: "rnd_heavy",
  label: "R&D-heavy workstation",
  description: "Skip first year, then 386/486 workstation push.",
  marketingBudget: (q) => q < 6 ? 30_000 : 350_000,
  researchBudget: (q) => q < 6 ? 200_000 : 120_000,
  developmentBudget: (q) => q < 6 ? 250_000 : 100_000,
  employees: 15,
  releases: (y, q) => {
    if (y === 1986 && q === 2) {
      return [{
        name: "Apex 386",
        cpu: "Intel 80386", gpu: "VGA Graphics", ram: "512KB RAM", sound: "AdLib Sound",
        accessories: ["Diskettenlaufwerk 3.5\"", "VGA Monitor", "Festplatte 20MB"],
        price: 4499, developmentCost: 1_200_000,
        releaseYear: 1986, releaseQuarter: 2, status: "released",
      }];
    }
    if (y === 1989 && q === 1) {
      return [{
        name: "Apex 486",
        cpu: "Intel 80486", gpu: "Super VGA", ram: "2MB RAM", sound: "Sound Blaster",
        accessories: ["Diskettenlaufwerk 3.5\"", "VGA Monitor", "Festplatte 20MB", "CD-ROM Drive"],
        price: 6999, developmentCost: 2_000_000,
        releaseYear: 1989, releaseQuarter: 1, status: "released",
      }];
    }
    return [];
  },
};

// Step-2-Validierung: gleiche Strategie wie C, aber mit $800k Bankkredit in 1983 Q2.
// Annuität 20 Quartale @ 9.5 % p.a. (entspricht reputation~50 in baseInterestRateForYear).
const stratD: Strategy = {
  ...stratC,
  id: "rnd_with_loan",
  label: "R&D-heavy + $800k Bankkredit (Q2)",
  description: "Wie R&D-heavy, aber $800k Kredit in 1983 Q2 (9.5% p.a., 20 Quartale).",
  loan: { principal: 800_000, annualRate: 0.095, quartersTotal: 20, takeYear: 1983, takeQuarter: 2 },
};

const STRATEGIES = [stratA, stratB, stratC, stratD];

// ---------- Pre-Step-2 monkey patches ----------

const origMarketing = EconomyModel.calculateMarketingEffectiveness.bind(EconomyModel);
const origSegmentAppeal = EconomyModel.calculateSegmentAppeal.bind(EconomyModel);
const origMaxPrice = EconomyModel.getSegmentMaxPrice.bind(EconomyModel);

function patchBefore() {
  // Old: sqrt unbounded * (0.8 + rep/100*0.4), cap 3.0, no brand.
  (EconomyModel as any).calculateMarketingEffectiveness =
    (budget: number, rep: number, year: number = 1983, _brand: number = 0) => {
      const infl = (EconomyModel as any).getInflationFactor(year);
      const baseBudget = 25000 * infl;
      const eff = Math.sqrt(budget / baseBudget) * (0.8 + rep / 100 * 0.4);
      return Math.max(0.5, Math.min(3.0, eff));
    };
  // Old appeal: no paradigm delta — we still want spec-driven (it existed pre-Step-2).
  (EconomyModel as any).calculateSegmentAppeal = (model: any, segment: string, year: number) =>
    origSegmentAppeal(model, segment, year, 1); // quarter=1 disables effective paradigm gating (events still active for some pairs, but acceptable baseline)
  // Old max price: no paradigm multiplier.
  (EconomyModel as any).getSegmentMaxPrice = (segment: string, year: number) => {
    const basePrices: any = { gamer: 800, business: 2000, workstation: 5000 };
    const basePrice = basePrices[segment] ?? 1000;
    const stepped = basePrice + (year - 1983) * (segment === "gamer" ? 100 : segment === "business" ? 500 : 1000);
    return stepped * (EconomyModel as any).getInflationFactor(year);
  };
}
function unpatch() {
  (EconomyModel as any).calculateMarketingEffectiveness = origMarketing;
  (EconomyModel as any).calculateSegmentAppeal = origSegmentAppeal;
  (EconomyModel as any).getSegmentMaxPrice = origMaxPrice;
}

// ---------- Sim loop ----------

interface QuarterRow {
  year: number; quarter: number;
  cash: number; revenue: number; grossProfit: number; expenses: number;
  net: number; units: number; brand: number; activeModels: number;
  bankrupt: boolean;
}

function runStrategy(mode: Mode, s: Strategy): QuarterRow[] {
  const rows: QuarterRow[] = [];
  const competitors: Competitor[] = INITIAL_COMPETITORS as any;
  const startCash = mode === "before" ? 5_000_000 : 1_500_000;
  let cash = startCash;
  let reputation = 50;
  let brandAwareness = 0;
  const models: SimModel[] = [];
  const employees = s.employees;
  let bankrupt = false;

  // Kreditbuchhaltung
  let loanOutstanding = 0;
  let loanQuarterly = 0;
  let loanQuartersLeft = 0;
  const loanRate = s.loan?.annualRate ?? 0;

  let qIdx = 0;
  for (let year = 1983; year <= 1992; year++) {
    for (let q = 1; q <= 4; q++) {
      qIdx++;
      if (qIdx > 40) break;

      // Kreditaufnahme zum vereinbarten Quartal
      if (s.loan && year === s.loan.takeYear && q === s.loan.takeQuarter && loanOutstanding === 0) {
        cash += s.loan.principal;
        loanOutstanding = s.loan.principal;
        loanQuarterly = calcQuarterlyAnnuity(s.loan.principal, s.loan.annualRate, s.loan.quartersTotal);
        loanQuartersLeft = s.loan.quartersTotal;
      }

      // Add new releases
      for (const m of s.releases(year, q)) {
        cash -= m.developmentCost;
        models.push(m);
      }

      if (bankrupt) {
        rows.push({ year, quarter: q, cash, revenue: 0, grossProfit: 0, expenses: 0, net: 0, units: 0, brand: brandAwareness, activeModels: models.length, bankrupt: true });
        continue;
      }

      const marketing = s.marketingBudget(qIdx);
      const research = s.researchBudget(qIdx);
      const development = s.developmentBudget(qIdx);
      const support = 0;

      const rngSeed = quarterSeed("sim-" + s.id, year, q);
      const activeModelCount = models.length;

      // Portfolio shares (simplified — equal weight is fine for top-line check).
      const segs = ["gamer", "business", "workstation"] as const;
      const appealTotals: Record<string, { m: SimModel; a: number }[]> = { gamer: [], business: [], workstation: [] };
      for (const m of models) {
        for (const seg of segs) {
          const a = EconomyModel.calculateSegmentAppeal(m as any, seg, year, q);
          const maxP = (EconomyModel as any).getSegmentMaxPrice.length >= 3
            ? EconomyModel.getSegmentMaxPrice(seg, year, q)
            : (EconomyModel as any).getSegmentMaxPrice(seg, year);
          const el = EconomyModel.calculatePriceElasticity(m.price, maxP, seg);
          appealTotals[seg].push({ m, a: a * el });
        }
      }

      let revenue = 0, grossProfit = 0, units = 0;
      for (const m of models) {
        const shareOverride: any = {};
        for (const seg of segs) {
          const total = appealTotals[seg].reduce((s, x) => s + x.a, 0);
          const own = appealTotals[seg].find(x => x.m === m)?.a ?? 0;
          shareOverride[seg] = total > 0 ? own / total : 0;
        }
        const res = EconomyModel.simulateModelSales(
          m as any, marketing, reputation, competitors, year, q, 1_000_000,
          mode === "after"
            ? { rngSeed, brandAwareness, activeModelCount, segmentShareOverride: shareOverride }
            : { rngSeed, segmentShareOverride: shareOverride } // before: no brand, no portfolio cap
        );
        revenue += res.revenue;
        grossProfit += res.profitBreakdown.netProfit;
        units += res.unitsSold;
      }

      const infl = Math.pow(1.03, Math.max(0, year - 1983));
      let salaries: number, portfolioMaintenance: number, fixedOverhead: number;
      if (mode === "before") {
        salaries = Math.round(60_000 * infl);
        portfolioMaintenance = 0;
        fixedOverhead = 0;
      } else {
        salaries = Math.round(employees * 6000 * infl);
        portfolioMaintenance = Math.round(activeModelCount * 3000 * infl);
        fixedOverhead = Math.round((10000 + employees * 1000) * infl);
      }
      // Kredit-Annuität als zusätzliche Periodenausgabe (vereinfacht: keine Zins/Tilgung-Trennung im Sim-Report).
      let loanPayment = 0;
      if (loanQuartersLeft > 0) {
        loanPayment = Math.round(loanQuarterly);
        loanQuartersLeft--;
        // Vereinfachte Restschuld-Fortschreibung: Zins auf Restschuld, Rest = Tilgung.
        const quarterlyRate = loanRate / 4;
        const interest = loanOutstanding * quarterlyRate;
        const principalPaid = Math.max(0, loanPayment - interest);
        loanOutstanding = Math.max(0, loanOutstanding - principalPaid);
        if (loanQuartersLeft === 0) loanOutstanding = 0;
      }
      const expenses = marketing + development + research + support + salaries + portfolioMaintenance + fixedOverhead + loanPayment;
      const net = grossProfit - expenses;
      cash += net;

      // Brand awareness update (after-mode only).
      if (mode === "after") {
        const buildup = Math.min(8, (marketing / (200_000 * infl)) * 4);
        const decay = marketing < 50_000 * infl ? 5 : 0;
        brandAwareness = Math.max(0, Math.min(100, brandAwareness + buildup - decay));
      }
      reputation = Math.max(0, Math.min(100, reputation + (units > 0 ? 2 : -1)));

      if (cash < -2_000_000) bankrupt = true;

      rows.push({ year, quarter: q, cash: Math.round(cash), revenue: Math.round(revenue), grossProfit: Math.round(grossProfit), expenses: Math.round(expenses), net: Math.round(net), units, brand: Math.round(brandAwareness), activeModels: activeModelCount, bankrupt });
    }
  }
  return rows;
}

// ---------- Driver ----------

const outDir = "/mnt/documents/economy-sim";
mkdirSync(outDir, { recursive: true });

const summary: any[] = [];
for (const mode of ["before", "after"] as Mode[]) {
  if (mode === "before") patchBefore(); else unpatch();
  for (const s of STRATEGIES) {
    const rows = runStrategy(mode, s);
    // CSV
    const header = "year,quarter,cash,revenue,grossProfit,expenses,net,units,brand,activeModels,bankrupt";
    const csv = [header, ...rows.map(r => `${r.year},${r.quarter},${r.cash},${r.revenue},${r.grossProfit},${r.expenses},${r.net},${r.units},${r.brand},${r.activeModels},${r.bankrupt}`)].join("\n");
    writeFileSync(`${outDir}/${mode}_${s.id}.csv`, csv);

    const last = rows[rows.length - 1];
    const peakCash = Math.max(...rows.map(r => r.cash));
    const minCash = Math.min(...rows.map(r => r.cash));
    const totalRevenue = rows.reduce((a, r) => a + r.revenue, 0);
    const totalUnits = rows.reduce((a, r) => a + r.units, 0);
    const bankruptAt = rows.findIndex(r => r.bankrupt);
    summary.push({
      mode, strat: s.label, finalCash: last.cash, peakCash, minCash,
      totalRevenue, totalUnits, bankruptQuarter: bankruptAt === -1 ? null : bankruptAt + 1,
      finalBrand: last.brand,
    });
  }
}
unpatch();

// Markdown report
const md = [
  "# Headless Economy Simulation — Step 2 vorher/nachher",
  "",
  `Generiert: ${new Date().toISOString()}`,
  "",
  "40 Quartale (1983 Q1 – 1992 Q4), 3 Strategien, jeweils mit altem ($5M Start, sqrt-unbounded Marketing, flat $60k Gehalt, keine Portfolio/Paradigm-Logik) und neuem Balancing.",
  "",
  "| Mode | Strategie | Final Cash | Min Cash | Peak Cash | Total Revenue | Total Units | Bankrott Q | Final Brand |",
  "|---|---|---:|---:|---:|---:|---:|---:|---:|",
  ...summary.map(r => `| ${r.mode} | ${r.strat} | $${r.finalCash.toLocaleString()} | $${r.minCash.toLocaleString()} | $${r.peakCash.toLocaleString()} | $${r.totalRevenue.toLocaleString()} | ${r.totalUnits.toLocaleString()} | ${r.bankruptQuarter ?? "—"} | ${r.finalBrand} |`),
  "",
  "## Interpretation",
  "- **Cheap Z80 spam** sollte nachher früher unter Druck geraten (kleineres Polster, kein unbegrenztes Marketing-Snowball, GUI-Malus ab 1989).",
  "- **Mid-tech premium** sollte robust bleiben — Spec-Match und gemäßigtes Marketing.",
  "- **R&D-heavy** ist der Stresstest: lange Aufbauphase. Vorher leicht überlebbar dank $5M Start, nachher knapp — zeigt, ob das neue Tuning fair bleibt.",
  "",
  "CSV-Trajektorien je Lauf liegen im selben Ordner.",
].join("\n");
writeFileSync(`${outDir}/REPORT.md`, md);

console.log("Wrote results to", outDir);
for (const r of summary) {
  console.log(`[${r.mode}] ${r.strat}: finalCash=$${r.finalCash.toLocaleString()} bankruptQ=${r.bankruptQuarter ?? "-"}`);
}
