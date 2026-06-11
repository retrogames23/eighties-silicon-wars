// Überarbeitetes Wirtschafts-System mit korrekter Drei-Tier-Gewinn-Kalkulation.
//
// REFACTOR (Konzept v2):
//   - Drei-Tier-Accounting: Direct (BOM) | Amortized (Dev) | Period (Marketing/F&E/Overhead)
//   - Periodenkosten werden NICHT mehr pro Modell verbucht (Doppelbuchung beseitigt).
//     Marketing/F&E werden zentral in GameMechanics.processQuarterTurn als Quartalsausgaben
//     gebucht. EconomyModel berechnet pro Modell nur noch Direct- und Amortized-Kosten.
//   - Margen-Korridore (Verkaufspreis ggü. BOM, Brutto):
//       Budget-Segment      : 25–35 %
//       Mid-Range           : 35–50 %
//       Premium             : 50–65 %
//   - Inflation 3 %/Jahr auf BOM, Gehälter, Marketing-Effizienz.
//   - Markt-Events können BOM-Multiplikator setzen (price_multiplier aus market_events).
//
// Der "alte" Marketing-pro-Einheit-Posten bleibt als reiner Reporting-Wert in der
// ProfitBreakdown enthalten (zur Anzeige der effektiven Marketing-Last je Modell),
// fließt aber NICHT mehr in netProfit ein, um Doppelbuchung zu vermeiden.

import { HardwareManager, type HardwareComponent } from "@/utils/HardwareManager";
import { type Competitor, type CompetitorModel } from "@/lib/game";
import { mulberry32 } from "@/lib/game/rng";
import { priceSanityFactor } from "@/lib/game/AntiExploit";
import {
  getParadigmMaxPriceMultiplier,
  getParadigmSegmentSizeMultiplier,
  getParadigmAppealDelta,
  type Segment,
} from "@/lib/game/ParadigmEvents";

// Preisverfall-Konstanten pro Komponententyp (pro Quartal)
export const PRICE_DECAY_RATES = {
  cpu: 0.03,
  gpu: 0.04,
  memory: 0.05,
  sound: 0.02,
  storage: 0.03,
  display: 0.025,
} as const;

// Jährliche Inflationsrate
export const ANNUAL_INFLATION = 0.03;

// Margen-Korridore pro Preis-Segment (Brutto = (Price-BOM)/Price)
export const MARGIN_CORRIDORS = {
  budget:   { min: 0.25, max: 0.35 },
  midrange: { min: 0.35, max: 0.50 },
  premium:  { min: 0.50, max: 0.65 },
} as const;

export type PriceTier = keyof typeof MARGIN_CORRIDORS;

export interface ProfitBreakdown {
  revenue: number;
  bomCosts: number;            // Direct: Bill of Materials × Stückzahl
  developmentCosts: number;    // Amortized: anteilige Dev-Kosten
  marketingCosts: number;      // INFO ONLY (nicht in netProfit!)
  productionCosts: number;     // Direct: Fertigung 8 % BOM
  fixedOverhead: number;       // Direct: $50 / Einheit (Logistik etc.)
  grossProfit: number;         // revenue − bomCosts
  netProfit: number;           // revenue − (bom + dev + production + overhead)
  grossMargin: number;         // grossProfit / revenue (0..1)
  priceTier: PriceTier;
}

export interface DemandFactors {
  baseAppeal: number;
  priceElasticity: number;
  competitionFactor: number;
  obsolescenceFactor: number;
  seasonalityFactor: number;
  marketingBoost: number;
}

export interface SalesSimulationResult {
  unitsSold: number;
  revenue: number;
  profitBreakdown: ProfitBreakdown;
  demandFactors: DemandFactors;
  segmentBreakdown: Record<string, {
    units: number;
    revenue: number;
    appeal: number;
  }>;
}

