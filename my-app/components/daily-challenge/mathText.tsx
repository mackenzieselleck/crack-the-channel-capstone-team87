'use client';

// Renders challenge maths with KaTeX. Challenge data comes from the Python generators, which
// write LaTeX (states, matrices, fractions). LLM-written text is never passed through here:
// it is always rendered as plain text.
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useMemo } from 'react';

function render(tex: string, displayMode: boolean) {
  // trust: false (the default) blocks \href, \url and similar, so output is inert HTML.
  return katex.renderToString(tex, { throwOnError: false, displayMode, output: 'html' });
}

/** True if the string is LaTeX rather than plain text (e.g. "\frac{1}{2}", "|0\rangle"). */
export function looksLikeTex(s: string) {
  return /\\[a-zA-Z]+|\^\{?|_\{/.test(s);
}

/** Pure LaTeX, inline or display. */
export function Tex({ tex, display = false, large = false, className }: { tex: string; display?: boolean; large?: boolean; className?: string }) {
  // `large` keeps inline maths at full display size (readable fractions in answer options).
  const html = useMemo(() => render(large && !display ? `\\displaystyle ${tex}` : tex, display), [tex, display, large]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Mixed content: "$...$" segments render as maths, a string that is entirely LaTeX renders
 * as maths, and anything else is plain text.
 */
export function MathText({ text, display = false, large = false, className }: { text: string; display?: boolean; large?: boolean; className?: string }) {
  if (text.includes('$')) {
    const parts = text.split(/\$([^$]+)\$/g);
    return (
      <span className={className}>
        {parts.map((part, i) =>
          i % 2 === 1 ? <Tex key={i} tex={part} large={large} /> : <span key={i}>{part}</span>,
        )}
      </span>
    );
  }
  if (looksLikeTex(text)) return <Tex tex={text} display={display} large={large} className={className} />;
  return <span className={className}>{text}</span>;
}
