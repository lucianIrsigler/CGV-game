function loadModules(directory) {
    // List of JavaScript files to load
    const jsFiles = [
        'data/audio.js',
        "data/characters.js",
        "data/doorPos1.js",
        "data/doorPos2.js",
        "data/lampPos1.js",
        "data/lampPos2.js",
        "data/lampPos3.js",
        "data/lightPos1.js",
        "data/lightPos2.js",
        "data/monster3.js",
        "data/monsters.js",

        "scripts/Animation/AnimationLoopHandler.js",

        "scripts/Camera/FirstPersonCamera.js",
        "scripts/Camera/ThirdPersonCamera.js",

        "scripts/InputController/FirstPersonInputController.js",
        "scripts/InputController/ThirdPersonInputController.js",

        "scripts/Loaders/Loader.js",

        "scripts/Objects/bullet.js",
        "scripts/Objects/Crosshair.js",
        "scripts/Objects/Door.js",
        "scripts/Objects/Enemy.js",
        "scripts/Objects/Minimap.js",
        "scripts/Objects/curvedPlatform.js",
        "scripts/Objects/CPBoxLamp.js",
        "scripts/Objects/circularPlatform.js",

        "scripts/Scene/CameraManager.js",
        "scripts/Scene/GunManager.js",
        "scripts/Scene/LightManager.js",
        "scripts/Scene/LightMechanicManager.js",
        "scripts/Scene/ObjectManager.js",
        "scripts/Scene/SceneBaseClass.js",
        "scripts/Scene/SoundEffectManger.js",

        "scripts/util/calcEuclid.js",
        "scripts/util/generatePlatform.js",
        "scripts/util/getRandomMonster.js",
        "scripts/util/randomInterval.js",
        "scripts/util/randomNum.js",
        "scripts/util/TextureLoaderUtil.js",
        "scripts/Objects/gun.js",
        "scripts/Objects/buttonPlatform.js",
        "scripts/Objects/box.js",
        "scripts/Objects/Fog.js",
        "scripts/Objects/lamp.js",


        "scenes/Level1.js",
        "scenes/Level2.js",
        "scenes/Level3_Journey.js",
        "scenes/Level3.js",
        "scenes/testScene1.js",
        "scenes/testScene2.js",
        "scenes/testScene3.js",
        "scenes/testScene.js",
    ];
    
    // Loop through each file and add it as a <script> tag to the HTML page
    jsFiles.forEach(file => {
        const script = document.createElement('script');
        script.src = `${directory}/${file}`;
        script.type = 'module';
        
        // Optionally add async or defer attributes if desired
        script.async = false;
        
        // Append the script to the document's body or head
        document.body.appendChild(script);

        // console.log(`Added script: ${file}`);
    });
}

// Call the function, specifying the base directory path
loadModules('/src'); // Replace 'src' with your actual base directory path if different



// LOAD TEST
import {CustomScene}  from "./src/scenes/testScene.js";
import {Level1}  from "./src/scenes/Level1.js";
import {Level2}  from "./src/scenes/Level2.js";
import { CustomScene1 } from "./src/scenes/testScene1.js";
import { CustomScene2 } from "./src/scenes/testScene2.js";
import { CustomScene3 } from "./src/scenes/testScene3.js";

import { AnimationManager } from "./src/scripts/Animation/AnimationLoopHandler.js";

const animationManager = new AnimationManager();




//---------------VARIABLES---------------------------
let isPaused = false;
let menuVisible = false;
let onStartScreen = true;
let isPlaying = false;
let isPlayingWholeGame = false;

//---------------END VARIABLES-------------------------

//--------------------AUDIO STUFF------------------------------------
let audio;
let audio1;

function prepareBackgroundAudio() {
    audio = new Audio('public/audio/menu.mp3');
    audio.volume = 0.9; 
    audio.loop = true; 

    audio1 = new Audio("public/audio/menu_click.mp3")
    audio1.volume = 0.3; 

}

function playMenuClick() {
    if (audio1) {
        audio1.currentTime = 0; // Reset to the start of the audio
        audio1.play().catch(error => {
            console.error("Error playing audio: ", error);
        });

        // Stop the audio after 1 second
        setTimeout(() => {
            audio1.pause();
            audio1.currentTime = 0; // Optional: Reset to start for the next play
        }, 900); // 1000 milliseconds = 1 second
    }
}

function playBackgroundAudio() {
  if (audio) {
    audio.play().catch(error => {
      console.error("Error playing audio: ", error);
    });
  }
}

function pauseBackgroundAudio() {
    if (audio) {
        audio.pause();
    }
}

function resumeBackgroundAudio() {
    if (audio) {
        audio.play().catch(error => {
            console.error("Error playing audio: ", error);
        });
    }
}

window.onload = prepareBackgroundAudio;
document.addEventListener("click", () => {
    playBackgroundAudio();  // Call the function here
});

//--------------------END AUDIO--------------------------------------


//---------------------LEVEL STUFF-----------------------------------
function startLevel(){
    document.getElementById("blank").style.display="none";
    document.getElementById("user-health-bar-container").style.display="flex";
    document.body.style.cursor = "none"; 
    isPlaying=true;
    onStartScreen=false;
    pauseBackgroundAudio();
    animationManager.pauseAnimation();
    animationManager.resumeAnimation();
}

