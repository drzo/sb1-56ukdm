import { Logger } from '../../cogutil/Logger';
import { Timer } from '../../cogutil/Timer';
import * as tf from '@tensorflow/tfjs';
import { ReservoirCommunication } from './ReservoirCommunication';

interface ProcessingConfig {
  vocabularySize: number;
  embeddingSize: number;
  contextSize: number;
  maxSequenceLength: number;
}

export class MitochondrialLanguageProcessor {
  private config: ProcessingConfig;
  private vocabulary: Map<string, number>;
  private reverseVocabulary: Map<number, string>;
  private reservoir: ReservoirCommunication;
  private encoder: tf.LayersModel;
  private decoder: tf.LayersModel;

  constructor(config: Partial<ProcessingConfig> = {}) {
    this.config = {
      vocabularySize: config.vocabularySize || 10000,
      embeddingSize: config.embeddingSize || 128,
      contextSize: config.contextSize || 5,
      maxSequenceLength: config.maxSequenceLength || 50
    };

    this.vocabulary = new Map();
    this.reverseVocabulary = new Map();
    this.reservoir = new ReservoirCommunication({
      inputSize: this.config.embeddingSize,
      reservoirSize: 500
    });

    this.initializeModels();
    Logger.info('MitochondrialLanguageProcessor initialized');
  }

  private async initializeModels(): Promise<void> {
    try {
      // Encoder model
      const encoderInput = tf.input({ shape: [this.config.maxSequenceLength] });
      const embedding = tf.layers.embedding({
        inputDim: this.config.vocabularySize,
        outputDim: this.config.embeddingSize,
        inputLength: this.config.maxSequenceLength
      }).apply(encoderInput);

      const lstm = tf.layers.lstm({
        units: this.config.embeddingSize,
        returnSequences: false
      }).apply(embedding);

      this.encoder = tf.model({
        inputs: encoderInput,
        outputs: lstm
      });

      // Decoder model
      const decoderInput = tf.input({ shape: [this.config.embeddingSize] });
      const decoderDense1 = tf.layers.dense({
        units: this.config.embeddingSize * 2,
        activation: 'relu'
      }).apply(decoderInput);

      const decoderDense2 = tf.layers.dense({
        units: this.config.vocabularySize * this.config.maxSequenceLength,
        activation: 'softmax'
      }).apply(decoderDense1);

      this.decoder = tf.model({
        inputs: decoderInput,
        outputs: decoderDense2
      });

      Logger.info('Language models initialized');
    } catch (error) {
      Logger.error('Failed to initialize models:', error);
      throw error;
    }
  }

  async processMessage(
    message: string,
    context: string[] = []
  ): Promise<string> {
    const timer = new Timer();
    try {
      // Tokenize and encode input
      const tokens = this.tokenize(message);
      const encoded = await this.encode(tokens);

      // Process through reservoir
      const processed = await this.reservoir.processSignal(encoded);

      // Generate response
      const response = await this.generateResponse(processed, context);

      Logger.debug(`Message processed in ${timer.stop()}ms`);
      return response;
    } catch (error) {
      Logger.error('Failed to process message:', error);
      throw error;
    }
  }

  private tokenize(text: string): number[] {
    return text.toLowerCase()
      .split(/\s+/)
      .map(token => {
        if (!this.vocabulary.has(token)) {
          const id = this.vocabulary.size;
          if (id < this.config.vocabularySize) {
            this.vocabulary.set(token, id);
            this.reverseVocabulary.set(id, token);
          }
        }
        return this.vocabulary.get(token) || 0;
      });
  }

  private async encode(tokens: number[]): Promise<Float32Array> {
    try {
      // Pad or truncate tokens
      const padded = this.pad(tokens);
      
      // Convert to tensor
      const input = tf.tensor2d([padded], [1, this.config.maxSequenceLength]);
      
      // Encode
      const encoded = this.encoder.predict(input) as tf.Tensor;
      const result = await encoded.data();

      // Cleanup
      input.dispose();
      encoded.dispose();

      return new Float32Array(result);
    } catch (error) {
      Logger.error('Failed to encode tokens:', error);
      throw error;
    }
  }

  private pad(tokens: number[]): number[] {
    if (tokens.length >= this.config.maxSequenceLength) {
      return tokens.slice(0, this.config.maxSequenceLength);
    }
    return [...tokens, ...new Array(this.config.maxSequenceLength - tokens.length).fill(0)];
  }

