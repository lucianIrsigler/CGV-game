import * as THREE from 'three';
import { CurvedPlatform } from './curvedPlatform.js';

export class CircularPlatform extends CurvedPlatform {
    constructor(radius) {
        super();
        this.radius = radius;
        this.mesh = this.createMesh();
        this.add(this.mesh);
    }
    createMesh() {
        const group = new THREE.Group();
    
        for (let i = 0; i < 8; i++) {
            const platform = new CurvedPlatform(0, this.radius);
            platform.rotation.y = i * Math.PI / 4;
            group.add(platform);
        }
        return group;
    }

}

