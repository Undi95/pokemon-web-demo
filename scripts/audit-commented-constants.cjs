#!/usr/bin/env node
/**
 * audit-commented-constants.cjs — ORACLE des LITTÉRAUX INLINE COMMENTÉS.
 *
 * Ce port est transcrit à la main : le code est truffé de littéraux annotés par le NOM de la
 * constante décomp qu'ils représentent, p.ex. `(1 << 29) /* STATUS2_FORESIGHT *​/`,
 * `10 /* TYPE_FIRE *​/`, `78 /* ABILITY_LIGHTNING_ROD *​/`, `42 /* REQUEST_HP_BATTLE *​/`.
 * La convention est INVARIANTE : `<valeur> /* NOM *​/` ⇒ la valeur DOIT égaler la constante NOM
 * du décomp. C'est la surface de transcription DOMINANTE (319 points rien que sur 4 fichiers
 * combat), et l'oracle `const NAME = <int>` (audit-inline-battle-constants) ne la couvre PAS
 * (ces littéraux n'ont pas de nom local). Une valeur fausse ici = même classe que les 25 bugs
 * inline déjà trouvés (caseID 12/19, AIR_LOCK 76/77…), p.ex. un `1 << 28` au lieu de `1 << 29`.
 *
 * Méthode :
 *   1. map des constantes décomp = #define (evalExpr : hex/<</réf, multi-pass) + ENUMS C
 *      (auto-incrément, résoudre-ou-IGNORER : un membre non résolu stoppe son enum → jamais de
 *       valeur devinée → zéro faux positif).
 *   2. scan récursif de src/ (hors *-auto.ts) pour `<0xNN|(1<<N)|1<<N|décimal> /* NOM *​/`.
 *   3. confronte uniquement les NOMS dont la FAMILLE est PROUVÉE value-1:1 (ALLOW ci-dessous,
 *      chacune adossée à un oracle vert existant). Les autres familles (sélecteurs internes que
 *      le port renumérote : Frontier/sons/anims/STRINGID…) sont HORS périmètre value (couvertes
 *      par structure, pas par valeur) → skip. C'est ce qui rend ce garde committable sans triage
 *      des ~300 points : on ne contrôle que là où un écart est SANS AMBIGUÏTÉ un bug.
 *
 * Découvert par cet oracle (corrigés au même commit) : ABILITY_LIGHTNING_ROD 78→31,
 * ABILITY_PRESSURE 49→46 (Pressure ne déduisait jamais le PP), HITMARKER_RUN posé sur bit 0
 * vs checké bit 15 (fuite cassée), FLAG_GET_CAUGHT 0→1 (Repeat Ball testait VU≠CAPTURÉ),
 * FLAG_SET_SEEN 1→2 (Pokédex « vu » jamais posé), MOVE_RESULT_DOESNT_AFFECT_FOE 0x4→0x8.
 *
 * ⚠️ Familles NON-allowlist à trier dans de futures passes (candidats vus, value possiblement
 *    bug OU sélecteur renuméroté) : STRINGID_*, B_MSG_*, STAT_ANIM_*, WINDOW_*, CURSOR_*,
 *    B_RECORD_MODE_*, *_FUNC_* (Frontier), ANIM_TAG_*, B_ANIM_*, LIST_CANCEL.
 *
 *   node scripts/audit-commented-constants.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';

// Noms dont le sens local diverge LÉGITIMEMENT du décomp (triage confirmé ; cf. ci-dessous).
const EXCLUDE = new Set([
  'SE_RAIN', 'SE_THUNDERSTORM', 'SE_DOWNPOUR', // sons — directive « ne pas toucher BGM/SE »
  'LOCALID_NONE',                              // sentinelle port 0xFF ≠ décomp 0
]);

// ── Résolveur d'expressions C (réutilisé de audit-inline-battle-constants) ────
function evalExpr(expr, scope) {
  let s = expr.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  s = s.replace(/\((?:u8|s8|u16|s16|u32|s32)\)/g, '');
  s = s.replace(/0[xX][0-9a-fA-F]+/g, (h) => String(parseInt(h, 16)));
  s = s.replace(/[A-Za-z_]\w*/g, (id) => { if (id in scope) return '(' + scope[id] + ')'; throw new Error('ref:' + id); });
  if (!/^[-0-9<>|&~()+*\/\s]+$/.test(s)) throw new Error('unsafe');
  const v = Function('"use strict";return (' + s + ')')();
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error('nan');
  return v | 0;
}

