#!/usr/bin/env node

/**
 * I18N Codemod Script for Static String Migration
 * Usage: node scripts/i18n-codemod.js <namespace> <file-pattern>
 * Example: node scripts/i18n-codemod.js ui "src/components/CompanyAccount.tsx"
 */

const fs = require('fs');
const path = require('path');

// Domain glossary for DE→EN translation
const GLOSSARY = {
  // Economy & Finance
  'Gewinn': 'profit',
  'Umsatz': 'revenue',
  'Gesamtumsatz': 'totalRevenue',
  'Einnahmen': 'income',
  'Ausgaben': 'expenses',
  'Kosten': 'costs',
  'Budget': 'budget',
  'Quartal': 'quarter',
  'Wachstum': 'growth',
  'Marktanteil': 'marketShare',
  'Durchschnittspreis': 'averagePrice',
  
  // Development & Technology
  'Entwicklung': 'development',
  'Verfügbarkeit': 'availability',
  'Revision': 'revision',
  'Testbericht': 'review',
  'Knappheit': 'shortage',
  'Performance': 'performance',
  'Spezifikation': 'specification',
  'Komponente': 'component',
  
  // Business Operations
  'Marketing': 'marketing',
  'Forschung': 'research',
  'Produktion': 'production',
  'Verkauf': 'sales',
  'Verwaltung': 'management',
  'Mitarbeiter': 'employees',
  'Reputation': 'reputation',
  
  // Status & UI
  'In Entwicklung': 'inDevelopment',
  'Verfügbar': 'available',
  'Eingestellt': 'discontinued',
  'Übersicht': 'overview',
  'Details': 'details',
  'Status': 'status',
  'Fortschritt': 'progress',
  'Ergebnis': 'result',
  'Bericht': 'report',
  'Analyse': 'analysis',
  'Einstellung': 'setting',
  'Marktanalyse': 'marketAnalysis',
  'Aktuelle Marktlage und Konkurrenz': 'currentMarketSituation',
  
  // Specific UI Labels
  'Marketing-Budget': 'marketingBudget',
  'Entwicklungskosten': 'developmentCosts',
  'Forschungsbudget': 'researchBudget',
  'Hardware-Verkäufe': 'hardwareSales',
  'Software-Lizenzen': 'softwareLicenses',
  'Support-Service': 'supportService',
  'Verkaufte Einheiten': 'unitsSold',
  'Neue Modelle': 'newModels',
  'Marktposition': 'marketPosition'
};

// Namespace-specific key prefixes
const NAMESPACE_PREFIXES = {
  ui: 'ui',
  economy: 'economy',
  hardware: 'hardware',
  common: 'common'
};

class I18nCodemod {
  constructor(namespace) {
    this.namespace = namespace;
    this.extractedStrings = new Map(); // German → Key mapping
    this.translations = { de: {}, en: {} };
  }

