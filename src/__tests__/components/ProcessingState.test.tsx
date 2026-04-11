import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProcessingState from '../../components/ProcessingState';

describe('ProcessingState', () => {
  it('renders the stage name', () => {
    render(<ProcessingState stage={{ stage: 'Analysing transcript', detail: 'Reading content...' }} />);
    expect(screen.getByText('Analysing transcript')).toBeInTheDocument();
  });

  it('renders the detail text', () => {
    render(<ProcessingState stage={{ stage: 'Stage', detail: 'Extracting action items...' }} />);
    expect(screen.getByText('Extracting action items...')).toBeInTheDocument();
  });

  it('renders a helpful time estimate', () => {
    render(<ProcessingState stage={{ stage: 'Stage', detail: 'Detail' }} />);
    expect(screen.getByText(/seconds/i)).toBeInTheDocument();
  });
});
