/**
 * script-opcodes-berry.ts — opcode `setberrytree` 1:1 décomp `berry.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:1923-1935`
 *   `ScrCmd_setberrytree` : PlantBerryTree(treeId, berry, growthStage, FALSE).
 *
 * Et `D:/Projet 1/decomps/pokeemeraude/src/berry.c` : table sSaveBlock1Ptr->
 * berryTrees + helper PlantBerryTree.
 */

import { registerOpcode } from './script-runtime';
import { parseValue } from './script-opcodes-helpers';
import { PlantBerryTree } from '../pokemon/berry';

// 1:1 STRICT décomp `ScrCmd_setberrytree` (scrcmd.c:1923-1934) :
//   u8 treeId = ScriptReadByte(ctx);
//   u8 berry  = ScriptReadByte(ctx);
//   u8 growthStage = ScriptReadByte(ctx);
//   PlantBerryTree(treeId, berry, growthStage, FALSE);   // les 2 branches identiques
//   return FALSE;
// (Avant : un inline DIVERGENT mettait stopGrowth=0/berryYield=0/minutesUntilNextStage=0
//  au lieu d'appeler PlantBerryTree → baies non figées + yield faux.)
registerOpcode('setberrytree', (_ctx, args) => {
  const treeId = parseValue(args[0] ?? '0');
  const berry = parseValue(args[1] ?? '0');
  const growthStage = parseValue(args[2] ?? '0');
  PlantBerryTree(treeId, berry, growthStage, false);
  return false;
});
