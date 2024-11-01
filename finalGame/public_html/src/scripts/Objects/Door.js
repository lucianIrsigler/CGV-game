import { door } from "../../data/doorPos1.js";
//import * as THREE from 'three';
 

export class Door{
    /**
     * Class to hold any logic to do with doors
     * @param {CustomLoadingManager} loadingManager 
     */
    constructor(loadingManager){
        this.loader = loadingManager

        this.Door;
        this.isDoorOpen = false;
        this.doorPrompt = document.getElementById('doorPrompt');
        this.doorOpenDistance = 2; // Distance at which the prompt appears
        this.audioContext;
        this.doorCreakBuffer;
        this.doorAnimationAction;

        this.gameOverScreen = document.getElementById("gameOverScreen");

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

    /**
     * Loads the door creak noise
     */
    loadDoorCreakSound() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        fetch('src/audio/wooden-door-creaking.mp3')
            .then(response => response.arrayBuffer()) // Convert to array buffer
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer)) // Decode audio data
            .then(audioBuffer => {
                this.doorCreakBuffer = audioBuffer; // Store the decoded buffer
                console.log('Audio buffer loaded:', audioBuffer); // Log success
            })
            .catch(error => console.error('Error loading door creak sound:', error)); // Log any errors
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
     * Checks how close the user is to the door
     * @param {THREE.Object3D} target 
     * @returns 
     */
    checkDoorProximity(target) {
        if (this.Door==undefined){
            return;
        }
        const distance = target.position.distanceTo(this.Door.position);
        
        if (distance <= this.doorOpenDistance) {
            this.doorPrompt.style.display = 'block'; // Show prompt
        } else {
            this.doorPrompt.style.display = 'none'; // Hide prompt
        }
    }

    /**
     * Checks if the door prompt is a block, and if so then calls openDoor
     */
    checkIfOpen(){
        if (this.doorPrompt.style.display === 'block') {
            this.openDoor();
            return true;
        }
        return false;
    }
}