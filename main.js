import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';  // Correct ES6 import
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from "dat.gui";
import * as cameraWrapper from "./camera";
import * as character from "./character";
import {monsters} from "./monsters";

let highestVelocity = 0.15;


// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc);

// Camera setup
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera = new cameraWrapper.CameraClass( new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000))

camera.setPosition({x:150,y:300,z:150}); 

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled=true;
document.body.appendChild(renderer.domElement);

// OrbitControls for the camera
const controls = new OrbitControls(camera.camera, renderer.domElement);  // Correct usage
controls.enableDamping = true;
controls.dampingFactor = 0.05;




let model;
let currentMonster = monsters.anya;
const loader = new GLTFLoader();
loader.load(currentMonster.scene, function (gltf) {
    model = gltf.scene;
    scene.add(model);  // Add the loaded model to the scene

    model.position.set(0, currentMonster.positionY, 0);  // Optional: Set position of the model
    model.scale.set(currentMonster.scaleX,currentMonster.scaleY,currentMonster.scaleZ);     // Optional: Set scale of the model
    model.castShadow = true; 
}, undefined, function (error) {
    console.error('An error happened', error);  // Handle error if loading fails
});







const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x716c82});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;  // Rotate to lie flat
plane.receiveShadow = true;  // Plane will receive shadows
scene.add(plane);


const BoxGeometry = new THREE.BoxGeometry(60,60,20);
const boxMaterial = new THREE.MeshPhongMaterial({ color: 0x6942f5 });
const box = new THREE.Mesh(BoxGeometry, boxMaterial);
box.castShadow = true; 
box.name="box";
box.position.set(0,0,0); 
scene.add(box);


const BoxGeometry1 = new THREE.BoxGeometry(20,20,20);
const boxMaterial1 = new THREE.MeshPhongMaterial({ color: 0x6942f5 });
const box1 = new THREE.Mesh(BoxGeometry1, boxMaterial1);
box1.castShadow = true; 
box1.position.set(0,0,-30); 
box1.name="player";
scene.add(box1);



//LIGHTS


const ambientLight = new THREE.AmbientLight(0x404040, 20); // Soft white light
scene.add(ambientLight);


const SpotLight = new THREE.SpotLight(0xFF0000,1000000,0,0.25);
SpotLight.position.set(10,10,10);
SpotLight.castShadow=true;
SpotLight.shadow.mapSize.width=2048;
SpotLight.shadow.mapSize.height=2048;
SpotLight.shadow.camera.near = 0.5;
SpotLight.shadow.camera.far = 2000;
SpotLight.shadow.camera.fov = 20
scene.add(SpotLight);
SpotLight.target = box1;
scene.add(SpotLight.target);


const dSpotHelper = new THREE.SpotLightHelper(SpotLight);
scene.add(dSpotHelper);

scene.add(new THREE.CameraHelper(SpotLight.shadow.camera));



// function onKeyDown(event) {
//     switch (event.code) {
//       case "ArrowUp":
//         player.moveForward = true;
//         break;
//       case "ArrowDown":
//         player.moveBackward = true;
//         break;
//       case "ArrowLeft":
//         player.rotateLeft = true;
//         break;
//       case "ArrowRight":
//         player.rotateRight = true;
//         break;
//       case "Space":
//         if (!player.isJumping()) {
//             player.setJumping(true);
//           console.log("HERE");
//           player.velocityY = highestVelocity; // Set initial jump velocity
//         }
//         break;
//       case "KeyQ":
//         createFallingSphere();
//         break;
//     }
//   }

// function onKeyUp(event) {
// switch (event.code) {
//     case "ArrowUp":
//         player.moveForward = false;
//     break;
//     case "ArrowDown":
//         player.moveBackward = false;
//     break;
//     case "ArrowLeft":
//         player.rotateLeft = false;
//     break;
//     case "ArrowRight":
//         player.rotateRight = false;
//     break;
// }
// }

// window.addEventListener("keydown", onKeyDown);
// window.addEventListener("keyup", onKeyUp);


/*
    Sets a raycaster to make a vector from spotlight positon to the
    spotlights target(the player), and checks the interactions.
    Raycast works by creating an array, that is ordered by shortest distance to
    longest distance. 
    
    If the box comes before the player, then hidden
    If the box is -1, and player isnt, then found
    If the player is -1, then hidden
    If box comes after the player, then found

*/
function isObjectInSpotlight(spotLight) {
    const rayCaster = new THREE.Raycaster();

    // Get spotlight position (origin for the ray)
    const spotLightPosition = new THREE.Vector3();
    spotLight.getWorldPosition(spotLightPosition);

    // Get the direction from the spotlight to its target
    const spotLightTargetPosition = new THREE.Vector3();
    spotLight.target.getWorldPosition(spotLightTargetPosition);

    const rayDirection = new THREE.Vector3().subVectors(spotLightTargetPosition, spotLightPosition).normalize();

    // Set the raycaster with the origin and direction
    rayCaster.set(spotLightPosition, rayDirection);

    // Check for intersections with objects in the scene
    const intersects = rayCaster.intersectObjects(scene.children, true); // Second argument 'true' means recursive check for children objects

    const boxIndex = intersects.findIndex(intersect => intersect.object.name === "box");
    const playerIndex = intersects.findIndex(intersect => intersect.object.name === "player");

    if ((boxIndex==-1 && playerIndex>0) || (playerIndex<boxIndex)){
        return true;
    }else{
        return false;
    }
}


let angle = 0;
let radius = 500;
let speed = 0.003;

const gui = new dat.GUI();

const options = {
    moveSpeed:0.1,
    radius:radius,
    speed:0.01,
    angle:SpotLight.angle,
    colour:"0xFF0000",
    distance:SpotLight.distance,
    intensity:SpotLight.intensity,
}


// gui.add(options,"moveSpeed").onChange(function(e){
//     player.moveSpeed = e;
//   })

// gui.add(options,"radius").onChange(function(e){
//     radius= e;
// })

gui.add(options,"speed").onChange(function(e){
    speed= e;
})

gui.add(options,"angle").onChange(function(e){
    SpotLight.angle = e;
dSpotHelper.update();

})

gui.add(options,"colour").onChange(function(e){
    SpotLight.color = e;
dSpotHelper.update();

})
gui.add(options,"distance").onChange(function(e){
    SpotLight.distance = e;
dSpotHelper.update();

})
gui.add(options,"intensity").onChange(function(e){
    SpotLight.intensity = e;
    dSpotHelper.update();
})



// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (model){
    angle+=speed;
    model.position.x = radius * Math.cos(angle);
    model.position.z = radius * Math.sin(angle);

    SpotLight.position.set(
        model.position.x,
        model.position.y+currentMonster.height_diff,
        model.position.z
    )

    model.lookAt(box1.position)
    }

    if (isObjectInSpotlight(SpotLight)) {
        box1.material.color.set(0x00FF00);  // Green if in spotlight
    } else {
        box1.material.color.set(0xFF0000);  // Red if not
    }

    dSpotHelper.update();

    //  player.updatePlayerPosition();

    box1.position.x = radius/10 * Math.cos(angle/10);
    box1.position.z = radius/10 * Math.sin(angle/10);

    // camera.setPosition(player.getPosition());
    // camera.setRotation(player.getRotation());
    controls.update();  // Required for damping to work


    renderer.render(scene, camera.camera);
}
animate();
