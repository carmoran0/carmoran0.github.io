/**
 * Contador de racha: llama (assets/streakico.svg) + número en --streak-orange,
 * en cápsula chrome hundida o suelto (bare) para la bandeja de la taskbar.
 */
export interface StreakBadgeProps {
  count?: number;
  /** Sin cápsula hundida */
  bare?: boolean;
  /** Ruta relativa a streakico.svg si el HTML no está en la raíz */
  iconSrc?: string;
}
