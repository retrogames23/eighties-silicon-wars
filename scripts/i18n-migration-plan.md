# I18N Migration Plan - Static UI Strings

## Phase 1 - Plan ✅

### Top-Dateien mit hart codierten UI-Strings (Priorität)

#### Tier 1 - High Impact (Critical Views)
1. **CompanyAccount.tsx** (42 strings)
   - Labels: "Marketing-Budget", "Entwicklungskosten", "Gesamtumsatz", "Einnahmen", "Ausgaben"
   - Kategorien: "Marketing", "F&E", "Hardware-Verkäufe", "Software-Lizenzen"

2. **DevelopmentTab.tsx** (35 strings) 
   - Status: "In Entwicklung", "Verfügbar", "Eingestellt"
   - Metrics: "Gesamtumsatz", "Verkaufte Einheiten", "Entwicklungskosten"
   - Labels: "Neue Modelle", "Marktposition", "Performance"

3. **MarketTab.tsx** (28 strings)
   - Headers: "Marktanalyse", "Aktuelle Marktlage und Konkurrenz"
   - Metrics: "Marktanteil", "Wachstum", "Durchschnittspreis"

#### Tier 2 - Medium Impact  
4. **QuarterResults.tsx** - Quarterly reports, financial summaries
5. **GameTutorial.tsx** - Tutorial texts, help content
6. **CompanyManagement.tsx** - Budget management, employee settings

#### Tier 3 - Low Impact
7. **Newspaper.tsx** - Dynamic news content (separate namespace)
8. **UserProfile.tsx** - User settings, auth-related
9. **TestReport.tsx** - Model testing, technical specs

### Domänen-Glossar (DE → EN)

#### Economy & Finance
```
Gewinn → profit
Umsatz → revenue  
Einnahmen → income
Ausgaben → expenses
Kosten → costs
Budget → budget
Quartal → quarter
Wachstum → growth
Marktanteil → marketShare
Durchschnittspreis → averagePrice
```

#### Development & Technology
```
Entwicklung → development
Verfügbarkeit → availability
Revision → revision
Testbericht → review  
Knappheit → shortage
Performance → performance
Spezifikation → specification
Komponente → component
Hardware → hardware
Software → software
```

#### Business Operations
```
Marketing → marketing
Forschung → research
Produktion → production
Verkauf → sales  
Verwaltung → management
Mitarbeiter → employees
Reputation → reputation
```

#### UI Elements
```
Übersicht → overview
Details → details
Status → status
Fortschritt → progress
Ergebnis → result
Bericht → report
Analyse → analysis
Einstellung → setting
```

### Codemod-Strategie

#### String-Pattern Detection
```regex
// Hart codierte deutsche Strings (4+ Zeichen)
/["\'][^"']*[äöüßÄÖÜ][^"']*["\']|["\'][^"']*[AEIOU][a-z]{3,}[^"']*["\'])/g

// Exclude: className, style, pixelArt, CSS-related
/(?<!className.*)["\']([^"']*[a-zA-ZäöüßÄÖÜ]{4,}[^"']*)["\'](?![^"']*(?:px|rem|%|deg|opacity))/g
```

#### Migration Templates
```typescript
// Before:
"Gesamtumsatz" → {t('ui.development.totalRevenue')}
"In Entwicklung" → {t('ui.development.status.inDevelopment')}
"Marketing-Budget" → {t('ui.account.expenses.marketing')}

// Pattern:
"{{string}}" → {t('{{namespace}}.{{section}}.{{key}}')}
```

## Phase 2 - Umsetzung Plan

### Commit-Serie (Kleine Pakete)

#### Commit 1: `refactor(i18n-ui): codemod static strings to t() [ui]`
**Scope:** CompanyAccount.tsx, DevelopmentTab.tsx
**Namespace:** `ui.json`
**Estimated:** 77 strings → t() calls

#### Commit 2: `refactor(i18n-ui): codemod static strings to t() [economy]`  
**Scope:** MarketTab.tsx, QuarterResults.tsx
**Namespace:** `economy.json` (extend existing)
**Estimated:** 45 strings → t() calls  

#### Commit 3: `refactor(i18n-ui): codemod static strings to t() [hardware]`
**Scope:** Hardware-related components, TestReport.tsx
**Namespace:** `hardware.json` (new)
**Estimated:** 30 strings → t() calls

### Dev-Test Implementation

#### Missing Key Detection Test
```typescript
// tests/i18n-coverage.test.tsx
describe('I18N Coverage Tests', () => {
  const missingKeys: string[] = [];
  
  beforeAll(() => {
    // Hook into i18next missing key handler
    i18n.on('missingKey', (lng, namespace, key) => {
      missingKeys.push(`${namespace}:${key} [${lng}]`);
    });
  });

  test('CompanyAccount renders without missing keys (DE)', () => {
    i18n.changeLanguage('de');
    render(<CompanyAccount gameState={mockGameState} />);
    expect(missingKeys.filter(k => k.includes('[de]'))).toHaveLength(0);
  });

  test('CompanyAccount renders without missing keys (EN)', () => {
    i18n.changeLanguage('en');  
    render(<CompanyAccount gameState={mockGameState} />);
    expect(missingKeys.filter(k => k.includes('[en]'))).toHaveLength(0);
  });
  
  // Repeat for DevelopmentTab, MarketTab...
});
```

### Definition of Done Criteria

#### Per Component
- ✅ 0 hart codierte deutsche Strings (außer CSS/className)
- ✅ Alle UI-Texte verwenden t('namespace.key') Format  
- ✅ DE + EN Übersetzungen vollständig in JSON-Dateien
- ✅ Tests für beide Sprachen ohne Missing-Key Warnings

#### Project-Level  
- ✅ 85%+ I18N Coverage (from current 50%)
- ✅ Consistent namespace organization (ui, economy, hardware)
- ✅ No runtime errors on language switch
- ✅ Bundle size increase <10% (namespace lazy loading)

---

**Status:** Plan complete, ready for execution  
**Estimated Time:** 4-6 hours for all 3 commits  
**Risk Level:** Low (systematic approach, isolated changes)