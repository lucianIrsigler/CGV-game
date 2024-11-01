import { CustomScene1 } from "../src/scenes/testScene1";
import { Level1 } from "../src/scenes/Level1";
import { AnimationManager } from "../src/scripts/Animation/AnimationLoopHandler";

const animationManager = new AnimationManager();

let isPaused = false;
let menuVisible = false;
let onStartScreen = true;

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

document.getElementById("start").addEventListener("click",()=>{
    const blankDiv = document.getElementById("blank");

    const buttons = [
        { id: 'lvl1', title: 'Level 1' },
        { id: 'lvl2', title: 'Level 2' },
        { id: 'lvl3', title: 'Level 3' }
    ];

    // Clear previous content in the blank div
    blankDiv.innerHTML = '';


    const title = document.createElement("h1");
    title.classList.add("start-menu-title");
    title.textContent = "Select your level";
    blankDiv.appendChild(title);
    // Create and append buttons
    buttons.forEach(button => {
        const newButton = document.createElement("button");
        newButton.classList.add("start-menu-button");
        newButton.id = button.id;
        newButton.textContent = button.title;
        blankDiv.appendChild(newButton);
    });

    document.getElementById("start-menu").style.display="none";
    onStartScreen = false;

    document.getElementById('lvl1').addEventListener('click', function() {
        document.getElementById("blank").style.display="none";
        document.getElementById("fireflies").style.display="none";
        document.getElementById("health-container").style.display="flex";

        animationManager.switchScene(new Level1());
    });
    
    document.getElementById('lvl2').addEventListener('click', function() {
        document.getElementById("blank").style.display="none";
        document.getElementById("fireflies").style.display="none";
        document.getElementById("health-container").style.display="flex";

        animationManager.switchScene(new CustomScene1());
    });

    document.getElementById('lvl3').addEventListener('click', function() {
        document.getElementById("blank").style.display="none";
        document.getElementById("fireflies").style.display="none";
        document.getElementById("health-container").style.display="flex";

        animationManager.switchScene(new CustomScene1());
    });
})

document.getElementById("story").addEventListener("click",()=>{
    const blankDiv = document.getElementById("blank");

    blankDiv.innerHTML = '';


    const title = document.createElement("h1");
    title.classList.add("start-menu-title");
    title.textContent = "The story";
    blankDiv.appendChild(title);

    let text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
    nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit 
    in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur 
    sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

    const newText = document.createElement("p");
    newText.classList.add("text");
    newText.textContent = text;
    blankDiv.appendChild(newText);

    document.getElementById("user-health-bar-container").style.display="none";
    document.getElementById("start-menu").style.display="none";
    onStartScreen = false;

})

document.getElementById("how-to-play").addEventListener("click",()=>{
    const blankDiv = document.getElementById("blank");

    blankDiv.innerHTML = '';


    const title = document.createElement("h1");
    title.classList.add("start-menu-title");
    title.textContent = "How to play";
    blankDiv.appendChild(title);

    let text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
    nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit 
    in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur 
    sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

    const newText = document.createElement("p");
    newText.classList.add("text");
    newText.textContent = text;
    blankDiv.appendChild(newText);


    document.getElementById("user-health-bar-container").style.display="none";
    document.getElementById("start-menu").style.display="none";
    onStartScreen = false;
})

document.getElementById("about").addEventListener("click",()=>{
    const blankDiv = document.getElementById("blank");

    blankDiv.innerHTML = '';


    const title = document.createElement("h1");
    title.classList.add("start-menu-title");
    title.textContent = "About";
    blankDiv.appendChild(title);

    let text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
    nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit 
    in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur 
    sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

    const newText = document.createElement("p");
    newText.classList.add("text");
    newText.textContent = text;
    blankDiv.appendChild(newText);

    document.getElementById("user-health-bar-container").style.display="none";
    document.getElementById("start-menu").style.display="none";
    onStartScreen = false;
})

document.getElementById("restart-button").addEventListener("click",(e)=>{
    animationManager.pauseAnimation();
    animationManager.restartScene();
    animationManager.resumeAnimation();

    toggleMenu();
})

document.getElementById("exit-button").addEventListener("click",(e)=>{
    animationManager.exitScene();
    document.getElementById("blank").innerHTML = '';
    document.getElementById("start-menu").style.display="flex";
    document.getElementById("fireflies").style.display="block";
    document.getElementById("health-container").style.display="none";
    
    toggleMenu();
})


window.addEventListener('beforeunload', () => {
    animationManager.stopAnimationLoop();
});


window.addEventListener('keydown', function(event) {
    if (event.key === "Backspace") {
        if (!onStartScreen){
            document.getElementById("blank").innerHTML = '';
            document.getElementById("start-menu").style.display="flex";
            document.getElementById("user-health-bar-container").style.display="none";
            onStartScreen = false;
        }
    }
    else if (event.key === 'Escape') {  // 'Escape' key to open/close menu
        toggleMenu();
    }
});


