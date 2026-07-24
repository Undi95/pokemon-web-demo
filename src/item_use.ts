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
import { getItem as _getItem } from '../harness/runtime/data-tables';
import { GetItemType, GetBagItemKey, GetItemName, GetItemPocket } from './item';
import {
  gBagMenu,
  Task_FadeAndCloseBagMenu,
  GoToBagMenu,
  ITEMMENULOCATION_LAST,
  DisplayItemMessage,
  CloseItemMessage,
  UpdatePocketItemList,
  UpdatePocketListPosition,
} from './item_menu';
import {
  OpenPartyScreenForItemUse,
  GetPartyScreenSlotId,
  ClosePartyScreen,
  ShowPartyMenuItemMessage,
  ShowLevelUpStatsBox,
  RefreshPartySlot,
  PartyMenuAnimateHP,
  CB2_ChooseMonToGiveItem,
  ItemUseCB_TMHM,
  ItemUseCB_EvolutionStone,
  ItemUseCB_PPRecovery,
  ItemUseCB_PPUp,
} from './party_menu';
// Re-export pour item_menu.ts (ItemMenu_Give pose gBagMenu.newScreenCallback =
// CB2_ChooseMonToGiveItem). Routé via item_use pour réutiliser l'edge existant
// item_menu→item_use→party_menu (évite un edge direct item_menu→party_menu = cycle).
export { CB2_ChooseMonToGiveItem };
import { GetMonLevelUpWindowStats } from './menu_specialized';
import { getString } from '../harness/runtime/decomp-strings';
import type { DecompTask } from '../harness/runtime/decomp-runtime';
import { getRuntime, PlaySE, FillPalBufferBlack } from '../harness/runtime/decomp-globals';
import { FadeScreen, FADE_FROM_BLACK } from './field_weather';
import { CB2_ReturnToField_Manual, Overworld_ResetStateAfterDigEscRope, ResetInitialPlayerAvatarState } from './overworld';
import { gPlayerParty, IsPlayerPartyAndPokemonStorageFull } from './engine/battle/party-storage';
import { gMoveNames } from './engine/data/game-data';
import { RemoveBagItem } from './engine/bag/bag';
import { SE_USE_ITEM, SE_SELECT } from '../include/constants/songs';
// 1:1 décomp `gSaveBlock1Ptr` source unique via Foundation save-block-state.
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
// ─── Deps combat (usage d'objet EN COMBAT — ItemUseInBattle_*) ───────────────
// Globals battle : state.ts = feuille (n'importe pas item_use/item_menu/party_menu) → pas de cycle.
import { gBattlerPartyIndexes, gBattlerInMenuId, gBattleTypeFlags } from './engine/battle/state';
import { BATTLE_TYPE_TRAINER } from './engine/battle/constants';
import { FONT_NORMAL } from './text';
import { JOY_NEW } from '../harness/runtime/decomp-globals';
import { A_BUTTON, B_BUTTON } from '../include/gba/io_reg';
import { encodeOwText, setStringVar } from '../include/text';
import { gStringVar4, StringExpandPlaceholders } from '../include/string_util';
import { ITEMS_POCKET, BALLS_POCKET, TMHM_POCKET, BERRIES_POCKET, KEYITEMS_POCKET } from '../include/constants/item';
// ─── Deps overworld pour ItemUseOutOfBattle_Berry / WailmerPail (VIS-9) ──────
// (item_use n'est importé QUE par item_menu → aucune de ces arêtes ne referme un
// cycle : field_control_avatar/field_player_avatar/fieldmap/event_object_movement/
// script/berry n'importent ni item_use ni item_menu — vérifié.)
import { ScriptContext_SetupScript, LockPlayerFieldControls } from './script';
import { GetPlayerMovementDirection, GetXYCoordsOneStepInFrontOfPlayer, PlayerGetElevation } from './field_player_avatar';
import { GetInFrontOfPlayerPosition, GetInteractedObjectEventScript, type MapPosition } from './field_control_avatar';
import { MapGridGetMetatileBehaviorAt, gMapHeader } from './fieldmap';
// DisplayItemMessageOnField (menu.ts) : capture DIFFÉRÉE (import dynamique) — un import
// STATIQUE item_use→menu ré-ordonne l'éval du cluster circulaire item_use↔party_menu↔
// item_menu et casse la résolution du re-export `gPlayerPartyCount` de party-storage
// dans party_menu (TS2724). Pattern anti-cycle projet (cf. field_screen_effect anti-TDZ).
let _DisplayItemMessageOnField:
  ((taskId: number, str: string | Uint8Array, cb: (t: DecompTask) => void) => void) | null = null;
