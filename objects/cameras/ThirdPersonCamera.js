import * as THREE from 'three';
import { ThirdPersonInputController } from '../input/ThirdPersonInputController';


export class ThirdPersonCamera{
    constructor(camera,target) {
        this.camera_ = camera;
        this.currentPositon_ = new THREE.Vector3();
        this.currentLookat_ = new THREE.Vector3();
        this.input_ = new ThirdPersonInputController(target);
    }

    calculateIdealOffset_(){
        const idealOffset =  new THREE.Vector3(0,5,-15);

        const qR = new THREE.Quaternion();
        qR.setFromEuler(this.input_.target_.rotation); 

        idealOffset.applyQuaternion(qR);

        idealOffset.add(this.input_.target_.position);
        return idealOffset;
    }

    calculateIdealLookAt_(){
        const idealLookAt = new THREE.Vector3(0,0,0);

        const qR = new THREE.Quaternion();
        qR.setFromEuler(this.input_.target_.rotation); 


        idealLookAt.applyQuaternion(qR);
        idealLookAt.add(this.input_.target_.position);
        return idealLookAt;
    }

    update(timeElapsedS){
        this.input_.update();
        const idealOffset = this.calculateIdealOffset_();

        const idealLookAt = this.calculateIdealLookAt_();


        // const t = 1.0 - Math.pow(0.001,timeElapsedS);

        
        // this.currentPositon_.lerp(idealOffset,t);
        // this.currentLookat_.lerp(idealLookAt,t);
        
        this.currentPositon_.copy(idealOffset);
        this.currentLookat_.copy(idealLookAt);

        this.camera_.position.copy(this.currentPositon_);
        this.camera_.lookAt(this.input_.target_.position);

        // console.log("camera:",this.currentPositon_);


    }
}