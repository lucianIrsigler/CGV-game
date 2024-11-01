import * as THREE from 'three';
import * as CANNON from "cannon-es"
import { loadTextures, applyTextureSettings } from '../../src/scripts/util/TextureLoaderUtil';

export class Box extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.mesh = this.createMesh();
        this.add(this.mesh);
        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        this.body = this.createBody();
    }

    createMesh() {
        const geometry = new THREE.BoxGeometry(this.x, this.y, this.z);
        //GET TEXTURES FROM "Planks"
        const textureLoader = new THREE.TextureLoader();
        const colorMap = textureLoader.load('/Planks/PlanksColor.jpg');
        const aoMap = textureLoader.load('Planks/PlanksAmbientOcclusion.jpg');
        const displacementMap = textureLoader.load('Planks/PlanksDisplacement.jpg');
        const metalnessMap = textureLoader.load('Planks/PlanksMetalness.jpg');
        const normalMapDX = textureLoader.load('Planks/PlanksNormalDX.jpg');
        const roughnessMap = textureLoader.load('Planks/PlanksRoughness.jpg');
        
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
            metalness: 0.3,
            roughness: roughnessMap
        });

        return new THREE.Mesh(geometry, material);
    }


    createBody(){
        const body = new CANNON.Body({ // Corrected to CANNON.Body
            mass: 0, // Set mass to 0 for static body
            position: new CANNON.Vec3(0, 0, 0) // Position can be adjusted as needed
        });

        // Add a shape that matches the geometry of the box
        body.addShape(new CANNON.Box(new CANNON.Vec3(this.x / 2, this.y / 2, this.z / 2))); // Half extents for Cannon.js

        return body;
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.mesh);
    }

    checkCollision(otherBox) {
        this.updateBoundingBox();
        otherBox.updateBoundingBox();
        return this.boundingBox.intersectsBox(otherBox.boundingBox);
    }
}
