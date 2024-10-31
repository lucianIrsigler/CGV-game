import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CurvedPlatform } from './curvedPlatform.js';
import { CPBoxLamp } from './CPBoxLamp.js';
import { CircularPlatform } from './circularPlatform.js';
import { LoadingManagerCustom } from "../../src/scripts/Loaders/Loader";
import { Door } from '../../src/scripts/Objects/Door';
import { door } from '../../src/data/doorPos1';
import { OscillatingMist } from './Fog.js';

//SCENE AND RENDERER---------------------------------------------------
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//----------------------------------------------------------------------

//CAMERA AND CONTROLS--------------------------------------------------
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 50);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
//----------------------------------------------------------------------

//LIGHTING--------------------------------------------------------------
// const ambientLight = new THREE.AmbientLight(0x0f0f0f);
// ambientLight.intensity = 2;
// scene.add(ambientLight);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(0, 10, 10).normalize();
// scene.add(directionalLight);

//Other lighting 
// Create ambient light with a lower intensity and darker color for subtle background illumination
const ambientLight = new THREE.AmbientLight(0x0a0a0a); // Darker ambient color
ambientLight.intensity = 0.5; // Reduced intensity to match the spooky setting
scene.add(ambientLight);

// Create a directional light with a cool, dim tone to simulate moonlight or an eerie glow
const directionalLight = new THREE.DirectionalLight(0x666666, 0.3); // Softer, dimmer tone
directionalLight.position.set(-5, 10, 5).normalize(); // Off-center for angled shadows
directionalLight.castShadow = true; // Enables shadows for added depth
scene.add(directionalLight);

// Optionally, add a fog effect light source if more shadow definition is desired
const fogLight = new THREE.PointLight(0x333333, 0.2); // Dark grey point light in fog
fogLight.position.set(0, 5, 0); // Position near the center of the scene
scene.add(fogLight);

//----------------------------------------------------------------------

//ADDING OBJECTS TO SCENE-------------------------------------------
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
// const doorOne = door.doorOne;
// door.init_door_(scene, doorOne);
// const doorTwo = door.doorTwo;
// door.init_door_(scene, doorTwo);
//MOSTERS PLATFORM
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
scene.add(wall);
//----------------------------------------------------------------------

//HANDLE WINDOW RESIZE-------------------------------------------------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
//----------------------------------------------------------------------

const oscillatingMist = new OscillatingMist(scene, roomRadius, roomHeight);
oscillatingMist.setFogColor(0xFF4B4B4B); 

//ANIMATE--------------------------------------------------------------
let clock = new THREE.Clock();

let animatePlatforms = false;

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    let time = clock.getElapsedTime();
    // Animate mist
    oscillatingMist.animate(time);
    movingPlatforms.forEach(({ platform, targetY }) => {
        if (animatePlatforms) {
            const duration = 2; // Duration of the animation in seconds
            const progress = Math.min(time / duration, 1); // Progress of the animation (0 to 1)

            platform.position.y = progress * targetY; // Move from initial height to target height

            if (progress >= 1) {
                platform.position.y = targetY; // Ensure the platform stays at the target height
            }
        } else {
            const duration = 2; // Duration of the animation in seconds
            const progress = Math.min(time / duration, 1); // Progress of the animation (0 to 1)

            platform.position.y = (1 - progress) * targetY; // Move from target height to initial height

            if (progress >= 1) {
                platform.position.y = 0; // Ensure the platform stays at the initial height
            }
        }
    });

    renderer.render(scene, camera);
}

window.addEventListener('keydown', (event) => {
    if (event.key === '2') {
        animatePlatforms = false;
        clock.start(); // Restart the clock to reset the animation timing
    } else if (event.key === '1') {
        animatePlatforms = true;
        clock.start(); // Restart the clock to reset the animation timing
    }
});
animate();
//----------------------------------------------------------------------
