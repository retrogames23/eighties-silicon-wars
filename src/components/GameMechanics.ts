// Game mechanics and AI competition logic
import { getNewsForQuarter } from '@/data/NewsEvents';

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

export interface CustomChip {
  id: string;
  name: string;
  type: 'cpu' | 'gpu' | 'sound' | 'case';
  performance: number;
  cost: number;
  description: string;
  developedYear: number;
  developedQuarter: number;
  exclusiveToPlayer: boolean;
}

export interface GameEndCondition {
  isGameEnded: boolean;
  winner?: string;
  finalResults?: {
    playerRank: number;
    finalMarketShare: number;
    totalRevenue: number;
    customChipsCount: number;
  };
}

// Zeitbasierte Hardware-Verfügbarkeit (historisch korrekt)
export const HARDWARE_TIMELINE = {
  1983: {
    1: ['MOS 6502', 'Zilog Z80', 'MOS VIC', '4KB RAM', '16KB RAM', 'PC Speaker'],
    2: ['TI TMS9918', 'Kassettenlaufwerk'],
    3: ['Diskettenlaufwerk 5.25"', 'RF Modulator'],
    4: ['AY-3-8910', 'Composite Monitor']
  },
  1984: {
    1: ['Intel 8086', 'Atari GTIA', '64KB RAM'],
    2: ['Motorola 68000'],
    3: ['Commodore VIC-II', 'SID 6581'],
    4: ['RGB Monitor']
  },
  1985: {
    1: ['Intel 80286', '256KB RAM'],
    2: ['Yamaha YM2149', 'Festplatte 5MB'],
    3: ['Diskettenlaufwerk 3.5"'],
    4: ['EGA Graphics']
  },
  1986: {
    1: ['Intel 80386', '512KB RAM'],
    2: ['VGA Graphics', 'AdLib Sound'],
    3: ['1MB RAM', 'Festplatte 10MB'],
    4: ['CD-ROM Drive (experimentell)']
  },
  1987: {
    1: ['Sound Blaster', '2MB RAM'],
    2: ['Super VGA', 'Festplatte 20MB'],
    3: ['Intel 80387 Coprozessor'],
    4: ['MIDI Interface']
  },
  1988: {
    1: ['Intel 80486', '4MB RAM'],
    2: ['Festplatte 40MB', 'VGA Plus'],
    3: ['CD-ROM Standard'],
    4: ['Netzwerkkarte']
  },
  1989: {
    1: ['8MB RAM', 'Super VGA 1MB'],
    2: ['Festplatte 80MB'],
    3: ['Sound Blaster Pro'],
    4: ['Local Bus Graphics']
  },
  1990: {
    1: ['Intel 80486DX', '16MB RAM'],
    2: ['Festplatte 120MB', 'SCSI Interface'],
    3: ['Multimedia Extensions'],
    4: ['High-End Workstation Components']
  },
  1991: {
    1: ['32MB RAM', 'Festplatte 200MB'],
    2: ['SVGA High-Res', 'Advanced Sound Cards'],
    3: ['CD-ROM 2x Speed'],
    4: ['Early Pentium Prototypes']
  },
  1992: {
    1: ['64MB RAM', 'Festplatte 500MB'],
    2: ['VESA Local Bus'],
    3: ['Final Generation Components'],
    4: ['Game Ende - PC-Ära beginnt']
  }
};
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
    // Schnellere Entwicklung: 1-2 Quartale statt 1-3
    if (complexity <= 40) return 1; // Erhöht von 30 auf 40
    return 2; // Maximal 2 Quartale statt 3
  }

  static updateModelDevelopment(models: any[], developmentBudget: number): any[] {
    const budgetSpeedMultiplier = Math.max(0.5, Math.min(2.0, developmentBudget / 30000)); // Angepasst: 30k = 1x Speed
    
    console.log(`Development Budget: $${developmentBudget}, Speed Multiplier: ${budgetSpeedMultiplier.toFixed(2)}`);
    
    return models.map(model => {
      if (model.status === 'development') {
        const progressIncrement = (100 / model.developmentTime) * budgetSpeedMultiplier;
        const newProgress = Math.min(100, model.developmentProgress + progressIncrement);
        
        console.log(`Model: ${model.name}, Progress: ${model.developmentProgress}% → ${newProgress.toFixed(1)}% (+${progressIncrement.toFixed(1)}%)`);
        
        if (newProgress >= 100) {
          console.log(`🎉 Model ${model.name} is now RELEASED!`);
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

  // Custom Hardware Development durch Forschung & Entwicklung
  static attemptCustomHardwareDevelopment(
    researchBudget: number, 
    developmentBudget: number, 
    year: number, 
    quarter: number,
    existingCustomChips: CustomChip[] = []
  ): CustomChip | null {
    const totalBudget = researchBudget + developmentBudget;
    
    // Basis-Chance: 5%, +1% pro 10k Budget, max 25%
    const baseChance = Math.min(0.25, 0.05 + (totalBudget / 10000) * 0.01);
    
    if (Math.random() > baseChance) return null;
    
    // Bestimme Art des Custom Chips basierend auf Budget-Verteilung
    const researchRatio = researchBudget / totalBudget;
    let chipType: 'cpu' | 'gpu' | 'sound' | 'case';
    
    if (researchRatio > 0.7) chipType = 'cpu'; // Forschungslastig = CPU
    else if (researchRatio < 0.3) chipType = 'case'; // Entwicklungslastig = Case
    else chipType = Math.random() > 0.5 ? 'gpu' : 'sound';
    
    // Verhindere zu viele Custom Chips des gleichen Typs
    const sameTypeCount = existingCustomChips.filter(c => c.type === chipType).length;
    if (sameTypeCount >= 2) return null;
    
    const customChip: CustomChip = {
      id: `custom-${chipType}-${year}-${quarter}`,
      name: this.generateCustomChipName(chipType, year),
      type: chipType,
      performance: this.calculateCustomChipPerformance(chipType, totalBudget, year),
      cost: this.calculateCustomChipCost(chipType, totalBudget),
      description: this.generateCustomChipDescription(chipType, year),
      developedYear: year,
      developedQuarter: quarter,
      exclusiveToPlayer: true
    };
    
    return customChip;
  }

  static generateCustomChipName(type: string, year: number): string {
    const prefixes = {
      cpu: ['Phoenix', 'Quantum', 'Nova', 'Apex', 'Vector'],
      gpu: ['Vision', 'Pixel', 'Render', 'Crystal', 'Spectrum'],  
      sound: ['Audio', 'Sonic', 'Wave', 'Echo', 'Harmony'],
      case: ['Elite', 'Professional', 'Master', 'Premium', 'Custom']
    };
    
    const prefix = prefixes[type as keyof typeof prefixes];
    const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
    
    return `${randomPrefix} ${type.toUpperCase()}-${year}`;
  }

  static calculateCustomChipPerformance(type: string, budget: number, year: number): number {
    const basePerfByType = { cpu: 50, gpu: 45, sound: 60, case: 40 };
    const basePerf = basePerfByType[type as keyof typeof basePerfByType] || 50;
    
    // Budget-Bonus: +20% bei 100k Budget
    const budgetBonus = Math.min(0.4, budget / 250000);
    
    // Jahr-Bonus: Technologie wird besser über Zeit
    const yearBonus = (year - 1983) * 0.05;
    
    return Math.round(basePerf * (1 + budgetBonus + yearBonus));
  }

  static calculateCustomChipCost(type: string, budget: number): number {
    const baseCostByType = { cpu: 80, gpu: 60, sound: 40, case: 30 };
    const baseCost = baseCostByType[type as keyof typeof baseCostByType] || 50;
    
    // Custom Chips sind etwa 30% günstiger als Markt-Äquivalente
    return Math.round(baseCost * 0.7);
  }

  static generateCustomChipDescription(type: string, year: number): string {
    const descriptions = {
      cpu: `Proprietärer ${year} Prozessor mit optimierter Architektur`,
      gpu: `Exklusiver Grafikchip mit erweiterten ${year} Features`,
      sound: `Custom Audio-Chip mit proprietären ${year} Sound-Algorithmen`, 
      case: `Maßgeschneidertes ${year} Gehäuse-Design mit optimierter Kühlung`
    };
    
    return descriptions[type as keyof typeof descriptions] || 'Custom Hardware-Komponente';
  }

  // Game End Detection
  static checkGameEnd(year: number, quarter: number): GameEndCondition {
    if (year > 1992 || (year === 1992 && quarter >= 4)) {
      return {
        isGameEnded: true,
        winner: 'Zeit abgelaufen - Die PC-Ära beginnt!'
      };
    }
    
    return { isGameEnded: false };
  }

  static calculateFinalResults(gameState: any, competitors: Competitor[]): GameEndCondition {
    const playerMarketShare = gameState.company.marketShare || 0;
    
    // Bestimme Spieler-Rang
    const competitorsAbove = competitors.filter(c => c.marketShare > playerMarketShare).length;
    const playerRank = competitorsAbove + 1;
    
    // Bestimme Gewinner
    let winner = '';
    if (playerRank === 1) {
      winner = `🏆 Du hast gewonnen! Mit ${playerMarketShare.toFixed(1)}% Marktanteil bist du der König der Heimcomputer-Ära!`;
    } else if (playerRank <= 3) {
      winner = `🥈 Starke Leistung! Platz ${playerRank} in der Heimcomputer-Ära. Ein respektables Ergebnis!`;
    } else {
      winner = `📊 Platz ${playerRank} erreicht. Die Heimcomputer-Ära ist vorbei, aber du hast Erfahrungen gesammelt!`;
    }
    
    return {
      isGameEnded: true,
      winner,
      finalResults: {
        playerRank,
        finalMarketShare: playerMarketShare,
        totalRevenue: gameState.totalRevenue || 0,
        customChipsCount: gameState.customChips?.length || 0
      }
    };
  }

  static getAvailableComponents(researchBudget: number, currentYear: number, currentQuarter: number, customChips: CustomChip[] = []): any[] {
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

  static checkForNewHardware(
    previousResearchBudget: number,
    currentResearchBudget: number,
    currentYear: number,
    currentQuarter: number,
    announcedHardware: string[] = []
  ): { name: string; type: string; description: string; performance?: number }[] {
    const previousLevel = Math.floor(previousResearchBudget / 15000); // Schnellerer Unlock: alle 15k statt 25k
    const currentLevel = Math.floor(currentResearchBudget / 15000);
    
    // Erweiterte Hardware-Details mit mehr Komponenten
    const hardwareDetails = {
      // Level 1 (15k+)
      'Intel 8086': { type: 'cpu', description: '16-bit Prozessor, 5 MHz - Perfekt für Business-Anwendungen', performance: 35 },
      'TI TMS9918': { type: 'gpu', description: '256x192 Pixel, 16 Farben - Exzellent für Spiele', performance: 25 },
      '64KB RAM': { type: 'ram', description: 'Erweiterte Speicherkapazität für komplexere Programme', performance: 30 },
      'AY-3-8910': { type: 'sound', description: '3-Kanal Sound-Chip für beeindruckende Audioeffekte', performance: 20 },
      
      // Level 2 (30k+)
      'Motorola 68000': { type: 'cpu', description: '16/32-bit Prozessor, 8 MHz - Premium-Performance', performance: 45 },
      'Atari GTIA': { type: 'gpu', description: 'Fortschrittliche Grafik mit 256 Farben', performance: 30 },
      '256KB RAM': { type: 'ram', description: 'Viel Arbeitsspeicher für professionelle Anwendungen', performance: 50 },
      'SID 6581': { type: 'sound', description: 'Legendärer Sound-Synthesizer mit 3 Stimmen', performance: 35 },
      
      // Level 3 (45k+)
      'Intel 80286': { type: 'cpu', description: '16-bit Prozessor, 12 MHz - Top-Performance der 80er', performance: 65 },
      'Commodore VIC-II': { type: 'gpu', description: 'Der berühmte C64-Grafikchip mit Sprites', performance: 40 },
      'Yamaha YM2149': { type: 'sound', description: 'Professioneller Sound-Chip für hochwertige Musik', performance: 25 },
      'Diskettenlaufwerk 3.5"': { type: 'accessory', description: 'Moderne 3.5" Disketten mit 720KB', performance: 25 },
      
      // Level 4 (60k+)
      'Intel 80386': { type: 'cpu', description: '32-bit Prozessor, 16 MHz - Zukunftstechnologie', performance: 85 },
      'VGA Graphics': { type: 'gpu', description: '640x480 Pixel, 256 Farben - Professionelle Grafik', performance: 55 },
      '512KB RAM': { type: 'ram', description: 'Massive Speicherkapazität für komplexe Anwendungen', performance: 70 },
      'AdLib Sound': { type: 'sound', description: 'FM-Synthesizer für hochwertige Musik und Effekte', performance: 45 },
      
      // Level 5 (75k+)
      'Motorola 68030': { type: 'cpu', description: '32-bit Prozessor mit MMU - Workstation-Niveau', performance: 95 },
      'Festplatte 20MB': { type: 'accessory', description: 'Permanenter Speicher für das Betriebssystem', performance: 60 },
      '1MB RAM': { type: 'ram', description: 'Extrem viel Arbeitsspeicher für Multitasking', performance: 90 },
      'SCSI Controller': { type: 'accessory', description: 'Schnelle Datenübertragung für Peripheriegeräte', performance: 40 }
    };

    const researchUnlocks = [
      ['Intel 8086', 'TI TMS9918', '64KB RAM', 'AY-3-8910'], // Level 1
      ['Motorola 68000', 'Atari GTIA', '256KB RAM', 'SID 6581'], // Level 2
      ['Intel 80286', 'Commodore VIC-II', 'Yamaha YM2149', 'Diskettenlaufwerk 3.5"'], // Level 3
      ['Intel 80386', 'VGA Graphics', '512KB RAM', 'AdLib Sound'], // Level 4
      ['Motorola 68030', 'Festplatte 20MB', '1MB RAM', 'SCSI Controller'] // Level 5
    ];

    // Zeitbasierte Hardware-Freischaltungen (auch ohne Forschung)
    const timeBasedUnlocks = this.getTimeBasedHardware(currentYear, currentQuarter);

    const newHardware: { name: string; type: string; description: string; performance?: number }[] = [];
    
    // Forschungsbasierte Unlocks
    for (let level = previousLevel; level < Math.min(currentLevel, researchUnlocks.length); level++) {
      const unlockedComponents = researchUnlocks[level];
      for (const component of unlockedComponents) {
        if (!announcedHardware.includes(component)) {
          const details = hardwareDetails[component as keyof typeof hardwareDetails];
          if (details) {
            newHardware.push({
              name: component,
              type: details.type,
              description: details.description,
              performance: details.performance
            });
          }
        }
      }
    }
    
    // Zeitbasierte Unlocks hinzufügen
    for (const component of timeBasedUnlocks) {
      if (!announcedHardware.includes(component) && !newHardware.find(hw => hw.name === component)) {
        const details = hardwareDetails[component as keyof typeof hardwareDetails];
        if (details) {
          newHardware.push({
            name: component,
            type: details.type,
            description: details.description + " (Markteinführung)",
            performance: details.performance
          });
        }
      }
    }
    
    return newHardware;
  }

  static getTimeBasedHardware(year: number, quarter: number): string[] {
    const unlocks: string[] = [];
    
    // 1984 Q2: Intel 8086 wird allgemein verfügbar
    if (year > 1984 || (year === 1984 && quarter >= 2)) {
      unlocks.push('Intel 8086');
    }
    
    // 1985 Q1: Erweiterte Grafikchips
    if (year > 1985 || (year === 1985 && quarter >= 1)) {
      unlocks.push('TI TMS9918', 'Atari GTIA');
    }
    
    // 1985 Q3: Sound-Revolution
    if (year > 1985 || (year === 1985 && quarter >= 3)) {
      unlocks.push('SID 6581', 'AY-3-8910');
    }
    
    // 1986 Q1: 16-bit Era beginnt
    if (year > 1986 || (year === 1986 && quarter >= 1)) {
      unlocks.push('Motorola 68000', 'Intel 80286');
    }
    
    // 1986 Q4: 32-bit Technologie (früh aber teuer)
    if (year > 1986 || (year === 1986 && quarter >= 4)) {
      unlocks.push('Intel 80386');
    }
    
    return unlocks;
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

  static calculateGamerAppeal(model: any): number {
    // Gamer wollen: Gute Grafik, Sound, und spieletaugliche CPU
    let appeal = 0;
    
    // Grafik ist sehr wichtig für Gamer (30% des Appeals)
    const gpuScores = {
      'MOS VIC': 20, 'TI TMS9918': 50, 'Atari GTIA': 70, 'Commodore VIC-II': 85
    };
    appeal += (gpuScores[model.gpu as keyof typeof gpuScores] || 10) * 0.3;
    
    // Sound ist wichtig (20% des Appeals) 
    const soundScores = {
      'PC Speaker': 10, 'AY-3-8910': 60, 'SID 6581': 90, 'Yamaha YM2149': 70
    };
    appeal += (soundScores[model.sound as keyof typeof soundScores] || 10) * 0.2;
    
    // CPU für Spiele (15% des Appeals)
    const cpuGamingScores = {
      'MOS 6502': 40, 'Zilog Z80': 50, 'Intel 8086': 30, 'Motorola 68000': 80, 'Intel 80286': 35
    };
    appeal += (cpuGamingScores[model.cpu as keyof typeof cpuGamingScores] || 20) * 0.15;
    
    // RGB Monitor Bonus (15% des Appeals)
    const hasColorMonitor = model.accessories?.includes('RGB Monitor');
    appeal += (hasColorMonitor ? 80 : 20) * 0.15;
    
    // Case Design sehr wichtig für Gamer (20% des Appeals)
    const caseDesignScore = model.case?.type === 'gamer' ? model.case.design : 20;
    appeal += (caseDesignScore || 20) * 0.2;
    
    return Math.min(100, appeal);
  }

  static calculateBusinessAppeal(model: any): number {
    // Büro will: Schnelle CPU, viel RAM, Speicher. Grafik/Sound egal
    let appeal = 0;
    
    // CPU-Geschwindigkeit ist kritisch (40% des Appeals)
    const cpuBusinessScores = {
      'MOS 6502': 20, 'Zilog Z80': 30, 'Intel 8086': 70, 'Motorola 68000': 85, 'Intel 80286': 95
    };
    appeal += (cpuBusinessScores[model.cpu as keyof typeof cpuBusinessScores] || 20) * 0.4;
    
    // RAM-Menge ist sehr wichtig (30% des Appeals)
    const ramAmount = this.getRAMAmount(model.ram);
    const ramScore = Math.min(100, (ramAmount / 256) * 100); // 256KB = 100%
    appeal += ramScore * 0.3;
    
    // Speicher-Laufwerk wichtig (15% des Appeals)  
    const hasStorage = model.accessories?.some((acc: string) => 
      acc.includes('Diskette') || acc.includes('Festplatte')
    );
    appeal += (hasStorage ? 80 : 20) * 0.15;
    
    // Case Qualität wichtig für Business (15% des Appeals)
    const caseQualityScore = model.case?.type === 'office' ? model.case.quality : 
                            model.case?.quality || 30; // Gamer-Cases haben weniger Business-Appeal
    appeal += (caseQualityScore || 30) * 0.15;
    
    return Math.min(100, appeal);
  }

  // Aktualisiere GameMechanics für realistische Sales
  static calculateModelSales(
    model: any,
    marketingBudget: number,
    playerReputation: number,
    marketSize: number,
    currentQuarter: number,
    currentYear: number,
    competitorModels: CompetitorModel[] = []
  ): { 
    unitsSold: number; 
    revenue: number; 
    additionalRevenue: { 
      softwareLicenses: { games: number; office: number }; 
      supportService: { b2c: number; b2b: number } 
    };
    segmentBreakdown: {
      gamer: { units: number; revenue: number };
      business: { units: number; revenue: number };
    }
  } {
    if (model.status !== 'released') return { 
      unitsSold: 0, 
      revenue: 0, 
      additionalRevenue: { 
        softwareLicenses: { games: 0, office: 0 }, 
        supportService: { b2c: 0, b2b: 0 } 
      },
      segmentBreakdown: {
        gamer: { units: 0, revenue: 0 },
        business: { units: 0, revenue: 0 }
      }
    };

    // Verwende neues Wirtschaftsmodell
    const economicFactors = {
      marketSegments: {
        gamer: { 
          size: 70000 + (currentYear - 1983) * 15000,
          priceElasticity: 0.7,
          maxPrice: 800 + (currentYear - 1983) * 100
        },
        business: { 
          size: 30000 + (currentYear - 1983) * 8000,
          priceElasticity: 0.3,
          maxPrice: 2000 + (currentYear - 1983) * 500
        }
      },
      techTrends: {
        cpuDemand: 0.8 + (currentYear - 1983) * 0.05,
        graphicsDemand: currentYear >= 1985 ? 1.2 : 0.9,
        soundDemand: currentYear >= 1984 ? 1.1 : 0.8,
        storageDemand: currentYear >= 1986 ? 1.3 : 1.0
      }
    };

    // Realistische Verkaufsberechnung
    const gamerAppeal = this.calculateGamerAppeal(model) * 0.8; // Reduziert für Realismus
    const businessAppeal = this.calculateBusinessAppeal(model) * 0.8;
    
    const marketingMultiplier = Math.sqrt(marketingBudget / 25000);
    const reputationBonus = Math.max(0.5, playerReputation / 100);
    
    // Preis-Akzeptanz
    const gamerPriceAcceptance = model.price > economicFactors.marketSegments.gamer.maxPrice ? 
      Math.max(0.1, 1 - (model.price - economicFactors.marketSegments.gamer.maxPrice) / economicFactors.marketSegments.gamer.maxPrice) : 1.0;
    const businessPriceAcceptance = model.price > economicFactors.marketSegments.business.maxPrice ? 
      Math.max(0.2, 1 - (model.price - economicFactors.marketSegments.business.maxPrice) / (economicFactors.marketSegments.business.maxPrice * 2)) : 
      Math.min(1.2, 1 + (economicFactors.marketSegments.business.maxPrice - model.price) / (economicFactors.marketSegments.business.maxPrice * 3));

    // Verkäufe berechnen
    const gamerSales = Math.floor(
      (gamerAppeal / 100) * 
      marketingMultiplier * 
      reputationBonus * 
      gamerPriceAcceptance *
      (economicFactors.marketSegments.gamer.size / 30000) * // Realistische Basis
      (0.3 + Math.random() * 0.4) // 30-70% des theoretischen Potentials
    );

    const businessSales = Math.floor(
      (businessAppeal / 100) * 
      marketingMultiplier * 
      reputationBonus * 
      businessPriceAcceptance *
      (economicFactors.marketSegments.business.size / 50000) * // Business kauft weniger Einheiten
      (0.2 + Math.random() * 0.3) // 20-50% des theoretischen Potentials
    );

    const totalUnitsSold = Math.max(0, gamerSales + businessSales);
    const totalHardwareRevenue = totalUnitsSold * model.price;
    
    // Zusätzliche Einnahmequellen
    const softwareLicenses = this.calculateSoftwareLicenseRevenue(model, totalUnitsSold);
    const supportService = this.calculateSupportServiceRevenue(model, totalUnitsSold);
    
    const totalAdditionalRevenue = softwareLicenses.games + softwareLicenses.office + 
                                  supportService.b2c + supportService.b2b;
    
    return { 
      unitsSold: totalUnitsSold, 
      revenue: totalHardwareRevenue + totalAdditionalRevenue,
      additionalRevenue: { softwareLicenses, supportService },
      segmentBreakdown: {
        gamer: { units: gamerSales, revenue: gamerSales * model.price },
        business: { units: businessSales, revenue: businessSales * model.price }
      }
    };
  }

  static updateCompetitors(competitors: Competitor[], quarter: number, year: number, playerMarketShare: number = 0): Competitor[] {
    // Historische Marktanteile basierend auf realen Daten der 80er Jahre
    const historicalMarketShares = {
      1983: { 'Apple Computer': 25, 'Commodore': 30, 'IBM': 20, 'Atari': 15 },
      1984: { 'Apple Computer': 22, 'Commodore': 35, 'IBM': 25, 'Atari': 12 },
      1985: { 'Apple Computer': 20, 'Commodore': 32, 'IBM': 30, 'Atari': 10 },
      1986: { 'Apple Computer': 18, 'Commodore': 28, 'IBM': 35, 'Atari': 8 },
      1987: { 'Apple Computer': 16, 'Commodore': 25, 'IBM': 40, 'Atari': 6 }
    };

    const currentYearData = historicalMarketShares[year as keyof typeof historicalMarketShares] || 
                          historicalMarketShares[1987]; // Fallback zu 1987

    return competitors.map(comp => {
      // Berechne Ziel-Marktanteil basierend auf historischen Daten
      const targetShare = currentYearData[comp.name as keyof typeof currentYearData] || comp.marketShare;
      
      // Reduziere alle Konkurrenten-Anteile proportional basierend auf Player-Marktanteil  
      const adjustedTargetShare = targetShare * (100 - playerMarketShare) / 100;
      
      // Langsame Anpassung in Richtung Zielwert (max 2% Änderung pro Quartal)
      const maxChange = 2;
      const shareChange = Math.max(-maxChange, Math.min(maxChange, adjustedTargetShare - comp.marketShare));
      const newMarketShare = Math.max(0.1, comp.marketShare + shareChange);

      // AI Entscheidungen für neue Modelle basierend auf Jahr
      const shouldRelease = Math.random() < this.getCompetitorReleaseChance(comp.name, quarter, year);
      
      if (shouldRelease) {
        const newModel: CompetitorModel = {
          name: `${comp.name} ${year} Model`,
          price: this.getCompetitorPrice(comp.name, year),
          performance: this.getCompetitorPerformance(comp.name, year),
          unitsSold: 0,
          releaseQuarter: quarter,
          releaseYear: year
        };
        comp.models.push(newModel);
      }

      // Update sales for existing models - realistischere Verkaufszahlen
      comp.models = comp.models.map(model => ({
        ...model,
        unitsSold: model.unitsSold + Math.floor(
          (newMarketShare / 100) * 10000 * (0.8 + Math.random() * 0.4)
        )
      }));

      return {
        ...comp,
        marketShare: newMarketShare
      };
    });
  }

  // Hilfsfunktionen für realistischere KI-Konkurrenz
  static getCompetitorReleaseChance(companyName: string, quarter: number, year: number): number {
    const baseChance = quarter === 1 ? 0.4 : 0.15; // Höhere Chance zu Jahresbeginn
    
    // Firmen-spezifische Modifikationen
    switch (companyName) {
      case 'Apple Computer': return baseChance * 0.8; // Seltener, aber hochwertigere Releases
      case 'Commodore': return baseChance * 1.2; // Aggressive Releasezyklen
      case 'IBM': return baseChance * 0.9; // Konservativ aber regelmäßig
      case 'Atari': return baseChance * 1.1; // Viele Versuche, den Markt zurückzugewinnen
      default: return baseChance;
    }
  }

  static getCompetitorPrice(companyName: string, year: number): number {
    const basePrice = 800 + (year - 1983) * 200; // Preise steigen mit der Zeit
    
    switch (companyName) {
      case 'Apple Computer': return basePrice * 1.8; // Premium-Preise
      case 'Commodore': return basePrice * 0.7; // Günstige Massenware
      case 'IBM': return basePrice * 2.2; // Sehr teure Business-Systeme
      case 'Atari': return basePrice * 0.8; // Konkurrenzfähige Preise
      default: return basePrice;
    }
  }

  static getCompetitorPerformance(companyName: string, year: number): number {
    const basePerformance = 40 + (year - 1983) * 8; // Performance steigt mit der Zeit
    
    switch (companyName) {
      case 'Apple Computer': return basePerformance + 10; // Innovative Technik
      case 'Commodore': return basePerformance - 5; // Solide aber nicht führend
      case 'IBM': return basePerformance + 15; // Technologieführer
      case 'Atari': return basePerformance - 10; // Veraltete Technik
      default: return basePerformance;
    }
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
    gameEndCondition?: GameEndCondition;
    newCustomChip?: CustomChip;
    newsEvents?: any[];
    marketData?: any;
  } {
    const { budget, models, company } = gameState;
    
    // 1. Prüfe auf Spielende
    const gameEndCondition = this.checkGameEnd(gameState.year, gameState.quarter);
    if (gameEndCondition.isGameEnded) {
      const finalResults = this.calculateFinalResults(gameState, competitors);
      return {
        updatedGameState: gameState,
        quarterResults: null,
        updatedCompetitors: competitors,
        gameEndCondition: finalResults
      };
    }
    
    // 2. Custom Hardware Development Chance
    const customChips = gameState.customChips || [];
    const newCustomChip = this.attemptCustomHardwareDevelopment(
      budget.research,
      budget.development, 
      gameState.year,
      gameState.quarter,
      customChips
    );
    
    // 3. Entwicklungsfortschritt aktualisieren
    const updatedModels = this.updateModelDevelopment(models, budget.development);
    
    // 4. Berechne Verkäufe nur für veröffentlichte Modelle
    const modelSales = updatedModels.map((model: any) => {
      if (model.status === 'released') {
        console.log(`Calculating sales for RELEASED model: ${model.name}`);
        const competitorModels = competitors.flatMap(comp => comp.models);
        const sales = this.calculateModelSales(
          model, 
          budget.marketing, 
          company.reputation, 
          1000000,
          gameState.quarter,
          gameState.year,
          competitorModels
        );
        
        console.log(`Model ${model.name} sales:`, {
          unitsSold: sales.unitsSold,
          revenue: sales.revenue,
          price: model.price
        });
        
        return {
          modelName: model.name,
          unitsSold: sales.unitsSold,
          revenue: sales.revenue,
          hardwareRevenue: sales.unitsSold * model.price,
          additionalRevenue: sales.additionalRevenue,
          segmentBreakdown: sales.segmentBreakdown,
          price: model.price
        };
      } else {
        console.log(`Skipping model ${model.name} - status: ${model.status}`);
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
    
    // Aktualisierte Konkurrenten mit Player-Marktanteil berücksichtigen
    const updatedCompetitors = this.updateCompetitors(
      competitors, 
      gameState.quarter, 
      gameState.year,
      newMarketShare
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
      customChips: newCustomChip ? [...customChips, newCustomChip] : customChips,
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
      newCustomChip, // Neuer Custom Chip falls entwickelt
      developmentUpdates: {
        completedModels: completedModels.length,
        modelsInDevelopment: updatedModels.filter((m: any) => m.status === 'development').length
      }
    };

    // Generate news events and market data for newspaper
    const newsEvents = this.generateNewsEvents(gameState.quarter, gameState.year, gameState, updatedCompetitors);
    const marketData = this.generateMarketData(gameState, updatedCompetitors, modelSales);

    return {
      updatedGameState,
      quarterResults,
      updatedCompetitors,
      newCustomChip,
      newsEvents,
      marketData
    };
  }

  static generateNewsEvents(quarter: number, year: number, gameState: any, competitors: Competitor[]): any[] {
    const events = [];
    
    // Get news events from data
    const historicalNews = getNewsForQuarter(quarter, year);
    events.push(...historicalNews);
    
    // Add dynamic competitor news
    competitors.forEach(comp => {
      const newModels = comp.models.filter(model => 
        model.releaseQuarter === quarter && model.releaseYear === year
      );
      
      if (newModels.length > 0) {
        events.push({
          id: `${comp.name}_${year}q${quarter}`,
          quarter,
          year,
          category: 'competitor',
          headline: `${comp.name} stellt ${newModels[0].name} vor`,
          content: `${comp.name} hat einen neuen Computer für $${newModels[0].price.toLocaleString()} angekündigt. Das Gerät soll den Markt revolutionieren.`
        });
      }
    });
    
    // Add technology advancement news
    if (gameState.customChips && gameState.customChips.length > 0) {
      const latestChip = gameState.customChips[gameState.customChips.length - 1];
      events.push({
        id: `custom_chip_${year}q${quarter}`,
        quarter,
        year,
        category: 'tech',
        headline: 'Kleine Firma entwickelt bahnbrechende Technologie',
        content: `Ein unbekannter Hersteller hat "${latestChip.name}" entwickelt. Die Technologie könnte den Markt verändern.`
      });
    }
    
    return events;
  }

  static generateMarketData(gameState: any, competitors: Competitor[], modelSales: any[]): any {
    // Calculate total market size growth
    const baseMarketSize = 5000000; // $5M base market
    const yearGrowth = (gameState.year - 1983) * 0.3; // 30% growth per year
    const totalMarketSize = Math.floor(baseMarketSize * (1 + yearGrowth));
    const marketGrowth = yearGrowth > 0 ? 0.3 : 0.15; // Growth rate
    
    // Top computers in the market (player + competitors)
    const topComputers = [];
    
    // Add player models
    modelSales.forEach(sale => {
      if (sale.unitsSold > 0) {
        topComputers.push({
          name: sale.modelName,
          company: gameState.company.name,
          unitsSold: sale.unitsSold,
          marketShare: (sale.unitsSold / 100000) * 100 // Rough market share calc
        });
      }
    });
    
    // Add competitor models (simulated)
    competitors.forEach(comp => {
      comp.models.forEach(model => {
        if (model.unitsSold > 0) {
          topComputers.push({
            name: model.name,
            company: comp.name,
            unitsSold: model.unitsSold,
            marketShare: (model.unitsSold / 100000) * 100
          });
        }
      });
    });
    
    // Sort by units sold and take top 5
    topComputers.sort((a, b) => b.unitsSold - a.unitsSold);
    
    return {
      totalMarketSize,
      marketGrowth,
      topComputers: topComputers.slice(0, 5)
    };
  }
}