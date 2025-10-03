#!/usr/bin/env node

/**
 * i18n Pseudo-Locale Generator (en-XA)
 * Creates inflated pseudo-translations for visual testing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EN_DIR = path.join(__dirname, '../public/locales/en');
const PSEUDO_DIR = path.join(__dirname, '../public/locales/en-XA');

// Character replacements for pseudo-locale
const PSEUDO_CHARS = {
  'a': 'á',
  'e': 'é',
  'i': 'í',
  'o': 'ó',
  'u': 'ú',
  'A': 'Á',
  'E': 'É',
  'I': 'Í',
  'O': 'Ó',
  'U': 'Ú',
  's': 'š',
  'S': 'Š',
  'c': 'ç',
  'C': 'Ç',
  'n': 'ñ',
  'N': 'Ñ',
};

/**
 * Convert text to pseudo-locale
 * - Adds accent marks to characters
 * - Inflates text by ~30% to test UI expansion
 * - Wraps in brackets to identify untranslated strings
 */
function toPseudo(text) {
  if (typeof text !== 'string') {
    return text;
  }

  // Don't transform interpolation variables, HTML tags, or special syntax
  if (text.match(/^[{<]|{.*}|<.*>|\$\{.*\}|%.*%/)) {
    return text;
  }

  let pseudo = text;
  
  // Replace characters with accented versions
  for (const [char, replacement] of Object.entries(PSEUDO_CHARS)) {
    pseudo = pseudo.replace(new RegExp(char, 'g'), replacement);
  }
  
  // Inflate text by adding extra characters (~30% expansion)
  const words = pseudo.split(' ');
  const inflated = words.map(word => {
    if (word.length > 3) {
      // Add extra vowels to simulate text expansion
      const mid = Math.floor(word.length / 2);
      return word.slice(0, mid) + 'ü' + word.slice(mid);
    }
    return word;
  }).join(' ');
  
  // Wrap in brackets to identify what's translated
  return `[${inflated}]`;
}

/**
 * Recursively transform object values
 */
function transformObject(obj) {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = transformObject(value);
    } else if (typeof value === 'string') {
      result[key] = toPseudo(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Process a translation file
 */
function processFile(filename) {
  const sourcePath = path.join(EN_DIR, filename);
  const targetPath = path.join(PSEUDO_DIR, filename);
  
  try {
    const content = fs.readFileSync(sourcePath, 'utf-8');
    const json = JSON.parse(content);
    const pseudo = transformObject(json);
    
    fs.writeFileSync(targetPath, JSON.stringify(pseudo, null, 2), 'utf-8');
    console.log(`  ✅ Generated ${filename}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to process ${filename}: ${error.message}`);
    return false;
  }
}

/**
 * Main execution
 */
console.log('🔧 i18n Pseudo-Locale Generator (en-XA)');
console.log('='.repeat(50));

// Create pseudo-locale directory
if (!fs.existsSync(PSEUDO_DIR)) {
  fs.mkdirSync(PSEUDO_DIR, { recursive: true });
  console.log('📁 Created en-XA directory');
}

// Process all English translation files
const files = fs.readdirSync(EN_DIR).filter(f => f.endsWith('.json'));
console.log(`\n📦 Processing ${files.length} translation files...\n`);

let successCount = 0;
for (const file of files) {
  if (processFile(file)) {
    successCount++;
  }
}

console.log('\n' + '='.repeat(50));
console.log(`✅ Generated ${successCount}/${files.length} pseudo-locale files`);
console.log('\n💡 To use pseudo-locale:');
console.log('   1. Update i18n.ts to include "en-XA" in SUPPORTED_LANGUAGES');
console.log('   2. Add language switcher option for "Pseudo (en-XA)"');
console.log('   3. Switch to en-XA to see inflated text in brackets');
console.log('\n   This helps identify:');
console.log('   - Hardcoded strings (not in brackets)');
console.log('   - Text truncation issues (inflated text)');
console.log('   - Missing translations');
