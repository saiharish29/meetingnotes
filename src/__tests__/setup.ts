import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Fresh localStorage per test
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// Mock fetch globally
vi.stubGlobal('fetch', vi.fn());
