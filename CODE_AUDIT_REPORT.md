# Code Audit Report — Meeting Notes Generator
**Repo:** https://github.com/saiharish29/meetingnotes  
**Live:** https://meetingnotes-ji7r.onrender.com  
**Date:** 2026-05-15  
**Reviewer:** Claude (Anthropic) — 20+ year senior architect perspective  

---

## Executive Summary

The app is a well-structured, client-side-only React + TypeScript + Vite SPA. The architecture is sound and the code is generally clean. However, **8 bugs** were identified that can cause silent failures, crashes, or data loss in production. All 8 have been fixed in the `fixes/` directory alongside this report.

---

## Issues Found & Fixed

### 🔴 Critical

#### 1. `AppScreen` type missing `'error'` state — `src/types.ts`

**Problem:** The `AppScreen` union type was defined as `'setup' | 'input' | 'processing' | 'report'`. The `'error'` screen state used in `App.tsx` was not included, requiring two unsafe TypeScript casts to make it compile:
```ts
setScreen('error' as AppScreen);   // Line 47 — bypasses type checker
{(screen as string) === 'error' &&  // Line 67 — bypasses narrowing
```
TypeScript's static guarantees are completely silenced for the error path. Any refactoring that renames or removes the 'error' screen will compile fine but break at runtime.

**Fix:** Added `'error'` to the union in `types.ts`. Removed both casts in `App.tsx`.

---

#### 2. `response.text` throws on safety-blocked responses — `src/services/notes/gemini.ts`

**Problem:** In `@google/genai` v1.x, `response.text` is a **getter** that throws a runtime exception (not returns `undefined`) when:
- The model's response was blocked by Google's safety filters
- The finish reason is `SAFETY`, `MAX_TOKENS` without text, or `RECITATION`
- `candidates[0]` doesn't exist

The existing code:
```ts
const text = response.text;   // Can throw here
if (!text) throw new Error(...);
```
The outer `try/catch` in `App.tsx` would eventually catch it, but the error message would be the SDK's internal opaque message, not something a user can act on.

**Fix:**
- Check `response.candidates?.[0]` before accessing `.text`
- Inspect `finishReason` and map it to a user-friendly message (`SAFETY` → explains safety filter; `MAX_TOKENS` → suggests shortening the transcript)
- Wrap `response.text` in its own `try/catch` to convert SDK-internal errors to readable messages
- Added `maxOutputTokens: 4096` to `generationConfig` to prevent runaway generation and hit-token-limit silent failures

---

#### 3. Invalid CSS selector `:has-text()` in HTML export — `src/utils/htmlExport.ts`

**Problem:** The HTML export contained these three rules:
```css
td:has-text("High"), td.severity-high { color: #dc2626; ... }
td:has-text("Medium"), td.severity-medium { color: #d97706; ... }
td:has-text("Low"), td.severity-low { color: #16a34a; ... }
```
`:has-text()` **does not exist in CSS**. It is not a valid pseudo-class in any browser. The entire rule is silently discarded, meaning severity coloring never works. Modern CSS parsers may also log warnings, and strict validators will flag it as an error.

**Fix:** Removed the invalid `:has-text()` selectors entirely. The `.severity-*` class selectors remain but are inert until a post-processor (e.g., a custom `marked` renderer) adds those classes to table cells.

---

### 🟠 High

#### 4. `URL.revokeObjectURL()` called synchronously after `click()` — `src/components/ReportView.tsx`

**Problem:** All three download functions (`downloadAs`, `downloadHtml`) used this pattern:
```ts
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.click();
URL.revokeObjectURL(url);  // ← immediately invalidates the URL
```
`a.click()` is synchronous but the browser schedules the actual download asynchronously. On Chrome on slow machines, and reliably on Firefox and Safari, the object URL is already revoked by the time the browser attempts to fetch it, resulting in a **silent download failure** (the Save dialog opens but the file is 0 bytes or the download errors).

**Fix:** Extracted a `triggerDownload(blob, filename)` helper that:
1. Appends the anchor to the DOM before `.click()` (required by some browsers)
2. Removes it immediately after
3. Defers `revokeObjectURL` by 100 ms using `setTimeout`

---

#### 5. No file size limit on transcript uploads — `src/components/TranscriptInput.tsx`

**Problem:** The `loadFile` function accepted any file that matched `.txt` or `.md` with no size check. A user uploading a 50 MB log file would:
- Lock the browser tab (synchronous `FileReader.readAsText`)
- Potentially OOM the LLM API call (sending 50 MB as the prompt)
- Get a cryptic API error or browser crash with no explanation

