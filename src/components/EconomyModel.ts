// Überarbeitetes Wirtschafts-System mit korrekter Gewinn-Kalkulation
import { HardwareManager, type HardwareComponent } from "@/utils/HardwareManager";
import { type Competitor, type CompetitorModel } from "@/lib/game";

// Preisverfall-Konstanten pro Komponententyp (pro Quartal)
export const PRICE_DECAY_RATES = {
  cpu: 0.03,     // 3% pro Quartal
  gpu: 0.04,     // 4% pro Quartal  
  memory: 0.05,  // 5% pro Quartal (RAM fällt schnell)
  sound: 0.02,   // 2% pro Quartal (langsamer)
  storage: 0.03, // 3% pro Quartal
  display: 0.025 // 2.5% pro Quartal
} as const;

export interface ProfitBreakdown {
  revenue: number;
  bomCosts: number;           // Bill of Materials (Hardware-Kosten)
  developmentCosts: number;   // Amortisierte Entwicklungskosten
  marketingCosts: number;     // Marketing pro verkaufter Einheit
  productionCosts: number;    // Fertigungskosten pro Einheit
  fixedOverhead: number;      // Fixkosten pro Einheit
  grossProfit: number;        // revenue - bomCosts
  netProfit: number;          // Finaler Gewinn
}

export interface DemandFactors {
  baseAppeal: number;         // Produkt-Attraktivität für Zielgruppe
  priceElasticity: number;    // Preissensitivität (0-1)
  competitionFactor: number;  // Konkurrenz-Einfluss (0-1) 
  obsolescenceFactor: number; // Veralterung über Zeit (0-1)
  seasonalityFactor: number;  // Saisonale Effekte (0.8-1.4)
  marketingBoost: number;     // Marketing-Verstärkung (0.5-3.0)
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

export class EconomyModel {
  
  /**
   * Hauptfunktion: Simuliert Verkäufe mit korrekter Gewinn-Kalkulation
   */
  static simulateModelSales(
    model: any,
    marketingBudget: number,
    playerReputation: number,
    competitors: Competitor[],
    year: number,
    quarter: number,
    marketSize: number = 100000
  ): SalesSimulationResult {
    console.log(`🧮 [EconomyModel] Simulating sales for ${model.name} in Q${quarter}/${year}`);
    
    // 1. Berechne BOM-Kosten mit Preisverfall
    const bomCosts = this.calculateBOMCostsWithDecay(model, year, quarter);
    
    // 2. Simuliere Nachfrage mit allen Faktoren
    const demandSimulation = this.simulateMarketDemand(
      model, competitors, year, quarter, marketSize, marketingBudget, playerReputation
    );
    
    // 3. Berechne Gewinn-Aufschlüsselung
    const profitBreakdown = this.calculateProfitBreakdown(
      model, demandSimulation.unitsSold, bomCosts, marketingBudget
    );
    
    console.log(`📊 Sales Result: ${demandSimulation.unitsSold} units, $${profitBreakdown.revenue.toLocaleString()} revenue, $${profitBreakdown.netProfit.toLocaleString()} profit`);
    console.log(`📉 Obsolescence: ${(demandSimulation.demandFactors.obsolescenceFactor * 100).toFixed(1)}%, Price Elasticity: ${(demandSimulation.demandFactors.priceElasticity * 100).toFixed(1)}%`);
    
    return {
      unitsSold: demandSimulation.unitsSold,
      revenue: profitBreakdown.revenue,
      profitBreakdown,
      demandFactors: demandSimulation.demandFactors,
      segmentBreakdown: demandSimulation.segmentBreakdown
    };
  }
  
  /**
   * Berechnet BOM-Kosten mit quartalsweisem Preisverfall
   */
  static calculateBOMCostsWithDecay(
    model: any, 
    currentYear: number, 
    currentQuarter: number
  ): number {
    // Basis-Kosten aus HardwareManager
    const baseCost = HardwareManager.calculateModelCost(model);
    
    // Berechne Quartale seit Spiel-Start (1983 Q1)
    const quartersSinceStart = (currentYear - 1983) * 4 + (currentQuarter - 1);
    
    // Wende Preisverfall pro Komponente an
    const components = ['cpu', 'gpu', 'memory', 'sound'] as const;
    let adjustedCost = 0;
    
    components.forEach(compType => {
      const compData = this.getComponentData(model, compType);
      if (compData) {
        const decayRate = PRICE_DECAY_RATES[compType] || 0.03;
        const currentPrice = compData.cost * Math.pow(1 - decayRate, quartersSinceStart);
        adjustedCost += Math.max(compData.cost * 0.3, currentPrice); // Mindestens 30% des Originalpreises
      }
    });
    
    // Accessories und Case sind weniger vom Preisverfall betroffen
    const accessoryCost = (baseCost - this.getBaseComponentsCost(model)) * Math.pow(0.98, quartersSinceStart);
    adjustedCost += Math.max(accessoryCost * 0.5, accessoryCost);
    
    console.log(`💰 BOM Cost Decay: Base $${baseCost} → Current $${Math.round(adjustedCost)} (${quartersSinceStart} quarters, -${((baseCost - adjustedCost) / baseCost * 100).toFixed(1)}%)`);
    
    return Math.round(adjustedCost);
  }
  
