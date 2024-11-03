export class Level3_Journey{
    constructor(init,animate,stopAnimate,restart,disposeLevel){
        this.init = init;
        this.animate = animate;
        this.stopAnimate = stopAnimate;
        this.restart = restart;
        this.disposeLevel = disposeLevel;
        this.animationId = null;
    }


    initScene(){
        this.init()
    }

    animate(){
        this.animate();
    }

    stopAnimate(){
        this.stopAnimate();
    }

    restart(){
        this.restart();
    }

    disposeLevel(){
        this.disposeLevel();
        location.reload();

    }
}