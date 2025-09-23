// Advanced Economic Model for Computer Business Simulation
import { type Competitor, type CompetitorModel } from "./GameMechanics";

export interface EconomicFactors {
  inflation: number;
  techTrends: {
    cpuDemand: number;
    graphicsDemand: number;
    soundDemand: number;
    storageDemand: number;
  };
  marketSegments: {
    gamer: { size: number; priceElasticity: number; maxPrice: number };
    business: { size: number; priceElasticity: number; maxPrice: number };
    workstation: { size: number; priceElasticity: number; maxPrice: number };
  };
}

export interface PurchaseDecision {
  segment: 'gamer' | 'business' | 'workstation';
  unitsSold: number;
  revenue: number;
  priceAcceptance: number;
  valuePerception: number;
}

export interface MarketAnalysis {
  optimalPriceRange: { min: number; max: number };
  suggestedPrice: number;
  expectedSales: number;
  competitorAnalysis: CompetitorAnalysis[];
}

export interface CompetitorAnalysis {
  company: string;
  model: string;
  price: number;
  performance: number;
  marketPosition: 'budget' | 'midrange' | 'premium';
  threatLevel: number;
}

export class EconomicModel {
  private static readonly YEAR_FACTORS = {
    1983: { inflation: 1.0, techAdvancement: 0.8 },
    1984: { inflation: 1.04, techAdvancement: 0.9 },
    1985: { inflation: 1.08, techAdvancement: 1.0 },
    1986: { inflation: 1.12, techAdvancement: 1.1 },
    1987: { inflation: 1.16, techAdvancement: 1.2 },
    1988: { inflation: 1.20, techAdvancement: 1.3 },
    1989: { inflation: 1.24, techAdvancement: 1.4 },
    1990: { inflation: 1.28, techAdvancement: 1.5 },
    1991: { inflation: 1.32, techAdvancement: 1.6 },
    1992: { inflation: 1.36, techAdvancement: 1.7 }
  };

  static getEconomicFactors(year: number, quarter: number): EconomicFactors {
    const yearData = this.YEAR_FACTORS[year as keyof typeof this.YEAR_FACTORS] || this.YEAR_FACTORS[1992];
    
    return {
      inflation: yearData.inflation,
      techTrends: {
        cpuDemand: 0.8 + (year - 1983) * 0.05, // CPU wird wichtiger über Zeit
        graphicsDemand: year >= 1985 ? 1.2 : 0.9, // Grafik-Boom ab '85
        soundDemand: year >= 1984 ? 1.1 : 0.8, // Sound wird wichtiger ab '84
        storageDemand: year >= 1986 ? 1.3 : 1.0 // Storage-Revolution ab '86
      },
      marketSegments: {
        gamer: { 
          size: 70000 + (year - 1983) * 15000, // Wachsender Gamer-Markt
          priceElasticity: 0.7, // Sehr preissensitiv
          maxPrice: 800 + (year - 1983) * 100 // Steigende Zahlungsbereitschaft
        },
        business: { 
          size: 30000 + (year - 1983) * 8000, // Business-Markt wächst langsamer
          priceElasticity: 0.3, // Weniger preissensitiv
          maxPrice: 2000 + (year - 1983) * 500 // Viel höhere Zahlungsbereitschaft
        },
        workstation: { 
          size: year >= 1987 ? 5000 + (year - 1987) * 2000 : 0, // Workstations ab '87
          priceElasticity: 0.1, // Sehr unpreissensitiv
          maxPrice: 5000 + Math.max(0, year - 1987) * 1000 // Sehr hohe Zahlungsbereitschaft
        }
      }
    };
  }

  static calculateOptimalPricing(
    model: any, 
    year: number, 
    quarter: number, 
    competitors: Competitor[]
  ): MarketAnalysis {
    const factors = this.getEconomicFactors(year, quarter);
    const baseCost = this.calculateBaseCost(model);
    
    // Kalkuliere verschiedene Preispunkte und deren erwartete Performance
    const pricePoints = [];
    const minPrice = baseCost * 1.1; // 10% Minimum-Marge
    const maxPrice = baseCost * 4.0; // 300% Maximum-Marge
    
    for (let price = minPrice; price <= maxPrice; price += Math.round((maxPrice - minPrice) / 20)) {
      const salesForecast = this.simulateSalesAtPrice(model, price, factors, competitors);
      const profit = salesForecast.totalUnits * (price - baseCost);
      
      pricePoints.push({
        price,
        expectedSales: salesForecast.totalUnits,
        expectedProfit: profit,
        marketShare: salesForecast.totalUnits / this.getTotalMarketSize(factors)
      });
    }
    
    // Finde optimalen Preispunkt (maximaler Profit)
    const optimalPoint = pricePoints.reduce((best, current) => 
      current.expectedProfit > best.expectedProfit ? current : best
    );
    
    // Standard-Marge: 80% Aufschlag (wie bisher)
    const suggestedPrice = Math.round(baseCost * 1.8);
    
    return {
      optimalPriceRange: {
        min: Math.round(minPrice),
        max: Math.round(maxPrice)
      },
      suggestedPrice,
      expectedSales: optimalPoint.expectedSales,
      competitorAnalysis: this.analyzeCompetitors(competitors, model, year)
    };
  }

