import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CurvedPlatform } from './curvedPlatform.js';
import { CPBoxLamp } from './CPBoxLamp.js';
import { CircularPlatform } from './circularPlatform.js';
import { ButtonPlatform } from './buttonPlatform.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { GUN } from './gun.js';
import { MONSTER } from './monster.js';
import { DOOR } from './door.js';

//SCENE AND RENDERER---------------------------------------------------
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//RAYCASTER AND MOUSE SETUP-------------------------------------------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let currentSequence = [];
let buttonPlatforms = [];


//CAMERA AND CONTROLS--------------------------------------------------
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 50);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
//ADUIO SETUP---------------------------------------------------------
const audioLoader = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
//LIGHTING--------------------------------------------------------------
const ambientLight = new THREE.AmbientLight(0x0f0f0f);
ambientLight.intensity = 10;
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 10, 10).normalize();
// scene.add(directionalLight);

// Helper function to calculate the shortest rotation angle
function calculateShortestRotation(current, target) {
    let diff = target - current;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return diff;
}

//CONSTANTS------------------------------------------------------------
const circlePlatformDepth = 1;
const curvedPlatformInnerRadius = 18;
const curvedPlatformOuterRadius = 25;
const circlePlatformInnerRadius = 0;
const circlePlatformOuterRadius = curvedPlatformInnerRadius;
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

//SEQUENCE HANDLING FUNCTIONS-----------------------------------------
function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    for (const intersect of intersects) {
        if (intersect.object.userData.isButton) {
            const buttonPlatform = intersect.object.userData.buttonPlatform;
            if (buttonPlatform.isClickable) {
                handleButtonPress(buttonPlatform);
                break;
            }
        }
    }
}

function handleButtonPress(buttonPlatform) {
    buttonPlatform.press();
    
    // Add the button number to the sequence
    currentSequence.push(buttonPlatform.sequence[0]);
    
    console.log('Current sequence:', currentSequence); // For debugging
    
    // Check for valid sequences
    checkSequences();
}

function checkSequences() {
    // Define the valid sequences and their corresponding actions
    const validSequences = {
        '1,2,1': () => {
            console.log('Triggering vertical animation');
            audioLoader.load('./concrete-sliding.mp3', function(buffer) {
                sound.setBuffer(buffer);
                sound.setLoop(false);
                sound.setVolume(0.5);
                sound.play();
            });
            resetAndStartVerticalAnimation();
        },
        '3,2,3': () => {
            console.log('Triggering rotation animation');
            audioLoader.load('./concrete-sliding.mp3', function(buffer) {
                sound.setBuffer(buffer);
                sound.setLoop(false);
                sound.setVolume(0.5);
                sound.play();
            });
            resetAndStartRotationAnimation();
        },
        '4,3,4': () => {
            console.log('Triggering upper platform animation');
            audioLoader.load('./concrete-sliding.mp3', function(buffer) {
                sound.setBuffer(buffer);
                sound.setLoop(false);
                sound.setVolume(0.5);
                sound.play();
            });
            resetAndStartUpperAnimation();
        }
    };

    // Convert current sequence to string for comparison
    const sequenceString = currentSequence.join(',');
    
    // Check if current sequence matches any valid sequence
    if (validSequences[sequenceString]) {
        // Execute the corresponding animation
        validSequences[sequenceString]();
        // Reset the sequence
        currentSequence = [];
    } 
    // If sequence is longer than 3 or cannot be a valid sequence, reset it
    else if (currentSequence.length >= 3 || !Object.keys(validSequences).some(seq => seq.startsWith(sequenceString))) {
        currentSequence = [];

        audioLoader.load('./failed-sequence.mp3', function(buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(false);
            sound.setVolume(0.5);
            sound.play();
        });
    }
}

function resetAndStartVerticalAnimation() {
    verticalAnimationClock.stop();
    verticalAnimationClock = new THREE.Clock();
    animatePlatforms = true;
    verticalAnimationClock.start();
}
// Load the built-in Helvetiker font
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry1 = new TextGeometry('    Sequences:\n        4, 3, 4\n        3, 2, 3\n     > 1, 2, 1 <', {
        font: font,
        size: 0.2,
        depth: 0.01,
        curveSegments: 12,
        bevelEnabled: false,
    });
    const textGeometry2 = new TextGeometry('    Sequences:\n        4, 3, 4\n     > 3, 2, 3 <\n        1, 2, 1', {
        font: font,
        size: 0.2,
        depth: 0.01,
        curveSegments: 12,
        bevelEnabled: false,
    });
    const textGeometry3 = new TextGeometry('    Sequences:\n      > 4, 3, 4 <\n         3, 2, 3\n         1, 2, 1', {
        font: font,
        size: 0.2,
        depth: 0.01,
        curveSegments: 12,
        bevelEnabled: false,
    });
    
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const textMesh = new THREE.Mesh(textGeometry1, textMaterial);
    textMesh.position.set(-1, 2, 20); // Position near the inside of the wall
    textMesh.rotation.y = 0; // Rotate to face inward
    scene.add(textMesh);

    const textMesh2 = new THREE.Mesh(textGeometry2, textMaterial);
    textMesh2.position.set(-1, 26, 20); // Position near the inside of the wall
    scene.add(textMesh2);

    const textMesh3 = new THREE.Mesh(textGeometry3, textMaterial);
    textMesh3.position.set(1, 38, -20); // Position near the inside of the wall
    textMesh3.rotation.y = Math.PI; // Rotate to face inward
    scene.add(textMesh3);
    
    
});
function resetAndStartRotationAnimation() {
    rotationAnimationClock.stop();
    rotationAnimationClock = new THREE.Clock();
    rotatingPlatformsActive = true;
    reverseRotation = false;
    rotationAnimationClock.start();
}

