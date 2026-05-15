import OpenAI from 'openai';
import type { GenerateNotesOptions } from '../../types';
import { buildNotesPrompt } from './prompt';

const MODEL = 'llama-3.3-70b-versatile';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

// Groq's llama-3.3-70b-versatile supports up to 32 768 output tokens, but we
// cap at 4 096 to keep latency fast and avoid hitting the free-tier rate limit.
const MAX_TOKENS = 4096;

export async function validateGroqKey(apiKey: string): Promise<void> {
  const res = await fetch(`${GROQ_BASE_URL}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (res.status === 401) {
    throw new Error('Invalid API key. Check your Groq key and try again.');
  }
  if (res.status === 429) {
    throw new Error('Rate limit exceeded. Wait a moment and try again.');
  }
  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status}`);
  }
}

export async function generateWithGroq(
  options: GenerateNotesOptions
): Promise<string> {
  const { transcript, meetingTitle, config, onStage } = options;

  onStage({ stage: 'Connecting to Groq', detail: 'Initialising Llama 3.3 70B...' });

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: GROQ_BASE_URL,
    dangerouslyAllowBrowser: true,
  });

  onStage({ stage: 'Analysing transcript', detail: 'Reading transcript and identifying speakers...' });

  const prompt = buildNotesPrompt(transcript, meetingTitle);

  onStage({ stage: 'Generating report', detail: 'Extracting action items, decisions, and summaries...' });

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: MAX_TOKENS,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text || !text.trim()) throw new Error('Groq returned an empty response. Please try again.');
  return text;
}
