/**
 * item-use-callbacks.ts — Substrat shared bag↔party pour items à effet sur
 * un Pokémon. 1:1 décomp `item_use.c` (SetUpItemUseCallback) + `party_menu.c`
 * (ItemUseCB_Medicine + dispatch PARTY_ACTION_USE_ITEM).
 *
 * Flow 1:1 (item Medicine ex POTION) :
 *   1. User press A sur Medicine in bag, ctx menu UTILIS. → dispatcher
 *      `ItemMenu_UseOutOfBattle` → `ItemUseOutOfBattle_Medicine(taskId)` :
 *           gItemUseCB = ItemUseCB_Medicine;
 *           SetUpItemUseCallback(taskId);   // (item_use.c:755)
 *
 *   2. SetUpItemUseCallback (item_use.c:98) :
 *           type = GetItemType(itemId) - 1;
 *           gBagMenu->newScreenCallback = sItemUseCallbacks[type];
 *           Task_FadeAndCloseBagMenu(taskId);
 *      → bag fade out, puis SetMainCallback2(newScreenCallback) = ouvre
 *      `CB2_ShowPartyMenuForItemUse` (party_menu.c:4225-4274).
 *
 *   3. CB2_ShowPartyMenuForItemUse :
 *           InitPartyMenu(FIELD, SINGLE, PARTY_ACTION_USE_ITEM, ...,
 *                         PARTY_MSG_USE_ON_WHICH_MON,
 *                         Task_HandleChooseMonInput, CB2_ReturnToBagMenu);
 *      → party-screen ouvert, msg "Utiliser sur quel POKéMON ?".
 *
 *   4. User select un mon : Task_HandleChooseMonInput dispatch
 *      PARTY_ACTION_USE_ITEM (party_menu.c:1309) :
 *           PartyMenuRemoveWindow(&sPartyMenuInternal->windowId[1]);
 *           gItemUseCB(taskId, Task_ClosePartyMenuAfterText);
 *
 *   5. ItemUseCB_Medicine (party_menu.c:4396) :
 *           mon = &gPlayerParty[gPartyMenu.slotId];
 *           ApplyMedicineEffect(item, mon)  // 1:1-sem
 *           Si cannotUse → "Ça n'aura aucun effet." gText_WontHaveEffect
 *           Sinon → RemoveBagItem(item, 1) + message FR selon type
 *
 *   6. Task_ClosePartyMenuAfterText → SetMainCallback2(gPartyMenu.
 *      exitCallback) = CB2_ReturnToBagMenu → bag rouvert à la position
 *      d'avant.
 *
 *  Module leaf : importé par bag-menu-ctx (Medicine handler), pas l'inverse.
 */

import { gameState } from './game-state';
import { gSpecialVar } from './script-vars';
import { ApplyMedicineEffect } from './bag-item-effects';
import { getItem as _getItem, getItemKeyById } from './data-tables';
import { GetItemType } from './decomp-bridge';
import {
  gBagMenu,
  Task_FadeAndCloseBagMenu,
  GoToBagMenu,
  ITEMMENULOCATION_LAST,
} from './bag-menu';
import {
  OpenPartyScreenForItemUse,
  GetPartyScreenSlotId,
  ClosePartyScreen,
} from './party-screen';
import type { DecompTask } from './decomp-runtime';
import type { PokemonInstance } from './pokemon';
import { getRuntime } from './decomp-globals';

// ─── gItemUseCB registry global (1:1 décomp party_menu.c:234) ────────────────
// `COMMON_DATA void (*gItemUseCB)(u8, TaskFunc) = NULL;`
// Assigné par ItemUseOutOfBattle_Medicine / ItemUseOutOfBattle_PPRecovery / etc.
// Lu par Task_HandleChooseMonInput case PARTY_ACTION_USE_ITEM.
export type ItemUseCB = (taskId: number, returnTask: ((task: DecompTask) => void) | null) => void;
export let gItemUseCB: ItemUseCB | null = null;
export function setItemUseCB(cb: ItemUseCB | null): void {
  gItemUseCB = cb;
  // Expose pour party-screen.ts (lit via globalThis pour éviter cycle import).
  (globalThis as Record<string, unknown>).gItemUseCB = cb;
}

