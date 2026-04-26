#!/usr/bin/env node
/**
 * Parse src/data/trainers.h + src/data/trainer_parties.h pour produire
 * public/decomp/em/trainer-parties.json — débloque les combats dresseurs
 * fonctionnels (avant : PLAYER_TEAM mocké en TS).
 *
 * Format de sortie :
 *   {
 *     "TRAINER_SAWYER_1": {
 *       class: "TRAINER_CLASS_HIKER",
 *       name: "EMILIEN",
 *       doubleBattle: false,
 *       aiFlags: ["AI_SCRIPT_CHECK_BAD_MOVE", ...],
 *       trainerPic: "TRAINER_PIC_HIKER",
 *       items: ["ITEM_X", ...],
 *       partyType: "NoItemDefaultMoves" | "NoItemCustomMoves" | "ItemDefaultMoves" | "ItemCustomMoves",
 *       party: [{ iv, level, species, item?, moves? }]
 *     }
 *   }
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'trainer-parties.json');
mkdirSync(dirname(outPath), { recursive: true });

// ---------- Parties ----------
// `static const struct TrainerMon<TYPE> sParty_<NAME>[] = { ... };`
function parseParties(text) {
  const out = {};
  const blockRe = /static const struct TrainerMon(\w+) (sParty_\w+)\[\] = \{([\s\S]*?)\};/g;
  let m;
  while ((m = blockRe.exec(text)) !== null) {
    const [, type, name, body] = m;
    // Chaque mon = bloc { .iv = X, .lvl = Y, .species = SPECIES_X, [.heldItem = ITEM_X,] [.moves = {MOVE_A, MOVE_B, ...}] }
    const mons = [];
    const monRe = /\{([^{}]*(?:\{[^}]*\})?[^{}]*)\}/g;
    let mm;
    while ((mm = monRe.exec(body)) !== null) {
      const inner = mm[1];
      const iv = (inner.match(/\.iv\s*=\s*(\d+)/) || [])[1];
      const lvl = (inner.match(/\.lvl\s*=\s*(\d+)/) || [])[1];
      const species = (inner.match(/\.species\s*=\s*(\w+)/) || [])[1];
      const heldItem = (inner.match(/\.heldItem\s*=\s*(\w+)/) || [])[1];
      const movesMatch = inner.match(/\.moves\s*=\s*\{([^}]+)\}/);
      const moves = movesMatch ? movesMatch[1].split(',').map(s => s.trim()).filter(Boolean) : null;
      if (!species) continue;
      const mon = { iv: Number(iv) || 0, level: Number(lvl) || 1, species };
      if (heldItem) mon.heldItem = heldItem;
      if (moves) mon.moves = moves;
      mons.push(mon);
    }
    out[name] = { type, mons };
  }
  return out;
}

// ---------- Trainers ----------
// `[TRAINER_X] = { .field = value, ... },`
function parseTrainers(text) {
  const out = {};
  // Split par `[TRAINER_X] = {` puis on prend jusqu'au `},` matching
  const re = /\[(TRAINER_\w+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const [, name, body] = m;
    const get = (re) => (body.match(re) || [])[1];
    const trainerClass = get(/\.trainerClass\s*=\s*(\w+)/);
    const trainerPic = get(/\.trainerPic\s*=\s*(\w+)/);
    const trainerName = (body.match(/\.trainerName\s*=\s*_\("([^"]*)"\)/) || [])[1] || '';
    const doubleBattle = /\.doubleBattle\s*=\s*TRUE/.test(body);
    const encounterMusic = get(/\.encounterMusic_gender\s*=\s*(\w+)/);
    const aiRaw = (body.match(/\.aiFlags\s*=\s*([^,\n]+)/) || [])[1] || '';
    const aiFlags = aiRaw.split('|').map(s => s.trim()).filter(s => s && s !== '0');
    const itemsRaw = (body.match(/\.items\s*=\s*\{([^}]*)\}/) || [])[1] || '';
    const items = itemsRaw.split(',').map(s => s.trim()).filter(s => s && s !== 'ITEM_NONE');
    // .party = TYPE(sParty_X) — TYPE ∈ {NO_ITEM_DEFAULT_MOVES, NO_ITEM_CUSTOM_MOVES, ITEM_DEFAULT_MOVES, ITEM_CUSTOM_MOVES}
    const partyMatch = body.match(/\.party\s*=\s*(\w+)\s*\(\s*(sParty_\w+)\s*\)/);
    const partyType = partyMatch ? partyMatch[1] : null;
    const partyName = partyMatch ? partyMatch[2] : null;
    out[name] = { trainerClass, trainerPic, name: trainerName, doubleBattle, encounterMusic, aiFlags, items, partyType, partyName };
  }
  return out;
}

const trainersTxt = readFileSync(join(decompPath, 'src', 'data', 'trainers.h'), 'utf8');
const partiesTxt = readFileSync(join(decompPath, 'src', 'data', 'trainer_parties.h'), 'utf8');
const trainers = parseTrainers(trainersTxt);
const parties = parseParties(partiesTxt);

// Join : pour chaque trainer, attache sa party
let withParty = 0;
for (const [tname, t] of Object.entries(trainers)) {
  if (t.partyName && parties[t.partyName]) {
    t.party = parties[t.partyName].mons;
    withParty++;
  } else {
    t.party = [];
  }
  delete t.partyName;
}

writeFileSync(outPath, JSON.stringify(trainers));
console.log('[trainer-parties]', {
  trainers: Object.keys(trainers).length,
  parties: Object.keys(parties).length,
  joined: withParty,
  output: outPath
});
