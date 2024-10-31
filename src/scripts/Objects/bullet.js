import * as THREE from 'three'; // Import necessary modules
import * as CANNON from 'cannon-es'; // Import Cannon.js for physics

// Bullet class
export class Bullet {
    constructor(position, color, world) {
        // Create a sound effect for bullet shot (if needed)
        // const bulletSound = new Audio('bullet_sound.mp3'); // Load gunshot sound
        // bulletSound.volume = 0.5; // Adjust the volume
        // bulletSound.play(); // Play gunshot sound when bullet is created

        // Bullet geometry and material
        this.geometry = new THREE.SphereGeometry(0.05, 10, 10); // Small sphere as bullet
        this.material = new THREE.MeshBasicMaterial({ color: color }); // Use the provided color
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(position); // Set initial position
        

        // Cannon.js body for physics
        this.body = new CANNON.Body({
            mass: 1, // Set mass for the bullet
            position: new CANNON.Vec3(position.x, position.y, position.z), // Set initial position
            shape: new CANNON.Sphere(0.05) // Create a sphere shape
        });
        this.body.velocity.set(0, 0, -10); // Set initial velocity (adjust speed as needed)

        // Add the bullet's physics body to the Cannon.js world
        world.addBody(this.body);

        // Create ambient light for the bullet
        this.light = new THREE.PointLight(color, 0, 10); // Use the provided color
        this.light.position.copy(this.mesh.position); // Light starts at bullet's position

        this.intensityGrowthRate = 0.1; // Control how quickly the light intensity grows
        this.maxDistance = 50; // Set maximum travel distance for the bullet
        this.initialPosition = position.clone(); // Store the bullet's initial position
        this.distanceTraveled = 0; // Track distance traveled

        this.velocity = new CANNON.Vec3(0, 0, -1); // Direction of bullet movement

    }

    updateForce(){
        // const force = new CANNON.Vec3(0, 10, 10); // Apply force in the x direction

        // Apply the force
        this.body.applyForce(this.velocity, this.body.position);
    }
    
    update(scene) {
        // Update the bullet's mesh position based on the physics body
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion); // Update rotation if needed


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
