/**
 * script-opcodes-random.ts — opcode `random` 1:1 décomp `random.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:479-485` :
 *   `ScrCmd_random` : VarSet(VAR_RESULT, Random() % limit).
 */

import { registerOpcode } from './script-runtime';
import { VarSet, VarGet } from './script-vars';
import { Random } from '../../random';

// 1:1 décomp `ScrCmd_random` (scrcmd.c:479-485) :
//   u16 max = VarGet(ScriptReadHalfword(ctx));
//   gSpecialVar_Result = Random() % max;
// `Random()` = LCG décomp (gRngValue, déterministe/reproductible) — PAS Math.random()
// (qui cassait le 1:1 RNG : audit opcodes pilote 2026-06-21).
registerOpcode('random', (_ctx, args) => {
  const max = VarGet(args[0] ?? '0');
  VarSet('VAR_RESULT', Random() % max);
  return false;
});
