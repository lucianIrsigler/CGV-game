import { CustomScene } from "./src/scenes/testScene";
import { AnimationManager } from "./src/scripts/Animation/AnimationLoopHandler";
import { Level1 } from "./src/scenes/Level1";
import { Level3 } from "./src/scenes/Level3";

let animationManager = new AnimationManager()

animationManager.switchScene(new Level1());