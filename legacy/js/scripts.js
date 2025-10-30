// Legacy copy of scripts.js (adjusted paths where necessary)
// Texto parpadeante
const textos = ["C:\\arlos\\readme.txt|", "C:\\arlos\\readme.txt"];
let indice = 0;

function cambiarTexto() {
    const elemento = document.getElementById("texto");
    if (elemento) elemento.textContent = textos[indice];
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

function addNewBat() {
    batCount++;
    const newBat = document.createElement('img');
    const isSpecialBat = Math.random() < 0.1;
    
    if (isSpecialBat) {
        newBat.src = '/legacy/images/ANI3DbatHover.gif';
        newBat.id = 'special-bat-' + batCount;
        newBat.className = 'bouncing-image special-bat';
        newBat.alt = 'Special Bat Animation';
        newBat.style.width = '120px';
        showSpecialBatPopup();
    } else {
        newBat.src = '/legacy/images/ANI3DbatHover.gif';
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

let toastQueue = [];
let toastSpacing = 10;

function showSpecialBatPopup() {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div class="toast-content">
            <h3>¡Un murciélago <span class="shiny-text">shiny</span> ha spawneado!</h3>
        </div>
    `;
    document.body.appendChild(toast);
    toastQueue.push(toast);
    positionToasts();
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
            const index = toastQueue.indexOf(toast);
            if (index > -1) {
                toastQueue.splice(index, 1);
                positionToasts();
            }
        }, 500);
    }, 4000);
}

function positionToasts() {
    let bottomPosition = 20;
    for (let i = 0; i < toastQueue.length; i++) {
        const toast = toastQueue[i];
        toast.style.bottom = bottomPosition + 'px';
        const height = toast.getBoundingClientRect().height;
        bottomPosition += height + toastSpacing;
    }
}

function setupMovingText() {
    const movingText = document.getElementById('moving-text');
    if (!movingText) return;
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

function setup3DModel() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('model-container').appendChild(renderer.domElement);

    const loader = new THREE.GLTFLoader();
    const loadingManager = new THREE.LoadingManager();
    loadingManager.setURLModifier(function(url) {
        if(url.includes('carlos%20supremo.png')) {
            return '/legacy/images/carlos supremo.png';
        }
        return url;
    });
    loader.manager = loadingManager;

    let model, speedX = 0, speedY = 0.005;
    let posX = 0, posY = 0;

    loader.load('/models/carlos2.gltf', function(gltf) {
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

function setupBouncingImages() {
    bouncingImagesContainer = document.getElementById('bouncing-images');
    if (!bouncingImagesContainer) return;
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

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    function setTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeToggle) themeToggle.innerHTML = '\ud83c\udf19';
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (themeToggle) themeToggle.innerHTML = '\u2600\ufe0f';
        }
    }
    setTheme();
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '\u2600\ufe0f';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '\ud83c\udf19';
            }
        });
    }
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
                if (themeToggle) themeToggle.innerHTML = '\ud83c\udf19';
            } else {
                document.documentElement.removeAttribute('data-theme');
                if (themeToggle) themeToggle.innerHTML = '\u2600\ufe0f';
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupMovingText();
    setup3DModel();
    setupBouncingImages();
    setupThemeToggle();
    if (typeof calculateStreak === 'function') {
        calculateStreak();
        setInterval(calculateStreak, 86400000);
    }
});

function calculateStreak() {
    const streakStartDate = new Date('2023-11-23');
    const today = new Date();
    const diffTime = Math.abs(today - streakStartDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const node = document.querySelector('#streak-counter .streak-number');
    if (node) node.textContent = `${diffDays} días`;
}

const titulos = [
    "C:\\Users\\cormoran>",
    "C:\\Users\\cormoran>|"
  ];
  let indiceActual = 0;
  function cambiarTituloCiclico() {
    setInterval(() => {
      document.title = titulos[indiceActual];
      indiceActual = (indiceActual + 1) % titulos.length;
    }, 500);
  }
  cambiarTituloCiclico();

// Functions for dark mode / screamer and uwu left as in original
function showSpecialBatPopup() {/* placeholder - defined earlier */}
function activateDarkMode() {
    document.body.classList.add("dark-mode");
    let bats = document.querySelectorAll(".bouncing-image");
    bats.forEach((bat, index) => {
        let screamerImg = index % 2 === 0 ? "/legacy/images/screamer1.jpeg" : "/legacy/images/screemer2.jpeg";
        bat.src = screamerImg;
        bat.classList.add("screamer-effect");
    });
}
function deactivateDarkMode() {
    document.body.classList.remove("dark-mode");
    let bats = document.querySelectorAll(".bouncing-image");
    bats.forEach(bat => {
        bat.src = "/legacy/images/ANI3DbatHover.gif";
        bat.classList.remove("screamer-effect");
    });
}
function checkTimeForDarkMode() {
    let now = new Date();
    let hours = now.getHours();
    if (hours === 3) {
        activateDarkMode();
    } else {
        deactivateDarkMode();
    }
}
checkTimeForDarkMode();
setInterval(checkTimeForDarkMode, 60000);

function uwu(state) {
    if (state) {
        activateDarkMode();
    } else {
        deactivateDarkMode();
    }
}