export interface EconomyContext {
  /** BOM-Preis-Multiplikator aus aktiven Markt-Events (z.B. RAM-Knappheit). */
  bomMultiplier?: number;
  /** Globaler Nachfrage-Multiplikator aus Markt-Events. */
  demandMultiplier?: number;
  /** Markt-Anteils-Verteilung pro Segment (kommt aus Portfolio-Sim). 0..1 */
  segmentShareOverride?: Partial<Record<'gamer' | 'business' | 'workstation', number>>;
  /**
   * Deterministischer Quartals-Seed (anti-save-scum). Wenn gesetzt, wird die
   * stochastische Verkaufs-Varianz aus diesem Seed gezogen statt aus Math.random().
   */
  rngSeed?: number;
  /**
   * Vorberechneter KI-Druck pro Segment (0..1). 0 = kein Druck, 0.5 = halbierter
   * verfügbarer Markt. Speist aktive AiCompetitor-Stati in die Sim.
   */
  aiCompetitorPressure?: Partial<Record<'gamer' | 'business' | 'workstation', number>>;
  /**
   * Persistenter Marken-Bekanntheitsgrad 0..100. Wird über Quartale aufgebaut/zerfällt
   * und multipliziert die effektive Marketing-Wirkung. Verhindert Snowball aus reinem
   * Cash-Marketing in einem einzelnen Quartal.
   */
  brandAwareness?: number;
  /**
   * Anzahl aktiver Modelle im Verkauf. >8 löst Komplexitäts-Malus aus
   * (Vertriebs-Overhead, Verwirrung im Kanal): −10 % je zusätzlichem Modell.
   */
  activeModelCount?: number;
  /** Intern: BOM-Cost-Hint zur Preis-Sanity-Berechnung in der Segment-Schleife. */
  _bomCostHint?: number;
  /**
   * Schwierigkeits-abhängiger Override des Marketing-Sättigungspunkts (nominal $).
   * Wenn gesetzt, ersetzt er den Default in `calculateMarketingEffectiveness`.
   * Niedriger = Marketing wird schneller ineffizient (Schwer).
   */
  marketingSaturationPoint?: number;
}

export class EconomyModel {

  /** Inflations-Faktor relativ zu 1983. */
  static getInflationFactor(year: number): number {
    return Math.pow(1 + ANNUAL_INFLATION, Math.max(0, year - 1983));
  }

  /** Bestimmt Preis-Tier eines Modells aus dem Verkaufspreis. */
  static classifyPriceTier(price: number, year: number): PriceTier {
    const infl = this.getInflationFactor(year);
    if (price < 700 * infl) return 'budget';
    if (price < 2200 * infl) return 'midrange';
    return 'premium';
  }

  /**
   * Hauptfunktion: Simuliert Verkäufe mit Drei-Tier-Kostenmodell.
   * Periodenkosten (Marketing/F&E/Gehälter) werden NICHT hier abgezogen.
   */
  static simulateModelSales(
    model: any,
    marketingBudget: number,
    playerReputation: number,
    competitors: Competitor[],
    year: number,
    quarter: number,
    marketSize: number = 100000,
    context: EconomyContext = {}
  ): SalesSimulationResult {
    const bomCosts = this.calculateBOMCostsWithDecay(model, year, quarter, context.bomMultiplier ?? 1);

    // Anti-Exploit: Preis-Sanity (Dumping unter BOM, Trust-Schwelle nach unten).
    const contextWithBom: EconomyContext = { ...context, _bomCostHint: bomCosts };

    const demandSimulation = this.simulateMarketDemand(
      model, competitors, year, quarter, marketSize, marketingBudget, playerReputation, contextWithBom
    );

    const profitBreakdown = this.calculateProfitBreakdown(
      model, demandSimulation.unitsSold, bomCosts, marketingBudget, year
    );

    return {
      unitsSold: demandSimulation.unitsSold,
      revenue: profitBreakdown.revenue,
      profitBreakdown,
      demandFactors: demandSimulation.demandFactors,
      segmentBreakdown: demandSimulation.segmentBreakdown,
    };
  }

  /**
   * BOM-Kosten mit Preisverfall, Inflation und Event-Multiplikator.
   */
  static calculateBOMCostsWithDecay(
    model: any,
    currentYear: number,
    currentQuarter: number,
    eventMultiplier: number = 1
  ): number {
    const baseCost = HardwareManager.calculateModelCost(model);
    const quartersSinceStart = (currentYear - 1983) * 4 + (currentQuarter - 1);

    const components = ['cpu', 'gpu', 'memory', 'sound'] as const;
    let adjustedCost = 0;

    components.forEach(compType => {
      const compData = this.getComponentData(model, compType);
      if (compData) {
        const decayRate = PRICE_DECAY_RATES[compType] || 0.03;
        const currentPrice = compData.cost * Math.pow(1 - decayRate, quartersSinceStart);
        adjustedCost += Math.max(compData.cost * 0.3, currentPrice);
      }
    });

    const accessoryCost = (baseCost - this.getBaseComponentsCost(model)) * Math.pow(0.98, quartersSinceStart);
    adjustedCost += Math.max(accessoryCost * 0.5, accessoryCost);

    // Inflation auf finale BOM
    adjustedCost *= this.getInflationFactor(currentYear);
    // Markt-Events (z.B. RAM-Knappheit)
    adjustedCost *= eventMultiplier;

    return Math.round(adjustedCost);
  }

