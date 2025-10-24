// Script para murciélagos rebotando dentro de un contenedor específico
// Adaptado del código legacy para funcionar en un contenedor limitado

let batsData = [];
let bouncingArea = null;

function initBats() {
    bouncingArea = document.getElementById('bats-bouncing-area');
    if (!bouncingArea) {
        console.error('Contenedor de murciélagos no encontrado');
        return;
    }

    const bats = document.querySelectorAll('.bouncing-bat');
    
    bats.forEach((bat, index) => {
        const containerRect = bouncingArea.getBoundingClientRect();
        const batWidth = bat.offsetWidth;
        const batHeight = bat.offsetHeight;
        
        // Posiciones iniciales aleatorias dentro del contenedor
        const startX = Math.random() * (containerRect.width - batWidth);
        const startY = Math.random() * (containerRect.height - batHeight);
        
        batsData.push({
            element: bat,
            x: startX,
            y: startY,
            speedX: (Math.random() * 3 + 1) * (Math.random() < 0.5 ? 1 : -1),
            speedY: (Math.random() * 3 + 1) * (Math.random() < 0.5 ? 1 : -1),
            width: batWidth,
            height: batHeight
        });
        
        // Posicionar el murciélago inicial
        bat.style.left = startX + 'px';
        bat.style.top = startY + 'px';
    });
    
    // Iniciar animación
    animateBats();

    // Vincular botón para agregar murciélagos si existe
    const addBtn = document.getElementById('add-bat-button');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            addNewBat();
        });
        // Allow keyboard activation (Enter / Space)
        addBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                addNewBat();
            }
        });
    }
}

// Función para agregar un nuevo murciélago dentro del contenedor
function addNewBat() {
    if (!bouncingArea) return;

    const newBat = document.createElement('img');
    newBat.src = '/legacy/images/ANI3DbatHover.gif';
    newBat.className = 'bouncing-bat';
    newBat.alt = 'Murciélago animado';

    // Añadir al DOM primero para calcular tamaños
    bouncingArea.appendChild(newBat);

    const batWidth = newBat.offsetWidth || 80;
    const batHeight = newBat.offsetHeight || 80;

    const containerWidth = bouncingArea.offsetWidth;
    const containerHeight = bouncingArea.offsetHeight;

    const startX = Math.random() * (containerWidth - batWidth);
    const startY = Math.random() * (containerHeight - batHeight);

    const batData = {
        element: newBat,
        x: startX,
        y: startY,
        speedX: (Math.random() * 3 + 1) * (Math.random() < 0.5 ? 1 : -1),
        speedY: (Math.random() * 3 + 1) * (Math.random() < 0.5 ? 1 : -1),
        width: batWidth,
        height: batHeight
    };

    newBat.style.left = startX + 'px';
    newBat.style.top = startY + 'px';

    batsData.push(batData);
}

function animateBats() {
    if (!bouncingArea) return;
    
    const containerRect = bouncingArea.getBoundingClientRect();
    const containerWidth = bouncingArea.offsetWidth;
    const containerHeight = bouncingArea.offsetHeight;
    
    batsData.forEach(bat => {
        // Actualizar posición
        bat.x += bat.speedX;
        bat.y += bat.speedY;
        
        // Detectar colisión con bordes del contenedor y rebotar
        if (bat.x <= 0 || bat.x >= containerWidth - bat.width) {
            bat.speedX *= -1;
            // Ajustar posición para evitar que se quede pegado
            bat.x = Math.max(0, Math.min(bat.x, containerWidth - bat.width));
        }
        
        if (bat.y <= 0 || bat.y >= containerHeight - bat.height) {
            bat.speedY *= -1;
            // Ajustar posición para evitar que se quede pegado
            bat.y = Math.max(0, Math.min(bat.y, containerHeight - bat.height));
        }
        
        // Aplicar nueva posición
        bat.element.style.left = bat.x + 'px';
        bat.element.style.top = bat.y + 'px';
    });
    
    requestAnimationFrame(animateBats);
}

// Reajustar posiciones cuando se redimensiona la ventana
window.addEventListener('resize', () => {
    if (!bouncingArea) return;
    
    const containerWidth = bouncingArea.offsetWidth;
    const containerHeight = bouncingArea.offsetHeight;
    
    batsData.forEach(bat => {
        // Asegurar que los murciélagos no queden fuera del contenedor
        bat.x = Math.min(bat.x, containerWidth - bat.width);
        bat.y = Math.min(bat.y, containerHeight - bat.height);
        bat.element.style.left = bat.x + 'px';
        bat.element.style.top = bat.y + 'px';
    });
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initBats);
