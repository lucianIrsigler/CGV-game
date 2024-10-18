import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js';

export function createLamp(scene) {
  const loader = new THREE.GLTFLoader(); // Make sure to include GLTFLoader
  loader.load('path/to/your/lampModel.glb', (gltf) => {
    const lamp = gltf.scene;
    lamp.position.set(0, 2, 0); // Set position as needed
    scene.add(lamp);
  }, undefined, function (error) {
    console.error('An error occurred loading the lamp:', error);
  });
}
