import * as THREE from 'https://unpkg.com/three@0.153.0/build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { lamps } from './lampPos2';
import { door } from './doorPos';
import { gun } from './gunPos';
import { loadTextures, applyTextureSettings } from './TextureLoaderUtil';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new FirstPersonControls(camera, renderer.domElement);
controls.movementSpeed = 10;
controls.lookSpeed = 0.1;
camera.position.set(55, 2,2);

// Crates
const textureLoader = new THREE.TextureLoader();
const colorMap = textureLoader.load('Planks/PlanksColor.jpg');
const aoMap = textureLoader.load('Planks/PlanksAmbientOcclusion.jpg');
const displacementMap = textureLoader.load('Planks/PlanksDisplacement.jpg');
const metalnessMap = textureLoader.load('Planks/PlanksMetalness.jpg');
const normalMapDX = textureLoader.load('Planks/PlanksNormalDX.jpg');
const roughnessMap = textureLoader.load('Planks/PlanksRoughness.jpg');

[colorMap, aoMap, displacementMap, metalnessMap, normalMapDX, roughnessMap].forEach(texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.2, 0.2);
});

const crateGeometry = new THREE.BoxGeometry(7, 3, 2);

const crateMaterial = new THREE.MeshStandardMaterial({
    map: colorMap,
    aoMap: aoMap,
    displacementMap: displacementMap,
    metalnessMap: metalnessMap,
    normalMap: normalMapDX,
    roughnessMap: roughnessMap,
    displacementScale: 0,
    metalness: 0.3,
    roughness: roughnessMap
});

colorMap.encoding = THREE.sRGBEncoding;

// Create a group for crates, platforms, and lamps
const platformGroup = new THREE.Group();
scene.add(platformGroup);

// Action definitions for platforms
const platformActions = {};
const originalPositions = {};
const platformArray = []; // Array to hold platform groups

// Function to specify actions for platforms
function definePlatformAction(platformIndex, action) {
    platformActions[platformIndex] = action;
}

// Load textures for the base and platforms
//const platformTexture = textureLoader.load('PavingStones.jpg');
const platformTexture = loadTextures('PavingStones');
applyTextureSettings(platformTexture, 0.07, 0.07); 

const baseTexture = textureLoader.load('PavingStones.jpg');

// Set texture wrapping and repeat if needed
platformTexture.wrapS = platformTexture.wrapT = THREE.RepeatWrapping;
//platformTexture.repeat.set(0.1, 0.1); // Increase the wrapping scale
baseTexture.wrapS = baseTexture.wrapT = THREE.RepeatWrapping;
baseTexture.repeat.set(5, 5);
// Apply textures to the materials
const platformMaterial = new THREE.MeshStandardMaterial({
    map: platformTexture.colorMap,
    aoMap: platformTexture.aoMap,
    displacementMap: platformTexture.displacementMap,
    metalnessMap: platformTexture.metalnessMap,
    normalMap: platformTexture.normalMapDX, 
    roughnessMap: platformTexture.roughnessMap,
    displacementScale: 0,
    metalness: 0.1,
    roughness: 0.5
});


const baseMaterial = new THREE.MeshStandardMaterial({
    map: baseTexture
});

//Gun Stuff
let currentGun = gun.gunOne; 
Object.values(gun).forEach((currentGun) => {
    const loader = new GLTFLoader();  // Use GLTFLoader directly, not THREE.GLTFLoader
    
    loader.load(currentGun.scene, function (gltf) {
      let model = gltf.scene;
      scene.add(model);
  
      model.position.set(-53, 59, -15);
      model.scale.set(currentGun.scaleX, currentGun.scaleY, currentGun.scaleZ);
      model.castShadow = true;
  
      const gunLight = new THREE.PointLight(0xffffff, 5, 15); // Purple light 
      gunLight.position.set(-53, 62, -15); 
      model.rotation.y = THREE.MathUtils.degToRad(-110);

      scene.add(gunLight);

      // Add the gun model to the animation loop for rotation
      function rotateGun() {
          model.rotation.y += 0.01; // Adjust the speed of rotation as needed
          requestAnimationFrame(rotateGun);
      }
      rotateGun();
    }, undefined, function (error) {
      console.error('An error happened while loading the gun model:', error);
    });
});

