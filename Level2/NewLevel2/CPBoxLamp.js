import { CurvedPlatform } from './curvedPlatform.js';
import { Box } from './box.js';
import { Lamp } from './lamp.js';

const width = 2
export class CPBoxLamp extends CurvedPlatform {
    constructor(innerRadius, outerRadius) {
        super(innerRadius, outerRadius);

        this.box = new Box(4, 3, width);    
        this.lamp = new Lamp(1, 1, 1, 0x0000ff);
        this.lamp.position.set(0, 0, this.innerRadius + (this.outerRadius - this.innerRadius) / 2);
        this.box.position.set(0, 1, this.innerRadius + width/2);
        this.add(this.box);
        this.add(this.lamp);
    }
}