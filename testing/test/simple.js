import * as THREE from 'three';
import { World, Body, Vec3, Box } from 'cannon-es';

// Setup your Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a Cannon.js world
const world = new World();
world.gravity.set(0, -9.82, 0); // Set gravity

// Create player and ground
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(playerMesh);

// Create a Cannon.js body for the player
const playerBody = new Body({
  mass: 1,
  position: new Vec3(0, 1, 0), // Start above the ground
});
playerBody.addShape(new Box(new Vec3(0.5, 0.5, 0.5))); // Add the shape for collision
world.addBody(playerBody);

// Create ground
const groundGeometry = new THREE.BoxGeometry(10, 1, 10);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.position.y = -0.5; // Position the ground mesh below the player
scene.add(groundMesh);

// Create a Cannon.js body for the ground

// Set camera position
camera.position.z = 5;
camera.position.y = 2;

// Keyboard input for movement
const keyboard = {};
document.addEventListener('keydown', (event) => {
  keyboard[event.key] = true;
});
document.addEventListener('keyup', (event) => {
  keyboard[event.key] = false;
});

// Jumping variables
let canJump = true;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60); // Step the physics world

  // Movement controls
  const speed = 0.1; // Movement speed
  if (keyboard['ArrowLeft']) {
    playerBody.position.x -= speed; // Move left
  }
  if (keyboard['ArrowRight']) {
    playerBody.position.x += speed; // Move right
  }

  if (keyboard['ArrowUp']) {
    playerBody.position.z += speed; // Move right
  }
  if (keyboard['ArrowDown']) {
    playerBody.position.z -= speed; // Move right
  } 

  // Handle jumping
  if (keyboard[' ']) { // Space bar for jump
    if (canJump) {
      playerBody.velocity.y = 10; // Apply upward force for jumping
      canJump = false; // Prevent multiple jumps until landing
    }
  }
  // Check if player is on the ground to allow jumping again
  if (playerBody.position.y <= 1) {
    canJump = true; // Reset jumping ability
  }

  // Update Three.js mesh position from Cannon.js body
  playerMesh.position.copy(playerBody.position);
  playerMesh.quaternion.copy(playerBody.quaternion);

  // Update ground mesh position (optional, as it’s static)
  groundMesh.position.copy(groundBody.position);
  groundMesh.quaternion.copy(groundBody.quaternion);

  // Update platform mesh position (optional, as it’s static)
  platformMesh.position.copy(platformBody.position);
  platformMesh.quaternion.copy(platformBody.quaternion);

  renderer.render(scene, camera);
}

animate();
