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
        const radius = this.outerRadius;
        const height = this.depth;
        
        const body = new CANNON.Body({
            mass: 0, // Static body
            position: new CANNON.Vec3(0, 0, 0)
        });

        if (this.innerRadius === 0) {
            // For solid circular platforms (floor, ceiling)
            const shape = new CANNON.Cylinder(
                radius, // radiusTop
                radius, // radiusBottom
                height, // height
                32    // number of segments
            );
            
            // Rotate the cylinder to match Three.js orientation
            const quat = new CANNON.Quaternion();
            quat.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
            body.addShape(shape, new CANNON.Vec3(0, 0, 0), quat);
        } else {
            // For ring-shaped platforms
            // Create multiple shapes to approximate a ring
            const segments = 16; // Number of segments to approximate the ring
            const angleStep = (2 * Math.PI) / segments;
            const midRadius = (this.innerRadius + this.outerRadius) / 2;
            const thickness = this.outerRadius - this.innerRadius;
            
            for (let i = 0; i < segments; i++) {
                const angle = i * angleStep;
                const x = Math.cos(angle) * midRadius;
                const z = Math.sin(angle) * midRadius;
                
                // Create a box for each segment
                const shape = new CANNON.Box(new CANNON.Vec3(
                    thickness / 2,
                    height / 2,
                    (2 * Math.PI * midRadius) / segments / 2
                ));
                
                // Position and rotate each segment
                const quat = new CANNON.Quaternion();
                quat.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);
                
                body.addShape(shape, new CANNON.Vec3(x, 0, z), quat);
            }
        }

        return body;
    }

    update() {
        // Sync position and rotation with the Cannon.js body
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }
}
