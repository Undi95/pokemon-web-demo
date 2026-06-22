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
import { AddBagItem, RemoveBagItem, CheckBagHasItem, CheckBagHasSpace } from '../bag/bag';
import { resolveDecompConstant, reverseDecompConstant } from '../../../harness/runtime/decomp-constants';
import { getItem } from '../../../harness/runtime/data-tables';
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

/** 1:1 décomp `ScrCmd_removeitem` (scrcmd.c:496-503). L'item peut être un literal
 *  `ITEM_X` OU une var (`removeitem VAR_ITEM_ID` = la baie choisie via Bag_ChooseBerry)
 *  → résoudre VAR→id→itemKey (même pattern que checkitemspace/checkitemtype). */
registerOpcode('removeitem', (_ctx, args) => {
  const itemArg = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  let itemKey = itemArg;
  if (!itemKey.startsWith('ITEM_')) {
    const itemId = VarGet(itemArg);
    itemKey = reverseDecompConstant(itemId, 'ITEM_') ?? '';
  }
  const ok = RemoveBagItem(itemKey, count);
  VarSet('VAR_RESULT', ok ? 1 : 0);
  console.log(`[opcode removeitem] ${itemArg} (${itemKey}) x${count} → ${ok ? 'ok' : 'FAILED (not enough)'}`);
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
 *  CheckBagHasSpace porté 1:1 item.c:179 dans bag.ts. */
registerOpcode('checkitemspace', (_ctx, args) => {
  const itemArg = args[0] ?? '';
  const count = resolveCount(args[1] ?? '1');
  // Resolve itemArg → itemKey (= si VAR_X, lookup vers ITEM_X).
  let itemKey = itemArg;
  if (!itemKey.startsWith('ITEM_')) {
    const itemId = VarGet(itemArg);
    itemKey = reverseDecompConstant(itemId, 'ITEM_') ?? '';
  }
  VarSet('VAR_RESULT', CheckBagHasSpace(itemKey, count) ? 1 : 0);
  return false;
});

/** 1:1 décomp `ScrCmd_checkitemtype` (scrcmd.c:523-529) :
 *    gSpecialVar_Result = GetPocketByItemId(itemId);
 *  Source POCKET_* enum (item.h:5-10) — 1-based :
 *    POCKET_NONE=0, POCKET_ITEMS=1, POCKET_POKE_BALLS=2, POCKET_TM_HM=3,
 *    POCKET_BERRIES=4, POCKET_KEY_ITEMS=5. */
registerOpcode('checkitemtype', (_ctx, args) => {
  const itemArg = args[0] ?? '';
  // Resolve itemArg : si literal ITEM_X → direct itemKey ; sinon VarGet → reverseDecompConstant.
  let itemKey = itemArg;
  if (!itemKey.startsWith('ITEM_')) {
    const itemId = VarGet(itemArg);
    itemKey = reverseDecompConstant(itemId, 'ITEM_') ?? '';
  }
  let pocketResult = 0;  // POCKET_NONE par défaut
  if (itemKey) {
    const item = getItem(itemKey);
    if (item && item.pocket) {
      // 1:1 mapping items.json pocket string → POCKET_* enum 1-based (item.h:5-10).
      switch (item.pocket) {
        case 'POCKET_ITEMS':       pocketResult = 1; break;
        case 'POCKET_POKE_BALLS':  pocketResult = 2; break;
        case 'POCKET_TM_HM':       pocketResult = 3; break;
        case 'POCKET_BERRIES':     pocketResult = 4; break;
        case 'POCKET_KEY_ITEMS':   pocketResult = 5; break;
        // POCKET_NONE → 0 (= default)
      }
    }
  }
  VarSet('VAR_RESULT', pocketResult);
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
