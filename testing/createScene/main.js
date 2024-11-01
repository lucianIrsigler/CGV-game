import * as THREE from 'three';
import { Level2 } from "../../src/scenes/Level2";
import { AnimationManager } from "../../src/scripts/Animation/AnimationLoopHandler";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CurvedPlatform } from '../../Level2/NewLevel2/curvedPlatform.js';
import { CPBoxLamp } from '../../Level2/NewLevel2/CPBoxLamp.js';
import { CircularPlatform } from '../../Level2/NewLevel2/circularPlatform.js';

let animationManager = new AnimationManager();
let scene, camera, renderer, animationId, cube;

function init(){
    console.log("Initializing the scene...");

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 50);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    // Basic cube object
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0f0f0f);
    ambientLight.intensity = 10;
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 10).normalize();
    scene.add(directionalLight);

    const circlePlatformInnerRadius = 0;
    const circlePlatformOuterRadius = 18;
    const circlePlatformDepth = 1;
    const curvedPlatformInnerRadius = 18;
    const curvedPlatformOuterRadius = 25;
    const curvedPlatformDepth = 1;
    const curvedPlatformHeight = 3;
    const numberOfPlatforms = 16;
    const rotation = Math.PI / 4;
    // const roomRadius = 30;
    const roomRadius = curvedPlatformOuterRadius;
    const floorDepth = 1;
    const ceilingDepth = 1;
    const roomHeight = floorDepth + numberOfPlatforms * curvedPlatformHeight + ceilingDepth + 2 * curvedPlatformHeight;

    const movingPlatforms = []; // Array to store moving platforms

    //CURVED PLATFORMS
    for (let i = 0; i <= numberOfPlatforms; i++) {
        //Add box and lamp platform where every 4th platform would be
        if (i % 4 === 0) {
            const cpBoxLamp = new CPBoxLamp(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth);
            if (i > 0 && i < 8) {
                cpBoxLamp.position.y = 0; // Set initial position to the same height as the first platform
                movingPlatforms.push({ platform: cpBoxLamp, targetY: i * curvedPlatformHeight }); // Add to moving platforms array with target height
            }
            else
            {
                cpBoxLamp.position.y = i * curvedPlatformHeight;
            }
            cpBoxLamp.rotation.y = i * rotation;
            scene.add(cpBoxLamp);
        } else {
            const curvedPlatform = new CurvedPlatform(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth);
            if (i > 0 && i < 8) {
                curvedPlatform.position.y = 0; // Set initial position to the same height as the first platform
                movingPlatforms.push({ platform: curvedPlatform, targetY: i * curvedPlatformHeight }); // Add to moving platforms array with target height
            } else {
                curvedPlatform.position.y = i * curvedPlatformHeight;
            }
            curvedPlatform.rotation.y = i * rotation;
            scene.add(curvedPlatform);
        }
}
const circularPlatform = new CircularPlatform(circlePlatformInnerRadius, circlePlatformOuterRadius, circlePlatformDepth);
scene.add(circularPlatform);
//ROOM FLOOR
const floor = new CircularPlatform(0, roomRadius, floorDepth);
floor.position.y = -1;
scene.add(floor);
//ROOM CEILING
const ceiling = new CircularPlatform(0, roomRadius, ceilingDepth);
ceiling.position.y = roomHeight;
scene.add(ceiling);
//ROOM WALL
const wall = new CircularPlatform(curvedPlatformOuterRadius + curvedPlatformOuterRadius-curvedPlatformInnerRadius, roomRadius, roomHeight);
wall.position.y = roomHeight - 1;
//scene.add(wall);

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
