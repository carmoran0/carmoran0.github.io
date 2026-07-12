# BUILD.md — Especificación de implementación (para Claude Code)

Plan completo para programar la web CarlOS. **Fuente primaria: `Integración.dc.html`** (7b escritorio+mapa, 3d móvil CE, mecánicas 6a–6c) + `Landing GRUB.dc.html` (entrada al sitio). `Idea seleccionada.dc.html` aporta mecánicas extra opcionales (5a–5c). Tokens y componentes: este design system.

## Arquitectura de páginas

```
/                → GRUB landing (menú de arranque)
/index (CarlOS)  → escritorio 7b (SPA, sin recargas)
/404             → BSOD
destinos externos: cv.carmoran.dev, carmoran.dev/es/linkarlos.html (legacy1),
                   carmoran.dev/legacy/index.html (legacy0)
```

Stack sugerido: HTML/CSS/JS vanilla (o Astro). Sin frameworks pesados; la estética no lo necesita. Cargar `styles.css` de este sistema y `assets/jgs9.ttf`.

## 1. Landing GRUB (`/`)

Pantalla negra, fuente `--font-grub` (JetBrains Mono; cargar de Google Fonts), overlay CRT (ver `tokens/grub.css`), texto `--grub-fg`.

- Título centrado: "GNU GRUB  versión 2.12" (14px, `--grub-title`).
- Caja `1px solid var(--grub-border)` max-width 860px; cabecera "selecciona una versión y pulsa Intro para arrancar" (12px, `--grub-dimmer`, separador `--grub-border-inner`).
- 4 entradas (label 19px/500 + sub 12.5px al 62%):
  1. **CarlOS** — "Opción por defecto" → escritorio (default)
  2. **curriculum vitae** — "versión formal" → https://cv.carmoran.dev/
  3. **legacy1** — "Hola" → https://carmoran.dev/es/linkarlos.html
  4. **legacy0** — "Primera versión. 2024" → https://carmoran.dev/legacy/index.html
- Selección: fila con fondo `--grub-fg` y texto `--grub-fg-selected`, marcador `▶` y hint "Intro ↵".
- Interacción: ↑/↓/j/k mueven (envuelven), hover selecciona, Enter/clic arranca; cualquier otra tecla cancela la cuenta atrás.
- Cuenta atrás 8s → arranque automático de la seleccionada. Estado: "La entrada resaltada arrancará automáticamente en Ns." / "Arranque automático cancelado."
- Al arrancar: secuencia de boot (líneas cada 150ms, cursor `grubCursor 1s step-end`):
  ```
  Cargando CarlOS 2.12 ...
  Cargando disco RAM inicial ...
  [    0.000000] Arrancando: {label}
  [    0.041228] systemd-carlos: iniciando servicios del sistema ...
  [  OK  ] Montado /home/carlos/links
  [  OK  ] Iniciado scrobbler de last.fm
  [  OK  ] Iniciado compositor Frutiger Aero
  [  OK  ] Alcanzado objetivo Interfaz Gráfica
  Iniciando servidor X ...
  ```
  → redirect 450ms después de la última línea.

## 2. Escritorio (variante 7b — la seleccionada)

Fondo `--desktop-bg` full-viewport, fuente jgs9. `position:relative`; ventanas absolutas **arrastrables** (por su titlebar) que **recuerdan posición** (localStorage). Clic en ventana → trae al frente (z-index) + sombra `--shadow-window-focus` + titlebar activa; el resto, inactiva.

