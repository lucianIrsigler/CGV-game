import * as THREE from 'three';
import { World, Body, Plane, Box, Vec3 } from 'cannon-es';
import { CameraManager } from '../src/scripts/Scene/CameraManager';
import { ObjectManager } from '../src/scripts/Scene/ObjectManager';
import { LightManager } from '../src/scripts/Scene/LightManager';
import { LoadingManagerCustom } from '../src/scripts/Loaders/Loader';


// --------------------------SCENE INIT-------------------------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --------------------------CANNON.JS WORLD-------------------------------
const world = new World();
world.gravity.set(0, -9.82, 0); // Set gravity

// --------------------------MANAGERS-------------------------------
const objManager = new ObjectManager(scene, world);
const lightManager = new LightManager(scene);
const loader = new LoadingManagerCustom();

// --------------------------GEOMETRIES-------------------------------
objManager.addGeometry("groundBody", new THREE.BoxGeometry(20, 0.5, 20));
objManager.addGeometry("wallBody", new THREE.BoxGeometry(1, 4, 10));

// --------------------------MATERIALS-------------------------------
objManager.addMaterial("wallBody", new THREE.MeshStandardMaterial({ color: 0xff0000 }));
objManager.addMaterial("groundBody", new THREE.MeshBasicMaterial({ color: 0xffff00 }));

// --------------------------CREATE OBJECTS-------------------------------
const groundMesh = objManager.createVisualObject("ground", "groundBody", "groundBody", { x: 0, y: 0, z: 0 });
const groundBody = objManager.createPhysicsObject("ground", "groundBody", { x: 0, y: 0, z: 0 }, null, 0);
objManager.linkObject("ground", groundMesh, groundBody);


const wallMesh = objManager.createVisualObject("wall", "wallBody", "wallBody", { x: 5, y: 1, z: 0 });
const wallBody = objManager.createPhysicsObject("wall", "wallBody", { x: 5, y: 1, z: 0 }, null, 0);
objManager.linkObject("wall", wallMesh, wallBody);

// --------------------------LOAD PLAYER MODEL-------------------------------
const gltf = await loader.loadModel('cute_alien_character/scene.gltf', 'player');
const model = gltf.scene; // Get the loaded model
scene.add(model); // Add the model to the scene
model.rotation.set(0, 0, 0); // Rotate the model
model.scale.set(1, 1, 1); // Scale the model if necessary
model.position.set(0, 0.5, 0);

// --------------------------CANNON.JS FOR PLAYER MODEL-------------------------------
let playerBody = new Body({
    mass: 1, // Dynamic body
    position: new Vec3(0, 0.5, 0), // Start position
});

const boxShape = new Box(new Vec3(0.5, 1, 0.5)); // Box shape for the player
playerBody.addShape(boxShape);
world.addBody(playerBody);

// --------------------------INIT CAMERA MANAGER-------------------------------
const cameraManager = new CameraManager(camera, model, playerBody, scene);


// --------------------------ADD LIGHTING-------------------------------
lightManager.addLight("ambient", new THREE.AmbientLight(0xFFFFFF, 10));



// --------------------------ADD EVENT LISTENERS------------------------------
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

// --------------------------MAIN GAMEPLAY LOOP------------------------------
function animate() {
  requestAnimationFrame(animate);
  const deltaTime = 1 / 60;
  world.step(deltaTime);
  objManager.update(); // Update linked objects' positions based on physics
  cameraManager.update(deltaTime);
  renderer.render(scene, cameraManager.getCamera());
}

// --------------------------START GAMEPLAY LOOP------------------------------
animate();