  private async generateResponse(
    embedding: Float32Array,
    context: string[]
  ): Promise<string> {
    try {
      // Convert embedding to tensor
      const embeddingTensor = tf.tensor2d([embedding], [1, this.config.embeddingSize]);

      // Generate token probabilities
      const output = this.decoder.predict(embeddingTensor) as tf.Tensor;
      const probabilities = await output.array();

      // Convert to tokens
      const tokens = this.decodeTokens(probabilities[0]);

      // Format response
      const response = this.formatResponse(tokens, context);

      // Cleanup
      embeddingTensor.dispose();
      output.dispose();

      return response;
    } catch (error) {
      Logger.error('Failed to generate response:', error);
      throw error;
    }
  }

  private decodeTokens(probabilities: number[]): string[] {
    const tokens: string[] = [];
    const vocabSize = this.config.vocabularySize;

    for (let i = 0; i < probabilities.length; i += vocabSize) {
      const tokenProbs = probabilities.slice(i, i + vocabSize);
      const tokenId = tokenProbs.indexOf(Math.max(...tokenProbs));
      
      if (tokenId > 0 && this.reverseVocabulary.has(tokenId)) {
        tokens.push(this.reverseVocabulary.get(tokenId)!);
      }
    }

    return tokens;
  }

  private formatResponse(tokens: string[], context: string[]): string {
    // Remove duplicates and stop at end token if present
    const uniqueTokens = [];
    const endTokens = new Set(['<end>', '.', '!', '?']);
    
    for (const token of tokens) {
      if (endTokens.has(token)) break;
      if (!uniqueTokens.includes(token)) {
        uniqueTokens.push(token);
      }
    }

    // Add appropriate punctuation
    let response = uniqueTokens.join(' ').trim();
    if (!endTokens.has(response.slice(-1))) {
      response += '.';
    }

    return response;
  }

  async train(
    trainingData: Array<{
      input: string;
      output: string;
      context?: string[];
    }>,
    epochs: number = 100
  ): Promise<void> {
    const timer = new Timer();
    try {
      // Prepare training data
      const inputs: Float32Array[] = [];
      const targets: Float32Array[] = [];

      for (const sample of trainingData) {
        const inputTokens = this.tokenize(sample.input);
        const targetTokens = this.tokenize(sample.output);

        const inputEncoded = await this.encode(inputTokens);
        const targetEncoded = await this.encode(targetTokens);

        inputs.push(inputEncoded);
        targets.push(targetEncoded);
      }

      // Train reservoir
      await this.reservoir.train(inputs, targets, epochs);

      Logger.info(`Training completed in ${timer.stop()}ms`);
    } catch (error) {
      Logger.error('Training failed:', error);
      throw error;
    }
  }

  async save(path: string): Promise<void> {
    try {
      const saveData = {
        config: this.config,
        vocabulary: Array.from(this.vocabulary.entries()),
        reverseVocabulary: Array.from(this.reverseVocabulary.entries())
      };

      await this.encoder.save(`localstorage://${path}-encoder`);
      await this.decoder.save(`localstorage://${path}-decoder`);
      await this.reservoir.save(`${path}-reservoir`);
      localStorage.setItem(path, JSON.stringify(saveData));

      Logger.info('Language processor saved');
    } catch (error) {
      Logger.error('Failed to save language processor:', error);
      throw error;
    }
  }

  async load(path: string): Promise<void> {
    try {
      const savedData = localStorage.getItem(path);
      if (!savedData) throw new Error('No saved data found');

      const { config, vocabulary, reverseVocabulary } = JSON.parse(savedData);
      this.config = config;
      this.vocabulary = new Map(vocabulary);
      this.reverseVocabulary = new Map(reverseVocabulary);

      this.encoder = await tf.loadLayersModel(`localstorage://${path}-encoder`);
      this.decoder = await tf.loadLayersModel(`localstorage://${path}-decoder`);
      await this.reservoir.load(`${path}-reservoir`);

      Logger.info('Language processor loaded');
    } catch (error) {
      Logger.error('Failed to load language processor:', error);
      throw error;
    }
  }

  dispose(): void {
    this.encoder.dispose();
    this.decoder.dispose();
    this.reservoir.dispose();
  }
}