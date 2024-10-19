
import * as lvl1 from "./level1";
import * as lvl2 from "./level2";
import * as lvl3 from "./level3";

let isPaused = false;
let menuVisible = false;

function toggleMenu() {
    menuVisible = !menuVisible;
    const menu = document.getElementById('menu');
    if (menuVisible) {
        menu.style.display = 'block';
        isPaused = true; 
    } else {
        menu.style.display = 'none';
        isPaused = false; 
    }
}


document.getElementById('lvl1').addEventListener('click', function() {
    lvl1.disposeLevel();
    lvl2.disposeLevel();
    lvl3.disposeLevel();


    lvl1.initLevel1();
    lvl1.animateLevel1();
    toggleMenu();
});

document.getElementById('lvl2').addEventListener('click', function() {
    lvl1.disposeLevel();
    lvl2.disposeLevel();
    lvl3.disposeLevel();

    lvl2.initLevel2();
    lvl2.animateLevel2();
    toggleMenu();

});


document.getElementById('lvl3').addEventListener('click', function() {
    lvl1.disposeLevel();
    lvl2.disposeLevel();
    lvl3.disposeLevel();

    lvl3.initLevel3();
    lvl3.animateLevel3();
    toggleMenu();
});

window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {  // 'Escape' key to open/close menu
        toggleMenu();
    }
});
