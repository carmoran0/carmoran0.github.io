import * as THREE from 'three';
import { PointerLockControls } from 'https://unpkg.com/three@0.154.0/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.154.0/examples/jsm/loaders/GLTFLoader.js';

// Escena básica con controles WASD + interacción por raycast
const container = document.getElementById('container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0.5  , 0); // altura aumentada

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);
// Habilitar shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Luz
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
hemi.position.set(0, 200, 0);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(0, 10, 0);
// Configurar sombras para la luz direccional
dir.castShadow = true;
dir.shadow.mapSize.width = 1024;
dir.shadow.mapSize.height = 1024;
dir.shadow.camera.near = 0.5;
dir.shadow.camera.far = 50;
dir.shadow.camera.left = -10;
dir.shadow.camera.right = 10;
dir.shadow.camera.top = 10;
dir.shadow.camera.bottom = -10;
scene.add(dir);

// Suelo simple
const floorGeo = new THREE.PlaneGeometry(200, 200);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1;
floor.receiveShadow = true;
scene.add(floor);

// Controles pointer lock
const controls = new PointerLockControls(camera, document.body);
document.getElementById('enter-pointer').addEventListener('click', () => controls.lock());
document.addEventListener('keydown', (e) => { if (e.key === 'Enter') controls.lock(); });

// Movimiento WASD
const move = { forward: false, backward: false, left: false, right: false };
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const speed = 16; // m/s (velocidad aumentada)
// Tamaño de la hitbox del jugador (radio en metros)
const PLAYER_RADIUS = 0.8;

function onKeyDown(event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW': move.forward = true; break;
    case 'ArrowLeft':
    case 'KeyA': move.left = true; break;
    case 'ArrowDown':
    case 'KeyS': move.backward = true; break;
    case 'ArrowRight':
    case 'KeyD': move.right = true; break;
  }
}
function onKeyUp(event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW': move.forward = false; break;
    case 'ArrowLeft':
    case 'KeyA': move.left = false; break;
    case 'ArrowDown':
    case 'KeyS': move.backward = false; break;
    case 'ArrowRight':
    case 'KeyD': move.right = false; break;
  }
}
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// Raycaster para interacción
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let INTERSECTED = null;

function onInteract() {
  // lanzar rayo desde cámara hacia adelante
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const first = intersects[0].object;
    if (first.userData && first.userData.interactable) {
      alert(first.userData.message || 'Has interactuado con un objeto.');
    }
  }
}
window.addEventListener('keydown', (e) => { if (e.code === 'KeyE') onInteract(); });

// Cargar modelo si existe
const loader = new GLTFLoader();
loader.load('/escena/model.glb', (gltf) => {
  gltf.scene.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } });
  scene.add(gltf.scene);
  // Marcar algún mesh interactuable si existe con nombre "Interactable"
  const interactable = gltf.scene.getObjectByName('Interactable');
  if (interactable) {
    interactable.userData.interactable = true;
    interactable.userData.message = 'Interactuable desde Blender!';
  }
}, undefined, (err) => { console.warn('No se pudo cargar /escena/model.glb (esto está bien si no lo tienes):', err); });

// Un objeto de ejemplo para interactuar si no hay modelo
const box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({ color: 0x6699ff }));
box.position.set(0,0.5,-3);
box.userData.interactable = true;
box.userData.message = 'Caja de ejemplo: Hola!';
box.castShadow = true;
box.receiveShadow = true;
scene.add(box);

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Loop

let prevTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();
  const delta = (time - prevTime) / 1000;
  prevTime = time;

  if (controls.isLocked === true) {
    // movimiento simple
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(move.forward) - Number(move.backward);
    direction.x = Number(move.right) - Number(move.left);
    direction.normalize();

    if (move.forward || move.backward) velocity.z -= direction.z * speed * delta;
    if (move.left || move.right) velocity.x -= direction.x * speed * delta;

    // Guardar posición previa
    const prevPos = camera.position.clone();

    // Calcular desplazamiento previsto
    const moveX = -velocity.x * delta;
    const moveZ = -velocity.z * delta;

    // Direcciones en el plano XZ basadas en la orientación de la cámara
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up).normalize();

    const displacement = new THREE.Vector3();
    displacement.addScaledVector(right, moveX);
    displacement.addScaledVector(forward, moveZ);

  // Chequeo de colisiones por raycasts (sweep approximation)
  const moveDistance = displacement.length();
  const playerRadius = PLAYER_RADIUS;
  const raycasterMove = new THREE.Raycaster();
    let blocked = false;

    // Orígenes de rayos alrededor de la cámara (centro, izquierda, derecha)
    const origins = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    origins[0].copy(camera.position);
  origins[1].copy(camera.position).addScaledVector(right, -playerRadius * 0.9);
  origins[2].copy(camera.position).addScaledVector(right, playerRadius * 0.9);

    // Recopilar objetos sólidos: todos los meshes menos el suelo
    let solids = [];
    scene.traverse(obj => {
      if (obj.isMesh && obj !== floor) solids.push(obj);
    });

    const dir = displacement.clone().normalize();
    for (let o of origins) {
      raycasterMove.set(o, dir);
      const hits = raycasterMove.intersectObjects(solids, true);
      if (hits.length > 0 && hits[0].distance <= moveDistance + playerRadius * 0.5) {
        blocked = true;
        break;
      }
    }

    if (!blocked) {
      // Aplicar movimiento
      controls.moveRight(moveX);
      controls.moveForward(moveZ);
    } else {
      // Intentar mover solo en X o Z por separado para deslizar
      // prueba X
      const dispX = new THREE.Vector3().addScaledVector(right, moveX);
      let blockedX = false;
      if (dispX.length() > 0) {
        raycasterMove.set(camera.position, dispX.clone().normalize());
        const hitsX = raycasterMove.intersectObjects(solids, true);
  if (hitsX.length > 0 && hitsX[0].distance <= dispX.length() + playerRadius * 0.5) blockedX = true;
      }
      // prueba Z
      const dispZ = new THREE.Vector3().addScaledVector(forward, moveZ);
      let blockedZ = false;
      if (dispZ.length() > 0) {
        raycasterMove.set(camera.position, dispZ.clone().normalize());
        const hitsZ = raycasterMove.intersectObjects(solids, true);
  if (hitsZ.length > 0 && hitsZ[0].distance <= dispZ.length() + playerRadius * 0.5) blockedZ = true;
      }

      if (!blockedX) controls.moveRight(moveX);
      if (!blockedZ) controls.moveForward(moveZ);
    }

    // Añadir colisión con el suelo (no bajar de y=playerRadius)
    if (camera.position.y < playerRadius + 0.01) {
      camera.position.y = playerRadius + 0.01;
      velocity.y = 0;
    }
  }

  // resaltar objeto apuntado
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if (INTERSECTED !== obj) {
      if (INTERSECTED) INTERSECTED.material.emissive && (INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex || 0x000000));
      INTERSECTED = obj;
      if (INTERSECTED.material && INTERSECTED.material.emissive) { INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex(); INTERSECTED.material.emissive.setHex(0x333333); }
    }
  } else {
    if (INTERSECTED) INTERSECTED.material.emissive && (INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex || 0x000000));
    INTERSECTED = null;
  }

  renderer.render(scene, camera);
}
animate();
