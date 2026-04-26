#!/usr/bin/env node
/**
 * Extrait les scripts item ball / hidden item du décomp pour exécution runtime.
 *
 * Source : `data/scripts/item_ball_scripts.inc` (~250 item balls Hoenn)
 *   format type :
 *     Route102_EventScript_ItemPotion::
 *         finditem ITEM_POTION
 *         end
 *
 * Variants possibles :
 *     finditem ITEM_X                  → 1 unit, visible
 *     finditem ITEM_X, N               → N units, visible
 *     finditem ITEM_X, N, FLAG_Y       → N units avec flag spécifique
 *     finditem_underfoot ITEM_X        → hidden item (dowsing)
 *
 * Sortie : `public/decomp/em/item-balls.json` :
 *   {
 *     "Route102_EventScript_ItemPotion": { "item": "ITEM_POTION", "quantity": 1, "hidden": false }
 *   }
 *
 * Cf. AUTOMATION_BACKLOG (audit session 38) + MAP_MECHANICS_REFERENCE §2.3.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outDirSrc = join(projectRoot, 'src', 'decomp', 'em');
const outDirPub = join(projectRoot, 'public', 'decomp', 'em');
mkdirSync(outDirSrc, { recursive: true });
mkdirSync(outDirPub, { recursive: true });

const itemBalls = {};

function parseFile(path) {
  const text = readFileSync(path, 'utf8');
  const lines = text.split('\n');
  let currentLabel = null;
  for (const rawLine of lines) {
    const line = rawLine.replace(/@.*$/, '').trim(); // strip asm comments
    // Label : `Foo::`
    const labelMatch = line.match(/^(\w+)::?\s*$/);
    if (labelMatch) {
      currentLabel = labelMatch[1];
      continue;
    }
    if (!currentLabel) continue;
    // finditem variants
    const findMatch = line.match(/^find(item|item_underfoot)\s+(ITEM_\w+)(?:\s*,\s*(\d+))?/);
    if (findMatch) {
      const hidden = findMatch[1] === 'item_underfoot';
      const item = findMatch[2];
      const quantity = findMatch[3] ? parseInt(findMatch[3], 10) : 1;
      itemBalls[currentLabel] = { item, quantity, hidden };
    }
  }
}

// 1. Parser item_ball_scripts.inc principal
parseFile(join(decompPath, 'data', 'scripts', 'item_ball_scripts.inc'));

// 2. Scanner les scripts.inc des maps pour items inline (rares)
const mapsDir = join(decompPath, 'data', 'maps');
for (const mapName of readdirSync(mapsDir)) {
  const scriptsPath = join(mapsDir, mapName, 'scripts.inc');
  try {
    if (statSync(scriptsPath).isFile()) parseFile(scriptsPath);
  } catch { /* pas de scripts.inc */ }
}

const json = JSON.stringify(itemBalls, null, 0);
writeFileSync(join(outDirSrc, 'item-balls.json'), json);
writeFileSync(join(outDirPub, 'item-balls.json'), json);

// Stats
const items = {};
for (const v of Object.values(itemBalls)) {
  items[v.item] = (items[v.item] || 0) + 1;
}
const visible = Object.values(itemBalls).filter(v => !v.hidden).length;
const hidden = Object.values(itemBalls).filter(v => v.hidden).length;
console.log(`[item-balls] ${Object.keys(itemBalls).length} item scripts (${visible} visible + ${hidden} hidden)`);
console.log(`Top 5 items :`);
const top = Object.entries(items).sort((a, b) => b[1] - a[1]).slice(0, 5);
for (const [item, count] of top) console.log(`  ${item.padEnd(28)} ×${count}`);
