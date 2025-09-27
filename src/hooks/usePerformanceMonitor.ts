import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
}

/**
 * Development Hook für Performance-Monitoring
 * Hilft dabei, Re-Render-Hotspots zu identifizieren
 */
export function usePerformanceMonitor(componentName: string, enabled = process.env.NODE_ENV === 'development') {
  const renderCount = useRef(0);
  const startTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled) return;
    
    startTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    if (!enabled) return;
    
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    renderTimes.current.push(renderTime);
    
    // Keep only last 10 render times for average calculation
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }
    
    const avgRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
    
    // Log performance warnings in development
    if (renderTime > 16) { // > 1 frame at 60fps
      console.warn(`[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms (render #${renderCount.current})`);
    }
    
    if (renderCount.current % 50 === 0) {
      console.info(`[Performance] ${componentName} - ${renderCount.current} renders, avg: ${avgRenderTime.toFixed(2)}ms`);
    }
  });

  const getMetrics = useCallback((): PerformanceMetrics => ({
    renderCount: renderCount.current,
    lastRenderTime: renderTimes.current[renderTimes.current.length - 1] || 0,
    averageRenderTime: renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length || 0,
  }), []);

  return { getMetrics };
}

/**
 * Hook für Action Performance Monitoring
 * Misst die Zeit für State-Updates und andere Actions
 */
export function useActionPerformance<T extends (...args: any[]) => any>(
  action: T,
  actionName: string,
  enabled = process.env.NODE_ENV === 'development'
): T {
  return useCallback((...args: Parameters<T>): ReturnType<T> => {
    if (!enabled) {
      return action(...args);
    }

    const startTime = performance.now();
    const result = action(...args);
    const endTime = performance.now();
    const actionTime = endTime - startTime;

    if (actionTime > 5) { // Warn for actions taking > 5ms
      console.warn(`[Performance] Action "${actionName}" took ${actionTime.toFixed(2)}ms`);
    }

    return result;
  }, [action, actionName, enabled]) as T;
}