- **Explorador-mapa** (anclado izq., 250px, siempre visible): árbol monospace `C:\CarlOS\` con carpetas `perfil, música, mastodon, blog, pelis_vistas, links`. Abiertas = fila azul `--link-selected-bg` + " ✓"; clic abre/enfoca su ventana.
- **perfil — carlos.exe**: "CarlOS" 24px + "2005 · he/they/she · Zaragoza · DE @ UNIZAR" + StreakBadge 404.
- **música — reproductor.exe**: gato gif como carátula + MarqueeDisplay con canción actual de last.fm (usuario `sobaco27`, API pública) + scrobbles reales. Controles ⏮ ▶ ⏭ solo en móvil.
- **mastodon — @copaco** (titlebar púrpura): último toot vía API pública de mastodon.social + link "responder en mastodon.social ↗".
- **blog** *(opcional — de Idea seleccionada 5a)*: explorador vista-detalles (columnas Nombre/Tamaño/Tipo/Modificado, filas alternas #f0f0f0, seleccionada azul); doble clic abre **notepad.exe** encima (menú Archivo/Edición/Buscar/Ayuda, cuerpo monospace 13px/1.7, status "Ln 8, Col 1"). Incluir `🔒 borrador_secreto.txt` (tipo "Oculto", fecha "???").
- **pelis_vistas**: fila horizontal de pósters (Letterboxd `boxd.it/9uosP`) + estrellas + "abrir letterboxd ↗".
- **links**: grid 5 col de DesktopIcon size 44. URLs reales (de Integración):
  - letterboxd https://boxd.it/9uosP · steam https://steamcommunity.com/id/poopoopeepeeheehee/ · insta https://www.instagram.com/testriculo/ · discord https://discordapp.com/users/357955189149532161 · mastodon https://mastodon.social/@copaco
  - bluesky https://bsky.app/profile/koljoz.bsky.social · email mailto:metricas_mensulas.0p@icloud.com · github https://github.com/carmoran0 · last.fm https://www.last.fm/user/sobaco27 · sndcloud https://soundcloud.com/koljoz
- **visitas.log** (6c): log monospace `[DD/MM HH:MM] nick: mensaje` + input "escribe tu firma aquí…" + botón Firmar. Backend: cualquier KV simple (o localStorage como fallback marcado TODO).
- **panel_de_control.exe** (6b): "🎨 Propiedades de pantalla" con preview de monitor, 4 fondos (teal por defecto, ciruela, azul marino, teal a cuadros `repeating-conic-gradient(#008080 0 25%, #006666 0 50%)/20px`) y 4 combinaciones (Clásico azul, Ciruela, Verde fósforo → modo terminal global, Alto contraste). Aplicar/Cancelar; persistir en localStorage (`carlos-theme`).
- **Easter eggs** *(opcional — de Idea seleccionada 5c)*: 🗑 Papelera (versiones antiguas visitables, "restaurar deshabilitado 😌"), ⚙ Propiedades del sistema (tabs Win9x General/Rendimiento; stats en broma: "cafeína @ 3.5 GHz", racha, scrobbles, barra "uso de personalidad: 87%").
- **Consola MS-DOS** *(opcional — de Idea seleccionada 5b)*: panel inferior toggleable; comandos `cd, dir, play, help, matrix`; colores `--dos-fg`/`--dos-echo`.
- **Accesos directos** dcha.: letterboxd, github, last.fm (DesktopIcon size 38).
- **Asistente clippy-gato** abajo-dcha (AssistantBubble); reaparece con tips contextuales.
- **Taskbar** 44px: Inicio + tab por ventana abierta (activa = hundida) + bandeja (racha 404 · punto online · reloj real HH:MM).
- **Salvapantallas** (6c): tras ~2 min de inactividad, logo/gato flotando (`floatBounce`); cualquier input lo cierra.

## 3. Móvil (< ~700px) — "CarlOS CE" (variante 3d)

Barra superior 34px ("CarlOS CE" + racha + online + hora). Ventanas maximizadas al 100% apiladas en scroll vertical (sin drag), en este orden: reproductor (con controles ⏮ ▶ ⏭ táctiles), links (grid 5×2), pelis_vistas (fila horizontal con scroll), mastodon. Taskbar 52px con tabs que hacen scroll a su ventana + botón ▲ (volver arriba). Controles táctiles ≥44px.

## 4. 404 — BSOD (6a)

Fondo `--bsod-blue`, monospace 13px blanco, centrado: badge "CarlOS" (fondo #c0c0c0, texto azul), "Se ha producido una excepción 404 en la página C:\CarlOS\{ruta}.html", "* El contenido que buscas fue movido a la papelera * o nunca existió. Nadie lo sabe.", "Pulsa aquí para volver…" + cursor `pulseGlow 1.2s steps(2)`.

## localStorage (claves)

- `carlos-theme` — {fondo, combinación} del panel de control
- `carlos-windows` — posiciones/estado abierto de ventanas
- `carlos-grub-*` — nada persistente (la cuenta atrás siempre corre)

## Criterios de aceptación

1. GRUB navegable 100% con teclado; auto-boot 8s; boot sequence antes de cada navegación.
2. Ventanas arrastrables con foco/z-index y posiciones persistentes; el explorador-mapa refleja en vivo qué ventanas están abiertas (fila azul + ✓).
3. Tema del panel de control persiste entre visitas; "Verde fósforo" re-tematiza todo.
4. Datos reales: last.fm sobaco27 (now playing + scrobbles), mastodon @copaco (último toot), letterboxd (boxd.it/9uosP).
5. 404 = BSOD; racha y reloj vivos en la taskbar; salvapantallas tras inactividad.
6. Sin frameworks de UI modernos visibles: biseles exactos, sombras duras, radius 0, jgs9 en todo el escritorio, JetBrains Mono solo en GRUB/terminal.
7. Los módulos marcados *(opcional)* se implementan en una segunda pasada, tras validar el núcleo.
