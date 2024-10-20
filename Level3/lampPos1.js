const baseLamp = {
  height_diff: 150,
  scene: "victorian_street_lamp/scene.gltf",
  scaleX: 0.003,
  scaleY: 0.003,
  scaleZ: 0.003,
  positionX: 0, 
  positionY: 0, 
  positionZ: 0  
};

export const lamps = {
  lampOne: Object.assign({}, baseLamp, { positionY: 0.5, positionX: -4, positionZ: 5 })
};
