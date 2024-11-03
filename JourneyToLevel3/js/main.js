import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { loadTextures, applyTextureSettings } from './TextureLoaderUtil.js';

// import * as THREE from 'https://unpkg.com/three@0.153.0/build/three.module.js';
// import { OrbitControls } from 'https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js';
// import * as dat from 'https://unpkg.com/dat.gui@0.7.7/build/dat.gui.module.js';
// import { GLTFLoader } from 'https://unpkg.com/three@0.153.0/examples/jsm/loaders/GLTFLoader.js';
// import { loadTextures, applyTextureSettings } from './TextureLoaderUtil.js';

const textureLoader = new THREE.TextureLoader()

let allModelsLoaded = false;





const carUrl = new URL('../assets/car.glb', import.meta.url)
const duckUrl = new URL('../assets/duck.glb', import.meta.url)
const halloweenBackgroundUrl = new URL('../img/Halloween-Background-Horror-Theme-Graphics.png', import.meta.url)
// const halloweenBackgroundUrl = new URL('../img/spooky_house.jpg', import.meta.url)
// const halloweenBackgroundUrl = new URL('../img/spooky_trees.jpg', import.meta.url)
const bricksTexture = new URL('../img/bricks-texture.jpg', import.meta.url)



let grounds = []
let gameStarted = false
let duckModel
let lastGround

let followOffset = new THREE.Vector3(0, 6, 20);

/*
stage 0: Nothing,
stage 1: 
    * Light moves forward fast, on its own.
    * Stay within light.
stage 2: 
    * Light now follows you.
    * Boulders start to fall.
stage 3: 
    * Light now follows you. 
    * Grounds start to descend. 
    * Boulders continue to fall.
stage 4: 
    * Arrive on large solid ground. 
    * Light moves foward, and randomly left and right.
    * Stay in the light.
    * Boulders continue to fall, in larger amounts.
*/
let stage = 0
let spawnBoulders = true
let lightFollowsDuck = false
let groundsDescend = false
let groundsOscilate = false
let allowHaunting = true

let boulderCanDamage = true

//#region NON THREE utilities =========================
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
//#endregion NON THREE utilities =========================

//#region INITIALIZATION =========================

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)

const orbit = new OrbitControls(camera, renderer.domElement)

const axesHelper = new THREE.AxesHelper(6)
scene.add(axesHelper)

const gridHelper = new THREE.GridHelper(100, 100)
scene.add(gridHelper)

camera.position.set(-10, 30, 30)
orbit.update()

renderer.setClearColor(0x00fffff)

// scene.background = textureLoader.load(halloweenBackgroundUrl)

//make the scene have light dark background
scene.background = new THREE.Color(0x222222)

//#endregion

//#region Model Imports =========================
const loader = new GLTFLoader();

let playerModel;
loader.load(
    'js/cute_alien_character/scene.gltf',
    function (gltf) {
        // `gltf.scene` is the root of the loaded model
        playerModel = gltf.scene;
        scene.add(playerModel);

        // Optional: Set the model's position, scale, rotation
        playerModel.position.set(0, 0, 0);
        playerModel.scale.set(5, 5, 5);

        // Optional: Enable shadow casting for the model
        playerModel.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });



    },
    undefined, // Progress function (optional)
    function (error) {
        console.error('An error occurred while loading the model:', error);
    }
);

let manorTorch
loader.load(
    'assets/manor_torch/scene.gltf',
    function (gltf) {
        // `gltf.scene` is the root of the loaded model
        manorTorch = gltf.scene;
        scene.add(manorTorch);

        // Optional: Set the model's position, scale, rotation
        manorTorch.position.set(0, 0, 0);
        manorTorch.scale.set(0.4, 0.4, 0.4);

        // Optional: Enable shadow casting for the model
        manorTorch.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });



    },
    undefined, // Progress function (optional)
    function (error) {
        console.error('An error occurred while loading manor torch:', error);
    }
);

// Scary faces
let horrorMask;
loader.load(
    'assets/horror_mask/scene.gltf',
    function (gltf) {
        // `gltf.scene` is the root of the loaded model
        horrorMask = gltf.scene;
        scene.add(horrorMask);

        // Optional: Set the model's position, scale, rotation
        horrorMask.position.set(0, 10, -15);
        horrorMask.scale.set(80, 60, 80);

        // Optional: Enable shadow casting for the model
        horrorMask.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        horrorMask.visible = false;
    },
    undefined, // Progress function (optional)
    function (error) {
        console.error('An error occurred while loading horror mask:', error);
    }
);
let pumpkinHalloween;
loader.load(
    'assets/pumpkin_halloween_face/scene.gltf',
    function (gltf) {
        // `gltf.scene` is the root of the loaded model
        pumpkinHalloween = gltf.scene;
        scene.add(pumpkinHalloween);

        // Optional: Set the model's position, scale, rotation
        pumpkinHalloween.position.set(0, 12, -15);
        pumpkinHalloween.scale.set(30, 30, 30);
        pumpkinHalloween.rotation.set(0, -Math.PI / 2, 0);

        // Optional: Enable shadow casting for the model
        pumpkinHalloween.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        pumpkinHalloween.visible = false;
    },
    undefined, // Progress function (optional)
    function (error) {
        console.error('An error occurred while loading pumpkin halloween:', error);
    }
);
let scaryAsianMask;
loader.load(
    'assets/scary_asian_mask/scene.gltf',
    function (gltf) {
        // `gltf.scene` is the root of the loaded model
        scaryAsianMask = gltf.scene;
        scene.add(scaryAsianMask);

        // Optional: Set the model's position, scale, rotation
        scaryAsianMask.position.set(0, 12, -15);
        scaryAsianMask.scale.set(30, 30, 30);
        scaryAsianMask.rotation.set(0, -Math.PI / 2, 0);

        // Optional: Enable shadow casting for the model
        scaryAsianMask.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        scaryAsianMask.visible = false;
    },
    undefined, // Progress function (optional)
    function (error) {
        console.error('An error occurred while loading pumpkin halloween:', error);
    }
);
let scaryFace;
loader.load(
    'assets/scary_face/scene.gltf',
    function (gltf) {
        // `gltf.scene` is the root of the loaded model
        scaryFace = gltf.scene;
        scene.add(scaryFace);

        // Optional: Set the model's position, scale, rotation
        scaryFace.position.set(0, 14, -15);
        scaryFace.scale.set(600, 600, 600);

        // Optional: Enable shadow casting for the model
        scaryFace.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });

        scaryFace.visible = false;
    },
    undefined, // Progress function (optional)
    function (error) {
        console.error('An error occurred while loading pumpkin halloween:', error);
    }
);

