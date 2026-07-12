# CarlOS Design System

Sistema de diseño de **CarlOS** — la web personal de Carlos (carmoran0), un sitio-escritorio retro estilo Windows 9x donde cada sección es una ventana, carpeta o `.exe`. Deriva de la idea seleccionada **7b** de `Integración.dc.html` (proyecto MAIN): escritorio clásico + ventana-explorador como mapa del sitio, con las mecánicas de los turnos 6 (arranque/BSOD 404, panel de control de temas, visitas.log).

**Fuente de verdad:** `Integración.dc.html` (7b escritorio+mapa, 3d móvil CE, mecánicas 6a–6c) y `Landing GRUB.dc.html` (menú de arranque de entrada al sitio) del proyecto MAIN; `Idea seleccionada.dc.html` aporta extras opcionales. No hay Figma ni codebase externo.

## Concepto

La web ES un ordenador ("CarlOS", juego con Carlos + OS):
- El **escritorio** (fondo teal radial) contiene ventanas movibles: perfil, música (last.fm), mastodon, blog, pelis_vistas, links.
- Una **ventana-explorador** anclada a la izquierda (`C:\CarlOS\ — mapa`) actúa de índice: clic → abre/enfoca ventana.
- **Taskbar** inferior con botón Inicio, tabs de ventanas abiertas y bandeja (racha 🔥404, punto online, hora).
- Mecánicas: BSOD azul como 404, panel de control para que el visitante cambie tema (persistente en localStorage), libro de visitas como `visitas.log`, asistente clippy-gato.
- Versión móvil ("CarlOS CE"): ventanas maximizadas apiladas en scroll vertical, taskbar de 52px.

## CONTENT FUNDAMENTALS

- **Idioma:** español, tuteo, tono juguetón y autoconsciente ("qué webazo", "nadie lo sabe", "la web es 'su' ordenador").
- **Casing:** minúsculas para carpetas/labels (`perfil`, `pelis_vistas`, `links`), snake_case para nombres de archivo ficticios.
- **Metáfora obligatoria:** todo se nombra como sistema de archivos o ejecutable: `reproductor.exe`, `panel_de_control.exe`, `visitas.log`, `C:\CarlOS\esta_pagina_no_existe.html`.
- **Emoji:** SÍ, como iconos de sistema en títulos de ventana y explorador (📁 🎵 🐘 👤 🔗 📋 🖥 📂). No en prosa.
- **Errores con humor:** el 404 es un BSOD: "El contenido que buscas fue movido a la papelera * o nunca existió. Nadie lo sabe."
- **Datos personales del dueño:** CarlOS · 2005 · he/they/she · Zaragoza · DE @ UNIZAR. Handles: github carmoran0, mastodon @copaco, last.fm sobaco27, etc. (ver demo).

## VISUAL FOUNDATIONS

- **Color:** chrome gris `#d4d0c8` (pressed `#bdb9b0`) sobre escritorio teal radial (`--desktop-bg`). Barras de título degradadas 90°: azul activo `#0a246a→#a6caf0`, gris inactivo, púrpura para social. 4 acentos del logo Inicio: cian `#3be9fd`, verde `#7CFF52`, naranja `#FF9600`, rojo `#ff5252`. Semánticos: verde fósforo `#00ff00` sobre negro (LED/terminal), online `#00c000`, racha `#c86400`, BSOD `#0000aa`, tooltip amarillo `#ffffc8`.
- **Tipografía:** `jgs9` (pixel, assets/jgs9.ttf) para TODA la UI; `monospace` para terminal/logs/explorador. Escala densa 9–15px, display 24px. Único peso alternativo: 700.
- **Bordes/biseles:** EL motivo central. Relieve: `border:2px solid; border-color:#fff #404040 #404040 #fff`. Hundido: invertido. Botón de título: igual a 1px. Nada de borders sutiles modernos.
- **Radios:** 0 en ventanas y botones. Excepciones: cápsula 20px (badges), bocadillo `10px 10px 0 10px`, marco monitor 10px, móvil 36px.
- **Sombras:** SIEMPRE duras sin blur: `4px 4px 0 rgba(0,0,0,.35)` (ventana), `6px 6px 0 .45` (foco), `3px 3px 0 .3` (tooltip). Excepción: glow del punto online y sombra suave del marco del móvil.
- **Fondos:** degradados radiales teal (o ciruela/azul marino como temas alternativos del panel de control); nunca fotos full-bleed.
- **Animación:** mecánica, no suave — `marquee` lineal infinito, cursor `pulseGlow 1.2s steps(2)` (¡steps, no ease!), `eq` para barras de ecualizador. Sin fades ni bounces.
- **Estados:** selección = fondo `#0a246a` + texto blanco (estilo lista Win9x). Pressed = bisel invertido + `--chrome-pressed`. Links: `beige→#fff` sobre oscuro, `#0a246a` sobre claro.
- **Imágenes:** gifs pixelados con borde biselado; pósters/placeholder = rayas diagonales `repeating-linear-gradient(45deg,#889…)` con etiqueta monospace.
- **Transparencia/blur:** solo la cápsula de etiqueta de icono `rgba(10,36,106,0.8)`. Sin backdrop-blur — anacrónico.

## ICONOGRAPHY

- **Emoji como iconos de sistema** en barras de título y árbol del explorador (📁 🎵 🐘…). Unicode para controles: ⏮ ▶ ⏭ × _ ▲ ▮ ★.
- **Logos de servicios:** SVG reales en `assets/logos/` (github, letterboxd, last.fm, steam, instagram, discord, mastodon, bluesky, soundcloud, email), siempre teñidos a blanco con `filter: brightness(0) invert(1)` sobre cuadrado del color de marca.
- **Gifs retro:** `assets/gato.escuchando.gif` (asistente/carátula), `assets/favicon.gif`, más blinkies 88×31 en `images/` del proyecto MAIN (no copiados aquí; pedir si se necesitan).
- **No hay logo de marca:** "CarlOS" se escribe en texto plano (jgs9, bold). El logo del botón Inicio es un conic-gradient de 4 acentos.
- **Nunca** dibujar SVGs a mano ni usar icon fonts modernos (Lucide, etc.).

## Índice

- `BUILD.md` — **especificación completa de implementación para Claude Code** (landing GRUB, escritorio 7b, móvil CE, BSOD 404, localStorage, criterios de aceptación).
- `styles.css` — entrada global (importa tokens/).
- `tokens/` — `colors.css`, `typography.css`, `effects.css` (biseles, sombras, keyframes), `fonts.css` (@font-face jgs9), `grub.css` (capa GRUB/terminal: paleta negra `#c9c9c9`, JetBrains Mono, cursor y overlay CRT).
- `components/core/` — Window (+WindowInset), BevelButton (+StartButton), Taskbar, DesktopIcon, StreakBadge, AssistantBubble, MarqueeDisplay. Cada uno con `.d.ts` (contrato de props) y `.prompt.md` (uso).
- `assets/` — jgs9.ttf, streakico.svg, gato.escuchando.gif, favicon.gif, button.png, logos/.
- `demo/index.html` — recreación estática del escritorio 7b usando los tokens; referencia visual canónica.
- `SKILL.md` — para usar como Agent Skill en Claude Code.

### Adiciones intencionadas
- `WindowInset`, `MarqueeDisplay`, `StreakBadge` extraídos como componentes propios porque se repiten ≥3 veces en la fuente.
