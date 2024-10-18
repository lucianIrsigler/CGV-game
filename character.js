import * as THREE from 'three';

export class CharacterModel {
    constructor(geometry, material) {
        this.moveSpeed = 0.1;
        this.rotateSpeed = 0.05;
        this.gravity = -0.01; // Adjusted gravity value
        this.velocityY = 0; // Vertical velocity for jumping



        this.moveForward = false;
        this.moveBackward = false;
        this.rotateLeft = false;
        this.rotateRight = false;
        this.jumping = false;


        this.rotation = { x: 0, y: 0, z: 0 };
        this.position = { x: 0, y: 0, z: 0 };

        
        this.geometry = geometry;
        this.material = material;
        
        this.model = new THREE.Mesh(geometry, material);
    }

    setPosition(position) {
        this.position = position;
        this.model.position.set(position.x, position.y, position.z);
    };

    getPosition() {
        return this.position;
    }

    setRotation(rotation) {
        this.rotation = rotation;
        this.model.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    getRotation() {
        return this.rotation;
    }

    isJumping() {
        return this.jumping;
    }

    setJumping(val) {
        this.jumping = val;
    }

    getMoveSpeed() {
        return this.moveSpeed;
    };

    getRotationSpeed() {
        return this.rotateSpeed;
    };


    updatePlayerPosition(){
        if (this.isJumping()) {
            this.setPosition({x:this.position.x,y:this.position.y+this.velocityY,z:this.position.z})
            this.velocityY += this.gravity;
    
            if (this.position.y <= 1) {
                this.setPosition({x:this.position.x,y:1,z:this.position.z})
                this.setJumping(false);
                this.velocityY = 0;
            }
        }



        if (this.moveForward) {
            let valueCos = Math.cos(this.rotation.y) * this.getMoveSpeed();
            let valueSin = Math.sin(this.rotation.y) * this.getMoveSpeed();
            this.setPosition({x:this.position.x-valueSin,y:this.position.y,z:this.position.z-valueCos})
        }
        if (this.moveBackward) {
            let valueCos = Math.cos(this.rotation.y) * this.getMoveSpeed();
            let valueSin = Math.sin(this.rotation.y) * this.getMoveSpeed();
            this.setPosition({x:this.position.x+valueSin,y:this.position.y,z:this.position.z+valueCos})
        }

        if (this.rotateLeft){
            this.setRotation({x:this.rotation.x,y:this.rotation.y+this.rotateSpeed,z:this.rotation.z});
        }
        if (this.rotateRight) {
            this.setRotation({x:this.rotation.x,y:this.rotation.y-this.rotateSpeed,z:this.rotation.z})
        }
    }
}