import { FirstPersonCamera } from "./FirstPersonCamera"
import { ThirdPersonCamera } from "./ThirdPersonCamera"

export class CameraManager{
    constructor(camera,target,character,scene){
        this.fps = new FirstPersonCamera(camera,target,character,scene)
        this.thirdPerson = new ThirdPersonCamera(camera,target,character,scene);
        this.firstPerson = true;
    }


    update(timeElapsedS){
        if (this.firstPerson){
            this.fps.update(timeElapsedS);
        }else{
            this.thirdPerson.update(timeElapsedS);
        }
    }


    resetStates(){
        this.fps.reset();
        this.thirdPerson.reset();
    }

    getFirstPerson(){
        return this.firstPerson;
    }

    toggleFirstPerson(){
        this.firstPerson = true;
    }

    toggleThirdPerson(){
        this.firstPerson=false;
    }

    getCamera(){
        if (this.firstPerson){
            return this.fps.camera_;
        }else{
            return this.thirdPerson.camera_;
        }
    }
}