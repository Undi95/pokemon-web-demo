#!/usr/bin/env node
/**
 * audit-battle-coverage.mjs
 * -------------------------
 * FILET MÉCANIQUE de couverture combat 1:1 (≠ checklist de mémoire).
 *
 * Énumère les TABLES exhaustives de la décomp (chaque entrée = un outcome à porter)
 * et les croise avec le CODE de combat porté → rapport `présent / MANQUANT` par table.
 * Re-run à volonté : à tout moment on sait ce qui reste.
 *
 *   Tables auditées (source = decomps/pokeemeraude) :
 *     - EFFECT_*        (include/constants/battle_move_effects.h)  — effets de move
 *     - MOVE_EFFECT_*   (include/constants/battle.h)               — effets secondaires
 *     - HOLD_EFFECT_*   (include/constants/hold_effects.h)         — objets tenus
 *     - ABILITY_*       (include/constants/abilities.h)            — talents
 *     - STRINGID_*      (include/constants/battle_string_ids.h)    — messages de combat
 *     - opcodes Cmd_*   (src/battle_script_commands.c)             — moteur de script
 *
 * Croisement = présence du NOM décomp (1:1 → les noms sont préservés) comme TOKEN dans
 * le code porté (src/engine/battle + src/game, hors decomp-data auto-extraites).
 *   - "MANQUANT" = nom absent du code = à faire (signal SÛR).
 *   - "présent"  = nom référencé (≠ garantie 1:1 complète ; à raffiner par l'audit du maillon).
 * Un taux ~0% sur une catégorie = le port la référence par id/script et non par nom → la
 * méthode de croisement est à adapter pour cette catégorie (noté dans le rapport).
 *
 * Usage : node scripts/audit-battle-coverage.mjs [--output=audit-reports/battle-coverage.md]
 */
import { readdirSync, readFileSync, existsSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const decompSrc = join(decompPath, 'src');
const decompInc = join(decompPath, 'include', 'constants');

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

function walkTs(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) walkTs(full, acc);
    else if (extname(full) === '.ts') acc.push(full);
  }
  return acc;
}

// ── Index du CODE de combat porté (hors decomp-data = tables auto-extraites) ──
let portFiles = [];
for (const d of [join(projectRoot, 'src', 'engine', 'battle'), join(projectRoot, 'src', 'game')]) {
  portFiles = portFiles.concat(walkTs(d));
}
portFiles = portFiles.filter((f) => !f.includes('decomp-data'));
const portText = portFiles.map(read).join('\n');
const portTokens = new Set(portText.match(/[A-Za-z_][A-Za-z0-9_]{2,}/g) || []);

// ── Extraction décomp ──
function defines(file, prefix) {
  const re = new RegExp('^#define\\s+(' + prefix + '\\w+)', 'gm');
  const out = [];
  let m;
  const txt = read(file);
  while ((m = re.exec(txt))) out.push(m[1]);
  return out;
}

function opcodeNamesDecomp() {
  const txt = read(join(decompSrc, 'battle_script_commands.c'));
  const i = txt.indexOf('gBattleScriptingCommandsTable[])');
  if (i < 0) return [];
  const block = txt.slice(i, txt.indexOf('};', i));
  const re = /Cmd_(\w+)/g;
  const out = [];
  let m;
  while ((m = re.exec(block))) out.push(m[1]);
  return out;
}

// reliable=false → le port gère cette table par id/script/byte-level (PAS par nom décomp) :
// le croisement par nom sous-estime massivement la couverture (faux manquants).
//   - EFFECT_*  : implémentés via gBattleScriptsForMoveEffects (scripts) → raffiner par script.
//   - STRINGID_ : messages byte-level indexés par id → raffiner par table de strings.
const categories = [
  ['EFFECT (move)', defines(join(decompInc, 'battle_move_effects.h'), 'EFFECT_'), false],
  ['MOVE_EFFECT (secondary)', defines(join(decompInc, 'battle.h'), 'MOVE_EFFECT_'), true],
  ['HOLD_EFFECT', defines(join(decompInc, 'hold_effects.h'), 'HOLD_EFFECT_'), true],
  ['ABILITY', defines(join(decompInc, 'abilities.h'), 'ABILITY_'), true],
  ['STRINGID', defines(join(decompInc, 'battle_string_ids.h'), 'STRINGID_'), false],
];

const cover = (names) => {
  const present = [], missing = [];
  for (const n of names) (portTokens.has(n) ? present : missing).push(n);
  return { present, missing };
};

// Opcodes : croisement par nom lowercase entre quotes (OPCODE_NAMES + impl).
const opNames = opcodeNamesDecomp();
const opCover = (() => {
  const present = [], missing = [];
  for (const n of opNames) {
    (new RegExp("['\"]" + n + "['\"]").test(portText) ? present : missing).push(n);
  }
  return { present, missing };
})();

// ── Rapport ──
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 100);
let md = '# Couverture combat 1:1 — filet mécanique\n\n';
md += '> Généré par `scripts/audit-battle-coverage.mjs`. Croise les tables EXHAUSTIVES de la\n';
md += '> décomp avec le CODE de combat porté (src/engine/battle + src/game, hors decomp-data).\n';
md += '> **MANQUANT** = nom absent du code = à faire (sûr). **présent** = nom référencé\n';
md += '> (≠ garantie 1:1 ; à confirmer par l\'audit du maillon). Re-run après chaque ajout.\n\n';
md += '| Table | présents | total | % | manquants |\n|---|---|---|---|---|\n';

const sections = [];
for (const [key, names, reliable] of categories) {
  const { present, missing } = cover(names);
  md += `| ${key}${reliable ? '' : ' ⚠️'} | ${present.length} | ${names.length} | ${pct(present.length, names.length)}% | ${missing.length} |\n`;
  sections.push([key, present, missing, reliable]);
}
md += `| Opcodes Cmd_* | ${opCover.present.length} | ${opNames.length} | ${pct(opCover.present.length, opNames.length)}% | ${opCover.missing.length} |\n`;
sections.push(['Opcodes Cmd_*', opCover.present, opCover.missing, true]);

md += '\n> ⚠️ = croisement par nom NON FIABLE (le port gère cette table par id/script/byte-level).\n';
md += '> Les « manquants » de ces lignes sont des FAUX POSITIFS tant que le raffinement n\'est pas fait\n';
md += '> (EFFECT → gBattleScriptsForMoveEffects ; STRINGID → table de strings byte-level).\n\n';
for (const [key, , missing, reliable] of sections) {
  md += `## ${key}${reliable ? '' : ' ⚠️ (croisement non fiable — faux positifs)'} — ${missing.length} MANQUANT(S)\n\n`;
  md += missing.length ? missing.map((n) => `- ${n}`).join('\n') + '\n\n' : '_(tous présents)_\n\n';
}

const outArg = process.argv.find((a) => a.startsWith('--output='));
const outPath = outArg ? resolve(projectRoot, outArg.slice(9)) : join(projectRoot, 'audit-reports', 'battle-coverage.md');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, md);

console.log('Couverture combat (présents/total) :');
for (const [key, present, missing, reliable] of sections) {
  console.log(`  ${key.padEnd(24)} ${String(present.length).padStart(4)}/${present.length + missing.length}  (${missing.length} manquants)${reliable ? '' : '  [croisement non fiable]'}`);
}
console.log(`\nRapport : ${outPath}`);
