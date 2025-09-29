#!/usr/bin/env node

/**
 * I18N Migration Verification Script
 * Verifies that migrated components have no hard-coded strings
 */

const fs = require('fs');

function verifyNoHardCodedStrings(filePath, componentName) {
  console.log(`\n🔍 Verifying ${componentName}...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Patterns for hard-coded German strings (excluding CSS/className)
  const hardCodedPatterns = [
    // Common German business terms
    /["\'](?:Gesamtumsatz|Einnahmen|Ausgaben|Gewinn|Umsatz|Entwicklung|Verfügbar|Eingestellt)["\'](?![^<]*className)/g,
    // German UI terms
    /["\'](?:Kontosaldo|Marketing|Forschung|Entwicklungskosten|Computer-Verkäufe)["\'](?![^<]*className)/g,
    // German descriptions
    /["\'](?:Noch keine Modelle|Entwickle innovative|Klicke auf)["\'](?![^<]*className)/g,
    // Component terms
    /["\'](?:CPU|RAM|Grafik|Sound):\s*["\'](?![^<]*className)/g
  ];
  
  let foundIssues = 0;
  
  hardCodedPatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      console.warn(`⚠️  Found potential hard-coded strings (pattern ${index + 1}):`, matches);
      foundIssues += matches.length;
    }
  });
  
  // Check for missing useTranslation import
  if (!content.includes('useTranslation')) {
    console.error(`❌ Missing useTranslation import in ${componentName}`);
    foundIssues++;
  }
  
  // Check for t() usage
  const tUsage = (content.match(/\bt\(['"'][^'"]+['"']\)/g) || []).length;
  console.log(`📊 Found ${tUsage} t() translation calls`);
  
  if (foundIssues === 0) {
    console.log(`✅ ${componentName} migration verified - no hard-coded strings found`);
    return true;
  } else {
    console.error(`❌ ${componentName} has ${foundIssues} potential issues`);
    return false;
  }
}

function verifyTranslationKeys() {
  console.log('\n🔍 Verifying translation files...');
  
  const deFile = 'public/locales/de/ui.json';
  const enFile = 'public/locales/en/ui.json';
  
  if (!fs.existsSync(deFile) || !fs.existsSync(enFile)) {
    console.error('❌ Translation files not found');
    return false;
  }
  
  try {
    const deTranslations = JSON.parse(fs.readFileSync(deFile, 'utf-8'));
    const enTranslations = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
    
    // Count keys recursively
    const countKeys = (obj, prefix = '') => {
      let count = 0;
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object') {
          count += countKeys(value, `${prefix}${key}.`);
        } else {
          count++;
        }
      }
      return count;
    };
    
    const deKeyCount = countKeys(deTranslations);
    const enKeyCount = countKeys(enTranslations);
    
    console.log(`📊 German translations: ${deKeyCount} keys`);
    console.log(`📊 English translations: ${enKeyCount} keys`);
    
    if (deKeyCount === enKeyCount) {
      console.log('✅ Translation key counts match');
      return true;
    } else {
      console.error('❌ Translation key counts mismatch');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error parsing translation files:', error.message);
    return false;
  }
}

// Main verification
console.log('🚀 Starting I18N Migration Verification...');

const results = [
  verifyNoHardCodedStrings('src/components/CompanyAccount.tsx', 'CompanyAccount'),
  verifyNoHardCodedStrings('src/components/DevelopmentTab.tsx', 'DevelopmentTab'),
  verifyNoHardCodedStrings('src/components/CompanyManagement.tsx', 'CompanyManagement'),
  verifyNoHardCodedStrings('src/components/MarketTab.tsx', 'MarketTab'),
  verifyNoHardCodedStrings('src/components/HardwareAnnouncement.tsx', 'HardwareAnnouncement'),
  verifyNoHardCodedStrings('src/components/ComputerDevelopment.tsx', 'ComputerDevelopment'),
  verifyTranslationKeys()
];

const allPassed = results.every(result => result === true);

console.log('\n📋 Verification Summary:');
console.log(`✅ Passed: ${results.filter(r => r).length}/${results.length}`);
console.log(`❌ Failed: ${results.filter(r => !r).length}/${results.length}`);

if (allPassed) {
  console.log('\n🎉 All verifications passed! Commit 3 (Hardware) ready.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some verifications failed. Please review and fix.');
  process.exit(1);
}