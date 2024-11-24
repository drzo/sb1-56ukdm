import { MemoryType } from '../types/memory';

export const MEMORY_TYPES: { type: MemoryType; label: string; color: string; description: string }[] = [
  { 
    type: 'procedural',
    label: 'Procedure Repository',
    color: 'bg-blue-500 hover:bg-blue-600',
    description: 'Stores hierarchical programs learned by nodes'
  },
  { 
    type: 'episodic',
    label: 'Associative Memory',
    color: 'bg-green-500 hover:bg-green-600', 
    description: 'Stores scenes the system has experienced or imagined'
  },
  { 
    type: 'declarative',
    label: 'Backup Store',
    color: 'bg-yellow-500 hover:bg-yellow-600',
    description: 'Stores "frozen" atoms for future access'
  },
  { 
    type: 'intentional',
    label: 'Attention Allocation',
    color: 'bg-purple-500 hover:bg-purple-600',
    description: 'Spreads short and long term importance values'
  }
];

export const MEMORY_TYPES_CONFIG = {
  procedural: {
    color: '#3B82F6',
    label: 'Procedure Repository',
    path: 'M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z M14 2v6h6 M8 13h8 M8 17h8 M8 9h8'
  },
  episodic: {
    color: '#10B981',
    label: 'Associative Memory',
    path: 'M22 2H2v20h20V2zM7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5'
  },
  declarative: {
    color: '#EAB308',
    label: 'Backup Store',
    path: 'M9 3.5V2m0 20v-1.5M3.5 9H2m20 0h-1.5M5.3 5.3l-1.1-1M19.8 19.8l-1.1-1.1M19.8 5.3l1.1-1.1M5.3 19.8l1.1-1.1M12 7a5 5 0 110 10 5 5 0 010-10z'
  },
  intentional: {
    color: '#8B5CF6',
    label: 'Attention Allocation',
    path: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 006 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M12 2v1M12 21v1M4.2 5.9l.9.9M18.9 5.9l-.9.9M12 12L4.2 5.9M12 12l6.7-6.1M12 12v9'
  }
};