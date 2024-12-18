import * as THREE from 'three';
// import CannonDebugger from 'cannon-es-debugger';
import { SceneBaseClass } from "../scripts/Scene/SceneBaseClass.js";
import { ObjectManager } from "../scripts/Scene/ObjectManager.js";
import { LightManager } from "../scripts/Scene/LightManager.js";
import { LoadingManagerCustom } from "../scripts/Loaders/Loader.js";
import { LightMechanicManager } from "../scripts/Scene/LightMechanicManager.js";
import { CameraManager } from "../scripts/Scene/CameraManager.js";
import { GunManager } from '../scripts/Scene/GunManager.js';

import { getRandomMonster } from "../scripts/util/getRandomMonster.js";
import { loadTextures,applyTextureSettings } from '../scripts/util/TextureLoaderUtil.js';
import { SoundEffectsManager } from '../scripts/Scene/SoundEffectManger.js';
import { World, Body, Box, Vec3, Sphere } from 'https://unpkg.com/cannon-es@0.18.0/dist/cannon-es.js';

import { Enemy } from '../scripts/Objects/Enemy.js';
import {Crosshair} from "../scripts/Objects/Crosshair.js";
import { monsters3 } from "../data/monster3.js";
import { lamps3 } from "../data/lampPos3.js";
import { MiniMap } from '../scripts/Objects/Minimap.js';


const soundEffectsManager = new SoundEffectsManager();

soundEffectsManager.toggleLoop("ambienceLevel3",true);


//TODO MAKE MONSTER TAKE QUICKER/MORE DANGERIOUS
// look at level3ahaha.js to see what i ahvent done yet

//player doesnt take damange when collision, to do collision, do smth similar to line 188. this.enemyBody.addEventListener...
// use isEnemyBullet instead of isPlayerBullet, then look at level3.js in the old version to see what to do when the collision happens
// (good luck testing it xd)


export class Level3 extends SceneBaseClass{
    constructor(){
        super()

        this.world = new CANNON.World();
        this.world.gravity.set(0, -12, 0);
        this.playerBody; //cannon.js model
        this.target; //player model

        this.maxHealth = 100; // Define the maximum health
        this.health = this.maxHealth;
        this.loaded = false;
        this.damageRate = 0.05; // Define the damage rate
        this.healingRate = 5; // Define the healing rate

        // this.world = CANNON.World();
        this.enemyModel;


        this.gameOverScreen = document.getElementById("gameOverScreen");
        this.restartButton = document.getElementById("restartButton");

        this.isGamePaused = false;

        //MANAGERS
        this.cameraManager;
        this.objManager = new ObjectManager(this.scene,this.world);
        this.lightManager = new LightManager(this.scene);
        this.loader = new LoadingManagerCustom();
        this.lightMechanicManager = new LightMechanicManager(this.characterLight,100,20,10);

        //flags
        this.playingAlready = false

        //map
        this.miniMap = new MiniMap(this.scene,50);

        //lights
        this.points = [];
        this.lampsArray = Object.values(lamps3);
        this.playerLight;
        this.enemyLight;


        //animation
        this.lastTime = 0;
        this.animationId = null;

        this.enemy=null;

        //pew pew stuff
        this.gunManager;
        this.crosshair = new Crosshair(5, 'white');


        //debug
        // this.debugRenderer = new CannonDebugger(this.scene, this.world);

        this.currentMonster = getRandomMonster(monsters3);

        // timer for comp 
        this.timer = 0;
        // Retrieve the previous best time from local storage
        this.previousBestTime = localStorage.getItem('bestTime') ? parseFloat(localStorage.getItem('bestTime')) : null;

        // Function to update the best time in local storage
        this.updateBestTime = (newTime) => {
            if (this.previousBestTime === null || newTime < this.previousBestTime) {
            localStorage.setItem('bestTime', newTime);
            this.previousBestTime = newTime;
            }
        };

        this.intervalID = null;

        this.initialSpawnPosition = { x: -1, y: 2.5, z: -10 };
    }


