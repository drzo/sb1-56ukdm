// P-System Membrane implementation for reservoir compartments
export class PSystem {
  constructor() {
    this.membranes = new Map();
    this.rules = new Map();
  }

  // Create a new membrane compartment
  createMembrane(id, objects = []) {
    const membrane = {
      id,
      objects: new Set(objects),
      children: new Set(),
      parent: null
    };
    
    this.membranes.set(id, membrane);
    return membrane;
  }

  // Add evolution rule
  addRule(id, {
    from,
    to,
    condition = () => true
  }) {
    this.rules.set(id, { from, to, condition });
  }

  // Apply rules to evolve system
  evolve() {
    const changes = [];
    
    for (const [id, rule] of this.rules) {
      for (const [memId, membrane] of this.membranes) {
        if (rule.condition(membrane)) {
          // Objects matching rule pattern
          const matching = Array.from(membrane.objects)
            .filter(obj => rule.from.test(obj));
            
          if (matching.length > 0) {
            changes.push({
              membrane: memId,
              remove: matching,
              add: matching.map(obj => obj.replace(rule.from, rule.to))
            });
          }
        }
      }
    }
    
    // Apply changes
    for (const change of changes) {
      const membrane = this.membranes.get(change.membrane);
      change.remove.forEach(obj => membrane.objects.delete(obj));
      change.add.forEach(obj => membrane.objects.add(obj));
    }
    
    return changes;
  }

  // Get current system state
  getState() {
    const state = {};
    for (const [id, membrane] of this.membranes) {
      state[id] = Array.from(membrane.objects);
    }
    return state;
  }
}