  /**
   * Convert German string to camelCase key
   */
  generateKey(germanString, section = 'general') {
    // Remove quotes and trim
    const clean = germanString.replace(/['"]/g, '').trim();
    
    // Direct glossary lookup
    if (GLOSSARY[clean]) {
      return GLOSSARY[clean];
    }
    
    // Generate camelCase key
    const key = clean
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe') 
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .filter(word => word.length > 0)
      .map((word, index) => 
        index === 0 
          ? word.toLowerCase() 
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
      
    return key || 'unknownKey';
  }

  /**
   * Generate English translation using glossary or fallback
   */
  generateEnglishTranslation(germanString) {
    const clean = germanString.replace(/['"]/g, '').trim();
    
    // Direct lookup in glossary  
    for (const [de, en] of Object.entries(GLOSSARY)) {
      if (clean === de) {
        return en.charAt(0).toUpperCase() + en.slice(1);
      }
    }
    
    // Fallback: keep original for manual review
    return `TODO: ${clean}`;
  }

  /**
   * Detect hard-coded German strings in code
   */
  extractStrings(code) {
    // Pattern: String literals with German content (4+ chars, no CSS)
    const stringPattern = /(['"`])([^'"`]*[äöüßÄÖÜ][^'"`]*|[^'"`]*[A-ZÄÖÜ][a-zäöüß]{3,}[^'"`]*)\1/g;
    
    // Exclude CSS properties, className values, technical strings
    const excludePatterns = [
      /className\s*=\s*['"`]/,
      /style\s*=\s*['"`]/,
      /pixelArt\s*=\s*['"`]/,
      /\b(?:px|rem|em|vh|vw|%|deg|opacity|rgba?|hsla?)\b/,
      /^[\w-]+$/,  // CSS class names
      /^\$\{.*\}$/, // Template literals
    ];
    
    const matches = [];
    let match;
    
    while ((match = stringPattern.exec(code)) !== null) {
      const fullMatch = match[0];
      const stringContent = match[2];
      const position = match.index;
      
      // Get surrounding context to check for exclusions
      const lineStart = code.lastIndexOf('\n', position) + 1;
      const lineEnd = code.indexOf('\n', position);
      const lineContext = code.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
      
      // Skip if matches exclusion patterns
      const shouldExclude = excludePatterns.some(pattern => 
        pattern.test(lineContext) || pattern.test(stringContent)
      );
      
      if (!shouldExclude && stringContent.length >= 4) {
        matches.push({
          match: fullMatch,
          content: stringContent,
          position,
          line: code.slice(0, position).split('\n').length
        });
      }
    }
    
    return matches;
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    console.log(`Processing: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return false;
    }
    
    const originalCode = fs.readFileSync(filePath, 'utf-8');
    let modifiedCode = originalCode;
    
    const extractedStrings = this.extractStrings(originalCode);
    
    if (extractedStrings.length === 0) {
      console.log(`  No strings found to migrate`);
      return false;
    }
    
    console.log(`  Found ${extractedStrings.length} strings to migrate`);
    
    // Group strings by likely section
    const sections = this.groupStringsBySection(extractedStrings, filePath);
    
    // Process strings from end to beginning (preserve positions)
    const sortedStrings = extractedStrings.sort((a, b) => b.position - a.position);
    
    for (const stringInfo of sortedStrings) {
      const { match, content } = stringInfo;
      const section = this.determineSectionForString(content, filePath);
      const key = this.generateKey(content, section);
      const fullKey = `${this.namespace}.${section}.${key}`;
      
      // Store translations
      this.translations.de[`${section}.${key}`] = content;
      this.translations.en[`${section}.${key}`] = this.generateEnglishTranslation(content);
      
      // Replace in code: "string" → {t('namespace.section.key')}
      const replacement = `{t('${fullKey}')}`;
      modifiedCode = modifiedCode.replace(match, replacement);
      
      console.log(`    "${content}" → t('${fullKey}')`);
    }
    
    // Add useTranslation import if not present
    if (extractedStrings.length > 0 && !originalCode.includes('useTranslation')) {
      const importMatch = modifiedCode.match(/import.*from ['"]react['"];?\n/);
      if (importMatch) {
        const insertPosition = importMatch.index + importMatch[0].length;
        const importStatement = `import { useTranslation } from 'react-i18next';\n`;
        modifiedCode = modifiedCode.slice(0, insertPosition) + importStatement + modifiedCode.slice(insertPosition);
      }
    }
    
    // Add useTranslation hook if not present  
    if (extractedStrings.length > 0 && !originalCode.includes('const { t }')) {
      const componentMatch = modifiedCode.match(/export const \w+.*?=.*?\{/);
      if (componentMatch) {
        const insertPosition = componentMatch.index + componentMatch[0].length;
        const hookStatement = `\n  const { t } = useTranslation(['${this.namespace}', 'common']);`;
        modifiedCode = modifiedCode.slice(0, insertPosition) + hookStatement + modifiedCode.slice(insertPosition);
      }
    }
    
    // Write modified file
    fs.writeFileSync(filePath, modifiedCode, 'utf-8');
    console.log(`  ✅ Updated ${filePath}`);
    
    return true;
  }

  /**
   * Group strings by likely section based on content analysis
   */
  groupStringsBySection(extractedStrings, filePath) {
    const sections = {};
    
    for (const stringInfo of extractedStrings) {
      const section = this.determineSectionForString(stringInfo.content, filePath);
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push(stringInfo);
    }
    
    return sections;
  }

  /**
   * Determine section based on string content and file context
   */
  determineSectionForString(content, filePath) {
    const filename = path.basename(filePath, '.tsx');
    
    // Economy namespace sections
    if (this.namespace === 'economy') {
      if (content.includes('Budget') || content.includes('Ausgaben') || content.includes('Kosten') || content.includes('Allokation')) {
        return 'budget';
      }
      if (content.includes('Markt') || content.includes('Konkurrenz') || content.includes('Analyse') || content.includes('Trend')) {
        return 'market';
      }
      if (content.includes('Preis') || content.includes('Kosten') || content.includes('Segment')) {
        return 'pricing';
      }
      if (content.includes('Wachstum') || content.includes('Quartal') || content.includes('Volumen')) {
        return 'metrics';
      }
      return 'general';
    }
    
    // Company-specific sections
    if (filename.includes('Company')) {
      if (content.includes('Budget') || content.includes('kosten') || content.includes('Ausgaben')) {
        return 'expenses';
      }
      if (content.includes('Umsatz') || content.includes('Einnahmen') || content.includes('Revenue')) {
        return 'income';
      }
      return 'account';
    }
    
    // Development-specific sections
    if (filename.includes('Development') || content.includes('Entwicklung')) {
      if (content.includes('Status') || content === 'In Entwicklung' || content === 'Verfügbar') {
        return 'status';
      }
      return 'development';
    }
    
    // Hardware namespace sections
    if (this.namespace === 'hardware') {
      if (content.includes('Verfügbar') || content.includes('verfügbar') || content.includes('Entwicklung') || content.includes('freigeschaltet')) {
        return 'availability';
      }
      if (content.includes('Leistung') || content.includes('Performance') || content.includes('Punkte')) {
        return 'performance';
      }
      if (content.includes('Prozessor') || content.includes('Grafik') || content.includes('Arbeitsspeicher') || content.includes('Sound') || content.includes('Zubehör')) {
        return 'types';
      }
      if (content.includes('Komponente') || content.includes('Computer-Entwicklung') || content.includes('Auswahl')) {
        return 'components';
      }
      return 'announcement';
    }
    
    // Market-specific sections
    if (filename.includes('Market') || content.includes('Markt')) {
      return 'market';
    }
    
    return 'general';
  }

  /**
   * Save translation files
   */
  saveTranslations() {
    const deFile = `public/locales/de/${this.namespace}.json`;
    const enFile = `public/locales/en/${this.namespace}.json`;
    
    // Ensure directories exist
    const deDir = path.dirname(deFile);
    const enDir = path.dirname(enFile);
    
    if (!fs.existsSync(deDir)) {
      fs.mkdirSync(deDir, { recursive: true });
    }
    
    if (!fs.existsSync(enDir)) {
      fs.mkdirSync(enDir, { recursive: true });
    }
    
    // Load existing translations
    let existingDe = {};
    let existingEn = {};
    
    if (fs.existsSync(deFile)) {
      existingDe = JSON.parse(fs.readFileSync(deFile, 'utf-8'));
    }
    
    if (fs.existsSync(enFile)) {
      existingEn = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
    }
    
    // Merge with new translations (nested structure)
    const mergedDe = this.mergeTranslations(existingDe, this.translations.de);
    const mergedEn = this.mergeTranslations(existingEn, this.translations.en);
    
    // Save files
    fs.writeFileSync(deFile, JSON.stringify(mergedDe, null, 2), 'utf-8');
    fs.writeFileSync(enFile, JSON.stringify(mergedEn, null, 2), 'utf-8');
    
    console.log(`✅ Saved translations: ${deFile}, ${enFile}`);
  }

  /**
   * Merge nested translation objects
   */
  mergeTranslations(existing, newTranslations) {
    const result = { ...existing };
    
    for (const [dotKey, value] of Object.entries(newTranslations)) {
      const keys = dotKey.split('.');
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
    }
    
    return result;
  }
}

// CLI Usage
if (require.main === module) {
  const [,, namespace, filePattern] = process.argv;
  
  if (!namespace) {
    console.error('Usage: node scripts/i18n-codemod.js <namespace> [file-pattern]');
    console.error('Example: node scripts/i18n-codemod.js economy');
    process.exit(1);
  }
  
  const codemod = new I18nCodemod(namespace);
  
  // Define target files based on namespace
  let files = [];
  if (namespace === 'economy') {
    files = [
      'src/components/CompanyManagement.tsx',
      'src/components/MarketTab.tsx'
    ];
  } else if (namespace === 'hardware') {
    files = [
      'src/components/HardwareAnnouncement.tsx',
      'src/components/ComputerDevelopment.tsx'
    ];
  } else if (filePattern) {
    files = [filePattern];
  } else {
    console.error('File pattern required for non-economy/hardware namespaces');
    process.exit(1);
  }
  
  let processedCount = 0;
  
  for (const file of files) {
    if (codemod.processFile(file)) {
      processedCount++;
    }
  }
  
  if (processedCount > 0) {
    codemod.saveTranslations();
    console.log(`\n✅ Migration complete: ${processedCount} files processed for '${namespace}' namespace`);
  } else {
    console.log('\n⚠️ No files were modified');
  }
}

module.exports = I18nCodemod;
