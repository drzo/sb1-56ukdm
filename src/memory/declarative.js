// Declarative memory system using Prolog-style rules
export class DeclarativeMemory {
  constructor() {
    this.facts = new Map();
    this.rules = new Map();
  }

  // Add a fact to memory
  assertFact(predicate, args) {
    const key = `${predicate}(${args.join(',')})`;
    this.facts.set(key, {
      predicate,
      args,
      timestamp: Date.now()
    });
  }

  // Add a rule (implication)
  addRule(head, body) {
    this.rules.set(head.predicate, {
      head,
      body,
      type: 'RULE'
    });
  }

  // Query facts and rules
  query(predicate, args) {
    const matches = [];
    
    // Direct fact matches
    for (const [key, fact] of this.facts) {
      if (this.unify(predicate, args, fact)) {
        matches.push(fact);
      }
    }

    // Rule-based inference
    for (const rule of this.rules.values()) {
      if (this.unify(predicate, args, rule.head)) {
        const derived = this.evaluateRule(rule, args);
        matches.push(...derived);
      }
    }

    return matches;
  }

  // Unification algorithm
  unify(pred1, args1, fact) {
    if (pred1 !== fact.predicate) return false;
    if (args1.length !== fact.args.length) return false;

    const bindings = new Map();
    for (let i = 0; i < args1.length; i++) {
      const arg1 = args1[i];
      const arg2 = fact.args[i];

      if (this.isVariable(arg1)) {
        bindings.set(arg1, arg2);
      } else if (arg1 !== arg2) {
        return false;
      }
    }

    return bindings;
  }

  isVariable(term) {
    return typeof term === 'string' && term.startsWith('?');
  }
}