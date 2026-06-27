/**
 * scrcmd_bytevm.ts — handlers du byte-VM, 1:1 de `src/scrcmd.c` (Phase 4, slice).
 *
 * TRANSITOIRE : deviendra `src/scrcmd.ts` (handlers dispatch-par-nom actuels) au
 * swap. Chaque handler lit ses args via ScriptRead{Byte,Halfword,Word} et renvoie
 * TRUE pour wait — exactement comme scrcmd.c.
 *
 * SLICE INITIAL = opcodes d'état + flux (sans UI ni specials) : prouve la chaîne
 * bytecode → VM → dispatch → handler → état du jeu, contrôle de flux inclus
 * (goto/call/return/goto_if via offsets de l'image globale).
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c (1:1).
 */

import {
  ScriptContext, ScrCmdFunc, gScriptCmdTable,
  ScriptReadByte, ScriptReadHalfword, ScriptReadWord,
  ScriptJump, ScriptCall, ScriptReturn, StopScript, SetupNativeScript,
  ScriptContext_Stop, ptrFromOffset, resolveSymbol, resolveMapSymbol, getScriptOffset, getLabelAtOffset,
} from './script_bytevm';
import { VarGet, VarSet, GetVarPointer, FlagSet, FlagClear, FlagGet } from './event_data';
import { VAR_0x8004 } from '../include/constants/vars';
import { PARTY_SIZE, MAX_MON_MOVES } from '../include/constants/global';
import { MonKnowsMove, SetMonMoveSlot } from './engine/battle/party-storage';
import { DoTimeBasedEvents } from './clock';
import { setPendingWarp, SetDynamicWarp, getPendingWarp } from './engine/field/warp-system';
import { AddMoney, RemoveMoney, IsEnoughMoney } from './money';
import { AddBagItem, RemoveBagItem, CheckBagHasItem, CheckBagHasSpace } from './engine/bag/bag';
import { GetCoins, AddCoins, RemoveCoins } from './coins';
import { VAR_RESULT } from '../include/constants/vars';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
// Registre des specials (name→fn) du moteur actuel — réutilisé transitoirement
// (les fns de special sont les mêmes fns de jeu 1:1). gSpecials[id] = invokeSpecial(name).
import { invokeSpecial, consumeWaitStateSignal } from './scrcmd';
import { getText } from './script';
import { ShowFieldMessage, IsFieldMessageBoxHidden, HideFieldMessageBox } from './field_message_box';
// Système object-events / joueur (mêmes fns 1:1 que les handlers parsés vérifiés).
import { getSelectedNpc, OPPOSITE_DIR, isPlayerStepFinished } from './engine/script/script-opcodes-helpers';
import { gSelectedObjectEvent } from './engine/script/script-vars';
import {
  FreezeObjectEvent, UnfreezeObjectEvent, ObjectEventClearHeldMovementIfFinished,
  ObjectEventSetHeldMovement, gObjectEvents,
} from './event_object_movement';
import { GetPlayerFacingDirection, gPlayerAvatar, IncrementGameStat, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST } from './field_player_avatar';
import { HasTrainerBeenFought, SetTrainerFlag, ClearTrainerFlag,
  configureTrainerBattleCore, startTrainerBattleAndGetPoll,
  BattleSetup_GetScriptAddrAfterBattle, BattleSetup_GetTrainerPostBattleScript } from './battle_setup';
import type { TrainerArgSource } from './battle_setup';
import { CreateScriptedWildMon, BattleSetup_StartScriptedWildBattle } from './engine/battle/battle-setup-helpers';
import { MALE_GENDER, FEMALE_GENDER, isAOrBNewlyPressed } from './engine/script/script-opcodes-helpers';
import { PlaySE, getRuntime, FadeOutBGM, FadeInBGM } from '../harness/runtime/decomp-globals';
import { ScriptMovement_UnfreezeObjectEvents } from './script_movement';
import { MapGridSetMetatileIdAt, MAP_OFFSET, MAPGRID_IMPASSABLE, gMapHeader } from './fieldmap';
// Voie A : logique object-event partagée avec le moteur parsé (source unique).
import { doSetObjectXY, doSetObjectXYPerm, doAddObject, doRemoveObject, doSetObjectInvisibility, doTurnObject, doCopyObjectXYToPerm, doSetObjectMovementType, doSetObjectSubpriority, doResetObjectSubpriority } from './scrcmd_object';
import { Overworld_SetSavedMusic } from './overworld';
import { SetFlashLevel, makeAnimateFlashPoll } from './scrcmd_flash';
import * as Songs from '../include/constants/songs';
import { applyMovement, isMovementDone, isAllMovementsDone } from './engine/field/movement-system';
import {
  MOVEMENT_ACTION_FACE_DOWN, MOVEMENT_ACTION_FACE_UP, MOVEMENT_ACTION_FACE_LEFT, MOVEMENT_ACTION_FACE_RIGHT,
} from '../include/constants/event_object_movement';
// Tables de noms FR (= adaptation de gSpeciesNames/gMoveNames/gItems[].name/gTrainers[]
// — source unique partagée avec le moteur parsé, donc zéro divergence sur le formatage).
import { getSpeciesNameFr, getMoveNameFr, getItemNameFr, getTrainer, getTrainerNameFr, getTrainerClassNameFr, GetPocketByItemId } from '../harness/runtime/data-tables';
import { setStringVar, decodeOwBytes } from './text';
import { CalculatePlayerPartyCount, GetMonData, SetMonData, MON_DATA_SPECIES, MON_DATA_IS_EGG, MON_DATA_NICKNAME, MON_DATA_MET_LOCATION, MON_DATA_MODERN_FATEFUL_ENCOUNTER, gPlayerParty } from './engine/battle/party-storage';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { SetSavedWeather, SetSavedWeatherFromCurrMapHeader, DoCurrentWeather } from './field_weather_effect';
import { FadeScreen } from './field_weather';
import { Random } from './random';
import { PlantBerryTree } from './berry';
import { GetHealLocation } from './heal_location';
import { GetCurrentApproachingTrainerObjectEventId, doLockForTrainer } from './scrcmd_trainer';
import { ScriptMenu_Multichoice, ScriptMenu_MultichoiceWithDefault, ScriptMenu_MultichoiceGrid, ScriptMenu_YesNo } from './script_menu';
import { DecorationAdd, DecorationCheckSpace } from './decoration';
import { sContestNames } from './contest_strings';
import { doPokemart } from './shop';
import { makeSpecialInlineFlowPoll } from './special_flows';
// Voie A : logique « porte » partagée avec le moteur parsé (source unique).
import { doOpenDoor, doCloseDoor, doSetDoorOpen, doSetDoorClosed, isDoorAnimationStopped } from './scrcmd_door';
// Voie A : logique « field effect » partagée avec le moteur parsé (source unique).
import { doFieldEffect, setFieldEffectArgument, setWaitFieldEffect } from './scrcmd_fieldeffect';

// gStdScripts (1:1 event_scripts.s:95-107) — STD_*/MSGBOX_* index → label de std script.
const gStdScripts: readonly string[] = [
  'Std_ObtainItem', 'Std_FindItem', 'Std_MsgboxNPC', 'Std_MsgboxSign', 'Std_MsgboxDefault',
  'Std_MsgboxYesNo', 'Std_MsgboxAutoclose', 'Std_ObtainDecoration', 'Std_RegisteredInMatchCall',
  'Std_MsgboxGetPoints', 'Std_MsgboxPokenav',
];
/** 1:1 scrcmd.c FetchScriptStdPointer : index → offset image du std script (ou null). */
function fetchStdOffset(index: number): number | null {
  if (index < 0 || index >= gStdScripts.length) return null;
  const off = getScriptOffset(gStdScripts[index]);
  return off === undefined ? null : off;
}

// 1:1 scrcmd.c:76-84 — [condition][comparisonResult] → 1 si la branche est prise.
//   <  =  >
const sScriptConditionTable: number[][] = [
  [1, 0, 0], // <
  [0, 1, 0], // =
  [0, 0, 1], // >
  [1, 1, 0], // <=
  [0, 1, 1], // >=
  [1, 0, 1], // !=
];

// `*GetVarPointer(id)` (lecture/écriture) — notre GetVarPointer renvoie {get,set}|null.
function varDeref(id: number): number { const p = GetVarPointer(id); return p ? p.get() : 0; }
function varStore(id: number, v: number): void { const p = GetVarPointer(id); if (p) p.set(v & 0xFFFF); }

/** 1:1 scrcmd.c:381-388 `Compare(a, b)` : 0=<, 1==, 2=>. */
function Compare(a: number, b: number): number { return a < b ? 0 : a === b ? 1 : 2; }

// gSpecials : id (specials-table.json) → nom → fn de jeu (via invokeSpecial).
let _specialNames: string[] = [];
export function setSpecialNames(names: string[]): void { _specialNames = names; }
/** `gSpecials[index]()` (1:1) : résout l'id en nom puis invoque la fn de jeu. */
function callSpecial(index: number): number {
  const name = _specialNames[index];
  if (name === undefined) { console.warn(`[byte-vm] special id ${index} hors table`); return 0; }
  return invokeSpecial(name);
}

// ─── handlers (1:1 scrcmd.c) ─────────────────────────────────────────────────
const ScrCmd_nop: ScrCmdFunc = () => false;                                  // :94
const ScrCmd_nop1: ScrCmdFunc = () => false;                                 // :99
const ScrCmd_end: ScrCmdFunc = (ctx) => { StopScript(ctx); return false; };  // :104

const ScrCmd_gotonative: ScrCmdFunc = (ctx) => {                             // :110
  // addr = pointeur natif. Chez nous : id de symbole natif → résolu en Phase 4b.
  const id = ScriptReadWord(ctx); void id;
  SetupNativeScript(ctx, () => true); // stub temporaire (slice sans natifs)
  return true;
};

// :142 ScrCmd_waitstate : suspend le script jusqu'à un signal de reprise. 1:1 (porté de
// l'ancien handler parsé) : reprend si SignalWaitState a été émis (flow UI fermé) OU si un
// warp s'est consommé / la map a changé. (Avant : ScriptContext_Stop seul → figeait les
// flows `special X(UI); waitstate`.)
const ScrCmd_waitstate: ScrCmdFunc = (ctx) => {
  if (consumeWaitStateSignal()) return false;   // déjà signalé en amont → continue direct
  const startMapId = gMapHeader?.id;
  SetupNativeScript(ctx, () => {
    if (consumeWaitStateSignal()) return true;
    if (getPendingWarp()) return false;          // warp en cours → attendre
    const cur = gMapHeader?.id;
    if (cur && cur !== startMapId) return true;  // map changée (warp fini) → reprendre
    return false;
  });
  return true;
};