  static simulateMarketDemand(
    model: any,
    competitors: Competitor[],
    year: number,
    quarter: number,
    totalMarketSize: number,
    marketingBudget: number,
    playerReputation: number,
    context: EconomyContext = {}
  ): {
    unitsSold: number;
    demandFactors: DemandFactors;
    segmentBreakdown: Record<string, { units: number; revenue: number; appeal: number }>;
  } {
    const segments = ['gamer', 'business', 'workstation'] as const;
    const segmentSizes = {
      gamer: Math.round((90000 + (year - 1983) * 22000) * getParadigmSegmentSizeMultiplier('gamer', year, quarter)),
      business: Math.round((30000 + (year - 1983) * 8000) * getParadigmSegmentSizeMultiplier('business', year, quarter)),
      workstation: Math.round(Math.max(0, (year >= 1987 ? 4000 + (year - 1987) * 1500 : 0)) * getParadigmSegmentSizeMultiplier('workstation', year, quarter)),
    };

    let totalUnitsSold = 0;
    const segmentBreakdown: Record<string, { units: number; revenue: number; appeal: number }> = {};

    const obsolescenceFactor = this.calculateObsolescenceFactor(
      model.releaseYear || year,
      model.releaseQuarter || quarter,
      year,
      quarter
    ) * this.calculateGenerationFactor(model, year, quarter);
    const marketingBoost = this.calculateMarketingEffectiveness(
      marketingBudget, playerReputation, year, context.brandAwareness ?? 0, context.marketingSaturationPoint,
    );
    const seasonalityFactor = this.getSeasonalityFactor(quarter);
    const demandEvent = context.demandMultiplier ?? 1;

    // Portfolio-Komplexitäts-Malus: >8 aktive Modelle erzeugen Vertriebs-Overhead.
    const activeCount = context.activeModelCount ?? 0;
    const portfolioMalus = activeCount > 8 ? Math.pow(0.9, activeCount - 8) : 1;

    // Deterministisches RNG für Verkaufs-Varianz (Save-Scum-Schutz).
    const rand = context.rngSeed !== undefined ? mulberry32(context.rngSeed) : Math.random;

    segments.forEach(segment => {
      const segmentSize = segmentSizes[segment];
      if (segmentSize === 0) {
        segmentBreakdown[segment] = { units: 0, revenue: 0, appeal: 0 };
        return;
      }

      const baseAppeal = this.calculateSegmentAppeal(model, segment, year, quarter) / 100;
      const maxPrice = this.getSegmentMaxPrice(segment, year, quarter);
      const priceElasticity = this.calculatePriceElasticity(model.price, maxPrice, segment);
      let competitionFactor = this.calculateCompetitionImpact(model, competitors, segment);

      // KI-Druck zieht zusätzlich vom verfügbaren Markt ab.
      const aiPressure = context.aiCompetitorPressure?.[segment] ?? 0;
      competitionFactor *= Math.max(0.3, 1 - Math.min(0.5, aiPressure));

      // Anti-Exploit: Preis-Sanity (Dumping unter BOM, Trust bei extrem niedrigem Preis).
      const bomHint = context._bomCostHint ?? 0;
      const sanity = priceSanityFactor(model.price, bomHint, maxPrice);

      const demandMultiplier =
        baseAppeal *
        priceElasticity *
        sanity.multiplier *
        competitionFactor *
        obsolescenceFactor *
        seasonalityFactor *
        marketingBoost *
        demandEvent *
        portfolioMalus;

      // Optionaler Portfolio-Marktanteils-Override (Kannibalisierung).
      const shareOverride = context.segmentShareOverride?.[segment];

      // Tier-spezifische Marktdurchdringung:
      //   Budget   = Massenmarkt → höheres Cap und Floor (kommt auch ohne Marketing an).
      //   Midrange = klassischer Mittelweg.
      //   Premium  = Nische → kleineres Cap, kleinerer Floor.
      // So skaliert eine konsequente Billig-Strategie über Stückzahl mit Premium,
      // und Premium kann nicht 60 % eines Segments allein abgreifen.
      const tier = this.classifyPriceTier(model.price, year);
      const band =
        tier === 'budget'   ? { floor: 0.018, cap: 0.26 } :
        tier === 'midrange' ? { floor: 0.007, cap: 0.10 } :
                              { floor: 0.003, cap: 0.032 };

      // Segment-Fit: Strategie-Konsistenz wird belohnt, Mismatch stark bestraft.
      //   Premium gehört in die Workstation (zahlungskräftige Profis).
      //   Mid-Range ins Business (Standard-Bürorechner).
      //   Budget zu Gamern (Mass-Market-Heimcomputer).
      // Premium-Produkte verkaufen sich kaum an Mainstream-Business: Einkäufer
      // wollen Standard-PCs, keine teuren Spezialmaschinen.
      const fit =
        (tier === 'premium'  && segment === 'gamer')       ? 0.25 :
        (tier === 'premium'  && segment === 'business')    ? 0.25 :
        (tier === 'premium'  && segment === 'workstation') ? 1.35 :
        (tier === 'midrange' && segment === 'workstation') ? 0.55 :
        (tier === 'midrange' && segment === 'business')    ? 1.20 :
        (tier === 'budget'   && segment === 'workstation') ? 0.20 :
        (tier === 'budget'   && segment === 'business')    ? 0.45 :
        (tier === 'budget'   && segment === 'gamer')       ? 1.25 :
        1.0;

      const cap = band.cap * fit;
      // Tier-spezifische Konversionsrate: Massenmarkt konvertiert deutlich leichter
      // (Heimcomputer wurden in den 80ern oft impulsgetrieben gekauft), Premium ist
      // ein langer Verkaufszyklus mit hoher Hürde.
      const conv = tier === 'budget' ? 0.14 : tier === 'midrange' ? 0.06 : 0.014;
      const marketPenetration = Math.min(cap, Math.max(band.floor, demandMultiplier * conv));
      const baseUnits = segmentSize * marketPenetration;
      const segmentUnits = Math.floor(
        (shareOverride !== undefined ? baseUnits * shareOverride : baseUnits) *
        (0.85 + rand() * 0.3)
      );

      segmentBreakdown[segment] = {
        units: segmentUnits,
        revenue: segmentUnits * model.price,
        appeal: baseAppeal * 100,
      };

      totalUnitsSold += segmentUnits;
    });

    // Korrekte Segment-gewichtete Mittelwerte (vorher: hartcodiert business + maxPrice=1500).
    const segs = ['gamer', 'business', 'workstation'] as const;
    const avgElasticity = segs.reduce((sum, s) =>
      sum + this.calculatePriceElasticity(model.price, this.getSegmentMaxPrice(s, year, quarter), s), 0) / segs.length;
    const avgCompetition = segs.reduce((sum, s) =>
      sum + this.calculateCompetitionImpact(model, competitors, s), 0) / segs.length;

    const averageDemandFactors: DemandFactors = {
      baseAppeal: Object.values(segmentBreakdown).reduce((sum, seg) => sum + seg.appeal, 0) / 3,
      priceElasticity: avgElasticity,
      competitionFactor: avgCompetition,
      obsolescenceFactor,
      seasonalityFactor,
      marketingBoost,
    };

    return {
      unitsSold: totalUnitsSold,
      demandFactors: averageDemandFactors,
      segmentBreakdown,
    };
  }

