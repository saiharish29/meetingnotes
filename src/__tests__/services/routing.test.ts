import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PROVIDERS, getProviderMeta, extractAttendees } from '../../services/notes';

describe('PROVIDERS', () => {
  it('has exactly 3 providers', () => {
    expect(PROVIDERS).toHaveLength(3);
  });

  it('includes gemini, openai, groq', () => {
    const ids = PROVIDERS.map(p => p.id);
    expect(ids).toContain('gemini');
    expect(ids).toContain('openai');
    expect(ids).toContain('groq');
  });

  it('each provider has required fields', () => {
    for (const p of PROVIDERS) {
      expect(p.name).toBeTruthy();
      expect(p.tagline).toBeTruthy();
      expect(p.model).toBeTruthy();
      expect(p.keyHint).toBeTruthy();
      expect(p.keyLink).toBeTruthy();
    }
  });

  it('uses correct hardcoded models', () => {
    expect(PROVIDERS.find(p => p.id === 'gemini')?.model).toBe('gemini-2.5-flash');
    expect(PROVIDERS.find(p => p.id === 'openai')?.model).toBe('gpt-4o');
    expect(PROVIDERS.find(p => p.id === 'groq')?.model).toBe('llama-3.3-70b-versatile');
  });
});

describe('getProviderMeta', () => {
  it('returns the correct provider', () => {
    expect(getProviderMeta('gemini').name).toBe('Google Gemini');
    expect(getProviderMeta('openai').name).toBe('OpenAI GPT-4o');
    expect(getProviderMeta('groq').name).toBe('Groq');
  });
});

describe('extractAttendees', () => {
  it('extracts names from timestamped lines', () => {
    const transcript = `[00:00:00] Alice: Good morning.
[00:00:10] Bob: Hello!
[00:01:00] Alice: Let's begin.`;
    const attendees = extractAttendees(transcript);
    expect(attendees).toContain('Alice');
    expect(attendees).toContain('Bob');
    expect(attendees).toHaveLength(2);
  });

  it('deduplicates names', () => {
    const transcript = `[00:00:00] Alice: One.
[00:00:10] Alice: Two.
[00:00:20] Alice: Three.`;
    const attendees = extractAttendees(transcript);
    expect(attendees).toHaveLength(1);
    expect(attendees[0]).toBe('Alice');
  });

  it('returns empty array for transcript without timestamps', () => {
    expect(extractAttendees('Just some text without timestamps.')).toHaveLength(0);
  });

  it('returns empty array for empty string', () => {
    expect(extractAttendees('')).toHaveLength(0);
  });

  it('handles names with spaces', () => {
    const transcript = '[00:00:00] John Smith: Hello.';
    const attendees = extractAttendees(transcript);
    expect(attendees).toContain('John Smith');
  });
});

describe('validateApiKey routing', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('calls Gemini models endpoint for gemini provider', async () => {
    const { validateApiKey } = await import('../../services/notes');
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 200 });
    await validateApiKey('gemini', 'AIzaTest');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com')
    );
  });

  it('calls OpenAI models endpoint for openai provider', async () => {
    const { validateApiKey } = await import('../../services/notes');
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 200 });
    await validateApiKey('openai', 'sk-test');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.openai.com'),
      expect.any(Object)
    );
  });

  it('calls Groq models endpoint for groq provider', async () => {
    const { validateApiKey } = await import('../../services/notes');
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, status: 200 });
    await validateApiKey('groq', 'gsk-test');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.groq.com'),
      expect.any(Object)
    );
  });
});
