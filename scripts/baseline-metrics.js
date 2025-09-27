#!/usr/bin/env node

/**
 * Baseline Metrics Collection Script
 * Collects initial metrics without changing product code
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, statSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const BASELINE_FILE = './metrics-baseline.json';

async function collectBundleMetrics() {
  console.log('🔍 Analyzing bundle size...');
  
  try {
    // Build for analysis
    execSync('npm run build', { stdio: 'inherit' });
    
    // Get dist folder stats
    const distStats = getDirectorySize('./dist');
    const chunks = glob.sync('./dist/assets/*.js').map(file => ({
      name: path.basename(file),
      size: statSync(file).size
    }));
    
    return {
      totalSize: distStats,
      chunkCount: chunks.length,
      largestChunk: Math.max(...chunks.map(c => c.size)),
      chunks: chunks.sort((a, b) => b.size - a.size).slice(0, 5)
    };
  } catch (error) {
    console.error('Bundle analysis failed:', error.message);
    return { error: error.message };
  }
}

async function collectCodeQualityMetrics() {
  console.log('🔍 Analyzing code quality...');
  
  let eslintResults = { errors: 0, warnings: 0 };
  let tsResults = { errors: 0 };
  
  try {
    // Run ESLint
    const eslintOutput = execSync('npm run lint -- --format json', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const eslintData = JSON.parse(eslintOutput);
    eslintResults = eslintData.reduce((acc, file) => ({
      errors: acc.errors + file.errorCount,
      warnings: acc.warnings + file.warningCount
    }), { errors: 0, warnings: 0 });
  } catch (error) {
    console.warn('ESLint analysis failed, using defaults');
  }
  
  try {
    // Run TypeScript check
    execSync('npm run typecheck', { stdio: 'pipe' });
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const errorMatches = output.match(/error TS\d+:/g);
    tsResults.errors = errorMatches ? errorMatches.length : 0;
  }
  
  return {
    eslint: eslintResults,
    typescript: tsResults,
    fileCount: glob.sync('./src/**/*.{ts,tsx}').length,
    componentCount: glob.sync('./src/components/**/*.{ts,tsx}').length
  };
}

function getDirectorySize(dirPath) {
  const files = glob.sync(`${dirPath}/**/*`);
  return files.reduce((total, file) => {
    try {
      return total + statSync(file).size;
    } catch {
      return total;
    }
  }, 0);
}

async function main() {
  console.log('📊 Collecting Baseline Metrics...\n');
  
  const metrics = {
    timestamp: new Date().toISOString(),
    version: '1.0.0-baseline',
    bundle: await collectBundleMetrics(),
    codeQuality: await collectCodeQualityMetrics(),
    runtime: {
      note: 'Runtime metrics will be collected during development'
    }
  };
  
  // Save baseline
  writeFileSync(BASELINE_FILE, JSON.stringify(metrics, null, 2));
  
  console.log('\n📋 Baseline Metrics Report:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📦 Bundle Size: ${(metrics.bundle.totalSize / 1024).toFixed(1)}KB`);
  console.log(`🧩 Chunks: ${metrics.bundle.chunkCount}`);
  console.log(`📄 TS/TSX Files: ${metrics.codeQuality.fileCount}`);
  console.log(`🧱 Components: ${metrics.codeQuality.componentCount}`);
  console.log(`⚠️  ESLint Warnings: ${metrics.codeQuality.eslint.warnings}`);
  console.log(`❌ ESLint Errors: ${metrics.codeQuality.eslint.errors}`);
  console.log(`🔧 TypeScript Errors: ${metrics.codeQuality.typescript.errors}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n💾 Baseline saved to: ${BASELINE_FILE}`);
  console.log('🚀 Ready for Phase 2 refactoring!');
}

main().catch(console.error);