import { type TestResult } from "./TestReport";
import { TestScoringMatrix } from "@/services/TestScoringMatrix";
import { PriceRecommendationManager } from "@/services/PriceRecommendationManager";

export class EnhancedTestReportGenerator {
  
  static generateTestReport(model: any, year: number): TestResult {
    // Validate top 1988 configuration in regression test
    if (year === 1988) {
      const validationResult = TestScoringMatrix.validateTopConfiguration1988Q2();
      console.log('1988 Q2 Top Config Validation:', validationResult);
    }

    // Use enhanced scoring matrix for accurate component evaluation
    const cpuScores = {
      gaming: TestScoringMatrix.evaluateCPU(model.cpu, 'gaming'),
      business: TestScoringMatrix.evaluateCPU(model.cpu, 'business'),
      workstation: TestScoringMatrix.evaluateCPU(model.cpu, 'workstation')
    };

    const gpuScores = {
      gaming: TestScoringMatrix.evaluateGPU(model.gpu, 'gaming'),
      business: TestScoringMatrix.evaluateGPU(model.gpu, 'business'),
      workstation: TestScoringMatrix.evaluateGPU(model.gpu, 'workstation')
    };

    const ramScores = {
      gaming: TestScoringMatrix.evaluateRAM(model.ram, 'gaming'),
      business: TestScoringMatrix.evaluateRAM(model.ram, 'business'),
      workstation: TestScoringMatrix.evaluateRAM(model.ram, 'workstation')
    };

    const soundScores = {
      gaming: TestScoringMatrix.evaluateSound(model.sound, 'gaming'),
      business: TestScoringMatrix.evaluateSound(model.sound, 'business'),
      workstation: TestScoringMatrix.evaluateSound(model.sound, 'workstation')
    };

    // Calculate category scores
    const gamingScore = TestScoringMatrix.calculateCategoryScore(
      cpuScores.gaming, gpuScores.gaming, ramScores.gaming, soundScores.gaming, 'gaming'
    );

    const businessScore = TestScoringMatrix.calculateCategoryScore(
      cpuScores.business, gpuScores.business, ramScores.business, soundScores.business, 'business'
    );

    const workstationScore = year >= 1987 ? TestScoringMatrix.calculateCategoryScore(
      cpuScores.workstation, gpuScores.workstation, ramScores.workstation, soundScores.workstation, 'workstation'
    ) : 0;

    // Enhanced compatibility and build quality
    const compatibilityResult = TestScoringMatrix.evaluateCompatibility({
      cpu: cpuScores.business,
      gpu: gpuScores.gaming,
      ram: ramScores.business,
      sound: soundScores.gaming
    });

    const buildQualityResult = TestScoringMatrix.evaluateBuildQuality({
      cpu: cpuScores.business,
      gpu: gpuScores.gaming,
      ram: ramScores.business,
      sound: soundScores.gaming
    }, model.case?.quality || 70);

    // Calculate overall score with proper weighting
    const hasWorkstation = year >= 1987;
    const overallScore = hasWorkstation ? Math.round(
      (gamingScore * 0.25 + businessScore * 0.35 + workstationScore * 0.20 + 
       compatibilityResult.score * 0.1 + buildQualityResult.score * 0.1)
    ) : Math.round(
      (gamingScore * 0.35 + businessScore * 0.45 + 
       compatibilityResult.score * 0.1 + buildQualityResult.score * 0.1)
    );

    // Generate detailed comments for each category
    const gamingComments = this.generateGamingComments(cpuScores.gaming, gpuScores.gaming, ramScores.gaming, soundScores.gaming, model);
    const businessComments = this.generateBusinessComments(cpuScores.business, gpuScores.business, ramScores.business, soundScores.business, model);
    const workstationComments = hasWorkstation ? 
      this.generateWorkstationComments(cpuScores.workstation, gpuScores.workstation, ramScores.workstation, soundScores.workstation, model) :
      ['Workstation-Markt existiert noch nicht in den frühen 80er Jahren'];

    // Calculate price values
    const gamingPriceValue = this.calculatePriceValue(model.price, 600 + (year - 1983) * 150);
    const businessPriceValue = this.calculatePriceValue(model.price, 1200 + (year - 1983) * 300);
    const workstationPriceValue = hasWorkstation ? 
      this.calculatePriceValue(model.price, 3000 + (year - 1987) * 1000) : 0;

    // Safe price recommendation management
    const priceRecommendationData = PriceRecommendationManager.generateSafePriceRecommendation(
      model.id || `model_${Date.now()}`,
      model.price,
      gamingPriceValue,
      businessPriceValue,
      workstationPriceValue
    );

    // Market impact calculation
    const marketImpact = this.calculateMarketImpact(overallScore, gamingScore, businessScore, workstationScore, model);

    // Final verdict
    const finalVerdict = this.generateFinalVerdict(overallScore, model, gamingScore, businessScore, workstationScore);

    return {
      overallScore,
      categories: {
        gaming: {
          score: gamingScore,
          rating: this.getScoreRating(gamingScore),
          comments: gamingComments,
          priceValue: gamingPriceValue
        },
        business: {
          score: businessScore,
          rating: this.getScoreRating(businessScore),
          comments: businessComments,
          priceValue: businessPriceValue
        },
        workstation: {
          score: workstationScore,
          rating: hasWorkstation ? this.getScoreRating(workstationScore) : 'Nicht anwendbar',
          comments: workstationComments,
          priceValue: workstationPriceValue
        }
      },
      compatibility: {
        score: compatibilityResult.score,
        rating: this.getScoreRating(compatibilityResult.score),
        bottlenecks: compatibilityResult.bottlenecks,
        synergies: compatibilityResult.synergies
      },
      buildQuality: {
        score: buildQualityResult.score,
        rating: buildQualityResult.rating,
        components: buildQualityResult.components,
        caseMatch: this.evaluateCaseMatch(model)
      },
      marketImpact,
      finalVerdict,
      priceRecommendation: priceRecommendationData.hasRecommendation ? {
        currentPrice: priceRecommendationData.currentPrice,
        recommendedPrice: priceRecommendationData.recommendedPrice,
        reasoning: priceRecommendationData.reasoning
      } : undefined
    };
  }

