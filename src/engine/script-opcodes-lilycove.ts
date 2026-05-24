/**
 * script-opcodes-lilycove.ts — opcode `buffercontestname` 1:1 décomp
 * `lilycove_lady.c` (via macro buffercontestname → BufferContestName).
 *
 * Source de vérité :
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:1635-1642` :
 *     `ScrCmd_buffercontestname`  :
 *       u8 stringVarIndex = ScriptReadByte(ctx);
 *       u16 category = VarGet(ScriptReadHalfword(ctx));
 *       BufferContestName(sScriptStringVars[stringVarIndex], category);
 *   `D:/Projet 1/decomps/pokeemeraude/src/lilycove_lady.c:721` :
 *     `BufferContestName(dest, category)` = StringCopy(dest, sContestNames[category]).
 *   `D:/Projet 1/decomps/pokeemeraude/strings.c:616-620` :
 *     Strings FR `gText_{Coolness,Beauty,Cuteness,Smartness,Toughness}Contest`.
 */

import { registerOpcode } from './script-runtime';
import { setStringVar } from './string-buffers';
import { parseValue } from './script-opcodes-helpers';

// 1:1 décomp `sContestNames[]` (data/lilycove_lady.h:452, indexé
// CONTEST_CATEGORY_* global.h:86 = COOL 0/BEAUTY 1/CUTE 2/SMART 3/TOUGH 4)
// → gText_{Coolness,Beauty,Cuteness,Smartness,Toughness}Contest, strings FR
// décomp strings.c:616-620 (texte ROM FR cité ligne-par-ligne, PAS un enum
// dérivable → hardcode 1:1 documenté).
const sContestNames = [
  'SANG-FROID',   // [CONTEST_CATEGORY_COOL]   gText_CoolnessContest  strings.c:616
  'BEAUTE',       // [CONTEST_CATEGORY_BEAUTY] gText_BeautyContest    strings.c:617
  'GRACE',        // [CONTEST_CATEGORY_CUTE]   gText_CutenessContest  strings.c:618
  'INTELLIGENCE', // [CONTEST_CATEGORY_SMART]  gText_SmartnessContest strings.c:619
  'ROBUSTESSE',   // [CONTEST_CATEGORY_TOUGH]  gText_ToughnessContest strings.c:620
] as const;

// 1:1 décomp `ScrCmd_buffercontestname` (scrcmd.c:1635-1642).
// Mal classé auparavant dans _otherVmStubs (= no-op) alors que c'est un field
// scrcmd réel → {STR_VAR_N} restait vide dans les dialogs Contest.
registerOpcode('buffercontestname', (_ctx, args) => {
  const n = parseValue(args[0]) || 1;
  const category = parseValue(args[1]);
  setStringVar(n, sContestNames[category] ?? '');
  return false;
});