// 1:1 scrcmd.c:118-124 : u16 index = ScriptReadHalfword ; gSpecials[index]().
// + specials à UI inline (waitstate) : flow partagé voie A (special_flows) → SetupNativeScript.
const ScrCmd_special: ScrCmdFunc = (ctx) => {
  const index = ScriptReadHalfword(ctx);
  const name = _specialNames[index];
  const poll = name ? makeSpecialInlineFlowPoll(name) : null;
  if (poll) { SetupNativeScript(ctx, poll); return true; }
  callSpecial(index);
  return false;
};
// 1:1 scrcmd.c:126-132 : var = GetVarPointer(ScriptReadHalfword) ; *var = gSpecials[ScriptReadHalfword]().
const ScrCmd_specialvar: ScrCmdFunc = (ctx) => {
  const ref = GetVarPointer(ScriptReadHalfword(ctx));   // lire l'id de var EN PREMIER (ordre 1:1)
  const result = callSpecial(ScriptReadHalfword(ctx));
  if (ref) ref.set(result & 0xFFFF);
  return false;
};

const ScrCmd_goto: ScrCmdFunc = (ctx) => {                                   // :148
  const off = ScriptReadWord(ctx);
  ScriptJump(ctx, ptrFromOffset(off));
  return false;
};
const ScrCmd_return: ScrCmdFunc = (ctx) => { ScriptReturn(ctx); return false; }; // :156
const ScrCmd_call: ScrCmdFunc = (ctx) => {                                   // :162
  const off = ScriptReadWord(ctx);
  ScriptCall(ctx, ptrFromOffset(off));
  return false;
};
const ScrCmd_goto_if: ScrCmdFunc = (ctx) => {                                // :170
  const condition = ScriptReadByte(ctx);
  const off = ScriptReadWord(ctx);
  if (sScriptConditionTable[condition][ctx.comparisonResult] === 1) ScriptJump(ctx, ptrFromOffset(off));
  return false;
};
const ScrCmd_call_if: ScrCmdFunc = (ctx) => {                               // :180
  const condition = ScriptReadByte(ctx);
  const off = ScriptReadWord(ctx);
  if (sScriptConditionTable[condition][ctx.comparisonResult] === 1) ScriptCall(ctx, ptrFromOffset(off));
  return false;
};

const ScrCmd_loadword: ScrCmdFunc = (ctx) => { const i = ScriptReadByte(ctx); ctx.data[i] = ScriptReadWord(ctx); return false; };   // :304
const ScrCmd_loadbyte: ScrCmdFunc = (ctx) => { const i = ScriptReadByte(ctx); ctx.data[i] = ScriptReadByte(ctx); return false; };   // :328
const ScrCmd_copylocal: ScrCmdFunc = (ctx) => { const d = ScriptReadByte(ctx); const s = ScriptReadByte(ctx); ctx.data[d] = ctx.data[s]; return false; }; // :344

const ScrCmd_setvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, ScriptReadHalfword(ctx)); return false; };          // :360
const ScrCmd_copyvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, varDeref(ScriptReadHalfword(ctx))); return false; }; // :367
const ScrCmd_setorcopyvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, VarGet(ScriptReadHalfword(ctx))); return false; }; // :374
const ScrCmd_addvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, (varDeref(id) + ScriptReadHalfword(ctx)) & 0xFFFF); return false; }; // :465
const ScrCmd_subvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, (varDeref(id) - VarGet(ScriptReadHalfword(ctx))) & 0xFFFF); return false; }; // :472

const ScrCmd_compare_local_to_local: ScrCmdFunc = (ctx) => { const a = ctx.data[ScriptReadByte(ctx)]; const b = ctx.data[ScriptReadByte(ctx)]; ctx.comparisonResult = Compare(a & 0xFF, b & 0xFF); return false; }; // :390
const ScrCmd_compare_local_to_value: ScrCmdFunc = (ctx) => { const a = ctx.data[ScriptReadByte(ctx)]; const b = ScriptReadByte(ctx); ctx.comparisonResult = Compare(a & 0xFF, b); return false; }; // :399
const ScrCmd_compare_var_to_value: ScrCmdFunc = (ctx) => { const a = varDeref(ScriptReadHalfword(ctx)); const b = ScriptReadHalfword(ctx); ctx.comparisonResult = Compare(a, b); return false; }; // :444
const ScrCmd_compare_var_to_var: ScrCmdFunc = (ctx) => { const a = varDeref(ScriptReadHalfword(ctx)); const b = varDeref(ScriptReadHalfword(ctx)); ctx.comparisonResult = Compare(a, b); return false; }; // :453

// ─── lock / release / faceplayer (1:1 scrcmd.c:1152-1263) ───────────────────
/** 1:1 GetFaceDirectionMovementAction(dir) → MOVEMENT_ACTION_FACE_*. */
function faceAction(dir: number): number {
  switch (dir) {
    case DIR_SOUTH: return MOVEMENT_ACTION_FACE_DOWN;
    case DIR_NORTH: return MOVEMENT_ACTION_FACE_UP;
    case DIR_WEST: return MOVEMENT_ACTION_FACE_LEFT;
    case DIR_EAST: return MOVEMENT_ACTION_FACE_RIGHT;
    default: return MOVEMENT_ACTION_FACE_DOWN;
  }
}

// 1:1 scrcmd.c:1152-1156 ScrCmd_faceplayer (= ObjectEventFaceOppositeDirection).
const ScrCmd_faceplayer: ScrCmdFunc = () => {
  const npc = getSelectedNpc();
  if (!npc) return false;
  const opp = OPPOSITE_DIR[GetPlayerFacingDirection()] ?? DIR_SOUTH;
  ObjectEventSetHeldMovement(npc, faceAction(opp));
  return false;
};

// 1:1 scrcmd.c:1201-1213 ScrCmd_lockall : gèle tous les objets, attend le step joueur.
const ScrCmd_lockall: ScrCmdFunc = (ctx) => {
  for (const npc of gObjectEvents) if (npc.active) FreezeObjectEvent(npc);
  SetupNativeScript(ctx, () => isPlayerStepFinished());
  return true;
};

// 1:1 scrcmd.c:1217-1237 ScrCmd_lock : gèle tous sauf player+selected ; gèle selected à la fin.
const ScrCmd_lock: ScrCmdFunc = (ctx) => {
  const npc = getSelectedNpc();
  for (const n of gObjectEvents) if (n.active && n !== npc) FreezeObjectEvent(n);
  SetupNativeScript(ctx, () => {
    if (!isPlayerStepFinished()) return false;
    if (npc) FreezeObjectEvent(npc);
    return true;
  });
  return true;
};

// 1:1 scrcmd.c:1239-1249 ScrCmd_releaseall.
const ScrCmd_releaseall: ScrCmdFunc = () => {
  HideFieldMessageBox();
  const player = gObjectEvents[gPlayerAvatar.objectEventId];
  if (player) ObjectEventClearHeldMovementIfFinished(player);
  ScriptMovement_UnfreezeObjectEvents();
  for (const npc of gObjectEvents) if (npc.active) UnfreezeObjectEvent(npc);
  return false;
};

// 1:1 scrcmd.c:1251-1263 ScrCmd_release.
const ScrCmd_release: ScrCmdFunc = () => {
  HideFieldMessageBox();
  const selected = gObjectEvents[gSelectedObjectEvent.index];
  if (selected && selected.active) ObjectEventClearHeldMovementIfFinished(selected);
  const player = gObjectEvents[gPlayerAvatar.objectEventId];
  if (player) ObjectEventClearHeldMovementIfFinished(player);
  ScriptMovement_UnfreezeObjectEvents();
  for (const npc of gObjectEvents) if (npc.active) UnfreezeObjectEvent(npc);
  return false;
};

