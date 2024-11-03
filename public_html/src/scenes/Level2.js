// import * as THREE from 'three';
import { SceneBaseClass } from "../scripts/Scene/SceneBaseClass.js";
import { CameraManager } from "../scripts/Scene/CameraManager.js";
import { ObjectManager } from "../scripts/Scene/ObjectManager.js";
import { LightManager } from "../scripts/Scene/LightManager.js";
import { LoadingManagerCustom } from "../scripts/Loaders/Loader.js";
import { World, Body, Box, Vec3, Sphere } from 'https://unpkg.com/cannon-es@0.18.0/dist/cannon-es.js';
import { loadTextures,applyTextureSettings } from "../scripts/util/TextureLoaderUtil.js"
import { SoundEffectsManager } from '../scripts/Scene/SoundEffectManger.js';
import { MiniMap } from '../scripts/Objects/Minimap.js';
import { Door } from '../scripts/Objects/Door.js';
import { LightMechanicManager } from '../scripts/Scene/LightMechanicManager.js';
import { 
    smallGroundPositions, ceilingPositions, groundPositions, platformPositions, wallPositions, lampPositions, doorPositions, buttonPositions, 
    lightsConfig, smallGroundDimensions, wallDimensions, platformDimensions, groundDimensions, ceilingDimensions, buttonDimensions
} from '../data/objPositions2.js';  

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
        this.playerLight;
        this.points2 = [];
        

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

        this.isGamePaused = false;

        //ANIMATION
        this.lastTime = 0;
        this.animationId = null;

        //health
        this.maxHealth = 100; // Define the maximum health
        this.health = this.maxHealth;
        this.loaded = false;
        this.damageRate = 0.10; // Define the damage rate
        this.healingRate = 10; // Define the healing rate

        //FLAGS
        this.playerLoaded = false;
        this.objectsLoaded = false;
        this.playingAlready = false;
        this.ended = false;


        //SOUND
        this.nextSoundTime = 1000;
        this.playingAlready = false;

        this.doorPositions = new Door(this.loader);
        this.miniMap = new MiniMap(this.scene,20);
        this.enemy=null;

        //button
    }

    initScene(){

        this.scene.background = new THREE.Color(0x333333);
        this.init_lighting_();
        this.init_eventHandlers_();
        this.init_objects_();
        this.init_camera_();
        this.miniMap.init_miniMap_(window,document,this.scene);
        this.startDamageTimer();
        // this.startDamageTimer();
        const currentDoor = doorPositions.doorOne;
        this.doorPositions.init_door_(this.scene,currentDoor);

        // this.animate();
    }//initalizes the scene

    init_camera_() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0,12,20);
    }//initializes the camera

    async _init_textures(){
        const groundTextures = loadTextures("PavingStones")
        applyTextureSettings(groundTextures, 5, 5);
        const wallTextures = loadTextures("PavingStones")
        applyTextureSettings(wallTextures, 4, 2);
        const platformTextures = loadTextures("PavingStones")
        applyTextureSettings(platformTextures, 1, 0.5);
        const ceilingTextures = loadTextures("PavingStones")
        applyTextureSettings(ceilingTextures, 5, 5);
        const smallGroundTextures = loadTextures("PavingStones")
        applyTextureSettings(smallGroundTextures, 3, 3);
        const buttonTextures = loadTextures("Planks")
        applyTextureSettings(buttonTextures, 2, 2);
        return {ceilingTextures, groundTextures, wallTextures, platformTextures, smallGroundTextures, buttonTextures}
    }//initializes the textures - basically gets the textures

    async _initMaterials(){
        const {smallGroundTextures, ceilingTextures, groundTextures, wallTextures, platformTextures, buttonTextures} = await this._init_textures()//from _init_textures, get the texture/s
        
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

        this.objManager.addMaterial("smallGround", new THREE.MeshStandardMaterial({
            map: smallGroundTextures.colorMap,
            aoMap: smallGroundTextures.aoMap,
            displacementMap: smallGroundTextures.displacementMap,
            metalnessMap: smallGroundTextures.metalnessMap,
            normalMap: smallGroundTextures.normalMapDX, 
            roughnessMap: smallGroundTextures.roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        }));//add material to specific geometry - anything named myPlatform will have this material

        this.objManager.addMaterial("button", new THREE.MeshStandardMaterial({
            map: buttonTextures.colorMap,
            aoMap: buttonTextures.aoMap,
            displacementMap: buttonTextures.displacementMap,
            metalnessMap: buttonTextures.metalnessMap,
            normalMap: buttonTextures.normalMapDX, 
            roughnessMap: buttonTextures.roughnessMap,
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
        this.objManager.addGeometry("smallGround", 
            new THREE.BoxGeometry(smallGroundDimensions.width, smallGroundDimensions.height, smallGroundDimensions.depth));
        this.objManager.addGeometry("button", 
            new THREE.BoxGeometry(buttonDimensions.width, buttonDimensions.height, buttonDimensions.depth));
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

        smallGroundPositions.forEach((smallGround)=>{
            const tempMesh = this.objManager.createVisualObject(smallGround.name,smallGround.geometry,smallGround.material,smallGround.position,smallGround.rotation);
            const tempBody = this.objManager.createPhysicsObject(smallGround.name, smallGround.geometry, smallGround.position, smallGround.rotation, 0);
            this.objManager.linkObject(smallGround.name,tempMesh, tempBody);
        })

        buttonPositions.forEach((button)=>{
            const tempMesh = this.objManager.createVisualObject(button.name,button.geometry,button.material,button.position,button.rotation);
            const tempBody = this.objManager.createPhysicsObject(button.name, button.geometry, button.position, button.rotation, 0);
            this.objManager.linkObject(button.name,tempMesh, tempBody);
        })

        this.scene.background = new THREE.Color(0x333333);//add a background color

    }//creates the objects

    async init_objects_() {
        const player = this._init_player()
        let res = this.loadLamps();
        let out = this.createObjects()
        this.miniMap.addPlayer("#0000FF");
        const doorPlatformPos = platformPositions[0].position;
        this.miniMap.addEndGoal(doorPlatformPos,"#00FF00")
    }//uses createObjects which uses initGeometries and initMaterials - initMaterials uses initTextures... phew, what a rabbit hole

    async _init_player(){
        const gltf = await this.loader.loadModel('src/models/cute_alien_character/scene.gltf', 'player');
        document.getElementById('user-health-bar-container').style.display = 'block'; // Show the health bar
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
        this.miniMap.miniMapCamera.lookAt(0,0,0);
    }

    async loadLamps() {
        // Load the model once
        const gltf = await this.loader.loadModel(this.lampsArray[0].scene, "lamp");
        const model = gltf.scene;
    
        // Predefine light properties
        const lightColor = 0xA96CC3;
        const lightIntensity = 30;
        const lightDistance = 50;
    
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

        this.lampsArray.forEach(lamp => {
            this.points2.push(new CANNON.Vec3(lamp.positionX, lamp.positionY, lamp.positionZ));
        });
    }

    init_lighting_() {
        let temp = new THREE.AmbientLight(0x101010, 0.75);
        this.lightManager.addLight("ambient", temp, null);
        // const playerLight = new THREE.PointLight(0xffffff, 1, 50); // Color, intensity, distance
        // this.lightManager.addLight("playerLight",playerLight,{x:0,y:1.5,z:0})
        // this.playerLight = this.lightManager.getLight("playerLight");
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

    /**
     * Light to toggle the intensity to 5 for
     * @param {THREE.Light} light 
     */
    // toggleLightIntensity(light) {
    //     light.intensity = 5;
    // }

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

        document.addEventListener("Resume",(e)=>{
            this.startDamageTimer();
        })

        document.addEventListener("Pause",(e)=>{
            clearInterval(this.intervalID);
        })


    }

    calcEuclid(x1, y1, z1, x2, y2, z2) {
        const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
        return distance <= 4;
    }

    heal(amount) {
        this.health += amount;
        this.health = Math.min(100, this.health); // Cap health at 100
        // updateCharacterLight(); // Update light when health changes
    }

    // function to heal player at lamp
    startDamageTimer(){
        if (this.intervalID) {
            clearInterval(this.intervalID);
        }


        this.intervalID = setInterval(()=>{
            if (this.loader.isLoaded()){
                let valid = false;

                this.points2.forEach((point) => {
                    if (this.calcEuclid(this.playerBody.position.x, this.playerBody.position.y, this.playerBody.position.z, point.x, point.y, point.z)) {
                        valid = true;
                        console.log("Player is near a light source");
                        this.heal(this.healingRate);
                    }
                });
            }

            // console.log(this.lightMechanicManager.getHealth())
            if (this.lightMechanicManager.getHealth()<=0){
                // this.youLose();
                console.log("You lose");
            }
        },200);
    }

    takeDamage(amount) {
        this.health -= amount;
        this.health = Math.max(0, this.health); // Ensure health doesn't go below 0
        // updateCharacterLight(); // Update light when health changes
        // console.log("Player health:", this.health); // Log the player's health
    }

    updatePlayerHealthBar(){
        const healthBar = document.getElementById('user-health-bar');
        const healthPercentage = (this.health / this.maxHealth) * 100; // Calculate percentage
        healthBar.style.width = `${healthPercentage}%`; // Update the width of the health bar
    }

    // Function to handle loss condition
    youLose() {
        document.exitPointerLock();
        //stop animations
        // cancelAnimationFrame(this.animationId);
        if (this.intervalID){
            clearInterval(this.intervalID);
            this.intervalID=null;
        }

        document.getElementById('gameOverHeader').innerText = "You Died!\nYou ran out of light and the darkness consumed you!";

        console.log("You lose!"); // Display lose message if health reaches zero
        this.gameOverScreen.style.display = "block"; // Show game over screen

        document.getElementById('user-health-bar-container').style.display = 'none';
        document.getElementById('boss-health-bar-container').style.display = 'none';

    }

    // restartGame() {
    //     location.reload(); // Reload the page to restart the game
    // }


    /**
     * Animation function
     * @param {} currentTime 
     * @returns 
     */
    animate = (currentTime) => {
        this.animationId = requestAnimationFrame(this.animate);
    
        if (this.cameraManager == undefined || !this.loader.isLoaded() || !this.playerLoaded) {
            return;
        }
    
        if (this.health <= 0) {
            this.youLose(); // Call the lose condition function
        } 
        const platformsToRaise = [
            "backFromCentrePlatform1",
            "backFromCentrePlatform2",
            "backFromCentrePlatform3",
            "backFromCentrePlatform4",
            "frontFromCentrePlatform1",
            "frontFromCentrePlatform2",
            "frontFromCentrePlatform3",
            "frontFromCentrePlatform4",
            "leftFromCentrePlatform1",
            "leftFromCentrePlatform2",
            "leftFromCentrePlatform3",
            "leftFromCentrePlatform4",
            "rightFromCentrePlatform1",
            "rightFromCentrePlatform2",
            "rightFromCentrePlatform3",
            "rightFromCentrePlatform4",
            "rightCentrePlatform",
            "leftCentrePlatform"
        ];

        const centreButton = this.objManager.getObject("centreButton");
        if (centreButton && this.playerBody.position.distanceTo(centreButton.position) <= 2) {
            platformsToRaise.forEach(platformName => {
            const platform = this.objManager.getObject(platformName);
            const platformBody = this.objManager.getPhysicsObject(platformName);
            if (platform && platformBody) {
            if(platform.name=="leftFromCentrePlatform1" && platform.position.y < 3){
                platform.position.y += 0.01;
                platformBody.position.y += 0.01; 
            }
            else if(platform.name=="leftFromCentrePlatform2" && platform.position.y < 5.5){
                platform.position.y += 0.01;
                platformBody.position.y += 0.01;
            }
            else if(platform.name=="leftFromCentrePlatform3" && platform.position.y < 8){
                platform.position.y += 0.01;
                platformBody.position.y += 0.01;
            }
            else if(platform.name=="leftFromCentrePlatform4" && platform.position.y < 10.5){
                platform.position.y += 0.01;
                platformBody.position.y += 0.01;
            }
            }});
        }
        const leftButton = this.objManager.getObject("leftButton");
        if (leftButton && this.playerBody.position.distanceTo(leftButton.position) <= 2) {
            platformsToRaise.forEach(platformName => {
            const platform = this.objManager.getObject(platformName);
            const platformBody = this.objManager.getPhysicsObject(platformName);
            if (platform && platformBody) {
                if(platform.name=="leftFromCentrePlatform1" && platform.position.y < 12.83333){
                    platform.position.y += 0.01;
                    platformBody.position.y += 0.01; 
                }
                else if(platform.name=="leftFromCentrePlatform2" && platform.position.y < 12.83333){
                    platform.position.y += 0.01;
                    platformBody.position.y += 0.01;
                }
                else if(platform.name=="leftFromCentrePlatform3" && platform.position.y < 12.83333){
                    platform.position.y += 0.01;
                    platformBody.position.y += 0.01;
                }
                else if(platform.name=="leftFromCentrePlatform4" && platform.position.y < 12.83333){
                    platform.position.y += 0.01;
                    platformBody.position.y += 0.01;
                }
                else if(platform.name=="leftCentrePlatform" && platform.position.y < 12.83333){
                    platform.position.y += 0.01;
                    platformBody.position.y += 0.01; 
                }
                else if(platform.name=="rightCentrePlatform" && platform.position.y < 12.83333){
                    platform.position.y += 0.0095;
                    platformBody.position.y += 0.0095; 
                }
                else if(platform.name=="rightFromCentrePlatform1" && platform.position.y < 12.83333){
                    platform.position.y += 0.009;
                    platformBody.position.y += 0.009; 
                }
                else if(platform.name=="rightFromCentrePlatform2" && platform.position.y < 12.83333){
                    platform.position.y += 0.0085;
                    platformBody.position.y += 0.0085;
                }
                else if(platform.name=="rightFromCentrePlatform3" && platform.position.y < 12.83333){
                    platform.position.y += 0.008;
                    platformBody.position.y += 0.008;
                }
                else if(platform.name=="rightFromCentrePlatform4" && platform.position.y < 12.83333){
                    platform.position.y += 0.0075;
                    platformBody.position.y += 0.0075;
                }
                else if(platform.name=="frontFromCentrePlatform1" && platform.position.y < 10.5){
                    platform.position.y += 0.01;
                    platformBody.position.y += 0.01; 
                }else if(platform.name=="frontFromCentrePlatform2" && platform.position.y < 8){
                    platform.position.y += 0.01;
                    platformBody.position.y += 0.01;
                }
                else if(platform.name=="frontFromCentrePlatform3" && platform.position.y < 5.5){
                    platform.position.y += 0.01;
                    platformBody.position.y += 0.01;
                }
                else if(platform.name=="frontFromCentrePlatform4" && platform.position.y < 3){
                    platform.position.y += 0.01;
                    platformBody.position.y += 0.01;
                }
            }});
        }
        const rightButton = this.objManager.getObject("rightButton");
        if (rightButton && this.playerBody.position.distanceTo(rightButton.position) <= 2) {
            platformsToRaise.forEach(platformName => {
            const platform = this.objManager.getObject(platformName);
            const platformBody = this.objManager.getPhysicsObject(platformName);
            if (platform && platformBody) 
            {
                if(platform.name=="backFromCentrePlatform1" && platform.position.y < 12.83333){
                    platform.position.y += 0.01;
                    platformBody.position.y += 0.01; 
                }else if(platform.name=="backFromCentrePlatform2" && platform.position.y < 12.83333){
                    platform.position.y += 0.009;
                    platformBody.position.y += 0.009;
                }
                else if(platform.name=="backFromCentrePlatform3" && platform.position.y < 12.83333){
                    platform.position.y += 0.008;
                    platformBody.position.y += 0.008;
                }
                else if(platform.name=="backFromCentrePlatform4" && platform.position.y < 12.83333){
                    platform.position.y += 0.007;
                    platformBody.position.y += 0.007;
                }
                
            }});
        }
        
        this.world.step(1 / 60);
        this.objManager.update();

        const timeElapsedSec = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.cameraManager.update(timeElapsedSec)

        if (this.doorMixer) {
            this.doorMixer.update(0.01); // Update the animation mixer
        }
        this.lightMechanicManager.updateHealthBar();
        // Check proximity to the door
        this.doorPositions.checkDoorProximity(this.target);
    
        //Handle the 'E' key press to open the door
        document.addEventListener('keydown', (e) => {
            if (e.key === 'e') {
                const res = this.doorPositions.checkIfOpen()
                clearInterval(this.intervalID);

                if (res){
                    setTimeout(()=>{
                        this.ended=true;
                        this.endLevel();
                    },1000)
                }
            }
        });

        // Render the scene
        this.renderer.render(this.scene, this.cameraManager.getCamera());
        this.miniMap.update(this.scene,this.target)

        this.takeDamage(this.damageRate);
        this.updatePlayerHealthBar();
    }

    stopAnimate=()=> {
        cancelAnimationFrame(this.animationId)
        this.animationId=null;
    }


    restart(){
        this.playerBody.position.set(0, 3, 0);
        this.points.forEach(light => this.toggleLightIntensity(light));
        this.lampsArray.forEach(lampLight => {
            lampLight.intensity = 0.5; // Reset to original intensity
        });
        document.body.style.cursor = "none"


        this.gameOverScreen.style.display = "none";
        document.getElementById('gameOverHeader').innerText = "";
        this.startDamageTimer();
        this.health = 100;
        document.getElementById('user-health-bar-container').style.display = 'block';




    }

    disposeLevel(){
        if (!this.scene) return;

        this.objManager.removeAllObjects();
        this.lightManager.removeAllLights();

        if (this.miniMap){
            this.miniMap.dispose();
        }

        clearInterval(this.intervalID);


        if (this.renderer) {
            this.renderer.dispose();
            // Ensure that the renderer's DOM element is removed safely
            try {
                document.body.removeChild(this.renderer.domElement);
            } catch (e) {
                console.warn("Renderer's DOM element could not be removed:", e);
            }
        }



        this.world = null;
        this.playerBody= null; //cannon.js model
        this.target= null; //player model

        //LAMPS
        this.points = null;
        this.lampsArray= null;
        this.playerLight= null;
        this.points2 = null;
        

        this.characterLight= null;
        
        //MANAGERS
        this.cameraManager= null;
        this.objManager = null;
        this.lightManager = null;
        this.loader = null; 
        this.lightMechanicManager = null;

        this.doorPositions = null;
        this.enemy=null;
        location.reload();

    }
}