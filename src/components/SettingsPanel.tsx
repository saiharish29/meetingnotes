import { clearConfig, loadConfig } from '../services/config';
import { getProviderMeta } from '../services/notes';

interface SettingsPanelProps {
  onClose: () => void;
  onChangeProvider: () => void;
}

export default function SettingsPanel({ onClose, onChangeProvider }: SettingsPanelProps) {
  const config = loadConfig();
  const provider = config ? getProviderMeta(config.provider) : null;
  const maskedKey = config ? `${config.apiKey.slice(0, 6)}${'•'.repeat(12)}` : '';

  function handleChangeProvider() {
    clearConfig();
    onChangeProvider();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-surface-100 w-full max-w-sm p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-surface-800">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {provider && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-100">
              <p className="text-xs font-medium text-surface-500 mb-1">Active provider</p>
              <p className="text-sm font-semibold text-surface-800">{provider.name}</p>
              <p className="text-xs text-surface-400 font-mono mt-0.5">{provider.model}</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-50 border border-surface-100">
              <p className="text-xs font-medium text-surface-500 mb-1">API key</p>
              <p className="text-sm font-mono text-surface-700">{maskedKey}</p>
            </div>

            <div className="p-3 rounded-xl bg-green-50 border border-green-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-xs text-green-700">Key stored locally in your browser only.</p>
            </div>
          </div>
        )}

        <button
          onClick={handleChangeProvider}
          className="mt-5 w-full py-3 rounded-xl border-2 border-surface-200 text-sm font-medium text-surface-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          Change provider / Clear key
        </button>
      </div>
    </div>
  );
}
