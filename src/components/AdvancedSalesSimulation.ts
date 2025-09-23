// Advanced Sales Simulation integrating EconomicModel
import { EconomicModel } from "./EconomicModel";
import { type Competitor, type CompetitorModel } from "./GameMechanics";

export interface SalesResult {
  unitsSold: number;
  revenue: number;
  segmentBreakdown: {
    gamer: { units: number; revenue: number; appeal: number };
    business: { units: number; revenue: number; appeal: number };
    workstation: { units: number; revenue: number; appeal: number };
  };
  competitivePosition: {
    rank: number;
    marketShare: number;
    pricePosition: 'budget' | 'midrange' | 'premium';
  };
  customerSatisfaction: number;
  brandImpact: number;
}

export class AdvancedSalesSimulation {
  static simulateQuarterlySales(
    model: any,
    marketingBudget: number,
    playerReputation: number,
    competitors: Competitor[],
    year: number,
    quarter: number,
    currentMarketSize: number
  ): SalesResult {
    const economicFactors = EconomicModel.getEconomicFactors(year, quarter);
    
    // Berechne realistisches Sales-Potential mit EconomicModel
    const salesData = this.calculateRealisticSales(
      model, 
      economicFactors, 
      competitors, 
      marketingBudget, 
      playerReputation
    );
    
    // Berechne Marktposition
    const competitivePosition = this.calculateMarketPosition(
      model, 
      competitors, 
      currentMarketSize
    );
    
    // Berechne Kundenzufriedenheit basierend auf Preis-Leistung
    const customerSatisfaction = this.calculateCustomerSatisfaction(
      model, 
      salesData.segmentBreakdown
    );
    
    // Brand Impact auf zukünftige Verkäufe
    const brandImpact = this.calculateBrandImpact(
      model, 
      salesData.unitsSold, 
      customerSatisfaction
    );
    
    return {
      unitsSold: salesData.unitsSold,
      revenue: salesData.revenue,
      segmentBreakdown: salesData.segmentBreakdown,
      competitivePosition,
      customerSatisfaction,
      brandImpact
    };
  }

  private static calculateRealisticSales(
    model: any,
    economicFactors: any,
    competitors: Competitor[],
    marketingBudget: number,
    playerReputation: number
  ): {
    unitsSold: number;
    revenue: number;
    segmentBreakdown: {
      gamer: { units: number; revenue: number; appeal: number };
      business: { units: number; revenue: number; appeal: number };
      workstation: { units: number; revenue: number; appeal: number };
    };
  } {
    const segments = ['gamer', 'business', 'workstation'] as const;
    const breakdown = {
      gamer: { units: 0, revenue: 0, appeal: 0 },
      business: { units: 0, revenue: 0, appeal: 0 },
      workstation: { units: 0, revenue: 0, appeal: 0 }
    };
    
    let totalUnits = 0;
    let totalRevenue = 0;
    
    for (const segment of segments) {
      const segmentData = economicFactors.marketSegments[segment];
      if (segmentData.size === 0) continue;
      
      // Berechne Appeal für dieses Segment
      const appeal = this.calculateSegmentAppeal(model, segment, economicFactors.techTrends);
      
      // Preispsychologie - verschiedene Segmente reagieren unterschiedlich
      const priceAcceptance = this.calculateAdvancedPriceAcceptance(
        model.price, 
        segmentData, 
        appeal
      );
      
      // Marketing-Effektivität pro Segment
      const marketingEffectiveness = this.calculateMarketingEffectiveness(
        marketingBudget, 
        segment, 
        playerReputation
      );
      
      // Konkurrenz-Druck
      const competitionFactor = this.calculateSegmentCompetition(
        model, 
        competitors, 
        segment
      );
      
      // Saisonalität und Zeiteffekte
      const seasonalityFactor = this.getSeasonalityFactor(segment, model.releaseQuarter);
      
      // Finale Verkaufsberechnung
      const baseUnits = segmentData.size * 0.02; // 2% Market Penetration Base
      const segmentUnits = Math.floor(
        baseUnits *
        (appeal / 100) *
        priceAcceptance *
        marketingEffectiveness *
        competitionFactor *
        seasonalityFactor *
        (0.7 + Math.random() * 0.6) // Variabilität 70%-130%
      );
      
      const segmentRevenue = segmentUnits * model.price;
      
      breakdown[segment] = {
        units: Math.max(0, segmentUnits),
        revenue: Math.max(0, segmentRevenue),
        appeal: appeal
      };
      
      totalUnits += breakdown[segment].units;
      totalRevenue += breakdown[segment].revenue;
    }
    
    return {
      unitsSold: totalUnits,
      revenue: totalRevenue,
      segmentBreakdown: breakdown
    };
  }

