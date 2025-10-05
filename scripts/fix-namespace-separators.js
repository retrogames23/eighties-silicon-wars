#!/usr/bin/env node

/**
 * Script to fix i18n namespace separators from '.' to ':'
 * Usage: node scripts/fix-namespace-separators.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const NAMESPACES = ['ui', 'economy', 'hardware', 'products', 'reviews', 'events', 'charts', 'common', 'news', 'toast', 'company', 'game', 'tutorial', 'reports'];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  
  // Fix each namespace pattern: t('namespace.key') => t('namespace:key')
  NAMESPACES.forEach(ns => {
    const regex = new RegExp(`t\\(['"]${ns}\\.`, 'g');
    const newContent = content.replace(regex, `t('${ns}:`);
    if (newContent !== content) {
      const matches = content.match(regex);
      changes += matches ? matches.length : 0;
      content = newContent;
    }
  });
  
  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${changes} occurrences in ${filePath}`);
  }
  
  return changes;
}

// Find all TypeScript/React files
const files = glob.sync('src/**/*.{ts,tsx}', { ignore: ['**/*.test.*', '**/*.spec.*'] });

console.log(`Checking ${files.length} files...\\n`);

let totalChanges = 0;
files.forEach(file => {
  totalChanges += fixFile(file);
});

console.log(`\\n✓ Fixed ${totalChanges} total occurrences across ${files.length} files`);
