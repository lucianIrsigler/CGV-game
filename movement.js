import * as THREE from 'three';
import * as misc from "./misc";
import * as character from "./character";
import * as cameraWrapper from "./camera";
import * as dat from "dat.gui";

const gameOverScreen = document.getElementById("gameOverScreen");
const restartButton = document.getElementById("restartButton");
let points = [];
let highestVelocity = 0.15;

const spheres = []; // To keep track of created spheres


const scene = new THREE.Scene();

const camera = new cameraWrapper.CameraClass( new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000))

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



const sideWallGeometry = new THREE.BoxGeometry(50, 1, 10);
const sideWallMaterial = new THREE.MeshStandardMaterial({ color: 0x7ca687 });
const platformGeometry = new THREE.BoxGeometry(10, 1, 50);
const platformMaterial = new THREE.MeshStandardMaterial({ color: 0xa6baab });
const characterGeometry = new THREE.BoxGeometry(1, 1, 1);
const characterMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });


const pointLight = new THREE.PointLight(0xffffff, 0.3, 8);
pointLight.position.set(0, 4, 0);
scene.add(pointLight);
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5);
scene.add(pointLightHelper);
points.push(pointLight);

const pointLight1 = new THREE.PointLight(0xffffff, 0.3, 9);
pointLight1.position.set(-3.5, 4, 9);
scene.add(pointLight1);
const pointLightHelper1 = new THREE.PointLightHelper(pointLight1, 0.5);
scene.add(pointLightHelper1);
points.push(pointLight1);

const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
scene.add(ambientLight);


let platforms = [
    {geometry:platformGeometry, material:platformMaterial,position:{x:0,y:-0.5,z:20}}, //bot
    // {geometry:platformGeometry, material:platformMaterial,position:{x:0,y:5,z:20}}, //top
    // {geometry:sideWallGeometry, material:sideWallMaterial,position:{x:0,y:2,z:-5},rotation:{x:Math.PI/2,y:0,z:0}},//back
    // {geometry:sideWallGeometry, material:sideWallMaterial,position:{x:0,y:2,z:-5},rotation:{x:Math.PI/2,y:0,z:0}}, //right
    // {geometry:sideWallGeometry, material:sideWallMaterial,position:{x:5,y:0.8,z:15},rotation:{x:Math.PI/2,y:0,z:Math.PI / 2}} //left
]

platforms.forEach((platform)=>{
    misc.generatePlatform(platform,scene);
})

scene.background = new THREE.Color(0x333333);


const player = new character.CharacterModel(characterGeometry,characterMaterial)
player.setPosition({x:0, y:0.5, z:0});
scene.add(player.model);


// Camera setup
camera.setPosition({x:0, y:1, z:0});

player.setRotation({x:0,y:Math.PI,z:0});

function createFallingSphere() {
    // const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32); // Create a sphere
    // const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
    // const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    
    // // Calculate the spawn position based on player rotation
    // const spawnDistance = 3; // Distance in front of the character
    // sphere.position.x = player.position.x - Math.sin(player.rotation.y) * spawnDistance;
    // sphere.position.y = player.position.y ; // Start slightly above the ground
    // sphere.position.z = player.position.z + spawnDistance; // Move forward

    // sphere.velocity = 0; // Initial velocity
    // spheres.push(sphere); // Add to spheres array
    // scene.add(sphere);
}

function createPointLight(position) {
    let pointLight = new THREE.PointLight(0xffffff, 0.3, 12); // White light
    pointLight.position.copy(position); // Set light position to where the sphere hits
    points.push(pointLight)
    scene.add(pointLight);
}

function onKeyDown(event) {
    switch (event.code) {
      case "ArrowUp":
        player.moveForward = true;
        break;
      case "ArrowDown":
        player.moveBackward = true;
        break;
      case "ArrowLeft":
        player.rotateLeft = true;
        break;
      case "ArrowRight":
        player.rotateRight = true;
        break;
      case "Space":
        if (!player.isJumping()) {
            player.setJumping(true);
          console.log("HERE");
          player.velocityY = highestVelocity; // Set initial jump velocity
        }
        break;
      case "KeyQ":
        createFallingSphere();
        break;
    }
  }

function onKeyUp(event) {
switch (event.code) {
    case "ArrowUp":
        player.moveForward = false;
    break;
    case "ArrowDown":
        player.moveBackward = false;
    break;
    case "ArrowLeft":
        player.rotateLeft = false;
    break;
    case "ArrowRight":
        player.rotateRight = false;
    break;
}
}

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);



function handleCharacterDeath() {
gameOverScreen.style.display = "block";
}

function restartGame() {
    gameOverScreen.style.display = "none";
    player.setPosition({x:0, y:0.5, z:0});
    camera.setPosition({x:0, y:1, z:0});
    player.setRotation({x:player.rotation.x,y:Math.PI,z:player.rotation.z});
}

restartButton.addEventListener("click", restartGame);



function calcEuclid(x1, z1, x2, z2) {
const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(z1 - z2, 2));
return distance <= 6;
}


const gui = new dat.GUI();

const options = {
    moveSpeed:0.1,
    highestVelocity:0.15
}


gui.add(options,"moveSpeed").onChange(function(e){
  player.moveSpeed = e;
})

gui.add(options,"highestVelocity").onChange(function(e){
  highestVelocity= e;
})

function animate() {
    requestAnimationFrame(animate);

    // Light check
    // let inLight = points.some(light =>
    //     calcEuclid(player.position.x, player.position.z, light.position.x, light.position.z)
    // );

    // if (!inLight) {
    //     handleCharacterDeath();
    //     return;
    // }

    // Sphere movement and deletion
    // spheres.forEach((sphere, index) => {
    //     sphere.velocity += gravity; // Apply gravity to the sphere
    //     sphere.position.y += sphere.velocity; // Update position based on velocity
    //     createPointLight(sphere.position); // Create light at sphere's position
    //     scene.remove(sphere); // Remove sphere after it hits the ground
    //     spheres.splice(index, 1); // Remove from spheres array
    // });

    // Jumping and gravity application
    player.updatePlayerPosition();

    camera.setPosition(player.getPosition());
    camera.setRotation(player.getRotation());
    renderer.render(scene, camera.camera);
}

animate();