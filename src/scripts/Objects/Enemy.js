import * as THREE from 'three';
import * as CANNON from "cannon-es";
import { SoundEffectsManager } from '../Scene/SoundEffectManger.js';


const soundEffectsManager = new SoundEffectsManager();

export class Enemy{
    /**
     * 
     * @param {*} health 
     * @param {*} startPosition 
     * @param {*} model 
     * @param {CANNON.Body} enemyBody 
     * @param {*} enemyLight 
     */
    constructor(health,startPosition,model,enemyBody,enemyLight){
    this.maxHealth = health;
    this.health = health;
    this.startPosition = startPosition
    this.enemyModel = model
    this.enemyBody = enemyBody
    this.enemyLight = enemyLight;


    this.alive = true;
    this.enemyHits=0;
    this.enemyHitCooldown=false;
    this.enemyShootCooldown=false;
    this.asleep = true;
    this.changeDirectionTimer=0;


    this.enemyMovementSpeed = 0.1; // Adjusted speed for slower movement
    this.moveDistance = 20; // Distance to move in one direction before changing
    this.distanceMoved = 0; // Track how far the enemy has moved
    this.enemyDirection = new THREE.Vector3(); // Current movement direction
    this.changeDirectionTimer = 0; // Timer for changing direction
    this.enemyMovementRange = 1; // Range of movement in any direction
    }

    // Function to update the enemy's position
    updateEnemyMovement() {

        if (this.changeDirectionTimer <= 0) {
            // Choose a random direction and normalize it
            this.enemyDirection.set(
                (Math.random() - 0.5) * this.enemyMovementRange,
                0,
                (Math.random() - 0.5) * this.enemyMovementRange
            ).normalize();
    
            this.changeDirectionTimer = Math.random() * 2 + 1; // Random timer for changing direction (1 to 3 seconds)
        } else {
            // Move the enemy in the current direction
            this.distanceMoved += this.enemyMovementSpeed;
    
            // Calculate the movement vector
            const movementVector = this.enemyDirection.clone().multiplyScalar(this.enemyMovementSpeed);
            
            // Update the Cannon.js body position
            this.enemyBody.position.vadd(movementVector, this.enemyBody.position);

            this.enemyBody.quaternion.setFromEuler(0,0,0);
    
            // Update the visual model's position
            this.enemyModel.position.copy(this.enemyBody.position);
    
            // If necessary, set a specific height for the model
            this.enemyModel.position.y = Math.max(this.enemyBody.position.y-3, -10); // Keep the model above ground
    
            // Check if the enemy has moved the specified distance
            if (this.distanceMoved >= this.moveDistance) {
                this.distanceMoved = 0; // Reset the distance moved
                this.changeDirectionTimer = 0; // Reset timer to change direction
            }
        }
    
        // Optional: Add bounds to keep the enemy within a certain area
        this.enemyBody.position.x = THREE.MathUtils.clamp(this.enemyBody.position.x, -40, 40); // Adjust bounds as necessary
        this.enemyBody.position.z = THREE.MathUtils.clamp(this.enemyBody.position.z, -40, 40); // Adjust bounds as necessary
    }

    updateEnemyRotation(playerPosition) {
        // Calculate direction vector from enemy to player
        const direction = new CANNON.Vec3(
            playerPosition.x - this.enemyBody.position.x,
            0, // We ignore the Y-axis to keep the rotation in the XZ plane
            playerPosition.z - this.enemyBody.position.z
        ).unit(); // Normalize the direction vector
    
        // Calculate the angle the enemy should rotate to face the player
        const angle = Math.atan2(direction.x, direction.z);
    
        // Set the quaternion based on the calculated angle
        const quaternion = new CANNON.Quaternion();
        quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle); // Rotate around Y-axis
    
        // Apply the calculated quaternion to the enemy's body rotation
        this.enemyBody.quaternion.copy(quaternion);
    
        // Update the visual model to match the enemy body orientation
        this.enemyModel.quaternion.copy(this.enemyBody.quaternion);
    }
    
    


    handleEnemyHit(){
        if (this.isAsleep && this.enemyHits==0){
            soundEffectsManager.playSound("monster_moan",0.4);
        }

        let healthPercentage = (this.health / this.maxHealth) * 100; // Calculate percentage

        if(healthPercentage <= 30 && healthPercentage > 10){
            soundEffectsManager.playSound("monster_roar",0.5);
        }
        else if(healthPercentage > 30){
            soundEffectsManager.playSound("monster_moan",0.5);
        }


        this.setAsleep(false);
        

        if (!this.enemyHitCooldown){
            this.enemyHits+=1;
            this.health-=10;
            this.updateEnemyHealthBar();

            if (this.getHealth()<=0){
                if (this.alive){
                    soundEffectsManager.playSound("monster_death",0.1);
                }

                this.alive=false;
                this.enemyLight.intensity=0;
                this.asleep=true;
            }else{
                this.enemyHitCooldown=true;

                setTimeout(()=>{
                    this.enemyHitCooldown = false; // Reset cooldown flag
                },50) 
            }
        }
    }



    //TODO FILL OUT
    updateEnemyHealthBar() {
        const healthBar = document.getElementById('boss-health-bar');
        const healthPercentage = (this.health / this.maxHealth) * 100; // Calculate percentage
        healthBar.style.width = `${healthPercentage}%`; // Update the width of the health bar
    }


    resetPosition(){
        this.enemyBody.position.set(this.startPosition.x,this.startPosition.y,this.startPosition.z)

    }
    getHealth(){
        return this.health;
    }

    isAsleep(){
        return this.asleep;
    }

    setAsleep(value){
        this.asleep=value;
    }

}