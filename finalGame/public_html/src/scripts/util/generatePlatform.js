//import * as THREE from 'three';

export function generatePlatform(data,scene) {
    if (data.geometry!=undefined && data.material!=undefined){
        const newWall = new THREE.Mesh(data.geometry, data.material);
        if (data.position!=undefined){
            newWall.position.set(data.position.x, data.position.y, data.position.z);
        }
        if (data.rotation!=undefined){
            newWall.rotation.set(data.rotation.x,data.rotation.y,data.rotation.z);
        }
        scene.add(newWall); 

    }
};
