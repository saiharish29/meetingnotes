export type Provider = 'gemini' | 'openai' | 'groq';

export interface StoredConfig {
  provider: Provider;
  apiKey: string;
}

export type AppScreen = 'setup' | 'input' | 'processing' | 'report';

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
