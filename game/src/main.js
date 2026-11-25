// Sizzle & Serve — the game loop. One canvas, one requestAnimationFrame:
// step the kitchen, draw it, and keep the sizzle sound in step with the
// grill. A ?shot=start|play|serve|end query stages a screenshot scene
// instead of starting live play.

import { SCREENS, VIEW } from './config.js';
import { createWorld } from './world.js';
import { drawWorld } from './render.js';
import { attachInput } from './input.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;
  canvas.style.width = `${VIEW.width * scale}px`;
  canvas.style.height = `${VIEW.height * scale}px`;
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || '1') || 1;
const shot = params.get('shot');

const world = createWorld(seed);
const audio = createAudio();
let paused = false;
let last = performance.now();

function announce() {
  if (!statusEl) return;
  if (world.screen === SCREENS.PLAY) {
    statusEl.textContent = `Time ${Math.ceil(world.timeLeft)} seconds, ${world.coins} coins, ${world.served} served, ${world.orders.length} orders waiting.`;
  } else if (world.screen === SCREENS.OVER) {
    statusEl.textContent = `Shift over. ${world.coins} coins, ${world.served} dishes served.`;
  } else {
    statusEl.textContent = 'Sizzle and Serve. Press Enter to start.';
  }
}

attachInput(canvas, world, audio, {
  onStart() {
    audio.unlock();
    audio.click();
    world.start();
    paused = false;
    announce();
  },
  onRestart() {
    audio.unlock();
    audio.click();
    world.start();
    paused = false;
    announce();
  },
  onPause() {
    paused = !paused;
    audio.click();
  },
  isPaused() { return paused; },
});

if (shot) {
  stageShot(shot, world);
  drawWorld(ctx, world);
  announce();
} else {
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!paused && world.screen === SCREENS.PLAY) {
      world.step(dt);
      if (world.grillCooking()) audio.startSizzle();
      else audio.stopSizzle();
      if (world.screen === SCREENS.OVER) { audio.stopSizzle(); audio.buzz(); announce(); }
    }
    drawWorld(ctx, world);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  setInterval(announce, 1000);
}
