import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class GUN extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.mesh = this.createMesh();
        this.add(this.mesh);
    }

    createMesh() {
        const gunGroup = new THREE.Group();

        const baseGun = {
            scene: "/rockets_gun/scene.gltf",
            scaleX: 0.003,
            scaleY: 0.003,
            scaleZ: 0.003,
            positionX: this.x, 
            positionY: this.y, 
            positionZ: this.z,  
        };

        const loader = new GLTFLoader();
        loader.load(baseGun.scene, (gltf) => {
            const mesh = gltf.scene;
            mesh.scale.set(baseGun.scaleX, baseGun.scaleY, baseGun.scaleZ);
            mesh.position.set(baseGun.positionX, baseGun.positionY, baseGun.positionZ);
            gunGroup.add(mesh);
        });

        return gunGroup;
    }
}