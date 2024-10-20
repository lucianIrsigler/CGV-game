import { SceneBaseClass } from "../scripts/Scene/SceneBaseClass";
import * as THREE from 'three';

export class Level1 extends SceneBaseClass {
    constructor() {
        super(); // Call the base class constructor
    }

    initScene(){
        this.init_lighting_();
        this.init_objects_();
        this.init_camera_();
    }

    init_objects_() {
    }

    init_camera_() {
    }

    init_lighting_() {
    }

    animate=()=> {
        console.log("HERE");
        this.scene.rotation.y += 0.01;
        this.renderer.render(this.scene, this.camera);
    }

}
