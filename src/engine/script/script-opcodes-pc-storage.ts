/**
 * script-opcodes-pc-storage.ts — opcodes `addpcitem` + `checkpcitem` 1:1 décomp
 * `pokemon_storage_system.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:531-547` :
 *   `ScrCmd_addpcitem`  : gSpecialVar_Result = AddPCItem(itemId, quantity).
 *   `ScrCmd_checkpcitem` : gSpecialVar_Result = CheckPCHasItem(itemId, quantity).
 *
 * `pokemon_storage_system.c` (Bill PC storage + PC items) — partiellement
 * porté dans `pc-items.ts` (= AddPCItem). `CheckPCHasItem` lookup à porter.
 */

import { registerOpcode } from './script-runtime';
import { VarSet } from './script-vars';
import { parseValue } from './script-opcodes-helpers';

/** 1:1 décomp `ScrCmd_addpcitem` (scrcmd.c:531-539) :
 *    gSpecialVar_Result = AddPCItem(itemId, quantity);
 *  Ajoute des items au PC du joueur (= gSaveBlock1Ptr->pcItems, pas le bag).
 *  Délégué à `pc-items.ts:AddPCItem` (= port 1:1). */
registerOpcode('addpcitem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const qty = parseValue(args[1]);
  // Lazy import to avoid circular dep with bedroom-pc → script-runtime → script-opcodes.
  void import('../pc-items').then(({ AddPCItem }) => {
    const ok = AddPCItem(itemKey, qty);
    VarSet('VAR_RESULT', ok ? 1 : 0);
  });
  return false;
});

/** 1:1 décomp `ScrCmd_checkpcitem` (scrcmd.c:540-547) :
 *    gSpecialVar_Result = CheckPCHasItem(itemId, quantity);
 *  Notre port : `CheckPCHasItem` pas encore porté → VAR_RESULT = 0 (= no PC items).
 *  Dette : porter `CheckPCHasItem` dans `pc-items.ts` 1:1 strict. */
registerOpcode('checkpcitem', (_ctx, _args) => {
  VarSet('VAR_RESULT', 0); // No PC items implemented
  return false;
});
