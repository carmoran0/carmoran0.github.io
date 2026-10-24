# :trollface: CarlOS ![GitHub last commit](https://img.shields.io/github/last-commit/carmoran0/carmoran0.github.io)
## Estructura del proyecto

La web está en [carmoran.dev](https://carmoran.dev) (ver `CNAME`). La versión anterior está archivada en `v1/` y la primera en `legacy/`.


Raíz del repositorio

- `index.html` — Portada: racha, música (Last.fm), mapa de escuchas, últimas pelis (Letterboxd) y contacto.
- `404.html` — Página de error 404. Usa `data/v1.json` para buscar la ruta en `v1/`.
- `CNAME` — Dominio de GitHub Pages.
- `robots.txt` — Reglas para los rastreadores.
- `README.md` — (este archivo) estructura del proyecto.

Directorios principales

- `assets/` — Recursos compartidos por todas las páginas.
	- `main.js` — Lógica de la portada: racha de Duolingo, Last.fm (ahora suena, top de artistas y preview de 30 s), acento de color sacado de la portada, mapa de escuchas del último año, feed de Letterboxd y pie «Actualizada hace X».
	- `theme.js` — Botón de modo claro/oscuro.
	- `fonts/` — Fuentes autoalojadas (IBM Plex Mono, Instrument Serif, Schibsted Grotesk) y su licencia `OFL.txt`.
	- `logos/` — Iconos de los enlaces de contacto y redes.
	- `favicon.gif`, `og.png` (imagen para compartir), `streakico.svg` (icono de la racha) y `nb-flag.png`.

- `estanteria/` — Subpágina «Estantería» (libros leídos).
	- `estanteria.js` — Lee `libros.json` y completa lo que falte con Open Library.
	- `libros.json` — Libros: título, autor, valoración, reseña, etc.

- `uso/` — Subpágina «Cosillas que uso» (software y webs).

- `data/` — Datos de la web, la mayoría generados por las Actions.
	- `scrobbles.json` — Escuchas por día del último año, para el mapa de escuchas.
	- `letterboxd.xml` — Copia local del RSS de Letterboxd.
	- `v1.json` — Lista de ficheros de `v1/`.

- `developer/` — Scripts de mantenimiento.
	- `update-scrobbles.js` — Cuenta las escuchas por día (hora de Madrid) con `user.getrecenttracks` y guarda `data/scrobbles.json`. Solo pide los días que faltan y los dos últimos.
	- `update-readme.js` — Descarga el README del perfil de GitHub y lo inserta en `v1/en/linkarlos.html` y `v1/es/linkarlos.html`.
	- `download-images.ps1` — Descarga a local las imágenes externas y sustituye sus URLs. Ver `developer/README-images.md`.
	- `list-images-only.ps1` — Solo lista las imágenes externas, sin descargarlas.

- `.github/workflows/` — Automatizaciones.
	- `update-scrobbles.yml` — Diaria, justo después de medianoche en Madrid.
	- `update-letterboxd.yml` — Diaria: descarga el RSS de Letterboxd.
	- `update-readme.yml` — Manual, o al recibir el evento `readme-updated`.

- `en/`, `es/` — Redirecciones a `/` de las URLs antiguas.

- `v1/` — Versión anterior de la web, archivada. Tiene sus propios `css/`, `js/` e `images/`.

- `legacy/` — Versión muy antigua, archivada. Ver `legacy/README.md`.



Notas rápidas

- Los scripts de `assets/` se cargan con `defer` en cada página.
- Las transiciones entre páginas usan la View Transitions API cuando el navegador la soporta. Con movimiento reducido no hay animación.
- Los commits de las Actions llevan «(autogenerado)» en el mensaje. El pie de la portada los ignora para mostrar el último cambio hecho a mano.
- La analítica es Umami, cargada en la portada, las subpáginas y el 404.
- Para desarrollo local, servir con un servidor estático (por ejemplo `npx serve`). Las rutas absolutas como `/assets/…` no funcionan abriendo `index.html` directamente.
