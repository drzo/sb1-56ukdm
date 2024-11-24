import * as Comlink from 'comlink';
import * as tf from '@tensorflow/tfjs';
import { ESNConfig, ESNState, TrainingData } from '../types/ESNTypes';
import { ESNCore } from '../core/ESNCore';
import { Logger } from '../../cogutil/Logger';

export class ESNWorker {
  private esn: ESNCore | null = null;

  async initialize(config: ESNConfig): Promise<void> {
    try {
      await tf.ready();
      this.esn = new ESNCore(config);
      await this.esn.initialize();
      Logger.info('ESN worker initialized');
    } catch (error) {
      Logger.error('Failed to initialize ESN worker:', error);
      throw error;
    }
  }

  async process(input: Float32Array): Promise<Float32Array> {
    if (!this.esn) throw new Error('ESN not initialized');
    return this.esn.update(input);
  }

  async train(data: TrainingData): Promise<void> {
    if (!this.esn) throw new Error('ESN not initialized');
    await this.esn.train(data);
  }

  getState(): ESNState {
    if (!this.esn) throw new Error('ESN not initialized');
    return this.esn.getState();
  }

  dispose(): void {
    if (this.esn) {
      this.esn.dispose();
      this.esn = null;
    }
  }
}

Comlink.expose(ESNWorker);