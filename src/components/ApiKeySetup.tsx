import { useState } from 'react';
import { PROVIDERS, validateApiKey, type ProviderMeta } from '../services/notes';
import { saveConfig } from '../services/config';
import type { Provider } from '../types';

interface ApiKeySetupProps {
  onComplete: () => void;
}

type Step = 'provider' | 'key';

export default function ApiKeySetup({ onComplete }: ApiKeySetupProps) {
  const [step, setStep] = useState<Step>('provider');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  const providerMeta = PROVIDERS.find(p => p.id === selectedProvider);

  function handleSelectProvider(provider: Provider) {
    setSelectedProvider(provider);
    setApiKey('');
    setError('');
    setStep('key');
  }

  async function handleValidate() {
    if (!selectedProvider || !apiKey.trim()) return;
    setValidating(true);
    setError('');
    try {
      await validateApiKey(selectedProvider, apiKey.trim());
      saveConfig({ provider: selectedProvider, apiKey: apiKey.trim() });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed.');
    } finally {
      setValidating(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Meeting Notes Generator</h1>
          <p className="text-surface-500 mt-1 text-sm">Transform transcripts into structured reports</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['provider', 'key'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                step === s ? 'bg-brand-600 text-white' :
                (i === 0 && step === 'key') ? 'bg-brand-100 text-brand-700' :
                'bg-surface-200 text-surface-400'
              }`}>
                {i === 0 && step === 'key' ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium ${step === s ? 'text-surface-800' : 'text-surface-400'}`}>
                {s === 'provider' ? 'Choose provider' : 'Enter API key'}
              </span>
              {i < 1 && <div className="w-6 h-px bg-surface-200 mx-1" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
          {step === 'provider' && (
            <div className="animate-fade-in">
              <h2 className="text-base font-semibold text-surface-800 mb-4">Select your AI provider</h2>
              <div className="space-y-3">
                {PROVIDERS.map(p => (
                  <ProviderCard key={p.id} provider={p} onSelect={handleSelectProvider} />
                ))}
              </div>
            </div>
          )}

          {step === 'key' && providerMeta && (
            <div className="animate-fade-in">
              <button
                onClick={() => setStep('provider')}
                className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 mb-4 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Change provider
              </button>

              <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-surface-50">
                <ProviderIcon id={providerMeta.id} />
                <div>
                  <p className="text-sm font-semibold text-surface-800">{providerMeta.name}</p>
                  <p className="text-xs text-surface-500">{providerMeta.tagline}</p>
                </div>
              </div>

              <h2 className="text-base font-semibold text-surface-800 mb-1">Enter your API key</h2>
              <p className="text-xs text-surface-500 mb-4">
                Your key is stored only in your browser and sent directly to {providerMeta.name}.{' '}
                <a href={providerMeta.keyLink} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                  {providerMeta.keyLinkLabel} →
                </a>
              </p>

              <input
                type="password"
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleValidate()}
                placeholder={providerMeta.keyHint}
                className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 text-surface-900 placeholder-surface-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                autoFocus
              />

              {error && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleValidate}
                disabled={!apiKey.trim() || validating}
                className="mt-4 w-full py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {validating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Validating...
                  </>
                ) : 'Verify & Continue'}
              </button>

              <div className="mt-4 flex items-center gap-2 text-xs text-surface-400">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Key stored in browser localStorage only — never sent to our servers.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProviderCard({ provider, onSelect }: { provider: ProviderMeta; onSelect: (id: Provider) => void }) {
  const colors: Record<Provider, string> = {
    gemini: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    openai: 'border-surface-200 hover:border-surface-400 hover:bg-surface-50',
    groq: 'border-orange-200 hover:border-orange-400 hover:bg-orange-50',
  };

  return (
    <button
      onClick={() => onSelect(provider.id)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 bg-white text-left transition-all ${colors[provider.id]}`}
    >
      <ProviderIcon id={provider.id} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-surface-800">{provider.name}</span>
          {provider.hasFreeTeir && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Free tier</span>
          )}
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            provider.speed === 'fast' ? 'bg-yellow-100 text-yellow-700' : 'bg-surface-100 text-surface-600'
          }`}>
            {provider.speed}
          </span>
        </div>
        <p className="text-xs text-surface-500 mt-0.5">{provider.tagline}</p>
        <p className="text-xs text-surface-400 mt-0.5 font-mono">{provider.model}</p>
      </div>
      <svg className="w-5 h-5 text-surface-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

function ProviderIcon({ id }: { id: Provider }) {
  if (id === 'gemini') return (
    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
  if (id === 'openai') return (
    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.603 1.5v2.999l-2.602 1.5-2.603-1.5z"/>
      </svg>
    </div>
  );
  return (
    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 2L3 14h9l-1 8 10-12h-9z" />
      </svg>
    </div>
  );
}
