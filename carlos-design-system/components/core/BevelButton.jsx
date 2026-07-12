import React from 'react';

export function BevelButton({ pressed = false, bold = false, size = 'md', onClick, style, children }) {
  const pad = size === 'sm' ? '3px 10px' : size === 'lg' ? '8px 14px' : '4px 12px';
  return (
    <button onClick={onClick} style={{
      background: pressed ? 'var(--chrome-pressed)' : 'var(--chrome)',
      border: 'var(--bevel-width) solid',
      borderColor: pressed ? 'var(--bevel-sunken-colors)' : 'var(--bevel-raised-colors)',
      padding: pad,
      fontFamily: 'inherit',
      fontSize: size === 'lg' ? 'var(--text-button)' : 'var(--text-body)',
      fontWeight: bold ? 700 : 400,
      color: 'var(--text-on-chrome)',
      cursor: 'pointer',
      ...style,
    }}>{children}</button>
  );
}

/* Botón "Inicio" con el logo conic-gradient de 4 colores */
export function StartButton({ onClick }) {
  return (
    <BevelButton bold size="lg" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 16, height: 16, display: 'inline-block',
        background: 'conic-gradient(var(--accent-cyan) 0 25%, var(--accent-green) 0 50%, var(--accent-orange) 0 75%, var(--accent-red) 0)',
        border: '1px solid var(--bevel-dark)',
      }}></span>
      Inicio
    </BevelButton>
  );
}
