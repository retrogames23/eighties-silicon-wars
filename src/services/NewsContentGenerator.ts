export interface NewsContentData {
  type: string;
  quarter: number;
  year: number;
  payload: any;
}

export interface GeneratedNewsContent {
  id: string;
  category: 'tech' | 'market' | 'world' | 'competitor';
  headline: string;
  content: string;
  impact?: {
    marketGrowth?: number;
    demandShift?: Array<{ segment: string; change: number }>;
    priceChange?: number;
  };
}

export class NewsContentGenerator {
  private static usedHashes = new Set<string>();

  /**
   * Generate deduplication key based on type + quarter + content hash
   */
  private static generateDedupKey(data: NewsContentData): string {
    const contentHash = this.simpleHash(JSON.stringify(data.payload));
    return `${data.type}_${data.year}q${data.quarter}_${contentHash}`;
  }

  /**
   * Simple hash function for content deduplication
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  /**
   * Check if news content would be duplicate
   */
  static isDuplicate(data: NewsContentData): boolean {
    const key = this.generateDedupKey(data);
    return this.usedHashes.has(key);
  }

  /**
   * Mark news content as used
   */
  static markAsUsed(data: NewsContentData): void {
    const key = this.generateDedupKey(data);
    this.usedHashes.add(key);
  }

