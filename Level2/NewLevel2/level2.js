import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CurvedPlatform } from './curvedPlatform.js';
import { CPBoxLamp } from './CPBoxLamp.js';
import { CircularPlatform } from './circularPlatform.js';
import { LoadingManagerCustom } from "../../src/scripts/Loaders/Loader";
import { Door } from '../../src/scripts/Objects/Door';
import { door } from '../../src/data/doorPos1';
import { OscillatingMist } from './Fog.js';

import { ButtonPlatform } from './buttonPlatform.js';
//SCENE AND RENDERER---------------------------------------------------
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Simulate key press 4 on load
window.addEventListener('load', () => {
    const keyEvent = new KeyboardEvent('keydown', { key: '4' });
    window.dispatchEvent(keyEvent);
});
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

// Helper function to calculate the shortest rotation angle
function calculateShortestRotation(current, target) {
    let diff = target - current;
    // Normalize the difference to be between -π and π
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return diff;
}

//CONSTANTS------------------------------------------------------------
const circlePlatformInnerRadius = 0;
const circlePlatformOuterRadius = 18;
const circlePlatformDepth = 1;
const curvedPlatformInnerRadius = 18;
const curvedPlatformOuterRadius = 25;
const curvedPlatformDepth = 1;
const curvedPlatformHeight = 3;
const numberOfPlatforms = 16;
const rotation = Math.PI / 4;
const roomInnerRadius = curvedPlatformOuterRadius;
const roomOuterRadius = curvedPlatformOuterRadius + 1;
const floorDepth = 1;
const ceilingDepth = 1;
const roomHeight = floorDepth + numberOfPlatforms * curvedPlatformHeight + ceilingDepth + 2 * curvedPlatformHeight;

//PLATFORM ARRAYS-----------------------------------------------------
const movingPlatforms = []; // Array for platforms 1-7
const rotatingPlatforms = []; // Array for platforms 9-11
const upperMovingPlatforms = []; // Array for platforms 13-15

// Function to handle button clicks
function handleButtonClick(key) {
    const keyEvent = new KeyboardEvent('keydown', { key });
    window.dispatchEvent(keyEvent);
}

//CURVED PLATFORMS
for (let i = 0; i <= numberOfPlatforms; i++) {
    let platform;
    
    if (i % 4 === 0 && i < 13) {
        platform = new ButtonPlatform(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth);
        // Add event listener for button clicks
        if (i === 0) {
            platform.isClicked = () => handleButtonClick('1');
        } else if (i === 8) {
            platform.isClicked = () => handleButtonClick('3');
        } else if (i === 12) {
            platform.isClicked = () => handleButtonClick('5');
        }
    } 
    else if(i % 4 === 0){
        platform = new CPBoxLamp(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth);
    }
    
    else {
        platform = new CurvedPlatform(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth);
    }
    
    // Handle platforms 1-7
    if (i > 0 && i < 8) {
        platform.position.y = 0;
        movingPlatforms.push({ platform, targetY: i * curvedPlatformHeight });
    }
    // Handle platforms 9-11 (rotating platforms)
    else if (i >= 9 && i <= 11) {
        platform.position.y = i * curvedPlatformHeight;
        const platformTwelveRotation = 12 * rotation;
        const finalRotation = i * rotation;  // Their eventual positions after pressing 3
        
        // Immediately set the platform to start under platform 12
        platform.rotation.y = platformTwelveRotation;
        
        platform.userData.originalRotation = platformTwelveRotation;  // Start under platform 12
        platform.userData.targetRotation = finalRotation;  // Their respective positions (9,10,11)
        platform.userData.rotationDiff = calculateShortestRotation(platformTwelveRotation, finalRotation);
        platform.userData.index = i - 9;
        platform.userData.rotationSpeed = 1 + (11 - i) * 0.2;
        rotatingPlatforms.push(platform);
    }
       
    // Handle platforms 13-15 (upper moving platforms)
    else if (i >= 13 && i <= 15) {
        platform.position.y = 16 * curvedPlatformHeight; // Start at platform 16's height
        upperMovingPlatforms.push({ 
            platform, 
            startY: 16 * curvedPlatformHeight,
            targetY: i * curvedPlatformHeight 
        });
    }
    // Handle all other platforms
    else {
        platform.position.y = i * curvedPlatformHeight;
    }
    
    platform.rotation.y = i * rotation;
    scene.add(platform);
}

//ROOM SETUP----------------------------------------------------------
const circularPlatform = new CircularPlatform(circlePlatformInnerRadius, circlePlatformOuterRadius, circlePlatformDepth);
scene.add(circularPlatform);

