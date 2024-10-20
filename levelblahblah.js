import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';  // Correct ES6 import
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as cameraWrapper from "./camera";
import * as misc from "./misc";
import * as character from "./character";

const gameOverScreen = document.getElementById("gameOverScreen");
const restartButton = document.getElementById("restartButton");
let points = [];
let highestVelocity = 0.15;

let scene, camera, renderer, controls;
let model1;
let animationFrameId;
let levelContinue = false;
let mixer;
let player;


function initializePlayer(model) {
    player = new character.CharacterModel(model);
    player.setPosition({ x: 0, y: 0.5, z: 0 });
    // Start any animations or further setup needed for the player here
}



export function initLevel4() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);

    // Camera setup
    // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera = new cameraWrapper.CameraClass( new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000))

    camera.setOffset({x:0,y:5,z:-8}); 
    camera.setPosition({x:0, y:0, z:-8});
    camera.setRotation({x:0,y:0,z:0});


    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled=true;
    document.body.appendChild(renderer.domElement);

    // OrbitControls for the camera
    controls = new OrbitControls(camera.camera, renderer.domElement);  // Correct usage
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const loader = new GLTFLoader();

    let AmbientLight = new THREE.AmbientLight(0xFFFFFF,100000);
    scene.add(AmbientLight);


    loader.load("./public/assets/hollow_knight/scene.glb", function (gltf) {
        model1 = gltf.scene;
        scene.add(model1);  // Add the loaded model to the scene
        model1.rotation.set(0, Math.PI, 0); 
        model1.scale.set(1,1,1);     // Optional: Set scale of the model
        model1.name="player";

        initializePlayer(model1);
        // mixer = new THREE.AnimationMixer(model1);

        // const action = mixer.clipAction(gltf.animations[0]);
        // action.setLoop(THREE.LoopOnce);
        // action.clampWhenFinished = true;  // This makes sure the animation stays on the last frame when finished

        // // Start the action
        // action.play();

        // // Event listener to detect when the animation is finished
        // action.onFinished = function() {
        //     console.log('Animation finished');
        //     // Optional: you can remove the model or reset it here
        // };
    }, undefined, function (error) {
        console.error('An error happened', error);  // Handle error if loading fails
    });


    const sideWallGeometry = new THREE.BoxGeometry(50, 1, 10);
    const sideWallMaterial = new THREE.MeshStandardMaterial({ color: 0x7ca687 });
    const platformGeometry = new THREE.BoxGeometry(100, 1, 50);
    const platformMaterial = new THREE.MeshStandardMaterial({ color: 0xa6baab });



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

    const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
    scene.add(ambientLight);



    let platforms = [
        {geometry:platformGeometry, material:platformMaterial,position:{x:0,y:-0.5,z:20}}, //bot
        // {geometry:platformGeometry, material:platformMaterial,position:{x:0,y:5,z:20}}, //top
        // {geometry:sideWallGeometry, material:sideWallMaterial,position:{x:0,y:2,z:-5},rotation:{x:Math.PI/2,y:0,z:0}},//back
        // {geometry:sideWallGeometry, material:sideWallMaterial,position:{x:0,y:2,z:-5},rotation:{x:Math.PI/2,y:0,z:0}}, //right
        // {geometry:sideWallGeometry, material:sideWallMaterial,position:{x:5,y:0.8,z:15},rotation:{x:Math.PI/2,y:0,z:Math.PI / 2}} //left
    ]
    
    platforms.forEach((platform)=>{
        misc.generatePlatform(platform,scene);
    })
    
    scene.background = new THREE.Color(0x333333);
    
    // Camera setup

    function onKeyDown(event) {
        switch (event.code) {
          case "ArrowUp":
            player.moveForward = true;
            break;
          case "ArrowDown":
            player.moveBackward = true;
            break;
          case "ArrowLeft":
            player.rotateLeft = true;
            break;
          case "ArrowRight":
            player.rotateRight = true;
            break;
          case "Space":
            if (!player.isJumping()) {
                player.setJumping(true);
              console.log("HERE");
              player.velocityY = highestVelocity; // Set initial jump velocity
            }
            break;
          case "KeyQ":
            createFallingSphere();
            break;
        }
      }
    
    function onKeyUp(event) {
    switch (event.code) {
        case "ArrowUp":
            player.moveForward = false;
        break;
        case "ArrowDown":
            player.moveBackward = false;
        break;
        case "ArrowLeft":
            player.rotateLeft = false;
        break;
        case "ArrowRight":
            player.rotateRight = false;
        break;
    }
    }
    
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    

    function restartGame() {
        // gameOverScreen.style.display = "none";
        // player.setPosition({x:0, y:0.5, z:0});
        // camera.setPosition({x:0, y:1, z:0});
        // player.setRotation({x:player.rotation.x,y:Math.PI,z:player.rotation.z});
    }
    
    restartButton.addEventListener("click", restartGame);
    levelContinue = true;
}

export function disposeLevel(){
    if (!scene) return;

    // Stop the current animation loop
    cancelAnimationFrame(animationFrameId);

    // Remove all objects from the scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // Clean up the renderer
    renderer.dispose();
    try{
        document.body.removeChild(renderer.domElement);
    }catch(e){
        
    }

    levelContinue = false;
}

const clock = new THREE.Clock();

export function animateLevel4() {
    if (levelContinue) {
        animationFrameId = requestAnimationFrame(animateLevel4);
    }

    if (mixer!=undefined){
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);
    }

    if (player!=undefined){
        player.updatePlayerPosition();
        camera.setPosition(player.getPosition());
        camera.setRotation(player.getRotation());
    }
    renderer.render(scene, camera.camera);
    
}

export function level4() {
    disposeLevel();
    initLevel3();
    animateLevel3();
}