// ─── CB2_ReturnToBagMenu (item_menu.c:2006) ─────────────────────────────────
// `GoToBagMenu(ITEMMENULOCATION_LAST, POCKETS_COUNT, NULL)` — réouvre le sac
// à la position d'avant (poche + scroll + curseur conservés via gBagPosition).
export function CB2_ReturnToBagMenu(): void {
  const POCKETS_COUNT = 5;
  GoToBagMenu(ITEMMENULOCATION_LAST, POCKETS_COUNT, null);
}

// ─── CB2_ShowPartyMenuForItemUse (party_menu.c:4225) ────────────────────────
// 1:1 décomp : ouvre party-screen en mode PARTY_ACTION_USE_ITEM avec msg
// PARTY_MSG_USE_ON_WHICH_MON ("Utiliser sur quel POKéMON ?"). Le retour est
// CB2_ReturnToBagMenu (= reopen bag à la position d'avant).
//
// Le décomp gère aussi le cas ITEM_EFFECT_SACRED_ASH (auto-select 1er mon KO
// + task=Task_SetSacredAshCB). Pas porté : SacredAsh → DadsAdvice fallback.
export function CB2_ShowPartyMenuForItemUse(): void {
  OpenPartyScreenForItemUse(CB2_ReturnToBagMenu);
}

// ─── sItemUseCallbacks[] (item_use.c:82) ─────────────────────────────────────
// `[ITEM_USE_PARTY_MENU - 1]  = CB2_ShowPartyMenuForItemUse,`
// `[ITEM_USE_FIELD - 1]       = CB2_ReturnToField,`
// `[ITEM_USE_PBLOCK_CASE - 1] = NULL,`
// Indexed par `GetItemType(itemId) - 1`.
const _sItemUseCallbacks: Array<(() => void) | null> = [
  CB2_ShowPartyMenuForItemUse,  // ITEM_USE_PARTY_MENU - 1 = 0
  null,  // ITEM_USE_FIELD - 1 = 1 — CB2_ReturnToField (= retour overworld,
         //   posé par caller via gBagPosition.exitCallback, donc null ici OK)
  null,  // ITEM_USE_PBLOCK_CASE - 1 = 2
];

// ─── SetUpItemUseCallback (item_use.c:98) — 1:1 décomp ──────────────────────
// `type = GetItemType(itemId) - 1;`
// `gBagMenu->newScreenCallback = sItemUseCallbacks[type];`
// `Task_FadeAndCloseBagMenu(taskId);`
//
// L'item_use.c branche d'abord sur ITEM_ENIGMA_BERRY (= type = tEnigmaBerryType
// - 1) — pas porté ici (EnigmaBerry = fallback DadsAdvice).
export function SetUpItemUseCallback(task: DecompTask): void {
  const itemId = gSpecialVar.ItemId;
  const itemType = GetItemType(itemId); // 'ITEM_USE_PARTY_MENU' | 'ITEM_USE_FIELD' | ...
  // Map string → index 0..2 (1:1 décomp constants/item.h enum ItemUse).
  let typeIdx = 0;
  if (itemType === 'ITEM_USE_PARTY_MENU') typeIdx = 0;
  else if (itemType === 'ITEM_USE_FIELD') typeIdx = 1;
  else if (itemType === 'ITEM_USE_PBLOCK_CASE') typeIdx = 2;
  if (!gBagMenu) return;
  gBagMenu.newScreenCallback = _sItemUseCallbacks[typeIdx];
  Task_FadeAndCloseBagMenu(task);
}

// ─── RemoveBagItem helper (1:1 sem `RemoveBagItem(itemId, 1)`) ──────────────
// Utilise bag-pockets via gameState. Notre store party utilise les keys
// "POTION" — converter depuis itemId est dans data-tables (= getItemKeyById).
function _itemKeyForId(itemId: number): string | undefined {
  const key = getItemKeyById(itemId);
  return key;
}

