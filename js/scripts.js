// Texto parpadeante
const textos = ["C:\\arlos\\readme.txt|", "C:\\arlos\\readme.txt"];
let indice = 0;

function cambiarTexto() {
    const elemento = document.getElementById("texto");
    elemento.textContent = textos[indice];
    indice = (indice + 1) % textos.length;
}

setInterval(cambiarTexto, 530);

// Cambio de color de acento
function changeAccentColor() {
    const hue = (Date.now() / 10) % 360;
    document.documentElement.style.setProperty('--accent-color', `hsl(${hue}, 100%, 50%)`);
    requestAnimationFrame(changeAccentColor);
}

changeAccentColor();

// Variables globales para los murciélagos
let speeds = [{ x: 1, y: 1 }, { x: -2, y: -2 }, { x: 1.5, y: 1.5 }, { x: -1.5, y: -1.5 }];
let positions = [
    { x: 0, y: 0 },
    { x: window.innerWidth - 100, y: window.innerHeight - 100 },
    { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    { x: window.innerWidth / 3, y: window.innerHeight / 3 }
];
let batCount = 2;
let bouncingImagesContainer;

// Función global para añadir murciélagos
// Modificar la función addNewBat en scripts.js
function addNewBat() {
    batCount++;
    const newBat = document.createElement('img');
    
    // Determinar si este murciélago será especial (10% de probabilidad)
    const isSpecialBat = Math.random() < 0.1;
    
    if (isSpecialBat) {
        // Configurar el murciélago especial
        newBat.src = 'images/ANI3DbatHover-special.gif'; // Necesitarás crear esta imagen
        newBat.id = 'special-bat-' + batCount;
        newBat.className = 'bouncing-image special-bat';
        newBat.alt = 'Special Bat Animation';
        newBat.style.width = '120px'; // Un poco más grande que los normales
        
        // Mostrar el pop-up
        showSpecialBatPopup();
    } else {
        // Configuración normal del murciélago
        newBat.src = 'images/ANI3DbatHover.gif';
        newBat.id = 'image' + (batCount + 2);
        newBat.className = 'bouncing-image';
        newBat.alt = 'Bat Animation';
        newBat.style.width = '100px';
    }

    const randomX = Math.random() * (window.innerWidth - 100);
    const randomY = Math.random() * (window.innerHeight - 100);
    positions.push({ x: randomX, y: randomY });

    const randomSpeed = {
        x: (Math.random() * 2 - 1) * 2,
        y: (Math.random() * 2 - 1) * 2
    };
    speeds.push(randomSpeed);

    bouncingImagesContainer.appendChild(newBat);
    
    const batCounterButton = document.querySelector('.bat-counter');
    if (batCounterButton) {
        batCounterButton.textContent = `Murciélagos: ${batCount}`;
    }
    
    return false;
}

// Función para mostrar el pop-up cuando aparece un murciélago especial
function showSpecialBatPopup() {
    // Crear el elemento del pop-up
    const popup = document.createElement('div');
    popup.className = 'special-bat-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <h2>¡Un murciélago shiny ha spawneado!</h2>
            <button id="close-popup">Cerrar</button>
        </div>
    `;
    
    // Añadir el pop-up al body
    document.body.appendChild(popup);
    
    // Manejar el cierre del pop-up
    document.getElementById('close-popup').addEventListener('click', function() {
        popup.classList.add('popup-closing');
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 500); // Tiempo para la animación de cierre
    });
}

// También necesitamos añadir este código al DOMContentLoaded para inicializar
// Puedes añadirlo dentro de la función existente document.addEventListener('DOMContentLoaded', ...)
// Texto en movimiento
function setupMovingText() {
    const movingText = document.getElementById('moving-text');
    let textPosition = -movingText.offsetWidth;

    function moveText() {
        textPosition += 1;
        if (textPosition > window.innerWidth) {
            textPosition = -movingText.offsetWidth;
        }
        movingText.style.transform = `translateX(${textPosition}px)`;
        requestAnimationFrame(moveText);
    }

    moveText();
}

// Modelo 3D
function setup3DModel() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('model-container').appendChild(renderer.domElement);

    const loader = new THREE.GLTFLoader();

    let model, speedX = 0, speedY = 0.005;
    let posX = 0, posY = 0;

    loader.load('models/carlos2.gltf', function(gltf) {
        model = gltf.scene;
        model.scale.set(3.1, 3.1, 3.1);
        scene.add(model);

        function animate() {
            requestAnimationFrame(animate);
            model.rotation.x += Math.random() * 0.01;
            model.rotation.y += Math.random() * 0.01;
            model.rotation.z += Math.random() * 0.01;

            posX += speedX;
            posY += speedY;
            model.position.set(posX, posY, 0);
            renderer.render(scene, camera);
        }
        animate();
    }, undefined, function(error) {
        console.error(error);
    });

    camera.position.z = 5;

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Imágenes rebotando
function setupBouncingImages() {
    bouncingImagesContainer = document.getElementById('bouncing-images');
    
    function adjustImageSizes() {
        document.querySelectorAll('.bouncing-image').forEach((img, index) => {
            if (img.id === 'image1') {
                img.style.width = '150px';
            } else {
                img.style.width = '100px';
            }
        });
    }

    function animateImages() {
        document.querySelectorAll('.bouncing-image').forEach((img, index) => {
            if (index < positions.length) {
                positions[index].x += speeds[index].x;
                positions[index].y += speeds[index].y;

                if (positions[index].x <= 0 || positions[index].x >= window.innerWidth - img.width) {
                    speeds[index].x *= -1;
                }
                if (positions[index].y <= 0 || positions[index].y >= window.innerHeight - img.height) {
                    speeds[index].y *= -1;
                }

                img.style.left = positions[index].x + 'px';
                img.style.top = positions[index].y + 'px';
            }
        });

        requestAnimationFrame(animateImages);
    }

    adjustImageSizes();
    animateImages();

    window.addEventListener('resize', () => {
        positions[1].x = window.innerWidth - 100;
        positions[1].y = window.innerHeight - 100;
    });
}

// Inicializar todo cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    setupMovingText();
    setup3DModel();
    setupBouncingImages();
});


// Array con diferentes títulos
const titulos = [
    "Título Principal",
    "Bienvenido a mi sitio web",
    "Información importante",
    "No te pierdas nuestras ofertas"
  ];
  
  // Variable para controlar el índice actual
  let indiceActual = 0;
  
  // Función para cambiar el título cada 3 segundos
  function cambiarTituloCiclico() {
    setInterval(() => {
      document.title = titulos[indiceActual];
      indiceActual = (indiceActual + 1) % titulos.length;
    }, 500);
  }
  
  // Iniciar el cambio cíclico
  cambiarTituloCiclico();


  // Añade estas variables globales al inicio de tu archivo scripts.js
let huntingMode = false;
let score = 0;

// Función para activar/desactivar el modo caza
function toggleHuntingMode() {
    huntingMode = !huntingMode;
    
    // Cambiar el texto del botón
    const huntButton = document.getElementById('hunt-button');
    if (huntingMode) {
        huntButton.textContent = "🔴 Detener caza";
        huntButton.classList.add('hunting-active');
        document.body.classList.add('hunting-cursor');
        // Hacer que los murciélagos sean clickeables
        makeAllBatsClickable(true);
    } else {
        huntButton.textContent = "🎯 Cazar murciélagos";
        huntButton.classList.remove('hunting-active');
        document.body.classList.remove('hunting-cursor');
        // Hacer que los murciélagos no sean clickeables
        makeAllBatsClickable(false);
    }
    
    // Actualizar el marcador
    updateScoreDisplay();
    
    return false;
}

// Función para hacer clickeables a todos los murciélagos
function makeAllBatsClickable(clickable) {
    const bats = document.querySelectorAll('.bouncing-image');
    bats.forEach(bat => {
        // Cambiar el estilo y los eventos
        if (clickable) {
            bat.style.pointerEvents = 'auto';
            bat.style.cursor = 'crosshair';
            bat.addEventListener('click', killBat);
        } else {
            bat.style.pointerEvents = 'none';
            bat.style.cursor = 'default';
            bat.removeEventListener('click', killBat);
        }
    });
}

// Función para "matar" un murciélago
function killBat(event) {
    if (!huntingMode) return;
    
    const bat = event.target;
    
    // Efecto de muerte (opcional)
    bat.classList.add('dying-bat');
    
    // Aumentar la puntuación
    // Si es un murciélago especial, dar más puntos
    if (bat.classList.contains('special-bat')) {
        score += 5;
    } else {
        score += 1;
    }
    
    // Actualizar el contador de murciélagos
    batCount--;
    const batCounterButton = document.querySelector('.bat-counter');
    if (batCounterButton) {
        batCounterButton.textContent = `Murciélagos: ${batCount}`;
    }
    
    // Actualizar el marcador
    updateScoreDisplay();
    
    // Eliminar el murciélago del array de posiciones y velocidades
    const index = Array.from(bat.parentNode.children).indexOf(bat);
    if (index >= 0 && index < positions.length) {
        positions.splice(index, 1);
        speeds.splice(index, 1);
    }
    
    // Eliminar el murciélago con una animación
    setTimeout(() => {
        bat.parentNode.removeChild(bat);
        
        // Si no quedan murciélagos, mostrar mensaje
        if (batCount <= 0) {
            showGameOverPopup();
        }
    }, 500);
}

// Función para actualizar el marcador
function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) {
        scoreDisplay.textContent = `Puntuación: ${score}`;
    }
}

// Función para mostrar popup de fin de juego
function showGameOverPopup() {
    // Crear el elemento del pop-up
    const popup = document.createElement('div');
    popup.className = 'special-bat-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <h2>¡Todos los murciélagos han sido cazados!</h2>
            <p>Tu puntuación final: ${score}</p>
            <button id="restart-game">Reiniciar juego</button>
        </div>
    `;
    
    // Añadir el pop-up al body
    document.body.appendChild(popup);
    
    // Manejar el reinicio del juego
    document.getElementById('restart-game').addEventListener('click', function() {
        // Reiniciar variables
        batCount = 0;
        score = 0;
        positions = [];
        speeds = [];
        
        // Añadir 2 murciélagos iniciales
        for (let i = 0; i < 2; i++) {
            addNewBat();
        }
        
        // Desactivar modo caza
        huntingMode = true;
        toggleHuntingMode();
        
        // Cerrar popup
        popup.classList.add('popup-closing');
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 500);
    });
}

