import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class MONSTER extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.mesh = this.createMesh();
        this.add(this.mesh);
    }

    createMesh() {
        const group = new THREE.Group();

        const baseMonster = {
            scene: "/tall_monster/scene.gltf",
            scaleX: 10,
            scaleY: 10,
            scaleZ: 10,
            positionX: this.x, 
            positionY: this.y, 
            positionZ: this.z,  
        };

        const loader = new GLTFLoader();
        loader.load(baseMonster.scene, (gltf) => {
            const mesh = gltf.scene;
            mesh.scale.set(baseMonster.scaleX, baseMonster.scaleY, baseMonster.scaleZ);
            mesh.position.set(baseMonster.positionX, baseMonster.positionY, baseMonster.positionZ);
            group.add(mesh);

        });

        return group;
    }
}