  static calculateObsolescenceFactor(
    releaseYear: number,
    releaseQuarter: number,
    currentYear: number,
    currentQuarter: number
  ): number {
    const quartersSinceRelease = (currentYear - releaseYear) * 4 + (currentQuarter - releaseQuarter);
    return Math.max(0.2, 1.0 - (quartersSinceRelease * 0.15));
  }

  static calculatePriceElasticity(price: number, maxPrice: number, segment: string): number {
    const elasticityFactors = { gamer: 0.7, business: 0.4, workstation: 0.2 };
    const elasticity = elasticityFactors[segment as keyof typeof elasticityFactors] || 0.5;

    if (price > maxPrice) {
      return Math.exp(-((price - maxPrice) / maxPrice) * elasticity * 3);
    }
    const optimalPrice = maxPrice * 0.7;
    if (price <= optimalPrice) return 1.0;
    const x = (price - optimalPrice) / (maxPrice - optimalPrice);
    return 1 / (1 + Math.exp((x - 0.5) * 8));
  }

  /**
   * Drei-Tier-Aufschlüsselung. Periodenkosten (Marketing/F&E/Gehalt) werden
   * hier NICHT mehr abgezogen — die werden zentral pro Quartal gebucht.
   */
  static calculateProfitBreakdown(
    model: any,
    unitsSold: number,
    bomCosts: number,
    marketingBudget: number,
    year: number
  ): ProfitBreakdown {
    const revenue = unitsSold * model.price;
    const totalBOMCosts = bomCosts * unitsSold;

    // AMORTIZED: erwartete Lebenszeit-Stückzahl (8 Quartale typisch).
    // Conservativ: höchstens 10 % vom Stückpreis als anteilige Dev-Kosten.
    const estimatedLifetimeUnits = Math.max(1, unitsSold * 8);
    const developmentCostPerUnit = Math.min(
      model.price * 0.1,
      (model.developmentCost || 0) / estimatedLifetimeUnits
    );
    const developmentCosts = developmentCostPerUnit * unitsSold;

    // Reine Reporting-Kennzahl: was würde Marketing pro Einheit kosten?
    // Geht NICHT in netProfit ein (Periodenkosten zentral verbucht).
    const marketingCosts = unitsSold > 0 ? marketingBudget : 0;

    // Direct: Fertigungs-Overhead.
    const productionCosts = totalBOMCosts * 0.08;

    // Direct: Logistik/Verpackung pro Einheit, mit Inflation.
    const fixedOverhead = unitsSold * 50 * this.getInflationFactor(year);

    const grossProfit = revenue - totalBOMCosts;
    const netProfit = revenue - (totalBOMCosts + developmentCosts + productionCosts + fixedOverhead);
    const grossMargin = revenue > 0 ? grossProfit / revenue : 0;
    const priceTier = this.classifyPriceTier(model.price, year);

    return {
      revenue,
      bomCosts: totalBOMCosts,
      developmentCosts: Math.round(developmentCosts),
      marketingCosts: Math.round(marketingCosts),
      productionCosts: Math.round(productionCosts),
      fixedOverhead: Math.round(fixedOverhead),
      grossProfit,
      netProfit: Math.round(netProfit),
      grossMargin,
      priceTier,
    };
  }

