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


document.getElementById('health-bar-container').style.display = 'none';

//ambient sound



// Renderer Setup

// Cube (Player)



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




// Mouse control to rotate cube and camera
let rotationSpeed = 0.001; // Sensitivity of mouse movement

// user changing sensitivity
const sensitivitySlider = document.getElementById('sensitivitySlider');
sensitivitySlider.addEventListener('input', (event) => {
    rotationSpeed = event.target.value / 1000; // Adjust rotation speed based on slider value
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
