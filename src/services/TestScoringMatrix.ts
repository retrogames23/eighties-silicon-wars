/**
 * Enhanced Test Scoring Matrix with corrected scoring for high-end 1988 configurations
 */

export interface ComponentScore {
  score: number;
  tier: number;
  qualityRating: string;
}

export class TestScoringMatrix {
  
  /**
   * CPU scoring with corrected 1988 values
   * A top 1988 system with Intel 80486 should score excellently
   */
  static evaluateCPU(cpu: string, category: 'gaming' | 'business' | 'workstation'): ComponentScore {
    const cpuData: Record<string, { gaming: number; business: number; workstation: number; tier: number }> = {
      'MOS 6502': { gaming: 25, business: 15, workstation: 5, tier: 1 },
      'Zilog Z80': { gaming: 35, business: 25, workstation: 10, tier: 2 },
      'Intel 8086': { gaming: 45, business: 75, workstation: 40, tier: 3 },
      'Motorola 68000': { gaming: 75, business: 85, workstation: 75, tier: 4 },
      'Intel 80286': { gaming: 65, business: 90, workstation: 85, tier: 5 },
      'Intel 80386': { gaming: 80, business: 95, workstation: 90, tier: 6 },
      'Intel 80486': { gaming: 90, business: 98, workstation: 95, tier: 7 } // High-end 1988
    };

    const data = cpuData[cpu] || { gaming: 30, business: 30, workstation: 30, tier: 1 };
    const score = data[category];
    
    return {
      score,
      tier: data.tier,
      qualityRating: this.getQualityRating(score)
    };
  }

  /**
   * GPU scoring with enhanced values for VGA and later graphics
   */
  static evaluateGPU(gpu: string, category: 'gaming' | 'business' | 'workstation'): ComponentScore {
    const gpuData: Record<string, { gaming: number; business: number; workstation: number; tier: number }> = {
      'MOS VIC': { gaming: 15, business: 10, workstation: 5, tier: 1 },
      'TI TMS9918': { gaming: 45, business: 30, workstation: 25, tier: 2 },
      'Atari GTIA': { gaming: 65, business: 40, workstation: 35, tier: 3 },
      'Commodore VIC-II': { gaming: 80, business: 50, workstation: 45, tier: 4 },
      'VGA Graphics': { gaming: 95, business: 85, workstation: 90, tier: 5 }, // High-end 1988
      'Super VGA': { gaming: 98, business: 90, workstation: 95, tier: 6 }
    };

    const data = gpuData[gpu] || { gaming: 20, business: 15, workstation: 15, tier: 1 };
    const score = data[category];
    
    return {
      score,
      tier: data.tier,
      qualityRating: this.getQualityRating(score)
    };
  }

  /**
   * RAM scoring with proper high-end valuations
   */
  static evaluateRAM(ram: string, category: 'gaming' | 'business' | 'workstation'): ComponentScore {
    const ramData: Record<string, { gaming: number; business: number; workstation: number; tier: number }> = {
      '4KB RAM': { gaming: 10, business: 5, workstation: 0, tier: 1 },
      '16KB RAM': { gaming: 25, business: 15, workstation: 5, tier: 2 },
      '64KB RAM': { gaming: 50, business: 45, workstation: 25, tier: 3 },
      '256KB RAM': { gaming: 75, business: 80, workstation: 60, tier: 4 },
      '512KB RAM': { gaming: 85, business: 90, workstation: 80, tier: 5 },
      '1MB RAM': { gaming: 90, business: 95, workstation: 90, tier: 6 },
      '2MB RAM': { gaming: 95, business: 98, workstation: 95, tier: 7 }, // High-end 1988
      '4MB RAM': { gaming: 98, business: 100, workstation: 98, tier: 8 }
    };

    const data = ramData[ram] || { gaming: 15, business: 10, workstation: 5, tier: 1 };
    const score = data[category];
    
    return {
      score,
      tier: data.tier,
      qualityRating: this.getQualityRating(score)
    };
  }

  /**
   * Sound scoring with enhanced values for premium chips
   */
  static evaluateSound(sound: string, category: 'gaming' | 'business' | 'workstation'): ComponentScore {
    const soundData: Record<string, { gaming: number; business: number; workstation: number; tier: number }> = {
      'PC Speaker': { gaming: 5, business: 20, workstation: 15, tier: 1 },
      'AY-3-8910': { gaming: 60, business: 30, workstation: 25, tier: 2 },
      'SID 6581': { gaming: 95, business: 40, workstation: 35, tier: 3 },
      'Yamaha YM2149': { gaming: 80, business: 45, workstation: 40, tier: 4 },
      'AdLib Sound': { gaming: 90, business: 50, workstation: 45, tier: 5 }, // 1988 era
      'Sound Blaster': { gaming: 95, business: 55, workstation: 50, tier: 6 }
    };

    const data = soundData[sound] || { gaming: 10, business: 15, workstation: 10, tier: 1 };
    const score = data[category];
    
    return {
      score,
      tier: data.tier,
      qualityRating: this.getQualityRating(score)
    };
  }

  /**
   * Calculate weighted overall score for a category
   */
  static calculateCategoryScore(
    cpu: ComponentScore,
    gpu: ComponentScore,
    ram: ComponentScore,
    sound: ComponentScore,
    category: 'gaming' | 'business' | 'workstation'
  ): number {
    const weights = {
      gaming: { cpu: 0.25, gpu: 0.40, ram: 0.20, sound: 0.15 },
      business: { cpu: 0.50, gpu: 0.10, ram: 0.30, sound: 0.10 },
      workstation: { cpu: 0.60, gpu: 0.15, ram: 0.20, sound: 0.05 }
    };

    const weight = weights[category];
    
    return Math.round(
      cpu.score * weight.cpu +
      gpu.score * weight.gpu +
      ram.score * weight.ram +
      sound.score * weight.sound
    );
  }

