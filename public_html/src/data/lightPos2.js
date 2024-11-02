export const lightsConfigLevel2 = [
    {
        name: "lampSpotlightOne",
        type: "SpotLight",
        color: 0x800080, // Same color for each spotlight
        intensity: 10,
        distance: 15,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: 0, y: 0, z: 21.5 },
        target: { position: { x: 0, y: 0, z: 21.5 } },
        helper: true
    },
    {
        name: "lampSpotlightTwo",
        type: "SpotLight",
        color: 0x800080,
        intensity: 10,
        distance: 15,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: 2.63e-15, y: 12, z: -21.5 },
        target: { position: { x: 2.63e-15, y: 12, z: -21.5 } },
        helper: true
    },
    {
        name: "lampSpotlightThree",
        type: "SpotLight",
        color: 0x800080,
        intensity: 10,
        distance: 15,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: -5.27e-15, y: 24, z: 21.5 },
        target: { position: { x: -5.27e-15, y: 24, z: 21.5 } },
        helper: true
    },
    {
        name: "lampSpotlightFour",
        type: "SpotLight",
        color: 0x800080,
        intensity: 10,
        distance: 15,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: 7.9e-15, y: 36, z: -21.5 },
        target: { position: { x: 7.9e-15, y: 36, z: -21.5 } },
        helper: true
    },
    {
        name: "lampSpotlightFive",
        type: "SpotLight",
        color: 0x800080,
        intensity: 10,
        distance: 15,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: -1.05e-14, y: 48, z: 21.5 },
        target: { position: { x: -1.05e-14, y: 48, z: 21.5 } },
        helper: true
    },
    {
        name: "generalLight",
        type: "SpotLight",
        color: 0xffffff,
        intensity: 10,
        distance: 40,
        angle: Math.PI,
        penumbra: 0.5,
        decay: 0,
        position: { x: -1.05e-14, y: 25, z: 21.5 },
        target: { position: { x: 0, y: 0, z: 0 } },
        helper: true}
];
