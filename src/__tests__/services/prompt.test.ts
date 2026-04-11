import { describe, it, expect } from 'vitest';
import { buildNotesPrompt } from '../../services/notes/prompt';

describe('buildNotesPrompt', () => {
  it('includes the transcript verbatim', () => {
    const transcript = '[00:00:00] Alice: Hello world.';
    const prompt = buildNotesPrompt(transcript, 'Test Meeting');
    expect(prompt).toContain('[00:00:00] Alice: Hello world.');
  });

  it('includes the meeting title', () => {
    const prompt = buildNotesPrompt('transcript', 'Q4 Review');
    expect(prompt).toContain('Q4 Review');
  });

  it('falls back to Untitled Meeting when title is empty', () => {
    const prompt = buildNotesPrompt('transcript', '');
    expect(prompt).toContain('Untitled Meeting');
  });

  it('instructs the model to output all required sections', () => {
    const prompt = buildNotesPrompt('transcript', 'Meeting');
    expect(prompt).toContain('## 1. Executive Summary');
    expect(prompt).toContain('### 2.1 Topics Discussed');
    expect(prompt).toContain('### 2.2 Key Discussion Points');
    expect(prompt).toContain('### 2.3 Decisions');
    expect(prompt).toContain('### 2.4 Action Items');
    expect(prompt).toContain('### 2.5 Risks / Issues');
    expect(prompt).toContain('### 2.6 Follow-ups Needed');
    expect(prompt).toContain('### 2.7 Open Questions');
  });

  it('instructs the model not to invent information', () => {
    const prompt = buildNotesPrompt('transcript', 'Meeting');
    expect(prompt).toMatch(/do not invent/i);
  });

  it('instructs detection of attendees from timestamp pattern', () => {
    const prompt = buildNotesPrompt('transcript', 'Meeting');
    expect(prompt).toContain('[HH:MM:SS]');
  });

  it('requests a markdown table for action items with Notes column', () => {
    const prompt = buildNotesPrompt('transcript', 'Meeting');
    expect(prompt).toContain('| Task | Owner | Due Date | Notes |');
  });

  it('requests a Risks table with Severity and Mitigation columns', () => {
    const prompt = buildNotesPrompt('transcript', 'Meeting');
    expect(prompt).toContain('| Risk | Impact | Severity | Mitigation |');
  });

  it('requests a Decisions table with Context and Effective Date columns', () => {
    const prompt = buildNotesPrompt('transcript', 'Meeting');
    expect(prompt).toContain('| Decision | Owner | Context | Effective Date |');
  });
});
