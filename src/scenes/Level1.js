import { SceneBaseClass } from "../scripts/Scene/SceneBaseClass";
import * as THREE from 'three';
import { door } from "../data/doorPos1";
import { lamps } from "../data/lampPos1";
import { ObjectManager } from "../scripts/Scene/ObjectManager";
import { LightManager } from "../scripts/Scene/LightManager";
import { lightsConfigLevel1 } from "../data/lightPos1";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FirstPersonControls } from "three/examples/jsm/Addons.js";
import { LoadingManager } from "../scripts/Loaders/Loader";

export class Level1 extends SceneBaseClass {
    constructor() {
        super(); // Call the base class constructor
        this.lampsArray=Object.values(lamps);
        this.gameOverScreen = document.getElementById("gameOverScreen");
        this.restartButton = document.getElementById("restartButton");
        this.objManager = new ObjectManager(this.scene);
        this.lightManager = new LightManager(this.scene);
        this.loader = new LoadingManager();

        this.platforms = [
            { position: new THREE.Vector3(3, 2, 15), size: new THREE.Vector3(5, 0.5, 5) },
            { position: new THREE.Vector3(-3, 4, 20), size: new THREE.Vector3(5, 0.5, 5) },
            { position: new THREE.Vector3(3, 2, 30), size: new THREE.Vector3(3, 0.3, 3) },
            { position: new THREE.Vector3(-3, 4, 35), size: new THREE.Vector3(3, 0.3, 10) }
        ];

        this.miniMapCamera = null;
        this.miniMapRender = null;
        this.points = [];
        this.character;
        this.characterLight;
    }

    initScene(){
        this.init_lighting_();
        this.init_camera_();
        this.init_objects_();
        this.init_miniMap_();
        this.init_door_();

    }

    //TODO make into class
    init_miniMap_(){
        this.miniMapCamera = new THREE.OrthographicCamera(
            window.innerWidth / -2, window.innerWidth / 2,
            window.innerHeight / 2, window.innerHeight / -2,
            0.1, 1000
        );
        this.miniMapCamera.position.set(0, 100, 0); // Position the mini-map camera above the scene
        this.miniMapCamera.lookAt(0,0,15); // Look at the center of the scene

        // Set the zoom factor
        this.miniMapCamera.zoom = 12.5; // Increase this value to zoom in
        this.miniMapCamera.updateProjectionMatrix(); // Update the projection matrix after changing the zoom

        this.miniMapRenderer = new THREE.WebGLRenderer({ alpha: true });
        this.miniMapRenderer.setSize(200, 200); // Set the size of the mini-map
        this.miniMapRenderer.domElement.style.position = 'absolute';
        this.miniMapRenderer.domElement.style.top = '10px';
        this.miniMapRenderer.domElement.style.right = '10px';
        document.body.appendChild(this.miniMapRenderer.domElement);
    }


