/**
 * Test Scoring Matrix with era-relative scoring.
 *
 * The raw component table is anchored to late-80s hardware (Intel 80486 ≈ 95).
 * Without correction, a 1983 machine with the BEST available components would
 * still look "mangelhaft" because nothing from 1983 reaches the late-80s tier.
 *
 * Era adjustment: before scoring, set the era context. Each component's tier
 * is then compared against the highest tier available in that era. A component
 * at the era's top tier receives a substantial bonus (so a top-of-1983 build
 * scores ~80–90), while outdated components in a later era receive no bonus.
 */

export interface ComponentScore {
  score: number;
  tier: number;
  qualityRating: string;
}

type ComponentType = 'cpu' | 'gpu' | 'ram' | 'sound';

interface ComponentEntry {
  gaming: number;
  business: number;
  workstation: number;
  tier: number;
  /** Release year — used to compute the era's max available tier */
  year: number;
  quarter: number;
}

const CPU_DATA: Record<string, ComponentEntry> = {
  'MOS 6502':       { gaming: 25, business: 15, workstation: 5,  tier: 1, year: 1983, quarter: 1 },
  'Zilog Z80':      { gaming: 35, business: 25, workstation: 10, tier: 2, year: 1983, quarter: 1 },
  'Intel 8086':     { gaming: 45, business: 75, workstation: 40, tier: 3, year: 1984, quarter: 1 },
  'Motorola 68000': { gaming: 75, business: 85, workstation: 75, tier: 4, year: 1984, quarter: 2 },
  'Intel 80286':    { gaming: 65, business: 90, workstation: 85, tier: 5, year: 1985, quarter: 1 },
  'Intel 80386':    { gaming: 80, business: 95, workstation: 90, tier: 6, year: 1986, quarter: 1 },
  'Intel 80486':    { gaming: 90, business: 98, workstation: 95, tier: 7, year: 1988, quarter: 1 },
};

const GPU_DATA: Record<string, ComponentEntry> = {
  'MOS VIC':           { gaming: 15, business: 10, workstation: 5,  tier: 1, year: 1983, quarter: 1 },
  'TI TMS9918':        { gaming: 45, business: 30, workstation: 25, tier: 2, year: 1983, quarter: 2 },
  'Atari GTIA':        { gaming: 65, business: 40, workstation: 35, tier: 3, year: 1984, quarter: 1 },
  'Commodore VIC-II':  { gaming: 80, business: 50, workstation: 45, tier: 4, year: 1984, quarter: 3 },
  'EGA Graphics':      { gaming: 85, business: 75, workstation: 80, tier: 5, year: 1985, quarter: 4 },
  'VGA Graphics':      { gaming: 95, business: 85, workstation: 90, tier: 6, year: 1986, quarter: 2 },
  'Super VGA':         { gaming: 98, business: 90, workstation: 95, tier: 7, year: 1987, quarter: 2 },
};

const RAM_DATA: Record<string, ComponentEntry> = {
  '4KB RAM':   { gaming: 10, business: 5,   workstation: 0,  tier: 1, year: 1983, quarter: 1 },
  '16KB RAM':  { gaming: 25, business: 15,  workstation: 5,  tier: 2, year: 1983, quarter: 1 },
  '64KB RAM':  { gaming: 50, business: 45,  workstation: 25, tier: 3, year: 1984, quarter: 1 },
  '256KB RAM': { gaming: 75, business: 80,  workstation: 60, tier: 4, year: 1985, quarter: 1 },
  '512KB RAM': { gaming: 85, business: 90,  workstation: 80, tier: 5, year: 1986, quarter: 1 },
  '1MB RAM':   { gaming: 90, business: 95,  workstation: 90, tier: 6, year: 1987, quarter: 1 },
  '2MB RAM':   { gaming: 95, business: 98,  workstation: 95, tier: 7, year: 1988, quarter: 1 },
  '4MB RAM':   { gaming: 98, business: 100, workstation: 98, tier: 8, year: 1990, quarter: 1 },
};

