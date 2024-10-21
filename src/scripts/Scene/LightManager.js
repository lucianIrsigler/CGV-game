import * as THREE from 'three';

export class LightManager {
    constructor(scene) {
        this.scene = scene;
        this.lights = {};
    }


    getLight(name){
        if (this.lights[name]) {
            return this.lights[name];
        }
    }

    // Add a light to the scene
    addLight(name, light, position = null) {
        if (name==null){
            name = "tempLight"+Math.floor(Math.random() * 10001);
        }
        if (name!=null && this.lights[name]) {
            console.error(`Light "${name}" already exists.`);
            return;
        }

        // Set position, if provided
        if (position) {
            light.position.set(position.x, position.y, position.z);
        } else {
            light.position.set(0, 0, 0); // Default position
        }

        light.name = name;
        this.scene.add(light);
        this.lights[name] = light;  // Store the light by name

        return light;
    }


    addTarget(lightName,targetObject){
        if (!this.lights[lightName]){
            console.error(`${lightName} not found`);
            return;
        }

        if (!(targetObject instanceof THREE.Object3D)) {
            console.error('Invalid target object. It must be an instance of THREE.Object3D.');
            return;  // Exit if targetObject is not a valid Object3D
        }


        const light = this.lights[lightName];
        light.target = targetObject;
    }



    // Remove a light from the scene
    removeLight(name) {
        if (this.lights[name]) {
            this.scene.remove(this.lights[name]);  // Remove from the scene
            delete this.lights[name];  // Remove from the internal lights object
        } else {
            console.error(`Light "${name}" not found.`);
        }
    }

    // Remove all lights from the scene
    removeAllLights() {
        Object.keys(this.lights).forEach(name => {
            this.scene.remove(this.lights[name]);  // Remove each light from the scene
        });
        this.lights = {};  // Clear the lights object
    }
}
