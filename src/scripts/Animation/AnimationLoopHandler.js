
export class AnimationManager {
    constructor() {
        this.currentScene = null;
        this.animationId = null;
        this.isPaused = false;
    }

    startAnimationLoop() {
        const animate = () => {
            if (this.currentScene && !this.isPaused) {
                this.animationId = requestAnimationFrame(animate);
                this.currentScene.animate();
            }
        };
        animate(); // Start the loop
    }

    switchScene(newScene) {
        if (this.currentScene) {
            this.stopAnimationLoop();
            this.currentScene.disposeLevel(); // Dispose the current scene
            this.currentScene=null;
        }

        this.currentScene = newScene; // Set the new scene as the current scene
        this.currentScene.initScene(); // Initialize the new scene

        // Start the animation loop if it wasn't already running
        if (this.animationId===null) {
            this.startAnimationLoop();
        }
    }

    stopAnimationLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null; // Reset the ID to null
        }
    }

    pauseAnimation() {
        if (!this.isPaused) { // Only pause if not already paused
            this.isPaused = true; // Set pause state
            this.stopAnimationLoop(); // Stop the animation loop
        }
    }

    resumeAnimation() {
        this.isPaused = false; // Clear pause state
        if (this.animationId === null) {
            this.startAnimationLoop(); // Restart the loop if it was stopped
        }
    }

    getCurrentScene() {
        return this.currentScene;
    }


}
