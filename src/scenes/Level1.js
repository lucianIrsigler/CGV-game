import * as THREE from 'three';
import { SceneBaseClass } from "../scripts/Scene/SceneBaseClass";
import { door } from "../data/doorPos1";
import { lamps } from "../data/lampPos1";
import { ObjectManager } from "../scripts/Scene/ObjectManager";
import { LightManager } from "../scripts/Scene/LightManager";
import { lightsConfigLevel1 } from "../data/lightPos1";
import { LoadingManagerCustom } from "../scripts/Loaders/Loader";
import { CameraManager } from "../scripts/Scene/CameraManager";
import { calcEuclid } from '../scripts/util/calcEuclid';
import { World, Body, Box,Vec3 } from 'cannon-es';
import { loadTextures,applyTextureSettings } from '../scripts/util/TextureLoaderUtil';


export class Level1 extends SceneBaseClass {
    constructor() {
        super(); // Call the base class constructor
        this.lampsArray=Object.values(lamps);
        this.gameOverScreen = document.getElementById("gameOverScreen");
        this.restartButton = document.getElementById("restartButton");
        
        this.cameraManager;
        this.target;

        this.world = new World();
        this.world.gravity.set(0, -9.82, 0);

        //MANAGERS
        this.objManager = new ObjectManager(this.scene,this.world);
        this.lightManager = new LightManager(this.scene);
        this.loader = new LoadingManagerCustom();

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
        this.audioContext;
        this.doorCreakBuffer;
        this.doorAnimationAction;


        //minimap
        this.lightTimers = {}; // Track time spent near lights
        this.lastMiniMapRenderTime = 0; // To track the last time the mini-map was rendered
        this.miniMapRenderInterval = 100; // 100ms interval for mini-map rendering

        //for animation
        this.lastTime = 0;
        this.points = [];
        this.animationId = null;

        //health
        this.health =100;
        this.healthNumberElement =document.getElementById('health-number');
        this.damageRate = 20; // Define the damage rate
        this.healingRate = 10; // Define the healing rate


        this.playerLoaded = false;
        this.objectsLoaded = false;
        this.playerBody;
    }

    /**
     * Initilizes the scene with all the objects+lights
     */
    initScene(){
        this.init_eventHandlers_();
        this.init_lighting_();
        this.init_camera_();
        this.init_objects_();
        this.init_miniMap_();
        this.init_door_();
        // //Start functions
        this.startDamageTimer();
        window.addEventListener('load', this.initAudio);
    }   


    /**
     * Inits scene's document's event handlers
     */
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

        this.restartButton.addEventListener("click", this.restart.bind(this));
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
    async init_door_() {
        // Door variables
        let doorMixer;
        const currentDoor = door.doorOne;
    
        // Load the door model
        try {
            // Await the model loading
            const gltf = await this.loader.loadModel(currentDoor.scene, "Door");
    
            // Assign the loaded door model
            const Door = gltf.scene;
            this.Door = Door;
    
            // Set door properties
            Door.position.set(currentDoor.positionX, currentDoor.positionY, currentDoor.positionZ);
            Door.scale.set(currentDoor.scaleX, currentDoor.scaleY, currentDoor.scaleZ);
            Door.castShadow = true;
    
            // Create the animation mixer for the door
            doorMixer = new THREE.AnimationMixer(Door);
    
            const animations = gltf.animations;
            if (animations && animations.length > 0) {
                this.doorAnimationAction = doorMixer.clipAction(animations[0]);
            }
            this.doorMixer = doorMixer;
    
            // Add the door object to the scene
            this.addObject(Door);
    
        } catch (error) {
            console.error('An error occurred while loading the door model:', error);
        }
    }
    
    async _init_textures(){
        const groundTextures = loadTextures("PavingStones")
        applyTextureSettings(groundTextures, 1, 5);

        //Texture for walls
        const wallTextures = loadTextures("PavingStones")
        applyTextureSettings(wallTextures, 4, 1); 

        //Texture for platforms 
        const platformTextures = loadTextures("PavingStones")
        applyTextureSettings(platformTextures, 3, 2);

        return {groundTextures,wallTextures,platformTextures}
    }

