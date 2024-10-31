import * as THREE from 'three';
import * as CANNON from "cannon-es";
import { SoundEffectsManager } from "./SoundEffectManger";
import { Bullet } from "../Objects/bullet";
import { Enemy } from "../Objects/Enemy";
import { cos } from 'three/webgpu';
import { compressSync } from 'three/examples/jsm/libs/fflate.module.js';

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

    updateAllBullets(){
        this.bullets.forEach((bullet)=>{
            bullet.updateForce();
        })

        this.enemyBullets.forEach((bullet)=>{
            bullet.updateForce(); 
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

        console.log("BULLET ADDED:",bullet.id);
    }
    
    


    /**
     * 
     * @param {THREE.Camera} camera 
     * @param {*} colour 
     */
    addBulletEnemy(camera,colour,world){
        const position = camera.position.clone();
        console.log(position);
        // position.x -= 1.3;
        soundEffectsManager.playSound("light_bullet_sound",0.5)

        const bullet = new Bullet(position, colour,world,this.scene); // Create bullet at the cube's position
        
        const direction = this.player.position.clone().sub(this.enemy.enemyBody.position).normalize();
        bullet.velocity.copy(direction); // Set bullet velocity to point at the player
        bullet.body.velocity.copy(direction);
        this.enemyBullets.push(bullet); // Add bullet to the array
        this.scene.add(bullet.mesh);
        this.scene.add(bullet.light);
    }


    updateBulletsPlayer(target){
        let i =0;
        this.bullets.forEach((bullet)=>{
            const isActive = bullet.update(this.scene);
        })
    }

    updateBulletsEnemy(target){
        let i =0;

        this.enemyBullets.forEach((bullet)=>{
            const isActive = bullet.update(this.scene);

            if (this.detectCollision(bullet,target)){
                this.handlePlayerHit(30);
                this.scene.remove(bullet.mesh)
                this.scene.remove(bullet.light)
                this.enemyBullets.splice(i, 1)
            }else if (!isActive) {
                this.enemyBullets.splice(i, 1); 
            }
            i+=1;
        })
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
            // this.enemy.updateEnemyMovement();
            // this.enemyShoot(player,camera);

        //     //TODO UNCOMMENT
        //     // document.getElementById('health-bar-container').style.display = 'block';

        //     //TODO rotate or smth
        //     // this.model.lookAt(player.position);

        }
    }


    handlePlayerHit(dmg){

    }




    detectCollision(bullet,object){
        return false;
        // const r1 =bullet.shapes[0].boundingSphereRadius
        // const r2 =object.shapes[0].boundingSphereRadius

        // const distance = bullet.position.distanceTo(object.position);

        // // console.log(distance <= (r1 + r2))

        // return distance <= (r1 + r2);
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