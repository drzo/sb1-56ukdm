import { ESNState, ESNConfig } from '../types/ESNTypes';
import { Logger } from '../../cogutil/Logger';

export class ESNStateValidator {
  private config: ESNConfig;

  constructor(config: ESNConfig) {
    this.config = config;
  }

  validateState(state: ESNState): void {
    const errors: string[] = [];

    // Validate dimensions
    if (state.weights.input.length !== this.config.reservoirSize) {
      errors.push('Invalid input weights dimension');
    }

    if (state.weights.input[0]?.length !== this.config.inputSize) {
      errors.push('Invalid input weights shape');
    }

    if (state.weights.reservoir.length !== this.config.reservoirSize) {
      errors.push('Invalid reservoir weights dimension');
    }

    if (state.state.length !== this.config.reservoirSize) {
      errors.push('Invalid state vector dimension');
    }

    // Validate value ranges
    if (!this.validateValueRange(state.weights.input, -10, 10)) {
      errors.push('Input weights out of range');
    }

    if (!this.validateValueRange(state.weights.reservoir, -1, 1)) {
      errors.push('Reservoir weights out of range');
    }

    if (!this.validateValueRange([state.state], -1, 1)) {
      errors.push('State values out of range');
    }

    if (errors.length > 0) {
      Logger.error('State validation failed:', errors);
      throw new Error(`Invalid ESN state: ${errors.join(', ')}`);
    }
  }

  private validateValueRange(
    matrix: number[][],
    min: number,
    max: number
  ): boolean {
    return matrix.every(row =>
      row.every(value => value >= min && value <= max)
    );
  }

  validateStateTransition(
    oldState: ESNState,
    newState: ESNState,
    maxDelta: number = 1.0
  ): void {
    const stateDelta = Math.max(
      ...newState.state.map((v, i) => Math.abs(v - oldState.state[i]))
    );

    if (stateDelta > maxDelta) {
      const error = `State transition too large: ${stateDelta}`;
      Logger.error(error);
      throw new Error(error);
    }
  }
}