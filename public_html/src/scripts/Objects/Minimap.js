import * as THREE from 'three';


export class MiniMap{
    /**
     * Class to hold the minimap object. yAboveScene is how far in the sky the objects to represent the
     * players,endgoal, and any other thing should be. Default is 20
     * @param {THREE.Scene} scene 
     * @param {int} yAboveScene 
     */
    constructor(scene,yAboveScene){
        this.scene = scene;

        this.miniMapCamera = null;
        this.miniMapRender = null;
        this.lastMiniMapRenderTime = 0; // To track the last time the mini-map was rendered
        this.miniMapRenderInterval = 100;


        this.redCubeGeometry = new THREE.BoxGeometry(3, 1, 3);
        this.redCubeMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 })
        this.redCube = new THREE.Mesh(this.redCubeGeometry,this.redCubeMaterial);


        this.player;
        this.endGoal;
        this.enemy=null;
        this.yAboveTheScene = yAboveScene

    }

    /**
     * Sets up the minimap camera and appends to DOM
     * @param {window} window 
     * @param {document} document 
     */
    init_miniMap_(window,document){
        this.miniMapCamera = new THREE.OrthographicCamera(
            window.innerWidth / -2, window.innerWidth / 2,
            window.innerHeight / 2, window.innerHeight / -2,
            0.1, 1000
        );
        this.miniMapCamera.position.set(0, 100, 0); // Position the mini-map camera above the scene
        //this.miniMapCamera.lookAt(0,0,15); // Look at the center of the scene

        // Set the zoom factor
        this.miniMapCamera.zoom = 12.5; // Increase this value to zoom in
        this.miniMapCamera.updateProjectionMatrix(); // Update the projection matrix after changing the zoom

        this.miniMapRenderer = new THREE.WebGLRenderer({ alpha: true });
        this.miniMapRenderer.setSize(200, 200); // Set the size of the mini-map
        this.miniMapRenderer.domElement.style.position = 'absolute';
        this.miniMapRenderer.domElement.style.top = '10px';
        this.miniMapRenderer.domElement.style.right = '10px';
        document.body.appendChild(this.miniMapRenderer.domElement);
    }

    /**
     * Adds a mesh above the scene to represent the end goal
     * @param {} position JSON in the form {x:num,y:num,z:num}
     * @param {string} colour colour of the block
     */
    addEndGoal(position,colour){
        let cubeGeometry = new THREE.BoxGeometry(3, 1, 3);
        let cubeMaterial = new THREE.MeshBasicMaterial({ color: colour })
        this.endGoal = new THREE.Mesh(cubeGeometry,cubeMaterial);
        this.endGoal.position.set(position.x,this.yAboveTheScene,position.z);

        this.scene.add(this.endGoal);
    }

    /**
     * Adds a mesh above the scene to represent the player
     * @param {string} colour 
     */
    addPlayer(colour){
        let cubeGeometry = new THREE.BoxGeometry(3, 5, 3);
        let cubeMaterial = new THREE.MeshBasicMaterial({ color: colour })
        this.player = new THREE.Mesh(cubeGeometry,cubeMaterial);
        this.scene.add(this.player);
    }
    addEnemy(colour){
        let cubeGeometry = new THREE.BoxGeometry(3, 5, 3);
        let cubeMaterial = new THREE.MeshBasicMaterial({ color: colour })
        this.enemy = new THREE.Mesh(cubeGeometry,cubeMaterial);
        this.scene.add(this.enemy);
    }


    update(scene,target,enemyt){
        const currentTimeMiniMap = Date.now();
        this.player.position.set(target.position.x,this.yAboveTheScene,target.position.z);
        if (enemyt) {
            this.enemy.position.set(enemyt.position.x, this.yAboveTheScene, enemyt.position.z);
        }
        if (currentTimeMiniMap - this.lastMiniMapRenderTime >= this.miniMapRenderInterval) {
            this.miniMapRenderer.render(scene, this.miniMapCamera);
            this.lastMiniMapRenderTime = currentTimeMiniMap; // Update the time of last render
        }
    }


}