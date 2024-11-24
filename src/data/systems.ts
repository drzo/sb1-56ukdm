import { Node, Link, Group, SystemData } from '../lib/types';

export const systems: SystemData = {
  groups: [
    { id: 'core', name: 'Core Systems', color: '#3b82f6' },
    { id: 'attention', name: 'Attention Systems', color: '#10b981' },
    { id: 'reasoning', name: 'Reasoning Systems', color: '#f59e0b' },
    { id: 'memory', name: 'Memory Systems', color: '#8b5cf6' }
  ],
  nodes: [
    // Core Systems
    {
      id: 'atomspace',
      name: 'AtomSpace',
      group: 'core',
      color: '#3b82f6',
      description: 'Core knowledge representation system'
    },
    {
      id: 'truthvalues',
      name: 'TruthValues',
      group: 'core',
      color: '#3b82f6',
      description: 'Probabilistic truth value system'
    },
    {
      id: 'types',
      name: 'Type System',
      group: 'core',
      color: '#3b82f6',
      description: 'Atom type hierarchy and validation'
    },

    // Memory Systems
    {
      id: 'episodic',
      name: 'Episodic Memory',
      group: 'memory',
      color: '#8b5cf6',
      description: 'Storage and retrieval of experiences and events'
    },
    {
      id: 'semantic',
      name: 'Semantic Memory',
      group: 'memory',
      color: '#8b5cf6',
      description: 'Long-term storage of concepts and relationships'
    },
    {
      id: 'procedural',
      name: 'Procedural Memory',
      group: 'memory',
      color: '#8b5cf6',
      description: 'Storage of skills and procedures'
    },
    {
      id: 'working',
      name: 'Working Memory',
      group: 'memory',
      color: '#8b5cf6',
      description: 'Short-term active memory and attention buffer'
    },
    {
      id: 'declarative',
      name: 'Declarative Memory',
      group: 'memory',
      color: '#8b5cf6',
      description: 'Explicit knowledge and facts storage'
    },
    {
      id: 'associative',
      name: 'Associative Memory',
      group: 'memory',
      color: '#8b5cf6',
      description: 'Pattern-based memory retrieval and association'
    },
    {
      id: 'distributed',
      name: 'Distributed Memory',
      group: 'memory',
      color: '#8b5cf6',
      description: 'Decentralized memory storage across the network'
    },
    {
      id: 'temporal',
      name: 'Temporal Memory',
      group: 'memory',
      color: '#8b5cf6',
      description: 'Time-based patterns and sequence storage'
    },

    // Attention Systems
    {
      id: 'ecan',
      name: 'ECAN',
      group: 'attention',
      color: '#10b981',
      description: 'Economic Attention Network'
    },
    {
      id: 'hebbian',
      name: 'Hebbian',
      group: 'attention',
      color: '#10b981',
      description: 'Hebbian learning system'
    },
    {
      id: 'importance',
      name: 'Importance',
      group: 'attention',
      color: '#10b981',
      description: 'Attention allocation system'
    },

    // Reasoning Systems
    {
      id: 'pln',
      name: 'PLN',
      group: 'reasoning',
      color: '#f59e0b',
      description: 'Probabilistic Logic Networks'
    },
    {
      id: 'rules',
      name: 'Rules',
      group: 'reasoning',
      color: '#f59e0b',
      description: 'Inference rule system'
    },
    {
      id: 'patterns',
      name: 'Patterns',
      group: 'reasoning',
      color: '#f59e0b',
      description: 'Pattern matching and mining'
    }
  ],
  links: [
    // Core System Links
    { source: 'atomspace', target: 'truthvalues', value: 2 },
    { source: 'atomspace', target: 'types', value: 2 },
    { source: 'truthvalues', target: 'types', value: 1 },

    // Memory System Links
    { source: 'episodic', target: 'semantic', value: 2 },
    { source: 'semantic', target: 'declarative', value: 2 },
    { source: 'procedural', target: 'working', value: 2 },
    { source: 'working', target: 'episodic', value: 2 },
    { source: 'associative', target: 'semantic', value: 2 },
    { source: 'distributed', target: 'associative', value: 1 },
    { source: 'temporal', target: 'episodic', value: 2 },
    { source: 'temporal', target: 'procedural', value: 1 },
    { source: 'working', target: 'associative', value: 2 },
    { source: 'declarative', target: 'associative', value: 2 },

    // Attention System Links
    { source: 'ecan', target: 'hebbian', value: 2 },
    { source: 'ecan', target: 'importance', value: 2 },
    { source: 'hebbian', target: 'importance', value: 1 },

    // Reasoning System Links
    { source: 'pln', target: 'rules', value: 2 },
    { source: 'pln', target: 'patterns', value: 2 },
    { source: 'rules', target: 'patterns', value: 1 },

    // Cross-System Links
    { source: 'atomspace', target: 'ecan', value: 2 },
    { source: 'atomspace', target: 'pln', value: 2 },
    { source: 'atomspace', target: 'episodic', value: 2 },
    { source: 'atomspace', target: 'working', value: 2 },
    { source: 'ecan', target: 'working', value: 2 },
    { source: 'hebbian', target: 'associative', value: 2 },
    { source: 'pln', target: 'semantic', value: 2 },
    { source: 'patterns', target: 'associative', value: 2 },
    { source: 'importance', target: 'working', value: 1 }
  ]
};