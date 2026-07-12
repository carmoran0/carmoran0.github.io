/**
 * Display LED: caja negra hundida con texto verde fósforo desplazándose (keyframes marquee).
 * Usado en el reproductor last.fm ("♪ ARTISTA — CANCIÓN ♪" + scrobbles).
 */
export interface MarqueeDisplayProps {
  /** Texto en mayúsculas flanqueado por ♪ */
  text: string;
  /** Línea fija inferior en verde apagado, p. ej. "84.201 scrobbles" */
  subtext?: string;
  height?: number;
  /** Segundos por pasada (defecto 8) */
  duration?: number;
}
