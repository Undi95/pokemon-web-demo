/**
 * scrcmd.ts — handlers du byte-VM (= le SEUL moteur), 1:1 de `src/scrcmd.c`.
 *
 * Chaque handler `ScrCmd_*` lit ses args via ScriptRead{Byte,Halfword,Word} et
 * renvoie TRUE pour wait — exactement comme scrcmd.c. La table `gScriptCmdTable`
 * (227 slots indexés par cmdId) est remplie par ce module ; le contrôle de flux
 * (goto/call/return/goto_if) passe par les offsets de l'image globale (cf.
 * scripts/compile-scripts.cjs / docs/BYTE-VM-PLAN.md).
 *
 * Inclut aussi l'infra `gSpecials` (registerSpecial/invokeSpecial) et le signal
 * `waitstate` (SignalWaitState/consumeWaitStateSignal) — 1:1 scrcmd.c
 * (ScrCmd_special/specialvar/waitstate).
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c (1:1).
 */

import {
  ScriptContext, ScrCmdFunc, gScriptCmdTable,
  ScriptReadByte, ScriptReadHalfword, ScriptReadWord,
  ScriptJump, ScriptCall, ScriptReturn, StopScript, SetupNativeScript,
  ScriptContext_Stop, ptrFromOffset, resolveSymbol, resolveMapSymbol, getScriptOffset, getLabelAtOffset,
  getText,
} from './script';
import { VarGet, VarSet, GetVarPointer, FlagSet, FlagClear, FlagGet } from './event_data';
import { VAR_0x8000, VAR_0x8001, VAR_0x8002, VAR_0x8004 } from '../include/constants/vars';
import { RtcInitLocalTimeOffset, RtcCalcLocalTime, gLocalTime } from './rtc';
import { AddPCItem, CheckPCHasItem } from './item';
import { DecorationRemove, CheckHasDecoration } from './decoration_inventory';
import { PARTY_SIZE, MAX_MON_MOVES } from '../include/constants/global';
import { MonKnowsMove, SetMonMoveSlot } from './engine/battle/party-storage';
import { DoTimeBasedEvents } from './clock';
import { InitRotatingTilePuzzle, FreeRotatingTilePuzzle, MoveRotatingTileObjects, TurnRotatingTileObjects } from './rotating_tile_puzzle';
import { setPendingWarp, SetDynamicWarp, getPendingWarp } from './overworld';
import { AddMoney, RemoveMoney, IsEnoughMoney } from './money';
import { AddBagItem, RemoveBagItem, CheckBagHasItem, CheckBagHasSpace } from './engine/bag/bag';
import { GetCoins, AddCoins, RemoveCoins } from './coins';
import { VAR_RESULT } from '../include/constants/vars';
import { reverseDecompConstant, resolveDecompConstant } from '../harness/runtime/decomp-constants';
import { ShowFieldMessage, IsFieldMessageBoxHidden, HideFieldMessageBox } from './field_message_box';
// Système object-events / joueur (mêmes fns 1:1 que les handlers parsés vérifiés).
// VarGetByName = bridge nom→id de script-vars (les helpers byte-VM reçoivent des
// tokens 'VAR_X' string) ; le VarGet 1:1 numérique vient d'event_data (ligne 24).
import { gSelectedObjectEvent, VarGet as VarGetByName, Compare } from './engine/script/script-vars';
import { ObjectEventClearHeldMovementIfFinished, gObjectEvents, type ObjectEvent } from './event_object_movement';
import { gPlayerAvatar, IncrementGameStat } from './field_player_avatar';
import { HasTrainerBeenFought, SetTrainerFlag, ClearTrainerFlag,
  configureTrainerBattleCore, startTrainerBattleAndGetPoll,
  BattleSetup_GetScriptAddrAfterBattle, BattleSetup_GetTrainerPostBattleScript } from './battle_setup';
import type { TrainerArgSource } from './battle_setup';
import { CreateScriptedWildMon, BattleSetup_StartScriptedWildBattle } from './battle_setup';
// 1:1 décomp include/constants/global.h (MALE=0/FEMALE=1) + gba/io_reg (touches).
import { MALE, FEMALE } from '../include/constants/global';
import { A_BUTTON, B_BUTTON } from '../include/gba/io_reg';
import { PlaySE, PlayFanfare, getRuntime, FadeInBGM } from '../harness/runtime/decomp-globals';
import { FadeOutBGMTemporarily, IsBGMPausedOrStopped } from './sound';
import { ScriptMovement_UnfreezeObjectEvents } from './script_movement';
// Système FREEZE 1:1 décomp event_object_lock.c (logique relocalisée de scrcmd → son foyer miroir).
import {
  Script_FacePlayer, FreezeObjects_WaitForPlayer, IsFreezePlayerFinished,
  FreezeObjects_WaitForPlayerAndSelected, IsFreezeSelectedObjectAndPlayerFinished,
  ScriptUnfreezeObjectEvents,
} from './event_object_lock';
import { MapGridSetMetatileIdAt, MAP_OFFSET, MAPGRID_IMPASSABLE, gMapHeader } from './fieldmap';
// Voie A : logique object-event partagée avec le moteur parsé (source unique).
import { doSetObjectXY, doSetObjectXYPerm, doAddObject, doRemoveObject, doSetObjectInvisibility, doTurnObject, doCopyObjectXYToPerm, doSetObjectMovementType, doSetObjectSubpriority, doResetObjectSubpriority } from './scrcmd_object';
import { Overworld_SetSavedMusic } from './overworld';
import { SetFlashLevel } from './scrcmd_flash';
import * as Songs from '../include/constants/songs';

// ─── Helpers partagés des opcodes (ex engine/script/script-opcodes-helpers, lot 18) ──
// ADAPTATION byte-VM : nos scripts transportent des TOKENS STRING (le décomp
// compile les constantes en u8/u16 dans le bytecode) → parseurs d'args partagés
// entre les ScrCmd_* de ce fichier, scrcmd_object et battle_setup (macros
// trainerbattle). Aucun side-effect à l'import.

