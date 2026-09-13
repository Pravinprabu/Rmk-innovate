// Renders an AI summary's text, turning any {{clinical term|raw patient
// words}} markers (apps/kiosk/ai_summary/views.py's _mark_corrections) into
// a ✦-marked span the doctor can hover to see exactly what the patient
// originally said. The kiosk's own patient-facing summary view strips
// these markers server-side (apps/kiosk/ai_summary/serializers.py) -- only
// the doctor sees the raw syntax, so it's parsed here, not on the backend.
const MARKER = /\{\{([^|{}]+)\|([^{}]+)\}\}/g;

export default function MarkedSummaryText({ text }) {
  if (!text) return null;

  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = MARKER.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const [, clinicalTerm, rawWords] = match;
    parts.push(
      <span
        key={`mark-${key++}`}
        title={`Patient's own words: "${rawWords}"`}
        className="border-b-2 border-dotted border-brand-accent text-brand-accent-darker cursor-help"
      >
        {clinicalTerm} <span className="text-xs">✦</span>
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return <span className="whitespace-pre-wrap">{parts}</span>;
}
