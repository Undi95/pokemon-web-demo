#!/usr/bin/env node
/**
 * Extrait les 4 tables de pointeurs d'anims de combat du décomp
 * (`data/battle_anim_scripts.s`) en JSON :
 *   gBattleAnims_Moves[MOVES_COUNT]            — par move ID
 *   gBattleAnims_StatusConditions[]            — B_ANIM_STATUS_* (PSN/CONFUSION/...)
 *   gBattleAnims_General[]                     — B_ANIM_* general (statuts visibles, ball throw...)
 *   gBattleAnims_Special[]                     — B_ANIM_SPECIAL (level up, ball throw...)
 *
 * Sortie : public/decomp/em/battle_anims/anim-tables.json
 *   { "moves": ["Move_NONE", ...], "statusConditions": [...], "general": [...], "special": [...] }
 *
 * Les noms = labels du bytecode (battle_anim_scripts-bytecode.ts LABELS) →
 * l'interpréteur résout table[index] → LABELS[name] → offset.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const src = readFileSync(resolve(projectRoot, '..', 'decomps', 'pokeemeraude', 'data', 'battle_anim_scripts.s'), 'utf8');

function extractTable(name) {
  const re = new RegExp(`^${name}::\\s*$`, 'm');
  const m = src.match(re);
  if (!m) throw new Error(`table ${name} introuvable`);
  const start = m.index + m[0].length;
  const out = [];
  for (const line of src.slice(start).split('\n')) {
    const t = line.trim();
    if (t === '' || t.startsWith('@')) continue;
    const d = t.match(/^\.4byte\s+(.+)$/);
    if (!d) break; // fin de la table (prochain label/section)
    for (const ref of d[1].split(',')) {
      const r = ref.trim().split('@')[0].trim();
      if (r) out.push(r);
    }
  }
  return out;
}

const tables = {
  moves: extractTable('gBattleAnims_Moves'),
  statusConditions: extractTable('gBattleAnims_StatusConditions'),
  general: extractTable('gBattleAnims_General'),
  special: extractTable('gBattleAnims_Special'),
};
const outPath = resolve(projectRoot, 'public', 'decomp', 'em', 'battle_anims', 'anim-tables.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(tables, null, 1));
console.log('anim-tables.json :', Object.entries(tables).map(([k, v]) => `${k}=${v.length}`).join(', '));
