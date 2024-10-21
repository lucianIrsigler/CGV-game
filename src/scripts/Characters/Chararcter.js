
//https://medium.com/@brazmogu/physics-for-game-dev-a-platformer-physics-cheatsheet-f34b09064558
export class Characater{
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