const SOUND_DATA: Record<string, ComponentEntry> = {
  'PC Speaker':        { gaming: 5,  business: 20, workstation: 15, tier: 1, year: 1983, quarter: 1 },
  'AY-3-8910':         { gaming: 60, business: 30, workstation: 25, tier: 2, year: 1983, quarter: 4 },
  'SID 6581':          { gaming: 95, business: 40, workstation: 35, tier: 3, year: 1984, quarter: 3 },
  'Yamaha YM2149':     { gaming: 80, business: 45, workstation: 40, tier: 4, year: 1985, quarter: 3 },
  'AdLib Sound':       { gaming: 90, business: 50, workstation: 45, tier: 5, year: 1986, quarter: 2 },
  'Sound Blaster':     { gaming: 95, business: 55, workstation: 50, tier: 6, year: 1987, quarter: 1 },
  'Sound Blaster Pro': { gaming: 97, business: 60, workstation: 55, tier: 7, year: 1989, quarter: 3 },
};

const TABLES: Record<ComponentType, Record<string, ComponentEntry>> = {
  cpu: CPU_DATA,
  gpu: GPU_DATA,
  ram: RAM_DATA,
  sound: SOUND_DATA,
};

interface EraContext {
  year: number;
  quarter: number;
  maxTier: Record<ComponentType, number>;
}

function isAvailable(entry: ComponentEntry, year: number, quarter: number): boolean {
  if (entry.year < year) return true;
  if (entry.year === year && entry.quarter <= quarter) return true;
  return false;
}

function computeMaxTiers(year: number, quarter: number): Record<ComponentType, number> {
  const result = { cpu: 1, gpu: 1, ram: 1, sound: 1 } as Record<ComponentType, number>;
  (Object.keys(TABLES) as ComponentType[]).forEach((type) => {
    let max = 1;
    for (const entry of Object.values(TABLES[type])) {
      if (isAvailable(entry, year, quarter) && entry.tier > max) max = entry.tier;
    }
    result[type] = max;
  });
  return result;
}

export class TestScoringMatrix {
  /** Module-level era context. Defaults to the late-80s anchor when unset. */
  private static eraContext: EraContext | null = null;

  /**
   * Set the era context before scoring. Subsequent evaluateCPU/GPU/RAM/Sound
   * calls will apply era-relative adjustments so the best hardware available
   * in that era scores ~80–90 instead of being judged against later generations.
   */
  static setEraContext(year: number, quarter: number): void {
    this.eraContext = { year, quarter, maxTier: computeMaxTiers(year, quarter) };
  }

  static clearEraContext(): void {
    this.eraContext = null;
  }

  /**
   * Era-relative adjustment.
   * - Component at era's top tier (relative=1): score boosted toward ~95.
   * - Component below half of the era's max: no boost (judged on its merits).
   * - Components from the historical anchor era (late 80s) are essentially
   *   unaffected because their absolute scores are already at the top.
   */
  private static applyEraAdjustment(
    absoluteScore: number,
    componentTier: number,
    type: ComponentType,
  ): number {
    const ctx = this.eraContext;
    if (!ctx) return absoluteScore;
    const maxTier = ctx.maxTier[type];
    if (!maxTier || maxTier <= 0) return absoluteScore;

    const relative = componentTier / maxTier; // 1.0 = best available
    const factor = Math.max(0, (relative - 0.5) * 2); // 0 below half, 1 at top
    const headroom = Math.max(0, 95 - absoluteScore);
    const boost = headroom * 0.8 * factor;
    const adjusted = Math.round(absoluteScore + boost);
    return Math.min(98, Math.max(0, adjusted));
  }

  private static buildScore(
    entry: ComponentEntry | undefined,
    fallback: { gaming: number; business: number; workstation: number; tier: number },
    category: 'gaming' | 'business' | 'workstation',
    type: ComponentType,
  ): ComponentScore {
    const data = entry ?? fallback;
    const raw = data[category];
    const adjusted = this.applyEraAdjustment(raw, data.tier, type);
    return {
      score: adjusted,
      tier: data.tier,
      qualityRating: this.getQualityRating(adjusted),
    };
  }

