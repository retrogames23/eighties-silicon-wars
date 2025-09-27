#!/usr/bin/env node

import { execSync } from 'child_process';
import { statSync, readFileSync } from 'fs';
import { glob } from 'glob';

function measureBundle() {
  try {
    console.log('📦 Building for measurement...');
    execSync('npm run build', { stdio: 'pipe' });
    
    const distSize = execSync('du -sh dist/', { encoding: 'utf8' }).trim();
    const jsFiles = glob.sync('./dist/assets/*.js');
    const jsSize = jsFiles.reduce((total, file) => total + statSync(file).size, 0);
    
    console.log(`Bundle: ${distSize}, JS: ${Math.round(jsSize/1024)}KB`);
    return { distSize, jsSize };
  } catch (error) {
    return { error: error.message };
  }
}

function checkCircularDeps() {
  const componentFiles = glob.sync('./src/components/**/*.{ts,tsx}');
  let circularIssues = 0;
  
  componentFiles.forEach(file => {
    try {
      const content = readFileSync(file, 'utf8');
      // Check for imports within components folder referencing GameMechanics
      if (content.includes('GameMechanics') && content.includes('@/components/GameMechanics')) {
        circularIssues++;
      }
    } catch (e) {
      // ignore
    }
  });
  
  console.log(`Circular deps found: ${circularIssues}`);
  return circularIssues;
}

console.log('📊 Batch A - Before Measurements');
console.log('================================');

const bundle = measureBundle();
const circular = checkCircularDeps();

console.log(`\n📋 Summary:`);
console.log(`- Bundle size: ${bundle.distSize || 'Error'}`);
console.log(`- Circular dependencies: ${circular}`);
console.log(`- Files in components/: ${glob.sync('./src/components/**/*.{ts,tsx}').length}`);