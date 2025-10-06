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
   * Returns i18n keys instead of hardcoded text
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
        headlineKey: 'news:headlines.marketGrowth',
        contentKey: 'news:content.marketGrowth',
        impact: { marketGrowth: Math.random() * 0.1 + 0.05 }
      },
      {
        headlineKey: 'news:headlines.priceWar',
        contentKey: 'news:content.priceWar',
        impact: { priceChange: -0.1 - Math.random() * 0.1 }
      },
      {
        headlineKey: 'news:headlines.newSegments',
        contentKey: 'news:content.newSegments',
        impact: { demandShift: [{ segment: 'home', change: 0.15 }] }
      },
      {
        headlineKey: 'news:headlines.retailBoom',
        contentKey: 'news:content.retailBoom',
        impact: { marketGrowth: 0.08 }
      },
      {
        headlineKey: 'news:headlines.softwareProfit',
        contentKey: 'news:content.softwareProfit',
        impact: { marketGrowth: 0.12 }
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    this.markAsUsed(data);

    return [{
      id: `${year}q${quarter}_market_${this.generateDedupKey(data)}`,
      category: 'market',
      headline: template.headlineKey,
      content: template.contentKey,
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
        headlineKey: 'news:headlines.techBreakthrough',
        contentKey: 'news:content.techBreakthrough',
        impact: { marketGrowth: 0.15 }
      },
      {
        headlineKey: 'news:headlines.graphicsRevolution',
        contentKey: 'news:content.graphicsRevolution',
        impact: { demandShift: [{ segment: 'gaming', change: 0.2 }] }
      },
      {
        headlineKey: 'news:headlines.memoryAdvance',
        contentKey: 'news:content.memoryAdvance',
        impact: { demandShift: [{ segment: 'business', change: 0.18 }] }
      },
      {
        headlineKey: 'news:headlines.audioQuality',
        contentKey: 'news:content.audioQuality',
        impact: { marketGrowth: 0.1 }
      },
      {
        headlineKey: 'news:headlines.storageDouble',
        contentKey: 'news:content.storageDouble',
        impact: { marketGrowth: 0.13 }
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    this.markAsUsed(data);

    return [{
      id: `${year}q${quarter}_tech_${this.generateDedupKey(data)}`,
      category: 'tech',
      headline: template.headlineKey,
      content: template.contentKey,
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
        headlineKey: 'news:headlines.competitorExpansion',
        contentKey: 'news:content.competitorExpansion'
      },
      {
        headlineKey: 'news:headlines.internationalPush',
        contentKey: 'news:content.internationalPush'
      },
      {
        headlineKey: 'news:headlines.mergerRumors',
        contentKey: 'news:content.mergerRumors'
      },
      {
        headlineKey: 'news:headlines.newEntrant',
        contentKey: 'news:content.newEntrant'
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    this.markAsUsed(data);

    return [{
      id: `${year}q${quarter}_competitor_${this.generateDedupKey(data)}`,
      category: 'competitor',
      headline: template.headlineKey,
      content: template.contentKey
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
        headlineKey: 'news:headlines.tradeAgreements',
        contentKey: 'news:content.tradeAgreements'
      },
      {
        headlineKey: 'news:headlines.educationReform',
        contentKey: 'news:content.educationReform',
        impact: { demandShift: [{ segment: 'education', change: 0.25 }] }
      },
      {
        headlineKey: 'news:headlines.economicBoom',
        contentKey: 'news:content.economicBoom'
      },
      {
        headlineKey: 'news:headlines.culturalShift',
        contentKey: 'news:content.culturalShift'
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    this.markAsUsed(data);

    return [{
      id: `${year}q${quarter}_world_${this.generateDedupKey(data)}`,
      category: 'world',
      headline: template.headlineKey,
      content: template.contentKey,
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
      headline: 'news:headlines.marketStability',
      content: 'news:content.marketStability',
      impact: { marketGrowth: 0.05 }
    }];
  }
}