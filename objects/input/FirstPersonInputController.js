export class FirstPersonInputController {
    constructor() {
      this.initialize_();
      this.previous_ = null;

    }
  
    initialize_() {
      this.current_ = {
        leftButton: false,
        rightButton: false,
        mouseX: 0,
        mouseY: 0
      };
  
      this.keys_ = {};
      this.previousKeys_ = {};
  
      document.addEventListener("mousedown", (e) => this.onMouseDown_(e), false);
      document.addEventListener("mouseup", (e) => this.onMouseUp_(e), false);
      document.addEventListener("mousemove", (e) => this.onMouseMove_(e), false);
      document.addEventListener("keydown", (e) => this.onKeyDown_(e), false);
      document.addEventListener("keyup", (e) => this.onKeyUp_(e), false);
      
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
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      window.scrollTo(centerX, centerY);


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
  
    update() {
      this.previous_ = { ...this.current_ };
    }
}