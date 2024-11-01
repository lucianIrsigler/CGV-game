import { FirstPersonCamera } from "../Camera/FirstPersonCamera"
import { ThirdPersonCamera } from "../Camera/ThirdPersonCamera"
import * as THREE from 'three';


/**
 * Class manages switching between first person and third person
 */
export class CameraManager{
    /**
     * Class to manage the 3rd person and 1st person cameras
     * @param {THREE.Camera} camera camera for the scene
     * @param {THREE.Object3D} target target mesh to follow with camera
     * @param {Body} playerBody cannon.js player model
     * @param {THREE.Scene} scene the scene the objects are in
     */
    constructor(camera,target,playerBody,scene){
        this.fps = new FirstPersonCamera(camera,target,playerBody,scene)
        this.thirdPerson = new ThirdPersonCamera(camera,target,playerBody,scene)
        this.firstPerson = true;
        this.playerBody = playerBody;
        this.target = target;
    }

    /**
     * @returns if first person is toggled
     */
    getFirstPerson(){
        return this.firstPerson;
    }

    updateRotation() {
        //we switching to first person here

        if (!this.firstPerson){
            let phi = this.thirdPerson.input_.phi_;
            let theta = this.thirdPerson.input_.theta_;
            let playerBody = this.thirdPerson.input_.playerBody;
            let target = this.thirdPerson.input_.target_;
            let camera = this.thirdPerson.camera_;
            this.fps.updateVariables(phi,theta,target,playerBody,camera);
        }else{
            let phi = this.fps.input_.phi_;
            let theta = this.fps.input_.theta_;
            let playerBody = this.fps.input_.playerBody;
            let target = this.fps.input_.target_;
            let camera = this.fps.camera_;

            this.thirdPerson.updateVariables(phi,theta,target,playerBody,camera);
        }
    }

    /**
     * Sets camera mode to first person
     */
    toggleFirstPerson(){
        this.updateRotation();
        this.firstPerson = true;
    }

    /**
     * Sets camera mode to third person
     */
    toggleThirdPerson(){
        this.updateRotation();
        this.firstPerson=false;

    }

    /**
     * Used for rendering, to render via the correct camera's POV
     * @returns current camera used
     */
    getCamera(){
        if (this.firstPerson){
            return this.fps.camera_;
        }else{
            return this.thirdPerson.camera_;
        }
    }

    /**
     * Handles updating the current camera
     */
    update(timeElapsedS){

        if (this.firstPerson){
            this.fps.update(timeElapsedS);
        }else{
            this.thirdPerson.update(timeElapsedS);
        }
    }
}