  /**
   * Enhanced compatibility evaluation considering component tiers
   */
  static evaluateCompatibility(components: {
    cpu: ComponentScore;
    gpu: ComponentScore;
    ram: ComponentScore;
    sound: ComponentScore;
  }): { score: number; synergies: string[]; bottlenecks: string[] } {
    let score = 80; // Base compatibility score
    const synergies: string[] = [];
    const bottlenecks: string[] = [];

    const { cpu, gpu, ram, sound } = components;

    // High-end synergies (for 1988 top configs)
    if (cpu.tier >= 6 && gpu.tier >= 4 && ram.tier >= 6) {
      synergies.push("Exzellente High-End Kombination - alle Komponenten auf Spitzenniveau");
      score += 15;
    }

    // CPU-RAM balance
    if (Math.abs(cpu.tier - ram.tier) <= 1) {
      synergies.push("Perfekte CPU-RAM Balance ermöglicht optimale Leistungsausnutzung");
      score += 8;
    } else if (cpu.tier > ram.tier + 2) {
      bottlenecks.push("Zu wenig RAM limitiert die leistungsstarke CPU erheblich");
      score -= 15;
    } else if (ram.tier > cpu.tier + 2) {
      bottlenecks.push("Überdimensionierter RAM wird durch schwache CPU nicht genutzt");
      score -= 8;
    }

    // CPU-GPU Gaming synergy
    if (cpu.tier >= 4 && gpu.tier >= 4) {
      synergies.push("Kraftvolle CPU-GPU Kombination für anspruchsvollste Anwendungen");
      score += 10;
    } else if (Math.abs(cpu.tier - gpu.tier) > 3) {
      bottlenecks.push("Starkes Ungleichgewicht zwischen Prozessor und Grafik");
      score -= 12;
    }

    // Premium sound synergy
    if (sound.tier >= 3 && gpu.tier >= 4) {
      synergies.push("Hochwertige Audio-Video Kombination für perfektes Multimedia-Erlebnis");
      score += 5;
    }

    // Ensure reasonable bounds
    score = Math.max(20, Math.min(100, score));

    return {
      score: Math.round(score),
      synergies,
      bottlenecks
    };
  }

  /**
   * Build quality assessment with enhanced valuations
   */
  static evaluateBuildQuality(components: {
    cpu: ComponentScore;
    gpu: ComponentScore;
    ram: ComponentScore;
    sound: ComponentScore;
  }, caseQuality: number = 70): { score: number; rating: string; components: string[] } {
    const componentDetails: string[] = [];
    let totalScore = 0;

    // Weight components by importance
    const weights = { cpu: 0.35, gpu: 0.25, ram: 0.25, sound: 0.15 };
    
    totalScore += components.cpu.score * weights.cpu;
    totalScore += components.gpu.score * weights.gpu;
    totalScore += components.ram.score * weights.ram;
    totalScore += components.sound.score * weights.sound;

    // Add case quality (scaled to component range)
    const scaledCaseQuality = (caseQuality / 100) * 85; // Max 85 points for case
    totalScore = (totalScore * 0.85) + (scaledCaseQuality * 0.15);

    componentDetails.push(`CPU: ${components.cpu.qualityRating} - Premium-Klasse Prozessor`);
    componentDetails.push(`GPU: ${components.gpu.qualityRating} - Hochwertige Grafikleistung`);
    componentDetails.push(`RAM: ${components.ram.qualityRating} - Professionelle Speicher-Module`);
    componentDetails.push(`Sound: ${components.sound.qualityRating} - Audio-Komponente`);
    componentDetails.push(`Gehäuse: ${this.getQualityRating(caseQuality)} - ${caseQuality >= 80 ? 'Premium' : caseQuality >= 60 ? 'Solide' : 'Basic'} Verarbeitung`);

    return {
      score: Math.round(totalScore),
      rating: this.getQualityRating(totalScore),
      components: componentDetails
    };
  }

  /**
   * Enhanced quality rating with more granular ratings
   */
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
   * Regression test: Verify Q2/1988 top configuration scores well
   */
  static validateTopConfiguration1988Q2(): { passed: boolean; details: string } {
    // Top configuration for Q2/1988
    const topConfig = {
      cpu: this.evaluateCPU('Intel 80486', 'business'),
      gpu: this.evaluateGPU('VGA Graphics', 'business'),
      ram: this.evaluateRAM('2MB RAM', 'business'),
      sound: this.evaluateSound('Yamaha YM2149', 'business')
    };

    const businessScore = this.calculateCategoryScore(
      topConfig.cpu, topConfig.gpu, topConfig.ram, topConfig.sound, 'business'
    );

    const gamingScore = this.calculateCategoryScore(
      topConfig.cpu, topConfig.gpu, topConfig.ram, topConfig.sound, 'gaming'
    );

    const compatibility = this.evaluateCompatibility(topConfig);
    const buildQuality = this.evaluateBuildQuality(topConfig, 95);

    const overallScore = Math.round(
      (businessScore * 0.4) + (gamingScore * 0.3) + (compatibility.score * 0.15) + (buildQuality.score * 0.15)
    );

    const passed = businessScore >= 70 && gamingScore >= 70 && overallScore >= 75;
    
    return {
      passed,
      details: `Business: ${businessScore}, Gaming: ${gamingScore}, Overall: ${overallScore}, Rating: ${this.getQualityRating(overallScore)}`
    };
  }
}