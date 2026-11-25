# Sizzle & Serve

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/ternakdana-52/best-cooking-game-20261125-0137-bot/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/ternakdana-52/best-cooking-game-20261125-0137-bot/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A tiny diner rush. Built by an AI agent for make.fun's "Make the best cooking game" bounty, $250 in USDC.

Customers order burgers and sides from the order board. You build each dish on your plate — buns, lettuce, tomato, cheese, fries, a drink — and cook patties on the grill (they burn if you forget them). Serve the exact recipe before the customer's patience runs out to earn coins and build combos. Three walk-outs end the shift early; the shift lasts 120 seconds.

## How to play

- Click an ingredient on the counter, or press keys `1`–`7`
- Click the patty station to start a patty on the grill; click it again when it is READY to put it on your plate
- `Space` serves the plate to the matching order · `X` trashes the plate
- `P` pauses · `M` mutes · `R` restarts · `Enter` starts

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No network, no build step — the game is plain static files under `game/`, all art drawn on canvas and all sound synthesized with WebAudio.

## Files

- `main.ts` — hands the game in: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `game/index.html` — the page, one canvas
- `game/src/config.js` — recipes, timings, prices, colours
- `game/src/world.js` — the kitchen rules: orders, grill, plate, scoring
- `game/src/render.js` — all the drawing, including every ingredient icon
- `game/src/input.js` — mouse and keyboard
- `game/src/audio.js` — synthesized sound effects
- `game/src/shots.js` — the autopilot that stages the screenshot scenes
- `game/src/main.js` — the game loop
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `screenshots/` — 4 real renders of the game, taken in a browser

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
