import { type TestResult } from "./TestReport";
import { TestScoringMatrix } from "@/services/TestScoringMatrix";
import { PriceRecommendationManager } from "@/services/PriceRecommendationManager";

export class TestReportGenerator {
  static generateTestReport(model: any, year: number): TestResult {
    // Use enhanced scoring matrix for more accurate results
    const cpuScore = TestScoringMatrix.evaluateCPU(model.cpu, 'business');
    const gpuScore = TestScoringMatrix.evaluateGPU(model.gpu, 'gaming');
    const ramScore = TestScoringMatrix.evaluateRAM(model.ram, 'business');
    const soundScore = TestScoringMatrix.evaluateSound(model.sound, 'gaming');

    // Calculate category scores using new matrix
    const gamingResult = this.evaluateGamingEnhanced(model, year, cpuScore, gpuScore, ramScore, soundScore);
    const businessResult = this.evaluateBusiness(model, year);
    const workstationResult = this.evaluateWorkstation(model, year);
    
    // Enhanced compatibility evaluation
    const compatibilityResult = TestScoringMatrix.evaluateCompatibility({
      cpu: cpuScore, gpu: gpuScore, ram: ramScore, sound: soundScore
    });
    
    // Enhanced build quality
    const buildQualityResult = TestScoringMatrix.evaluateBuildQuality({
      cpu: cpuScore, gpu: gpuScore, ram: ramScore, sound: soundScore
    }, model.case?.quality || 70);
    
    // Calculate weighted overall score
    const overallScore = Math.round(
      (gamingResult.score * 0.3 + 
       businessResult.score * 0.35 + 
       workstationResult.score * 0.15 + 
       compatibilityResult.score * 0.1 + 
       buildQualityResult.score * 0.1)
    );
    
    // Market impact calculation
    const marketImpact = this.calculateMarketImpact(
      overallScore, 
      gamingResult.score, 
      businessResult.score, 
      workstationResult.score,
      model
    );
    
    // Safe price recommendation that doesn't auto-apply
    const priceRecommendationData = PriceRecommendationManager.generateSafePriceRecommendation(
      model.id || 'unknown',
      model.price, 
      gamingResult.priceValue, 
      businessResult.priceValue, 
      workstationResult.priceValue
    );
    
    const priceRecommendation = priceRecommendationData.hasRecommendation ? {
      currentPrice: priceRecommendationData.currentPrice,
      recommendedPrice: priceRecommendationData.recommendedPrice,
      reasoning: priceRecommendationData.reasoning
    } : undefined;
    
    // Final verdict
    const finalVerdict = this.generateFinalVerdict(
      overallScore, 
      model,
      gamingResult,
      businessResult,
      workstationResult
    );
    
    return {
      overallScore,
      categories: {
        gaming: gamingResult,
        business: businessResult,
        workstation: workstationResult
      },
      compatibility: {
        score: compatibilityResult.score,
        rating: TestScoringMatrix.getQualityRating(compatibilityResult.score),
        bottlenecks: compatibilityResult.bottlenecks,
        synergies: compatibilityResult.synergies
      },
      buildQuality: {
        score: buildQualityResult.score,
        rating: buildQualityResult.rating,
        components: buildQualityResult.components,
        caseMatch: model.case?.type ? this.evaluateCaseMatch(model) : true
      },
      marketImpact,
      finalVerdict,
      priceRecommendation
    };
  }
  
