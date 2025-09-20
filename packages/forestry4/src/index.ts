// Internal base class - not intended for direct use
export { Store } from './Stores/Store';

// Primary class for state management - extend this to create custom stores
export { Forest } from './Stores/Forest';
// ForestBranch is now merged into Forest

// Export types for better TypeScript support
export type {
  ValueTestFn,
  Listener,
  ValidationResult,
  ForestMessage,
  Validity,
  StoreIF,
  ResourceMap,
  StoreParams,
  Path,
} from './types';
