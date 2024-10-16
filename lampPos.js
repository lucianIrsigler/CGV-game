const baseLamp = {
    height_diff: 150,
    scene: "./public/assets/victorian_street_lamp/scene.gltf",
    scaleX: 0.003,
    scaleY: 0.003,
    scaleZ: 0.003,
    positionX: 0, 
    positionY: 0, 
    positionZ: 0  
  };
  
  export const lamps = {
    lampOne: Object.assign({}, baseLamp, { positionY: 0, positionX: -4, positionZ: 5 }),
    lampTwo: Object.assign({}, baseLamp, { positionY: 0, positionX: 4, positionZ: 10 }),
    lampThree: Object.assign({}, baseLamp, { positionY: 0, positionX: 4, positionZ: 25 }),
  };
  