  private static evaluateGamingEnhanced(model: any, year: number, cpuScore: any, gpuScore: any, ramScore: any, soundScore: any): {
    score: number;
    rating: string;
    comments: string[];
    priceValue: number;
  } {
    // Use enhanced scoring matrix
    const score = TestScoringMatrix.calculateCategoryScore(cpuScore, gpuScore, ramScore, soundScore, 'gaming');
    const comments: string[] = [];
    
    // Enhanced comments based on component scores
    if (gpuScore.score >= 90) {
      comments.push("Exzellente Grafikleistung ermöglicht beste Gaming-Erfahrung der 80er Jahre");
    } else if (gpuScore.score >= 70) {
      comments.push("Sehr gute Grafikdarstellung für anspruchsvolle Spiele geeignet");
    } else if (gpuScore.score >= 50) {
      comments.push("Solide Grafik für die meisten aktuellen Spiele ausreichend");
    } else {
      comments.push("Grafikleistung limitiert das Gaming-Erlebnis erheblich");
    }

    if (soundScore.score >= 80) {
      comments.push("Hervorragender Sound-Chip sorgt für beeindruckende Audio-Effekte");
    } else if (soundScore.score >= 50) {
      comments.push("Gute Sound-Qualität verbessert das Spielerlebnis spürbar");
    } else {
      comments.push("Basic Sound-Ausgabe mindert das Gaming-Erlebnis");
    }

    if (cpuScore.score >= 80) {
      comments.push("Leistungsstarke CPU sorgt für flüssige Spiele-Performance");
    } else if (cpuScore.score < 50) {
      comments.push("CPU-Leistung könnte bei anspruchsvollen Spielen limitieren");
    }

    // Enhanced price-value calculation
    const expectedGamerPrice = 600 + (year - 1983) * 150;
    const priceValue = Math.max(0, Math.min(100, 
      100 - Math.abs(model.price - expectedGamerPrice) / expectedGamerPrice * 100
    ));
    
    return {
      score,
      rating: this.getScoreRating(score),
      comments,
      priceValue: Math.round(priceValue)
    };
  }

  private static evaluateGaming(model: any, year: number): {
    score: number;
    rating: string;
    comments: string[];
    priceValue: number;
  } {
    let score = 0;
    const comments: string[] = [];
    
    // Grafik-Bewertung (40% für Gaming)
    const gpuScores = {
      'MOS VIC': 15, 'TI TMS9918': 40, 'Atari GTIA': 65, 
      'Commodore VIC-II': 85, 'VGA Graphics': 95
    };
    const gpuScore = gpuScores[model.gpu as keyof typeof gpuScores] || 20;
    score += gpuScore * 0.4;
    
    if (gpuScore >= 80) {
      comments.push("Exzellente Grafikleistung für Spiele der 80er Jahre");
    } else if (gpuScore >= 60) {
      comments.push("Solide Grafikdarstellung, geeignet für die meisten Spiele");
    } else if (gpuScore >= 40) {
      comments.push("Ausreichende Grafik für einfachere Spiele");
    } else {
      comments.push("Grafik ist für moderne Spiele eher limitiert");
    }
    
    // Sound-Bewertung (25% für Gaming)
    const soundScores = {
      'PC Speaker': 5, 'AY-3-8910': 55, 'SID 6581': 95, 'Yamaha YM2149': 70
    };
    const soundScore = soundScores[model.sound as keyof typeof soundScores] || 10;
    score += soundScore * 0.25;
    
    if (soundScore >= 80) {
      comments.push("Hervorragender Sound-Chip mit beeindruckenden Audio-Effekten");
    } else if (soundScore >= 50) {
      comments.push("Gute Sound-Qualität verbessert das Spielerlebnis deutlich");
    } else {
      comments.push("Sound-Ausgabe ist sehr basic und limitiert");
    }
    
    // CPU für Gaming (20%)
    const cpuGamingScores = {
      'MOS 6502': 35, 'Zilog Z80': 45, 'Intel 8086': 25, 
      'Motorola 68000': 85, 'Intel 80286': 40, 'Intel 80386': 50
    };
    const cpuScore = cpuGamingScores[model.cpu as keyof typeof cpuGamingScores] || 30;
    score += cpuScore * 0.2;
    
    // Farbmonitor (10%)
    const hasColorMonitor = model.accessories?.includes('RGB Monitor');
    const colorScore = hasColorMonitor ? 90 : 25;
    score += colorScore * 0.1;
    
    if (hasColorMonitor) {
      comments.push("RGB-Monitor ermöglicht brillante Farbdarstellung");
    } else {
      comments.push("Ohne Farbmonitor geht viel vom visuellen Erlebnis verloren");
    }
    
    // Case Design (5%)
    const caseDesign = model.case?.type === 'gamer' ? model.case.design : 30;
    score += (caseDesign || 30) * 0.05;
    
    if (model.case?.type === 'gamer') {
      comments.push("Gaming-Design unterstreicht die Spiele-Ausrichtung");
    }
    
    // Preis-Leistungs-Bewertung für Gamer
    const expectedGamerPrice = 400 + (year - 1983) * 100;
    const priceValue = Math.max(0, Math.min(100, 
      100 - Math.abs(model.price - expectedGamerPrice) / expectedGamerPrice * 100
    ));
    
    const rating = this.getScoreRating(score);
    
    return {
      score: Math.round(score),
      rating,
      comments,
      priceValue: Math.round(priceValue)
    };
  }
  
