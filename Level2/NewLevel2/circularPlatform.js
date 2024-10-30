import * as THREE from 'three';
import { CurvedPlatform } from './curvedPlatform.js';

export class CircularPlatform extends THREE.Object3D {
    constructor(innerRadius, outerRadius, depth) {
        super(innerRadius, outerRadius, depth);
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.depth = depth;
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
}

