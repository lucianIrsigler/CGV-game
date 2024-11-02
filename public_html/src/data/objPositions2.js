const rightAngle = Math.PI / 2;
//GROUND POSITIONS-----------------------------------------------------
export const groundDimensions = {width: 60, height: 1, depth: 60};
export const groundPositions = [
    {
        name: "mainFloor",
        geometry: "ground",
        material: "ground",
        position: { x:0, y:0, z:0 },
        rotation: { x:0, y:0, z:0 }
    }
];
export const smallGroundDimensions = {width: 25, height: 1, depth: 25};
export const smallGroundPositions = [
    {
        name: "smallFloor1",
        geometry: "smallGround",
        material: "smallGround",
        position: { x:17.5, y:1.25, z:17.5 },
        rotation: { x:0, y:2*rightAngle, z:0 }
    },
    {
        name: "smallFloor2",
        geometry: "smallGround",
        material: "smallGround",
        position: { x:-17.5, y:1.25, z:17.5 },
        rotation: { x:0, y:2*rightAngle, z:0 }
    },
    {
        name: "smallFloor3",
        geometry: "smallGround",
        material: "smallGround",
        position: { x:17.5, y:1.25, z:-17.5 },
        rotation: { x:0, y:2*rightAngle, z:0 }
    },
    {
        name: "smallFloor4",
        geometry: "smallGround",
        material: "smallGround",
        position: { x:-17.5, y:1.25, z:-17.5 },
        rotation: { x:0, y:2*rightAngle, z:0 }
    }
];
//END GROUND POSITIONS-------------------------------------------------

//WALL POSITIONS-------------------------------------------------------
export const wallDimensions = {width: 60, height: 1, depth: 20};
const wallHeight = wallDimensions.depth/2;
const wallSide = groundDimensions.width/2 + wallDimensions.height/2;
export const wallPositions = [
    {
        name: "backWall",
        geometry: "wall",
        material: "wall",
        position: { x: 0, y: wallHeight, z: -wallSide },
        rotation: { x: rightAngle, y: 0, z: 0 }
    },
    {
        name: "left",
        geometry: "wall",
        material: "wall",
        position: { x: -wallSide, y: wallHeight, z: 0 },
        rotation: { x: rightAngle, y: 0, z: rightAngle }
    },
    {
        name: "right",
        geometry: "wall",
        material: "wall",
        position: { x: wallSide, y: wallHeight, z: 0 },
        rotation: { x: rightAngle, y: 0, z: rightAngle }
    },
    {
        name: "frontWall",
        geometry: "wall",
        material: "wall",
        position: { x: 0, y: wallHeight, z: wallSide },
        rotation: { x: rightAngle, y: 0, z: 0 }
    }
];
//END WALL POSITIONS---------------------------------------------------

