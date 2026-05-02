import { ResearchProject, ProjectSpecs } from './types';

/**
 * Projekt-Spezifikationen und Namen-Generator
 *
 * REFACTOR (Konzept v2): Forschungskosten skalieren exponentiell mit dem Level
 * (= Anzahl bereits abgeschlossener Projekte desselben Typs):
 *   totalCost = baseCost · 1.6^(level − 1)
 * Inflations-Anteil bleibt linear (~30 % pro Jahr seit 1983).
 */
export class ProjectGenerator {

  /**
   * Generiere Projekt-Spezifikationen basierend auf Typ, Jahr und Level.
   * @param level 1 für das erste Projekt dieses Typs, 2 für das zweite, ...
   */
  static generateProjectSpecs(
    type: ResearchProject['project_type'],
    year: number,
    level: number = 1
  ): ProjectSpecs {
    const baseCost = 50000;
    const yearMultiplier = 1 + (year - 1983) * 0.3;
    const levelMultiplier = Math.pow(1.6, Math.max(0, level - 1));

    const baseCostMultipliers: Record<ResearchProject['project_type'], number> = {
      exclusive_gpu: 2.5,
      exclusive_sound: 1.8,
      exclusive_cpu: 3.5,
      exclusive_case: 1.2,
    };

    const performanceFloor: Record<ResearchProject['project_type'], { perf: [number, number]; cost: [number, number]; desc: string; bonus: string[] }> = {
      exclusive_gpu: {
        perf: [85, 100], cost: [180, 230],
        desc: `Exklusiver High-Performance Grafik-Chip ${year}`,
        bonus: ['Hardware-Beschleunigung', 'Erweiterte Farbpalette', 'Anti-Aliasing'],
      },
      exclusive_sound: {
        perf: [80, 100], cost: [120, 160],
        desc: `Exklusiver Premium Audio-Chip ${year}`,
        bonus: ['16-Bit Audio', 'Surround Sound', 'Hardware-Reverb'],
      },
      exclusive_cpu: {
        perf: [90, 100], cost: [350, 450],
        desc: `Exklusiver Hochleistungs-Prozessor ${year}`,
        bonus: ['Erweiterte Instruction Sets', 'Cache-Optimierung', 'Pipeline Enhancement'],
      },
      exclusive_case: {
        perf: [75, 100], cost: [250, 400],
        desc: `Exklusives Premium-Gehäuse Design ${year}`,
        bonus: ['Modulares Design', 'Premium-Materialien', 'Tool-free Assembly'],
      },
    };

    const cfg = performanceFloor[type];
    const totalCost = Math.round(baseCost * baseCostMultipliers[type] * yearMultiplier * levelMultiplier);

    // Höhere Level liefern bessere Komponenten (Performance-Bonus, +5 pro Level, max 100)
    const levelPerfBonus = Math.min(15, (level - 1) * 5);
    const perfMin = Math.min(100, cfg.perf[0] + levelPerfBonus);
    const perfMax = Math.min(100, cfg.perf[1] + levelPerfBonus);
    const performance = perfMin + Math.floor(Math.random() * Math.max(1, perfMax - perfMin));

    const cost = cfg.cost[0] + Math.floor(Math.random() * (cfg.cost[1] - cfg.cost[0]));

    return {
      totalCost,
      specs: {
        performance,
        cost,
        description: cfg.desc + (level > 1 ? ` · Mk ${level}` : ''),
        bonusFeatures: cfg.bonus,
      },
    };
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
      exclusive_case: ['Phantom', 'Elite', 'Prestige', 'Infinity', 'Zenith'],
    };

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const name = names[type][Math.floor(Math.random() * names[type].length)];

    return `${prefix} ${name}`;
  }
}
