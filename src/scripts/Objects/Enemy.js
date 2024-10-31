import * as THREE from 'three';
import { SoundEffectsManager } from '../Scene/SoundEffectManger';


const soundEffectsManager = new SoundEffectsManager();

export class Enemy{
    constructor(health,startPosition,model,enemyBody,enemyLight){
    this.health = health;
    this.startPosition = startPosition
    this.model = model
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
            // cubeEnemy.position.add(this.enemyDirection.clone().multiplyScalar(this.enemyMovementSpeed));
            this.distanceMoved += this.enemyMovementSpeed;

            // Update the position of the light to follow the cube
            this.enemyLight.position.copy(this.enemyBody.position);

            // Check if the enemy has moved the specified distance
            if (this.distanceMoved >= this.moveDistance) {
                this.distanceMoved = 0; // Reset the distance moved
                this.changeDirectionTimer = 0; // Reset timer to change direction
            }
    }

        // Optionally: Add bounds to keep the enemy within a certain area
        // cubeEnemy.position.x = THREE.MathUtils.clamp(cubeEnemy.position.x, -45, 45); // Adjust bounds as necessary
        // cubeEnemy.position.z = THREE.MathUtils.clamp(cubeEnemy.position.z, -45, 45); // Adjust bounds as necessary
    }


    handleEnemyHit(){
        if (this.isAsleep && this.getHealth()>100){
            soundEffectsManager.playSound("monster_moan",0.4);
        }

        this.setAsleep(false);

        if (!this.enemyHitCooldown){
            this.enemyHits+=1;
            this.health-=10;
            this.updateEnemyHealthBar();

            if (this.getHealth()<=0){
                if (this.alive){
                    soundEffectsManager.playSound("monster_moan",0.4);
                }

                this.alive=false;
                this.enemyLight.intensity=0;
                this.asleep=true;
                //TODO go to you win screen
            }else{
                this.enemyHitCooldown=true;

                setTimeout(()=>{
                    //TODO update
                    // this.model.material.color.set(0x040405);
                    this.enemyHitCooldown = false; // Reset cooldown flag
                },50)
            }
        }
    }



    //TODO FILL OUT
    updateEnemyHealthBar() {
        // const healthBar = document.getElementById('health-bar');
        // const healthPercentage = (enemyCurrentHealth / enemyMaxHealth) * 100; // Calculate percentage
        // healthBar.style.width = `${healthPercentage}%`; // Update the width of the health bar
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