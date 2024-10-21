import { SceneBaseClass } from "../scripts/Scene/SceneBaseClass";
import * as THREE from 'three';
import { LightManager } from "../scripts/Scene/LightManager";
import { ObjectManager } from "../scripts/Scene/ObjectManager";

export class CustomScene extends SceneBaseClass {
    constructor() {
        super(); // Call the base class constructor
        this.lightManager = new LightManager(this.scene);
        this.objectManager = new ObjectManager(this.scene);
    }

    initScene(){
        this.init_lighting_();
        this.init_objects_();
        this.init_camera_();

        //If you want to load models, then you can use LoadingManager, an example of how to
        // do it is in movement.js initialize()
    }

    init_objects_() {
        //you have to add the geometry to the object manager
        this.objectManager.addGeometry("cube",new THREE.BoxGeometry())
        //you have to add the material to the object manager
        this.objectManager.addMaterial("cube",new THREE.MeshStandardMaterial({ color: 0x00ff00 }))
        //now to add a cube
        //arguments are:
        /*
            name- NAME_OF_OBJECT
            geometry-GEOMETRY TO USE(thats why we put "cube",since we added a geometry named
            "cube" into the object manager)
            material-MATERIAL TO USE(thats why we put "cube",since we added a material named
            "cube" into the object manager)
            position => if null, set to (0,0,0), if want custom, must pass it in like
            {x:1,y:1,z:1}
            rotation => if null, set to (0,0,0), if want custom, must pass it in like
            {x:1,y:1,z:1}
        */
        this.objectManager.createObject("NAME_OF_OBJECT","cube","cube",null,null);
    }

    init_camera_() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1, 5); // Set camera position
    }

    init_lighting_() {
        const ambientLight = new THREE.AmbientLight(0x404040);

        //this adds a light source to the scene
        /*
            name -> name of light/object
            light -> light to pass in
            position-> if null, set to (0,0,0). If want custom, must set it as
            {x:1,y:1,z:1}
        */
        this.lightManager.addLight("ambient",ambientLight,null);


        //the same thing
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 10);
        let pos = new THREE.Vector3(0,1,1).normalize();
        this.lightManager.addLight("directional",directionalLight,pos);
    }

    animate=()=> {
        console.log("HERE");
        this.scene.rotation.y += 0.01;
        this.renderer.render(this.scene, this.camera);
    }

}
