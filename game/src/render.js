// Sizzle & Serve — every pixel the player sees. All art is drawn with
// canvas shapes in this file: no image files, no fonts from the network,
// just a warm kitchen drawn from scratch.

import { COLORS, INGREDIENTS, RECIPES, SCREENS, SHIFT_SECONDS, VIEW } from './config.js';

export function layout() {
  const stations = INGREDIENTS.map((ing, i) => ({
    id: ing.id,
    x: 40 + i * 172,
    y: 300,
    w: 156,
    h: 150,
  }));
  return {
    stations,
    serve: { x: 1010, y: 540, w: 230, h: 90 },
    trash: { x: 1010, y: 650, w: 230, h: 56 },
    plate: { x: 640, y: 620, rx: 220, ry: 64 },
    grillSlots: [
      { x: 40 + 172 + 28, y: 462, r: 26 },
      { x: 40 + 172 + 100, y: 462, r: 26 },
    ],
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px 'Trebuchet MS', Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// --- Ingredient icons, drawn at (x, y) with the given radius. ---
export function drawIngredientIcon(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    ctx.fillStyle = '#e8a94e';
    ctx.beginPath(); ctx.arc(0, -r * 0.15, r, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.fillRect(-r * 0.5, -r * 0.5, r, r * 0.35);
    ctx.fillStyle = '#e8a94e';
    ctx.beginPath(); ctx.ellipse(0, r * 0.55, r, r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f7d38a';
    for (const [sx, sy] of [[-0.4, -0.5], [0.1, -0.65], [0.45, -0.4]]) {
      ctx.beginPath(); ctx.ellipse(sx * r, sy * r, r * 0.09, r * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = '#8a5a33';
    roundRect(ctx, -r, -r * 0.45, r * 2, r * 0.9, r * 0.4);
    ctx.fill();
    ctx.fillStyle = '#6b4423';
    for (const sx of [-0.5, 0, 0.5]) { ctx.beginPath(); ctx.arc(sx * r, 0, r * 0.08, 0, Math.PI * 2); ctx.fill(); }
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#7bc043';
    ctx.beginPath();
    for (let i = 0; i <= 8; i += 1) {
      const px = -r + (2 * r * i) / 8;
      const py = Math.sin((i / 8) * Math.PI * 3) * r * 0.3;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.lineTo(r, r * 0.4); ctx.lineTo(-r, r * 0.4); ctx.closePath(); ctx.fill();
  } else if (id === 'tomato') {
    ctx.fillStyle = '#e94f37';
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f28a7a';
    ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.15, r * 0.35, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'cheese') {
    ctx.fillStyle = '#ffc93c';
    ctx.beginPath(); ctx.moveTo(-r, -r * 0.4); ctx.lineTo(r, -r * 0.4); ctx.lineTo(0, r * 0.6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d99a00';
    for (const [sx, sy] of [[-0.3, -0.1], [0.35, -0.05]]) { ctx.beginPath(); ctx.arc(sx * r, sy * r, r * 0.09, 0, Math.PI * 2); ctx.fill(); }
  } else if (id === 'fries') {
    ctx.fillStyle = '#e94f37';
    roundRect(ctx, -r * 0.7, -r * 0.1, r * 1.4, r * 0.9, r * 0.15);
    ctx.fill();
    ctx.fillStyle = '#ffd23e';
    for (const [sx, tilt] of [[-0.45, -0.12], [-0.15, 0.06], [0.15, -0.06], [0.45, 0.12]]) {
      ctx.save(); ctx.translate(sx * r, -r * 0.55); ctx.rotate(tilt);
      ctx.fillRect(-r * 0.09, -r * 0.5, r * 0.18, r); ctx.restore();
    }
  } else if (id === 'drink') {
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 0.6); ctx.lineTo(r * 0.6, -r * 0.6); ctx.lineTo(r * 0.45, r * 0.7); ctx.lineTo(-r * 0.45, r * 0.7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e94f37';
    ctx.fillRect(-r * 0.7, -r * 0.85, r * 1.4, r * 0.3);
    ctx.strokeStyle = '#2b2118'; ctx.lineWidth = r * 0.08;
    ctx.beginPath(); ctx.moveTo(r * 0.2, -r * 0.85); ctx.lineTo(r * 0.45, -r * 1.3); ctx.stroke();
  }
  ctx.restore();
}

function drawPlateStack(ctx, kinds, cx, baseY, scale) {
  if (kinds.length === 0) {
    text(ctx, 'Empty plate — pick ingredients below', cx, baseY - 60, 18, COLORS.muted, '600', 'center');
    return;
  }
  let y = baseY;
  const step = 26 * scale;
  for (let i = kinds.length - 1; i >= 0; i -= 1) {
    const kind = kinds[i];
    if (kind === 'fries' || kind === 'drink') {
      drawIngredientIcon(ctx, kind, cx + (kind === 'fries' ? -70 : 70) * scale, y - 18 * scale, 30 * scale);
    } else {
      drawIngredientIcon(ctx, kind, cx, y - 14 * scale, 34 * scale);
    }
    y -= step;
  }
}

function drawTicket(ctx, order, x, y, w, h, shake) {
  const sx = shake ? x + Math.sin(Date.now() / 30) * 5 : x;
  ctx.fillStyle = COLORS.board;
  roundRect(ctx, sx, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = '#d9c49a';
  ctx.lineWidth = 2;
  ctx.stroke();
  const frac = Math.max(0, order.patience / order.patienceMax);
  const barColor = frac > 0.5 ? COLORS.green : frac > 0.25 ? COLORS.gold : COLORS.accent;
  ctx.fillStyle = barColor;
  roundRect(ctx, sx + 16, y + h - 26, (w - 32) * frac, 12, 6);
  ctx.fill();
  ctx.strokeStyle = '#d9c49a';
  roundRect(ctx, sx + 16, y + h - 26, w - 32, 12, 6);
  ctx.stroke();
  text(ctx, order.customer, sx + 16, y + 26, 20, COLORS.ink, '800');
  text(ctx, order.recipe.name, sx + 16, y + 56, 24, COLORS.accent, '800');
  text(ctx, `${order.recipe.coins} coins · ${order.recipe.blurb}`, sx + 16, y + 84, 14, COLORS.muted, '600');
  let chipX = sx + 16;
  for (const kind of order.recipe.kinds) {
    const ing = INGREDIENTS.find((g) => g.id === kind);
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.arc(chipX + 14, y + 118, 14, 0, Math.PI * 2); ctx.fill();
    drawIngredientIcon(ctx, kind, chipX + 14, y + 118, 11);
    chipX += 34;
  }
  text(ctx, `${Math.ceil(order.patience)}s`, sx + w - 16, y + h - 20, 14, COLORS.muted, '700', 'right');
}

export function drawWorld(ctx, world) {
  const W = VIEW.width;
  const H = VIEW.height;
  // Wall and floor.
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = COLORS.wallDark;
  ctx.fillRect(0, 250, W, 12);
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 720, W, 80);
  // Header.
  ctx.fillStyle = '#2b2118';
  ctx.fillRect(0, 0, W, 64);
  text(ctx, 'SIZZLE & SERVE', 24, 33, 30, '#ffd23e', '800');
  text(ctx, 'a tiny diner rush', 268, 36, 15, '#f7e8d0', '600');
  const timeFrac = Math.max(0, world.timeLeft / SHIFT_SECONDS);
  ctx.fillStyle = '#3a2f24';
  roundRect(ctx, 520, 20, 240, 24, 12); ctx.fill();
  ctx.fillStyle = timeFrac > 0.25 ? '#4ecdc4' : '#e94f37';
  roundRect(ctx, 520, 20, 240 * timeFrac, 24, 12); ctx.fill();
  text(ctx, `${Math.ceil(world.timeLeft)}s`, 640, 33, 18, '#ffffff', '800', 'center');
  text(ctx, `${world.coins} coins`, 800, 33, 22, '#ffd23e', '800');
  text(ctx, `Combo x${Math.max(1, world.combo)}`, 940, 33, 18, '#f7e8d0', '700');
  text(ctx, '♥'.repeat(world.hearts) + '♡'.repeat(3 - world.hearts), 1080, 33, 22, '#e94f37', '800');
  text(ctx, `Served ${world.served}`, 1180, 33, 16, '#f7e8d0', '700', 'right');

  // Order board.
  text(ctx, 'ORDER BOARD', 40, 92, 18, COLORS.muted, '800');
  const board = layout();
  world.orders.forEach((order, i) => {
    const shake = world.shakeOrder === order.id && world.elapsed < world.shakeUntil;
    drawTicket(ctx, order, 40 + i * 400, 104, 380, 158, shake);
  });
  for (let i = world.orders.length; i < 3; i += 1) {
    ctx.fillStyle = 'rgba(255,248,231,0.55)';
    roundRect(ctx, 40 + i * 400, 104, 380, 158, 14); ctx.fill();
    text(ctx, 'Waiting for the next order…', 40 + i * 400 + 190, 183, 16, COLORS.muted, '600', 'center');
  }

  // Stations.
  text(ctx, 'COUNTER — click an ingredient, or press its number key', 40, 288, 18, COLORS.muted, '800');
  board.stations.forEach((st) => {
    const ing = INGREDIENTS.find((g) => g.id === st.id);
    const isGrill = st.id === 'patty';
    ctx.fillStyle = COLORS.counterTop;
    roundRect(ctx, st.x, st.y, st.w, st.h, 14); ctx.fill();
    ctx.strokeStyle = COLORS.counter; ctx.lineWidth = 3; ctx.stroke();
    drawIngredientIcon(ctx, ing.id, st.x + st.w / 2, st.y + 58, 34);
    text(ctx, ing.name, st.x + st.w / 2, st.y + 112, 18, '#fff8e7', '800', 'center');
    text(ctx, `[${ing.key}]${isGrill ? ' · grill' : ''}`, st.x + st.w / 2, st.y + 134, 13, '#f7e8d0', '600', 'center');
  });
  // Grill slots under the patty station.
  board.grillSlots.forEach((slot, i) => {
    const g = world.grill[i];
    ctx.fillStyle = '#3a2f24';
    ctx.beginPath(); ctx.arc(slot.x, slot.y, slot.r, 0, Math.PI * 2); ctx.fill();
    if (g) {
      if (g.state === 'burnt') {
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath(); ctx.arc(slot.x, slot.y, slot.r - 5, 0, Math.PI * 2); ctx.fill();
        text(ctx, 'BURNT', slot.x, slot.y + 42, 12, COLORS.accent, '800', 'center');
      } else if (g.state === 'ready') {
        ctx.fillStyle = '#7bc043';
        ctx.beginPath(); ctx.arc(slot.x, slot.y, slot.r - 5, 0, Math.PI * 2); ctx.fill();
        text(ctx, '✓', slot.x, slot.y + 1, 26, '#fff', '800', 'center');
        text(ctx, 'READY', slot.x, slot.y + 42, 12, COLORS.green, '800', 'center');
      } else {
        const frac = Math.min(1, g.progress / 6);
        ctx.fillStyle = '#c96a2e';
        ctx.beginPath(); ctx.arc(slot.x, slot.y, slot.r - 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(slot.x, slot.y, slot.r - 8, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
        text(ctx, `${Math.ceil(6 - g.progress)}s`, slot.x, slot.y + 1, 14, '#fff', '800', 'center');
      }
    } else {
      text(ctx, 'empty', slot.x, slot.y + 42, 11, '#8a7a68', '600', 'center');
    }
  });

  // Plate.
  ctx.fillStyle = COLORS.plate;
  ctx.beginPath(); ctx.ellipse(640, 620, 220, 64, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#cfc8b8'; ctx.lineWidth = 3; ctx.stroke();
  text(ctx, 'YOUR PLATE', 420, 520, 18, COLORS.muted, '800');
  drawPlateStack(ctx, world.plate, 640, 620, 1);
  const recipe = RECIPES.find((r) => world.plate.length && r.kinds.slice().sort().join(',') === world.plate.slice().sort().join(','));
  if (recipe) text(ctx, `✓ ${recipe.name} — ready to serve!`, 640, 700, 20, COLORS.green, '800', 'center');
  else if (world.plate.length) text(ctx, 'Keep building…', 640, 700, 16, COLORS.muted, '600', 'center');

  // Serve / trash buttons.
  ctx.fillStyle = world.plate.length ? COLORS.green : '#9a938a';
  roundRect(ctx, board.serve.x, board.serve.y, board.serve.w, board.serve.h, 16); ctx.fill();
  text(ctx, 'SERVE', board.serve.x + board.serve.w / 2, board.serve.y + 34, 30, '#fff', '800', 'center');
  text(ctx, '[Space]', board.serve.x + board.serve.w / 2, board.serve.y + 66, 14, '#fff', '600', 'center');
  ctx.fillStyle = '#7a6a58';
  roundRect(ctx, board.trash.x, board.trash.y, board.trash.w, board.trash.h, 12); ctx.fill();
  text(ctx, 'TRASH PLATE  [X]', board.trash.x + board.trash.w / 2, board.trash.y + 28, 16, '#fff', '700', 'center');

  // Hints.
  text(ctx, '1–7 ingredients · Space serve · X trash · P pause · M mute · R restart', 40, 768, 15, '#f7e8d0', '600');

  // Floating score text.
  for (const f of world.floats) {
    ctx.globalAlpha = Math.min(1, f.ttl);
    text(ctx, f.text, f.x, f.y - (1.2 - f.ttl) * 40, 26, f.color, '800', 'center');
    ctx.globalAlpha = 1;
  }
  if (world.flash > 0) {
    ctx.fillStyle = `rgba(245,179,1,${world.flash * 0.25})`;
    ctx.fillRect(0, 0, W, H);
  }

  if (world.screen === SCREENS.TITLE) drawTitle(ctx, world);
  if (world.screen === SCREENS.OVER) drawOver(ctx, world);
}

function drawTitle(ctx, world) {
  ctx.fillStyle = 'rgba(43,33,24,0.82)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'SIZZLE & SERVE', 640, 190, 72, '#ffd23e', '800', 'center');
  text(ctx, 'a tiny diner rush', 640, 250, 26, '#f7e8d0', '600', 'center');
  text(ctx, 'Customers order burgers and sides. Build each dish on your plate,', 640, 330, 22, '#ffffff', '600', 'center');
  text(ctx, 'cook patties on the grill — and serve before their patience runs out!', 640, 362, 22, '#ffffff', '600', 'center');
  text(ctx, 'Click ingredients or press 1–7 · Space to serve · X to trash the plate', 640, 420, 20, '#ffd23e', '700', 'center');
  text(ctx, 'Burnt patties must be tossed. Wrong orders and walk-outs cost hearts.', 640, 452, 20, '#ffd23e', '700', 'center');
  const blink = Math.sin(Date.now() / 300) > 0;
  if (blink) text(ctx, 'CLICK OR PRESS ENTER TO START', 640, 540, 28, '#ffffff', '800', 'center');
  text(ctx, '120-second shifts · combos pay more · 3 hearts', 640, 600, 18, '#f7e8d0', '600', 'center');
}

function drawOver(ctx, world) {
  ctx.fillStyle = 'rgba(43,33,24,0.85)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'SHIFT OVER', 640, 190, 64, '#ffd23e', '800', 'center');
  text(ctx, world.overReason, 640, 250, 22, '#ffffff', '600', 'center');
  text(ctx, `${world.coins} coins`, 640, 330, 44, '#ffffff', '800', 'center');
  text(ctx, `Dishes served: ${world.served}   Best combo: x${Math.max(1, world.bestCombo)}`, 640, 390, 22, '#f7e8d0', '700', 'center');
  const stars = world.coins >= 120 ? '★★★' : world.coins >= 70 ? '★★☆' : world.coins >= 35 ? '★☆☆' : '☆☆☆';
  text(ctx, stars, 640, 450, 40, '#ffd23e', '800', 'center');
  const blink = Math.sin(Date.now() / 300) > 0;
  if (blink) text(ctx, 'PRESS R OR CLICK TO PLAY AGAIN', 640, 540, 26, '#ffffff', '800', 'center');
}
