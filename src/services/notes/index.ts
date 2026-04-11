import type { Provider, StoredConfig, GenerateNotesOptions } from '../../types';
import { validateGeminiKey, generateWithGemini } from './gemini';
import { validateOpenAIKey, generateWithOpenAI } from './openai';
import { validateGroqKey, generateWithGroq } from './groq';

export interface ProviderMeta {
  id: Provider;
  name: string;
  tagline: string;
  model: string;
  keyHint: string;
  keyLink: string;
  keyLinkLabel: string;
  hasFreeTeir: boolean;
  speed: 'fast' | 'medium' | 'slow';
}

export const PROVIDERS: ProviderMeta[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    tagline: 'Best quality, large context, free tier',
    model: 'gemini-2.5-flash',
    keyHint: 'AIza...',
    keyLink: 'https://aistudio.google.com/app/apikey',
    keyLinkLabel: 'Get key from Google AI Studio',
    hasFreeTeir: true,
    speed: 'medium',
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4o',
    tagline: 'Highest accuracy for structured extraction',
    model: 'gpt-4o',
    keyHint: 'sk-...',
    keyLink: 'https://platform.openai.com/api-keys',
    keyLinkLabel: 'Get key from OpenAI',
    hasFreeTeir: false,
    speed: 'medium',
  },
  {
    id: 'groq',
    name: 'Groq',
    tagline: 'Fastest inference, free tier',
    model: 'llama-3.3-70b-versatile',
    keyHint: 'gsk_...',
    keyLink: 'https://console.groq.com/keys',
    keyLinkLabel: 'Get key from Groq Console',
    hasFreeTeir: true,
    speed: 'fast',
  },
];

export async function validateApiKey(provider: Provider, apiKey: string): Promise<void> {
  switch (provider) {
    case 'gemini': return validateGeminiKey(apiKey);
    case 'openai': return validateOpenAIKey(apiKey);
    case 'groq': return validateGroqKey(apiKey);
  }
}

export async function generateNotes(options: GenerateNotesOptions): Promise<string> {
  switch (options.config.provider) {
    case 'gemini': return generateWithGemini(options);
    case 'openai': return generateWithOpenAI(options);
    case 'groq': return generateWithGroq(options);
  }
}

export function getProviderMeta(provider: Provider): ProviderMeta {
  return PROVIDERS.find(p => p.id === provider)!;
}

export function extractAttendees(transcript: string): string[] {
  const names = new Set<string>();
  const pattern = /^\[\d{2}:\d{2}:\d{2}\]\s+([^:]+):/gm;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(transcript)) !== null) {
    const name = match[1].trim();
    if (name) names.add(name);
  }
  return Array.from(names);
}

export type { StoredConfig };
