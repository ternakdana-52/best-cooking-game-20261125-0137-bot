// The screenshot scenes behind ?shot=start|play|serve|end. Each one plays
// the real rules forward from a fresh world for a fixed number of steps,
// steered by a simple autopilot that builds what the most urgent order
// needs, so every frame is what a short game really looks like and the same
// seed always gives the same frame.

import { SCREENS } from './config.js';

const STEP = 1 / 30;

/** The next ingredient the most urgent order still needs from the plate. */
function nextNeeded(world) {
  if (world.orders.length === 0) return null;
  const order = world.orders.slice().sort((a, b) => a.patience - b.patience)[0];
  const have = world.plate.slice();
  for (const kind of order.recipe.kinds) {
    const at = have.indexOf(kind);
    if (at !== -1) have.splice(at, 1);
    else return kind;
  }
  return null;
}

function plateMatchesOrder(world) {
  return world.orders.some((o) => {
    const a = world.plate.slice().sort().join(',');
    const b = o.recipe.kinds.slice().sort().join(',');
    return a === b;
  });
}

function pilotStep(world, canServe = true) {
  if (world.screen !== SCREENS.PLAY) return;
  if (plateMatchesOrder(world)) { if (canServe) world.serve(); return; }
  const needed = nextNeeded(world);
  if (!needed) { world.clearPlate(); return; }
  if (needed === 'patty') {
    const res = world.addIngredient('patty');
    if (res === 'full') world.clearPlate();
    return;
  }
  // If the plate holds something no open order can use, start over.
  const usable = world.orders.some((o) => {
    const kinds = o.recipe.kinds.slice();
    for (const k of world.plate) {
      const at = kinds.indexOf(k);
      if (at === -1) return false;
      kinds.splice(at, 1);
    }
    return true;
  });
  if (!usable) { world.clearPlate(); return; }
  world.addIngredient(needed);
}

// The pilot acts at most once every half second of game time, like a
// human cook pausing between moves — otherwise it builds and serves so
// fast the plate is never caught mid-assembly.
const ACT_EVERY = 15;

function runFor(world, seconds, stopWhen, canServe = true) {
  const steps = Math.ceil(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    if (world.screen !== SCREENS.PLAY) break;
    if (i % ACT_EVERY === 0) pilotStep(world, canServe);
    world.step(STEP);
    if (stopWhen && stopWhen(world)) break;
  }
}

/**
 * Set `world` to the named scene and return the screen to draw over it.
 * start: title over a fresh kitchen with two orders. play: mid-shift, a
 * dish half-built on the plate. serve: just after a dish is served.
 * end: the shift-over screen.
 */
export function stageShot(name, world) {
  world.start();
  if (name === 'play') {
    // Stop the moment a dish is half-built on the plate, with orders up.
    runFor(world, 40, (w) => w.plate.length >= 2 && w.orders.length >= 1 && w.elapsed > 8);
    return { screen: SCREENS.PLAY };
  }
  if (name === 'serve') {
    // Stop the moment the plate is complete and matches an order — the
    // "ready to serve" frame — without serving it yet.
    runFor(world, 60, (w) => plateMatchesOrder(w), false);
    return { screen: SCREENS.PLAY };
  }
  if (name === 'end') {
    // A full shift played well, then the clock runs out: the shift-over
    // screen with the real final score, dishes served and best combo.
    runFor(world, 400, () => false);
    return { screen: world.screen };
  }
  // start: the title over a fresh kitchen — no cooking yet, two orders up.
  world.screen = SCREENS.TITLE;
  return { screen: SCREENS.TITLE };
}
