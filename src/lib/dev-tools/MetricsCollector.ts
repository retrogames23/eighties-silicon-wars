/**
 * Development metrics collector for baseline measurements
 * Collects performance metrics without affecting production code
 */

interface BaselineMetrics {
  bundle: {
    totalSize?: number;
    chunkCount?: number;
    largestChunk?: number;
  };
  runtime: {
    renderCounts: Record<string, number>;
    averageRenderTime: Record<string, number>;
    memoryUsage?: number;
  };
  codeQuality: {
    eslintWarnings?: number;
    eslintErrors?: number;
    tsErrors?: number;
    circularDependencies?: number;
  };
}

class MetricsCollector {
  private metrics: BaselineMetrics = {
    bundle: {},
    runtime: {
      renderCounts: {},
      averageRenderTime: {}
    },
    codeQuality: {}
  };

  private isEnabled = import.meta.env.DEV;

  recordRenderMetrics(componentName: string, renderTime: number) {
    if (!this.isEnabled) return;
    
    this.metrics.runtime.renderCounts[componentName] = 
      (this.metrics.runtime.renderCounts[componentName] || 0) + 1;
    
    const currentAvg = this.metrics.runtime.averageRenderTime[componentName] || 0;
    const count = this.metrics.runtime.renderCounts[componentName];
    this.metrics.runtime.averageRenderTime[componentName] = 
      (currentAvg * (count - 1) + renderTime) / count;
  }

  recordMemoryUsage() {
    if (!this.isEnabled || !('memory' in performance)) return;
    
    // @ts-ignore - memory API might not be available in all browsers
    const memInfo = (performance as any).memory;
    if (memInfo) {
      this.metrics.runtime.memoryUsage = memInfo.usedJSHeapSize;
    }
  }

  setBundleMetrics(size: number, chunkCount: number, largestChunk: number) {
    if (!this.isEnabled) return;
    
    this.metrics.bundle = {
      totalSize: size,
      chunkCount,
      largestChunk
    };
  }

  setCodeQualityMetrics(eslintWarnings: number, eslintErrors: number, tsErrors: number) {
    if (!this.isEnabled) return;
    
    this.metrics.codeQuality = {
      eslintWarnings,
      eslintErrors,
      tsErrors
    };
  }

  getBaselineReport(): BaselineMetrics {
    return JSON.parse(JSON.stringify(this.metrics));
  }

  exportBaseline(): string {
    const report = this.getBaselineReport();
    const timestamp = new Date().toISOString();
    
    return JSON.stringify({
      timestamp,
      version: '1.0.0',
      metrics: report
    }, null, 2);
  }

  logBaseline() {
    if (!this.isEnabled) return;
    
    console.group('📊 Baseline Metrics Report');
    console.log('Bundle:', this.metrics.bundle);
    console.log('Runtime:', this.metrics.runtime);
    console.log('Code Quality:', this.metrics.codeQuality);
    console.log('Export:', this.exportBaseline());
    console.groupEnd();
  }
}

export const metricsCollector = new MetricsCollector();

// Auto-collect memory usage every 30 seconds in dev
if (import.meta.env.DEV) {
  setInterval(() => {
    metricsCollector.recordMemoryUsage();
  }, 30000);
}