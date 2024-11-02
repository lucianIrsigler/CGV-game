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


        "scenes/Level1.js",
        // "scenes/Level2.js",
        //"scenes/level3ahah.js",
        //"scenes/Level3_Journey.js",
        "scenes/Level3.js",
        //"scenes/testScene1.js",
        // "scenes/testScene2.js",
        // "scenes/testScene3.js",
        // "scenes/testScene.js",
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

        console.log(`Added script: ${file}`);
    });
}

// Call the function, specifying the base directory path
loadModules('/src'); // Replace 'src' with your actual base directory path if different



// LOAD TEST
import {CustomScene}  from "./src/scenes/testScene.js";
import {Level1}  from "./src/scenes/Level1.js";
import {Level3}  from "./src/scenes/Level3.js";
import { CustomScene1 } from "./src/scenes/testScene1.js";
// import { CustomScene2 } from "./src/scenes/testScene2.js";
// import { CustomScene3 } from "./src/scenes/testScene3.js";

import { AnimationManager } from "./src/scripts/Animation/AnimationLoopHandler.js";

const animationManager = new AnimationManager();

// document.getElementById("start-menu").style.display = "none";

animationManager.switchScene(new Level3(),0);

