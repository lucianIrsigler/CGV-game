import { SceneBaseClass } from "../scripts/Scene/SceneBaseClass";
import * as THREE from 'three';

export class CustomScene1 extends SceneBaseClass {
    constructor() {
        super(); // Call the base class constructor
        this.animationId = null;
        this.cube;

    }

    initScene(){
        this.init_lighting_();
        this.init_objects_();
        this.init_camera_();
    }

    init_objects_() {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
        const cube = new THREE.Mesh(geometry, material);
        this.addObject(cube);
        this.cube = cube;
    }

    init_camera_() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1, 5); // Set camera position
    }

    init_lighting_() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1).normalize();
        this.scene.add(directionalLight);
    }

    animate=()=> {
        this.scene.rotation.z += 0.01;
        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(this.animate);
    }

    stopAnimate=()=> {
        cancelAnimationFrame(this.animationId)
        this.animationId=null;
    }

    
    restart(){
        this.scene.rotation.z =0;


    }

}
