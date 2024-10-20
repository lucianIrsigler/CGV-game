import * as THREE from 'three';
import { Bullet } from './bullet.js'; // Import the Bullet class
import Crosshair from './crosshair.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { lamps } from './lampPos1.js'; // Import the lamps object from lampPos.js

// Scene and Camera Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Renderer Setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x333333);

// Cube (Player)
const geometry = new THREE.BoxGeometry(0.5, 2, 0.5);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1.5, 0); // Set initial position of the cube
scene.add(cube);

// Ground
//Texture for ground 
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('PavingStones.jpg', (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
});
const platformMaterial = new THREE.MeshStandardMaterial({ map: texture }); 
const platformGeometry = new THREE.BoxGeometry(100, 1, 100);
const platform = new THREE.Mesh(platformGeometry, platformMaterial);
scene.add(platform);

// Walls
const textureLoaderWall = new THREE.TextureLoader();
const textureWall = textureLoaderWall.load('PavingStones.jpg', (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10,10);
});
const sideWallGeometry = new THREE.BoxGeometry(1, 100, 100);
const sideWallMaterial = new THREE.MeshStandardMaterial({ map: textureWall }); 
const wall1 = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
wall1.position.set(0, 50, -50); 
wall1.rotation.y = Math.PI / 2; // Rotate the wall 90 degrees
scene.add(wall1);

const wall2 = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
wall2.position.set(50, 50, 0);
scene.add(wall2);

const wall3 = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
wall3.position.set(0, 50, 50);
wall3.rotation.y = Math.PI / 2; // Rotate the wall 90 degrees
scene.add(wall3);

const wall4 = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
wall4.position.set(-50, 50, 0);
scene.add(wall4);

// Lighting
// const light = new THREE.DirectionalLight(0xffffff, 0.3); // (color, intensity)
// light.position.set(0, 100, 0); // Light above the scene - (x, y, z)
// scene.add(light);

// Create Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Soft white light, 0.5 is the intensity
scene.add(ambientLight);

// Convert lamps object to an array
const lampsArray = Object.values(lamps);
const loader = new GLTFLoader();
// Function to load lamps
function loadLamps() {
    lampsArray.forEach(lamp => {
        loader.load(lamp.scene, function (gltf) {
            let model = gltf.scene;
            scene.add(model);
            console.log("lamplaoded")
            model.position.set(lamp.positionX, lamp.positionY, lamp.positionZ);
            model.scale.set(lamp.scaleX, lamp.scaleY, lamp.scaleZ);
            model.castShadow = true;

            const lampLight = new THREE.PointLight(0xA96CC3, 5, 5); // Purple light - (color, intensity, distance)
            lampLight.position.set(lamp.positionX, lamp.positionY + 2, lamp.positionZ); 
            model.add(lampLight);
            scene.add(lampLight);
            // Add the point light to the lamp model
            

        }, undefined, function (error) {
            console.error('An error happened while loading the lamp model:', error);
        });
    });
}

// Load lamps into the scene
loadLamps();

// let points = [];
// const spotLight = new THREE.SpotLight(0x0000ff,5, 4, Math.PI / 6, 0.5, 2);
// spotLight.userData.originalIntensity = spotLight.intensity; // Store original intensity
// spotLight.position.set(0, 4, 0);
// const targetObject = new THREE.Object3D();
// targetObject.position.set(0, 0, 1); // Position it below the spotlight
// scene.add(targetObject);
// spotLight.target = targetObject;
// scene.add(spotLight);
// const spotLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(spotLightHelper);
// points.push(spotLight);


// Camera Initial Position (behind the cube)
let cameraOffset = new THREE.Vector3(0, 1.5, -3); // Behind and above the cube
camera.position.copy(cube.position).add(cameraOffset);
camera.lookAt(cube.position);

// Variables for player movement
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

// Mouse control to rotate cube and camera
let rotationSpeed = 0.005; // Sensitivity of mouse movement
let cubeRotationY = 0; // Track rotation around the Y-axis
let verticalLook = 0; // Track vertical rotation

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Event Listeners for key inputs (WASD movement)
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
            moveForward = true;
            break;
        case 'KeyS':
            moveBackward = true;
            break;
        case 'KeyA':
            moveLeft = true;
            break;
        case 'KeyD':
            moveRight = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
            moveForward = false;
            break;
        case 'KeyS':
            moveBackward = false;
            break;
        case 'KeyA':
            moveLeft = false;
            break;
        case 'KeyD':
            moveRight = false;
            break;
    }
});

