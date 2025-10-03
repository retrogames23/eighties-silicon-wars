# i18n Style Guide & Glossary

## 📖 Purpose

This style guide ensures consistent, professional, and maintainable translations across the entire application. All translators and contributors must follow these guidelines.

---

## 🎯 Core Principles

### 1. Consistency Over Creativity
- Always use glossary terms
- Maintain consistent terminology across all namespaces
- Don't introduce new terms without updating the glossary

### 2. Clarity Over Brevity
- Prefer clear, unambiguous language
- Avoid jargon unless it's in the glossary
- Write for non-technical users when appropriate

### 3. Context-Awareness
- UI text should be concise and actionable
- News/events can be more descriptive
- Technical specs can use domain-specific terms

---

## 📚 Glossary System

### Structure

Glossaries are located at:
- `public/locales/glossary.de.json` (German)
- `public/locales/glossary.en.json` (English)

Each glossary contains:
- **`terms`**: Preferred translations by category
- **`synonyms.avoid`**: Terms to avoid with explanations
- **`style_rules`**: Language-specific formatting rules

### Categories

1. **Business**: Revenue, profit, market share, etc.
2. **Hardware**: Processor, graphics card, RAM, etc.
3. **Products**: Model, revision, segment, etc.
4. **Reviews**: Test report, rating, benchmark, etc.
5. **Events**: Announcement, shortage, price changes, etc.
6. **UI**: Save, load, buttons, navigation, etc.

### Usage

**✅ CORRECT:**
```json
{
  "revenue": "Umsatz",
  "market_share": "Marktanteil",
  "in_development": "in Entwicklung"
}
```

**❌ INCORRECT:**
```json
{
  "revenue": "Einnahmen",  // ❌ Not in glossary
  "market_share": "Markt Anteil",  // ❌ Wrong format
  "in_development": "wird entwickelt"  // ❌ Inconsistent
}
```

---

## 🇩🇪 German (de) Style Rules

### Capitalization
- **Nouns**: Always capitalized (`Unternehmen`, `Computer`, `Marktanteil`)
- **Verbs**: Lowercase unless at sentence start (`speichern`, `laden`)
- **Compound nouns**: One word (`Grafikkarte`, not `Grafik Karte`)

### Formality
- **UI text**: Use Sie-Form (formal you)
  - ✅ "Speichern Sie Ihr Spiel"
  - ❌ "Speichere dein Spiel"
- **News/Events**: Neutral, third-person
  - ✅ "Der Markt zeigt starkes Wachstum"
  - ❌ "Ihr Markt wächst stark"

### Punctuation
- **Headings**: No periods
- **Button labels**: No periods
- **Full sentences**: Proper punctuation
- **Lists**: No periods unless multi-sentence items

### Tone
- Sachlich (factual)
- Neutral (unbiased)
- Informativ (informative)
- Professional but not overly formal

### Common Mistakes

❌ **AVOID:**
- "Firma" → ✅ Use "Unternehmen"
- "Rechner" → ✅ Use "Computer"
- "Tests" → ✅ Use "Testbericht" or "Test" consistently
- "Grafik" → ✅ Use "Grafikkarte"
- Mixed singular/plural → ✅ Be consistent

---

## 🇬🇧 English (en) Style Rules

### Capitalization
- **Sentence case**: For most UI text
  - ✅ "Save game"
  - ❌ "Save Game"
- **Title case**: For headings and section titles
  - ✅ "Market Analysis Report"
  - ❌ "Market analysis report"
- **Button labels**: Sentence case
  - ✅ "Continue"
  - ❌ "CONTINUE"

### Formality
- **Direct address**: Use "you" for UI
  - ✅ "Save your game"
  - ❌ "The user may save the game"
- **News/Events**: Third-person, professional
  - ✅ "The market shows strong growth"
  - ❌ "You see strong market growth"

### Punctuation
- **Headings**: No periods
- **Button labels**: No periods
- **Full sentences**: Proper punctuation
- **Oxford comma**: Use consistently
  - ✅ "CPU, RAM, and storage"
  - ❌ "CPU, RAM and storage"

### Tone
- Professional
- Clear and concise
- Informative
- Friendly but not casual

### Common Mistakes

❌ **AVOID:**
- "firm" → ✅ Use "company"
- "PC" → ✅ Use "computer" (unless technical context)
- "GPU" → ✅ Use "graphics card" in text, "GPU" in specs
- British/American mixing → ✅ Use American English consistently
  - ✅ "color", "analyze", "organize"
  - ❌ "colour", "analyse", "organise"

---

## 🔧 Technical Terminology

### When to Use Abbreviations

**Always spell out in UI text:**
- ✅ "Random Access Memory (RAM)"
- ❌ "RAM" (on first use)

**Use abbreviations in:**
- Technical specifications
- Hardware lists
- After first definition
- When space is very limited

### Units & Numbers

**German:**
- Decimal: `,` (comma) → `3,5 GHz`
- Thousands: `.` (period) → `1.000 MB`
- Currency: `1.234,56 €`
- Percentages: `45,5 %` (space before %)

**English:**
- Decimal: `.` (period) → `3.5 GHz`
- Thousands: `,` (comma) → `1,000 MB`
- Currency: `$1,234.56`
- Percentages: `45.5%` (no space)

---

## ✅ Validation

### Automated Checks

Run glossary validation:
```bash
npm run i18n:glossary
```

This checks:
- ✅ Avoided synonyms are not used
- ✅ Preferred terms are consistent
- ✅ No terminology violations

