// Game mechanics and AI competition logic

export interface Competitor {
  id: string;
  name: string;
  marketShare: number;
  reputation: number;
  models: CompetitorModel[];
  marketingBudget: number;
  developmentBudget: number;
}

export interface CompetitorModel {
  name: string;
  price: number;
  performance: number;
  unitsSold: number;
  releaseQuarter: number;
  releaseYear: number;
}

export interface MarketEvent {
  id: string;
  title: string;
  description: string;
  effect: string;
  impact: {
    marketGrowth?: number;
    demandShift?: { segment: string; change: number }[];
    priceChange?: number;
  };
}

// Initial competitors for 1983
export const INITIAL_COMPETITORS: Competitor[] = [
  {
    id: 'apple',
    name: 'Apple Computer',
    marketShare: 25,
    reputation: 80,
    marketingBudget: 500000,
    developmentBudget: 800000,
    models: [
      {
        name: 'Apple IIe',
        price: 1395,
        performance: 65,
        unitsSold: 15000,
        releaseQuarter: 1,
        releaseYear: 1983
      }
    ]
  },
  {
    id: 'commodore',
    name: 'Commodore',
    marketShare: 30,
    reputation: 75,
    marketingBudget: 400000,
    developmentBudget: 600000,
    models: [
      {
        name: 'Commodore 64',
        price: 595,
        performance: 55,
        unitsSold: 25000,
        releaseQuarter: 4,
        releaseYear: 1982
      }
    ]
  },
  {
    id: 'ibm',
    name: 'IBM',
    marketShare: 20,
    reputation: 90,
    marketingBudget: 800000,
    developmentBudget: 1200000,
    models: [
      {
        name: 'IBM PC XT',
        price: 4995,
        performance: 85,
        unitsSold: 8000,
        releaseQuarter: 1,
        releaseYear: 1983
      }
    ]
  },
  {
    id: 'atari',
    name: 'Atari',
    marketShare: 15,
    reputation: 60,
    marketingBudget: 300000,
    developmentBudget: 400000,
    models: [
      {
        name: 'Atari 800XL',
        price: 899,
        performance: 50,
        unitsSold: 12000,
        releaseQuarter: 2,
        releaseYear: 1983
      }
    ]
  }
];

// Market events that can occur
export const MARKET_EVENTS: MarketEvent[] = [
  {
    id: 'crash_1983',
    title: 'Video Game Crash',
    description: 'Der Videospielmarkt bricht zusammen. Heimcomputer werden wichtiger!',
    effect: '+20% Nachfrage nach Heimcomputern',
    impact: {
      marketGrowth: 0.2,
      demandShift: [{ segment: 'home', change: 0.25 }]
    }
  },
  {
    id: 'price_war',
    title: 'Preiskampf',
    description: 'Commodore senkt drastisch die Preise. Der Markt wird härter umkämpft.',
    effect: '-15% Durchschnittspreise',
    impact: {
      priceChange: -0.15
    }
  },
  {
    id: 'tech_breakthrough',
    title: 'Technologischer Durchbruch',
    description: 'Neue Chip-Technologie wird verfügbar.',
    effect: '+10% Leistung für neue Modelle',
    impact: {
      marketGrowth: 0.1
    }
  }
];

export class GameMechanics {
  static calculateMarketShare(
    playerModels: any[],
    playerMarketingBudget: number,
    playerReputation: number,
    competitors: Competitor[],
    marketSize: number
  ): number {
    // Player's market presence based on models and marketing
    const playerSales = playerModels.reduce((total, model) => {
      if (model.status === 'released') {
        // Sales influenced by price competitiveness, performance, and marketing
        const priceScore = Math.max(0, 100 - (model.price / 100));
        const performanceScore = this.calculateModelPerformance(model);
        const marketingMultiplier = Math.sqrt(playerMarketingBudget / 10000);
        
        return total + (priceScore + performanceScore) * marketingMultiplier * 10;
      }
      return total;
    }, 0);

    // Total market activity
    const totalMarketActivity = competitors.reduce((total, comp) => {
      return total + comp.models.reduce((compTotal, model) => compTotal + model.unitsSold, 0);
    }, playerSales);

    if (totalMarketActivity === 0) return 0;
    
    return Math.min(100, (playerSales / totalMarketActivity) * 100);
  }