// ── 1a. #define ──────────────────────────────────────────────────────────────
function collectDefines(dir, map) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) collectDefines(p, map);
    else if (ent.name.endsWith('.h')) {
      const txt = fs.readFileSync(p, 'utf8');
      const pending = [];
      for (const m of txt.matchAll(/^#define\s+([A-Z_][A-Z0-9_]*)\s+(.+?)\s*$/gm)) pending.push([m[1], m[2]]);
      let changed = true, pass = 0;
      while (changed && pass++ < 6) {
        changed = false;
        for (const [name, expr] of pending) {
          if (name in map) continue;
          try { map[name] = evalExpr(expr, map); changed = true; } catch { /* retry */ }
        }
      }
    }
  }
}

// ── 1b. enum C (auto-incrément ; résoudre-ou-ignorer) ────────────────────────
function collectEnumsFromText(txt, map) {
  let any = false;
  // corps d'enum = `enum [Tag] { ... }` (pas d'accolade imbriquée dans un enum)
  for (const e of txt.matchAll(/enum\s+(?:[A-Za-z_]\w*\s+)?\{([^}]*)\}/g)) {
    const body = e[1].replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    let cur = 0;
    // membres séparés par des virgules de NIVEAU 0 (les exprs n'ont pas de virgule top-level ici)
    for (const rawMember of body.split(',')) {
      const member = rawMember.trim();
      if (!member) continue;
      const eq = member.indexOf('=');
      const name = (eq < 0 ? member : member.slice(0, eq)).trim();
      if (!/^[A-Z_][A-Z0-9_]*$/.test(name)) { break; } // forme inattendue → stop cet enum (prudence)
      let val;
      if (eq < 0) { val = cur; }
      else {
        try { val = evalExpr(member.slice(eq + 1), map); }
        catch { break; } // expr non résolue → on NE devine PAS la suite (auto-incrément cassé) → stop
      }
      if (!(name in map)) { map[name] = val; any = true; }
      cur = val + 1;
    }
  }
  return any;
}
function collectEnums(dir, map) {
  // multi-pass dossier-niveau pour les enums référençant des #define d'autres fichiers
  const texts = [];
  (function walk(d) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith('.h') || ent.name.endsWith('.c')) texts.push(fs.readFileSync(p, 'utf8'));
    }
  })(dir);
  let changed = true, pass = 0;
  while (changed && pass++ < 4) { changed = false; for (const t of texts) if (collectEnumsFromText(t, map)) changed = true; }
}

const decomp = {};
collectDefines(path.join(DECOMP, 'include'), decomp);
collectEnums(path.join(DECOMP, 'include'), decomp);
const nDefs = Object.keys(decomp).length;

// ── 2. scan récursif src/ ────────────────────────────────────────────────────
function listTsFiles(dir, acc) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) { if (ent.name !== 'node_modules') listTsFiles(p, acc); }
    else if (ent.name.endsWith('.ts') && !ent.name.endsWith('-auto.ts') && !ent.name.endsWith('.d.ts')) {
      acc.push(path.relative(ROOT, p).replace(/\\/g, '/'));
    }
  }
  return acc;
}
const TS_FILES = listTsFiles(path.join(ROOT, 'src'), []);

