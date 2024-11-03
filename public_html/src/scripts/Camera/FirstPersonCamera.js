import * as THREE from 'three';
// import { Body } from 'cannon-es';
import { FirstPersonInputController } from '../InputController/FirstPersonInputController.js';

/**
 * Class that controls the camera for first person
 */
export class FirstPersonCamera {
    /**
     * @param {THREE.Camera} camera Camera of the scene
     * @param {THREE.Object3D} target Target mesh to attach the camera to
     * @param {CANNON.Body} playerBody cannon.js body for the attached mesh
     * @param {THREE.Scene} scene scene the object is in
     */
    constructor(camera, target, playerBody, scene) {
        this.camera_ = camera;
        this.scene = scene;
        this.target_ = target;
        this.playerBody = playerBody;
        this.input_ = new FirstPersonInputController(scene, target, playerBody);
    }
    

    updateVariables(phi,theta,target,playerBody,camera){
        this.input_.updateVariables(phi,theta,target,playerBody)
        this.camera_ = camera;
    }


    /**
     * Updates the camera to match the input controller's rotation and position
     * @param {*} _
     */
    updateCamera_(_) {
        // Copy quaternion from input controller
        this.camera_.quaternion.copy(this.input_.rotation);
        
        // Optional: Offset the camera position to align with first-person view
        const cameraOffset = new THREE.Vector3(0, 1, 0); // Adjust height as needed
        this.camera_.position.copy(this.playerBody.position).add(cameraOffset);

        this.camera_.rotateY(Math.PI);
    }
    
    /**
     * Updates the camera
     * @param {*} timeElapsedS 
     */
    update(timeElapsedS) {
        // Manage visibility of target and player body
        this.input_.target_.visible = true; // Hide target when in first person
        this.input_.playerBody.visible = true; // Hide player body when in first person
        
        // Update input controls and camera
        this.input_.update(timeElapsedS);
        this.updateCamera_(timeElapsedS);
    }

    dispose(){
        this.input_.dispose();
    }
}
