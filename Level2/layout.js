import * as THREE from 'https://unpkg.com/three@0.153.0/build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { add } from 'three/webgpu';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

//crates
const textureLoader = new THREE.TextureLoader();
const colorMap = textureLoader.load('../public/assets/Planks/PlanksColor.jpg');
const aoMap = textureLoader.load('../public/assets/Planks/PlanksAmbientOcclusion.jpg');
const displacementMap = textureLoader.load('../public/assets/Planks/PlanksDisplacement.jpg');
const metalnessMap = textureLoader.load('../public/assets/Planks/PlanksMetalness.jpg');
const normalMapGL = textureLoader.load('../public/assets/Planks/PlanksNormalGL.jpg');
const normalMapDX = textureLoader.load('../public/assets/Planks/PlanksNormalDX.jpg')
const roughnessMap = textureLoader.load('../public/assets/Planks/PlanksRoughness.jpg');

[colorMap, aoMap, displacementMap, metalnessMap, normalMapGL, normalMapDX, roughnessMap].forEach(texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.2, 0.2);
});


const crateGeometry = new THREE.BoxGeometry(2, 2, 2);

const crateMaterial = new THREE.MeshStandardMaterial({
    map: colorMap,
    aoMap: aoMap,
    displacementMap: displacementMap,
    metalnessMap: metalnessMap,
    //normalMap: normalMapGL,
    normalMap: normalMapDX, 
    roughnessMap: roughnessMap,
    displacementScale: 0,
    metalness: 0.3,
    roughness: roughnessMap
});

// Adjust color map to preserve original color
// colorMap.encoding = THREE.sRGBEncoding;

const crates = [];

function addCrate(x, y, z) {
    const crate = new THREE.Mesh(crateGeometry, crateMaterial);
    crate.position.set(x, y, z);
    scene.add(crate);
    crates.push(crate);
}
addCrate(0, 0, 0);

// Create the circular base (cylinder)
const radiusTop = 5;
const radiusBottom = 15;
const height = 1;
const radialSegments = 32;
const circularBaseGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
const baseMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const circularBase = new THREE.Mesh(circularBaseGeometry, baseMaterial);
circularBase.position.y = -2;  // Move the base below the platforms
scene.add(circularBase);

// Define the number of platforms
const numPlatforms = 30;  // You can change this to set the number of platforms
const sectorInnerRadius = radiusTop + 10;  // Inner radius of the sector - modified to make platforms thinner and further
const sectorOuterRadius = sectorInnerRadius + 5;  // Outer radius of the sector - modified to make platforms wider
const platformHeight = 1;  // Height of each 3D platform
const platformSpacing = 2;  // Vertical distance between each platform
const spiralTurnAngle = Math.PI / 4;  // Angle between consecutive platforms
const sectorAngle = Math.PI / 6;  // Angle of each sector (45 degrees) - modified to make platforms wider, or thinner

// Lamp post details
const lampPostHeight = 2;
const lampPostRadius = 0.1;

// Create the platforms with vertical width and add lamps every second platform
for (let i = 0; i < numPlatforms; i++) {
    const angle = i * spiralTurnAngle;  // Spiral angle for each platform
    const platformY = i * platformSpacing;  // Height of each platform

    // Define the shape of the platform (a sector with a cut-away middle)
    const shape = new THREE.Shape();
    shape.moveTo(Math.cos(angle) * sectorInnerRadius, Math.sin(angle) * sectorInnerRadius);
    shape.lineTo(Math.cos(angle) * sectorOuterRadius, Math.sin(angle) * sectorOuterRadius);
    shape.absarc(0, 0, sectorOuterRadius, angle, angle + sectorAngle, false);
    shape.lineTo(Math.cos(angle + sectorAngle) * sectorInnerRadius, Math.sin(angle + sectorAngle) * sectorInnerRadius);
    shape.absarc(0, 0, sectorInnerRadius, angle + sectorAngle, angle, true);

    // Extrude the shape to give it vertical thickness (3D look)
    const extrudeSettings = {
        depth: platformHeight,
        bevelEnabled: false
    };
    const platformGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const platformMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);

    // Position the platform around the circular base
    platform.rotation.x = Math.PI / 2;  // Rotate to make it horizontal
    platform.position.y = platformY;  // Set height for each platform
    
    scene.add(platform);

    // Add a lamp post to the center of every second platform
    if (i % 3 === 0) {
        const lampPostGeometry = new THREE.CylinderGeometry(lampPostRadius, lampPostRadius, lampPostHeight, 16);
        const lampPostMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
        const lampPost = new THREE.Mesh(lampPostGeometry, lampPostMaterial);

        // Position the lamp post at the center of the platform
        lampPost.position.set(
            Math.cos(angle + sectorAngle / 2) * (sectorInnerRadius + sectorOuterRadius) / 2,
            platformY + platformHeight / 2 + lampPostHeight / 2,  // Adjust Y position to sit on top of the platform
            Math.sin(angle + sectorAngle / 2) * (sectorInnerRadius + sectorOuterRadius) / 2
        );

        // Create a light bulb at the top (sphere or light)
        const bulbGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.set(lampPost.position.x, platformY + platformHeight / 2 + lampPostHeight, lampPost.position.z);

        // Add a light (optional, but adds realism)
        const light = new THREE.PointLight(0xffff00, 1, 10);
        light.position.set(lampPost.position.x, platformY + platformHeight / 2 + lampPostHeight, lampPost.position.z);

        lampPost.position.y = lampPost.position.y - 0.5;  // Adjust the Y position of the lamp post
        bulb.position.y = bulb.position.y - 0.5;  // Adjust the Y position of the bulb
        light.position.y = light.position.y - 0.5;  // Adjust the Y position of the light
        light.intensity = 1 + Math.sin(Date.now() * 0.002) * 0.5;  // Simple pulsing effect

        // Add the lamp post, bulb, and light to the scene
        scene.add(lampPost);
        scene.add(bulb);
        scene.add(light);
        addCrate(lampPost.position.x-1.5, lampPost.position.y, lampPost.position.z);
    }
}

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

    controls.update(); // Update the controls

    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
