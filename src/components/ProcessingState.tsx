import type { ProcessingStage } from '../types';

interface ProcessingStateProps {
  stage: ProcessingStage;
}

export default function ProcessingState({ stage }: ProcessingStateProps) {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="text-center max-w-sm">
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
          <div className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full border-4 border-brand-200 border-b-transparent animate-spin-slow" style={{ animationDirection: 'reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-600 animate-pulse-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-surface-900 mb-2">{stage.stage}</h2>
        <p className="text-sm text-surface-500">{stage.detail}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>

        <p className="text-xs text-surface-400 mt-6">
          This usually takes 5–15 seconds depending on transcript length.
        </p>
      </div>
    </div>
  );
}
