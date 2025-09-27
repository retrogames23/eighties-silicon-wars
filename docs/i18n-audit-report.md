# I18N Audit Report & Migration Plan

**Date:** 2025-09-27  
**Status:** Phase 1 - Analysis Complete  
**Branch:** chore/i18n-audit-plan  

## Executive Summary

Audit reveals **3,072 hard-coded strings** across 80+ files. Current LanguageContext implementation covers ~15% of strings. German-dominant codebase with English technical terms and mixed debugging messages.

## Current I18N State

### ✅ Bereits implementiert
- `LanguageContext` mit DE/EN Übersetzungen (472 Keys)
- Verwendung in: `GameIntro.tsx`, `CompanySetup.tsx`, `GameDashboard.tsx` (partiell)
- Struktur: `t('namespace.key')` mit basic Parameter-Substitution

### ❌ Problematische Bereiche
- **UI Components:** 85% haben hart codierte deutsche Strings
- **News Generation:** 100% deutsche Headlines/Content  
- **Toast Messages:** 100% deutsche Fehlermeldungen
- **Console Logs:** Mixed DE/EN Debug-Messages
- **Type Definitions:** Englische Enums ohne Labels

## Detailed Analysis by Namespace

### 🎮 UI Components (`ui.*`)

#### `CaseSelection.tsx` (Lines 27-334)
```typescript
// ❌ Hart codierte deutsche Strings
description: 'Einfacher beiger Kasten'
description: 'Bunte Plastik-Front mit LED-Akzenten'  
description: 'Schwarzes Gehäuse mit Neon-Streifen'
"Zurück" // Line 152
"Case Auswahl" // Line 155
"Wählen Sie ein Gehäuse für:" // Line 164
"Gaming Gehäuse" // Line 174
"Büro Gehäuse" // Line 247
"Qualität:" // Line 209
"Design:" // Line 215
"Preis:" // Line 221
```

#### `GameDashboard.tsx` (Lines 293-308)
```typescript
// ❌ Hart codierte Strings (Mobile-spezifisch)
"← Wischen für Navigation →" // Line 293
"Nächste Runde" // Line 308
```

### 📰 News Generation (`news.*`)

#### `NewsContentGenerator.ts` (Lines 77-294)
```typescript
// ❌ 100% deutsche Headlines/Content
headline: 'Computermarkt verzeichnet außergewöhnliches Wachstum im aktuellen Quartal'
content: 'Marktforscher berichten von einem beeindruckenden Anstieg...'
headline: 'Preiskampf zwischen Herstellern führt zu günstigeren Heimcomputern'
// ~50 weitere News Templates
```

### 🔔 Toast Messages (`toast.*`)

#### `SaveGameManager.tsx` (Lines 75-173)
```typescript
// ❌ Deutsche Toast-Nachrichten
toast.error('Supabase ist nicht konfiguriert');
toast.error('Bitte melden Sie sich an, um Spielstände zu verwalten');
toast.success('Spielstand gespeichert!');
toast.error('Fehler beim Speichern des Spielstands');
```

#### `UserProfile.tsx` (Lines 22-27)
```typescript
toast.error('Fehler beim Abmelden: ' + error.message);
toast.success('Erfolgreich abgemeldet');
```

#### `Auth.tsx` (Lines 51-111)
```typescript
toast.error('Bitte E-Mail und Passwort eingeben');
toast.error('Diese E-Mail-Adresse ist bereits registriert...');
toast.success('Registrierung erfolgreich!');
```

### 🏭 Economy System (`economy.*`)

#### Model Types - English Enums ohne Labels
```typescript
// ❌ Brauchen deutsche UI-Labels
type: 'gamer' | 'office'           // → "Gaming" | "Büro"
marketPosition: 'budget' | 'midrange' | 'premium'  // → "Budget" | "Mittelklasse" | "Premium"
segment: 'gamer' | 'business' | 'workstation'      // → "Gaming" | "Business" | "Workstation"
```

### 🐛 Debug Messages (`debug.*`)

#### Console Logs (110 matches across 20 files)
```typescript
// ❌ Mixed DE/EN Debug Messages
console.log('🧮 [EconomyModel] Simulating sales for...');
console.log('✅ ASSERTION: profit = revenue - (bomCosts + ...)');
console.log('✅ ASSERTION: Komponentenpreise sinken automatisch pro Quartal');
console.log('⏰ Obsolescence: 2 quarters old → 70.0% appeal remaining');
```

### 🚨 Browser APIs (`browser.*`)

