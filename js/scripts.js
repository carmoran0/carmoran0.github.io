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
    const container = movingText.parentElement;
    const containerWidth = container.clientWidth;
    let textPosition = -movingText.offsetWidth;

    function moveText() {
        textPosition += 1;
        if (textPosition > containerWidth) {
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
    
    // Add a texture loader path resolver
    const loadingManager = new THREE.LoadingManager();
    loadingManager.setURLModifier(function(url) {
        // Check if the URL is a texture file referenced in the GLTF
        if(url.includes('carlos%20supremo.png')) {
            return 'images/carlos supremo.png';
        }
        return url;
    });
    
    loader.manager = loadingManager;

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
        console.error('Error loading 3D model:', error);
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

// Theme toggle functionality
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Function to set the theme based on preference or stored value
    function setTheme() {
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '🌙';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.innerHTML = '☀️';
        }
    }
    
    // Set theme on initial load
    setTheme();
    
    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '☀️';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '🌙';
        }
    });
    
    // Listen for system preference changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggle.innerHTML = '🌙';
            } else {
                document.documentElement.removeAttribute('data-theme');
                themeToggle.innerHTML = '☀️';
            }
        }
    });
}

// Inicializar todo cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    setupMovingText();
    setup3DModel();
    setupBouncingImages();
    setupThemeToggle();
});


// Array con diferentes títulos
const titulos = [
    "C:\\Users\\cormoran>",
    "C:\\Users\\cormoran>|"
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

    // Añadir el pop-up al body
    document.body.appendChild(popup);
    
    
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
    const batCounterButton = document.querySelector('.bat-counter');
    if (batCounterButton) {
        batCounterButton.textContent = `Murciélagos: ${batCount}`;
    }
    return false;
}

// Función para activar el modo oscuro y cambiar los murciélagos por screamers
function activateDarkMode() {
    document.body.classList.add("dark-mode");

    let bats = document.querySelectorAll(".bouncing-image");
    bats.forEach((bat, index) => {
        // Alternar entre dos imágenes de screamer
        let screamerImg = index % 2 === 0 ? "images/screamer1.jpeg" : "images/screemer2.jpeg";
        bat.src = screamerImg;
        bat.classList.add("screamer-effect");
    });
}

// Función para desactivar el modo oscuro y restaurar los murciélagos
function deactivateDarkMode() {
    document.body.classList.remove("dark-mode");

    let bats = document.querySelectorAll(".bouncing-image");
    bats.forEach(bat => {
        bat.src = "images/ANI3DbatHover.gif"; // Imagen original de los murciélagos
        bat.classList.remove("screamer-effect");
    });
}

// Función que revisa si son las 3 AM
function checkTimeForDarkMode() {
    let now = new Date();
    let hours = now.getHours();

    if (hours === 3) {
        activateDarkMode();
    } else {
        deactivateDarkMode();
    }
}

// Verifica la hora al cargar la página y cada minuto
checkTimeForDarkMode();
setInterval(checkTimeForDarkMode, 60000);

// Función para probar manualmente el efecto en la consola
function uwu(state) {
    if (state) {
        activateDarkMode();
    } else {
        deactivateDarkMode();
    }
}