/** Retourne le NPC sélectionné par le script courant (= `&gObjectEvents[gSelectedObjectEvent]`
 *  inline du décomp scrcmd.c), ou null si l'index est invalide ou inactif. */
export function getSelectedNpc(): ObjectEvent | null {
  const idx = gSelectedObjectEvent.index;
  if (idx < 0 || idx >= gObjectEvents.length) return null;
  const npc = gObjectEvents[idx];
  if (!npc.active) return null;
  return npc;
}

/** True ssi le frame courant a vu un nouveau press de A ou B
 *  (= `gMain.newKeys & (A_BUTTON | B_BUTTON)` inline du décomp). */
export function isAOrBNewlyPressed(): boolean {
  const rt = getRuntime();
  if (!rt) return false;
  return (rt.gMain.newKeys & (A_BUTTON | B_BUTTON)) !== 0;
}

/** Parse un arg de bytecode comme nombre. Si VAR_*, lit la value courante. Si
 *  LOCALID_X, résout via les templates de la map courante. Si MALE/FEMALE/autres
 *  constantes connues, retourne le numeric value 1:1 décomp.
 *  Pour les constantes inconnues, return 0 (= safe default). */
export function parseValue(arg: string | undefined): number {
  if (!arg) return 0;
  if (/^-?\d+$/.test(arg)) return parseInt(arg, 10);
  if (/^0x[0-9a-fA-F]+$/.test(arg)) return parseInt(arg, 16);
  if (arg.startsWith('VAR_')) return VarGetByName(arg);
  // 1:1 décomp constants : MALE = 0, FEMALE = 1 (= include/constants/global.h).
  if (arg === 'MALE') return MALE;
  if (arg === 'FEMALE') return FEMALE;
  // 1:1 décomp asm/macros/event.inc:1932-1933 : YES = 1, NO = 0 (convention FIELD
  // yesnobox, stocke dans VAR_RESULT). ⚠️ FIX inversion : YES/NO ne sont PAS dans les
  // namespaces include/constants de decomp-constants.ts -> resolveDecompConstant renvoie
  // undefined -> fallback `return 0` -> `goto_if_eq VAR_RESULT, YES` matchait quand
  // Result=0 (NON) -> OUI/NON inverses (tuto Birch : OUI repete, NON avance). TRUE/FALSE
  // ajoutes par coherence (global.h). Corrobore src/script_menu.c:241 (case 0 -> Result=1).
  if (arg === 'YES' || arg === 'TRUE') return 1;
  if (arg === 'NO' || arg === 'FALSE') return 0;
  // 1:1 décomp asm/macros/event.inc : STR_VAR_1/2/3 = index du buffer string
  // destination (sScriptStringVars, 0-indexé décomp). Notre setStringVar est
  // 1-indexé (1→gStringVar1) → on mappe STR_VAR_N → N. Sans ça, parseValue
  // renvoyait 0 → tous les `buffernumberstring STR_VAR_2/3` écrivaient gStringVar1
  // (via `|| 1`) en laissant gStringVar2/3 vierges → `{STR_VAR_2}` gelait (boucle
  // StringCopy sur buffer non terminé).
  if (arg === 'STR_VAR_1') return 1;
  if (arg === 'STR_VAR_2') return 2;
  if (arg === 'STR_VAR_3') return 3;
  // 1:1 décomp LOCALID_X : look up index dans les templates de la map courante.
  // LOCALID_PLAYER = 255, LOCALID_NONE = 0, LOCALID_CAMERA = 127.
  if (arg === 'LOCALID_PLAYER') return 255;
  if (arg === 'LOCALID_NONE') return 0;
  if (arg === 'LOCALID_CAMERA') return 127;
  if (arg.startsWith('LOCALID_')) {
    const templates = gMapHeader?.events?.objectEvents ?? [];
    const idx = templates.findIndex(t => t.localIdRaw === arg);
    if (idx >= 0) return idx + 1;  // 1-based, matches localId assigned au load.
    console.warn(`[parseValue] LOCALID '${arg}' not found in map templates`);
    return 0;
  }
  // 1:1 décomp constants lookup (= OBJ_EVENT_GFX_*, ITEM_*, MOVE_*, SPECIES_*,
  // TRAINER_*, FLAG_* numeric ID etc.). Cf. decomp-constants.ts pour list des
  // namespaces couverts. Sans ça, setvar VAR_OBJ_GFX_ID_0, OBJ_EVENT_GFX_RIVAL_*
  // stockait 0 → rival NPC sprite wrong (= toujours Brendan = 0).
  const constValue = resolveDecompConstant(arg);
  if (constValue !== undefined) return constValue;
  return 0;
}

/** Helper : match NPC par localIdRaw (= string, ex 'LOCALID_PLAYERS_HOUSE_1F_MOM').
 *  Supporte aussi VAR_X (= lit la value, match par localId number) et
 *  numeric arg (= match par localId number). */
export function findNpcByLocalId(arg: string): ObjectEvent | null {
  if (!arg) return null;
  // 1:1 décomp : si VAR_*, lire la value (= un number qui matche localId).
  if (arg.startsWith('VAR_')) {
    const n = VarGetByName(arg);
    for (const npc of gObjectEvents) {
      if (npc.active && npc.localId === n) return npc;
    }
    return null;
  }
  // Match par localIdRaw (= string) en priorité.
  for (const npc of gObjectEvents) {
    if (npc.active && npc.localIdRaw === arg) return npc;
  }
  // Fallback : parseInt (= si arg est numérique).
  const n = parseInt(arg, 10);
  if (!Number.isNaN(n)) {
    for (const npc of gObjectEvents) {
      if (npc.active && npc.localId === n) return npc;
    }
  }
  return null;
}

