import { useState, useCallback } from 'react';
import { ESNMetrics } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';

export function useESNMetrics() {
  const [metrics, setMetrics] = useState<ESNMetrics[]>([]);

  const addMetrics = useCallback((newMetrics: ESNMetrics) => {
    setMetrics(prev => [...prev, newMetrics]);
    Logger.debug('Added new ESN metrics:', newMetrics);
  }, []);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
    Logger.debug('Cleared ESN metrics');
  }, []);

  const getLatestMetrics = useCallback(() => {
    return metrics[metrics.length - 1];
  }, [metrics]);

  const getAverageMetrics = useCallback(() => {
    if (metrics.length === 0) return null;

    return {
      accuracy: metrics.reduce((sum, m) => sum + m.accuracy, 0) / metrics.length,
      complexity: metrics.reduce((sum, m) => sum + m.complexity, 0) / metrics.length,
      stability: metrics.reduce((sum, m) => sum + m.stability, 0) / metrics.length,
      timestamp: Date.now()
    };
  }, [metrics]);

  const getMetricsHistory = useCallback(() => {
    return [...metrics];
  }, [metrics]);

  return {
    metrics,
    addMetrics,
    clearMetrics,
    getLatestMetrics,
    getAverageMetrics,
    getMetricsHistory
  };
}