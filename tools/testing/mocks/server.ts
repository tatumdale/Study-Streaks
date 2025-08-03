import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Mock Service Worker server for Node.js environment
 * Used in Jest tests and Node.js test environments
 */
export const server = setupServer(...handlers);

// Export individual handlers for testing
export { handlers } from './handlers';