import * as THREE from 'three';
import { Bullet } from './bullet.js'; // Import the Bullet class
import Crosshair from './crosshair.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { lamps } from './lampPos3.js'; // Import the lamps object from lampPos.js
import { cubeMapNode } from 'three/src/nodes/utils/CubeMapNode.js';
import { update } from 'three/examples/jsm/libs/tween.module.js';
import { max } from 'three/webgpu';
import { loadTextures, applyTextureSettings } from './TextureLoaderUtil.js';
import { monster } from './monster.js';
import { player } from './player.js';
import { LoadingManager } from 'three';



//get random monster
function getRandomMonster() {
    const keys = Object.keys(monster); // Get the keys of the monster object
    const randomIndex = Math.floor(Math.random() * keys.length); // Generate a random index
    const randomKey = keys[randomIndex]; // Select a random key
    return monster[randomKey]; // Return the key and the monster details
}

// Example usage
//LOADING
let loadingManager = new LoadingManager();

const progressBar = document.getElementById("progress-bar");
const progressBarContainer = document.querySelector(".progress-bar-container");

loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
    // console.log(`Started loading: ${url}.`);
    progressBarContainer.style.display = 'flex';
};


loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    // console.log(`Loading: ${url}. Loaded ${itemsLoaded} of ${itemsTotal} items.`);
    progressBar.value=(itemsLoaded/itemsTotal)*100;
};

loadingManager.onLoad = () => {
    console.log('All items loaded.');
    progressBarContainer.style.display = 'none';
};

loadingManager.onError = (url) => {
    console.error(`Error loading: ${url}`);
};


// load monster
let monsterModel = null;
const loaderObject = new GLTFLoader(loadingManager);

const monsterLoader = new GLTFLoader(loadingManager);
const currentMonster = getRandomMonster();
// const currentMonster = monster.toon_spike;

loaderObject.load(currentMonster.scene, function (gltf) {
    monsterModel = gltf.scene;
    scene.add(monsterModel);
    monsterModel.position.set(currentMonster.positionX, currentMonster.positionY, currentMonster.positionZ-2);
    monsterModel.scale.set(currentMonster.scaleX, currentMonster.scaleY, currentMonster.scaleZ);
    monsterModel.castShadow = true;

    // Traverse the model and update the material
    monsterModel.traverse((node) => {
        if (node.isMesh) {
            node.material = new THREE.MeshStandardMaterial({
                color: node.material.color,
                map: node.material.map,
                normalMap: node.material.normalMap,
                roughness: 0.5, // Adjust as needed
                metalness: 0.5  // Adjust as needed
            });
        }
    });
}, undefined, function (error) {
    console.error('An error happened while loading the monster model:', error);
});


// Load player
let playerModel = null;
const playerLoader = new GLTFLoader(loadingManager);
loaderObject.load(player.hollow_knight.scene, function (gltf) {
    playerModel = gltf.scene;
    scene.add(playerModel);
    playerModel.position.set(0, player.hollow_knight.positionY, 0);
    playerModel.scale.set(player.hollow_knight.scaleX, player.hollow_knight.scaleY, player.hollow_knight.scaleZ);
    playerModel.castShadow = true;
    // playerModel.rotation.x = Math.PI / 2;
}, undefined, function (error) {
    console.error('An error happened while loading the player model:', error);
});

// Scene and Camera Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const gameOverScreen = document.getElementById("gameOverScreen");
const restartButton = document.getElementById("restartButton");
let isGamePaused = false; // Flag to track if the game is paused
let isEnemyAsleep = true;
document.getElementById('health-bar-container').style.display = 'none';

//ambient sound
const ambientSound = new Audio('ambience.mp3');
ambientSound.volume = 0.3;
ambientSound.loop = true;

document.addEventListener('click', () => {
    if (!ambientSound.playing) {
        ambientSound.play().catch(error => {
            console.error('Failed to play ambient sound:', error);
        });
    }
});

restartButton.addEventListener("click", restartGame);

