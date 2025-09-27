#!/bin/bash

# Baseline Metrics Generation Script
# Generates baseline metrics for refactoring comparison

echo "📊 Generating Baseline Metrics..."
echo "================================="

# Create metrics output directory
mkdir -p .metrics

# 1. Code Quality Metrics
echo "🔍 Analyzing code quality..."

# ESLint results
npm run lint -- --format json --output-file .metrics/eslint-baseline.json 2>/dev/null || echo "ESLint completed with warnings"

# TypeScript check
npm run typecheck > .metrics/typecheck-baseline.txt 2>&1 || echo "TypeScript check completed"

# Count files and lines
echo "📁 Counting project files..."
find src -name "*.ts" -o -name "*.tsx" | wc -l > .metrics/file-count.txt
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -n 1 >> .metrics/file-count.txt

# 2. Bundle Analysis
echo "📦 Analyzing bundle..."
ANALYZE=true npm run build > .metrics/bundle-baseline.txt 2>&1

# Get bundle stats
if [ -d "dist" ]; then
    du -sh dist/ > .metrics/bundle-size.txt
    find dist -name "*.js" -exec ls -lh {} \; > .metrics/chunk-sizes.txt
fi

# 3. Generate Summary Report
echo "📋 Generating summary report..."

cat > .metrics/baseline-summary.md << EOF
# Baseline Metrics Report

Generated: $(date)

## Bundle Metrics
- Total size: $(cat .metrics/bundle-size.txt 2>/dev/null || echo "N/A")
- Chunk details: Available in chunk-sizes.txt

## Code Quality
- TypeScript files: $(head -n 1 .metrics/file-count.txt 2>/dev/null || echo "N/A")
- Total lines: $(tail -n 1 .metrics/file-count.txt | awk '{print $1}' 2>/dev/null || echo "N/A")
- ESLint results: Available in eslint-baseline.json
- TypeScript results: Available in typecheck-baseline.txt

## Files Generated
- eslint-baseline.json - ESLint analysis results
- typecheck-baseline.txt - TypeScript compilation results  
- bundle-baseline.txt - Bundle build log
- bundle-size.txt - Total bundle size
- chunk-sizes.txt - Individual chunk sizes
- file-count.txt - Project file statistics

## Next Steps
1. Review baseline metrics in .metrics/ folder
2. Implement refactoring changes
3. Compare against baseline using scripts/compare-metrics.sh
EOF

echo "✅ Baseline metrics generated in .metrics/ folder"
echo "📋 Summary available in .metrics/baseline-summary.md"
echo ""
echo "🔍 Quick Summary:"
echo "   - Bundle size: $(cat .metrics/bundle-size.txt 2>/dev/null || echo 'N/A')"
echo "   - TypeScript files: $(head -n 1 .metrics/file-count.txt 2>/dev/null || echo 'N/A')"
echo ""
echo "🚀 Ready for Phase 2 refactoring!"