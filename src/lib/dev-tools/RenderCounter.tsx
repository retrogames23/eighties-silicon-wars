import { useRef, useEffect } from 'react';

interface RenderCounterProps {
  componentName: string;
  enabled?: boolean;
}

/**
 * Development-only component to track render counts
 * Only logs in development mode
 */
export const RenderCounter = ({ 
  componentName, 
  enabled = import.meta.env.DEV 
}: RenderCounterProps) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;
    
    renderCount.current += 1;
    const timeSinceStart = Date.now() - startTime.current;
    
    console.log(
      `🔄 [${componentName}] Render #${renderCount.current} (${timeSinceStart}ms since mount)`
    );
  });

  return null;
};

/**
 * Hook to track component render performance
 */
export const useRenderTracking = (componentName: string, enabled = import.meta.env.DEV) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    if (!enabled) return;
    
    const now = performance.now();
    renderCount.current += 1;
    const renderDuration = now - lastRenderTime.current;
    const totalTime = now - startTime.current;
    
    if (renderCount.current % 10 === 0 || renderDuration > 16) {
      console.log(`📊 [${componentName}] Render Stats:`, {
        count: renderCount.current,
        lastRenderMs: renderDuration.toFixed(2),
        totalTimeMs: totalTime.toFixed(2),
        avgRenderMs: (totalTime / renderCount.current).toFixed(2)
      });
    }
    
    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    getRenderStats: () => ({
      count: renderCount.current,
      totalTimeMs: performance.now() - startTime.current,
      avgRenderMs: (performance.now() - startTime.current) / renderCount.current
    })
  };
};