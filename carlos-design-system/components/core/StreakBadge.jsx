import React from 'react';

/* Contador de racha: icono de llama + número naranja. bare = sin cápsula (para bandeja) */
export function StreakBadge({ count = 404, bare = false, iconSrc = 'assets/streakico.svg' }) {
  const inner = (
    <>
      <img src={iconSrc} alt="racha" style={{ height: 14 }} />
      <strong style={{ color: 'var(--streak-orange)' }}>{count}</strong>
    </>
  );
  if (bare) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-body)' }}>{inner}</span>;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 'var(--text-body)', background: 'var(--chrome-pressed)',
      border: 'var(--bevel-width) solid', borderColor: 'var(--bevel-sunken-colors)',
      padding: '3px 10px', fontFamily: 'var(--font-ui)', color: 'var(--text-on-chrome)',
    }}>{inner}</span>
  );
}
