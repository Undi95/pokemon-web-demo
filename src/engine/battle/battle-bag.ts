/**
 * battle/battle-bag.ts — Port 1:1 strict des handlers Battle Bag in-battle.
 *
 * Source de vérité décomp :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/item_use.c:949-1061` — handlers
 *     ItemUseInBattle_PokeBall / _StatIncrease / _Medicine / _PPRecovery /
 *     _Escape (5 handlers + _SacredAsh unused).
 *   - `D:/Projet 1/decomps/pokeemeraude/src/item_menu.c:1997-2004` —
 *     ItemMenu_UseInBattle dispatch.
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_controller_player.c:2653-2663`
 *     — PlayerHandleChooseItem (entry).
 *   - `D:/Projet 1/decomps/pokeemeraude/src/party_menu.c:5781-5786` —
 *     ChooseMonForInBattleItem (= party screen for healing items).
 *
 * Handlers :
 *   1. PokeBall  — capture wild, RemoveBagItem + close bag
 *   2. StatIncrease (X Attack/X Defense/Guard Spec/Dire Hit) —
 *      ExecuteTableBasedItemEffect + show message + close bag
 *   3. Medicine (Potion/Antidote/Awakening/etc.) — set ItemUseCB_Medicine
 *      → show party menu → apply to chosen mon
 *   4. PPRecovery (Ether/Max Ether/Elixir/Max Elixir) — set ItemUseCB_PPRecovery
 *      → party menu → choose move → restore PP
 *   5. Escape (Fluffy Tail/Poke Doll) — wild only, RemoveUsedItem + escape msg
 */

import { gBattleTypeFlags, gBattlerInMenuId, gBattlerPartyIndexes } from './state';
import { gSpecialVar } from '../script/script-vars';
import { BATTLE_TYPE_TRAINER } from './constants';
import { PokemonUseItemEffects } from '../bag/bag-item-effects';
import { RemoveBagItem, GetBagItemQuantity } from '../bag/bag';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { ShowFieldMessage } from '../field/field-message-box';
import { PlaySE } from '../system/decomp-globals';

/** 1:1 décomp `SE_USE_ITEM` (constants/songs.h:33). */
const SE_USE_ITEM = 4;

/** 1:1 décomp `gText_BoxFull` (battle_message.c). */
const gText_BoxFull_FR = 'La boîte PC est pleine!';

/** 1:1 décomp `gText_WontHaveEffect`. */
const gText_WontHaveEffect_FR = "Ça n'a aucun effet.";

/** 1:1 décomp `gText_DadsAdvice` (= "Maman aimerait pas que tu utilises ça en pleine bataille!"). */
const gText_DadsAdvice_FR = "C'est pas le moment d'utiliser ça!";

/** 1:1 décomp `IsPlayerPartyAndPokemonStorageFull()` (pokemon_storage_system.c). */
function IsPlayerPartyAndPokemonStorageFull(): boolean {
  // Check si party full ET PC boxes full.
  const party = gSaveBlock1Ptr.playerParty;
  if (!party || party.length < 6 || party.some(m => !m || (m as { species?: string }).species === undefined)) {
    return false;  // party has empty slot
  }
  // Check PC boxes — pour now assume non-full (= can always catch).
  // Cascade : pokemon_storage_system.c CountStorageNonEmptyBoxes etc.
  return false;
}

/** 1:1 décomp `CurrentBattlePyramidLocation()`. Returns PYRAMID_LOCATION_NONE
 *  hors Battle Pyramid (= toujours pour notre cas). */
function CurrentBattlePyramidLocation(): number {
  return 0;  // PYRAMID_LOCATION_NONE
}

/** Result d'un battle item handler. Le caller (= battle-flow) lit le state
 *  pour décider le state machine next (= close bag, party menu, etc.). */
export interface BattleBagItemResult {
  /** True si l'item a été utilisé avec succès (= bag close + turn consumed). */
  used: boolean;
  /** Message FR à afficher (= passé via ShowFieldMessage). */
  message?: string;
  /** Si true, ouvre party menu pour choisir mon target (= Medicine, PPRecovery). */
  needsPartySelect?: boolean;
  /** Callback type pour ItemUseCB (= ItemUseCB_Medicine, _PPRecovery, etc.). */
  itemUseCB?: 'Medicine' | 'PPRecovery' | 'SacredAsh';
  /** Si true, force escape outcome (= Fluffy Tail wild battle). */
  forceEscape?: boolean;
}

/** 1:1 décomp `ItemUseInBattle_PokeBall(taskId)` (item_use.c:949-967).
 *
 *  Pokeballs : if party + PC full → "BoxFull" message, else remove item
 *  + close bag (= ball throw anim cascade via Cmd_handleballthrow bytecode). */
export function ItemUseInBattle_PokeBall(itemId: string | number): BattleBagItemResult {
  if (IsPlayerPartyAndPokemonStorageFull()) {
    return { used: false, message: gText_BoxFull_FR };
  }
  RemoveBagItem(itemId as never, 1);
  // 1:1 décomp : Task_FadeAndCloseBagMenu — fait fade + close.
  return { used: true };
}

