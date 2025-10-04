# i18n Namespace Implementation Report

**Status:** ✅ Complete - Namespace Structure Implemented  
**Date:** 2025-10-04  
**Goal:** Organize all translations into clear namespaces with consistent key naming

## Namespace Structure

### 1. **ui** - User Interface Elements
**Purpose**: Menus, buttons, form labels, tooltips, dialogs  
**Key Pattern**: `ui.section.key`  
**Examples**:
- `ui.dashboard.tabs.overview`
- `ui.caseSelection.title`
- `ui.development.actions.developNewModel`

### 2. **economy** - Economic Data & Reports
**Purpose**: Revenue, profit, costs, price recommendations, reports  
**Key Pattern**: `economy.section.key`  
**Examples**:
- `economy.revenue.total`
- `economy.revenue.profit`
- `economy.market.share`

### 3. **hardware** - Hardware Components
**Purpose**: CPU, RAM, graphics, sound, availability, price decay  
**Key Pattern**: `hardware.component.property`  
**Examples**:
- `hardware.cpu.name`
- `hardware.memory.speed`
- `hardware.availability.status`

### 4. **products** - Product/Model Data ✅ NEW
**Purpose**: Models, revisions, status (in development, released)  
**Key Pattern**: `products.section.key`  
**Examples**:
- `products.status.inDevelopment`
- `products.model.name`
- `products.complexity.simple`

**Translation Keys**: 20+ keys covering status states, model properties, complexity levels, segments and positions.

### 5. **news** - News Articles
**Purpose**: Market/tech news with ICU templates  
**Key Pattern**: `news.category.item`  
**Examples**:
- `news.headlines.marketGrowth`
- `news.content.priceWar`
- `news.months.january`

### 6. **reviews** - Test Reports & Ratings ✅ NEW
**Purpose**: Test reports, ratings, adjectives per domain  
**Key Pattern**: `reviews.section.key`  
**Examples**:
- `reviews.rating.excellent`
- `reviews.summary.office` → "Office performance: {rating}"
- `reviews.adjectives.blazingFast`

**Translation Keys**: 23 keys covering rating scales, performance summaries with ICU, performance categories, descriptive adjectives, and report structure.

### 7. **events** - Market Events ✅ NEW
**Purpose**: RAM shortage, price shocks, R&D breakthroughs  
**Key Pattern**: `events.category.eventType.property`  
**Examples**:
- `events.market.ramShortage.title`
- `events.market.ramShortage.description` → "Global RAM shortage causes price increases of up to {percentage}%"
- `events.technology.breakthrough.impact`

**Translation Keys**: 21 keys covering market events (shortage, price war, demand surge), technology events (breakthrough, standardization), economy events (recession, boom), each with title, description (ICU), and impact.

### 8. **charts** - Chart Components ✅ NEW
**Purpose**: Axis titles, legends, units  
**Key Pattern**: `charts.element.item`  
**Examples**:
- `charts.axis.revenue`
- `charts.legend.profit`
- `charts.units.currency` → "${value}"
- `charts.tooltip.marketShare` → "Market Share: {value}%"

**Translation Keys**: 29 keys covering axis labels, legend items, unit formatters with ICU, trend indicators, and tooltip templates.

### 9. **common** - Shared/Generic
**Purpose**: Date, numbers, units, generic phrases  
**Key Pattern**: `common.category.item`  
**Examples**:
- `common.back`
- `common.units.count` → "{count, plural, one {# unit} other {# units}}"
- `common.quarter` → "{q, selectordinal, one {Q#st} two {Q#nd} few {Q#rd} other {Q#th}} {year}"

## Key Naming Convention

### Pattern: `namespace.section.key`

**Examples**:
```
economy.report.revenue = "Revenue"
economy.report.profit = "Profit"
reviews.summary.office = "Office performance: {rating}"
news.market.recordHigh = "Computer market hits a new high in {quarter}"
events.market.ramShortage.description = "Global RAM shortage causes price increases of up to {percentage}%"
charts.axis.marketShare = "Market Share"
```

