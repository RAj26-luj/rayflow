import { vi } from 'vitest';
import { createMockPrisma } from './mockPrisma';

const mockPrisma = createMockPrisma();

vi.mock('@/lib/db/prisma', () => ({
  prisma: mockPrisma,
}));

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock canvas confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));
