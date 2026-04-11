import { describe, it, expect, beforeEach } from 'vitest';
import { loadConfig, saveConfig, clearConfig } from '../../services/config';

beforeEach(() => {
  localStorage.clear();
});

describe('loadConfig', () => {
  it('returns null when nothing is stored', () => {
    expect(loadConfig()).toBeNull();
  });

  it('returns null for corrupted JSON', () => {
    localStorage.setItem('mn_config', 'not-json');
    expect(loadConfig()).toBeNull();
  });

  it('returns null when provider is missing', () => {
    localStorage.setItem('mn_config', JSON.stringify({ apiKey: 'abc' }));
    expect(loadConfig()).toBeNull();
  });

  it('returns null when apiKey is missing', () => {
    localStorage.setItem('mn_config', JSON.stringify({ provider: 'gemini' }));
    expect(loadConfig()).toBeNull();
  });

  it('returns stored config when valid', () => {
    saveConfig({ provider: 'gemini', apiKey: 'AIzaFoo' });
    const config = loadConfig();
    expect(config).toEqual({ provider: 'gemini', apiKey: 'AIzaFoo' });
  });
});

describe('saveConfig', () => {
  it('persists to localStorage', () => {
    saveConfig({ provider: 'openai', apiKey: 'sk-bar' });
    const raw = localStorage.getItem('mn_config');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual({ provider: 'openai', apiKey: 'sk-bar' });
  });
});

describe('clearConfig', () => {
  it('removes config from localStorage', () => {
    saveConfig({ provider: 'groq', apiKey: 'gsk-baz' });
    clearConfig();
    expect(localStorage.getItem('mn_config')).toBeNull();
  });

  it('does not throw when nothing is stored', () => {
    expect(() => clearConfig()).not.toThrow();
  });
});
