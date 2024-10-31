import * as THREE from 'three';
import { World, Body, Box, Vec3 } from 'cannon-es';
import  CannonDebugger  from 'cannon-es-debugger';

// Create the Three.js scene and camera as before
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the Cannon.js world
const world = new World();
world.gravity.set(0, -9.82, 0); // Set gravity

// Create a Cannon.js body
const boxBody = new Body({
    mass: 1,
    position: new Vec3(0, 5, 0),
});
const boxShape = new Box(new Vec3(1, 1, 1)); // Half extents
boxBody.addShape(boxShape);
world.addBody(boxBody);

// Create a Three.js mesh
const geometry = new THREE.BoxGeometry(2, 2, 2); // Full extents
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const boxMesh = new THREE.Mesh(geometry, material);
scene.add(boxMesh);

// Set up the Cannon debugger
const debugRenderer = new CannonDebugger(scene, world);

// Set camera position
camera.position.z = 10;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Step the physics world
    world.step(1 / 60);

    // Sync position and rotation
    boxMesh.position.copy(boxBody.position);
    boxMesh.quaternion.copy(boxBody.quaternion);

    // Render the scene
    renderer.render(scene, camera);

    // Update the debugger
    debugRenderer.update();
}

// Start the animation loop
animate();
