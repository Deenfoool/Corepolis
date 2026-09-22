export const GRID = {
  tileSize: 4.8,
  startRadius: 2,
  maxRadius: 7,
};

export const CARD_DEFS = {
  field: {
    name: 'Поле',
    icon: '🌾',
    tone: 'gold',
    description: 'Поставить поле у мельницы или повысить его стадию.',
  },
  expand: {
    name: 'Расширить остров',
    icon: '🟩',
    tone: 'green',
    description: 'Добавить клетку суши рядом с существующей землёй.',
  },
  tree: {
    name: 'Посадить лес',
    icon: '🌲',
    tone: 'green',
    description: 'Добавить дерево на свободную клетку.',
  },
  rock: {
    name: 'Камни',
    icon: '🪨',
    tone: 'stone',
    description: 'Добавить камни на свободную клетку.',
  },
  clear: {
    name: 'Расчистка',
    icon: '🪓',
    tone: 'red',
    description: 'Убрать дерево или камень и освободить клетку.',
  },
  millUpgrade: {
    name: 'Новая мельница',
    icon: '⚙️',
    tone: 'blue',
    description: 'Обновить мельницу. При 4 зрелых полях запускает большой урожай.',
  },
};

export const DECK_WEIGHTS = [
  ['field', 38],
  ['expand', 19],
  ['tree', 13],
  ['rock', 9],
  ['clear', 11],
  ['millUpgrade', 10],
];

export const DIRECTIONS = [
  { key: 'north', dx: 0, dz: -1 },
  { key: 'east', dx: 1, dz: 0 },
  { key: 'south', dx: 0, dz: 1 },
  { key: 'west', dx: -1, dz: 0 },
];
