import { useState, useCallback } from 'react';
import { MultiReservoirManager } from '../core/MultiReservoirManager';
import { ESNConfig, ESNMetrics } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';

export function useMultiReservoir() {
  const [reservoirIds, setReservoirIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Map<string, ESNMetrics[]>>(new Map());
  const manager = MultiReservoirManager.getInstance();

  const addReservoir = useCallback(async (id: string, config: ESNConfig) => {
    try {
      setError(null);
      await manager.addReservoir(id, config);
      setReservoirIds(manager.getReservoirIds());
      Logger.info(`Added reservoir ${id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add reservoir';
      setError(message);
      Logger.error('Failed to add reservoir:', err);
      throw err; // Re-throw to allow parent components to handle the error
    }
  }, []);

  const processEnsemble = useCallback(async (input: Float32Array) => {
    try {
      setError(null);
      return await manager.processEnsemble(input);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process input';
      setError(message);
      Logger.error('Failed to process ensemble input:', err);
      return null;
    }
  }, []);

  const optimizeEnsemble = useCallback(async (validationData: { 
    input: Float32Array, 
    target: Float32Array 
  }[]) => {
    try {
      setError(null);
      await manager.optimizeEnsemble(validationData);
      Logger.info('Ensemble optimization completed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to optimize ensemble';
      setError(message);
      Logger.error('Failed to optimize ensemble:', err);
      throw err;
    }
  }, []);

  const updateMetrics = useCallback((id: string, newMetrics: ESNMetrics) => {
    setMetrics(prev => {
      const updated = new Map(prev);
      const reservoirMetrics = updated.get(id) || [];
      updated.set(id, [...reservoirMetrics, newMetrics]);
      return updated;
    });
  }, []);

  const getReservoirMetrics = useCallback((id: string) => {
    return metrics.get(id) || [];
  }, [metrics]);

  const getEnsembleWeights = useCallback(() => {
    return manager.getEnsembleWeights();
  }, []);

  const removeReservoir = useCallback((id: string) => {
    try {
      const reservoir = manager.getReservoir(id);
      if (reservoir) {
        reservoir.dispose();
        setReservoirIds(prev => prev.filter(rid => rid !== id));
        setMetrics(prev => {
          const updated = new Map(prev);
          updated.delete(id);
          return updated;
        });
        Logger.info(`Removed reservoir ${id}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove reservoir';
      setError(message);
      Logger.error('Failed to remove reservoir:', err);
      throw err;
    }
  }, []);

  return {
    reservoirIds,
    error,
    metrics,
    addReservoir,
    removeReservoir,
    processEnsemble,
    optimizeEnsemble,
    updateMetrics,
    getReservoirMetrics,
    getEnsembleWeights,
    clearError: () => setError(null)
  };
}