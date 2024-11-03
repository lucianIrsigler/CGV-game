import { SceneBaseClass } from "../../src/scripts/Scene/SceneBaseClass.js";
import * as THREE from 'three';
// import * as CANNON from 'cannon-es';
// import CannonDebugger from 'cannon-es-debugger';
import { ObjectManager } from "../scripts/Scene/ObjectManager.js";
import { LightManager } from "../scripts/Scene/LightManager.js";
import { LoadingManagerCustom } from "../scripts/Loaders/Loader.js";
import { LightMechanicManager } from "../scripts/Scene/LightMechanicManager.js";
import { CameraManager } from "../scripts/Scene/CameraManager.js";
import { GunManager } from '../scripts/Scene/GunManager.js';
// import { CircularPlatform } from '../../Level2/NewLevel2/circularPlatform.js';
import { CircularPlatform } from '../scripts/Objects/circularPlatform.js';
import { getRandomMonster } from "../scripts/util/getRandomMonster.js";
import { loadTextures,applyTextureSettings } from '../scripts/util/TextureLoaderUtil.js';
import { SoundEffectsManager } from '../scripts/Scene/SoundEffectManger.js';
export class CustomScene2 extends SceneBaseClass {
    constructor() {
        super(); // Call the base class constructor
        this.animationId = null;
        this.cube;

        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.playerBody; //cannon.js model
        this.target; //player model

        this.maxHealth = 100; // Define the maximum health
        this.health = this.maxHealth;
        this.loaded = false;
        this.damageRate = 1; // Define the damage rate
        this.healingRate = 5; // Define the healing rate

        this.gameOverScreen = document.getElementById("gameOverScreen");
        this.restartButton = document.getElementById("restartButton");

        this.isGamePaused = false;

        //MANAGERS
        this.cameraManager;
        this.objManager = new ObjectManager(this.scene,this.world);
        this.lightManager = new LightManager(this.scene);
        this.loader = new LoadingManagerCustom();
        this.lightMechanicManager = new LightMechanicManager(this.characterLight,100,20,10);

        //flags
        this.playingAlready = false

        //lights
        //this.lampsArray = Object.values(lamps3);
        this.playerLight;


        //animation
        this.lastTime = 0;
        this.animationId = null;

        this.enemy=null;

        //pew pew stuff
        this.gunManager;
        //this.crosshair = new Crosshair(5, 'white');


        //debug
        // this.debugRenderer = new CannonDebugger(this.scene, this.world);

        //this.currentMonster = getRandomMonster(monsters3);

    }

    initScene(){
        this.init_lighting_();
        this.init_objects_();
        this.init_camera_();
    }

    init_objects_() {
        // const geometry = new THREE.BoxGeometry();
        // const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        // const cube = new THREE.Mesh(geometry, material);
        // this.addObject(cube);
        // this.cube = cube;
        const circularPlatform = new CircularPlatform(0, 5, 10);
this.circularPlatform = circularPlatform;
this.addObject(circularPlatform);

const floor = new CircularPlatform(0, 50, 10);
floor.position.y = -1;
//scene.add(floor);

const ceiling = new CircularPlatform(0, 50, 100);
ceiling.position.y = 10;
//scene.add(ceiling);

const wall = new CircularPlatform(0, 10, 120);
wall.position.y = 10 - 1;

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
