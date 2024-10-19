export class CameraClass{
    constructor(camera){
        this.camera = camera; 
        this.offset = {x:0,y:0,z:0};
        this.rotation = {x:0,y:0,z:0};

    }

    setOffset(offset){
        this.offset = offset
    };

    setPosition(position){
        this.camera.position.set(position.x+this.offset.x,
            position.y+this.offset.y,
            position.z+this.offset.z);

        
    }

    setRotation(rotation){
        this.camera.rotation.set(rotation.x, rotation.y, rotation.z);
        this.rotation = {x:rotation.x,y:rotation.y,z:rotation.z};
    }
}