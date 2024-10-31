import * as THREE from 'three';
import { Level2 } from "../../src/scenes/Level2";
import { AnimationManager } from "../../src/scripts/Animation/AnimationLoopHandler";

let animationManager = new AnimationManager();
let scene, camera, renderer, animationId, cube;

function init(){
    console.log("Initializing the scene...");

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Basic cube object
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Lighting
    const light = new THREE.AmbientLight(0x404040, 2); // Soft white ambient light
    scene.add(light);
}

function animateFunction(){
    animationId = requestAnimationFrame(animateFunction);

    // Update objects (e.g., rotating the cube)
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Render the scene
    renderer.render(scene, camera);
}

function stopAnimate(){
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        console.log("Animation stopped.");
    }
}

function restart(){
    console.log("Restarting scene...");
    if (!animationId) {
        animateFunction(); // Restart the animation
    }
}

function disposeLevel(){
    console.log("Disposing of scene resources...");

    // Dispose geometry and material for each object in the scene
    scene.traverse(object => {
        if (object.isMesh) {
            object.geometry.dispose();
            object.material.dispose();
        }
    });

    // Remove renderer from DOM and dispose of it
    renderer.dispose();
    document.body.removeChild(renderer.domElement);

    // Reset scene and renderer variables
    scene = null;
    camera = null;
    renderer = null;
}

let level2 = new Level2(init, animateFunction, stopAnimate, restart, disposeLevel);
animationManager.switchScene(level2);
