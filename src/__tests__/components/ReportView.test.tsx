import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportView from '../../components/ReportView';

const SAMPLE_REPORT = `## Meeting Summary
This was a productive meeting.

## Attendees
- Alice
- Bob

## Key Decisions
- Decided to proceed with Plan A.

## Action Items
| Task | Owner | Due Date |
|------|-------|----------|
| Write spec | Alice | 2025-11-01 |

## Discussion Topics
Discussed project roadmap.

## Next Steps
- Alice to write spec by Nov 1.

## Open Questions / Parking Lot
None.`;

describe('ReportView', () => {
  const onReset = vi.fn();

  beforeEach(() => {
    onReset.mockReset();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it('renders the meeting title in the nav', () => {
    render(<ReportView report={SAMPLE_REPORT} meetingTitle="Q4 Review" onReset={onReset} />);
    expect(screen.getAllByText('Q4 Review').length).toBeGreaterThanOrEqual(1);
  });

  it('renders report content', () => {
    render(<ReportView report={SAMPLE_REPORT} meetingTitle="Test" onReset={onReset} />);
    expect(screen.getByText('This was a productive meeting.')).toBeInTheDocument();
    expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('calls onReset when Start Over is clicked', () => {
    render(<ReportView report={SAMPLE_REPORT} meetingTitle="Test" onReset={onReset} />);
    fireEvent.click(screen.getByText('Start Over'));
    expect(onReset).toHaveBeenCalled();
  });

  it('shows Copy MD button', () => {
    render(<ReportView report={SAMPLE_REPORT} meetingTitle="Test" onReset={onReset} />);
    expect(screen.getByText(/Copy MD/)).toBeInTheDocument();
  });

  it('shows .md and .txt download buttons', () => {
    render(<ReportView report={SAMPLE_REPORT} meetingTitle="Test" onReset={onReset} />);
    expect(screen.getByText('.md')).toBeInTheDocument();
    expect(screen.getByText('.txt')).toBeInTheDocument();
  });

  it('shows Copied! feedback after clicking Copy MD', async () => {
    render(<ReportView report={SAMPLE_REPORT} meetingTitle="Test" onReset={onReset} />);
    fireEvent.click(screen.getByText(/Copy MD/));
    await waitFor(() => expect(screen.getByText('Copied!')).toBeInTheDocument());
  });

  it('falls back to Untitled Meeting title', () => {
    render(<ReportView report={SAMPLE_REPORT} meetingTitle="" onReset={onReset} />);
    expect(screen.getAllByText('Meeting Notes').length).toBeGreaterThanOrEqual(1);
  });

  it('renders action items table', () => {
    render(<ReportView report={SAMPLE_REPORT} meetingTitle="Test" onReset={onReset} />);
    expect(screen.getByText('Write spec')).toBeInTheDocument();
    expect(screen.getByText('2025-11-01')).toBeInTheDocument();
  });
});