let scaryFaces = [] // will add after all are laoded
let currentScaryFace = 1;

const allFacesLoaded = () => {
    return horrorMask && pumpkinHalloween && scaryAsianMask && scaryFace
}


//audio

const cryOutrage = new Audio('../assets/jumpscare_sounds/cryo_outage-94622.mp3');
const echoJumpscare = new Audio('../assets/jumpscare_sounds/echo-jumpscare-80933.mp3');
const fuzzyJumpscare = new Audio('../assets/jumpscare_sounds/fuzzy-jumpscare-80560.mp3');
const jumpscareSound = new Audio('../assets/jumpscare_sounds/jumpscare_sound-95043.mp3');
const squeakyJumpscare = new Audio('../assets/jumpscare_sounds/squeaky-jumpscare-2-102254.mp3');
let jumpScareSounds = [];

const allJumpScareAudioLoaded = () => {
    return jumpScareSounds.every(sound => sound.readyState == 4);
}

//#endregion Model Imports =========================

// Lava

let lavaWidth = 400;
let lavaHeight = lavaWidth * 4;

const lavaTexture = textureLoader.load('../img/Lava005_4k/Lava005_4K-JPG_Color.jpg'); // Base color
const lavaNormal = textureLoader.load('../img/Lava005_4k/Lava005_4K-JPG_NormalGL.jpg'); // Normal map (OpenGL)
const lavaDisplacement = textureLoader.load('../img/Lava005_4k/Lava005_4K-JPG_Displacement.jpg'); // Displacement map
const lavaEmission = textureLoader.load('../img/Lava005_4k/Lava005_4K-JPG_Emission.jpg'); // Emission map
const lavaRoughness = textureLoader.load('../img/Lava005_4k/Lava005_4K-JPG_Roughness.jpg'); // Roughness map

// Set wrapping mode and repeat for each texture
[lavaTexture, lavaNormal, lavaDisplacement, lavaEmission, lavaRoughness].forEach(texture => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(lavaWidth / 8, lavaHeight / 8); // Adjust repeat values as needed
});

const lavaGeometry = new THREE.PlaneGeometry(lavaWidth, lavaHeight); // Large plane
const lavaMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: lavaTexture,
    normalMap: lavaNormal,
    displacementMap: lavaDisplacement,
    displacementScale: 0.1,
    emissiveMap: lavaEmission,
    roughnessMap: lavaRoughness,
    metalness: 0.1,
    roughness: 0.5
});

const lava = new THREE.Mesh(lavaGeometry, lavaMaterial);
let lavaYPosition = -30;
lava.rotation.x = -Math.PI / 2; // Position it horizontally
lava.position.y = lavaYPosition; // Adjust based on ground height
scene.add(lava);

lavaMaterial.emissive = new THREE.Color(0xff4500); // Intense orange/red glow
lavaMaterial.emissiveIntensity = 0.5; // Adjust for glow effect
// END Lava

//#region LIGHTING =========================

const isHitBySpotlight = (spotlight, objectPosition) => {
    // Step 1: Get the spotlight's position and direction
    const spotlightPosition = new THREE.Vector3();
    spotlight.getWorldPosition(spotlightPosition); // Get spotlight's world position

    const spotlightTargetPosition = new THREE.Vector3();
    spotlight.target.getWorldPosition(spotlightTargetPosition); // Get spotlight target position

    const spotlightDirection = new THREE.Vector3().subVectors(spotlightTargetPosition, spotlightPosition).normalize(); // Spotlight direction vector

    // Step 2: Calculate vector from spotlight to the object
    const objectVector = new THREE.Vector3().subVectors(objectPosition, spotlightPosition); // Vector from spotlight to object

    // Step 3: Normalize the vector to the object to get its direction
    const objectDirection = objectVector.clone().normalize();

    // Step 4: Compute the angle between the spotlight direction and the object's direction
    const angleBetween = spotlightDirection.angleTo(objectDirection);

    // Step 5: Check if the object is within the spotlight's cone angle
    const spotlightConeAngle = spotlight.angle; // Spotlight cone angle in radians
    if (angleBetween > spotlightConeAngle) {
        return false; // Object is outside the spotlight cone
    }

    // Step 6: Check if the object is within the spotlight's distance range
    const objectDistance = objectVector.length(); // Distance between spotlight and object
    const spotlightMaxDistance = spotlight.distance; // Spotlight max range

    if (spotlightMaxDistance > 0 && objectDistance > spotlightMaxDistance) {
        return false; // Object is outside the spotlight's range
    }

    // The object is within the spotlight's cone and distance
    return true;
}

