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
      this.hasJumped = false;
    }
  
    update(timeElapsedS) {
      this.updateRotation_(timeElapsedS);
      this.updateCamera_(timeElapsedS);
      this.updateTranslation_(timeElapsedS);
      
      this.input_.update();
    }
  
    updateCamera_(_) {
      let desync = this.translation_.distanceTo(this.target_.position)>1.2;

      if (desync){
        console.log("desynced");
        this.translation_ = this.target_.position;
        this.rotation_ = this.target_.quaternion;
      }


      this.camera_.quaternion.copy(this.rotation_);
      this.camera_.position.copy(this.translation_);
      this.target_.position.copy(this.translation_);

      this.camera_.position.y +=1.2;
      this.target_.visible=false;
    }
    

    checkIfGround() {
      // Only perform raycast if the player is not grounded or if jumping/falling
      if (!this.jumping) {
        return;  // Skip raycast if grounded and not jumping
      }
    
      // Create a ray starting from the player position, pointing downwards
      let start = this.translation_.clone();
      let direction = new THREE.Vector3(0, -1, 0);  // Cast directly down
      this.rayCaster.set(start, direction);
      
      // Limit raycast to specific objects in the scene (e.g., ground only)
      const groundObjects = this.scene.children.filter(child => child.isGround);  // Tag or mark ground objects
      const intersects = this.rayCaster.intersectObjects(groundObjects, true);
    
      if (intersects.length > 0) {
        // If the intersection is within a certain distance, mark as grounded
        if (intersects[0].distance < this.groundCheckDistance_ && this.hasJumped) {
          console.log("Ground detected, resetting position.");
          this.translation_.y = intersects[0].point.y;
          this.verticalVelocity_ = 0;  // Stop falling when we hit the ground
          this.grounded = true;        // Set grounded to true
          this.jumping = false;        // Reset jumping state
          this.hasJumped=false;
        } else {
          this.grounded = false;
        }

        if (intersects[0].distance>this.groundCheckDistance_ && !this.hasJumped){
          this.hasJumped=true;
        }
      } else {
        this.grounded = false;  // If no intersections found, we are in the air
      }
    }
    
    

    updateTranslation_(timeElapsedS) {
      const forwardVelocity = (this.input_.keys_[KEYS.w] ? 1 : 0) + (this.input_.keys_[KEYS.s] ? -1 : 0);
      const strafeVelocity = (this.input_.keys_[KEYS.a] ? 1 : 0) + (this.input_.keys_[KEYS.d] ? -1 : 0);

      if (!this.grounded) {
        this.verticalVelocity_ -= this.gravity * timeElapsedS;  // Apply gravity if not grounded
      } else {
        this.verticalVelocity_ = 0;  // Reset vertical velocity when grounded
      }
      

      if (this.input_.keys_[KEYS.space] && this.grounded) {
        console.log("Jump initiated");
        this.verticalVelocity_ = this.jumpSpeed; // Set vertical velocity for jumping
        this.jumping = true;                      // Set jumping state
        this.grounded = false;                    // Player is now in the air
      }
      

      const qx = new THREE.Quaternion();
      qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
  
      const forward = new THREE.Vector3(0, 0, -1*this.movementspeed_);
      forward.applyQuaternion(qx);
      forward.multiplyScalar(forwardVelocity * timeElapsedS * 3);
  
      const left = new THREE.Vector3(-1*this.movementspeed_, 0, 0);
      left.applyQuaternion(qx);
      left.multiplyScalar(strafeVelocity * timeElapsedS * 3);
      
      this.translation_.add(forward);
      this.translation_.add(left);
      this.translation_.y += this.verticalVelocity_ * timeElapsedS;


      this.checkIfGround()
    }
  

    calculateEdge_(mouseX,mouseY,edgeThreshold,halfViewPortW,halfViewPortH){
        if (mouseX < -1*halfViewPortW + edgeThreshold) { // Mouse is near the left edge
          this.phi_ += 0.03 // Rotate left
      } else if (mouseX > halfViewPortW-edgeThreshold ) { // Mouse is near the right edge
          this.phi_ -= 0.03 // Rotate right
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