  private static calculateBaseCost(model: any): number {
    // Berechne Herstellungskosten basierend auf Komponenten
    let cost = 0;
    
    // CPU-Kosten
    const cpuCosts = {
      'MOS 6502': 25, 'Zilog Z80': 35, 'Intel 8086': 85, 
      'Motorola 68000': 120, 'Intel 80286': 200, 'Intel 80386': 350
    };
    cost += cpuCosts[model.cpu as keyof typeof cpuCosts] || 50;
    
    // GPU-Kosten
    const gpuCosts = {
      'MOS VIC': 15, 'TI TMS9918': 45, 'Atari GTIA': 60, 
      'Commodore VIC-II': 70, 'VGA Graphics': 120
    };
    cost += gpuCosts[model.gpu as keyof typeof gpuCosts] || 30;
    
    // RAM-Kosten
    const ramCosts = {
      '4KB RAM': 20, '16KB RAM': 60, '64KB RAM': 150, 
      '256KB RAM': 300, '512KB RAM': 500, '1MB RAM': 800
    };
    cost += ramCosts[model.ram as keyof typeof ramCosts] || 40;
    
    // Sound-Chip Kosten
    const soundCosts = {
      'PC Speaker': 5, 'AY-3-8910': 35, 'SID 6581': 80, 'Yamaha YM2149': 50
    };
    cost += soundCosts[model.sound as keyof typeof soundCosts] || 5;
    
    // Zubehör-Kosten
    if (model.accessories) {
      const accessoryCosts = {
        'Kassettenlaufwerk': 40, 'Diskettenlaufwerk 5.25"': 150, 
        'Diskettenlaufwerk 3.5"': 120, 'Festplatte 5MB': 1500,
        'RF Modulator': 25, 'Composite Monitor': 200, 'RGB Monitor': 500
      };
      
      model.accessories.forEach((accessory: string) => {
        cost += accessoryCosts[accessory as keyof typeof accessoryCosts] || 50;
      });
    }
    
    // Case-Kosten
    cost += model.case?.price || 80;
    
    return cost;
  }

  private static simulateSalesAtPrice(
    model: any, 
    price: number, 
    factors: EconomicFactors, 
    competitors: Competitor[]
  ): { totalUnits: number; segmentBreakdown: Record<string, number> } {
    const segments = ['gamer', 'business', 'workstation'] as const;
    const breakdown: Record<string, number> = {};
    let totalUnits = 0;
    
    for (const segment of segments) {
      const segmentData = factors.marketSegments[segment];
      if (segmentData.size === 0) continue;
      
      // Preis-Akzeptanz berechnen
      const priceAcceptance = this.calculatePriceAcceptance(price, segmentData);
      
      // Zielgruppen-spezifischer Appeal
      const appeal = this.calculateSegmentAppeal(model, segment, factors.techTrends);
      
      // Konkurrenz-Faktor
      const competitionFactor = this.calculateCompetitionImpact(
        model, price, competitors, segment
      );
      
      // Verkäufe für dieses Segment
      const segmentSales = Math.floor(
        segmentData.size * 
        (appeal / 100) * 
        priceAcceptance * 
        competitionFactor * 
        (0.01 + Math.random() * 0.04) // 1-5% Market Penetration
      );
      
      breakdown[segment] = Math.max(0, segmentSales);
      totalUnits += breakdown[segment];
    }
    
    return { totalUnits, segmentBreakdown: breakdown };
  }

  private static calculatePriceAcceptance(
    price: number, 
    segmentData: { maxPrice: number; priceElasticity: number }
  ): number {
    if (price > segmentData.maxPrice) {
      // Exponentieller Abfall über Maximum-Preis
      return Math.exp(-((price - segmentData.maxPrice) / segmentData.maxPrice) * segmentData.priceElasticity * 3);
    }
    
    // Optimaler Preis ist 70% des Maximum-Preises
    const optimalPrice = segmentData.maxPrice * 0.7;
    if (price <= optimalPrice) {
      return 1.0; // Volle Akzeptanz
    }
    
    // Linear fallend bis zum Maximum
    return 1.0 - ((price - optimalPrice) / (segmentData.maxPrice - optimalPrice)) * 0.3;
  }

