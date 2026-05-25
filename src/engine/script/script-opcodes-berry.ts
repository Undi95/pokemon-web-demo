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
import { gSaveBlock1Ptr } from '../save-block-state';
import { parseValue } from './script-opcodes-helpers';

/** Accès au tableau gSaveBlock1Ptr->berryTrees (1:1 décomp save_block.h). */
function _berryTreesArr(): Array<{ berry: number; stage: number; minutesUntilNextStage?: number; berryYield?: number; regrowthCount?: number; watered1?: number; watered2?: number; watered3?: number; watered4?: number; stopGrowth?: number }> | undefined {
  return gSaveBlock1Ptr?.berryTrees;
}

// 1:1 décomp `ScrCmd_setberrytree` — set berry tree state. 160x usage but
// only outdoor maps with berry trees. MVP no-op enregistré en stub early —
// puis le real impl ci-dessous écrase (= last-wins Map.set).
registerOpcode('setberrytree', (_ctx, _args) => false);

registerOpcode('setberrytree', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setberrytree (scrcmd.c:2000) :
  //   PlantBerryTree(treeId, berry, growthStage, FALSE).
  const treeId = parseValue(args[0] ?? '0');
  const berry = parseValue(args[1] ?? '0');
  const growthStage = parseValue(args[2] ?? '0');
  const trees = _berryTreesArr();
  if (trees && treeId >= 0 && treeId < trees.length) {
    trees[treeId].berry = berry;
    trees[treeId].stage = growthStage;
    trees[treeId].minutesUntilNextStage = 0;
    trees[treeId].watered1 = 0;
    trees[treeId].watered2 = 0;
    trees[treeId].watered3 = 0;
    trees[treeId].watered4 = 0;
    trees[treeId].berryYield = 0;
    trees[treeId].regrowthCount = 0;
    trees[treeId].stopGrowth = 0;
  }
  return false;
});