#### Alert Dialog
```typescript
// ❌ CompanySetup.tsx Line 37
alert(t('company.nameRequired')); // ✅ Bereits I18N, aber alert() sollte toast() sein
```

## Migration Strategy

### Recommended I18N Library
**i18next + ICU MessageFormat**
- ✅ Industry standard, React-optimized  
- ✅ ICU Plurals: `{count, plural, one {# Computer} other {# Computer}}`
- ✅ Variable substitution: `{playerName} hat {count} Modelle entwickelt`
- ✅ Namespace organization
- ✅ Missing key detection

### Key Convention
```typescript
// Namespace.Section.Key format
ui.caseSelection.title = "Case Auswahl"
ui.caseSelection.description = "Wählen Sie ein Gehäuse für: {modelName}"
ui.caseSelection.quality = "Qualität"

news.market.headline.growth = "Computermarkt verzeichnet außergewöhnliches Wachstum"
news.market.content.growth = "Marktforscher berichten von einem..."

toast.auth.loginSuccess = "Erfolgreich angemeldet!"
toast.saveGame.saved = "Spielstand gespeichert!"

economy.segments.gamer = "Gaming"
economy.segments.business = "Business"  
economy.positions.budget = "Budget"
```

### Implementation Batches

#### Batch 1: Static UI Components (2-3h)
- ✅ `CaseSelection.tsx` - 25 strings
- ✅ Mobile strings in `GameDashboard.tsx` - 5 strings  
- ✅ Static badges, labels, headers - ~30 strings
- **Impact:** 60 strings → I18N coverage steigt auf 25%

#### Batch 2: Toast Messages (1-2h)  
- ✅ `SaveGameManager.tsx` - 12 toast calls
- ✅ `UserProfile.tsx` - 4 toast calls
- ✅ `Auth.tsx` - 10 toast calls
- ✅ Replace `alert()` with toast in `CompanySetup.tsx`
- **Impact:** 27 messages → Alle User-facing Notifications I18N

#### Batch 3: News Generation (3-4h)
- ✅ `NewsContentGenerator.ts` - 50+ Headlines/Content
- ✅ `NewsEvents.ts` data structures
- **Impact:** Complete news system I18N → Major user experience improvement

#### Batch 4: Economy Labels (1h)
- ✅ Type mapping für 'gamer'/'office' → "Gaming"/"Büro"  
- ✅ Market positions → "Budget"/"Mittelklasse"/"Premium"
- **Impact:** Consistent German labels in all economic displays

#### Batch 5: Debug Cleanup (0.5h)
- ✅ Console.log standardization (EN only for dev)
- ✅ Remove debug messages from production builds
- **Impact:** Clean production builds, consistent dev experience

## Quality Assurance Plan

### Pre-Migration Tests
- [ ] Screenshot baseline aller UI States (DE/EN)
- [ ] Funktionale Tests: News generation, Toast flows, Navigation
- [ ] Performance baseline: Bundle size, render times

### Post-Migration Validation  
- [ ] Visual regression tests (Screenshots comparison)
- [ ] i18next missing key detection activated
- [ ] Bundle size impact measurement (<5% increase acceptable)
- [ ] Language switching smoke tests

### Rollback Strategy
- [ ] Git branches für jeden Batch
- [ ] Feature flags für neue I18N calls
- [ ] Fallback mechanism for missing keys

## Risks & Mitigation

### 🔴 High Risk
- **News Templates:** Complex content generation logic
  - **Mitigation:** Batch testing with known good data sets
- **Mobile Navigation:** String length changes break layout  
  - **Mitigation:** Responsive design review

### 🟡 Medium Risk  
- **Bundle Size:** i18next adds ~15KB
  - **Mitigation:** Tree shaking, lazy loading for unused locales
- **Performance:** String interpolation overhead
  - **Mitigation:** Memoization for frequently used strings

## Success Metrics

### Coverage Targets
- **Phase 1:** 25% coverage (Static UI)
- **Phase 2:** 50% coverage (+ Toast Messages)  
- **Phase 3:** 85% coverage (+ News Generation)
- **Phase 4:** 95% coverage (+ Economy Labels)
- **Phase 5:** 100% coverage (+ Debug Cleanup)

### Quality Gates
- ✅ Zero missing keys in production
- ✅ <5% bundle size increase  
- ✅ Language switch <200ms response time
- ✅ Visual consistency across DE/EN modes

---

**Next Steps:** Await "Weiter" confirmation to proceed with Phase 2 Implementation