const spotLightTargetLastStage = new THREE.Object3D();
spotLightTargetLastStage.position.set(0, 0, 0); // Pointing downwards towards the ground
scene.add(spotLightTargetLastStage);


const spotLightLastStageFollowSpeed = 0.3;  // 0.3 is normal

// This function smoothly moves the object to the target
function oscilateXSpotLight(deltaTime) {

    // Set the spotlight to point directly down
    spotLight.target.position.set(spotLight.position.x, spotLight.position.y - 100, spotLight.position.z);
    scene.add(spotLight.target);  // Make sure the target is added to the scene


    options.angle = 0.35;

    spotLightTargetLastStage.position.y = spotLightTarget.position.y;  // New random target between -10 and 10
    spotLightTargetLastStage.position.z = spotLightTarget.position.z;  // New random target between -10 and 10

    // If the object is close to the target, pick a new random target
    if (Math.abs(spotLight.position.x - spotLightTargetLastStage.position.x) < 5) {
        if (getRandomNumber(1, 10) <= 5) {
            spotLightTargetLastStage.position.x = getRandomNumber(lastGround.left, lastGround.position.x);  // New random target between -10 and 10
        } else {
            spotLightTargetLastStage.position.x = getRandomNumber(lastGround.position.x, lastGround.right);  // New random target between -10 and 10
        }
    }

    // move light towards target
    if (spotLight.position.x < spotLightTargetLastStage.position.x) {
        spotLight.position.x += spotLightLastStageFollowSpeed;
    } else if (spotLight.position.x > spotLightTargetLastStage.position.x) {
        spotLight.position.x -= spotLightLastStageFollowSpeed;
    }

    // // Optional: if you want exact positioning, snap to target when very close
    // if (Math.abs(spotLight.position.x - spotLightTargetLastStage.position.x) < 0.01) {
    //     spotLight.position.x = spotLightTargetLastStage.position.x;  // Snap to target to prevent tiny oscillations
    // }
}


const ambientLight = new THREE.AmbientLight(0xfffffff, 0.05)
scene.add(ambientLight)

const spotLightTarget = new THREE.Object3D();
spotLightTarget.position.set(0, 0, 0); // Pointing downwards towards the ground
scene.add(spotLightTarget);

const spotLight = new THREE.SpotLight(0xffffff, 10000)
scene.add(spotLight)
spotLight.position.set(-20, 100, 0)
spotLight.castShadow = true

spotLight.target = spotLightTarget
spotLight.position.z = spotLightTarget.position.z

const spotLightSpeed = 50 // 50

const sLightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(sLightHelper)

// scene.fog = new THREE.Fog(0xffffff, 0, 200)
scene.fog = new THREE.FogExp2(0xffffff, 0.005)

//#endregion LIGHTING =========================

//#region OBJECTS =========================

const duckGroundCollission = ({ duck, ground }) => {
    const xCollision = duck.right >= ground.left && duck.left <= ground.right
    const yCollision = duck.top >= ground.bottom && duck.bottom + duck.velocity.y <= ground.top
    const zCollision = duck.front >= ground.back && duck.back <= ground.front

    return xCollision && yCollision && zCollision
}

function boxCollision({ box1, box2 }) {
    const xCollision = box1.right >= box2.left && box1.left <= box2.right;
    const yCollision = box1.bottom <= box2.top && box1.top >= box2.bottom;
    const zCollision = box1.front >= box2.back && box1.back <= box2.front;

    return xCollision && yCollision && zCollision;
}



// class Body extends THREE.Mesh {
//     constructor({ desiredHeight, color = '#00ff00', position = { x: 0, y: 0, z: 0 } }) {




class Box extends THREE.Mesh {
    constructor({ width, height, depth, color = '#00ff00', gravity = 0, xAcceleration = false, zAcceleration = false, maxZSpeed = 4, maxXSpeed = 4, isGround = false, velocity = {
        x: 0,
        y: 0,
        z: 0
    }, position = { x: 0, y: 0, z: 0 } }) {
        super(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshStandardMaterial({ color: color }),

        )
        this.height = height
        this.width = width
        this.depth = depth

        this.velocity = velocity

        this.position.set(position.x, position.y, position.z)

        this.right = this.position.x + this.width / 2
        this.left = this.position.x - this.width / 2
        this.bottom = this.position.y - this.height / 2
        this.top = this.position.y + this.height / 2
        this.front = this.position.z + this.depth / 2
        this.back = this.position.z - this.depth / 2

        this.zAcceleration = zAcceleration
        this.xAcceleration = xAcceleration

        this.zSpeed = 0.01
        this.xSpeed = 0.01

        this.maxZSpeed = maxZSpeed
        this.maxXSpeed = maxXSpeed

        this.gravity = gravity * 120
        this.bounceHeight = 0.5
        this.terminalGravityVelocity = -40

        this.velocity.z = this.velocity.z * 120

    }

    updateSides() {
        this.right = this.position.x + this.width / 2
        this.left = this.position.x - this.width / 2

        this.bottom = this.position.y - this.height / 2
        this.top = this.position.y + this.height / 2

        this.front = this.position.z + this.depth / 2
        this.back = this.position.z - this.depth / 2
    }

