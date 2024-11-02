import * as THREE from 'three';

export class OscillatingMist {
    constructor(scene, roomRadius, roomHeight) {
        this.scene = scene;
        this.roomRadius = roomRadius;
        this.roomHeight = roomHeight;
        this.fogColor = new THREE.Color(0xFF4B4B4B); 
        
        this.initFog();
    }
    
    initFog() {
        this.scene.fog = new THREE.FogExp2(this.fogColor, 0.015); //Adjust for density 
        this.scene.background = this.fogColor;
    }
    
    animate(time) {
        const baseDensity = 0.015;
        const densityVariation = 0.005; //oscillation stuff 
        this.scene.fog.density = baseDensity + Math.sin(time * 0.001) * densityVariation;
    }
    
    setFogDensity(density) {
        if (this.scene.fog) {
            this.scene.fog.density = density;
        }
    }
    
    setFogColor(color) {
        this.fogColor.set(color);
        if (this.scene.fog) {
            this.scene.fog.color = this.fogColor;
        }
        this.scene.background = this.fogColor;
    }
}
