// gen-event-data-ids.mjs — RÉSOLVEUR d'ids flags/vars (déterministe, vérifiable).
//
// Résout la chaîne de #define de `flags.h` / `vars.h` (qui sont des EXPRESSIONS
// référençant des defines antérieurs : `FLAG_X (SECTION_START + 0xNN)`, sections
// computées avec %, etc.) en VALEURS numériques, et génère les constantes mirror
// `src/game/include/constants/flags.ts` + `vars.ts`.
//
// Pourquoi un script : 1600+ flags → transcription main infaisable. C'est une
// transcription DÉTERMINISTE (évaluation de l'expr décomp) qu'on VÉRIFIE ensuite
// (ids connus : FLAG_TEMP_1=1, VAR_RESULT=0x800D, FLAGS_COUNT…). Pas un outil de
// couverture/audit — juste la résolution du préprocesseur C pour ces #define.
//
// Usage : node scripts/gen-event-data-ids.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/include/constants';

// Constantes externes nécessaires (d'autres headers) — fournies pour résoudre les
// quelques refs externes (les FLAG_* eux-mêmes n'en dépendent pas, mais des ENDs si).
const SEED = { MAX_TRAINERS_COUNT: 0x360, NUM_STORYLINE_STATES: 0 };

function resolveFile(path) {
  const text = readFileSync(path, 'utf8');
  const ctx = { ...SEED };
  const order = [];
  for (const raw of text.split(/\r?\n/)) {
    // #define NAME EXPR   (ignore les macros à arguments: NAME(...) )
    // NB: le charset du nom autorise les minuscules APRÈS le 1er char (qui reste
    // majuscule/_) pour capturer le `x` des noms hex genre `FLAG_UNUSED_0x91F` —
    // sinon le nom est tronqué à `FLAG_UNUSED_0`, l'expr devient invalide et la
    // constante (+ tout ce qui en dépend : DAILY_FLAGS_START, FLAGS_COUNT) est
    // jamais résolue. Le 1er char `[A-Z_]` garde la capture sûre (pas de macro lowercase).
    const m = raw.match(/^\s*#define\s+([A-Z_][A-Za-z0-9_]*)\s+(.+?)\s*(?:\/\/.*|\/\*.*)?$/);
    if (!m) continue;
    const name = m[1];
    let expr = m[2].trim();
    if (expr === '' ) continue;
    // substitue les noms connus (les plus longs d'abord) par leur valeur
    let sub = expr;
    const names = Object.keys(ctx).sort((a, b) => b.length - a.length);
    for (const n of names) sub = sub.replace(new RegExp('\\b' + n + '\\b', 'g'), '(' + ctx[n] + ')');
    // s'il reste des lettres (réf non résolue / macro), on skip
    if (/[A-Za-z_]/.test(sub.replace(/0x[0-9A-Fa-f]+/g, ''))) continue;
    // arithmétique C → JS : + - * % ( ) << >> et hex. (pas de / dans ces fichiers.)
    let val;
    try { val = Function('"use strict";return (' + sub + ')')(); } catch { continue; }
    if (typeof val !== 'number' || !Number.isInteger(val)) continue;
    ctx[name] = val;
    order.push(name);
  }
  return { ctx, order };
}

function emit(path, ctx, order, prefixes) {
  let out = '// AUTO-GÉNÉRÉ par scripts/gen-event-data-ids.mjs — résolution 1:1 des #define\n';
  out += '// de la décomp (' + path.split('/').pop() + '). Valeurs numériques résolues. NE PAS éditer à la main.\n\n';
  for (const name of order) {
    if (!prefixes.some(p => name.startsWith(p))) continue;
    out += `export const ${name} = ${ctx[name]};\n`;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, out);
  return order.filter(n => prefixes.some(p => n.startsWith(p))).length;
}

const flags = resolveFile(DECOMP + '/flags.h');
const vars = resolveFile(DECOMP + '/vars.h');

const nFlags = emit('src/game/include/constants/flags.ts', flags.ctx, flags.order,
  ['FLAG_', 'TEMP_FLAGS_', 'SYSTEM_FLAGS_', 'TRAINER_FLAGS_', 'TRAINER_REGISTERED_FLAGS_',
   'DAILY_FLAGS_', 'SPECIAL_FLAGS_', 'FLAGS_COUNT', 'NUM_']);
const nVars = emit('src/game/include/constants/vars.ts', vars.ctx, vars.order,
  ['VAR_', 'VARS_', 'TEMP_VARS_', 'SPECIAL_VARS_', 'NUM_']);

// ─── VÉRIFICATION (ids connus du décomp) ───────────────────────────────────
const checks = [
  ['FLAG_TEMP_1', flags.ctx.FLAG_TEMP_1, 1],
  ['SPECIAL_FLAGS_START', flags.ctx.SPECIAL_FLAGS_START, 0x4000],
  ['TRAINER_FLAGS_START', flags.ctx.TRAINER_FLAGS_START, 0x500],
  ['FLAGS_COUNT', flags.ctx.FLAGS_COUNT, undefined],
  ['VAR_TEMP_0', vars.ctx.VAR_TEMP_0, 0x4000],
  ['VAR_RESULT', vars.ctx.VAR_RESULT, 0x800D],
  ['VAR_FACING', vars.ctx.VAR_FACING, 0x800C],
  ['VARS_START', vars.ctx.VARS_START, 0x4000],
  ['SPECIAL_VARS_START', vars.ctx.SPECIAL_VARS_START, 0x8000],
];
console.log(`flags résolus: ${nFlags}, vars résolus: ${nVars}`);
let ok = true;
for (const [n, got, want] of checks) {
  const status = want === undefined ? '(info)' : (got === want ? 'OK' : 'MISMATCH');
  if (want !== undefined && got !== want) ok = false;
  console.log(`  ${n} = ${got}${got !== undefined ? ' (0x' + got.toString(16) + ')' : ''} ${want !== undefined ? 'attendu ' + want : ''} → ${status}`);
}
console.log(ok ? 'VÉRIF: tous OK ✓' : 'VÉRIF: ÉCHEC ✗');
