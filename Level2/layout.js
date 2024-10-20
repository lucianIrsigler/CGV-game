import * as THREE from 'https://unpkg.com/three@0.153.0/build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { lamps } from './lampPos2';
import { door } from './doorPos';
import { gun } from './gunPos';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Directional light for testing
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10); // Position the light
scene.add(directionalLight);

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
const platformTexture = textureLoader.load('PavingStones.jpg');
const baseTexture = textureLoader.load('PavingStones.jpg');

// Set texture wrapping and repeat if needed
platformTexture.wrapS = platformTexture.wrapT = THREE.RepeatWrapping;
baseTexture.wrapS = baseTexture.wrapT = THREE.RepeatWrapping;

// Apply textures to the materials
const platformMaterial = new THREE.MeshStandardMaterial({
    map: platformTexture
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
  
      model.position.set(currentGun.positionX, currentGun.positionY, currentGun.positionZ);
      model.scale.set(currentGun.scaleX, currentGun.scaleY, currentGun.scaleZ);
      model.castShadow = true;
  
      const gunLight = new THREE.PointLight(0xA96CC3, 0.5, 2); // Purple light 
      gunLight.position.set(currentGun.positionX, currentGun.positionY + 2, currentGun.positionZ); 
      scene.add(gunLight);
    }, undefined, function (error) {
      console.error('An error happened while loading the gun model:', error);
    });
});

//Lamp Stuff
// let currentLamp = lamps.lampOne; 
// Object.values(lamps).forEach((currentLamp) => {
//     const loader = new GLTFLoader();  // Use GLTFLoader directly, not THREE.GLTFLoader
    
//     loader.load(currentLamp.scene, function (gltf) {
//       let model = gltf.scene;
//       scene.add(model);
  
//       model.position.set(currentLamp.positionX, currentLamp.positionY, currentLamp.positionZ);
//       model.scale.set(currentLamp.scaleX, currentLamp.scaleY, currentLamp.scaleZ);
//       model.castShadow = true;
  
//       const lampLight = new THREE.PointLight(0xA96CC3, 0.5, 2); // Purple light 
//       lampLight.position.set(currentLamp.positionX, currentLamp.positionY + 2, currentLamp.positionZ); 
//       scene.add(lampLight);
//     }, undefined, function (error) {
//       console.error('An error happened while loading the lamp model:', error);
//     });
// });

// let Door;
// let doorMixer; 
// let doorAnimationAction; 
// const currentDoor = door.doorOne;

const doorLoader = new GLTFLoader();
doorLoader.load(currentDoor.scene, function (gltf) {
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
let isDoorOpen = false;

function onKeyDown(event) {
    switch (event.code) {
        case "KeyE": // Use "E" key to open the door
        openDoor(); 
        break;
    }
  }
window.addEventListener("keydown", onKeyDown);
// Function to open the door
function openDoor() {
    if (!isDoorOpen && doorAnimationAction) { 
        doorAnimationAction.reset(); 
        doorAnimationAction.play(); 
        isDoorOpen = true; // Set the flag to true so it won't open again
    }
}
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
const platformSpacing = 1;
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
    if(i === 0) {
        continue; // Skip the first platform
    }
    else if(i % 5 === 0) {
        definePlatformAction(i, { type: 'updown', speed: 0.002, range: 2 });
    }
    else if(i % 6 === 0) {
        definePlatformAction(i, { type: 'downup', speed: 0.002, range: 2 });
    }
    else if(i % 4 === 0) {
        definePlatformAction(i, { type: 'leftright', speed: 0.002, range: 2 });
    }
    else if(i % 7 === 0) {
        definePlatformAction(i, { type: 'rightleft', speed: 0.002, range: 2 });
    }
}

const loader = new GLTFLoader();
let lampIndex = 0;

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

                const lampLight = new THREE.PointLight(0xA96CC3, 0.5, 30); // Purple light 
                lampLight.position.set(0, 2, 0); // Position relative to the lamp model
                model.add(lampLight);

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
camera.position.z = 20;
camera.position.y = 10;

// Set up OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;

// Animation loop
let lastUpdate = 0; // Track the last update time
const updateInterval = 1; // Time in milliseconds for each update

function animate(time) {
    requestAnimationFrame(animate);
    // if (doorMixer) {
    //     doorMixer.update(0.01); // Update the animation mixer
    // }
    // Check if 100ms has passed since the last update
    if (time - lastUpdate >= updateInterval) {
        lastUpdate = time; // Update the last update time

        // Update the camera controls
        controls.update();

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
