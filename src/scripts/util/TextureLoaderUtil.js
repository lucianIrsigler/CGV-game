import * as THREE from 'three';

export function loadTextures(textureFolder,loader) {
    const textureLoader = new THREE.TextureLoader(loader.loadingManager);

    if (textureFolder==null){
        textureFolder="";
    }

    const colorMap = textureLoader.load(`${textureFolder}PavingStones/Color.jpg`);
    const aoMap = textureLoader.load(`${textureFolder}PavingStones/AmbientOcclusion.jpg`);
    const displacementMap = textureLoader.load(`${textureFolder}PavingStones/Displacement.jpg`);
    const metalnessMap = textureLoader.load(`${textureFolder}PavingStones/Metalness.jpg`);
    const normalMapGL = textureLoader.load(`${textureFolder}PavingStones/NormalGL.jpg`);
    const normalMapDX = textureLoader.load(`${textureFolder}PavingStones/NormalDX.jpg`);
    const roughnessMap = textureLoader.load(`${textureFolder}PavingStones/Roughness.jpg`);

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