  /**
   * Generate complete news articles with full sentences (12-24 words)
   */
  static generateMarketNews(quarter: number, year: number, marketData?: any): GeneratedNewsContent[] {
    const data: NewsContentData = {
      type: 'market',
      quarter,
      year,
      payload: { marketData }
    };

    if (this.isDuplicate(data)) {
      return [];
    }

    const templates = [
      {
        headline: 'Computermarkt verzeichnet außergewöhnliches Wachstum im aktuellen Quartal',
        content: 'Marktforscher berichten von einem beeindruckenden Anstieg der Verkaufszahlen, der alle Erwartungen übertrifft und die Branche optimistisch stimmt.',
        impact: { marketGrowth: Math.random() * 0.1 + 0.05 }
      },
      {
        headline: 'Preiskampf zwischen Herstellern führt zu günstigeren Heimcomputern',
        content: 'Der intensiver werdende Wettbewerb zwingt Computerhersteller zu drastischen Preissenkungen, was Verbrauchern zugute kommt aber Gewinnmargen schmälert.',
        impact: { priceChange: -0.1 - Math.random() * 0.1 }
      },
      {
        headline: 'Neue Zielgruppen entdecken Computer für sich als vielseitige Werkzeuge',
        content: 'Während Computer früher primär von Technik-Enthusiasten genutzt wurden, erobern sie nun Büros und Wohnzimmer gewöhnlicher Familien.',
        impact: { demandShift: [{ segment: 'home', change: 0.15 }] }
      },
      {
        headline: 'Einzelhandel meldet deutlich gestiegene Nachfrage nach Computerzubehör',
        content: 'Fachgeschäfte berichten von einem überraschenden Boom bei Druckern, Disketten und Monitoren, der die starke Verbreitung von Heimcomputern widerspiegelt.',
        impact: { marketGrowth: 0.08 }
      },
      {
        headline: 'Softwarehersteller profitieren vom expandierenden Computermarkt enorm',
        content: 'Die wachsende Anzahl von Computerbesitzern beschert Programmentwicklern traumhafte Umsätze und treibt Innovationen in allen Anwendungsbereichen voran.',
        impact: { marketGrowth: 0.12 }
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    this.markAsUsed(data);

    return [{
      id: `${year}q${quarter}_market_${this.generateDedupKey(data)}`,
      category: 'market',
      headline: template.headline,
      content: template.content,
      impact: template.impact
    }];
  }

  static generateTechNews(quarter: number, year: number, hardwareTags?: string[]): GeneratedNewsContent[] {
    const data: NewsContentData = {
      type: 'tech',
      quarter,
      year,
      payload: { hardwareTags }
    };

    if (this.isDuplicate(data)) {
      return [];
    }

    const templates = [
      {
        headline: 'Durchbruch in der Prozessortechnologie verspricht deutlich schnellere Computer',
        content: 'Ingenieure haben neue Fertigungsverfahren entwickelt, die es ermöglichen, Prozessoren mit höheren Taktraten und besserer Energieeffizienz zu produzieren.',
        impact: { marketGrowth: 0.15 }
      },
      {
        headline: 'Revolutionäre Grafikchips sollen Spielerlebnis auf völlig neue Ebene heben',
        content: 'Die neueste Generation von Grafikprozessoren verspricht eine bisher unerreichte Darstellungsqualität und wird Gaming-Computer in neue Dimensionen führen.',
        impact: { demandShift: [{ segment: 'gaming', change: 0.2 }] }
      },
      {
        headline: 'Speichertechnologie macht Computer für Unternehmen noch attraktiver',
        content: 'Neue RAM-Module mit größerer Kapazität und niedrigeren Preisen ermöglichen es Firmen, leistungsfähigere Arbeitsplätze kostengünstig auszustatten.',
        impact: { demandShift: [{ segment: 'business', change: 0.18 }] }
      },
      {
        headline: 'Audio-Chips erreichen Qualitätsniveau professioneller Musikstudios',
        content: 'Fortschritte in der digitalen Signalverarbeitung bringen Sound-Qualität hervor, die selbst anspruchsvolle Musiker und Audiophile begeistert.',
        impact: { marketGrowth: 0.1 }
      },
      {
        headline: 'Neue Festplattentechnologie verdoppelt Speicherkapazität bei gleichen Kosten',
        content: 'Revolutionäre Entwicklungen in der magnetischen Datenspeicherung versprechen Computer mit nie dagewesenen Speichermengen für Privatnutzer und Profis.',
        impact: { marketGrowth: 0.13 }
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    this.markAsUsed(data);

    return [{
      id: `${year}q${quarter}_tech_${this.generateDedupKey(data)}`,
      category: 'tech',
      headline: template.headline,
      content: template.content,
      impact: template.impact
    }];
  }

  static generateCompetitorNews(quarter: number, year: number, competitorData?: any): GeneratedNewsContent[] {
    const data: NewsContentData = {
      type: 'competitor',
      quarter,
      year,
      payload: { competitorData }
    };

    if (this.isDuplicate(data)) {
      return [];
    }

    const templates = [
      {
        headline: 'Etablierte Computerhersteller kündigen aggressive Expansionspläne an',
        content: 'Branchenriesen investieren Milliardenbeträge in neue Produktionskapazitäten und Forschung, um ihre Marktführerschaft gegen aufstrebende Konkurrenten zu verteidigen.'
      },
      {
        headline: 'Internationale Konzerne drängen verstärkt auf den deutschen Computermarkt',
        content: 'Amerikanische und japanische Technologieunternehmen intensivieren ihre Bemühungen, europäische Märkte zu erobern und lokale Hersteller unter Druck zu setzen.'
      },
      {
        headline: 'Fusion zweier Computerhersteller könnte Marktlandschaft grundlegend verändern',
        content: 'Spekulationen über eine bevorstehende Übernahme sorgen für Unruhe in der Branche und könnten die Machtverhältnisse im Computersektor verschieben.'
      },
      {
        headline: 'Neuer Marktteilnehmer verspricht revolutionäre Computer zu Niedrigpreisen',
        content: 'Ein bisher unbekanntes Unternehmen kündigt an, mit innovativen Produktionsverfahren Computer anzubieten, die bisherige Preis-Leistungs-Verhältnisse sprengen sollen.'
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    this.markAsUsed(data);

    return [{
      id: `${year}q${quarter}_competitor_${this.generateDedupKey(data)}`,
      category: 'competitor',
      headline: template.headline,
      content: template.content
    }];
  }

  static generateWorldNews(quarter: number, year: number): GeneratedNewsContent[] {
    const data: NewsContentData = {
      type: 'world',
      quarter,
      year,
      payload: { general: true }
    };

    if (this.isDuplicate(data)) {
      return [];
    }

    const templates = [
      {
        headline: 'Internationale Handelsabkommen fördern den globalen Technologieaustausch',
        content: 'Neue diplomatische Vereinbarungen erleichtern Import und Export von Computerkomponenten, was Herstellern besseren Zugang zu weltweiten Märkten ermöglicht.'
      },
      {
        headline: 'Bildungsreformen sehen verstärkten Computereinsatz in Schulen vor',
        content: 'Kultusminister verschiedener Länder planen massive Investitionen in Schul-Computer, um Schüler frühzeitig mit moderner Technologie vertraut zu machen.',
        impact: { demandShift: [{ segment: 'education', change: 0.25 }] }
      },
      {
        headline: 'Wirtschaftsaufschwung verstärkt Nachfrage nach Büroautomatisierung deutlich',
        content: 'Die verbesserte Konjunkturlage ermutigt Unternehmen zu Investitionen in Computertechnik, um Arbeitsabläufe zu optimieren und Wettbewerbsvorteile zu erzielen.'
      },
      {
        headline: 'Kultureller Wandel macht Computer zum Symbol moderner Lebensweise',
        content: 'Computer entwickeln sich vom Nischenwerkzeug zum Statussymbol aufstrebender Gesellschaftsschichten und prägen das Selbstverständnis technikaffiner Bürger.'
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    this.markAsUsed(data);

    return [{
      id: `${year}q${quarter}_world_${this.generateDedupKey(data)}`,
      category: 'world',
      headline: template.headline,
      content: template.content,
      impact: template.impact
    }];
  }

  /**
   * Reset used hashes (for testing or game restart)
   */
  static resetDuplicateTracking(): void {
    this.usedHashes.clear();
  }

  /**
   * Get fallback news when no specific events are available
   */
  static generateFallbackNews(quarter: number, year: number): GeneratedNewsContent[] {
    const generators = [
      () => this.generateMarketNews(quarter, year),
      () => this.generateTechNews(quarter, year),
      () => this.generateCompetitorNews(quarter, year),
      () => this.generateWorldNews(quarter, year)
    ];

    // Try each generator until we find one that isn't duplicate
    for (const generator of generators) {
      const news = generator();
      if (news.length > 0) {
        return news;
      }
    }

    // If all are duplicates, force generate market news with timestamp
    const data: NewsContentData = {
      type: 'market_fallback',
      quarter,
      year,
      payload: { timestamp: Date.now() }
    };

    this.markAsUsed(data);

    return [{
      id: `${year}q${quarter}_fallback_${this.generateDedupKey(data)}`,
      category: 'market',
      headline: 'Computerbranche zeigt weiterhin stabiles Wachstum trotz Marktherausforderungen',
      content: 'Experten bestätigen die anhaltend positive Entwicklung des Computermarktes, der sich als überraschend widerstandsfähig gegen wirtschaftliche Schwankungen erweist.',
      impact: { marketGrowth: 0.05 }
    }];
  }
}