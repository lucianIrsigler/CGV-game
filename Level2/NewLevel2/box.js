import * as THREE from 'three';
import { loadTextures, applyTextureSettings } from './TextureLoaderUtil';

const textureLoader = new THREE.TextureLoader();
const colorMap = textureLoader.load('../Planks/PlanksColor.jpg');
const aoMap = textureLoader.load('../Planks/PlanksAmbientOcclusion.jpg');
const displacementMap = textureLoader.load('../Planks/PlanksDisplacement.jpg');
const metalnessMap = textureLoader.load('../Planks/PlanksMetalness.jpg');
const normalMapDX = textureLoader.load('../Planks/PlanksNormalDX.jpg');
const roughnessMap = textureLoader.load('../Planks/PlanksRoughness.jpg');

[colorMap, aoMap, displacementMap, metalnessMap, normalMapDX, roughnessMap].forEach(texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.2, 0.2);
});

export class Box extends THREE.Object3D {
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.mesh = this.createMesh();
        this.add(this.mesh);
    }

    createMesh() {
        const geometry = new THREE.BoxGeometry(this.x, this.y, this.z);

        geometry.attributes.uv2 = geometry.attributes.uv;
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
}
