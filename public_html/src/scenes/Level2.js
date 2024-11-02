import * as THREE from 'three';
import { SceneBaseClass } from "../scripts/Scene/SceneBaseClass.js";
import { CameraManager } from "../scripts/Scene/CameraManager.js";
import { ObjectManager } from "../scripts/Scene/ObjectManager.js";
import { LightManager } from "../scripts/Scene/LightManager.js";
import { LoadingManagerCustom } from "../scripts/Loaders/Loader.js";
import { World, Body, Box, Vec3, Sphere } from 'https://unpkg.com/cannon-es@0.18.0/dist/cannon-es.js';
import { loadTextures,applyTextureSettings } from '../scripts/util/TextureLoaderUtil.js';
import { SoundEffectsManager } from '../scripts/Scene/SoundEffectManger.js';
import { MiniMap } from '../scripts/Objects/Minimap.js';
import { Door } from '../scripts/Objects/Door.js';
import { LightMechanicManager } from '../scripts/Scene/LightMechanicManager.js';
import { 
    ceilingPositions, groundPositions, platformPositions, wallPositions, lampPositions, doorPositions, 
    lightsConfig, wallDimensions, platformDimensions, groundDimensions, ceilingDimensions 
} from '../data/objPositions2.js';
// import CannonDebugger from 'cannon-es-debugger';

const soundEffectsManager = new SoundEffectsManager();
soundEffectsManager.toggleLoop("creep2",true);

export class Level2 extends SceneBaseClass {
    constructor(){
        super();
        
        //WORLD
        this.world = new World();
        this.world.gravity.set(0, -12, 0);
        this.playerBody; //cannon.js model
        this.target; //player model

        //LAMPS
        this.points = [];
        this.lampsArray=Object.values(lampPositions);

        this.characterLight;
        
        //MANAGERS
        this.cameraManager;
        this.objManager = new ObjectManager(this.scene,this.world);
        this.lightManager = new LightManager(this.scene);
        this.loader = new LoadingManagerCustom(); 
        this.lightMechanicManager = new LightMechanicManager(this.characterLight,100,20,10);

        //GAME
        this.gameOverScreen = document.getElementById("gameOverScreen");
        this.restartButton = document.getElementById("restartButton");

        //ANIMATION
        this.lastTime = 0;
        this.animationId = null;

        //FLAGS
        this.playerLoaded = false;
        this.objectsLoaded = false;

        //SOUND
        this.nextSoundTime = 1000;
        this.playingAlready = false;

        this.doorPositions = new Door(this.loader);
        this.miniMap = new MiniMap(this.scene);
        //this.debugRenderer = new CannonDebugger(this.scene, this.world);
    }

    initScene(){
        this.init_lighting_();
        this.init_eventHandlers_();
        this.init_objects_();
        this.init_camera_();
        this.miniMap.init_miniMap_(window,document,this.scene);
        const currentDoor = doorPositions.doorOne;
        this.doorPositions.init_door_(this.scene,currentDoor);
        this.animate();
    }//initalizes the scene

