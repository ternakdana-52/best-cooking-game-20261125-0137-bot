// Sizzle & Serve — the kitchen's rules. No drawing here, no input here:
// this file only holds the state and steps it forward. A plate is a list of
// ingredient kinds; an order is served when the plate holds exactly the
// recipe's kinds, no more and no less. Patties never go straight on the
// plate: they cook on the grill first, and burn if you forget them.

import {
  CUSTOMERS, GRILL_SLOTS, MAX_HEARTS, MAX_ORDERS, ORDER_PATIENCE_SECONDS,
  ORDER_SPAWN_SECONDS, PATTY_BURN_SECONDS, PATTY_COOK_SECONDS, RECIPES,
  SCREENS, SHIFT_SECONDS,
} from './config.js';
import { makeRng, pick } from './random.js';

function sameKinds(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = a.slice().sort().join(',');
  const sortedB = b.slice().sort().join(',');
  return sortedA === sortedB;
}

export function createWorld(seed = 1) {
  const rng = makeRng(seed);
  let nextOrderId = 1;
  let nextCustomer = 0;

  const world = {
    screen: SCREENS.TITLE,
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    coins: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    orders: [],
    plate: [],
    grill: [],
    spawnIn: 4,
    floats: [],
    shakeOrder: null,
    shakeUntil: 0,
    flash: 0,
    overReason: '',
    muted: false,

    start() {
      this.screen = SCREENS.PLAY;
      this.timeLeft = SHIFT_SECONDS;
      this.elapsed = 0;
      this.coins = 0;
      this.served = 0;
      this.combo = 0;
      this.bestCombo = 0;
      this.hearts = MAX_HEARTS;
      this.orders = [];
      this.plate = [];
      this.grill = [];
      this.spawnIn = 4;
      this.floats = [];
      this.shakeOrder = null;
      this.flash = 0;
      this.overReason = '';
      this.spawnOrder();
      this.spawnOrder();
    },

    spawnOrder() {
      if (this.orders.length >= MAX_ORDERS) return;
      const recipe = pick(rng, RECIPES);
      const customer = CUSTOMERS[nextCustomer % CUSTOMERS.length];
      nextCustomer += 1;
      const patience = Math.max(26, ORDER_PATIENCE_SECONDS - this.elapsed / 20);
      this.orders.push({
        id: nextOrderId,
        recipe,
        customer,
        patience,
        patienceMax: patience,
      });
      nextOrderId += 1;
    },

    // The patty station: take a ready patty first, else start one cooking.
    // Returns 'grill' | 'ready' | 'full' | 'none'.
    pattyAction() {
      const ready = this.grill.findIndex((g) => g.state === 'ready');
      if (ready !== -1) {
        this.grill.splice(ready, 1);
        this.plate.push('patty');
        return 'ready';
      }
      const cooking = this.grill.filter((g) => g.state === 'cooking').length;
      if (this.grill.length >= GRILL_SLOTS || cooking >= GRILL_SLOTS) return 'full';
      this.grill.push({ progress: 0, state: 'cooking' });
      return 'grill';
    },

    addIngredient(id) {
      if (this.screen !== SCREENS.PLAY) return 'none';
      if (id === 'patty') return this.pattyAction();
      if (this.plate.length >= 6) return 'full';
      this.plate.push(id);
      return 'added';
    },

    takeBurnt(index) {
      this.grill.splice(index, 1);
      return 'trashed';
    },

    clearPlate() {
      if (this.plate.length === 0) return 'none';
      this.plate = [];
      return 'cleared';
    },

    serve() {
      if (this.screen !== SCREENS.PLAY) return 'none';
      const match = this.orders.find((o) => sameKinds(this.plate, o.recipe.kinds));
      if (!match) {
        this.combo = 0;
        this.shakeOrder = this.orders.length ? this.orders[0].id : null;
        this.shakeUntil = this.elapsed + 0.4;
        return 'wrong';
      }
      const patienceFrac = Math.max(0, match.patience / match.patienceMax);
      const comboMult = 1 + 0.25 * Math.min(this.combo, 4);
      const earned = Math.max(1, Math.round(match.recipe.coins * (1 + 0.5 * patienceFrac) * comboMult));
      this.coins += earned;
      this.served += 1;
      this.combo += 1;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      this.orders = this.orders.filter((o) => o.id !== match.id);
      this.plate = [];
      this.flash = 1;
      this.floats.push({ text: `+${earned} coins`, x: 640, y: 300, ttl: 1.2, color: '#f5b301' });
      if (this.combo >= 2) {
        this.floats.push({ text: `COMBO x${this.combo}`, x: 640, y: 340, ttl: 1.2, color: '#e94f37' });
      }
      return 'served';
    },

    step(dt) {
      if (this.screen !== SCREENS.PLAY) return;
      this.elapsed += dt;
      this.timeLeft = Math.max(0, this.timeLeft - dt);
      if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 2);
      this.floats = this.floats.filter((f) => (f.ttl -= dt) > 0);
      for (const slot of this.grill) {
        slot.progress += dt;
        if (slot.state === 'cooking' && slot.progress >= PATTY_COOK_SECONDS) slot.state = 'ready';
        if (slot.progress >= PATTY_BURN_SECONDS) slot.state = 'burnt';
      }
      for (const order of this.orders) order.patience -= dt;
      const expired = this.orders.filter((o) => o.patience <= 0);
      if (expired.length) {
        this.orders = this.orders.filter((o) => o.patience > 0);
        this.hearts -= expired.length;
        this.combo = 0;
        this.floats.push({ text: 'Order walked out!', x: 640, y: 260, ttl: 1.4, color: '#e94f37' });
      }
      this.spawnIn -= dt;
      if (this.spawnIn <= 0) {
        this.spawnOrder();
        const interval = Math.max(4.5, ORDER_SPAWN_SECONDS - this.elapsed / 30);
        this.spawnIn = interval;
      }
      if (this.hearts <= 0) {
        this.hearts = 0;
        this.endShift('Out of hearts — too many orders walked out.');
      } else if (this.timeLeft <= 0) {
        this.endShift('Shift over — the dinner rush is done!');
      }
    },

    endShift(reason) {
      this.screen = SCREENS.OVER;
      this.overReason = reason;
      this.grill = [];
    },

    grillCooking() {
      return this.grill.some((g) => g.state === 'cooking');
    },
  };

  return world;
}