  static calculateModelPerformance(model: any): number {
    // Calculate performance score based on components
    let score = 0;
    
    // CPU performance mapping
    const cpuScores = {
      'MOS 6502 (1MHz)': 20, 'Zilog Z80 (2MHz)': 25, 'Intel 8088 (4.77MHz)': 35,
      'Motorola 6800': 22, 'Intel 8080': 18, 'MOS 6510': 24
    };
    
    // RAM performance
    const ramAmount = parseInt(model.ram) || 0;
    const ramScore = Math.min(30, ramAmount / 2);
    
    // GPU performance mapping  
    const gpuScores = {
      'Integrierte Grafik': 10, 'MOS VIC-II': 25, 'Atari ANTIC/GTIA': 28,
      'IBM CGA': 35, 'Hercules': 20, 'Apple II Grafik': 30
    };

    score += cpuScores[model.cpu] || 15;
    score += ramScore;
    score += gpuScores[model.gpu] || 10;
    
    // Bonus for optional components
    if (model.soundchip && model.soundchip !== 'PC Speaker') score += 5;
    if (model.accessories && model.accessories.length > 0) {
      score += model.accessories.length * 3;
    }

    return Math.min(100, score);
  }

  static calculateRevenue(
    model: any,
    marketShare: number,
    marketingBudget: number,
    marketSize: number
  ): number {
    if (model.status !== 'released') return 0;

    const performanceScore = this.calculateModelPerformance(model);
    const marketingMultiplier = Math.sqrt(marketingBudget / 10000);
    const priceCompetitiveness = Math.max(0.1, (3000 - model.price) / 3000);
    
    const baseSales = (marketShare / 100) * marketSize * 0.1;
    const adjustedSales = baseSales * (performanceScore / 100) * marketingMultiplier * priceCompetitiveness;
    
    return Math.floor(adjustedSales * model.price);
  }

  static updateCompetitors(competitors: Competitor[], quarter: number, year: number): Competitor[] {
    return competitors.map(comp => {
      // AI decision making - competitors respond to market conditions
      const shouldRelease = Math.random() < 0.3 && quarter === 1; // 30% chance to release new model each year
      
      if (shouldRelease) {
        const newModel: CompetitorModel = {
          name: `${comp.name} Model ${year}`,
          price: 800 + Math.random() * 2000,
          performance: 40 + Math.random() * 40,
          unitsSold: 0,
          releaseQuarter: quarter,
          releaseYear: year
        };
        comp.models.push(newModel);
      }

      // Update sales for existing models
      comp.models = comp.models.map(model => ({
        ...model,
        unitsSold: model.unitsSold + Math.floor(Math.random() * 5000 + 1000)
      }));

      // Update market share based on performance
      const totalSales = comp.models.reduce((sum, model) => sum + model.unitsSold, 0);
      comp.marketShare = Math.min(40, Math.max(5, comp.marketShare + (Math.random() - 0.5) * 3));

      return comp;
    });
  }

  static getRandomMarketEvent(): MarketEvent | null {
    if (Math.random() < 0.2) { // 20% chance per quarter
      return MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
    }
    return null;
  }

  static applyBudgetEffects(gameState: any, budget: any): any {
    const newState = { ...gameState };

    // Marketing budget affects sales multiplier
    const marketingMultiplier = Math.sqrt(budget.marketing / 10000);
    
    // Development budget affects model development time and quality
    const developmentMultiplier = budget.development / 25000;
    
    // Research budget unlocks new technologies over time
    const researchPoints = budget.research / 1000;

    // Apply effects to released models
    newState.models = newState.models.map((model: any) => {
      if (model.status === 'released') {
        const baseRevenue = this.calculateRevenue(model, newState.company.marketShare, budget.marketing, 1000000);
        return {
          ...model,
          unitsSold: model.unitsSold + Math.floor(baseRevenue / model.price)
        };
      }
      return model;
    });

    return newState;
  }
}