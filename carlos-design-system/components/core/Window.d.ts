/**
 * Ventana estilo Win9x: chrome gris, bisel en relieve, barra de título con degradado,
 * sombra dura desplazada. Bloque base de TODA la interfaz.
 * @startingPoint section="CarlOS" subtitle="Ventana Win9x con barra de título" viewport="520x200"
 */
export interface WindowProps {
  /** Texto de la barra de título; empieza con emoji-icono, p. ej. "🎵 música — reproductor.exe" */
  title: string;
  /** Degradado de la barra: 'active' azul (defecto), 'inactive' gris, 'purple' social/mastodon */
  variant?: 'active' | 'inactive' | 'purple';
  /** Sombra más profunda (6px) para la ventana con foco */
  focused?: boolean;
  /** Si se pasa, el botón de la barra es clicable */
  onClose?: () => void;
  /** true muestra "_" en vez de "×" */
  minimize?: boolean;
  width?: number | string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/** Área de contenido blanca con bisel hundido, margin 6 / padding 10 */
export interface WindowInsetProps {
  /** Fuente monospace (logs, explorador) */
  mono?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