  private static calculateSegmentAppeal(
    model: any, 
    segment: 'gamer' | 'business' | 'workstation',
    techTrends: EconomicFactors['techTrends']
  ): number {
    switch (segment) {
      case 'gamer':
        return this.calculateGamerAppeal(model, techTrends);
      case 'business':
        return this.calculateBusinessAppeal(model, techTrends);
      case 'workstation':
        return this.calculateWorkstationAppeal(model, techTrends);
    }
  }

  private static calculateGamerAppeal(model: any, techTrends: EconomicFactors['techTrends']): number {
    let appeal = 0;
    
    // Grafik ist extrem wichtig für Gamer (35%)
    const gpuScores = {
      'MOS VIC': 15, 'TI TMS9918': 40, 'Atari GTIA': 65, 
      'Commodore VIC-II': 85, 'VGA Graphics': 95
    };
    const gpuScore = gpuScores[model.gpu as keyof typeof gpuScores] || 20;
    appeal += gpuScore * 0.35 * techTrends.graphicsDemand;
    
    // Sound ist sehr wichtig (25%)
    const soundScores = {
      'PC Speaker': 5, 'AY-3-8910': 55, 'SID 6581': 95, 'Yamaha YM2149': 70
    };
    const soundScore = soundScores[model.sound as keyof typeof soundScores] || 10;
    appeal += soundScore * 0.25 * techTrends.soundDemand;
    
    // CPU für Gaming (15%)
    const cpuGamingScores = {
      'MOS 6502': 35, 'Zilog Z80': 45, 'Intel 8086': 25, 
      'Motorola 68000': 85, 'Intel 80286': 40, 'Intel 80386': 50
    };
    const cpuScore = cpuGamingScores[model.cpu as keyof typeof cpuGamingScores] || 30;
    appeal += cpuScore * 0.15;
    
    // Farbmonitor Bonus (15%)
    const hasColorMonitor = model.accessories?.includes('RGB Monitor');
    appeal += (hasColorMonitor ? 90 : 25) * 0.15;
    
    // Case Design (10%)
    const caseDesign = model.case?.type === 'gamer' ? model.case.design : 30;
    appeal += (caseDesign || 30) * 0.10;
    
    return Math.min(100, appeal);
  }

  private static calculateBusinessAppeal(model: any, techTrends: EconomicFactors['techTrends']): number {
    let appeal = 0;
    
    // CPU-Power ist kritisch (45%)
    const cpuBusinessScores = {
      'MOS 6502': 15, 'Zilog Z80': 25, 'Intel 8086': 70, 
      'Motorola 68000': 85, 'Intel 80286': 95, 'Intel 80386': 100
    };
    const cpuScore = cpuBusinessScores[model.cpu as keyof typeof cpuBusinessScores] || 20;
    appeal += cpuScore * 0.45 * techTrends.cpuDemand;
    
    // RAM-Kapazität (25%)
    const ramAmounts = {
      '4KB RAM': 10, '16KB RAM': 25, '64KB RAM': 50, 
      '256KB RAM': 80, '512KB RAM': 95, '1MB RAM': 100
    };
    const ramScore = ramAmounts[model.ram as keyof typeof ramAmounts] || 15;
    appeal += ramScore * 0.25;
    
    // Speicher-Laufwerke (20%)
    const hasStorage = model.accessories?.some((acc: string) => 
      acc.includes('Diskette') || acc.includes('Festplatte')
    );
    const storageScore = hasStorage ? 85 : 20;
    appeal += storageScore * 0.20 * techTrends.storageDemand;
    
    // Case-Qualität und Professionalität (10%)
    const caseQuality = model.case?.type === 'office' ? model.case.quality : 
                       (model.case?.quality || 40) * 0.7; // Gamer-Cases weniger business-tauglich
    appeal += (caseQuality || 40) * 0.10;
    
    return Math.min(100, appeal);
  }

