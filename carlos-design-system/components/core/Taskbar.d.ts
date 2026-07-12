/**
 * Barra de tareas inferior (44px escritorio / 52px móvil): botón Inicio, tabs de
 * ventanas abiertas (pressed = activa) y bandeja hundida con racha, punto online y hora.
 * El padre debe tener position: relative.
 */
export interface TaskbarProps {
  /** Nombres de ventanas abiertas, minúsculas: ["mapa","perfil","música","mastodon"] */
  items?: string[];
  /** Cuál se muestra hundida */
  activeItem?: string;
  /** Hora de la bandeja, formato HH:MM */
  clock?: string;
  /** 52px de alto y sin bandeja */
  mobile?: boolean;
  onItemClick?: (item: string) => void;
}