  // Helper-Funktionen
  static getComponentData(model: any, compType: string): { cost: number } | null {
    switch (compType) {
      case 'cpu': return HardwareManager.getComponentByCPU(model.cpu);
      case 'gpu': return HardwareManager.getComponentByGPU(model.gpu);
      case 'memory': return HardwareManager.getComponentByRAM(model.ram);
      case 'sound': return HardwareManager.getComponentBySound(model.sound);
      default: return null;
    }
  }

  static getBaseComponentsCost(model: any): number {
    const cpu = HardwareManager.getComponentByCPU(model.cpu)?.cost || 50;
    const gpu = HardwareManager.getComponentByGPU(model.gpu)?.cost || 30;
    const ram = HardwareManager.getComponentByRAM(model.ram)?.cost || 40;
    const sound = HardwareManager.getComponentBySound(model.sound)?.cost || 5;
    return cpu + gpu + ram + sound;
  }

  /**
   * Segment-Attraktivität getrieben von tatsächlichen Hardware-Specs.
   * 30 % statischer Marken-Baseline + 70 % Spec-Score relativ zum
   * "Stand der Technik" des aktuellen Jahres. Verschiedene Segmente gewichten
   * Komponenten unterschiedlich (Gamer ≠ Business ≠ Workstation).
   */
  static calculateSegmentAppeal(model: any, segment: string, year: number, quarter: number = 1): number {
    const baselineBrand = 35; // Marken-/Marketing-Grundsockel
    const yearBoost = (year - 1983) * 1.5;

    // Segment-spezifische Gewichtungen (Summe = 1.0)
    const weights: Record<string, Record<string, number>> = {
      gamer:       { cpu: 0.20, gpu: 0.35, ram: 0.15, sound: 0.20, storage: 0.10 },
      business:    { cpu: 0.30, gpu: 0.05, ram: 0.30, sound: 0.05, storage: 0.15, display: 0.15 },
      workstation: { cpu: 0.35, gpu: 0.10, ram: 0.30, sound: 0.05, storage: 0.20 },
    };
    const w = weights[segment] || weights.business;

    const perf = {
      cpu: HardwareManager.getComponentByCPU(model.cpu)?.performance ?? 10,
      gpu: HardwareManager.getComponentByGPU(model.gpu)?.performance ?? 10,
      ram: HardwareManager.getComponentByRAM(model.ram)?.performance ?? 10,
      sound: HardwareManager.getComponentBySound(model.sound)?.performance ?? 5,
      storage: this.guessAccessoryPerformance(model, 'storage'),
      display: this.guessAccessoryPerformance(model, 'display'),
    };

    // "Stand der Technik": maximale verfügbare Performance dieses Komponententyps
    // im aktuellen Jahr — definiert den 100 %-Maßstab.
    const sota = this.getSotaPerformance(year);

    let specScore = 0;
    for (const key of Object.keys(w)) {
      const ratio = Math.min(1.2, (perf as any)[key] / Math.max(1, (sota as any)[key]));
      specScore += w[key] * ratio;
    }
    // specScore liegt typischerweise in [0.1, 1.2].

    let appeal = baselineBrand + yearBoost + specScore * 55;
    // Paradigm-Events (z.B. GUI-Erwartung 1989) addieren/subtrahieren Appeal.
    appeal += getParadigmAppealDelta(model, segment as Segment, year, quarter, perf.ram, perf.gpu);
    return Math.max(5, Math.min(100, appeal));
  }