  private static evaluateBusiness(model: any, year: number): {
    score: number;
    rating: string;
    comments: string[];
    priceValue: number;
  } {
    let score = 0;
    const comments: string[] = [];
    
    // CPU-Power (50% für Business)
    const cpuBusinessScores = {
      'MOS 6502': 15, 'Zilog Z80': 25, 'Intel 8086': 70, 
      'Motorola 68000': 85, 'Intel 80286': 95, 'Intel 80386': 100
    };
    const cpuScore = cpuBusinessScores[model.cpu as keyof typeof cpuBusinessScores] || 20;
    score += cpuScore * 0.5;
    
    if (cpuScore >= 90) {
      comments.push("Exzellente CPU-Leistung für anspruchsvolle Büro-Anwendungen");
    } else if (cpuScore >= 70) {
      comments.push("Sehr gute Performance für Standardsoftware und Tabellenkalkulation");
    } else if (cpuScore >= 50) {
      comments.push("Ausreichend für grundlegende Bürotätigkeiten");
    } else {
      comments.push("CPU-Leistung ist für professionelle Anwendungen zu schwach");
    }
    
    // RAM (25% für Business)
    const ramAmounts = {
      '4KB RAM': 10, '16KB RAM': 25, '64KB RAM': 50, 
      '256KB RAM': 80, '512KB RAM': 95, '1MB RAM': 100
    };
    const ramScore = ramAmounts[model.ram as keyof typeof ramAmounts] || 15;
    score += ramScore * 0.25;
    
    if (ramScore >= 80) {
      comments.push("Großzügiger Arbeitsspeicher ermöglicht Multitasking");
    } else if (ramScore >= 50) {
      comments.push("Ausreichend RAM für die meisten Business-Anwendungen");
    } else {
      comments.push("Wenig Arbeitsspeicher limitiert komplexere Programme");
    }
    
    // Speicher-Laufwerke (15%)
    const hasStorage = model.accessories?.some((acc: string) => 
      acc.includes('Diskette') || acc.includes('Festplatte')
    );
    const storageScore = hasStorage ? 85 : 20;
    score += storageScore * 0.15;
    
    if (hasStorage) {
      if (model.accessories.some((acc: string) => acc.includes('Festplatte'))) {
        comments.push("Festplatte bietet schnellen Zugriff auf Programme und Daten");
      } else {
        comments.push("Diskettenlaufwerk ermöglicht Datenaustausch und -sicherung");
      }
    } else {
      comments.push("Fehlende Speicherlaufwerke erschweren die praktische Nutzung");
    }
    
    // Case-Qualität (10%)
    const caseQuality = model.case?.type === 'office' ? model.case.quality : 
                       (model.case?.quality || 40) * 0.7;
    score += (caseQuality || 40) * 0.1;
    
    if (model.case?.type === 'office' && model.case.quality >= 80) {
      comments.push("Professionelles Design passt perfekt ins Büro");
    } else if (model.case?.type === 'gamer') {
      comments.push("Gaming-Design wirkt im Bürokontext unprofessionell");
    }
    
    // Preis-Leistungs-Bewertung für Business
    const expectedBusinessPrice = 1200 + (year - 1983) * 300;
    const priceValue = Math.max(0, Math.min(100, 
      100 - Math.abs(model.price - expectedBusinessPrice) / expectedBusinessPrice * 100
    ));
    
    const rating = this.getScoreRating(score);
    
    return {
      score: Math.round(score),
      rating,
      comments,
      priceValue: Math.round(priceValue)
    };
  }
  
