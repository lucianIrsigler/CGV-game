import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
const loader = new GLTFLoader();
let model;

// Scene setup
const gameOverScreen = document.getElementById("gameOverScreen");
const restartButton = document.getElementById("restartButton");
let points = [];
const spheres = []; // To keep track of created spheres
const gravity = -0.1; // Gravity value

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// First Person Controls
const controls = new FirstPersonControls(camera, renderer.domElement);
//controls.movementSpeed = 2; // Lower movement speed
controls.lookSpeed = 0.01; // Lower look speed

//Texture for ground 
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('../PavingStones.jpg', (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 5);
});
//Texture for walls
const textureLoaderWall = new THREE.TextureLoader();
const textureWall = textureLoader.load('../PavingStones.jpg', (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
});
const sideWallGeometry = new THREE.BoxGeometry(50, 1, 10);
const sideWallMaterial = new THREE.MeshStandardMaterial({ map: textureWall }); 
const platformGeometry = new THREE.BoxGeometry(10, 1, 50);
const platformMaterial = new THREE.MeshStandardMaterial({ map: texture }); 
const characterGeometry = new THREE.BoxGeometry(1, 1, 1);
const characterMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xff0000, 
    transparent: true, 
    opacity: 0.0
});

// Ground Plane
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
ground.position.y = 0; // Position it at y = 0
//scene.add(ground);

const spotLight = new THREE.SpotLight(0x0000ff,5, 50, Math.PI / 6, 0.5, 2);
spotLight.userData.originalIntensity = spotLight.intensity; // Store original intensity
spotLight.position.set(0, 4, 0);
const targetObject = new THREE.Object3D();
targetObject.position.set(0, 0, 1); // Position it below the spotlight
scene.add(targetObject);
spotLight.target = targetObject;
scene.add(spotLight);
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);
points.push(spotLight);

// First light
const spotLight1 = new THREE.SpotLight(0xff0000, 5, 50, Math.PI / 6, 0.5, 2);
spotLight1.userData.originalIntensity = spotLight1.intensity; // Store original intensity
spotLight1.position.set(-3.5, 4, 9);
// Create a target for the spotlight
const targetObject1 = new THREE.Object3D();
targetObject1.position.set(-3.5, 0, 9); // Position it below the spotlight
scene.add(targetObject1);
// Set the spotlight's target
spotLight1.target = targetObject1;
scene.add(spotLight1);
const spotLightHelper1 = new THREE.SpotLightHelper(spotLight1);
scene.add(spotLightHelper1);
points.push(spotLight1);

// Second light
const spotLight2 = new THREE.SpotLight(0x0000ff, 5, 50, Math.PI / 6, 0.5, 2);
spotLight2.userData.originalIntensity = spotLight2.intensity; // Store original intensity
spotLight2.position.set(3.5, 4, 9);
// Create a target for the spotlight
const targetObject2 = new THREE.Object3D();
targetObject2.position.set(3.5, 0, 9); // Position it below the spotlight
scene.add(targetObject2);
// Set the spotlight's target
spotLight2.target = targetObject2;
scene.add(spotLight2);
const spotLightHelper2 = new THREE.SpotLightHelper(spotLight2);
scene.add(spotLightHelper2);
points.push(spotLight2);

// Third light
const pointLight3 = new THREE.PointLight(0xffffff, 1, 20);
pointLight3.position.set(0, 4, -9);
scene.add(pointLight3);
const pointLightHelper3 = new THREE.PointLightHelper(pointLight3, 0.5);
scene.add(pointLightHelper3);
points.push(pointLight3);

//add ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Walls
const bottom = new THREE.Mesh(platformGeometry, platformMaterial);
bottom.position.y = -0.5;
bottom.position.z = 20;
scene.add(bottom);

const topThingy = new THREE.Mesh(platformGeometry, platformMaterial);
topThingy.position.y = 5;
topThingy.position.z = 20;
scene.add(topThingy);

const backWall = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
backWall.position.y = 2;
backWall.position.z = -5;
backWall.rotation.x = Math.PI / 2;
scene.add(backWall);

const left = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
left.position.y = 0.8;
left.position.x = -5;
left.position.z = 15;
left.rotation.x = Math.PI / 2;
left.rotation.z = Math.PI / 2;
scene.add(left);

const right = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
right.position.y = 0.8;
right.position.x = 5;
right.position.z = 15;
right.rotation.x = Math.PI / 2;
right.rotation.z = Math.PI / 2;
scene.add(right);

scene.background = new THREE.Color(0x333333);

// Create a simple character (a cube)
const character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.y = 0.5;
scene.add(character);

// Position camera initially at the same place as the character
camera.position.set(character.position.x, character.position.y + 0.5, character.position.z);
character.rotation.y += Math.PI;

// Variables to track movement and rotation
let moveSpeed = 0.1;
let rotateSpeed = 0.05;
let loaded = false;

