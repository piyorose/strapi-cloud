import { format } from 'util';

/* -------------------------------------------------------------------------------------------------
 * IntersectionObserver
 * -----------------------------------------------------------------------------------------------*/

const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

/* -------------------------------------------------------------------------------------------------
 * ResizeObserver
 * -----------------------------------------------------------------------------------------------*/

const mockResizeObserver = jest.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.ResizeObserver = mockResizeObserver;

/* -------------------------------------------------------------------------------------------------
 * ResizeObserver
 * -----------------------------------------------------------------------------------------------*/

/**
 * If there's a prop type error then we want to throw an
 * error so that the test fails.
 *
 * NOTE: This can be removed once we move to a typescript
 * setup & we throw tests on type errors.
 */

const error = console.error;
window.console = {
  ...window.console,
  error(...args: any[]) {
    error(...args);

    const message = format(...args);

    if (/(Invalid prop|Failed prop type)/gi.test(message)) {
      throw new Error(message);
    }
  },
};

/* -------------------------------------------------------------------------------------------------
 * Strapi
 * -----------------------------------------------------------------------------------------------*/

window.strapi = {
  backendURL: 'http://localhost:1337',
  isEE: false,
  features: {
    SSO: 'sso',
    isEnabled: () => false,
  },
  projectType: 'Community',
};

/* -------------------------------------------------------------------------------------------------
 * matchMedia
 * -----------------------------------------------------------------------------------------------*/

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    /**
     * @deprecated
     */
    addListener: jest.fn(),
    /**
     * @deprecated
     */
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

/* -------------------------------------------------------------------------------------------------
 * scrollTo
 * -----------------------------------------------------------------------------------------------*/

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

/* -------------------------------------------------------------------------------------------------
 * prompt
 * -----------------------------------------------------------------------------------------------*/

Object.defineProperty(window, 'prompt', {
  writable: true,
  value: jest.fn(),
});

/* -------------------------------------------------------------------------------------------------
 * URL
 * -----------------------------------------------------------------------------------------------*/

Object.defineProperty(window, 'URL', {
  writable: true,
  value: {
    createObjectURL: jest
      .fn()
      .mockImplementation((file) => `http://localhost:4000/assets/${file.name}`),
  },
});

/* -------------------------------------------------------------------------------------------------
 * createRange
 * -----------------------------------------------------------------------------------------------*/

document.createRange = () => {
  const range = new Range();
  range.getClientRects = jest.fn(() => ({
    item: () => null,
    length: 0,
  }));

  return range;
};

/* -------------------------------------------------------------------------------------------------
 * localStorage
 * -----------------------------------------------------------------------------------------------*/

class LocalStorageMock {
  store: Record<string, string>;

  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: new LocalStorageMock(),
});
