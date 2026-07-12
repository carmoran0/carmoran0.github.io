import React from 'react';

/* Display LED negro con texto verde en marquee (reproductor last.fm) */
export function MarqueeDisplay({ text, subtext, height = 38, duration = 8 }) {
  return (
    <div style={{
      background: '#000',
      border: 'var(--bevel-width) solid', borderColor: 'var(--bevel-sunken-colors)',
      padding: '5px 8px', flex: 1, overflow: 'hidden', position: 'relative', height,
    }}>
      <span style={{
        position: 'absolute', whiteSpace: 'nowrap',
        color: 'var(--terminal-green)', fontFamily: 'var(--font-mono)', fontSize: 11,
        animation: `marquee ${duration}s linear infinite`,
      }}>{text}</span>
      {subtext && (
        <span style={{
          position: 'absolute', bottom: 3, left: 8,
          color: 'var(--terminal-green-dim)', fontFamily: 'var(--font-mono)', fontSize: 9,
        }}>{subtext}</span>
      )}
    </div>
  );
}