const floor = new CircularPlatform(0, roomOuterRadius, floorDepth);
floor.position.y = -1;
scene.add(floor);

const ceiling = new CircularPlatform(0, roomOuterRadius, ceilingDepth);
ceiling.position.y = roomHeight;
scene.add(ceiling);

const wall = new CircularPlatform(roomInnerRadius, roomOuterRadius, roomHeight);
wall.position.y = roomHeight - 1;
scene.add(wall);

//ANIMATION STATE----------------------------------------------------
// let clock = new THREE.Clock();
let verticalAnimationClock = new THREE.Clock();
let rotationAnimationClock = new THREE.Clock();
let upperPlatformsClock = new THREE.Clock();
let animatePlatforms = false;
let rotatingPlatformsActive = false;
let reverseRotation = false;
let animateUpperPlatforms = false;
let upperPlatformsDescending = false;

//WINDOW RESIZE HANDLER----------------------------------------------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
//----------------------------------------------------------------------

//ANIMATION FUNCTION------------------------------------------------
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    let time = clock.getElapsedTime();
    movingPlatforms.forEach(({ platform, targetY }) => {
        if (animatePlatforms) {
            const duration = 2;
            const progress = Math.min(verticalTime / duration, 1);
            platform.position.y = progress * targetY;
        } else {
            const duration = 2;
            const progress = Math.min(verticalTime / duration, 1);
            platform.position.y = (1 - progress) * targetY;
        }
    });
    
    // Rotation animation
    let rotationTime = rotationAnimationClock.getElapsedTime();
    if (rotatingPlatformsActive) {
        const duration = reverseRotation ? 4 : 2;
        const progress = Math.min(rotationTime / duration, 1);
        
        rotatingPlatforms.forEach(platform => {
            // const index = platform.userData.index;
            const startRotation = platform.userData.originalRotation;  // Starting under platform 12
            // const targetRotation = platform.userData.targetRotation;   // Their respective positions
            
            if (!reverseRotation) {
                const easedProgress = Math.pow(progress, 0.8);
                const scaledProgress = easedProgress * platform.userData.rotationSpeed;
                const clampedProgress = Math.min(scaledProgress, 1);
                platform.rotation.y = startRotation + (platform.userData.rotationDiff * clampedProgress);
            } else {
                const currentRotation = platform.rotation.y;
                const easedProgress = Math.pow(progress, 1.2);
                const scaledProgress = easedProgress * (platform.userData.rotationSpeed * 0.7);
                const clampedProgress = Math.min(scaledProgress, 1);
                const reverseRotationAmount = startRotation - currentRotation;
                platform.rotation.y = currentRotation + (reverseRotationAmount * clampedProgress);
            }
        });
        
        if (progress >= 1) {
            rotatingPlatformsActive = false;
            if (!reverseRotation) {
                rotatingPlatforms.forEach(platform => {
                    platform.rotation.y = platform.userData.targetRotation;  // Final position at their respective spots
                });
            } else {
                rotatingPlatforms.forEach(platform => {
                    platform.rotation.y = platform.userData.originalRotation;  // Back under platform 12
                });
            }
        }
    }
    
    // Upper platforms animation (13-15)
    let upperTime = upperPlatformsClock.getElapsedTime();
    if (animateUpperPlatforms) {
        const duration = 2;
        const progress = Math.min(upperTime / duration, 1);
        
        upperMovingPlatforms.forEach(({ platform, startY, targetY }) => {
            if (upperPlatformsDescending) {
                // Descending animation (key 5)
                platform.position.y = startY + (targetY - startY) * progress;
            } else {
                // Rising animation (key 6)
                platform.position.y = targetY + (startY - targetY) * progress;
            }
        });
        
        if (progress >= 1) {
            animateUpperPlatforms = false;
        }
    }
    
    renderer.render(scene, camera);
}

//KEYBOARD EVENT HANDLERS--------------------------------------------
window.addEventListener('keydown', (event) => {
    switch(event.key) {
        case '1':
            animatePlatforms = true;
            verticalAnimationClock.start();
            break;
        case '2':
            animatePlatforms = false;
            verticalAnimationClock.start();
            break;
        case '3':
            rotatingPlatformsActive = true;
            reverseRotation = false;
            rotationAnimationClock.start();
            break;
        case '4':
            rotatingPlatformsActive = true;
            reverseRotation = true;
            rotationAnimationClock.start();
            break;
        case '5':
            animateUpperPlatforms = true;
            upperPlatformsDescending = true;
            upperPlatformsClock.start();
            break;
        case '6':
            animateUpperPlatforms = true;
            upperPlatformsDescending = false;
            upperPlatformsClock.start();
            break;
    }
});

//START ANIMATION----------------------------------------------------
animate();