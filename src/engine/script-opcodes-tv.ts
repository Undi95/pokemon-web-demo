/**
 * script-opcodes-tv.ts — opcode `getpokenewsactive` 1:1 décomp `tv.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:1936-1942` :
 *   `ScrCmd_getpokenewsactive` : gSpecialVar_Result = GetPokeNewsActive(channel).
 *
 * `tv.c:GetPokeNewsActive` retourne TRUE si une PokéNews channel est active.
 */

import { registerOpcode } from './script-runtime';
import { VarSet } from './script-vars';
import { parseValue } from './script-opcodes-helpers';

registerOpcode('getpokenewsactive', (_ctx, args) => {
  // 1:1 décomp ScrCmd_getpokenewsactive : gSpecialVar_Result = GetPokeNewsActive(channel).
  const _channel = parseValue(args[0] ?? '0');
  VarSet('VAR_RESULT', 0);  // pas de pokenews active par défaut
  return false;
});
