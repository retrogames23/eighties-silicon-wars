import { ResearchProject, ResearchPath } from './types';

/**
 * Service für verfügbare Forschungspfade
 * Bestimmt welche Forschungsrichtungen basierend auf Jahr und Technologie-Level verfügbar sind
 */
export class ResearchPathsService {
  
  /**
   * Hole verfügbare Forschungspfade basierend auf aktueller Jahr und Technologie-Level
   */
  static getAvailableResearchPaths(currentYear: number): ResearchPath[] {
    const paths: ResearchPath[] = [
      {
        type: 'exclusive_gpu' as const,
        name: 'Exklusiver Grafik-Chip',
        description: 'Entwickeln Sie einen proprietären Grafik-Prozessor mit überlegener Performance',
        estimatedCost: '$75,000 - $200,000',
        estimatedTime: '3-4 Quartale',
        benefits: [
          'Exklusiver Zugang für 2 Jahre',
          '+15-30% bessere Grafik-Performance',
          'Einzigartige Features für Marketing',
          'Höhere Gewinnmargen'
        ]
      },
      {
        type: 'exclusive_sound' as const,
        name: 'Exklusiver Audio-Chip',
        description: 'Revolutionäre Sound-Technologie für Premium-Audioerlebnis',
        estimatedCost: '$45,000 - $120,000',
        estimatedTime: '2-3 Quartale',
        benefits: [
          'Exklusiver Zugang für 2 Jahre',
          'Premium Audio-Qualität',
          'Wettbewerbsvorteil bei Multimedia-PCs',
          'Markendifferenzierung'
        ]
      }
    ];

    // Add CPU research for later years
    if (currentYear >= 1985) {
      paths.push({
        type: 'exclusive_cpu' as const,
        name: 'Exklusiver Prozessor',
        description: 'Entwicklung eines hochspezialisierten CPU-Designs',
        estimatedCost: '$150,000 - $400,000',
        estimatedTime: '4-6 Quartale',
        benefits: [
          'Exklusiver Zugang für 2 Jahre',
          'Branchenführende Performance',
          'Proprietäre Instruction Sets',
          'Technologieführerschaft'
        ]
      });
    }

    // Add case research for design-focused markets
    if (currentYear >= 1984) {
      paths.push({
        type: 'exclusive_case' as const,
        name: 'Premium-Gehäuse Design',
        description: 'Innovative Gehäuse-Technologie mit modularem Design',
        estimatedCost: '$30,000 - $80,000',
        estimatedTime: '2 Quartale',
        benefits: [
          'Exklusiver Zugang für 2 Jahre',
          'Premium-Positionierung',
          'Verbesserte Kühlung & Ergonomie',
          'Designpreis-Potential'
        ]
      });
    }

    return paths;
  }
}