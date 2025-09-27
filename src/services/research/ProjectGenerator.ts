import { ResearchProject, ProjectSpecs } from './types';

/**
 * Projekt-Spezifikationen und Namen-Generator
 * Reine Funktionen ohne Seiteneffekte für bessere Testbarkeit
 */
export class ProjectGenerator {
  
  /**
   * Generiere Projekt-Spezifikationen basierend auf Typ und Jahr
   */
  static generateProjectSpecs(
    type: ResearchProject['project_type'],
    year: number
  ): ProjectSpecs {
    const baseCost = 50000;
    const yearMultiplier = 1 + (year - 1983) * 0.3;
    
    const specifications: Record<ResearchProject['project_type'], ProjectSpecs> = {
      exclusive_gpu: {
        totalCost: Math.round(baseCost * 2.5 * yearMultiplier),
        specs: {
          performance: 85 + Math.floor(Math.random() * 15), // 85-100
          cost: 180 + Math.floor(Math.random() * 50), // 180-230
          description: `Exklusiver High-Performance Grafik-Chip ${year}`,
          bonusFeatures: ['Hardware-Beschleunigung', 'Erweiterte Farbpalette', 'Anti-Aliasing']
        }
      },
      exclusive_sound: {
        totalCost: Math.round(baseCost * 1.8 * yearMultiplier),
        specs: {
          performance: 80 + Math.floor(Math.random() * 20), // 80-100
          cost: 120 + Math.floor(Math.random() * 40), // 120-160
          description: `Exklusiver Premium Audio-Chip ${year}`,
          bonusFeatures: ['16-Bit Audio', 'Surround Sound', 'Hardware-Reverb']
        }
      },
      exclusive_cpu: {
        totalCost: Math.round(baseCost * 3.5 * yearMultiplier),
        specs: {
          performance: 90 + Math.floor(Math.random() * 10), // 90-100
          cost: 350 + Math.floor(Math.random() * 100), // 350-450
          description: `Exklusiver Hochleistungs-Prozessor ${year}`,
          bonusFeatures: ['Erweiterte Instruction Sets', 'Cache-Optimierung', 'Pipeline Enhancement']
        }
      },
      exclusive_case: {
        totalCost: Math.round(baseCost * 1.2 * yearMultiplier),
        specs: {
          performance: 75 + Math.floor(Math.random() * 25), // 75-100 (design rating)
          cost: 250 + Math.floor(Math.random() * 150), // 250-400
          description: `Exklusives Premium-Gehäuse Design ${year}`,
          bonusFeatures: ['Modulares Design', 'Premium-Materialien', 'Tool-free Assembly']
        }
      }
    };

    return specifications[type];
  }

  /**
   * Generiere attraktive Projektnamen
   */
  static generateProjectName(type: ResearchProject['project_type']): string {
    const prefixes = ['Projekt', 'Codename', 'Operation'];
    const names = {
      exclusive_gpu: ['Phoenix', 'Titan', 'Vortex', 'Quantum', 'Nexus'],
      exclusive_sound: ['Harmony', 'Resonance', 'Crystal', 'Symphony', 'Echo'],
      exclusive_cpu: ['Lightning', 'Thunder', 'Velocity', 'Apex', 'Prime'],
      exclusive_case: ['Phantom', 'Elite', 'Prestige', 'Infinity', 'Zenith']
    };

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const name = names[type][Math.floor(Math.random() * names[type].length)];
    
    return `${prefix} ${name}`;
  }
}