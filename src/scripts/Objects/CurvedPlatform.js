import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class CurvedPlatform extends THREE.Object3D {
    constructor(innerRadius, outerRadius, depth, angle = Math.PI / 4, sectorAngle = Math.PI / 4) {
        super();
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.depth = depth;
        this.angle = angle;
        this.sectorAngle = sectorAngle;
        this.mesh = this.createMesh();
        this.add(this.mesh);
        this.numSegments = 8;
        this.body = this.createCompoundBody(innerRadius, outerRadius, depth, this.numSegments);
    }

    createMesh() {
        const shape = new THREE.Shape();
        shape.moveTo(Math.cos(this.angle) * this.innerRadius, Math.sin(this.angle) * this.innerRadius);
        shape.lineTo(Math.cos(this.angle) * this.outerRadius, Math.sin(this.angle) * this.outerRadius);
        shape.absarc(0, 0, this.outerRadius, this.angle, this.angle + this.sectorAngle, false);
        shape.lineTo(Math.cos(this.angle + this.sectorAngle) * this.innerRadius, Math.sin(this.angle + this.sectorAngle) * this.innerRadius);
        shape.absarc(0, 0, this.innerRadius, this.angle + this.sectorAngle, this.angle, true);

        const extrudeSettings = { depth: this.depth, bevelEnabled: false };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        //GET TEXTURES FROM "PavingStones"
        const textureLoader = new THREE.TextureLoader();
        const colorMap = textureLoader.load('../../textures/PavingStones/Color.jpg');
        const aoMap = textureLoader.load('../../textures/PavingStones/AmbientOcclusion.jpg');
        const displacementMap = textureLoader.load('../../textures/PavingStones/Displacement.jpg');
        const metalnessMap = textureLoader.load('../../textures/PavingStones/Metalness.jpg');
        const normalMapDX = textureLoader.load('../../textures/PavingStones/NormalDX.jpg');
        const roughnessMap = textureLoader.load('../../textures/PavingStones/Roughness.jpg');
        
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
        return mesh;
    }

    createCompoundBody(innerRadius, outerRadius, depth, numSegments) {
        const body = new CANNON.Body({ mass: 0 }); // Static body (mass = 0)
        const segmentAngle = this.sectorAngle / numSegments;
        
        for (let i = 0; i < numSegments; i++) {
            const angleStart = this.angle + i * segmentAngle;
            const angleEnd = angleStart + segmentAngle;
            const middleAngle = (angleStart + angleEnd) / 2;

            const segmentInnerRadius = innerRadius;
            const segmentOuterRadius = outerRadius;
            const segmentDepth = depth;

            const boxWidth = (segmentOuterRadius - segmentInnerRadius) * Math.cos(segmentAngle / 2);
            const boxHeight = segmentDepth;
            const boxDepth = (segmentOuterRadius - segmentInnerRadius) * Math.sin(segmentAngle / 2);

            const boxPositionX = Math.cos(middleAngle) * (innerRadius + (outerRadius - innerRadius) / 2);
            const boxPositionY = Math.sin(middleAngle) * (innerRadius + (outerRadius - innerRadius) / 2);

            const boxShape = new CANNON.Box(new CANNON.Vec3(boxWidth / 2, boxHeight / 2, boxDepth / 2));

            const quaternion = new CANNON.Quaternion();
            quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), middleAngle);

            body.addShape(boxShape, new CANNON.Vec3(boxPositionX, 0, boxPositionY), quaternion);
        }
        return body;
    }
}
