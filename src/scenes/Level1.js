import * as THREE from 'three';
import { SceneBaseClass } from "../scripts/Scene/SceneBaseClass.js";
import { lamps } from "../data/lampPos1.js";
import { ObjectManager } from "../scripts/Scene/ObjectManager.js";
import { LightManager } from "../scripts/Scene/LightManager.js";
import { lightsConfigLevel1 } from "../data/lightPos1.js";
import { LoadingManagerCustom } from "../scripts/Loaders/Loader.js";
import { CameraManager } from "../scripts/Scene/CameraManager.js";
// import { World, Body, Box,Vec3 } from 'cannon-es';
import { loadTextures,applyTextureSettings } from '../scripts/util/TextureLoaderUtil.js';
import { LightMechanicManager } from '../scripts/Scene/LightMechanicManager.js';
import { Door } from '../scripts/Objects/Door.js';
import { door } from '../data/doorPos1.js';
import { MiniMap } from '../scripts/Objects/Minimap.js';
import { getRandomInterval } from '../scripts/util/randomInterval.js';
import { SoundEffectsManager } from '../scripts/Scene/SoundEffectManger.js';


const soundEffectsManager = new SoundEffectsManager();

soundEffectsManager.toggleLoop("creep2",true);


export class Level1 extends SceneBaseClass {
    constructor() {
        super(); // Call the base class constructor

        //DOM stuff
        this.gameOverScreen = document.getElementById("gameOverScreen");
        this.restartButton = document.getElementById("restartButton");
        

        //cannon.js world
        this.world = CANNON.World();
        this.world.gravity.set(0, -12, 0);
        this.playerBody; //cannon.js model
        this.target; //player model



        //light stuff
        this.points = [];
        this.lampsArray=Object.values(lamps);
        this.characterLight;


        //MANAGERS
        this.cameraManager;
        this.objManager = new ObjectManager(this.scene,this.world);
        this.lightManager = new LightManager(this.scene);
        this.loader = new LoadingManagerCustom();
        this.lightMechanicManager = new LightMechanicManager(this.characterLight,100,20,10);

        
        //platform positions
        this.platforms = [
            { position: new THREE.Vector3(3, 1.5, 15), size: new THREE.Vector3(5, 3, 5) },
            { position: new THREE.Vector3(-3, 1.5, 20), size: new THREE.Vector3(5, 6.9, 5) },
            { position: new THREE.Vector3(3, 1.5, 30), size: new THREE.Vector3(3, 3, 3) },
            { position: new THREE.Vector3(-3, 1.5, 35), size: new THREE.Vector3(3, 9, 10) }
        ];

        //DOOR
        this.door = new Door(this.loader);
        this.miniMap = new MiniMap(this.scene,20);

        //for animation
        this.lastTime = 0;
        this.animationId = null;

        // flags
        this.playerLoaded = false;
        this.objectsLoaded = false;

        //sound
        this.nextSoundTime = 1000;
        this.playingAlready = false;
        this.enemy=null;
    }

    /**
     * Initilizes the scene with all the objects+lights
     */
    initScene(){

        this.init_eventHandlers_();
        this.init_lighting_();
        this.init_camera_();
        this.init_objects_();
        this.miniMap.init_miniMap_(window,document,this.scene);

        const currentDoor = door.doorOne;
        this.door.init_door_(this.scene,currentDoor);

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

        window.addEventListener("click", () => {
            if (!this.playingAlready){
                soundEffectsManager.playSound("creep2", 0.1);
                this.playingAlready=true;
            }
        });
        window.addEventListener("keydown", () => {
            if (!this.playingAlready){
                soundEffectsManager.playSound("creep2", 0.1);
                this.playingAlready=true;
            }
        });

        this.restartButton.addEventListener("click", this.restart.bind(this));
    }
    
    /**
     * Loads and applies textures
     * @returns groundTexture,wallTexture,platformTexture
     */
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

