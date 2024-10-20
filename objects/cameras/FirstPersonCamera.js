import * as THREE from 'three';
import {FirstPersonInputController} from "../input/FirstPersonInputController";

const KEYS = {
    w: 87,  // W key
    a: 65,  // A key
    s: 83,  // S key
    d: 68   // D key
  };

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export class FirstPersonCamera {
    constructor(camera,target) {
      this.camera_ = camera;
      this.input_ = new FirstPersonInputController();
      this.rotation_ = new THREE.Quaternion();
      this.translation_ = new THREE.Vector3();
      this.phi_ = 0;
      this.theta_ = 0;
      this.headBobActive_ = false;
      this.headBobTimer_ = 0;
      this.movementspeed_ = 5;
      this.target_ = target;
      this.sensitivity=5;
    }
  
    update(timeElapsedS) {
      this.updateRotation_(timeElapsedS);
      this.updateCamera_(timeElapsedS);
      this.updateTranslation_(timeElapsedS);
      // this.updateHeadBob_(timeElapsedS);
      this.input_.update();
    }
  
    updateCamera_(_) {
      this.camera_.quaternion.copy(this.rotation_);
      this.camera_.position.copy(this.translation_);

      this.target_.quaternion.copy(this.rotation_);
      this.target_.position.copy(this.translation_);
      // this.camera_.position.y += Math.sin(this.headBobTimer_ * 10) * 0.1;  // Slight head bob effect
    }
  
    // updateHeadBob_(timeElapsedS) {
    //   if (this.headBobActive_) {
    //     const waveLength = Math.PI;
    //     const nextStep = 1 + Math.floor((this.headBobTimer_ + 0.000001) * 10 / waveLength);
    //     const nextStepTime = nextStep * waveLength / 10;
  
    //     this.headBobTimer_ = Math.min(this.headBobTimer_ + timeElapsedS, nextStepTime);
  
    //     if (this.headBobTimer_ === nextStepTime) {
    //       this.headBobActive_ = false;
    //     }
    //   }
    // }
  
    updateTranslation_(timeElapsedS) {
      const forwardVelocity = (this.input_.keys_[KEYS.w] ? 1 : 0) + (this.input_.keys_[KEYS.s] ? -1 : 0);
      const strafeVelocity = (this.input_.keys_[KEYS.a] ? 1 : 0) + (this.input_.keys_[KEYS.d] ? -1 : 0);
  
      const qx = new THREE.Quaternion();
      qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
  
      const forward = new THREE.Vector3(0, 0, -1*this.movementspeed_);
      forward.applyQuaternion(qx);
      forward.multiplyScalar(forwardVelocity * timeElapsedS * 10);
  
      const left = new THREE.Vector3(-1*this.movementspeed_, 0, 0);
      left.applyQuaternion(qx);
      left.multiplyScalar(strafeVelocity * timeElapsedS * 10);
  
  
      this.translation_.add(forward);
      this.translation_.add(left);
  
  
      if (forwardVelocity !== 0 || strafeVelocity !== 0) {
        this.headBobActive_ = true;
      }
    }
  

    calculateEdge_(mouseX,mouseY,edgeThreshold,halfViewPortW,halfViewPortH){
        if (mouseX < -1*halfViewPortW + edgeThreshold) { // Mouse is near the left edge
          this.phi_ += 0.05 // Rotate left
      } else if (mouseX > halfViewPortW-edgeThreshold ) { // Mouse is near the right edge
          this.phi_ -= 0.05 // Rotate right
      }
    }

    updateRotation_(timeElapsedS) {  
      let rotate = true;
      let edge = false;

      const edgeThreshold = 20;

      const mouseX = this.input_.current_.mouseX;
      const mouseY = this.input_.current_.mouseY;


      const xh = this.input_.current_.mouseXDelta / window.innerWidth;
      const yh = this.input_.current_.mouseYDelta / window.innerHeight;


      if (this.input_.previous_!=null){
        if (this.input_.current_.mouseXDelta==this.input_.previous_.mouseXDelta
          &&this.input_.current_.mouseYDelta==this.input_.previous_.mouseYDelta){
          rotate=false;
        }
      }

      let halfViewPortW = window.innerWidth/2;
      let halfViewPortH = window.innerHeight/2;

      if (mouseX > halfViewPortW-edgeThreshold || mouseX < -1*halfViewPortW + edgeThreshold
        || mouseY > halfViewPortH-edgeThreshold || mouseY < -1*halfViewPortH + edgeThreshold
      ){  
          edge=true;
          rotate=true;
          console.log("here");
      }


    if (rotate){
        if (isNaN(xh) || isNaN(yh)) {
          console.error("Invalid mouse delta values:", { xh, yh });
          return;  // Stop the function if invalid values are found
        } 




        if (edge){
          this.calculateEdge_(mouseX,mouseY,edgeThreshold,halfViewPortW,halfViewPortH)
        }
        else{
          this.phi_ += (-1*xh * this.sensitivity);
          this.theta_ = clamp(this.theta_ + -yh * 5, -Math.PI / 3, Math.PI / 3);
        }
    
        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
    
        const qz = new THREE.Quaternion();
        qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta_);
    
        const q = new THREE.Quaternion();
        q.multiply(qx);
        q.multiply(qz);
    
        this.rotation_.copy(q);
    }
  }
}
  