    async _init_player(){
        const gltf = await this.loader.loadModel('src/models/cute_alien_character/scene.gltf', 'player');
        const model = gltf.scene; // Get the loaded model
        this.addObject(model); // Add the model to the scene
        model.rotation.set(0, 0, 0); // Rotate the model
        model.scale.set(1,1,1); // Scale the model if necessary
        model.position.set(0, 0.5, 0);
        model.name = "player"; // Name the model
        this.target = model;
        this.target.visible=false;

        //create cannon.js body for model
        this.playerBody = new Body({
            mass: 1, // Dynamic body
            position: new Vec3(0, 2, 0), // Start position
        });
        const boxShape = new Box(new Vec3(0.5, 1, 0.5)); // Box shape for the player
        this.playerBody.addShape(boxShape);
        this.world.addBody(this.playerBody);


        this.cameraManager = new CameraManager(
            this.camera,
            this.target,
            this.playerBody,
            this.scene
        );

        this.setupCharacterLight();
        this.playerLoaded = true;
    }


    async _initGeometries(){
        this.objManager.addGeometry("sideWall",new THREE.BoxGeometry(50, 1, 20));
        this.objManager.addGeometry("platform",new THREE.BoxGeometry(10, 1, 50));
        this.objManager.addGeometry("character",new THREE.BoxGeometry(1, 1, 1));
        this.objManager.addGeometry("ground",new THREE.PlaneGeometry(20, 20));
        this.objManager.addGeometry("redCube",new THREE.BoxGeometry(3, 1, 3));
    }

    async _initMaterials(){
        const {groundTextures,wallTextures,platformTextures} = await this._init_textures()

        this.objManager.addMaterial("sideWall",new THREE.MeshStandardMaterial({
            map: wallTextures.colorMap,
            aoMap: wallTextures.aoMap,
            displacementMap: wallTextures.displacementMap,
            metalnessMap: wallTextures.metalnessMap,
            normalMap: wallTextures.normalMapDX, 
            roughnessMap: wallTextures.roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        })
        );

        this.objManager.addMaterial("platform", new THREE.MeshStandardMaterial({
            map: groundTextures.colorMap,
            aoMap: groundTextures.aoMap,
            displacementMap: groundTextures.displacementMap,
            metalnessMap: groundTextures.metalnessMap,
            normalMap: groundTextures.normalMapDX, 
            roughnessMap: groundTextures.roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        }));

        this.objManager.addMaterial("character",new THREE.MeshStandardMaterial({ 
            color: 0xff0000, 
            transparent: true, 
            opacity: 0.0
        }));
        this.objManager.addMaterial("platforms",new THREE.MeshStandardMaterial({
            map: platformTextures.colorMap,
            aoMap: platformTextures.aoMap,
            displacementMap: platformTextures.displacementMap,
            metalnessMap: platformTextures.metalnessMap,
            normalMap: platformTextures.normalMapDX, 
            roughnessMap: platformTextures.roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        })
        )
        
        this.objManager.addMaterial("ground",new THREE.MeshStandardMaterial({ color: 0x808080 }));
        this.objManager.addMaterial("redCube",new THREE.MeshBasicMaterial({ color: 0x0000ff }));
        this.objManager.addMaterial("greenCube",new THREE.MeshBasicMaterial({ color: 0x008000 }));
    }


