/**
 * script-opcodes-match-call.ts — opcode `register_matchcall` 1:1 décomp `match_call.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/match_call.c`.
 * Le décomp utilise une macro `register_matchcall trainer` qui set un bit dans
 * `gMatchCallTrainerFlags` pour que le trainer puisse rappeler pour rematch.
 * 152x usage post-battle des dresseurs early-game.
 *
 * MVP : on stocke un Set globalThis.__matchCallTrainers en attendant que le
 * système match-call soit porté.
 */

import { registerOpcode } from './script-runtime';

// 1:1 décomp `register_matchcall` (= match_call.c) : sets `gMatchCallTrainerFlags`
// bit pour que le trainer puisse rappeler pour rematch.
registerOpcode('register_matchcall', (_ctx, args) => {
  const trainerName = args[0] ?? '';
  const g = globalThis as Record<string, unknown>;
  if (!g.__matchCallTrainers) g.__matchCallTrainers = new Set<string>();
  (g.__matchCallTrainers as Set<string>).add(trainerName);
  console.log(`[opcode register_matchcall] '${trainerName}' registered for rematch`);
  return false;
});