  private static generateGamingComments(cpu: any, gpu: any, ram: any, sound: any, model: any): string[] {
    const comments: string[] = [];
    
    if (gpu.score >= 90) {
      comments.push("Exzellente Grafikleistung setzt neue Maßstäbe für Gaming-Computer");
    } else if (gpu.score >= 70) {
      comments.push("Sehr gute Grafik-Performance für anspruchsvolle Spiele");
    } else if (gpu.score >= 50) {
      comments.push("Solide Grafikdarstellung für die meisten aktuellen Spiele");
    } else {
      comments.push("Grafik-Leistung limitiert das Gaming-Potenzial erheblich");
    }

    if (sound.score >= 80) {
      comments.push("Hervorragender Sound-Chip bietet beeindruckende Audio-Effekte");
    } else if (sound.score >= 50) {
      comments.push("Gute Sound-Qualität verbessert das Spielerlebnis spürbar");
    } else {
      comments.push("Basic Sound-Ausgabe mindert das Gaming-Erlebnis");
    }

    if (cpu.score >= 80) {
      comments.push("Leistungsstarke CPU ermöglicht flüssige Spiele-Performance");
    } else if (cpu.score < 50) {
      comments.push("CPU-Performance könnte bei anspruchsvollen Spielen limitieren");
    }

    const hasColorMonitor = model.accessories?.includes('RGB Monitor') || 
                           model.accessories?.includes('VGA Monitor');
    if (hasColorMonitor) {
      comments.push("Farbmonitor ermöglicht brillante visuelle Gaming-Erfahrung");
    } else {
      comments.push("Monochrom-Display mindert das visuelle Gaming-Erlebnis");
    }

    return comments;
  }