//Door Things 
let currentDoor1 = door.doorOne;
Object.values(door).forEach((currentDoor1) => {
    const loader = new GLTFLoader();  // Use GLTFLoader directly, not THREE.GLTFLoader
    
    loader.load(currentDoor1.scene, function (gltf) {
      let model = gltf.scene;
      scene.add(model);
      
      model.position.set(-51.5, 58, -18);
      model.scale.set(currentDoor1.scaleX, currentDoor1.scaleY, currentDoor1.scaleZ);
      model.castShadow = true;

      // Rotate the door by 20 degrees (in radians)
      model.rotation.y = THREE.MathUtils.degToRad(-20);

    }, undefined, function (error) {
      console.error('An error happened while loading the door model:', error);
    });
});

let currentDoor2 = door.doorOne;
Object.values(door).forEach((currentDoor2) => {
    const loader = new GLTFLoader();  // Use GLTFLoader directly, not THREE.GLTFLoader
    
    loader.load(currentDoor2.scene, function (gltf) {
      let model = gltf.scene;
      scene.add(model);
      
      model.position.set(54.5, 0,2);
      model.scale.set(currentDoor2.scaleX, currentDoor2.scaleY, currentDoor2.scaleZ);
      model.castShadow = true;

      // Rotate the door by 20 degrees (in radians)
      model.rotation.y = THREE.MathUtils.degToRad(0);

    }, undefined, function (error) {
      console.error('An error happened while loading the door model:', error);
    });
});

// Create the circular base (cylinder) with texture
const radiusTop = 50;
const radiusBottom = 50;
const height = 2;
const radialSegments = 32;
const circularBaseGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
const circularBase = new THREE.Mesh(circularBaseGeometry, baseMaterial);
scene.add(circularBase);

// Define the number of platforms
const numPlatforms = 30;
const sectorInnerRadius = radiusTop + 2; // Inner radius of the sector which determines how far platforms are from the base
const sectorOuterRadius = sectorInnerRadius + 5; // widens the back of each platform
const platformHeight = 1;
const platformSpacing = 2;
const spiralTurnAngle = Math.PI / 4.2; // changes distance between platforms
const sectorAngle = Math.PI / 4.7; // changes length of each platform

for (let i = 0; i < numPlatforms; i++) {
    const angle = i * spiralTurnAngle;
    const platformY = i * platformSpacing;

    const shape = new THREE.Shape();
    shape.moveTo(Math.cos(angle) * sectorInnerRadius, Math.sin(angle) * sectorInnerRadius);
    shape.lineTo(Math.cos(angle) * sectorOuterRadius, Math.sin(angle) * sectorOuterRadius);
    shape.absarc(0, 0, sectorOuterRadius, angle, angle + sectorAngle, false);
    shape.lineTo(Math.cos(angle + sectorAngle) * sectorInnerRadius, Math.sin(angle + sectorAngle) * sectorInnerRadius);
    shape.absarc(0, 0, sectorInnerRadius, angle + sectorAngle, angle, true);

    const extrudeSettings = {
        depth: platformHeight,
        bevelEnabled: false
    };

    const platformGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.rotation.x = Math.PI / 2;
    platform.position.y = platformY;

    // Store the original position
    originalPositions[i] = platform.position.clone();

    // Create a group to hold the platform, crate, and lamp
    const combinedGroup = new THREE.Group();
    combinedGroup.add(platform);

    // Push the combinedGroup to the platformArray
    platformArray.push(combinedGroup);

    if (i % 3 === 0 || i === numPlatforms - 1) {
        const lampX = Math.cos(angle + sectorAngle / 2) * (sectorInnerRadius + sectorOuterRadius) / 2;
        const lampY = platformY + platformHeight / 2 - 0.5;
        const lampZ = Math.sin(angle + sectorAngle / 2) * (sectorInnerRadius + sectorOuterRadius) / 2;

        combinedGroup.userData = {
            lampPosition: new THREE.Vector3(lampX, lampY, lampZ),
            platformIndex: i
        };

        // Position crate on the side of the shorter arc (closer to the inner radius)
        const cratex = Math.cos(angle + sectorAngle / 2) * (sectorInnerRadius + (sectorOuterRadius - sectorInnerRadius) / 4);
        const cratey = platformY + platformHeight / 2 +1; 
        const cratez = Math.sin(angle + sectorAngle / 2) * (sectorInnerRadius + (sectorOuterRadius - sectorInnerRadius) / 4);

        // Add crate in front of the lamp post, closer to the inner radius
        const crate = new THREE.Mesh(crateGeometry, crateMaterial);
        crate.position.set(cratex, cratey, cratez);
        crate.lookAt(0, crate.position.y, 0); // Make the crate face the center
        combinedGroup.add(crate);
    }

    // Add the combined group to the platformGroup
    platformGroup.add(combinedGroup);

    // Define specific actions for platforms
    switch (true) {
        case (i === 4 || i === 8 ):
            definePlatformAction(i, { type: 'leftright', speed: 0.002, range: 2 });
            break;
        case (i === 5 || i === 7 || i === 19):
            definePlatformAction(i, { type: 'rightleft', speed: 0.002, range: 2 });
            break;
        case (i === 10 || i === 14 || i === 16 || i === 17 ):
            definePlatformAction(i, { type: 'updown', speed: 0.002, range: 2 });
            break;
        case (i === 11 || i === 13 || i === 20):
            definePlatformAction(i, { type: 'downup', speed: 0.002, range: 2 });
            break;
        case (i === 22 || i === 25):
            definePlatformAction(i, { type: 'leftrightupdown', speed: 0.002, range: 2 });
            break;
        case (i === 23 || i === 26):
            definePlatformAction(i, { type: 'rightleftdownup', speed: 0.002, range: 2 });
            break;
        case (i === 28):
            definePlatformAction(i, { type: 'updown', speed: 0.002, range: 6 });
            break;
    }
}

