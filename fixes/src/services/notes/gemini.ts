import { GoogleGenAI } from '@google/genai';
import type { GenerateNotesOptions } from '../../types';
import { buildNotesPrompt } from './prompt';

const MODEL = 'gemini-2.5-flash';

// Maximum tokens to request — keeps cost predictable and prevents timeouts on
// very large transcripts.  A thorough meeting report rarely exceeds 4 096 tokens.
const MAX_OUTPUT_TOKENS = 4096;

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
    config: { maxOutputTokens: MAX_OUTPUT_TOKENS },
  });

  // ── Safety / candidate checks ──────────────────────────────────────────────
  // response.text is a getter in @google/genai v1.x that THROWS if the model
  // returned no text parts (e.g. safety block, MAX_TOKENS finish without text).
  // Always inspect candidates first so we can surface a meaningful message.

  const candidate = response.candidates?.[0];

  if (!candidate) {
    throw new Error(
      'Gemini returned no response. The transcript may have triggered a safety filter — try removing any sensitive language.'
    );
  }

  const finishReason = candidate.finishReason as string | undefined;
  if (finishReason && finishReason !== 'STOP') {
    if (finishReason === 'SAFETY') {
      throw new Error(
        'Gemini blocked the response due to safety filters. Try shortening or rephrasing the transcript.'
      );
    }
    if (finishReason === 'MAX_TOKENS') {
      throw new Error(
        'Gemini hit the output token limit. Try shortening the transcript or splitting it into smaller sections.'
      );
    }
    throw new Error(`Gemini stopped early (reason: ${finishReason}). Please try again.`);
  }

  // Safely access .text — wrap in try/catch in case the SDK throws internally
  let text: string | undefined;
  try {
    text = response.text;
  } catch (sdkErr) {
    throw new Error(
      `Gemini response could not be read as text: ${sdkErr instanceof Error ? sdkErr.message : String(sdkErr)}`
    );
  }

  if (!text || !text.trim()) {
    throw new Error('Gemini returned an empty response. Please try again.');
  }

  return text;
}