  private static evaluateWorkstation(model: any, year: number): {
    score: number;
    rating: string;
    comments: string[];
    priceValue: number;
  } {
    let score = 0;
    const comments: string[] = [];
    
    // Nur ab 1987 sind Workstations relevant
    if (year < 1987) {
      return {
        score: 0,
        rating: 'Nicht anwendbar',
        comments: ['Workstation-Markt existiert noch nicht in den frühen 80ern'],
        priceValue: 0
      };
    }
    
    // Höchste CPU-Performance (60%)
    const cpuWorkstationScores = {
      'MOS 6502': 5, 'Zilog Z80': 10, 'Intel 8086': 30, 
      'Motorola 68000': 70, 'Intel 80286': 85, 'Intel 80386': 100
    };
    const cpuScore = cpuWorkstationScores[model.cpu as keyof typeof cpuWorkstationScores] || 10;
    score += cpuScore * 0.6;
    
    if (cpuScore >= 90) {
      comments.push("Top-Performance für anspruchsvollste Workstation-Anwendungen");
    } else if (cpuScore >= 70) {
      comments.push("Sehr gute Leistung für professionelle CAD/Engineering-Software");
    } else if (cpuScore >= 50) {
      comments.push("Ausreichend für einfachere Workstation-Tasks");
    } else {
      comments.push("CPU-Leistung reicht nicht für echte Workstation-Anwendungen");
    }
    
    // Viel RAM erforderlich (25%)
    const ramAmounts = {
      '4KB RAM': 5, '16KB RAM': 10, '64KB RAM': 25, 
      '256KB RAM': 60, '512KB RAM': 85, '1MB RAM': 100
    };
    const ramScore = ramAmounts[model.ram as keyof typeof ramAmounts] || 5;
    score += ramScore * 0.25;
    
    if (ramScore >= 85) {
      comments.push("Großzügiger Arbeitsspeicher für komplexeste Berechnungen");
    } else if (ramScore >= 60) {
      comments.push("Ausreichend RAM für mittlere Workstation-Anwendungen");
    } else {
      comments.push("Zu wenig RAM für professionelle Workstation-Nutzung");
    }
    
    // Professionelle Speicher-Lösungen (15%)
    const hasProfStorage = model.accessories?.some((acc: string) => 
      acc.includes('Festplatte') || acc.includes('SCSI')
    );
    const storageScore = hasProfStorage ? 90 : 15;
    score += storageScore * 0.15;
    
    if (hasProfStorage) {
      comments.push("Professionelle Speicherlösungen für große Datenmengen");
    } else {
      comments.push("Fehlende Festplatte limitiert Workstation-Funktionalität erheblich");
    }
    
    // Preis-Leistungs-Bewertung für Workstations
    const expectedWorkstationPrice = 3000 + (year - 1987) * 1000;
    const priceValue = Math.max(0, Math.min(100, 
      100 - Math.abs(model.price - expectedWorkstationPrice) / expectedWorkstationPrice * 80
    ));
    
    const rating = this.getScoreRating(score);
    
    return {
      score: Math.round(score),
      rating,
      comments,
      priceValue: Math.round(priceValue)
    };
  }
  
