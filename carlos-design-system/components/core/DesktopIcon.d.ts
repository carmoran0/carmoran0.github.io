/**
 * Acceso directo de escritorio: cuadrado del color de la marca con logo SVG en blanco
 * (filter: brightness(0) invert(1)) y etiqueta con cápsula azul translúcida sobre el escritorio.
 */
export interface DesktopIconProps {
  /** minúsculas, corto: "letterboxd", "github", "sndcloud" */
  label: string;
  /** SVG del logo (assets/logos/…) — se tiñe a blanco por filtro */
  iconSrc: string;
  /** Color de marca de fondo: letterboxd #ff8000, github #6e5494, last.fm #D51007, steam #2a475e, insta #ff0069, discord #7289da, mastodon #6364FF, bluesky #1185FE, email #8a8a8a, soundcloud #FF5500 */
  color: string;
  href?: string;
  /** true (defecto): sobre escritorio, etiqueta con cápsula azul. false: dentro de ventana blanca */
  onDark?: boolean;
  /** Lado del cuadrado en px: 38 escritorio, 44 grid móvil */
  size?: number;
}
