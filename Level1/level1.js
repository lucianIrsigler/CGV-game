import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { door } from './doorPos1.js';
import { lamps } from './lampPos1.js'; // Import the lamps object from lampPos.js
import { lights } from 'three/webgpu';
const loader = new GLTFLoader();
let model;
let characterLight; 

// Scene setup
const gameOverScreen = document.getElementById("gameOverScreen");
const restartButton = document.getElementById("restartButton");
let points = [];
const spheres = []; // To keep track of created spheres

//jump variables
let jumpCount = 0; 
const gravity = -0.01; // Adjusted gravity value
let isJumping = false; // Track if the character is jumping
let velocityY = 0; // Vertical velocity for jumping

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Mini-map setup
const miniMapCamera = new THREE.OrthographicCamera(
    window.innerWidth / -2, window.innerWidth / 2,
    window.innerHeight / 2, window.innerHeight / -2,
    0.1, 1000
);
miniMapCamera.position.set(0, 100, 0); // Position the mini-map camera above the scene
miniMapCamera.lookAt(0,0,15); // Look at the center of the scene

// Set the zoom factor
miniMapCamera.zoom = 12.5; // Increase this value to zoom in
miniMapCamera.updateProjectionMatrix(); // Update the projection matrix after changing the zoom

const miniMapRenderer = new THREE.WebGLRenderer({ alpha: true });
miniMapRenderer.setSize(200, 200); // Set the size of the mini-map
miniMapRenderer.domElement.style.position = 'absolute';
miniMapRenderer.domElement.style.top = '10px';
miniMapRenderer.domElement.style.right = '10px';
document.body.appendChild(miniMapRenderer.domElement);


// First Person Controls
const controls = new FirstPersonControls(camera, renderer.domElement);
//controls.movementSpeed = 2; // Lower movement speed
controls.lookSpeed = 0.01; // Lower look speed

//TExtures
//Texture for ground 
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('PavingStones.jpg', (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 5);
});
//Texture for walls
const textureLoaderWall = new THREE.TextureLoader();
const textureWall = textureLoaderWall.load('PavingStones.jpg', (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
});
// Texture for platforms 
const textureLoaderPlatforms = new THREE.TextureLoader();
const texturePlatform = textureLoaderPlatforms.load('PavingStones.jpg', (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 2);
});
const sideWallGeometry = new THREE.BoxGeometry(50, 1, 20);
const sideWallMaterial = new THREE.MeshStandardMaterial({ map: textureWall }); 
const platformGeometry = new THREE.BoxGeometry(10, 1, 50);
const platformMaterial = new THREE.MeshStandardMaterial({ map: texture }); 
const characterGeometry = new THREE.BoxGeometry(1, 1, 1);
const characterMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xff0000, 
    transparent: true, 
    opacity: 0.0
});
const platformsMaterial = new THREE.MeshStandardMaterial({ map: texturePlatform });


// Convert lamps object to an array
const lampsArray = Object.values(lamps);

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

            const lampLight = new THREE.PointLight(0xA96CC3, 0.5, 2); // Purple light 
            lampLight.position.set(lamp.positionX, lamp.positionY + 2, lamp.positionZ); 
            scene.add(lampLight);
        }, undefined, function (error) {
            console.error('An error happened while loading the lamp model:', error);
        });
    });
}

// Load lamps into the scene
loadLamps();



// Door variables
let Door;
let doorMixer;
let doorAnimationAction;
const currentDoor = door.doorOne;

// Load the door model

loader.load(currentDoor.scene, function (gltf) {
    Door = gltf.scene;
    scene.add(Door);

    Door.position.set(currentDoor.positionX, currentDoor.positionY, currentDoor.positionZ);
    Door.scale.set(currentDoor.scaleX, currentDoor.scaleY, currentDoor.scaleZ);
    Door.castShadow = true;

    doorMixer = new THREE.AnimationMixer(Door);

    const animations = gltf.animations;
    if (animations && animations.length > 0) {
        doorAnimationAction = doorMixer.clipAction(animations[0]);
    }
}, undefined, function (error) {
    console.error('An error happened', error);
});

// Declare a flag variable to track the door state
let isDoorOpen = false;

// Function to open the door
const doorPrompt = document.getElementById('doorPrompt');
const doorOpenDistance = 2; // Distance at which the prompt appears

function checkDoorProximity() {
    const distance = character.position.distanceTo(Door.position);
    
    if (distance <= doorOpenDistance) {
        doorPrompt.style.display = 'block'; // Show prompt
    } else {
        doorPrompt.style.display = 'none'; // Hide prompt
    }
}

