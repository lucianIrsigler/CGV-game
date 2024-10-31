import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Lamp extends THREE.Object3D {
    constructor(x, y, z, color) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
        this.mesh = this.createMesh();
        this.add(this.mesh);
    }

    createMesh() {
        const lampGroup = new THREE.Group();

        const baseLamp = {
            scene: "street_lamp/scene.gltf",
            scaleX: 0.1,
            scaleY: 0.1,
            scaleZ: 0.1,
            positionX: this.x, 
            positionY: this.y, 
            positionZ: this.z,  
        };

        const loader = new GLTFLoader();
        //LOAD LAMPS FROM "street_lamp"
        loader.load(baseLamp.scene, (gltf) => {
            const lampMesh = gltf.scene;
            lampMesh.scale.set(baseLamp.scaleX, baseLamp.scaleY, baseLamp.scaleZ);
            lampMesh.position.set(baseLamp.positionX, baseLamp.positionY, baseLamp.positionZ);
            lampGroup.add(lampMesh);
            
            //LIGHTING
            const lampPos = new THREE.Vector3(baseLamp.positionX, baseLamp.positionY, baseLamp.positionZ);
            const coneLight = new THREE.SpotLight(0xA96CC3, 40, 10, Math.PI / 4, 0.5, 2);
            coneLight.position.copy(lampPos).add(new THREE.Vector3(0, 5, 0));
            lampGroup.add(coneLight);
            lampGroup.add(coneLight.target);
        });

        return lampGroup;
    }
}