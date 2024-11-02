//This handles loading models and the scene
// import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

//https://www.youtube.com/watch?v=zMzuPIiznQ4&ab_channel=WaelYasmina


/*
How to use it to load models:

const gltf = await this.loader.loadModel(url,"anyNameYouWantItDoesntMatter");
const model = gltf.scene;
//do whatever you need to do here



When using it for player models:
const gltf = await this.loader.loadModel('src/models/cute_alien_character/scene.gltf', 'player');
const model = gltf.scene; // Get the loaded model
this.addObject(model); // Add the model to the scene

... do whatever with the model. i.e scale ...

//create cannon.js body for model
this.playerBody = new CANNON.Body({
    mass: 1, // Dynamic body
    position: new CANNON.Vec3(0, 2, 0), // Start position
});

//create hitbox
const boxShape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)); // Box shape for the player
this.playerBody.addShape(boxShape);
this.world.addBody(this.playerBody);

//now you need to define the camera manager to use the player model as the target with its hitbox too
this.cameraManager = new CameraManager(
    this.camera,
    this.target,
    this.playerBody,
    this.scene
);


*/


/**
 * Class to do the loading bar
 */
export class LoadingManagerCustom{
    /**
     * This class is used to load models and display the loading bar
     */
    constructor(){
        this.loadingManager= new THREE.LoadingManager();
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        this.models = {}; // Object to store loaded models
        this.onProgressCallback = null; // Optional callback for progress updates
        this.onLoadCallback = null; // Optional callback when loading is complete
        this.progressText = document.getElementById("progress-label");
        this.progressBar = document.getElementById("progress-bar");
        this.progressBarContainer = document.querySelector(".progress-bar-container");
        this.loaded = false;
        this.init_();
    }

    init_(){
        this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
            this.progressBarContainer.style.display = 'flex';
            this.loaded = false;

        };


        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.progressBar.value=(itemsLoaded/itemsTotal)*100;
            this.progressText.textContent = `Loading: ${url}. Loaded ${itemsLoaded} of ${itemsTotal} items.`

            if (this.onProgressCallback) {
                this.onProgressCallback(itemsLoaded, itemsTotal);
            }
        };

        this.loadingManager.onLoad = () => {
            console.log('All items loaded.');
            this.progressBarContainer.style.display = 'none';
            this.loaded = true;
            if (this.onLoadCallback) {
                this.onLoadCallback(this.models); // Pass all loaded models
            }
        };

        this.loadingManager.onError = (url) => {
            console.error(`Error loading: ${url}`);
        };
    }

    /**
     * @returns if the scene is loaded
     */
    isLoaded(){
        return this.loaded;
    }
    
    /**
     * Loads a model using gltf, and returns a promise to that model.
     * @param {string} url url to load
     * @param {string} modelName name of the model
     * @param {function} customLoadingFunction custom gltf function. can leave as null in most cases
     * @returns 
     */
    loadModel(url, modelName, customLoadingFunction = null) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf) => {
                    this.models[modelName] = gltf; // Store the loaded model

                    // If a custom loading function is provided, call it
                    if (typeof customLoadingFunction === 'function') {
                        customLoadingFunction(gltf); // Execute the custom loading function
                    }

                    resolve(gltf);
                },
                undefined, // Progress function can be omitted
                (error) => {
                    console.error(`Failed to load model: ${url}`, error);
                    reject(error);
                }
            );
        });
    }

    /**
     * set custom callback for progress
     * @param {function} callback 
     */
    setProgressCallback(callback) {
        this.onProgressCallback = callback; // Set custom progress callback
    }

    /**
     * sets custom callback for loading
     * @param {function} callback 
     */
    setLoadCallback(callback) {
        this.onLoadCallback = callback; // Set custom load callback
    }

    /**
     * Gets model by name
     * @param {string} modelName 
     * @returns 
     */
    getModel(modelName) {
        return this.models[modelName]; // Retrieve the loaded model by name
    }

    /**
     * Removes all the models from the scene
     */
    clearModels() {
        this.models = {}; // Clear all loaded models
    }
}