  private static evaluateCompatibility(model: any): {
    score: number;
    rating: string;
    bottlenecks: string[];
    synergies: string[];
  } {
    let score = 80; // Start mit guter Basis
    const bottlenecks: string[] = [];
    const synergies: string[] = [];
    
    // CPU vs GPU Balance
    const cpuTier = this.getCPUTier(model.cpu);
    const gpuTier = this.getGPUTier(model.gpu);
    
    if (Math.abs(cpuTier - gpuTier) > 2) {
      if (cpuTier > gpuTier + 2) {
        bottlenecks.push("Starke CPU wird durch schwache Grafik ausgebremst");
        score -= 15;
      } else {
        bottlenecks.push("Gute Grafik wird durch schwache CPU limitiert");
        score -= 15;
      }
    } else if (Math.abs(cpuTier - gpuTier) <= 1) {
      synergies.push("CPU und GPU harmonieren perfekt miteinander");
      score += 5;
    }
    
    // RAM vs CPU Balance
    const ramTier = this.getRAMTier(model.ram);
    if (cpuTier > ramTier + 2) {
      bottlenecks.push("Zu wenig RAM für die CPU-Leistung - Multitasking leidet");
      score -= 20;
    } else if (cpuTier < ramTier - 2) {
      bottlenecks.push("Viel RAM kann durch schwache CPU nicht optimal genutzt werden");
      score -= 10;
    } else if (Math.abs(cpuTier - ramTier) <= 1) {
      synergies.push("RAM-Ausstattung passt perfekt zur CPU-Leistung");
      score += 5;
    }
    
    // Sound + Grafik für Gaming
    if (model.sound !== 'PC Speaker' && gpuTier >= 3) {
      synergies.push("Guter Sound-Chip ergänzt starke Grafik perfekt für Spiele");
      score += 10;
    }
    
    // Storage + RAM für Produktivität
    const hasStorage = model.accessories?.some((acc: string) => 
      acc.includes('Festplatte') || acc.includes('Diskette')
    );
    if (hasStorage && ramTier >= 3) {
      synergies.push("Speicherlaufwerk + viel RAM = optimale Produktivitäts-Kombination");
      score += 8;
    }
    
    // Case + Hardware Harmony
    if (model.case?.type === 'gamer' && gpuTier >= 3 && model.sound !== 'PC Speaker') {
      synergies.push("Gaming-Case unterstreicht die Gaming-Hardware perfekt");
      score += 5;
    } else if (model.case?.type === 'office' && cpuTier >= 3 && hasStorage) {
      synergies.push("Business-Case passt ideal zur professionellen Hardware");
      score += 5;
    } else if (model.case?.type === 'gamer' && (cpuTier >= 4 || gpuTier <= 2)) {
      bottlenecks.push("Gaming-Case passt nicht zur Hardware-Ausrichtung");
      score -= 5;
    }
    
    // Extreme Imbalance Penalties
    if (bottlenecks.length >= 3) {
      score -= 15;
      bottlenecks.push("Viele Hardware-Konflikte beeinträchtigen die Gesamtleistung");
    }
    
    score = Math.max(0, Math.min(100, score));
    const rating = this.getScoreRating(score);
    
    return {
      score: Math.round(score),
      rating,
      bottlenecks,
      synergies
    };
  }
  
