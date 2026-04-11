export function buildNotesPrompt(transcript: string, meetingTitle: string): string {
  return `You are an expert meeting analyst. Analyse the following meeting transcript and produce a structured, stakeholder-ready meeting report in strict Markdown.

Meeting title: "${meetingTitle || 'Untitled Meeting'}"

TRANSCRIPT:
---
${transcript}
---

OUTPUT REQUIREMENTS:
- Output ONLY valid Markdown — no preamble, no "here is your report", no trailing commentary.
- Use EXACTLY these section headers (H2):

## Meeting Summary
Write 3–5 sentences giving an executive overview of the meeting — what was discussed, what was decided, and what the outcome is.

## Attendees
List each attendee detected from the transcript. Detect names from the pattern [HH:MM:SS] Name: at the start of lines. Output as a bulleted list.

## Key Decisions
Bulleted list of concrete decisions made during the meeting. Each bullet should start with a bold decision statement. If no decisions were made, write "No decisions recorded."

## Action Items
A Markdown table with exactly these columns: | Task | Owner | Due Date |
- Extract action items from the transcript. Owner is the person responsible (use the name mentioned or the person who committed). Due date is any date/deadline mentioned — if none, write "TBD".
- If no action items, write "No action items recorded."

## Discussion Topics
A brief summary of each major topic discussed. Use sub-bullets or short paragraphs per topic.

## Next Steps
Bulleted list of what happens after this meeting — follow-ups, next meetings, deliverables expected.

## Open Questions / Parking Lot
Bulleted list of unresolved questions or items that were explicitly deferred. If none, write "None."

RULES:
- Do NOT invent information. If something is not mentioned in the transcript, mark it "Not mentioned" or "TBD".
- Extract attendee names ONLY from [HH:MM:SS] Name: patterns. Do not guess names.
- Be specific in action items — extract exact tasks and owners from the transcript.
- Keep summaries concise and professional — avoid filler phrases.
`;
}
