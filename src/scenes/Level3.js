import * as THREE from 'three';

import { SceneBaseClass } from "../scripts/Scene/SceneBaseClass";
import { ObjectManager } from "../scripts/Scene/ObjectManager";
import { LightManager } from "../scripts/Scene/LightManager";
import { LoadingManagerCustom } from "../scripts/Loaders/Loader";
import { LightMechanicManager } from "../scripts/Scene/LightMechanicManager";
import { CameraManager } from "../scripts/Scene/CameraManager";
import { GunManager } from '../scripts/Scene/GunManager';

import { getRandomMonster } from "../scripts/util/getRandomMonster";
import { loadTextures,applyTextureSettings } from '../scripts/util/TextureLoaderUtil';
import { SoundEffectsManager } from '../scripts/Scene/SoundEffectManger';
import { World, Body, Box,Vec3 } from 'cannon-es';
import { Enemy } from '../scripts/Objects/Enemy';
import { Bullet } from '../scripts/Objects/bullet';
import {Crosshair} from "../scripts/Objects/Crosshair";
import { monsters3 } from "../data/monster3";
import { lamps3 } from "../data/lampPos3";


const soundEffectsManager = new SoundEffectsManager();

soundEffectsManager.toggleLoop("ambienceLevel3",true);


export class Level3 extends SceneBaseClass{
    constructor(){
        super()

        this.world = new World();
        this.world.gravity.set(0, -9.82, 0);
        this.playerBody; //cannon.js model
        this.target; //player model

        this.enemyBody;
        this.enemyModel;


        this.gameOverScreen = document.getElementById("gameOverScreen");
        this.restartButton = document.getElementById("restartButton");



        //MANAGERS
        this.cameraManager;
        this.objManager = new ObjectManager(this.scene,this.world);
        this.lightManager = new LightManager(this.scene);
        this.loader = new LoadingManagerCustom();
        this.lightMechanicManager = new LightMechanicManager(this.characterLight,100,20,10);

        //flags
        this.playingAlready = false

        //lights
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

    }


