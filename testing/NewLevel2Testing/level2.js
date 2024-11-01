import * as THREE from 'three';
import * as CANNON from "cannon-es"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CurvedPlatform } from './curvedPlatform.js';
import { CPBoxLamp } from './CPBoxLamp.js';
import { CircularPlatform } from './circularPlatform.js';
import {CameraManager} from "../../src/scripts/Scene/CameraManager.js"
import CannonDebugger from 'cannon-es-debugger';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

//SCENE AND RENDERER---------------------------------------------------
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//----------------------------------------------------------------------



const world = new CANNON.World();
world.gravity.set(0,-9,8,0);


let cannonDebugger = new CannonDebugger(scene,world);


//CAMERA AND CONTROLS--------------------------------------------------
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 50);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
//----------------------------------------------------------------------


let playerModel;
let playerBody;
let cameraManager;
let playerloaded = false;




//LIGHTING--------------------------------------------------------------
const ambientLight = new THREE.AmbientLight(0x0f0f0f);
ambientLight.intensity = 10;
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 10, 10).normalize();
scene.add(directionalLight);
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
    // Add box and lamp platform where every 4th platform would be
    if (i % 4 === 0) {
        const cpBoxLamp = new CPBoxLamp(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth);
        
        // Set initial height based on the platform index
        if (i > 0 && i < 8) {
            cpBoxLamp.position.y = 0; // Set initial position to the same height as the first platform
        } else {
            cpBoxLamp.position.y = i * curvedPlatformHeight;
        }
        
        // Apply rotation
        cpBoxLamp.rotation.y = i * rotation;

        scene.add(cpBoxLamp);

    } else {
        const curvedPlatform = new CurvedPlatform(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth);

        // Set initial height based on the platform index
        if (i > 0 && i < 8) {
            curvedPlatform.position.y = 0; // Set initial position to the same height as the first platform
        } else {
            curvedPlatform.position.y = i * curvedPlatformHeight;
        }

        // Apply rotation
        curvedPlatform.rotation.y = i * rotation;

        // Synchronize Cannon.js body with Three.js mesh
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
world.addBody(circularPlatform.body);
//ROOM FLOOR
const floor = new CircularPlatform(0, roomRadius, floorDepth);
floor.position.y = -1;
scene.add(floor);
world.addBody(floor.body);
//ROOM CEILING
const ceiling = new CircularPlatform(0, roomRadius, ceilingDepth);
ceiling.position.y = roomHeight;
scene.add(ceiling);
world.addBody(ceiling.body);
//ROOM WALL
const wall = new CircularPlatform(curvedPlatformOuterRadius + curvedPlatformOuterRadius-curvedPlatformInnerRadius, roomRadius, roomHeight);
wall.position.y = roomHeight - 1;
scene.add(wall);
world.addBody(wall.body);

//----------------------------------------------------------------------

//HANDLE WINDOW RESIZE-------------------------------------------------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
//----------------------------------------------------------------------



//----------------LOAD PLAYER-----------------------------------------
//---------------------PLAYER MODEL--------------------------------------
const gltfLoader = new GLTFLoader();

gltfLoader.load('cute_alien_character/scene.gltf', (gltf) => {
    const model = gltf.scene; // Loaded model
    model.scale.set(1, 1, 1);
    model.position.set(0, 10, 0);
    model.name = "player";
    
    // Add the model to the scene
    scene.add(model);
    playerModel=model;

    // Create and set up the Cannon.js body for the player model
    const playerBody1 = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 10, 0), // Start position
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 1.5, 0.5)), // Box shape for the player
    });

    world.addBody(playerBody1);

    playerBody = playerBody1;

    cameraManager = new CameraManager(camera,model,playerBody,scene)

    playerloaded=true;

})

//-----------------------DOCUMENT EVENT LISTENERS----------------------
document.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "KeyR":
        if (cameraManager==undefined){
          return;
        }
        if (cameraManager.getFirstPerson()){
          cameraManager.toggleThirdPerson()
        }else{
            cameraManager.toggleFirstPerson()
        }
        break;
    }
  })




//ANIMATE--------------------------------------------------------------
let clock = new THREE.Clock();

let animatePlatforms = false;
let prevTime = Date.now();

function animate(currentTime) {
    requestAnimationFrame(animate);

    if (!playerloaded){
        return;
    }

    // controls.update();

    const timeElapsed = currentTime-prevTime;
    prevTime = currentTime;
    cameraManager.update(timeElapsed)



    world.step(1 / 60);
    cannonDebugger.update();



    let time = clock.getElapsedTime();
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