  private static generateBusinessComments(cpu: any, gpu: any, ram: any, sound: any, model: any): string[] {
    const comments: string[] = [];
    
    if (cpu.score >= 90) {
      comments.push("Exzellente CPU-Leistung für anspruchsvollste Büro-Anwendungen");
    } else if (cpu.score >= 70) {
      comments.push("Sehr gute Performance für professionelle Software und Tabellenkalkulation");
    } else if (cpu.score >= 50) {
      comments.push("Ausreichende Leistung für Standard-Bürotätigkeiten");
    } else {
      comments.push("CPU-Performance ist für professionelle Anwendungen zu schwach");
    }

    if (ram.score >= 85) {
      comments.push("Großzügiger Arbeitsspeicher ermöglicht effizientes Multitasking");
    } else if (ram.score >= 60) {
      comments.push("Ausreichend RAM für die meisten Business-Anwendungen");
    } else {
      comments.push("Wenig Arbeitsspeicher limitiert komplexere Programme");
    }

    const hasStorage = model.accessories?.some((acc: string) => 
      acc.includes('Diskette') || acc.includes('Festplatte')
    );
    if (hasStorage) {
      const hasHDD = model.accessories?.some((acc: string) => acc.includes('Festplatte'));
      if (hasHDD) {
        comments.push("Festplatte bietet schnellen Zugriff auf Programme und Datenspeicherung");
      } else {
        comments.push("Diskettenlaufwerk ermöglicht Datenaustausch und -sicherung");
      }
    } else {
      comments.push("Fehlende Speicherlaufwerke erschweren die praktische Büro-Nutzung");
    }

    if (model.case?.type === 'office' && model.case.quality >= 80) {
      comments.push("Professionelles Design passt perfekt in Büroumgebungen");
    } else if (model.case?.type === 'gamer') {
      comments.push("Gaming-Design wirkt im Bürokontext unprofessionell");
    }

    return comments;
  }

  private static generateWorkstationComments(cpu: any, gpu: any, ram: any, sound: any, model: any): string[] {
    const comments: string[] = [];
    
    if (cpu.score >= 90) {
      comments.push("Spitzen-CPU ermöglicht professionelle CAD- und Engineering-Anwendungen");
    } else if (cpu.score >= 70) {
      comments.push("Sehr gute Performance für anspruchsvolle Workstation-Tasks");
    } else if (cpu.score >= 50) {
      comments.push("Ausreichend für einfachere professionelle Anwendungen");
    } else {
      comments.push("CPU-Leistung reicht nicht für echte Workstation-Nutzung");
    }

    if (ram.score >= 85) {
      comments.push("Großzügiger Arbeitsspeicher für komplexeste Berechnungen und große Datenmengen");
    } else if (ram.score >= 60) {
      comments.push("Ausreichend RAM für mittlere Workstation-Anwendungen");
    } else {
      comments.push("Zu wenig RAM für professionelle Workstation-Nutzung");
    }

    const hasProfStorage = model.accessories?.some((acc: string) => 
      acc.includes('Festplatte') || acc.includes('SCSI')
    );
    if (hasProfStorage) {
      comments.push("Professionelle Speicherlösungen für große Projektdateien");
    } else {
      comments.push("Fehlende Festplatte limitiert Workstation-Funktionalität massiv");
    }

    return comments;
  }

  private static calculatePriceValue(actualPrice: number, expectedPrice: number): number {
    return Math.max(0, Math.min(100, 
      100 - Math.abs(actualPrice - expectedPrice) / expectedPrice * 100
    ));
  }

  private static calculateMarketImpact(overallScore: number, gamingScore: number, businessScore: number, workstationScore: number, model: any): any {
    let reputationChange = 0;
    if (overallScore >= 90) reputationChange = 8;
    else if (overallScore >= 80) reputationChange = 5;
    else if (overallScore >= 70) reputationChange = 2;
    else if (overallScore >= 60) reputationChange = 0;
    else if (overallScore >= 50) reputationChange = -2;
    else reputationChange = -5;

    const salesBoost = (overallScore - 70) * 0.8;

    let competitorResponse = '';
    if (overallScore >= 85) {
      competitorResponse = 'Konkurrenten werden mit verstärkten Entwicklungsanstrengungen reagieren';
    } else if (overallScore >= 70) {
      competitorResponse = 'Moderate Reaktionen der Konkurrenz zu erwarten';
    } else {
      competitorResponse = 'Schwache Bewertung wird Konkurrenten ermutigen';
    }

    let marketPosition = '';
    if (overallScore >= 90) {
      marketPosition = 'Marktführer-Potenzial';
    } else if (overallScore >= 80) {
      marketPosition = 'Starke Marktposition';
    } else if (overallScore >= 70) {
      marketPosition = 'Solide Marktchancen';
    } else if (overallScore >= 60) {
      marketPosition = 'Nischensegment';
    } else {
      marketPosition = 'Schwierige Marktlage';
    }

    return {
      reputationChange,
      expectedSalesBoost: Math.round(salesBoost),
      competitorResponse,
      marketPosition
    };
  }