/** Helper : resolve un identifier d'objet en `localIdRaw` (= string LOCALID_*).
 *
 *  Audit session 126 fix Mom invisible 2F : le décomp `ScrCmd_addobject` fait
 *  `objectId = VarGetByName(...)` (= number), puis match template par `objectId` numérique.
 *  Notre impl matchait par `localIdRaw` (string), ce qui marche pour les
 *  literals `LOCALID_X` mais PAS pour les VAR_0x8008 que les scripts comme
 *  `PlayersHouse_2F_EventScript_MomComesUpstairsFemale` utilisent :
 *      setvar VAR_0x8008, LOCALID_PLAYERS_HOUSE_2F_MOM
 *      addobject VAR_0x8008
 *  Avant : `addobject VAR_0x8008` était traité comme localIdRaw = "VAR_0x8008"
 *  → template introuvable → no-op → Mom invisible.
 *  Maintenant : si arg starts with `VAR_`, on VarGet → number, puis on resolve
 *  via `reverseDecompConstant(num, 'LOCALID_')` pour retrouver le LOCALID_X. */
export function resolveObjectLocalIdRaw(arg: string): string {
  if (arg.startsWith('LOCALID_')) return arg;
  if (arg.startsWith('VAR_') || /^-?\d+$/.test(arg) || /^0x[0-9a-fA-F]+$/.test(arg)) {
    const num = VarGetByName(arg);
    // Match par numeric localId dans la map COURANTE d'ABORD (= match EXACT 1:1 décomp : localId
    // est l'index 1-based de l'object event de CETTE map). Prioritaire sur reverseDecompConstant
    // qui est AMBIGU (chaque map a ses propres LOCALID_X = 1, 2, … → renvoie le 1er trouvé global,
    // souvent le mauvais objet). Avec le localIdRaw synthétique `__LOCALID_<n>` (map-loader), ce
    // lookup retourne toujours un localIdRaw non vide → removeobject/applymovement matchent l'objet.
    const tplByLocalId = gMapHeader?.events?.objectEvents?.find(t => t.localId === num);
    if (tplByLocalId?.localIdRaw) return tplByLocalId.localIdRaw;
    // Fallback (objet hors map courante) : reverseDecompConstant.
    const resolved = reverseDecompConstant(num, 'LOCALID_');
    if (resolved) return resolved;
  }
  return arg;
}
import { applyMovement, isMovementDone, isAllMovementsDone } from './engine/field/movement-system';
// Tables de noms FR (= adaptation de gSpeciesNames/gMoveNames/gItems[].name/gTrainers[]
// — source unique partagée avec le moteur parsé, donc zéro divergence sur le formatage).
import { getSpeciesNameFr, getMoveNameFr, getItemNameFr, GetPocketByItemId } from '../harness/runtime/data-tables';
import { GetTrainerClassNameFromId, GetTrainerNameFromId } from './pokemon';
import { setStringVar, decodeOwBytes } from './text';
import { getString } from '../harness/runtime/decomp-strings';
import { CalculatePlayerPartyCount, GetMonData, SetMonData, MON_DATA_SPECIES, MON_DATA_IS_EGG, MON_DATA_NICKNAME, MON_DATA_MET_LOCATION, MON_DATA_MODERN_FATEFUL_ENCOUNTER, gPlayerParty } from './engine/battle/party-storage';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { SetSavedWeather, SetSavedWeatherFromCurrMapHeader, DoCurrentWeather } from './field_weather_effect';
import { FadeScreen } from './field_weather';
import { Random } from './random';
import { PlantBerryTree } from './berry';
import { GetHealLocation } from './heal_location';
import { GetCurrentApproachingTrainerObjectEventId, doLockForTrainer, IsOverworldLinkActive } from './scrcmd_trainer';
import { ScriptMenu_Multichoice, ScriptMenu_MultichoiceWithDefault, ScriptMenu_MultichoiceGrid, ScriptMenu_YesNo } from './script_menu';
import { gStdStrings } from './data/script_menu';
// Réconciliation (dette bannérisée soldée) : add/checkspace pointaient sur les shims
// « liste plate » de decoration.ts pendant que remove/check (:28) lisaient DÉJÀ
// l'inventaire per-catégorie → un decor ajouté par script était INTROUVABLE au
// checkdecor. Les 4 opcodes lisent désormais le MÊME foyer 1:1 decoration_inventory.
import { DecorationAdd, DecorationCheckSpace } from './decoration_inventory';
import { sContestNames } from './contest_strings';
import { doPokemart } from './shop';
import { makeSpecialInlineFlowPoll } from './special_flows';
// Voie A : logique « porte » partagée avec le moteur parsé (source unique).
import { doOpenDoor, doCloseDoor, doSetDoorOpen, doSetDoorClosed, isDoorAnimationStopped } from './scrcmd_door';
// Voie A : logique « field effect » partagée avec le moteur parsé (source unique).
import { doFieldEffect, setFieldEffectArgument, setWaitFieldEffect } from './scrcmd_fieldeffect';

// ─── gSpecials + waitstate (1:1 scrcmd.c : ScrCmd_special/specialvar/waitstate) ───
// `gSpecials[]` (data/specials.inc) = array de function pointers ; notre version est
// string-keyed pour matcher la table de specials extraite. registerSpecial est appelé par
// specials-registry.ts + les modules de jeu ; invokeSpecial = `gSpecials[index]()`.
type SpecialHandler = () => number | void;

// `var` (hoisté, SANS initialiseur) + lazy-init : battle_setup.ts / specials-registry.ts
// appellent registerSpecial à LEUR init, possiblement AVANT que le corps de ce module
// n'ait tourné (cycle ESM) → un `const = {}` serait en TDZ. Le `??=` lazy-init le couvre.
// eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
var _specialHandlers: Record<string, SpecialHandler> | undefined;

/** Enregistre un special handler (appelé par les modules de jeu via specials-registry). */
export function registerSpecial(name: string, handler: SpecialHandler): void {
  (_specialHandlers ??= {})[name] = handler;
}

/** Invoque un special par nom (1:1 `gSpecials[index]()`). Renvoie 0 si non enregistré. */
export function invokeSpecial(name: string): number {
  const handler = (_specialHandlers ??= {})[name];
  if (!handler) {
    console.log(`[special] '${name}' non enregistré (wire dans specials-registry.ts)`);
    return 0;
  }
  return handler() ?? 0;
}

