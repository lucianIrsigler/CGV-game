import * as THREE from 'three';
import {FirstPersonCamera} from "./src/scripts/Camera/FirstPersonCamera"
import { ThirdPersonCamera } from './src/scripts/Camera/ThirdPersonCamera';


let targetted;

// Create a basic scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 0);
// const fpsCamera = new FirstPersonCamera(camera);


// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 100);
scene.add(ambientLight);

// Add a ground plane
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = 0;
scene.add(plane);

// Add some random cubes
for (let i = 0; i < 10; i++) {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

  cube.position.set(
    Math.random() * 50 - 25,
    0.5,
    Math.random() * 50 - 25
  );
  scene.add(cube);
}

const cubeGeometry = new THREE.BoxGeometry(5, 5 , 10);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0,0,0);
scene.add(cube);


targetted = cube;
let thirdPerson = false;

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Animation loop
const fpsCamera = new FirstPersonCamera(camera,targetted,scene)
const thirdPersonCamera = new ThirdPersonCamera(camera,targetted)


document.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "KeyR":
      thirdPerson = !thirdPerson;
      break;
  }

})


let current = 0;


function animate() {
  requestAnimationFrame(animate);
  const timeElapsed = current + 0.001;
  if (targetted!=undefined){
    if (!thirdPerson){
      fpsCamera.update(timeElapsed);
    }else{
      thirdPersonCamera.update(timeElapsed);
    }
  }
  renderer.render(scene, fpsCamera.camera_);
}

animate();
