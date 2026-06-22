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

import { gSpecialVar } from './engine/script/script-vars';
import {
  ApplyMedicineEffect, PokemonUseItemEffects, GetItemEffectType,
  ITEM_EFFECT_HEAL_HP, ITEM_EFFECT_RAISE_LEVEL, ITEM_EFFECT_HEAL_PP,
  ITEM_EFFECT_PP_UP, ITEM_EFFECT_PP_MAX,
  ITEM_EFFECT_HP_EV, ITEM_EFFECT_ATK_EV, ITEM_EFFECT_DEF_EV,
  ITEM_EFFECT_SPEED_EV, ITEM_EFFECT_SPATK_EV, ITEM_EFFECT_SPDEF_EV,
  ITEM_EFFECT_EVO_STONE, ITEM_EFFECT_SACRED_ASH,
  ITEM_EFFECT_CURE_POISON, ITEM_EFFECT_CURE_SLEEP, ITEM_EFFECT_CURE_BURN,
  ITEM_EFFECT_CURE_FREEZE, ITEM_EFFECT_CURE_PARALYSIS,
  ITEM_EFFECT_CURE_CONFUSION, ITEM_EFFECT_CURE_INFATUATION,
  ITEM_EFFECT_CURE_ALL_STATUS,
} from './engine/bag/bag-item-effects';
import { getItem as _getItem, getItemKeyById } from '../harness/runtime/data-tables';
import { GetItemType } from '../harness/runtime/decomp-bridge';
import {
  gBagMenu,
  Task_FadeAndCloseBagMenu,
  GoToBagMenu,
  ITEMMENULOCATION_LAST,
} from './engine/bag/bag-menu';
import {
  OpenPartyScreenForItemUse,
  GetPartyScreenSlotId,
  ClosePartyScreen,
  ShowPartyMenuItemMessage,
  ShowLevelUpStatsBox,
  RefreshPartySlot,
  PartyMenuAnimateHP,
} from './engine/ui/party-screen';
import { GetMonLevelUpWindowStats } from './menu_specialized';
import { getString } from './engine/ui/gba-strings';
import type { DecompTask } from '../harness/runtime/decomp-runtime';
import { getRuntime, PlaySE, FillPalBufferBlack } from '../harness/runtime/decomp-globals';
import { FadeScreen, FADE_FROM_BLACK } from './engine/system/fade-screen';
import { CB2_ReturnToField_Manual } from './engine/ui/option-menu-return';
import { gPlayerParty } from './engine/battle/party-storage';
import { gMoveNames } from './engine/data/game-data';
import { RemoveBagItem } from './engine/bag/bag';
import { SE_USE_ITEM, SE_SELECT } from './engine/decomp-data/include/constants/songs-data';
// 1:1 décomp `gSaveBlock1Ptr` source unique via Foundation save-block-state.
import { gSaveBlock1Ptr } from './engine/save/save-block-state';

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
  // ITEM_USE_FIELD - 1 = 1 → CB2_ReturnToField (1:1 item_use.c:85). CRITIQUE : retour OW
  // SANS poser gFieldCallback2 (contrairement à CB2_ReturnToFieldWithOpenMenu = exitCallback
  // par défaut, qui pose gFieldCallback2 = open start menu → écraserait notre gFieldCallback).
  // C'est ce qui permet à RunFieldCallback d'exécuter gFieldCallback = FieldCB_UseItemOnField
  // (= la chaîne vélo/canne). Avant : null → fallback exitCallback WithOpenMenu → vélo no-op.
  CB2_ReturnToField_Manual,
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

// ─── Field-callback infra (item_use.c:75,117-140) — pour les items ITEM_USE_FIELD ─
// (vélo, canne, détecteur d'objets, corde sortie…). Le flux 1:1 :
//   ItemUseOutOfBattle_X → sItemUseOnFieldCB = ItemUseOnFieldCB_X ; SetUpItemUseOnFieldCallback(task)
//   → gFieldCallback = FieldCB_UseItemOnField + SetUpItemUseCallback (newScreenCallback =
//     CB2_ReturnToField) + Task_FadeAndCloseBagMenu.
//   → fade-out sac → CB2_ReturnToField → retour OW → RunFieldCallback exécute gFieldCallback
//     = FieldCB_UseItemOnField → fade-in + CreateTask(Task_CallItemUseOnFieldCallback)
//   → quand le fade est fini, Task_CallItemUseOnFieldCallback appelle sItemUseOnFieldCB(task)
//     = l'effet réel (GetOnOffBike, StartFishing, …) qui DOIT DestroyTask pour ne tourner qu'une fois.

