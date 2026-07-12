/**
 * Botón chrome con bisel Win9x. Estado pressed = bisel hundido + gris oscuro.
 */
export interface BevelButtonProps {
  /** Bisel hundido + fondo --chrome-pressed (tab activo, toggle on) */
  pressed?: boolean;
  bold?: boolean;
  /** sm: 3px 10px · md: 4px 12px (defecto) · lg: 8px 14px */
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/** Botón "Inicio" de la taskbar con logo conic-gradient de 4 acentos */
export interface StartButtonProps {
  onClick?: () => void;
}
