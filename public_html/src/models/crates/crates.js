import * as THREE from 'https://unpkg.com/three@0.153.0/build/three.module.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const colorMap = textureLoader.load('Planks/PlanksColor.jpg');
const aoMap = textureLoader.load('Planks/PlanksAmbientOcclusion.jpg');
const displacementMap = textureLoader.load('Planks/PlanksDisplacement.jpg');
const metalnessMap = textureLoader.load('Planks/PlanksMetalness.jpg');
const normalMapGL = textureLoader.load('Planks/PlanksNormalGL.jpg');
const normalMapDX = textureLoader.load('Planks/PlanksNormalDX.jpg')
const roughnessMap = textureLoader.load('Planks/PlanksRoughness.jpg');

[colorMap, aoMap, displacementMap, metalnessMap, normalMapGL, normalMapDX, roughnessMap].forEach(texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.2, 0.2);
});


const geometry = new THREE.BoxGeometry(2, 2, 2);

const material = new THREE.MeshStandardMaterial({
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
colorMap.encoding = THREE.sRGBEncoding;

const crates = [];

function addCrate(x, y, z) {
    const crate = new THREE.Mesh(geometry, material);
    crate.position.set(x, y, z);
    scene.add(crate);
    crates.push(crate);
}

addCrate(-1, -1, 0);
addCrate(3, 0, 0);
addCrate(-2, 2, 0);

// Add lighting
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
// scene.add(ambientLight);

// const pointLight = new THREE.PointLight(0xffffff, 1);
// pointLight.position.set(5, 5, 5);
// scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Increased ambient light intensity
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.2); // Increased point light intensity
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

pointLight.castShadow = true;
crates.forEach(crate => {
    crate.castShadow = true;
    crate.receiveShadow = true;
});



function animate() {
    requestAnimationFrame(animate);

    crates.forEach(crate => {
        crate.rotation.x += 0.01;
        crate.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});