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
        const body = new CANNON.Body({
            mass:0,
            position:new CANNON.Vec3(0,0,0)
        })

        const width = (outerRadius-innerRadius)/2;
        const height = depth;

        let boxShape = new CANNON.Box(new CANNON.Vec3(width,height/2,width))

        const boxRotationRight = new CANNON.Quaternion();
        boxRotationRight.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI/10);


        const boxRotationLeft = new CANNON.Quaternion();
        boxRotationLeft.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI/10);
        
        body.addShape(boxShape); 
        body.addShape(boxShape,new CANNON.Vec3(-5,0,-0.5),boxRotationRight);
        body.addShape(boxShape,new CANNON.Vec3(5,0,-0.5),boxRotationLeft);


        return body;
    }

    checkCollision(object) {
        const objectBoundingBox = new THREE.Box3().setFromObject(object);
        return this.boundingBox.intersectsBox(objectBoundingBox);
    }
}