function openDoor() {
    if (!isDoorOpen && doorAnimationAction) {
        doorAnimationAction.reset();
        doorAnimationAction.play();
        isDoorOpen = true; // Set the flag to true so it won't open again
        // Transition to success screen
        gameOverScreen.style.display = 'block'; // Assuming this is your success screen
        gameOverScreen.innerHTML = "<h1>Success!</h1><p>You opened the door!</p>"; // Update success message
    }
}


//LIGHTS
const spotLight = new THREE.SpotLight(0xfcf4dc,10, 6, Math.PI / 6, 0.5, 2);//colour: orange
spotLight.userData.originalIntensity = spotLight.intensity; // Store original intensity
spotLight.position.set(0, 4, 0);
const targetObject = new THREE.Object3D();
targetObject.position.set(0, 0, 0); // Position it below the spotlight
scene.add(targetObject);
spotLight.target = targetObject;
scene.add(spotLight);
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
//scene.add(spotLightHelper);
points.push(spotLight);

// First light
//musky white hexa code: 0x800080
const spotLight1 = new THREE.SpotLight(0x800080, 5, 4, Math.PI / 6, 0.5, 2);//colour: red
spotLight1.userData.originalIntensity = spotLight1.intensity; // Store original intensity
spotLight1.position.set(-4, 3, 5);
// Create a target for the spotlight
const targetObject1 = new THREE.Object3D();
targetObject1.position.set(-4, 0, 5); // Position it below the spotlight
scene.add(targetObject1);
// Set the spotlight's target
spotLight1.target = targetObject1;
scene.add(spotLight1);
const spotLightHelper1 = new THREE.SpotLightHelper(spotLight1);
//scene.add(spotLightHelper1);
points.push(spotLight1);
//orange hexa: 0xffa500
// Second light
const spotLight2 = new THREE.SpotLight(0x800080, 5, 4, Math.PI / 6, 0.5, 2);
spotLight2.userData.originalIntensity = spotLight2.intensity; // Store original intensity
spotLight2.position.set(4, 3, 10);
// Create a target for the spotlight
const targetObject2 = new THREE.Object3D();
targetObject2.position.set(4, 0, 10); // Position it below the spotlight
scene.add(targetObject2);
// Set the spotlight's target
spotLight2.target = targetObject2;
scene.add(spotLight2);
const spotLightHelper2 = new THREE.SpotLightHelper(spotLight2);
//scene.add(spotLightHelper2);
points.push(spotLight2);

// Third light
const pointLight3 = new THREE.PointLight(0xffffff, 1, 4);
pointLight3.position.set(0, 6, -9);
scene.add(pointLight3);
const pointLightHelper3 = new THREE.PointLightHelper(pointLight3, 0.5);
scene.add(pointLightHelper3);
points.push(pointLight3);

// fourth light
const spotLight4 = new THREE.SpotLight(0x800080, 5, 4, Math.PI / 6, 0.5, 2);
spotLight4.userData.originalIntensity = spotLight4.intensity; // Store original intensity
spotLight4.position.set(4, 3, 25);
// Create a target for the spotlight
const targetObject4 = new THREE.Object3D();
targetObject4.position.set(4, 0, 25); // Position it below the spotlight
scene.add(targetObject4);
// Set the spotlight's target
spotLight4.target = targetObject4;
scene.add(spotLight4);
const spotLightHelper4 = new THREE.SpotLightHelper(spotLight4);
//scene.add(spotLightHelper4);
points.push(spotLight4);

// five light
const spotLight5 = new THREE.SpotLight(0x800080, 5, 4, Math.PI / 6, 0.5, 2);
spotLight5.userData.originalIntensity = spotLight5.intensity; // Store original intensity
spotLight5.position.set(3, 5, 15);
// Create a target for the spotlight
const targetObject5 = new THREE.Object3D();
targetObject5.position.set(3, 2, 15); // Position it below the spotlight
scene.add(targetObject5);
// Set the spotlight's target
spotLight5.target = targetObject5;
scene.add(spotLight5);
const spotLightHelper5 = new THREE.SpotLightHelper(spotLight5);
//scene.add(spotLightHelper5);
points.push(spotLight5);

//add dark ambient light
const ambientLight = new THREE.AmbientLight(0x101010, 0.75); // Soft white light
scene.add(ambientLight);

// six light
const spotLight6 = new THREE.SpotLight(0x800080, 5, 4, Math.PI / 6, 0.5, 2);
spotLight6.userData.originalIntensity = spotLight6.intensity; // Store original intensity
spotLight6.position.set(-3, 7, 20);
// Create a target for the spotlight
const targetObject6 = new THREE.Object3D();
targetObject6.position.set(-3, 3, 20); // Position it below the spotlight
scene.add(targetObject6);
// Set the spotlight's target
spotLight6.target = targetObject6;
scene.add(spotLight6);
const spotLightHelper6 = new THREE.SpotLightHelper(spotLight6);
//scene.add(spotLightHelper6);
points.push(spotLight6);

