import { SoundEffectsManager } from "./SoundEffectManger.js";
import { Bullet } from "../Objects/bullet.js";
import { Enemy } from "../Objects/Enemy.js";
// import * as CANNON from 'cannon-es'; // Import Cannon.js for physics
import * as THREE from 'three';


const soundEffectsManager = new SoundEffectsManager();


export class GunManager{
    /**
     * 
     * @param {*} scene 
     * @param {int} playerHealth 
     * @param {Enemy} enemy 
     */
    constructor(scene,playerHealth,enemy,player,world,level3){
        this.scene = scene;
        this.playerHealth =playerHealth;
        this.player = player
        this.enemy = enemy;
        this.world = world;


        this.bullets = [];
        this.enemyBullets = [];

        this.level3 = level3; // Create an instance of Level3
        // this.level3.initScene(); // Initialize the scene if needed
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
                
                if(this.enemy.isRageMode()){
                    this.level3.takeDamage(20); // damage player
                }else{
                    this.level3.takeDamage(10); // damage player
                }

                this.level3.updatePlayerHealthBar();
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

            if(this.enemy.isRageMode()){
                // bigger bullet
                bullet.mesh.scale.set(6,6,6);
                bullet.light.intensity = 10;
            }

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

    isPlayerBullet(bullet){
        return bullet.colour == 0xff0000;
    }

    detectCollision(bullet, targetBody) {
        if (!bullet || !bullet.mesh || !targetBody) {
            console.warn("Bullet or target body is undefined");
            return false;
        }
    
        // Get the bullet's position
        const bulletPosition = bullet.mesh.position;
    
        // Get the target body's position and dimensions (use half extents for bounding box calculations)
        const targetPosition = targetBody.position;
        const boxHalfExtents = targetBody.shapes[0].halfExtents; // Assuming targetBody has one box shape
    
        // Calculate min and max bounds for the target body's bounding box
        const minBound = new THREE.Vector3(
            targetPosition.x - boxHalfExtents.x,
            targetPosition.y - boxHalfExtents.y,
            targetPosition.z - boxHalfExtents.z
        );
    
        const maxBound = new THREE.Vector3(
            targetPosition.x + boxHalfExtents.x,
            targetPosition.y + boxHalfExtents.y,
            targetPosition.z + boxHalfExtents.z
        );
    
        // Check if bullet's position is within the bounding box
        const isWithinBounds =
            bulletPosition.x >= minBound.x && bulletPosition.x <= maxBound.x &&
            bulletPosition.y >= minBound.y && bulletPosition.y <= maxBound.y &&
            bulletPosition.z >= minBound.z && bulletPosition.z <= maxBound.z;
    
        return isWithinBounds;
    }
    
}