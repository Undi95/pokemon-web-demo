#!/usr/bin/env node
/**
 * Extrait le flag `inanimate` de chaque OBJ_EVENT_GFX_* du décomp.
 *
 * Sources :
 *   1. `src/data/object_events/object_event_graphics_info_pointers.h` :
 *      `[OBJ_EVENT_GFX_BIRCHS_BAG] = &gObjectEventGraphicsInfo_BirchsBag,`
 *   2. `src/data/object_events/object_event_graphics_info.h` :
 *      `const struct ObjectEventGraphicsInfo gObjectEventGraphicsInfo_BirchsBag = {
 *           ... .inanimate = TRUE, ... };`
 *
 * Compose les 2 → mapping OBJ_EVENT_GFX_X → boolean.
 *
 * Pourquoi : pour les NPCs `inanimate=TRUE` (sac de Birch, item ball, pierres,
 * panneaux, etc.), le décomp skip les actions de movement (LOOK_AROUND,
 * ROTATE_*, WANDER_*) dans `MovementType_*` du décomp. Notre code doit faire
 * pareil sinon ces objets "regardent" autour d'eux comme des NPCs animés.
 *
 * Sortie : `public/decomp/em/inanimate-graphics.json` :
 *   { "OBJ_EVENT_GFX_BIRCHS_BAG": true, "OBJ_EVENT_GFX_YOUNGSTER": false, ... }
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outDirSrc = join(projectRoot, 'src', 'decomp', 'em');
const outDirPub = join(projectRoot, 'public', 'decomp', 'em');
mkdirSync(outDirSrc, { recursive: true });
mkdirSync(outDirPub, { recursive: true });

// 1. Parse pointers : [OBJ_EVENT_GFX_X] = &gObjectEventGraphicsInfo_Y,
const pointersFile = join(decompPath, 'src', 'data', 'object_events', 'object_event_graphics_info_pointers.h');
const pointersText = readFileSync(pointersFile, 'utf8');
const pointerRegex = /\[(OBJ_EVENT_GFX_\w+)\]\s*=\s*&gObjectEventGraphicsInfo_(\w+)/g;
const gfxToInfoName = {};
let m;
while ((m = pointerRegex.exec(pointersText)) !== null) {
  gfxToInfoName[m[1]] = m[2];
}

// 2. Parse info structs : gObjectEventGraphicsInfo_Y = { ... .inanimate = TRUE/FALSE, ... };
const infoFile = join(decompPath, 'src', 'data', 'object_events', 'object_event_graphics_info.h');
const infoText = readFileSync(infoFile, 'utf8');
// Match: const struct ObjectEventGraphicsInfo gObjectEventGraphicsInfo_X = { ... };
const structRegex = /gObjectEventGraphicsInfo_(\w+)\s*=\s*\{([^}]+)\}/g;
const infoNameToInanimate = {};
while ((m = structRegex.exec(infoText)) !== null) {
  const infoName = m[1];
  const body = m[2];
  const inanimateMatch = body.match(/\.inanimate\s*=\s*(TRUE|FALSE)/);
  if (inanimateMatch) {
    infoNameToInanimate[infoName] = inanimateMatch[1] === 'TRUE';
  }
}

// 3. Compose
const out = {};
let countInanimate = 0;
let countAnimated = 0;
let countMissing = 0;
for (const [gfxId, infoName] of Object.entries(gfxToInfoName)) {
  if (!(infoName in infoNameToInanimate)) {
    countMissing++;
    continue;
  }
  out[gfxId] = infoNameToInanimate[infoName];
  if (out[gfxId]) countInanimate++;
  else countAnimated++;
}

// Tri alphabétique pour diff propre
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));

const json = JSON.stringify(sorted, null, 2);
writeFileSync(join(outDirSrc, 'inanimate-graphics.json'), json);
writeFileSync(join(outDirPub, 'inanimate-graphics.json'), json);

console.log(`[extract-inanimate] ${Object.keys(sorted).length} graphics mappés (${countInanimate} inanimate, ${countAnimated} animés, ${countMissing} skip sans struct)`);
console.log(`  → ${outDirSrc}/inanimate-graphics.json`);
console.log(`  → ${outDirPub}/inanimate-graphics.json`);