// seven light 0xffa500
//green hexa code: 0x800080
const spotLight7 = new THREE.SpotLight(0x800080, 5, 4, Math.PI / 6, 0.5, 2);
spotLight7.userData.originalIntensity = spotLight7.intensity; // Store original intensity
spotLight7.position.set(3, 5, 30);
// Create a target for the spotlight
const targetObject7 = new THREE.Object3D();
targetObject7.position.set(3, 2, 30); // Position it below the spotlight
scene.add(targetObject7);
// Set the spotlight's target
spotLight7.target = targetObject7;
scene.add(spotLight7);
const spotLightHelper7 = new THREE.SpotLightHelper(spotLight7);
//scene.add(spotLightHelper7);
points.push(spotLight7);

// eight light 0x800080
const spotLight8 = new THREE.SpotLight(0x008000, 5, 4, Math.PI / 6, 0.5, 2);
spotLight8.userData.originalIntensity = spotLight8.intensity; // Store original intensity
spotLight8.position.set(-3, 7, 35);
// Create a target for the spotlight
const targetObject8 = new THREE.Object3D();
targetObject8.position.set(-3, 4, 35); // Position it below the spotlight
scene.add(targetObject8);
// Set the spotlight's target
spotLight8.target = targetObject8;
scene.add(spotLight8);
const spotLightHelper8 = new THREE.SpotLightHelper(spotLight8);
//scene.add(spotLightHelper8);
points.push(spotLight8);

// Walls
const bottom = new THREE.Mesh(platformGeometry, platformMaterial);
bottom.position.y = -0.5;
bottom.position.z = 20;
scene.add(bottom);

const topThingy = new THREE.Mesh(platformGeometry, platformMaterial);
topThingy.position.y = 10;
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

const end = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
end.position.set(0, 2, 40);
end.rotation.x = Math.PI / 2;
scene.add(end);

scene.background = new THREE.Color(0x333333);

//Platforms 
const platformsGeometry = new THREE.BoxGeometry(5, 0.5, 5);
// const platformsMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color for platforms


const platforms = [
    { position: new THREE.Vector3(3, 2, 15), size: new THREE.Vector3(5, 0.5, 5) },
    { position: new THREE.Vector3(-3, 4, 20), size: new THREE.Vector3(5, 0.5, 5) },
    { position: new THREE.Vector3(3, 2, 30), size: new THREE.Vector3(3, 0.3, 3) },
    { position: new THREE.Vector3(-3, 4, 35), size: new THREE.Vector3(3, 0.3, 10) }
  ];

platforms.forEach(platform => {
  const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(platform.size.x, platform.size.y, platform.size.z),
      platformsMaterial
  );
  mesh.position.copy(platform.position);
  scene.add(mesh);
});

//character
// Create a simple character (a cube)
const character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.y = 0.5;
scene.add(character);

//charcter light 
function setupCharacterLight() {
    characterLight = new THREE.PointLight(0xffffff, 1, 5);
    characterLight.position.set(0, 1, 0); // Slightly above the character
    character.add(characterLight); // Attach the light to the character
}
setupCharacterLight();

// Position camera initially at the same place as the character
camera.position.set(character.position.x, character.position.y + 0.5, character.position.z);
character.rotation.y += Math.PI;

// Variables to track movement and rotation
let moveSpeed = 0.1;
let rotateSpeed = 0.1;
let loaded = false;

// Movement state
const movement = { forward: 0, right: 0 };

let health = 100;
const healthNumberElement = document.getElementById('health-number');
const damageRate = 20; // Define the damage rate
const healingRate = 10; // Define the healing rate

//inputs
// Event listeners for movement
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            movement.forward = 1;
            break; // Move forward
        case 's':
            movement.forward = -1; break; // Move backward
        case 'a':
            movement.right = -1; break; // Move left
        case 'd':
            movement.right = 1; break; // Move right
        case 'KeyQ': 
            createFallingSphere(); break;
        case 'KeyE': // Use "E" key to open the door
            openDoor(); 
            break;
        case ' ':
            if (jumpCount < 2) { //Jumping twice
                isJumping = true;
                velocityY = 0.15;
                jumpCount++; 
            }
            break;
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

    // Reload textures
    textures.forEach(texture => {
        texture.needsUpdate = true; // Mark texture for update
    });  

         // Use the toggleLightIntensity function to turn on all lights at intensity 5
         points.forEach(light => toggleLightIntensity(light));
         lampLights.forEach(lampLight => {
            lampLight.intensity = 0.5; // Reset to original intensity
        });
         updateCharacterLight();
}

