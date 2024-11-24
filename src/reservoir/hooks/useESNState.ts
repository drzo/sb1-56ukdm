import { useState, useCallback } from 'react';
import { ReservoirAtom } from '../ReservoirAtom';
import { ESNConfig } from '../types/ESNTypes';
import { ESNValidator } from '../validation/ESNValidator';
import { Logger } from '../../cogutil/Logger';

export function useESNState() {
  const [esn, setEsn] = useState<ReservoirAtom | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createESN = useCallback(async (id: string, config: ESNConfig) => {
    try {
      // Validate config first
      ESNValidator.validateConfig(config);

      // Create and initialize ESN
      const newEsn = new ReservoirAtom(id, config);
      await newEsn.initialize();
      
      setEsn(newEsn);
      setError(null);
      Logger.info('ESN created successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create ESN';
      setError(message);
      Logger.error('Failed to create ESN:', err);
      throw err; // Re-throw to allow parent components to handle the error
    }
  }, []);

  const disposeESN = useCallback(() => {
    if (esn) {
      try {
        esn.dispose();
        setEsn(null);
        setError(null);
        Logger.info('ESN disposed successfully');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to dispose ESN';
        setError(message);
        Logger.error('Failed to dispose ESN:', err);
      }
    }
  }, [esn]);

  const processInput = useCallback(async (input: Float32Array) => {
    if (!esn) {
      setError('No ESN instance available');
      return null;
    }

    try {
      ESNValidator.validateInput(input, esn.getConfig().inputSize);
      const output = await esn.process(input);
      setError(null);
      return output;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process input';
      setError(message);
      Logger.error('Failed to process input:', err);
      return null;
    }
  }, [esn]);

  return {
    esn,
    error,
    createESN,
    disposeESN,
    processInput,
    clearError: () => setError(null)
  };
}