    //TODO use managers
    init_door_(){
        // Door variables
        let loader = new GLTFLoader();

        let Door;
        let doorMixer;
        let doorAnimationAction;
        const currentDoor = door.doorOne;

        // Load the door model
        this.loader.loadModel(currentDoor.scene,(gltf) =>{
            Door = gltf.scene;
            this.scene.add(Door);

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

        // Declare a flag variable to track the door state
        let isDoorOpen = false;

        // Function to open the door
        const doorPrompt = document.getElementById('doorPrompt');
        const doorOpenDistance = 2; // Distance at which the prompt appears
    }


    init_objects_() {
        let mesh;
        let characterLight; 
        // Mini-map setup
        // First Person Controls        
        this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
        //controls.movementSpeed = 2; // Lower movement speed
        this.controls.lookSpeed = 0.01; // Lower look speed

        //Texture for ground 
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('PavingStones.jpg', (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 5);
        });
        //Texture for walls
        const textureLoaderWall = new THREE.TextureLoader();
        const textureWall = textureLoaderWall.load('PavingStones.jpg', (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 1);
        });
        // Texture for platforms 
        const textureLoaderPlatforms = new THREE.TextureLoader();
        const texturePlatform = textureLoaderPlatforms.load('PavingStones.jpg', (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(3, 2);
        });


        
        //add geometries
        this.objManager.addGeometry("sideWall",new THREE.BoxGeometry(50, 1, 20));
        this.objManager.addGeometry("platform",new THREE.BoxGeometry(10, 1, 50));
        this.objManager.addGeometry("character",new THREE.BoxGeometry(1, 1, 1));
        this.objManager.addGeometry("ground",new THREE.PlaneGeometry(20, 20));
        this.objManager.addGeometry("redCube",new THREE.BoxGeometry(3, 1, 3));



        //add materials
        this.objManager.addMaterial("sideWall",new THREE.MeshStandardMaterial({ map: textureWall }));
        this.objManager.addMaterial("platform",new THREE.MeshStandardMaterial({ map: texture }));
        this.objManager.addMaterial("character",new THREE.MeshStandardMaterial({ 
            color: 0xff0000, 
            transparent: true, 
            opacity: 0.0
        }));
        this.objManager.addMaterial("platforms",new THREE.MeshStandardMaterial({ map: texturePlatform }));
        this.objManager.addMaterial("ground",new THREE.MeshStandardMaterial({ color: 0x808080 }));
        this.objManager.addMaterial("redCube",new THREE.MeshBasicMaterial({ color: 0x0000ff }));
        this.objManager.addMaterial("greenCube",new THREE.MeshBasicMaterial({ color: 0x008000 }));

        
        // mesh = this.objManager.createObject("ground","ground","ground",{x:0,y:0,z:0},{x:Math.PI/2,y:0,z:0});
        //scene.add(mesh);

        let res = this.loadLamps();

        // Walls
        this.objManager.createObject("bottom","platform","platform",{x:0,y:-0.5,z:20},null);


        let topPos = {x:0,y:10,z:20};
        this.objManager.createObject("top","platform","platform",topPos,null);

        topPos.y+=2;
        this.objManager.createObject("redCube","redCube","redCube",topPos,null);
        this.objManager.createObject("greenBlock","redCube","greenCube",{x:-3,y:topPos.y,z:39},null);

        
        this.objManager.createObject("backWall","sideWall","sideWall",{x:0,y:2,z:-5},{x:Math.PI/2,y:0,z:0});
        this.objManager.createObject("left","sideWall","sideWall",{x:-5,y:0.8,z:15},{x:Math.PI/2,y:0,z:Math.PI/2});
        this.objManager.createObject("right","sideWall","sideWall",{x:5,y:0.8,z:15},{x:Math.PI/2,y:0,z:Math.PI/2});
        this.objManager.createObject("end","sideWall","sideWall",{x:0,y:2,z:40},{x:Math.PI/2,y:0,z:0});

        this.scene.background = new THREE.Color(0x333333);

        //Platforms 
        this.platforms.forEach(platform => {
            this.objManager.addGeometry("temp",new THREE.BoxGeometry(platform.size.x, platform.size.y, platform.size.z));
            this.objManager.createObject("platform","temp","platforms",platform.position);
            this.objManager.removeGeometry("temp");
        });

        // Create a simple character (a cube)
        this.objManager.createObject("character","character","character",{x:0,y:0.5,z:0},{x:Math.PI/2,y:0,z:0});


        //TODO I GOT UP TO HERE        
        //charcter light 

        let character = this.objManager.getObject("character");
        this.character = character;


        this.setupCharacterLight(character);

        // Position camera initially at the same place as the character
        this.camera.position.set(this.character.position.x, this.character.position.y + 0.5, this.character.position.z);
        this.character.rotation.y += Math.PI;

        this.restartButton.addEventListener("click", this.restartGame);
        const lightTimers = {}; // Track time spent near lights
        let lastMiniMapRenderTime = 0; // To track the last time the mini-map was rendered
        const miniMapRenderInterval = 100; // 100ms interval for mini-map rendering
    }

