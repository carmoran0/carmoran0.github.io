import React from 'react';

/* Asistente clippy-gato: bocadillo amarillo + gif del gato, anclado abajo-derecha */
export function AssistantBubble({ message, gifSrc = 'assets/gato.escuchando.gif', style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, ...style }}>
      <div style={{
        background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)',
        borderRadius: 'var(--radius-bubble)', padding: '10px 14px',
        fontSize: 'var(--text-body)', color: 'var(--text-on-chrome)', maxWidth: 260,
        boxShadow: 'var(--shadow-small)', fontFamily: 'var(--font-ui)',
      }}>{message}</div>
      <img src={gifSrc} alt="asistente" style={{
        width: 80, height: 80, objectFit: 'cover',
        border: 'var(--bevel-width) solid', borderColor: 'var(--bevel-raised-colors)',
        boxShadow: 'var(--shadow-window)',
      }} />
    </div>
  );
}