  private static evaluateBuildQuality(model: any): {
    score: number;
    rating: string;
    components: string[];
    caseMatch: boolean;
  } {
    let score = 70; // Basis-Qualität
    const components: string[] = [];
    
    // CPU Qualität
    const cpuQuality = {
      'MOS 6502': 60, 'Zilog Z80': 70, 'Intel 8086': 85,
      'Motorola 68000': 90, 'Intel 80286': 95, 'Intel 80386': 100
    };
    const cpuScore = cpuQuality[model.cpu as keyof typeof cpuQuality] || 50;
    score += (cpuScore - 70) * 0.3;
    
    if (cpuScore >= 90) {
      components.push(`${model.cpu}: Premium-Prozessor mit exzellenter Verarbeitung`);
    } else if (cpuScore >= 70) {
      components.push(`${model.cpu}: Solide CPU mit guter Qualität`);
    } else {
      components.push(`${model.cpu}: Budget-Prozessor mit basic Qualität`);
    }
    
    // RAM Qualität
    const ramQuality = {
      '4KB RAM': 50, '16KB RAM': 60, '64KB RAM': 75,
      '256KB RAM': 85, '512KB RAM': 90, '1MB RAM': 95
    };
    const ramScore = ramQuality[model.ram as keyof typeof ramQuality] || 50;
    score += (ramScore - 70) * 0.2;
    
    components.push(`${model.ram}: ${ramScore >= 80 ? 'Hochwertige' : ramScore >= 60 ? 'Solide' : 'Basic'} Speicher-Module`);
    
    // GPU Qualität
    const gpuQuality = {
      'MOS VIC': 40, 'TI TMS9918': 70, 'Atari GTIA': 80,
      'Commodore VIC-II': 85, 'VGA Graphics': 95
    };
    const gpuScore = gpuQuality[model.gpu as keyof typeof gpuQuality] || 50;
    score += (gpuScore - 70) * 0.2;
    
    components.push(`${model.gpu}: ${gpuScore >= 80 ? 'Exzellente' : gpuScore >= 60 ? 'Gute' : 'Einfache'} Grafikqualität`);
    
    // Sound Qualität
    const soundQuality = {
      'PC Speaker': 30, 'AY-3-8910': 70, 'SID 6581': 95, 'Yamaha YM2149': 80
    };
    const soundScore = soundQuality[model.sound as keyof typeof soundQuality] || 30;
    score += (soundScore - 70) * 0.1;
    
    // Case Quality
    const caseQuality = model.case?.quality || 50;
    score += (caseQuality - 70) * 0.2;
    
    components.push(`${model.case?.name || 'Standard-Gehäuse'}: ${caseQuality >= 80 ? 'Premium' : caseQuality >= 60 ? 'Solid' : 'Basic'} Verarbeitung`);
    
    // Case Match zur Hardware
    const caseMatch = this.evaluateCaseMatch(model);
    if (caseMatch) {
      score += 5;
    }
    
    score = Math.max(0, Math.min(100, score));
    const rating = this.getScoreRating(score);
    
    return {
      score: Math.round(score),
      rating,
      components,
      caseMatch
    };
  }
  
  private static calculateMarketImpact(
    overallScore: number,
    gamingScore: number,
    businessScore: number,
    workstationScore: number,
    model: any
  ): {
    reputationChange: number;
    expectedSalesBoost: number;
    competitorResponse: string;
    marketPosition: string;
  } {
    // Reputation Change
    let reputationChange = 0;
    if (overallScore >= 90) reputationChange = 8;
    else if (overallScore >= 80) reputationChange = 5;
    else if (overallScore >= 70) reputationChange = 2;
    else if (overallScore >= 60) reputationChange = 0;
    else if (overallScore >= 50) reputationChange = -2;
    else reputationChange = -5;
    
    // Sales Boost
    let salesBoost = (overallScore - 70) * 0.8; // -16% bis +24%
    
    // Competitor Response
    let competitorResponse = '';
    if (overallScore >= 85) {
      competitorResponse = 'Konkurrenten werden aggressive Gegenmaßnahmen ergreifen';
    } else if (overallScore >= 75) {
      competitorResponse = 'Konkurrenten beobachten das Produkt aufmerksam';
    } else if (overallScore >= 65) {
      competitorResponse = 'Moderate Reaktion der Mitbewerber erwartet';
    } else {
      competitorResponse = 'Konkurrenten ignorieren das Produkt weitgehend';
    }
    
    // Market Position
    let marketPosition = '';
    const bestCategory = Math.max(gamingScore, businessScore, workstationScore);
    if (bestCategory === gamingScore && gamingScore >= 80) {
      marketPosition = 'Gaming-Marktführer';
    } else if (bestCategory === businessScore && businessScore >= 80) {
      marketPosition = 'Business-Champion';
    } else if (bestCategory === workstationScore && workstationScore >= 80) {
      marketPosition = 'Workstation-Spezialist';
    } else if (overallScore >= 75) {
      marketPosition = 'Allround-Favorit';
    } else if (overallScore >= 60) {
      marketPosition = 'Solider Mitbewerber';
    } else {
      marketPosition = 'Nischen-Produkt';
    }
    
    return {
      reputationChange,
      expectedSalesBoost: Math.round(salesBoost),
      competitorResponse,
      marketPosition
    };
  }
  
