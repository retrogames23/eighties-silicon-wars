#!/usr/bin/env node

/**
 * i18n Glossary Validator (Dev-Only)
 * Validates translations against glossary for consistent terminology
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../public/locales');
const LANGUAGES = ['de', 'en'];

// Namespaces to validate against glossary
const VALIDATED_NAMESPACES = ['news', 'reports', 'hardware', 'economy'];

let hasErrors = false;
let hasWarnings = false;
let validationReport = {
  violations: [],
  warnings: [],
  summary: { files: 0, violations: 0, warnings: 0 }
};

/**
 * Load glossary for a language
 */
function loadGlossary(lang) {
  const glossaryPath = path.join(LOCALES_DIR, `glossary.${lang}.json`);
  try {
    const content = fs.readFileSync(glossaryPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Failed to load glossary.${lang}.json: ${error.message}`);
    return null;
  }
}

/**
 * Load translation file
 */
function loadTranslations(lang, namespace) {
  const filePath = path.join(LOCALES_DIR, lang, `${namespace}.json`);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null; // File may not exist for this namespace
  }
}

/**
 * Get all string values from object recursively
 */
function getAllStrings(obj, keyPath = '') {
  let strings = [];
  for (const key in obj) {
    const fullPath = keyPath ? `${keyPath}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      strings = strings.concat(getAllStrings(obj[key], fullPath));
    } else if (typeof obj[key] === 'string') {
      strings.push({ key: fullPath, value: obj[key] });
    }
  }
  return strings;
}

/**
 * Normalize text for comparison (lowercase, remove punctuation)
 */
