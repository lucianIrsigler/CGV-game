import * as THREE from 'three';
import { Bullet } from './bullet.js'; // Import the Bullet class
import Crosshair from './crosshair.js';
import { monster } from './monster.js';


document.getElementById('health-bar-container').style.display = 'none';



// Mouse control to rotate cube and camera
let rotationSpeed = 0.001; // Sensitivity of mouse movement

// user changing sensitivity
const sensitivitySlider = document.getElementById('sensitivitySlider');
sensitivitySlider.addEventListener('input', (event) => {
    rotationSpeed = event.target.value / 1000; // Adjust rotation speed based on slider value
});


// Array to hold bullets

// Animation Loop
function animate() {

    renderer.render(scene, camera);  // Render the scene
}



//--------------SETTINGS-------------------------------------
// Pointer Lock Functionality
let isSettingsMenuOpen = false; // Flag to track if settings menu is open

function lockPointer() {
    if (!isSettingsMenuOpen) { // Only lock pointer if settings menu is not open
        renderer.domElement.requestPointerLock();
    }
}



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

//------------------------CROSSHAIRS-------------------------------------

// Create Crosshair
const crosshair = new Crosshair(5, 'white');


// Handle Player hit
function handlePlayerHit(dmg) {
    takeDamage(dmg); // Take 10 damage when hit
}