function toggleLightIntensity(light) {
    light.intensity = 5;
}

function updateCharacterLight() {
    if (characterLight) {
        // Calculate light intensity and distance based on health
        const maxIntensity = 1;
        const maxDistance = 5;
        const minIntensity = 0.2;
        const minDistance = 1;

        const healthPercentage = health / 100;
        
        characterLight.intensity = minIntensity + (maxIntensity - minIntensity) * healthPercentage;
        characterLight.distance = minDistance + (maxDistance - minDistance) * healthPercentage;
    }
}

function takeDamage(amount) {
    health -= amount;
    health = Math.max(0, health); // Ensure health doesn't go below 0
    healthNumberElement.textContent = health;
    updateCharacterLight(); // Update light when health changes
    if (health <= 0) {
        handleCharacterDeath();
    }
}

function heal(amount) {
    health += amount;
    health = Math.min(100, health); // Cap health at 100
    healthNumberElement.textContent = health;
    updateCharacterLight(); // Update light when health changes
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

//minimap stuff
let lastMiniMapRenderTime = 0; // To track the last time the mini-map was rendered
const miniMapRenderInterval = 100; // 100ms interval for mini-map rendering
// Create a red cube
const redCubeGeometry = new THREE.BoxGeometry(3, 1, 3);
const redCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const redCube = new THREE.Mesh(redCubeGeometry, redCubeMaterial);

// Set the red cube's initial position to match topThingy
redCube.position.set(topThingy.position.x, topThingy.position.y+2, topThingy.position.z);

// Add the red cube to the scene
scene.add(redCube);
function updateRedCubePosition() {
    redCube.position.x = character.position.x;
    redCube.position.z = character.position.z;
  }
  // Green block above topThingy at x = -3 and z = 35
const greenBlockGeometry = new THREE.BoxGeometry(3, 1, 3);
const greenBlockMaterial = new THREE.MeshBasicMaterial({ color: 0x008000 });
const greenBlock = new THREE.Mesh(greenBlockGeometry, greenBlockMaterial);
greenBlock.position.set(-3, topThingy.position.y + 2, 39);
scene.add(greenBlock);



function animate() {
    requestAnimationFrame(animate);
    // Update the door animation mixer if it exists
    if (doorMixer) {
        doorMixer.update(0.01); // Update the animation mixer
    }

    // Jumping and gravity application
    if (isJumping) {
        character.position.y += velocityY;
        velocityY += gravity;
    }
// Check proximity to the door
checkDoorProximity();

 // Update the red cube's position
 updateRedCubePosition();

// Handle the 'E' key press to open the door
document.addEventListener('keydown', (e) => {
    if (e.key === 'e') {
        if (doorPrompt.style.display === 'block') {
            openDoor(); 
        }
    }
});

    // Check for collisions with platforms
    let onPlatform = false;
    platforms.forEach(platform => {
        if (
            character.position.x >= platform.position.x - platform.size.x / 2 &&
            character.position.x <= platform.position.x + platform.size.x / 2 &&
            character.position.z >= platform.position.z - platform.size.z / 2 &&
            character.position.z <= platform.position.z + platform.size.z / 2
        ) {
            if (
                character.position.y + 0.5 >= platform.position.y &&
                character.position.y <= platform.position.y + platform.size.y
            ) {
                character.position.y = platform.position.y + platform.size.y;
                velocityY = 0;
                isJumping = false;
                jumpCount = 0; // Reset jump count when landing on a platform
                onPlatform = true;
            }
        }
    });

    // Apply gravity if not on a platform
    if (!onPlatform && !isJumping) {
        character.position.y += velocityY;
        velocityY += gravity;
    }

    // Prevent falling through the ground
    if (character.position.y < 0.5) {
        character.position.y = 0.5;
        isJumping = false;
        velocityY = 0;
    }

    const forward = movement.forward;
    const right = movement.right;
// Reset jump count when hitting the ground
if (onPlatform || character.position.y === 0.5) {
    jumpCount = 0; // Reset jump count only when on a platform
}
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
    // Only update the mini-map at the defined interval
    const currentTime = Date.now();
    if (currentTime - lastMiniMapRenderTime >= miniMapRenderInterval) {
        miniMapRenderer.render(scene, miniMapCamera);
        lastMiniMapRenderTime = currentTime; // Update the time of last render
    }
}
startDamageTimer();
animate();
// Resize the renderer with the window size
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});