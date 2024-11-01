import * as THREE from 'three';
import { SceneBaseClass } from "../scripts/Scene/SceneBaseClass.js";
import { CameraManager } from "../scripts/Scene/CameraManager.js";
import { ObjectManager } from "../scripts/Scene/ObjectManager.js";
import { LightManager } from "../scripts/Scene/LightManager.js";
import { LoadingManagerCustom } from "../scripts/Loaders/Loader.js";
import { CurvedPlatform } from '../scripts/Objects/CurvedPlatform.js';
import { World, Body, Box,Vec3 } from 'cannon-es';
import { loadTextures,applyTextureSettings } from '../scripts/util/TextureLoaderUtil.js';

export class Level2 extends SceneBaseClass {
    constructor(){
        super();
        
        //WORLD
        this.world = new World();
        this.world.gravity.set(0, -12, 0);
        this.playerBody; //cannon.js model
        this.target; //player model

        //MANAGERS
        this.cameraManager;
        this.objManager = new ObjectManager(this.scene,this.world);
        this.lightManager = new LightManager(this.scene);
        this.loader = new LoadingManagerCustom(); 

        this.animationId = null;
    }

    initScene(){
        this.init_lighting_();
        this.init_objects_();
        this.init_camera_();
        this.animate();
    }//initalizes the scene

    init_camera_() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0,12,20);
    }//initializes the camera

    init_lighting_(){
        let temp = new THREE.AmbientLight(0x101010, 0.75);
        this.lightManager.addLight("ambient", temp, null);
    }//initializes the lighting

    async _init_textures(){
        const groundTextures = loadTextures("PavingStones")
        applyTextureSettings(groundTextures, 1, 5);
        const platformTextures = loadTextures("PavingStones")
        applyTextureSettings(platformTextures, 1, 5);
        return {groundTextures, platformTextures}
    }//initializes the textures - basically gets the textures

    async _initMaterials(){
        const {groundTextures, platformTextures} = await this._init_textures()//from _init_textures, get the texture/s

        this.objManager.addMaterial("platform", new THREE.MeshStandardMaterial({
            map: groundTextures.colorMap,
            aoMap: groundTextures.aoMap,
            displacementMap: groundTextures.displacementMap,
            metalnessMap: groundTextures.metalnessMap,
            normalMap: groundTextures.normalMapDX, 
            roughnessMap: groundTextures.roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        }));//add matreial to specific geometry - anything named myPlatform will have this material
        
        this.objManager.addMaterial("platforms",new THREE.MeshStandardMaterial({
            map: platformTextures.colorMap,
            aoMap: platformTextures.aoMap,
            displacementMap: platformTextures.displacementMap,
            metalnessMap: platformTextures.metalnessMap,
            normalMap: platformTextures.normalMapDX, 
            roughnessMap: platformTextures.roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        }));
        
        this.objManager.addMaterial("ground",new THREE.MeshStandardMaterial({ color: 0x808080 }));//just giving this a color
    }//initializes the materials

    async _initGeometries(){
        this.objManager.addGeometry("platform",new THREE.BoxGeometry(10, 1, 50));
        this.objManager.addGeometry("ground",new THREE.PlaneGeometry(20, 20));
    }//initializes the geometries - adding platforms and such

    async createObjects(){
        await this._initGeometries();
        await this._initMaterials();
        //get the geometries and materials

        const groundMesh = this.objManager.createVisualObject("ground", "platform", "platform", {x:0,y:-0.5,z:20});
        //name, geometry, material, position, rotation
        const groundBody = this.objManager.createPhysicsObject("ground", "platform", {x:0,y:-0.5,z:20}, null, 0);
        //name, geometry, position, rotation, mass
        this.objManager.linkObject("ground", groundMesh, groundBody);
        //

        const platformConfigurations = [{
            name: "myPlatform",
            geometry: "platform",
            material: "platform",
            position: { x: 0, y: 2, z: -5 },
            rotation: { x: Math.PI / 2, y: 0, z: 0 }
        }];//creates objects with specific configurations

        platformConfigurations.forEach((platform)=>{
            const tempMesh = this.objManager.createVisualObject(platform.name,platform.geometry,platform.material,platform.position,platform.rotation);
            const tempBody = this.objManager.createPhysicsObject(platform.name, platform.geometry, platform.position, platform.rotation, 0);
            this.objManager.linkObject(platform.name,tempMesh, tempBody);
        })

        this.scene.background = new THREE.Color(0x333333);//add a background color

    }//creates the objects

    async init_objects_() {
        const player = this._init_player()
        let out = this.createObjects()
    }//uses createObjects which uses initGeometries and initMaterials - initMaterials uses initTextures... phew, what a rabbt hole

    async _init_player(){
        const gltf = await this.loader.loadModel('src/models/cute_alien_character/scene.gltf', 'player');
        const model = gltf.scene; // Get the loaded model
        this.addObject(model); // Add the model to the scene
        model.rotation.set(0, 0, 0); // Rotate the model
        model.scale.set(1,1,1); // Scale the model if necessary
        model.position.set(0, 0.5, 0);
        model.name = "player"; // Name the model
        this.target = model;
        this.target.visible=false;

        //create cannon.js body for model
        this.playerBody = new Body({
            mass: 1, // Dynamic body
            position: new Vec3(0, 2, 0), // Start position
        });
        const boxShape = new Box(new Vec3(0.5, 1, 0.5)); // Box shape for the player
        this.playerBody.addShape(boxShape);
        this.world.addBody(this.playerBody);


        this.cameraManager = new CameraManager(
            this.camera,
            this.target,
            this.playerBody,
            this.scene
        );

        this.playerLoaded = true;
    }

    /**
     * Animation function
     * @param {} currentTime 
     * @returns 
     */
    animate=(currentTime)=> {
        this.animationId = requestAnimationFrame(this.animate);

        if (this.cameraManager==undefined||!this.loader.isLoaded() || !this.playerLoaded){
            return;
        }

        this.world.step(1 / 60);
        this.objManager.update();

        const timeElapsedSec = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.cameraManager.update(timeElapsedSec)
        // Render the scene
        this.renderer.render(this.scene, this.cameraManager.getCamera());
    }

    stopAnimate=()=> {
        cancelAnimationFrame(this.animationId)
        this.animationId=null;
    }
    restart(){
        this.restart();
    }

    disposeLevel(){
        if (!this.scene) return;

        this.objManager.removeAllObjects();
        this.lightManager.removeAllLights();
    
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
}