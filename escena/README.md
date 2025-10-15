Escena Three.js
================

Página de ejemplo que carga una escena WebGL con Three.js y controles WASD + Pointer Lock.

Archivos:
- `index.html` - página que monta el canvas y carga `scene.js`.
- `scene.js` - lógica de la escena, carga de `model.glb` si existe, interacción con E.

Uso con Blender:
1. En Blender, preparar la escena y seleccionar los objetos que quieras exportar.
2. File → Export → glTF 2.0 (.glb).
   - Selecciona "Format: glb" (binario) para un solo archivo.
   - Exportar solo las capas/colecciones necesarias.
   - Aplicar transformaciones (Apply Transform) si lo necesitas.
   - Mantén la escala en 1.0; en caso de que el modelo esté muy grande/pequeño, prueba la opción "+Y Up" o ajustar la escala antes de exportar.
3. Coloca el archivo exportado como `escena/model.glb` en el repo (acompañar el commit).

Notas y recomendaciones:
- Para modelos complejos, reduce la cantidad de polígonos y agrupa meshes para un rendimiento mejor.
- Para usar físicas o colisiones avanzadas, integrar ammo.js/cannon o usar mapas de colisión sencillos.
- El script de ejemplo marca como interactuables los objetos llamados `Interactable` en Blender (pon ese nombre en el Outliner).
