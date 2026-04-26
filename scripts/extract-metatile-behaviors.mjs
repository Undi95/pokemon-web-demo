#!/usr/bin/env node
/**
 * Extrait les 240 metatile behaviors (MB_*) du décomp pour driver `tilemap-loader.ts`.
 *
 * Source : `include/constants/metatile_behaviors.h` enum séquentiel.
 *   enum { MB_NORMAL, MB_SECRET_BASE_WALL, MB_TALL_GRASS, ... };
 * → MB_NORMAL = 0x00, MB_SECRET_BASE_WALL = 0x01, MB_TALL_GRASS = 0x02, etc.
 *
 * Catégorisation par patterns dans le nom (heuristique, à enrichir si besoin) :
 *   - `_DOOR$|_DOOR_/` → warp.door
 *   - `_LADDER|_ESCALATOR|_WARP|_HOLE` → warp.transport
 *   - `_ARROW_WARP$` → warp.arrow
 *   - `_GRASS$` → terrain.grass (encounter)
 *   - `_WATER|_POND|_OCEAN|_PUDDLE|_WATERFALL` → terrain.water
 *   - `_SAND|_SEAWEED|_ASHGRASS|_ICE` → terrain.special
 *   - `^MB_JUMP_` → ledge.jump
 *   - `^MB_WALK_|^MB_SLIDE_` → ledge.walk
 *   - `^MB_BRIDGE_|_LOG_|_FORTREE_BRIDGE` → bridge
 *   - `_PC$|TELEVISION|BOOKSHELF|COUNTER|FEEDER|SLOT_MACHINE` → interactive
 *   - `_SECRET_BASE_` → secret_base
 *   - `IMPASSABLE` → collision.impassable
 *   - `_NORMAL$|UNUSED` → collision.passable
 *
 * Sortie : `public/decomp/em/metatile-behaviors.json` :
 *   { "0x00": {"name": "MB_NORMAL", "category": "collision", "subtype": "passable"}, ... }
 *
 * Cf. AUTOMATION_BACKLOG #2 (audit session 38) + MAP_MECHANICS_REFERENCE §2.5.
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

const text = readFileSync(join(decompPath, 'include', 'constants', 'metatile_behaviors.h'), 'utf8');

// Parse l'enum : capture chaque ligne MB_NAME(,? // commentaire)?
const m = text.match(/enum\s*\{([^}]+)\}/);
if (!m) {
  console.error('[metatile-behaviors] enum introuvable');
  process.exit(1);
}
const lines = m[1].split('\n');

// Catégorisation par pattern (ordre = priorité, premier match gagne)
function categorize(name) {
  // Warps : doors / arrow / transport
  if (/_DOOR(_|$)/.test(name)) return { category: 'warp', subtype: 'door' };
  if (/_ARROW_WARP$/.test(name)) return { category: 'warp', subtype: 'arrow' };
  if (/_LADDER$|_ESCALATOR$|_WARP$|_HOLE$/.test(name)) return { category: 'warp', subtype: 'transport' };
  // Terrain
  if (/_TALL_GRASS$|_LONG_GRASS|_SHORT_GRASS$|_ASHGRASS$/.test(name)) return { category: 'terrain', subtype: 'grass', encounter: true };
  if (/_DEEP_WATER|_OCEAN_WATER|_POND_WATER|_SHALLOW_WATER|_INTERIOR_DEEP_WATER|_SOOTOPOLIS_DEEP_WATER/.test(name)) return { category: 'terrain', subtype: 'water', surfable: true };
  if (/_PUDDLE$|_WATERFALL$|_SHOAL_CAVE_ENTRANCE$/.test(name)) return { category: 'terrain', subtype: 'water', surfable: false };
  if (/_DEEP_SAND$|^MB_SAND$|_FOOTPRINTS$/.test(name)) return { category: 'terrain', subtype: 'sand' };
  if (/_ICE$|_THIN_ICE$|_CRACKED_ICE$|_HOT_SPRINGS$/.test(name)) return { category: 'terrain', subtype: 'special' };
  if (/^MB_CAVE$|^MB_MOUNTAIN_TOP$|_INDOOR_ENCOUNTER$/.test(name)) return { category: 'terrain', subtype: 'cave' };
  if (/_SEAWEED/.test(name)) return { category: 'terrain', subtype: 'seaweed' };
  // Ledges (saute par-dessus)
  if (/^MB_JUMP_/.test(name)) return { category: 'ledge', subtype: 'jump' };
  if (/^MB_WALK_/.test(name)) return { category: 'ledge', subtype: 'walk' };
  if (/^MB_SLIDE_/.test(name)) return { category: 'ledge', subtype: 'slide' };
  // Bridges
  if (/^MB_BRIDGE_|_LOG_VERTICAL|_LOG_HORIZONTAL|_FORTREE_BRIDGE/.test(name)) return { category: 'bridge', subtype: 'plain' };
  // Interactifs
  if (/_PC$|_TELEVISION$|_POKEMART_SIGN$|_POKEMON_CENTER_SIGN$/.test(name)) return { category: 'interactive', subtype: 'screen' };
  if (/_BOOKSHELF$|_COUNTER$|_PLAYER_ROOM_PC_ON$|_QUESTIONNAIRE$|_MART_SHELF$|_CABINET$|_TRASH_CAN$|_FRIDGE$|_SINK$|_CALENDAR$|_BLUEPRINT$/.test(name)) return { category: 'interactive', subtype: 'furniture' };
  if (/_POKEBLOCK_FEEDER$|_SLOT_MACHINE$|_ROULETTE$|_WIRELESS_BOX_RESULTS$/.test(name)) return { category: 'interactive', subtype: 'machine' };
  if (/_BERRY_TREE_SOIL$|_REGION_MAP$|_RUNNING_SHOES_INSTRUCTION$|_PICTURE_BOOK_SHELF$/.test(name)) return { category: 'interactive', subtype: 'misc' };
  // Secret bases
  if (/_SECRET_BASE_/.test(name)) return { category: 'secret_base', subtype: 'block' };
  // Collision
  if (/IMPASSABLE/.test(name)) return { category: 'collision', subtype: 'impassable' };
  if (/^MB_NORMAL$/.test(name)) return { category: 'collision', subtype: 'passable' };
  // Special / unused / unknown
  if (/^MB_UNUSED_/.test(name)) return { category: 'unused', subtype: 'unused' };
  return { category: 'other', subtype: 'unknown' };
}

const behaviors = {};
let idx = 0;
let parsed = 0;
for (const rawLine of lines) {
  const line = rawLine.replace(/\/\/.*$/, '').trim();
  if (!line) continue;
  // Match MB_NAME, optional explicit value =N (rare), trailing comma
  const lm = line.match(/^(MB_\w+)\s*(?:=\s*(0x[0-9a-fA-F]+|\d+))?\s*,?$/);
  if (!lm) continue;
  const name = lm[1];
  if (lm[2]) {
    idx = lm[2].startsWith('0x') ? parseInt(lm[2], 16) : parseInt(lm[2], 10);
  }
  const hex = '0x' + idx.toString(16).padStart(2, '0').toUpperCase();
  behaviors[hex] = { name, value: idx, ...categorize(name) };
  idx++;
  parsed++;
}

const json = JSON.stringify(behaviors, null, 0);
writeFileSync(join(outDirSrc, 'metatile-behaviors.json'), json);
writeFileSync(join(outDirPub, 'metatile-behaviors.json'), json);

// Stats par catégorie
const stats = {};
for (const b of Object.values(behaviors)) {
  const k = `${b.category}/${b.subtype}`;
  stats[k] = (stats[k] || 0) + 1;
}
console.log(`[metatile-behaviors] ${parsed} entries parsed`);
console.log('Distribution :');
for (const [k, v] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(30)} ${v}`);
}
