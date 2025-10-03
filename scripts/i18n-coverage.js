#!/usr/bin/env node

/**
 * i18n Coverage Check
 * Verifies that all translation keys exist in both de and en
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../public/locales');
const LANGUAGES = ['de', 'en'];
const NAMESPACES = ['common', 'ui', 'economy', 'toast', 'news', 'hardware', 'reports', 'game', 'tutorial', 'company'];

let hasErrors = false;
let totalKeys = 0;
let coverageReport = {
  namespaces: {},
  summary: { total: 0, missing: 0, coverage: 100 }
};

/**
 * Get all keys from a JSON object recursively
 */
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
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
    console.error(`❌ Failed to load ${lang}/${namespace}.json: ${error.message}`);
    return null;
  }
}

/**
 * Check coverage for a namespace
 */
function checkNamespaceCoverage(namespace) {
  console.log(`\n📦 Checking namespace: ${namespace}`);
  
  const translations = {};
  const keys = {};
  
  // Load all translations
  for (const lang of LANGUAGES) {
    translations[lang] = loadTranslations(lang, namespace);
    if (!translations[lang]) {
      hasErrors = true;
      return;
    }
    keys[lang] = getAllKeys(translations[lang]);
  }
  
  // Find missing keys
  const missingKeys = {};
  for (const lang of LANGUAGES) {
    missingKeys[lang] = [];
    const otherLangs = LANGUAGES.filter(l => l !== lang);
    
    for (const otherLang of otherLangs) {
      const missing = keys[otherLang].filter(key => !keys[lang].includes(key));
      missingKeys[lang].push(...missing);
    }
  }
  
  // Report results
  let namespaceTotalKeys = 0;
  let namespaceMissingKeys = 0;
  
  for (const lang of LANGUAGES) {
    namespaceTotalKeys += keys[lang].length;
    const uniqueMissing = [...new Set(missingKeys[lang])];
    namespaceMissingKeys += uniqueMissing.length;
    
    if (uniqueMissing.length > 0) {
      console.log(`  ❌ ${lang}: Missing ${uniqueMissing.length} keys`);
      uniqueMissing.forEach(key => console.log(`     - ${key}`));
      hasErrors = true;
    } else {
      console.log(`  ✅ ${lang}: All keys present (${keys[lang].length} keys)`);
    }
  }
  
  const coverage = namespaceTotalKeys > 0 
    ? ((namespaceTotalKeys - namespaceMissingKeys) / namespaceTotalKeys * 100).toFixed(2)
    : 100;
  
  coverageReport.namespaces[namespace] = {
    total: namespaceTotalKeys,
    missing: namespaceMissingKeys,
    coverage: parseFloat(coverage)
  };
  
  totalKeys += namespaceTotalKeys;
}

/**
 * Main execution
 */
console.log('🔍 i18n Coverage Check');
console.log('='.repeat(50));

for (const namespace of NAMESPACES) {
  checkNamespaceCoverage(namespace);
}

// Calculate overall coverage
const totalMissing = Object.values(coverageReport.namespaces).reduce((sum, ns) => sum + ns.missing, 0);
const overallCoverage = totalKeys > 0 
  ? ((totalKeys - totalMissing) / totalKeys * 100).toFixed(2)
  : 100;

coverageReport.summary = {
  total: totalKeys,
  missing: totalMissing,
  coverage: parseFloat(overallCoverage)
};

// Final report
console.log('\n' + '='.repeat(50));
console.log('📊 Coverage Summary');
console.log('='.repeat(50));
console.log(`Total translation keys: ${totalKeys}`);
console.log(`Missing translations: ${totalMissing}`);
console.log(`Overall coverage: ${overallCoverage}%`);

if (hasErrors) {
  console.log('\n❌ Coverage check failed! Please add missing translations.');
  process.exit(1);
} else {
  console.log('\n✅ All translations present! Coverage: 100%');
  process.exit(0);
}
