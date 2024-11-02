import * as THREE from 'three';

export class SceneBaseClass {
    /**
     * Class to represent the base class of a scene
     */
    constructor() {
        if (new.target === SceneBaseClass) {
            throw new Error("Cannot instantiate SceneBaseClass directly");
        }
        // Common properties
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = new THREE.WebGLRenderer();
        this.init_();
    }

    init_() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener('resize', this.onWindowResize.bind(this));
        // this.init_objects_();
        // this.init_lighting_();
        // this.init_camera_();
    }

    disposeLevel(){
        if (!this.scene) return;
    
        while (this.scene.children.length > 0) {
            this.removeObject(this.scene.children[0]);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            // Ensure that the renderer's DOM element is removed safely
            try {
                document.body.removeChild(this.renderer.domElement);
            } catch (e) {
                console.warn("Renderer's DOM element could not be removed:", e);
            }
        }

    }


    initScene(){
        throw new Error("Method must be implemented in subclasses");
    }

    init_objects_(){
        throw new Error("Method must be implemented in subclasses");
    }

    init_camera_(){
        throw new Error("Method must be implemented in subclasses");
    }

    init_lighting_(){
        throw new Error("Method must be implemented in subclasses");
    }

    render() {
        // To be overridden in subclasses
        throw new Error("Render method must be implemented in subclasses");
    }

    restart(){
        throw new Error("animate method must be implemented in subclasses");

    }

    animate(){
        throw new Error("animate method must be implemented in subclasses");
    }

    stopAnimate(){
        throw new Error("animate method must be implemented in subclasses");
    }

    /**
     * Adds a three js object to the scene
     * @param {THREE.Object3D} object 
     */
    addObject(object) {
        this.scene.add(object);
    }

    /**
     * Removes a three js object to the scene
     * @param {THREE.Object3D} object 
     */
    removeObject(object) {
        this.scene.remove(object);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    endLevel(){
        const levelEnded = new CustomEvent('levelEnded', {});
        document.dispatchEvent(levelEnded);
    }
}