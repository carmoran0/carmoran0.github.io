import React from 'react';

const TITLEBARS = {
  active: 'var(--titlebar-active)',
  inactive: 'var(--titlebar-inactive)',
  purple: 'var(--titlebar-purple)',
};

export function Window({ title, variant = 'active', focused = false, onClose, minimize = false, width, style, children }) {
  return (
    <div style={{
      width,
      background: 'var(--chrome)',
      border: 'var(--bevel-width) solid',
      borderColor: 'var(--bevel-raised-colors)',
      boxShadow: focused ? 'var(--shadow-window-focus)' : 'var(--shadow-window)',
      color: 'var(--text-on-chrome)',
      fontFamily: 'var(--font-ui)',
      ...style,
    }}>
      <div style={{
        background: TITLEBARS[variant] || TITLEBARS.active,
        color: 'var(--text-on-titlebar)',
        padding: '3px 6px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 'var(--text-titlebar)',
      }}>
        <span>{title}</span>
        <span onClick={onClose} style={{
          width: 16, height: 14, background: 'var(--chrome)',
          border: '1px solid', borderColor: 'var(--bevel-raised-colors)',
          fontSize: 9, textAlign: 'center', color: 'var(--text-on-chrome)',
          lineHeight: '12px', cursor: onClose ? 'pointer' : 'default',
        }}>{minimize ? '_' : '×'}</span>
      </div>
      {children}
    </div>
  );
}

/* Área de contenido blanca hundida — usar dentro de <Window> para listas, logs, texto */
export function WindowInset({ mono = false, style, children }) {
  return (
    <div style={{
      background: 'var(--content-bg)',
      border: 'var(--bevel-width) solid',
      borderColor: 'var(--bevel-sunken-colors)',
      margin: 6, padding: 10,
      fontSize: 'var(--text-body)',
      fontFamily: mono ? 'var(--font-mono)' : 'inherit',
      ...style,
    }}>{children}</div>
  );
}
