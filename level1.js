import * as THREE from 'three';

let scene, camera, renderer, cube;
let animationFrameId;
let levelContinue = false;

export function initLevel1() {
    // Initialize the scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create the cube
    let geometry = new THREE.BoxGeometry();
    let material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;
    levelContinue = true;
}

export function disposeLevel(){
    if (!scene) return;

    // Stop the current animation loop
    cancelAnimationFrame(animationFrameId);

    // Remove all objects from the scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // Clean up the renderer
    renderer.dispose();
    try{
        document.body.removeChild(renderer.domElement);
    }catch(e){
        
    }

    levelContinue = false;
}

export function animateLevel1() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);

    // Only continue the animation loop if levelContinue is true
    if (levelContinue) {
        animationFrameId = requestAnimationFrame(animateLevel1);
    }
}

export function level1() {
    // Dispose of the current level if it exists to prevent multiple animations
    disposeLevel();

    // Initialize and start the new level
    initLevel1();
    animateLevel1();
}

window.addEventListener('resize', function() {
    if (!renderer) return;

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
