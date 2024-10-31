
//https://medium.com/@brazmogu/physics-for-game-dev-a-platformer-physics-cheatsheet-f34b09064558

export class Character{
    /**
     * Represents a character and uses to calculate the jump parameters
     * @param {int} H Height of jump
     * @param {int} t time the jump should take
     */
    constructor(H,t){
        this.H = H;
        this.t = t;
    }

    calcGravity(){
        return this.H / (2 * Math.pow(this.t,2));
    }

    calcJumpSpeed(){
        return Math.sqrt(2*this.H*this.calcGravity());
    }
}