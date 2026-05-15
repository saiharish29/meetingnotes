# Meeting Notes Generator

A standalone client-side web app that converts meeting transcripts into structured, stakeholder-ready reports using an LLM of your choice.

## Features

- **Two input modes** — paste raw transcript text or upload a `.txt` / `.md` file (max 5 MB)
- **Auto-detect attendees** — extracts names from `[HH:MM:SS] Name:` timestamp patterns
- **Structured report** — generates:
  - Executive Summary (3–5 sentence overview)
  - Key Discussion Points (per topic, with context and decisions)
  - Decisions (table: Decision | Owner | Context | Effective Date)
  - Action Items (table: Task | Owner | Due Date | Notes)
  - Risks / Issues (table: Risk | Impact | Severity | Mitigation)
  - Follow-ups Needed
  - Open Questions / Parking Lot
- **BYOK (Bring Your Own Key)** — choose your provider, enter your API key; stored in `localStorage` only, never sent to any server
- **Three providers** — Google Gemini 2.5 Flash, OpenAI GPT-4o, Groq Llama 3.3 70B
- **Export** — Copy as Markdown, download as `.md`, download as `.txt`, download as styled `.html` (print-ready)
- **Pure static SPA** — no backend, deployable anywhere

## Providers

| Provider | Model | Free Tier | Speed |
|----------|-------|-----------|-------|
| Google Gemini | gemini-2.5-flash | Yes | Medium |
| OpenAI | gpt-4o | No | Medium |
| Groq | llama-3.3-70b-versatile | Yes | Fast |

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`, select your provider, enter your API key, then paste or upload a transcript.

## Running tests

```bash
npm test
```

## Build

```bash
npm run build
```

The build output is in `dist/`. No environment variables are required — all secrets are entered at runtime by the user.

## Deployment (Render)

This project includes a `render.yaml` for one-click deployment to Render as a static site:

1. Push to GitHub
2. Connect the repo to Render
3. Render auto-detects `render.yaml` and deploys

The build command uses `node ./node_modules/vite/bin/vite.js build` (not `vite build`) to avoid Linux execute-bit permission errors.

## Architecture

```
src/
├── components/
│   ├── ApiKeySetup.tsx      # Provider selection + API key entry
│   ├── TranscriptInput.tsx  # Paste/upload tabs + attendee detection
│   ├── ProcessingState.tsx  # Animated loading screen
│   ├── ReportView.tsx       # Rendered markdown report + export actions
│   └── SettingsPanel.tsx    # Change provider at runtime
├── services/
│   ├── config.ts            # localStorage read/write
│   └── notes/
│       ├── index.ts         # Provider router + metadata
│       ├── prompt.ts        # LLM prompt engineering
│       ├── gemini.ts        # Google Gemini implementation
│       ├── openai.ts        # OpenAI GPT-4o implementation
│       └── groq.ts          # Groq implementation
├── utils/
│   └── htmlExport.ts        # Styled HTML report generator (print-ready)
├── types.ts
├── App.tsx                  # Screen state machine
└── main.tsx                 # React root + ErrorBoundary
```

## Security model

- API keys are stored in `localStorage` with the key `mn_config`
- All LLM calls go directly from the browser to the provider's API
- No analytics, no telemetry, no backend

## Reliability

| Area | Measure |
|------|---------|
| Gemini responses | Candidate + `finishReason` checked before accessing `.text`; safety blocks and token-limit errors surface user-friendly messages |
| OpenAI / Groq | `max_tokens: 4096` cap prevents runaway generation and free-tier rate-limit exhaustion |
| File uploads | 5 MB size guard with a clear error message before reading |
| Downloads | Object URL revoke deferred 100 ms so Firefox/Safari don't produce 0-byte files |
| Transcript on error | Transcript and title are preserved in `App` state and restored after an error — no re-pasting needed |
| Crash recovery | `ErrorBoundary` in `main.tsx` catches any React render error and shows a reload prompt instead of a blank screen |
