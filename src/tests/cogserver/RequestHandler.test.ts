import { describe, it, expect, beforeEach } from 'vitest';
import { RequestHandler } from '../../cogserver/RequestHandler';
import { NodeType } from '../../types/AtomTypes';

describe('RequestHandler', () => {
  let handler: RequestHandler;

  beforeEach(() => {
    handler = new RequestHandler();
  });

  it('should handle addNode requests', async () => {
    const request = {
      type: 'addNode',
      data: {
        type: NodeType.CONCEPT,
        name: 'TestNode',
        truthValue: { strength: 0.8, confidence: 0.9 }
      },
      requestId: '1'
    };

    const result = await handler.handleRequest(request);
    expect(result).toBeDefined();
    expect(result.getType()).toBe(NodeType.CONCEPT);
    expect(result.getTruthValue().strength).toBe(0.8);
  });

  it('should handle custom registered handlers', async () => {
    const customHandler = async (data: any) => ({ processed: data });
    handler.registerHandler('custom', customHandler);

    const request = {
      type: 'custom',
      data: { test: true },
      requestId: '2'
    };

    const result = await handler.handleRequest(request);
    expect(result).toEqual({ processed: { test: true } });
  });

  it('should throw error for unknown request types', async () => {
    const request = {
      type: 'unknown',
      data: {},
      requestId: '3'
    };

    await expect(handler.handleRequest(request)).rejects.toThrow('Unsupported request type');
  });
});