// Modificar la función addNewBat para hacer que los nuevos murciélagos sean clickeables si estamos en modo caza
function addNewBat() {
    batCount++;
    const newBat = document.createElement('img');
    
    // Determinar si este murciélago será especial (10% de probabilidad)
    const isSpecialBat = Math.random() < 0.1;
    
    if (isSpecialBat) {
        // Configurar el murciélago especial
        newBat.src = 'images/ANI3DbatHover.gif'; // Usamos la misma imagen por ahora
        newBat.id = 'special-bat-' + batCount;
        newBat.className = 'bouncing-image special-bat';
        newBat.alt = 'Special Bat Animation';
        newBat.style.width = '120px'; // Un poco más grande que los normales
        
        // Mostrar el pop-up
        showSpecialBatPopup();
    } else {
        // Configuración normal del murciélago
        newBat.src = 'images/ANI3DbatHover.gif';
        newBat.id = 'image' + (batCount + 2);
        newBat.className = 'bouncing-image';
        newBat.alt = 'Bat Animation';
        newBat.style.width = '100px';
    }

    const randomX = Math.random() * (window.innerWidth - 100);
    const randomY = Math.random() * (window.innerHeight - 100);
    positions.push({ x: randomX, y: randomY });

    const randomSpeed = {
        x: (Math.random() * 2 - 1) * 2,
        y: (Math.random() * 2 - 1) * 2
    };
    speeds.push(randomSpeed);

    bouncingImagesContainer.appendChild(newBat);
    
    // Si estamos en modo caza, hacer que el nuevo murciélago sea clickeable
    if (huntingMode) {
        newBat.style.pointerEvents = 'auto';
        newBat.style.cursor = 'crosshair';
        newBat.addEventListener('click', killBat);
    }
    
    const batCounterButton = document.querySelector('.bat-counter');
    if (batCounterButton) {
        batCounterButton.textContent = `Murciélagos: ${batCount}`;
    }
    
    return false;
}

