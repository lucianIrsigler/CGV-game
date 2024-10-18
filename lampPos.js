const baseLamp = {
    height_diff: 150,
    scene: "./public/assets/victorian_street_lamp/scene.gltf",
    scaleX: 0.005,
    scaleY: 0.005,
    scaleZ: 0.005,
};

export const lamps = {
    lampOne: Object.assign({}, baseLamp, { positionY: 0 }),
    lampTwo: Object.assign({}, baseLamp, { positionY: 15 }),
    lampThree: Object.assign({}, baseLamp, { positionY: 145 }),
    lampFour: Object.assign({}, baseLamp, { positionY: 145 }),
};