  private static calculateWorkstationAppeal(model: any, techTrends: EconomicFactors['techTrends']): number {
    let appeal = 0;
    
    // Höchste CPU-Performance erforderlich (50%)
    const cpuWorkstationScores = {
      'MOS 6502': 5, 'Zilog Z80': 10, 'Intel 8086': 30, 
      'Motorola 68000': 70, 'Intel 80286': 85, 'Intel 80386': 100
    };
    const cpuScore = cpuWorkstationScores[model.cpu as keyof typeof cpuWorkstationScores] || 10;
    appeal += cpuScore * 0.50 * techTrends.cpuDemand;
    
    // Viel RAM erforderlich (30%)
    const ramAmounts = {
      '4KB RAM': 5, '16KB RAM': 10, '64KB RAM': 25, 
      '256KB RAM': 60, '512KB RAM': 85, '1MB RAM': 100
    };
    const ramScore = ramAmounts[model.ram as keyof typeof ramAmounts] || 5;
    appeal += ramScore * 0.30;
    
    // Professionelle Speicher-Lösungen (15%)
    const hasProfStorage = model.accessories?.some((acc: string) => 
      acc.includes('Festplatte') || acc.includes('SCSI')
    );
    const storageScore = hasProfStorage ? 90 : 15;
    appeal += storageScore * 0.15 * techTrends.storageDemand;
    
    // Premium-Qualität Case (5%)
    const caseQuality = model.case?.quality || 50;
    appeal += caseQuality * 0.05;
    
    return Math.min(100, appeal);
  }

  private static calculateCompetitionImpact(
    model: any, 
    price: number, 
    competitors: Competitor[], 
    segment: string
  ): number {
    let competitionFactor = 1.0;
    
    // Analysiere direkte Konkurrenten in ähnlicher Preisklasse
    const priceRange = price * 0.3; // ±30% Preisbereich
    
    competitors.forEach(competitor => {
      competitor.models.forEach(compModel => {
        if (Math.abs(compModel.price - price) <= priceRange) {
          // Direkter Konkurrent - reduziere unsere Verkäufe
          const performanceComparison = this.comparePerformance(model, compModel, segment);
          if (performanceComparison < 0) {
            // Konkurrent ist besser
            competitionFactor *= 0.85; // -15% Verkäufe
          } else if (performanceComparison === 0) {
            // Gleichwertig
            competitionFactor *= 0.92; // -8% Verkäufe
          }
          // Wenn wir besser sind, keine Reduktion
        }
      });
    });
    
    return Math.max(0.3, competitionFactor); // Minimum 30% der Verkäufe bleiben
  }

  private static comparePerformance(ourModel: any, theirModel: CompetitorModel, segment: string): number {
    // Vereinfachter Performance-Vergleich
    // Positiv = wir sind besser, Negativ = sie sind besser, 0 = gleichwertig
    
    const ourPerf = this.calculateSegmentAppeal(ourModel, segment as any, {
      cpuDemand: 1, graphicsDemand: 1, soundDemand: 1, storageDemand: 1
    });
    
    const theirPerf = theirModel.performance;
    
    if (Math.abs(ourPerf - theirPerf) < 5) return 0; // Gleichwertig
    return ourPerf > theirPerf ? 1 : -1;
  }

  private static getTotalMarketSize(factors: EconomicFactors): number {
    return factors.marketSegments.gamer.size + 
           factors.marketSegments.business.size + 
           factors.marketSegments.workstation.size;
  }

  private static analyzeCompetitors(
    competitors: Competitor[], 
    playerModel: any, 
    year: number
  ): CompetitorAnalysis[] {
    const analyses: CompetitorAnalysis[] = [];
    
    competitors.forEach(competitor => {
      competitor.models.forEach(model => {
        // Nur aktuelle/relevante Modelle analysieren
        if (model.releaseYear >= year - 1) {
          const analysis: CompetitorAnalysis = {
            company: competitor.name,
            model: model.name,
            price: model.price,
            performance: model.performance,
            marketPosition: this.getMarketPosition(model.price),
            threatLevel: this.calculateThreatLevel(model, playerModel, competitor.reputation)
          };
          
          analyses.push(analysis);
        }
      });
    });
    
    return analyses.sort((a, b) => b.threatLevel - a.threatLevel).slice(0, 8); // Top 8 Bedrohungen
  }

  private static getMarketPosition(price: number): 'budget' | 'midrange' | 'premium' {
    if (price < 800) return 'budget';
    if (price < 2500) return 'midrange';
    return 'premium';
  }

  private static calculateThreatLevel(
    theirModel: CompetitorModel, 
    ourModel: any, 
    theirReputation: number
  ): number {
    // Bedrohungsgrad basierend auf Preis-Leistungs-Verhältnis und Marken-Stärke
    const theirValueScore = theirModel.performance / (theirModel.price / 100);
    const ourValueScore = (ourModel.performance || 50) / (ourModel.price / 100);
    
    const valueAdvantage = theirValueScore / ourValueScore;
    const reputationFactor = Math.min(2.0, theirReputation / 70); // Reputation normalisiert
    
    return Math.min(100, valueAdvantage * reputationFactor * 50);
  }
}