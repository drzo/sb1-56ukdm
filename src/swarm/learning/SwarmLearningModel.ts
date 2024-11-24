import * as tf from '@tensorflow/tfjs';
import { Logger } from '../../cogutil/Logger';
import { SwarmAgent } from '../SwarmAgent';
import { TaskWithStatus } from '../types';
import { ExperienceReplay } from './ExperienceReplay';
import { RewardCalculator } from './RewardCalculator';
import { ModelOptimizer } from './ModelOptimizer';

interface ModelConfig {
  inputSize: number;
  hiddenSize: number;
  outputSize: number;
  learningRate: number;
  batchSize: number;
  validationSplit: number;
}

export class SwarmLearningModel {
  private model: tf.LayersModel;
  private config: ModelConfig;
  private experienceReplay: ExperienceReplay;
  private rewardCalculator: RewardCalculator;
  private optimizer: ModelOptimizer;

  constructor(config: Partial<ModelConfig> = {}) {
    this.config = {
      inputSize: 64,
      hiddenSize: 128,
      outputSize: 32,
      learningRate: 0.001,
      batchSize: 32,
      validationSplit: 0.2,
      ...config
    };

    this.experienceReplay = new ExperienceReplay(1000);
    this.rewardCalculator = new RewardCalculator();
    this.optimizer = new ModelOptimizer(this.config);
    this.initializeModel();
  }

  private initializeModel(): void {
    try {
      this.model = this.optimizer.createModel();
      Logger.info('SwarmLearningModel initialized');
    } catch (error) {
      Logger.error('Failed to initialize swarm learning model:', error);
      throw error;
    }
  }

  async train(
    agents: SwarmAgent[],
    tasks: TaskWithStatus[],
    epochs: number = 100
  ): Promise<tf.History> {
    try {
      // Store experiences
      agents.forEach(agent => {
        const agentTasks = tasks.filter(t => 
          t.assignedAgents.includes(agent.getId())
        );
        this.storeExperiences(agent, agentTasks);
      });

      // Sample and prepare training data
      const { inputs, targets } = await this.prepareTrainingData();

      // Train model
      const history = await this.optimizer.trainModel(
        this.model,
        inputs,
        targets,
        epochs
      );

      Logger.info('Swarm learning model training completed');
      return history;
    } catch (error) {
      Logger.error('Failed to train swarm learning model:', error);
      throw error;
    }
  }

  private storeExperiences(agent: SwarmAgent, tasks: TaskWithStatus[]): void {
    tasks.forEach(task => {
      const experience = {
        state: this.getAgentState(agent),
        action: task.id,
        reward: this.rewardCalculator.calculateReward(task),
        nextState: this.getAgentState(agent),
        done: task.status !== 'pending'
      };
      this.experienceReplay.addExperience(experience);
    });
  }

  private async prepareTrainingData(): Promise<{
    inputs: tf.Tensor2D;
    targets: tf.Tensor2D;
  }> {
    const batch = this.experienceReplay.sampleBatch(this.config.batchSize);
    
    const inputs = tf.tensor2d(
      batch.map(exp => Array.from(exp.state))
    );
    
    const targets = tf.tensor2d(
      batch.map(exp => Array.from(exp.nextState))
    );

    return { inputs, targets };
  }

  private getAgentState(agent: SwarmAgent): Float32Array {
    const state = agent.getState();
    const features = [
      state.energy / 100,
      state.performance.successRate,
      state.performance.taskCompletion,
      state.performance.collaborationScore,
      state.performance.learningProgress,
      ...agent.getCapabilities().map(c => c.successRate)
    ];

    // Pad or truncate to match inputSize
    while (features.length < this.config.inputSize) {
      features.push(0);
    }
    return new Float32Array(features.slice(0, this.config.inputSize));
  }

  async predict(agent: SwarmAgent): Promise<Float32Array> {
    try {
      const features = this.getAgentState(agent);
      const inputTensor = tf.tensor2d([Array.from(features)]);
      
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const result = await prediction.data();

      // Cleanup
      inputTensor.dispose();
      prediction.dispose();

      return new Float32Array(result);
    } catch (error) {
      Logger.error('Failed to make prediction:', error);
      throw error;
    }
  }

  async save(path: string = 'swarm-learning-model'): Promise<void> {
    try {
      await this.model.save(`localstorage://${path}`);
      Logger.info('Swarm learning model saved');
    } catch (error) {
      Logger.error('Failed to save model:', error);
      throw error;
    }
  }

  async load(path: string = 'swarm-learning-model'): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(`localstorage://${path}`);
      Logger.info('Swarm learning model loaded');
    } catch (error) {
      Logger.error('Failed to load model:', error);
      throw error;
    }
  }

  dispose(): void {
    this.model.dispose();
    this.experienceReplay.clear();
  }
}