// Mouse movement for rotating the cube and camera
document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1; // Normalize x
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // Normalize y

    let deltaX = event.movementX * rotationSpeed;
    let deltaY = -event.movementY * rotationSpeed; // Invert vertical mouse movement
    cubeRotationY -= deltaX; // Adjust cube's rotation Y value
    verticalLook -= deltaY; // Adjust vertical look
});

// Array to hold bullets
let bullets = [];

document.addEventListener('mousedown', (event) => {
    if (event.button === 0 && !isSettingsMenuOpen) { // Only shoot if menu is not open
        const bullet = new Bullet(cube.position.clone()); // Create bullet at the cube's position

        // Calculate the bullet direction based on the camera's forward direction
        const direction = new THREE.Vector3(); // Create a new vector for direction
        camera.getWorldDirection(direction); // Get the direction the camera is facing
        direction.normalize(); // Normalize the direction vector

        bullet.velocity.copy(direction); // Set bullet velocity to point in the camera's direction
        bullets.push(bullet); // Add bullet to the array
        scene.add(bullet.mesh); // Add bullet mesh to the scene
        
        scene.add(bullet.light); // Add bullet light to the scene
    }
});

// Update camera position to always follow the cube
function updateCamera() {
    // Calculate the new camera position based on cube's rotation around the Y-axis
    const offset = new THREE.Vector3(-2, 1.5, -2); // Adjust this for the right shoulder view
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), cubeRotationY); // Rotate offset based on cube's Y rotation

    // Set camera position based on the cube's position plus the rotated offset
    camera.position.copy(cube.position).add(offset);

    // Adjust camera's vertical position based on the vertical look
    camera.position.y += verticalLook;

    // Calculate a target position slightly in front of the cube for the camera to look at
    const lookAtOffset = new THREE.Vector3(-2, 0, 2); // Adjust this to control how far in front of the cube to look
    lookAtOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), cubeRotationY);
    camera.lookAt(cube.position.clone().add(lookAtOffset)); // Look at the adjusted target position
}

// Move the cube (player) based on WASD input
function movePlayer() {
    if (isSettingsMenuOpen) return; // Prevent movement if menu is open

    const moveSpeed = 0.1;
    let direction = new THREE.Vector3();

    if (moveForward) {
        direction.z += moveSpeed;
    }
    if (moveBackward) {
        direction.z -= moveSpeed;
    }
    if (moveLeft) {
        direction.x += moveSpeed;
    }
    if (moveRight) {
        direction.x -= moveSpeed;
    }

    // Rotate movement direction by cube's rotation (Y-axis only)
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), cubeRotationY);
    
    // Move the cube
    cube.position.add(direction);

    // Update cube's rotation to face the direction it's moving
    if (direction.length() > 0) {
        cube.rotation.y = Math.atan2(direction.x, direction.z); // Update rotation to face movement direction
    }
}

// Animation Loop
function animate() {
    movePlayer();  // Update player movement
    updateCamera();  // Update camera to follow the player

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const isActive = bullets[i].update(scene); // Pass scene to update the bullet
        if (!isActive) {
            bullets.splice(i, 1); // Remove bullet from the array if inactive (traveled max distance)
        }
    }

    renderer.render(scene, camera);  // Render the scene
}

// Resize the renderer with window size
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Pointer Lock Functionality
let isSettingsMenuOpen = false; // Flag to track if settings menu is open

function lockPointer() {
    if (!isSettingsMenuOpen) { // Only lock pointer if settings menu is not open
        renderer.domElement.requestPointerLock();
    }
}

document.addEventListener('click', () => {
    lockPointer(); // Attempt to lock pointer on click
});

// Function to open settings modal
function openSettings() {
    settingsModal.style.display = 'block';
    document.exitPointerLock(); // Exit pointer lock when opening settings
    isSettingsMenuOpen = true; // Set flag to indicate settings menu is open
}

// Function to close settings modal
function closeSettings() {
    settingsModal.style.display = 'none';
    lockPointer(); // Re-enable pointer lock when closing settings
    isSettingsMenuOpen = false; // Reset flag when settings menu is closed
}

// Function to toggle settings modal when ESC is pressed
window.addEventListener('keydown', (event) => {
    if (event.key === "Escape") {
        if (settingsModal.style.display === 'none' || settingsModal.style.display === '') {
            openSettings();
        } else {
            closeSettings();
        }
    }
});

// Create Crosshair
const crosshair = new Crosshair(5, 'red');