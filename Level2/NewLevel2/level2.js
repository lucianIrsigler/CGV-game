// layout.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CurvedPlatform } from './curvedPlatform.js';
import { CPBoxLamp } from './CPBoxLamp.js';
import { CircularPlatform } from './circularPlatform.js';

//SCENE AND RENDERER---------------------------------------------------
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//----------------------------------------------------------------------

//CAMERA AND CONTROLS--------------------------------------------------
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 50);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
//----------------------------------------------------------------------

//LIGHTING--------------------------------------------------------------
const ambientLight = new THREE.AmbientLight(0x404040);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 10, 10).normalize();
scene.add(ambientLight, directionalLight);
//----------------------------------------------------------------------

//ADDING OBJECTS TO SCENE-------------------------------------------
const innerRadius = 18;
const outerRadius = 25;
const height = 3;
const numberOfPlatforms = 16;
const rotation = Math.PI / 4;
for (let i = 0; i <= numberOfPlatforms; i++) 
    {
    if (i % 4 === 0) {
        const cpBoxLamp = new CPBoxLamp(innerRadius, outerRadius);
        cpBoxLamp.position.y = i * height;
        cpBoxLamp.rotation.y = i * rotation;
        scene.add(cpBoxLamp);
    } 
    else 
    {
        const curvedPlatform = new CurvedPlatform(innerRadius, outerRadius);
        curvedPlatform.position.y = i * height;
        curvedPlatform.rotation.y = i * rotation;
        scene.add(curvedPlatform);
    }
}
const circPlatform = new CircularPlatform(innerRadius);
scene.add(circPlatform);
//----------------------------------------------------------------------

// Handle Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

//ANIMATE--------------------------------------------------------------
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
//----------------------------------------------------------------------
