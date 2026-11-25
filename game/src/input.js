// Sizzle & Serve — mouse and keyboard. Clicks map from screen pixels into
// the 1280×800 game view; keys 1–7 pick ingredients, Space serves, X trashes
// the plate, P pauses, M mutes, R restarts, Enter starts.

import { INGREDIENTS, SCREENS, VIEW } from './config.js';
import { layout } from './render.js';

function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function attachInput(canvas, world, audio, hooks) {
  function toGame(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VIEW.width,
      y: ((e.clientY - rect.top) / rect.height) * VIEW.height,
    };
  }

  function act(result, okSound) {
    if (result === 'served') { audio.ding(); return; }
    if (result === 'wrong' || result === 'full') { audio.buzz(); return; }
    if (result === 'grill') { audio.grill(); audio.startSizzle(); return; }
    if (result === 'added' || result === 'ready' || result === 'cleared' || result === 'trashed') {
      if (okSound !== false) audio.add();
    }
  }

  canvas.addEventListener('pointerdown', (e) => {
    audio.unlock();
    const p = toGame(e);
    if (world.screen === SCREENS.TITLE) { hooks.onStart(); return; }
    if (world.screen === SCREENS.OVER) { hooks.onRestart(); return; }
    if (hooks.isPaused()) return;
    const board = layout();
    // Burnt grill slots: click to toss.
    for (let i = 0; i < board.grillSlots.length; i += 1) {
      const slot = board.grillSlots[i];
      const dx = p.x - slot.x;
      const dy = p.y - slot.y;
      if (dx * dx + dy * dy <= slot.r * slot.r) {
        const g = world.grill[i];
        if (g && g.state === 'burnt') { act(world.takeBurnt(i)); return; }
      }
    }
    if (pointInRect(p.x, p.y, board.serve)) { act(world.serve()); return; }
    if (pointInRect(p.x, p.y, board.trash)) { act(world.clearPlate()); return; }
    for (const st of board.stations) {
      if (pointInRect(p.x, p.y, st)) {
        act(world.addIngredient(st.id));
        return;
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'm') { world.muted = audio.toggleMute(); return; }
    if (key === 'p' && world.screen === SCREENS.PLAY) { hooks.onPause(); return; }
    if (world.screen === SCREENS.TITLE && (key === 'enter' || key === ' ')) { hooks.onStart(); return; }
    if (world.screen === SCREENS.OVER && (key === 'r' || key === 'enter')) { hooks.onRestart(); return; }
    if (world.screen !== SCREENS.PLAY || hooks.isPaused()) return;
    if (key === ' ') { e.preventDefault(); act(world.serve()); return; }
    if (key === 'x') { act(world.clearPlate()); return; }
    if (key === 'r') { hooks.onRestart(); return; }
    const ing = INGREDIENTS.find((g) => g.key === key);
    if (ing) act(world.addIngredient(ing.id));
  });
}