// Restart Game Function
function restartGame() {
    isEnemyAsleep = true;
    isGamePaused = false; // Unpause the game
    enemyAlive = true; // Reset enemy alive flag
    gameOverScreen.style.display = "none";

    // Reset character and enemy positions
    cube.position.set(0, 1.5, 0); // Reset player position
    switch(currentMonster){
        case monster.tall_monster:
            cubeEnemy.position.set(10, 2, 5); // Reset enemy position
            break;
        case monster.monster_ignan:
            cubeEnemy.position.set(10, 3, 5); // Reset enemy position
            break;
        case monster.toon_spike:
            cubeEnemy.position.set(10, 4.5, 5); // Reset enemy position
            break;
        case monster.anya:
            cubeEnemy.position.set(10, 1, 5); // Reset enemy position
            break;
        default:
            cubeEnemy.position.set(10, 3, 5); // Reset enemy position
            break;
    }
    cubeEnemy.material.color.set(0x040405); // Reset enemy color to original'
    enemyLight.position.copy(cubeEnemy.position); // Reset light position to enemy position

    // Reset health
    enemyCurrentHealth = enemyMaxHealth; // Reset current health to max
    enemyHits = 0; // Reset hit counter
    document.getElementById('health-bar-container').style.display = 'none';
    updateEnemyHealthBar(); // Update health bar to full width
    updatePlayerHealthBar(); // Update player health bar

    // Reset health
    health = maxHealth; // Reset current health to max
    enemyCurrentHealth = enemyMaxHealth;

    // make enemy visible again
    // cubeEnemy.visible = true;
    enemyLight.visible = true;
    enemyLight.intensity = 1; // Reset light intensity

    // crosshair
    crosshair.showCrosshair();

    ambientSound.play(); // Restart ambient sound
}

// Renderer Setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x333333);

// Cube (Player)
const geometry = new THREE.BoxGeometry(0.5, 2, 0.5);
const material = new THREE.MeshStandardMaterial({ color: 0x00a6ff });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 1.5, 0); // Set initial position of the cube
scene.add(cube);
cube.visible = false;

// Cube (enemy)
let geometryEnemy = null;
const materialEnemy = new THREE.MeshStandardMaterial({ color: 0x040405 });
let cubeEnemy = null;
let enemyMaxHealth; // Max health of the enemy
switch(currentMonster){
    case monster.tall_monster:
        enemyMaxHealth = 150;
        geometryEnemy = new THREE.BoxGeometry(1.3, 3, 1.3);
        cubeEnemy = new THREE.Mesh(geometryEnemy, materialEnemy);
        cubeEnemy.position.set(10, 2, 5); // Set initial position of the cube
        break;
    case monster.monster_ignan:
        enemyMaxHealth = 200;
        geometryEnemy = new THREE.BoxGeometry(3, 5, 3);
        cubeEnemy = new THREE.Mesh(geometryEnemy, materialEnemy);
        cubeEnemy.position.set(10, 3, 5); // Set initial position of the cube
        break;
    case monster.toon_spike:
        enemyMaxHealth = 200;
        geometryEnemy = new THREE.BoxGeometry(5.5, 8, 5.5);
        cubeEnemy = new THREE.Mesh(geometryEnemy, materialEnemy);
        cubeEnemy.position.set(10, 4.5, 5); // Set initial position of the cubes
        break;
    case monster.anya:
        enemyMaxHealth = 100;
        geometryEnemy = new THREE.BoxGeometry(1.3, 2, 1.3);
        cubeEnemy = new THREE.Mesh(geometryEnemy, materialEnemy);
        cubeEnemy.position.set(10, 1, 5); // Set initial position of the cube
        break;
    default:
        enemyMaxHealth = 100;
        geometryEnemy = new THREE.BoxGeometry(1.3, 3, 1.3);
        cubeEnemy = new THREE.Mesh(geometryEnemy, materialEnemy);
        cubeEnemy.position.set(10, 3, 5); // Set initial position of the cube
        break;
}

// const geometryEnemy = new THREE.BoxGeometry(1.3, 3, 1.3);
scene.add(cubeEnemy);
cubeEnemy.visible = false;

// Create a point light to simulate the enemy emitting light
const enemyLight = new THREE.PointLight(0xff0400, 1, 100); // Color, intensity, distance
enemyLight.position.set(10, 2, 5);  // Set the light position to the cube's position
scene.add(enemyLight);

// Create a point light to simulate the player emitting light
const playerLight = new THREE.PointLight(0xffffff, 1, 50); // Color, intensity, distance
playerLight.position.set(0, 1.5, 0);  // Set the light position to the cube's position
scene.add(playerLight);

