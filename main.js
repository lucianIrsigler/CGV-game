import { CustomScene } from "./src/scenes/testScene.js";
import { AnimationManager } from "./src/scripts/Animation/AnimationLoopHandler.js";
import { Level1 } from "./src/scenes/Level1.js";
import { Level3 } from "./src/scenes/Level3.js";
import { Level2 } from "./src/scenes/Level2.js";
import { Level3_Journey } from "./src/scenes/Level3_Journey.js";

let animationManager = new AnimationManager()

animationManager.switchScene(new Level3());