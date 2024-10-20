import * as THREE from 'three'; // Import necessary modules

// Bullet class
export class Bullet {
    constructor(position) {
        this.geometry = new THREE.SphereGeometry(0.05, 10, 10); // Small sphere as bullet
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White color
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(position); // Set initial position
        this.velocity = new THREE.Vector3(0, 0, -1); // Direction of bullet movement

        this.initialPosition = position.clone(); // Store the bullet's initial position
        this.maxDistance = 50; // Set maximum travel distance for the bullet

        // Create ambient light for bullet
        this.light = new THREE.PointLight(0xffffff, 5, 10); // Small radius light - parameter: color, intensity, distance 
        this.light.position.copy(this.mesh.position); // Light starts at bullet's position
    }

    update(scene) {
        // Move the bullet
        this.mesh.position.add(this.velocity.clone().multiplyScalar(0.9)); // Speed of the bullet
        this.light.position.copy(this.mesh.position); // Keep light following the bullet

        // Calculate the distance traveled by the bullet
        const distanceTraveled = this.mesh.position.distanceTo(this.initialPosition);

        // Check if the bullet has traveled beyond the max distance
        if (distanceTraveled >= this.maxDistance) {
            scene.remove(this.mesh); // Remove bullet from the scene
            scene.remove(this.light); // Remove the light as well
            return false; // Return false to indicate that this bullet should be removed
        }

        return true; // Return true to keep the bullet in the array
    }
}