    updateMovement(deltaTime) {

        if (this.zAcceleration) {
            this.velocity.z = Math.min(this.maxZSpeed, this.velocity.z + this.zSpeed)
        }
        this.position.z += this.velocity.z

        if (this.xAcceleration) {
            this.velocity.x = Math.min(this.maxXSpeed, this.velocity.x + this.xSpeed)
        }
        this.position.x += this.velocity.x
    }

    update(deltaTime) {
        this.updateSides()

        this.updateMovement(deltaTime)

        // grounds.forEach(ground => {
        this.applyGravity(deltaTime)
        // })
    }

    applyGravity(deltaTime) {

        this.velocity.y += this.gravity * deltaTime

        // Limit fall speed to terminal velocity
        this.velocity.y = Math.max(this.velocity.y, this.terminalGravityVelocity);

        let collision = false
        let collidedGround = null

        for (let ground of grounds) {
            if (duckGroundCollission({ duck: this, ground: ground })) {
                collision = true
                collidedGround = ground
                break
            }
        }

        if (collision && collidedGround) {
            // Only reverse direction if the object is moving downward
            if (this.velocity.y < 0) {
                this.velocity.y = -this.velocity.y * this.bounceHeight // Reduce bounce height
                // this.velocity.y = -this.velocity.y * 1 // Reduce bounce height
            }
            // Ensure the object doesn't sink into the ground
            this.position.y = collidedGround.position.y + collidedGround.height / 2 + this.height / 2

            // Add a small upward velocity to help it overcome the ground
            this.velocity.y += 0.01
        } else {
            this.position.y += this.velocity.y
        }

        // Add a minimum velocity threshold to stop tiny bounces
        if (Math.abs(this.velocity.y) < 0.01) {
            this.velocity.y = 0
        }
    }

}
class Ground extends Box {
    constructor({
        width, height, depth,
        color = '#00ff00',
        gravity = 0,
        zAcceleration = false,
        velocity = { x: 0, y: 0, z: 0 },
        position = { x: 0, y: 0, z: 0 }
    }) {
        super({
            width: width,
            height: height,
            depth: depth,
            color: color,
            gravity: gravity,
            zAcceleration: zAcceleration,
            velocity: velocity,
            position: position
        });

        this.material = new THREE.MeshStandardMaterial({ map: textureLoader.load(bricksTexture) });
        //adjust repeat
        this.material.map.wrapS = THREE.RepeatWrapping;
        this.material.map.wrapT = THREE.RepeatWrapping;
        this.material.map.repeat.set(width / 16, depth / 16);

        // Flags and properties to control descent
        this.isDescending = false;
        this.descentSpeed = 0.04; // Speed at which the ground descends


        // Oscilating ground left and right
        this.oscilatingSpeed = getRandomNumber(0.1, 0.3); // 0.1 is normal speed
        this.oscilatingRange = getRandomNumber(this.width, this.width * 2); // 5 is normal
        this.allowOscilation = groundsOscilate;

        this.originalX = this.position.x;
        this.originalY = this.position.y;
        this.originalZ = this.position.z;
    }

    update() {
        this.oscilateX()
        this.updateDescent();
    }

    // Function to start the descent
    startDescent() {
        if (!groundsDescend) return
        if (this == lastGround) return;

        this.material = new THREE.MeshStandardMaterial({ color: '#ff0000' });

        setTimeout(() => {
            this.isDescending = true;
        }, 1000);

    }

    startOscilationX() {
        if (!groundsOscilate) return

        this.allowOscilation = true;
    }

    stopOscilationX() {
        this.allowOscilation = false;
    }

    oscilateX() {
        if (this.allowOscilation) {
            this.position.x += this.oscilatingSpeed;
            if (this.position.x > this.originalX + this.oscilatingRange) {
                this.oscilatingSpeed = -this.oscilatingSpeed;
            }
            if (this.position.x < -(this.originalX + this.oscilatingRange)) {
                this.oscilatingSpeed = -this.oscilatingSpeed;
            }
        }
    }

    // Function to stop the descent
    stopDescent() {
        this.isDescending = false;
    }

    // Function to update descent, called continuously in the animation loop
    updateDescent() {
        if (this.isDescending) {
            this.position.y -= this.descentSpeed;  // Lower the ground along the y-axis
            // accelerate
            this.descentSpeed += 0.0008;
            this.updateInteractionBounds();  // Update the boundaries as the ground moves
        }
    }

    // Update interaction bounds (top, bottom, left, right)
    updateInteractionBounds() {
        // Updating the ground's bounding box based on its new position
        this.bottom = this.position.y - this.height / 2;
        this.top = this.position.y + this.height / 2;
        this.left = this.position.x - this.width / 2;
        this.right = this.position.x + this.width / 2;

        // Check if anything else (e.g., character) needs to interact with the new ground position
        // this.checkCharacterInteraction();
    }

}


class Boulder extends Box {
    constructor({ radius, color = '#D2691E', gravity = 0, zAcceleration = false, velocity = {
        x: 0,
        y: 0,
        z: 0
    }, position = { x: 0, y: 0, z: 0 } }) {
        super({
            width: radius * 2,
            height: radius * 2,
            depth: radius * 2,
            color: color,
            gravity: gravity,
            zAcceleration: zAcceleration,
            velocity: velocity,
            position: position
        });

        // Override the geometry to be a sphere instead of a box
        this.geometry = new THREE.SphereGeometry(radius, 10, 10);
        this.material = new THREE.MeshStandardMaterial({ color: color });

        this.radius = radius;

        this.zSpeed = 0.2;
    }

