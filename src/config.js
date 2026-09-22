export const GRID = {
  tileSize: 4.8,
  startRadius: 2,
  maxRadius: 7,
};

export const CARD_DEFS = {
  field: {
    category: 'ФЕРМА',
    name: 'Поле',
    icon: 'wheat',
    cost: {},
    tone: 'gold',
    description: 'Поставить часть поля. Любые 4 соединённые части без мельницы схлопываются в самую первую.',
  },
  expand: {
    category: 'ЛАНДШАФТ',
    name: 'Расширить остров',
    icon: 'expand',
    cost: { wood: 1, stone: 1 },
    tone: 'green',
    description: 'Добавить клетку суши рядом с существующей землёй.',
  },
  tree: {
    category: 'ПРИРОДА',
    name: 'Посадить лес',
    icon: 'tree-pine',
    cost: {},
    tone: 'green',
    description: 'Посадить лес. Лесопилка даёт древесину за 1-ю обработку и вырубает дерево за 2-ю.',
  },
  rock: {
    category: 'ПРИРОДА',
    name: 'Камни',
    icon: 'mountain',
    cost: {},
    tone: 'stone',
    description: 'Добавить камни. Каменоломня даёт камень за 1-ю обработку и истощает залежь за 2-ю.',
  },
  clear: {
    category: 'ИНСТРУМЕНТ',
    name: 'Расчистка',
    icon: 'axe',
    cost: { wood: 1 },
    tone: 'red',
    description: 'Убрать дерево или камень и освободить клетку.',
  },
  millUpgrade: {
    category: 'АПГРЕЙД',
    name: 'Новая мельница',
    icon: 'wind',
    cost: { wood: 4, stone: 3 },
    tone: 'blue',
    description: 'Обновить мельницу. При 4 зрелых полях запускает большой урожай.',
  },
  house: {
    category: 'ПОСЕЛЕНИЕ',
    name: 'Дом',
    icon: 'house',
    cost: { wood: 2 },
    tone: 'blue',
    description: 'Жилой дом. Усиливает рынок, построенный рядом.',
  },
  market: {
    category: 'ТОРГОВЛЯ',
    name: 'Рынок',
    icon: 'store',
    cost: { wood: 2, stone: 2 },
    tone: 'gold',
    description: 'Даёт больше очков за каждый соседний дом.',
  },
  lumbermill: {
    category: 'ПРОИЗВОДСТВО',
    name: 'Лесопилка',
    icon: 'trees',
    cost: {},
    tone: 'green',
    description: 'Обрабатывает соседний лес. Вторая лесопилка или карта поверх старой завершает вырубку.',
  },
  quarry: {
    category: 'ПРОИЗВОДСТВО',
    name: 'Каменоломня',
    icon: 'pickaxe',
    cost: {},
    tone: 'stone',
    description: 'Обрабатывает соседние камни. Вторая каменоломня или карта поверх старой завершает добычу.',
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
  ['quarry', 7],
  ['millUpgrade', 6],
];

export const DIRECTIONS = [
  { key: 'north', dx: 0, dz: -1 },
  { key: 'east', dx: 1, dz: 0 },
  { key: 'south', dx: 0, dz: 1 },
  { key: 'west', dx: -1, dz: 0 },
];
