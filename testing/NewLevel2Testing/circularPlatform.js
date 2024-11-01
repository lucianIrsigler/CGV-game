import * as THREE from 'three';
import * as CANNON from 'cannon-es'; // Import Cannon.js
import { CurvedPlatform } from './curvedPlatform.js';
import { loadTextures, applyTextureSettings } from '../../src/scripts/util/TextureLoaderUtil.js';

const textureLoader = new THREE.TextureLoader();
const baseTexture = textureLoader.load('PavingStones.jpg');
baseTexture.wrapS = baseTexture.wrapT = THREE.RepeatWrapping;
baseTexture.repeat.set(5, 5);

export class CircularPlatform extends THREE.Object3D {
    constructor(innerRadius, outerRadius, depth) {
        super(); // Correct constructor call
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.depth = depth;

        // Create Cannon.js body
        this.body = this.createBody();

        // Create mesh and add it to the object
        this.mesh = this.createMesh();
        this.add(this.mesh);
    }

    createMesh() {
        const group = new THREE.Group();
    
        for (let i = 0; i < 8; i++) {
            const platform = new CurvedPlatform(this.innerRadius, this.outerRadius, this.depth);
            platform.rotation.y = i * Math.PI / 4;
            group.add(platform);
        }
        return group;
    }

    createBody() {
        // Create a cylinder shape for the circular platform
        // const radius = (this.innerRadius + this.outerRadius) / 2; // Average radius
        // const height = this.depth;
        // const body = new CANNON.Body({
        //     mass: 0, // Static body
        //     position: new CANNON.Vec3(0, height / 2, 0) // Center the body at the height of the platform
        // });
        // const shape = new CANNON.Cylinder(radius, radius, height, 8); // 8 segments for smoothness
        // body.addShape(shape);
        // return body;

        const radius = (this.innerRadius + this.outerRadius) / 2; // Average radius
        const height = this.depth;

        const body = new CANNON.Body({
            mass:0,
            position: new CANNON.Vec3(0,0,0)
        })

        body.addShape(new CANNON.Box(new CANNON.Vec3(radius,0.5,radius)));

        return body;
    }

    update() {
        // Sync position and rotation with the Cannon.js body
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }
}