/** 1:1 décomp `ItemUseInBattle_StatIncrease(taskId)` (item_use.c:994-1010).
 *
 *  X Attack / X Defense / X Speed / X Special / X Accuracy / Guard Spec /
 *  Dire Hit. Apply ExecuteTableBasedItemEffect (= boost stat stages of
 *  attacker). */
export function ItemUseInBattle_StatIncrease(itemId: string | number): BattleBagItemResult {
  const partyId = gBattlerPartyIndexes[gBattlerInMenuId];
  const playerParty = gSaveBlock1Ptr.playerParty;
  if (!playerParty?.[partyId]) {
    return { used: false, message: gText_WontHaveEffect_FR };
  }
  // 1:1 décomp ExecuteTableBasedItemEffect — invoque PokemonUseItemEffects
  // qui handle stat stage boost via item effect flags (= ITEM_EFFECT_X_ATTACK etc.).
  // Returns true si NO EFFECT (= matches inverted convention décomp).
  const noEffect = PokemonUseItemEffects(
    playerParty[partyId] as never,
    typeof itemId === 'string' ? itemId : `ITEM_${itemId}`,
    partyId, 0, true,  // usedByAI=true → battle path
  );
  if (noEffect) {
    return { used: false, message: gText_WontHaveEffect_FR };
  }
  // Trigger SE + RemoveBagItem.
  PlaySE(SE_USE_ITEM);
  RemoveBagItem(itemId as never, 1);
  // 1:1 décomp : UseStatIncreaseItem returns le message text spécifique
  // (= "X Attack lifted X's Attack!"). Simplifié pour now FR generic.
  return { used: true, message: 'Effet appliqué!' };
}

/** 1:1 décomp `ItemUseInBattle_Medicine(taskId)` (item_use.c:1026-1030).
 *
 *  Potion / Super Potion / Hyper Potion / Max Potion / Full Restore / Revive
 *  / Antidote / Awakening / Burn Heal / Ice Heal / Paralyze Heal / Full Heal.
 *  Show party menu for target selection. */
export function ItemUseInBattle_Medicine(_itemId: string | number): BattleBagItemResult {
  return { used: false, needsPartySelect: true, itemUseCB: 'Medicine' };
}

/** 1:1 décomp `ItemUseInBattle_PPRecovery(taskId)` (item_use.c:1039-1043).
 *
 *  Ether / Max Ether / Elixir / Max Elixir. Party menu → choose mon + move. */
export function ItemUseInBattle_PPRecovery(_itemId: string | number): BattleBagItemResult {
  return { used: false, needsPartySelect: true, itemUseCB: 'PPRecovery' };
}

/** 1:1 décomp `ItemUseInBattle_Escape(taskId)` (item_use.c:1046-1061).
 *
 *  Fluffy Tail / Poke Doll. Wild only — instant escape. Trainer battle =
 *  "Dad's advice" message (= can't use in trainer fights). */
export function ItemUseInBattle_Escape(itemId: string | number): BattleBagItemResult {
  if (gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
    return { used: false, message: gText_DadsAdvice_FR };
  }
  RemoveBagItem(itemId as never, 1);
  return { used: true, forceEscape: true, message: 'Vous prenez la fuite!' };
}

/** Dispatcher : choose le bon handler depuis l'itemId selon son battleUseFunc.
 *  Mapping basé sur item_use.c convention (= gItems[itemId].battleUseFunc).
 *
 *  TODO : data extraction des `battleUseFunc` par-item depuis item.h pour
 *  resolution complète (= ~100 items). Pour now : match par catégorie d'item ID. */
export function DispatchBattleBagItem(itemId: string | number): BattleBagItemResult {
  const idStr = typeof itemId === 'string' ? itemId : `ITEM_${itemId}`;
  // PokeBall family (= ITEM_MASTER_BALL .. ITEM_PREMIER_BALL).
  if (idStr.endsWith('_BALL') || idStr === 'ITEM_MASTER_BALL') {
    return ItemUseInBattle_PokeBall(idStr);
  }
  // Escape items.
  if (idStr === 'ITEM_FLUFFY_TAIL' || idStr === 'ITEM_POKE_DOLL') {
    return ItemUseInBattle_Escape(idStr);
  }
  // Stat increase items.
  if (idStr.startsWith('ITEM_X_') || idStr === 'ITEM_GUARD_SPEC' || idStr === 'ITEM_DIRE_HIT') {
    return ItemUseInBattle_StatIncrease(idStr);
  }
  // PP recovery.
  if (idStr === 'ITEM_ETHER' || idStr === 'ITEM_MAX_ETHER'
      || idStr === 'ITEM_ELIXIR' || idStr === 'ITEM_MAX_ELIXIR') {
    return ItemUseInBattle_PPRecovery(idStr);
  }
  // Default = Medicine (Potion/Antidote/etc.).
  return ItemUseInBattle_Medicine(idStr);
}

/** Devtools expose. */
(globalThis as Record<string, unknown>).__battleBag = {
  ItemUseInBattle_PokeBall, ItemUseInBattle_StatIncrease,
  ItemUseInBattle_Medicine, ItemUseInBattle_PPRecovery,
  ItemUseInBattle_Escape, DispatchBattleBagItem,
};

void GetBagItemQuantity;
void gSpecialVar;
void ShowFieldMessage;
