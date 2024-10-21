import * as THREE from 'three';
import { CameraManager } from './src/scripts/Camera/CameraManager';
import { LoadingManager } from './src/scripts/Loaders/Loader';
import { Characater } from './src/scripts/Characters/Chararcter';


let loadingManager = new LoadingManager();

let targetted;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let cameraManager;



function addRandomStuff(scene,camera){
  // Create a basic scene, camera, and renderer
  camera.position.set(0, 7, 0);
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
  plane.isGround=true;
  scene.add(plane);


  const planeGeometry1 = new THREE.BoxGeometry(10, 10,2);
  const planeMaterial1 = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
  const plane1 = new THREE.Mesh(planeGeometry1, planeMaterial1);
  plane1.rotation.x = -Math.PI / 2;
  plane1.position.y = 2;
  plane1.position.x=-10;
  plane1.position.z=-10;
  plane1.isGround=true;
  scene.add(plane1);


  const plane2 = new THREE.Mesh(planeGeometry1, planeMaterial1);
  plane2.rotation.x = -Math.PI / 2;
  plane2.position.y = 4;
  plane2.position.x=5;
  plane2.position.z=-10;
  plane2.isGround=true;
  scene.add(plane2);



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


}

addRandomStuff(scene,camera);

async function initialize() {
  try {
      await loadingManager.loadModel('./public/assets/hollow_knight/scene.glb', 'player', (gltf) => {
          const model = gltf.scene; // Get the loaded model
          scene.add(model); // Add the model to the scene
          model.rotation.set(0, 0, 0); // Rotate the model
          model.scale.set(1, 1, 1); // Scale the model if necessary
          model.position.set(0, 0, 0); // Scale the model if necessary
          model.name = "player"; // Name the model

          targetted = model;

          cameraManager = new CameraManager(
            camera,
            targetted,
            new Characater(5.0,0.4),
          scene
        )
      });
      console.log('Model loaded and added to the scene.');
  } catch (error) {
      console.error('Failed to load model:', error);
  }
}

initialize();

// const cubeGeometry = new THREE.BoxGeometry(5, 5 , 10);
// const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
// const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// cube.position.set(0,0,0);
// scene.add(cube);


// targetted = cube;

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// Animation loop

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


let lastTime = 0;
function animate(currentTime) {
  const timeElapsedS = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  if (targetted!=undefined && cameraManager!=undefined){
      cameraManager.update(timeElapsedS)
      renderer.render(scene, cameraManager.getCamera());
  }
  requestAnimationFrame(animate);
}

animate();
