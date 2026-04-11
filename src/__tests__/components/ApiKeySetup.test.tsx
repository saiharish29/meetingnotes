import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApiKeySetup from '../../components/ApiKeySetup';

// Mock the notes service
vi.mock('../../services/notes', () => ({
  PROVIDERS: [
    { id: 'gemini', name: 'Google Gemini', tagline: 'Best quality', model: 'gemini-2.5-flash', keyHint: 'AIza...', keyLink: 'https://example.com', keyLinkLabel: 'Get key', hasFreeTeir: true, speed: 'medium' },
    { id: 'openai', name: 'OpenAI GPT-4o', tagline: 'High accuracy', model: 'gpt-4o', keyHint: 'sk-...', keyLink: 'https://example.com', keyLinkLabel: 'Get key', hasFreeTeir: false, speed: 'medium' },
    { id: 'groq', name: 'Groq', tagline: 'Fastest', model: 'llama-3.3-70b-versatile', keyHint: 'gsk_...', keyLink: 'https://example.com', keyLinkLabel: 'Get key', hasFreeTeir: true, speed: 'fast' },
  ],
  validateApiKey: vi.fn(),
}));

vi.mock('../../services/config', () => ({
  saveConfig: vi.fn(),
}));

describe('ApiKeySetup', () => {
  const onComplete = vi.fn();

  beforeEach(() => {
    onComplete.mockReset();
    vi.clearAllMocks();
  });

  it('renders provider selection on first step', () => {
    render(<ApiKeySetup onComplete={onComplete} />);
    expect(screen.getByText('Google Gemini')).toBeInTheDocument();
    expect(screen.getByText('OpenAI GPT-4o')).toBeInTheDocument();
    expect(screen.getByText('Groq')).toBeInTheDocument();
  });

  it('advances to key entry when a provider is selected', () => {
    render(<ApiKeySetup onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Google Gemini'));
    expect(screen.getByPlaceholderText('AIza...')).toBeInTheDocument();
  });

  it('shows correct key hint for selected provider', () => {
    render(<ApiKeySetup onComplete={onComplete} />);
    fireEvent.click(screen.getByText('OpenAI GPT-4o'));
    expect(screen.getByPlaceholderText('sk-...')).toBeInTheDocument();
  });

  it('allows going back to provider selection', () => {
    render(<ApiKeySetup onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Google Gemini'));
    fireEvent.click(screen.getByText('Change provider'));
    expect(screen.getByText('OpenAI GPT-4o')).toBeInTheDocument();
  });

  it('calls onComplete after successful validation', async () => {
    const { validateApiKey } = await import('../../services/notes');
    (validateApiKey as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);

    render(<ApiKeySetup onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Google Gemini'));

    const input = screen.getByPlaceholderText('AIza...');
    fireEvent.change(input, { target: { value: 'AIzaTestKey' } });
    fireEvent.click(screen.getByText('Verify & Continue'));

    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });

  it('shows error message on invalid key', async () => {
    const { validateApiKey } = await import('../../services/notes');
    (validateApiKey as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Invalid API key.'));

    render(<ApiKeySetup onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Groq'));

    const input = screen.getByPlaceholderText('gsk_...');
    fireEvent.change(input, { target: { value: 'bad-key' } });
    fireEvent.click(screen.getByText('Verify & Continue'));

    await waitFor(() => expect(screen.getByText('Invalid API key.')).toBeInTheDocument());
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('disables button when key input is empty', () => {
    render(<ApiKeySetup onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Google Gemini'));
    expect(screen.getByText('Verify & Continue')).toBeDisabled();
  });

  it('shows free tier badge for providers with free tier', () => {
    render(<ApiKeySetup onComplete={onComplete} />);
    const freeBadges = screen.getAllByText('Free tier');
    expect(freeBadges.length).toBeGreaterThanOrEqual(2); // gemini + groq
  });
});
