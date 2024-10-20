const baseLamp = {
    height_diff: 150,
    scene: "victorian_street_lamp/scene.gltf",
    scaleX: 0.005,
    scaleY: 0.005,
    scaleZ: 0.005,
    positionX: 0, 
    positionY: 0, 
    positionZ: 0  
  };
  
  export const lamps = {
    lampOne: Object.assign({}, baseLamp, { positionY: 0, positionX: -4, positionZ: 5 }),
    lampTwo: Object.assign({}, baseLamp, { positionY: 0, positionX: 4, positionZ: 10 }),
    lampThree: Object.assign({}, baseLamp, { positionY: 0, positionX: 4, positionZ: 25 }),
    lampFour: Object.assign({}, baseLamp, { positionY: 2, positionX: 3, positionZ: 15 }),
    lampFive: Object.assign({}, baseLamp, { positionY: 4, positionX: -3, positionZ: 20 }),
    lampSix: Object.assign({}, baseLamp, { positionY: 2, positionX: 3, positionZ: 30 }),
    lampSeven: Object.assign({}, baseLamp, { positionY: 4, positionX: -3, positionZ: 35 }),
  };
  