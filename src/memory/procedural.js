// Procedural memory system using concurrent operations
export class ProceduralMemory {
  constructor() {
    this.procedures = new Map();
    this.executionQueue = [];
    this.running = false;
  }

  // Define a new procedure
  defineProcedure(name, steps, concurrent = false) {
    this.procedures.set(name, {
      name,
      steps,
      concurrent,
      dependencies: new Set(),
      state: 'idle'
    });
  }

  // Add dependency between procedures
  addDependency(proc1, proc2) {
    const procedure = this.procedures.get(proc1);
    if (procedure) {
      procedure.dependencies.add(proc2);
    }
  }

  // Execute a procedure
  async execute(name, params = {}) {
    const procedure = this.procedures.get(name);
    if (!procedure) throw new Error(`Procedure ${name} not found`);

    // Check dependencies
    for (const dep of procedure.dependencies) {
      const depProc = this.procedures.get(dep);
      if (depProc.state !== 'completed') {
        throw new Error(`Dependency ${dep} not satisfied`);
      }
    }

    procedure.state = 'running';
    
    try {
      if (procedure.concurrent) {
        // Execute steps concurrently
        await Promise.all(procedure.steps.map(step => 
          this.executeStep(step, params)
        ));
      } else {
        // Execute steps sequentially
        for (const step of procedure.steps) {
          await this.executeStep(step, params);
        }
      }
      
      procedure.state = 'completed';
      return true;
    } catch (error) {
      procedure.state = 'failed';
      throw error;
    }
  }

  async executeStep(step, params) {
    return new Promise((resolve, reject) => {
      try {
        const result = step(params);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Reset procedure state
  reset(name) {
    const procedure = this.procedures.get(name);
    if (procedure) {
      procedure.state = 'idle';
    }
  }
}