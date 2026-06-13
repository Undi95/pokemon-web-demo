// Génère src/engine/decomp-data/include/constants/berry-data.ts 1:1 depuis berry.h.
const fs = require('fs');
const SRC = 'D:/Projet 1/decomps/pokeemeraude/include/constants/berry.h';
const OUT = 'D:/Projet 1/pokemon-web-demo/src/engine/decomp-data/include/constants/berry-data.ts';

const h = fs.readFileSync(SRC, 'utf8');
const defRe = /^#define\s+(BERRY_TREE_ROUTE_[A-Z0-9_]+|BERRY_STAGE_[A-Z_]+|BERRY_TREES_COUNT|FIRST_BERRY_INDEX|LAST_BERRY_INDEX)\s+(\d+)/;

const stages = [], trees = [], misc = [];
for (const line of h.split(/\r?\n/)) {
  const m = line.match(defRe);
  if (!m) continue;
  const [, name, val] = m;
  if (name.startsWith('BERRY_TREE_ROUTE_')) trees.push([name, val]);
  else if (name.startsWith('BERRY_STAGE_')) stages.push([name, val]);
  else misc.push([name, val]);
}

let out = '';
out += '// Porté 1:1 (à la main via scripts/gen-berry-constants.cjs) depuis :\n';
out += '//   D:/Projet 1/decomps/pokeemeraude/include/constants/berry.h\n';
out += '// Constantes des terrains de baies (BERRY_TREE_ROUTE_*) + stades de croissance.\n';
out += '// Re-générer : node scripts/gen-berry-constants.cjs\n\n';

out += '// ─── Stades de croissance (BERRY_STAGE_*) ───────────────────────────────────\n';
for (const [n, v] of stages) out += `export const ${n} = ${v};\n`;
out += '\n// ─── Divers ─────────────────────────────────────────────────────────────────\n';
for (const [n, v] of misc) out += `export const ${n} = ${v};\n`;

out += '\n// ─── IDs des terrains de baies (BERRY_TREE_ROUTE_*) ─────────────────────────\n';
for (const [n, v] of trees) out += `export const ${n} = ${v};\n`;

out += '\n/** Lookup nom de constante → id (= résolution `trainer_sight_or_berry_tree_id`\n';
out += ' *  des object-events berry tree + setberrytree). */\n';
out += 'export const BERRY_TREE_ID_BY_NAME: Readonly<Record<string, number>> = {\n';
for (const [n, v] of trees) out += `  ${n}: ${v},\n`;
out += '};\n';

fs.writeFileSync(OUT, out);
console.log(`OK : ${trees.length} BERRY_TREE_ROUTE + ${stages.length} stages écrits dans ${OUT}`);
