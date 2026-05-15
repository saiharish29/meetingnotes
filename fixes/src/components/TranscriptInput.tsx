import { useState, useRef, useCallback } from 'react';
import { extractAttendees } from '../services/notes';

interface TranscriptInputProps {
  onGenerate: (transcript: string, meetingTitle: string) => void;
  /** Restores a previously entered transcript (e.g. after an error screen). */
  defaultTranscript?: string;
  /** Restores a previously entered title (e.g. after an error screen). */
  defaultTitle?: string;
}

type Tab = 'paste' | 'upload';

// 5 MB — reasonable ceiling for a text transcript
const MAX_FILE_BYTES = 5 * 1024 * 1024;

export default function TranscriptInput({
  onGenerate,
  defaultTranscript = '',
  defaultTitle = '',
}: TranscriptInputProps) {
  const [tab, setTab] = useState<Tab>('paste');
  const [transcript, setTranscript] = useState(defaultTranscript);
  const [meetingTitle, setMeetingTitle] = useState(defaultTitle);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const attendees = extractAttendees(transcript);
  const canGenerate = transcript.trim().length > 0;

  const loadFile = useCallback(
    (file: File) => {
      if (!file.name.match(/\.(txt|md)$/i)) {
        alert('Please upload a .txt or .md file.');
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        alert(
          `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). ` +
            'Please upload a file smaller than 5 MB.'
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setTranscript(text);
        setFileName(file.name);
        if (!meetingTitle) {
          setMeetingTitle(file.name.replace(/\.(txt|md)$/i, '').replace(/[-_]/g, ' '));
        }
      };
      reader.readAsText(file);
    },
    [meetingTitle]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-surface-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-semibold text-surface-800">Meeting Notes Generator</span>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6 space-y-6 animate-fade-in">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">Meeting title</label>
          <input
            type="text"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="e.g. Q4 Planning Sync — Oct 2025"
            className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white text-surface-900 placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-surface-100">
            {(['paste', 'upload'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                {t === 'paste' ? '✏️ Paste Transcript' : '📁 Upload File'}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === 'paste' ? (
              <div className="animate-fade-in">
                <label className="block text-xs font-medium text-surface-500 mb-2">
                  Paste your transcript below (supports [HH:MM:SS] Name: format)
                </label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={`[00:00:00] Harish: Good morning everyone, let's get started.\n[00:00:08] Priya: Morning! Can everyone hear me okay?\n[00:01:15] Harish: So the two tickets 5404 and 7944 are blocked...`}
                  rows={14}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 text-surface-800 placeholder-surface-300 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
                {transcript && (
                  <p className="mt-2 text-xs text-surface-400">
                    {transcript.split('\n').filter(Boolean).length} lines ·{' '}
                    {transcript.length.toLocaleString()} characters
                  </p>
                )}
              </div>
            ) : (
              <div className="animate-fade-in">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-surface-200 hover:border-brand-300 hover:bg-surface-50'
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <svg
                    className="w-10 h-10 text-surface-300 mx-auto mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm font-medium text-surface-600">
                    {fileName ? fileName : 'Drop your transcript here'}
                  </p>
                  <p className="text-xs text-surface-400 mt-1">
                    {fileName
                      ? `${transcript.split('\n').filter(Boolean).length} lines loaded`
                      : 'or click to browse — .txt or .md, max 5 MB'}
                  </p>
                </div>

                {transcript && tab === 'upload' && (
                  <div className="mt-3 p-3 rounded-xl bg-surface-50 border border-surface-100">
                    <p className="text-xs font-medium text-surface-600 mb-1">
                      Preview (first 3 lines):
                    </p>
                    <pre className="text-xs text-surface-500 font-mono truncate">
                      {transcript.split('\n').filter(Boolean).slice(0, 3).join('\n')}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detected attendees */}
        {attendees.length > 0 && (
          <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-5 animate-slide-up">
            <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Detected attendees ({attendees.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {attendees.map((name) => (
                <span
                  key={name}
                  className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-100"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={() => onGenerate(transcript, meetingTitle)}
          disabled={!canGenerate}
          className="w-full py-4 rounded-2xl bg-brand-600 text-white font-semibold text-base hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          Generate Meeting Report
        </button>
      </main>
    </div>
  );
}
