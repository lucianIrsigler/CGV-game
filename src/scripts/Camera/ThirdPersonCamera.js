import * as THREE from 'three';
import { ThirdPersonInputController } from "../InputController/ThirdPersonInputController";

//https://www.youtube.com/watch?v=UuNPHOJ_V5o&ab_channel=SimonDev
export class ThirdPersonCamera{
    constructor(camera,target,character,scene) {
        this.scene = scene;
        this.character = character;
        this.camera_ = camera;

        this.currentPositon_ = new THREE.Vector3();
        this.currentLookat_ = new THREE.Vector3();
        this.input_ = new ThirdPersonInputController(target,scene,character.calcGravity(),character.calcJumpSpeed());
    }

    reset(){
        this.input_.reset();
    }

    calculateIdealOffset_(){
        const idealOffset =  new THREE.Vector3(-1,3,-3);

        const qR = new THREE.Quaternion();
        qR.setFromEuler(this.input_.target_.rotation); 

        idealOffset.applyQuaternion(qR);

        idealOffset.add(this.input_.target_.position);
        return idealOffset;
    }

    calculateIdealLookAt_(){
        const idealLookAt = new THREE.Vector3(0,0,5);

        const qR = new THREE.Quaternion();
        qR.setFromEuler(this.input_.target_.rotation); 


        idealLookAt.applyQuaternion(qR);
        idealLookAt.add(this.input_.target_.position);
        return idealLookAt;
    }

    


    update(timeElapsedS){
        this.input_.target_.visible=true;
        this.input_.update(timeElapsedS);

        const idealOffset = this.calculateIdealOffset_();

        const idealLookAt = this.calculateIdealLookAt_();

        // const t = 1.0 - Math.pow(0.001,timeElapsedS);

        // this.currentPositon_.lerp(idealOffset,t);
        // this.currentLookat_.lerp(idealLookAt,t);
        
        this.currentPositon_.copy(idealOffset);
        this.currentLookat_.copy(idealLookAt);

        this.camera_.position.copy(this.currentPositon_);
        this.camera_.lookAt(this.currentLookat_);

        // console.log("camera:",this.currentPositon_);


    }
}