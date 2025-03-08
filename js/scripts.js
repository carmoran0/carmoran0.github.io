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

    // En la función setup3DModel o donde cargues el modelo:
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
    const bouncingImages = document.querySelectorAll('.bouncing-image');
    const speeds = [{ x: 1, y: 1 }, { x: -2, y: -2 }, { x: 1.5, y: 1.5 }, { x: -1.5, y: -1.5 }];
    const positions = [
        { x: 0, y: 0 },
        { x: window.innerWidth - 100, y: window.innerHeight - 100 },
        { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        { x: window.innerWidth / 3, y: window.innerHeight / 3 }
    ];

    function adjustImageSizes() {
        bouncingImages.forEach((img, index) => {
            if (img.id === 'image1') {
                img.style.width = '150px';
            } else {
                img.style.width = '100px';
            }
        });
    }

    function animateImages() {
        bouncingImages.forEach((img, index) => {
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

// Contador de visitantes
function setupVisitorCounter() {
    const counterElement = document.getElementById('visitor-counter');
    const today = new Date().toLocaleDateString();
    const storageKey = 'visitorCount_' + today;
    
    // Obtener el conteo actual
    let count = localStorage.getItem(storageKey) || 0;
    count = parseInt(count) + 1;
    
    // Guardar el nuevo conteo
    localStorage.setItem(storageKey, count);
    
    // Actualizar el texto del contador
    counterElement.textContent = `Visitantes: ${count}`;
}

// Inicializar todo cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    setupMovingText();
    setup3DModel();
    setupBouncingImages();
    setupVisitorCounter();
});