const loader = new GLTFLoader();
let lampIndex = 0;

// Inside the lamps loading section
Object.values(lamps).forEach((currentLamp) => {
    loader.load(currentLamp.scene, function (gltf) {
        let model = gltf.scene;
        
        // Find the next platform that should have a lamp
        while (lampIndex < platformArray.length) {
            const platform = platformArray[lampIndex];
            if (platform.userData && platform.userData.lampPosition) {
                const lampPos = platform.userData.lampPosition;
                
                model.position.copy(lampPos);
                model.scale.set(currentLamp.scaleX, currentLamp.scaleY, currentLamp.scaleZ);
                model.castShadow = true;

                // Make the lamp face the center
                model.lookAt(0, model.position.y, 0);

                platform.add(model);

                // Adjust the light position to point downwards
                // const lampLight = new THREE.PointLight(0xA96CC3, 15, 15); // Purple light 
                // lampLight.position.set(0, 2, 0); // Position it below the lamp model
                // model.add(lampLight);
                
                // Create a cone light to point at the platform
                const coneLight = new THREE.SpotLight(0xA96CC3, 15, 10, Math.PI / 4, 0.5, 2); // Adjust parameters as needed
                coneLight.position.copy(lampPos).add(new THREE.Vector3(0, 5, 0)); // Adjust height if necessary
                coneLight.target.position.copy(lampPos); // Point towards the lamp position
                coneLight.target.updateMatrixWorld(); // Ensure target is updated
                scene.add(coneLight.target); // Add target to scene
                scene.add(coneLight); // Add the light to the scene
                
                // coneLight.rotation.x = Math.PI / 2; // Rotate the light to point downwards

                break; // Move to the next lamp
            }
            lampIndex++;
        }
        lampIndex++; // Prepare for the next lamp
    }, undefined, function (error) {
        console.error('An error happened while loading the lamp model:', error);
    });
});


// Calculate the min and max height for the circular base
const minHeight = 0;
const maxHeight = (numPlatforms - 1) * platformSpacing;

// Adjust camera position
// camera.position.z = 20;
// camera.position.y = 10;

// // Set up OrbitControls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true; 
// controls.dampingFactor = 0.25;
// controls.screenSpacePanning = false;

// Create a big cylindrical structure around the existing elements
const roomRadius = 100;
const roomHeight = 100;

// Create the cylindrical room
const roomGeometry = new THREE.CylinderGeometry(roomRadius, roomRadius, roomHeight, 64, 1, true);
const roomMaterial = new THREE.MeshStandardMaterial({
    map: baseTexture,
    side: THREE.DoubleSide // Render both sides of the cylinder
});
const room = new THREE.Mesh(roomGeometry, roomMaterial);
room.position.y = roomHeight / 2 - 20; // Adjust position to match the base height
scene.add(room);

// Create the top and bottom caps for the room
const capGeometry = new THREE.CircleGeometry(roomRadius, 64);
const capMaterial = new THREE.MeshStandardMaterial({
    map: baseTexture,
    side: THREE.DoubleSide // Render both sides of the caps
});

// Top cap
const topCap = new THREE.Mesh(capGeometry, capMaterial);
topCap.rotation.x = Math.PI / 2;
topCap.position.y = roomHeight / 2 + 30;
scene.add(topCap);

