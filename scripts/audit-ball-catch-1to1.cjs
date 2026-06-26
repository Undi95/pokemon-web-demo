#!/usr/bin/env node
/**
 * audit-ball-catch-1to1.cjs — ORACLE de la machine à capture (Cmd_handleballthrow).
 *
 * Cmd_handleballthrow (battle_script_commands.c:9908-10056) calcule la proba d'attraper un
 * Pokémon : catchRate × ballMultiplier, formule `odds`, multiplicateurs de statut, puis la
 * boucle de secousses `Sqrt(Sqrt(16711680/odds))` → `1048560/odds` → `Random() < odds` (≤4).
 * Le corps est purement calculatoire et a été AUDITÉ ligne-à-ligne 1:1 (cf. commentaires du
 * port). Cet oracle verrouille en RÉGRESSION les DEUX choses extractibles sans risque runtime :
 *
 *   1. La table `sBallCatchBonuses[]` = {ULTRA:20, GREAT:15, POKE:10, SAFARI:15} — confrontée
 *      exactement entre le port (`sBallCatchBonuses_HBT`) et le décomp (initialiseurs désignés).
 *   2. Les CONSTANTES PORTEUSES de la formule (1275/100 safari, 254 seuil auto-capture, 255
 *      clamp catchAttempts, 16711680 & 1048560 transform secousses, ×15/10 statut, 30/35/40/9
 *      multiplicateurs Net/Dive/Nest/Timer, 3/2 formule odds) : chaque littéral du corps décomp
 *      DOIT être présent dans le corps du port (commentaires retirés). Une constante décomp
 *      absente du port = typo/improvisation → ROUGE. (Sous-ensemble décomp⊆port : le port a des
 *      littéraux en plus, ex. les IDs d'items que le décomp exprime en macros — tolérés.)
 *
 *   node scripts/audit-ball-catch-1to1.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c';
const OURS = path.join(ROOT, 'src/battle_script_commands.ts');

const cSrc = fs.readFileSync(DECOMP, 'utf8');
const tsSrc = fs.readFileSync(OURS, 'utf8');

function stripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
}
// Corps d'une fonction par appariement d'accolades (sur source SANS commentaires).
// Saute les déclarations forward (`...(void);`) : on veut l'occurrence dont le prochain
// `{` précède le prochain `;` (= la DÉFINITION, pas le prototype).
function funcBody(src, startMarker) {
  let from = 0, i, open = -1;
  while ((i = src.indexOf(startMarker, from)) >= 0) {
    const brace = src.indexOf('{', i), semi = src.indexOf(';', i);
    if (brace >= 0 && (semi < 0 || brace < semi)) { open = brace; break; }
    from = i + startMarker.length;
  }
  if (open < 0) return null;
  let depth = 0, j = open;
  for (; j < src.length; j++) {
    const c = src[j];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { j++; break; } }
  }
  return src.slice(open, j);
}
const digitSet = (s) => new Set([...s.matchAll(/\d+/g)].map((m) => m[0]));

const findings = [];

// ── 1. Table sBallCatchBonuses ──────────────────────────────────────────────
function arrNums(src, marker, open, close) {
  const a = src.indexOf(marker);
  if (a < 0) return null;
  const oi = src.indexOf(open, src.indexOf('=', a));
  const body = stripComments(src.slice(oi, src.indexOf(close, oi)));
  return [...body.matchAll(/\d+/g)].map((m) => Number(m[0]));
}
const cBonus = arrNums(cSrc, 'sBallCatchBonuses[] =', '{', '\n};');
const tBonus = arrNums(tsSrc, 'sBallCatchBonuses_HBT', '[', '];');
if (!cBonus || cBonus.length !== 4) findings.push(`sBallCatchBonuses décomp : ${cBonus ? cBonus.length : 'introuvable'} valeurs (attendu 4)`);
if (!tBonus || tBonus.length !== 4) findings.push(`sBallCatchBonuses_HBT port : ${tBonus ? tBonus.length : 'introuvable'} valeurs (attendu 4)`);
if (cBonus && tBonus) {
  for (let i = 0; i < 4; i++) if (cBonus[i] !== tBonus[i]) findings.push(`sBallCatchBonuses[${i}] : décomp=${cBonus[i]} port=${tBonus[i]}`);
}

// ── 2. Constantes porteuses du corps Cmd_handleballthrow ─────────────────────
const cBody = funcBody(stripComments(cSrc), 'Cmd_handleballthrow(void)');
const tBody = funcBody(stripComments(tsSrc), 'function Cmd_handleballthrow(');
let checkedConsts = 0;
if (!cBody) findings.push('corps Cmd_handleballthrow décomp introuvable');
if (!tBody) findings.push('corps Cmd_handleballthrow port introuvable');
if (cBody && tBody) {
  const cD = digitSet(cBody), tD = digitSet(tBody);
  // Littéraux porteurs (présents en chiffres dans le corps décomp ; le reste y est en macros).
  const KEY = ['1275', '100', '254', '255', '16711680', '1048560', '15', '30', '35', '40', '9', '3', '2', '10'];
  for (const k of KEY) {
    checkedConsts++;
    if (!cD.has(k)) { findings.push(`sanity : ${k} absent du corps décomp (liste KEY à revoir)`); continue; }
    if (!tD.has(k)) findings.push(`constante ${k} (décomp) ABSENTE du port → typo/improvisation`);
  }
}

console.log(`Capture (Cmd_handleballthrow) : sBallCatchBonuses[4] + ${checkedConsts} constantes porteuses de la formule odds/secousses`);
if (findings.length === 0) {
  console.log('✅ Machine à capture : table de bonus + constantes de formule FIDÈLES au décomp.');
  process.exit(0);
}
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
