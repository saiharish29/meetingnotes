import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateHtmlReport } from '../utils/htmlExport';

interface ReportViewProps {
  report: string;
  meetingTitle: string;
  onReset: () => void;
}

export default function ReportView({ report, meetingTitle, onReset }: ReportViewProps) {
  const [copied, setCopied] = useState(false);

  const title = meetingTitle || 'Meeting Notes';
  const dateStr = new Date().toISOString().split('T')[0];
  const mdContent = `# ${title}\n_Generated ${dateStr}_\n\n${report}`;

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(mdContent);
    } catch {
      // Clipboard API unavailable — fall back to execCommand
      const ta = document.createElement('textarea');
      ta.value = mdContent;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /**
   * Trigger a file download safely.
   *
   * The anchor is appended to the DOM before click() so the browser has a
   * proper reference, and URL.revokeObjectURL is deferred by 100 ms to
   * ensure the download request has been queued before the URL is invalidated.
   * (Calling revokeObjectURL synchronously after click() can silently abort
   * the download on some browsers.)
   */
  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function downloadAs(ext: 'md' | 'txt') {
    const blob = new Blob([mdContent], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, `${title.replace(/\s+/g, '-').toLowerCase()}-notes.${ext}`);
  }

  function downloadHtml() {
    const html = generateHtmlReport(title, report, dateStr);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    triggerDownload(blob, `${title.replace(/\s+/g, '-').toLowerCase()}-notes.html`);
  }

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-surface-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-semibold text-surface-800 truncate max-w-xs">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* HTML export — primary action */}
          <button
            onClick={downloadHtml}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download HTML
          </button>

          {/* Secondary exports */}
          <button
            onClick={copyMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-surface-600 hover:bg-surface-100 transition-colors border border-surface-200"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy MD
              </>
            )}
          </button>

          <button
            onClick={() => downloadAs('md')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-surface-600 hover:bg-surface-100 transition-colors border border-surface-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            .md
          </button>

          <button
            onClick={() => downloadAs('txt')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-surface-600 hover:bg-surface-100 transition-colors border border-surface-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            .txt
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
          >
            Start Over
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6 animate-fade-in">
        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-8">
          <div className="prose prose-slate max-w-none
            prose-h1:text-2xl prose-h1:font-bold prose-h1:text-surface-900 prose-h1:mb-1
            prose-h2:text-lg prose-h2:font-semibold prose-h2:text-surface-800 prose-h2:mt-8 prose-h2:mb-3 prose-h2:pb-2 prose-h2:border-b prose-h2:border-surface-100
            prose-p:text-surface-700 prose-p:text-sm prose-p:leading-relaxed
            prose-li:text-surface-700 prose-li:text-sm
            prose-strong:text-surface-800 prose-strong:font-semibold
            prose-table:text-sm prose-th:text-left prose-th:font-semibold prose-th:text-surface-700 prose-th:py-2 prose-th:px-3 prose-th:bg-surface-50
            prose-td:py-2 prose-td:px-3 prose-td:text-surface-700 prose-td:border-t prose-td:border-surface-100
            prose-em:text-surface-400 prose-em:text-xs
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {mdContent}
            </ReactMarkdown>
          </div>
        </div>
      </main>
    </div>
  );
}
