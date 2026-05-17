// Extract : décomp `gBattleScriptsForMoveEffects[]` (data/battle_scripts_1.s)
// = table ORDONNÉE index(EFFECT enum) → label BattleScript_Effect*. C'est
// l'oracle 1:1 du ROUTING effet→script (sous-jacent à TOUS les moves :
// damaging ET status). Produit public/decomp/em/move-effect-scripts.json.
// Re-run via `npm run extract:move-effect-scripts`.
import { readFileSync, writeFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude';
const S = `${DEC}/data/battle_scripts_1.s`;
const EFF = `${DEC}/include/constants/battle_move_effects.h`;
const OUT = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/move-effect-scripts.json';

// EFFECT_* name → numeric value (index dans la table).
const effSrc = readFileSync(EFF, 'utf8');
const effByNum = {};
for (const m of effSrc.matchAll(/^#define\s+(EFFECT_[A-Z0-9_]+)\s+(\d+)\s*$/gm)) {
  effByNum[Number(m[2])] = m[1];
}

// Corps de la table : entre `gBattleScriptsForMoveEffects::` et la 1ʳᵉ
// ligne non-.4byte (= fin du tableau).
const src = readFileSync(S, 'utf8');
const startM = src.match(/gBattleScriptsForMoveEffects::/);
if (!startM) { console.error('FATAL: gBattleScriptsForMoveEffects:: introuvable'); process.exit(1); }
const rest = src.slice(startM.index + startM[0].length);
const lines = rest.split(/\r?\n/);

const table = [];
for (const ln of lines) {
  const t = ln.trim();
  if (t === '') continue;                          // ligne vide = tolérée au début
  const m = t.match(/^\.4byte\s+([A-Za-z0-9_]+)\s*(?:@\s*(\S+))?/);
  if (!m) break;                                    // 1ʳᵉ non-.4byte = fin table
  const idx = table.length;
  table.push({
    effect: idx,
    name: effByNum[idx] ?? m[2] ?? `EFFECT_${idx}`,
    label: m[1],
  });
}

writeFileSync(OUT, JSON.stringify(table, null, 0) + '\n');
console.log(`[extract move-effect-scripts] ${table.length} entries → ${OUT}`);
console.log(`  [0]=${table[0]?.name}:${table[0]?.label}  [last]=${table.at(-1)?.name}:${table.at(-1)?.label}`);