/** 1:1 décomp `EWRAM_DATA static TaskFunc sItemUseOnFieldCB` (item_use.c:75). */
let sItemUseOnFieldCB: ((task: DecompTask) => void) | null = null;
export function setItemUseOnFieldCB(cb: ((task: DecompTask) => void) | null): void {
  sItemUseOnFieldCB = cb;
}

/** 1:1 décomp `Task_CallItemUseOnFieldCallback` (item_use.c:136) :
 *      if (IsWeatherNotFadingIn() == 1) sItemUseOnFieldCB(taskId);
 *  Port : attend la fin du palette fade (= équivalent IsWeatherNotFadingIn, cf.
 *  Task_FieldMoveWaitForFade) puis lance le CB réel. sItemUseOnFieldCB DOIT
 *  DestroyTask(task.taskId) (sinon re-tické chaque frame). */
function Task_CallItemUseOnFieldCallback(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  sItemUseOnFieldCB?.(task);
}

/** 1:1 décomp `FieldCB_UseItemOnField` (item_use.c:130) :
 *      FadeInFromBlack();
 *      CreateTask(Task_CallItemUseOnFieldCallback, 8);
 *  Posé comme `gFieldCallback` par SetUpItemUseOnFieldCallback → exécuté par
 *  RunFieldCallback au retour OW. gFieldCallback retourne void (≠ gFieldCallback2). */
function FieldCB_UseItemOnField(): void {
  // 1:1 FadeInFromBlack() = FillPalBufferBlack + FadeScreen(FADE_FROM_BLACK,0)
  // (pattern anti-flash, cf. FieldCallback_PrepareFadeInFromMenu party-screen).
  FillPalBufferBlack();
  FadeScreen(FADE_FROM_BLACK, 0);
  getRuntime().CreateTask(Task_CallItemUseOnFieldCallback, 8);
}

/** 1:1 décomp `SetUpItemUseOnFieldCallback` (item_use.c:117) :
 *      if (tUsingRegisteredKeyItem != TRUE) { gFieldCallback = FieldCB_UseItemOnField;
 *                                             SetUpItemUseCallback(taskId); }
 *      else sItemUseOnFieldCB(taskId);
 *  La branche "registered key item on field" (select-button registered item) n'est
 *  pas portée → on prend toujours la branche normale (depuis le sac). */
