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
export const lamps = {
  lampOne: Object.assign({}, baseLamp, { positionX: 0, positionY: 0, positionZ: 21.5 })
};