  private static calculateSegmentAppeal(
    model: any, 
    segment: string, 
    techTrends: any
  ): number {
    // Verwende EconomicModel für konsistente Berechnung
    switch (segment) {
      case 'gamer':
        return this.calculateGamerAppeal(model, techTrends);
      case 'business':
        return this.calculateBusinessAppeal(model, techTrends);
      case 'workstation':
        return this.calculateWorkstationAppeal(model, techTrends);
      default:
        return 50;
    }
  }

  private static calculateGamerAppeal(model: any, techTrends: any): number {
    let appeal = 0;
    
    // Grafik (40% - sehr wichtig für Gamer)
    const gpuScores = {
      'MOS VIC': 15, 'TI TMS9918': 40, 'Atari GTIA': 65, 
      'Commodore VIC-II': 85, 'VGA Graphics': 95
    };
    appeal += (gpuScores[model.gpu as keyof typeof gpuScores] || 20) * 0.4 * techTrends.graphicsDemand;
    
    // Sound (25% - wichtig für Spiele)
    const soundScores = {
      'PC Speaker': 5, 'AY-3-8910': 55, 'SID 6581': 95, 'Yamaha YM2149': 70
    };
    appeal += (soundScores[model.sound as keyof typeof soundScores] || 10) * 0.25 * techTrends.soundDemand;
    
    // CPU Gaming-Performance (20%)
    const cpuGamingScores = {
      'MOS 6502': 35, 'Zilog Z80': 45, 'Intel 8086': 25, 
      'Motorola 68000': 85, 'Intel 80286': 40
    };
    appeal += (cpuGamingScores[model.cpu as keyof typeof cpuGamingScores] || 30) * 0.2;
    
    // Farbmonitor (10%)
    const hasColorMonitor = model.accessories?.includes('RGB Monitor');
    appeal += (hasColorMonitor ? 90 : 25) * 0.1;
    
    // Case Design (5%)
    const caseDesign = model.case?.type === 'gamer' ? model.case.design : 30;
    appeal += (caseDesign || 30) * 0.05;
    
    return Math.min(100, appeal);
  }

  private static calculateBusinessAppeal(model: any, techTrends: any): number {
    let appeal = 0;
    
    // CPU-Power (50% - kritisch für Business)
    const cpuBusinessScores = {
      'MOS 6502': 15, 'Zilog Z80': 25, 'Intel 8086': 70, 
      'Motorola 68000': 85, 'Intel 80286': 95
    };
    appeal += (cpuBusinessScores[model.cpu as keyof typeof cpuBusinessScores] || 20) * 0.5;
    
    // RAM (25% - wichtig für Produktivität)
    const ramScores = {
      '4KB RAM': 10, '16KB RAM': 25, '64KB RAM': 50, 
      '256KB RAM': 80, '512KB RAM': 95, '1MB RAM': 100
    };
    appeal += (ramScores[model.ram as keyof typeof ramScores] || 15) * 0.25;
    
    // Speicher (15% - wichtig für Datenhaltung)
    const hasStorage = model.accessories?.some((acc: string) => 
      acc.includes('Diskette') || acc.includes('Festplatte')
    );
    appeal += (hasStorage ? 85 : 20) * 0.15 * techTrends.storageDemand;
    
    // Case-Qualität (10% - Professionalität)
    const caseQuality = model.case?.type === 'office' ? model.case.quality : 
                       (model.case?.quality || 40) * 0.7;
    appeal += (caseQuality || 40) * 0.1;
    
    return Math.min(100, appeal);
  }

