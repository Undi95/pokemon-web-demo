#!/usr/bin/env node
/**
 * audit-battle-coverage.mjs
 * -------------------------
 * FILET MÉCANIQUE de couverture combat 1:1 (≠ checklist de mémoire).
 *
 * Énumère les TABLES exhaustives de la décomp (chaque entrée = un outcome à porter) et
 * les croise avec le portage. CHAQUE table via SA bonne source (pas un croisement naïf) :
 *
 *   Table (décomp)                                     | Source de couverture (port)
 *   ---------------------------------------------------|----------------------------------------
 *   EFFECT_*       (battle_move_effects.h, 214)        | gBattleScriptsForMoveEffects (jump-table)
 *                                                      |   → label présent dans LABELS du bytecode
 *   STRINGID_*     (battle_string_ids.h)               | STRINGID_NAMES (battle-strings-table.ts)
 *   MOVE_EFFECT_*  (battle.h)                          | nom référencé dans le code combat
 *   HOLD_EFFECT_*  (hold_effects.h)                    | nom référencé dans le code combat
 *   ABILITY_*      (abilities.h)                       | nom référencé dans le code combat
 *   opcodes Cmd_*  (battle_script_commands.c)          | OPCODE_NAMES + impl (nom quoté)
 *
 *   - "MANQUANT" = absent du portage = à faire (signal fiable).
 *   - "présent"  = la DATA est portée (script/message/nom existe). ⚠️ ≠ garantie que le
 *     contenu est 1:1 CORRECT — c'est le NIVEAU 2 (audit du maillon : le script s'exécute-t-il
 *     bien ? le message est-il rendu byte-level ? la case ability fait-elle le bon truc ?).
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
const readPort = (rel) => read(join(projectRoot, 'src', rel));

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
  const out = [];
  let m;
  const re = /Cmd_(\w+)/g;
  while ((m = re.exec(block))) out.push(m[1]);
  return out;
}

// ── Croisements (un par stratégie) ──

// (a) par NOM dans le code combat porté (fiable quand le port référence par nom).
const coverByName = (names) => {
  const present = [], missing = [];
  for (const n of names) (portTokens.has(n) ? present : missing).push(n);
  return { present, missing, total: names.length };
};

// (b) EFFECT_* : gBattleScriptsForMoveEffects (jump-table) → label dans LABELS du bytecode.
function coverEffect() {
  const names = defines(join(decompInc, 'battle_move_effects.h'), 'EFFECT_');
  const jt = readPort('engine/decomp-data/auto-asm-bytecode/data/battle_scripts_1-jump-table.ts');
  const arr = jt.match(/BATTLE_SCRIPTS_FOR_MOVE_EFFECTS[\s\S]*?=\s*\[([\s\S]*?)\]/);
  const scripts = arr ? [...arr[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
  const bc = readPort('engine/decomp-data/auto-asm-bytecode/data/battle_scripts_1-bytecode.ts');
  const lab = bc.match(/LABELS[\s\S]*?=\s*\{([\s\S]*?)\n\}/);
  const labels = new Set(lab ? [...lab[1].matchAll(/"(\w+)"\s*:/g)].map((m) => m[1]) : []);
  const present = [], missing = [];
  names.forEach((name, i) => {
    const s = scripts[i];
    if (s && labels.has(s)) present.push(name);
    else missing.push(`${name} → ${s || '(absent de la jump-table)'}`);
  });
  return { present, missing, total: names.length };
}

// (c) STRINGID_* : STRINGID_NAMES (table de strings extraite id→nom).
function coverStringId() {
  const names = defines(join(decompInc, 'battle_string_ids.h'), 'STRINGID_');
  const st = readPort('engine/decomp-data/battle-strings-table.ts');
  const nm = st.match(/STRINGID_NAMES[\s\S]*?=\s*\{([\s\S]*?)\n\}/);
  const portNames = new Set(nm ? [...nm[1].matchAll(/"(STRINGID_\w+)"/g)].map((m) => m[1]) : []);
  const present = [], missing = [];
  for (const n of names) (portNames.has(n) ? present : missing).push(n);
  return { present, missing, total: names.length };
}

// (d) opcodes : nom lowercase quoté (OPCODE_NAMES + impl).
function coverOpcodes() {
  const names = opcodeNamesDecomp();
  const present = [], missing = [];
  for (const n of names) (new RegExp("['\"]" + n + "['\"]").test(portText) ? present : missing).push(n);
  return { present, missing, total: names.length };
}

const cats = [
  { key: 'EFFECT (move)', cov: coverEffect(), note: 'jump-table gBattleScriptsForMoveEffects → labels bytecode' },
  { key: 'MOVE_EFFECT (secondary)', cov: coverByName(defines(join(decompInc, 'battle.h'), 'MOVE_EFFECT_')), note: 'nom dans le code combat' },
  { key: 'HOLD_EFFECT', cov: coverByName(defines(join(decompInc, 'hold_effects.h'), 'HOLD_EFFECT_')), note: 'nom dans le code combat' },
  { key: 'ABILITY', cov: coverByName(defines(join(decompInc, 'abilities.h'), 'ABILITY_')), note: 'nom dans le code combat' },
  { key: 'STRINGID', cov: coverStringId(), note: 'table de strings extraite (STRINGID_NAMES)' },
  { key: 'Opcodes Cmd_*', cov: coverOpcodes(), note: 'OPCODE_NAMES + impl' },
];

// ── Rapport ──
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 100);
let md = '# Couverture combat 1:1 — filet mécanique\n\n';
md += '> Généré par `scripts/audit-battle-coverage.mjs`. Énumère les tables EXHAUSTIVES de la décomp\n';
md += '> et les croise avec le portage — chaque table via SA bonne source (cf. colonne « méthode »).\n';
md += '> **MANQUANT** = absent du portage (à faire, fiable). **présent** = la DATA est portée\n';
md += '> (script/message/nom existe) ≠ garantie que le CONTENU est 1:1 correct = **NIVEAU 2**\n';
md += '> (audit du maillon : exécution du script, rendu byte-level, contenu des cases). Re-run à volonté.\n\n';
md += '| Table | présents | total | % | manquants | méthode |\n|---|---|---|---|---|---|\n';
for (const c of cats) {
  md += `| ${c.key} | ${c.cov.present.length} | ${c.cov.total} | ${pct(c.cov.present.length, c.cov.total)}% | ${c.cov.missing.length} | ${c.note} |\n`;
}
md += '\n';
for (const c of cats) {
  md += `## ${c.key} — ${c.cov.missing.length} MANQUANT(S)\n\n`;
  md += c.cov.missing.length ? c.cov.missing.map((n) => `- ${n}`).join('\n') + '\n\n' : '_(tous présents)_\n\n';
}

const outArg = process.argv.find((a) => a.startsWith('--output='));
const outPath = outArg ? resolve(projectRoot, outArg.slice(9)) : join(projectRoot, 'audit-reports', 'battle-coverage.md');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, md);

console.log('Couverture combat (présents/total) :');
for (const c of cats) {
  console.log(`  ${c.key.padEnd(24)} ${String(c.cov.present.length).padStart(4)}/${c.cov.total}  (${c.cov.missing.length} manquants)`);
}
console.log(`\nRapport : ${outPath}`);