//CEILING POSITIONS----------------------------------------------------
export const ceilingDimensions = {width: 60, height: 1, depth: 60};
const ceilingHeight = wallDimensions.depth;
export const ceilingPositions = [
    {
        name: "mainCeiling",
        geometry: "ceiling",
        material: "ceiling",
        position: { x: 0, y: ceilingHeight, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
    }
];
//END CEILING POSITIONS------------------------------------------------

//PLATFORM POSITIONS---------------------------------------------------
export const platformDimensions = {width: 10, height: 1, depth: 5};
const doorPlatformHeight = wallDimensions.depth - wallDimensions.depth/3 - 0.5;
const doorPlatformPositionOnWall = wallPositions[3].position.z - wallDimensions.height/2 - platformDimensions.depth/2;
const leftPlatformPositionOnWall = wallPositions[1].position.x + wallDimensions.height/2 + platformDimensions.depth/2;
const rightPlatformPositionOnWall = wallPositions[2].position.x - wallDimensions.height/2 - platformDimensions.depth/2;
export const platformPositions = [
    {
        name: "doorPlatform",
        geometry: "platform",
        material: "platform",
        position: { x: 0, y: doorPlatformHeight, z: doorPlatformPositionOnWall },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        name: "rightPlatform",
        geometry: "platform",
        material: "platform",
        position: { x: rightPlatformPositionOnWall, y: doorPlatformHeight, z: 0 },
        rotation: { x: 0, y: rightAngle, z: 0 }
    },
    {
        name: "leftPlatform",
        geometry: "platform",
        material: "platform",
        position: { x: leftPlatformPositionOnWall, y: doorPlatformHeight, z: 0 },
        rotation: { x: 0, y: rightAngle, z: 0 }
    },
    {
        name: "leftCentrePlatform",
        geometry: "platform",
        material: "platform",
        position: { x: -2.5, y: 1.25, z: 0 },
        rotation: { x: 0, y: rightAngle, z: 0 }
    },
    {
        name: "rightCentrePlatform",
        geometry: "platform",
        material: "platform",
        position: { x: 2.5, y: 1.25, z: 0 },
        rotation: { x: 0, y: -rightAngle, z: 0 }
    },
    {
        name: "leftFromCentrePlatform1",
        geometry: "platform",
        material: "platform",
        position: { x: -7.5, y: 1.25, z: 0 },
        rotation: { x: 0, y: rightAngle, z: 0 }
    },
    {
        name: "leftFromCentrePlatform2",
        geometry: "platform",
        material: "platform",
        position: { x: -12.5, y: 1.25, z: 0 },
        rotation: { x: 0, y: rightAngle, z: 0 }
    },
    {
        name: "leftFromCentrePlatform3",
        geometry: "platform",
        material: "platform",
        position: { x: -17.5, y: 1.25, z: 0 },
        rotation: { x: 0, y: rightAngle, z: 0 }
    },
    {
        name: "leftFromCentrePlatform4",
        geometry: "platform",
        material: "platform",
        position: { x: -22.5, y: 1.25, z: 0 },
        rotation: { x: 0, y: rightAngle, z: 0 }
    },
    {
        name: "leftFromCentrePlatform5",
        geometry: "platform",
        material: "platform",
        position: { x: -27.5, y: 1.25, z: 0 },
        rotation: { x: 0, y: rightAngle, z: 0 }
    },
    {
        name: "rightFromCentrePlatform1",
        geometry: "platform",
        material: "platform",
        position: { x: 7.5, y: 1.25, z: 0 },
        rotation: { x: 0, y: -rightAngle, z: 0 }
    },
    {
        name: "rightFromCentrePlatform2",
        geometry: "platform",
        material: "platform",
        position: { x: 12.5, y: 1.25, z: 0 },
        rotation: { x: 0, y: -rightAngle, z: 0 }
    },
    {
        name: "rightFromCentrePlatform3",
        geometry: "platform",
        material: "platform",
        position: { x: 17.5, y: 1.25, z: 0 },
        rotation: { x: 0, y: -rightAngle, z: 0 }
    },
    {
        name: "rightFromCentrePlatform4",
        geometry: "platform",
        material: "platform",
        position: { x: 22.5, y: 1.25, z: 0 },
        rotation: { x: 0, y: -rightAngle, z: 0 }
    },
    {
        name: "rightFromCentrePlatform5",
        geometry: "platform",
        material: "platform",
        position: { x: 27.5, y: 1.25, z: 0 },
        rotation: { x: 0, y: -rightAngle, z: 0 }
    },
    {
        name: "frontFromCentrePlatform1",
        geometry: "platform",
        material: "platform",
        position: { x: 0, y: 1.25, z: -7.5 },
        rotation: { x: 0, y: 2*rightAngle, z: 0 }
    },
    {
        name: "frontFromCentrePlatform2",
        geometry: "platform",
        material: "platform",
        position: { x: 0, y: 1.25, z: -12.5 },
        rotation: { x: 0, y: 2*rightAngle, z: 0 }
    },
    {
        name: "frontFromCentrePlatform3",
        geometry: "platform",
        material: "platform",
        position: { x: 0, y: 1.25, z: -17.5 },
        rotation: { x: 0, y: 2*rightAngle, z: 0 }
    },
    {
        name: "frontFromCentrePlatform4",
        geometry: "platform",
        material: "platform",
        position: { x: 0, y: 1.25, z: -22.5 },
        rotation: { x: 0, y: 2*rightAngle, z: 0 }
    },
    {
        name: "frontFromCentrePlatform5",
        geometry: "platform",
        material: "platform",
        position: { x: 0, y: 1.25, z: -27.5 },
        rotation: { x: 0, y: 2*rightAngle, z: 0 }
    },
    {
        name: "backFromCentrePlatform1",
        geometry: "platform",
        material: "platform",
        position: { x: 0, y: 1.25, z: 7.5 },
        rotation: { x: 0, y: 2*rightAngle, z: 0 }
    },
    {
        name: "backFromCentrePlatform2",
        geometry: "platform",
        material: "platform",
        position: { x: 0, y: 1.25, z: 12.5 },
        rotation: { x: 0, y: 2*rightAngle, z: 0 }
    },
    {
        name: "backFromCentrePlatform3",
        geometry: "platform",
        material: "platform",
        position: { x: 0, y: 1.25, z: 17.5 },
        rotation: { x: 0, y: 2*rightAngle, z: 0 }
    },
    {
        name: "backFromCentrePlatform4",
        geometry: "platform",
        material: "platform",
        position: { x: 0, y: 1.25, z: 22.5 },
        rotation: { x: 0, y: 2*rightAngle, z: 0 }
    },
    {
        name: "backFromCentrePlatform5",
        geometry: "platform",
        material: "platform",
        position: { x: 0, y: 1.25, z: 27.5 },
        rotation: { x: 0, y: 2*rightAngle, z: 0 }
    },
    
];
//END PLATFORM POSITIONS------------------------------------------------

//BUTTON POSITIONS-----------------------------------------------------
export const buttonDimensions = {width: 1, height: 0.2, depth: 1};
const centreButtonZPositionOffset = groundDimensions.width/10;
export const buttonPositions = [
    {
        name: "centreButton",
        geometry: "button",
        material: "button",
        position: { x: 0, y: 1.75, z: -centreButtonZPositionOffset },
        rotation: { x: 0, y: 0, z: 0 }
    }
];
//END BUTTON POSITIONS-------------------------------------------------

//LAMP POSITIONS-------------------------------------------------------
const baseLamp = {
    height_diff: 150,
    scene: "src/models/old_english_street_lamp/scene.gltf",
    scaleX: 0.5,
    scaleY: 0.5,
    scaleZ: 0.5,
    positionX: 0, 
    positionY: 0, 
    positionZ: 0
};
const centreLampXPositionOffset = groundDimensions.width/15;
const centreLampZPositionOffset = groundDimensions.width/10;
export const lampPositions = {
    doorLamp: Object.assign({}, baseLamp, { positionX: platformDimensions.width/5, positionY: doorPlatformHeight, positionZ: doorPlatformPositionOnWall}),
    leftLamp: Object.assign({}, baseLamp, { positionX: rightPlatformPositionOnWall, positionY: doorPlatformHeight, positionZ: -platformDimensions.width/5 }),
    rightLamp: Object.assign({}, baseLamp, { positionX: leftPlatformPositionOnWall, positionY: doorPlatformHeight, positionZ: platformDimensions.width/5 }),
    centreLamp: Object.assign({}, baseLamp, { positionX: centreLampXPositionOffset, positionY: 1.75, positionZ: -centreLampZPositionOffset })
};
//END LAMP POSITIONS---------------------------------------------------

//DOOR POSITIONS-----------------------------------------------------
export const doorPositions = {
    "doorOne":{
        height_diff:270,
        scene:"src/models/medieval_door/scene.gltf",
        scaleX:0.005,
        scaleY:0.005,
        scaleZ:0.005,
        positionX:0, 
        positionY:wallDimensions.depth - wallDimensions.depth/3,
        positionZ:wallPositions[3].position.z - wallDimensions.height/2,
    }
};
//END DOOR POSITIONS---------------------------------------------------

//LIGHTS CONFIG-------------------------------------------------------
export const lightsConfig = [
    // {
    //     name: "ambientLight",
    //     type: "AmbientLight",
    //     color: 0xffffff,
    //     intensity: 5
    // }
];
//END LIGHTS CONFIG---------------------------------------------------