function exitLevel(){
    document.exitPointerLock();
    animationManager.exitScene();
    document.getElementById("blank").style.display="flex";
    document.getElementById("blank").innerHTML = '';
    document.getElementById("start-menu").style.display="flex";
    document.getElementById("user-health-bar-container").style.display="none";
    menuVisible = false;

    document.body.style.cursor =  "url('icons/cursor.png'), auto"; 

    const menu = document.getElementById('menu');
    menu.style.display = 'none';
    isPlaying=false;
    onStartScreen=true;
    isPlayingWholeGame = false;
    resumeBackgroundAudio();
}


function goToStartMenu(){
    document.exitPointerLock();
    animationManager.exitScene();
    document.getElementById("blank").style.display="flex";
    document.getElementById("blank").innerHTML = '';
    document.getElementById("start-menu").style.display="flex";
    document.getElementById("user-health-bar-container").style.display="none";
    menuVisible = false;

    document.body.style.cursor =  "url('icons/cursor.png'), auto"; 

    const menu = document.getElementById('menu');
    menu.style.display = 'none';
    isPlaying=false;
    onStartScreen=true;
    isPlayingWholeGame = false;
    resumeBackgroundAudio();
}

//---------------------END LEVEL STUFF-------------------------------

//-------------------UTIL-------------------------------------------
function addButtons(){
    const blankDiv = document.getElementById("blank");
    const buttons = [
        { id: "lvl0", title: "Start the game"},
        { id: 'lvl1', title: 'Level 1' },
        { id: 'lvl2', title: 'Level 2' },
        { id: 'lvl3', title: 'Level 3' },
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
}

function toggleMenu() {
    menuVisible = !menuVisible;
    const menu = document.getElementById('menu');
    if (menuVisible) {
        document.body.style.cursor =  "url('icons/cursor.png'), auto"; 
        menu.style.display = 'block';
        animationManager.pauseAnimation();
        document.exitPointerLock();

    } else {
        document.body.style.cursor = "none"; 
        menu.style.display = 'none';
        animationManager.resumeAnimation();
        document.body.requestPointerLock();

    }
}

//-------------------------END UTIL---------------------------------


document.getElementById("start").addEventListener("click",()=>{
    document.exitPointerLock();

    playMenuClick();
    addButtons();

    document.getElementById('lvl0').addEventListener('click', function() {
        playMenuClick();
        isPlayingWholeGame = true;
        startLevel();
        animationManager.switchScene(new Level1(),0);
    });


    document.getElementById('lvl1').addEventListener('click', function() {
        playMenuClick();
        startLevel();
        animationManager.switchScene(new Level1(),0);
    });
    
    document.getElementById('lvl2').addEventListener('click', function() {
        playMenuClick();
        startLevel();
        animationManager.switchScene(new Level2(),1);
    });

    document.getElementById('lvl3').addEventListener('click', function() {
        playMenuClick();
        startLevel();
        animationManager.switchScene(new CustomScene2(),2);
    });
})


document.getElementById("story").addEventListener("click",()=>{
    document.exitPointerLock();

    playMenuClick();


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
    document.exitPointerLock();

    playMenuClick();
    
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

document.getElementById("endless").addEventListener("click",()=>{
    document.exitPointerLock();

    playMenuClick();
})

document.getElementById("restart-button").addEventListener("click",(e)=>{
    
    playMenuClick();
    animationManager.pauseAnimation();
    animationManager.restartScene();
    animationManager.resumeAnimation();
    toggleMenu();
})

document.getElementById("exit-button").addEventListener("click",(e)=>{
    playMenuClick();
    exitLevel();
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
        if (!isPlaying){
            if (!onStartScreen){
                document.getElementById("blank").innerHTML = '';
                document.getElementById("start-menu").style.display="flex";
                document.getElementById("user-health-bar-container").style.display="none";
                onStartScreen = false;
            }
            return;
        }
        toggleMenu();
    }else if (event.code=="KeyH"){
        if (animationManager.getCurrentScene()!=null){
            animationManager.getCurrentScene().endLevel();
        }
    }
});


let switched = false;

document.addEventListener('levelEnded', (event) => {
    if (switched){
        return;
    }
    
    let numLevels = 3;
    if (isPlayingWholeGame) {
        let currentLevelId = animationManager.id; 
        console.log(`Current Level ID: ${currentLevelId}`);

        animationManager.exitScene();

        //if next level
        if (currentLevelId < numLevels) {
            console.log("jere");

            let nextLevelId = currentLevelId + 1;
            if (nextLevelId==1){
                animationManager.switchScene(new Level2(),1);
            }else if (nextLevelId==2){
                animationManager.switchScene(new CustomScene2(),2);
            }else if (nextLevelId == 3){
                animationManager.switchScene(new CustomScene3(),3);

            }
            animationManager.pauseAnimation();
            animationManager.resumeAnimation();
            console.log(`Switching to Level ID: ${nextLevelId}`);
            switched=true;

            setTimeout(()=>{
                switched = false;
            },1000)
        } else {
            console.log("All levels completed!");
            goToStartMenu()
            setTimeout(()=>{
                switched = false;
            },1000)
        }
    }
    else{
        let currentLevelId = animationManager.id; 
        console.log(`Current Level ID: ${currentLevelId}`);
        animationManager.exitScene();

        if (currentLevelId == 2) {
            animationManager.switchScene(new CustomScene3(),3);
            animationManager.pauseAnimation();
            animationManager.resumeAnimation();
            setTimeout(()=>{
                switched = false;


            },1000) 
        }else {
            goToStartMenu();
            setTimeout(()=>{
                switched = false;
            },1000)
        }
    }
});