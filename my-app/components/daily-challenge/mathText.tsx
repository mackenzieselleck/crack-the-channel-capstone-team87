'use client';

// renders challenge maths with KaTeX
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useMemo } from 'react';

function render(tex: string, displayMode: boolean) {
  // false blocks \href, \url and similar, so output is HTML
  return katex.renderToString(tex, { throwOnError: false, displayMode, output: 'html' });
}

// true if string is LaTeX
export function looksLikeTex(s: string) {
  return /\\[a-zA-Z]+|\^\{?|_\{/.test(s);
}

// pure LaTeX, inline or display
export function Tex({ tex, display = false, large = false, className }: { tex: string; display?: boolean; large?: boolean; className?: string }) {
  // large keeps inline maths at full display size
  const html = useMemo(() => render(large && !display ? `\\displaystyle ${tex}` : tex, display), [tex, display, large]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

// mixed content segments render as maths and entirely LaTeX renders as maths
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