function resetAndStartUpperAnimation() {
    upperPlatformsClock.stop();
    upperPlatformsClock = new THREE.Clock();
    animateUpperPlatforms = true;
    upperPlatformsDescending = true;
    upperPlatformsClock.start();
}

//CURVED PLATFORMS----------------------------------------------------
for (let i = 0; i <= numberOfPlatforms; i++) {
    let platform;
    
    if ((i === 0) || (i === 4) || (i === 8) || (i === 12)) {
        // Create button platforms with proper sequences
        if (i === 0) {
            platform = new ButtonPlatform(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth, [1], "1");
        } else if (i === 4) {
            platform = new ButtonPlatform(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth, [2], "2");
        } else if (i === 8) {
            platform = new ButtonPlatform(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth, [3], "3");
        } else if (i === 12) {
            platform = new ButtonPlatform(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth, [4], "4");
        }
        buttonPlatforms.push(platform);
    } 
    else if(i % 4 === 0) {
        platform = new CPBoxLamp(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth);
        //console.log(platform.getWorldPosition.x, platform.getWorldPosition.y, platform.getWorldPosition.z);
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
        const finalRotation = i * rotation;
        
        platform.rotation.y = platformTwelveRotation;
        platform.userData.originalRotation = platformTwelveRotation;
        platform.userData.targetRotation = finalRotation;
        platform.userData.rotationDiff = calculateShortestRotation(platformTwelveRotation, finalRotation);
        platform.userData.index = i - 9;
        platform.userData.rotationSpeed = 1 + (11 - i) * 0.2;
        rotatingPlatforms.push(platform);
    }
    // Handle platforms 13-15 (upper moving platforms)
    else if (i >= 13 && i <= 15) {
        platform.position.y = 16 * curvedPlatformHeight;
        upperMovingPlatforms.push({ 
            platform, 
            startY: 16 * curvedPlatformHeight,
            targetY: i * curvedPlatformHeight 
        });
    }
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

const door1 = new DOOR(0, 0, roomInnerRadius)
scene.add(door1);
const door2 = new DOOR(0, 48, roomInnerRadius)
scene.add(door2);
const monster = new MONSTER(0, 5, 0)
// scene.add(monster);

const gun = new GUN(0, 49, roomInnerRadius-2)
scene.add(gun);
// Add glow effect to the gun
const gunGlow = new THREE.PointLight(0x0000ff, 1, 100);
gunGlow.position.set(0, 49, roomInnerRadius - 2);
scene.add(gunGlow);

//ANIMATION STATE----------------------------------------------------
let verticalAnimationClock = new THREE.Clock();
let rotationAnimationClock = new THREE.Clock();
let upperPlatformsClock = new THREE.Clock();
let animatePlatforms = false;
let rotatingPlatformsActive = false;
let reverseRotation = false;
let animateUpperPlatforms = false;
let upperPlatformsDescending = false;

// Reverse rotation animation on load
reverseRotation = true;
rotatingPlatformsActive = true;
rotationAnimationClock.start();

//WINDOW RESIZE HANDLER----------------------------------------------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

//CLICK EVENT HANDLER-----------------------------------------------
window.addEventListener('click', onClick);

//ANIMATION FUNCTION------------------------------------------------
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Original vertical movement animation
    if (animatePlatforms) {
        let verticalTime = verticalAnimationClock.getElapsedTime();
        movingPlatforms.forEach(({ platform, targetY }) => {
            const duration = 2;
            const progress = Math.min(verticalTime / duration, 1);
            platform.position.y = progress * targetY;
            
            if (progress >= 1) {
                animatePlatforms = false;
            }
        });
    }
    
    // Rotation animation
    if (rotatingPlatformsActive) {
        let rotationTime = rotationAnimationClock.getElapsedTime();
        const duration = reverseRotation ? 4 : 2;
        const progress = Math.min(rotationTime / duration, 1);
        
        rotatingPlatforms.forEach(platform => {
            const startRotation = platform.userData.originalRotation;
            
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
                    platform.rotation.y = platform.userData.targetRotation;
                });
            } else {
                rotatingPlatforms.forEach(platform => {
                    platform.rotation.y = platform.userData.originalRotation;
                });
            }
        }
    }
    
    // Upper platforms animation
    if (animateUpperPlatforms) {
        let upperTime = upperPlatformsClock.getElapsedTime();
        const duration = 2;
        const progress = Math.min(upperTime / duration, 1);
        
        upperMovingPlatforms.forEach(({ platform, startY, targetY }) => {
            if (upperPlatformsDescending) {
                platform.position.y = startY + (targetY - startY) * progress;
            } else {
                platform.position.y = targetY + (startY - targetY) * progress;
            }
        });
        
        if (progress >= 1) {
            animateUpperPlatforms = false;
        }
    }
    
    renderer.render(scene, camera);
}

//START ANIMATION----------------------------------------------------
animate();