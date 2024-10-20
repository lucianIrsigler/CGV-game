import { SceneBaseClass } from "../scripts/Scene/SceneBaseClass";
import * as THREE from 'three';
import { door } from "../data/doorPos1";
import { lamps } from "../data/lampPos1";
import { ObjectManager } from "../scripts/Scene/ObjectManager";

export class Level1 extends SceneBaseClass {
    constructor() {
        super(); // Call the base class constructor
        this.lampsArray=Object.values(lamps);
        this.gameOverScreen = document.getElementById("gameOverScreen");
        this.restartButton = document.getElementById("restartButton");
        this.objManager = new ObjectManager(this.scene);

        this.platforms = [
            { position: new THREE.Vector3(3, 2, 15), size: new THREE.Vector3(5, 0.5, 5) },
            { position: new THREE.Vector3(-3, 4, 20), size: new THREE.Vector3(5, 0.5, 5) },
            { position: new THREE.Vector3(3, 2, 30), size: new THREE.Vector3(3, 0.3, 3) },
            { position: new THREE.Vector3(-3, 4, 35), size: new THREE.Vector3(3, 0.3, 10) }
        ];


        this.miniMapCamera = null;
        this.miniMapRender = null;
        this.points = [];
    }

    initScene(){
        this.init_lighting_();
        this.init_objects_();
        this.init_camera_();
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
        document.body.appendChild(miniMapRenderer.domElement);
    }

