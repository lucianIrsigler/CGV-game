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
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 40, 0);
scene.add(pointLight);
//----------------------------------------------------------------------

//ADDING OBJECTS TO SCENE-------------------------------------------
const circlePlatformInnerRadius = 0;
const circlePlatformOuterRadius = 18;
const circlePlatformDepth = 1;
const curvedPlatformInnerRadius = 18;
const curvedPlatformOuterRadius = 25;
const curvedPlatformDepth = 1;
const curvedPlatformHeight = 3;
const numberOfPlatforms = 16;
const rotation = Math.PI / 4;
const roomRadius = 30;
const floorDepth = 1;
const ceilingDepth = 1;
const roomHeight = floorDepth + numberOfPlatforms * curvedPlatformHeight + ceilingDepth + 2 * curvedPlatformHeight;
//CURVED PLATFORMS
for (let i = 0; i <= numberOfPlatforms; i++) {
    //Add box and lamp platform where every 4th platform would be
    if (i % 4 === 0) {
        const cpBoxLamp = new CPBoxLamp(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth);
        cpBoxLamp.position.y = i * curvedPlatformHeight;
        cpBoxLamp.rotation.y = i * rotation;
        scene.add(cpBoxLamp);
    } else {
        const curvedPlatform = new CurvedPlatform(curvedPlatformInnerRadius, curvedPlatformOuterRadius, curvedPlatformDepth);
        curvedPlatform.position.y = i * curvedPlatformHeight;
        curvedPlatform.rotation.y = i * rotation;
        scene.add(curvedPlatform);
    }
}
//MOSTERS PLATFORM
const circularPlatform = new CircularPlatform(circlePlatformInnerRadius, circlePlatformOuterRadius, circlePlatformDepth);
scene.add(circularPlatform);
//ROOM FLOOR
const floor = new CircularPlatform(0, roomRadius, floorDepth);
floor.position.y = -1;
scene.add(floor);
//ROOM CEILING
const ceiling = new CircularPlatform(0, roomRadius, ceilingDepth);
ceiling.position.y = roomHeight;
scene.add(ceiling);
//ROOM WALL
const wall = new CircularPlatform(curvedPlatformOuterRadius + curvedPlatformOuterRadius-curvedPlatformInnerRadius, roomRadius, roomHeight);
wall.position.y = roomHeight - 1;
scene.add(wall);
//----------------------------------------------------------------------

//HANDLE WINDOW RESIZE-------------------------------------------------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
//----------------------------------------------------------------------

//ANIMATE--------------------------------------------------------------
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
//----------------------------------------------------------------------