    /**
     * Loads player model
     */
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
        this.playerBody = new CANNON.Body({
            mass: 1, // Dynamic body
            position: new CANNON.Vec3(0, 2, 0), // Start position
        });
        const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)); // Box shape for the player
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

    /**
     * Inits the geometries used in the scene
     */
    async _initGeometries(){
        this.objManager.addGeometry("sideWall",new THREE.BoxGeometry(50, 1, 30));
        this.objManager.addGeometry("platform",new THREE.BoxGeometry(10, 1, 50));
        this.objManager.addGeometry("character",new THREE.BoxGeometry(1, 1, 1));
        this.objManager.addGeometry("ground",new THREE.PlaneGeometry(20, 20));
    }

    /**
     * Inits the materials used in the scene
     */
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
    }

    /**
     * Creates the objects for the scene
     */
    async createObjects(){
        await this._initGeometries();
        await this._initMaterials();

        const groundMesh = this.objManager.createVisualObject("ground", "platform", "platform", {x:0,y:-0.5,z:20});
        const groundBody = this.objManager.createPhysicsObject("ground", "platform", {x:0,y:-0.5,z:20}, null, 0);
        this.objManager.linkObject("ground", groundMesh, groundBody);


        let topPos = {x:0,y:15,z:20};

        const topMesh = this.objManager.createVisualObject("top", "platform", "platform", topPos);
        const topBody = this.objManager.createPhysicsObject("top", "platform", topPos, null, 0);
        this.objManager.linkObject("top", topMesh, topBody);

        topPos.y+=2;

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
        let res = this.loadLamps();
        let out = this.createObjects()

        //add stuff for minimap
        this.miniMap.addPlayer("#0000FF");
        this.miniMap.addEndGoal({x:-3,y:20,z:39},"#00FF00")

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

    /**
     * Animation function
     * @param {} currentTime 
     * @returns 
     */
    animate=(currentTime)=> {
        this.animationId = requestAnimationFrame(this.animate);

        if (this.cameraManager==undefined||!this.loader.isLoaded() || !this.playerLoaded){
            return;
        }

        this.world.step(1 / 60);
        this.objManager.update();

        const timeElapsedS = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (currentTime >= this.nextSoundTime) {
            soundEffectsManager.playSound("growl",0.5)
            this.nextSoundTime = currentTime + getRandomInterval(7000, 20000); // Set the next sound time (1-5 seconds)
        }



        // // Update the door animation mixer if it exists
        if (this.doorMixer) {
            this.doorMixer.update(0.01); // Update the animation mixer
        }
    
        // Check proximity to the door
        this.door.checkDoorProximity(this.target);
    
        //Handle the 'E' key press to open the door
        document.addEventListener('keydown', (e) => {
            if (e.key === 'e') {
                this.door.checkIfOpen()
            }
        });
        
        this.cameraManager.update(timeElapsedS)

        // Render the scene
        this.renderer.render(this.scene, this.cameraManager.getCamera());

        //update minimap
        this.miniMap.update(this.scene,this.target,null)

    }

    /**
     * Stops the animation
     */
    stopAnimate=()=> {
        cancelAnimationFrame(this.animationId)
        this.animationId=null;
    }

    /**
     * Sets up the lighting around the player
     */
    setupCharacterLight() {
        this.characterLight = new THREE.PointLight(0xffffff, 1, 10);
        this.characterLight.position.set(0, 2, 0); // Slightly above the character
        this.target.add(this.characterLight); // Attach the light to the character

        this.lightMechanicManager.characterLight = this.characterLight;
    }

    /**
     * Loads all the lamps from the JSON file
     */
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
     * Handles character death
     */
    handleCharacterDeath() {
        this.lightMechanicManager.resetHealth();
        this.gameOverScreen.style.display = "block";
        document.body.style.cursor = "pointer"
        this.playerBody.position.set(0,0.5,0);
    }

    /**
     * Restarts the level
     */
    restart() {
        this.gameOverScreen.style.display = "none";

        this.playerBody.position.set(0, 0.5, 0);


        this.points.forEach(light => this.toggleLightIntensity(light));
        this.lampsArray.forEach(lampLight => {
            lampLight.intensity = 0.5; // Reset to original intensity
        });

        document.body.style.cursor = "none"
    }

    /**
     * Light to toggle the intensity to 5 for
     * @param {THREE.Light} light 
     */
    toggleLightIntensity(light) {
        light.intensity = 5;
    }

    /**
     * Starts the health mechanic
     */
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
     * Disposes of assets in the level
     */
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
