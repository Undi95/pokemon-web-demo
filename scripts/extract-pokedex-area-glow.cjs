// Extrait sAreaGlowTilemapMapping (src/data/pokedex_area_glow.h décomp) en table
// TS de 256 u8 : évalue les designated initializers avec les constantes GLOW_*.
const fs = require('fs');
const SRC = 'D:/Projet 1/decomps/pokeemeraude/src/data/pokedex_area_glow.h';
const OUT = 'D:/Projet 1/pokemon-web-demo/src/data/pokedex_area_glow.ts';
const t = fs.readFileSync(SRC, 'utf8');

// L'enum GLOW_TILE_* (ordre = valeur).
const enumBody = t.match(/enum \{([\s\S]*?)\};/)[1];
const tileNames = enumBody.split(',').map(s => s.replace(/\/\/.*$/gm, '').trim()).filter(Boolean);
const TILE = {};
tileNames.forEach((n, i) => { TILE[n] = i; });

// Les flags (pokedex_area_screen.c).
const F = {
  GLOW_EDGE_R: 1 << 0, GLOW_EDGE_L: 1 << 1, GLOW_EDGE_B: 1 << 2, GLOW_EDGE_T: 1 << 3,
  GLOW_CORNER_TL: 1 << 4, GLOW_CORNER_BL: 1 << 5, GLOW_CORNER_TR: 1 << 6, GLOW_CORNER_BR: 1 << 7,
};

// Les entrées [EXPR] = VALUE,
const table = new Array(256).fill(0);
const re = /\[([^\]]+)\]\s*=\s*(GLOW_TILE_\w+)/g;
let m, count = 0;
const body = t.slice(t.indexOf('sAreaGlowTilemapMapping'));
while ((m = re.exec(body)) !== null) {
  const idx = m[1].split('|').map(s => s.trim()).reduce((a, name) => {
    if (name === '0') return a;
    if (!(name in F)) throw new Error('flag inconnu: ' + name);
    return a | F[name];
  }, 0);
  if (!(m[2] in TILE)) throw new Error('tile inconnue: ' + m[2]);
  table[idx] = TILE[m[2]];
  count++;
}

const GLOW_TILE_FULL = TILE.GLOW_TILE_FULL;
const out = `// GÉNÉRÉ par scripts/extract-pokedex-area-glow.cjs — 1:1 décomp
// src/data/pokedex_area_glow.h (sAreaGlowTilemapMapping, ${count} entrées
// explicites → table[flags] = tile id dans graphics/pokedex/area_glow.png).
// NE PAS ÉDITER À LA MAIN — relancer le script.

export const GLOW_TILE_FULL = ${GLOW_TILE_FULL};

export const sAreaGlowTilemapMapping: readonly number[] = [
${Array.from({ length: 16 }, (_, r) => '  ' + table.slice(r * 16, r * 16 + 16).join(', ') + ',').join('\n')}
];
`;
fs.writeFileSync(OUT, out);
console.log(count, 'entrées →', OUT, '· GLOW_TILE_FULL =', GLOW_TILE_FULL);
