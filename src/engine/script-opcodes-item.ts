/**
 * script-opcodes-item.ts — opcodes item 1:1 décomp `item.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` :
 *   `ScrCmd_additem`        (l. 487-494) : gSpecialVar_Result = AddBagItem(item, qty).
 *   `ScrCmd_removeitem`     (l. 496-503) : gSpecialVar_Result = RemoveBagItem(item, qty).
 *   `ScrCmd_checkitemspace` (l. 505-512) : gSpecialVar_Result = CheckBagHasSpace(item, qty).
 *   `ScrCmd_checkitem`      (l. 514-521) : gSpecialVar_Result = CheckBagHasItem(item, qty).
 *   `ScrCmd_checkitemtype`  (l. 523-529) : gSpecialVar_Result = GetPocketByItemId(item).
 *   `ScrCmd_finditem`       (= bspecialvar dispatch dans `field_specials.c`).
 *
 * Plus la macro `giveitem` (event.inc) = additem + msgbox + fanfare ; nous ne
 * portons que additem (= le msgbox+fanfare sont déjà dans le script qui appelle).
 */

import { registerOpcode } from './script-runtime';
import { VarGet, VarSet, gSpecialVar } from './script-vars';
import { AddBagItem, RemoveBagItem, CheckBagHasItem } from './bag';
import { resolveDecompConstant } from './decomp-constants';
import { parseValue, resolveCount } from './script-opcodes-helpers';

/** 1:1 décomp `giveitem` macro = additem + msgbox + fanfare. On ne porte que
 *  additem (= les msgbox+fanfare sont déjà dans le script appelant). */
registerOpcode('giveitem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  const ok = AddBagItem(itemKey, count);
  VarSet('VAR_RESULT', ok ? 1 : 0);
  console.log(`[opcode giveitem] ${itemKey} x${count} → ${ok ? 'ok' : 'failed'}`);
  return false;
});

/** 1:1 décomp `ScrCmd_additem` (scrcmd.c:487-494).
 *    `additem ITEMID, QUANTITY` → AddBagItem + set gSpecialVar_Result. */
registerOpcode('additem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  const ok = AddBagItem(itemKey, count);
  // 1:1 décomp : gSpecialVar_Result = AddBagItem(...). On set VAR_RESULT.
  VarSet('VAR_RESULT', ok ? 1 : 0);
  console.log(`[opcode additem] ${itemKey} x${count} → ${ok ? 'ok' : 'FAILED (bag full?)'}`);
  return false;
});

/** 1:1 décomp `ScrCmd_removeitem` (scrcmd.c:496-503). */
registerOpcode('removeitem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  const ok = RemoveBagItem(itemKey, count);
  VarSet('VAR_RESULT', ok ? 1 : 0);
  console.log(`[opcode removeitem] ${itemKey} x${count} → ${ok ? 'ok' : 'FAILED (not enough)'}`);
  return false;
});

/** 1:1 décomp `ScrCmd_checkitem` (scrcmd.c:514-521) : true si bag has au moins count. */
registerOpcode('checkitem', (_ctx, args) => {
  const itemKey = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  VarSet('VAR_RESULT', CheckBagHasItem(itemKey, count) ? 1 : 0);
  return false;
});

/** 1:1 décomp `ScrCmd_checkitemspace` (scrcmd.c:505-512) :
 *    gSpecialVar_Result = CheckBagHasSpace(item, qty);
 *  Notre port : retourne toujours true (= bag rarely full en démo).
 *  Dette : porter `CheckBagHasSpace` 1:1 item.c en session dédiée. */
registerOpcode('checkitemspace', (_ctx) => {
  VarSet('VAR_RESULT', 1);
  return false;
});

/** 1:1 décomp `ScrCmd_checkitemtype` (scrcmd.c:523-529) :
 *    gSpecialVar_Result = GetPocketByItemId(item).
 *  POCKET_ITEMS=1, KEY_ITEMS=2, POKE_BALLS=3, TM_HM=4, BERRIES=5.
 *  Notre port : retourne toujours POCKET_ITEMS (= MVP, item→pocket lookup à porter). */
registerOpcode('checkitemtype', (_ctx, args) => {
  const itemArg = args[0] ?? '';
  void itemArg;
  VarSet('VAR_RESULT', 1);
  return false;
});

/** 1:1 décomp `ScrCmd_finditem` (= bspecialvar field_specials.c) :
 *    itemId = VarGet(args[0]);
 *    amount = VarGet(args[1]);
 *    if (AddBagItem(itemId, amount)) gSpecialVar_Result = 0;
 *    else gSpecialVar_Result = 1;  // bag full
 *
 *  Audit session 126 LOT D4 : avant stub, maintenant vraie impl. Le UI
 *  "X obtained!" + SE_PIN est handled par le script qui appelle finditem. */
registerOpcode('finditem', (_ctx, args) => {
  const itemArg = args[0] ?? '';
  const amount = parseValue(args[1] ?? '1') || 1;
  // Resolve itemId : si literal ITEM_X → resolveDecompConstant ; sinon VarGet.
  let itemId = 0;
  if (itemArg.startsWith('ITEM_')) {
    itemId = resolveDecompConstant(itemArg) ?? 0;
  } else {
    itemId = VarGet(itemArg);
  }
  if (itemId > 0 && AddBagItem(itemArg, amount)) {
    gSpecialVar.Result = 0;  // success
  } else {
    gSpecialVar.Result = 1;  // bag full / invalid
  }
  return false;
});