  /**
   * Simuliert Markt-Nachfrage mit sigmoid-Funktion und Obsoleszenz
   */
  static simulateMarketDemand(
    model: any,
    competitors: Competitor[],
    year: number,
    quarter: number,
    totalMarketSize: number,
    marketingBudget: number,
    playerReputation: number
  ): {
    unitsSold: number;
    demandFactors: DemandFactors;
    segmentBreakdown: Record<string, { units: number; revenue: number; appeal: number }>;
  } {
    const segments = ['gamer', 'business', 'workstation'] as const;
    const segmentSizes = {
      gamer: 70000 + (year - 1983) * 15000,
      business: 30000 + (year - 1983) * 8000,
      workstation: Math.max(0, (year >= 1987 ? 5000 + (year - 1987) * 2000 : 0))
    };
    
    let totalUnitsSold = 0;
    const segmentBreakdown: Record<string, { units: number; revenue: number; appeal: number }> = {};
    
    // Berechne globale Faktoren
    const obsolescenceFactor = this.calculateObsolescenceFactor(
      model.releaseYear || year, 
      model.releaseQuarter || quarter, 
      year, 
      quarter
    );
    
    const marketingBoost = this.calculateMarketingEffectiveness(marketingBudget, playerReputation);
    const seasonalityFactor = this.getSeasonalityFactor(quarter);
    
    // Pro Segment simulieren
    segments.forEach(segment => {
      const segmentSize = segmentSizes[segment];
      if (segmentSize === 0) {
        segmentBreakdown[segment] = { units: 0, revenue: 0, appeal: 0 };
        return;
      }
      
      // Segment-spezifischer Appeal
      const baseAppeal = this.calculateSegmentAppeal(model, segment, year) / 100;
      
      // Preissensitivität (sigmoid-Funktion)
      const maxPrice = this.getSegmentMaxPrice(segment, year);
      const priceElasticity = this.calculatePriceElasticity(model.price, maxPrice, segment);
      
      // Konkurrenz-Faktor
      const competitionFactor = this.calculateCompetitionImpact(model, competitors, segment);
      
      // Finale Nachfrage-Berechnung (sigmoid)
      const demandMultiplier = 
        baseAppeal * 
        priceElasticity * 
        competitionFactor * 
        obsolescenceFactor * 
        seasonalityFactor * 
        marketingBoost;
      
      // Market Penetration: 0.5% - 8% je nach Faktoren
      const marketPenetration = Math.min(0.08, Math.max(0.005, demandMultiplier * 0.03));
      const segmentUnits = Math.floor(segmentSize * marketPenetration * (0.8 + Math.random() * 0.4));
      
      segmentBreakdown[segment] = {
        units: segmentUnits,
        revenue: segmentUnits * model.price,
        appeal: baseAppeal * 100
      };
      
      totalUnitsSold += segmentUnits;
    });
    
    const averageDemandFactors: DemandFactors = {
      baseAppeal: Object.values(segmentBreakdown).reduce((sum, seg) => sum + seg.appeal, 0) / 3,
      priceElasticity: this.calculatePriceElasticity(model.price, 1500, 'business'), // Representative
      competitionFactor: this.calculateCompetitionImpact(model, competitors, 'business'),
      obsolescenceFactor,
      seasonalityFactor,
      marketingBoost
    };
    
    return {
      unitsSold: totalUnitsSold,
      demandFactors: averageDemandFactors,
      segmentBreakdown
    };
  }
  
  /**
   * Berechnet Obsoleszenz-Faktor: Ältere Hardware verkauft sich schlechter
   */
  static calculateObsolescenceFactor(
    releaseYear: number, 
    releaseQuarter: number, 
    currentYear: number, 
    currentQuarter: number
  ): number {
    const quartersSinceRelease = (currentYear - releaseYear) * 4 + (currentQuarter - releaseQuarter);
    
    // -15% pro Quartal, mindestens 20% der ursprünglichen Attraktivität
    const factor = Math.max(0.2, 1.0 - (quartersSinceRelease * 0.15));
    
    if (quartersSinceRelease > 0) {
      console.log(`⏰ Obsolescence: ${quartersSinceRelease} quarters old → ${(factor * 100).toFixed(1)}% appeal remaining`);
    }
    
    return factor;
  }
  