// Movement state
const movement = { forward: 0, right: 0 };

let health = 100;
const healthNumberElement = document.getElementById('health-number');
const damageRate = 20; // Define the damage rate
const healingRate = 10; // Define the healing rate

// Event listeners for movement
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            movement.forward = 1; break; // Move forward
        case 's':
            movement.forward = -1; break; // Move backward
        case 'a':
            movement.right = -1; break; // Move left
        case 'd':
            movement.right = 1; break; // Move right
        case "KeyQ": 
            createFallingSphere(); break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
        case 's':
            movement.forward = 0; break;
        case 'a':
        case 'd':
            movement.right = 0; break;
    }
});



function handleCharacterDeath() {
    gameOverScreen.style.display = "block";
}

function restartGame() {
    gameOverScreen.style.display = "none";

    // Reset character position and camera
    character.position.set(0, 0.5, 0);
    camera.position.set(character.position.x, character.position.y + 0.5, character.position.z);
    character.rotation.y = Math.PI;

    // Reset health
    health = 100;
    healthNumberElement.textContent = health; // Reset health number in the HTML

    

    // Reset all lights to their original intensity
    // points.forEach(light => {
    //     light.intensity = light.userData.originalIntensity; // Set back to original intensity
    // });

    // Reload textures
    textures.forEach(texture => {
        texture.needsUpdate = true; // Mark texture for update
    });

    // Reinitialize lights if necessary
    lights.forEach(light => {
        scene.add(light); // Ensure light is added to the scene
    });

    // Optional: Reset any other states or objects here as needed
}


restartButton.addEventListener("click", restartGame);

function calcEuclid(x1, z1, x2, z2) {
    const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(z1 - z2, 2));
    return distance <= 2;
}

function updateCameraPosition() {
    camera.position.set(character.position.x, character.position.y + 0.5, character.position.z);
    camera.rotation.y = character.rotation.y;
    loaded = true;
}

function takeDamage(amount) {
    health -= amount;
    healthNumberElement.textContent = health; // Update the health number in the HTML
    if (health <= 0) {
        handleCharacterDeath();
    }
}

function heal(amount) {
    health += amount;
    if (health > 100) health = 100; // Cap health at 100
    healthNumberElement.textContent = health; // Update the health number in the HTML
}

const lightTimers = {}; // Track time spent near lights

function startDamageTimer() {
    setInterval(() => {
        if (loaded) {
            let valid = false;

            points.forEach((light, index) => {
                // Check distance to each light
                if (calcEuclid(character.position.x, character.position.z, light.position.x, light.position.z)) {
                    valid = true;

                    // Initialize or increment the timer for this light
                    if (!lightTimers[index]) {
                        lightTimers[index] = { time: 0, flickering: false };
                    }
                    lightTimers[index].time += 1; // Increment time spent in light

                    // Heal if the light is on
                    if (light.intensity > 0) {
                        heal(healingRate);
                    }

                    // Check if time exceeds 3 seconds
                    if (lightTimers[index].time >= 3 && !lightTimers[index].flickering) {
                        lightTimers[index].flickering = true;
                        flickerLight(light, index); // Pass index for reset after flickering
                    }
                } else {
                    // Reset the timer if not in light
                    if (lightTimers[index]) {
                        lightTimers[index].time = 0;
                        lightTimers[index].flickering = false;
                    }
                }
            });

            if (!valid) {
                takeDamage(damageRate); // Take damage if not within any light
            }
        }
    }, 1000); // Call this function every second
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
            if (calcEuclid(character.position.x, character.position.z, light.position.x, light.position.z)) {
                takeDamage(damageRate); // Take the same damage as usual when the light goes off
            }
        }
    }, flickerInterval);
}




function animate() {
    requestAnimationFrame(animate);

    // if (loaded) {
    //     let valid = false;
    //     points.forEach((light) => {
    //         if (calcEuclid(character.position.x, character.position.z, light.position.x, light.position.z)) {
    //             valid = true;
    //         }
    //     });

    //     if (!valid) {
    //         takeDamage(1); // Take damage if not within 3 units of any light source
    //     }
    // }

    // Update character position based on WASD movement
    const forward = movement.forward;
    const right = movement.right;

    // Calculate the forward and right direction based on the camera's rotation
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // Ignore vertical direction
    cameraDirection.normalize();

    const rightDirection = new THREE.Vector3();
    rightDirection.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)); // Get the right direction

    if (forward) {
        character.position.add(cameraDirection.multiplyScalar(moveSpeed * forward));
    }
    if (right) {
        character.position.add(rightDirection.multiplyScalar(moveSpeed * right));
    }

    updateCameraPosition();
   controls.update(0.7); // Update controls with delta time
    // Render the scene
    renderer.render(scene, camera);
}
startDamageTimer();
animate();

// Resize the renderer with the window size
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});