export function SetUpItemUseOnFieldCallback(task: DecompTask): void {
  (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_UseItemOnField;
  SetUpItemUseCallback(task);
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
  // 1:1 décomp `RemoveBagItem(item, 1)` (item.c:570) — opère sur le VRAI bag
  // `gBagPockets` (décrémente la quantité, retire le slot à 0). ⚠️ l'ancien
  // composite `gSaveBlock1Ptr.bag` a été migré vers `bagPocket_*` (= undefined)
  // → l'utiliser plantait `Object.keys(undefined)`.
  RemoveBagItem(key, 1);
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
// ─── _expandStr : substitue placeholders FR (STR_VAR_1/2/3, gender, etc.) ───
// Décomp `StringExpandPlaceholders` est complet ; ici on couvre les
// placeholders utilisés par les messages medicine + level-up + EV gains.
function _expandStr(
  template: string,
  vars: { var1?: string; var2?: string; var3?: string },
): string {
  return template
    .replace(/\{STR_VAR_1\}/g, vars.var1 ?? '')
    .replace(/\{STR_VAR_2\}/g, vars.var2 ?? '')
    .replace(/\{STR_VAR_3\}/g, vars.var3 ?? '')
    .replace(/\{PAUSE_UNTIL_PRESS\}/g, '')
    .replace(/\{PAUSE \d+\}/g, '')
    .replace(/\{WAIT_SE\}/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\\p/g, '\n');
}

/** 1:1 décomp `GetMedicineItemEffectMessage(item)` (party_menu.c:4309-4372).
 *  Retourne le message FR pour `gStringVar4` selon `GetItemEffectType(item)`. */
function _getMedicineItemEffectMessage(itemId: number, monNick: string, moveName: string | null): string {
  const ef = GetItemEffectType(itemId);
  const vars = { var1: monNick, var2: moveName ?? '' };
  switch (ef) {
    case ITEM_EFFECT_CURE_POISON:
      return _expandStr(getString('gText_PkmnCuredOfPoison'), vars);
    case ITEM_EFFECT_CURE_SLEEP:
      return _expandStr(getString('gText_PkmnWokeUp2'), vars);
    case ITEM_EFFECT_CURE_BURN:
      return _expandStr(getString('gText_PkmnBurnHealed'), vars);
    case ITEM_EFFECT_CURE_FREEZE:
      return _expandStr(getString('gText_PkmnThawedOut'), vars);
    case ITEM_EFFECT_CURE_PARALYSIS:
      return _expandStr(getString('gText_PkmnCuredOfParalysis'), vars);
    case ITEM_EFFECT_CURE_CONFUSION:
      return _expandStr(getString('gText_PkmnSnappedOutOfConfusion'), vars);
    case ITEM_EFFECT_CURE_INFATUATION:
      return _expandStr(getString('gText_PkmnGotOverInfatuation'), vars);
    case ITEM_EFFECT_CURE_ALL_STATUS:
      return _expandStr(getString('gText_PkmnBecameHealthy'), vars);
    case ITEM_EFFECT_HP_EV:
    case ITEM_EFFECT_ATK_EV:
    case ITEM_EFFECT_DEF_EV:
    case ITEM_EFFECT_SPEED_EV:
    case ITEM_EFFECT_SPATK_EV:
    case ITEM_EFFECT_SPDEF_EV: {
      // 1:1 :4338-4359 — StringCopy gStringVar2 = stat name FR ; expand
      // gText_PkmnBaseVar2StatIncreased = "{STR_VAR_1}, {STR_VAR_2}+!".
      const statName = {
        [ITEM_EFFECT_HP_EV]: getString('gText_HP3'),       // "PV"
        [ITEM_EFFECT_ATK_EV]: getString('gText_Attack3'),  // "ATTAQUE"
        [ITEM_EFFECT_DEF_EV]: getString('gText_Defense3'), // "DéFENSE"
        [ITEM_EFFECT_SPEED_EV]: getString('gText_Speed2'), // "VITESSE"
        [ITEM_EFFECT_SPATK_EV]: getString('gText_SpAtk3'), // "ATT.SPé"
        [ITEM_EFFECT_SPDEF_EV]: getString('gText_SpDef3'), // "DéF.SPé"
      }[ef] ?? '';
      return _expandStr(getString('gText_PkmnBaseVar2StatIncreased'), { var1: monNick, var2: statName });
    }
    case ITEM_EFFECT_PP_UP:
    case ITEM_EFFECT_PP_MAX:
      // 1:1 :4361-4363 gText_MovesPPIncreased "X PP MAX{move}!".
      return _expandStr(getString('gText_MovesPPIncreased'), vars);
    case ITEM_EFFECT_HEAL_PP:
      // 1:1 :4365-4366 gText_PPWasRestored "PP de X restaurés."
      return _expandStr(getString('gText_PPWasRestored'), vars);
    default:
      return _expandStr(getString('gText_WontHaveEffect'), vars);
  }
}

export function ItemUseCB_Medicine(taskId: number, _returnTask: ((task: DecompTask) => void) | null): void {
  void _returnTask; void taskId;
  const rt = getRuntime();
  if (!rt) return;
  const slotId = GetPartyScreenSlotId();
  const mon = gPlayerParty[slotId];
  if (!mon || !mon.species) return;  // 1:1 IsSelectedMonNotEgg FALSE → silent return.
  const itemId = gSpecialVar.ItemId;
  // 1:1 décomp party_menu.c:4396 : check IsHPRecoveryItem + save hpBefore.
  const hpBefore = mon.hp;
  const result = ApplyMedicineEffect(itemId, mon);
  if (result.cannotUse) {
    // 1:1 :4423 DisplayPartyMenuMessage(gText_WontHaveEffect, TRUE).
    ShowPartyMenuItemMessage(_expandStr(getString('gText_WontHaveEffect'), {}));
    return;
  }
  // 1:1 :4432 PlaySE(SE_USE_ITEM) au moment de l'apply.
  PlaySE(SE_USE_ITEM);
  // 1:1 :4434 RemoveBagItem(item, 1).
  _removeOneFromBag(itemId);
  if (result.hpHealed > 0) {
    // 1:1 :4447 PartyMenuModifyHP(taskId, slotId, 1, hpDelta,
    //   Task_DisplayHPRestoredMessage). Anim HP bar frame-by-frame du
    //   hpBefore → newHp puis message "Les PV de X restaurés N pts.".
    // L'anim fait son propre initial draw (= reverse à hpBefore + redraw),
    // pas besoin de RefreshPartySlot ici. Status icon refresh hors anim.
    const newHp = mon.hp;
    const msg = _expandStr(getString('gText_PkmnHPRestoredByVar2'),
      { var1: mon.nickname, var2: String(result.hpHealed) });
    PartyMenuAnimateHP(slotId, hpBefore, newHp, () => {
      // 1:1 :4440-4442 SetPartyMonAilmentGfx — refresh status icon + level
      // une fois l'anim HP finie.
      RefreshPartySlot(slotId);
      ShowPartyMenuItemMessage(msg);
    });
  } else {
    // 1:1 :4440-4442 SetPartyMonAilmentGfx + DisplayPartyPokemonLevelCheck —
    // refresh status icon + level dans la party box (= status cure path).
    RefreshPartySlot(slotId);
    // 1:1 :4453-4456 GetMedicineItemEffectMessage(item) → message FR direct.
    const msg = _getMedicineItemEffectMessage(itemId, mon.nickname, null);
    ShowPartyMenuItemMessage(msg);
  }
}

// ─── ItemUseCB_PPRecovery (party_menu.c:4610) — 1:1-sémantique ──────────────
// Heal PP — soit toutes les moves (HEAL_PP), soit une (HEAL_PP_ONE = via
// ShowMoveSelectWindow). Notre 1ère itération : utilise moveIndex=0 par
// défaut (= polish "select move" reporté).
export function ItemUseCB_PPRecovery(taskId: number, _returnTask: ((task: DecompTask) => void) | null): void {
  void _returnTask; void taskId;
  const slotId = GetPartyScreenSlotId();
  const mon = gPlayerParty[slotId];
  if (!mon || !mon.species) return;
  const itemId = gSpecialVar.ItemId;
  const result = PokemonUseItemEffects(mon, itemId, slotId, 0 /* moveIndex */, false);
  if (result.cannotUse) {
    ShowPartyMenuItemMessage(_expandStr(getString('gText_WontHaveEffect'), {}));
    return;
  }
  PlaySE(SE_USE_ITEM);  // 1:1 :4669
  _removeOneFromBag(itemId);
  // 1:1 décomp :4671-4675 — gMoveNames[move] + GetMedicineItemEffectMessage
  // → "PP de {move} restaurés.".
  const moveName = gMoveNames[mon.moves[0]] ?? '';
  ShowPartyMenuItemMessage(_getMedicineItemEffectMessage(itemId, mon.nickname, moveName));
}

// ─── ItemUseCB_PPUp (party_menu.c:4680) — 1:1-sémantique ────────────────────
export function ItemUseCB_PPUp(taskId: number, _returnTask: ((task: DecompTask) => void) | null): void {
  void _returnTask; void taskId;
  const slotId = GetPartyScreenSlotId();
  const mon = gPlayerParty[slotId];
  if (!mon || !mon.species) return;
  const itemId = gSpecialVar.ItemId;
  const result = PokemonUseItemEffects(mon, itemId, slotId, 0, false);
  if (result.cannotUse) {
    ShowPartyMenuItemMessage(_expandStr(getString('gText_WontHaveEffect'), {}));
    return;
  }
  PlaySE(SE_USE_ITEM);
  _removeOneFromBag(itemId);
  const moveName = gMoveNames[mon.moves[0]] ?? '';
  ShowPartyMenuItemMessage(_getMedicineItemEffectMessage(itemId, mon.nickname, moveName));
}

// ─── ItemUseCB_RareCandy (party_menu.c:4955) — 1:1-sémantique ───────────────
export function ItemUseCB_RareCandy(taskId: number, _returnTask: ((task: DecompTask) => void) | null): void {
  void _returnTask; void taskId;
  const slotId = GetPartyScreenSlotId();
  const mon = gPlayerParty[slotId];
  if (!mon || !mon.species) return;
  const itemId = gSpecialVar.ItemId;

  // 1:1 décomp party_menu.c:4963-4972 — si level != MAX_LEVEL : buffer stats
  // AVANT, applique l'effet (level up + CalculateMonStats = 6 stats), buffer
  // stats APRÈS. (Le cas level==MAX → cannotUseEffect=TRUE, géré par result.)
  const statsBefore = new Array<number>(6).fill(0);
  const statsAfter = new Array<number>(6).fill(0);
  GetMonLevelUpWindowStats(mon, statsBefore);   // 1:1 BufferMonStatsToTaskData(mon, arrayPtr)
  const result = PokemonUseItemEffects(mon, itemId, slotId, 0, false);
  GetMonLevelUpWindowStats(mon, statsAfter);    // 1:1 BufferMonStatsToTaskData(mon, &data[NUM_STATS])

  // 1:1 :4973 PlaySE(SE_SELECT).
  PlaySE(SE_SELECT);
  if (result.cannotUse) {
    // 1:1 :4974-4980 cannotUseEffect → "Ça n'aura aucun effet." (pas de box).
    ShowPartyMenuItemMessage(_expandStr(getString('gText_WontHaveEffect'), {}));
    return;
  }
  // 1:1 :4985 UpdateMonDisplayInfoAfterRareCandy (refresh slot : level/HP/barre).
  RefreshPartySlot(slotId);
  // 1:1 :4986 RemoveBagItem(item, 1).
  _removeOneFromBag(itemId);
  // 1:1 :4987-4989 ConvertIntToDecimalStringN(new level) + gText_PkmnElevatedToLvVar2
  // = "X est promu au\nN.\xb0{lvl}!".
  const msg = _expandStr(getString('gText_PkmnElevatedToLvVar2'),
    { var1: mon.nickname, var2: String(result.newLevel) });
  // 1:1 :4984 PlayFanfare + :4990 DisplayPartyMenuMessage + :4992 func=
  // Task_DisplayLevelUpStatsPg1 → la séquence boîte de stats (pages 1/2).
  ShowLevelUpStatsBox(statsBefore, statsAfter, msg);
}

// ─── ItemUseCB_ReduceEV (party_menu.c:4482) — 1:1-sémantique ────────────────
export function ItemUseCB_ReduceEV(taskId: number, _returnTask: ((task: DecompTask) => void) | null): void {
  void _returnTask; void taskId;
  const slotId = GetPartyScreenSlotId();
  const mon = gPlayerParty[slotId];
  if (!mon || !mon.species) return;
  const itemId = gSpecialVar.ItemId;
  const result = PokemonUseItemEffects(mon, itemId, slotId, 0, false);
  if (result.cannotUse) {
    ShowPartyMenuItemMessage(_expandStr(getString('gText_WontHaveEffect'), {}));
    return;
  }
  PlaySE(SE_USE_ITEM);  // 1:1 :4504
  _removeOneFromBag(itemId);
  // 1:1 :4517 gText_PkmnAdoresBaseVar2Fell = "X aime BERRIES… {stat} baisse."
  // (= friendship pas changée mais EV oui).
  // Notre approximation : utilise gText_PkmnFriendlyBaseVar2Fell (= les deux
  // changements). Polish 1:1 = check pré/post friendship.
  const ef = GetItemEffectType(itemId);
  const statName = {
    [ITEM_EFFECT_HP_EV]: getString('gText_HP3'),
    [ITEM_EFFECT_ATK_EV]: getString('gText_Attack3'),
    [ITEM_EFFECT_DEF_EV]: getString('gText_Defense3'),
    [ITEM_EFFECT_SPEED_EV]: getString('gText_Speed2'),
    [ITEM_EFFECT_SPATK_EV]: getString('gText_SpAtk3'),
    [ITEM_EFFECT_SPDEF_EV]: getString('gText_SpDef3'),
  }[ef] ?? '';
  ShowPartyMenuItemMessage(_expandStr(
    getString('gText_PkmnFriendlyBaseVar2Fell'),
    { var1: mon.nickname, var2: statName },
  ));
}

// ─── ItemUseCB_SacredAsh (party_menu.c:5149) — 1:1-sémantique ───────────────
export function ItemUseCB_SacredAsh(taskId: number, _returnTask: ((task: DecompTask) => void) | null): void {
  void _returnTask; void taskId;
  const party = gPlayerParty;
  const itemId = gSpecialVar.ItemId;
  let anyEffect = false;
  for (let i = 0; i < party.length; i++) {
    const mon = party[i];
    if (!mon || !mon.species) continue;
    const r = PokemonUseItemEffects(mon, itemId, i, 0, false);
    if (!r.cannotUse) anyEffect = true;
  }
  if (!anyEffect) {
    ShowPartyMenuItemMessage(_expandStr(getString('gText_WontHaveEffect'), {}));
    return;
  }
  PlaySE(SE_USE_ITEM);  // 1:1 :5175
  _removeOneFromBag(itemId);
  // 1:1 refresh tous les slots party (= tous mons KO ont été revived).
  for (let i = 0; i < 6; i++) RefreshPartySlot(i);
  // 1:1 décomp Task_SacredAshDisplayHPRestored — pour chaque revive,
  // affiche "PV de X restaurés.". Notre version simplifiée : affiche
  // un message générique pour le 1er KO revived. Polish 1:1 = display
  // message par mon (= loop).
  const firstRev = party.find(m => m && m.species !== 0 && m.hp > 0);
  ShowPartyMenuItemMessage(_expandStr(
    getString('gText_PkmnHPRestoredByVar2'),
    { var1: firstRev?.nickname ?? 'POKéMON', var2: String(firstRev?.maxHP ?? 0) },
  ));
}

// ─── ItemUseCB_EvolutionStone (party_menu.c:5232) — 1:1-sémantique ──────────
export function ItemUseCB_EvolutionStone(taskId: number, _returnTask: ((task: DecompTask) => void) | null): void {
  void _returnTask; void taskId;
  const slotId = GetPartyScreenSlotId();
  const mon = gPlayerParty[slotId];
  if (!mon || !mon.species) return;
  // GetEvolutionTargetSpecies + BeginEvolutionScene non porté.
  // → "Ça n'aura aucun effet." 1:1 fallback.
  ShowPartyMenuItemMessage(_expandStr(getString('gText_WontHaveEffect'), { var1: mon.nickname }));
}

// ─── ItemUseCB_TMHM — 1:1-sémantique ───────────────────────────────────────
export function ItemUseCB_TMHM(taskId: number, _returnTask: ((task: DecompTask) => void) | null): void {
  void _returnTask; void taskId;
  const slotId = GetPartyScreenSlotId();
  const mon = gPlayerParty[slotId];
  if (!mon || !mon.species) return;
  // 1:1 polish à porter : UseTMHM flow + check CanMonLearnTMHM + ReplaceMove
  // YesNo. Pour l'instant : message honest.
  ShowPartyMenuItemMessage(`${mon.nickname}\nne peut pas l'apprendre.`);
}

// Expose globals (= gItemUseCB lookup par party-screen, etc.).
{
  const _g: Record<string, unknown> = {
    gItemUseCB,
    SetUpItemUseCallback,
    ItemUseCB_Medicine,
    ItemUseCB_PPRecovery,
    ItemUseCB_PPUp,
    ItemUseCB_RareCandy,
    ItemUseCB_ReduceEV,
    ItemUseCB_SacredAsh,
    ItemUseCB_EvolutionStone,
    ItemUseCB_TMHM,
    CB2_ShowPartyMenuForItemUse,
    CB2_ReturnToBagMenu,
  };
  for (const [k, v] of Object.entries(_g)) {
    if (typeof (globalThis as Record<string, unknown>)[k] === 'undefined') {
      (globalThis as Record<string, unknown>)[k] = v;
    }
  }
}