let _waitStateSignaled = false;

/** Appelé par les flows UI (wallclock / starter / region map / PC) à leur fermeture pour
 *  débloquer un script suspendu sur `waitstate`. */
export function SignalWaitState(): void {
  _waitStateSignaled = true;
}
// Pont anti-cycle : field_screen_effect (Task_WaitForFadeAndEnableScriptCtx) l'appelle
// via globalThis — un import statique de scrcmd depuis ce module tirait tout le byte-VM
// (script-opcodes-*) dans le sous-arbre d'éval de field_player_avatar → TDZ DIR_SOUTH.
(globalThis as Record<string, unknown>).__SignalWaitState = SignalWaitState;
// Pont anti-cycle (P2.3) : trainer_see (PlayerFaceTrainerAfterBattle) appelle SetMovingNpcId
// via globalThis. L'import statique trainer_see→scrcmd fermait le cycle
// field_player_avatar→field_effect→trainer_see→scrcmd→script-opcodes-helpers → même TDZ DIR_SOUTH.
// (SetMovingNpcId est une déclaration hoistée → référençable dans cette closure.)
(globalThis as Record<string, unknown>).__SetMovingNpcId = (id: number) => SetMovingNpcId(id);

/** Consomme le signal waitstate (true une seule fois). Lu par `ScrCmd_waitstate`. */
export function consumeWaitStateSignal(): boolean {
  if (_waitStateSignaled) {
    _waitStateSignaled = false;
    return true;
  }
  return false;
}

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

// (Item 7-⑤ : la locale `Compare` est dissoute — import script-vars.ts:111,
// même sémantique 1:1 scrcmd.c:381-388 : 0=LT, 1=EQ, 2=GT.)

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
// Famille pointeur RAM brut (scrcmd.c:312/:320/:336) — même adaptation que copybyte :
// LISENT leurs octets 1:1 (alignement) mais le deref d'adresse GBA n'est pas modélisé.
// 0 usage dans les .inc Émeraude (vérifié 2026-07-02) = code-mort ; complétude de table.
const ScrCmd_loadbytefromptr: ScrCmdFunc = (ctx) => { const i = ScriptReadByte(ctx); ScriptReadWord(ctx); ctx.data[i] = 0; return false; };  // :312 (*(u8*)ptr non modélisé)
const ScrCmd_setptr: ScrCmdFunc = (ctx) => { ScriptReadByte(ctx); ScriptReadWord(ctx); return false; };      // :320
const ScrCmd_setptrbyte: ScrCmdFunc = (ctx) => { ScriptReadByte(ctx); ScriptReadWord(ctx); return false; };  // :336

const ScrCmd_setvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, ScriptReadHalfword(ctx)); return false; };          // :360
const ScrCmd_copyvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, varDeref(ScriptReadHalfword(ctx))); return false; }; // :367
const ScrCmd_setorcopyvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, VarGet(ScriptReadHalfword(ctx))); return false; }; // :374
const ScrCmd_addvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, (varDeref(id) + ScriptReadHalfword(ctx)) & 0xFFFF); return false; }; // :465
const ScrCmd_subvar: ScrCmdFunc = (ctx) => { const id = ScriptReadHalfword(ctx); varStore(id, (varDeref(id) - VarGet(ScriptReadHalfword(ctx))) & 0xFFFF); return false; }; // :472

const ScrCmd_compare_local_to_local: ScrCmdFunc = (ctx) => { const a = ctx.data[ScriptReadByte(ctx)]; const b = ctx.data[ScriptReadByte(ctx)]; ctx.comparisonResult = Compare(a & 0xFF, b & 0xFF); return false; }; // :390
const ScrCmd_compare_local_to_value: ScrCmdFunc = (ctx) => { const a = ctx.data[ScriptReadByte(ctx)]; const b = ScriptReadByte(ctx); ctx.comparisonResult = Compare(a & 0xFF, b); return false; }; // :399
// Variantes *ptr* (scrcmd.c:408-441) — deref RAM brut non modélisé (cf. copybyte) :
// consomment leurs octets 1:1, comparisonResult INCHANGÉ (pas d'invention de valeur).
// 0 usage .inc Émeraude (vérifié 2026-07-02) = code-mort ; complétude de table.
const ScrCmd_compare_local_to_ptr: ScrCmdFunc = (ctx) => { ScriptReadByte(ctx); ScriptReadWord(ctx); return false; };   // :408
const ScrCmd_compare_ptr_to_local: ScrCmdFunc = (ctx) => { ScriptReadWord(ctx); ScriptReadByte(ctx); return false; };   // :417
const ScrCmd_compare_ptr_to_value: ScrCmdFunc = (ctx) => { ScriptReadWord(ctx); ScriptReadByte(ctx); return false; };   // :426
const ScrCmd_compare_ptr_to_ptr: ScrCmdFunc = (ctx) => { ScriptReadWord(ctx); ScriptReadWord(ctx); return false; };     // :435
const ScrCmd_compare_var_to_value: ScrCmdFunc = (ctx) => { const a = varDeref(ScriptReadHalfword(ctx)); const b = ScriptReadHalfword(ctx); ctx.comparisonResult = Compare(a, b); return false; }; // :444
const ScrCmd_compare_var_to_var: ScrCmdFunc = (ctx) => { const a = varDeref(ScriptReadHalfword(ctx)); const b = varDeref(ScriptReadHalfword(ctx)); ctx.comparisonResult = Compare(a, b); return false; }; // :453

// ─── lock / release / faceplayer (1:1 scrcmd.c:1152-1263) ───────────────────

// 1:1 scrcmd.c:1152-1156 ScrCmd_faceplayer → event_object_lock.Script_FacePlayer.
const ScrCmd_faceplayer: ScrCmdFunc = () => {
  Script_FacePlayer();
  return false;
};