  static evaluateCPU(cpu: string, category: 'gaming' | 'business' | 'workstation'): ComponentScore {
    return this.buildScore(
      CPU_DATA[cpu],
      { gaming: 30, business: 30, workstation: 30, tier: 1 },
      category,
      'cpu',
    );
  }

  static evaluateGPU(gpu: string, category: 'gaming' | 'business' | 'workstation'): ComponentScore {
    return this.buildScore(
      GPU_DATA[gpu],
      { gaming: 20, business: 15, workstation: 15, tier: 1 },
      category,
      'gpu',
    );
  }

  static evaluateRAM(ram: string, category: 'gaming' | 'business' | 'workstation'): ComponentScore {
    return this.buildScore(
      RAM_DATA[ram],
      { gaming: 15, business: 10, workstation: 5, tier: 1 },
      category,
      'ram',
    );
  }

  static evaluateSound(sound: string, category: 'gaming' | 'business' | 'workstation'): ComponentScore {
    return this.buildScore(
      SOUND_DATA[sound],
      { gaming: 10, business: 15, workstation: 10, tier: 1 },
      category,
      'sound',
    );
  }

  /** Returns the maximum component tier available at the given time. */
  static getMaxAvailableTiers(year: number, quarter: number): Record<ComponentType, number> {
    return computeMaxTiers(year, quarter);
  }

  /**
   * Calculate weighted overall score for a category
   */
  static calculateCategoryScore(
    cpu: ComponentScore,
    gpu: ComponentScore,
    ram: ComponentScore,
    sound: ComponentScore,
    category: 'gaming' | 'business' | 'workstation',
  ): number {
    const weights = {
      gaming:      { cpu: 0.25, gpu: 0.40, ram: 0.20, sound: 0.15 },
      business:    { cpu: 0.50, gpu: 0.10, ram: 0.30, sound: 0.10 },
      workstation: { cpu: 0.60, gpu: 0.15, ram: 0.20, sound: 0.05 },
    };
    const w = weights[category];
    return Math.round(cpu.score * w.cpu + gpu.score * w.gpu + ram.score * w.ram + sound.score * w.sound);
  }

  static evaluateCompatibility(components: {
    cpu: ComponentScore;
    gpu: ComponentScore;
    ram: ComponentScore;
    sound: ComponentScore;
  }): { score: number; synergies: string[]; bottlenecks: string[] } {
    let score = 80;
    const synergies: string[] = [];
    const bottlenecks: string[] = [];
    const { cpu, gpu, ram, sound } = components;

    // Era-relative: "high-end" means at or near the era's max tier.
    const ctx = this.eraContext;
    const maxTier = ctx?.maxTier ?? { cpu: 7, gpu: 7, ram: 8, sound: 7 };
    const isTopOfEra = (c: ComponentScore, t: ComponentType) => c.tier >= maxTier[t] - 1;

    if (isTopOfEra(cpu, 'cpu') && isTopOfEra(gpu, 'gpu') && isTopOfEra(ram, 'ram')) {
      synergies.push('Exzellente High-End Kombination — alle Komponenten auf Spitzenniveau der Ära');
      score += 15;
    }
    if (Math.abs(cpu.tier - ram.tier) <= 1) {
      synergies.push('Perfekte CPU-RAM Balance ermöglicht optimale Leistungsausnutzung');
      score += 8;
    } else if (cpu.tier > ram.tier + 2) {
      bottlenecks.push('Zu wenig RAM limitiert die leistungsstarke CPU erheblich');
      score -= 15;
    } else if (ram.tier > cpu.tier + 2) {
      bottlenecks.push('Überdimensionierter RAM wird durch schwache CPU nicht genutzt');
      score -= 8;
    }
    if (isTopOfEra(cpu, 'cpu') && isTopOfEra(gpu, 'gpu')) {
      synergies.push('Kraftvolle CPU-GPU Kombination für anspruchsvollste Anwendungen der Ära');
      score += 10;
    } else if (Math.abs(cpu.tier - gpu.tier) > 3) {
      bottlenecks.push('Starkes Ungleichgewicht zwischen Prozessor und Grafik');
      score -= 12;
    }
    if (sound.tier >= 3 && isTopOfEra(gpu, 'gpu')) {
      synergies.push('Hochwertige Audio-Video Kombination für perfektes Multimedia-Erlebnis');
      score += 5;
    }

    score = Math.max(20, Math.min(100, score));
    return { score: Math.round(score), synergies, bottlenecks };
  }

