import React from 'react';
import { StartButton, BevelButton } from './BevelButton.jsx';
import { StreakBadge } from './StreakBadge.jsx';

/* Barra de tareas inferior: Inicio + tabs de ventanas + bandeja (racha, online, hora) */
export function Taskbar({ items = [], activeItem, clock = '19:05', mobile = false, onItemClick }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: mobile ? 52 : 44,
      background: 'var(--chrome)', borderTop: '2px solid var(--bevel-light)',
      display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px',
      color: 'var(--text-on-chrome)', zIndex: 10, fontFamily: 'var(--font-ui)',
    }}>
      <StartButton />
      {items.map((it) => (
        <BevelButton key={it} size="sm" pressed={it === activeItem} onClick={onItemClick ? () => onItemClick(it) : undefined}>
          {it}
        </BevelButton>
      ))}
      {!mobile && (
        <div style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--chrome-pressed)',
          border: 'var(--bevel-width) solid', borderColor: 'var(--bevel-sunken-colors)',
          padding: '3px 10px', fontSize: 'var(--text-body)',
        }}>
          <StreakBadge count={404} bare />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--online-dot)', boxShadow: '0 0 4px var(--online-dot)' }}></span>
          <span>{clock}</span>
        </div>
      )}
    </div>
  );
}
