import * as THREE from 'https://unpkg.com/three@0.153.0/build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// crates
const textureLoader = new THREE.TextureLoader();
const colorMap = textureLoader.load('Planks/PlanksColor.jpg');
const aoMap = textureLoader.load('PlanksAmbientOcclusion.jpg');
const displacementMap = textureLoader.load('PlanksDisplacement.jpg');
const metalnessMap = textureLoader.load('PlanksMetalness.jpg');
const normalMapDX = textureLoader.load('PlanksNormalDX.jpg');
const roughnessMap = textureLoader.load('PlanksRoughness.jpg');

[colorMap, aoMap, displacementMap, metalnessMap, normalMapDX, roughnessMap].forEach(texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.2, 0.2);
});

const crateGeometry = new THREE.BoxGeometry(3, 3, 2);

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

const crates = [];

function addCrate(x, y, z) {
    const crate = new THREE.Mesh(crateGeometry, crateMaterial);
    crate.position.set(x, y, z);
    crate.lookAt(0, y, 0); // Make the crate face the center
    scene.add(crate);
    crates.push(crate);
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

// Create the circular base (cylinder) with texture
const radiusTop = 15;
const radiusBottom = 15;
const height = 2;
const radialSegments = 32;
const circularBaseGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
const circularBase = new THREE.Mesh(circularBaseGeometry, baseMaterial);
scene.add(circularBase);

// Define the number of platforms
const numPlatforms = 30;
const sectorInnerRadius = radiusTop; // Inner radius of the sector which determines how far platforms are from the base
const sectorOuterRadius = sectorInnerRadius + 5; // widens the back of each platform
const platformHeight = 1;
const platformSpacing = 1;
const spiralTurnAngle = Math.PI / 4;
const sectorAngle = Math.PI / 4.7; // changes length of each platform / changes gap between platforms

// Lamp post details
const lampPostHeight = 2;
const lampPostRadius = 0.1;

// Create the platforms with vertical width and add lamps every second platform
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

    scene.add(platform);

    if (i % 3 === 0) {
        const lampPostGeometry = new THREE.CylinderGeometry(lampPostRadius, lampPostRadius, lampPostHeight, 16);
        const lampPostMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
        const lampPost = new THREE.Mesh(lampPostGeometry, lampPostMaterial);
    
        lampPost.position.set(
            Math.cos(angle + sectorAngle / 2) * (sectorInnerRadius + sectorOuterRadius) / 2,
            platformY + platformHeight / 2 + lampPostHeight / 2,
            Math.sin(angle + sectorAngle / 2) * (sectorInnerRadius + sectorOuterRadius) / 2
        );
    
        const bulbGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        if(i % 5 === 0) 
        {
            bulbMaterial.color.set(0x00ff00);
        } 
        else 
        {
            bulbMaterial.color.set(0xffff00);
        }
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.set(lampPost.position.x, platformY + platformHeight / 2 + lampPostHeight, lampPost.position.z);
    
        const light = new THREE.PointLight(0xffff00, 1, 10);
        if(i % 5 === 0) 
        {
            light.color.set(0x00ff00);
        } 
        else 
        {
            light.color.set(0xffff00);
        }
        light.position.set(lampPost.position.x, platformY + platformHeight / 2 + lampPostHeight, lampPost.position.z);
    
        // Offset positions for correct height
        lampPost.position.y -= 0.5;
        bulb.position.y -= 0.5;
        light.position.y -= 0.5;
    
        // Make the bulb and light face the center
        light.lookAt(0, light.position.y, 0);
        bulb.lookAt(0, bulb.position.y, 0);
    
        scene.add(lampPost);
        scene.add(bulb);
        scene.add(light);
    
        // Position crate on the side of the shorter arc (closer to the inner radius)
        const cratex = Math.cos(angle + sectorAngle / 2) * (sectorInnerRadius + (sectorOuterRadius - sectorInnerRadius) / 4);
        const cratey = platformY + platformHeight / 2 + lampPostHeight / 2 - 0.5;
        const cratez = Math.sin(angle + sectorAngle / 2) * (sectorInnerRadius + (sectorOuterRadius - sectorInnerRadius) / 4);
    
        // Add crate in front of the lamp post, closer to the inner radius
        addCrate(cratex, cratey, cratez);
    }
    
}

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
function animate() {
    requestAnimationFrame(animate);

    // Update the camera controls
    controls.update();

    // Constrain camera's Y position between minHeight and maxHeight
    camera.position.y = Math.min(Math.max(camera.position.y, minHeight), maxHeight);

    // Update circular base's height to match the camera's Y position
    circularBase.position.y = camera.position.y-2;

    // Render the scene with updated camera and base position
    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
