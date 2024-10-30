import * as THREE from 'three';
import { Body} from 'cannon-es';
import { FirstPersonInputController } from '../InputController/FirstPersonInputController';

//https://medium.com/@brazmogu/physics-for-game-dev-a-platformer-physics-cheatsheet-f34b09064558
/**
 * Class that controls the camera for first person
 */
export class FirstPersonCamera{
  /**
   * @param {THREE.Camera} camera Camera of the scene
   * @param {THREE.Object3D} target Target mesh to attach the camera to
   * @param {Body} playerBody cannon.js body for the attached mesh
   * @param {THREE.scene} scene scene the object is in
   */
    constructor(camera,target,playerBody,scene) {
      this.camera_ = camera;
      this.scene = scene;
      this.target_ = target
      this.playerBody = playerBody;
      this.input_ = new FirstPersonInputController(scene,target,playerBody);
    }
    
    /**
     * Updates the camera to match the input controller's rotation and position
     * @param {*} _ 
     */
    updateCamera_(_) {
      this.camera_.quaternion.copy(this.input_.playerBody.quaternion);
      this.camera_.position.copy(this.input_.playerBody.position);
    }
    
    /**
     * Updates the camera
     * @param {*} timeElapsedS 
     */
    update(timeElapsedS) {
      this.input_.target_.visible=true;
      this.input_.update(timeElapsedS);
      this.updateCamera_(timeElapsedS)
    }
}
