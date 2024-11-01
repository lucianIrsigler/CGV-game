import * as THREE from 'three';

import { SoundEffectsManager } from "./SoundEffectManger";
import { Bullet } from "../Objects/bullet";
import { Enemy } from "../Objects/Enemy";
import { cos } from 'three/webgpu';
// import * as CANNON from 'cannon-es'; // Import Cannon.js for physics


const soundEffectsManager = new SoundEffectsManager();


export class GunManager{
    /**
     * 
     * @param {*} scene 
     * @param {int} playerHealth 
     * @param {Enemy} enemy 
     */
    constructor(scene,playerHealth,enemy,player,world){
        this.scene = scene;
        this.playerHealth =playerHealth;
        this.player = player
        this.enemy = enemy;
        this.world = world;


        this.bullets = [];
        this.enemyBullets = [];
    }


    updateAllBullets(){
        this.bullets.forEach((bullet)=>{
            bullet.update(this.scene);
        })

        this.enemyBullets.forEach((bullet)=>{
            bullet.update(this.scene);
        })
    }


    addBullet(camera,colour){
        const position = camera.position.clone();
        console.log(position);
        // position.x -= 1.3;
        soundEffectsManager.playSound("light_bullet_sound",0.5)

        const bullet = new Bullet(position, colour,this.world,this.scene); // Create bullet at the cube's position
        
        // Calculate the bullet direction based on the camera's forward direction
        const direction = new THREE.Vector3(); // Create a new vector for direction
        camera.getWorldDirection(direction); // Get the direction the camera is facing

        console.log(direction);
        
        direction.normalize(); // Normalize the direction vector

        // bullet.body.velocity.copy(direction);
        bullet.velocity.copy(direction); // Set bullet velocity to point in the camera's direction
        this.bullets.push(bullet); // Add bullet to the array

        this.scene.add(bullet.mesh);
        this.scene.add(bullet.light);

    }

    updateBulletsPlayer(target) {
        this.bullets = this.bullets.filter((bullet, index) => {
            const isActive = bullet.update(this.scene);
    
            if (isActive && this.detectCollision(bullet, target)) {
                this.enemy.handleEnemyHit();
                this.scene.remove(bullet.mesh);
                this.scene.remove(bullet.light);
                return false; // Remove this bullet after collision
            }
    
            return isActive; // Keep bullet only if it's still active
        });
    }
    
    updateBulletsEnemy(target) {
        this.enemyBullets = this.enemyBullets.filter((bullet, index) => {
            const isActive = bullet.update(this.scene);
    
            if (isActive && this.detectCollision(bullet, target)) {
                this.handlePlayerHit(30);
                this.scene.remove(bullet.mesh);
                this.scene.remove(bullet.light);
                return false; // Remove this bullet after collision
            }
    
            return isActive; // Keep bullet only if it's still active
        });
    }
    

    enemyShoot(target,camera){
        if (!this.enemy.enemyShootCooldown){
            const position = target.position.clone();
            soundEffectsManager.playSound("dark_bullet_sound",0.3);

            this.addBullet(camera,0xff0000);


            let randomTime = Math.random() * 1000 + 500; // Random time between 0.5 to 1.5 seconds
            this.enemy.enemyShootCooldown = true; // Set cooldown flag

            setTimeout(() => {
                this.enemy.enemyShootCooldown = false; // Reset cooldown flag after 1 second
            }, randomTime); // milliseconds delay
        }
    }

    checkAndShoot(player,camera){
         if(!this.enemy.isAsleep() && this.enemy.getHealth()>0){
            this.enemy.updateEnemyMovement();
            // this.enemyShoot(player,camera);

        //     //TODO UNCOMMENT
        //     // document.getElementById('health-bar-container').style.display = 'block';

        //     //TODO rotate or smth
        //     // this.model.lookAt(player.position);

        }
    }


    handlePlayerHit(dmg){

    }

    isPlayerBullet(bullet){
        return bullet.colour == 0xff0000;
    }


    detectCollision(bullet, target) {
        // Check if bullet and target both exist and have positions
        if (!bullet || !bullet.mesh || !target || !target.position) {
            console.warn("Bullet or target position is undefined");
            return false;
        }
        
        const bulletPosition = bullet.mesh.position;
        const targetPosition = target.position;
    
        const distance = bulletPosition.distanceTo(targetPosition);
    
        // Assuming a collision threshold distance
        const collisionThreshold = 1.0;
    
        return distance < collisionThreshold;
    }
    
    


    takeDamage(amount) {
        health -= amount;
        health = Math.max(0, health); // Ensure health doesn't go below 0
        // updateCharacterLight(); // Update light when health changes
        if (health <= 0 && !isGamePaused) {
            youLose(); // Call the lose condition function
        }
    }
}