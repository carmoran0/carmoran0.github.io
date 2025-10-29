# Descargar imágenes externas

Este pequeño conjunto de scripts localiza URLs de imágenes externas en archivos
HTML/CSS/JS/MD del repositorio, las descarga en la carpeta `images/` y reemplaza
las referencias por rutas locales `/images/<nombre>`.

Archivo principal:

- `scripts/download-images.ps1` — script PowerShell que realiza la búsqueda,
  descarga y reemplazo. Genera `scripts/downloaded-images.csv` con el mapeo.

Cómo usar (Windows PowerShell):

1. Abre PowerShell en la raíz del repositorio.
2. Ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\download-images.ps1
```

Notas y recomendaciones:

- Revisa `scripts/downloaded-images.csv` tras la ejecución para ver qué se
  descargó y si hubo fallos.
- El script hace una copia de seguridad de cada fichero modificado con la
  extensión `.bak` en la misma carpeta.
- Si prefieres primero ver qué URLs se detectarán, abre el script y comenta
  temporalmente la parte de `Invoke-WebRequest` para inspeccionar el listado.
