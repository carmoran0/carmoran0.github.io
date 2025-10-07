# :trollface: link(arlos) ![GitHub last commit](https://img.shields.io/github/last-commit/carmoran0/MOOdleUnizarCSS)
## Estructura del proyecto


Raíz del repositorio

- `index.html` — Página principal.
- `404.html` — Página de error 404.
- `README.md` — (este archivo) estructura del proyecto.
- `jgs9.ttf` — Fuente usada en la web.
- `streakico.svg` — Ícono usado en el contador.

Directorios principales

- `css/`
	- `styles.css` — Estilos principales del sitio.

- `js/`
	- `scripts.js` — Lógica principal (contador, inicializadores).
	- `lastfm.js` — Integración con la API de Last.fm.
	- `github-readme.js` — Carga y conversión básica del README de GitHub.
	- `bats.js` — Script que anima murciélagos dentro de un contenedor (legacy-adaptado).
	- `oneko.js` — Script que añade un gato que sigue el cursor.

- `images/` — Imágenes públicas usadas en la web (gifs, iconos, etc.).

- `legacy/` — Código y recursos heredados (v. antigua)
	- `index.html` — Versión legacy de la página.
	- `css/` — Estilos legacy.
	- `js/` — Scripts legacy con animaciones y comportamientos originales.
	- `images/` — Recursos gráficos legacy.
	- `models/` — Modelos 3D y binarios (si aplica).



Notas rápidas

- Los scripts se cargan con `defer` en `index.html`.
- El README original de GitHub se carga dinámicamente en la página principal mediante `github-readme.js`.
- Para desarrollo local, abrir `index.html` directamente en el navegador o servir con un servidor estático para evitar problemas de CORS al cargar recursos remotos.
