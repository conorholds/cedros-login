import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';
import { resetMockState } from './mocks/handlers';
import { clearSharedReads } from '../utils/requestCache';

// Mock window.matchMedia for components that use media queries
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

function describeUnhandledRequest(request: Request) {
  return `Unhandled ${request.method} request to ${request.url}. Add an MSW handler or stub fetch explicitly.`;
}

// Start MSW server before all tests. Fail closed so stale API paths cannot
// silently bypass MSW and hit a real network endpoint during local or CI runs.
beforeAll(() => {
  server.listen({
    onUnhandledRequest(request) {
      throw new Error(describeUnhandledRequest(request));
    },
  });
  resetMockState(); // Initialize mock state with default test user
});

// Reset handlers, mock state, and cleanup React components after each test
afterEach(() => {
  cleanup();
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('cedros_last_account');
  }
  server.resetHandlers();
  resetMockState();
  clearSharedReads();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});
