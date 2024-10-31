const baseLamp = {
    height_diff: 150,
    scene: "street_lamp/scene.gltf",
    scaleX: 0.5,
    scaleY: 0.5,
    scaleZ: 0.5,
    positionX: 0, 
    positionY: 0, 
    positionZ: 0  
  };
  export const lamps = {
    lampOne: Object.assign({}, baseLamp, { positionX: 0, positionY: 0, positionZ: 21.5 }),
    lampTwo: Object.assign({}, baseLamp, { positionX: 2.6329906181668092e-15, positionY: 12, positionZ: -21.5 }),
    lampThree: Object.assign({}, baseLamp, { positionX: -5.2659812363336185e-15, positionY: 24, positionZ: 21.5 }),
    lampFour: Object.assign({}, baseLamp, { positionX: 7.898971854500428e-15, positionY: 36, positionZ: -21.5 }),
    lampFive: Object.assign({}, baseLamp, { positionX: -1.0531962472667237e-14, positionY: 48, positionZ: 21.5 })
  };