  private static generateFinalVerdict(overallScore: number, model: any, gamingScore: number, businessScore: number, workstationScore: number): string {
    const bestScore = Math.max(gamingScore, businessScore, workstationScore);
    let verdict = '';
    
    if (overallScore >= 90) {
      verdict = `Der ${model.name} ist ein außergewöhnlicher Computer, der in allen Kategorien überzeugende Leistung bietet. `;
    } else if (overallScore >= 80) {
      verdict = `Der ${model.name} liefert sehr gute Gesamtleistung und stellt eine empfehlenswerte Wahl dar. `;
    } else if (overallScore >= 70) {
      verdict = `Der ${model.name} ist ein solider Computer mit ausgewogenen Eigenschaften für die jeweiligen Einsatzgebiete. `;
    } else if (overallScore >= 60) {
      verdict = `Der ${model.name} erfüllt die Grundanforderungen, zeigt aber in einigen Bereichen Verbesserungspotential. `;
    } else {
      verdict = `Der ${model.name} weist deutliche Schwächen auf und ist nur für spezielle Anwendungen geeignet. `;
    }
    
    // Specialization notes
    if (bestScore === gamingScore && gamingScore >= 75) {
      verdict += 'Gaming-Enthusiasten werden von der starken Spiele-Performance begeistert sein.';
    } else if (bestScore === businessScore && businessScore >= 75) {
      verdict += 'Für professionelle Büro-Anwendungen ist dieser Computer eine ausgezeichnete Investition.';
    } else if (bestScore === workstationScore && workstationScore >= 75) {
      verdict += 'Als High-End Workstation für anspruchsvollste Anwendungen uneingeschränkt empfehlenswert.';
    } else if (Math.abs(gamingScore - businessScore) < 10) {
      verdict += 'Die ausgewogene Leistung macht ihn zum idealen Allrounder für verschiedenste Einsätze.';
    }
    
    return verdict;
  }

  private static getScoreRating(score: number): string {
    if (score >= 95) return 'Exzellent';
    if (score >= 90) return 'Hervorragend';
    if (score >= 80) return 'Sehr gut';
    if (score >= 70) return 'Gut';
    if (score >= 60) return 'Befriedigend';
    if (score >= 50) return 'Ausreichend';
    if (score >= 40) return 'Schwach';
    return 'Mangelhaft';
  }

  private static evaluateCaseMatch(model: any): boolean {
    if (!model.case) return true;
    
    const cpuTier = this.getCPUTier(model.cpu);
    const gpuTier = this.getGPUTier(model.gpu);
    
    if (model.case.type === 'gamer') {
      return gpuTier >= 3 || model.sound !== 'PC Speaker';
    } else if (model.case.type === 'office') {
      return cpuTier >= 3 || model.accessories?.some((acc: string) => 
        acc.includes('Diskette') || acc.includes('Festplatte')
      );
    }
    
    return true;
  }

  private static getCPUTier(cpu: string): number {
    const tiers = {
      'MOS 6502': 1, 'Zilog Z80': 2, 'Intel 8086': 3,
      'Motorola 68000': 4, 'Intel 80286': 5, 'Intel 80386': 6, 'Intel 80486': 7
    };
    return tiers[cpu as keyof typeof tiers] || 1;
  }

  private static getGPUTier(gpu: string): number {
    const tiers = {
      'MOS VIC': 1, 'TI TMS9918': 2, 'Atari GTIA': 3,
      'Commodore VIC-II': 4, 'VGA Graphics': 5, 'Super VGA': 6
    };
    return tiers[gpu as keyof typeof tiers] || 1;
  }
}