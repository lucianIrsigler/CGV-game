import * as THREE from 'three';
import { ThirdPersonInputController } from "../InputController/ThirdPersonInputController";
import { Body,Vec3,Box } from 'cannon-es';


//https://www.youtube.com/watch?v=UuNPHOJ_V5o&ab_channel=SimonDev
export class ThirdPersonCamera{
    /**
     * 
     * @param {THREE.Camera} camera 
     * @param {THREE.Object3D} target
     * @param {Body} playerBody 
     * @param {THREE.Scene} scene 
     */
    constructor(camera,target,playerBody,scene) {
        this.camera_ = camera;
        this.scene = scene;
        this.target_ = target
        this.playerBody = playerBody;
        this.input_ = new ThirdPersonInputController(scene,target,playerBody);

        this.currentPositon_ = new THREE.Vector3();
        this.currentLookat_ = new THREE.Vector3();
        
        this.prevIdealOffset = new THREE.Vector3(-1,2,-2);
        this.prevLookAt = new THREE.Vector3(-1,2,-2);
    }

    updateVariables(phi,theta,target,playerBody,camera){
        this.input_.updateVariables(phi,theta,target,playerBody)
        this.camera_ = camera;
    }

    calculateIdealOffset_(){
        const idealOffset =  new THREE.Vector3(-1,2,-2);

        const qR = new THREE.Quaternion();
        qR.setFromEuler(this.input_.target_.rotation); 

        idealOffset.applyQuaternion(qR);

        idealOffset.add(this.input_.target_.position);
        this.prevIdealOffset = idealOffset;
        return idealOffset;
    }

    calculateIdealLookAt_(){
        const idealLookAt = new THREE.Vector3(0,0,4);

        const qR = new THREE.Quaternion();
        qR.setFromEuler(this.input_.target_.rotation); 


        idealLookAt.applyQuaternion(qR);
        idealLookAt.add(this.input_.target_.position);
        this.prevLookAt = idealLookAt;
        return idealLookAt;
    }


    update(timeElapsedS){
        this.input_.target_.visible=true;
      this.input_.playerBody.visible=true;

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