//import * as THREE from 'three';


/**
 * Loads the textures from a specific folder
 * @param {string} textureFolder 
 * @returns 
 */
export function loadTextures(textureFolder) {
    const textureLoader = new THREE.TextureLoader();

    const colorMap = textureLoader.load(`src/textures/${textureFolder}/Color.jpg`);
    const aoMap = textureLoader.load(`src/textures/${textureFolder}/AmbientOcclusion.jpg`);
    const displacementMap = textureLoader.load(`src/textures/${textureFolder}/Displacement.jpg`);
    const metalnessMap = textureLoader.load(`src/textures/${textureFolder}/Metalness.jpg`);
    const normalMapGL = textureLoader.load(`src/textures/${textureFolder}/NormalGL.jpg`);
    const normalMapDX = textureLoader.load(`src/textures/${textureFolder}/NormalDX.jpg`);
    const roughnessMap = textureLoader.load(`src/textures/${textureFolder}/Roughness.jpg`);

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