    init_door_(){
        // Door variables
        let Door;
        let doorMixer;
        let doorAnimationAction;
        const currentDoor = door.doorOne;

        // Load the door model
        loader.load(currentDoor.scene, function (gltf) {
            Door = gltf.scene;
            scene.add(Door);

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
        const loader = new GLTFLoader();
        let characterLight; 
        // Mini-map setup
        // First Person Controls

        
        this.controls = new FirstPersonControls(camera, renderer.domElement);
        //controls.movementSpeed = 2; // Lower movement speed
        controls.lookSpeed = 0.01; // Lower look speed

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

        loadLamps();

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

        scene.background = new THREE.Color(0x333333);

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
        function setupCharacterLight() {
            characterLight = new THREE.PointLight(0xffffff, 1, 5);
            characterLight.position.set(0, 1, 0); // Slightly above the character
            character.add(characterLight); // Attach the light to the character
        }

        setupCharacterLight();

        // Position camera initially at the same place as the character
        camera.position.set(character.position.x, character.position.y + 0.5, character.position.z);
        character.rotation.y += Math.PI;

        restartButton.addEventListener("click", restartGame);
        const lightTimers = {}; // Track time spent near lights
        let lastMiniMapRenderTime = 0; // To track the last time the mini-map was rendered
        const miniMapRenderInterval = 100; // 100ms interval for mini-map rendering
    }

    init_camera_() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    }

    init_lighting_() {
        //give me orange hexa code: #FFA500
        //w
        const spotLight = new THREE.SpotLight(0xfcf4dc,10, 6, Math.PI / 6, 0.5, 2);//colour: orange
        spotLight.userData.originalIntensity = spotLight.intensity; // Store original intensity
        spotLight.position.set(0, 4, 0);
        const targetObject = new THREE.Object3D();
        targetObject.position.set(0, 0, 0); // Position it below the spotlight
        scene.add(targetObject);
        spotLight.target = targetObject;
        scene.add(spotLight);
        const spotLightHelper = new THREE.SpotLightHelper(spotLight);
        //scene.add(spotLightHelper);
        points.push(spotLight);

        // First light
        //musky white hexa code: 0x800080
        const spotLight1 = new THREE.SpotLight(0x800080, 5, 4, Math.PI / 6, 0.5, 2);//colour: red
        spotLight1.userData.originalIntensity = spotLight1.intensity; // Store original intensity
        spotLight1.position.set(-4, 3, 5);
        // Create a target for the spotlight
        const targetObject1 = new THREE.Object3D();
        targetObject1.position.set(-4, 0, 5); // Position it below the spotlight
        scene.add(targetObject1);
        // Set the spotlight's target
        spotLight1.target = targetObject1;
        scene.add(spotLight1);
        const spotLightHelper1 = new THREE.SpotLightHelper(spotLight1);
        //scene.add(spotLightHelper1);
        points.push(spotLight1);
        //orange hexa: 0xffa500
        // Second light
        const spotLight2 = new THREE.SpotLight(0x800080, 5, 4, Math.PI / 6, 0.5, 2);
        spotLight2.userData.originalIntensity = spotLight2.intensity; // Store original intensity
        spotLight2.position.set(4, 3, 10);
        // Create a target for the spotlight
        const targetObject2 = new THREE.Object3D();
        targetObject2.position.set(4, 0, 10); // Position it below the spotlight
        scene.add(targetObject2);
        // Set the spotlight's target
        spotLight2.target = targetObject2;
        scene.add(spotLight2);
        const spotLightHelper2 = new THREE.SpotLightHelper(spotLight2);
        //scene.add(spotLightHelper2);
        points.push(spotLight2);

        // Third light
        const pointLight3 = new THREE.PointLight(0xffffff, 1, 4);
        pointLight3.position.set(0, 6, -9);
        scene.add(pointLight3);
        const pointLightHelper3 = new THREE.PointLightHelper(pointLight3, 0.5);
        scene.add(pointLightHelper3);
        points.push(pointLight3);

        // fourth light
        const spotLight4 = new THREE.SpotLight(0x800080, 5, 4, Math.PI / 6, 0.5, 2);
        spotLight4.userData.originalIntensity = spotLight4.intensity; // Store original intensity
        spotLight4.position.set(4, 3, 25);
        // Create a target for the spotlight
        const targetObject4 = new THREE.Object3D();
        targetObject4.position.set(4, 0, 25); // Position it below the spotlight
        scene.add(targetObject4);
        // Set the spotlight's target
        spotLight4.target = targetObject4;
        scene.add(spotLight4);
        const spotLightHelper4 = new THREE.SpotLightHelper(spotLight4);
        //scene.add(spotLightHelper4);
        points.push(spotLight4);

        // five light
        const spotLight5 = new THREE.SpotLight(0x800080, 5, 4, Math.PI / 6, 0.5, 2);
        spotLight5.userData.originalIntensity = spotLight5.intensity; // Store original intensity
        spotLight5.position.set(3, 5, 15);
        // Create a target for the spotlight
        const targetObject5 = new THREE.Object3D();
        targetObject5.position.set(3, 2, 15); // Position it below the spotlight
        scene.add(targetObject5);
        // Set the spotlight's target
        spotLight5.target = targetObject5;
        scene.add(spotLight5);
        const spotLightHelper5 = new THREE.SpotLightHelper(spotLight5);
        //scene.add(spotLightHelper5);
        points.push(spotLight5);

        //add dark ambient light
        const ambientLight = new THREE.AmbientLight(0x101010, 0.75); // Soft white light
        scene.add(ambientLight);

        // six light
        const spotLight6 = new THREE.SpotLight(0x800080, 5, 4, Math.PI / 6, 0.5, 2);
        spotLight6.userData.originalIntensity = spotLight6.intensity; // Store original intensity
        spotLight6.position.set(-3, 7, 20);
        // Create a target for the spotlight
        const targetObject6 = new THREE.Object3D();
        targetObject6.position.set(-3, 3, 20); // Position it below the spotlight
        scene.add(targetObject6);
        // Set the spotlight's target
        spotLight6.target = targetObject6;
        scene.add(spotLight6);
        const spotLightHelper6 = new THREE.SpotLightHelper(spotLight6);
        //scene.add(spotLightHelper6);
        points.push(spotLight6);

        // seven light 0xffa500
        //green hexa code: 0x800080
        const spotLight7 = new THREE.SpotLight(0x800080, 5, 4, Math.PI / 6, 0.5, 2);
        spotLight7.userData.originalIntensity = spotLight7.intensity; // Store original intensity
        spotLight7.position.set(3, 5, 30);
        // Create a target for the spotlight
        const targetObject7 = new THREE.Object3D();
        targetObject7.position.set(3, 2, 30); // Position it below the spotlight
        scene.add(targetObject7);
        // Set the spotlight's target
        spotLight7.target = targetObject7;
        scene.add(spotLight7);
        const spotLightHelper7 = new THREE.SpotLightHelper(spotLight7);
        //scene.add(spotLightHelper7);
        points.push(spotLight7);

        // eight light 0x800080
        const spotLight8 = new THREE.SpotLight(0x008000, 5, 4, Math.PI / 6, 0.5, 2);
        spotLight8.userData.originalIntensity = spotLight8.intensity; // Store original intensity
        spotLight8.position.set(-3, 7, 35);
        // Create a target for the spotlight
        const targetObject8 = new THREE.Object3D();
        targetObject8.position.set(-3, 4, 35); // Position it below the spotlight
        scene.add(targetObject8);
        // Set the spotlight's target
        spotLight8.target = targetObject8;
        scene.add(spotLight8);
        const spotLightHelper8 = new THREE.SpotLightHelper(spotLight8);
        //scene.add(spotLightHelper8);
        points.push(spotLight8);
    }

    animate=()=> {
        requestAnimationFrame(animate);
        // Update the door animation mixer if it exists
        if (doorMixer) {
            doorMixer.update(0.01); // Update the animation mixer
        }
    
        // Jumping and gravity application
        if (isJumping) {
            character.position.y += velocityY;
            velocityY += gravity;
        }
    // Check proximity to the door
    checkDoorProximity();
    
    // Update the red cube's position
    updateRedCubePosition();
    
    // Handle the 'E' key press to open the door
    
    
    // Reset jump count when hitting the ground
    if (onPlatform || character.position.y === 0.5) {
        jumpCount = 0; // Reset jump count only when on a platform
    }
        // Calculate the forward and right direction based on the camera's rotation
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; // Ignore vertical direction
        cameraDirection.normalize();
    
        const rightDirection = new THREE.Vector3();
        rightDirection.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)); // Get the right direction
    
        if (forward) {
            character.position.add(cameraDirection.multiplyScalar(moveSpeed * forward));
        }
        if (right) {
            character.position.add(rightDirection.multiplyScalar(moveSpeed * right));
        }
    
        updateCameraPosition();
        controls.update(0.7); // Update controls with delta time
        // Render the scene
        renderer.render(scene, camera);
        // Only update the mini-map at the defined interval
        const currentTime = Date.now();
        if (currentTime - lastMiniMapRenderTime >= miniMapRenderInterval) {
            miniMapRenderer.render(scene, miniMapCamera);
            lastMiniMapRenderTime = currentTime; // Update the time of last render
        }
    }


    // Function to load lamps
    loadLamps() {
        lampsArray.forEach(lamp => {
            loader.load(lamp.scene, function (gltf) {
                let model = gltf.scene;
                scene.add(model);
                console.log("lamplaoded")
                model.position.set(lamp.positionX, lamp.positionY, lamp.positionZ);
                model.scale.set(lamp.scaleX, lamp.scaleY, lamp.scaleZ);
                model.castShadow = true;

                const lampLight = new THREE.PointLight(0xA96CC3, 0.5, 2); // Purple light 
                lampLight.position.set(lamp.positionX, lamp.positionY + 2, lamp.positionZ); 
                scene.add(lampLight);
            }, undefined, function (error) {
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