    // Optionally override methods or add new ones specific to Boulder
}

let groundHeight = 2;
let groundWidth = 40;
let groundDepth = 60;

let lastStageGroundWidth = groundWidth * 4
let lastStageGroundDepth = groundDepth * 15
let lastStageGroundHeight = groundHeight * 2

let groundGap = 15
let groundYDisplacement = 5
let groundXDisplacement = groundWidth * 2
let groundZLocationTracker = groundDepth / 2;

let numGroundsTracker = 0

let maxGroundsAllowed = 40;

let previousGroundX = 0
let previousGroundY = groundYDisplacement

const createGrounds = (numGrounds = 10) => {


    if (numGroundsTracker >= maxGroundsAllowed) {
        return
    } else if (numGroundsTracker + numGrounds > maxGroundsAllowed) {
        numGrounds = maxGroundsAllowed - numGroundsTracker
    }

    numGroundsTracker += numGrounds

    for (let i = 0; i < numGrounds; i++) {

        // must be random values from previousGroundX - groundXDisplacement to previousGroundX + groundXDisplacement
        let currentX = getRandomNumber(previousGroundX - groundXDisplacement, previousGroundX + groundXDisplacement)
        let currentY = getRandomNumber(previousGroundY - groundYDisplacement, previousGroundY + groundYDisplacement)
        let currentZ = groundZLocationTracker

        //  if last ground
        if (numGroundsTracker == maxGroundsAllowed && i == numGrounds - 1) {
            groundWidth = lastStageGroundWidth
            groundDepth = lastStageGroundDepth
            groundHeight = lastStageGroundHeight

            // make sure to position it at the end of the last ground
            currentZ = grounds[grounds.length - 1].back - ((lastStageGroundDepth / 2) + groundGap)
        }

        const ground = new Ground({
            width: groundWidth,
            height: groundHeight,
            depth: groundDepth,
            color: '#ffffff',
            position: {
                x: i == 0 ? 0 : currentX,
                y: i == 0 ? 0 : currentY,
                z: i == -groundZLocationTracker / 2 ? 0 : currentZ
            }
        })

        // if last ground
        if (numGroundsTracker == maxGroundsAllowed && i == numGrounds - 1) {

            const platformTexture = loadTextures('PavingStones');
            applyTextureSettings(
                platformTexture,
                lastStageGroundWidth / lastStageGroundWidth,
                lastStageGroundDepth / lastStageGroundWidth
            );

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



            lastGround = ground
            lastGround.material = platformMaterial
            // lastGround.material = new THREE.MeshStandardMaterial({ color: '#FFFF00' });
        }

        scene.add(ground)
        grounds.push(ground)

        previousGroundX = ground.position.x
        previousGroundY = ground.position.y

        groundZLocationTracker -= groundDepth + groundGap

    }


}

createGrounds(2)

// make a duck model an rectangular box
duckModel = new Box({
    width: 4,
    height: 8,
    depth: 4,
    color: '#ff0000',
    gravity: -0.02,
    position: { x: 0, y: 20, z: 0 }
})
scene.add(duckModel)
duckModel.visible = false


//#endregion OBJECTS =========================

//#region GUI HELPER =========================
const gui = new dat.GUI()


const options = {
    sphereColor: '#00ff00',
    wireframe: false,
    speed: 0.01,
    angle: 0.4,
    penumbra: 0,
    intensity: 4000,
    firstPerson: false,
    followDuck: true,

}

gui.add(options, 'speed', 0.01, 0.1)

gui.add(options, 'angle', 0, 1)
gui.add(options, 'penumbra', 0, 1)
gui.add(options, 'intensity', 0, 10000)

gui.add(options, 'followDuck').onChange((value) => {
    followDuck = value
})

gui.add(options, 'firstPerson').onChange((value) => {
    if (value) {
        // First-person view: slightly above the duck's head and no backward offset
        followOffset = new THREE.Vector3(0, 1.5, -4);
        // duckModel.visible = false;
    } else {
        // Third-person view: behind and slightly above the duck
        followOffset = new THREE.Vector3(0, 6, 20);
        // duckModel.visible = true;
    }
});


//#endregion GUI HELPER =========================

//#region ANIMATE and EVENTS =========================


let step = 0

const mousePosition = new THREE.Vector2()

window.addEventListener('mousemove', (e) => {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1
})

const rayCaster = new THREE.Raycaster()

// --------------------------

const boulders = []
let frames = 0
let spawnRate = 10
let followDuck = true

let previousTime = 0;
let interval = 2000;

let lastDescendingGround = 0;

let originalDuckMovementSpeed = 100 // 10000 is normal speed
let maxDuckMovementSpeed = 400 // 40000 is max speed
let duckAcceleration = 10
let duckMovementSpeed = originalDuckMovementSpeed

let stageDuration = 5000
let previousLevelTime = 0

let jumpScareDuration = 2000
let previousJumpScareTime = 0

let spotLightFollowSpeed = 50

const clock = new THREE.Clock()

