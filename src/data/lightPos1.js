export const lightsConfigLevel1 = [
    {
        name: "spotlight",
        type: "SpotLight",
        color: 0xfcf4dc,
        intensity: 10,
        distance: 6,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: 0, y: 4, z: 0 },
        target: {
            position: { x: 0, y: 0, z: 0 }
        }
    },
    {
        name: "spotlight1",
        type: "SpotLight",
        color: 0x800080,
        intensity: 5,
        distance: 4,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: -4, y: 3, z: 5 },
        target: {
            position: { x: -4, y: 0, z: 5 }
        }
    },
    {
        name: "spotlight2",
        type: "SpotLight",
        color: 0xffa500, // Orange light
        intensity: 5,
        distance: 4,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: 4, y: 3, z: 10 },
        target: {
            position: { x: 4, y: 0, z: 10 }
        }
    },
    {
        name: "pointlight3",
        type: "PointLight",
        color: 0xffffff,
        intensity: 1,
        distance: 4,
        position: { x: 0, y: 6, z: -9 },
        target: null // PointLight doesn't need a target
    },
    {
        name: "spotlight4",
        type: "SpotLight",
        color: 0x800080,
        intensity: 5,
        distance: 4,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: 4, y: 3, z: 25 },
        target: {
            position: { x: 4, y: 0, z: 25 }
        }
    },
];
