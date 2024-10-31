import * as THREE from 'three';
import { loadTextures, applyTextureSettings } from '../../src/scripts/util/TextureLoaderUtil.js';

const angle = Math.PI / 4;
const sectorAngle = Math.PI / 4;

export class CurvedPlatform extends THREE.Object3D {
    constructor(innerRadius, outerRadius, depth) {
        super(innerRadius, outerRadius, depth);
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.depth = depth;
        this.mesh = this.createMesh();
        this.add(this.mesh);
    }

    createMesh() {
        const shape = new THREE.Shape();
        shape.moveTo(Math.cos(angle) * this.innerRadius, Math.sin(angle) * this.innerRadius);
        shape.lineTo(Math.cos(angle) * this.outerRadius, Math.sin(angle) * this.outerRadius);
        shape.absarc(0, 0, this.outerRadius, angle, angle + sectorAngle, false);
        shape.lineTo(Math.cos(angle + sectorAngle) * this.innerRadius, Math.sin(angle + sectorAngle) * this.innerRadius);
        shape.absarc(0, 0, this.innerRadius, angle + sectorAngle, angle, true);

        const extrudeSettings = { depth: this.depth, bevelEnabled: false };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        const platformTexture = loadTextures('./PavingStones');
        applyTextureSettings(platformTexture, 0.07, 0.07); 

        platformTexture.wrapS = platformTexture.wrapT = THREE.RepeatWrapping;
        const material = new THREE.MeshStandardMaterial({
            map: platformTexture.colorMap,
            aoMap: platformTexture.aoMap,
            displacementMap: platformTexture.displacementMap,
            metalnessMap: platformTexture.metalnessMap,
            normalMap: platformTexture.normalMapDX, 
            roughnessMap: platformTexture.roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotateX(Math.PI / 2);
        mesh.rotateZ(angle/2);
        return mesh;
    }
}