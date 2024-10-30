import * as THREE from 'three';
import { Body,Vec3,Box } from 'cannon-es';
import { SoundEffectsManager } from '../Scene/SoundEffectManger';


const soundEffectsManager = new SoundEffectsManager();

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

/**
 * Class to handle third person movement
 */
export class ThirdPersonInputController {
  /**
   * @param {THREE.Scene} scene scene 
   * @param {THREE.Object3D} target three.js mesh
   * @param {Body} playerBody cannon.js player body for the target
   */
    constructor(scene,target,playerBody) {
        this.scene=scene;
        this.target_ = target
        this.playerBody = playerBody;

        this.speed_ = 0.15;
        this.phi_ = 0;
        this.theta_ = 0;


        //Jump stuff
        this.canJump = true;
        this.alreadyJumped = false;

        this.initialize_();
    }

    /**
     * Initilizes some variables and adds event listeners
     */
    initialize_() {
        this.current_ = {
            leftButton: false,
            rightButton: false,
            mouseX: 0,
            mouseY: 0
        };

        this.keys_ = {};
        this.previous_ = null;
        this.keys_ = {};

    
        document.addEventListener("keydown", (e) => this.onKeyDown_(e), false);
        document.addEventListener("keyup", (e) => this.onKeyUp_(e), false);
        document.addEventListener("mousedown", (e) => this.onMouseDown_(e), false);
        document.addEventListener("mouseup", (e) => this.onMouseUp_(e), false);
        document.addEventListener("mousemove", (e) => this.onMouseMove_(e), false);
    }

    onMouseDown_(e) {
        switch (e.button) {
          case 0: {
            this.current_.leftButton = true;
            break;
          }
          case 2:
            this.current_.rightButton = true;
            break;
        }
      }
    
    onMouseUp_(e) {
        switch (e.button) {
            case 0: {
            this.current_.leftButton = false;
            break;
            }
            case 2:
            this.current_.rightButton = false;
            break;
        }
    }
    
    onMouseMove_(e) {
        this.current_.mouseX = e.pageX - window.innerWidth / 2;
        this.current_.mouseY = e.pageY - window.innerHeight / 2;

        if (this.previous_ === null) {
            this.previous_ = { ...this.current_ };
        }
        this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
        this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;
    }

    onKeyDown_(e) {
        this.keys_[e.keyCode] = true;
    }
  
    onKeyUp_(e) {
        this.keys_[e.keyCode] = false;
    }
    
    /**
     * Casts a raycast downwards, and checks if the intersected object has a distance less than 2.25,
     * If it does, then the ground is grounded, else its not
     * @returns if the object is grounded
     */
    isGrounded() {
      const raycaster = new THREE.Raycaster();
      const origin = new THREE.Vector3(this.playerBody.position.x, this.playerBody.position.y + 1, this.playerBody.position.z); // Slightly above player
      const direction = new THREE.Vector3(0, -1, 0); // Downward direction
      raycaster.set(origin, direction);
      
      // Check for intersections against all objects in the scene except the player mesh
      const intersects = raycaster.intersectObjects(this.scene.children.filter(child => child !== this.target_), true);
      return intersects.length > 0 && intersects[0].distance < 2.25; // Check if we hit something within 1 unit below
    }

  
    updatePosition_() {
      // Clear any existing forces on the player body
      this.playerBody.velocity.set(0, this.playerBody.velocity.y, 0); // Keep vertical velocity to allow gravity and jumping
    
      // Get the player's forward direction
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.target_.quaternion); // Forward vector
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.target_.quaternion); // Right vector
    
      // Normalize the direction vectors
      forward.normalize();
      right.normalize();
    
      // Apply movement based on keys pressed
      if (this.keys_[KEYS.w]) {
          this.playerBody.position.x -= forward.x * this.speed_; // Move forward
          this.playerBody.position.z -= forward.z * this.speed_;
      }
      if (this.keys_[KEYS.s]) {
          this.playerBody.position.x += forward.x * this.speed_; // Move backward
          this.playerBody.position.z += forward.z * this.speed_;
      }
      if (this.keys_[KEYS.a]) {
          this.playerBody.position.x += right.x * this.speed_; // Move left
          this.playerBody.position.z += right.z * this.speed_;
      }
      if (this.keys_[KEYS.d]) {
          this.playerBody.position.x -= right.x * this.speed_; // Move right
          this.playerBody.position.z -= right.z * this.speed_;
      }
    
      // Jump logic
      if (this.keys_[KEYS.space]) {
        if (this.isGrounded() && !this.alreadyJumped) { // Check if the player is on the ground
            this.playerBody.velocity.y = 10; // Set the upward velocity for jumping
            this.alreadyJumped=true;
            soundEffectsManager.playSound("jump");
        }else if (this.isGrounded()){
          this.alreadyJumped=false;
        }
      }

    }
  
    /**
     * Calculates if mouse is near the edge, and if so, updates phi and theta accordindly
     * @param {float} mouseX x position of the mouse
     * @param {float} mouseY y position of the mouse
     * @param {int} edgeThreshold When to start rotating the screen
     * @param {int} halfViewPortW half the width of the viewport - used for calculations
     * @param {int} halfViewPortH half the height of the viewport - used for calculations
     */
    calculateEdge_(mouseX,mouseY,edgeThreshold,halfViewPortW,halfViewPortH){
        if (mouseX < -1*halfViewPortW + edgeThreshold) { // Mouse is near the left edge
          this.phi_ += 0.05 // Rotate left
      } else if (mouseX > halfViewPortW-edgeThreshold ) { // Mouse is near the right edge
          this.phi_ -= 0.05 // Rotate right
      }
    }

    /**
     * Updates the rotation of the object
     * @param {int} timeElapsedS 
     */
    updateRotation_(timeElapsedS) {  
      let rotate = true;
      let edge = false;

      const edgeThreshold = 20;

      const mouseX = this.current_.mouseX;
      const mouseY = this.current_.mouseY;


      const xh = this.current_.mouseXDelta / window.innerWidth;
      const yh = this.current_.mouseYDelta / window.innerHeight;


      if (this.previous_!=null){
        if (this.current_.mouseXDelta==this.previous_.mouseXDelta
          &&this.current_.mouseYDelta==this.previous_.mouseYDelta){
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
          return;  // Stop the function if invalid values are found
        } 

        if (edge){
          this.calculateEdge_(mouseX,mouseY,edgeThreshold,halfViewPortW,halfViewPortH)
        }
        else{
            this.phi_ += (-1*xh * 2);
            this.theta_ = clamp(this.theta_ + -yh * 5, -Math.PI / 3, Math.PI / 3);
        }
    
        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
    
        const qz = new THREE.Quaternion();
        // qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta_);
    
        const q = new THREE.Quaternion();
        q.multiplyQuaternions(qx, qz);

        this.target_.quaternion.copy(q);
        this.playerBody.quaternion.copy(q);
    }
  }

    /**
     * Updates the position and rotation of the object
     * @param {int} timeElapsedS 
     */
    update(timeElapsedS) {
        this.updatePosition_(timeElapsedS);
        this.updateRotation_(timeElapsedS);

        this.target_.position.copy(this.playerBody.position);
        this.target_.quaternion.copy(this.playerBody.quaternion);

        // console.log("target:",this.target_.position);
        this.previous_ = { ...this.current_ };
    }
}