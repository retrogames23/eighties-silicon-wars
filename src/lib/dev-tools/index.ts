/**
 * Development Tools & Metrics
 * Only active in development mode
 */

export { RenderCounter, useRenderTracking } from './RenderCounter';
export { metricsCollector } from './MetricsCollector';

// Global development helpers
if (import.meta.env.DEV) {
  // Expose metrics collector globally for easy access in dev tools
  (globalThis as any).__METRICS__ = {
    collector: () => import('./MetricsCollector').then(m => m.metricsCollector),
    baseline: () => console.log('Run: npm run quality:baseline'),
    analyze: () => console.log('Run: npm run analyze')
  };
  
  // Add performance mark for app start
  performance.mark('app-start');
  
  console.log('🛠️ Dev tools loaded. Access via globalThis.__METRICS__');
}