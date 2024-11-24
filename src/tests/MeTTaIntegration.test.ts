import { describe, it, expect } from 'vitest';
import { MeTTaIntegration } from '../hyperon/MeTTaIntegration';

describe('MeTTaIntegration', () => {
  it('should execute templates', async () => {
    const metta = new MeTTaIntegration();
    
    metta.addTemplate(
      'greeting',
      'Hello, {name}!',
      ['name']
    );

    const result = await metta.executeTemplate('greeting', {
      name: 'World'
    });

    expect(result).toBe('Hello, World!');
  });

  it('should chain templates', async () => {
    const metta = new MeTTaIntegration();
    
    metta.addTemplate(
      'step1',
      'Process {input}',
      ['input']
    );
    
    metta.addTemplate(
      'step2',
      'Enhance {previousResult}',
      ['previousResult']
    );

    const results = await metta.chainTemplates(
      ['step1', 'step2'],
      { input: 'data' }
    );

    expect(results).toHaveLength(2);
    expect(results[0]).toBe('Process data');
    expect(results[1]).toBe('Enhance Process data');
  });
});