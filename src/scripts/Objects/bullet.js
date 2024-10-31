import * as THREE from 'three'; // Import necessary modules
import * as CANNON from 'cannon-es'; // Import Cannon.js for physics

// Bullet class
export class Bullet {
    constructor(position, color) {
        // Create a sound effect for bullet shot (if needed)
        // const bulletSound = new Audio('bullet_sound.mp3'); // Load gunshot sound
        // bulletSound.volume = 0.5; // Adjust the volume
        // bulletSound.play(); // Play gunshot sound when bullet is created

        // Bullet geometry and material
        this.geometry = new THREE.SphereGeometry(0.05, 10, 10); // Small sphere as bullet
        this.material = new THREE.MeshBasicMaterial({ color: color }); // Use the provided color
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(position); // Set initial position
        this.velocity = new THREE.Vector3(0,0,-1);

        // Create ambient light for the bullet
        this.light = new THREE.PointLight(color, 0, 10); // Use the provided color
        this.light.position.copy(this.mesh.position); // Light starts at bullet's position

        this.intensityGrowthRate = 0.1; // Control how quickly the light intensity grows
        this.maxDistance = 50; // Set maximum travel distance for the bullet
        this.initialPosition = position.clone(); // Store the bullet's initial position


    }

    
    update(scene) {
        // Move the bullet
        this.mesh.position.add(this.velocity.clone().multiplyScalar(0.9)); // Speed of the bullet
        this.light.position.copy(this.mesh.position); // Keep light following the bullet


        // console.log(this.body.position,this.mesh.position)

        // Update light position
        this.light.position.copy(this.mesh.position); // Keep light following the bullet

        // Gradually increase the light intensity as the bullet moves
        if (this.light.intensity < 5) { // Set maximum intensity to 5
            this.light.intensity += this.intensityGrowthRate; // Increase intensity gradually
        }

        // Calculate the distance traveled by the bullet
        this.distanceTraveled = this.mesh.position.distanceTo(this.initialPosition);

        // Check if the bullet has traveled beyond the max distance
        if (this.distanceTraveled >= this.maxDistance) {
            scene.remove(this.mesh); // Remove bullet from the scene
            scene.remove(this.light); // Remove the light as well
            return false; // Return false to indicate that this bullet should be removed
        }


        return true; // Return true to keep the bullet in the array
    }
}
