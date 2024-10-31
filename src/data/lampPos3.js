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

export const lamps3 = {
  lampOne: Object.assign({}, baseLamp, { positionY: 0.5, positionX: 0, positionZ: 12 }),
  lampTwo: Object.assign({}, baseLamp, { positionY: 0.5, positionX: 0, positionZ: -12 })
};