/**
 * Asistente "clippy-gato": bocadillo amarillo (--tooltip-bg, radio 10/10/0/10)
 * sobre el gif del gato con bisel. Se ancla abajo-derecha del escritorio.
 */
export interface AssistantBubbleProps {
  /** Tono cercano y juguetón, tuteo: "Parece que estás visitando mi web. ¿Necesitas ayuda?…" */
  message: React.ReactNode;
  gifSrc?: string;
  style?: React.CSSProperties;
}
