export const GRID = {
  tileSize: 4.8,
  startRadius: 2,
  maxRadius: 7,
};

export const CARD_DEFS = {
  field: {
    category: 'ФЕРМА',
    name: 'Поле',
    icon: '🌾',
    tone: 'gold',
    description: 'Поставить часть поля. Любые 4 соединённые части без мельницы схлопываются в самую первую.',
  },
  expand: {
    category: 'ЛАНДШАФТ',
    name: 'Расширить остров',
    icon: '🟩',
    tone: 'green',
    description: 'Добавить клетку суши рядом с существующей землёй.',
  },
  tree: {
    category: 'ПРИРОДА',
    name: 'Посадить лес',
    icon: '🌲',
    tone: 'green',
    description: 'Добавить дерево на свободную клетку.',
  },
  rock: {
    category: 'ПРИРОДА',
    name: 'Камни',
    icon: '🪨',
    tone: 'stone',
    description: 'Добавить камни на свободную клетку.',
  },
  clear: {
    category: 'ИНСТРУМЕНТ',
    name: 'Расчистка',
    icon: '🪓',
    tone: 'red',
    description: 'Убрать дерево или камень и освободить клетку.',
  },
  millUpgrade: {
    category: 'АПГРЕЙД',
    name: 'Новая мельница',
    icon: '⚙️',
    tone: 'blue',
    description: 'Обновить мельницу. При 4 зрелых полях запускает большой урожай.',
  },
  house: {
    category: 'ПОСЕЛЕНИЕ',
    name: 'Дом',
    icon: '🏠',
    tone: 'blue',
    description: 'Жилой дом. Усиливает рынок, построенный рядом.',
  },
  market: {
    category: 'ТОРГОВЛЯ',
    name: 'Рынок',
    icon: '🏪',
    tone: 'gold',
    description: 'Даёт больше очков за каждый соседний дом.',
  },
  lumbermill: {
    category: 'ПРОИЗВОДСТВО',
    name: 'Лесопилка',
    icon: '🪵',
    tone: 'green',
    description: 'Получает бонус за деревья вокруг. При 2+ деревьях даёт карту.',
  },
  mine: {
    category: 'ПРОИЗВОДСТВО',
    name: 'Шахта',
    icon: '⛏️',
    tone: 'stone',
    description: 'Получает бонус за камни вокруг. При 2+ залежах даёт карту.',
  },
};

export const DECK_WEIGHTS = [
  ['field', 30],
  ['expand', 14],
  ['tree', 10],
  ['rock', 8],
  ['clear', 8],
  ['house', 10],
  ['market', 6],
  ['lumbermill', 7],
  ['mine', 7],
  ['millUpgrade', 6],
];

export const DIRECTIONS = [
  { key: 'north', dx: 0, dz: -1 },
  { key: 'east', dx: 1, dz: 0 },
  { key: 'south', dx: 0, dz: 1 },
  { key: 'west', dx: -1, dz: 0 },
];
