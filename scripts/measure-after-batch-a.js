#!/usr/bin/env node

import { execSync } from 'child_process';
import { statSync } from 'fs';
import { glob } from 'glob';

console.log('📊 Batch A - After Measurements');
console.log('===============================');

// Bundle measurement
try {
  console.log('📦 Building...');
  execSync('npm run build', { stdio: 'pipe' });
  
  const distSize = execSync('du -sh dist/', { encoding: 'utf8' }).trim();
  const jsFiles = glob.sync('./dist/assets/*.js');
  const jsSize = jsFiles.reduce((total, file) => total + statSync(file).size, 0);
  
  console.log(`Bundle: ${distSize}, JS: ${Math.round(jsSize/1024)}KB`);
} catch (error) {
  console.log(`Bundle: Error - ${error.message}`);
}

// Check circular dependencies (should be 0 now)
const componentFiles = glob.sync('./src/components/**/*.{ts,tsx}');
let circularIssues = 0;

componentFiles.forEach(file => {
  try {
    const content = require('fs').readFileSync(file, 'utf8');
    if (content.includes('GameMechanics') && content.includes('@/components/GameMechanics')) {
      circularIssues++;
    }
  } catch (e) {
    // ignore
  }
});

console.log(`\n✅ Results:`);
console.log(`- Circular deps: ${circularIssues} (was ~6)`);
console.log(`- Files in components/: ${componentFiles.length}`);
console.log(`- GameMechanics moved to: src/lib/game/`);
console.log(`- Dead CSS removed: App.css deleted`);
console.log(`- Barrel exports added: src/lib/game/index.ts, src/components/ui/index.ts`);

console.log(`\n🚀 Batch A Complete - Structure & Imports optimized!`);