### Manual Review Checklist

Before submitting translations:

- [ ] All terms match glossary
- [ ] Capitalization follows rules
- [ ] Punctuation is consistent
- [ ] Tone is appropriate for context
- [ ] No mixing of formal/informal
- [ ] Numbers and units formatted correctly
- [ ] No hardcoded values (use variables)
- [ ] Context makes sense for users

---

## 📋 Translation Workflow

### Adding New Terms

1. **Check glossary first** - Is the term already defined?
2. **If new**, add to both `glossary.de.json` and `glossary.en.json`
3. **Categorize properly** - Which category does it belong to?
4. **Document usage** - Add to style guide if needed
5. **Validate** - Run `npm run i18n:glossary`

### Updating Translations

1. **Read context** - Understand where the text appears
2. **Check glossary** - Use preferred terms
3. **Follow style rules** - Capitalization, punctuation, tone
4. **Test in UI** - See how it looks in the app
5. **Validate** - Run validation scripts

### Reviewing Translations

1. **Consistency** - Compare with existing translations
2. **Accuracy** - Does it convey the right meaning?
3. **Style** - Follows all style rules?
4. **Context** - Makes sense in the UI?
5. **Glossary** - All terms correct?

---

## 🎨 Context-Specific Guidelines

### News & Events

**Style:**
- Professional journalism tone
- Third-person perspective
- Present tense for current events
- Past tense for historical events

**German Example:**
```json
{
  "headline": "Knappheit bei Grafikkarten treibt Preise",
  "body": "Der Markt für Grafikkarten erlebt derzeit eine Knappheit. Die Preise sind um 25 % gestiegen."
}
```

**English Example:**
```json
{
  "headline": "Graphics Card Shortage Drives Prices Up",
  "body": "The graphics card market is experiencing a shortage. Prices have increased by 25%."
}
```

### Test Reports

**Style:**
- Analytical, objective tone
- Technical terminology appropriate
- Structured format (pros/cons)
- Clear verdict

**German Example:**
```json
{
  "verdict": "Ausgezeichnete Leistung im Premium-Segment",
  "pros": ["Hohe Qualität", "Starke Leistung"],
  "cons": ["Hoher Preis", "Begrenzte Verfügbarkeit"]
}
```

**English Example:**
```json
{
  "verdict": "Excellent performance in the premium segment",
  "pros": ["High quality", "Strong performance"],
  "cons": ["High price", "Limited availability"]
}
```

### UI Elements

**Style:**
- Concise and actionable
- Clear hierarchy
- Consistent terminology
- User-friendly language

**German Example:**
```json
{
  "save_button": "Speichern",
  "save_success": "Spiel erfolgreich gespeichert",
  "save_error": "Fehler beim Speichern"
}
```

**English Example:**
```json
{
  "save_button": "Save",
  "save_success": "Game saved successfully",
  "save_error": "Error saving game"
}
```

---

## 🚨 Common Violations

### High Priority (Must Fix)

1. **Using avoided synonyms**
   - ❌ "Firma" in German
   - ✅ "Unternehmen"

2. **Inconsistent terminology**
   - ❌ "Test" and "Review" interchangeably
   - ✅ Pick one and use consistently

3. **Wrong formality**
   - ❌ "Du kannst speichern" in UI
   - ✅ "Sie können speichern"

4. **Capitalization errors**
   - ❌ "computer" in German
   - ✅ "Computer"

### Medium Priority (Should Fix)

1. **Inconsistent punctuation**
2. **Unclear abbreviations**
3. **Tone inconsistency**
4. **Number formatting**

### Low Priority (Nice to Fix)

1. **Slight wording variations**
2. **Minor style inconsistencies**
3. **Optimization for space**

---

## 📖 Resources

- **Glossaries**: `public/locales/glossary.{de,en}.json`
- **Validator**: `scripts/i18n-glossary-validator.js`
- **Coverage Check**: `scripts/i18n-coverage.js`
- **Lint Check**: `scripts/i18n-lint.js`

### Quick Commands

```bash
# Validate glossary compliance
npm run i18n:glossary

# Check translation coverage
npm run i18n:coverage

# Detect German text in EN
npm run i18n:lint

# Run all i18n checks
npm run i18n:check
```

---

## 🎓 Examples Library

### Perfect Translation Pairs

**Business Context:**
```json
// DE
{
  "quarterly_revenue": "Quartalsumsatz: {amount}",
  "market_share": "Marktanteil: {percentage}",
  "profit_margin": "Gewinnmarge: {percentage}"
}

// EN
{
  "quarterly_revenue": "Quarterly revenue: {amount}",
  "market_share": "Market share: {percentage}",
  "profit_margin": "Profit margin: {percentage}"
}
```

**Hardware Context:**
```json
// DE
{
  "cpu_performance": "CPU-Leistung: {score} Punkte",
  "graphics_quality": "Grafikqualität: {rating}/10",
  "storage_capacity": "Speicherkapazität: {size} GB"
}

// EN
{
  "cpu_performance": "CPU performance: {score} points",
  "graphics_quality": "Graphics quality: {rating}/10",
  "storage_capacity": "Storage capacity: {size} GB"
}
```

---

## 📞 Questions?

When in doubt:
1. Check the glossary first
2. Look for similar existing translations
3. Run the validator
4. Ask for review if unsure

**Remember:** Consistency is more valuable than perfection!

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-03  
**Status:** ✅ Active
