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

  static calculateModelSales(
    model: any,
    marketingBudget: number,
    playerReputation: number,
    marketSize: number,
    competitorModels: CompetitorModel[] = []
  ): { unitsSold: number; revenue: number } {
    if (model.status !== 'released') return { unitsSold: 0, revenue: 0 };

    const performanceScore = this.calculateModelPerformance(model);
    const marketingMultiplier = Math.max(1, Math.sqrt(marketingBudget / 25000));
    const reputationBonus = Math.max(0.5, playerReputation / 100);
    
    // Basis-Verkaufszahl abhängig von Preis-Leistung
    const pricePerformanceRatio = performanceScore / (model.price / 100);
    const baseAppeal = Math.max(50, pricePerformanceRatio * 20);
    
    // Konkurrenzanalyse
    const avgCompetitorPrice = competitorModels.length > 0 
      ? competitorModels.reduce((sum, comp) => sum + comp.price, 0) / competitorModels.length
      : 1500;
    
    const priceAdvantage = model.price < avgCompetitorPrice ? 1.2 : 
                          model.price > avgCompetitorPrice * 1.5 ? 0.7 : 1.0;
    
    // Finale Verkaufszahl
    const baseSales = Math.floor(
      baseAppeal * marketingMultiplier * reputationBonus * priceAdvantage * 
      (marketSize / 1000000) * (0.5 + Math.random() * 0.5)
    );
    
    const unitsSold = Math.max(0, baseSales);
    const revenue = unitsSold * model.price;
    
    return { unitsSold, revenue };
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

  static processQuarterTurn(gameState: any, competitors: Competitor[]): {
    updatedGameState: any;
    quarterResults: any;
    updatedCompetitors: Competitor[];
  } {
    const { budget, models, company } = gameState;
    
    // Berechne Verkäufe für jedes Modell
    const modelSales = models.map((model: any) => {
      if (model.status === 'released') {
        const competitorModels = competitors.flatMap(comp => comp.models);
        const sales = this.calculateModelSales(
          model, 
          budget.marketing, 
          company.reputation, 
          1000000,
          competitorModels
        );
        
        return {
          modelName: model.name,
          unitsSold: sales.unitsSold,
          revenue: sales.revenue,
          price: model.price
        };
      }
      return null;
    }).filter(Boolean);

    // Gesamteinnahmen und Verkäufe
    const totalRevenue = modelSales.reduce((sum, sale) => sum + sale.revenue, 0);
    const totalUnitsSold = modelSales.reduce((sum, sale) => sum + sale.unitsSold, 0);

    // Ausgaben berechnen
    const quarterlyExpenses = {
      marketing: budget.marketing,
      development: budget.development,  
      research: budget.research,
      operations: Math.max(10000, company.employees * 2000) // Grundkosten
    };

    const totalExpenses = Object.values(quarterlyExpenses).reduce((sum, exp) => sum + exp, 0);
    const netProfit = totalRevenue - totalExpenses;

    // Marktanteil und Reputation aktualisieren
    const oldMarketShare = company.marketShare || 5;
    const salesImpact = Math.min(10, totalUnitsSold / 1000);
    const marketShareChange = (salesImpact - 2) + (Math.random() - 0.5) * 2;
    const newMarketShare = Math.max(0.1, Math.min(50, oldMarketShare + marketShareChange));

    const oldReputation = company.reputation || 50;
    const reputationChange = (totalUnitsSold > 0 ? 2 : -1) + 
                           (budget.research > 50000 ? 1 : 0) +
                           (Math.random() - 0.5) * 3;
    const newReputation = Math.max(10, Math.min(100, oldReputation + reputationChange));

    // Konkurrenz-Aktionen
    const competitorActions: string[] = [];
    
    // Aktualisierte Konkurrenten
    const updatedCompetitors = this.updateCompetitors(
      competitors, 
      gameState.quarter, 
      gameState.year
    );

    // Aktionen der Konkurrenten dokumentieren  
    updatedCompetitors.forEach(comp => {
      const newModels = comp.models.filter(model => 
        model.releaseQuarter === gameState.quarter && 
        model.releaseYear === gameState.year
      );
      
      if (newModels.length > 0) {
        competitorActions.push(`${comp.name} hat ${newModels[0].name} veröffentlicht`);
      }
    });

    // Marktereignis
    const marketEvent = this.getRandomMarketEvent();
    if (marketEvent) {
      competitorActions.push(`Marktereignis: ${marketEvent.title}`);
    }

    // Aktualisierter Spielzustand
    const updatedGameState = {
      ...gameState,
      company: {
        ...company,
        cash: company.cash + netProfit,
        marketShare: newMarketShare,
        reputation: newReputation
      },
      models: models.map((model: any) => {
        const modelSale = modelSales.find(sale => sale.modelName === model.name);
        if (modelSale) {
          return {
            ...model,
            unitsSold: (model.unitsSold || 0) + modelSale.unitsSold,
            quarterlyRevenue: modelSale.revenue
          };
        }
        return model;
      })
    };

    const quarterResults = {
      modelSales,
      totalRevenue,
      totalUnitsSold,
      marketShare: newMarketShare,
      marketShareChange,
      reputation: newReputation,
      reputationChange,
      expenses: quarterlyExpenses,
      netProfit,
      competitorActions,
      marketEvent
    };

    return {
      updatedGameState,
      quarterResults,
      updatedCompetitors
    };
  }
}