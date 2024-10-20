import * as THREE from 'three';

export class ObjectManager {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.geometries = {};
        this.materials = {};
    }


    addGeometry(name,geometry){
        this.geometries.add({name:name,geometry:geometry})
    }

    addMaterial(name,material){
        this.materials.add({name:name,material:material})
    }

    removeGeometry(name) {
        if (this.geometries[name]) {
            delete this.geometries[name];
        } else {
            console.error(`Geometry "${name}" not found.`);
        }
    }

    removeMaterial(name) {
        if (this.materials[name]) {
            delete this.materials[name];
        } else {
            console.error(`Material "${name}" not found.`);
        }
    }


    createObject(name,geometryName,materialName, position=null,rotation=null) {
        if (!this.geometries[geometryName] || !this.materials[materialName]){
            return;
        }
        const mesh = new THREE.Mesh(this.geometries[geometryName], this.materials[materialName]);

        if (position) {
            mesh.position.set(position.x, position.y, position.z);
        } else {
            mesh.position.set(0, 0, 0); // Default position
        }

        // Set rotation, if provided
        if (rotation) {
            mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        } else {
            mesh.rotation.set(0, 0, 0); // Default rotation
        }

        mesh.name = name;
        this.scene.add(mesh);
        this.objects.push(mesh);

        return mesh
    }

    removeObject(name) {
        const object = this.scene.getObjectByName(name);
        if (object) {
            this.scene.remove(object);  // Remove from the scene
            this.objects = this.objects.filter(obj => obj.name !== name);  // Remove from the objects array
        } else {
            console.error(`Object "${name}" not found.`);
        }
    }

    // Remove all objects from the scene
    removeAllObjects() {
        this.objects.forEach(obj => this.scene.remove(obj));  // Remove each object from the scene
        this.objects = [];  // Clear the objects array
    }
    
}
