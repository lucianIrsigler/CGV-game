import * as THREE from 'three';
import * as CANNON from "cannon-es";
import { SoundEffectsManager } from "./SoundEffectManger";
import { Bullet } from "../Objects/bullet";
import { Enemy } from "../Objects/Enemy";
// import * as CANNON from 'cannon-es'; // Import Cannon.js for physics


const soundEffectsManager = new SoundEffectsManager();


export class GunManager{
    /**
     * 
     * @param {*} scene 
     * @param {*} playerHealth 
     * @param {Enemy} enemy 
     * @param {CANNON.Body} player 
     * @param {CANNON.World} world 
     */
    constructor(scene, playerHealth, enemy, player) {
        this.scene = scene;
        this.playerHealth = playerHealth;
        this.player = player;
        this.enemy = enemy;
    
        this.bullets = [];
        this.enemyBullets = [];
    }


    isPlayerBullet(checkBullet){
        const isBulletPlayerBullet = this.bullets.some(bullet => bullet.id === checkBullet.id);
        return isBulletPlayerBullet;
    }

    isEnemyBullet(checkBullet){
        const isBulletEnemyBullet = this.enemyBullets.some(bullet => bullet.id === checkBullet.id);
        return isBulletEnemyBullet;
    }

    updateAllBullets(){
        this.bullets.forEach((bullet)=>{
            bullet.update(this.scene);
        })

        this.enemyBullets.forEach((bullet)=>{
            bullet.update(this.scene);
        })
    }

    removeBulletPlayer(obj){
        let id = obj.id;
        const index = this.bullets.findIndex(bullet=>bullet.id==id);
        // console.log("removing bullet:",index);

        this.scene.remove(this.bullets[index].mesh); // Remove bullet from the scene
        this.scene.remove(this.bullets[index].light); // Remove bullet light from the scene
        this.bullets.splice(index, 1); // Remove bullet from array
    }


    /**
     * 
     * @param {THREE.Camera} camera 
     * @param {*} colour 
     */
    addBulletPlayer(camera, colour,world) {
        const position = camera.position.clone();
        // console.log(position);
    
        // Offset the position slightly in front of the camera to avoid collision with the player
        const bulletOffset = new THREE.Vector3(0, 0, -1.5); // Adjust the distance as needed
        bulletOffset.applyQuaternion(camera.quaternion); // Apply the camera's rotation
        position.add(bulletOffset); // Move the bullet position in front of the camera
    
        soundEffectsManager.playSound("light_bullet_sound", 0.5);
    
        const bullet = new Bullet(position, colour, world, this.scene); // Create bullet at the adjusted position
    
        // Use camera's direction for bullet velocity
        const direction = new THREE.Vector3(0, 0, -1); // Forward direction
        direction.applyQuaternion(camera.quaternion); // Apply the camera's rotation to get the forward direction
        direction.normalize(); // Normalize to ensure it's a unit vector
    
        const bulletSpeed = 30; // Set your desired bullet speed here
        direction.multiplyScalar(bulletSpeed); // Scale the direction by bullet speed
    
        bullet.velocity.copy(direction); // Set bullet velocity to the scaled direction
        bullet.body.velocity.copy(direction); // Also copy to the bullet body
    
        this.bullets.push(bullet); // Add bullet to the array
        this.scene.add(bullet.mesh);
        this.scene.add(bullet.light);
    }
    
    


    /**
     * 
     * @param {THREE.Camera} camera 
     * @param {*} colour 
     */
    addBulletEnemy(current,target,colour,world){
        const position = current.position.clone();

        soundEffectsManager.playSound("dark_bullet_sound",0.5)

        const bullet = new Bullet(position, colour,world); // Create bullet at the cube's position
        
        // Calculate the bullet direction based on the camera's forward direction
        const direction = new THREE.Vector3(); // Create a new vector for direction
        target.getWorldDirection(direction); // Get the direction the camera is facing

        console.log(direction);
        
        direction.normalize(); // Normalize the direction vector

        // bullet.body.velocity.copy(direction);
        bullet.velocity.copy(direction); // Set bullet velocity to point in the camera's direction
        this.enemyBullets.push(bullet); // Add bullet to the array

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
    

    enemyShoot(enemy,target,world){
        if (!this.enemy.enemyShootCooldown){
            soundEffectsManager.playSound("dark_bullet_sound",0.3);
            this.addBulletEnemy(enemy,target,0xff0000,world);

            let randomTime = Math.random() * 1000 + 500; // Random time between 0.5 to 1.5 seconds
            this.enemy.enemyShootCooldown = true; // Set cooldown flag

            setTimeout(() => {
                this.enemy.enemyShootCooldown = false; // Reset cooldown flag after 1 second
            }, randomTime); // milliseconds delay
        }
    }

    checkAndShoot(player,target,world){
         if(!this.enemy.isAsleep() && this.enemy.getHealth()>0){
            this.enemy.updateEnemyMovement();
            this.enemyShoot(player,target,world);

        //     //TODO UNCOMMENT
        //     // document.getElementById('health-bar-container').style.display = 'block';

        //     //TODO rotate or smth

        }
    }


    handlePlayerHit(dmg){

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