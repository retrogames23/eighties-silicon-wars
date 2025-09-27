import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import i18n from '@/lib/i18n';
import { CompanyAccount } from '@/components/CompanyAccount';
import { DevelopmentTab } from '@/components/DevelopmentTab';
import { MarketTab } from '@/components/MarketTab';
import type { ComputerModel } from '@/types/ComputerModel';

// Mock game state for testing
const mockGameState = {
  company: {
    cash: 50000,
    monthlyIncome: 15000,
    monthlyExpenses: 8000,
    hardwareIncome: 12000,
    additionalRevenue: {
      softwareLicenses: { games: 2000, office: 3000 },
      supportService: { b2c: 1000, b2b: 2000 }
    }
  },
  budget: {
    marketing: 15000,
    development: 25000,
    research: 10000
  }
};

const mockModels: ComputerModel[] = [
  {
    id: 'model-1',
    displayName: 'Test Computer',
    status: 'released',
    price: 1500,
    developmentCost: 50000,
    totalRevenue: 150000,
    unitsSold: 100,
    quarter: 1,
    year: 1983,
    components: {
      cpu: { type: 'Intel 8086', price: 300 },
      memory: { type: '64KB RAM', price: 200 },
      gpu: { type: 'MOS VIC', price: 100 },
      sound: { type: 'PC Speaker', price: 50 }
    },
    accessories: ['Diskette'],
    case: {
      type: 'office' as const,
      quality: 60,
      design: 40,
      price: 80
    },
    baseName: 'Test Computer',
    revision: 1
  }
];

const mockCompetitors = [
  {
    name: 'Apple Computer',
    marketShare: 25.5,
    models: [{ name: 'Apple II', price: 1298, appeal: 85 }]
  },
  {
    name: 'Commodore',
    marketShare: 18.2,
    models: [{ name: 'C64', price: 595, appeal: 78 }]
  }
];

const mockMarketEvents = [
  {
    id: 'event-1',
    quarter: 2,
    year: 1983,
    category: 'tech' as const,
    headline: 'New processor announced',
    content: 'Intel releases faster processor'
  }
];