// 1:1 scrcmd.c:1201-1213 ScrCmd_lockall :
//   if (IsOverworldLinkActive()) return FALSE;
//   else { FreezeObjects_WaitForPlayer(); SetupNativeScript(ctx, IsFreezePlayerFinished); return TRUE; }
const ScrCmd_lockall: ScrCmdFunc = (ctx) => {
  if (IsOverworldLinkActive()) {
    return false;
  } else {
    FreezeObjects_WaitForPlayer();
    SetupNativeScript(ctx, IsFreezePlayerFinished);
    return true;
  }
};

// 1:1 scrcmd.c:1217-1237 ScrCmd_lock :
//   if (IsOverworldLinkActive()) return FALSE;
//   else if (gObjectEvents[gSelectedObjectEvent].active)
//        { FreezeObjects_WaitForPlayerAndSelected(); SetupNativeScript(ctx, IsFreezeSelectedObjectAndPlayerFinished); }
//   else { FreezeObjects_WaitForPlayer(); SetupNativeScript(ctx, IsFreezePlayerFinished); }
const ScrCmd_lock: ScrCmdFunc = (ctx) => {
  if (IsOverworldLinkActive()) {
    return false;
  } else {
    if (gObjectEvents[gSelectedObjectEvent.index]?.active) {
      FreezeObjects_WaitForPlayerAndSelected();
      SetupNativeScript(ctx, IsFreezeSelectedObjectAndPlayerFinished);
    } else {
      FreezeObjects_WaitForPlayer();
      SetupNativeScript(ctx, IsFreezePlayerFinished);
    }
    return true;
  }
};

// 1:1 scrcmd.c:1239-1249 ScrCmd_releaseall → HideFieldMessageBox + ScriptUnfreezeObjectEvents.
const ScrCmd_releaseall: ScrCmdFunc = () => {
  HideFieldMessageBox();
  ScriptUnfreezeObjectEvents();
  return false;
};

