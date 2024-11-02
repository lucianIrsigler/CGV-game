// import * as THREE from 'three';
// import { World,Body, Box, Sphere, Vec3 } from 'cannon-es';


/**
 * Steps to using this class
 * 1. add geometry using addGeometry
 * 2. add material using addMaterial
 * 3. link the objects
 * 
Example:
    this.objManager.addGeometry("ground",new THREE.PlaneGeometry(20, 20));
    this.objManager.addMaterial("ground",new THREE.MeshStandardMaterial({ color: 0x808080 }));


    //now to create the object
    onst groundMesh = this.objManager.createVisualObject("ground", "platform", "platform", {x:0,y:-0.5,z:20});
    const groundBody = this.objManager.createPhysicsObject("ground", "platform", {x:0,y:-0.5,z:20}, null, 0);
    this.objManager.linkObject("ground", groundMesh, groundBody);
*/




/**
 * Manager that handles object creation and deletion
 */
export class ObjectManager {
    /**
     * Scene is the three.js scene, and world is a cannon.js world
     * @param {THREE.Scene} scene 
     * @param {CANNON.World} physicsWorld 
     */
    constructor(scene,physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld
        this.objects = [];
        this.bodies = [];
        this.bodiesMapping = [];
        this.lastId = 0;
        this.geometries = {};
        this.materials = {};
    }

    /**
     * Adds a three.js geometry to the list
     * @param {string} name 
     * @param {THREE.Object3D} geometry 
     */
    addGeometry(name,geometry){
        this.geometries[name] = geometry;
    }

    /**
     * Addsa a three.js material to the list
     * @param {string} name 
     * @param {THREE.Mesh} material 
     */
    addMaterial(name,material){
        this.materials[name] = material;
    }

    /**
     * Removes a geometry from the list
     * @param {string} name 
     */
    removeGeometry(name) {
        if (this.geometries[name]) {
            delete this.geometries[name];
        } else {
            console.error(`Geometry "${name}" not found.`);
        }
    }

    /**
     * Removes a material from the list
     * @param {string} name 
     */
    removeMaterial(name) {
        if (this.materials[name]) {
            delete this.materials[name];
        } else {
            console.error(`Material "${name}" not found.`);
        }
    }

    /**
     * Searches list for objects by this name
     * @param {string} name Object to search
     * @returns three.js object if found
     */
    getObject(name) {
        const object = this.scene.getObjectByName(name);
        if (object) {
            return object;  // Return the object if found
        } else {
            console.error(`Object "${name}" not found.`);
            return null;  // Return null if the object is not found
        }
    }

    /**
     * Searches list for cannon.js by this name
     * @param {string} name 
     * @returns cannon.js object
     */
    getPhysicsObject(name) {
        let id = this.findIdByName(name);

        if (id==null){
            console.error("INVALID NAME");
            return;
        }

        const object = this.physicsWorld.getBodyById(id);
        if (object) {
            return object;  // Return the object if found
        } else {
            console.error(`Object "${id}" not found.`);
            return null;  // Return null if the object is not found
        }
    }

    /**
     * Since cannon.js uses id as int, and not names, this function finds the associated id for that name
     * @param {string} name 
     * @returns id
     */
    findIdByName(name) {
        const foundObject = this.bodiesMapping.find(obj => obj.name === name);
        return foundObject ? foundObject.id : null;
    }
    
    /**
     * Adds a three.js object to the scene
     * @param {string} name name of the new object
     * @param {string} geometryName name of the geometry to use
     * @param {string} materialName name of the material to use
     * @param {JSON} position {x:num,y:num,z:num} position of the object
     * @param {JSON} rotation {x:num,y:num,z:num} rotation of the object
     * @throws if geometry or material is invalid
     */
    createVisualObject(name, geometryName, materialName, position = null, rotation = null) {
        if (!this.geometries[geometryName] || !this.materials[materialName]) {
            console.error(`Can't find geometry or material for ${name}`);
            return;
        }

        const mesh = new THREE.Mesh(this.geometries[geometryName], this.materials[materialName]);
        if (position) mesh.position.set(position.x, position.y, position.z);
        if (rotation) mesh.rotation.set(rotation.x, rotation.y, rotation.z);

        mesh.name = name;
        this.scene.add(mesh);
        this.objects.push(mesh);
        return mesh;
    }


