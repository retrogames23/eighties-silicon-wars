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
  static calculateModelComplexity(model: any): number {
    // Basis-Komplexität abhängig von Komponenten
    let complexity = 20; // Basis
    
    // CPU-Komplexität
    const cpuComplexity = {
      'MOS 6502': 10, 'Zilog Z80': 15, 'Motorola 68000': 40, 
      'Intel 8086': 30, 'Intel 80286': 50
    };
    complexity += cpuComplexity[model.cpu] || 20;
    
    // RAM-Komplexität
    const ramAmount = parseInt(model.ram) || 0;
    complexity += Math.min(30, ramAmount / 4);
    
    // GPU-Komplexität
    const gpuComplexity = {
      'MOS VIC': 10, 'TI TMS9918': 20, 'Atari GTIA': 25, 'Commodore VIC-II': 30
    };
    complexity += gpuComplexity[model.gpu] || 15;
    
    // Zusätzliche Komponenten erhöhen Komplexität
    if (model.soundchip && model.soundchip !== 'PC Speaker') complexity += 15;
    if (model.accessories && model.accessories.length > 0) {
      complexity += model.accessories.length * 10;
    }
    
    return Math.min(100, complexity);
  }

  static calculateDevelopmentTime(complexity: number): number {
    // 1-3 Quartale basierend auf Komplexität
    if (complexity <= 30) return 1;
    if (complexity <= 60) return 2;
    return 3;
  }

  static updateModelDevelopment(models: any[], developmentBudget: number): any[] {
    const budgetSpeedMultiplier = Math.max(0.5, Math.min(2.0, developmentBudget / 50000)); // 0.5x - 2x Geschwindigkeit
    
    return models.map(model => {
      if (model.status === 'development') {
        const progressIncrement = (100 / model.developmentTime) * budgetSpeedMultiplier;
        const newProgress = Math.min(100, model.developmentProgress + progressIncrement);
        
        if (newProgress >= 100) {
          return {
            ...model,
            status: 'released',
            developmentProgress: 100
          };
        }
        
        return {
          ...model,
          developmentProgress: newProgress
        };
      }
      return model;
    });
  }

  static getAvailableComponents(researchBudget: number, currentYear: number): any[] {
    // Forschungsbudget schaltet neue Technologien frei
    const researchLevel = Math.floor(researchBudget / 25000); // Alle 25k$ eine Stufe höher
    
    // Basis-Komponenten + durch Forschung freigeschaltete
    const baseComponents = ['MOS 6502', 'Zilog Z80', 'MOS VIC', '4KB RAM', '16KB RAM'];
    
    const researchUnlocks = [
      ['Intel 8086', 'TI TMS9918', '64KB RAM', 'AY-3-8910'], // Level 1 (25k+)
      ['Motorola 68000', 'Atari GTIA', '256KB RAM', 'SID 6581'], // Level 2 (50k+)
      ['Intel 80286', 'Commodore VIC-II', 'Yamaha YM2149'], // Level 3 (75k+)
    ];
    
    let availableComponents = [...baseComponents];
    for (let i = 0; i < Math.min(researchLevel, researchUnlocks.length); i++) {
      availableComponents.push(...researchUnlocks[i]);
    }
    
    return availableComponents;
  }
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

  static calculateSoftwareLicenseRevenue(model: any, unitsSold: number): {
    games: number;
    office: number;
  } {
    if (model.status !== 'released' || unitsSold === 0) return { games: 0, office: 0 };

    // Spiele-Software: Abhängig von Grafik, Sound, Farbmonitor
    const hasColorMonitor = model.accessories?.includes('RGB Monitor') || false;
    const hasGoodSound = model.sound && !model.sound.includes('PC Speaker');
    const hasGoodGraphics = model.gpu && (model.gpu.includes('VIC-II') || model.gpu.includes('GTIA') || model.gpu.includes('TMS9918'));
    
    const gamesMultiplier = (hasColorMonitor ? 1.8 : 1.0) * 
                           (hasGoodSound ? 1.5 : 1.0) * 
                           (hasGoodGraphics ? 1.3 : 1.0);
    
    const gamesRevenuePerUnit = Math.round(15 * gamesMultiplier); // $15-45 pro verkauftem Computer
    
    // Büro-Software: Abhängig von CPU-Leistung und RAM
    const cpuPower = this.getCPUPower(model.cpu);
    const ramAmount = this.getRAMAmount(model.ram);
    
    const officeMultiplier = (cpuPower / 30) * (ramAmount / 32); // Normiert auf typische 80er Werte
    const officeRevenuePerUnit = Math.round(25 * Math.max(0.5, officeMultiplier)); // $12-100+ pro Computer
    
    return {
      games: gamesRevenuePerUnit * unitsSold,
      office: officeRevenuePerUnit * unitsSold
    };
  }

  static calculateSupportServiceRevenue(model: any, unitsSold: number): {
    b2c: number;
    b2b: number;
  } {
    if (model.status !== 'released' || unitsSold === 0) return { b2c: 0, b2b: 0 };

    // B2C Support: Abhängig von Consumer-Features (Grafik, Sound, Einfachheit)
    const hasColorMonitor = model.accessories?.includes('RGB Monitor') || false;
    const hasGoodSound = model.sound && !model.sound.includes('PC Speaker');
    const complexity = this.calculateModelComplexity(model);
    
    const b2cMultiplier = (hasColorMonitor ? 1.4 : 1.0) * 
                         (hasGoodSound ? 1.2 : 1.0) * 
                         (complexity > 50 ? 0.8 : 1.2); // Einfachere Computer = mehr Consumer-Support
    
    const b2cRevenuePerUnit = Math.round(8 * b2cMultiplier); // $6-16 pro Computer
    
    // B2B Support: Abhängig von Business-Features (CPU, RAM, Speicher)
    const cpuPower = this.getCPUPower(model.cpu);
    const ramAmount = this.getRAMAmount(model.ram);
    const hasStorage = model.accessories?.some(acc => acc.includes('Festplatte') || acc.includes('Diskette')) || false;
    
    const b2bMultiplier = (cpuPower / 25) * (ramAmount / 32) * (hasStorage ? 1.5 : 1.0);
    const b2bRevenuePerUnit = Math.round(20 * Math.max(0.3, b2bMultiplier)); // $6-60+ pro Computer
    
    return {
      b2c: b2cRevenuePerUnit * unitsSold,
      b2b: b2bRevenuePerUnit * unitsSold
    };
  }

  static getCPUPower(cpu: string): number {
    const cpuPowerMap = {
      'MOS 6502': 10,
      'Zilog Z80': 15, 
      'Intel 8086': 25,
      'Motorola 68000': 35,
      'Intel 80286': 50
    };
    return cpuPowerMap[cpu as keyof typeof cpuPowerMap] || 10;
  }

  static getRAMAmount(ram: string): number {
    const ramMap = {
      '4KB RAM': 4,
      '16KB RAM': 16,
      '64KB RAM': 64,
      '256KB RAM': 256
    };
    return ramMap[ram as keyof typeof ramMap] || 4;
  }

  static calculateModelSales(
    model: any,
    marketingBudget: number,
    playerReputation: number,
    marketSize: number,
    competitorModels: CompetitorModel[] = []
  ): { unitsSold: number; revenue: number; additionalRevenue: { 
    softwareLicenses: { games: number; office: number }; 
    supportService: { b2c: number; b2b: number } 
  } } {
    if (model.status !== 'released') return { 
      unitsSold: 0, 
      revenue: 0, 
      additionalRevenue: { 
        softwareLicenses: { games: 0, office: 0 }, 
        supportService: { b2c: 0, b2b: 0 } 
      } 
    };

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
    const hardwareRevenue = unitsSold * model.price;
    
    // Zusätzliche Einnahmequellen berechnen
    const softwareLicenses = this.calculateSoftwareLicenseRevenue(model, unitsSold);
    const supportService = this.calculateSupportServiceRevenue(model, unitsSold);
    
    const totalAdditionalRevenue = softwareLicenses.games + softwareLicenses.office + 
                                  supportService.b2c + supportService.b2b;
    
    return { 
      unitsSold, 
      revenue: hardwareRevenue + totalAdditionalRevenue,
      additionalRevenue: { softwareLicenses, supportService }
    };
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
    
    // 1. Entwicklungsfortschritt aktualisieren
    const updatedModels = this.updateModelDevelopment(models, budget.development);
    
    // 2. Berechne Verkäufe nur für veröffentlichte Modelle
    const modelSales = updatedModels.map((model: any) => {
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
          hardwareRevenue: sales.unitsSold * model.price,
          additionalRevenue: sales.additionalRevenue,
          price: model.price
        };
      }
      return null;
    }).filter(Boolean);

    // Gesamteinnahmen und Verkäufe
    const totalRevenue = modelSales.reduce((sum, sale) => sum + sale.revenue, 0);
    const totalHardwareRevenue = modelSales.reduce((sum, sale) => sum + sale.hardwareRevenue, 0);
    const totalUnitsSold = modelSales.reduce((sum, sale) => sum + sale.unitsSold, 0);
    
    // Aggregiere zusätzliche Einnahmen
    const aggregatedAdditionalRevenue = modelSales.reduce((acc, sale) => {
      return {
        softwareLicenses: {
          games: acc.softwareLicenses.games + sale.additionalRevenue.softwareLicenses.games,
          office: acc.softwareLicenses.office + sale.additionalRevenue.softwareLicenses.office
        },
        supportService: {
          b2c: acc.supportService.b2c + sale.additionalRevenue.supportService.b2c,
          b2b: acc.supportService.b2b + sale.additionalRevenue.supportService.b2b
        }
      };
    }, {
      softwareLicenses: { games: 0, office: 0 },
      supportService: { b2c: 0, b2b: 0 }
    });

    // Ausgaben berechnen - nur die drei Budgets
    const quarterlyExpenses = {
      marketing: budget.marketing,
      development: budget.development,  
      research: budget.research
    };

    const totalExpenses = Object.values(quarterlyExpenses).reduce((sum, exp) => sum + exp, 0);
    const netProfit = totalRevenue - totalExpenses;

    // Marktanteil und Reputation aktualisieren
    const oldMarketShare = company.marketShare || 5;
    const salesImpact = Math.min(10, totalUnitsSold / 1000);
    const marketShareChange = (salesImpact - 2) + (Math.random() - 0.5) * 2;
    const newMarketShare = Math.max(0.1, Math.min(50, oldMarketShare + marketShareChange));

    const oldReputation = company.reputation || 50;
    // Forschungsbudget beeinflusst Reputation stärker
    const researchBonus = budget.research > 50000 ? 3 : budget.research > 25000 ? 1 : 0;
    const reputationChange = (totalUnitsSold > 0 ? 2 : -1) + 
                           researchBonus +
                           (Math.random() - 0.5) * 2;
    const newReputation = Math.max(10, Math.min(100, oldReputation + reputationChange));

    // Konkurrenz-Aktionen
    const competitorActions: string[] = [];
    
    // Entwicklungsfortschritte dokumentieren
    const completedModels = updatedModels.filter((model: any) => 
      model.status === 'released' && 
      models.find((oldModel: any) => oldModel.id === model.id)?.status === 'development'
    );
    
    if (completedModels.length > 0) {
      competitorActions.push(`${completedModels.length} Modell(e) entwicklungsfertig!`);
    }
    
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
        reputation: newReputation,
        monthlyIncome: Math.round(totalRevenue / 3), // Quartalseinnahmen auf Monat runterbrechen
        hardwareIncome: Math.round(totalHardwareRevenue / 3), // Hardware-spezifische Einnahmen
        monthlyExpenses: Math.round(totalExpenses / 3), // Quartalsausgaben auf Monat runterbrechen
        additionalRevenue: aggregatedAdditionalRevenue // Zusätzliche Einnahmen für DetailView
      },
      models: updatedModels.map((model: any) => {
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
      marketEvent,
      developmentUpdates: {
        completedModels: completedModels.length,
        modelsInDevelopment: updatedModels.filter((m: any) => m.status === 'development').length
      }
    };

    return {
      updatedGameState,
      quarterResults,
      updatedCompetitors
    };
  }
}