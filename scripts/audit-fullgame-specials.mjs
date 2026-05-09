#!/usr/bin/env node
// Full main-story specials audit.
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SCRIPTS_DIR = 'public/decomp/em/scripts';
const SPECIALS_FILE = 'src/engine/specials-registry.ts';

const POSTGAME_PATTERNS = [
  /^BattleFrontier/,
  /^Battle(?:Pyramid|Pike|Tower|Dome|Arena|Factory|Palace)/,
  /^TrainerHill/,
  /^MossdeepCity_(SpaceCenter|Steven)/,
  /^MtChimney/, /^MagmaHideout/, /^AquaHideout/,
  /^SkyPillar/, /^Sootopolis/, /^EverGrandeCity/,
  /^EliteFour/, /^PokemonLeague/, /^HallOfFame/,
  /^SealedChamber/, /^DesertRuins/, /^MarineCave/,
  /^TerraCave/, /^IslandCave/, /^AncientTomb/, /^MirageTower/,
  /^SafariZone/, /^Underwater/, /^Mossdeep/, /^Pacifidlog/,
  /^MtPyre/, /^ShoalCave/, /^SeafloorCavern/,
  /^FortreeCity/, /^LilycoveCity/, /^Slateport/,
  /^MauvilleCity_GameCorner/, /^MauvilleCity_/, /^MauvilleCity\.json/,
  /^VerdanturfTown/, /^FallarborTown/,
  /^Route1[1-9][0-9]/, /^Route1[1-9][a-z]/, /^Route2[0-9]/, /^Route1[0-9][0-9]/,
  /^DewfordTown/, /^Faraway/, /^BirthIsland/, /^NavelRock/, /^SouthernIsland/,
  /^NewMauville/, /^InsideOfTruck/, /^MeteorFalls/, /^GraniteCave/,
  /^JaggedPass/, /^FieryPath/, /^Cycling/, /^InsideShip/,
  /^AbandonedShip/, /^ArtisanCave/,
];

const isPostGame = (name) => POSTGAME_PATTERNS.some(p => p.test(name));

const counts = new Map();
const files = readdirSync(SCRIPTS_DIR);
let mapsScanned = 0;
for (const f of files) {
  if (!f.endsWith('.json')) continue;
  const name = f.replace(/\.json$/, '');
  if (isPostGame(name)) continue;
  if (['_all', '_common', 'battle_anim_scripts'].includes(name)) continue;
  mapsScanned++;
  try {
    const j = JSON.parse(readFileSync(join(SCRIPTS_DIR, f), 'utf8'));
    if (!j.scripts) continue;
    for (const [_n, instrs] of Object.entries(j.scripts)) {
      if (!Array.isArray(instrs)) continue;
      for (const line of instrs) {
        if (typeof line !== 'string') continue;
        const parts = line.split(/\s+/);
        if (parts[0] === 'special' && parts[1]) {
          counts.set(parts[1].replace(/,$/, ''), (counts.get(parts[1].replace(/,$/, '')) || 0) + 1);
        } else if (parts[0] === 'specialvar' && parts[2]) {
          const sname = parts[2].replace(/,$/, '');
          counts.set(sname, (counts.get(sname) || 0) + 1);
        }
      }
    }
  } catch {}
}

const src = readFileSync(SPECIALS_FILE, 'utf8');
const re = /registerSpecial\(['"]([^'"]+)['"]/g;
const registered = new Set();
let m;
while ((m = re.exec(src))) registered.add(m[1]);

const missing = [];
for (const [op, n] of counts.entries()) {
  if (registered.has(op)) continue;
  missing.push([op, n]);
}
missing.sort((a, b) => b[1] - a[1]);

console.log(`=== Missing specials in MAIN-STORY (${mapsScanned} maps) ===`);
console.log(`Registered : ${registered.size} | Used : ${counts.size} | Missing : ${missing.length}`);
console.log();
for (const [op, n] of missing.slice(0, 40)) {
  console.log(`  ${n.toString().padStart(4)}  ${op}`);
}
