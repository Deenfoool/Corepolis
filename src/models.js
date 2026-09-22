const BRICKSHOW_MODELS =
  'https://raw.githubusercontent.com/brickshow/pc-anatomy/377dfd450bf8697c83d5edd8cae13276b173438e/public/models';

const CUSTOM_PC_MODELS =
  'https://raw.githubusercontent.com/Jacob-Baker-Git/CustomPc/7e1d68e827e32a9813a4a5d63c3afa672a656e8c/public/models';

export const MODEL_ASSETS = {
  cpu: {
    url: `${BRICKSHOW_MODELS}/cpu.glb`,
    fit: [3.25, 1.15, 3.0],
    rotation: [0, 0, 0]
  },
  ram: {
    url: `${CUSTOM_PC_MODELS}/ram.glb`,
    fit: [1.45, 2.35, 4.8],
    rotation: [1.5707963268, 0, 0]
  },
  gpu: {
    url: `${BRICKSHOW_MODELS}/gpu.glb`,
    fit: [5.5, 1.8, 2.6],
    rotation: [-1.5707963268, 0, 0]
  },
  storage: {
    url: `${CUSTOM_PC_MODELS}/storage.glb`,
    fit: [3.15, 0.9, 2.25],
    rotation: [1.5707963268, 0, 0]
  },
  hdd: {
    url: `${BRICKSHOW_MODELS}/hdd.glb`,
    fit: [3.35, 1.05, 2.65],
    rotation: [0, 0, 0]
  },
  power: {
    url: `${BRICKSHOW_MODELS}/psu.glb`,
    fit: [3.8, 2.15, 3.2],
    rotation: [0, 0, 0]
  },
  cooling: {
    url: `${BRICKSHOW_MODELS}/cpu_fan.glb`,
    fit: [2.5, 1.75, 2.15],
    rotation: [0, 0, 0]
  },
  network: {
    url: './assets/models/network.glb',
    fit: [2.75, 1.0, 2.45],
    rotation: [0, 0, 0]
  }
};

export const MOTHERBOARD_ASSET = {
  url: `${BRICKSHOW_MODELS}/motherboard.glb`,
  rotation: [-1.5707963268, 0, 0]
};

export const SCENE_ASSETS = {
  roomFloor: { url: './assets/environment/room-floor.glb' },
  roomWall: { url: './assets/environment/room-wall.glb' },
  roomWindow: { url: './assets/environment/room-window.glb' },
  roomDoor: { url: './assets/environment/room-door.glb' },
  desk: { url: './assets/environment/desk.glb' },
  pcCase: { url: './assets/environment/pc-case.glb' }
};
