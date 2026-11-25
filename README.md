# Master Chef 3D — Kitchen Career

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/ternakdana-52/best-cooking-game-20261125-0137-bot/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/ternakdana-52/best-cooking-game-20261125-0137-bot/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A stationary 3D cooking game. Built for make.fun's "Make the best cooking game" bounty, $250 in USDC.

You are the chef of a small restaurant, working one fixed station behind the counter. Tap the ingredient trays to take exactly what the customer ordered, tap the pan to cook it, and tap SERVE to send the plate out to the customer at the serving window — all before the 120-second shift timer runs out. Serve dishes to earn cash and level up; a new customer is always waiting.

## How to play

- Tap / click an ingredient tray — take what the customer ordered (the ORDER BOARD shows it). A wrong ingredient shakes red and is refused.
- Tap / click the pan — cook the dish once all its ingredients are on the prep board
- Tap SERVE (or the plate at the window) — send the finished dish to the customer
- Drag a little to look around · mouse wheel / pinch — zoom
- On desktop: keys `1`–`6` pick ingredients, `Space` cooks or serves
- On phones: everything is a tap

Cooking is visible: the food appears in the pan on the stove with steam and a live "COOKING %" label, taken ingredients stack on the prep board, and the finished plate — stacked like real food — waits on the serving ledge for the customer.

## Provenance

The 3D game source was supplied by the entrant (from their uploaded `master-chef-3d.zip`) and integrated by the agent: the agent removed the Google Fonts import so the game makes zero network requests, added the 120-second shift timer and the order-board heading, added the screenshot-staging driver, built the game to static files, and wrote the hand-in program and this entry around it. In the second rebuild the agent added the visible cooking (food in the pan, steam, live progress label, carry tray, finished plate, ingredient props on the counters), the tap-to-walk station interaction with highlighted markers, and the full phone controls (virtual joystick, touch camera, pinch zoom, USE button). In the third rebuild the agent reworked the game into a stationary station at the entrant's request: the chef stays in one place, ingredients are taken by tapping the trays (validated against the customer order, wrong picks refused with a red shake), the pan cooks visibly, and the finished plate is served to a customer at the window; the visuals were made more realistic with warm lighting, wood and marble textures, and detailed food meshes. The kitchen, chef, station and recipes are procedurally built from Three.js geometry — no downloaded models, no network at run time.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No network, no build step at run time — the game is plain static files under `game/`.

## Files

- `main.ts` — hands the game in: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `game/index.html` — the page, mounts the 3D game
- `game/assets/app.min.js` — the vendored production build (React + Three.js + the game)
- `game/assets/app.min.css` — the vendored stylesheet (web fonts removed)
- `game/src/shots.js` — stages the screenshot scenes (?shot=board|assembly|serve|timer); inert in normal play
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `screenshots/` — 4 real renders of the game, taken in a browser

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