// ── 3. confrontation (familles value-1:1 uniquement) ─────────────────────────
// Familles PROUVÉES 1:1 PAR VALEUR (oracle vert adossé). Un littéral commenté divergent y est
// SANS AMBIGUÏTÉ un bug de transcription (pas un sélecteur interne renuméroté).
const ALLOW = [
  'ABILITY_', 'TYPE_',                                  // audit-ability-type-constants
  'STATUS1_', 'STATUS2_', 'STATUS3_', 'MOVE_RESULT_',   // audit-battle-status-bits
  'HITMARKER_',                                         // battle.h (HITMARKER_RUN vérifié)
  'FLAG_GET_', 'FLAG_SET_',                             // pokedex.h enum (vérifié)
  'ITEM_', 'SPECIES_',                                  // audit-id-constants
  'B_WEATHER_',                                         // engine/battle/constants.ts (vérifié)
  'BATTLE_TYPE_',                                       // audit-battle-flags
  'MOVE_TARGET_', 'HOLD_EFFECT_',                       // audit-battle-flags / audit-effect-hold-constants
  'STRINGID_',                                          // gBattleStringsTable 1:1 (battle-strings-table.ts)
];
// MOVE_ (coups, audit-id-constants) MAIS pas les sous-enums non-confirmés (MOVE_EFFECT_,
// MOVE_TARGET_ est déjà listé, MOVE_RESULT_ déjà listé).
const MOVE_SUB = ['MOVE_EFFECT_', 'MOVE_TARGET_', 'MOVE_RESULT_'];
// B_MSG_* : indices DANS une table printfromtable spécifique — value-1:1 SEULEMENT si la table
// du port est ordonnée comme le décomp (pas garanti pour toute la famille). On ne garde que les
// noms dont la table a été CONFRONTÉE 1:1 (gItemSwapStringIds=[358,359,360], gBerryEffectStringIds
// =[297,342]) — bugs corrigés au commit B_MSG.
const VERIFIED_NAMES = new Set([
  'B_MSG_ITEM_SWAP_TAKEN', 'B_MSG_ITEM_SWAP_GIVEN', 'B_MSG_ITEM_SWAP_BOTH', 'B_MSG_CURED_PROBLEM',
  // Constantes isolées dont la valeur canonique du port == décomp (vérifiée), corrigées au commit :
  'CURSOR_POSITION',   // index gBattleCommunication (=1, battle_script_commands.h:288)
  'STAT_ANIM_PLUS2',   // arg anim de stat (=38, battle_anim.h:196)
  'WINDOW_CLEAR',      // flag HandleBattleWindow (=1<<0, battle_script_commands.h:7)
]);
const inAllow = (n) =>
  ALLOW.some((p) => n.startsWith(p)) ||
  VERIFIED_NAMES.has(n) ||
  (n.startsWith('MOVE_') && !MOVE_SUB.some((p) => n.startsWith(p)));

// Ordre des alternatives : `(1<<N)` puis `1<<N` (sans parenthèses — sinon \d+ capte le N nu,
// FP `1 << 5 /* PLAYER_AVATAR_FLAG_CONTROLLABLE */` lu « 5 ») puis hex puis décimal.
const RE = /(\(\s*1\s*<<\s*\d+\s*\)|1\s*<<\s*\d+|0x[0-9A-Fa-f]+|\d+)\s*\/\*\s*([A-Z][A-Z0-9_]{2,})\s*\*\//g;
const findings = [];
let checked = 0, knownPts = 0;
const seenMismatch = new Set();

for (const rel of TS_FILES) {
  const txt = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  for (const m of txt.matchAll(RE)) {
    const name = m[2];
    if (!(name in decomp) || EXCLUDE.has(name) || !inAllow(name)) continue;
    // Ignore les matchs DANS un commentaire de ligne `//` (ex. exemples d'usage devtool :
    // `// __testMoveAnim(33 /* MOVE_POUND */)` — pas du code, le littéral n'est pas un fait).
    const lineStart = txt.lastIndexOf('\n', m.index) + 1;
    if (txt.slice(lineStart, m.index).includes('//')) continue;
    knownPts++;
    let val;
    try { val = evalExpr(m[1], {}); } catch { continue; }
    checked++;
    const d = decomp[name];
    const ok = val === d || val === (d & 0xFF) || val === (d & 0xFFFF) || (val >>> 0) === (d >>> 0);
    if (!ok) {
      const lineNo = txt.slice(0, m.index).split('\n').length;
      const key = `${rel}:${lineNo}:${name}`;
      if (seenMismatch.has(key)) continue;
      seenMismatch.add(key);
      findings.push(`${rel}:${lineNo}  ${m[1].trim()} /* ${name} */  → décomp ${name} = ${d}`);
    }
  }
}

console.log(`Littéraux inline commentés confrontés : ${checked} (noms décomp résolus : ${nDefs} #define+enum ; points avec nom connu : ${knownPts}).`);
if (findings.length === 0) { console.log('✅ Tous les littéraux `valeur /* NOM */` connus du décomp sont FIDÈLES.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 60)) console.log('  ' + f);
process.exit(1);
