import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenRouterAIProvider, getAIProvider, DeterministicAIProvider } from '@/lib/ai/provider';

describe('OpenRouter AI Provider & Graceful Fallback', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('falls back to deterministic provider when API key is empty or placeholder', async () => {
    const provider = new OpenRouterAIProvider('YOUR_EXISTING_OPENROUTER_KEY');
    const result = await provider.generateText('Tell me about running shoes');

    expect(result).toBeDefined();
    expect(result.message).toContain('Velocity Runner Pro');
  });

  it('returns valid OpenRouter completion when API responds successfully', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: 'Here is an AI-generated commercial insight for running gear.',
          },
        },
      ],
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const provider = new OpenRouterAIProvider('sk-or-v1-valid-test-key', 'google/gemini-2.5-flash');
    const result = await provider.generateText('Recommend high margin products');

    expect(result.message).toBe('Here is an AI-generated commercial insight for running gear.');
    expect(result.suggestedFollowUps).toBeDefined();
  });

  it('gracefully falls back to deterministic provider on network failure or 500 error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    } as Response);

    const provider = new OpenRouterAIProvider('sk-or-v1-valid-test-key');
    const result = await provider.generateText('Which product should I bundle?');

    expect(result).toBeDefined();
    expect(result.message).toContain('Velocity Runner Pro');
  });

  it('getAIProvider returns DeterministicAIProvider when AI_PROVIDER is deterministic', () => {
    process.env.AI_PROVIDER = 'deterministic';
    process.env.OPENROUTER_API_KEY = '';

    const provider = getAIProvider();
    expect(provider.name).toBe('deterministic');
  });

  it('getAIProvider returns OpenRouterAIProvider when AI_PROVIDER is openrouter and key is present', () => {
    process.env.AI_PROVIDER = 'openrouter';
    process.env.OPENROUTER_API_KEY = 'sk-or-v1-real-key-123';
    process.env.DEFAULT_AI_MODEL = 'google/gemini-2.5-flash';

    const provider = getAIProvider();
    expect(provider.name).toBe('openrouter');
  });
});
