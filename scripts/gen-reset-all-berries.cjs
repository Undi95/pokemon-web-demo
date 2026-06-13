// Génère src/engine/save/reset-all-berries.ts 1:1 depuis
// data/scripts/new_game.inc (EventScript_ResetAllBerries).
const fs = require('fs');
const SRC = 'D:/Projet 1/decomps/pokeemeraude/data/scripts/new_game.inc';
const OUT = 'D:/Projet 1/pokemon-web-demo/src/engine/save/reset-all-berries.ts';

// Valeurs ITEM_X_BERRY depuis items.h → calcul ITEM_TO_BERRY (= val - FIRST + 1).
const itemsH = fs.readFileSync('D:/Projet 1/decomps/pokeemeraude/include/constants/items.h', 'utf8');
const itemVal = {};
for (const l of itemsH.split(/\r?\n/)) {
  const m = l.match(/^#define\s+(ITEM_[A-Z0-9_]+_BERRY)\s+(\d+)/);
  if (m) itemVal[m[1]] = parseInt(m[2], 10);
}
const FIRST_BERRY_INDEX = itemVal['ITEM_CHERI_BERRY']; // 0x85 = 133
const itemToBerry = (item) => (itemVal[item] - FIRST_BERRY_INDEX) + 1;

const txt = fs.readFileSync(SRC, 'utf8');
const lines = txt.split(/\r?\n/);

// Bloc EventScript_ResetAllBerries:: ... return
const start = lines.findIndex(l => /EventScript_ResetAllBerries::/.test(l));
if (start < 0) throw new Error('EventScript_ResetAllBerries introuvable');

const entries = []; // {tree, item, stage}
for (let i = start + 1; i < lines.length; i++) {
  const l = lines[i].trim();
  if (l === 'return' || /^EventScript_/.test(l)) break;
  const m = l.match(/^setberrytree\s+(BERRY_TREE_ROUTE_[A-Z0-9_]+),\s*ITEM_TO_BERRY\((ITEM_[A-Z0-9_]+)\),\s*(BERRY_STAGE_[A-Z_]+)/);
  if (m) entries.push({ tree: m[1], item: m[2], stage: m[3] });
}

const trees = [...new Set(entries.map(e => e.tree))];
const stages = [...new Set(entries.map(e => e.stage))];

let out = '';
out += '// Porté 1:1 (généré via scripts/gen-reset-all-berries.cjs) depuis :\n';
out += '//   D:/Projet 1/decomps/pokeemeraude/data/scripts/new_game.inc\n';
out += '//   (EventScript_ResetAllBerries — les baies initiales d\'une save fraîche).\n';
out += '// Le type de baie = ITEM_TO_BERRY(ITEM_X_BERRY) est résolu en number à la\n';
out += '// génération (= val items.h - FIRST_BERRY_INDEX + 1) ; l\'item d\'origine est en\n';
out += '// commentaire. Évite toute dépendance à decomp-bridge (= zéro risque de cycle TDZ).\n';
out += '// Re-générer : node scripts/gen-reset-all-berries.cjs\n\n';
out += 'import { PlantBerryTree } from \'../pokemon/berry\';\n';
out += `import {\n${stages.map(s => '  ' + s + ',').join('\n')}\n${trees.map(t => '  ' + t + ',').join('\n')}\n} from '../decomp-data/include/constants/berry-data';\n\n`;

out += '/** Table 1:1 EventScript_ResetAllBerries : [berryTreeId, berryType, stade].\n';
out += ' *  berryType = ITEM_TO_BERRY(item) résolu à la génération (item en commentaire). */\n';
out += 'const sResetAllBerries: ReadonlyArray<readonly [number, number, number]> = [\n';
for (const e of entries) {
  out += `  [${e.tree}, ${itemToBerry(e.item)}, ${e.stage}], // ${e.item}\n`;
}
out += '];\n\n';

out += '/** 1:1 décomp `EventScript_ResetAllBerries` (appelé en fin de\n';
out += ' *  EventScript_ResetAllMapFlags au new game) : plante les baies fixes\n';
out += ' *  initiales via setberrytree → PlantBerryTree(id, berry, stage, FALSE). */\n';
out += 'export function ResetAllBerries(): void {\n';
out += '  for (const [treeId, berry, stage] of sResetAllBerries) {\n';
out += '    // 1:1 décomp ScrCmd_setberrytree : PlantBerryTree(treeId, berry, stage, FALSE).\n';
out += '    PlantBerryTree(treeId, berry, stage, false);\n';
out += '  }\n';
out += '}\n';

fs.writeFileSync(OUT, out);
console.log(`OK : ${entries.length} baies initiales (${trees.length} arbres) écrites dans ${OUT}`);
