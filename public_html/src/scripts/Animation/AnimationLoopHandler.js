
export class AnimationManager {
    constructor() {
        this.currentScene = null;
        this.isPaused = false;
        this.id = null;

    }

    startAnimationLoop() {
        const animate = () => {
            if (this.currentScene && !this.isPaused) {
                this.currentScene.animate();
            }
        };
        animate(); // Start the loop
    }

    exitScene(){
        if (this.currentScene){
            this.stopAnimationLoop();
            this.currentScene.disposeLevel(); // Dispose the current scene
            this.currentScene=null;
            this.id=null;

        }
    }

    restartScene(){
        if (this.currentScene){
            this.stopAnimationLoop();
            this.currentScene.restart();
        }

        if (this.currentScene.animationId===null) {
            this.startAnimationLoop();
        }
    }

    switchScene(newScene,id=0) {
        if (this.currentScene) {
            this.stopAnimationLoop();
            this.currentScene.disposeLevel(); // Dispose the current scene
            this.currentScene=null;
            this.id = null;
        }

        this.currentScene = newScene; // Set the new scene as the current scene
        this.id = id;
        this.currentScene.initScene(); // Initialize the new scene

        // Start the animation loop if it wasn't already running
        if (this.currentScene.animationId===null) {
            this.startAnimationLoop();
        }
    }

    stopAnimationLoop() {
        if (this.currentScene) {
            this.currentScene.stopAnimate();
            
        }
    }

    pauseAnimation() {
        if (!this.isPaused) { // Only pause if not already paused
            this.isPaused = true; // Set pause state
            this.stopAnimationLoop(); // Stop the animation loop
            const myEvent = new CustomEvent("Pause", {});

            document.dispatchEvent(myEvent);

        }
    }

    resumeAnimation() {
        this.isPaused = false; // Clear pause state
        if (this.currentScene!=null && this.currentScene.animationId === null) {
            this.startAnimationLoop(); // Restart the loop if it was stopped
            const myEvent = new CustomEvent("Resume", {});

            document.dispatchEvent(myEvent);
        }
    }

    getCurrentScene() {
        return this.currentScene;
    }


}