  static evaluateBuildQuality(
    components: { cpu: ComponentScore; gpu: ComponentScore; ram: ComponentScore; sound: ComponentScore },
    caseQuality: number = 70,
  ): { score: number; rating: string; components: string[] } {
    const componentDetails: string[] = [];
    let totalScore = 0;
    const weights = { cpu: 0.35, gpu: 0.25, ram: 0.25, sound: 0.15 };
    totalScore += components.cpu.score * weights.cpu;
    totalScore += components.gpu.score * weights.gpu;
    totalScore += components.ram.score * weights.ram;
    totalScore += components.sound.score * weights.sound;
    const scaledCaseQuality = (caseQuality / 100) * 85;
    totalScore = totalScore * 0.85 + scaledCaseQuality * 0.15;

    componentDetails.push(`CPU: ${components.cpu.qualityRating} — Prozessor`);
    componentDetails.push(`GPU: ${components.gpu.qualityRating} — Grafikleistung`);
    componentDetails.push(`RAM: ${components.ram.qualityRating} — Speicher`);
    componentDetails.push(`Sound: ${components.sound.qualityRating} — Audio`);
    componentDetails.push(
      `Gehäuse: ${this.getQualityRating(caseQuality)} — ${caseQuality >= 80 ? 'Premium' : caseQuality >= 60 ? 'Solide' : 'Basic'} Verarbeitung`,
    );

    return { score: Math.round(totalScore), rating: this.getQualityRating(totalScore), components: componentDetails };
  }

  static getQualityRating(score: number): string {
    if (score >= 95) return 'Exzellent';
    if (score >= 90) return 'Hervorragend';
    if (score >= 80) return 'Sehr gut';
    if (score >= 70) return 'Gut';
    if (score >= 60) return 'Befriedigend';
    if (score >= 50) return 'Ausreichend';
    if (score >= 40) return 'Schwach';
    return 'Mangelhaft';
  }

  /**
   * Regression: a top-of-Q2/1988 build must still score well.
   */
  static validateTopConfiguration1988Q2(): { passed: boolean; details: string } {
    const prev = this.eraContext;
    this.setEraContext(1988, 2);
    const topConfig = {
      cpu: this.evaluateCPU('Intel 80486', 'business'),
      gpu: this.evaluateGPU('VGA Graphics', 'business'),
      ram: this.evaluateRAM('2MB RAM', 'business'),
      sound: this.evaluateSound('Yamaha YM2149', 'business'),
    };
    const businessScore = this.calculateCategoryScore(topConfig.cpu, topConfig.gpu, topConfig.ram, topConfig.sound, 'business');
    const gamingScore = this.calculateCategoryScore(topConfig.cpu, topConfig.gpu, topConfig.ram, topConfig.sound, 'gaming');
    const compatibility = this.evaluateCompatibility(topConfig);
    const buildQuality = this.evaluateBuildQuality(topConfig, 95);
    const overallScore = Math.round(
      businessScore * 0.4 + gamingScore * 0.3 + compatibility.score * 0.15 + buildQuality.score * 0.15,
    );
    const passed = businessScore >= 70 && gamingScore >= 70 && overallScore >= 75;
    this.eraContext = prev;
    return {
      passed,
      details: `Business: ${businessScore}, Gaming: ${gamingScore}, Overall: ${overallScore}, Rating: ${this.getQualityRating(overallScore)}`,
    };
  }
}
