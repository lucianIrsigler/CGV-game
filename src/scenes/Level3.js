import { ObjectManager } from "../scripts/Scene/ObjectManager";
import { LightManager } from "../scripts/Scene/LightManager";
import { LoadingManagerCustom } from "../scripts/Loaders/Loader";
import { LightMechanicManager } from "../scripts/Scene/LightMechanicManager";
import { getRandomMonster } from "../scripts/util/getRandomMonster";
import { monsters3 } from "../data/monster3";
import { lamps3 } from "../data/lampPos3";
import { loadTextures,applyTextureSettings } from '../scripts/util/TextureLoaderUtil';


export class Level3 extends SceneBaseClass{
    constructor(){
        super()

        this.world = new World();
        this.world.gravity.set(0, -9.82, 0);
        this.playerBody; //cannon.js model
        this.target; //player model


        this.gameOverScreen = document.getElementById("gameOverScreen");
        this.restartButton = document.getElementById("restartButton");


        //MANAGERS
        this.cameraManager;
        this.objManager = new ObjectManager(this.scene,this.world);
        this.lightManager = new LightManager(this.scene);
        this.loader = new LoadingManagerCustom();
        this.lightMechanicManager = new LightMechanicManager(this.characterLight,100,20,10);

        //flags
        this.isEnemyAsleep = true 
        this.playingAlready = false

        //lights
        this.lampsArray = Object.values(lamps3);
        this.playerLight;
        this.enemyLight;

    }


    initScene(){
        this.scene.background = new THREE.Color(0x333333);

        this.init_eventHandlers_();
        this.init_lighting_();
        this.init_camera_();
        this.init_objects_();

    }   



    init_eventHandlers_(){
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

        this.restartButton.addEventListener("click", restartGame);

    };

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

    async init_monster_(){
        let currentMonster = getRandomMonster(monsters3);


        const model = await this.loader.loadModel(currentMonster.scene,"monster");

        model.position.set(currentMonster.positionX, currentMonster.positionY, currentMonster.positionZ-2);
        model.scale.set(currentMonster.scaleX, currentMonster.scaleY, currentMonster.scaleZ);
        model.castShadow = true;

        // model.traverse((node) => {
        //     if (node.isMesh) {
        //         node.material = new THREE.MeshStandardMaterial({
        //             color: node.material.color,
        //             map: node.material.map,
        //             normalMap: node.material.normalMap,
        //             roughness: 0.5, // Adjust as needed
        //             metalness: 0.5  // Adjust as needed
        //         });
        //     }
        // });
        
    }

    async _initGeometries(){
        this.objManager.addGeometry("player",new THREE.BoxGeometry(0.5, 2, 0.5));
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
        this.objManager.addMaterial("player",new THREE.MeshStandardMaterial({ color: 0x00a6ff }));

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


        const cubeMesh = this.objManager.createVisualObject("playerCube","player","player",{x:0,y:1.5,z:0});
        const cubeBody = this.objManager.createPhysicsObject("playerCube","player",{x:0,y:1.5,z:0},null,0);
        this.objManager.linkObject("playerCube",cubeMesh,cubeBody);


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
                rotation: { y: 0 } // No rotation
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
        this.isEnemyAsleep = true;
        this.enemyAlive = true;
        this.gameOverScreen.style.display = "none";
    
        // Reset character and enemy positions
        // cube.position.set(0, 1.5, 0); // Reset player position
        // switch(currentMonster){
        //     case monster.tall_monster:
        //         cubeEnemy.position.set(10, 2, 5); // Reset enemy position
        //         break;
        //     case monster.monster_ignan:
        //         cubeEnemy.position.set(10, 3, 5); // Reset enemy position
        //         break;
        //     case monster.toon_spike:
        //         cubeEnemy.position.set(10, 4.5, 5); // Reset enemy position
        //         break;
        //     case monster.anya:
        //         cubeEnemy.position.set(10, 1, 5); // Reset enemy position
        //         break;
        //     default:
        //         cubeEnemy.position.set(10, 3, 5); // Reset enemy position
        //         break;
        // }
        // cubeEnemy.material.color.set(0x040405); // Reset enemy color to original'
        // enemyLight.position.copy(cubeEnemy.position); // Reset light position to enemy position
    
        // // Reset health
        // enemyCurrentHealth = enemyMaxHealth; // Reset current health to max
        // enemyHits = 0; // Reset hit counter
        // document.getElementById('health-bar-container').style.display = 'none';
        // updateEnemyHealthBar(); // Update health bar to full width
        // updatePlayerHealthBar(); // Update player health bar
    
        // // Reset health
        // health = maxHealth; // Reset current health to max
        // enemyCurrentHealth = enemyMaxHealth;
    
        // // make enemy visible again
        // // cubeEnemy.visible = true;
        // enemyLight.visible = true;
        // enemyLight.intensity = 1; // Reset light intensity
    
        // // crosshair
        // crosshair.showCrosshair();
    
        // ambientSound.play(); // Restart ambient sound
    }