  /** Liefert die jeweils stärkste verfügbare Performance je Komponententyp. */
  private static sotaCache: Record<number, Record<string, number>> = {};
  static getSotaPerformance(year: number): Record<string, number> {
    if (this.sotaCache[year]) return this.sotaCache[year];
    const comps = HardwareManager.getAvailableComponents(year, 4, []);
    const max = (type: string) =>
      comps.filter(c => c.type === type && c.available).reduce((m, c) => Math.max(m, c.performance), 10);
    const sota = {
      cpu: max('cpu'),
      gpu: max('gpu'),
      ram: max('memory'),
      sound: max('sound'),
      storage: max('storage'),
      display: max('display'),
    };
    this.sotaCache[year] = sota;
    return sota;
  }

  /** Storage/Display kommen aus model.accessories (Strings). Heuristik via HardwareManager. */
  static guessAccessoryPerformance(model: any, type: 'storage' | 'display'): number {
    if (!model.accessories || !Array.isArray(model.accessories)) return 15;
    const candidates = (type === 'storage'
      ? ['Kassettenlaufwerk', 'Diskettenlaufwerk 5.25"', 'Diskettenlaufwerk 3.5"',
         'Festplatte 5MB', 'Festplatte 10MB', 'Festplatte 20MB', 'CD-ROM Drive']
      : ['RF Modulator', 'Composite Monitor', 'RGB Monitor',
         'EGA Monitor', 'VGA Monitor', 'Multisync Monitor']);
    const present = model.accessories.filter((a: string) => candidates.includes(a));
    if (present.length === 0) return 15;
    // Performance-Score grob aus dem HardwareManager-Baseline (gleiche Reihenfolge → steigend).
    const ranks: Record<string, number> = {
      'Kassettenlaufwerk': 10, 'Diskettenlaufwerk 5.25"': 35, 'Diskettenlaufwerk 3.5"': 50,
      'Festplatte 5MB': 60, 'Festplatte 10MB': 65, 'Festplatte 20MB': 70, 'CD-ROM Drive': 55,
      'RF Modulator': 15, 'Composite Monitor': 35, 'RGB Monitor': 65,
      'EGA Monitor': 75, 'VGA Monitor': 85, 'Multisync Monitor': 95,
    };
    return Math.max(...present.map((p: string) => ranks[p] ?? 15));
  }

