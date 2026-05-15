export type Provider = 'gemini' | 'openai' | 'groq';

export interface StoredConfig {
  provider: Provider;
  apiKey: string;
}

// Added 'error' to the union — previously missing, causing unsafe `as AppScreen` casts in App.tsx
export type AppScreen = 'setup' | 'input' | 'processing' | 'report' | 'error';

export interface ProcessingStage {
  stage: string;
  detail: string;
}

export interface GenerateNotesOptions {
  transcript: string;
  meetingTitle: string;
  config: StoredConfig;
  onStage: (stage: ProcessingStage) => void;
}