  private static generateFinalVerdict(
    overallScore: number,
    model: any,
    gamingResult: any,
    businessResult: any,
    workstationResult: any
  ): string {
    const bestCategory = Math.max(gamingResult.score, businessResult.score, workstationResult.score);
    let verdict = '';
    
    if (overallScore >= 90) {
      verdict = `Der ${model.name} ist ein außergewöhnlicher Computer, der in allen Kategorien überzeugt. `;
    } else if (overallScore >= 80) {
      verdict = `Der ${model.name} bietet sehr gute Leistung und stellt eine empfehlenswerte Wahl dar. `;
    } else if (overallScore >= 70) {
      verdict = `Der ${model.name} ist ein solider Computer mit ausgewogenen Eigenschaften. `;
    } else if (overallScore >= 60) {
      verdict = `Der ${model.name} erfüllt die Grundanforderungen, hat aber Verbesserungspotential. `;
    } else {
      verdict = `Der ${model.name} zeigt deutliche Schwächen und ist nur für spezielle Anwendungen geeignet. `;
    }
    
    // Spezialisierung erwähnen
    if (bestCategory === gamingResult.score && gamingResult.score >= 75) {
      verdict += 'Besonders Gaming-Enthusiasten kommen hier auf ihre Kosten.';
    } else if (bestCategory === businessResult.score && businessResult.score >= 75) {
      verdict += 'Für Büro-Anwendungen ist dieser Computer eine ausgezeichnete Wahl.';
    } else if (bestCategory === workstationResult.score && workstationResult.score >= 75) {
      verdict += 'Als Workstation für professionelle Anwendungen ist er top geeignet.';
    } else if (Math.abs(gamingResult.score - businessResult.score) < 10) {
      verdict += 'Die ausgewogene Leistung macht ihn zum idealen Allrounder.';
    }
    
    return verdict;
  }
  
  // Helper Functions
  private static getScoreRating(score: number): string {
    if (score >= 95) return 'Exzellent';
    if (score >= 85) return 'Hervorragend';
    if (score >= 75) return 'Sehr gut';
    if (score >= 65) return 'Gut';
    if (score >= 55) return 'Befriedigend';
    if (score >= 45) return 'Ausreichend';
    return 'Mangelhaft';
  }
  
  private static getCPUTier(cpu: string): number {
    const tiers = {
      'MOS 6502': 1, 'Zilog Z80': 2, 'Intel 8086': 3,
      'Motorola 68000': 4, 'Intel 80286': 5, 'Intel 80386': 6
    };
    return tiers[cpu as keyof typeof tiers] || 1;
  }
  
  private static getGPUTier(gpu: string): number {
    const tiers = {
      'MOS VIC': 1, 'TI TMS9918': 2, 'Atari GTIA': 3,
      'Commodore VIC-II': 4, 'VGA Graphics': 5
    };
    return tiers[gpu as keyof typeof tiers] || 1;
  }
  
  private static getRAMTier(ram: string): number {
    const tiers = {
      '4KB RAM': 1, '16KB RAM': 2, '64KB RAM': 3,
      '256KB RAM': 4, '512KB RAM': 5, '1MB RAM': 6
    };
    return tiers[ram as keyof typeof tiers] || 1;
  }
  
  private static evaluateCaseMatch(model: any): boolean {
    const cpuTier = this.getCPUTier(model.cpu);
    const gpuTier = this.getGPUTier(model.gpu);
    
    if (model.case?.type === 'gamer') {
      return gpuTier >= 3 || model.sound !== 'PC Speaker';
    } else if (model.case?.type === 'office') {
      return cpuTier >= 3 || model.accessories?.some((acc: string) => 
        acc.includes('Diskette') || acc.includes('Festplatte')
      );
    }
    return true;
  }
}