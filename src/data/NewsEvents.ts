export interface NewsEvent {
  id: string;
  quarter: number;
  year: number;
  category: 'tech' | 'market' | 'world' | 'competitor';
  headline: string;
  content: string;
  impact?: {
    marketGrowth?: number;
    demandShift?: Array<{ segment: string; change: number }>;
    priceChange?: number;
  };
}

export const NEWS_EVENTS: NewsEvent[] = [
  // 1983
  {
    id: '1983q1_world1',
    quarter: 1,
    year: 1983,
    category: 'world',
    headline: 'Ronald Reagan kündigt "Strategic Defense Initiative" an',
    content: 'Präsident Reagan startet das Raumabwehrprogramm. Erhöhte Investitionen in Hochtechnologie erwartet.'
  },
  {
    id: '1983q1_tech1',
    quarter: 1,
    year: 1983,
    category: 'tech',
    headline: 'IBM PC XT mit Festplatte vorgestellt',
    content: 'IBM revolutioniert den Markt mit dem ersten PC mit integrierter 10MB Festplatte. Preis: $4.995.',
    impact: { marketGrowth: 0.15 }
  },
  {
    id: '1983q2_competitor1',
    quarter: 2,
    year: 1983,
    category: 'competitor',
    headline: 'Apple Lisa Computer für $9.995 angekündigt',
    content: 'Apple stellt revolutionären Computer mit grafischer Benutzeroberfläche vor. Experten zweifeln am hohen Preis.'
  },
  {
    id: '1983q3_market1',
    quarter: 3,
    year: 1983,
    category: 'market',
    headline: 'Heimcomputer-Boom erreicht Europa',
    content: 'Commodore 64 wird europaweit zum Bestseller. Über 200.000 Einheiten in Q3 verkauft.',
    impact: { demandShift: [{ segment: 'home', change: 0.2 }] }
  },
  {
    id: '1983q4_world2',
    quarter: 4,
    year: 1983,
    category: 'world',
    headline: 'US-Invasion in Grenada',
    content: 'Militäreinsatz der USA verstärkt Interesse an Kommunikationstechnologie und Computer.'
  },

  // 1984
  {
    id: '1984q1_tech2',
    quarter: 1,
    year: 1984,
    category: 'tech',
    headline: 'Apple Macintosh mit revolutionärer GUI vorgestellt',
    content: 'Der "Computer für alle" mit Maus und grafischer Oberfläche. Startpreis: $2.495.',
    impact: { marketGrowth: 0.25, demandShift: [{ segment: 'business', change: 0.15 }] }
  },
  {
    id: '1984q1_world3',
    quarter: 1,
    year: 1984,
    category: 'world',
    headline: 'Olympische Winterspiele in Sarajevo',
    content: 'Erste computergestützte Zeitnahme bei Olympischen Spielen sorgt für Aufmerksamkeit.'
  },
  {
    id: '1984q2_competitor2',
    quarter: 2,
    year: 1984,
    category: 'competitor',
    headline: 'IBM PCjr floppt am Markt',
    content: 'IBMs Versuch eines Heimcomputers scheitert. Nur 240.000 Einheiten verkauft, Produktion eingestellt.',
    impact: { demandShift: [{ segment: 'home', change: 0.1 }] }
  },
  {
    id: '1984q3_market2',
    quarter: 3,
    year: 1984,
    category: 'market',
    headline: 'Preiskampf bei Heimcomputern eskaliert',
    content: 'Commodore senkt C64-Preis auf $199. Atari und andere Hersteller ziehen nach.',
    impact: { priceChange: -0.2 }
  },
  {
    id: '1984q4_world4',
    quarter: 4,
    year: 1984,
    category: 'world',
    headline: 'Indira Gandhi ermordet - Unruhen in Indien',
    content: 'Politische Instabilität beeinflusst globale Märkte und Technologie-Investitionen.'
  },

  // 1985
  {
    id: '1985q1_tech3',
    quarter: 1,
    year: 1985,
    category: 'tech',
    headline: 'Intel 80286 Prozessor revolutioniert PCs',
    content: 'Der 12 MHz Prozessor mit 16-bit Performance setzt neue Standards für Business-Computer.',
    impact: { demandShift: [{ segment: 'business', change: 0.2 }] }
  },
  {
    id: '1985q2_competitor3',
    quarter: 2,
    year: 1985,
    category: 'competitor',
    headline: 'Commodore Amiga angekündigt',
    content: 'Revolutionärer 16-bit Computer mit fortschrittlicher Grafik und Multitasking für $1.295.'
  },
  {
    id: '1985q3_world5',
    quarter: 3,
    year: 1985,
    category: 'world',
    headline: 'Live Aid Konzert verbindet die Welt',
    content: 'Satellitentechnologie ermöglicht globale Live-Übertragung. Interesse an Kommunikationstechnik steigt.'
  },
  {
    id: '1985q4_market3',
    quarter: 4,
    year: 1985,
    category: 'market',
    headline: 'Software wird zum Geschäft',
    content: 'Lotus 1-2-3 überschreitet 1 Million verkaufte Kopien. Software wichtiger als Hardware.',
    impact: { marketGrowth: 0.1 }
  },

  // 1986
  {
    id: '1986q1_world6',
    quarter: 1,
    year: 1986,
    category: 'world',
    headline: 'Challenger-Katastrophe schockiert Welt',
    content: 'NASA-Shuttle explodiert. Fragen zur Zuverlässigkeit computergesteuerter Systeme.'
  },
  {
    id: '1986q2_tech4',
    quarter: 2,
    year: 1986,
    category: 'tech',
    headline: 'CD-ROM Technologie für Computer',
    content: 'Neue Speichertechnologie mit 650MB Kapazität eröffnet neue Möglichkeiten.',
    impact: { marketGrowth: 0.15 }
  },
  {
    id: '1986q3_competitor4',
    quarter: 3,
    year: 1986,
    category: 'competitor',
    headline: 'Atari ST Computer startet in Europa',
    content: 'Günstiger 16-bit Computer mit MIDI-Unterstützung für Musiker. Preis: $799.'
  },
  {
    id: '1986q4_world7',
    quarter: 4,
    year: 1986,
    category: 'world',
    headline: 'Tschernobyl-Katastrophe erschüttert Europa',
    content: 'Nuklearunfall verstärkt Interesse an computergestützter Sicherheitstechnik.'
  }
];

