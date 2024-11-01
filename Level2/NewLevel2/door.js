import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class DOOR extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.mesh = this.createMesh();
        this.add(this.mesh);
    }

    createMesh() {
        const doorGroup = new THREE.Group();

        const baseDoor = {
            scene: "/medieval_door/scene.gltf",
            scaleX: 0.005,
            scaleY: 0.005,
            scaleZ: 0.005,
            positionX: this.x, 
            positionY: this.y, 
            positionZ: this.z,  
        };

        const loader = new GLTFLoader();
        loader.load(baseDoor.scene, (gltf) => {
            const mesh = gltf.scene;
            mesh.scale.set(baseDoor.scaleX, baseDoor.scaleY, baseDoor.scaleZ);
            mesh.position.set(baseDoor.positionX, baseDoor.positionY, baseDoor.positionZ);
            doorGroup.add(mesh);
            
        });

        return doorGroup;
    }
}