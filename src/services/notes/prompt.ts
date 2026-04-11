export function buildNotesPrompt(transcript: string, meetingTitle: string): string {
  return `You are an expert meeting analyst. Analyse the following meeting transcript and produce a detailed, stakeholder-ready meeting report in strict Markdown.

Meeting title: "${meetingTitle || 'Untitled Meeting'}"

TRANSCRIPT:
---
${transcript}
---

OUTPUT REQUIREMENTS:
- Output ONLY valid Markdown — no preamble, no "here is your report", no trailing commentary.
- Use EXACTLY the numbered sections and headers shown below.
- Be thorough and detailed — this report should stand alone without anyone needing to read the transcript.

## 1. Executive Summary
Write 3–5 sentences giving a concise executive overview: what the meeting was about, the core problem or topic addressed, the solution or outcome agreed upon, and any notable open issues.

## 2. Detailed Summary

### 2.1 Topics Discussed
Bulleted list of every major topic covered in the meeting (one line each, no elaboration here).

### 2.2 Key Discussion Points
For each major topic, write a bold heading followed by 2–5 sentences of detail explaining the context, what was said, what problem was identified, and what approach was proposed or agreed. Be specific — include technical details, names of systems, processes, or decisions mentioned.

### 2.3 Decisions
A Markdown table with exactly these columns: | Decision | Owner | Context | Effective Date |
- Decision: the concrete decision made.
- Owner: the person responsible for executing or owning it.
- Context: one sentence explaining why this decision was made.
- Effective Date: any date mentioned, otherwise "Not specified".
If no decisions were made, write "No decisions recorded."

### 2.4 Action Items
A Markdown table with exactly these columns: | Task | Owner | Due Date | Notes |
- Task: the specific action to be taken.
- Owner: person responsible.
- Due Date: any deadline mentioned, otherwise "Not specified".
- Notes: any relevant detail, dependency, or context for this task.
If no action items, write "No action items recorded."

### 2.5 Risks / Issues
A Markdown table with exactly these columns: | Risk | Impact | Severity | Mitigation |
- Risk: the risk or issue identified.
- Impact: what could go wrong if unaddressed.
- Severity: High / Medium / Low based on context.
- Mitigation: the proposed solution or safeguard mentioned.
If no risks were discussed, write "No risks identified."

### 2.6 Follow-ups Needed
Bulleted list of follow-up actions, approvals, or next steps that need to happen after this meeting. These are items mentioned as "we need to…", "someone should…", "let's check…" etc. that are not formal action items with a clear owner.

### 2.7 Open Questions
Bulleted list of questions explicitly raised but not resolved in the meeting. If none, write "None."

RULES:
- Do NOT invent information. If something is not in the transcript, write "Not specified" or "None."
- Extract attendee names ONLY from [HH:MM:SS] Name: patterns — do not guess names.
- Be specific in Decisions and Action Items — extract exact tasks, owners, and dates from what was said.
- Risks must be grounded in the transcript — only list concerns or issues actually raised.
- Write for a non-technical business stakeholder — explain jargon in plain language where possible.
- Keep language professional, concise, and free of filler phrases.
`;
}