    init_camera_() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0,12,20);
    }//initializes the camera

    async _init_textures(){
        const groundTextures = loadTextures("PavingStones")
        applyTextureSettings(groundTextures, 5, 5);
        const wallTextures = loadTextures("PavingStones")
        applyTextureSettings(wallTextures, 5, 5);
        const platformTextures = loadTextures("PavingStones")
        applyTextureSettings(platformTextures, 5, 5);
        const ceilingTextures = loadTextures("PavingStones")
        applyTextureSettings(ceilingTextures, 5, 5);
        return {ceilingTextures, groundTextures, wallTextures, platformTextures}
    }//initializes the textures - basically gets the textures

    async _initMaterials(){
        const {ceilingTextures, groundTextures, wallTextures, platformTextures} = await this._init_textures()//from _init_textures, get the texture/s
        
        this.objManager.addMaterial("character",new THREE.MeshStandardMaterial({ 
            color: 0xff0000, 
            transparent: true, 
            opacity: 0.0
        }));

        this.objManager.addMaterial("platform", new THREE.MeshStandardMaterial({
            map: platformTextures.colorMap,
            aoMap: platformTextures.aoMap,
            displacementMap: platformTextures.displacementMap,
            metalnessMap: platformTextures.metalnessMap,
            normalMap: platformTextures.normalMapDX, 
            roughnessMap: platformTextures.roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        }));//add material to specific geometry - anything named myPlatform will have this material

        this.objManager.addMaterial("wall", new THREE.MeshStandardMaterial({
            map: wallTextures.colorMap,
            aoMap: wallTextures.aoMap,
            displacementMap: wallTextures.displacementMap,
            metalnessMap: wallTextures.metalnessMap,
            normalMap: wallTextures.normalMapDX, 
            roughnessMap: wallTextures.roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        }));//add material to specific geometry - anything named myPlatform will have this material

        this.objManager.addMaterial("ground", new THREE.MeshStandardMaterial({
            map: groundTextures.colorMap,
            aoMap: groundTextures.aoMap,
            displacementMap: groundTextures.displacementMap,
            metalnessMap: groundTextures.metalnessMap,
            normalMap: groundTextures.normalMapDX, 
            roughnessMap: groundTextures.roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        }));//add material to specific geometry - anything named myPlatform will have this material

        this.objManager.addMaterial("ceiling", new THREE.MeshStandardMaterial({
            map: ceilingTextures.colorMap,
            aoMap: ceilingTextures.aoMap,
            displacementMap: ceilingTextures.displacementMap,
            metalnessMap: ceilingTextures.metalnessMap,
            normalMap: ceilingTextures.normalMapDX, 
            roughnessMap: ceilingTextures.roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        }));//add material to specific geometry - anything named myPlatform will have this material
        
    }//initializes the materials

    async _initGeometries(){
        this.objManager.addGeometry("ground",
            new THREE.BoxGeometry(groundDimensions.width, groundDimensions.height, groundDimensions.depth));//width, height, depth (more like height)
        this.objManager.addGeometry("wall", 
            new THREE.BoxGeometry(wallDimensions.width, wallDimensions.height, wallDimensions.depth));
        this.objManager.addGeometry("platform", 
            new THREE.BoxGeometry(platformDimensions.width, platformPositions.height, platformDimensions.depth));
        this.objManager.addGeometry("ceiling", 
            new THREE.BoxGeometry(ceilingDimensions.width, ceilingDimensions.height, ceilingDimensions.depth));
    }//initializes the geometries - adding platforms and such

    async createObjects(){

        await this._initGeometries();
        await this._initMaterials();
        //get the geometries and materials

        platformPositions.forEach((platform)=>{
            const tempMesh = this.objManager.createVisualObject(platform.name,platform.geometry,platform.material,platform.position,platform.rotation);
            const tempBody = this.objManager.createPhysicsObject(platform.name, platform.geometry, platform.position, platform.rotation, 0);
            this.objManager.linkObject(platform.name,tempMesh, tempBody);
        })

        groundPositions.forEach((ground)=>{
            const tempMesh = this.objManager.createVisualObject(ground.name,ground.geometry,ground.material,ground.position,ground.rotation);
            const tempBody = this.objManager.createPhysicsObject(ground.name, ground.geometry, ground.position, ground.rotation, 0);
            this.objManager.linkObject(ground.name,tempMesh, tempBody);
        })

        wallPositions.forEach((wall)=>{
            const tempMesh = this.objManager.createVisualObject(wall.name,wall.geometry,wall.material,wall.position,wall.rotation);
            const tempBody = this.objManager.createPhysicsObject(wall.name, wall.geometry, wall.position, wall.rotation, 0);
            this.objManager.linkObject(wall.name,tempMesh, tempBody);
        })

        ceilingPositions.forEach((ceiling)=>{
            const tempMesh = this.objManager.createVisualObject(ceiling.name,ceiling.geometry,ceiling.material,ceiling.position,ceiling.rotation);
            const tempBody = this.objManager.createPhysicsObject(ceiling.name, ceiling.geometry, ceiling.position, ceiling.rotation, 0);
            this.objManager.linkObject(ceiling.name,tempMesh, tempBody);
        })

        this.scene.background = new THREE.Color(0x333333);//add a background color

    }//creates the objects

    async init_objects_() {
        const player = this._init_player()
        let res = this.loadLamps();
        let out = this.createObjects()
        this.miniMap.addPlayer("#FF0000");
        const doorPlatformPos = platformPositions[0].position;
        this.miniMap.addEndGoal(doorPlatformPos,"#00FF00")
    }//uses createObjects which uses initGeometries and initMaterials - initMaterials uses initTextures... phew, what a rabbt hole

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

        this.playerLoaded = true;
    }

    async loadLamps() {
        // Load the model once
        const gltf = await this.loader.loadModel(this.lampsArray[0].scene, "lamp");
        const model = gltf.scene;
    
        // Predefine light properties
        const lightColor = 0xA96CC3;
        const lightIntensity = 0.5;
        const lightDistance = 2;
    
        // Iterate through each lamp in the lampsArray
        this.lampsArray.forEach(lamp => {
            // Clone the model for each lamp
            const clone = model.clone();
            
            // Set position and scale
            clone.position.set(lamp.positionX, lamp.positionY, lamp.positionZ);
            clone.scale.set(lamp.scaleX, lamp.scaleY, lamp.scaleZ);
            clone.castShadow = true;
    
            // Add the cloned lamp object to the scene
            this.addObject(clone);
    
            // Create and position the light for the lamp
            const lampLight = new THREE.PointLight(lightColor, lightIntensity, lightDistance);
            lampLight.position.set(lamp.positionX, lamp.positionY + 2, lamp.positionZ);
            
            // Optionally, add to a group or manage lights differently if needed
            let position = {x:lampLight.position.x,y:lampLight.position.y+2,z:lampLight.position.z};
            this.lightManager.addLight(null, lampLight, position);
        });
    }

    /**
     * Loads the door model and animations
     * @param {THREE.Scene} scene 
     */
    async init_door_(scene,currentDoor) {
        // Door variables
        let doorMixer;
    
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
            scene.add(Door);
        } catch (error) {
            console.error('An error occurred while loading the door model:', error);
        }

        this.loadDoorCreakSound();
    }

    init_lighting_() {
        let temp = new THREE.AmbientLight(0x101010, 0.75);
        this.lightManager.addLight("ambient", temp, null);

        lightsConfig.forEach(config => {
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

    setupCharacterLight() {
        this.characterLight = new THREE.PointLight(0xffffff, 1, 10);
        this.characterLight.position.set(0, 2, 0); // Slightly above the character
        this.target.add(this.characterLight); // Attach the light to the character

        this.lightMechanicManager.characterLight = this.characterLight;
    }

    /**
     * Light to toggle the intensity to 5 for
     * @param {THREE.Light} light 
     */
    toggleLightIntensity(light) {
        light.intensity = 5;
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

        this.restartButton.addEventListener("click", this.restart.bind(this));
    }

    startDamageTimer(){
        setInterval(()=>{
            if (this.loader.isLoaded()){
                this.lightMechanicManager.damageTimer(this.points,this.target)
            }

            // console.log(this.lightMechanicManager.getHealth())
            if (this.lightMechanicManager.getHealth()<=0){
                this.handleCharacterDeath();
            }
        },1000);
    }

    /**
     * Animation function
     * @param {} currentTime 
     * @returns 
     */
    animate=(currentTime)=> {
        this.animationId = requestAnimationFrame(this.animate);

        //this.debugRenderer.update(); 

        if (this.cameraManager==undefined||!this.loader.isLoaded() || !this.playerLoaded){
            return;
        }

        this.world.step(1 / 60);
        this.objManager.update();

        const timeElapsedSec = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.cameraManager.update(timeElapsedSec)

        if (this.doorMixer) {
            this.doorMixer.update(0.01); // Update the animation mixer
        }
    
        // Check proximity to the door
        this.doorPositions.checkDoorProximity(this.target);
    
        //Handle the 'E' key press to open the door
        document.addEventListener('keydown', (e) => {
            if (e.key === 'e') {
                this.doorPositions.checkIfOpen()
            }
        });

        // Render the scene
        this.renderer.render(this.scene, this.cameraManager.getCamera());
        this.miniMap.update(this.scene,this.target)
    }

    stopAnimate=()=> {
        cancelAnimationFrame(this.animationId)
        this.animationId=null;
    }

    handleCharacterDeath() {
        this.lightMechanicManager.resetHealth();
        this.gameOverScreen.style.display = "block";
        document.body.style.cursor = "pointer"
        this.playerBody.position.set(0,0.5,0);
    }

    restart() {
        this.gameOverScreen.style.display = "none";
        this.playerBody.position.set(0, 0.5, 0);
        this.points.forEach(light => this.toggleLightIntensity(light));
        this.lampsArray.forEach(lampLight => {
            lampLight.intensity = 0.5; // Reset to original intensity
        });
        document.body.style.cursor = "none"
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