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
}

export class EconomyModel {

  /** Inflations-Faktor relativ zu 1983. */
  static getInflationFactor(year: number): number {
    return Math.pow(1 + ANNUAL_INFLATION, Math.max(0, year - 1983));
  }

  /** Bestimmt Preis-Tier eines Modells aus dem Verkaufspreis. */
  static classifyPriceTier(price: number, year: number): PriceTier {
    const infl = this.getInflationFactor(year);
    if (price < 800 * infl) return 'budget';
    if (price < 2500 * infl) return 'midrange';
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

    const demandSimulation = this.simulateMarketDemand(
      model, competitors, year, quarter, marketSize, marketingBudget, playerReputation, context
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
      gamer: 70000 + (year - 1983) * 15000,
      business: 30000 + (year - 1983) * 8000,
      workstation: Math.max(0, (year >= 1987 ? 5000 + (year - 1987) * 2000 : 0)),
    };

    let totalUnitsSold = 0;
    const segmentBreakdown: Record<string, { units: number; revenue: number; appeal: number }> = {};

    const obsolescenceFactor = this.calculateObsolescenceFactor(
      model.releaseYear || year,
      model.releaseQuarter || quarter,
      year,
      quarter
    );
    const marketingBoost = this.calculateMarketingEffectiveness(marketingBudget, playerReputation, year);
    const seasonalityFactor = this.getSeasonalityFactor(quarter);
    const demandEvent = context.demandMultiplier ?? 1;

    segments.forEach(segment => {
      const segmentSize = segmentSizes[segment];
      if (segmentSize === 0) {
        segmentBreakdown[segment] = { units: 0, revenue: 0, appeal: 0 };
        return;
      }

      const baseAppeal = this.calculateSegmentAppeal(model, segment, year) / 100;
      const maxPrice = this.getSegmentMaxPrice(segment, year);
      const priceElasticity = this.calculatePriceElasticity(model.price, maxPrice, segment);
      const competitionFactor = this.calculateCompetitionImpact(model, competitors, segment);

      const demandMultiplier =
        baseAppeal *
        priceElasticity *
        competitionFactor *
        obsolescenceFactor *
        seasonalityFactor *
        marketingBoost *
        demandEvent;

      // Optionaler Portfolio-Marktanteils-Override (Kannibalisierung).
      const shareOverride = context.segmentShareOverride?.[segment];
      const marketPenetration = Math.min(0.08, Math.max(0.005, demandMultiplier * 0.03));
      const baseUnits = segmentSize * marketPenetration;
      const segmentUnits = Math.floor(
        (shareOverride !== undefined ? baseUnits * shareOverride : baseUnits) *
        (0.85 + Math.random() * 0.3)
      );

      segmentBreakdown[segment] = {
        units: segmentUnits,
        revenue: segmentUnits * model.price,
        appeal: baseAppeal * 100,
      };

      totalUnitsSold += segmentUnits;
    });

    const averageDemandFactors: DemandFactors = {
      baseAppeal: Object.values(segmentBreakdown).reduce((sum, seg) => sum + seg.appeal, 0) / 3,
      priceElasticity: this.calculatePriceElasticity(model.price, 1500, 'business'),
      competitionFactor: this.calculateCompetitionImpact(model, competitors, 'business'),
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

  static calculateSegmentAppeal(model: any, segment: string, year: number): number {
    const baseAppeal = 50 + (year - 1983) * 5;
    return Math.min(100, baseAppeal + Math.random() * 20);
  }

  static getSegmentMaxPrice(segment: string, year: number): number {
    const basePrices = { gamer: 800, business: 2000, workstation: 5000 };
    const basePrice = basePrices[segment as keyof typeof basePrices] || 1000;
    const stepped = basePrice + (year - 1983) * (segment === 'gamer' ? 100 : segment === 'business' ? 500 : 1000);
    // Inflations-Aufschlag obendrauf
    return stepped * this.getInflationFactor(year);
  }

  static calculateCompetitionImpact(model: any, competitors: Competitor[], segment: string): number {
    const similarPriceCompetitors = competitors.reduce((count, comp) => {
      return count + comp.models.filter(m => Math.abs(m.price - model.price) < model.price * 0.3).length;
    }, 0);
    return Math.max(0.4, 1.0 - (similarPriceCompetitors * 0.1));
  }

  static calculateMarketingEffectiveness(marketingBudget: number, reputation: number, year: number = 1983): number {
    // Inflation: gleicher nominaler Marketing-Einsatz wirkt schwächer in späteren Jahren.
    const baseBudget = 25000 * this.getInflationFactor(year);
    const effectiveness = Math.sqrt(marketingBudget / baseBudget) * (0.8 + reputation / 100 * 0.4);
    return Math.max(0.5, Math.min(3.0, effectiveness));
  }

  static getSeasonalityFactor(quarter: number): number {
    const factors = { 1: 0.8, 2: 1.0, 3: 1.1, 4: 1.4 };
    return factors[quarter as keyof typeof factors] || 1.0;
  }
}