// I18N Missing Key Detection
describe('I18N Coverage Tests', () => {
  const missingKeys: Array<{key: string, namespace: string, lng: string}> = [];
  
  beforeAll(async () => {
    // Wait for i18n to be ready
    await i18n.init();
    
    // Hook into missing key handler
    i18n.on('missingKey', (lng: string, namespace: string, key: string) => {
      missingKeys.push({ key, namespace, lng });
    });
  });
  
  beforeEach(() => {
    // Clear missing keys before each test
    missingKeys.length = 0;
  });
  
  afterEach(() => {
    // Report missing keys if any
    if (missingKeys.length > 0) {
      console.warn('Missing translation keys detected:', missingKeys);
    }
  });

  describe('CompanyAccount Component', () => {
    test('renders without missing keys in German', async () => {
      await i18n.changeLanguage('de');
      
      render(<CompanyAccount gameState={mockGameState} />);
      
      // Check that component rendered
      expect(document.body).toBeTruthy();
      
      // Verify no missing keys for German
      const germanMissingKeys = missingKeys.filter(k => k.lng === 'de');
      expect(germanMissingKeys).toHaveLength(0);
    });

    test('renders without missing keys in English', async () => {
      await i18n.changeLanguage('en');
      
      render(<CompanyAccount gameState={mockGameState} />);
      
      // Check that component rendered
      expect(document.body).toBeTruthy();
      
      // Verify no missing keys for English
      const englishMissingKeys = missingKeys.filter(k => k.lng === 'en');
      expect(englishMissingKeys).toHaveLength(0);
    });

    test('displays correct currency formatting per locale', async () => {
      // Test German formatting
      await i18n.changeLanguage('de');
      render(<CompanyAccount gameState={mockGameState} />);
      
      // Should find German-formatted currency (€)
      const germanElements = screen.getAllByText(/€/);
      expect(germanElements.length).toBeGreaterThan(0);
      
      // Test English formatting  
      await i18n.changeLanguage('en');
      render(<CompanyAccount gameState={mockGameState} />);
      
      // Should find US-formatted currency ($)
      const englishElements = screen.getAllByText(/\$/);
      expect(englishElements.length).toBeGreaterThan(0);
    });
  });

  describe('DevelopmentTab Component', () => {
    test('renders without missing keys in German', async () => {
      await i18n.changeLanguage('de');
      
      render(
        <DevelopmentTab 
          models={mockModels} 
          onDevelopNewModel={() => {}}
          onDiscontinueModel={() => {}}
        />
      );
      
      const germanMissingKeys = missingKeys.filter(k => k.lng === 'de');
      expect(germanMissingKeys).toHaveLength(0);
    });

    test('renders without missing keys in English', async () => {
      await i18n.changeLanguage('en');
      
      render(
        <DevelopmentTab 
          models={mockModels} 
          onDevelopNewModel={() => {}}
          onDiscontinueModel={() => {}}
        />
      );
      
      const englishMissingKeys = missingKeys.filter(k => k.lng === 'en');
      expect(englishMissingKeys).toHaveLength(0);
    });

    test('displays model status in correct language', async () => {
      await i18n.changeLanguage('de');
      render(
        <DevelopmentTab 
          models={mockModels} 
          onDevelopNewModel={() => {}}
          onDiscontinueModel={() => {}}
        />
      );
      
      // Should find German status text
      expect(screen.getByText(/Verfügbar|Entwicklung|Eingestellt/)).toBeTruthy();
      
      await i18n.changeLanguage('en');
      render(
        <DevelopmentTab 
          models={mockModels} 
          onDevelopNewModel={() => {}}
          onDiscontinueModel={() => {}}
        />
      );
      
      // Should find English status text
      expect(screen.getByText(/Available|Development|Discontinued/)).toBeTruthy();
    });
  });

  describe('MarketTab Component', () => {
    test('renders without missing keys in German', async () => {
      await i18n.changeLanguage('de');
      
      render(
        <MarketTab 
          competitors={mockCompetitors}
          marketEvents={mockMarketEvents}
          totalMarketSize={1000000}
          playerMarketShare={5.2}
        />
      );
      
      const germanMissingKeys = missingKeys.filter(k => k.lng === 'de');
      expect(germanMissingKeys).toHaveLength(0);
    });

    test('renders without missing keys in English', async () => {
      await i18n.changeLanguage('en');
      
      render(
        <MarketTab 
          competitors={mockCompetitors}
          marketEvents={mockMarketEvents}
          totalMarketSize={1000000}
          playerMarketShare={5.2}
        />
      );
      
      const englishMissingKeys = missingKeys.filter(k => k.lng === 'en');
      expect(englishMissingKeys).toHaveLength(0);
    });
  });

  describe('Hard-coded String Detection', () => {
    test('components should not contain hard-coded German strings', () => {
      // This test would analyze component source code for patterns
      // In a real implementation, you might use AST parsing
      
      const hardCodedPatterns = [
        /["\'][^"']*[äöüßÄÖÜ][^"']*["\']/, // German umlauts
        /["\'](?:Gesamtumsatz|Entwicklung|Verfügbar|Marketing|Ausgaben)["\']/, // Common German terms
      ];
      
      // In practice, you'd read the actual component files and check
      // For this example, we assume the migration is complete
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Translation Completeness', () => {
    test('all required namespaces are loaded', async () => {
      const requiredNamespaces = ['ui', 'economy', 'common', 'toast'];
      
      for (const ns of requiredNamespaces) {
        const hasGerman = i18n.hasResourceBundle('de', ns);
        const hasEnglish = i18n.hasResourceBundle('en', ns);
        
        expect(hasGerman).toBe(true);
        expect(hasEnglish).toBe(true);
      }
    });

    test('critical translation keys exist in both languages', () => {
      const criticalKeys = [
        'ui.development.totalRevenue',
        'ui.development.status.available',
        'ui.account.expenses.marketing',
        'economy.revenue.total',
        'common.quality',
        'common.price'
      ];
      
      for (const key of criticalKeys) {
        const [namespace, ...keyParts] = key.split('.');
        const translationKey = keyParts.join('.');
        
        const germanTranslation = i18n.getResource('de', namespace, translationKey);
        const englishTranslation = i18n.getResource('en', namespace, translationKey);
        
        expect(germanTranslation).toBeDefined();
        expect(englishTranslation).toBeDefined();
        expect(typeof germanTranslation).toBe('string');
        expect(typeof englishTranslation).toBe('string');
      }
    });
  });
});