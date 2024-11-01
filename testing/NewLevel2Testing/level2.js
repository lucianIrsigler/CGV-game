import * as THREE from 'three';
import * as CANNON from "cannon-es"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CurvedPlatform } from './curvedPlatform.js';
import { CPBoxLamp } from './CPBoxLamp.js';
import { CircularPlatform } from './circularPlatform.js';
import { ButtonPlatform } from './buttonPlatform.js';
import {CameraManager} from "../../src/scripts/Scene/CameraManager.js"
import CannonDebugger from 'cannon-es-debugger';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Box } from './box.js';

//SCENE AND RENDERER---------------------------------------------------
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//----------------------------------------------------------------------



const world = new CANNON.World();
world.gravity.set(0,-9,8,0);


let cannonDebugger = new CannonDebugger(scene,world);


function calculateShortestRotation(current, target) {
    let diff = target - current;
    // Normalize the difference to be between -π and π
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return diff;
}


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
const angle = Math.PI/4;
const sectorAngle = Math.PI / 4;

const circlePlatformOuterRadius = 18;
const circlePlatformDepth = 1;
const curvedPlatformInnerRadius = 18;
const curvedPlatformOuterRadius = 25;
const curvedPlatformDepth = 1;
const curvedPlatformHeight = 3;
const numberOfPlatforms = 16;
const rotation = Math.PI / 4;
// const roomRadius = 30;
const roomInnerRadius = curvedPlatformOuterRadius;
const roomOuterRadius = curvedPlatformOuterRadius + 1;
const floorDepth = 1;
const ceilingDepth = 1;
const roomHeight = floorDepth + numberOfPlatforms * curvedPlatformHeight + ceilingDepth + 2 * curvedPlatformHeight;

const movingPlatforms = []; // Array to store moving platforms
const rotatingPlatforms = []; // Array for platforms 9-11
const upperMovingPlatforms = []; // Array for platforms 13-15



// const cpBoxLamp = new CPBoxLamp(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth);
        
// cpBoxLamp.position.y=5;
// cpBoxLamp.body.position.y=4.5;
// cpBoxLamp.boxBody.position.y=6.5;

// cpBoxLamp.quaternion.setFromEuler(0,0,0);
// cpBoxLamp.boxBody.quaternion.setFromEuler(0,0,0);

// cpBoxLamp.body.position.z =  cpBoxLamp.innerRadius + (cpBoxLamp.outerRadius - cpBoxLamp.innerRadius) / 2
    
// world.addBody(cpBoxLamp.body)
// world.addBody(cpBoxLamp.boxBody)
// scene.add(cpBoxLamp);


function positionAndRotateBody(body, innerRadius, outerRadius, rotationAngle) {
    // Calculate the middle point between inner and outer radius
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    
    // Calculate the position in world space based on the rotation angle
    const x = Math.sin(rotationAngle) * radius;
    const z = Math.cos(rotationAngle) * radius;
    
    // Set the position
    body.position.x = x;
    body.position.z = z;
    
    // Create quaternion for rotation
    const rotationQuaternion = new CANNON.Quaternion();
    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationAngle);
    body.quaternion.copy(rotationQuaternion);
}




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


    const rotationQuaternion = new CANNON.Quaternion();
    rotationQuaternion.setFromEuler(0, platform.rotation.y, 0);
    
    if (platform instanceof CPBoxLamp) {
        console.log(i);
        // Position and rotate the main platform body
        positionAndRotateBody(platform.body, platform.innerRadius, platform.outerRadius, i * rotation);
        platform.body.position.y = platform.position.y - 0.5;
        
        // Position and rotate the box body
        positionAndRotateBody(platform.boxBody, platform.innerRadius, platform.outerRadius, i * rotation);

        if (i==4 || i==12){
            platform.boxBody.position.z =platform.boxBody.position.z + 2.5;

        }else{
            platform.boxBody.position.z =platform.boxBody.position.z - 2.5;
        }

        platform.boxBody.position.y = platform.position.y + 1.5;
        
        world.addBody(platform.body);
        world.addBody(platform.boxBody);
    } else if (platform instanceof CurvedPlatform) {
        // Position and rotate the platform body
        positionAndRotateBody(platform.body, platform.innerRadius, platform.outerRadius, i * rotation);
        platform.body.position.y = platform.position.y - 0.5;
        
        world.addBody(platform.body);
    }
    scene.add(platform);
}


const circularPlatform = new CircularPlatform(circlePlatformInnerRadius, circlePlatformOuterRadius, circlePlatformDepth);
scene.add(circularPlatform);
world.addBody(circularPlatform.body);

const floor = new CircularPlatform(0, roomOuterRadius, floorDepth);
floor.position.y = -1;
scene.add(floor);

const ceiling = new CircularPlatform(0, roomOuterRadius, ceilingDepth);
ceiling.position.y = roomHeight;
scene.add(ceiling);


// const wall = new CircularPlatform(roomInnerRadius, roomOuterRadius, roomHeight);
// wall.position.y = roomHeight - 1;
// scene.add(wall);





window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
//----------------------------------------------------------------------


// const platform = new CANNON.Body({
//     mass:0,
//     position:new CANNON.Vec3(0,-1,0)
// })

// platform.addShape(new CANNON.Box(new CANNON.Vec3(100,2,100)))
// world.addBody(platform)


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

    // console.log(playerBody.position);



    let time = clock.getElapsedTime();
    // movingPlatforms.forEach(({ platform, targetY }) => {
    //     if (animatePlatforms) {
    //         const duration = 2; // Duration of the animation in seconds
    //         const progress = Math.min(time / duration, 1); // Progress of the animation (0 to 1)

    //         platform.position.y = progress * targetY; // Move from initial height to target height

    //         if (progress >= 1) {
    //             platform.position.y = targetY; // Ensure the platform stays at the target height
    //         }
    //     } else {
    //         const duration = 2; // Duration of the animation in seconds
    //         const progress = Math.min(time / duration, 1); // Progress of the animation (0 to 1)

    //         platform.position.y = (1 - progress) * targetY; // Move from target height to initial height

    //         if (progress >= 1) {
    //             platform.position.y = 0; // Ensure the platform stays at the initial height
    //         }
    //     }
    // });

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