  private static calculateWorkstationAppeal(model: any, techTrends: any): number {
    let appeal = 0;
    
    // Höchste CPU-Power erforderlich (60%)
    const cpuWorkstationScores = {
      'MOS 6502': 5, 'Zilog Z80': 10, 'Intel 8086': 30, 
      'Motorola 68000': 70, 'Intel 80286': 85
    };
    appeal += (cpuWorkstationScores[model.cpu as keyof typeof cpuWorkstationScores] || 10) * 0.6;
    
    // Viel RAM (25%)
    const ramScores = {
      '4KB RAM': 5, '16KB RAM': 10, '64KB RAM': 25, 
      '256KB RAM': 60, '512KB RAM': 85, '1MB RAM': 100
    };
    appeal += (ramScores[model.ram as keyof typeof ramScores] || 5) * 0.25;
    
    // Professionelle Speicher-Lösungen (15%)
    const hasProfStorage = model.accessories?.some((acc: string) => 
      acc.includes('Festplatte')
    );
    appeal += (hasProfStorage ? 90 : 15) * 0.15;
    
    return Math.min(100, appeal);
  }

  private static calculateAdvancedPriceAcceptance(
    price: number, 
    segmentData: any, 
    appeal: number
  ): number {
    // Basis-Preisakzeptanz
    let acceptance = 1.0;
    
    if (price > segmentData.maxPrice) {
      // Exponentieller Abfall über Maximum
      acceptance = Math.exp(-((price - segmentData.maxPrice) / segmentData.maxPrice) * 2);
    } else {
      // Optimaler Preis ist abhängig vom Appeal
      const optimalPrice = segmentData.maxPrice * (0.5 + (appeal / 100) * 0.3);
      if (price > optimalPrice) {
        acceptance = 1.0 - ((price - optimalPrice) / (segmentData.maxPrice - optimalPrice)) * 0.4;
      }
    }
    
    // Appeal-Bonus: Bessere Produkte rechtfertigen höhere Preise
    const appealBonus = Math.min(0.3, (appeal - 70) / 100); // Max 30% Bonus ab 70% Appeal
    acceptance *= (1 + Math.max(0, appealBonus));
    
    return Math.max(0.1, Math.min(1.0, acceptance));
  }

  private static calculateMarketingEffectiveness(
    marketingBudget: number, 
    segment: string, 
    reputation: number
  ): number {
    const baseBudget = 25000; // 25k$ = 1.0 Multiplikator
    let effectiveness = Math.sqrt(marketingBudget / baseBudget);
    
    // Segment-spezifische Marketing-Effektivität
    switch (segment) {
      case 'gamer':
        // Gamer sind Marketing-affin, aber skeptisch
        effectiveness *= 1.2;
        break;
      case 'business':
        // Business fokussiert mehr auf Reputation
        effectiveness *= 0.8 + (reputation / 100) * 0.4;
        break;
      case 'workstation':
        // Workstation-Kunden sind sehr reputation-fokussiert
        effectiveness *= 0.6 + (reputation / 100) * 0.8;
        break;
    }
    
    return Math.max(0.5, Math.min(3.0, effectiveness));
  }

  private static calculateSegmentCompetition(
    model: any, 
    competitors: Competitor[], 
    segment: string
  ): number {
    let competitionFactor = 1.0;
    
    // Analysiere direkte Konkurrenten in ähnlicher Preisklasse
    const priceRange = model.price * 0.4; // ±40%
    
    competitors.forEach(competitor => {
      competitor.models.forEach(compModel => {
        if (Math.abs(compModel.price - model.price) <= priceRange) {
          // Performance-Vergleich segment-spezifisch
          const ourAppeal = this.calculateSegmentAppeal(model, segment, {
            cpuDemand: 1, graphicsDemand: 1, soundDemand: 1, storageDemand: 1
          });
          
          const theirAppeal = compModel.performance; // Approximation
          
          if (theirAppeal > ourAppeal + 10) {
            competitionFactor *= 0.8; // Starke Konkurrenz
          } else if (theirAppeal > ourAppeal - 5) {
            competitionFactor *= 0.9; // Moderate Konkurrenz
          }
        }
      });
    });
    
    return Math.max(0.4, competitionFactor);
  }

