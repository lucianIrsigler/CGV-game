import * as THREE from 'three';

const KEYS = {
    w: 87,  // W key
    a: 65,  // A key
    s: 83,  // S key
    d: 68   // D key
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export class ThirdPersonInputController {
    constructor(target) {
        this.target_ = target;
        this.speed_ = 0.1;
        this.phi_ = 0;
        this.theta_ = 0;
        this.initialize_();
    }
  
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
    

    updatePositon_(){
        const moveDirection = new THREE.Vector3();
        if (this.keys_[KEYS.w]) {
            moveDirection.z += this.speed_;
        }
        if (this.keys_[KEYS.s]) {
            moveDirection.z -= this.speed_;
        }
        if (this.keys_[KEYS.a]) {
            moveDirection.x += this.speed_;
        }
        if (this.keys_[KEYS.d]) {
            moveDirection.x -= this.speed_;
        }

        moveDirection.applyQuaternion(this.target_.quaternion);
        this.target_.position.add(moveDirection);
    }


    calculateEdge_(mouseX,mouseY,edgeThreshold,halfViewPortW,halfViewPortH){
        if (mouseX < -1*halfViewPortW + edgeThreshold) { // Mouse is near the left edge
          this.phi_ += 0.05 // Rotate left
      } else if (mouseX > halfViewPortW-edgeThreshold ) { // Mouse is near the right edge
          this.phi_ -= 0.05 // Rotate right
      }
    }

    updateRotation_() {  
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
    }
  }




    update() {
        this.updatePositon_();
        this.updateRotation_(); 
        // console.log("target:",this.target_.position);
        this.previous_ = { ...this.current_ };
    }
}