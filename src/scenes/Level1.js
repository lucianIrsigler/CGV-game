import * as THREE from 'three';
import { SceneBaseClass } from "../scripts/Scene/SceneBaseClass";
import { door } from "../data/doorPos1";
import { lamps } from "../data/lampPos1";
import { ObjectManager } from "../scripts/Scene/ObjectManager";
import { LightManager } from "../scripts/Scene/LightManager";
import { lightsConfigLevel1 } from "../data/lightPos1";
import { LoadingManager } from "../scripts/Loaders/Loader";
import { CameraManager } from "../scripts/Camera/CameraManager";
import { Character } from "../scripts/Characters/Character";
import { calcEuclid } from '../scripts/util/calcEuclid';


export class Level1 extends SceneBaseClass {
    constructor() {
        super(); // Call the base class constructor
        this.lampsArray=Object.values(lamps);
        this.gameOverScreen = document.getElementById("gameOverScreen");
        this.restartButton = document.getElementById("restartButton");
        this.objManager = new ObjectManager(this.scene);
        this.lightManager = new LightManager(this.scene);
        this.loader = new LoadingManager();
        this.cameraManager;
        this.target;

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

        //door stuff
        this.Door;
        this.isDoorOpen = false;
        this.doorPrompt = document.getElementById('doorPrompt');
        this.doorOpenDistance = 2; // Distance at which the prompt appears


        //minimap
        this.lightTimers = {}; // Track time spent near lights
        this.lastMiniMapRenderTime = 0; // To track the last time the mini-map was rendered
        this.miniMapRenderInterval = 100; // 100ms interval for mini-map rendering


        //for animation
        this.lastTime = 0;
        this.points = [];

        //health
        this.health =100;
        this.healthNumberElement =document.getElementById('health-number');
        this.damageRate = 20; // Define the damage rate
        this.healingRate = 10; // Define the healing rate
    }

    initScene(){
        this.init_eventHandlers_();
        this.init_lighting_();
        this.init_camera_();
        this.init_objects_();
        this.init_miniMap_();
        this.init_door_();

        //Start functions
        this.startDamageTimer();
        console.log(this.scene.children);
    }


    init_eventHandlers_(){
        document.addEventListener("keydown", (e) => {
            switch (e.code) {
              case "KeyR":
                if (this.cameraManager==undefined){
                  return;
                }
                if (this.cameraManager.getFirstPerson()){
                  this.cameraManager.toggleThirdPerson()
                }else{
                    this.cameraManager.toggleFirstPerson()
                }
                break;
            }
          })

        this.restartButton.addEventListener("click", this.restartGame.bind(this));
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
        let Door;
        let doorMixer;
        let doorAnimationAction;
        const currentDoor = door.doorOne;

        // Load the door model
        this.loader.loadModel(currentDoor.scene,(gltf) =>{
            Door = gltf.scene;
            this.Door = Door;
            this.addObject(Door);

            Door.position.set(currentDoor.positionX, currentDoor.positionY, currentDoor.positionZ);
            Door.scale.set(currentDoor.scaleX, currentDoor.scaleY, currentDoor.scaleZ);
            Door.castShadow = true;

            doorMixer = new THREE.AnimationMixer(Door);

            const animations = gltf.animations;
            if (animations && animations.length > 0) {
                doorAnimationAction = doorMixer.clipAction(animations[0]);
            }

            this.doorMixer = doorMixer;
        }, undefined, function (error) {
            console.error('An error happened', error);
        });

        // Declare a flag variable to track the door state
        
    }

    init_objects_() {
        //load object
        this.initialize();

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
        this.objManager.getObject("bottom").isGround=true;



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

        let i = 0;
        this.platforms.forEach(platform => {
            this.objManager.addGeometry("temp",new THREE.BoxGeometry(platform.size.x, platform.size.y, platform.size.z));
            this.objManager.createObject("platform"+i,"temp","platforms",platform.position);
            this.objManager.getObject("platform"+i).isGround=true;
            this.objManager.removeGeometry("temp");
            i+=1;
        });


        //TODO I GOT UP TO HERE        
        //charcter light 
        // Position camera initially at the same place as the character
        // this.camera.position.set(this.character.position.x, this.character.position.y + 0.5, this.character.position.z);

    }

