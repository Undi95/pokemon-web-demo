/**
 * script-opcodes-random.ts — opcode `random` 1:1 décomp `random.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:479-485` :
 *   `ScrCmd_random` : VarSet(VAR_RESULT, Random() % limit).
 */

import { registerOpcode } from './script-runtime';
import { VarSet } from './script-vars';
import { parseValue } from './script-opcodes-helpers';

// 1:1 décomp `ScrCmd_random` — RNG result into VAR_RESULT. Range = args[0].
registerOpcode('random', (_ctx, args) => {
  const range = parseValue(args[0]);
  const r = Math.floor(Math.random() * Math.max(1, range));
  VarSet('VAR_RESULT', r);
  return false;
});
