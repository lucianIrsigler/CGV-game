import { door } from './doorPos.js';
import { lamps } from './lampPos.js';

// Scene setup
const gameOverScreen = document.getElementById("gameOverScreen");
const restartButton = document.getElementById("restartButton");
let points = [];
const spheres = []; 
const gravity = -0.01; 
let isJumping = false; 
let velocityY = 0; 

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Texture for ground 
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('PavingStones.jpg', (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 5);
});

// Texture for walls
const textureLoaderWall = new THREE.TextureLoader();
const textureWall = textureLoaderWall.load('PavingStones.jpg', (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
});


// Texture for platforms 
const textureLoaderPlatforms = new THREE.TextureLoader();
const texturePlatform = textureLoaderPlatforms.load('PavingStones.jpg', (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 2);
});


const sideWallGeometry = new THREE.BoxGeometry(50, 1, 15);
const sideWallMaterial = new THREE.MeshStandardMaterial({ map: textureWall }); 
const platformGeometry = new THREE.BoxGeometry(10, 1, 50);
const platformMaterial = new THREE.MeshStandardMaterial({ map: texture }); 
const characterGeometry = new THREE.BoxGeometry(1, 1, 1);
const characterMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const platformsMaterial = new THREE.MeshStandardMaterial({ map: texturePlatform });

// Lighting
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

const ambientLight = new THREE.AmbientLight(0x404040, 0);
scene.add(ambientLight);

// Walls
const bottom = new THREE.Mesh(platformGeometry, platformMaterial);
bottom.position.set(0, -0.5, 20);
scene.add(bottom);

const topThingy = new THREE.Mesh(platformGeometry, platformMaterial);
topThingy.position.set(0, 9, 20);
scene.add(topThingy);

const backWall = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
backWall.position.set(0, 2, -5);
backWall.rotation.x = Math.PI / 2;
scene.add(backWall);

const left = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
left.position.set(-5, 0.8, 15);
left.rotation.set(Math.PI / 2, 0, Math.PI / 2);
scene.add(left);

const right = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
right.position.set(5, 0.8, 15);
right.rotation.set(Math.PI / 2, 0, Math.PI / 2);
scene.add(right);

const end = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
end.position.set(0, 2, 40);
end.rotation.x = Math.PI / 2;
scene.add(end);

scene.background = new THREE.Color(0x333333);

//Platforms 
const platformsGeometry = new THREE.BoxGeometry(5, 0.5, 5);
// const platformsMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color for platforms


const platforms = [
  { position: new THREE.Vector3(3, 2, 15), size: new THREE.Vector3(5, 0.5, 5) },
  { position: new THREE.Vector3(-3, 4, 20), size: new THREE.Vector3(5, 0.5, 5) },
  { position: new THREE.Vector3(3, 2, 30), size: new THREE.Vector3(3, 0.3, 3) },
  { position: new THREE.Vector3(-3, 4, 35), size: new THREE.Vector3(3, 0.3, 10) }
];

platforms.forEach(platform => {
  const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(platform.size.x, platform.size.y, platform.size.z),
      platformsMaterial
  );
  mesh.position.copy(platform.position);
  scene.add(mesh);
});

function updateCharacterPosition() {
  const oldPosition = character.position.clone();

  if (moveForward) {
      character.position.z -= Math.cos(character.rotation.y) * moveSpeed;
      character.position.x -= Math.sin(character.rotation.y) * moveSpeed;
  }
  if (moveBackward) {
      character.position.z += Math.cos(character.rotation.y) * moveSpeed;
      character.position.x += Math.sin(character.rotation.y) * moveSpeed;
  }

  // Check for collisions with platforms
  let onPlatform = false;
  platforms.forEach(platform => {
      if (
          character.position.x >= platform.position.x - platform.size.x / 2 &&
          character.position.x <= platform.position.x + platform.size.x / 2 &&
          character.position.z >= platform.position.z - platform.size.z / 2 &&
          character.position.z <= platform.position.z + platform.size.z / 2
      ) {
          if (
              oldPosition.y + 0.5 >= platform.position.y &&
              character.position.y <= platform.position.y + platform.size.y
          ) {
              character.position.y = platform.position.y + platform.size.y;
              velocityY = 0;
              isJumping = false;
              jumpCount = 0; // Reset jump count when landing on a platform
              onPlatform = true;
          }
      }
  });

  // Apply gravity if not on a platform
  if (!onPlatform && !isJumping) {
      character.position.y += velocityY;
      velocityY += gravity;
  }

  // Prevent falling through the ground
  if (character.position.y < 0.5) {
      character.position.y = 0.5;
      isJumping = false;
      velocityY = 0;
  }
}


//Lamps 
let currentLamp = lamps.lampOne; 
Object.values(lamps).forEach((currentLamp) => {
    const loader = new THREE.GLTFLoader();
    
    loader.load(currentLamp.scene, function (gltf) {
      let model = gltf.scene;
      scene.add(model);
  
      model.position.set(currentLamp.positionX, currentLamp.positionY, currentLamp.positionZ);
      model.scale.set(currentLamp.scaleX, currentLamp.scaleY, currentLamp.scaleZ);
      model.castShadow = true;
  
      const lampLight = new THREE.PointLight(0xA96CC3, 0.5, 2); // Purple light 
      lampLight.position.set(currentLamp.positionX, currentLamp.positionY + 2, currentLamp.positionZ); 
      scene.add(lampLight);
    }, undefined, function (error) {
      console.error('An error happened while loading the lamp model:', error);
    });
  });
  