    async createObjects(){
        await this._initGeometries();
        await this._initMaterials();

        const groundMesh = this.objManager.createVisualObject("ground", "platform", "platform", {x:0,y:-0.5,z:20});
        const groundBody = this.objManager.createPhysicsObject("ground", "platform", {x:0,y:-0.5,z:20}, null, 0);
        this.objManager.linkObject("ground", groundMesh, groundBody);


        let topPos = {x:0,y:10,z:20};

        const topMesh = this.objManager.createVisualObject("top", "platform", "platform", topPos);
        const topBody = this.objManager.createPhysicsObject("top", "platform", topPos, null, 0);
        this.objManager.linkObject("top", topMesh, topBody);

        topPos.y+=2;

        const redCubeMesh = this.objManager.createVisualObject("redCube", "redCube", "redCube", topPos);
        const redCubeBody = this.objManager.createPhysicsObject("redCube", "redCube", topPos, null, 0);
        this.objManager.linkObject("redCube", redCubeMesh, redCubeBody);


        const greenCubeMesh = this.objManager.createVisualObject("greenBlock", "redCube", "greenCube", {x:-3,y:topPos.y,z:39});
        const greenCubeBody = this.objManager.createPhysicsObject("redCube", "redCube", {x:-3,y:topPos.y,z:39}, null, 0);
        this.objManager.linkObject("greenCube", greenCubeMesh, greenCubeBody);


        const wallConfigurations = [
            {
                name: "backWall",
                geometry: "sideWall",
                material: "sideWall",
                position: { x: 0, y: 2, z: -5 },
                rotation: { x: Math.PI / 2, y: 0, z: 0 }
            },
            {
                name: "left",
                geometry: "sideWall",
                material: "sideWall",
                position: { x: -5, y: 0.8, z: 15 },
                rotation: { x: Math.PI / 2, y: 0, z: Math.PI / 2 }
            },
            {
                name: "right",
                geometry: "sideWall",
                material: "sideWall",
                position: { x: 5, y: 0.8, z: 15 },
                rotation: { x: Math.PI / 2, y: 0, z: Math.PI / 2 }
            },
            {
                name: "end",
                geometry: "sideWall",
                material: "sideWall",
                position: { x: 0, y: 2, z: 40 },
                rotation: { x: Math.PI / 2, y: 0, z: 0 }
            }
        ];
        

        wallConfigurations.forEach((wall)=>{
            const tempMesh = this.objManager.createVisualObject(wall.name,wall.geometry,wall.material,wall.position,wall.rotation);
            const tempBody = this.objManager.createPhysicsObject(wall.name, wall.geometry, wall.position, wall.rotation, 0);
            this.objManager.linkObject(wall.name,tempMesh, tempBody);
        })


        this.scene.background = new THREE.Color(0x333333);

        let i = 0;
        this.platforms.forEach((platform)=>{
            this.objManager.addGeometry("temp",new THREE.BoxGeometry(platform.size.x, platform.size.y, platform.size.z));
            
            this.objManager.createVisualObject("platform"+i,"temp","platforms",platform.position);
            this.objManager.createPhysicsObject("platform"+i,"temp",platform.position);

            this.objManager.removeGeometry("temp");
            i+=1;
        })

    }

    /**
     * Inits the objects in the scene
     */
    async init_objects_() {
        const player = this._init_player()

        //--------------------ADDING OBJECTS----------------------------------------

        //TODO UNCOMMENT
        let res = this.loadLamps();
        let out = this.createObjects()
    }

