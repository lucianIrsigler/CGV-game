// //import * as THREE from 'three';
// import { Bullet } from './bullet.js'; // Import the Bullet class
// import Crosshair from './crosshair.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { lamps } from './lampPos3.js'; // Import the lamps object from lampPos.js
// import { cubeMapNode } from 'three/src/nodes/utils/CubeMapNode.js';
// import { update } from 'three/examples/jsm/libs/tween.module.js';
// import { max } from 'three/webgpu';
// import { loadTextures, applyTextureSettings } from './TextureLoaderUtil.js';
// import { monster } from './monster.js';
// import { player } from './player.js';
// import { LoadingManager } from 'three';


// function restartGame() {
//     isEnemyAsleep = true;
//     isGamePaused = false; // Unpause the game
//     enemyAlive = true; // Reset enemy alive flag
//     gameOverScreen.style.display = "none";

//     // Reset character and enemy positions
//     cube.position.set(0, 1.5, 0); // Reset player position
//     switch(currentMonster){
//         case monster.tall_monster:
//             cubeEnemy.position.set(10, 2, 5); // Reset enemy position
//             break;
//         case monster.monster_ignan:
//             cubeEnemy.position.set(10, 3, 5); // Reset enemy position
//             break;
//         case monster.toon_spike:
//             cubeEnemy.position.set(10, 4.5, 5); // Reset enemy position
//             break;
//         case monster.anya:
//             cubeEnemy.position.set(10, 1, 5); // Reset enemy position
//             break;
//         default:
//             cubeEnemy.position.set(10, 3, 5); // Reset enemy position
//             break;
//     }
//     cubeEnemy.material.color.set(0x040405); // Reset enemy color to original'
//     enemyLight.position.copy(cubeEnemy.position); // Reset light position to enemy position

//     // Reset health
//     enemyCurrentHealth = enemyMaxHealth; // Reset current health to max
//     enemyHits = 0; // Reset hit counter
//     document.getElementById('health-bar-container').style.display = 'none';
//     updateEnemyHealthBar(); // Update health bar to full width
//     updatePlayerHealthBar(); // Update player health bar

//     // Reset health
//     health = maxHealth; // Reset current health to max
//     enemyCurrentHealth = enemyMaxHealth;

//     // make enemy visible again
//     // cubeEnemy.visible = true;
//     enemyLight.visible = true;
//     enemyLight.intensity = 1; // Reset light intensity

//     // crosshair
//     crosshair.showCrosshair();

//     ambientSound.play(); // Restart ambient sound
// }


// // Pointer Lock Functionality
// let isSettingsMenuOpen = false; // Flag to track if settings menu is open

// function lockPointer() {
//     if (!isSettingsMenuOpen) { // Only lock pointer if settings menu is not open
//         renderer.domElement.requestPointerLock();
//     }
// }

// document.addEventListener('click', () => {
//     lockPointer(); // Attempt to lock pointer on click
// });

// // Function to open settings modal
// function openSettings() {
//     settingsModal.style.display = 'block';
//     document.exitPointerLock(); // Exit pointer lock when opening settings
//     isSettingsMenuOpen = true; // Set flag to indicate settings menu is open
// }

// // Function to close settings modal
// function closeSettings() {
//     settingsModal.style.display = 'none';
//     lockPointer(); // Re-enable pointer lock when closing settings
//     isSettingsMenuOpen = false; // Reset flag when settings menu is closed
// }

// // Function to toggle settings modal when ESC is pressed
// window.addEventListener('keydown', (event) => {
//     if (event.key === "Escape") {
//         if (settingsModal.style.display === 'none' || settingsModal.style.display === '') {
//             openSettings();
//         } else {
//             closeSettings();
//         }
//     }
// });