    init_camera_() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0,12,20);
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
            }else if (config.type=="AmbientLight"){
                light = new THREE.AmbientLight(config.color,config.intensity);
            }
        
            // Store original intensity
            light.userData.originalIntensity = light.intensity;
        
            // Add light to LightManager
            this.lightManager.addLight(config.name, light, config.position);

            if (config.type === "SpotLight"){
                this.points.push(this.lightManager.getLight(config.name))

            }
        
            // If the light has a target (e.g., for SpotLights), create a target object and assign it
            if (config.target) {
                const targetObject = new THREE.Object3D();
                targetObject.position.set(config.target.position.x, config.target.position.y, config.target.position.z);
                this.addObject(targetObject);
                this.lightManager.addTarget(config.name, targetObject);
            }
        });

        console.log(this.points);

    }

    animate=(currentTime)=> {
        if (!this.loader.getLoaded()){
            //wait till loaded
            requestAnimationFrame(this.animate);
            return;
        }
        const timeElapsedS = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;


        // // Update the door animation mixer if it exists
        if (this.doorMixer) {
            this.doorMixer.update(0.01); // Update the animation mixer
        }
    
        // Check proximity to the door
        this.checkDoorProximity();
    
        //Handle the 'E' key press to open the door
        document.addEventListener('keydown', (e) => {
            if (e.key === 'e') {
                if (this.doorPrompt.style.display === 'block') {
                    this.openDoor(); 
                }
            }
        });
        
        this.cameraManager.update(timeElapsedS)

        // Render the scene
        this.renderer.render(this.scene, this.cameraManager.getCamera());

        //update minimap at defined time interval
        const currentTimeMiniMap = Date.now();

        if (currentTimeMiniMap - this.lastMiniMapRenderTime >= this.miniMapRenderInterval) {
            this.miniMapRenderer.render(this.scene, this.miniMapCamera);
            this.lastMiniMapRenderTime = currentTimeMiniMap; // Update the time of last render
        }

        requestAnimationFrame(this.animate);
    }

    async initialize() {
        try {
            await this.loader.loadModel('./public/assets/hollow_knight/scene.glb', 'player', (gltf) => {
                const model = gltf.scene; // Get the loaded model
                this.addObject(model); // Add the model to the scene
                model.rotation.set(0, 0, 0); // Rotate the model
                model.scale.set(0.7, 0.7, 0.7); // Scale the model if necessary
                model.position.set(0, 0.5, 0);
                model.name = "player"; // Name the model
                this.target = model;
                this.target.visible=false;
                this.cameraManager = new CameraManager(
                    this.camera,
                    this.target,
                    new Character(3.0,0.3),
                    this.scene
                )

                this.setupCharacterLight();

            });
            console.log('Model loaded and added to the scene.');
        } catch (error) {
            console.error('Failed to load model:', error);
        }
      }
      
      

    openDoor() {
        if (!isDoorOpen && doorAnimationAction) {
            doorAnimationAction.reset();
            doorAnimationAction.play();
            this.isDoorOpen = true;
            playDoorCreakSound(); // Play the door creak sound
            this.gameOverScreen.style.display = 'block';
            this.gameOverScreen.innerHTML = "<h1>Success!</h1><p>You opened the door!</p>";
        }
    }

    setupCharacterLight() {
        this.characterLight = new THREE.PointLight(0xffffff, 1, 5);
        this.characterLight.position.set(0, 2, 0); // Slightly above the character
        this.target.add(this.characterLight); // Attach the light to the character
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
                if (this.lightTimers[index]) {
                    this.lightTimers[index].time = 0;
                    this.lightTimers[index].flickering = false;
                }

                // Apply damage if the character is still near the light
                if (calcEuclid(this.target.position.x, this.target.position.z, light.position.x, light.position.z)) {
                    this.takeDamage(this.damageRate); // Take the same damage as usual when the light goes off
                }
            }
        }, flickerInterval);
    }

    checkDoorProximity() {
        if (this.Door==undefined){
            return;
        }
        const distance = this.target.position.distanceTo(this.Door.position);
        
        if (distance <= this.doorOpenDistance) {
            this.doorPrompt.style.display = 'block'; // Show prompt
        } else {
            this.doorPrompt.style.display = 'none'; // Hide prompt
        }
    }

    openDoor() {
        if (!isDoorOpen && doorAnimationAction) {
            doorAnimationAction.reset();
            doorAnimationAction.play();
            isDoorOpen = true; // Set the flag to true so it won't open again
            // Transition to success screen
            this.gameOverScreen.style.display = 'block'; // Assuming this is your success screen
            this.gameOverScreen.innerHTML = "<h1>Success!</h1><p>You opened the door!</p>"; // Update success message
        }
    }

    handleCharacterDeath() {
        this.gameOverScreen.style.display = "block";
        document.body.style.cursor = "pointer"
    }

    restartGame() {
        this.gameOverScreen.style.display = "none";

        // Reset character position and camera
        this.target.position.set(0, 0.5, 0);
        this.camera.position.set(this.target.position.x, this.target.position.y + 0.5, this.target.position.z);
        this.target.rotation.y = Math.PI;

        // Reset health
        this.health = 100;
        this.healthNumberElement.textContent = this.health; // Reset health number in the HTML

        // Reload textures
        //TODO uncomment?
        // textures.forEach(texture => {
        //     texture.needsUpdate = true; // Mark texture for update
        // });  

        // Use the toggleLightIntensity function to turn on all lights at intensity 5
        this.points.forEach(light => this.toggleLightIntensity(light));
        this.lampsArray.forEach(lampLight => {
            lampLight.intensity = 0.5; // Reset to original intensity
        });
        this.updateCharacterLight();
        document.body.style.cursor = "none"

    }


    //TODO PUT INTO CLASS OF ITS OWN
    toggleLightIntensity(light) {
        light.intensity = 5;
    }

    updateCharacterLight() {
        if (this.characterLight) {
            // Calculate light intensity and distance based on health
            const maxIntensity = 1;
            const maxDistance = 5;
            const minIntensity = 0.2;
            const minDistance = 1;

            const healthPercentage = this.health / 100;
            
            this.characterLight.intensity = minIntensity + (maxIntensity - minIntensity) * healthPercentage;
            this.characterLight.distance = minDistance + (maxDistance - minDistance) * healthPercentage;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.health = Math.max(0, this.health); // Ensure health doesn't go below 0
        this.healthNumberElement.textContent = this.health;
        this.updateCharacterLight(); // Update light when health changes

        if (this.health <= 0) {
            this.handleCharacterDeath();
        }
    }

    heal(amount) {
        this.health += amount;
        this.health = Math.min(100, this.health); // Cap health at 100
        this.healthNumberElement.textContent = this.health;
        this.updateCharacterLight(); // Update light when health changes
    }

    
    
    startDamageTimer() {
        setInterval(() => {
            if (this.loader.getLoaded()) {
                let valid = false;

                this.points.forEach((light, index) => {
                    // Check distance to each light
                    if (calcEuclid(this.target.position.x, this.target.position.z, light.position.x, light.position.z)) {
                        valid = true;

                        // Initialize or increment the timer for this light
                        if (!this.lightTimers[index]) {
                            this.lightTimers[index] = { time: 0, flickering: false };
                        }

                        this.lightTimers[index].time += 1; // Increment time spent in light

                        // Heal if the light is on
                        if (light.intensity > 0) {
                            this.heal(this.healingRate);
                        }

                        // Check if time exceeds 3 seconds
                        if (this.lightTimers[index].time >= 3 && !this.lightTimers[index].flickering) {
                            this.lightTimers[index].flickering = true;
                            this.flickerLight(light, index); // Pass index for reset after flickering
                        }
                    } else {
                        // Reset the timer if not in light
                        if (this.lightTimers[index]) {
                            this.lightTimers[index].time = 0;
                            this.lightTimers[index].flickering = false;
                        }
                    }
                });

                if (!valid) {
                    this.takeDamage(this.damageRate); // Take damage if not within any light
                }
            }
        }, 1000); // Call this function every second
    }
}
