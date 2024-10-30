import * as THREE from 'three';
import { CurvedPlatform } from './curvedPlatform.js';
import { Box } from './box.js';
import { Lamp } from './lamp.js';

const width = 2;
const height = 3;
const length = 4;

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
        this.box = new Box(length, height, width);
        this.lamp = new Lamp(1, 1, 1, 0x0000ff);
        this.lamp.position.set(0, 0, this.innerRadius + (this.outerRadius - this.innerRadius) / 2);
        this.box.position.set(0, height/2, this.innerRadius + width / 2);
        group.add(this.box);
        group.add(this.lamp);
        return group;
    }
}