// ─── warp (adaptation async setPendingWarp — cf fieldmap-1to1-adaptations) ───
/** Lit le layout formatwarp (map u16 mapSymbol + warpId u8 + x u16 + y u16). */
function readWarp(ctx: ScriptContext): { destMap: string; warpId: number; x: number; y: number } {
  const destMap = resolveMapSymbol(ScriptReadHalfword(ctx)) ?? '';
  const warpId = ScriptReadByte(ctx);
  const x = VarGet(ScriptReadHalfword(ctx));
  const y = VarGet(ScriptReadHalfword(ctx));
  return { destMap, warpId, x, y };
}
// 1:1 scrcmd.c:739-751 (SetWarpDestination+DoWarp) → adapté : setPendingWarp async.
const ScrCmd_warp: ScrCmdFunc = (ctx) => {
  const { destMap, warpId, x, y } = readWarp(ctx);
  setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step');
  return false;
};
const ScrCmd_warpsilent: ScrCmdFunc = (ctx) => {
  const { destMap, warpId, x, y } = readWarp(ctx);
  setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step');
  return false;
};
// ─── warp variants (1:1 scrcmd.c:827-885) — posent les MÊMES globals que le parsé
//     (gSavedWarp/gDiveWarp/gHoleWarp/__escapeWarp) ou SetDynamicWarp = source unique. ──
const ScrCmd_setwarp: ScrCmdFunc = (ctx) => { (globalThis as Record<string, unknown>).gSavedWarp = readWarp(ctx); return false; };        // :827 SetWarpDestination
const ScrCmd_setdivewarp: ScrCmdFunc = (ctx) => { (globalThis as Record<string, unknown>).gDiveWarp = readWarp(ctx); return false; };     // :851 SetFixedDiveWarp
const ScrCmd_setholewarp: ScrCmdFunc = (ctx) => { (globalThis as Record<string, unknown>).gHoleWarp = readWarp(ctx); return false; };     // :863 SetFixedHoleWarp
const ScrCmd_setescapewarp: ScrCmdFunc = (ctx) => { const w = readWarp(ctx); (globalThis as Record<string, unknown>).__escapeWarp = { mapName: w.destMap.replace(/^MAP_/, ''), x: w.x, y: w.y }; return false; }; // :875 SetEscapeWarp
const ScrCmd_setdynamicwarp: ScrCmdFunc = (ctx) => { const w = readWarp(ctx); SetDynamicWarp(w.destMap, w.x, w.y); return false; };        // :839 SetDynamicWarpWithCoords
// Variantes warp à transition ANIMÉE (1:1 scrcmd.c) — la transition spécifique (door/spin/
// white-fade/mossdeep) = dette assumée, identique au parsé : warp simple. Layout = warp
// (u16 map, u8 warpId, u16 x, u16 y) → setPendingWarp 'step'.
const ScrCmd_warpdoor: ScrCmdFunc = (ctx) => { const { destMap, warpId, x, y } = readWarp(ctx); setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step'); return false; };       // :767 DoDoorWarp
const ScrCmd_warpmossdeepgym: ScrCmdFunc = (ctx) => { const { destMap, warpId, x, y } = readWarp(ctx); setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step'); return false; }; // :813 DoMossdeepGymWarp
const ScrCmd_warpspinenter: ScrCmdFunc = (ctx) => { const { destMap, warpId, x, y } = readWarp(ctx); setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step'); return false; };   // :2241 DoSpinEnterWarp
const ScrCmd_warpwhitefade: ScrCmdFunc = (ctx) => { const { destMap, warpId, x, y } = readWarp(ctx); setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step'); return false; };   // :2295 DoWhiteFadeWarp
// warphole :781 : map(u16) SEUL ; PlayerGetDestCoords → setPendingWarp 'fall'. MAP_UNDEFINED → gHoleWarp (set par setholewarp). Identique au parsé (scrcmd.ts:770).
const ScrCmd_warphole: ScrCmdFunc = (ctx) => {                                // :781
  const destMap = resolveMapSymbol(ScriptReadHalfword(ctx)) ?? 'MAP_UNDEFINED';
  const playerX = gSaveBlock1Ptr.pos.x ?? 0;
  const playerY = gSaveBlock1Ptr.pos.y ?? 0;
  if (destMap === 'MAP_UNDEFINED') {
    const holeWarp = (globalThis as Record<string, unknown>).gHoleWarp as { destMap?: string } | undefined;
    if (holeWarp?.destMap) setPendingWarp({ destMap: holeWarp.destMap, warpId: -1, x: playerX, y: playerY, elevation: 0 }, 'fall');
  } else {
    setPendingWarp({ destMap, warpId: -1, x: playerX, y: playerY, elevation: 0 }, 'fall');
  }
  return false;
};

// ─── BGM fade (1:1 scrcmd.c:969/981 ; hardware-exempt → FadeOutBGM/FadeInBGM, identique au parsé) ──
const ScrCmd_fadeoutbgm: ScrCmdFunc = (ctx) => { const speed = ScriptReadByte(ctx); FadeOutBGM(speed || 4); return false; };  // :969
const ScrCmd_fadeinbgm: ScrCmdFunc = (ctx) => { const speed = ScriptReadByte(ctx); FadeInBGM(speed || 4); return false; };    // :981

// ─── messageinstant (1:1 scrcmd.c:1298) — rendu instantané = dette (alias message, comme le parsé) ──
const ScrCmd_messageinstant: ScrCmdFunc = (ctx) => { let p = ScriptReadWord(ctx); if (p === 0) p = ctx.data[0]; showFieldText(p); return false; };  // :1298
// ─── pokenavcall (1:1 scrcmd.c:1275) — dette R3 PokeNav UI (consomme le mot, skip, comme le parsé) ──
const ScrCmd_pokenavcall: ScrCmdFunc = (ctx) => { ScriptReadWord(ctx); return false; };  // :1275

// ─── mon data party (1:1 scrcmd.c:2210/2256) ────────────────────────────────
const ScrCmd_setmonmetlocation: ScrCmdFunc = (ctx) => {                       // :2256
  const idx = VarGet(ScriptReadHalfword(ctx));
  const location = ScriptReadByte(ctx);
  if (idx < PARTY_SIZE) SetMonData(gPlayerParty[idx], MON_DATA_MET_LOCATION, location);
  return false;
};
const ScrCmd_setmodernfatefulencounter: ScrCmdFunc = (ctx) => {               // :2210
  const idx = VarGet(ScriptReadHalfword(ctx));
  if (idx < PARTY_SIZE) SetMonData(gPlayerParty[idx], MON_DATA_MODERN_FATEFUL_ENCOUNTER, 1);
  return false;
};

// ─── returnram (1:1 scrcmd.c:283) — RAM script (mystery event) ; parsé = StopScript (dette). ──
const ScrCmd_returnram: ScrCmdFunc = (ctx) => { StopScript(ctx); return false; };  // :283

// ─── checkitemtype (1:1 scrcmd.c:523) : VAR_RESULT = GetPocketByItemId(VarGet(itemId)). Voie A. ──
const ScrCmd_checkitemtype: ScrCmdFunc = (ctx) => { setResult(GetPocketByItemId(VarGet(ScriptReadHalfword(ctx)))); return false; };  // :523

// ─── setrespawn (1:1 scrcmd.c:2005) : SetLastHealLocationWarp(VarGet(healLocationId)). Le web
//     stocke respawnLocation = HEAL_LOCATION_* STRING (dette R3, cf [[next-chantier-pokecenter-heal]]) ;
//     GetHealLocation(id 1-based) → .id donne EXACTEMENT la string que pose le parsé (source unique). ──
const ScrCmd_setrespawn: ScrCmdFunc = (ctx) => {                              // :2005
  const heal = GetHealLocation(VarGet(ScriptReadHalfword(ctx)));
  if (heal) (gSaveBlock1Ptr as { respawnLocation?: string }).respawnLocation = heal.id;
  return false;
};

// ─── menus multichoice / yesno (1:1 scrcmd.c:1337-1418 ; logique partagée script_menu — voie A) ──
// Layout décomp : octets bruts (PAS de VarGet sur multichoiceId = valeur MULTI_* littérale).
const ScrCmd_multichoice: ScrCmdFunc = (ctx) => {                             // :1353
  const left = ScriptReadByte(ctx), top = ScriptReadByte(ctx), id = ScriptReadByte(ctx), ignoreB = ScriptReadByte(ctx);
  const poll = ScriptMenu_Multichoice(left, top, id, ignoreB !== 0);
  if (!poll) return false; SetupNativeScript(ctx, poll); return true;
};
const ScrCmd_multichoicedefault: ScrCmdFunc = (ctx) => {                      // :1371
  const left = ScriptReadByte(ctx), top = ScriptReadByte(ctx), id = ScriptReadByte(ctx), def = ScriptReadByte(ctx), ignoreB = ScriptReadByte(ctx);
  const poll = ScriptMenu_MultichoiceWithDefault(left, top, id, ignoreB !== 0, def);
  if (!poll) return false; SetupNativeScript(ctx, poll); return true;
};
const ScrCmd_multichoicegrid: ScrCmdFunc = (ctx) => {                         // :1401
  const left = ScriptReadByte(ctx), top = ScriptReadByte(ctx), id = ScriptReadByte(ctx), cols = ScriptReadByte(ctx), ignoreB = ScriptReadByte(ctx);
  const poll = ScriptMenu_MultichoiceGrid(left, top, id, ignoreB !== 0, cols);
  if (!poll) return false; SetupNativeScript(ctx, poll); return true;
};
const ScrCmd_yesnobox: ScrCmdFunc = (ctx) => {                                // :1337
  const left = ScriptReadByte(ctx), top = ScriptReadByte(ctx);
  SetupNativeScript(ctx, ScriptMenu_YesNo(left, top)); return true;
};

// ─── mon pic (1:1 scrcmd.c:1446/1456) — stubs identiques au parsé (ScriptMenu_ShowPokemonPic non porté) ──
const ScrCmd_showmonpic: ScrCmdFunc = (ctx) => { VarGet(ScriptReadHalfword(ctx)); ScriptReadByte(ctx); ScriptReadByte(ctx); return false; };  // :1446
const ScrCmd_hidemonpic: ScrCmdFunc = (ctx) => { let f = 0; SetupNativeScript(ctx, () => { f++; return f >= 8; }); return true; };             // :1456

// ─── décoration (1:1 scrcmd.c:549/565 ; suivi possession partagé decoration — voie A) ──
const ScrCmd_adddecoration: ScrCmdFunc = (ctx) => { setResult(DecorationAdd(VarGet(ScriptReadHalfword(ctx)))); return false; };          // :549
const ScrCmd_checkdecorspace: ScrCmdFunc = (ctx) => { setResult(DecorationCheckSpace(VarGet(ScriptReadHalfword(ctx)))); return false; }; // :565

// ─── pokemart (1:1 scrcmd.c:1886 ; logique partagée shop.doPokemart — voie A) ──
// ptr u32 = la liste produits est référencée par LABEL présent DANS l'image → le compilo
// l'émet en RELOC (offset global), pas en symbole synthétique. On reverse l'offset → label
// (getLabelAtOffset) → doPokemart → GetMartItemList (mart-lists.json).
const ScrCmd_pokemart: ScrCmdFunc = (ctx) => {                                // :1886
  const label = getLabelAtOffset(ScriptReadWord(ctx)) ?? '';
  SetupNativeScript(ctx, doPokemart(label));
  return true;
};
// pokemartdecoration / pokemartdecoration2 : boutiques DÉCO non portées (decoration.c) —
// stub identique au parsé : consomme le ptr u32, no-op.
const ScrCmd_pokemartdecoration: ScrCmdFunc = (ctx) => { ScriptReadWord(ctx); return false; };   // :1895
const ScrCmd_pokemartdecoration2: ScrCmdFunc = (ctx) => { ScriptReadWord(ctx); return false; };  // :1905

// ─── checkpcitem (1:1 scrcmd.c:540) — stub VAR_RESULT=0 (PC items non portés, comme le parsé) ──
const ScrCmd_checkpcitem: ScrCmdFunc = (ctx) => { ScriptReadHalfword(ctx); ScriptReadHalfword(ctx); setResult(0); return false; };  // :540

// ─── warpteleport (1:1 scrcmd.c:799) — DoTeleportTileWarp = warp simple (transition = dette) ──
const ScrCmd_warpteleport: ScrCmdFunc = (ctx) => { const { destMap, warpId, x, y } = readWarp(ctx); setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step'); return false; };  // :799

// ─── buffercontestname (1:1 scrcmd.c:1635) : stringVarIndex(u8) + category(VarGet u16) ──
const ScrCmd_buffercontestname: ScrCmdFunc = (ctx) => { const idx = ScriptReadByte(ctx); const cat = VarGet(ScriptReadHalfword(ctx)); setStringVar(idx + 1, sContestNames[cat] ?? ''); return false; };  // :1635

// ─── Tier B — sous-systèmes NON portés (slot machine / rotating-tile puzzle / contest /
//     wondercard) : STUBS identiques au moteur parsé (dette documentée, partagée), consommation
//     d'octets 1:1 pour préserver l'alignement du curseur. ──
const ScrCmd_playslotmachine: ScrCmdFunc = (ctx) => { VarGet(ScriptReadHalfword(ctx)); let f = 0; SetupNativeScript(ctx, () => { f++; return f >= 1; }); return true; };  // :1914
const ScrCmd_initrotatingtilepuzzle: ScrCmdFunc = (ctx) => { VarGet(ScriptReadHalfword(ctx)); return false; };   // :2172
const ScrCmd_moverotatingtileobjects: ScrCmdFunc = (ctx) => { VarGet(ScriptReadHalfword(ctx)); return false; };  // :2158
const ScrCmd_turnrotatingtileobjects: ScrCmdFunc = () => false;   // :2166 (0 arg)
const ScrCmd_freerotatingtilepuzzle: ScrCmdFunc = () => false;    // :2180 (0 arg)
const ScrCmd_showcontestpainting: ScrCmdFunc = (ctx) => { ScriptReadByte(ctx); return false; };  // :1468 (contestWinnerId u8)
const ScrCmd_choosecontestmon: ScrCmdFunc = () => false;          // :1944 (0 arg)
const ScrCmd_startcontest: ScrCmdFunc = () => false;              // :1952 (0 arg)
const ScrCmd_showcontestresults: ScrCmdFunc = () => false;        // :1959 (0 arg)
const ScrCmd_contestlinktransfer: ScrCmdFunc = () => false;       // :1966 (0 arg)
const ScrCmd_trywondercardscript: ScrCmdFunc = () => false;       // :2227 (0 arg ; RAM script non valide → no-op)

// ─── trainer approach (1:1 scrcmd.c:2186/2192 ; logique partagée scrcmd_trainer — voie A) ──
// selectapproachingtrainer : gSelectedObjectEvent = GetCurrentApproachingTrainerObjectEventId().
const ScrCmd_selectapproachingtrainer: ScrCmdFunc = () => { gSelectedObjectEvent.index = GetCurrentApproachingTrainerObjectEventId(); return false; }; // :2186
// lockfortrainer : doLockForTrainer → null = pas de native script (return false) ; sinon poll.
const ScrCmd_lockfortrainer: ScrCmdFunc = (ctx) => {                          // :2192
  const poll = doLockForTrainer(gSelectedObjectEvent.index);
  if (!poll) return false;
  SetupNativeScript(ctx, poll);
  return true;
};

// ─── long-tail simple #3 (1:1 scrcmd.c) ─────────────────────────────────────
// erasebox : lit 4 octets, no-op (= décomp Menu_EraseWindowRect commenté).
const ScrCmd_erasebox: ScrCmdFunc = (ctx) => { ScriptReadByte(ctx); ScriptReadByte(ctx); ScriptReadByte(ctx); ScriptReadByte(ctx); return false; };
// getpokenewsactive : gSpecialVar_Result = IsPokeNewsActive(newsKind). Pas de pokenews → 0 (= parsé).
const ScrCmd_getpokenewsactive: ScrCmdFunc = (ctx) => { VarGet(ScriptReadHalfword(ctx)); setResult(0); return false; };
// messageautoscroll : lit le ptr texte (u32) puis no-op (dette autoscroll U-tier = parsé).
const ScrCmd_messageautoscroll: ScrCmdFunc = (ctx) => { ScriptReadWord(ctx); return false; };
// fadescreenswapbuffers : = fadescreen (swap-buffer = dette palette.c, comme le parsé).
const ScrCmd_fadescreenswapbuffers: ScrCmdFunc = (ctx) => { FadeScreen(ScriptReadByte(ctx), 0); SetupNativeScript(ctx, isPaletteNotActive); return true; };
// savebgm : Overworld_SetSavedMusic(songId) — halfword BRUT (pas VarGet) = id de SONG.
const ScrCmd_savebgm: ScrCmdFunc = (ctx) => { Overworld_SetSavedMusic(ScriptReadHalfword(ctx)); return false; };
// fadedefaultbgm : rejoue la musique par défaut de la map (BGM hardware-exempt via __decompGlobals).
const ScrCmd_fadedefaultbgm: ScrCmdFunc = () => {
  const mapMusic = gMapHeader?.music as number | string | undefined;
  const songId = typeof mapMusic === 'number' ? mapMusic
    : (typeof mapMusic === 'string' ? (Songs as unknown as Record<string, number>)[mapMusic] : undefined);
  if (typeof songId === 'number' && songId > 0) _dg()?.m4aSongNumStart?.(songId, true);
  return false;
};
// setobjectsubpriority / resetobjectsubpriority (voie A) — localId(u16 VarGet), map(u16 ignoré).
const ScrCmd_setobjectsubpriority: ScrCmdFunc = (ctx) => { const l = VarGet(ScriptReadHalfword(ctx)); ScriptReadHalfword(ctx); const p = ScriptReadByte(ctx); doSetObjectSubpriority(l, p); return false; };
const ScrCmd_resetobjectsubpriority: ScrCmdFunc = (ctx) => { const l = VarGet(ScriptReadHalfword(ctx)); ScriptReadHalfword(ctx); doResetObjectSubpriority(l); return false; };

// ─── long-tail simple #4 (1:1 scrcmd.c) ─────────────────────────────────────
// setmonmove : partyIndex(u8), slot(u8), move(u16) → SetMonMoveSlot (ScriptSetMonMoveSlot).
const ScrCmd_setmonmove: ScrCmdFunc = (ctx) => {
  const pIdx = ScriptReadByte(ctx); const slot = ScriptReadByte(ctx); const move = ScriptReadHalfword(ctx);
  if (pIdx >= 0 && pIdx < PARTY_SIZE && slot >= 0 && slot < MAX_MON_MOVES) SetMonMoveSlot(gPlayerParty[pIdx], move, slot);
  return false;
};
// fadenewbgm : fade out + nouvelle BGM (hardware-exempt via __decompGlobals = parsé).
const ScrCmd_fadenewbgm: ScrCmdFunc = (ctx) => {
  const songId = ScriptReadHalfword(ctx);
  const dg = _dg();
  if (dg) { dg.FadeOutBGM?.(4); setTimeout(() => dg.m4aSongNumStart?.(songId, true), 200); }
  return false;
};
// bufferboxname : nom de boîte PC — non modélisé → '' (= moteur parsé, dette data).
const ScrCmd_bufferboxname: ScrCmdFunc = (ctx) => { const idx = ScriptReadByte(ctx); VarGet(ScriptReadHalfword(ctx)); setStringVar(idx + 1, ''); return false; };
// braille (UI braille — font non extraite → no-op = parsé). braillemessage lit le ptr (u32).
const ScrCmd_braillemessage: ScrCmdFunc = (ctx) => { ScriptReadWord(ctx); return false; };
const ScrCmd_closebraillemessage: ScrCmdFunc = () => false;
// flash (voie A — scrcmd_flash) : setflashlevel(VarGet u16) ; animateflash(u8) + wait.
const ScrCmd_setflashlevel: ScrCmdFunc = (ctx) => { SetFlashLevel(VarGet(ScriptReadHalfword(ctx)) & 0xF); return false; };  // :612
const ScrCmd_animateflash: ScrCmdFunc = (ctx) => { SetupNativeScript(ctx, makeAnimateFlashPoll(ScriptReadByte(ctx) & 0xF)); return true; };  // :605

// ─── givemon / giveegg (1:1 scrcmd.c:1681-1700) — ScriptGiveMon/Egg en import dynamique
//     (anti-cycle ESM script_pokemon_util→pokemon, = moteur parsé). VAR_RESULT async. ──
const ScrCmd_givemon: ScrCmdFunc = (ctx) => {                                // :1681
  const species = VarGet(ScriptReadHalfword(ctx));
  const level = ScriptReadByte(ctx);
  const item = VarGet(ScriptReadHalfword(ctx));
  ScriptReadWord(ctx); ScriptReadWord(ctx); ScriptReadByte(ctx);   // args fixes 0,0,0 (alignement)
  const speciesName = constOf(species, 'SPECIES_');
  const heldItem = item ? constOf(item, 'ITEM_') : undefined;
  void import('./script_pokemon_util')
    .then(({ ScriptGiveMon }) => setResult(ScriptGiveMon(speciesName, level, heldItem)))
    .catch((e) => { console.warn('[givemon]', e); setResult(2); });   // 2 = MON_CANT_GIVE
  return false;
};
const ScrCmd_giveegg: ScrCmdFunc = (ctx) => {                                // :1694
  const species = VarGet(ScriptReadHalfword(ctx));
  void import('./script_pokemon_util')
    .then(({ ScriptGiveEgg }) => setResult(ScriptGiveEgg(constOf(species, 'SPECIES_'))))
    .catch((e) => { console.warn('[giveegg]', e); setResult(2); });
  return false;
};

// ─── trainerbattle (1:1 scrcmd.c:1821 + battle_setup.c) — VOIE A ─────────────
// trainerbattle lit le layout BINAIRE byType via configureTrainerBattleCore (mêmes
// tables + switch que le parsé), bridge symbole-texte→label / ret-addr→curseur, puis
// `ctx->scriptPtr = <event-script>` : LE BYTE-VM EXÉCUTE l'event-script décomp
// (EventScript_TryDoNormalTrainerBattle → … → dotrainerbattle → gotobeatenscript).
function makeByteVmTrainerArgSource(ctx: ScriptContext): TrainerArgSource {
  return {
    u8: () => ScriptReadByte(ctx),
    u16: () => ScriptReadHalfword(ctx),
    ptr32: (key) => {
      const v = ScriptReadWord(ctx);
      if (key === 'sTrainerABattleScriptRetAddr' || key === 'sTrainerBBattleScriptRetAddr') {
        return v ? ptrFromOffset(v) : null;                   // continue-script : reloc → curseur image
      }
      return v ? (resolveSymbol(v)?.label ?? null) : null;    // speech : symbole texte → label
    },
    retAddr: () => { const p = ctx.scriptPtr!; return { buf: p.buf, off: p.off }; },   // reprise = curseur APRÈS args
  };
}
const ScrCmd_trainerbattle: ScrCmdFunc = (ctx) => {                          // scrcmd.c:1821
  const sp = ctx.scriptPtr; if (!sp) return false;
  const mode = sp.buf[sp.off];   // peek mode (LoadArgs le consomme ensuite)
  const label = configureTrainerBattleCore(mode, makeByteVmTrainerArgSource(ctx));
  if (label) {
    const off = getScriptOffset(label);
    if (off !== undefined) ScriptJump(ctx, ptrFromOffset(off));
    else { console.warn(`[trainerbattle] event-script '${label}' absent de l'image`); StopScript(ctx); }
  } else {
    StopScript(ctx);   // SET_TRAINER_A/B → ctx->scriptPtr = NULL (1:1)
  }
  return false;
};
const ScrCmd_dotrainerbattle: ScrCmdFunc = (ctx) => { SetupNativeScript(ctx, startTrainerBattleAndGetPoll()); return true; };  // :1827
/** 1:1 décomp : ctx->scriptPtr = position de reprise après combat (label/curseur). */
function resumeAfterBattle(ctx: ScriptContext, r: string | { opcodes: unknown[]; idx: number } | { buf: Uint8Array; off: number }): void {
  if (typeof r === 'string') {
    const off = getScriptOffset(r);
    if (off !== undefined) ScriptJump(ctx, ptrFromOffset(off)); else StopScript(ctx);
  } else if ('buf' in r) {
    ScriptJump(ctx, r);                 // forme byte-VM : reprise au curseur capturé
  } else {
    StopScript(ctx);                    // forme parsée ({opcodes,idx}) — pas en byte-VM
  }
}
const ScrCmd_gotopostbattlescript: ScrCmdFunc = (ctx) => { resumeAfterBattle(ctx, BattleSetup_GetTrainerPostBattleScript()); return false; };  // :1833
const ScrCmd_gotobeatenscript: ScrCmdFunc = (ctx) => { resumeAfterBattle(ctx, BattleSetup_GetScriptAddrAfterBattle()); return false; };        // :1839

// ─── wild battle (1:1 scrcmd.c:1869-1884 ; logique partagée battle-setup-helpers — voie A) ──
// setwildbattle : species(u16) level(u8) item(u16) → CreateScriptedWildMon (peuple gEnemyParty[0]).
const ScrCmd_setwildbattle: ScrCmdFunc = (ctx) => {                          // :1869
  const species = ScriptReadHalfword(ctx);
  const level = ScriptReadByte(ctx);
  const item = ScriptReadHalfword(ctx);
  CreateScriptedWildMon(species, level, item);
  return false;
};
// dowildbattle : BattleSetup_StartScriptedWildBattle + ScriptContext_Stop. Le poll 1-frame
// = le ScriptContext_Stop décomp (scrcmd.c:1882) : la scène combat prend la main, le script
// reprend au retour OW. Identique au handler parsé (scrcmd.ts:2408 — prouvé).
const ScrCmd_dowildbattle: ScrCmdFunc = (ctx) => {                           // :1879
  BattleSetup_StartScriptedWildBattle();
  let framesWaited = 0;
  SetupNativeScript(ctx, () => { framesWaited++; return framesWaited >= 1; });
  return true;
};

// ─── money (1:1 scrcmd.c:1733-1761) ─────────────────────────────────────────
const setResult = (v: number) => VarSet(VAR_RESULT, v);
const ScrCmd_addmoney: ScrCmdFunc = (ctx) => { const a = ScriptReadWord(ctx); const ign = ScriptReadByte(ctx); if (!ign) AddMoney(a); return false; };
const ScrCmd_removemoney: ScrCmdFunc = (ctx) => { const a = ScriptReadWord(ctx); const ign = ScriptReadByte(ctx); if (!ign) RemoveMoney(a); return false; };
const ScrCmd_checkmoney: ScrCmdFunc = (ctx) => { const a = ScriptReadWord(ctx); const ign = ScriptReadByte(ctx); if (!ign) setResult(IsEnoughMoney(a) ? 1 : 0); return false; };

// ─── delay / input / gamestat / gender / trainer flags (1:1 scrcmd.c) ───────
// 1:1 scrcmd.c ScrCmd_delay : sPauseCounter=ReadHalfword ; SetupNativeScript(RunPauseTimer).
const ScrCmd_delay: ScrCmdFunc = (ctx) => {
  let frames = ScriptReadHalfword(ctx);
  SetupNativeScript(ctx, () => { if (frames <= 0) return true; frames--; return false; });
  return true;
};
const ScrCmd_waitbuttonpress: ScrCmdFunc = (ctx) => { SetupNativeScript(ctx, () => isAOrBNewlyPressed()); return true; };
const ScrCmd_incrementgamestat: ScrCmdFunc = (ctx) => { IncrementGameStat(ScriptReadByte(ctx)); return false; };
const ScrCmd_checkplayergender: ScrCmdFunc = () => { setResult(gPlayerAvatar.gender === 'MALE' ? MALE_GENDER : FEMALE_GENDER); return false; };
const ScrCmd_checktrainerflag: ScrCmdFunc = (ctx) => { const i = VarGet(ScriptReadHalfword(ctx)); (ctx as ScriptContext).comparisonResult = HasTrainerBeenFought(i) ? 1 : 0; return false; };
const ScrCmd_settrainerflag: ScrCmdFunc = (ctx) => { SetTrainerFlag(VarGet(ScriptReadHalfword(ctx))); return false; };
const ScrCmd_cleartrainerflag: ScrCmdFunc = (ctx) => { ClearTrainerFlag(VarGet(ScriptReadHalfword(ctx))); return false; };

// ─── son (hardware-exempt : PlaySE statique + __decompGlobals pour le reste) ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _dg = (): any => (globalThis as Record<string, unknown>).__decompGlobals;
const ScrCmd_playse: ScrCmdFunc = (ctx) => { PlaySE(ScriptReadHalfword(ctx)); return false; };
const ScrCmd_waitse: ScrCmdFunc = (ctx) => { SetupNativeScript(ctx, () => !(_dg()?.IsSEPlaying?.() ?? false)); return true; };
const ScrCmd_playfanfare: ScrCmdFunc = (ctx) => { _dg()?.PlayFanfare?.(ScriptReadHalfword(ctx)); return false; };
const ScrCmd_waitfanfare: ScrCmdFunc = (ctx) => { SetupNativeScript(ctx, () => _dg()?.IsFanfareTaskInactive?.() ?? true); return true; };
const ScrCmd_playbgm: ScrCmdFunc = (ctx) => { const song = ScriptReadHalfword(ctx); ScriptReadByte(ctx); _dg()?.m4aSongNumStart?.(song, true); return false; };
const ScrCmd_playmoncry: ScrCmdFunc = (ctx) => { const sp = VarGet(ScriptReadHalfword(ctx)); VarGet(ScriptReadHalfword(ctx)); _dg()?.PlayCryInternal?.(sp, 0, 64, 0, 0); return false; };
const ScrCmd_waitmoncry: ScrCmdFunc = (ctx) => { SetupNativeScript(ctx, () => _dg()?.IsCryFinished?.() ?? true); return true; };

// ─── object events (1:1 scrcmd.c ; logique partagée scrcmd_object — voie A) ──
const ScrCmd_setobjectxy: ScrCmdFunc = (ctx) => { const l = VarGet(ScriptReadHalfword(ctx)); const x = VarGet(ScriptReadHalfword(ctx)); const y = VarGet(ScriptReadHalfword(ctx)); doSetObjectXY(String(l), x, y); return false; };
const ScrCmd_setobjectxyperm: ScrCmdFunc = (ctx) => { const l = VarGet(ScriptReadHalfword(ctx)); const x = VarGet(ScriptReadHalfword(ctx)); const y = VarGet(ScriptReadHalfword(ctx)); doSetObjectXYPerm(String(l), x, y); return false; };
const ScrCmd_addobject: ScrCmdFunc = (ctx) => { const l = VarGet(ScriptReadHalfword(ctx)); doAddObject(String(l)); return false; };
const ScrCmd_addobjectat: ScrCmdFunc = (ctx) => { const l = VarGet(ScriptReadHalfword(ctx)); ScriptReadHalfword(ctx); doAddObject(String(l)); return false; };  // +map ignorée
const ScrCmd_removeobject: ScrCmdFunc = (ctx) => { const l = VarGet(ScriptReadHalfword(ctx)); doRemoveObject(String(l)); return false; };
const ScrCmd_removeobjectat: ScrCmdFunc = (ctx) => { const l = VarGet(ScriptReadHalfword(ctx)); ScriptReadHalfword(ctx); doRemoveObject(String(l)); return false; };  // +map ignorée
const ScrCmd_showobjectat: ScrCmdFunc = (ctx) => { const l = VarGet(ScriptReadHalfword(ctx)); ScriptReadHalfword(ctx); doSetObjectInvisibility(String(l), false); return false; };  // +map (2o)
const ScrCmd_hideobjectat: ScrCmdFunc = (ctx) => { const l = VarGet(ScriptReadHalfword(ctx)); ScriptReadHalfword(ctx); doSetObjectInvisibility(String(l), true); return false; };   // +map (2o)

// ─── setmetatile (1:1 scrcmd.c:setmetatile) ─────────────────────────────────
const ScrCmd_setmetatile: ScrCmdFunc = (ctx) => {
  const x = VarGet(ScriptReadHalfword(ctx)) + MAP_OFFSET;
  const y = VarGet(ScriptReadHalfword(ctx)) + MAP_OFFSET;
  const metatileId = VarGet(ScriptReadHalfword(ctx));
  const isImpassable = VarGet(ScriptReadHalfword(ctx));
  MapGridSetMetatileIdAt(x, y, isImpassable ? (metatileId | MAPGRID_IMPASSABLE) : metatileId);
  return false;
};

// ─── item / coins (1:1 scrcmd.c) ────────────────────────────────────────────
// Notre Bag est à CLÉS string → pont id numérique→ITEM_X (reverseDecompConstant).
const itemKeyOf = (id: number): string => reverseDecompConstant(id, 'ITEM_') ?? '';
const ScrCmd_additem: ScrCmdFunc = (ctx) => { const id = VarGet(ScriptReadHalfword(ctx)); const q = VarGet(ScriptReadHalfword(ctx)); setResult(AddBagItem(itemKeyOf(id), q) ? 1 : 0); return false; };       // :487
const ScrCmd_removeitem: ScrCmdFunc = (ctx) => { const id = VarGet(ScriptReadHalfword(ctx)); const q = VarGet(ScriptReadHalfword(ctx)); setResult(RemoveBagItem(itemKeyOf(id), q) ? 1 : 0); return false; };  // :496
const ScrCmd_checkitem: ScrCmdFunc = (ctx) => { const id = VarGet(ScriptReadHalfword(ctx)); const q = VarGet(ScriptReadHalfword(ctx)); setResult(CheckBagHasItem(itemKeyOf(id), q) ? 1 : 0); return false; };  // :514
const ScrCmd_checkitemspace: ScrCmdFunc = (ctx) => { const id = VarGet(ScriptReadHalfword(ctx)); const q = VarGet(ScriptReadHalfword(ctx)); setResult(CheckBagHasSpace(itemKeyOf(id), q) ? 1 : 0); return false; }; // :505
// coins (1:1 scrcmd.c:2129-2152) — addcoins/removecoins inversent le résultat.
const ScrCmd_checkcoins: ScrCmdFunc = (ctx) => { const ref = GetVarPointer(ScriptReadHalfword(ctx)); if (ref) ref.set(GetCoins()); return false; };
const ScrCmd_addcoins: ScrCmdFunc = (ctx) => { const c = VarGet(ScriptReadHalfword(ctx)); setResult(AddCoins(c) ? 0 : 1); return false; };
const ScrCmd_removecoins: ScrCmdFunc = (ctx) => { const c = VarGet(ScriptReadHalfword(ctx)); setResult(RemoveCoins(c) ? 0 : 1); return false; };

// ─── applymovement / waitmovement (1:1 scrcmd.c:992-1045) ───────────────────
let sMovingNpcId = 0;
/** Résout le pointeur de mouvement (symbole) → label de séquence de mouvement. */
function movementLabel(symId: number): string | null {
  const sym = resolveSymbol(symId);
  return sym ? sym.label : null;
}
// 1:1 scrcmd.c:992-1000 : localId=VarGet(half) ; movementScript=ReadWord ; StartObjectMovementScript ; sMovingNpcId=localId.
const ScrCmd_applymovement: ScrCmdFunc = (ctx) => {
  const localId = VarGet(ScriptReadHalfword(ctx));
  const label = movementLabel(ScriptReadWord(ctx));
  if (label) applyMovement(String(localId), label);
  sMovingNpcId = localId;
  return false;
};
// 1:1 scrcmd.c:1002-1012 : + map (2o) ignorée (adaptation même-map, comme le moteur parsé).
const ScrCmd_applymovementat: ScrCmdFunc = (ctx) => {
  const localId = VarGet(ScriptReadHalfword(ctx));
  const label = movementLabel(ScriptReadWord(ctx));
  ScriptReadHalfword(ctx);   // map (mapSymbol u16) — non utilisé (même map)
  if (label) applyMovement(String(localId), label);
  sMovingNpcId = localId;
  return false;
};
// 1:1 scrcmd.c:1019-1029 : localId=VarGet(half) ; si !=LOCALID_NONE → sMovingNpcId ; wait.
const ScrCmd_waitmovement: ScrCmdFunc = (ctx) => {
  const localId = VarGet(ScriptReadHalfword(ctx));
  if (localId !== 0) sMovingNpcId = localId;
  SetupNativeScript(ctx, sMovingNpcId === 0 ? () => isAllMovementsDone() : () => isMovementDone(String(sMovingNpcId)));
  return true;
};
// 1:1 scrcmd.c:1031-1045 : + map (2o) ignorée.
const ScrCmd_waitmovementat: ScrCmdFunc = (ctx) => {
  const localId = VarGet(ScriptReadHalfword(ctx));
  ScriptReadHalfword(ctx);   // map (mapSymbol u16) — non utilisé
  if (localId !== 0) sMovingNpcId = localId;
  SetupNativeScript(ctx, sMovingNpcId === 0 ? () => isAllMovementsDone() : () => isMovementDone(String(sMovingNpcId)));
  return true;
};

// ─── std scripts (1:1 scrcmd.c:235-253) ─────────────────────────────────────
const ScrCmd_gotostd: ScrCmdFunc = (ctx) => { const off = fetchStdOffset(ScriptReadByte(ctx)); if (off !== null) ScriptJump(ctx, ptrFromOffset(off)); return false; };
const ScrCmd_callstd: ScrCmdFunc = (ctx) => { const off = fetchStdOffset(ScriptReadByte(ctx)); if (off !== null) ScriptCall(ctx, ptrFromOffset(off)); return false; };

// ─── messages (1:1 scrcmd.c:1265-1320) ──────────────────────────────────────
/** Résout un pointeur de texte (id de symbole, ou data[0] si NULL) → bytes charmap → affiche. */
function showFieldText(symId: number): void {
  const sym = resolveSymbol(symId);
  if (!sym) return;
  const bytes = getText(sym.label);
  if (bytes) ShowFieldMessage(bytes);
}
const ScrCmd_message: ScrCmdFunc = (ctx) => {                               // :1265
  let p = ScriptReadWord(ctx);
  if (p === 0) p = ctx.data[0];   // NULL → ctx->data[0] (posé par loadword via msgbox)
  showFieldText(p);
  return false;
};
const ScrCmd_waitmessage: ScrCmdFunc = (ctx) => { SetupNativeScript(ctx, () => IsFieldMessageBoxHidden()); return true; }; // :1310
const ScrCmd_closemessage: ScrCmdFunc = () => { HideFieldMessageBox(); return false; }; // :1316

const ScrCmd_setflag: ScrCmdFunc = (ctx) => { FlagSet(ScriptReadHalfword(ctx)); return false; };        // :581
const ScrCmd_clearflag: ScrCmdFunc = (ctx) => { FlagClear(ScriptReadHalfword(ctx)); return false; };    // :587
const ScrCmd_checkflag: ScrCmdFunc = (ctx) => { ctx.comparisonResult = FlagGet(ScriptReadHalfword(ctx)) ? 1 : 0; return false; }; // :593

// ─── getplayerxy / getpartysize (1:1 scrcmd.c:887-901) ──────────────────────
const ScrCmd_getplayerxy: ScrCmdFunc = (ctx) => {                            // :887
  const pX = GetVarPointer(ScriptReadHalfword(ctx));
  const pY = GetVarPointer(ScriptReadHalfword(ctx));
  if (pX) pX.set(gSaveBlock1Ptr.pos.x & 0xFFFF);
  if (pY) pY.set(gSaveBlock1Ptr.pos.y & 0xFFFF);
  return false;
};
const ScrCmd_getpartysize: ScrCmdFunc = () => { setResult(CalculatePlayerPartyCount()); return false; }; // :897

// ─── buffers (1:1 scrcmd.c:1549-1651, 2272-2288) ────────────────────────────
// Le byte `stringVarId` est déjà 0/1/2 (macro `stringvar` STR_VAR_1/2/3→0/1/2,
// = index dans sScriptStringVars[]={gStringVar1,2,3}). Notre setStringVar est
// 1-indexé → n = idx+1. constOf(num,prefix) = id numérique → constante décomp.
const constOf = (num: number, prefix: string): string => reverseDecompConstant(num, prefix) ?? `${prefix}${num}`;
// 1:1 GetLeadMonIndex (field_specials.c:1531) : 1er slot non-vide non-œuf, sinon 0.
// (transcription identique au privé `_GetLeadMonIndex` de specials-registry — à
//  consolider après le swap ; field_specials.ts est volontairement import-light.)
function GetLeadMonIndex(): number {
  for (let i = 0; i < gPlayerParty.length; i++) {
    const mon = gPlayerParty[i];
    if ((GetMonData(mon, MON_DATA_SPECIES) as number) !== 0 && !(GetMonData(mon, MON_DATA_IS_EGG) as number)) return i;
  }
  return 0;
}
const ScrCmd_bufferspeciesname: ScrCmdFunc = (ctx) => {                      // :1549
  const idx = ScriptReadByte(ctx);
  const species = VarGet(ScriptReadHalfword(ctx));
  setStringVar(idx + 1, getSpeciesNameFr(constOf(species, 'SPECIES_')));
  return false;
};
const ScrCmd_bufferleadmonspeciesname: ScrCmdFunc = (ctx) => {               // :1558
  const idx = ScriptReadByte(ctx);
  const species = GetMonData(gPlayerParty[GetLeadMonIndex()], MON_DATA_SPECIES) as number;
  setStringVar(idx + 1, getSpeciesNameFr(constOf(species, 'SPECIES_')));
  return false;
};
const ScrCmd_bufferpartymonnick: ScrCmdFunc = (ctx) => {                     // :1569
  const idx = ScriptReadByte(ctx);
  const slot = VarGet(ScriptReadHalfword(ctx));
  const mon = gPlayerParty[slot];
  const nick = (GetMonData(mon, MON_DATA_NICKNAME) as string)
    || (mon ? getSpeciesNameFr(constOf(GetMonData(mon, MON_DATA_SPECIES) as number, 'SPECIES_')) : '');
  setStringVar(idx + 1, nick);   // StringGet_Nickname : nos nicknames sont déjà propres
  return false;
};
const ScrCmd_bufferitemname: ScrCmdFunc = (ctx) => {                         // :1579
  const idx = ScriptReadByte(ctx);
  const itemId = VarGet(ScriptReadHalfword(ctx));
  setStringVar(idx + 1, getItemNameFr(constOf(itemId, 'ITEM_')));
  return false;
};
const ScrCmd_bufferitemnameplural: ScrCmdFunc = (ctx) => {                   // :1588
  const idx = ScriptReadByte(ctx);
  const itemId = VarGet(ScriptReadHalfword(ctx));
  const quantity = VarGet(ScriptReadHalfword(ctx));
  const name = getItemNameFr(constOf(itemId, 'ITEM_'));
  setStringVar(idx + 1, quantity > 1 ? name + 's' : name);   // CopyItemNameHandlePlural (mirror parsé)
  return false;
};
const ScrCmd_buffermovename: ScrCmdFunc = (ctx) => {                         // :1607
  const idx = ScriptReadByte(ctx);
  const move = VarGet(ScriptReadHalfword(ctx));
  setStringVar(idx + 1, getMoveNameFr(constOf(move, 'MOVE_')));
  return false;
};
const ScrCmd_buffernumberstring: ScrCmdFunc = (ctx) => {                     // :1616
  const idx = ScriptReadByte(ctx);
  const num = VarGet(ScriptReadHalfword(ctx));
  setStringVar(idx + 1, String(num));   // ConvertIntToDecimalStringN(LEFT_ALIGN, CountDigits)
  return false;
};
const ScrCmd_bufferstdstring: ScrCmdFunc = (ctx) => {                        // :1626
  const idx = ScriptReadByte(ctx);
  VarGet(ScriptReadHalfword(ctx));   // index — gStdStrings non extrait (= moteur parsé, dette data)
  setStringVar(idx + 1, '');
  return false;
};
const ScrCmd_bufferdecorationname: ScrCmdFunc = (ctx) => {                   // :1598
  const idx = ScriptReadByte(ctx);
  VarGet(ScriptReadHalfword(ctx));   // decorId — gDecorations non extrait (= moteur parsé, dette data)
  setStringVar(idx + 1, '');
  return false;
};
const ScrCmd_bufferstring: ScrCmdFunc = (ctx) => {                           // :1644
  const idx = ScriptReadByte(ctx);
  const sym = resolveSymbol(ScriptReadWord(ctx));
  const bytes = sym ? getText(sym.label) : null;
  setStringVar(idx + 1, bytes ? decodeOwBytes(bytes) : '');
  return false;
};
const ScrCmd_buffertrainerclassname: ScrCmdFunc = (ctx) => {                 // :2272
  const idx = ScriptReadByte(ctx);
  const trainerId = VarGet(ScriptReadHalfword(ctx));
  const t = getTrainer(constOf(trainerId, 'TRAINER_'));
  setStringVar(idx + 1, t ? getTrainerClassNameFr(t.trainerClass) : '');
  return false;
};
const ScrCmd_buffertrainername: ScrCmdFunc = (ctx) => {                      // :2281
  const idx = ScriptReadByte(ctx);
  const trainerId = VarGet(ScriptReadHalfword(ctx));
  setStringVar(idx + 1, getTrainerNameFr(constOf(trainerId, 'TRAINER_')));
  return false;
};

// ─── weather (1:1 scrcmd.c:705-723) — appelle les vraies fns field_weather_effect
//     (TranslateWeatherNum + UpdateRainCounter + DoCurrentWeather complets ; plus
//      1:1 que l'adaptation inline du moteur parsé). ────────────────────────────
const ScrCmd_setweather: ScrCmdFunc = (ctx) => { SetSavedWeather(VarGet(ScriptReadHalfword(ctx))); return false; };  // :705
const ScrCmd_resetweather: ScrCmdFunc = () => { SetSavedWeatherFromCurrMapHeader(); return false; };                 // :713
const ScrCmd_doweather: ScrCmdFunc = () => { DoCurrentWeather(); return false; };                                    // :719

// ─── doors (1:1 scrcmd.c:2050-2108 ; logique partagée scrcmd_door — voie A) ──
// coords brutes (VarGet) sans +MAP_OFFSET : field_door l'ajoute en interne.
const ScrCmd_opendoor: ScrCmdFunc = (ctx) => { const x = VarGet(ScriptReadHalfword(ctx)); const y = VarGet(ScriptReadHalfword(ctx)); doOpenDoor(x, y); return false; };
const ScrCmd_closedoor: ScrCmdFunc = (ctx) => { const x = VarGet(ScriptReadHalfword(ctx)); const y = VarGet(ScriptReadHalfword(ctx)); doCloseDoor(x, y); return false; };
const ScrCmd_waitdooranim: ScrCmdFunc = (ctx) => { SetupNativeScript(ctx, isDoorAnimationStopped); return true; };
const ScrCmd_setdooropen: ScrCmdFunc = (ctx) => { const x = VarGet(ScriptReadHalfword(ctx)); const y = VarGet(ScriptReadHalfword(ctx)); doSetDoorOpen(x, y); return false; };
const ScrCmd_setdoorclosed: ScrCmdFunc = (ctx) => { const x = VarGet(ScriptReadHalfword(ctx)); const y = VarGet(ScriptReadHalfword(ctx)); doSetDoorClosed(x, y); return false; };

// ─── virtual objects (1:1 scrcmd.c:1177-1199) — via globalThis.__virtualObjects
//     (même pont anti-cycle que le moteur parsé → source unique). ───────────────
interface VirtualObjectsApi {
  CreateVirtualObject?: (g: number, id: number, x: number, y: number, e: number, d: number) => Promise<number>;
  TurnVirtualObject?: (id: number, d: number) => void;
}
const _vobjApi = (): VirtualObjectsApi | undefined =>
  (globalThis as { __virtualObjects?: VirtualObjectsApi }).__virtualObjects;
const ScrCmd_createvobject: ScrCmdFunc = (ctx) => {                          // :1177
  const graphicsId = ScriptReadByte(ctx);
  const virtualObjId = ScriptReadByte(ctx);
  const x = VarGet(ScriptReadHalfword(ctx));
  const y = VarGet(ScriptReadHalfword(ctx));
  const elevation = ScriptReadByte(ctx);
  const direction = ScriptReadByte(ctx);
  const vo = _vobjApi();
  if (vo?.CreateVirtualObject) void vo.CreateVirtualObject(graphicsId, virtualObjId, x, y, elevation, direction);
  return false;
};
const ScrCmd_turnvobject: ScrCmdFunc = (ctx) => {                           // :1190
  const virtualObjId = ScriptReadByte(ctx);
  const direction = ScriptReadByte(ctx);
  _vobjApi()?.TurnVirtualObject?.(virtualObjId, direction);
  return false;
};

// ─── fadescreen (1:1 scrcmd.c:626-642) — appelle la VRAIE FadeScreen (field_weather,
//     weather-aware + delay, plus 1:1 que la réimpl inline du parsé). ─────────────
/** 1:1 IsPaletteNotActive (scrcmd.c:618) : true quand le fade palette est terminé. */
const isPaletteNotActive = (): boolean => !getRuntime()?.gPaletteFade?.active;
const ScrCmd_fadescreen: ScrCmdFunc = (ctx) => { FadeScreen(ScriptReadByte(ctx), 0); SetupNativeScript(ctx, isPaletteNotActive); return true; };       // :626
const ScrCmd_fadescreenspeed: ScrCmdFunc = (ctx) => { const m = ScriptReadByte(ctx); const s = ScriptReadByte(ctx); FadeScreen(m, s); SetupNativeScript(ctx, isPaletteNotActive); return true; }; // :633

// ─── long-tail simple (1:1 scrcmd.c) ────────────────────────────────────────
// random : gSpecialVar_Result = Random() % max.
const ScrCmd_random: ScrCmdFunc = (ctx) => { const max = VarGet(ScriptReadHalfword(ctx)); setResult(max ? Random() % max : 0); return false; };
// setberrytree : PlantBerryTree(treeId, berry, growthStage, FALSE).
const ScrCmd_setberrytree: ScrCmdFunc = (ctx) => { const t = ScriptReadByte(ctx); const b = ScriptReadByte(ctx); const g = ScriptReadByte(ctx); PlantBerryTree(t, b, g, false); return false; };
// setmaplayoutindex : SetCurrentMapLayout (via globalThis.__mapLayoutSwap, anti-cycle = parsé).
const ScrCmd_setmaplayoutindex: ScrCmdFunc = (ctx) => {
  const idx = VarGet(ScriptReadHalfword(ctx));
  const swap = (globalThis as { __mapLayoutSwap?: { SetCurrentMapLayout?: (i: number) => Promise<void> } }).__mapLayoutSwap;
  if (swap?.SetCurrentMapLayout) void swap.SetCurrentMapLayout(idx);
  return false;
};
// setstepcallback : ActivatePerStepCallback(byte) (dynamic import field_tasks, anti-cycle = parsé).
const ScrCmd_setstepcallback: ScrCmdFunc = (ctx) => {
  const cb = ScriptReadByte(ctx);
  void import('./field_tasks').then((ft) => ft.ActivatePerStepCallback(cb));
  return false;
};
// money / coins box (1:1 scrcmd.c:1758-1819) — UI via globalThis.__moneyBoxUI (anti-cycle = parsé).
type MoneyBoxApi = {
  DrawMoneyBox?: (amt: number, x: number, y: number) => void; HideMoneyBox?: () => void;
  ChangeAmountInMoneyBox?: (amt: number) => void; ShowCoinsWindow?: (amt: number, x: number, y: number) => void;
  HideCoinsWindow?: () => void; PrintCoinsString?: (amt: number) => void;
  _getMoney?: () => number; _getCoins?: () => number;
};
const _moneyUI = (): MoneyBoxApi | undefined => (globalThis as { __moneyBoxUI?: MoneyBoxApi }).__moneyBoxUI;
const ScrCmd_showmoneybox: ScrCmdFunc = (ctx) => { const x = ScriptReadByte(ctx); const y = ScriptReadByte(ctx); const ign = ScriptReadByte(ctx); if (!ign) { const ui = _moneyUI(); if (ui?.DrawMoneyBox && ui._getMoney) ui.DrawMoneyBox(ui._getMoney(), x, y); } return false; };
const ScrCmd_hidemoneybox: ScrCmdFunc = () => { _moneyUI()?.HideMoneyBox?.(); return false; };   // 1:1 décomp : lit 0 octet (les 2 .byte 0 émis → 2 nops)
const ScrCmd_updatemoneybox: ScrCmdFunc = (ctx) => { ScriptReadByte(ctx); ScriptReadByte(ctx); const ign = ScriptReadByte(ctx); if (!ign) { const ui = _moneyUI(); if (ui?.ChangeAmountInMoneyBox && ui._getMoney) ui.ChangeAmountInMoneyBox(ui._getMoney()); } return false; };
const ScrCmd_showcoinsbox: ScrCmdFunc = (ctx) => { const x = ScriptReadByte(ctx); const y = ScriptReadByte(ctx); const ui = _moneyUI(); if (ui?.ShowCoinsWindow && ui._getCoins) ui.ShowCoinsWindow(ui._getCoins(), x, y); return false; };
const ScrCmd_hidecoinsbox: ScrCmdFunc = (ctx) => { ScriptReadByte(ctx); ScriptReadByte(ctx); _moneyUI()?.HideCoinsWindow?.(); return false; };
const ScrCmd_updatecoinsbox: ScrCmdFunc = (ctx) => { ScriptReadByte(ctx); ScriptReadByte(ctx); const ui = _moneyUI(); if (ui?.PrintCoinsString && ui._getCoins) ui.PrintCoinsString(ui._getCoins()); return false; };

// ─── long-tail simple #2 (1:1 scrcmd.c) ─────────────────────────────────────
const ScrCmd_dotimebasedevents: ScrCmdFunc = () => { DoTimeBasedEvents(); return false; };
// checkpartymove (1:1 scrcmd.c) : move lu BRUT (pas VarGet) ; itère la party.
const ScrCmd_checkpartymove: ScrCmdFunc = (ctx) => {
  const move = ScriptReadHalfword(ctx);
  let result = PARTY_SIZE, species0x8004 = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    const species = GetMonData(gPlayerParty[i], MON_DATA_SPECIES) as number;
    if (!species) break;   // slot vide → fin de party
    if (!(GetMonData(gPlayerParty[i], MON_DATA_IS_EGG) as number) && MonKnowsMove(gPlayerParty[i], move)) {
      result = i; species0x8004 = species; break;
    }
  }
  setResult(result);
  VarSet(VAR_0x8004, species0x8004);
  return false;
};
// v* RS-era (multi-lang via sAddressOffset = aspect ROM-address non modélisé) :
// nos pointeurs sont déjà des offsets/symboles absolus → vgoto/vcall/vgoto_if =
// goto/call/goto_if ; vmessage = message (sans NULL/data[0]). setvaddress/copybyte
// = no-op mais LISENT leurs octets (alignement du flux).
const ScrCmd_vgoto: ScrCmdFunc = ScrCmd_goto;
const ScrCmd_vcall: ScrCmdFunc = ScrCmd_call;
const ScrCmd_vgoto_if: ScrCmdFunc = ScrCmd_goto_if;
const ScrCmd_vmessage: ScrCmdFunc = (ctx) => { showFieldText(ScriptReadWord(ctx)); return false; };
const ScrCmd_setvaddress: ScrCmdFunc = (ctx) => { ScriptReadWord(ctx); return false; };           // offset moot (scripts label-based)
const ScrCmd_copybyte: ScrCmdFunc = (ctx) => { ScriptReadWord(ctx); ScriptReadWord(ctx); return false; }; // no-op (= parsé ; ptrs RAM non modélisés)

// ─── object movement ops (1:1 scrcmd.c ; logique partagée scrcmd_object — voie A) ──
// turnobject : direction = valeur DIR_ (1=SOUTH..4=EAST) lue direct du bytecode.
const ScrCmd_turnobject: ScrCmdFunc = (ctx) => { const l = VarGet(ScriptReadHalfword(ctx)); const dir = ScriptReadByte(ctx); doTurnObject(String(l), dir); return false; };
const ScrCmd_copyobjectxytoperm: ScrCmdFunc = (ctx) => { const l = VarGet(ScriptReadHalfword(ctx)); doCopyObjectXYToPerm(String(l)); return false; };
// setobjectmovementtype : id numérique → "MOVEMENT_TYPE_*" (movementTypeRaw est string dans notre port).
const ScrCmd_setobjectmovementtype: ScrCmdFunc = (ctx) => {
  const l = VarGet(ScriptReadHalfword(ctx));
  const mt = ScriptReadByte(ctx);
  doSetObjectMovementType(String(l), reverseDecompConstant(mt, 'MOVEMENT_TYPE_') ?? `MOVEMENT_TYPE_${mt}`);
  return false;
};

// ─── field effects (1:1 scrcmd.c:1973-2003 ; logique partagée scrcmd_fieldeffect — voie A) ──
const ScrCmd_dofieldeffect: ScrCmdFunc = (ctx) => { doFieldEffect(VarGet(ScriptReadHalfword(ctx))); return false; };                                  // :1973
const ScrCmd_setfieldeffectargument: ScrCmdFunc = (ctx) => { const a = ScriptReadByte(ctx); setFieldEffectArgument(a, VarGet(ScriptReadHalfword(ctx))); return false; }; // :1982
const ScrCmd_waitfieldeffect: ScrCmdFunc = (ctx) => { SetupNativeScript(ctx, setWaitFieldEffect(VarGet(ScriptReadHalfword(ctx)))); return true; };    // :1998

/** Handlers du slice, keyed par nom ScrCmd_* (= colonne `handler` du cmd-table). */
export const BYTEVM_HANDLERS: Record<string, ScrCmdFunc> = {
  ScrCmd_nop, ScrCmd_nop1, ScrCmd_end, ScrCmd_gotonative, ScrCmd_waitstate,
  ScrCmd_special, ScrCmd_specialvar,
  ScrCmd_goto, ScrCmd_return, ScrCmd_call, ScrCmd_goto_if, ScrCmd_call_if,
  ScrCmd_loadword, ScrCmd_loadbyte, ScrCmd_copylocal,
  ScrCmd_setvar, ScrCmd_copyvar, ScrCmd_setorcopyvar, ScrCmd_addvar, ScrCmd_subvar,
  ScrCmd_compare_local_to_local, ScrCmd_compare_local_to_value,
  ScrCmd_compare_var_to_value, ScrCmd_compare_var_to_var,
  ScrCmd_setflag, ScrCmd_clearflag, ScrCmd_checkflag,
  ScrCmd_gotostd, ScrCmd_callstd, ScrCmd_message, ScrCmd_waitmessage, ScrCmd_closemessage,
  ScrCmd_faceplayer, ScrCmd_lock, ScrCmd_lockall, ScrCmd_release, ScrCmd_releaseall,
  ScrCmd_applymovement, ScrCmd_applymovementat, ScrCmd_waitmovement, ScrCmd_waitmovementat,
  ScrCmd_warp, ScrCmd_warpsilent, ScrCmd_addmoney, ScrCmd_removemoney, ScrCmd_checkmoney,
  ScrCmd_additem, ScrCmd_removeitem, ScrCmd_checkitem, ScrCmd_checkitemspace,
  ScrCmd_checkcoins, ScrCmd_addcoins, ScrCmd_removecoins,
  ScrCmd_delay, ScrCmd_waitbuttonpress, ScrCmd_incrementgamestat, ScrCmd_checkplayergender,
  ScrCmd_checktrainerflag, ScrCmd_settrainerflag, ScrCmd_cleartrainerflag,
  ScrCmd_playse, ScrCmd_waitse, ScrCmd_playfanfare, ScrCmd_waitfanfare, ScrCmd_playbgm,
  ScrCmd_playmoncry, ScrCmd_waitmoncry, ScrCmd_setmetatile,
  ScrCmd_setobjectxy, ScrCmd_setobjectxyperm, ScrCmd_addobject, ScrCmd_addobjectat,
  ScrCmd_removeobject, ScrCmd_removeobjectat, ScrCmd_showobjectat, ScrCmd_hideobjectat,
  ScrCmd_getplayerxy, ScrCmd_getpartysize,
  ScrCmd_bufferspeciesname, ScrCmd_bufferleadmonspeciesname, ScrCmd_bufferpartymonnick,
  ScrCmd_bufferitemname, ScrCmd_bufferitemnameplural, ScrCmd_buffermovename,
  ScrCmd_buffernumberstring, ScrCmd_bufferstdstring, ScrCmd_bufferdecorationname,
  ScrCmd_bufferstring, ScrCmd_buffertrainerclassname, ScrCmd_buffertrainername,
  ScrCmd_setweather, ScrCmd_resetweather, ScrCmd_doweather,
  ScrCmd_opendoor, ScrCmd_closedoor, ScrCmd_waitdooranim, ScrCmd_setdooropen, ScrCmd_setdoorclosed,
  ScrCmd_dofieldeffect, ScrCmd_setfieldeffectargument, ScrCmd_waitfieldeffect,
  ScrCmd_createvobject, ScrCmd_turnvobject,
  ScrCmd_turnobject, ScrCmd_copyobjectxytoperm, ScrCmd_setobjectmovementtype,
  ScrCmd_fadescreen, ScrCmd_fadescreenspeed,
  ScrCmd_random, ScrCmd_setberrytree, ScrCmd_setmaplayoutindex, ScrCmd_setstepcallback,
  ScrCmd_showmoneybox, ScrCmd_hidemoneybox, ScrCmd_updatemoneybox,
  ScrCmd_showcoinsbox, ScrCmd_hidecoinsbox, ScrCmd_updatecoinsbox,
  ScrCmd_dotimebasedevents, ScrCmd_checkpartymove,
  ScrCmd_vgoto, ScrCmd_vcall, ScrCmd_vgoto_if, ScrCmd_vmessage, ScrCmd_setvaddress, ScrCmd_copybyte,
  ScrCmd_setwarp, ScrCmd_setdivewarp, ScrCmd_setholewarp, ScrCmd_setescapewarp, ScrCmd_setdynamicwarp,
  ScrCmd_erasebox, ScrCmd_getpokenewsactive, ScrCmd_messageautoscroll, ScrCmd_fadescreenswapbuffers,
  ScrCmd_savebgm, ScrCmd_fadedefaultbgm, ScrCmd_setobjectsubpriority, ScrCmd_resetobjectsubpriority,
  ScrCmd_setmonmove, ScrCmd_fadenewbgm, ScrCmd_bufferboxname, ScrCmd_braillemessage, ScrCmd_closebraillemessage,
  ScrCmd_setflashlevel, ScrCmd_animateflash,
  ScrCmd_givemon, ScrCmd_giveegg,
  ScrCmd_trainerbattle, ScrCmd_dotrainerbattle, ScrCmd_gotopostbattlescript, ScrCmd_gotobeatenscript,
  ScrCmd_setwildbattle, ScrCmd_dowildbattle,
  ScrCmd_warpdoor, ScrCmd_warpmossdeepgym, ScrCmd_warpspinenter, ScrCmd_warpwhitefade, ScrCmd_warphole,
  ScrCmd_fadeoutbgm, ScrCmd_fadeinbgm, ScrCmd_messageinstant, ScrCmd_pokenavcall,
  ScrCmd_setmonmetlocation, ScrCmd_setmodernfatefulencounter, ScrCmd_returnram, ScrCmd_checkitemtype, ScrCmd_setrespawn,
  ScrCmd_selectapproachingtrainer, ScrCmd_lockfortrainer,
  ScrCmd_multichoice, ScrCmd_multichoicedefault, ScrCmd_multichoicegrid, ScrCmd_yesnobox,
  ScrCmd_showmonpic, ScrCmd_hidemonpic, ScrCmd_adddecoration, ScrCmd_checkdecorspace,
  ScrCmd_checkpcitem, ScrCmd_warpteleport, ScrCmd_buffercontestname,
  ScrCmd_playslotmachine, ScrCmd_initrotatingtilepuzzle, ScrCmd_moverotatingtileobjects,
  ScrCmd_turnrotatingtileobjects, ScrCmd_freerotatingtilepuzzle,
  ScrCmd_showcontestpainting, ScrCmd_choosecontestmon, ScrCmd_startcontest,
  ScrCmd_showcontestresults, ScrCmd_contestlinktransfer, ScrCmd_trywondercardscript,
  ScrCmd_pokemart, ScrCmd_pokemartdecoration, ScrCmd_pokemartdecoration2,
};

/** Installe les handlers disponibles dans gScriptCmdTable, indexés par cmdId.
 *  `enumEntries` = champ `enum[]` de script-cmd-table.json ({op, cmdId, handler}). */
export function installByteVmHandlers(enumEntries: { cmdId: number; handler: string }[]): number {
  let n = 0;
  for (const e of enumEntries) {
    const fn = BYTEVM_HANDLERS[e.handler];
    if (fn) { gScriptCmdTable[e.cmdId] = fn; n++; }
  }
  return n;
}