    initScene(){
        this.scene.background = new THREE.Color(0x333333);

        this.init_eventHandlers_();
        this.init_lighting_();
        this.init_camera_();
        this.init_objects_();

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
                this.gunManager.addBulletPlayer(this.cameraManager.getCamera(),0xffffff,this.world);
                // handlePlayerHit(5); // Handle player hit logic
            }
        });

        // document.addEventListener('click', () => {
        //     this.lockPointer(); // Attempt to lock pointer on click
        // });




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

        this.restartButton.addEventListener("click", this.restartGame);

    };

    init_lighting_(){
        const enemyLight = new THREE.PointLight(0xff0400, 1, 100); // Color, intensity, distance
        this.lightManager.addLight("enemyLight",enemyLight,{x:10,y:2,z:5});


        const playerLight = new THREE.PointLight(0xffffff, 1, 50); // Color, intensity, distance
        this.lightManager.addLight("playerLight",playerLight,{x:0,y:1.5,z:0})


        const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light, 0.01 is the intensity
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

    };

    async init_player(){
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
            position: new Vec3(-1, 2.5, -10), // Start position
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

        // this.playerBody.addEventListener('collide', (event) => {
        //     console.log(event);
        //     const { bodyA, bodyB } = event; 
        //     console.log(bodyA,bodyB)
        //     // this.handleCollision(event);
        // });

    }

    async init_monster_(){
        let currentMonster = getRandomMonster(monsters3);

        const gltf = await this.loader.loadModel(currentMonster.scene,"monster");
        const model = gltf.scene;
        this.addObject(model);

        
        model.position.set(currentMonster.positionX, currentMonster.positionY, currentMonster.positionZ-2);
        model.scale.set(currentMonster.scaleX, currentMonster.scaleY, currentMonster.scaleZ);
        model.castShadow = true;

        this.enemyModel = model;

        this.enemyBody = new Body({
            mass: 1, // Dynamic body
            position: new Vec3(currentMonster.positionX, currentMonster.positionY, currentMonster.positionZ-2), // Start position
            shape: new Box(new Vec3(2, 2, 2)) // Box shape for the player
        });

        const boxShape = new Box(new Vec3(0.5, 1, 0.5)); // Box shape for the player
        this.enemyBody.addShape(boxShape);

        this.world.addBody(this.enemyBody);



        const wireframeGeometry = new THREE.BoxGeometry(2, 2, 2);
        const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);

        // Position the wireframe box at the center of the bounding box
        wireframe.position.copy(this.enemyBody.position);

        this.addObject(wireframe);

        this.enemy = new Enemy(currentMonster.health,{x:currentMonster.positionX,y:currentMonster.positionY,z:currentMonster.positionZ},this.enemyModel,this.enemyBody,this.enemyLight);

        
        this.gunManager = new GunManager(this.scene,100,this.enemy,this.playerBody);

        this.enemyBody.addEventListener('collide', (event) => {
            let obj = this.world.getBodyById(event.body.id);
            if (this.gunManager.isPlayerBullet(obj)){
                this.gunManager.enemy.handleEnemyHit();
                this.gunManager.removeBulletPlayer(obj)
            }
        });
    }





    async _initGeometries(){
        this.objManager.addGeometry("platform",new THREE.BoxGeometry(100, 1, 100));
        this.objManager.addGeometry("sidewall",new THREE.BoxGeometry(1, 100, 100));

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

    }

    async createObjects(){
        await this._initGeometries();
        await this._initMaterials();



        const platformMesh = this.objManager.createVisualObject("platform","platform","platform",null,null);
        const platformBody = this.objManager.createPhysicsObject("platform","platform",null,null,0);
        this.objManager.linkObject("platform",platformMesh,platformBody);


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
    }

    restartGame() {
    }

     youWin() {
        document.getElementById('header-end').innerText = "You Win!\nYou have slain the beast aka your MOM!!! *GASP*\nShe turned into a monster because you didn't do the dishes!";
        isEnemyAsleep = true;
        isGamePaused = true; // Pause the game
        console.log("You win!"); // Display win message if health reaches zero
        enemyCurrentHealth = 0; // Prevent negative health
        gameOverScreen.style.display = "block"; // Show game over screen
        document.exitPointerLock(); // Exit mouse lock
        document.getElementById('health-bar-container').style.display = 'none';
        crosshair.hideCrosshair();
        // cubeEnemy.visible = false;
        enemyLight.visible = false;
        //stop ambient sound
        ambientSound.pause();
    }
    
    // Function to handle loss condition
     youLose() {
        document.getElementById('header-end').innerText = "You Died!\nYou ran out of light and the darkness consumed you!";
        this.enemy.asleep = true;

        console.log("You lose!"); // Display lose message if health reaches zero
        this.gameOverScreen.style.display = "block"; // Show game over screen

        //TODO ADD THIS
        // document.exitPointerLock(); // Exit mouse lock
        // crosshair.hideCrosshair();
        // document.getElementById('health-bar-container').style.display = 'none';
        // cubeEnemy.visible = false;
        this.enemyLight.visible = false;

        soundEffectsManager.toggleLoop("ambienceLevel3")
    }

    


    animate=(currentTime)=> {
        this.animationId = requestAnimationFrame(this.animate);

        if (this.cameraManager==undefined||!this.loader.isLoaded() || this.gunManager==undefined){
            return;
        }

        this.world.step(1 / 60);

        this.gunManager.updateAllBullets();
        this.objManager.update();

        const timeElapsedS = (currentTime - this.lastTime) / 1000;
        // this.lastTime = currentTime;

        
        this.updatePlayerHealthBar();

        this.gunManager.updateBulletsPlayer(this.enemyBody);
    
        this.playerLight.position.set(this.playerBody.position.x, this.playerBody.position.y + 1.5, this.playerBody.position.z);

        this.gunManager.checkAndShoot(this.target,this.cameraManager.getCamera());
        this.cameraManager.update(timeElapsedS);


        this.renderer.render(this.scene, this.cameraManager.getCamera());

    }

    /**
     * Stops the animation
     */
    stopAnimate=()=> {
        cancelAnimationFrame(this.animationId)
        this.animationId=null;
    }


    updatePlayerHealthBar(){
        //TODO MOVE TO this variables
        // const healthBar = document.getElementById('user-health-bar');
        // const healthPercentage = (health / maxHealth) * 100; // Calculate percentage
        // healthBar.style.width = `${healthPercentage}%`; // Update the width of the health bar
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