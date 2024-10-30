const baseLamp = {
  height_diff: 150,
  scene: "victorian_street_lamp/scene.gltf",
  scaleX: 0.004,
  scaleY: 0.004,
  scaleZ: 0.004,
  positionX: 0, 
  positionY: 0, 
  positionZ: 0  
};

export const lamps = {
  lampOne: Object.assign({}, baseLamp, { positionY: 0.5, positionX: 0, positionZ: 12 }),
  lampTwo: Object.assign({}, baseLamp, { positionY: 0.5, positionX: 0, positionZ: -12 })
};