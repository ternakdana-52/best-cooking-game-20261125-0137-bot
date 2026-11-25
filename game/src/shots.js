// shots.js — screenshot stager for Master Chef 3D (stationary station).
//
// Inert during normal play: it only acts when the page URL carries
// ?shot=<scene>. Then it waits for the 3D game to mount, starts the shift,
// and drives the game through its own tap handlers (the exact functions a
// player's tap calls), so the requested scene is staged exactly. It sets
// window.__shotDone when the scene is ready for its screenshot, or
// window.__shotError if staging fails.
//
// Scenes:
//   board    — fresh station: counter with ingredient trays, order board,
//              customer at the serving window, timer at 02:00
//   assembly — ingredients picked, dish visibly cooking in the pan
//   serve    — dish cooked, plated dish on the serving ledge, ready to serve
//   timer    — mid-shift with the countdown timer ticking

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(fn, timeout = 90000) {
  const start = Date.now();
  for (;;) {
    const value = fn();
    if (value) return value;
    if (Date.now() - start > timeout) throw new Error('timed out waiting for the game');
    await sleep(100);
  }
}

async function startShift() {
  await waitFor(() => document.querySelector('.viewport canvas'));
  await waitFor(() => window.__chefGame && window.__chefGame.current);
  const button = document.querySelector('.start-card .primary-button');
  if (button) button.click();
  await sleep(600);
}

// The current order's ingredients, read live from the side panel.
function orderTargets() {
  const byName = { 'Burger bun': 'bun', Lettuce: 'lettuce', 'Beef patty': 'patty', Pasta: 'pasta', Tomato: 'tomato', Cheese: 'cheese' };
  const names = [...document.querySelectorAll('.ingredient-list .ingredient')]
    .map((el) => el.textContent.trim().replace(/[✓—]/g, '').trim())
    .filter(Boolean);
  const targets = names.map((n) => byName[n]).filter(Boolean);
  return targets.length ? targets : ['bun', 'lettuce', 'patty'];
}

async function collectOrder() {
  const game = window.__chefGame.current;
  for (const id of orderTargets()) {
    game.tapIngredient(id);
    await sleep(250);
  }
}

const SCENES = {
  async board() {
    await startShift();
  },
  async assembly() {
    await startShift();
    await collectOrder();
    window.__chefGame.current.tapPan();
    // Wait until the cook meter is about a third full (headless rendering
    // runs the game's timers slower than a desktop browser, so poll the
    // meter instead of sleeping a fixed time).
    await waitFor(() => {
      const el = document.querySelector('.cook-meter b');
      return el && parseInt(el.textContent, 10) >= 30;
    });
  },
  async serve() {
    await startShift();
    await collectOrder();
    window.__chefGame.current.tapPan();
    // Wait until the dish is cooked before staging the serve scene.
    await waitFor(() => (document.querySelector('.message-box p')?.textContent || '').includes('is ready!'));
    await sleep(400);
  },
  async timer() {
    await startShift();
    await collectOrder();
    await sleep(4000); // let the shift timer tick down visibly
  },
};

const scene = new URLSearchParams(location.search).get('shot');
if (scene && SCENES[scene]) {
  SCENES[scene]()
    .then(() => {
      window.__shotDone = true;
    })
    .catch((error) => {
      window.__shotError = String((error && error.message) || error);
    });
}
