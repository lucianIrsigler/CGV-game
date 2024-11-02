import * as THREE from 'three';
import { CPBoxLamp } from './CPBoxLamp.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export class ButtonPlatform extends CPBoxLamp {
    constructor(innerRadius, outerRadius, depth, sequence = null, text = null) {
        super(innerRadius, outerRadius, depth);
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.depth = depth;
        this.sequence = Array.isArray(sequence) ? sequence : [sequence]; // Ensure sequence is an array
        this.text = text;
        this.isClickable = true;
        
        const group = this.createGroup();
        this.add(group);
        this.buttonMesh = this.createButton();
        this.add(this.buttonMesh);
        
        // Add click detection
        this.setupClickDetection();
    }

    setupClickDetection() {
        // Create a slightly larger invisible collision box for better click detection
        const clickGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        const clickMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        this.clickBox = new THREE.Mesh(clickGeometry, clickMaterial);
        this.clickBox.position.copy(this.buttonMesh.children[0].position);
        this.add(this.clickBox);
        
        // Add user data for raycasting
        this.clickBox.userData.isButton = true;
        this.clickBox.userData.buttonPlatform = this;
    }

    createButton() {
        const group = new THREE.Group();
        const buttonGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        
        const textureLoader = new THREE.TextureLoader();
        const colorMap = textureLoader.load('PavingStones/Color.jpg');
        const aoMap = textureLoader.load('PavingStones/AmbientOcclusion.jpg');
        const displacementMap = textureLoader.load('PavingStones/Displacement.jpg');
        const metalnessMap = textureLoader.load('PavingStones/Metalness.jpg');
        const normalMapDX = textureLoader.load('PavingStones/NormalDX.jpg');
        const roughnessMap = textureLoader.load('PavingStones/Roughness.jpg');
        
        [colorMap, aoMap, displacementMap, metalnessMap, normalMapDX, roughnessMap].forEach(texture => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(0.1, 0.1);
        });
        
        colorMap.encoding = THREE.sRGBEncoding;
        const material = new THREE.MeshStandardMaterial({
            map: colorMap,
            aoMap: aoMap,
            displacementMap: displacementMap,
            metalnessMap: metalnessMap,
            normalMap: normalMapDX,
            roughnessMap: roughnessMap,
            displacementScale: 0,
            metalness: 0.1,
            roughness: 0.5
        });

        const button = new THREE.Mesh(buttonGeometry, material);
        button.rotateZ(Math.PI / 2);
        button.position.set(0, 0, this.innerRadius + (this.outerRadius - this.innerRadius) / 2);
        group.add(button);

        // Add text in front of the button
        // const fontLoader = new FontLoader();
        // fontLoader.load('fonts/helvetiker_regular.typeface.json', (font) => {
        //     const textGeometry = new TextGeometry(this.text, {
        //         font: font,
        //         size: 1,
        //         height: 0.05,
        //         curveSegments: 12,
        //         bevelEnabled: false
        //     });
        //     const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        //     const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        //     textMesh.position.set(0, 0.6, this.innerRadius + (this.outerRadius - this.innerRadius) / 2 + (this.outerRadius - this.innerRadius) / 4);
        //     group.add(textMesh);
        // });

        return group;
    }

    createGroup() {
        const group = super.createGroup();
        return group;
    }

    // Method to handle button press animation
    press() {
        if (!this.isClickable) return;
        
        // Visual feedback - move button down slightly
        const button = this.buttonMesh.children[0];
        const originalY = button.position.y;
        
        button.position.y -= 0.1;
        setTimeout(() => {
            button.position.y = originalY;
        }, 200);
    }

    // Method to temporarily disable button
    disable() {
        this.isClickable = false;
        const button = this.buttonMesh.children[0];
        button.material.color.setHex(0x666666);
    }

    // Method to enable button
    enable() {
        this.isClickable = true;
        const button = this.buttonMesh.children[0];
        button.material.color.setHex(0xffffff);
    }
}