// 1:1 scrcmd.c:1251-1263 ScrCmd_release : clear du selected + ScriptUnfreezeObjectEvents.
const ScrCmd_release: ScrCmdFunc = () => {
  HideFieldMessageBox();
  const selected = gObjectEvents[gSelectedObjectEvent.index];
  if (selected && selected.active) ObjectEventClearHeldMovementIfFinished(selected);
  ScriptUnfreezeObjectEvents();
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

// ─── BGM fade (1:1 scrcmd.c:969/981 — BLOQUANTS via SetupNativeScript ; moteur m4a exempt) ──
/** 1:1 scrcmd.c:969-979 : FadeOutBGMTemporarily(4*speed || 4) + le script reste
 *  BLOQUÉ (SetupNativeScript → IsBGMPausedOrStopped) jusqu'à la fin du fade.
 *  (Avant : FadeOutBGM(speed||4) non bloquant + sans le ×4 — le script enchaînait
 *  pendant le fade et la musique ne pouvait pas reprendre via fadeinbgm.) */
const ScrCmd_fadeoutbgm: ScrCmdFunc = (ctx) => {
  const speed = ScriptReadByte(ctx);
  if (speed !== 0) FadeOutBGMTemporarily(4 * speed);
  else FadeOutBGMTemporarily(4);
  SetupNativeScript(ctx, IsBGMPausedOrStopped);
  return true;
};
/** 1:1 scrcmd.c:981-990 : FadeInBGM(4*speed || 4), non bloquant (reprend la BGM pausée). */
const ScrCmd_fadeinbgm: ScrCmdFunc = (ctx) => {
  const speed = ScriptReadByte(ctx);
  if (speed !== 0) FadeInBGM(4 * speed);
  else FadeInBGM(4);
  return false;
};

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
// 1:1 scrcmd.c:2218 : gSpecialVar_Result = GetMonData(&gPlayerParty[i], MODERN_FATEFUL_ENCOUNTER).
const ScrCmd_checkmodernfatefulencounter: ScrCmdFunc = (ctx) => {             // :2218
  const idx = VarGet(ScriptReadHalfword(ctx));
  if (idx < PARTY_SIZE) setResult(GetMonData(gPlayerParty[idx], MON_DATA_MODERN_FATEFUL_ENCOUNTER) ? 1 : 0);
  return false;
};

// ─── returnram (1:1 scrcmd.c:283) — RAM script (mystery event) ; parsé = StopScript (dette). ──
const ScrCmd_returnram: ScrCmdFunc = (ctx) => { StopScript(ctx); return false; };  // :283
// 1:1 scrcmd.c:289 endram : ClearRamScript() + StopScript. RAM script = Mystery Event
// (exempt) → ClearRamScript non porté ; le StopScript est le comportement observable.
const ScrCmd_endram: ScrCmdFunc = (ctx) => { StopScript(ctx); return true; };      // :289
// 1:1 scrcmd.c:296 setmysteryeventstatus : SetMysteryEventScriptStatus(u8) — Mystery
// Event exempt → consomme l'octet 1:1, statut non modélisé.
const ScrCmd_setmysteryeventstatus: ScrCmdFunc = (ctx) => { ScriptReadByte(ctx); return false; };  // :296

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
const ScrCmd_adddecoration: ScrCmdFunc = (ctx) => { setResult(DecorationAdd(VarGet(ScriptReadHalfword(ctx))) ? 1 : 0); return false; };          // :549
const ScrCmd_checkdecorspace: ScrCmdFunc = (ctx) => { setResult(DecorationCheckSpace(VarGet(ScriptReadHalfword(ctx))) ? 1 : 0); return false; }; // :565

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
// 1:1 scrcmd.c:540 : gSpecialVar_Result = CheckPCHasItem(itemId, quantity) — port RÉEL
// (pc-items.ts ; ex-stub setResult(0) upgradé 2026-07-02).
const ScrCmd_checkpcitem: ScrCmdFunc = (ctx) => { const id = VarGet(ScriptReadHalfword(ctx)); const q = VarGet(ScriptReadHalfword(ctx)); setResult(CheckPCHasItem(itemKeyOf(id), q) ? 1 : 0); return false; };  // :540

// ─── warpteleport (1:1 scrcmd.c:799) — DoTeleportTileWarp = warp simple (transition = dette) ──
const ScrCmd_warpteleport: ScrCmdFunc = (ctx) => { const { destMap, warpId, x, y } = readWarp(ctx); setPendingWarp({ destMap, x, y, elevation: 0, warpId }, 'step'); return false; };  // :799

// ─── buffercontestname (1:1 scrcmd.c:1635) : stringVarIndex(u8) + category(VarGet u16) ──
const ScrCmd_buffercontestname: ScrCmdFunc = (ctx) => { const idx = ScriptReadByte(ctx); const cat = VarGet(ScriptReadHalfword(ctx)); setStringVar(idx + 1, sContestNames[cat] ?? ''); return false; };  // :1635

// ─── Tier B — sous-systèmes NON portés (slot machine / rotating-tile puzzle / contest /
//     wondercard) : STUBS identiques au moteur parsé (dette documentée, partagée), consommation
//     d'octets 1:1 pour préserver l'alignement du curseur. ──
const ScrCmd_playslotmachine: ScrCmdFunc = (ctx) => { VarGet(ScriptReadHalfword(ctx)); let f = 0; SetupNativeScript(ctx, () => { f++; return f >= 1; }); return true; };  // :1914
// rotating-tile puzzle : câblé 1:1 → src/rotating_tile_puzzle.ts (transpilé, vague A1)
const ScrCmd_initrotatingtilepuzzle: ScrCmdFunc = (ctx) => { const isTrickHouse = VarGet(ScriptReadHalfword(ctx)); InitRotatingTilePuzzle(!!isTrickHouse); return false; };   // :2172
const ScrCmd_moverotatingtileobjects: ScrCmdFunc = (ctx) => { const puzzleNumber = VarGet(ScriptReadHalfword(ctx)); SetMovingNpcId(MoveRotatingTileObjects(puzzleNumber)); return false; };  // :2158
const ScrCmd_turnrotatingtileobjects: ScrCmdFunc = () => { TurnRotatingTileObjects(); return false; };   // :2166
const ScrCmd_freerotatingtilepuzzle: ScrCmdFunc = () => { FreeRotatingTilePuzzle(); return false; };     // :2180
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
// drawbox (:1390) : corps décomp INTÉGRALEMENT commenté, y compris les ScriptReadByte
// → ne lit RIEN (verbatim ; les octets args éventuels s'exécuteraient comme sur GBA).
const ScrCmd_drawbox: ScrCmdFunc = () => false;                                // :1390
// drawboxtext (:1431) : lit 4 octets ; le Multichoice est commenté dans la décomp.
const ScrCmd_drawboxtext: ScrCmdFunc = (ctx) => { ScriptReadByte(ctx); ScriptReadByte(ctx); ScriptReadByte(ctx); ScriptReadByte(ctx); return false; };  // :1431
// addelevmenuitem (:2110) : lit u8 + 3×VarGet(u16) ; ScriptAddElevatorMenuItem commenté (RS).
const ScrCmd_addelevmenuitem: ScrCmdFunc = (ctx) => { ScriptReadByte(ctx); VarGet(ScriptReadHalfword(ctx)); VarGet(ScriptReadHalfword(ctx)); VarGet(ScriptReadHalfword(ctx)); return false; };  // :2110
// showelevmenu (:2121) : corps décomp intégralement commenté → no-op sans lecture.
const ScrCmd_showelevmenu: ScrCmdFunc = () => false;                           // :2121
// initclock (:681) : RtcInitLocalTimeOffset(hour, minute) — port RÉEL (rtc.ts).
const ScrCmd_initclock: ScrCmdFunc = (ctx) => { const h = VarGet(ScriptReadHalfword(ctx)); const m = VarGet(ScriptReadHalfword(ctx)); RtcInitLocalTimeOffset(h & 0xFF, m & 0xFF); return false; };  // :681
// gettime (:696) : RtcCalcLocalTime → VAR_0x8000/1/2 = h/m/s — port RÉEL (rtc.ts).
const ScrCmd_gettime: ScrCmdFunc = () => {                                     // :696
  RtcCalcLocalTime();
  VarSet(VAR_0x8000, gLocalTime.hours);
  VarSet(VAR_0x8001, gLocalTime.minutes);
  VarSet(VAR_0x8002, gLocalTime.seconds);
  return false;
};
// addpcitem (:531) : gSpecialVar_Result = AddPCItem(itemId, quantity) — port RÉEL (pc-items).
const ScrCmd_addpcitem: ScrCmdFunc = (ctx) => { const id = VarGet(ScriptReadHalfword(ctx)); const q = VarGet(ScriptReadHalfword(ctx)); setResult(AddPCItem(itemKeyOf(id), q) ? 1 : 0); return false; };  // :531
// removedecoration (:557) / checkdecor (:573) : ports RÉELS (decoration_inventory.ts 1:1).
const ScrCmd_removedecoration: ScrCmdFunc = (ctx) => { const d = VarGet(ScriptReadHalfword(ctx)); setResult(DecorationRemove(d) ? 1 : 0); return false; };  // :557
const ScrCmd_checkdecor: ScrCmdFunc = (ctx) => { const d = VarGet(ScriptReadHalfword(ctx)); setResult(CheckHasDecoration(d) ? 1 : 0); return false; };      // :573
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
// 1:1 décomp `ScrCmd_animateflash` (scrcmd.c:605) : `AnimateFlash(level); ScriptContext_Stop();`.
// AnimateFlash (field_screen_effect.ts, effet scanline WIN0 REEL — remplace la rustine
// flash-mask) lance UpdateFlashLevelEffect + Task_WaitForFlashUpdate. Port : le wait du
// script est porté par le poll natif (mécanisme éprouvé) qui attend la fin de la task ;
// timing observable identique au décomp (ScriptContext_Stop + reprise ScriptContext_Enable).
// Ponts globalThis anti-cycle (un import scrcmd→field_screen_effect = arête d'éval tôt → TDZ).
const ScrCmd_animateflash: ScrCmdFunc = (ctx) => {
  const level = ScriptReadByte(ctx) & 0xF;
  const g = globalThis as Record<string, unknown>;
  (g.__AnimateFlash as ((l: number) => void) | undefined)?.(level);
  SetupNativeScript(ctx, () => !((g.__IsAnimateFlashActive as (() => boolean) | undefined)?.() ?? false));
  return true;
};  // :605

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
/** Curseur binaire minimal (buf + offset mutable) — abstraction commune à
 *  makeByteVmTrainerArgSource (ScriptContext) et à ConfigureAndSetUpOneTrainerBattle
 *  (curseur arbitraire sur l'image, trainer_see.c → battle_setup.c). */
interface TrainerArgCursor { buf: Uint8Array; off: number; }

/** Cœur factorisé : construit une TrainerArgSource lisant un curseur binaire arbitraire
 *  (le curseur `.off` avance à chaque lecture). Utilisé par le byte-VM (curseur = le
 *  ScriptContext) ET par ConfigureAndSetUpOneTrainerBattle (curseur sur l'image des scripts). */
export function makeByteVmTrainerArgSourceFromCursor(cur: TrainerArgCursor): TrainerArgSource {
  const readByte = (): number => { const v = cur.buf[cur.off]; cur.off++; return v; };
  const readHalf = (): number => { let v = cur.buf[cur.off]; cur.off++; v |= cur.buf[cur.off] << 8; cur.off++; return v; };
  const readWord = (): number => {
    const v0 = cur.buf[cur.off]; cur.off++; const v1 = cur.buf[cur.off]; cur.off++;
    const v2 = cur.buf[cur.off]; cur.off++; const v3 = cur.buf[cur.off]; cur.off++;
    return ((((((v3 << 8) + v2) << 8) + v1) << 8) + v0) >>> 0;
  };
  return {
    u8: () => readByte(),
    u16: () => readHalf(),
    ptr32: (key) => {
      const v = readWord();
      if (key === 'sTrainerABattleScriptRetAddr' || key === 'sTrainerBBattleScriptRetAddr') {
        return v ? ptrFromOffset(v) : null;                   // continue-script : reloc → curseur image
      }
      return v ? (resolveSymbol(v)?.label ?? null) : null;    // speech : symbole texte → label
    },
    retAddr: () => ({ buf: cur.buf, off: cur.off }),   // reprise = curseur APRÈS args
  };
}

function makeByteVmTrainerArgSource(ctx: ScriptContext): TrainerArgSource {
  // Le curseur PARTAGE l'objet scriptPtr du ctx → les lectures avancent ctx.scriptPtr.off
  // (comme avant via ScriptRead*), donc `retAddr` capture bien la position APRÈS les args.
  return makeByteVmTrainerArgSourceFromCursor(ctx.scriptPtr!);
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
const ScrCmd_checkplayergender: ScrCmdFunc = () => { setResult(gPlayerAvatar.gender === 'MALE' ? MALE : FEMALE); return false; };
const ScrCmd_checktrainerflag: ScrCmdFunc = (ctx) => { const i = VarGet(ScriptReadHalfword(ctx)); (ctx as ScriptContext).comparisonResult = HasTrainerBeenFought(i) ? 1 : 0; return false; };
const ScrCmd_settrainerflag: ScrCmdFunc = (ctx) => { SetTrainerFlag(VarGet(ScriptReadHalfword(ctx))); return false; };
const ScrCmd_cleartrainerflag: ScrCmdFunc = (ctx) => { ClearTrainerFlag(VarGet(ScriptReadHalfword(ctx))); return false; };

// ─── son (hardware-exempt : PlaySE statique + __decompGlobals pour le reste) ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _dg = (): any => (globalThis as Record<string, unknown>).__decompGlobals;
const ScrCmd_playse: ScrCmdFunc = (ctx) => { PlaySE(ScriptReadHalfword(ctx)); return false; };
const ScrCmd_waitse: ScrCmdFunc = (ctx) => { SetupNativeScript(ctx, () => !(_dg()?.IsSEPlaying?.() ?? false)); return true; };
// PlayFanfare importé DIRECTEMENT (comme PlaySE) : il n'est PAS sur __decompGlobals
// (seul IsFanfareTaskInactive y est) → l'ancien `_dg()?.PlayFanfare?.(…)` était undefined
// = aucune fanfare + (avec optional chaining) arg non consommé → scriptPtr désaligné.
// Jouer la fanfare sur le slot dédié rend aussi waitfanfare correct (tient le texte).
const ScrCmd_playfanfare: ScrCmdFunc = (ctx) => { PlayFanfare(ScriptReadHalfword(ctx)); return false; };
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
/** 1:1 décomp `SetMovingNpcId(localId)` (script_movement.c) : pose l'id du NPC dont
 *  `waitmovement 0` doit attendre la fin du mouvement. Appelé par
 *  PlayerFaceTrainerAfterBattle (trainer_see.c) après un combat de dresseur. */
export function SetMovingNpcId(localId: number): void { sMovingNpcId = localId & 0xFFFF; }
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
// 1:1 scrcmd.c:255/:269 — variantes conditionnelles. 0 usage dans les .inc Émeraude
// (vérifié 2026-07-02) ; portées pour la complétude 1:1 de la table.
const ScrCmd_gotostd_if: ScrCmdFunc = (ctx) => {                             // :255
  const condition = ScriptReadByte(ctx);
  const index = ScriptReadByte(ctx);
  if (sScriptConditionTable[condition][ctx.comparisonResult] === 1) {
    const off = fetchStdOffset(index);
    if (off !== null) ScriptJump(ctx, ptrFromOffset(off));
  }
  return false;
};
const ScrCmd_callstd_if: ScrCmdFunc = (ctx) => {                             // :269
  const condition = ScriptReadByte(ctx);
  const index = ScriptReadByte(ctx);
  if (sScriptConditionTable[condition][ctx.comparisonResult] === 1) {
    const off = fetchStdOffset(index);
    if (off !== null) ScriptCall(ctx, ptrFromOffset(off));
  }
  return false;
};

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
// 1:1 décomp gStdStrings[] — consolidé dans le foyer data src/data/script_menu.ts
// (partagé avec tv.ts Smart Shopper/Bravo Trainer).
const ScrCmd_bufferstdstring: ScrCmdFunc = (ctx) => {                        // :1626
  const idx = ScriptReadByte(ctx);
  const stdIdx = VarGet(ScriptReadHalfword(ctx));
  const gtext = gStdStrings[stdIdx];   // 1:1 StringCopy(sScriptStringVars[idx], gStdStrings[index])
  setStringVar(idx + 1, gtext ? getString(gtext) : '');
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
  // 1:1 scrcmd.c:2277 StringCopy(sScriptStringVars[i], GetTrainerClassNameFromId(id)).
  // Pont u8*→string JS au call-site (décomp = StringCopy dans un buffer), précédent
  // ScrCmd_bufferstring (setStringVar attend un string JS ; decodeOwBytes = frontière).
  setStringVar(idx + 1, decodeOwBytes(GetTrainerClassNameFromId(trainerId)));
  return false;
};
const ScrCmd_buffertrainername: ScrCmdFunc = (ctx) => {                      // :2281
  const idx = ScriptReadByte(ctx);
  const trainerId = VarGet(ScriptReadHalfword(ctx));
  // 1:1 scrcmd.c:2286 StringCopy(sScriptStringVars[i], GetTrainerNameFromId(id)).
  setStringVar(idx + 1, decodeOwBytes(GetTrainerNameFromId(trainerId)));
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
const ScrCmd_vcall_if: ScrCmdFunc = ScrCmd_call_if;  // :225 (usage = scripts gift_* mystery-gift uniquement)
// vbuffermessage (:1622) / vbufferstring (:1610) : StringExpandPlaceholders/StringCopy vers
// gStringVar4/sScriptStringVars depuis un ptr v-adressé — usage = gift_* mystery-gift
// uniquement (0 usage solo, vérifié 2026-07-02) → consomment leurs octets 1:1, no-op.
const ScrCmd_vbuffermessage: ScrCmdFunc = (ctx) => { ScriptReadWord(ctx); return false; };                       // :1622
const ScrCmd_vbufferstring: ScrCmdFunc = (ctx) => { ScriptReadByte(ctx); ScriptReadWord(ctx); return false; };   // :1610
// callnative (:118) : NativeFunc(ScriptReadWord)() — table d'adresses natives non modélisée
// (même dette que gotonative, Phase 4b) ; 0 usage .inc Émeraude. Consomme le word 1:1.
const ScrCmd_callnative: ScrCmdFunc = (ctx) => { ScriptReadWord(ctx); return false; };                           // :118
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
  ScrCmd_loadbytefromptr, ScrCmd_setptr, ScrCmd_setptrbyte,
  ScrCmd_setvar, ScrCmd_copyvar, ScrCmd_setorcopyvar, ScrCmd_addvar, ScrCmd_subvar,
  ScrCmd_compare_local_to_local, ScrCmd_compare_local_to_value,
  ScrCmd_compare_local_to_ptr, ScrCmd_compare_ptr_to_local,
  ScrCmd_compare_ptr_to_value, ScrCmd_compare_ptr_to_ptr,
  ScrCmd_compare_var_to_value, ScrCmd_compare_var_to_var,
  ScrCmd_setflag, ScrCmd_clearflag, ScrCmd_checkflag,
  ScrCmd_gotostd, ScrCmd_callstd, ScrCmd_gotostd_if, ScrCmd_callstd_if,
  ScrCmd_message, ScrCmd_waitmessage, ScrCmd_closemessage,
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
  ScrCmd_vgoto, ScrCmd_vcall, ScrCmd_vgoto_if, ScrCmd_vcall_if, ScrCmd_vmessage, ScrCmd_setvaddress, ScrCmd_copybyte,
  ScrCmd_vbuffermessage, ScrCmd_vbufferstring, ScrCmd_callnative, ScrCmd_checkmodernfatefulencounter,
  ScrCmd_setwarp, ScrCmd_setdivewarp, ScrCmd_setholewarp, ScrCmd_setescapewarp, ScrCmd_setdynamicwarp,
  ScrCmd_erasebox, ScrCmd_drawbox, ScrCmd_drawboxtext, ScrCmd_addelevmenuitem, ScrCmd_showelevmenu,
  ScrCmd_initclock, ScrCmd_gettime, ScrCmd_addpcitem, ScrCmd_removedecoration, ScrCmd_checkdecor,
  ScrCmd_getpokenewsactive, ScrCmd_messageautoscroll, ScrCmd_fadescreenswapbuffers,
  ScrCmd_savebgm, ScrCmd_fadedefaultbgm, ScrCmd_setobjectsubpriority, ScrCmd_resetobjectsubpriority,
  ScrCmd_setmonmove, ScrCmd_fadenewbgm, ScrCmd_bufferboxname, ScrCmd_braillemessage, ScrCmd_closebraillemessage,
  ScrCmd_setflashlevel, ScrCmd_animateflash,
  ScrCmd_givemon, ScrCmd_giveegg,
  ScrCmd_trainerbattle, ScrCmd_dotrainerbattle, ScrCmd_gotopostbattlescript, ScrCmd_gotobeatenscript,
  ScrCmd_setwildbattle, ScrCmd_dowildbattle,
  ScrCmd_warpdoor, ScrCmd_warpmossdeepgym, ScrCmd_warpspinenter, ScrCmd_warpwhitefade, ScrCmd_warphole,
  ScrCmd_fadeoutbgm, ScrCmd_fadeinbgm, ScrCmd_messageinstant, ScrCmd_pokenavcall,
  ScrCmd_setmonmetlocation, ScrCmd_setmodernfatefulencounter, ScrCmd_returnram, ScrCmd_endram,
  ScrCmd_setmysteryeventstatus, ScrCmd_checkitemtype, ScrCmd_setrespawn,
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