// Enemy movement variables
const enemyMovementSpeed = 0.1; // Adjusted speed for slower movement
const moveDistance = 20; // Distance to move in one direction before changing
let distanceMoved = 0; // Track how far the enemy has moved
let enemyDirection = new THREE.Vector3(); // Current movement direction
let changeDirectionTimer = 0; // Timer for changing direction
const enemyMovementRange = 1; // Range of movement in any direction

// Function to update the enemy's position
function updateEnemyMovement() {
    if (changeDirectionTimer <= 0) {
        // Choose a random direction and normalize it
        enemyDirection.set(
            (Math.random() - 0.5) * enemyMovementRange,
            0,
            (Math.random() - 0.5) * enemyMovementRange
        ).normalize();

        changeDirectionTimer = Math.random() * 2 + 1; // Random timer for changing direction (1 to 3 seconds)
    } else {
        // Move the enemy in the current direction
        cubeEnemy.position.add(enemyDirection.clone().multiplyScalar(enemyMovementSpeed));
        distanceMoved += enemyMovementSpeed;

        // Update the position of the light to follow the cube
        enemyLight.position.copy(cubeEnemy.position);

        // Check if the enemy has moved the specified distance
        if (distanceMoved >= moveDistance) {
            distanceMoved = 0; // Reset the distance moved
            changeDirectionTimer = 0; // Reset timer to change direction
        }
    }

    // Optionally: Add bounds to keep the enemy within a certain area
    cubeEnemy.position.x = THREE.MathUtils.clamp(cubeEnemy.position.x, -45, 45); // Adjust bounds as necessary
    cubeEnemy.position.z = THREE.MathUtils.clamp(cubeEnemy.position.z, -45, 45); // Adjust bounds as necessary
}

// Ground
//Texture for ground 
// const textureLoader = new THREE.TextureLoader();
// const texture = textureLoader.load('PavingStones.jpg', (texture) => {
//   texture.wrapS = THREE.RepeatWrapping;
//   texture.wrapT = THREE.RepeatWrapping;
//   texture.repeat.set(10, 10);
// });

const textureLoader = loadTextures('PavingStones');
applyTextureSettings(textureLoader, 10, 10);

//const platformMaterial = new THREE.MeshStandardMaterial({ map: texture }); 
const platformMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.colorMap,
    aoMap: textureLoader.aoMap,
    displacementMap: textureLoader.displacementMap,
    metalnessMap: textureLoader.metalnessMap,
    normalMap: textureLoader.normalMapDX, 
    roughnessMap: textureLoader.roughnessMap,
    displacementScale: 0,
    metalness: 0.1,
    roughness: 0.5
});

const platformGeometry = new THREE.BoxGeometry(100, 1, 100);
const platform = new THREE.Mesh(platformGeometry, platformMaterial);
scene.add(platform);

// Walls
const textureLoaderWall = loadTextures('PavingStones');
applyTextureSettings(textureLoaderWall, 10, 10);

const sideWallGeometry = new THREE.BoxGeometry(1, 100, 100);
const sideWallMaterial  = new THREE.MeshStandardMaterial({
    map: textureLoaderWall.colorMap,
    aoMap: textureLoaderWall.aoMap,
    displacementMap: textureLoaderWall.displacementMap,
    metalnessMap: textureLoaderWall.metalnessMap,
    normalMap: textureLoaderWall.normalMapDX, 
    roughnessMap: textureLoaderWall.roughnessMap,
    displacementScale: 0,
    metalness: 0.1,
    roughness: 0.5
});

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

// Create Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.01); // Soft white light, 0.01 is the intensity
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

            const lampLight = new THREE.PointLight(0xA96CC3, 30, 50); // Purple light - (color, intensity, distance)
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
let rotationSpeed = 0.001; // Sensitivity of mouse movement
let cubeRotationY = 0; // Track rotation around the Y-axis
let verticalLook = 0; // Track vertical rotation

// user changing sensitivity
const sensitivitySlider = document.getElementById('sensitivitySlider');
sensitivitySlider.addEventListener('input', (event) => {
    rotationSpeed = event.target.value / 1000; // Adjust rotation speed based on slider value
});

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

// Define limits for vertical look 
const MAX_LOOK_UP = Math.PI / 4; // 135 degrees up
const MAX_LOOK_DOWN = -Math.PI / 1.6; // to look up

