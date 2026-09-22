export const BUILDINGS = {
  cpu: {
    name: 'CPU Core',
    short: 'COMPUTE',
    cost: 3000,
    size: [4.4, 4.4],
    color: 0x57d5b1,
    height: 2.8,
    compute: 88,
    powerUse: 34,
    heat: 24,
    description: 'Primary compute district. High output, high thermal load.'
  },
  ram: {
    name: 'RAM District',
    short: 'MEMORY',
    cost: 1500,
    size: [2.2, 5.8],
    color: 0x7dd7ff,
    height: 2.0,
    memory: 96,
    powerUse: 11,
    heat: 7,
    description: 'Fast active-memory towers for live workloads.'
  },
  gpu: {
    name: 'GPU Complex',
    short: 'GRAPHICS',
    cost: 3600,
    size: [6.4, 3.3],
    color: 0xb18cff,
    height: 2.1,
    compute: 72,
    powerUse: 58,
    heat: 36,
    description: 'Parallel compute campus for heavy visual workloads.'
  },
  storage: {
    name: 'SSD District',
    short: 'SSD',
    cost: 1300,
    size: [4.0, 3.0],
    color: 0xffcd73,
    height: 1.4,
    storage: 180,
    powerUse: 7,
    heat: 4,
    description: 'Fast solid-state storage for active workloads.'
  },
  hdd: {
    name: 'HDD Archive',
    short: 'HDD',
    cost: 900,
    size: [4.2, 3.2],
    color: 0xe7b96c,
    height: 1.45,
    storage: 260,
    powerUse: 11,
    heat: 7,
    description: 'Cheap high-capacity storage with a larger power and heat footprint.'
  },
  power: {
    name: 'Power Plant',
    short: 'POWER',
    cost: 2200,
    size: [4.8, 4.2],
    color: 0xff8a6b,
    height: 2.2,
    power: 180,
    heat: 10,
    description: 'Expands the city power envelope.'
  },
  cooling: {
    name: 'Cooling Node',
    short: 'COOLING',
    cost: 900,
    size: [3.2, 3.2],
    color: 0x66f0ff,
    height: 1.6,
    cooling: 42,
    powerUse: 8,
    description: 'Removes thermal pressure from surrounding infrastructure.'
  },
  network: {
    name: 'Network Gateway',
    short: 'NETWORK',
    cost: 1100,
    size: [3.5, 3.5],
    color: 0x9dff82,
    height: 2.0,
    network: 110,
    powerUse: 7,
    heat: 3,
    description: 'Routes external traffic into the system city.'
  }
};

export const BOARD = {
  width: 46,
  depth: 31,
  grid: 1,
  margin: 1.2
};
