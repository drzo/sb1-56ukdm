import * as tf from '@tensorflow/tfjs';
import { Logger } from '../../cogutil/Logger';

export class SignalProcessor {
  private vocabulary: Map<string, number>;
  private readonly maxSequenceLength = 50;
  private readonly embeddingSize = 64;
  private encoder: tf.LayersModel | null = null;
  private decoder: tf.LayersModel | null = null;

  constructor() {
    this.vocabulary = new Map();
    this.initializeModels();
    Logger.info('SignalProcessor initialized');
  }

  private async initializeModels(): Promise<void> {
    try {
      // Encoder model
      const encoderInput = tf.input({shape: [this.maxSequenceLength]});
      const embedding = tf.layers.embedding({
        inputDim: 1000,
        outputDim: this.embeddingSize,
        inputLength: this.maxSequenceLength
      }).apply(encoderInput);
      
      const encoded = tf.layers.lstm({
        units: this.embeddingSize,
        returnSequences: false
      }).apply(embedding);

      this.encoder = tf.model({
        inputs: encoderInput,
        outputs: encoded
      });

      // Decoder model
      const decoderInput = tf.input({shape: [this.embeddingSize]});
      const decoded = tf.layers.dense({
        units: this.maxSequenceLength * 1000,
        activation: 'softmax'
      }).apply(decoderInput);

      this.decoder = tf.model({
        inputs: decoderInput,
        outputs: decoded
      });

      Logger.info('Signal processing models initialized');
    } catch (error) {
      Logger.error('Failed to initialize models:', error);
      throw error;
    }
  }

  async encode(signal: string): Promise<Float32Array> {
    try {
      // Tokenize and pad signal
      const tokens = this.tokenize(signal);
      const padded = this.pad(tokens);
      
      // Convert to tensor
      const input = tf.tensor2d([padded], [1, this.maxSequenceLength]);
      
      // Encode
      const encoded = this.encoder!.predict(input) as tf.Tensor;
      const result = await encoded.data();
      
      // Cleanup
      input.dispose();
      encoded.dispose();
      
      return new Float32Array(result);
    } catch (error) {
      Logger.error('Failed to encode signal:', error);
      throw error;
    }
  }

  async decode(
    embedding: tf.Tensor2D,
    messageType: string
  ): Promise<string> {
    try {
      // Generate sequence probabilities
      const output = this.decoder!.predict(embedding) as tf.Tensor;
      const probabilities = await output.array();
      
      // Convert to tokens
      const tokens = this.convertToTokens(probabilities[0]);
      
      // Format based on message type
      const response = this.formatResponse(tokens, messageType);
      
      // Cleanup
      output.dispose();
      
      return response;
    } catch (error) {
      Logger.error('Failed to decode embedding:', error);
      throw error;
    }
  }

  private tokenize(signal: string): number[] {
    return signal.toLowerCase()
      .split(' ')
      .map(token => {
        if (!this.vocabulary.has(token)) {
          this.vocabulary.set(token, this.vocabulary.size);
        }
        return this.vocabulary.get(token)!;
      });
  }

  private pad(tokens: number[]): number[] {
    if (tokens.length >= this.maxSequenceLength) {
      return tokens.slice(0, this.maxSequenceLength);
    }
    return [...tokens, ...new Array(this.maxSequenceLength - tokens.length).fill(0)];
  }

  private convertToTokens(probabilities: number[]): string[] {
    const reverseVocab = new Map(
      Array.from(this.vocabulary.entries()).map(([k, v]) => [v, k])
    );
    
    const tokens: string[] = [];
    for (let i = 0; i < probabilities.length; i += 1000) {
      const tokenProbs = probabilities.slice(i, i + 1000);
      const tokenId = tokenProbs.indexOf(Math.max(...tokenProbs));
      if (tokenId > 0 && reverseVocab.has(tokenId)) {
        tokens.push(reverseVocab.get(tokenId)!);
      }
    }
    return tokens;
  }

  private formatResponse(tokens: string[], messageType: string): string {
    const response = tokens.join(' ').trim();
    switch (messageType) {
      case 'query':
        return `Query: ${response}?`;
      case 'response':
        return `Response: ${response}.`;
      case 'alert':
        return `Alert! ${response}!`;
      case 'status':
        return `Status: ${response}`;
      default:
        return response;
    }
  }

  async save(): Promise<void> {
    try {
      if (this.encoder && this.decoder) {
        await this.encoder.save('localstorage://signal-encoder');
        await this.decoder.save('localstorage://signal-decoder');
      }
    } catch (error) {
      Logger.error('Failed to save models:', error);
      throw error;
    }
  }

  async load(): Promise<void> {
    try {
      this.encoder = await tf.loadLayersModel('localstorage://signal-encoder');
      this.decoder = await tf.loadLayersModel('localstorage://signal-decoder');
    } catch (error) {
      Logger.error('Failed to load models:', error);
      throw error;
    }
  }

  dispose(): void {
    this.encoder?.dispose();
    this.decoder?.dispose();
  }
}