import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CogServer } from '../../cogserver/CogServer';
import { CogModule } from '../../cogserver/CogModule';

class TestModule extends CogModule {
  public runCount = 0;

  constructor() {
    super('test-module', 1);
  }

  async run(): Promise<void> {
    this.runCount++;
  }

  cleanup(): void {
    // Cleanup logic
  }
}

describe('CogServer', () => {
  let cogserver: CogServer;
  let testModule: TestModule;

  beforeEach(() => {
    cogserver = CogServer.getInstance();
    testModule = new TestModule();
  });

  afterEach(() => {
    cogserver.stop();
  });

  it('should maintain singleton instance', () => {
    const instance1 = CogServer.getInstance();
    const instance2 = CogServer.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should register and unregister modules', () => {
    cogserver.registerModule(testModule);
    expect(cogserver.getModuleCount()).toBe(1);
    expect(cogserver.getActiveModules()).toHaveLength(0);

    testModule.enable();
    expect(cogserver.getActiveModules()).toHaveLength(1);

    cogserver.unregisterModule(testModule.getId());
    expect(cogserver.getModuleCount()).toBe(0);
  });

  it('should start and stop server', async () => {
    const port = 3001;
    
    cogserver.start(port);
    expect(cogserver.getCycleCount()).toBe(0);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    cogserver.stop();
    expect(cogserver.getCycleCount()).toBeGreaterThan(0);
  });
});