import * as THREE from 'three';
import {FirstPersonInputController} from "../InputController/FirstPersonInputController";

const KEYS = {
    w: 87,  // W key
    a: 65,  // A key
    s: 83,  // S key
    d: 68,   // D key
    space:32
  };

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

//https://medium.com/@brazmogu/physics-for-game-dev-a-platformer-physics-cheatsheet-f34b09064558

export class FirstPersonCamera {
    constructor(camera,target,character,scene) {
      this.camera_ = camera;
      this.input_ = new FirstPersonInputController();
      this.scene = scene;
      this.character = character;


      this.rotation_ = new THREE.Quaternion();
      this.translation_ = new THREE.Vector3();
      this.phi_ = 0;
      this.theta_ = 0;
      this.movementspeed_ = 5;
      this.target_ = target;

      this.sensitivity=5;

      this.gravity = this.character.calcGravity();
      this.jumpSpeed = this.character.calcJumpSpeed();
      this.jumping = false;
      this.grounded = true;
      this.verticalVelocity_=0;
      this.rayCaster = new THREE.Raycaster();
      this.groundCheckDistance_=0.5;
    }
  
    update(timeElapsedS) {
      this.updateRotation_(timeElapsedS);
      this.updateCamera_(timeElapsedS);
      this.updateTranslation_(timeElapsedS);
      // this.updateHeadBob_(timeElapsedS);
      this.input_.update();
    }
  
    updateCamera_(_) {
      // console.log(this.camera_.position,this.target_.position)
      this.camera_.quaternion.copy(this.rotation_);
      this.camera_.position.copy(this.translation_);
      this.camera_.position.y +=1.2;
      this.target_.visible=false;


      this.target_.quaternion.copy(this.rotation_);
      this.target_.position.copy(this.translation_);
      // this.camera_.position.y += Math.sin(this.headBobTimer_ * 10) * 0.1;  // Slight head bob effect
    }
    

    checkIfGround() {
      // If already grounded, exit
      if (this.grounded) {
          return;
      }
  
      // Shoot raycast downwards
      this.rayCaster.set(this.translation_.clone().add(new THREE.Vector3(0, 1, 0)), new THREE.Vector3(0, -1, 0));
      const intersects = this.rayCaster.intersectObjects(this.scene.children, true);
  
      // Check if the ray hit something
      if (intersects.length > 0) {  // Fixed here: check length not > 0
          if (intersects[0].distance < this.groundCheckDistance_) {
              // Position slightly above the ground
              this.translation_.y = intersects[0].point.y + 0.5; 
              this.verticalVelocity_ = 0; // Reset vertical velocity
              this.grounded = true; // Set grounded state
              this.jumping = false; // Reset jumping state when grounded
          }
      } else {
          // If no intersections were found, set grounded to false
          this.grounded = false; 
      }
    }

    updateTranslation_(timeElapsedS) {
      const forwardVelocity = (this.input_.keys_[KEYS.w] ? 1 : 0) + (this.input_.keys_[KEYS.s] ? -1 : 0);
      const strafeVelocity = (this.input_.keys_[KEYS.a] ? 1 : 0) + (this.input_.keys_[KEYS.d] ? -1 : 0);

      if (!this.grounded) {
        this.verticalVelocity_ -= this.gravity * timeElapsedS; // Apply gravity over time
      } else {
        this.verticalVelocity_ = 0; // Reset vertical velocity if grounded
      }

      if (this.input_.keys_[KEYS.space] && this.grounded) {
        this.verticalVelocity_ = this.jumpSpeed; // Set vertical velocity for jumping
        this.jumping = true; // Set jumping state
        this.grounded = false; // Player is now in the air
    }

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
      this.translation_.y+=this.verticalVelocity_;

      this.checkIfGround()
    }
  

    calculateEdge_(mouseX,mouseY,edgeThreshold,halfViewPortW,halfViewPortH){
        if (mouseX < -1*halfViewPortW + edgeThreshold) { // Mouse is near the left edge
          this.phi_ += 0.01 // Rotate left
      } else if (mouseX > halfViewPortW-edgeThreshold ) { // Mouse is near the right edge
          this.phi_ -= 0.01 // Rotate right
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
      }


    if (rotate){
        if (isNaN(xh) || isNaN(yh)) {
          return; 
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