  /**
   * Sigmoid-Preissensitivität: Realistische Nachfragekurve
   */
  static calculatePriceElasticity(price: number, maxPrice: number, segment: string): number {
    const elasticityFactors = {
      gamer: 0.7,     // Sehr preissensitiv
      business: 0.4,  // Weniger preissensitiv
      workstation: 0.2 // Unpreissensitiv
    };
    
    const elasticity = elasticityFactors[segment as keyof typeof elasticityFactors] || 0.5;
    
    if (price > maxPrice) {
      // Exponentieller Abfall über dem Maximum
      return Math.exp(-((price - maxPrice) / maxPrice) * elasticity * 3);
    }
    
    // Sigmoid-Funktion für optimale Preiszone
    const optimalPrice = maxPrice * 0.7;
    if (price <= optimalPrice) {
      return 1.0; // Volle Akzeptanz
    }
    
    // S-Kurve zwischen optimal und maximum
    const x = (price - optimalPrice) / (maxPrice - optimalPrice);
    return 1 / (1 + Math.exp((x - 0.5) * 8)); // Sigmoid mit steiler Kurve
  }
  
  /**
   * Korrekte Gewinn-Aufschlüsselung: Revenue - alle Kosten
   */
  static calculateProfitBreakdown(
    model: any,
    unitsSold: number,
    bomCosts: number,
    marketingBudget: number
  ): ProfitBreakdown {
    const revenue = unitsSold * model.price;
    const totalBOMCosts = bomCosts * unitsSold;
    
    // Amortisierte Entwicklungskosten (über geschätzte Lebensdauer)
    const estimatedLifetimeUnits = unitsSold * 8; // 8 Quartale Lebensdauer
    const developmentCostPerUnit = Math.min(model.price * 0.1, (model.developmentCost || 0) / Math.max(1, estimatedLifetimeUnits));
    const developmentCosts = developmentCostPerUnit * unitsSold;
    
    // Marketing pro verkaufter Einheit
    const marketingCostPerUnit = unitsSold > 0 ? marketingBudget / unitsSold : 0;
    const marketingCosts = marketingCostPerUnit * unitsSold;
    
    // Produktionskosten: 8% der BOM-Kosten
    const productionCosts = totalBOMCosts * 0.08;
    
    // Fixkosten: $50 pro Einheit (Personal, Miete, etc.)
    const fixedOverhead = unitsSold * 50;
    
    const grossProfit = revenue - totalBOMCosts;
    const netProfit = revenue - (totalBOMCosts + developmentCosts + marketingCosts + productionCosts + fixedOverhead);
    
    console.log(`📋 Profit Breakdown: Revenue $${revenue.toLocaleString()} - BOM $${totalBOMCosts.toLocaleString()} - Dev $${Math.round(developmentCosts).toLocaleString()} - Marketing $${Math.round(marketingCosts).toLocaleString()} - Production $${Math.round(productionCosts).toLocaleString()} - Overhead $${fixedOverhead.toLocaleString()} = Net $${Math.round(netProfit).toLocaleString()}`);
    
    return {
      revenue,
      bomCosts: totalBOMCosts,
      developmentCosts: Math.round(developmentCosts),
      marketingCosts: Math.round(marketingCosts),
      productionCosts: Math.round(productionCosts),
      fixedOverhead,
      grossProfit,
      netProfit: Math.round(netProfit)
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
    // Vereinfachte Berechnung - könnte aus EconomicModel.ts übernommen werden
    const baseAppeal = 50 + (year - 1983) * 5; // Technologie-Fortschritt
    return Math.min(100, baseAppeal + Math.random() * 20);
  }
  
  static getSegmentMaxPrice(segment: string, year: number): number {
    const basePrices = { gamer: 800, business: 2000, workstation: 5000 };
    const basePrice = basePrices[segment as keyof typeof basePrices] || 1000;
    return basePrice + (year - 1983) * (segment === 'gamer' ? 100 : segment === 'business' ? 500 : 1000);
  }
  
  static calculateCompetitionImpact(model: any, competitors: Competitor[], segment: string): number {
    // Vereinfacht: Reduziere Verkäufe basierend auf Anzahl ähnlicher Konkurrenten
    const similarPriceCompetitors = competitors.reduce((count, comp) => {
      return count + comp.models.filter(m => Math.abs(m.price - model.price) < model.price * 0.3).length;
    }, 0);
    
    return Math.max(0.4, 1.0 - (similarPriceCompetitors * 0.1)); // Max -60% durch Konkurrenz
  }
  
  static calculateMarketingEffectiveness(marketingBudget: number, reputation: number): number {
    const baseBudget = 25000;
    const effectiveness = Math.sqrt(marketingBudget / baseBudget) * (0.8 + reputation / 100 * 0.4);
    return Math.max(0.5, Math.min(3.0, effectiveness));
  }
  
  static getSeasonalityFactor(quarter: number): number {
    const factors = { 1: 0.8, 2: 1.0, 3: 1.1, 4: 1.4 }; // Q4 = Weihnachtsgeschäft
    return factors[quarter as keyof typeof factors] || 1.0;
  }
}