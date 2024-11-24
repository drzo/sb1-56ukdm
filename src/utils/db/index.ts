// Re-export all database functionality
export * from './core';
export * from './operations';
export * from './types';
export * from './migrations';
export * from './validation';
export * from './skills';

// Export singleton instance and initialization function
export { db as default, initDB } from './core';