    initScene(){
        this.scene.background = new THREE.Color(0x333333);

        this.init_eventHandlers_();
        this.init_lighting_();
        this.init_camera_();
        this.init_objects_();
        // this.loadSkybox();
        this.startDamageTimer();
        this.miniMap.init_miniMap_(window,document,this.scene);
        // Ensure the scene has fully loaded, then simulate a click
    setTimeout(() => {
        document.body.click(); // Simulate a click on the body
    }, 100); // Adding a small delay to ensure everything is initialized
    }   

    // loadSkybox() {
    //     // Load one of the example skyboxes
    //     const loader = new THREE.CubeTextureLoader();
    //     const skyboxTexture = loader.load([
    //         'https://threejs.org/examples/textures/cube/skybox/px.jpg', // +x
    //         'https://threejs.org/examples/textures/cube/skybox/nx.jpg', // -x
    //         'https://threejs.org/examples/textures/cube/skybox/py.jpg', // +y
    //         'https://threejs.org/examples/textures/cube/skybox/ny.jpg', // -y
    //         'https://threejs.org/examples/textures/cube/skybox/pz.jpg', // +z
    //         'https://threejs.org/examples/textures/cube/skybox/nz.jpg'  // -z
    //     ]);

    //     this.scene.background = skyboxTexture;
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
                  this.target.visible=true;

                }else{
                    this.cameraManager.toggleFirstPerson()
                    this.target.visible=false;

                }
                break;


            
            }

          })

        document.addEventListener('mousedown', (event) => {
            //TODO add setting thing back
            if (event.button === 0) { // Only shoot if menu is not open
                this.gunManager.addBullet(this.cameraManager.getCamera(), 0xffffff, { applyPhysics: false });
                this.handlePlayerHit(5); // Handle player hit logic
            }
        });



        window.addEventListener("click", () => {
            if (!this.playingAlready){
                soundEffectsManager.playSound("ambienceLevel3", 0.3);
                this.playingAlready=true;
            }
        });

        window.addEventListener("keydown", () => {
            if (!this.playingAlready){
                soundEffectsManager.playSound("ambienceLevel3", 0.3);
                this.playingAlready=true;
            }
        });

        this.restartButton.addEventListener("click",this.restart.bind(this));

    };

    restart() {
        // Reset player position and health
        this.playerBody.position.copy(new CANNON.Vec3(
            this.initialSpawnPosition.x,
            this.initialSpawnPosition.y,
            this.initialSpawnPosition.z
        ));
        this.playerBody.velocity.set(0, 0, 0); // Reset velocity
        this.playerBody.angularVelocity.set(0, 0, 0); // Reset rotation
        
        // Reset health and UI
        this.health = 100;
        document.getElementById('user-health-bar-container').style.display = 'block';
        document.getElementById('boss-health-bar-container').style.display = 'block';
        
        // Reset enemy
        this.enemy.reset();
        this.enemy.resetPosition();
        this.enemyLight.visible = true;
        this.enemy.asleep = false;
        
        // Reset timer
        this.timer = 0;
        
        // Reset cursor and pointer lock
        document.body.style.cursor = "none"
        this.gameOverScreen.style.display = "none";

        
        // Restart damage timer
        this.startDamageTimer();
        
        // Clear any existing bullets
        if (this.gunManager) {
            this.gunManager.clearAllBullets();
        }
        

        // Restart sound
        if (!this.playingAlready) {
            soundEffectsManager.playSound("ambienceLevel3", 0.3);
            this.playingAlready = true;
        }


    }

    // Add this method to GunManager class
    

    // Handle Player hit
    handlePlayerHit(dmg) {
        
        this.takeDamage(dmg); // Take 10 damage when hit
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

    heal(amount) {
        this.health += amount;
        this.health = Math.min(100, this.health); // Cap health at 100
        // updateCharacterLight(); // Update light when health changes
    }

    calcEuclid(x1, z1, x2, z2) {
        const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(z1 - z2, 2));
        return distance <= 4;
    }

    // function to heal player at lamp
    startDamageTimer(){
        if (this.intervalID) {
            clearInterval(this.intervalID);
        }
        
        this.intervalID = setInterval(()=>{
            if (this.loader.isLoaded()){
                let valid = false;

                this.points.forEach((point) => {
                    if (this.calcEuclid(this.playerBody.position.x, this.playerBody.position.z, point.x, point.z)) {
                        valid = true;
                        // console.log("Player is near a light source");
                        this.heal(this.healingRate);
                    }
                });
            }

            // console.log(this.lightMechanicManager.getHealth())
            if (this.lightMechanicManager.getHealth()<=0){
                // this.youLose();
            }
        },200);
    }

    init_lighting_(){
        const enemyLight = new THREE.PointLight(0xff0400, 1, 100); // Color, intensity, distance
        this.lightManager.addLight("enemyLight",enemyLight,{x:10,y:2,z:5});


        const playerLight = new THREE.PointLight(0xffffff, 1, 50); // Color, intensity, distance
        this.lightManager.addLight("playerLight",playerLight,{x:0,y:1.5,z:0})


        const ambientLight = new THREE.AmbientLight(0xffffff, 0.01); // Soft white light, 0.01 is the intensity
        this.lightManager.addLight("ambient",ambientLight);


        this.enemyLight = this.lightManager.getLight("enemyLight");
        this.playerLight = this.lightManager.getLight("playerLight");

    };


    init_camera_(){
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0,12,20);
    };

    async init_objects_(){
        await this.init_player();
        await this.init_monster_();

        let res = this.loadLamps();
        let out = this.createObjects();
        //add stuff for minimap
        this.miniMap.addPlayer("#0000FF"); // Blue marker for the player
        this.miniMap.addEnemy("#FF0000"); // Red marker for the enemy
    };


    async init_player(){
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
        this.playerBody = new CANNON.Body({
            mass: 1, // Dynamic body
            position: new CANNON.Vec3(-1, 2.5, -10), // Start position
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
        this.miniMap.miniMapCamera.lookAt(0,0,0);
        

    }

    async init_monster_(){
        let currentMonster = getRandomMonster(monsters3);

        const gltf = await this.loader.loadModel(currentMonster.scene,"monster");
        const model = gltf.scene;

        // Traverse the model and update the material
        model.traverse((node) => {
            if (node.isMesh) {
                node.material = new THREE.MeshStandardMaterial({
                    color: node.material.color,
                    map: node.material.map,
                    normalMap: node.material.normalMap,
                    roughness: 0.5, // Adjust as needed
                    metalness: 0.5  // Adjust as needed
                });
            }
        });

        this.addObject(model);

        
        model.position.set(currentMonster.positionX, currentMonster.positionY, currentMonster.positionZ-2);
        model.scale.set(currentMonster.scaleX, currentMonster.scaleY, currentMonster.scaleZ);
        model.castShadow = true;

        this.enemyModel = model;

        this.enemyBody = new CANNON.Body({
            mass: 1, // Dynamic body
            position: new CANNON.Vec3(currentMonster.positionX, currentMonster.positionY, currentMonster.positionZ-2), // Start position
        });
        const boxShape = new CANNON.Box(new CANNON.Vec3(3, 5, 3)); // Box shape for the player
        this.enemyBody.type = Body.KINEMATIC; // Set the body type to KINEMATIC to not be affected by gravity
        this.enemyBody.position.set(this.currentMonster.positionX, 4, this.currentMonster.positionZ); // Set the position
        this.enemyBody.addShape(boxShape);
        this.world.addBody(this.enemyBody);

        this.enemy = new Enemy(currentMonster.health,{ x: 10, y: 4, z: 5 },this.enemyModel,this.enemyBody,this.enemyLight);


        
        this.gunManager = new GunManager(this.scene, this.health, this.enemy, this.player, this.world, this);

    }



    async _initGeometries(){
        this.objManager.addGeometry("platform",new THREE.BoxGeometry(100, 1, 100));
        this.objManager.addGeometry("sidewall",new THREE.BoxGeometry(1, 100, 100));
        this.objManager.addGeometry("ceiling",new THREE.BoxGeometry(100, 1, 100));

    }


    async _init_textures(){
        const textureLoader = loadTextures('PavingStones');
        applyTextureSettings(textureLoader, 10, 10);

        //const platformMaterial = new THREE.MeshStandardMaterial({ map: texture }); 
        const textureLoaderWall = loadTextures('PavingStones');
        applyTextureSettings(textureLoaderWall, 10, 10);


        return {textureLoader,textureLoaderWall}
    }


    async _initMaterials(){
        const {textureLoader,textureLoaderWall} = await this._init_textures()

        this.objManager.addMaterial("platform",new THREE.MeshStandardMaterial({
            map: textureLoader.colorMap,
            aoMap: textureLoader.aoMap,
            displacementMap: textureLoader.displacementMap,
            metalnessMap: textureLoader.metalnessMap,
            normalMap: textureLoader.normalMapDX, 
            roughnessMap: textureLoader.roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        }));

        this.objManager.addMaterial("sidewall",new THREE.MeshStandardMaterial({
            map: textureLoaderWall.colorMap,
            aoMap: textureLoaderWall.aoMap,
            displacementMap: textureLoaderWall.displacementMap,
            metalnessMap: textureLoaderWall.metalnessMap,
            normalMap: textureLoaderWall.normalMapDX, 
            roughnessMap: textureLoaderWall.roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        }));

        this.objManager.addMaterial("ceiling",new THREE.MeshStandardMaterial({
            map: textureLoader.colorMap,
            aoMap: textureLoader.aoMap,
            displacementMap: textureLoader.displacementMap,
            metalnessMap: textureLoader.metalnessMap,
            normalMap: textureLoader.normalMapDX, 
            roughnessMap: textureLoader.roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        }));

    }

    async createObjects(){
        await this._initGeometries();
        await this._initMaterials();

        const platformMesh = this.objManager.createVisualObject("platform","platform","platform",null,null);
        const platformBody = this.objManager.createPhysicsObject("platform","platform",null,null,0);
        this.objManager.linkObject("platform",platformMesh,platformBody);

        const ceilingMesh = this.objManager.createVisualObject("ceiling","ceiling","ceiling", { x: 0, y: 50, z: 0 }, { x: 0, y: 0, z: 0 });
        const ceilingBody = this.objManager.createPhysicsObject("ceiling","ceiling", { x: 0, y: 50, z: 0 }, { x: 0, y: 0, z: 0 }, 0);
        this.objManager.linkObject("ceiling",ceilingMesh,ceilingBody);

        const wallsData = [
            {
                name:"wall1",
                geometry:"sidewall",
                material:"sidewall",
                position: { x: 0, y: 50, z: -50 },
                rotation: {x:0, y: Math.PI / 2,z:0 } // Rotate 90 degrees around the Y-axis
            },
            {
                name:"wall2",
                geometry:"sidewall",
                material:"sidewall",
                position: { x: 50, y: 50, z: 0 },
                rotation: { x:0,y: 0,z:0 } // No rotation
            },
            {
                name:"wall3",
                geometry:"sidewall",
                material:"sidewall",
                position: { x: 0, y: 50, z: 50 },
                rotation: { x:0,y: Math.PI / 2,z:0 } // Rotate 90 degrees around the Y-axis
            },
            {
                name:"wall4",
                geometry:"sidewall",
                material:"sidewall",
                position: { x: -50, y: 50, z: 0 },
                rotation: {x:0, y: 0,z:0 } // No rotation
            }
        ];

        wallsData.forEach((wall)=>{
            const tempMesh = this.objManager.createVisualObject(wall.name,wall.geometry,wall.material,wall.position,wall.rotation);
            const tempBody = this.objManager.createPhysicsObject(wall.name, wall.geometry, wall.position, wall.rotation, 0);
            this.objManager.linkObject(wall.name,tempMesh, tempBody);
        })

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
         // Add lamp positions to points array
        this.lampsArray.forEach(lamp => {
            this.points.push(new CANNON.Vec3(lamp.positionX, lamp.positionY, lamp.positionZ));
        });
    }
   


    youWin() {
        //stop animations
        document.exitPointerLock();

        let prev = localStorage.getItem('bestTime') ? parseFloat(localStorage.getItem('bestTime')) : null;
        if(prev === null) {
            prev = "No best time yet!";
        } else {
            prev = prev.toFixed(2) + " seconds";
        }
        
        document.getElementById('gameOverHeader').innerText = "You Win!\nYou have defeated the monster and escaped the darkness!\n\nTime taken to defeat boss: " 
            + this.timer.toFixed(2) + " seconds\nPrevious best time: " + prev;
        this.enemy.asleep = true;

        this.updateBestTime(this.timer); // Update the best time in local storage

        console.log("You win!"); // Display win message if health reaches zero
        this.gameOverScreen.style.display = "block"; // Show game over screen

        document.getElementById('user-health-bar-container').style.display = 'none';
        document.getElementById('boss-health-bar-container').style.display = 'none';
        this.enemyLight.visible = false;

        //stop ambient sound
        soundEffectsManager.toggleLoop("ambienceLevel3")
    }
    
    // Function to handle loss condition
    youLose() {
        document.exitPointerLock();

        //stop animations
        // cancelAnimationFrame(this.animationId);

        // document.exitPointerLock();

        document.getElementById('gameOverHeader').innerText = "You Died!\nYou ran out of light and the darkness consumed you!";
        this.enemy.asleep = true;

        console.log("You lose!"); // Display lose message if health reaches zero
        this.gameOverScreen.style.display = "block"; // Show game over screen

        document.body.style.cursor = "url('public/icons/cursor.png'), auto; "



        document.getElementById('user-health-bar-container').style.display = 'none';
        document.getElementById('boss-health-bar-container').style.display = 'none';
        this.enemyLight.visible = false;

        //stop ambient sound
        soundEffectsManager.toggleLoop("ambienceLevel3")
    }

    animate=(currentTime)=> {
        this.animationId = requestAnimationFrame(this.animate);


        if (this.cameraManager==undefined||!this.loader.isLoaded()){
            return;
        }

        if (this.enemy) {
            this.enemy.updateEnemyRotation(this.playerBody.position);
        }


        this.world.step(1 / 60);
        // this.debugRenderer.update(); // comment for debugging


        this.gunManager.updateAllBullets();

        this.objManager.update();

        const timeElapsedS = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (this.health <= 0) {
            this.youLose(); // Call the lose condition function
        } 
        else if (this.enemy.getHealth() <= 0) {
            this.youWin(); // Call the win condition function
        }


        
        this.updatePlayerHealthBar();
        this.takeDamage(this.damageRate);

        this.gunManager.updateBulletsPlayer(this.enemyBody);
        this.gunManager.updateBulletsEnemy(this.playerBody);
    
        this.playerLight.position.set(this.playerBody.position.x, this.playerBody.position.y + 1.5, this.playerBody.position.z);
        this.enemyLight.position.set(this.enemyBody.position.x, this.enemyBody.position.y + 2, this.enemyBody.position.z);

        if(this.enemy.isRageMode()){
            this.enemyLight.intensity = 10;
        }else{
            this.enemyLight.intensity = 1;
        }

        this.gunManager.checkAndShoot(this.playerBody, this.enemyBody);
        this.cameraManager.update(timeElapsedS);

        this.renderer.render(this.scene, this.cameraManager.getCamera());

        // Update minimap
        this.miniMap.update(this.scene, this.target, this.enemyModel);

        
        // Start timer only when boss is awake
        if (!this.enemy.isAsleep() && this.enemy.getHealth() > 0) {
            this.timer += timeElapsedS;
        }

    }

    /**
     * Stops the animation
     */
    stopAnimate=()=> {
        cancelAnimationFrame(this.animationId)
        this.animationId=null;
    }


    lockPointer() {
        // if (!isSettingsMenuOpen) { // Only lock pointer if settings menu is not open
            this.renderer.domElement.requestPointerLock();
        // }
    }


    
    /**
     * Disposes of assets in the level
     */
    disposeLevel(){
        if (!this.scene) return;

        this.objManager.removeAllObjects();
        this.lightManager.removeAllLights();

        if (this.miniMap){
            this.miniMap.dispose();
            this.miniMap=true;
        }
    
        
        if (this.renderer) {
            this.renderer.dispose();
            // Ensure that the renderer's DOM element is removed safely
            try {
                document.body.removeChild(this.renderer.domElement);
            } catch (e) {
                console.warn("Renderer's DOM element could not be removed:", e);
            }
        }



        location.reload();

    }

    

}