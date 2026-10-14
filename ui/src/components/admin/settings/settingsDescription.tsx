import type { ReactNode } from 'react';

/** Safely render description text that may contain simple <a> tags. */
export function renderDescription(html: string): ReactNode {
  const parts = html.split(/(<a\s[^>]*>.*?<\/a>)/g);
  if (parts.length === 1) return html;

  return parts.map((part, i) => {
    const match = part.match(/^<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>$/);
    if (!match) return part;

    return (
      <a key={i} href={match[1]} target="_blank" rel="noopener noreferrer">
        {match[2]}
      </a>
    );
  });
}
