import OpenAI from 'openai';
import type { GenerateNotesOptions } from '../../types';
import { buildNotesPrompt } from './prompt';

const MODEL = 'gpt-4o';

// Cap output tokens to keep cost & latency predictable.
// A thorough meeting report rarely exceeds 4 096 tokens.
const MAX_TOKENS = 4096;

export async function validateOpenAIKey(apiKey: string): Promise<void> {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (res.status === 401) {
    throw new Error('Invalid API key. Check your OpenAI key and try again.');
  }
  if (res.status === 429) {
    throw new Error('Rate limit or quota exceeded. Check your OpenAI billing.');
  }
  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status}`);
  }
}

export async function generateWithOpenAI(
  options: GenerateNotesOptions
): Promise<string> {
  const { transcript, meetingTitle, config, onStage } = options;

  onStage({ stage: 'Connecting to OpenAI', detail: 'Initialising GPT-4o...' });

  const client = new OpenAI({ apiKey: config.apiKey, dangerouslyAllowBrowser: true });

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
  if (!text || !text.trim()) throw new Error('OpenAI returned an empty response. Please try again.');
  return text;
}
