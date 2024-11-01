import * as THREE from 'three';
import { CPBoxLamp } from './CPBoxLamp.js';

export class ButtonPlatform extends CPBoxLamp {
    constructor(innerRadius, outerRadius, depth) {
        super(innerRadius, outerRadius, depth);
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.depth = depth;
        this.add(this.createGroup());
        this.add(this.createButton());
    }

    createButton() {
        const group = new THREE.Group();
        const buttonGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        button.rotateZ(Math.PI / 2);
        button.position.set(0, 0, this.innerRadius + (this.outerRadius - this.innerRadius) / 2);
        group.add(button);
        return group;
    }

    createGroup() {
        const group = super.createGroup();
        return group;
    }

    
}
