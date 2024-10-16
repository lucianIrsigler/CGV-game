export class CameraClass{
    constructor(camera){
        this.camera = camera; 
    }

    setPosition(position){
        this.camera.position.set(position.x, position.y, position.z);
    }

    setRotation(rotation){
        this.camera.rotation.set(rotation.x, rotation.y, rotation.z);
    }
}