// Mouse movement for rotating the cube and camera
document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1; // Normalize x
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // Normalize y

    let deltaX = event.movementX * rotationSpeed;
    let deltaY = -event.movementY * rotationSpeed; // Invert vertical mouse movement
    cubeRotationY -= deltaX; // Adjust cube's rotation Y value
    verticalLook -= deltaY; // Adjust vertical look

    verticalLook = THREE.MathUtils.clamp(verticalLook, MAX_LOOK_DOWN, MAX_LOOK_UP);
});

// Array to hold bullets
let bullets = [];

document.addEventListener('mousedown', (event) => {
    if (event.button === 0 && !isSettingsMenuOpen && !isGamePaused) { // Only shoot if menu is not open
        const position = camera.position.clone();
        // position.x -= 1.3;
        const bulletSound = new Audio('light_bullet_sound.mp3'); // Load the sound
        bulletSound.volume = 0.5; // Set volume for the sound (adjust as needed)
        bulletSound.play(); // Play the sound
        const bullet = new Bullet(position, 0xffffff); // Create bullet at the cube's position

        // Calculate the bullet direction based on the camera's forward direction
        const direction = new THREE.Vector3(); // Create a new vector for direction
        camera.getWorldDirection(direction); // Get the direction the camera is facing

        direction.normalize(); // Normalize the direction vector

        bullet.velocity.copy(direction); // Set bullet velocity to point in the camera's direction
        bullets.push(bullet); // Add bullet to the array
        scene.add(bullet.mesh); // Add bullet mesh to the scene
        scene.add(bullet.light); // Add bullet light to the scene
        handlePlayerHit(5); // Handle player hit logic
    }
});