    /**
     * Inits the camera in the scene
     */
    init_camera_() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0,12,20);
    }

    /**
     * Inits all the lighting required
     */
    init_lighting_() {

        let temp = new THREE.AmbientLight(0x101010, 0.75);
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

    }

    animate=(currentTime)=> {
        this.animationId = requestAnimationFrame(this.animate);

        if (this.cameraManager==undefined||!this.loader.isLoaded() || !this.playerLoaded){
            return;
        }

        this.world.step(1 / 60);
        this.objManager.update();

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

    }

    stopAnimate=()=> {
        cancelAnimationFrame(this.animationId)
        this.animationId=null;
    }

    initAudio() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // this.loadDoorCreakSound();
    }
    
    /**
     * Plays the door creak noise
     */
    loadDoorCreakSound() {
        const self = this;
        fetch('src/audio/wooden-door-creaking.mp3')
            .then((response) => {
                return response.arrayBuffer(); // Return the promise
            })
            .then(arrayBuffer => self.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                self.doorCreakBuffer = audioBuffer;
                console.log('Audio buffer loaded:', audioBuffer); // Log the loaded buffer
            })
            .catch(error => console.error('Error loading door creak sound:', error));
    }

    /**
     * Animation for opening the door
     */
    openDoor() {
        if (!this.isDoorOpen && this.doorAnimationAction) {
            this.doorAnimationAction.reset();
            this.doorAnimationAction.play();
            this.isDoorOpen = true;
            this.playDoorCreakSound(); // Play the door creak sound
            this.gameOverScreen.style.display = 'block';
            this.gameOverScreen.innerHTML = "<h1>Success!</h1><p>You opened the door!</p>";
        }
    }

    /**
     * Play the door creak noise
     */
    playDoorCreakSound() {
        console.log(this.doorCreakBuffer);
        if (this.doorCreakBuffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = this.doorCreakBuffer;
            source.connect(this.audioContext.destination);
            source.start();
        }
    }


    /**
     * Sets up the lighting around the player
     */
    setupCharacterLight() {
        this.characterLight = new THREE.PointLight(0xffffff, 1, 10);
        this.characterLight.position.set(0, 2, 0); // Slightly above the character
        this.target.add(this.characterLight); // Attach the light to the character
    }



    /**
     * Loads all the lamps from the JSON file
     */
    async loadLamps() {

        const gltf = await this.loader.loadModel(this.lampsArray[0].scene,"lamp");
        const model = gltf.scene;

        this.lampsArray.forEach((lamp)=>{
            const position = {x:lamp.positionX,y:lamp.positionY,z:lamp.positionZ};
            const scale = {x:lamp.scaleX,y:lamp.scaleY,z:lamp.scaleZ};
            const clone = model.clone();
            clone.position.set(position.x,position.y,position.z);
            clone.scale.set(scale.x,scale.y,scale.z);
            clone.castShadow = true;

            const lampLight = new THREE.PointLight(0xA96CC3, 0.5, 2); // Purple light 
            const positionLight = { x: position.x, y: position.y + 2, z: position.z }; 
            this.lightManager.addLight(null, lampLight, positionLight);
        })
        

        // const loadPromises = this.lampsArray.map(async (lamp) => {
        //     try {
        //         const name = "lamp" + randomIntFromInterval(0, 10000);
        //         const gltf = await this.loader.loadModel(lamp.scene, name); // Assuming loadModel returns a Promise
        //         const model = gltf.scene;
                
        //         this.addObject(model);
        //         model.position.set(lamp.positionX, lamp.positionY, lamp.positionZ);
        //         model.scale.set(lamp.scaleX, lamp.scaleY, lamp.scaleZ);
        //         model.castShadow = true;
    
        //         const lampLight = new THREE.PointLight(0xA96CC3, 0.5, 2); // Purple light 
        //         const position = { x: lamp.positionX, y: lamp.positionY + 2, z: lamp.positionZ }; 
        //         this.lightManager.addLight(null, lampLight, position);
    
        //         return `Lamp loaded and added to the scene: ${name}`; // Return a message
        //     } catch (error) {
        //         console.error('An error occurred while loading the lamp model:', error);
        //         return `Failed to load lamp: ${lamp.scene}`; // Return error message
        //     }
        // });
    
        // // Wait for all Promises to resolve
        // const results = await Promise.all(loadPromises);
    }


    /**
     * Handles the functionality of flicking lights
     * @param {THREE.Light} light 
     * @param {int} index 
     */
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

    /**
     * Checks how close the player is relative to the door
     */
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


    handleCharacterDeath() {
        this.gameOverScreen.style.display = "block";
        document.body.style.cursor = "pointer"
    }

    /**
     * Restarts the level
     */
    restart() {
        this.gameOverScreen.style.display = "none";

        // Reset character position and camera
        this.target.position.set(0, 0.5, 0);
        // this.camera.position.set(this.target.position.x, this.target.position.y + 0.5, this.target.position.z);
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
        // this.cameraManager.resetStates();
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
            if (this.loader.isLoaded()) {
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

    disposeLevel(){
        if (!this.scene) return;

        this.objManager.removeAllObjects();
        this.lightManager.removeAllLights();
    
        
        if (this.renderer) {
            this.renderer.dispose();
            // Ensure that the renderer's DOM element is removed safely
            try {
                document.body.removeChild(this.renderer.domElement);
            } catch (e) {
                console.warn("Renderer's DOM element could not be removed:", e);
            }
        }


    }
}
