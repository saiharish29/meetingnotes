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
    expect(prompt).toContain('## Meeting Summary');
    expect(prompt).toContain('## Attendees');
    expect(prompt).toContain('## Key Decisions');
    expect(prompt).toContain('## Action Items');
    expect(prompt).toContain('## Discussion Topics');
    expect(prompt).toContain('## Next Steps');
    expect(prompt).toContain('## Open Questions / Parking Lot');
  });

  it('instructs the model not to invent information', () => {
    const prompt = buildNotesPrompt('transcript', 'Meeting');
    expect(prompt).toMatch(/do not invent/i);
  });

  it('instructs detection of attendees from timestamp pattern', () => {
    const prompt = buildNotesPrompt('transcript', 'Meeting');
    expect(prompt).toContain('[HH:MM:SS]');
  });

  it('requests a markdown table for action items', () => {
    const prompt = buildNotesPrompt('transcript', 'Meeting');
    expect(prompt).toContain('| Task | Owner | Due Date |');
  });
});
