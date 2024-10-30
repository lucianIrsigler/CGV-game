//This handles loading models and the scene
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

//https://www.youtube.com/watch?v=zMzuPIiznQ4&ab_channel=WaelYasmina
export class LoadingManagerCustom{
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


    isLoaded(){
        return this.loaded;
    }
    
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

    setProgressCallback(callback) {
        this.onProgressCallback = callback; // Set custom progress callback
    }

    setLoadCallback(callback) {
        this.onLoadCallback = callback; // Set custom load callback
    }

    getModel(modelName) {
        return this.models[modelName]; // Retrieve the loaded model by name
    }

    clearModels() {
        this.models = {}; // Clear all loaded models
    }
}