function _removeOneFromBag(itemId: number): void {
  const key = _itemKeyForId(itemId);
  if (!key) return;
  // 1:1 décomp RemoveBagItem (item.c:570) — décrémente quantité, supprime
  // le slot si quantity tombe à 0. Notre gameState API : removeItem(key, qty).
  const bag = gameState.bag as unknown as Record<string, unknown>;
  const rm = bag && (bag.removeItem as ((k: string, q: number) => void) | undefined);
  if (typeof rm === 'function') {
    rm.call(bag, key, 1);
    return;
  }
  // Fallback : itère les poches manuellement (pour les pocketSlots typed).
  const pockets = bag as Record<string, Array<{ itemKey: string; quantity: number }>>;
  for (const pname of Object.keys(pockets)) {
    const slots = pockets[pname];
    if (!Array.isArray(slots)) continue;
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].itemKey === key && slots[i].quantity > 0) {
        slots[i].quantity--;
        if (slots[i].quantity === 0) slots.splice(i, 1);
        return;
      }
    }
  }
}

// ─── ItemUseCB_Medicine (party_menu.c:4396) — 1:1-sémantique ────────────────
// Appelé depuis Task_HandleChooseMonInput PARTY_ACTION_USE_ITEM A_BUTTON
// (party_menu.c:1316) avec slotId = mon courant du curseur.
//
// Décomp flow (party_menu.c:4396-4460) :
//   mon = &gPlayerParty[gPartyMenu.slotId];
//   item = gSpecialVar_ItemId;
//   canHeal = IsHPRecoveryItem(item);
//   if (canHeal) {
//       hp = GetMonData(mon, MON_DATA_HP);
//       if (hp == GetMonData(mon, MON_DATA_MAX_HP)) canHeal = FALSE;
//   }
//   cannotUse = ExecuteTableBasedItemEffect_(slotId, item, 0);
//   if (cannotUse) → "Ça n'aura aucun effet." → close
//   else:
//       RemoveBagItem(item, 1);
//       SetPartyMonAilmentGfx(mon, ...);
//       if (canHeal && hp_healed > 0) → "Les PV de X sont restaurés de N pts" → close
//       else (status cured) → GetMedicineItemEffectMessage → close
//
// Nous : ApplyMedicineEffect (1:1-sem) retourne {hpHealed, statusCured,
// cannotUse}. Le message est affiché dans le msgWid party-screen (= bottom
// bar) puis close direct vers CB2_ReturnToBagMenu.
export function ItemUseCB_Medicine(taskId: number, _returnTask: ((task: DecompTask) => void) | null): void {
  void _returnTask;  // (Task_ClosePartyMenuAfterText — pas utilisé directement)
  void taskId;
  const rt = getRuntime();
  if (!rt) return;
  const slotId = GetPartyScreenSlotId();
  const party = gameState.party as PokemonInstance[];
  const mon = party[slotId];
  if (!mon) {
    // 1:1 IsSelectedMonNotEgg FALSE → silent return (= égu garde).
    return;
  }
  const itemId = gSpecialVar.ItemId;
  const result = ApplyMedicineEffect(itemId, mon);
  if (result.cannotUse) {
    // 1:1 :4423 DisplayPartyMenuMessage(gText_WontHaveEffect, TRUE)
    // → "Ça n'aura aucun effet." Le décomp wait l'ack press. Ici on close
    // direct vers bag — le user voit le sac réouvert (= item pas consommé).
    // TODO : afficher msg dans party-screen msgWid avant close (= polish 1:1).
    ClosePartyScreen();
    return;
  }
  // 1:1 :4434 RemoveBagItem(item, 1) — sauf si REUSABLE_ITEM (= pas géré ici).
  _removeOneFromBag(itemId);
  // 1:1 :4440 SetPartyMonAilmentGfx — refresh status icon. Sera repeint à la
  // réouverture du sac → retour → reouverture party (= cycle réinit complet).
  // 1:1 :4447 PartyMenuModifyHP / :4454 GetMedicineItemEffectMessage —
  // anim HP bar + message. Pas porté : direct close.
  ClosePartyScreen();
}

// Expose globals (= gItemUseCB lookup par party-screen, etc.).
{
  const _g: Record<string, unknown> = {
    gItemUseCB,
    SetUpItemUseCallback,
    ItemUseCB_Medicine,
    CB2_ShowPartyMenuForItemUse,
    CB2_ReturnToBagMenu,
  };
  for (const [k, v] of Object.entries(_g)) {
    if (typeof (globalThis as Record<string, unknown>)[k] === 'undefined') {
      (globalThis as Record<string, unknown>)[k] = v;
    }
  }
}