  private static getSeasonalityFactor(segment: string, quarter: number): number {
    // Q4 ist traditionell stärker (Weihnachtsgeschäft)
    // Q1 ist traditionell schwächer
    const seasonality = {
      gamer: { 1: 0.8, 2: 1.0, 3: 1.1, 4: 1.4 }, // Starke Saisonalität
      business: { 1: 0.9, 2: 1.0, 3: 1.0, 4: 1.2 }, // Moderate Saisonalität
      workstation: { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.1 } // Geringe Saisonalität
    };
    
    return seasonality[segment as keyof typeof seasonality]?.[quarter as keyof typeof seasonality.gamer] || 1.0;
  }

  private static calculateMarketPosition(
    model: any, 
    competitors: Competitor[], 
    currentMarketSize: number
  ): {
    rank: number;
    marketShare: number;
    pricePosition: 'budget' | 'midrange' | 'premium';
  } {
    // Sammle alle Modelle für Ranking
    const allModels = [
      { name: model.name, unitsSold: model.unitsSold || 0, price: model.price },
      ...competitors.flatMap(c => c.models.map(m => ({ 
        name: m.name, 
        unitsSold: m.unitsSold, 
        price: m.price 
      })))
    ];
    
    // Sortiere nach Verkaufszahlen
    allModels.sort((a, b) => b.unitsSold - a.unitsSold);
    
    const rank = allModels.findIndex(m => m.name === model.name) + 1;
    const marketShare = currentMarketSize > 0 ? 
      ((model.unitsSold || 0) / currentMarketSize) * 100 : 0;
    
    // Preis-Position bestimmen
    const pricePosition = model.price < 800 ? 'budget' : 
                         model.price < 2500 ? 'midrange' : 'premium';
    
    return { rank, marketShare, pricePosition };
  }

  private static calculateCustomerSatisfaction(
    model: any, 
    segmentBreakdown: any
  ): number {
    let weightedSatisfaction = 0;
    let totalUnits = 0;
    
    Object.entries(segmentBreakdown).forEach(([segment, data]: [string, any]) => {
      if (data.units > 0) {
        // Segment-spezifische Zufriedenheit basierend auf Appeal und Preis
        const appeal = data.appeal;
        const priceVsValue = this.calculatePriceValueRatio(model, segment);
        
        const satisfaction = (appeal + priceVsValue) / 2;
        
        weightedSatisfaction += satisfaction * data.units;
        totalUnits += data.units;
      }
    });
    
    return totalUnits > 0 ? weightedSatisfaction / totalUnits : 0;
  }

  private static calculatePriceValueRatio(model: any, segment: string): number {
    // Vereinfachte Preis-Leistungs-Bewertung
    const expectedPrice = this.getExpectedPriceForSegment(model, segment);
    const priceRatio = expectedPrice / model.price;
    
    return Math.min(100, Math.max(0, priceRatio * 100));
  }

  private static getExpectedPriceForSegment(model: any, segment: string): number {
    // Basis-Preiserwartung pro Segment
    const basePrice = {
      gamer: 600,
      business: 1500,
      workstation: 3000
    };
    
    // Anpassung basierend auf Hardware
    let expectedPrice = basePrice[segment as keyof typeof basePrice] || 1000;
    
    // CPU-Aufschlag
    const cpuMultiplier = {
      'MOS 6502': 0.8, 'Zilog Z80': 0.9, 'Intel 8086': 1.3,
      'Motorola 68000': 1.6, 'Intel 80286': 2.0
    };
    expectedPrice *= (cpuMultiplier[model.cpu as keyof typeof cpuMultiplier] || 1.0);
    
    return expectedPrice;
  }

  private static calculateBrandImpact(
    model: any, 
    unitsSold: number, 
    customerSatisfaction: number
  ): number {
    // Brand Impact beeinflusst zukünftige Verkäufe
    const volumeImpact = Math.min(10, unitsSold / 1000); // Max 10 Punkte
    const qualityImpact = (customerSatisfaction / 100) * 20; // Max 20 Punkte
    
    return Math.min(30, volumeImpact + qualityImpact);
  }
}