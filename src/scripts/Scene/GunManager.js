import * as THREE from 'three';

import { SoundEffectsManager } from "./SoundEffectManger.js";
import { Bullet } from "../Objects/bullet.js";
import { Enemy } from "../Objects/Enemy.js";
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
        // console.log(position);
        // position.x -= 1.3;
        soundEffectsManager.playSound("light_bullet_sound",0.5)

        const bullet = new Bullet(position, colour,this.world,this.scene); // Create bullet at the cube's position
        
        // Calculate the bullet direction based on the camera's forward direction
        const direction = new THREE.Vector3(); // Create a new vector for direction
        camera.getWorldDirection(direction); // Get the direction the camera is facing

        // console.log(direction);
        
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
                console.log("hit")
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
                console.log("ouch")
                this.handlePlayerHit(30);
                this.scene.remove(bullet.mesh);
                this.scene.remove(bullet.light);
                return false; // Remove this bullet after collision
            }
    
            return isActive; // Keep bullet only if it's still active
        });
    }
    

    enemyShoot(player, boss) {
        if (!this.enemy.enemyShootCooldown) {
            const position = boss.position.clone();
            soundEffectsManager.playSound("dark_bullet_sound", 0.3);

            const bullet = new Bullet(position, 0xff0000, this.world, this.scene);

            const direction = new THREE.Vector3();
            direction.subVectors(player.position, position).normalize(); // Shoot towards player

            bullet.velocity.copy(direction);
            this.enemyBullets.push(bullet);

            this.scene.add(bullet.mesh);
            this.scene.add(bullet.light);

            let randomTime = Math.random() * 1000 + 500; // Random time between 0.5 to 1.5 seconds
            this.enemy.enemyShootCooldown = true; // Set cooldown flag

            setTimeout(() => {
                this.enemy.enemyShootCooldown = false; // Reset cooldown flag after random time
            }, randomTime); // milliseconds delay
        }
    }

    checkAndShoot(player,boss){
         if(!this.enemy.isAsleep() && this.enemy.getHealth()>0){
            this.enemy.updateEnemyMovement();
            this.enemyShoot(player,boss);

            //TODO UNCOMMENT
            document.getElementById('boss-health-bar-container').style.display = 'block';            

        }
    }



    handlePlayerHit(dmg){
        this.playerHealth -= dmg;
        this.updatePlayerHealthBar();
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
    
        return distance < collisionThreshold; // if distance between bullet and target is less than threshold, return true
    }

    updatePlayerHealthBar(){
        const healthBar = document.getElementById('user-health-bar');
        const healthPercentage = (this.playerHealth / 100) * 100; // Calculate percentage
        healthBar.style.width = `${healthPercentage}%`; // Update the width of the health bar
    }
    
}