// Añadir esto al final de la función 'document.addEventListener('DOMContentLoaded', ...)'
function setupHuntingButton() {
    // Crear el botón de caza y el contador de puntuación
    const socialLinksSection = document.querySelector('.social-links div');
    
    // Crear elemento para el botón de caza
    const huntButton = document.createElement('p');
    huntButton.innerHTML = '<a id="hunt-button" class="link-button hunt-button" href="#" onclick="toggleHuntingMode(); return false;">🎯 Cazar murciélagos</a>';
    
    // Crear elemento para el marcador
    const scoreElement = document.createElement('p');
    scoreElement.innerHTML = '<span id="score-display" class="score-display">Puntuación: 0</span>';
    
    // Agregar los elementos al DOM
    socialLinksSection.appendChild(huntButton);
    socialLinksSection.appendChild(scoreElement);
}

// Añadir llamada a setupHuntingButton() dentro de DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    setupMovingText();
    setup3DModel();
    setupBouncingImages();
    setupHuntingButton(); // Añadir esta línea
});

// Esperar a que el DOM cargue completamente
document.addEventListener("DOMContentLoaded", function () {
    const huntButton = document.querySelector(".hunt-button");
    const bouncingImagesContainer = document.getElementById("bouncing-images");
    let huntingMode = false;

    huntButton.addEventListener("click", function () {
        huntingMode = !huntingMode;
        document.body.classList.toggle("hunting-cursor", huntingMode);
        huntButton.classList.toggle("hunting-active", huntingMode);
        
        if (huntingMode) {
            spawnBats(30);
        }
    });

    function spawnBats(count) {
        for (let i = 0; i < count; i++) {
            const bat = document.createElement("img");
            bat.src = "images/ANI3DbatHover.gif";
            bat.classList.add("bouncing-image", "bat");
            bat.style.position = "absolute";
            bat.style.top = Math.random() * window.innerHeight + "px";
            bat.style.left = Math.random() * window.innerWidth + "px";
            
            bat.addEventListener("click", function () {
                if (huntingMode) {
                    bat.classList.add("dying-bat");
                    setTimeout(() => {
                        createExplosion(bat.style.left, bat.style.top);
                        bat.remove();
                    }, 500);
                }
            });

            bouncingImagesContainer.appendChild(bat);
        }
    }

    function createExplosion(x, y) {
        const explosion = document.createElement("div");
        explosion.classList.add("explosion");
        explosion.style.position = "absolute";
        explosion.style.width = "50px";
        explosion.style.height = "50px";
        explosion.style.background = "url('images/explosion.gif') no-repeat center center";
        explosion.style.backgroundSize = "contain";
        explosion.style.left = x;
        explosion.style.top = y;
        document.body.appendChild(explosion);
        
        setTimeout(() => {
            explosion.remove();
        }, 600);
    }
});
