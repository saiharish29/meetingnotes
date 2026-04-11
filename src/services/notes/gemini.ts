import { GoogleGenAI } from '@google/genai';
import type { GenerateNotesOptions } from '../../types';
import { buildNotesPrompt } from './prompt';

const MODEL = 'gemini-2.5-flash';

export async function validateGeminiKey(apiKey: string): Promise<void> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );
  if (res.status === 400 || res.status === 403) {
    throw new Error('Invalid API key. Check your Gemini key and try again.');
  }
  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }
}

export async function generateWithGemini(
  options: GenerateNotesOptions
): Promise<string> {
  const { transcript, meetingTitle, config, onStage } = options;

  onStage({ stage: 'Connecting to Gemini', detail: 'Initialising Gemini 2.5 Flash...' });

  const ai = new GoogleGenAI({ apiKey: config.apiKey });

  onStage({ stage: 'Analysing transcript', detail: 'Reading transcript and identifying speakers...' });

  const prompt = buildNotesPrompt(transcript, meetingTitle);

  onStage({ stage: 'Generating report', detail: 'Extracting action items, decisions, and summaries...' });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  const text = response.text;
  if (!text) throw new Error('Gemini returned an empty response.');
  return text;
}
