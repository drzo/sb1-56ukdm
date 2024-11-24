import { useState, useCallback } from 'react';
import { ReservoirAtom } from '../ReservoirAtom';
import { TrainingData, ESNMetrics } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';

export function useESNTraining(esn: ReservoirAtom | null) {
  const [isTraining, setIsTraining] = useState(false);
  const [metrics, setMetrics] = useState<ESNMetrics[]>([]);
  const [error, setError] = useState<string | null>(null);

  const train = useCallback(async (data: TrainingData) => {
    if (!esn) {
      setError('No ESN instance available');
      return;
    }

    try {
      setIsTraining(true);
      setError(null);
      const result = await esn.train(data);
      setMetrics(prev => [...prev, result]);
      Logger.info('ESN training completed successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Training failed';
      setError(message);
      Logger.error('ESN training failed:', err);
    } finally {
      setIsTraining(false);
    }
  }, [esn]);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
    setError(null);
  }, []);

  return {
    train,
    isTraining,
    metrics,
    error,
    clearMetrics,
    clearError: () => setError(null)
  };
}