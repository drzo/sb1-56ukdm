import { PythonBridge } from '../integrations/PythonBridge';

export class MeTTaIntegration {
  private bridge: PythonBridge;
  private templates: Map<string, { template: string, parameters: string[] }>;

  constructor() {
    this.bridge = new PythonBridge();
    this.templates = new Map();
  }

  async connect(): Promise<void> {
    await this.bridge.connect();
  }

  addTemplate(name: string, template: string, parameters: string[]) {
    this.templates.set(name, { template, parameters });
  }

  async executeTemplate(name: string, params: Record<string, string>): Promise<string> {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template ${name} not found`);
    }

    const result = await this.bridge.sendCommand('metta_execute', {
      template: name,
      params: params
    });

    return result;
  }

  async chainTemplates(templateNames: string[], initialParams: Record<string, string>): Promise<string[]> {
    const results: string[] = [];
    let currentParams = { ...initialParams };

    for (const templateName of templateNames) {
      const result = await this.executeTemplate(templateName, currentParams);
      results.push(result);
      currentParams = { ...currentParams, previousResult: result };
    }

    return results;
  }

  async disconnect(): Promise<void> {
    this.bridge.disconnect();
  }
}