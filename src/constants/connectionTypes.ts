import { ConnectionType } from '../types/memory';

export const CONNECTION_TYPES: { 
  type: ConnectionType; 
  label: string; 
  color: string;
  description: string;
}[] = [
  { 
    type: 'resonant',
    label: 'Pattern Resonance',
    color: 'bg-purple-500',
    description: 'Connects nodes that share similar patterns or structures'
  },
  { 
    type: 'causal',
    label: 'Causal Link',
    color: 'bg-blue-500',
    description: 'Represents cause-effect relationships between nodes'
  },
  { 
    type: 'temporal',
    label: 'Temporal Sequence',
    color: 'bg-green-500',
    description: 'Orders nodes in time-based sequences'
  },
  { 
    type: 'associative',
    label: 'Conceptual Association',
    color: 'bg-pink-500',
    description: 'Links nodes through shared concepts or contexts'
  }
];