### Conventions:
- **camelCase** for keys
- **dot notation** for hierarchy
- **ICU syntax** for plurals, templates, variables
- **Descriptive** section names
- **Consistent** terminology across namespaces

## ICU Message Format Examples

### Plurals:
```json
"common.units.count": "{count, plural, one {# unit} other {# units}}"
```

### Ordinals:
```json
"common.quarter": "{q, selectordinal, one {Q#st} two {Q#nd} few {Q#rd} other {Q#th}} {year}"
```

### Variables:
```json
"reviews.summary.office": "Office performance: {rating}"
"events.market.ramShortage.description": "Global RAM shortage causes price increases of up to {percentage}%"
"charts.tooltip.marketShare": "Market Share: {value}%"
```

### Currency (locale-aware):
```json
"common.units.money": "{amount, number, ::currency/USD}"  // EN
"common.units.money": "{amount, number, ::currency/EUR}"  // DE
```

## File Structure

```
public/locales/
├── en/
│   ├── common.json      (existing, verified)
│   ├── ui.json          (existing, verified)
│   ├── economy.json     (existing, verified)
│   ├── toast.json       (existing)
│   ├── news.json        (existing, verified)
│   ├── hardware.json    (existing, verified)
│   ├── company.json     (existing, verified)
│   ├── game.json        (existing)
│   ├── tutorial.json    (existing)
│   ├── reports.json     (existing)
│   ├── products.json    ✅ NEW
│   ├── reviews.json     ✅ NEW
│   ├── events.json      ✅ NEW
│   └── charts.json      ✅ NEW
└── de/
    └── (same structure)
```

## Usage Examples

### In Components:
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation(['products', 'reviews', 'events', 'charts']);
  
  return (
    <>
      <div>{t('products.status.inDevelopment')}</div>
      <div>{t('reviews.summary.office', { rating: 'Excellent' })}</div>
      <div>{t('events.market.ramShortage.description', { percentage: 25 })}</div>
      <div>{t('charts.tooltip.revenue', { value: '$1.2M' })}</div>
    </>
  );
}
```

### With Multiple Namespaces:
```tsx
const { t } = useTranslation(['ui', 'economy', 'products']);

// Access different namespaces
t('ui.dashboard.tabs.overview')
t('economy.revenue.total')
t('products.status.released')
```

## i18n Configuration

The `src/lib/i18n.ts` includes all namespaces:
```typescript
const NAMESPACES = [
  'common', 'ui', 'economy', 'toast', 'news', 
  'hardware', 'products', 'reviews', 'events', 'charts'
] as const;
```

## Benefits

1. **Clear Separation**: Each namespace has a specific purpose
2. **Consistent Naming**: namespace.section.key pattern throughout
3. **Scalability**: Easy to add new translations
4. **Type Safety**: TypeScript can infer namespaces
5. **ICU Templates**: Proper pluralization and variable interpolation
6. **Maintainability**: Related translations grouped together
7. **Lazy Loading**: Only load needed namespaces

## Translation Counts

| Namespace | EN Keys | DE Keys | Status |
|-----------|---------|---------|--------|
| common    | 13      | 13      | ✅     |
| ui        | 90+     | 90+     | ✅     |
| economy   | 40+     | 40+     | ✅     |
| hardware  | 100+    | 100+    | ✅     |
| news      | 30+     | 30+     | ✅     |
| products  | 20      | 20      | ✅ NEW |
| reviews   | 23      | 23      | ✅ NEW |
| events    | 21      | 21      | ✅ NEW |
| charts    | 29      | 29      | ✅ NEW |
| **Total** | **366+**| **366+**| **✅** |

## Status

- ✅ Namespace structure defined
- ✅ New files created (products, reviews, events, charts)
- ✅ Key naming convention established (namespace.section.key)
- ✅ ICU templates implemented
- ⏳ Component migration in progress
- ⏳ Validation pending

## Next Steps

1. Update components to use new namespaces
2. Migrate old files (company.json, game.json, tutorial.json, reports.json)
3. Run validation tools (i18n:coverage, i18n:lint, i18n:glossary)
4. Generate coverage report