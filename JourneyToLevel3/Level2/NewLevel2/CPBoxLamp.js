import * as THREE from 'three';
import { CurvedPlatform } from './curvedPlatform.js';
import { Box } from './box.js';
import { Lamp } from './lamp.js';

const boxWidth = 2;
const boxHeight = 3;
const boxLength = 4;

export class CPBoxLamp extends CurvedPlatform {
    constructor(innerRadius, outerRadius, depth) {
        super(innerRadius, outerRadius, depth);
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.depth = depth;
        this.add(this.createGroup());
    }

    createGroup() {
        const group = new THREE.Group();
        this.box = new Box(boxLength, boxHeight, boxWidth);
        this.lamp = new Lamp(boxLength/4, 0, 0, 0x0000ff);
        this.lamp.position.set(0, 0, this.innerRadius + (this.outerRadius - this.innerRadius) / 2);
        this.box.position.set(0, boxHeight/2, this.innerRadius + boxWidth / 2);
        group.add(this.box);
        group.add(this.lamp);
        return group;
    }
}