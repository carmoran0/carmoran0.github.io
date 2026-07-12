Barra de tareas inferior con Inicio, tabs de ventanas y bandeja (racha + online + hora).

```jsx
<Taskbar items={['mapa','perfil','música','mastodon']} activeItem="mastodon" clock="19:05" />
```

El contenedor padre necesita `position: relative`. En móvil (`mobile`) es más alta y sin bandeja.