    /**
     * Creates a new cannon.js object and adds to world
     * @param {string} name name of new object
     * @param {string} geometryName geometry to use
     * @param {JSON} position position of the physics object
     * @param {JSON} rotation rotation of the physics object
     * @param {int} mass mass of the object. 0 for static
     * @returns new CANNON.Body created
     */
    createPhysicsObject(name, geometryName, position = null, rotation = null, mass = 0) {
        let shape;
        if (this.geometries[geometryName] instanceof THREE.BoxGeometry) {
            const { width, height, depth } = this.geometries[geometryName].parameters;
            shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2)); // Convert to Cannon dimensions
        } else if (this.geometries[geometryName] instanceof THREE.SphereGeometry) {
            const { radius } = this.geometries[geometryName].parameters;
            shape = new CANNON.Sphere(radius);
        } else {
            console.error("Unsupported geometry type for physics body.");
            return;
        }

        const body = new CANNON.Body({
            mass: mass,
            position: position ? new CANNON.Vec3(position.x, position.y, position.z) : new CANNON.Vec3(0, 0, 0),
        });
        body.addShape(shape);
        if (rotation) body.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);

        this.physicsWorld.addBody(body);
        this.bodies.push(body);
        this.bodiesMapping.push({ name: name, id: this.lastId++ });
        return body;
    }

    /**
     * Creates both visual and physics components for custom objects that provide their own physics body
     * @param {string} name Name of the new object
     * @param {THREE.Object3D} customObject Custom object instance
     * @param {JSON} position {x:num,y:num,z:num} position of the object
     * @param {JSON} rotation {x:num,y:num,z:num} rotation of the object
     * @returns {Object} Object containing both mesh and physics body
     */
    createCustomObjectWithPhysics(name, customObject, position = null, rotation = null) {
        // Check if the custom object has both mesh and body properties
        if (!customObject || !customObject.mesh || !customObject.body) {
            console.error("Custom object must have both mesh and body properties");
            return null;
        }

        // Position and rotate the visual object
        if (position) {
            customObject.position.set(position.x, position.y, position.z);
            customObject.mesh.position.set(0, 0, 0); // Reset mesh position relative to parent
        }
        
        if (rotation) {
            customObject.rotation.set(rotation.x, rotation.y, rotation.z);
            customObject.mesh.rotation.set(0, 0, 0); // Reset mesh rotation relative to parent
        }

        // Position and rotate the physics body
        if (position) {
            customObject.body.position.set(position.x, position.y, position.z);
        }
        
        if (rotation) {
            customObject.body.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
        }

        // Add to scene and physics world
        customObject.name = name;
        this.scene.add(customObject);
        this.physicsWorld.addBody(customObject.body);
        
        // Store in our collections
        this.objects.push(customObject);
        this.bodies.push(customObject.body);
        this.bodiesMapping.push({ name: name, id: this.lastId++ });

        // Link the object
        this.linkObject(name, customObject, customObject.body);

        return customObject;
    }
    

    /**
     * Links a threejs object to its corresponding cannon.js object. This is need for the
     * update function to work properly
     * @param {string} name 
     * @param {THREE.Mesh} mesh 
     * @param {CANNON.Body} cannon.js body 
     * @returns 
     */
    linkObject(name, mesh, body) {
        if (!mesh || !body) {
            console.error(`Cannot link ${name} - both mesh and body are required`);
            return;
        }
        this.objects.push({ mesh, body });
    }

    /**
     * Removes all the objects from the scene
     */
    removeAllObjects() {
        this.objects.forEach(obj => this.scene.remove(obj));
        this.bodies.forEach(b => this.physicsWorld.removeBody(b.body));

        this.objects = [];
        this.bodies = [];
        this.materials = {};
        this.geometries = {};
    }

    /**
     * Updates the three.js objects to match its corresponding physics body
     */
    update() {
        this.objects.forEach((obj) => {
            if (obj instanceof THREE.Object3D && obj.body) {
                // Handle custom objects that have their own body property
                obj.position.copy(obj.body.position);
                obj.quaternion.copy(obj.body.quaternion);
            } else if (obj.mesh && obj.body) {
                // Handle standard linked objects
                obj.mesh.position.copy(obj.body.position);
                obj.mesh.quaternion.copy(obj.body.quaternion);
            }
        });
    }
    
}