const animate = (time) => {

    if (playerModel && duckModel && manorTorch && horrorMask && allFacesLoaded()) {
        allModelsLoaded = true
        if (scaryFaces.length == 0) {
            scaryFaces = [horrorMask, pumpkinHalloween, scaryAsianMask, scaryFace];

            scaryFaces.forEach(face => {
                face.lookAt(playerModel.position);
            })
        }

        // make each face follow player, keeping their original rotations applied when initially loaded
        if (getRandomNumber(0, 10) < 5) {
            // face will be to the right
            scaryFaces.forEach(face => {
                face.position.copy(duckModel.position)
                    .add(new THREE.Vector3(15, 8, -20)); // Offset
                face.lookAt(playerModel.position);
            })
            pumpkinHalloween.rotation.set(0, -(Math.PI / 1.5), 0);
            scaryAsianMask.rotation.set(0, -(Math.PI / 1.5), 0);
        } else {
            // face will be to the left
            scaryFaces.forEach(face => {
                face.position.copy(duckModel.position)
                    .add(new THREE.Vector3(-15, 8, -20)); // Offset
                face.lookAt(playerModel.position);
            })
            pumpkinHalloween.rotation.set(0, -(Math.PI / 2.5), 0);
            scaryAsianMask.rotation.set(0, -(Math.PI / 2.5), 0);
        }


    }

    if (allJumpScareAudioLoaded) {
        jumpScareSounds = [cryOutrage, echoJumpscare, fuzzyJumpscare, jumpscareSound, squeakyJumpscare];
    }



    if (!allModelsLoaded) {
        document.querySelector('.start-level-button').textContent = 'Waiting for models to load...'
        document.querySelector('.start-level-button').disabled = true
    } else {
        document.querySelector('.start-level-button').textContent = 'Start the test!!'
        document.querySelector('.start-level-button').disabled = false
    }

    if (lava) {
        // Base texture flow
        lavaTexture.offset.x += 0.005;
        lavaTexture.offset.y += 0.002;

        // Normal map for dynamic surface appearance
        lavaNormal.offset.x += 0.007;
        lavaNormal.offset.y += 0.005;

        // Emission map for glowing movement
        lavaEmission.offset.x += 0.01;
        lavaEmission.offset.y += 0.005;

        // make lava move with character
        lava.position.z = duckModel.position.z
        lava.position.x = duckModel.position.x
    }

    if (gameStarted) {

        // Ensure playerModel and duckModel are loaded before accessing their properties
        if (playerModel && duckModel) {
            playerModel.position.copy(duckModel.position).add(new THREE.Vector3(0, playerModel.scale.x / 2, 0)); // Offset 
            playerModel.rotation.copy(duckModel.rotation);
            playerModel.rotation.y = Math.PI; // Ensure it faces away

            // if (scaryFaces[currentScaryFace]) {
            //     // make the scary face follow the duck 
            //     scaryFaces[currentScaryFace].position.copy(duckModel.position)
            //         .add(new THREE.Vector3(10, 0, -20)); // Offset

            //     // horror mask must still face player while being offset on x axis
            //     scaryFaces[currentScaryFace].lookAt(playerModel.position);
            // }


        }

        // Ensure manorTorch is loaded and follow light
        if (manorTorch) {
            manorTorch.position.copy(spotLight.position);
            manorTorch.position.y += 5; // Offset by 5 units up
            manorTorch.rotation.z = Math.PI; // ensure it faces down
        }

        step += options.speed
        const deltaTime = clock.getDelta()


        if (!isHitBySpotlight(spotLight, duckModel.position)) {
            document.getElementById('powerLevel').setAttribute('value', document.getElementById('powerLevel').getAttribute('value') - 0.1)
            document.querySelector('.progress-text').textContent = Math.round(document.getElementById('powerLevel').getAttribute('value') * 100) / 100 // two decimal places

            if (document.getElementById('powerLevel').getAttribute('value') <= 0) {
                alert("You are not ready for the boss fight!")
                renderer.setAnimationLoop(null)
            }
        }

        //#region LIGHTING =======================
        spotLight.angle = options.angle
        spotLight.penumbra = options.penumbra
        spotLight.intensity = options.intensity





        if (lightFollowsDuck) {
            if (spotLightTarget.position.z < duckModel.position.z) {
                spotLightTarget.position.z += spotLightFollowSpeed * deltaTime
            } else if (spotLightTarget.position.z > duckModel.position.z) {
                spotLightTarget.position.z -= spotLightFollowSpeed * deltaTime
            }
        } else {
            spotLightTarget.position.z -= spotLightSpeed * deltaTime
            spotLightTarget.position.z = Math.max(spotLightTarget.position.z, grounds[grounds.length - 1].position.z - grounds[grounds.length - 1].depth / 2)
        }


        spotLight.position.z = spotLightTarget.position.z

        if (stage == 4) {
            oscilateXSpotLight(deltaTime)
        } else {
            spotLight.position.x = spotLightTarget.position.x

            // make spotlight x follow DUCK but smoothly
            if (spotLightTarget.position.x < duckModel.position.x) {
                spotLightTarget.position.x += spotLightFollowSpeed * deltaTime
            } else if (spotLightTarget.position.x > duckModel.position.x) {
                spotLightTarget.position.x -= spotLightFollowSpeed * deltaTime
            }
        }


        // spotLightTarget.position.x = duckModel.position.x
        sLightHelper.update()
        //#endregion LIGHTING =======================

        //#region HELPERS ======================= 
        rayCaster.setFromCamera(mousePosition, camera)
        const intersects = rayCaster.intersectObjects(scene.children)

        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.doChangeColor) {
                intersects[i].object.material.color.set(0xff0000)
            }

            if (intersects[i].object.doRotate == true) {
                intersects[i].object.rotation.x = time / 1000
                intersects[i].object.rotation.y = time / 1000

            }
        }
        //#endregion HELPERS =======================

        //#region DUCK =======================
        duckModel.update(deltaTime)

        duckModel.velocity.x = 0
        duckModel.velocity.z = 0
        if (keys.left.pressed) {
            duckModel.velocity.x = - (duckMovementSpeed * deltaTime)
        }
        else if (keys.right.pressed) {
            duckModel.velocity.x = (duckMovementSpeed * deltaTime)
        }
        if (keys.down.pressed) {
            duckModel.velocity.z = (duckMovementSpeed * deltaTime)
        }
        else if (keys.up.pressed) {
            duckModel.velocity.z = - (duckMovementSpeed * deltaTime)
            duckMovementSpeed = Math.min(maxDuckMovementSpeed, duckMovementSpeed + (duckAcceleration * deltaTime))
            // console.log(duckMovementSpeed)
        }
        if (duckModel.position.y <= lavaYPosition) {
            alert("You are not ready for the boss fight! :(")
            renderer.setAnimationLoop(null)
        }
        if (duckModel.position.z <= grounds[grounds.length - 1].position.z - lastStageGroundDepth / 2) {

            const rulesBoardInnerHtml = `
        <h1 class="rules-title">You are a legend!</h1>
        <ul class="rules-list">
            <li>Well done!</li>
            <li>You are looking quite delicious!</li>
            <li>Now gerrara here, the boss could use a good snack.</li>
            <button class="start-level-button">Take me to him!!!</button>
        </ul>`

            document.querySelector('.rules-board').innerHTML = rulesBoardInnerHtml
            document.querySelector('.rules-board').style.display = 'block'

            // stop animation
            renderer.setAnimationLoop(null)
            // document.location.href = '../../Level3/index.html'
        }


        // Follow the duck model
        // Inside the animate function:
        if (duckModel && followDuck) {
            // Calculate the target position for the camera based on the current followOffset
            const targetPosition = duckModel.position.clone().add(followOffset);

            // Interpolate the camera position for smooth movement
            camera.position.lerp(targetPosition, 0.15);  // The '0.15' controls the smoothness (smaller is smoother/slower)

            if (!options.firstPerson) {
                // Third-person view: camera looks at the duck
                camera.lookAt(duckModel.position.clone());
            } else {
                // First-person view: look forward relative to the duck
                const forwardDirection = new THREE.Vector3(0, 0, -1);  // Duck is facing negative Z (forward)

                // Get the duck's rotation and apply it to the forward direction vector
                forwardDirection.applyQuaternion(duckModel.quaternion);  // Apply duck's current rotation

                // Now position the camera to look ahead in the direction the duck is facing
                const firstPersonLookAt = duckModel.position.clone().add(forwardDirection.multiplyScalar(10));
                camera.lookAt(firstPersonLookAt);
            }
        }



        // Create more grounds as duck gets close to last ground
        if (duckModel.position.z < grounds[grounds.length - 1].position.z + groundDepth * 10) {
            createGrounds(10);

            // remove last grounds

        }
        //#endregion DUCK =======================

        //#region BOULDERS =======================
        boulders.forEach(boulder => {
            boulder.update(deltaTime)

            if (boulder.position.z > duckModel.position.z + 50) {
                scene.remove(boulder)
                boulders.splice(boulders.indexOf(boulder), 1)
            }
            if (boulder.position.y < -50) {
                scene.remove(boulder)
                boulders.splice(boulders.indexOf(boulder), 1)
            }
            if (boxCollision({ box1: boulder, box2: duckModel }) && boulderCanDamage) {
                console.log('hit enemy')

                // when hit, make playerModel red
                duckModel.visible = true
                setTimeout(() => {
                    duckModel.visible = false
                }, 500)

                // just decrease hp by 10
                document.getElementById('powerLevel').setAttribute('value',
                    document.getElementById('powerLevel').getAttribute('value') - 10)

                document.querySelector('.progress-text').textContent = Math.round(document.getElementById('powerLevel').getAttribute('value') * 100) / 100 // two decimal places

                if (document.getElementById('powerLevel').getAttribute('value') <= 0) {
                    alert("You are not ready for the boss fight!")
                    renderer.setAnimationLoop(null)
                }
            }
        })

        // console.log('boulders length', boulders.length)

        // Spawn boulders
        if (frames % spawnRate === 0 && spawnBoulders) {

            spawnRate = Math.max(20, spawnRate - 10)

            let boulderX = getRandomNumber(duckModel.position.x - 20, duckModel.position.x + 20)
            let boulderZ = getRandomNumber(duckModel.position.z - 300, duckModel.position.z)
            let boulderY = getRandomNumber(30, 60)

            if (stage == 4) {
                boulderZ = getRandomNumber(lastGround.back - 100, lastGround.back)
                boulderY = getRandomNumber(20, 30)
            }

            const boulder = new Boulder({
                radius: 2,
                color: '#D2691E',
                gravity: -0.02, // 0.01 is normal gravity
                zAcceleration: true,
                velocity: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                position: {
                    x: boulderX,
                    y: boulderY,
                    z: boulderZ
                }
            })

            boulder.castShadow = true
            scene.add(boulder)
            boulders.push(boulder)
        }
        //#endregion BOULDERS =======================

        //#region GROUNDS =======================
        grounds.forEach(ground => {
            ground.update(deltaTime)

            if (ground.position.z > duckModel.position.z + 100 && ground != grounds[grounds.length - 1]) {
                scene.remove(ground)
                // grounds.splice(grounds.indexOf(ground), 1)
            }

            if (ground.position.y < -50) {
                scene.remove(ground)
                // grounds.splice(grounds.indexOf(ground), 1)
            }
        })
        //#endregion GROUNDS =======================

        //#region TIMING =======================
        if (time - previousTime > interval) {
            // Action to perform every second

            // console.log(`This happens every ${interval} milliseconds!`);
            previousTime = time;

            grounds[lastDescendingGround]?.startDescent();
            // grounds[lastDescendingGround - 1]?.stopDescent();

            lastDescendingGround = (lastDescendingGround + 1);
        }

        if (time - previousJumpScareTime > jumpScareDuration && stage >= 2) {

            if (allFacesLoaded() && scaryFaces.length != 0 && allowHaunting) {
                previousJumpScareTime = time;


                let faceWasShown = false;

                // hide any face that is visible, then next time, show one face, and repeat
                scaryFaces.forEach(face => {
                    if (face.visible) {
                        faceWasShown = true
                    }
                    face.visible = false
                })

                if (!faceWasShown) {
                    currentScaryFace = getRandomNumber(0, scaryFaces.length - 1).toFixed(0) // 0 to 4
                    console.log('currentScaryFace', currentScaryFace)
                    console.log('scaryFaces', scaryFaces)
                    scaryFaces[currentScaryFace].visible = true

                    // play random jump scare sound
                    if (jumpScareSounds.length != 0) {
                        const randomJumpScareSound = jumpScareSounds[getRandomNumber(0, jumpScareSounds.length - 1).toFixed(0)]
                        randomJumpScareSound.volume = 0.5;
                        randomJumpScareSound.loop = false;
                        randomJumpScareSound.play();
                    }
                }

                jumpScareDuration = getRandomNumber(1000, 4000);




            }

        }
        //#endregion TIMING =======================


        //#region STAGES =======================

        // if duck is on lastGround, make it stage 4
        if (lastGround && duckModel.position.z < lastGround.front) {
            stage = 4
            console.log('ON THE LAST GROUND')
        }

        if (time - previousLevelTime > stageDuration) {
            previousLevelTime = time;

            if (stage != 4) {
                stage = Math.min(3, stage + 1);
            }


            console.log(`Stage Change After ${stageDuration} milliseconds, stage ${stage}`);
        }

        switch (stage) {
            case 1: {
                lightFollowsDuck = false;
                groundsDescend = false;
                groundsOscilate = false;
                spawnBoulders = false;
                document.querySelector('.level-display').textContent = 'Stage 1: Stay in the LIGHT!'
                break;
            }
            case 2: {
                lightFollowsDuck = true;
                spawnBoulders = true;
                document.querySelector('.level-display').textContent = 'Stage 2: Watch out for the BOULDERS! The light follows you now :)'
                break
            }
            case 3: {
                groundsDescend = true;
                lightFollowsDuck = true;
                spawnBoulders = true;
                document.querySelector('.level-display').textContent = 'Stage 3: Move fast, some grounds will DESCEND!'
                break
            }
            case 4: {
                lightFollowsDuck = false;
                spawnBoulders = true;
                groundsDescend = false;
                groundGap = 40;
                document.querySelector('.level-display').textContent = 'Stage 4: The FINAL STAGE. Follow the Light. Watch out for the boulders! GOOD LUCK'
                break
            }
        }

        //#endregion STAGES =======================



        renderer.render(scene, camera)

        frames++

    }// end if (gameStarted)

    renderer.render(scene, camera)

}