import('./menu').then((m) => { _DisplayItemMessageOnField = m.DisplayItemMessageOnField; })
  .catch((e) => console.error('[item_use] import menu (DisplayItemMessageOnField) a échoué', e));
import { GetObjectEventIdByPosition, GetObjectEventBerryTreeId, gObjectEvents, OBJECT_EVENTS_COUNT } from './event_object_movement';
import { gSelectedObjectEvent } from './engine/script/script-vars';
import {
  GetBerryTreeInfo, GetStageByBerryTreeId,
  BERRY_STAGE_NO_BERRY, BERRY_STAGE_PLANTED, BERRY_STAGE_SPROUTED,
  BERRY_STAGE_TALLER, BERRY_STAGE_FLOWERING,
} from './berry';

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
 *  tUsingRegisteredKeyItem = task.data[3] (item_use.c:78). Branche registered
 *  (SELECT sur l'objet-clé enregistré) : appel DIRECT du CB (PAS de fade-bag, il
 *  n'y a pas de sac ouvert) — UseRegisteredKeyItemOnField a déjà lock+set l'item. */
export function SetUpItemUseOnFieldCallback(task: DecompTask): void {
  if (task.data[3] === 1) {  // tUsingRegisteredKeyItem == TRUE
    sItemUseOnFieldCB?.(task);
    return;
  }
  (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_UseItemOnField;
  SetUpItemUseCallback(task);
}

// ─── RemoveBagItem helper (1:1 sem `RemoveBagItem(itemId, 1)`) ──────────────
// Utilise bag-pockets via gameState. Converter itemId → CLÉ items.json via
// GetBagItemKey (item.ts) : normalise aussi TM/HM enum-numbered → move-named
// ("ITEM_TM_TOXIC") — getItemKeyById brut renverrait "ITEM_TM06" → RemoveBagItem
// no-op silencieux (leçon CheckBagHasItem attend une CLÉ).
function _itemKeyForId(itemId: number): string | undefined {
  return GetBagItemKey(itemId);
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

// ─── Baies : planter / arroser depuis le sac (VIS-9) — 1:1 décomp ───────────
// item_use.c:684-757 (ItemUseOutOfBattle_Berry / WailmerPail + ItemUseOnFieldCB_*)
// + berry.c:997-1035 (ObjectEventInteractionWaterBerryTree / IsPlayerFacingEmpty
// BerryTreePatch / TryToWaterBerryTree). Les fonctions berry.c/field_control_avatar.c
// sont TRANSCRITES ICI (et non dans berry.ts / field_control_avatar.ts) : berry.ts est
// en aval de event_object_movement (import berry) → l'y faire importer field_control_
// avatar refermerait le cycle berry→field_control_avatar→event_object_movement→berry
// (bombe TDZ, cf mémoire find-import-cycle) ; field_control_avatar.ts est VERROUILLÉ.
// item_use.ts est un feuillet sûr (importé seulement par item_menu). Noms 1:1 préservés.

/** 1:1 décomp `GetObjectEventScriptPointerPlayerFacing` (field_control_avatar.c:985-993).
 *  Foyer canonique = field_control_avatar.ts (VERROUILLÉ) → relocalisé ici. Renvoie le
 *  label du script de l'object event face au joueur (= la string `scriptLabel`, comparée
 *  à `'BerryTreeScript'` ci-dessous — équivalent 1:1 de l'égalité de pointeur décomp).
 *  EFFET DE BORD 1:1 : GetInteractedObjectEventScript pose gSelectedObjectEvent = l'arbre. */
function GetObjectEventScriptPointerPlayerFacing(): string | null {
  const direction = GetPlayerMovementDirection();
  const position: MapPosition = { x: 0, y: 0, elevation: 0 };
  GetInFrontOfPlayerPosition(position);
  return GetInteractedObjectEventScript(
    position, MapGridGetMetatileBehaviorAt(position.x, position.y), direction);
}

/** 1:1 décomp `ObjectEventInteractionWaterBerryTree` (berry.c:997-1019) : pose watered1..4
 *  selon le stade courant de l'arbre sélectionné (= +1 stade arrosé → meilleur yield à
 *  maturité). Renvoie TRUE si arrosé, FALSE hors stade PLANTED..FLOWERING. (Le special
 *  homonyme dans specials-registry duplique ce corps pour le flux script BerryTree — ici
 *  on a besoin de la valeur de retour pour TryToWaterBerryTree.) */
function ObjectEventInteractionWaterBerryTree(): boolean {
  const tree = GetBerryTreeInfo(GetObjectEventBerryTreeId(gSelectedObjectEvent.index));
  if (!tree) return false;
  switch (tree.stage) {
    case BERRY_STAGE_PLANTED:   tree.watered1 = 1; break;
    case BERRY_STAGE_SPROUTED:  tree.watered2 = 1; break;
    case BERRY_STAGE_TALLER:    tree.watered3 = 1; break;
    case BERRY_STAGE_FLOWERING: tree.watered4 = 1; break;
    default: return false;
  }
  return true;
}

/** 1:1 décomp `IsPlayerFacingEmptyBerryTreePatch` (berry.c:1021-1028) : le joueur fait
 *  face à un sol de plantation vide (script BerryTree + stade BERRY_STAGE_NO_BERRY). */
export function IsPlayerFacingEmptyBerryTreePatch(): boolean {
  if (GetObjectEventScriptPointerPlayerFacing() === 'BerryTreeScript'
   && GetStageByBerryTreeId(GetObjectEventBerryTreeId(gSelectedObjectEvent.index)) === BERRY_STAGE_NO_BERRY)
    return true;
  else
    return false;
}

/** 1:1 décomp `TryToWaterBerryTree` (berry.c:1030-1036) : si le joueur fait face à un
 *  arbre à baies (script BerryTree), arrose-le (ObjectEventInteractionWaterBerryTree). */
export function TryToWaterBerryTree(): boolean {
  if (GetObjectEventScriptPointerPlayerFacing() !== 'BerryTreeScript')
    return false;
  else
    return ObjectEventInteractionWaterBerryTree();
}

/** 1:1 décomp `TryToWaterSudowoodo` (item_use.c:735-745, static) : le joueur fait face
 *  à un object event SIMULARBRE (OBJ_EVENT_GFX_SUDOWOODO). graphicsId est stocké ici en
 *  string OBJ_EVENT_GFX_* (cf. précédents field_player_avatar.c:1306 boulder). */
export function TryToWaterSudowoodo(): boolean {
  const { x, y } = GetXYCoordsOneStepInFrontOfPlayer();
  const elevation = PlayerGetElevation();
  const objId = GetObjectEventIdByPosition(x, y, elevation);
  if (objId === OBJECT_EVENTS_COUNT || gObjectEvents[objId].graphicsId !== 'OBJ_EVENT_GFX_SUDOWOODO')
    return false;
  else
    return true;
}

/** 1:1 décomp `FieldCB_UseItemOnField` (item_use.c:130) — exposé pour le chemin baie
 *  (ItemUseOutOfBattle_Berry pose `gFieldCallback` directement, cf. item_use.c:690). */
export function getFieldCB_UseItemOnField(): () => void {
  return FieldCB_UseItemOnField;
}

/** 1:1 décomp `ItemUseOnFieldCB_Berry` (item_use.c:699-705) : consomme la baie, lock,
 *  lance BerryTree_EventScript_ItemUsePlantBerry (msgbox "sol meuble" → plante). */
export function ItemUseOnFieldCB_Berry(task: DecompTask): void {
  _removeOneFromBag(gSpecialVar.ItemId);   // 1:1 :701 RemoveBagItem(item, 1)
  LockPlayerFieldControls();               // 1:1 :702
  ScriptContext_SetupScript('BerryTree_EventScript_ItemUsePlantBerry');  // 1:1 :703
  getRuntime()?.DestroyTask(task.taskId);  // 1:1 :704
}

/** 1:1 décomp `ItemUseOnFieldCB_WailmerPailBerry` (item_use.c:725-730) : lock + lance
 *  BerryTree_EventScript_ItemUseWailmerPail (arrose l'arbre). */
export function ItemUseOnFieldCB_WailmerPailBerry(task: DecompTask): void {
  LockPlayerFieldControls();               // 1:1 :727
  ScriptContext_SetupScript('BerryTree_EventScript_ItemUseWailmerPail');  // 1:1 :728
  getRuntime()?.DestroyTask(task.taskId);  // 1:1 :729
}

/** 1:1 décomp `ItemUseOnFieldCB_WailmerPailSudowoodo` (item_use.c:746-751) : lock + lance
 *  BattleFrontier_OutsideEast_EventScript_WaterSudowoodo (réveille le Simularbre). */
export function ItemUseOnFieldCB_WailmerPailSudowoodo(task: DecompTask): void {
  LockPlayerFieldControls();               // 1:1 :748
  ScriptContext_SetupScript('BattleFrontier_OutsideEast_EventScript_WaterSudowoodo');  // 1:1 :749
  getRuntime()?.DestroyTask(task.taskId);  // 1:1 :750
}

// ─── Corde Sortie (Escape Rope) — 1:1 décomp item_use.c:905-943 ─────────────
// Flux : ItemUseOutOfBattle_EscapeRope → sItemUseOnFieldCB = ItemUseOnFieldCB_EscapeRope
// + SetUpItemUseOnFieldCallback (fade-out sac → retour OW → FieldCB_UseItemOnField →
// Task_CallItemUseOnFieldCallback) → ItemUseOnFieldCB_EscapeRope (reset state + retire
// l'objet + message) → Task_UseDigEscapeRopeOnField → StartEscapeRopeFieldEffect (spin
// de sortie + warp vers escapeWarp + spin d'arrivée).
// ⚠️ CÂBLAGE PILOTE : le dispatch item_menu.ts (case 'ItemUseOutOfBattle_EscapeRope',
// ~item_menu.c) appelle encore la version SIMPLIFIÉE inline (fldeff_dig.StartEscapeRope
// FieldEffect, warp+fade sans spin) — le repointer vers `ItemUseOutOfBattle_EscapeRope`
// ci-dessous (item_menu.ts VERROUILLÉ pour cet agent).

/** 1:1 décomp `bool8 CanUseDigOrEscapeRopeOnCurMap(void)` (item_use.c:922) :
 *      if (gMapHeader.allowEscaping) return TRUE; else return FALSE; */
export function CanUseDigOrEscapeRopeOnCurMap(): boolean {
  return gMapHeader?.allowEscaping === true;
}

/** 1:1 décomp `void Task_UseDigEscapeRopeOnField(u8 taskId)` (item_use.c:907) :
 *      ResetInitialPlayerAvatarState();
 *      StartEscapeRopeFieldEffect();
 *      DestroyTask(taskId);
 *  ADAPTATION port : `StartEscapeRopeFieldEffect` = la version 1:1 COMPLÈTE (spin
 *  wobble de sortie + warp différé + spin d'arrivée) transcrite dans
 *  field_effect_helpers.ts, consommée via le pont
 *  `globalThis.__StartEscapeRopeFieldEffect_1to1` (anti-cycle : item_use →
 *  field_effect_helpers fermerait une arête d'éval). Remplace l'ancienne version
 *  simplifiée (warp + fade sans spin) de fldeff_dig.ts. */
export function Task_UseDigEscapeRopeOnField(task: DecompTask): void {
  ResetInitialPlayerAvatarState();
  const start = (globalThis as Record<string, unknown>).__StartEscapeRopeFieldEffect_1to1 as (() => void) | undefined;
  if (start) start();
  else console.error('[EscapeRope] __StartEscapeRopeFieldEffect_1to1 absent (field_effect_helpers non chargé)');
  getRuntime()?.DestroyTask(task.taskId);
}

/** 1:1 décomp `static void ItemUseOnFieldCB_EscapeRope(u8 taskId)` (item_use.c:914) :
 *      Overworld_ResetStateAfterDigEscRope();
 *      RemoveUsedItem();
 *      gTasks[taskId].data[0] = 0;
 *      DisplayItemMessageOnField(taskId, gStringVar4, Task_UseDigEscapeRopeOnField); */
export function ItemUseOnFieldCB_EscapeRope(task: DecompTask): void {
  Overworld_ResetStateAfterDigEscRope();
  RemoveUsedItem();                    // 1:1 :917 — pose aussi gStringVar4 = "{PLAYER} utilise {objet}."
  task.data[0] = 0;                    // 1:1 :918 gTasks[taskId].data[0] = 0
  if (_DisplayItemMessageOnField) _DisplayItemMessageOnField(task.taskId, gStringVar4, Task_UseDigEscapeRopeOnField);  // 1:1 :919
  else console.error('[EscapeRope] DisplayItemMessageOnField absent (menu non chargé)');
}

/** 1:1 décomp `void ItemUseOutOfBattle_EscapeRope(u8 taskId)` (item_use.c:930) :
 *      if (CanUseDigOrEscapeRopeOnCurMap() == TRUE) {
 *          sItemUseOnFieldCB = ItemUseOnFieldCB_EscapeRope;
 *          SetUpItemUseOnFieldCallback(taskId);
 *      } else {
 *          DisplayDadsAdviceCannotUseItemMessage(taskId, tUsingRegisteredKeyItem);
 *      }
 *  tUsingRegisteredKeyItem = task.data[3] (item_use.c:78). */
export function ItemUseOutOfBattle_EscapeRope(task: DecompTask): void {
  if (CanUseDigOrEscapeRopeOnCurMap()) {
    setItemUseOnFieldCB(ItemUseOnFieldCB_EscapeRope);
    SetUpItemUseOnFieldCallback(task);
  } else {
    DisplayDadsAdviceCannotUseItemMessage(task.taskId, task.data[3] === 1);
  }
}
// Ponts globalThis (lus par le dispatch item_menu au repointage — anti-cycle).
(globalThis as Record<string, unknown>).__ItemUseOutOfBattle_EscapeRope = ItemUseOutOfBattle_EscapeRope;

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
// ─── _expandStr : substitue placeholders FR (STR_VAR_1/2/3) ─────────────────
// = StringExpandPlaceholders (expansion des variables SEULEMENT). Les control
// codes ({PAUSE_UNTIL_PRESS}/{PAUSE n}/{WAIT_SE}/{PLAY_SE X}) et les prompts
// \p/\l/\n sont GARDÉS : le printer party (encodeStringForFont + RenderText)
// les rend nativement, 1:1 décomp — l'ancien strip cassait le ▼/pause final
// (le message se fermait sur un press supplémentaire au lieu du press de la
// pause elle-même).
function _expandStr(
  template: string,
  vars: { var1?: string; var2?: string; var3?: string },
): string {
  return template
    .replace(/\{STR_VAR_1\}/g, vars.var1 ?? '')
    .replace(/\{STR_VAR_2\}/g, vars.var2 ?? '')
    .replace(/\{STR_VAR_3\}/g, vars.var3 ?? '');
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

// ─── ItemUseCB_PPRecovery / ItemUseCB_PPUp (party_menu.c:4610/4680) ─────────
// Portés 1:1 DANS party_menu.ts (foyer décomp : accès à ShowMoveSelectWindow +
// Task_HandleWhichMoveInput + _actionWindowId/_msgWid/_phase — flux « quelle
// capacité? » VIS-12). Re-exportés ici pour l'edge item_menu → item_use
// (setItemUseCB(ItemUseCB_PPRecovery) + ItemUseInBattle_PPRecovery ci-dessous).
export { ItemUseCB_PPRecovery, ItemUseCB_PPUp };

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
  // Capture le PREMIER mon réellement réanimé (effet appliqué = !cannotUse, donc KO→revived)
  // pour le message — pas un `find(hp>0)` qui pourrait désigner un mon DÉJÀ vivant.
  let firstRevivedNick = '';
  let firstRevivedMaxHP = 0;
  for (let i = 0; i < party.length; i++) {
    const mon = party[i];
    if (!mon || !mon.species) continue;
    const r = PokemonUseItemEffects(mon, itemId, i, 0, false);
    if (!r.cannotUse) {
      anyEffect = true;
      if (firstRevivedNick === '') { firstRevivedNick = mon.nickname; firstRevivedMaxHP = mon.maxHP; }
    }
  }
  if (!anyEffect) {
    ShowPartyMenuItemMessage(_expandStr(getString('gText_WontHaveEffect'), {}));
    return;
  }
  PlaySE(SE_USE_ITEM);  // 1:1 :5175
  _removeOneFromBag(itemId);
  // 1:1 refresh tous les slots party (= tous mons KO ont été revived).
  for (let i = 0; i < 6; i++) RefreshPartySlot(i);
  // 1:1 décomp UseSacredAsh/Task_SacredAshDisplayHPRestored : affiche un message par mon
  // réanimé. Simplification : message pour le PREMIER mon réanimé (nickname réel capturé
  // pendant la boucle d'effet, plus de fallback fabriqué). Polish 1:1 restant = boucle de
  // messages par mon (UseSacredAsh = Task state-machine).
  ShowPartyMenuItemMessage(_expandStr(
    getString('gText_PkmnHPRestoredByVar2'),
    { var1: firstRevivedNick, var2: String(firstRevivedMaxHP) },
  ));
}

// ─── ItemUseCB_EvolutionStone (party_menu.c:5232) — porté 1:1 DANS party_menu.ts ──
// (GetEvolutionTargetSpecies EVO_MODE_ITEM_USE + BeginEvolutionScene via
// PokemonUseItemEffects case EVO_STONE ; teardown = _partyMenuTryEvolution). Re-export
// ici pour l'edge item_menu → item_use (setItemUseCB(ItemUseCB_EvolutionStone)).
export { ItemUseCB_EvolutionStone };

// ─── ItemUseCB_TMHM (party_menu.c:4733) — porté 1:1 DANS party_menu.ts ──────
// (avec CanMonLearnTMTutor :2033 + Task_LearnedMove :4769 + le flux replace-move
// complet YesNo → summary select-move → Task_PartyMenuReplaceMove). Re-export
// ici pour l'edge existant item_menu → item_use (UseTMHM pose gItemUseCB).
export { ItemUseCB_TMHM };

// ═══════════════════════════════════════════════════════════════════════════
//  Usage d'objet EN COMBAT (item_use.c:949-1061) — foyer 1:1, INERTE (Lot 2)
// ═══════════════════════════════════════════════════════════════════════════
// Ces fonctions sont le pointeur `gItems[].battleUseFunc` (dispatché par
// `ItemMenu_UseInBattle`, item_menu.c:1997 → GetItemBattleFunc). AUCUN call-site
// ne les appelle encore : le sac de combat passe par le clone bag-screen.ts
// jusqu'au Lot 5 (câblage battle_controller_player.ts + reshow). PORT 1:1 INERTE.
//
// Adaptations documentées (Règle 1 — transcrire, jamais improviser) :
//  · Battle Pyramid (gPyramidBagMenu, CloseBattlePyramidBag, DisplayItemMessage-
//    InBattlePyramid) = HORS-SOLO (battle_pyramid_bag.c non porté) ; en solo
//    `CurrentBattlePyramidLocation()` (battle_util.c:1362) vaut TOUJOURS
//    PYRAMID_LOCATION_NONE → SEULE la branche NONE est active. La branche pyramide
//    est notée mais non transcrite (déféral honnête, cf. mémoire "frontier hors-solo").
//  · `ExecuteTableBasedItemEffect(mon,item,i,0)` = `PokemonUseItemEffects(...,gMain.inBattle)`
//    → notre port auto-détecte inBattle (gBattleTypeFlags) ; retour cannotUse identique.
//  · `UseStatIncreaseItem` (foyer pokemon.c:5433, hors item_use) + `ChooseMonForInBattleItem`
//    (foyer party_menu.c, hors item_use) = ponts globalThis (câblage Lots 4/5).

/** 1:1 décomp `ItemUseInBattle_PokeBall(u8 taskId)` (item_use.c:949) : place libre
 *  (équipe/PC) ? RemoveBagItem + fermeture du sac (l'anim de lancer suit côté moteur
 *  combat) ; sinon → "Les BOÎTES sont pleines." + retour liste. */
export function ItemUseInBattle_PokeBall(task: DecompTask): void {
  if (IsPlayerPartyAndPokemonStorageFull() === false) { // have room for mon?
    _removeOneFromBag(gSpecialVar.ItemId);              // 1:1 :953 RemoveBagItem(item, 1)
    // 1:1 :954-957 solo : CurrentBattlePyramidLocation() == PYRAMID_LOCATION_NONE.
    Task_FadeAndCloseBagMenu(task);
  } else {
    // 1:1 :959-962 party+box pleins (solo) → DisplayItemMessage(gText_BoxFull, CloseItemMessage).
    DisplayItemMessage(task.taskId, FONT_NORMAL, encodeOwText(getString('gText_BoxFull')), CloseItemMessage);
  }
}

/** 1:1 décomp `Task_CloseStatIncreaseMessage(u8 taskId)` (item_use.c:969) : A/B → fermeture. */
function Task_CloseStatIncreaseMessage(task: DecompTask): void {
  if (JOY_NEW(A_BUTTON | B_BUTTON)) {
    // solo : CurrentBattlePyramidLocation() == PYRAMID_LOCATION_NONE.
    Task_FadeAndCloseBagMenu(task);
  }
}

/** 1:1 décomp `Task_UseStatIncreaseItem(u8 taskId)` (item_use.c:980) : après 8 frames (>7),
 *  SE + RemoveBagItem + message UseStatIncreaseItem → Task_CloseStatIncreaseMessage.
 *  data[8] = compteur de frames (1:1 gTasks[taskId].data[8]). */
function Task_UseStatIncreaseItem(task: DecompTask): void {
  if (++task.data[8] > 7) {
    PlaySE(SE_USE_ITEM);                    // 1:1 :984
    _removeOneFromBag(gSpecialVar.ItemId);  // 1:1 :985 RemoveBagItem(item, 1)
    // 1:1 :986-989 solo : DisplayItemMessage(UseStatIncreaseItem(item), Task_CloseStatIncreaseMessage).
    DisplayItemMessage(task.taskId, FONT_NORMAL, _useStatIncreaseItemMessage(gSpecialVar.ItemId), Task_CloseStatIncreaseMessage);
  }
}

/** Pont vers `UseStatIncreaseItem(itemId)` (foyer pokemon.c:5433 = message "ATTAQUE de MON
 *  augmente!" construit par `BufferStatRoseMessage` → gStatNamesTable + gText_DefendersStatRose
 *  + BattleStringExpandPlaceholdersToDisplayedString). DÉFÉRÉ hors périmètre Lot 5 : le corps
 *  dépend de l'infra battle_message NON portée (gStatNamesTable, sStatsToRaise, la variante
 *  `...ToDisplayedString`, l'accès gItemEffectTable X-stat). ⚠️ L'EFFET est déjà appliqué par
 *  `PokemonUseItemEffects` dans `ItemUseInBattle_StatIncrease` — seul le message flavor de
 *  succès retombe sur ce fallback tant que `__UseStatIncreaseItem` n'est pas posé. */
function _useStatIncreaseItemMessage(itemId: number): string | Uint8Array {
  const fn = (globalThis as Record<string, unknown>).__UseStatIncreaseItem as ((id: number) => string | Uint8Array) | undefined;
  if (fn) return fn(itemId);
  console.error('[item-use-battle] __UseStatIncreaseItem non porté (pokemon.c:5433 UseStatIncreaseItem + BufferStatRoseMessage dépendent de battle_message non porté) — fallback message');
  return encodeOwText(getString('gText_WontHaveEffect'));
}

/** 1:1 décomp `ItemUseInBattle_StatIncrease(u8 taskId)` (item_use.c:994) : applique l'effet
 *  table (X Attaque / Défense Spéciale / Détecteur…) sur le MON ACTIF du menu ; échec (aucun
 *  effet) → message + close ; succès → Task_UseStatIncreaseItem. */
export function ItemUseInBattle_StatIncrease(task: DecompTask): void {
  const partyId = gBattlerPartyIndexes[gBattlerInMenuId]; // 1:1 :996
  // 1:1 :998 ExecuteTableBasedItemEffect(&gPlayerParty[partyId], item, partyId, 0) — APPLIQUE
  // l'effet, retourne cannotUse (TRUE = aucun effet). inBattle auto-détecté (gBattleTypeFlags).
  const result = PokemonUseItemEffects(gPlayerParty[partyId], gSpecialVar.ItemId, partyId, 0, false);
  if (result.cannotUse) {
    // 1:1 :1000-1001 solo : "Ça n'aura aucun effet." + CloseItemMessage.
    StringExpandPlaceholders(gStringVar4, encodeOwText(getString('gText_WontHaveEffect')));
    DisplayItemMessage(task.taskId, FONT_NORMAL, gStringVar4, CloseItemMessage);
  } else {
    // 1:1 :1007-1008 func = Task_UseStatIncreaseItem ; data[8] = 0.
    task.func = Task_UseStatIncreaseItem;
    task.data[8] = 0;
  }
}

/** 1:1 décomp `ItemUseInBattle_ShowPartyMenu(u8 taskId)` (item_use.c:1012) :
 *  `gBagMenu->newScreenCallback = ChooseMonForInBattleItem ; Task_FadeAndCloseBagMenu(taskId);`
 *  → le sac se ferme VERS le party-menu (choisir le mon cible). `ChooseMonForInBattleItem`
 *  (foyer party_menu.c) résolu par pont globalThis (câblage party_menu.ts, Lot 4/5 ; plan §5.a
 *  = réutiliser OpenPartyScreenForItemUse avec retour combat). */
function ItemUseInBattle_ShowPartyMenu(task: DecompTask): void {
  // solo : CurrentBattlePyramidLocation() == PYRAMID_LOCATION_NONE (branche gPyramidBagMenu hors-solo).
  if (gBagMenu) gBagMenu.newScreenCallback = _ChooseMonForInBattleItem;
  Task_FadeAndCloseBagMenu(task);
}

/** Pont anti-cycle vers `ChooseMonForInBattleItem` (party_menu.c:5781) — posé par
 *  party_menu.ts au top-level (chargé statiquement par item_menu.ts/item_use.ts, donc
 *  résolu dès que le sac s'ouvre). */
function _ChooseMonForInBattleItem(): void {
  const cb = (globalThis as Record<string, unknown>).__ChooseMonForInBattleItem as (() => void) | undefined;
  if (cb) { cb(); return; }
  console.error('[item-use-battle] __ChooseMonForInBattleItem absent (party_menu.ts non chargé ?)');
}

/** 1:1 décomp `ItemUseInBattle_Medicine(u8 taskId)` (item_use.c:1026). */
export function ItemUseInBattle_Medicine(task: DecompTask): void {
  setItemUseCB(ItemUseCB_Medicine);       // 1:1 :1028 gItemUseCB = ItemUseCB_Medicine
  ItemUseInBattle_ShowPartyMenu(task);     // 1:1 :1029
}

/** 1:1 décomp `ItemUseInBattle_PPRecovery(u8 taskId)` (item_use.c:1039). */
export function ItemUseInBattle_PPRecovery(task: DecompTask): void {
  setItemUseCB(ItemUseCB_PPRecovery);      // 1:1 :1041 gItemUseCB = ItemUseCB_PPRecovery
  ItemUseInBattle_ShowPartyMenu(task);     // 1:1 :1042
}

/** GetItemPocket (item.ts, retourne le NOM POCKET_*) → id 0-indexé (ITEMS_POCKET..KEYITEMS_POCKET),
 *  = ce qu'attend UpdatePocketItemList/UpdatePocketListPosition. Le décomp GetItemPocket rend
 *  directement l'enum numérique ; notre data-table stocke la string. */
function _pocketIdForItem(itemId: number): number {
  switch (GetItemPocket(itemId)) {
    case 'POCKET_POKE_BALLS': return BALLS_POCKET;
    case 'POCKET_TM_HM':      return TMHM_POCKET;
    case 'POCKET_BERRIES':    return BERRIES_POCKET;
    case 'POCKET_KEY_ITEMS':  return KEYITEMS_POCKET;
    default:                  return ITEMS_POCKET; // POCKET_ITEMS
  }
}

/** 1:1 décomp `RemoveUsedItem(void)` (item_use.c:824) : retire l'objet du sac, construit
 *  gStringVar4 = "{PLAYER} utilise {objet}." et rafraîchit la poche courante. */
function RemoveUsedItem(): void {
  const itemId = gSpecialVar.ItemId;
  _removeOneFromBag(itemId);                                  // 1:1 :826 RemoveBagItem(item, 1)
  setStringVar(2, GetItemName(itemId));                       // 1:1 :827 CopyItemName(item, gStringVar2)
  StringExpandPlaceholders(gStringVar4, encodeOwText(getString('gText_PlayerUsedVar2'))); // 1:1 :828
  // 1:1 :829-833 solo : CurrentBattlePyramidLocation() == PYRAMID_LOCATION_NONE.
  const pocketId = _pocketIdForItem(itemId);                  // GetItemPocket(item)
  UpdatePocketItemList(pocketId);
  UpdatePocketListPosition(pocketId);
}

/** 1:1 décomp `DisplayCannotUseItemMessage(taskId, isUsingRegisteredKeyItemOnField, str)`
 *  (item_use.c:142) : branche NON-field (combat/menu, solo) → DisplayItemMessage + CloseItemMessage.
 *  La branche field-registered (DisplayItemMessageOnField) n'est PAS atteinte depuis le combat
 *  (tUsingRegisteredKeyItem == 0 en combat) → déférée (field infra, hors périmètre). */
function DisplayCannotUseItemMessage(taskId: number, isUsingRegisteredKeyItemOnField: boolean, strKey: string): void {
  StringExpandPlaceholders(gStringVar4, encodeOwText(getString(strKey))); // 1:1 :144
  if (!isUsingRegisteredKeyItemOnField) {
    // solo : DisplayItemMessage(taskId, FONT_NORMAL, gStringVar4, CloseItemMessage) (1:1 :148).
    DisplayItemMessage(taskId, FONT_NORMAL, gStringVar4, CloseItemMessage);
  } else {
    // 1:1 :153 DisplayItemMessageOnField + Task_CloseCantUseKeyItemMessage (field-registered)
    // — non atteint depuis le combat (câblage field hors périmètre). Déféral honnête.
    console.error('[item-use-battle] DisplayCannotUseItemMessage branche field-registered non portée (non atteinte en combat)');
  }
}

/** 1:1 décomp `DisplayDadsAdviceCannotUseItemMessage(taskId, isUsingRegisteredKeyItemOnField)`
 *  (item_use.c:158) : "…chaque chose en son temps!" (gText_DadsAdvice). */
function DisplayDadsAdviceCannotUseItemMessage(taskId: number, isUsingRegisteredKeyItemOnField: boolean): void {
  DisplayCannotUseItemMessage(taskId, isUsingRegisteredKeyItemOnField, 'gText_DadsAdvice');
}

/** 1:1 décomp `ItemUseInBattle_Escape(u8 taskId)` (item_use.c:1046) : Poké Poupée / Queue
 *  Peluche. Combat sauvage → RemoveUsedItem + message + fermeture (le moteur joue la fuite) ;
 *  dresseur → refus (conseil de papa). */
export function ItemUseInBattle_Escape(task: DecompTask): void {
  if ((gBattleTypeFlags & BATTLE_TYPE_TRAINER) === 0) {
    RemoveUsedItem();
    // 1:1 :1052-1053 solo : DisplayItemMessage(gStringVar4, Task_FadeAndCloseBagMenu).
    DisplayItemMessage(task.taskId, FONT_NORMAL, gStringVar4, Task_FadeAndCloseBagMenu);
  } else {
    // 1:1 :1059 DisplayDadsAdviceCannotUseItemMessage(taskId, tUsingRegisteredKeyItem).
    // tUsingRegisteredKeyItem = data[3] (item_use.c:78) — 0 en combat.
    DisplayDadsAdviceCannotUseItemMessage(task.taskId, task.data[3] === 1);
  }
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