    animate() {
        updatePlayerHealthBar();
        // Ensure playerModel and cube are loaded before accessing their properties
        if (playerModel && cube) {
            playerModel.position.copy(cube.position);
            playerModel.rotation.copy(cube.rotation);
        }
    
        // Ensure monsterModel and cubeEnemy are loaded before accessing their properties
        if (monsterModel && cubeEnemy) {
            monsterModel.position.copy(cubeEnemy.position);
            // let temp = cube.rotation*-1; 
            monsterModel.rotation.copy(cubeEnemy.rotation);
            // monsterModel.rotation.copy(temp);
            // monsterModel.lookAt(cube.position);
            switch(currentMonster){
                case monster.tall_monster:
                    monsterModel.position.y = cubeEnemy.position.y - 0;
                    break;
                case monster.monster_ignan:
                    monsterModel.position.y = cubeEnemy.position.y - 2.5;
                    break;
                case monster.toon_spike:
                    monsterModel.position.y = cubeEnemy.position.y - 4;
                    break;
                case monster.anya:
                    monsterModel.position.y = cubeEnemy.position.y - 0.5;
                    break;
                default:
                    monsterModel.position.y = cubeEnemy.position.y + 1.5;
                    break;
            }
        }
    
        playerLight.position.set(cube.position.x, cube.position.y + 1.5, cube.position.z);
        if (isGamePaused) return; // Skip updates if the game is paused
        movePlayer();  // Update player movement
        updateCamera();  // Update camera to follow the player
        if(!isEnemyAsleep && enemyCurrentHealth > 0){
            updateEnemyMovement(); // Update enemy's random movement
            enemyShoot(); // Enemy shooting logic
            document.getElementById('health-bar-container').style.display = 'block';
            rotateMonster();
        }
        
    
        // Update bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            const isActive = bullets[i].update(scene); // Pass scene to update the bullet
    
            // Check for collision with the enemy cube
            if (detectCollision(bullets[i], cubeEnemy)) {
                handleEnemyHit(); // Handle enemy hit logic
                scene.remove(bullets[i].mesh); // Remove bullet from the scene
                scene.remove(bullets[i].light); // Remove bullet light from the scene
                bullets.splice(i, 1); // Remove bullet from array
            } else if (!isActive) {
                bullets.splice(i, 1); // Remove bullet if it traveled max distance
            }
        }
    
        // Update enemy bullets
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            const isActive = enemyBullets[i].update(scene); // Pass scene to update the bullet
    
            // Check for collision with the player cube
            if (detectCollision(enemyBullets[i], cube)) {
                console.log("Player has been hit!");
                handlePlayerHit(30); // Handle player hit logic - take 30 damage
                scene.remove(enemyBullets[i].mesh); // Remove bullet from the scene
                scene.remove(enemyBullets[i].light); // Remove bullet light from the scene
                enemyBullets.splice(i, 1); // Remove bullet from array
            } else if (!isActive) {
                enemyBullets.splice(i, 1); // Remove bullet if it traveled max distance
            }
        }
    
        renderer.render(scene, camera);  // Render the scene
    }
    

}