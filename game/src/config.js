// Sizzle & Serve — every tunable number for the kitchen, in one place.
// Nothing here is copied from any other game: these recipes, timings and
// prices are the game's own design.

export const VIEW = { width: 1280, height: 800 };

export const SHIFT_SECONDS = 120;
export const MAX_ORDERS = 3;
export const MAX_HEARTS = 3;
export const GRILL_SLOTS = 2;
export const PATTY_COOK_SECONDS = 6;
export const PATTY_BURN_SECONDS = 11;
export const ORDER_SPAWN_SECONDS = 9;
export const ORDER_PATIENCE_SECONDS = 38;

// Ingredients, in counter order. `key` is the keyboard shortcut, `kind`
// is what the plate stores. The grill station is special: it cooks patties.
export const INGREDIENTS = [
  { id: 'bun',     name: 'Bun',     key: '1', color: '#e8a94e', dark: '#b97a28', kind: 'bun' },
  { id: 'patty',   name: 'Patty',   key: '2', color: '#8a5a33', dark: '#5d3a1e', kind: 'patty' },
  { id: 'lettuce', name: 'Lettuce', key: '3', color: '#7bc043', dark: '#4c8a24', kind: 'lettuce' },
  { id: 'tomato',  name: 'Tomato',  key: '4', color: '#e94f37', dark: '#b32a1c', kind: 'tomato' },
  { id: 'cheese',  name: 'Cheese',  key: '5', color: '#ffc93c', dark: '#d99a00', kind: 'cheese' },
  { id: 'fries',   name: 'Fries',   key: '6', color: '#ffd23e', dark: '#c99a12', kind: 'fries' },
  { id: 'drink',   name: 'Drink',   key: '7', color: '#4ecdc4', dark: '#1f8a83', kind: 'drink' },
];

// Recipes: the exact multiset of kinds a plate must hold to serve the dish.
export const RECIPES = [
  { id: 'classic', name: 'Classic Burger', kinds: ['bun', 'patty', 'lettuce', 'tomato'], coins: 12, blurb: 'The house favourite' },
  { id: 'cheese',  name: 'Cheese Melt',    kinds: ['bun', 'patty', 'cheese', 'lettuce'], coins: 14, blurb: 'Extra gooey' },
  { id: 'garden',  name: 'Garden Stack',   kinds: ['bun', 'lettuce', 'tomato', 'cheese'], coins: 10, blurb: 'No patty, all crunch' },
  { id: 'frybox',  name: 'Fry Box',        kinds: ['fries', 'drink'],                    coins: 8,  blurb: 'Quick side combo' },
];

export const CUSTOMERS = ['Maya', 'Ravi', 'Lena', 'Omar', 'Suki', 'Tom', 'Aya', 'Ben'];

export const COLORS = {
  wall: '#f7e8d0',
  wallDark: '#e8d3ae',
  floor: '#c98f5f',
  counter: '#8b5e3c',
  counterTop: '#a9714b',
  board: '#fff8e7',
  ink: '#2b2118',
  muted: '#7a6a58',
  accent: '#e94f37',
  green: '#4c9a2a',
  gold: '#f5b301',
  plate: '#f4f1ea',
};

export const SCREENS = {
  TITLE: 'title',
  PLAY: 'play',
  OVER: 'over',
};
