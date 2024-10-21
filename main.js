import { CustomScene } from "./src/scenes/testScene";
import { CustomScene1 } from "./src/scenes/testScene1";
import { Level1 } from "./src/scenes/Level1";
import { AnimationManager } from "./src/scripts/Animation/AnimationLoopHandler";

const animationManager = new AnimationManager();


let isPaused = false;
let menuVisible = false;

function toggleMenu() {
    menuVisible = !menuVisible;
    const menu = document.getElementById('menu');
    if (menuVisible) {
        menu.style.display = 'block';
        animationManager.pauseAnimation();
    } else {
        menu.style.display = 'none';
        animationManager.resumeAnimation();
    }

}

document.getElementById('lvl1').addEventListener('click', function() {
    animationManager.switchScene(new Level1());
    toggleMenu();
});

document.getElementById('lvl2').addEventListener('click', function() {
    animationManager.switchScene(new CustomScene1());
    toggleMenu();

});

window.addEventListener('beforeunload', () => {
    animationManager.stopAnimationLoop();
});


// document.getElementById('lvl3').addEventListener('click', function() {
//     lvl1.disposeLevel();
//     lvl2.disposeLevel();

//     myScene.disposeLevel();
//     myScene.initScene();
//     myScene.animate();
//     toggleMenu();
// });




window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {  // 'Escape' key to open/close menu
        toggleMenu();
    }
});
