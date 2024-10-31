import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { loadTextures, applyTextureSettings } from './TextureLoaderUtil.js';


// hallow night
const hallowURL = new URL('../assets/HallowKnight.glb', import.meta.url)

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
let spawnBoulders = false
let lightFollowsDuck = false
let groundsDescend = false
let groundsOscilate = false

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

const textureLoader = new THREE.TextureLoader()
scene.background = textureLoader.load(halloweenBackgroundUrl)

//#endregion

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
            spotLightTargetLastStage.position.x = getRandomNumber(grounds[grounds.length - 1].left, grounds[grounds.length - 1].position.x);  // New random target between -10 and 10
        } else {
            spotLightTargetLastStage.position.x = getRandomNumber(grounds[grounds.length - 1].position.x, grounds[grounds.length - 1].right);  // New random target between -10 and 10
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
    constructor({ width, height, depth, color = '#00ff00', gravity = 0, xAcceleration = false, zAcceleration = false, maxZSpeed = 2, maxXSpeed = 2, isGround = false, velocity = {
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

        this.gravity = gravity
        this.zAcceleration = zAcceleration
        this.xAcceleration = xAcceleration

        this.zSpeed = 0.01
        this.xSpeed = 0.01
        this.bounceHeight = 0.5

        this.maxZSpeed = maxZSpeed
        this.maxXSpeed = maxXSpeed
    }

    updateSides() {
        this.right = this.position.x + this.width / 2
        this.left = this.position.x - this.width / 2

        this.bottom = this.position.y - this.height / 2
        this.top = this.position.y + this.height / 2

        this.front = this.position.z + this.depth / 2
        this.back = this.position.z - this.depth / 2
    }

    updateMovement() {
        this.position.x += this.velocity.x

        if (this.zAcceleration) {
            this.velocity.z = Math.min(this.maxZSpeed, this.velocity.z + this.zSpeed)
        }
        this.position.z += this.velocity.z

        if (this.xAcceleration) {
            this.velocity.x = Math.min(this.maxXSpeed, this.velocity.x + this.xSpeed)
        }
        this.position.x += this.velocity.x
    }

    update() {
        this.updateSides()

        this.updateMovement()

        // grounds.forEach(ground => {
        this.applyGravity(grounds[0])
        // })
    }

    applyGravity() {
        this.velocity.y += this.gravity

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

        this.zSpeed = 0.02;
    }

    // Optionally override methods or add new ones specific to Boulder
}

class ModelBox extends Box {
    constructor({ url, x, y, z, desiredHeight, gravity = -0.01 }) {
        super({
            width: 1,  // Placeholder values
            height: 1,
            depth: 1,
            color: 'white',
            gravity,
            position: { x, y, z }
        });

        this.model = null;
        this.desiredHeight = desiredHeight;

        // Remove the mesh from the scene since we don't want to see the box
        scene.remove(this);

        this.loadModel(url);
    }

    loadModel(url) {
        const assetLoader = new GLTFLoader();
        assetLoader.load(url, (gltf) => {
            this.model = gltf.scene;
            scene.add(this.model);

            this.model.position.copy(this.position);

            // Calculate the bounding box of the model to get its dimensions
            const box = new THREE.Box3().setFromObject(this.model);
            const size = new THREE.Vector3();
            box.getSize(size);

            // Apply scaling to the model
            const scaleFactor = this.desiredHeight / size.y;
            this.model.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Update the Box dimensions
            this.width = size.x * scaleFactor;
            this.height = size.y * scaleFactor;
            this.depth = size.z * scaleFactor;

            // Update the bounding box of the ModelBox
            this.updateSides();
        }, undefined, (error) => {
            console.error('An error occurred while loading the model:', error);
        });
    }

    updateSides() {
        super.updateSides();
        if (this.model) {
            this.model.position.copy(this.position);
        }
    }

    update() {
        super.update();
        if (this.model) {
            this.model.position.copy(this.position);
        }
    }
}

let groundHeight = 2;
let groundWidth = 40;
let groundDepth = 60;

let lastStageGroundWidth = groundWidth * 4
let lastStageGroundDepth = groundDepth * 10
let lastStageGroundHeight = groundHeight * 2

let groundGap = 15
let groundYDisplacement = 5
let groundXDisplacement = groundWidth * 2
let groundZLocationTracker = groundDepth / 2;

let numGroundsTracker = 0

let maxGroundsAllowed = 20;

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
            // ground.material = new THREE.MeshStandardMaterial({ color: '#FFFF00' });



            const platformTexture = loadTextures('PavingStones');
            // applyTextureSettings(platformTexture, 6, 3);
            applyTextureSettings(platformTexture, 6, 6); // 6,6 works well

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
            // lastGround.material = platformMaterial
            lastGround.material = new THREE.MeshStandardMaterial({ color: '#FFFF00' });
        }

        scene.add(ground)
        grounds.push(ground)

        previousGroundX = ground.position.x
        previousGroundY = ground.position.y

        groundZLocationTracker -= groundDepth + groundGap

    }


}

createGrounds(2)

const insertModel = ({ url, x, y, z, desiredHeight }) => {
    const modelBox = new ModelBox({ url: url.href, x, y, z, desiredHeight });
    scene.add(modelBox); // Add the ModelBox to the scene
    return modelBox; // Optionally return the instance for further manipulation
}

// Example: Insert the duck model at (0, 0, 0) and scale it to have a height of 5 units
duckModel = insertModel({ url: duckUrl, x: 0, y: 20, z: 0, desiredHeight: 5 });
duckModel.visible = false // Change the color of the duck model



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
    followDuck: false,

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
        duckModel.visible = false;
    } else {
        // Third-person view: behind and slightly above the duck
        followOffset = new THREE.Vector3(0, 6, 20);
        duckModel.visible = true;
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

let originalDuckMovementSpeed = 60 // 100 is normal speed
let maxDuckMovementSpeed = 120 // 400 is max speed
let duckAcceleration = 10
let duckMovementSpeed = originalDuckMovementSpeed

let levelInterval = 5000
let previousLevelTime = 0

let spotLightFollowSpeed = 50

const clock = new THREE.Clock()

const animate = (time) => {

    if (gameStarted) {

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
        duckModel.update()

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
        if (duckModel.position.y <= -100) {
            alert("You are not ready for the boss fight! :(")
            renderer.setAnimationLoop(null)
        }
        if (duckModel.position.z <= grounds[grounds.length - 1].position.z - lastStageGroundDepth / 2) {

            const rulesBoardInnerHtml = `
        <h1 class="rules-title">You are a legend!</h1>
        <ul class="rules-list">
            <li>Well done!</li>
            <li>You are looking quite delicious!</li>
            <li>Head over to the FINAL FIGHT!</li>
            <li>The boss could use a good feast!</li>
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
            boulder.update()

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

            spawnRate = Math.max(30, spawnRate - 10)

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
                gravity: -0.01, // 0.01 is normal gravity
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
            ground.update()

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
        //#endregion TIMING =======================


        //#region STAGES =======================

        // if duck is on lastGround, make it stage 4
        if (lastGround && duckModel.position.z < lastGround.front) {
            stage = 4
            console.log('ON THE LAST GROUND')
        }

        if (time - previousLevelTime > levelInterval) {
            previousLevelTime = time;

            if (stage != 4) {
                stage = Math.min(3, stage + 1);
            }


            console.log(`Stage Change After ${levelInterval} milliseconds, stage ${stage}`);
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