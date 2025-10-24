/**
 * badges-marquee.js
 * Crea múltiples filas de marquesina infinita con los badges
 */

document.addEventListener('DOMContentLoaded', function() {
    const badgesContainer = document.querySelector('.badges-container');
    if (!badgesContainer) return;

    const badgesGrid = badgesContainer.querySelector('.badges-grid');
    if (!badgesGrid) return;

    // Guardar los badges originales
    const originalBadges = Array.from(badgesGrid.querySelectorAll('img'));
    
    // Número de filas de marquesina (ajustable)
    const numberOfRows = 7;

    // Limpiar el grid y configurarlo para múltiples filas
    badgesGrid.innerHTML = '';
    badgesGrid.style.display = 'flex';
    badgesGrid.style.flexDirection = 'column';
    badgesGrid.style.overflow = 'hidden';
    badgesGrid.style.position = 'relative';
    badgesGrid.style.width = '100%';
    badgesGrid.style.gap = '1px';

    // Crear cada fila de marquesina
    for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
        // Contenedor de la fila
        const rowContainer = document.createElement('div');
        rowContainer.className = 'badges-marquee-row';
        rowContainer.style.overflow = 'hidden';
        rowContainer.style.width = '100%';
        rowContainer.style.padding = '1px 0';

        // Crear la pista de marquesina para esta fila
        const marqueeTrack = document.createElement('div');
        marqueeTrack.className = 'badges-marquee-track';
        marqueeTrack.style.display = 'flex';
        marqueeTrack.style.whiteSpace = 'nowrap';
        marqueeTrack.style.alignItems = 'center';

        // Obtener los badges para esta fila (distribuidos equitativamente)
        const rowBadges = [];
        for (let i = rowIndex; i < originalBadges.length; i += numberOfRows) {
            rowBadges.push(originalBadges[i]);
        }

        // Si no hay badges para esta fila, saltar
        if (rowBadges.length === 0) {
            // crear un placeholder vacío para mantener la separación
            badgesGrid.appendChild(rowContainer);
            continue;
        }

        // Crear el bloque de contenido que se repetirá exactamente 2 veces
        const marqueeContent = document.createElement('div');
        marqueeContent.className = 'marquee-content';
        marqueeContent.style.display = 'inline-flex';
        marqueeContent.style.gap = '8px';
        marqueeContent.style.alignItems = 'center';

        // Rellenar la secuencia con los badges de la fila
        rowBadges.forEach(badge => {
            const clone = badge.cloneNode(true);
            clone.style.flexShrink = '0';
            clone.style.height = '40px';
            clone.style.width = 'auto';
            marqueeContent.appendChild(clone);
        });

        // Añadir dos copias idénticas (esto garantiza que mover -50% corresponde a una secuencia completa)
        marqueeTrack.appendChild(marqueeContent);
        marqueeTrack.appendChild(marqueeContent.cloneNode(true));

        rowContainer.appendChild(marqueeTrack);
        badgesGrid.appendChild(rowContainer);

        // Calcular la duración de la animación una vez que el layout esté listo
        // Usamos setTimeout para esperar a que imágenes y layout se estabilicen
        (function(track, content, idx) {
            // velocidad en píxeles por segundo (ajusta según preferencia)
            const baseSpeed = 80; // px/s
            const speedAdjustment = idx * 10; // filas más abajo van algo más lentas

            function startAnimation() {
                const contentWidth = content.offsetWidth;
                if (!contentWidth) {
                    // si todavía no se ha cargado, reintentar
                    setTimeout(startAnimation, 100);
                    return;
                }

                const pixelsPerSecond = Math.max(40, baseSpeed - speedAdjustment);
                const duration = Math.max(6, Math.round(contentWidth / pixelsPerSecond));

                track.style.animation = `marqueeShift ${duration}s linear infinite`;
                // Alternar dirección en filas impares
                if (idx % 2 === 1) track.style.animationDirection = 'reverse';
            }

            // Iniciar con ligero retraso para asegurar que imágenes han cargado
            setTimeout(startAnimation, 120);
        })(marqueeTrack, marqueeContent, rowIndex);
    }

    // Añadir los estilos de la animación si no existen ya
    if (!document.getElementById('badges-marquee-styles')) {
        const style = document.createElement('style');
        style.id = 'badges-marquee-styles';
        style.textContent = `
            @keyframes marqueeShift {
                0% {
                    transform: translateX(0);
                }
                100% {
                    transform: translateX(-50%);
                }
            }

            .badges-marquee-track {
                will-change: transform;
                display: flex;
                align-items: center;
            }

            /* Pausar la animación al hacer hover en la fila */
            .badges-marquee-row:hover .badges-marquee-track {
                animation-play-state: paused !important;
            }

            /* Asegurar que las imágenes mantengan su aspecto */
            .badges-marquee-track img {
                display: block;
                object-fit: contain;
                height: 40px;
            }
        `;
        document.head.appendChild(style);
    }

    console.log('Marquesina de badges inicializada con', originalBadges.length, 'badges en', numberOfRows, 'filas');
});
