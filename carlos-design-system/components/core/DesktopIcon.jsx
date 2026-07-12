import React from 'react';

/* Acceso directo de escritorio: cuadrado de color de marca con logo SVG blanco + etiqueta */
export function DesktopIcon({ label, iconSrc, color, href, onDark = true, size = 38 }) {
  return (
    <a href={href} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      textDecoration: 'none', color: onDark ? '#fff' : 'var(--text-on-chrome)', width: 70,
      fontFamily: 'var(--font-ui)',
    }}>
      <span style={{
        width: size, height: size, background: color,
        border: 'var(--bevel-width) solid', borderColor: 'var(--bevel-raised-colors)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src={iconSrc} alt="" style={{ width: Math.round(size * 0.53), filter: 'brightness(0) invert(1)' }} />
      </span>
      <span style={{
        fontSize: onDark ? 'var(--text-caption)' : 'var(--text-tiny)',
        background: onDark ? 'rgba(10,36,106,0.8)' : 'transparent',
        padding: onDark ? '1px 4px' : 0,
      }}>{label}</span>
    </a>
  );
}
