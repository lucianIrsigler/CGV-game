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
        target: { position: { x: 0, y: 0, z: 0 } },
        helper: true
    },
    {
        name: "spotlight1",
        type: "SpotLight",
        color: 0x800080,
        intensity: 10,
        distance: 6,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: -4, y: 4, z: 5 },
        target: { position: { x: -4, y: 0, z: 5 } },
        helper: true
    },
    {
        name: "spotlight2",
        type: "SpotLight",
        color: 0x800080,//0xffa500, Orange light
        intensity: 10,
        distance: 6,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: 4, y: 4, z: 10 },
        target: { position: { x: 4, y: 0, z: 10 } },
        helper: true
    },
    {
        name: "pointlight3",
        type: "PointLight",
        color: 0xffffff,
        intensity: 1,
        distance: 4,
        position: { x: 0, y: 6, z: -9 },
        target: null, // PointLight doesn't need a target
        helper: true
    },
    {
        name: "spotlight4",
        type: "SpotLight",
        color: 0x800080,
        intensity: 10,
        distance: 6,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: 4, y: 4, z: 25 },
        target: { position: { x: 4, y: 0, z: 25 } },
        helper: true
    },
    {
        name: "spotlight5",
        type: "SpotLight",
        color:  0x800080,//0xffa500, Orange light
        intensity: 10,
        distance: 6,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: 3, y: 7, z: 15 },
        target: { position: { x: 3, y: 3, z: 15 } },
        helper: true
    },
    {
        name: "spotlight6",
        type: "SpotLight",
        color: 0x800080,
        intensity: 10,
        distance: 6,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: -3, y: 9, z: 20 },
        target: { position: { x: -3, y: 5, z: 20 } },
        helper: true
    },
    {
        name: "spotlight7",
        type: "SpotLight",
        color: 0x800080,
        intensity: 10,
        distance: 6,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: 3, y: 7, z: 30 },
        target: { position: { x: 3, y: 3, z: 30 } },
        helper: true
    },
    {
        name: "spotlight8",
        type: "SpotLight",
        color: 0x008000, // Green light
        intensity: 20,
        distance: 6,
        angle: Math.PI / 6,
        penumbra: 0.5,
        decay: 2,
        position: { x: -3, y: 10, z: 35 },
        target: { position: { x: -3, y: 6, z: 35 } },
        helper: true
    },
    {
        name: "ambientLight",
        type: "AmbientLight",
        color: 0x101010,
        intensity: 0.75,
        helper: false
    }
];