function normalizeText(text) {
  return text.toLowerCase()
    .replace(/[.,;:!?()[\]{}'"]/g, '')
    .trim();
}

/**
 * Check if text contains avoided synonyms
 */
function checkSynonyms(text, glossary, lang, namespace, keyPath) {
  const avoidTerms = glossary.synonyms?.avoid || {};
  const normalized = normalizeText(text);
  
  for (const [avoidedTerm, suggestion] of Object.entries(avoidTerms)) {
    const avoidedNormalized = normalizeText(avoidedTerm);
    
    // Check for whole word matches
    const regex = new RegExp(`\\b${avoidedNormalized}\\b`, 'i');
    if (regex.test(normalized)) {
      validationReport.violations.push({
        lang,
        namespace,
        key: keyPath,
        issue: 'synonym_violation',
        found: avoidedTerm,
        suggestion,
        text: text.substring(0, 100)
      });
      hasErrors = true;
    }
  }
}

/**
 * Check if text uses preferred glossary terms
 */
function checkGlossaryUsage(text, glossary, lang, namespace, keyPath) {
  const allTerms = glossary.terms || {};
  const normalized = normalizeText(text);
  
  // Build list of preferred terms from glossary
  const preferredTerms = [];
  for (const category of Object.values(allTerms)) {
    for (const [concept, preferredTerm] of Object.entries(category)) {
      preferredTerms.push({
        concept,
        preferred: normalizeText(preferredTerm),
        display: preferredTerm
      });
    }
  }
  
  // Check for potential inconsistencies (warning only, not error)
  // This is a heuristic check for common variations
  const commonVariations = {
    de: [
      { variations: ['firma', 'betrieb'], preferred: 'Unternehmen' },
      { variations: ['rechner', 'pc'], preferred: 'Computer' },
      { variations: ['grafik', 'gpu'], preferred: 'Grafikkarte' },
    ],
    en: [
      { variations: ['firm', 'corporation'], preferred: 'company' },
      { variations: ['pc', 'machine'], preferred: 'computer' },
      { variations: ['gpu'], preferred: 'graphics card' },
    ]
  };
  
  const langVariations = commonVariations[lang] || [];
  for (const { variations, preferred } of langVariations) {
    for (const variant of variations) {
      const regex = new RegExp(`\\b${variant}\\b`, 'i');
      if (regex.test(normalized)) {
        validationReport.warnings.push({
          lang,
          namespace,
          key: keyPath,
          issue: 'potential_inconsistency',
          found: variant,
          suggestion: `Consider using glossary term: ${preferred}`,
          text: text.substring(0, 100)
        });
        hasWarnings = true;
      }
    }
  }
}

/**
 * Validate namespace translations against glossary
 */
function validateNamespace(lang, namespace) {
  const glossary = loadGlossary(lang);
  if (!glossary) {
    return;
  }
  
  const translations = loadTranslations(lang, namespace);
  if (!translations) {
    return;
  }
  
  validationReport.summary.files++;
  
  const strings = getAllStrings(translations);
  
  for (const { key, value } of strings) {
    // Check for avoided synonyms (errors)
    checkSynonyms(value, glossary, lang, namespace, key);
    
    // Check for glossary term usage (warnings)
    checkGlossaryUsage(value, glossary, lang, namespace, key);
  }
}

/**
 * Print glossary summary
 */
function printGlossarySummary(lang) {
  const glossary = loadGlossary(lang);
  if (!glossary) return;
  
  const termCount = Object.values(glossary.terms || {})
    .reduce((sum, category) => sum + Object.keys(category).length, 0);
  const avoidCount = Object.keys(glossary.synonyms?.avoid || {}).length;
  
  console.log(`  📚 ${lang.toUpperCase()}: ${termCount} preferred terms, ${avoidCount} avoided synonyms`);
}

/**
 * Main execution
 */
console.log('🔍 i18n Glossary Validator');
console.log('='.repeat(50));
console.log('📖 Loading glossaries...\n');

for (const lang of LANGUAGES) {
  printGlossarySummary(lang);
}

console.log('\n🔎 Validating translations against glossary...\n');

for (const lang of LANGUAGES) {
  for (const namespace of VALIDATED_NAMESPACES) {
    validateNamespace(lang, namespace);
  }
}

// Report violations
if (validationReport.violations.length > 0) {
  console.log('\n❌ Glossary Violations Found:\n');
  
  for (const violation of validationReport.violations) {
    console.log(`📄 ${violation.lang}/${violation.namespace}.json`);
    console.log(`  Key: ${violation.key}`);
    console.log(`  ❌ Found: "${violation.found}"`);
    console.log(`  💡 ${violation.suggestion}`);
    console.log(`  Context: "${violation.text}"`);
    console.log('');
  }
  
  validationReport.summary.violations = validationReport.violations.length;
}

// Report warnings
if (validationReport.warnings.length > 0) {
  console.log('\n⚠️  Potential Inconsistencies (Warnings):\n');
  
  // Group warnings by namespace
  const byNamespace = {};
  for (const warning of validationReport.warnings) {
    const key = `${warning.lang}/${warning.namespace}`;
    if (!byNamespace[key]) byNamespace[key] = [];
    byNamespace[key].push(warning);
  }
  
  for (const [namespace, warnings] of Object.entries(byNamespace)) {
    console.log(`📄 ${namespace}.json (${warnings.length} warnings)`);
    warnings.slice(0, 3).forEach(w => {
      console.log(`  ⚠️  ${w.key}: "${w.found}" → ${w.suggestion}`);
    });
    if (warnings.length > 3) {
      console.log(`  ... and ${warnings.length - 3} more warnings`);
    }
    console.log('');
  }
  
  validationReport.summary.warnings = validationReport.warnings.length;
}

// Final summary
console.log('='.repeat(50));
console.log('📊 Validation Summary');
console.log('='.repeat(50));
console.log(`Files validated: ${validationReport.summary.files}`);
console.log(`Violations (errors): ${validationReport.summary.violations}`);
console.log(`Warnings: ${validationReport.summary.warnings}`);

if (hasErrors) {
  console.log('\n❌ Glossary validation failed!');
  console.log('💡 Fix violations by using preferred terms from glossary.json');
  process.exit(1);
} else if (hasWarnings) {
  console.log('\n⚠️  Validation passed with warnings');
  console.log('💡 Review warnings to ensure consistent terminology');
  process.exit(0);
} else {
  console.log('\n✅ All translations follow glossary! Perfect consistency.');
  process.exit(0);
}
