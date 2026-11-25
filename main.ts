// Master Chef 3D — the hand-in program (Node 22, standard library only).
// It copies the game and its screenshots from beside this file into
// /output, then writes /output/dossier.json, the summary the judge reads,
// using the vendored make.fun library. Outside the grader, the environment
// variable MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The game itself is a stationary 3D cooking station (React + Three.js,
// built to static files under game/): the chef stays at one spot behind
// the counter and every action is a tap — tap the ingredient trays to
// take exactly what the customer ordered (a wrong pick shakes red and is
// refused), tap the pan to cook, tap SERVE to send the plate out to the
// customer at the serving window — against a 120-second shift timer.
// Cooking is visible: food appears in the pan on the stove with steam and
// a live progress label, taken ingredients stack on the prep board, and
// the finished plate waits on the serving ledge. On phones the game is
// fully touch-playable (tap to pick/cook/serve, drag a little to look
// around, pinch to zoom); on desktop keys 1-6 pick and Space cooks or
// serves. game/assets/app.min.js is the vendored build; game/index.html
// and game/src/shots.js are the hand-in's own files.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The same caps the gate scores against: at most 4 screenshots, each at
// most 256 KiB; game/ at most 993 files and 48 MiB, paths at most 1000 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