    init_camera_() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    }

    init_lighting_() {

        let temp = new THREE.AmbientLight(0x000000,1000);
        this.lightManager.addLight("ambient", temp, null);


        lightsConfigLevel1.forEach(config => {
            let light;
            if (config.type === "SpotLight") {
                light = new THREE.SpotLight(config.color, config.intensity, config.distance, config.angle, config.penumbra, config.decay);
            } else if (config.type === "PointLight") {
                light = new THREE.PointLight(config.color, config.intensity, config.distance);
            }
        
            // Store original intensity
            light.userData.originalIntensity = light.intensity;
        
            // Add light to LightManager
            this.lightManager.addLight(config.name, light, config.position);
        
            // If the light has a target (e.g., for SpotLights), create a target object and assign it
            if (config.target) {
                const targetObject = new THREE.Object3D();
                targetObject.position.set(config.target.position.x, config.target.position.y, config.target.position.z);
                this.addObject(targetObject);
                this.lightManager.addTarget(config.name, targetObject);
            }
        });
    }

    animate=()=> {
        requestAnimationFrame(this.animate);
        // console.log(this.scene.children);
    //     // Update the door animation mixer if it exists
    //     if (doorMixer) {
    //         doorMixer.update(0.01); // Update the animation mixer
    //     }
    
    //     // Jumping and gravity application
    //     if (isJumping) {
    //         character.position.y += velocityY;
    //         velocityY += gravity;
    //     }
    // // Check proximity to the door
    // checkDoorProximity();
    
    // // Update the red cube's position
    // updateRedCubePosition();
    
    // // Handle the 'E' key press to open the door
    
    
    // // Reset jump count when hitting the ground
    // if (onPlatform || character.position.y === 0.5) {
    //     jumpCount = 0; // Reset jump count only when on a platform
    // }
    //     // Calculate the forward and right direction based on the camera's rotation
    //     const cameraDirection = new THREE.Vector3();
    //     camera.getWorldDirection(cameraDirection);
    //     cameraDirection.y = 0; // Ignore vertical direction
    //     cameraDirection.normalize();
    
    //     const rightDirection = new THREE.Vector3();
    //     rightDirection.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)); // Get the right direction
    
    //     if (forward) {
    //         character.position.add(cameraDirection.multiplyScalar(moveSpeed * forward));
    //     }
    //     if (right) {
    //         character.position.add(rightDirection.multiplyScalar(moveSpeed * right));
    //     }
    
    //     updateCameraPosition();
    //     controls.update(0.7); // Update controls with delta time
    //     // Render the scene
        this.renderer.render(this.scene, this.camera);
    //     // Only update the mini-map at the defined interval
    //     const currentTime = Date.now();
    //     if (currentTime - lastMiniMapRenderTime >= miniMapRenderInterval) {
    //         miniMapRenderer.render(scene, miniMapCamera);
    //         lastMiniMapRenderTime = currentTime; // Update the time of last render
    //     }
    }

    setupCharacterLight(attachTo) {
        this.characterLight = new THREE.PointLight(0xffffff, 1, 5);
        this.characterLight.position.set(0, 1, 0); // Slightly above the character
        attachTo.add(this.characterLight); // Attach the light to the character
    }


    // Function to load lamps
    async loadLamps() {
        let i=0;
        
        this.lampsArray.forEach(lamp => {
            i+=1;
            this.loader.loadModel(lamp.scene,"lamp"+Math.random(),(gltf) => {  // Use an arrow function here
                let model = gltf.scene;
                this.addObject(model);
                console.log("lamp loaded");
                model.position.set(lamp.positionX, lamp.positionY, lamp.positionZ);
                model.scale.set(lamp.scaleX, lamp.scaleY, lamp.scaleZ);
                model.castShadow = true;
    
                const lampLight = new THREE.PointLight(0xA96CC3, 0.5, 2); // Purple light 
                let position={x:lamp.positionX, y:lamp.positionY + 2, z:lamp.positionZ}; 
                this.lightManager.addLight(null,lampLight,position)
            }, undefined, (error) => {
                console.error('An error happened while loading the lamp model:', error);
            });
        });
    }


    flickerLight(light, index) {
        let flickerDuration = 2; // Flicker for 2 seconds
        let flickerInterval = 100; // Flicker every 200ms
        let flickerCount = flickerDuration * 1000 / flickerInterval; // Total flickers
        let originalIntensity = light.intensity;

        let flickerEffect = setInterval(() => {
            light.intensity = light.intensity === 0 ? originalIntensity : 0; // Toggle light intensity
            flickerCount--;

            if (flickerCount <= 0) {
                clearInterval(flickerEffect);
                light.intensity = 0; // Turn off the light
                // Reset the timer for this light
                if (lightTimers[index]) {
                    lightTimers[index].time = 0;
                    lightTimers[index].flickering = false;
                }

                // Apply damage if the character is still near the light
                if (calcEuclid(character.position.x, character.position.z, light.position.x, light.position.z)) {
                    takeDamage(damageRate); // Take the same damage as usual when the light goes off
                }
            }
        }, flickerInterval);
    }

    checkDoorProximity() {
        const distance = character.position.distanceTo(Door.position);
        
        if (distance <= doorOpenDistance) {
            doorPrompt.style.display = 'block'; // Show prompt
        } else {
            doorPrompt.style.display = 'none'; // Hide prompt
        }
    }

    openDoor() {
        if (!isDoorOpen && doorAnimationAction) {
            doorAnimationAction.reset();
            doorAnimationAction.play();
            isDoorOpen = true; // Set the flag to true so it won't open again
            // Transition to success screen
            gameOverScreen.style.display = 'block'; // Assuming this is your success screen
            gameOverScreen.innerHTML = "<h1>Success!</h1><p>You opened the door!</p>"; // Update success message
        }
    }

    updateRedCubePosition() {
        redCube.position.x = character.position.x;
        redCube.position.z = character.position.z;
    }

    handleCharacterDeath() {
        gameOverScreen.style.display = "block";
    }

    restartGame() {
        gameOverScreen.style.display = "none";

        // Reset character position and camera
        character.position.set(0, 0.5, 0);
        camera.position.set(character.position.x, character.position.y + 0.5, character.position.z);
        character.rotation.y = Math.PI;

        // Reset health
        health = 100;
        healthNumberElement.textContent = health; // Reset health number in the HTML

        // Reload textures
        textures.forEach(texture => {
            texture.needsUpdate = true; // Mark texture for update
        });  

            // Use the toggleLightIntensity function to turn on all lights at intensity 5
            points.forEach(light => toggleLightIntensity(light));
            lampLights.forEach(lampLight => {
                lampLight.intensity = 0.5; // Reset to original intensity
            });
            updateCharacterLight();
    }

    toggleLightIntensity(light) {
        light.intensity = 5;
    }

    updateCharacterLight() {
        if (characterLight) {
            // Calculate light intensity and distance based on health
            const maxIntensity = 1;
            const maxDistance = 5;
            const minIntensity = 0.2;
            const minDistance = 1;

            const healthPercentage = health / 100;
            
            characterLight.intensity = minIntensity + (maxIntensity - minIntensity) * healthPercentage;
            characterLight.distance = minDistance + (maxDistance - minDistance) * healthPercentage;
        }
    }

    takeDamage(amount) {
        health -= amount;
        health = Math.max(0, health); // Ensure health doesn't go below 0
        healthNumberElement.textContent = health;
        updateCharacterLight(); // Update light when health changes
        if (health <= 0) {
            handleCharacterDeath();
        }
    }

    heal(amount) {
        health += amount;
        health = Math.min(100, health); // Cap health at 100
        healthNumberElement.textContent = health;
        updateCharacterLight(); // Update light when health changes
    }

    calcEuclid(x1, z1, x2, z2) {
                const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(z1 - z2, 2));
                return distance <= 2;
    }
    
    startDamageTimer() {
        setInterval(() => {
            if (loaded) {
                let valid = false;

                points.forEach((light, index) => {
                    // Check distance to each light
                    if (calcEuclid(character.position.x, character.position.z, light.position.x, light.position.z)) {
                        valid = true;

                        // Initialize or increment the timer for this light
                        if (!lightTimers[index]) {
                            lightTimers[index] = { time: 0, flickering: false };
                        }
                        lightTimers[index].time += 1; // Increment time spent in light

                        // Heal if the light is on
                        if (light.intensity > 0) {
                            heal(healingRate);
                        }

                        // Check if time exceeds 3 seconds
                        if (lightTimers[index].time >= 3 && !lightTimers[index].flickering) {
                            lightTimers[index].flickering = true;
                            flickerLight(light, index); // Pass index for reset after flickering
                        }
                    } else {
                        // Reset the timer if not in light
                        if (lightTimers[index]) {
                            lightTimers[index].time = 0;
                            lightTimers[index].flickering = false;
                        }
                    }
                });

                if (!valid) {
                    takeDamage(damageRate); // Take damage if not within any light
                }
            }
        }, 1000); // Call this function every second
    }
}