  /**
   * Generationen-Malus: ein 8-bit-Modell, das gegen verfügbare 32-bit-Konkurrenz
   * antritt, verliert Attraktivität — unabhängig vom Modell-Alter.
   * 25 % Abschlag pro Generation Rückstand.
   */
  static calculateGenerationFactor(model: any, year: number, quarter: number): number {
    const modelGen = this.getCpuGeneration(model.cpu);
    const marketGen = this.getMarketMaxGeneration(year, quarter);
    const gap = Math.max(0, marketGen - modelGen);
    return Math.pow(0.75, gap);
  }

  /** CPU → Tech-Generation (1=8-bit, 2=16-bit, 3=32-bit). */
  static getCpuGeneration(cpu: string): 1 | 2 | 3 {
    if (!cpu) return 1;
    const gen32 = ['Intel 80386', 'Intel 80486'];
    const gen16 = ['Intel 8086', 'Motorola 68000', 'Intel 80286'];
    if (gen32.some(n => cpu.includes(n))) return 3;
    if (gen16.some(n => cpu.includes(n))) return 2;
    return 1;
  }

  /** Höchste am Markt verfügbare CPU-Generation zu (year, quarter). */
  static getMarketMaxGeneration(year: number, quarter: number): 1 | 2 | 3 {
    // 32-bit ab Q1/1986 (80386), 16-bit ab Q1/1984 (8086).
    if (year > 1986 || (year === 1986 && quarter >= 1)) return 3;
    if (year > 1984 || (year === 1984 && quarter >= 1)) return 2;
    return 1;
  }


  static getSegmentMaxPrice(segment: string, year: number, quarter: number = 1): number {
    const basePrices = { gamer: 800, business: 2000, workstation: 5000 };
    const basePrice = basePrices[segment as keyof typeof basePrices] || 1000;
    const stepped = basePrice + (year - 1983) * (segment === 'gamer' ? 100 : segment === 'business' ? 500 : 1000);
    // Inflations-Aufschlag + Paradigm-Event-Multiplikator (z.B. Preisschlacht 1983).
    return stepped * this.getInflationFactor(year) * getParadigmMaxPriceMultiplier(segment as Segment, year, quarter);
  }

  static calculateCompetitionImpact(model: any, competitors: Competitor[], segment: string): number {
    const similarPriceCompetitors = competitors.reduce((count, comp) => {
      return count + comp.models.filter(m => Math.abs(m.price - model.price) < model.price * 0.3).length;
    }, 0);
    return Math.max(0.4, 1.0 - (similarPriceCompetitors * 0.1));
  }

  /**
   * Marketing-Wirkung mit Diminishing Returns, hartem Cap und Brand-Awareness.
   * - sqrt-Kurve bis $500k (Inflations-adjustiert), danach log-Sättigung
   * - Hard-Cap bei Faktor 2.5 (kein unbegrenzter Snowball mehr)
   * - Brand-Awareness (0..100) multipliziert zusätzlich (0.7..1.4)
   */
  static calculateMarketingEffectiveness(
    marketingBudget: number, reputation: number, year: number = 1983, brandAwareness: number = 0
  ): number {
    const infl = this.getInflationFactor(year);
    const baseBudget = 25000 * infl;
    const saturationPoint = 500000 * infl;

    let effectiveness: number;
    if (marketingBudget <= saturationPoint) {
      effectiveness = Math.sqrt(marketingBudget / baseBudget);
    } else {
      // Über Sättigungspunkt: nur noch log-Wachstum.
      const baseAtSat = Math.sqrt(saturationPoint / baseBudget);
      const overflow = (marketingBudget - saturationPoint) / saturationPoint;
      effectiveness = baseAtSat + Math.log(1 + overflow) * 0.3;
    }

    // Reputation- und Brand-Awareness-Multiplikator.
    // Step-2-Tuning: kleinere Brand-Strafe am Start (0.85 statt 0.7) — sonst killt
    // der Brand=0-Malus jede Garagenfirma. Maximaler Brand-Bonus bleibt erhalten.
    const repMult = 0.8 + reputation / 100 * 0.4;
    const brandMult = 0.85 + (brandAwareness / 100) * 0.55;
    effectiveness *= repMult * brandMult;

    // Hard-Cap bei 2.5 (vorher 3.0).
    return Math.max(0.5, Math.min(2.5, effectiveness));
  }

  static getSeasonalityFactor(quarter: number): number {
    const factors = { 1: 0.8, 2: 1.0, 3: 1.1, 4: 1.4 };
    return factors[quarter as keyof typeof factors] || 1.0;
  }
}