// Bottom cap
const bottomCap = new THREE.Mesh(capGeometry, capMaterial);
bottomCap.rotation.x = -Math.PI / 2;
bottomCap.position.y = -roomHeight / 2 + 30;
scene.add(bottomCap);

//LIGHTING

// const centerLight = new THREE.PointLight(0xffffff, 1, 100);
// centerLight.position.set(0, roomHeight / 2, 0); // Position the light in the center of the room
// scene.add(centerLight);

// Add a point light that radiates to the entirety of the cylinder
// const pointLight = new THREE.PointLight(0x0000ff, 0.5, roomRadius * 2);
// pointLight.position.set(0, roomHeight / 2, 0); // Position the light in the center of the room
// scene.add(pointLight);

// Directional light for testing
const directionalLight1 = new THREE.DirectionalLight(0x0000ff, 0.1);
directionalLight1.position.set(0, -50, 0); // Position the light
directionalLight1.target.position.set(0, -100, 0); // Make the light face downwards
scene.add(directionalLight1);
scene.add(directionalLight1.target); // Add the target to the scene

// Add a second directional light opposite to the first
const directionalLight2 = new THREE.DirectionalLight(0x0000ff, 0.1);
directionalLight2.position.set(0, 50, 0); // Position the light
directionalLight2.target.position.set(0, 100, 0); // Make the light face upwards
scene.add(directionalLight2);
scene.add(directionalLight2.target); // Add the target to the scene

const ambientLight = new THREE.AmbientLight(0x0000ff, 0.05); // Soft white light
scene.add(ambientLight);

// Animation loop
let lastUpdate = 0; // Track the last update time
const updateInterval = 1; // Time in milliseconds for each update

function animate(time) {
    requestAnimationFrame(animate);
    // Check if 100ms has passed since the last update
    if (time - lastUpdate >= updateInterval) {
        lastUpdate = time; // Update the last update time

        // Update the camera controls
        controls.update(0.1);

        // Constrain camera's Y position between minHeight and maxHeight
        // camera.position.y = Math.min(Math.max(camera.position.y, minHeight), maxHeight);

        // Update circular base's height to match the camera's Y position
        circularBase.position.y = camera.position.y - 4;

        // Update positions of platforms based on defined actions
        platformArray.forEach((group, index) => {
            const platformAction = platformActions[index];
            const originalPosition = originalPositions[index];

            if (platformAction) {
                const { type, speed, range } = platformAction;

                switch (type) {
                    case 'updown':
                        // Reset the group position to the original position
                        if (group.position.y !== originalPosition.y) {
                            group.position.y = originalPosition.y; // Set to original position
                        }
                        group.position.y = Math.sin(Date.now() * speed) * range;
                        break;
                    case 'downup':
                        // Reset the group position to the original position
                        if (group.position.y !== originalPosition.y) {
                            group.position.y = originalPosition.y; // Set to original position
                        }
                        group.position.y = -Math.sin(Date.now() * speed) * range;
                        break;
                    case 'leftright':
                        // Reset the group position to the original position
                        if (group.position.x !== originalPosition.x) {
                            group.position.x = originalPosition.x; // Set to original position
                        }
                        group.position.x = Math.sin(Date.now() * speed) * range;
                        break;
                    case 'rightleft':
                        // Reset the group position to the original position
                        if (group.position.x !== originalPosition.x) {
                            group.position.x = originalPosition.x; // Set to original position
                        }
                        group.position.x = -Math.sin(Date.now() * speed) * range;
                        break;
                    case 'leftrightupdown':
                        // Reset the group position to the original position
                        if (group.position.x !== originalPosition.x || group.position.y !== originalPosition.y) {
                            group.position.set(originalPosition.x, originalPosition.y, originalPosition.z); // Set to original position
                        }
                        group.position.x = Math.sin(Date.now() * speed) * range;
                        group.position.y = Math.cos(Date.now() * speed) * range;
                        break;
                    case 'rightleftdownup':
                        // Reset the group position to the original position
                        if (group.position.x !== originalPosition.x || group.position.y !== originalPosition.y) {
                            group.position.set(originalPosition.x, originalPosition.y, originalPosition.z); // Set to original position
                        }
                        group.position.x = Math.sin(Date.now() * speed) * range;
                        group.position.y = -Math.cos(Date.now() * speed) * range;
                        break;
                }
            }
        });

    // Render the scene with updated camera and base position
    renderer.render(scene, camera);
}
}
//animate(); 
requestAnimationFrame(animate);

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

//to do: rotate door, stop lamps from clipping, move gun