// Update camera position to always follow the cube
function updateCamera() {
    loaded = true;
    // Calculate the new camera position based on cube's rotation around the Y-axis
    const offset = new THREE.Vector3(0, 1.5, -2.5); // Adjust this for the right shoulder view (left right, up down, front back)
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

// Make sure monster rotates to face the player
function rotateMonster() {
    if (monsterModel) {
        const direction = cube.position.clone().sub(monsterModel.position).normalize();
        monsterModel.rotation.y = Math.atan2(direction.x, direction.z);
    }
}

// Animation Loop
function animate() {
    updatePlayerHealthBar();
    // Ensure playerModel and cube are loaded before accessing their properties
    if (playerModel && cube) {
        playerModel.position.copy(cube.position);
        playerModel.rotation.copy(cube.rotation);
    }

    // Ensure monsterModel and cubeEnemy are loaded before accessing their properties
    if (monsterModel && cubeEnemy) {
        monsterModel.position.copy(cubeEnemy.position);
        // let temp = cube.rotation*-1; 
        monsterModel.rotation.copy(cubeEnemy.rotation);
        // monsterModel.rotation.copy(temp);
        // monsterModel.lookAt(cube.position);
        switch(currentMonster){
            case monster.tall_monster:
                monsterModel.position.y = cubeEnemy.position.y - 0;
                break;
            case monster.monster_ignan:
                monsterModel.position.y = cubeEnemy.position.y - 2.5;
                break;
            case monster.toon_spike:
                monsterModel.position.y = cubeEnemy.position.y - 4;
                break;
            case monster.anya:
                monsterModel.position.y = cubeEnemy.position.y - 0.5;
                break;
            default:
                monsterModel.position.y = cubeEnemy.position.y + 1.5;
                break;
        }
    }

    playerLight.position.set(cube.position.x, cube.position.y + 1.5, cube.position.z);
    if (isGamePaused) return; // Skip updates if the game is paused
    movePlayer();  // Update player movement
    updateCamera();  // Update camera to follow the player
    if(!isEnemyAsleep && enemyCurrentHealth > 0){
        updateEnemyMovement(); // Update enemy's random movement
        enemyShoot(); // Enemy shooting logic
        document.getElementById('health-bar-container').style.display = 'block';
        rotateMonster();
    }
    

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const isActive = bullets[i].update(scene); // Pass scene to update the bullet

        // Check for collision with the enemy cube
        if (detectCollision(bullets[i], cubeEnemy)) {
            handleEnemyHit(); // Handle enemy hit logic
            scene.remove(bullets[i].mesh); // Remove bullet from the scene
            scene.remove(bullets[i].light); // Remove bullet light from the scene
            bullets.splice(i, 1); // Remove bullet from array
        } else if (!isActive) {
            bullets.splice(i, 1); // Remove bullet if it traveled max distance
        }
    }

    // Update enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const isActive = enemyBullets[i].update(scene); // Pass scene to update the bullet

        // Check for collision with the player cube
        if (detectCollision(enemyBullets[i], cube)) {
            console.log("Player has been hit!");
            handlePlayerHit(30); // Handle player hit logic - take 30 damage
            scene.remove(enemyBullets[i].mesh); // Remove bullet from the scene
            scene.remove(enemyBullets[i].light); // Remove bullet light from the scene
            enemyBullets.splice(i, 1); // Remove bullet from array
        } else if (!isActive) {
            enemyBullets.splice(i, 1); // Remove bullet if it traveled max distance
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
const crosshair = new Crosshair(5, 'white');

// Shooting the enemy
// Enemy health variables

let enemyCurrentHealth = enemyMaxHealth; // Current health starts at max

let enemyHits = 0; // Initialize hit counter
let enemyHitCooldown = false; // Flag to check if enemy is already hit and waiting to reset color

// Function to update the health bar based on current health
function updateEnemyHealthBar() {
    const healthBar = document.getElementById('health-bar');
    const healthPercentage = (enemyCurrentHealth / enemyMaxHealth) * 100; // Calculate percentage
    healthBar.style.width = `${healthPercentage}%`; // Update the width of the health bar
}

let enemyAlive = true; // Flag to track if the enemy is alive
// Function to handle when enemy gets hit
function handleEnemyHit() {
    // const enemyHit = detectCollision(bullet, cubeEnemy); // Check for collision with the enemy
    if(isEnemyAsleep && enemyCurrentHealth > 0){
        const monsterNoise = new Audio('monster_moan.mp3');
        monsterNoise.volume = 0.4;
        monsterNoise.play();
    }
    isEnemyAsleep = false;
    if (!enemyHitCooldown) {
        enemyHits++; // Increment hit counter
        console.log(`Enemy has been hit ${enemyHits} times!`);

        // Reduce enemy health
        enemyCurrentHealth -= 10; // Reduce health by 10 (or any amount you choose)
        updateEnemyHealthBar(); // Update the health bar after taking damage

        if (enemyCurrentHealth <= 0) {
            if(enemyAlive){
                const monsterNoise = new Audio('monster_moan.mp3');
                monsterNoise.volume = 0.4;
                monsterNoise.play();
            }
            enemyAlive = false; // Set enemy alive flag to false
            cubeEnemy.material.color.set(0xffffff); // white 0xffffff
            enemyLight.intensity = 0; // Turn off the light
            isEnemyAsleep = true;

            //wait for 3 second
            setTimeout(() => {
                youWin(); // Call the win condition function
            }, 3000); // milliseconds delay
            
        } 
        else {
            // Change the enemy color to a lighter red temporarily
            cubeEnemy.material.color.set(0xff6666); // Lighter red color
            enemyHitCooldown = true; // Set cooldown flag

            // Reset color after 50ms
            setTimeout(() => {
                cubeEnemy.material.color.set(0x040405);
                enemyHitCooldown = false; // Reset cooldown flag
            }, 50); // milliseconds delay
        }
    }
}

// Handle Player hit
function handlePlayerHit(dmg) {
    
    takeDamage(dmg); // Take 10 damage when hit
}

// Function to detect collision between bullet and enemy
function detectCollision(bullet, character) {
    const bulletBoundingBox = new THREE.Box3().setFromObject(bullet.mesh);
    const enemyBoundingBox = new THREE.Box3().setFromObject(character);

    return bulletBoundingBox.intersectsBox(enemyBoundingBox);
}

// Function to handle win condition
function youWin() {
    document.getElementById('header-end').innerText = "You Win!\nYou have slain the beast aka your MOM!!! *GASP*\nShe turned into a monster because you didn't do the dishes!";
    isEnemyAsleep = true;
    isGamePaused = true; // Pause the game
    console.log("You win!"); // Display win message if health reaches zero
    enemyCurrentHealth = 0; // Prevent negative health
    gameOverScreen.style.display = "block"; // Show game over screen
    document.exitPointerLock(); // Exit mouse lock
    document.getElementById('health-bar-container').style.display = 'none';
    crosshair.hideCrosshair();
    // cubeEnemy.visible = false;
    enemyLight.visible = false;
    //stop ambient sound
    ambientSound.pause();
}

// Function to handle loss condition
function youLose() {
    document.getElementById('header-end').innerText = "You Died!\nYou ran out of light and the darkness consumed you!";
    isEnemyAsleep = true;
    isGamePaused = true; // Pause the game
    console.log("You lose!"); // Display lose message if health reaches zero
    gameOverScreen.style.display = "block"; // Show game over screen
    document.exitPointerLock(); // Exit mouse lock
    crosshair.hideCrosshair();
    document.getElementById('health-bar-container').style.display = 'none';
    // cubeEnemy.visible = false;
    enemyLight.visible = false;
    ambientSound.pause();
}

// Enemy shooting at user
// Variables for enemy shooting
let enemyShootCooldown = false; // Cooldown flag to prevent rapid shooting
let enemyBullets = []; // Array to hold enemy bullets

// Function to handle enemy shooting
function enemyShoot() {
    if (!enemyShootCooldown) {
        const position = cubeEnemy.position.clone();
        const bulletSound = new Audio('dark_bullet_sound.mp3'); // Load the sound
        bulletSound.volume = 0.3; // Set volume for the sound (adjust as needed)
        bulletSound.play(); // Play the sound
        const bullet = new Bullet(position, 0xff0000); // Create bullet at the enemy's position

        // Calculate the bullet direction based on the player's position
        const direction = cube.position.clone().sub(cubeEnemy.position).normalize();
        bullet.velocity.copy(direction); // Set bullet velocity to point at the player
        enemyBullets.push(bullet); // Add bullet to the array
        scene.add(bullet.mesh); // Add bullet mesh to the scene
        scene.add(bullet.light); // Add bullet light to the scene

        let randomTime = Math.random() * 1000 + 500; // Random time between 0.5 to 1.5 seconds
        enemyShootCooldown = true; // Set cooldown flag
        setTimeout(() => {
            enemyShootCooldown = false; // Reset cooldown flag after 1 second
        }, randomTime); // milliseconds delay
    }
}

// Health System
let maxHealth = 100; // Define the maximum health
let health = maxHealth;
let loaded = false;
const damageRate = 1; // Define the damage rate
const healingRate = 5; // Define the healing rate
let points = lampsArray.map(lamp => new THREE.Vector3(lamp.positionX, lamp.positionY, lamp.positionZ)); // Convert lamp positions to Vector3 objects

//Update Player Health
function updatePlayerHealthBar(){
    const healthBar = document.getElementById('user-health-bar');
    const healthPercentage = (health / maxHealth) * 100; // Calculate percentage
    healthBar.style.width = `${healthPercentage}%`; // Update the width of the health bar
}

function takeDamage(amount) {
    health -= amount;
    health = Math.max(0, health); // Ensure health doesn't go below 0
    // updateCharacterLight(); // Update light when health changes
    if (health <= 0 && !isGamePaused) {
        youLose(); // Call the lose condition function
    }
}

function heal(amount) {
    health += amount;
    health = Math.min(100, health); // Cap health at 100
    // updateCharacterLight(); // Update light when health changes
}


const lightTimers = {}; // Track time spent near lights

function startDamageTimer() {
    setInterval(() => {
        if (loaded) {
            let valid = false;

            points.forEach((light, index) => {
                // Check distance to each light
                if (calcEuclid(cube.position.x, cube.position.z, light.x, light.z)) {
                    valid = true;
                    heal(healingRate);  
                }
            });

            if (!valid) {
                takeDamage(damageRate); // Take damage if not within any light
            }
        }
    }, 200); // Call this function every 200ms
}

function flickerLight(light, index) {
    let flickerDuration = 2; // Flicker for 2 seconds
    let flickerInterval = 100; // Flicker every 200ms
    let flickerCount = flickerDuration * 1000 / flickerInterval; // Total flickers
    let originalIntensity = light.intensity;

    let flickerEffect = setInterval(() => {
        light.intensity = light.intensity === 0 ? originalIntensity : 0; // Toggle light intensity
        flickerCount--;

        if (flickerCount <= 0) {
            clearInterval(flickerEffect);
            light.intensity = 0; // Turn off the light
            // Reset the timer for this light
            if (lightTimers[index]) {
                lightTimers[index].time = 0;
                lightTimers[index].flickering = false;
            }

            // Apply damage if the character is still near the light
            if (calcEuclid(cube.position.x, cube.position.z, light.x, light.z)) {
                takeDamage(damageRate); // Take the same damage as usual when the light goes off
            }
        }
    }, flickerInterval);
}

startDamageTimer();

function calcEuclid(x1, z1, x2, z2) {
    const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(z1 - z2, 2));
    return distance <= 3;
}