// Door
let Door;
let doorMixer; 
let doorAnimationAction; 
const currentDoor = door.doorOne;

const loader = new THREE.GLTFLoader();
loader.load(currentDoor.scene, function (gltf) {
    Door = gltf.scene;
    scene.add(Door);

    Door.position.set(currentDoor.positionX, currentDoor.positionY, currentDoor.positionZ);
    Door.scale.set(currentDoor.scaleX, currentDoor.scaleY, currentDoor.scaleZ);
    Door.castShadow = true;

    doorMixer = new THREE.AnimationMixer(Door);

    const animations = gltf.animations;
    if (animations && animations.length > 0) {
        doorAnimationAction = doorMixer.clipAction(animations[0]); 
    }
}, undefined, function (error) {
    console.error('An error happened', error);
});

// Function to open the door
// function openDoor() {
//     if (doorAnimationAction) {
//         doorAnimationAction.reset(); 
//         doorAnimationAction.play(); 
//     }
// }

// Declare a flag variable to track the door state
let isDoorOpen = false;

// Function to open the door
function openDoor() {
    if (!isDoorOpen && doorAnimationAction) { 
        doorAnimationAction.reset(); 
        doorAnimationAction.play(); 
        isDoorOpen = true; // Set the flag to true so it won't open again
    }
}


// Character setup
const character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.set(0, 0.5, 0);
scene.add(character);

// Camera setup
camera.position.set(0, 1, 0);
character.rotation.y += Math.PI;

// Variables for movement
let moveSpeed = 0.1;
let rotateSpeed = 0.05;
let moveForward = false;
let moveBackward = false;
let rotateLeft = false;
let rotateRight = false;

// Falling sphere
 function createFallingSphere() {
  const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32); // Create a sphere
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  
  // Calculate the spawn position based on player rotation
  const spawnDistance = 3; // Distance in front of the character
  sphere.position.x = character.position.x - Math.sin(character.rotation.y) * spawnDistance;
  sphere.position.y = character.position.y ; // Start slightly above the ground
  sphere.position.z = character.position.z + spawnDistance; // Move forward

  sphere.velocity = 0; // Initial velocity
  spheres.push(sphere); // Add to spheres array
  scene.add(sphere);
}

function createPointLight(position) {
  let pointLight = new THREE.PointLight(0xffffff, 0.3, 12); // White light
  pointLight.position.copy(position); // Set light position to where the sphere hits
  points.push(pointLight)
  scene.add(pointLight);
}

let jumpCount = 0; 

// Key handling
function onKeyDown(event) {
  switch (event.code) {
    case "ArrowUp":
      moveForward = true;
      break;
    case "ArrowDown":
      moveBackward = true;
      break;
    case "ArrowLeft":
      rotateLeft = true;
      break;
    case "ArrowRight":
      rotateRight = true;
      break;
    case "Space":
      if (jumpCount < 2) { //Jumping twice
        isJumping = true;
        velocityY = 0.15;
        jumpCount++; 
      }
      break;
    case "KeyQ":
      createFallingSphere();
      break;

      case "KeyE": // Use "E" key to open the door
      openDoor(); 
      break;
  }
}

function onKeyUp(event) {
  switch (event.code) {
    case "ArrowUp":
      moveForward = false;
      break;
    case "ArrowDown":
      moveBackward = false;
      break;
    case "ArrowLeft":
      rotateLeft = false;
      break;
    case "ArrowRight":
      rotateRight = false;
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
  character.position.set(0, 0.5, 0);
  camera.position.set(0, 1, 0);
  character.rotation.y += Math.PI;
}

restartButton.addEventListener("click", restartGame);

function calcEuclid(x1, z1, x2, z2) {
  const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(z1 - z2, 2));
  return distance <= 6;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update the door animation mixer if it exists
  if (doorMixer) {
    doorMixer.update(0.01); // Update the animation mixer
}

  // Light check
  let inLight = points.some(light =>
    calcEuclid(character.position.x, character.position.z, light.position.x, light.position.z)
  );

  if (!inLight) {
    handleCharacterDeath();
    return;
  }

  // Sphere movement and deletion
  spheres.forEach((sphere, index) => {
      sphere.velocity += gravity; // Apply gravity to the sphere
      sphere.position.y += sphere.velocity; // Update position based on velocity
      createPointLight(sphere.position); // Create light at sphere's position
      scene.remove(sphere); // Remove sphere after it hits the ground
      spheres.splice(index, 1); // Remove from spheres array
  });
  updateCharacterPosition();
// Jumping and gravity application
if (isJumping) {
  character.position.y += velocityY;
  velocityY += gravity;

  if (character.position.y <= 0.5) {
      character.position.y = 0.5;
      isJumping = false;
      velocityY = 0;
      jumpCount = 0;
  }
}




  // Movement and rotation
  // if (moveForward) {
  //   character.position.z -= Math.cos(character.rotation.y) * moveSpeed;
  //   character.position.x -= Math.sin(character.rotation.y) * moveSpeed;
  // }
  // if (moveBackward) {
  //   character.position.z += Math.cos(character.rotation.y) * moveSpeed;
  //   character.position.x += Math.sin(character.rotation.y) * moveSpeed;
  // }
  if (rotateLeft) {
    character.rotation.y += rotateSpeed;
  }
  if (rotateRight) {
    character.rotation.y -= rotateSpeed;
  }

  camera.position.copy(character.position);
  camera.rotation.copy(character.rotation);
  renderer.render(scene, camera);
}

animate();