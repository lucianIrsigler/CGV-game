import * as THREE from 'three';

export function loadTextures(textureFolder) {
    const textureLoader = new THREE.TextureLoader();

    const colorMap = textureLoader.load(`PavingStones/Color.jpg`);
    const aoMap = textureLoader.load(`PavingStones/AmbientOcclusion.jpg`);
    const displacementMap = textureLoader.load(`PavingStones/Displacement.jpg`);
    const metalnessMap = textureLoader.load(`PavingStones/Metalness.jpg`);
    const normalMapGL = textureLoader.load(`PavingStones/NormalGL.jpg`);
    const normalMapDX = textureLoader.load(`PavingStones/NormalDX.jpg`);
    const roughnessMap = textureLoader.load(`PavingStones/Roughness.jpg`);

    // Return an object with all loaded textures
    return {
        colorMap,
        aoMap,
        displacementMap,
        metalnessMap,
        normalMapGL,
        normalMapDX,
        roughnessMap
    };
}

export function applyTextureSettings(textures, repeatX, repeatY) {
    // Apply texture wrapping and repeat settings
    [textures.colorMap, textures.aoMap, textures.displacementMap, textures.metalnessMap, textures.normalMapGL, textures.normalMapDX, textures.roughnessMap].forEach(texture => {
        if (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(repeatX, repeatY);
        }
    });
}
