import { useState, useEffect } from 'react';
import ApiKeySetup from './components/ApiKeySetup';
import TranscriptInput from './components/TranscriptInput';
import ProcessingState from './components/ProcessingState';
import ReportView from './components/ReportView';
import SettingsPanel from './components/SettingsPanel';
import { loadConfig } from './services/config';
import { generateNotes } from './services/notes';
import type { AppScreen, ProcessingStage } from './types';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('setup');
  const [configured, setConfigured] = useState(false);
  const [stage, setStage] = useState<ProcessingStage>({ stage: 'Starting', detail: '' });
  const [report, setReport] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Preserve transcript & title so they survive the error → retry cycle.
  // TranscriptInput manages these internally; we only stash a copy here
  // to hand back as defaults when the user returns to the input screen.
  const [savedTranscript, setSavedTranscript] = useState('');
  const [savedTitle, setSavedTitle] = useState('');

  useEffect(() => {
    const config = loadConfig();
    if (config) {
      setConfigured(true);
      setScreen('input');
    }
  }, []);

  function handleSetupComplete() {
    setConfigured(true);
    setScreen('input');
  }

  async function handleGenerate(transcript: string, title: string) {
    const config = loadConfig();
    if (!config) {
      setConfigured(false);
      setScreen('setup');
      return;
    }

    // Stash before leaving the input screen so we can restore on error
    setSavedTranscript(transcript);
    setSavedTitle(title);

    setMeetingTitle(title || 'Meeting Notes');
    setScreen('processing');
    setError('');

    try {
      const result = await generateNotes({
        transcript,
        meetingTitle: title,
        config,
        onStage: (s: ProcessingStage) => setStage(s),
      });
      setReport(result);
      setScreen('report');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setScreen('error');
    }
  }

  function handleReset() {
    setReport('');
    setError('');
    setMeetingTitle('');
    // Do NOT clear savedTranscript / savedTitle — they are restored as
    // defaultTranscript / defaultTitle props on <TranscriptInput> so the
    // user doesn't have to re-paste after hitting an error.
    setScreen('input');
  }

  function handleChangeProvider() {
    setConfigured(false);
    setShowSettings(false);
    setScreen('setup');
  }

  if (!configured || screen === 'setup') {
    return <ApiKeySetup onComplete={handleSetupComplete} />;
  }

  return (
    <>
      {screen === 'input' && (
        <div className="relative">
          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            className="fixed top-4 right-4 z-20 w-9 h-9 rounded-xl bg-white border border-surface-200 shadow-sm flex items-center justify-center text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors"
            aria-label="Settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <TranscriptInput
            onGenerate={handleGenerate}
            defaultTranscript={savedTranscript}
            defaultTitle={savedTitle}
          />
        </div>
      )}

      {screen === 'processing' && <ProcessingState stage={stage} />}

      {screen === 'report' && (
        <ReportView report={report} meetingTitle={meetingTitle} onReset={handleReset} />
      )}

      {screen === 'error' && (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 max-w-md w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-surface-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-surface-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                Try again
              </button>
              <button
                onClick={handleChangeProvider}
                className="px-5 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
              >
                Change provider
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onChangeProvider={handleChangeProvider}
        />
      )}
    </>
  );
}
