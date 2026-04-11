import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TranscriptInput from '../../components/TranscriptInput';

vi.mock('../../services/notes', () => ({
  extractAttendees: (transcript: string) => {
    const names = new Set<string>();
    const pattern = /^\[\d{2}:\d{2}:\d{2}\]\s+([^:]+):/gm;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(transcript)) !== null) {
      names.add(match[1].trim());
    }
    return Array.from(names);
  },
}));

describe('TranscriptInput', () => {
  const onGenerate = vi.fn();

  beforeEach(() => {
    onGenerate.mockReset();
  });

  it('renders Paste and Upload tabs', () => {
    render(<TranscriptInput onGenerate={onGenerate} />);
    expect(screen.getByText(/Paste Transcript/)).toBeInTheDocument();
    expect(screen.getByText(/Upload File/)).toBeInTheDocument();
  });

  it('renders meeting title input', () => {
    render(<TranscriptInput onGenerate={onGenerate} />);
    expect(screen.getByPlaceholderText(/Q4 Planning/)).toBeInTheDocument();
  });

  it('generate button is disabled when transcript is empty', () => {
    render(<TranscriptInput onGenerate={onGenerate} />);
    expect(screen.getByText('Generate Meeting Report')).toBeDisabled();
  });

  it('generate button is enabled when transcript has content', () => {
    render(<TranscriptInput onGenerate={onGenerate} />);
    const textareas = screen.getAllByRole('textbox');
    const transcriptArea = textareas[textareas.length - 1];
    fireEvent.change(transcriptArea, { target: { value: '[00:00:00] Alice: Hello.' } });
    expect(screen.getByText('Generate Meeting Report')).not.toBeDisabled();
  });

  it('shows detected attendees when transcript has timestamps', () => {
    render(<TranscriptInput onGenerate={onGenerate} />);
    const textareas = screen.getAllByRole('textbox');
    const transcriptArea = textareas[textareas.length - 1];
    fireEvent.change(transcriptArea, {
      target: { value: '[00:00:00] Alice: Hello.\n[00:00:10] Bob: Hi.' },
    });
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('switches to Upload tab on click', () => {
    render(<TranscriptInput onGenerate={onGenerate} />);
    fireEvent.click(screen.getByText(/Upload File/));
    expect(screen.getByText(/Drop your transcript here/i)).toBeInTheDocument();
  });

  it('calls onGenerate with transcript and title', () => {
    render(<TranscriptInput onGenerate={onGenerate} />);
    const textareas = screen.getAllByRole('textbox');
    const titleInput = textareas[0];
    const transcriptArea = textareas[textareas.length - 1];

    fireEvent.change(titleInput, { target: { value: 'My Meeting' } });
    fireEvent.change(transcriptArea, { target: { value: '[00:00:00] Alice: Hi.' } });
    fireEvent.click(screen.getByText('Generate Meeting Report'));

    expect(onGenerate).toHaveBeenCalledWith('[00:00:00] Alice: Hi.', 'My Meeting');
  });

  it('shows line and character count when transcript is pasted', () => {
    render(<TranscriptInput onGenerate={onGenerate} />);
    const textareas = screen.getAllByRole('textbox');
    const transcriptArea = textareas[textareas.length - 1];
    fireEvent.change(transcriptArea, { target: { value: '[00:00:00] Alice: Hello world.' } });
    expect(screen.getByText(/lines/)).toBeInTheDocument();
  });
});
