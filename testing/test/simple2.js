import * as THREE from 'three';
import { World, Body, Plane, Box, Vec3 } from 'cannon-es';
import { CameraManager } from '../src/scripts/Scene/CameraManager';
import { ObjectManager } from '../src/scripts/Scene/ObjectManager';
import { LightManager } from '../src/scripts/Scene/LightManager';

// Initialize the Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize the Cannon.js world
const world = new World();
world.gravity.set(0, -9.82, 0); // Set gravity

const objManager = new ObjectManager(scene, world);
const lightManager = new LightManager(scene);

// Add geometries and materials
objManager.addGeometry("groundBody", new THREE.BoxGeometry(20, 0.5, 20));
objManager.addMaterial("groundBody", new THREE.MeshBasicMaterial({ color: 0xffff00 }));
objManager.addGeometry("wallBody", new THREE.BoxGeometry(1, 4, 10));
objManager.addMaterial("wallBody", new THREE.MeshStandardMaterial({ color: 0xff0000 }));
objManager.addGeometry("player", new THREE.BoxGeometry(1, 2, 1));

const frontMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Front face in red
const otherMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Other faces in green
const materials = [
  otherMaterial, // Right
  otherMaterial, // Left
  otherMaterial, // Top
  otherMaterial, // Bottom
  frontMaterial, // Front
  otherMaterial  // Back
];
objManager.addMaterial("player", materials);





// Create ground
const groundMesh = objManager.createVisualObject("ground", "groundBody", "groundBody", { x: 0, y: 0, z: 0 });
const groundBody = objManager.createPhysicsObject("ground", "groundBody", { x: 0, y: 0, z: 0 }, null, 0);
objManager.linkObject("ground", groundMesh, groundBody);

// Create wall
const wallMesh = objManager.createVisualObject("wall", "wallBody", "wallBody", { x: 5, y: 1, z: 0 });
const wallBody = objManager.createPhysicsObject("wall", "wallBody", { x: 5, y: 1, z: 0 }, null, 0);
objManager.linkObject("wall", wallMesh, wallBody);

// Create player
const playerMesh = objManager.createVisualObject("player", "player", "player", { x: 0, y: 10, z: 0 });
const playerBody = objManager.createPhysicsObject("player", "player", { x: 0, y: 10, z: 0 }, null, 1);
objManager.linkObject("player", playerMesh, playerBody);

// Initialize light
lightManager.addLight("ambient", new THREE.AmbientLight(0xFFFFFF, 10));

// Initialize camera manager, targeting the player
const cameraManager = new CameraManager(camera, playerMesh, playerBody, scene);

// Keydown event to toggle camera view
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyR") {
    const isFirstPerson = cameraManager.getFirstPerson();
    if (isFirstPerson) {
      cameraManager.toggleThirdPerson();
    } else {
      cameraManager.toggleFirstPerson();
    }
  }
});

// Main update loop
function animate() {
  requestAnimationFrame(animate);
  const deltaTime = 1 / 60;
  world.step(deltaTime);
  objManager.update(); // Update linked objects' positions based on physics
  cameraManager.update(deltaTime);
  renderer.render(scene, cameraManager.getCamera());
}

// Start the animation loop
animate();
