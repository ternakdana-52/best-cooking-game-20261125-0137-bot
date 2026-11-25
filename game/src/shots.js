// shots.js — screenshot stager for Master Chef 3D.
//
// Inert during normal play: it only acts when the page URL carries
// ?shot=<scene>. Then it waits for the 3D game to mount, starts the shift,
// and drives the chef with real key events and teleports so the requested
// scene is staged exactly. It sets window.__shotDone when the scene is
// ready for its screenshot, or window.__shotError if staging fails.
//
// Scenes:
//   board    — fresh kitchen, order board, timer at 02:00
//   assembly — ingredients collected and prepared, dish mid-cooking
//   serve    — dish cooked, chef at the serving counter, ready to serve
//   timer    — mid-shift with the countdown timer ticking

const STATIONS = {
  fridge: [-8, -4.2],
  prep: [-5.3, -0.2],
  stove: [5.1, -3.5],
  serve: [0, 2.2],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(fn, timeout = 15000) {
  const start = Date.now();
  for (;;) {
    const value = fn();
    if (value) return value;
    if (Date.now() - start > timeout) throw new Error('timed out waiting for the game');
    await sleep(100);
  }
}

function pressE() {
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', bubbles: true }));
}

function teleport([x, z]) {
  const game = window.__chefGame;
  if (!game || !game.current || !game.current.chef) throw new Error('chef not mounted');
  game.current.chef.position.set(x, 0, z);
}

async function goTo(name) {
  teleport(STATIONS[name]);
  // Let the nearest-station detection and the camera settle.
  await sleep(900);
}

async function interact() {
  pressE();
  await sleep(400);
}

async function startShift() {
  await waitFor(() => document.querySelector('.viewport canvas'));
  await waitFor(() => window.__chefGame && window.__chefGame.current);
  const button = document.querySelector('.start-card .primary-button');
  if (button) button.click();
  await sleep(600);
}

const SCENES = {
  async board() {
    await startShift();
  },
  async assembly() {
    await startShift();
    await goTo('fridge');
    await interact(); // collect ingredients
    await goTo('prep');
    await interact(); // prepare ingredients
    await goTo('stove');
    await interact(); // start cooking
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
    await goTo('fridge');
    await interact();
    await goTo('prep');
    await interact();
    await goTo('stove');
    await interact();
    // Wait until the dish is cooked before walking to the counter.
    await waitFor(() => (document.querySelector('.message-box p')?.textContent || '').includes('is ready!'));
    await goTo('serve');
  },
  async timer() {
    await startShift();
    await goTo('fridge');
    await interact();
    await goTo('prep');
    await interact();
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
