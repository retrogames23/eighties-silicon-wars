#!/usr/bin/env node

/**
 * i18n Lint - Detect German text in English builds
 * Scans source files for German characters and common German words
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src');
const PUBLIC_LOCALES_DIR = path.join(__dirname, '../public/locales/en');

// German patterns to detect
const GERMAN_PATTERNS = [
  // German characters
  { pattern: /[äöüßÄÖÜ]/g, name: 'German characters (ä, ö, ü, ß)' },
  
  // Common German words (as whole words)
  { pattern: /\bund\b/gi, name: 'German word: und' },
  { pattern: /\boder\b/gi, name: 'German word: oder' },
  { pattern: /\bGewinn\b/g, name: 'German word: Gewinn' },
  { pattern: /\bUmsatz\b/g, name: 'German word: Umsatz' },
  { pattern: /\bPreis\b/g, name: 'German word: Preis' },
  { pattern: /\bVerfügbarkeit\b/g, name: 'German word: Verfügbarkeit' },
  { pattern: /\bQuartal\b/g, name: 'German word: Quartal' },
  { pattern: /\bKnappheit\b/g, name: 'German word: Knappheit' },
  { pattern: /\bRevision\b/g, name: 'German word: Revision' },
  { pattern: /\bTestbericht\b/g, name: 'German word: Testbericht' },
  { pattern: /\bFirma\b/g, name: 'German word: Firma' },
  { pattern: /\bUnternehmen\b/g, name: 'German word: Unternehmen' },
  { pattern: /\bEntwicklung\b/g, name: 'German word: Entwicklung' },
  { pattern: /\bMarkt\b/g, name: 'German word: Markt' },
  { pattern: /\bProdukt\b/g, name: 'German word: Produkt' },
  { pattern: /\bVerkauf\b/g, name: 'German word: Verkauf' },
];

const EXCLUDED_PATTERNS = [
  /node_modules/,
  /\.test\./,
  /\.spec\./,
  /i18n/,
  /LanguageContext/,
  /locales/,
];

let hasErrors = false;
let filesScanned = 0;
let issuesFound = [];

/**
 * Check if file should be excluded
 */
function shouldExcludeFile(filePath) {
  return EXCLUDED_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Scan file for German text
 */
function scanFile(filePath) {
  if (shouldExcludeFile(filePath)) {
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    filesScanned++;

    for (const { pattern, name } of GERMAN_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        // Get line numbers
        const lines = content.split('\n');
        const lineNumbers = [];
        
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            lineNumbers.push({
              line: index + 1,
              content: line.trim().substring(0, 80)
            });
          }
        });

        issuesFound.push({
          file: path.relative(process.cwd(), filePath),
          pattern: name,
          count: matches.length,
          lines: lineNumbers
        });
        
        hasErrors = true;
      }
    }
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`);
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!shouldExcludeFile(fullPath)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

/**
 * Scan English translation files specifically
 */
function scanEnglishTranslations() {
  console.log('\n🔍 Scanning English translation files...');
  
  if (!fs.existsSync(PUBLIC_LOCALES_DIR)) {
    console.log('  ⚠️  No English translations found');
    return;
  }

  const files = fs.readdirSync(PUBLIC_LOCALES_DIR);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(PUBLIC_LOCALES_DIR, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);
        const jsonString = JSON.stringify(json, null, 2);
        
        for (const { pattern, name } of GERMAN_PATTERNS) {
          const matches = jsonString.match(pattern);
          if (matches) {
            issuesFound.push({
              file: `public/locales/en/${file}`,
              pattern: name,
              count: matches.length,
              lines: [{ line: 'N/A', content: 'Found in translation values' }]
            });
            hasErrors = true;
          }
        }
      } catch (error) {
        console.error(`  ❌ Error reading ${file}: ${error.message}`);
      }
    }
  }
}

/**
 * Main execution
 */
console.log('🔍 i18n Lint - German Text Detection');
console.log('='.repeat(50));
console.log('Scanning for German text in source files...\n');

scanDirectory(SRC_DIR);
scanEnglishTranslations();

console.log(`\n📊 Scan Results`);
console.log('='.repeat(50));
console.log(`Files scanned: ${filesScanned}`);
console.log(`Issues found: ${issuesFound.length}`);

if (hasErrors) {
  console.log('\n❌ German text detected!\n');
  
  // Group by file
  const byFile = {};
  issuesFound.forEach(issue => {
    if (!byFile[issue.file]) {
      byFile[issue.file] = [];
    }
    byFile[issue.file].push(issue);
  });

  for (const [file, issues] of Object.entries(byFile)) {
    console.log(`\n📄 ${file}`);
    issues.forEach(issue => {
      console.log(`  ❌ ${issue.pattern} (${issue.count} occurrence${issue.count > 1 ? 's' : ''})`);
      issue.lines.slice(0, 3).forEach(({ line, content }) => {
        console.log(`     Line ${line}: ${content}`);
      });
      if (issue.lines.length > 3) {
        console.log(`     ... and ${issue.lines.length - 3} more`);
      }
    });
  }
  
  console.log('\n💡 Tip: Replace hardcoded German text with t() translation calls');
  process.exit(1);
} else {
  console.log('\n✅ No German text detected! All clear.');
  process.exit(0);
}