const usedNewsEvents = new Set<string>();

export const getNewsForQuarter = (quarter: number, year: number): NewsEvent[] => {
  // Filtere Events für das spezifische Quartal
  let quarterNews = NEWS_EVENTS.filter(event => {
    // Regular news matching quarter/year
    const isRegularNews = event.quarter === quarter && event.year === year;
    
    // Hardware-synchronized news (check for optional effectiveQuarter field)
    const isEffectiveNews = (event as any).effectiveQuarter === quarter && event.year === year;
    
    // Announcement news (check for optional isAnnouncement field)
    const isAnnouncementNews = (event as any).isAnnouncement && event.quarter === quarter && event.year === year;
    
    // Hardware availability check for tech news (check for optional affectedHardwareTags field)
    if (event.category === 'tech' && (event as any).affectedHardwareTags && (event as any).affectedHardwareTags.length > 0) {
      try {
        // Dynamic import to avoid circular dependency
        const { HardwareAvailabilityService } = require('@/services/HardwareAvailabilityService');
        const hardwareAvailable = (event as any).affectedHardwareTags.some((tag: string) => 
          HardwareAvailabilityService.isHardwareAvailable(tag, year, quarter, [])
        );
        
        // Show only if hardware is available OR it's an announcement
        if (!hardwareAvailable && !(event as any).isAnnouncement) {
          return false;
        }
      } catch (error) {
        // Fallback if service not available - show all tech news
        console.warn('HardwareAvailabilityService not available for news sync');
      }
    }
    
    return isRegularNews || isEffectiveNews || isAnnouncementNews;
  });
  
  // Entferne bereits verwendete Events
  quarterNews = quarterNews.filter(event => !usedNewsEvents.has(event.id));
  
  // Markiere Events als verwendet
  quarterNews.forEach(event => usedNewsEvents.add(event.id));
  
  // Falls keine spezifischen Events vorhanden sind, füge ein generelles Event hinzu
  if (quarterNews.length === 0) {
    const randomEvents = [
      {
        id: `${year}q${quarter}_market_growth`,
        quarter,
        year,
        category: 'market' as const,
        headline: 'Computermarkt erreicht neue Höchststände',
        content: 'Der Heimcomputermarkt zeigt weiterhin beeindruckendes Wachstum. Analysten prognostizieren eine Verdopplung des Marktes in den nächsten zwei Jahren.',
        impact: { marketGrowth: 0.1 }
      },
      {
        id: `${year}q${quarter}_tech_innovation`,
        quarter,
        year,
        category: 'tech' as const,
        headline: 'Neue Prozessortechnologie kündigt sich an',
        content: 'Chip-Hersteller arbeiten an leistungsfähigeren Prozessoren. Experten erwarten deutliche Verbesserungen in der Rechenleistung.',
        impact: { marketGrowth: 0.05 }
      },
      {
        id: `${year}q${quarter}_consumer_demand`,
        quarter,
        year,
        category: 'market' as const,
        headline: 'Verbraucher zeigen hohes Interesse an Heimcomputern',
        content: 'Umfragen zeigen steigendes Interesse der Verbraucher an Heimcomputern für Büro und Freizeit.',
        impact: { marketGrowth: 0.08 }
      }
    ];
    
    // Wähle ein zufälliges Event aus, das nicht bereits verwendet wurde
    const availableEvents = randomEvents.filter(event => !usedNewsEvents.has(event.id));
    if (availableEvents.length > 0) {
      const selectedEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
      usedNewsEvents.add(selectedEvent.id);
      return [selectedEvent];
    }
  }
  
  return quarterNews;
};