renderer.setAnimationLoop(animate);


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})


const keys = {
    left: {
        pressed: false
    },
    right: {
        pressed: false
    },
    up: {
        pressed: false
    },
    down: {
        pressed: false
    }
}



window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyA':
        case 'ArrowLeft':
            keys.left.pressed = true
            break
        case 'KeyD':
        case 'ArrowRight':
            keys.right.pressed = true
            break
        case 'KeyS':
        case 'ArrowDown':
            keys.down.pressed = true
            break
        case 'KeyW':
        case 'ArrowUp':
            keys.up.pressed = true
            break
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyA':
        case 'ArrowLeft':
            keys.left.pressed = false
            break
        case 'KeyD':
        case 'ArrowRight':
            keys.right.pressed = false
            break
        case 'KeyS':
        case 'ArrowDown':
            keys.down.pressed = false
            break
        case 'KeyW':
        case 'ArrowUp':
            keys.up.pressed = false
            duckMovementSpeed = originalDuckMovementSpeed
            break
        case 'Space':
            if (canJump) {
                duckModel.velocity.y = 0.6; // Set the jump velocity
                canJump = false; // Disable jumping
                // Set a timeout to re-enable jumping after 1 second
                setTimeout(() => {
                    canJump = true; // Allow jumping again
                }, jumpCooldown);
            }
            break;
    }
})

let canJump = true; // Boolean to track if jumping is allowed
const jumpCooldown = 1000;


window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyR': // Press 'D' to start descent
            grounds[0].startDescent();
            break;
        case 'KeyT': // Press 'S' to stop descent
            grounds[0].stopDescent();
            break;
    }
});

document.querySelector('.start-level-button').addEventListener('click', (event) => {


    console.log("START LEVEL BUTTON CLICKED")
    gameStarted = true
    ambientSound.play();
    document.querySelector('.rules-board').style.display = 'none'
})


//#endregion ANIMATE and EVENTS =========================


// AUDIO =========================
//ambient sound
const ambientSound = new Audio('../assets/alexander-nakarada-chase(chosic.com).mp3');
ambientSound.volume = 0.3;
ambientSound.loop = true;