**Fix:** Added a 5 MB guard at the top of `loadFile`:
```ts
const MAX_FILE_BYTES = 5 * 1024 * 1024;
if (file.size > MAX_FILE_BYTES) {
  alert(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). ...`);
  return;
}
```
The upload hint text was also updated to say "max 5 MB" so users know upfront.

---

#### 6. No React Error Boundary — `src/main.tsx`

**Problem:** Any uncaught JavaScript exception thrown during React's render or lifecycle phase (e.g., a component bug introduced in a future PR, a browser extension interfering with the DOM, a malformed LLM response crashing the Markdown renderer) causes React to unmount the entire tree and show a **completely blank white page** with no feedback to the user.

**Fix:** Added an `ErrorBoundary` class component wrapping `<App>`. It uses inline styles so it works even if Tailwind or external CSS fails to load. It:
- Displays a branded error message with the exception details
- Offers a "Reload app" button
- Logs the full component stack to the console (Render captures this in build logs)

---

### 🟡 Medium

#### 7. Transcript lost when user hits an error and retries — `src/App.tsx`

**Problem:** `TranscriptInput` manages the transcript in its own local state. When an error occurs, the screen changes from `'processing'` → `'error'`, which **unmounts** `TranscriptInput`. When the user clicks "Try again", screen becomes `'input'` and `TranscriptInput` **remounts fresh** — losing everything the user typed. The user must re-paste the entire transcript.

**Fix:**
- Added `savedTranscript` and `savedTitle` state to `App.tsx`
- Before transitioning to `'processing'`, the transcript and title are stashed
- `handleReset()` no longer clears `savedTitle`; the saved values are restored
- `TranscriptInput` now accepts `defaultTranscript?: string` and `defaultTitle?: string` props and initialises its local state from them

---

#### 8. No `max_tokens` cap on OpenAI / Groq calls — `src/services/notes/openai.ts`, `groq.ts`

**Problem:** Neither the OpenAI nor the Groq call specified `max_tokens`. For very long transcripts:
- OpenAI can generate unlimited tokens, making each call unpredictably expensive
- Groq's free tier has per-minute token limits; an uncapped response easily exhausts them and returns a 429 error mid-stream

**Fix:** Added `max_tokens: 4096` to both calls. A thorough 7-section meeting report rarely exceeds 3 000 tokens; 4 096 is a safe ceiling with headroom.

---

## File Change Summary

| File | Change |
|------|--------|
| `src/types.ts` | Added `'error'` to `AppScreen` union |
| `src/App.tsx` | Removed 2 unsafe casts; added transcript preservation on error |
| `src/main.tsx` | Added `ErrorBoundary` class component |
| `src/index.css` | Replaced stale Vite boilerplate with minimal comment + box-sizing reset |
| `src/services/notes/gemini.ts` | Candidate + finishReason checks; wrapped `.text` getter; added `maxOutputTokens` |
| `src/services/notes/openai.ts` | Added `max_tokens: 4096` |
| `src/services/notes/groq.ts` | Added `max_tokens: 4096` |
| `src/utils/htmlExport.ts` | Removed 3 invalid `:has-text()` CSS selectors |
| `src/components/ReportView.tsx` | Fixed download URL revoke timing via `triggerDownload` helper |
| `src/components/TranscriptInput.tsx` | Added 5 MB file size guard; `defaultTranscript`/`defaultTitle` props; `loadFile` is now properly `useCallback`-ized |

---

## How to Apply

All fixed files are in `fixes/src/` next to this document. Copy them into the repo:

```bash
# From the meetingnotes repo root:
cp -r path/to/fixes/src ./src
git add -A
git commit -m "fix: 8 reliability issues found in code audit"
git push
```

Render will auto-deploy from the `main` branch.

---

## Non-Breaking Observations (no fix required now)

| # | Observation | Recommendation |
|---|-------------|---------------|
| 1 | Tailwind loaded via CDN `<script>` — intentional for this simple app, but the CDN is the "play" version not intended for production | Consider migrating to a proper PostCSS + Tailwind build pipeline if the app grows |
| 2 | `hasFreeTeir` typo is consistent across `index.ts` and `ApiKeySetup.tsx` | Rename to `hasFreeTier` in a dedicated cleanup PR |
| 3 | No `Content-Security-Policy` header in `render.yaml` | Add a CSP to restrict `script-src`, `connect-src` to known domains |
| 4 | `openai` SDK not in Vite `manualChunks` — loads in the main bundle | Add `'vendor-openai': ['openai']` to `rollupOptions.output.manualChunks` |
| 5 | `index.css` is not imported anywhere (`main.tsx` has no `import './index.css'`) | Either delete the file or import it; the stale boilerplate was confusing |
| 6 | No network timeout on any LLM call (relies on browser default ~2 min) | Add `AbortController` with a 90 s timeout for a better UX on network stalls |

---

*Generated by automated code review — verify all changes against your test suite before deploying.*
