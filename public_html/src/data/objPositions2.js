//GROUND POSITIONS-----------------------------------------------------
export const groundDimensions = {width: 50, height: 1, depth: 50}
export const groundPositions = [
    {
        name: "mainFloor",
        geometry: "ground",
        material: "ground",
        position: { x:0, y:0, z:0 },
        rotation: { x:0, y:0, z:0 }
    }
]
//END GROUND POSITIONS-------------------------------------------------

//WALL POSITIONS-------------------------------------------------------
export const wallDimensions = {width: 50, height: 1, depth: 20}
const rightAngle = Math.PI / 2;
const wallHeight = wallDimensions.depth/2;
const wallSide = wallDimensions.width/2;
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
export const ceilingDimensions = {width: 50, height: 1, depth: 50}
const ceilingHeight = wallDimensions.depth;
export const ceilingPositions = [
    // {
    //     name: "mainCeiling",
    //     geometry: "ceiling",
    //     material: "ceiling",
    //     position: { x: 0, y: ceilingHeight, z: 0 },
    //     rotation: { x: 0, y: 0, z: 0 }
    // }
]
//END CEILING POSITIONS------------------------------------------------

//PLATFORM POSITIONS---------------------------------------------------
export const platformDimensions = {width: 10, height: 1, depth: 5}
const doorPlatformHeight = wallDimensions.depth - wallDimensions.depth/4 - 0.5;
const doorPlatformPositionOnWall = wallPositions[3].position.z - wallDimensions.height/2 - platformDimensions.depth/2;
export const platformPositions = [
    {
        name: "doorPlatform",
        geometry: "platform",
        material: "platform",
        position: { x: 0, y: doorPlatformHeight, z: doorPlatformPositionOnWall },
        rotation: { x: 0, y: 0, z: 0 }
    }
    
]
//END PLATFORM POSITIONS------------------------------------------------

//LAMP POSITIONS-------------------------------------------------------
const baseLamp = {
    height_diff: 150,
    scene: "src/models/street_lamp/scene.gltf",
    scaleX: 0.1,
    scaleY: 0.1,
    scaleZ: 0.1,
    positionX: 0, 
    positionY: 0, 
    positionZ: 0
};
export const lampPositions = {
lampOne: Object.assign({}, baseLamp, { positionX: 0, positionY: 1, positionZ: 0 })
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
        positionY:wallDimensions.depth - wallDimensions.depth/4,
        positionZ:wallPositions[3].position.z - wallDimensions.height/2,
    }
}
//END DOOR POSITIONS---------------------------------------------------

//LIGHTS CONFIG-------------------------------------------------------
export const lightsConfig = [
    {
        name: "ambientLight",
        type: "AmbientLight",
        color: 0xffffff,
        intensity: 5
    }
];
//END LIGHTS CONFIG---------------------------------------------------