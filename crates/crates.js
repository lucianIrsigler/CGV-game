import * as THREE from 'https://unpkg.com/three@0.153.0/build/three.module.js';

// Create the scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load the texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('WoodColor.jpg', (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.7, 0.7); // Adjust these values to magnify the texture
});

// Create a geometry 
const geometry = new THREE.BoxGeometry(2, 2, 2);

// Create a material using the loaded texture
const material = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0x444444, // Dark gray color to tint the texture
});

// Array to hold crates
const crates = [];

//Add a new crate to the scene at a given position
function addCrate(x, y, z) {
    const crate = new THREE.Mesh(geometry, material);
    crate.position.set(x, y, z); 
    scene.add(crate);              
    crates.push(crate);            
}


addCrate(-1, -1, 0);   
addCrate(3, 0, 0);   
addCrate(-2, 2, 0);  

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate each crate for some basic animation
    // crates.forEach(crate => {
    //     crate.rotation.x += 0.01;
    //     crate.rotation.y += 0.01;
    // });

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);
}

// Start the animation
animate();

// Make the renderer responsive to window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
