import * as THREE from 'three';

export class Lamp extends THREE.Object3D {
    constructor(x, y, z, color) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
        this.mesh = this.createMesh();
        this.add(this.mesh);
    }

    createMesh() {
        const lampGroup = new THREE.Group();

        const baseGeometry = new THREE.CylinderGeometry(this.x, this.x, this.z / 10, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        baseMesh.position.y = this.z / 20;
        lampGroup.add(baseMesh);

        const poleGeometry = new THREE.CylinderGeometry(this.x / 4, this.x / 4, this.z, 32);
        const poleMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        const poleMesh = new THREE.Mesh(poleGeometry, poleMaterial);
        poleMesh.position.y = this.z / 2;
        lampGroup.add(poleMesh);

        const shadeGeometry = new THREE.ConeGeometry(this.x, this.z / 2, 32);
        const shadeMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        const shadeMesh = new THREE.Mesh(shadeGeometry, shadeMaterial);
        shadeMesh.position.y = this.z;
        lampGroup.add(shadeMesh);

        return lampGroup;
    }
}