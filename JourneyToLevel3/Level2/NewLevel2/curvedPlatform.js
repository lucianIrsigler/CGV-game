import * as THREE from 'three';
import * as CANNON from 'cannon-es';
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
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);

        this.numSgments = 8;
        this.body = this.createCompoundBody(innerRadius, outerRadius, depth, this.numSgments);
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
        //GET TEXTURES FROM "PavingStones"
        const textureLoader = new THREE.TextureLoader();
        const colorMap = textureLoader.load('PavingStones/Color.jpg');
        const aoMap = textureLoader.load('PavingStones/AmbientOcclusion.jpg');
        const displacementMap = textureLoader.load('PavingStones/Displacement.jpg');
        const metalnessMap = textureLoader.load('PavingStones/Metalness.jpg');
        const normalMapDX = textureLoader.load('PavingStones/NormalDX.jpg');
        const roughnessMap = textureLoader.load('PavingStones/Roughness.jpg');
        
        [colorMap, aoMap, displacementMap, metalnessMap, normalMapDX, roughnessMap].forEach(texture => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(0.2, 0.2);
        });
        colorMap.encoding = THREE.sRGBEncoding;
        const material = new THREE.MeshStandardMaterial({
            map: colorMap,
            aoMap: aoMap,
            displacementMap: displacementMap,
            metalnessMap: metalnessMap,
            normalMap: normalMapDX, 
            roughnessMap: roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotateX(Math.PI / 2);
        mesh.rotateZ(angle/2);
        return mesh;
    }

    createCompoundBody(innerRadius, outerRadius, depth, numSegments) {
        const body = new CANNON.Body({ mass: 0 }); // Static body (mass = 0)
        const segmentAngle = sectorAngle / numSegments;
        
        // Calculate segment dimensions
        const segmentWidth = outerRadius - innerRadius;
        const boxDepth = depth;

        for (let i = 0; i < numSegments; i++) {
            // Angle for this segment
            const angleStart = angle + i * segmentAngle;
            const angleEnd = angleStart + segmentAngle;
            const middleAngle = (angleStart + angleEnd) / 2;

            // Calculate box size and position
            const width = segmentWidth;
            const boxPositionX = Math.cos(middleAngle) * (innerRadius + segmentWidth / 2);
            const boxPositionY = Math.sin(middleAngle) * (innerRadius + segmentWidth / 2);

            // Create box shape
            const boxShape = new CANNON.Box(new CANNON.Vec3(width / 2, boxDepth / 2, segmentAngle * (innerRadius + segmentWidth / 2) / 2));

            // Create quaternion for rotation
            const quaternion = new CANNON.Quaternion();
            quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), middleAngle);

            // Add box shape to body
            body.addShape(boxShape, new CANNON.Vec3(boxPositionX, 0, boxPositionY), quaternion);
        }
        return body;
    }

    checkCollision(object) {
        const objectBoundingBox = new THREE.Box3().setFromObject(object);
        return this.boundingBox.intersectsBox(objectBoundingBox);
    }
}