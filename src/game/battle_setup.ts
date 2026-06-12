/**
 * game/battle_setup.ts — MIROIR (partiel) de `src/battle_setup.c` (décomp pokeemeraude).
 *
 * Tranche T-A (flux dresseur single, 2026-06-12) :
 *   - Statics EWRAM (:94-111) + 7 tables TrainerBattleParameter (:162-251).
 *   - TrainerBattleLoadArg8/16/32 (:969-982, nominaux), SetU8/16/32/SetPtr (:1039-1057),
 *     TrainerBattleLoadArgs (:1059-1092) — adaptés aux args HAUT-NIVEAU du transpileur
 *     (les « pointeurs » décomp = labels strings ; le byte-stream = l'array d'args,
 *     1:1 structurel : mêmes tables, mêmes setters, même curseur).
 *   - BattleSetup_ConfigureTrainerBattle (:1103-1191) → retourne le LABEL du
 *     EventScript_* à jumper (scripts trainer_battle.inc transpilés présents).
 *   - InitTrainerBattleVariables (:1018), SetMapVarsToTrainer (:1094),
 *     GetTrainerAFlag/GetTrainerBFlag (:984-992), IsPlayerDefeated (:994),
 *     ResetTrainerOpponentIds (:1012), GetTrainerBattleMode (:1230),
 *     SetBattledTrainersFlags (:1245), SetBattledTrainerFlag UNUSED (:1252 — dette),
 *     HasTrainerBeenFought/SetTrainerFlag/ClearTrainerFlag (:1257-1270),
 *     BattleSetup_GetScriptAddrAfterBattle (:1404),
 *     BattleSetup_GetTrainerPostBattleScript (:1412),
 *     ShowTrainerIntroSpeech (:1378, chemin hors Pyramid/Hill),
 *     ShowTrainerCantBattleSpeech (:1435), GetIntroSpeechOfApproachingTrainer,
 *     GetTrainerCantBattleSpeech, DoTrainerBattle (:459) + CB2_EndTrainerBattle (:1327).
 *
 * PAS ENCORE ICI (dettes T-B/T-C, cf. BACKLOG-TROUS-COMBAT.md) :
 *   rematches (gRematchTable :260 + 18 fn :1546-1890), CB2_EndRematchBattle,
 *   BattleSetup_StartRematchBattle, ConfigureAndSetUpOneTrainerBattle (trainer_see),
 *   ConfigureTwoTrainersBattle/SetUpTwoTrainersBattle (2 approchants),
 *   GetTrainerFlagFromScriptPointer, Pyramid/Hill (frontier), gApproachingTrainerId
 *   (trainer_see non porté → chemin ==0 partout).
 *
 * Boot réel du combat : BattleSetup_StartTrainerBattle (battle-setup-helpers.ts:290,
 * C5 validé) = BATTLE_TYPE_TRAINER + sTrainerADefeatSpeech + bootDecompBattleLoop
 * (CreateBattleStartTask + savedCallback retour OW). DoTrainerBattle (:459) délègue.
 */

import {
  getScript, getText, ScriptJump, SetupNativeScript, StopScript,
  type ScriptContext, type Opcode,
} from '../engine/script/script-runtime';
import { registerSpecial } from '../engine/script/script-opcodes';
import { FlagSet, FlagGet, gSpecialVar } from '../engine/script/script-vars';
import { parseValue } from '../engine/script/script-opcodes-helpers';
import { ShowFieldMessage } from '../engine/field/field-message-box';
import { BattleSetup_StartTrainerBattle } from '../engine/battle/battle-setup-helpers';
import { resolveTrainerNumId, ensureGTrainersLoaded } from '../engine/battle/battle-trainer-data-bridge';
import {
  setTrainerBattleOpponentA, setBattleOutcome, gBattleOutcome,
} from '../engine/battle/state';

// ─── Modes 1:1 décomp `include/battle_setup.h` (TRAINER_BATTLE_*) ───────────
export const TRAINER_BATTLE_SINGLE = 0;
export const TRAINER_BATTLE_CONTINUE_SCRIPT_NO_MUSIC = 1;
export const TRAINER_BATTLE_CONTINUE_SCRIPT = 2;
export const TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT = 3;
export const TRAINER_BATTLE_DOUBLE = 4;
export const TRAINER_BATTLE_REMATCH = 5;
export const TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE = 6;
export const TRAINER_BATTLE_REMATCH_DOUBLE = 7;
export const TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE_NO_MUSIC = 8;
export const TRAINER_BATTLE_PYRAMID = 9;
export const TRAINER_BATTLE_SET_TRAINER_A = 10;
export const TRAINER_BATTLE_SET_TRAINER_B = 11;
export const TRAINER_BATTLE_HILL = 12;

/** 1:1 décomp `TRAINER_FLAGS_START` (constants/flags.h) = 0x500. */
const TRAINER_FLAGS_START = 1280;

// ─── Param types 1:1 décomp battle_setup.c:58-66 ────────────────────────────
const TRAINER_PARAM_LOAD_VAL_8BIT = 0;
const TRAINER_PARAM_LOAD_VAL_16BIT = 1;
const TRAINER_PARAM_LOAD_VAL_32BIT = 2;
const TRAINER_PARAM_CLEAR_VAL_8BIT = 3;
const TRAINER_PARAM_CLEAR_VAL_16BIT = 4;
const TRAINER_PARAM_CLEAR_VAL_32BIT = 5;
const TRAINER_PARAM_LOAD_SCRIPT_RET_ADDR = 6;

// ─── Statics EWRAM 1:1 décomp battle_setup.c:94-111 ─────────────────────────
// Les « u8* » de speech/script = labels strings (transpileur haut-niveau).
// sTrainerBattleEndScript = position de reprise du script de map (1:1 : l'adresse
// APRÈS les args de l'opcode trainerbattle, capturée par LOAD_SCRIPT_RET_ADDR).
type ScriptPos = { opcodes: Opcode[]; idx: number };
type TrainerVarKey =
  | 'sTrainerBattleMode' | 'gTrainerBattleOpponent_A' | 'gTrainerBattleOpponent_B'
  | 'sTrainerObjectEventLocalId'
  | 'sTrainerAIntroSpeech' | 'sTrainerBIntroSpeech'
  | 'sTrainerADefeatSpeech' | 'sTrainerBDefeatSpeech'
  | 'sTrainerVictorySpeech' | 'sTrainerCannotBattleSpeech'
  | 'sTrainerABattleScriptRetAddr' | 'sTrainerBBattleScriptRetAddr'
  | 'sTrainerBattleEndScript';

let sTrainerBattleMode = 0;
/** 1:1 décomp `gTrainerBattleOpponent_B` (battle_setup.c:96). (_A vit dans state.ts.) */
export let gTrainerBattleOpponent_B = 0;
/** 1:1 décomp `gPartnerTrainerId` (battle_setup.c:97) — multi/partner, dette. */
export let gPartnerTrainerId = 0;
let sTrainerObjectEventLocalId = 0;
let sTrainerAIntroSpeech: string | null = null;
let sTrainerBIntroSpeech: string | null = null;
let sTrainerADefeatSpeech: string | null = null;
let sTrainerBDefeatSpeech: string | null = null;
let sTrainerVictorySpeech: string | null = null;
let sTrainerCannotBattleSpeech: string | null = null;
let sTrainerBattleEndScript: ScriptPos | null = null;
let sTrainerABattleScriptRetAddr: string | null = null;
let sTrainerBBattleScriptRetAddr: string | null = null;
let sShouldCheckTrainerBScript = false;
let sNoOfPossibleTrainerRetScripts = 0;
/** 1:1 décomp `gWhichTrainerToFaceAfterBattle` (battle_setup.c). */
export let gWhichTrainerToFaceAfterBattle = 0;
/** 1:1 décomp `gApproachingTrainerId` (trainer_see.c) — trainer_see non porté → 0. */
const gApproachingTrainerId = 0;
/** 1:1 décomp `gNoOfApproachingTrainers` (trainer_see.c) — idem → 0. */
const gNoOfApproachingTrainers = 0;

/** Miroir local de gTrainerBattleOpponent_A (la canonique vit dans state.ts via
 *  setTrainerBattleOpponentA — GetTrainerFlag de specials-registry la lit par
 *  __battleStateMutators). On garde une copie lisible ici pour GetTrainerAFlag. */
let _trainerBattleOpponentA = 0;

// ─── SetU8/SetU16/SetU32/SetPtr 1:1 décomp :1039-1057 (varPtr → varKey) ─────
function SetU8(key: TrainerVarKey, value: number): void { _setVar(key, value & 0xFF); }
function SetU16(key: TrainerVarKey, value: number): void { _setVar(key, value & 0xFFFF); }
function SetU32(key: TrainerVarKey, value: number): void { _setVar(key, value >>> 0); }
function SetPtr(key: TrainerVarKey, value: string | ScriptPos | null): void { _setVar(key, value); }

function _setVar(key: TrainerVarKey, value: number | string | ScriptPos | null): void {
  switch (key) {
    case 'sTrainerBattleMode': sTrainerBattleMode = value as number; break;
    case 'gTrainerBattleOpponent_A':
      _trainerBattleOpponentA = value as number;
      setTrainerBattleOpponentA(value as number);
      break;
    case 'gTrainerBattleOpponent_B': gTrainerBattleOpponent_B = value as number; break;
    case 'sTrainerObjectEventLocalId': sTrainerObjectEventLocalId = value as number; break;
    case 'sTrainerAIntroSpeech': sTrainerAIntroSpeech = value as string | null; break;
    case 'sTrainerBIntroSpeech': sTrainerBIntroSpeech = value as string | null; break;
    case 'sTrainerADefeatSpeech': sTrainerADefeatSpeech = value as string | null; break;
    case 'sTrainerBDefeatSpeech': sTrainerBDefeatSpeech = value as string | null; break;
    case 'sTrainerVictorySpeech': sTrainerVictorySpeech = value as string | null; break;
    case 'sTrainerCannotBattleSpeech': sTrainerCannotBattleSpeech = value as string | null; break;
    case 'sTrainerABattleScriptRetAddr': sTrainerABattleScriptRetAddr = value as string | null; break;
    case 'sTrainerBBattleScriptRetAddr': sTrainerBBattleScriptRetAddr = value as string | null; break;
    case 'sTrainerBattleEndScript': sTrainerBattleEndScript = value as ScriptPos | null; break;
  }
}

// ─── Param tables 1:1 décomp battle_setup.c:162-251 (ordre des champs EXACT) ──
interface TrainerBattleParameter { varKey: TrainerVarKey; ptrType: number; }

const sOrdinaryBattleParams: TrainerBattleParameter[] = [
  { varKey: 'sTrainerBattleMode',           ptrType: TRAINER_PARAM_LOAD_VAL_8BIT },
  { varKey: 'gTrainerBattleOpponent_A',     ptrType: TRAINER_PARAM_LOAD_VAL_16BIT },
  { varKey: 'sTrainerObjectEventLocalId',   ptrType: TRAINER_PARAM_LOAD_VAL_16BIT },
  { varKey: 'sTrainerAIntroSpeech',         ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerADefeatSpeech',        ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerVictorySpeech',        ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerCannotBattleSpeech',   ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerABattleScriptRetAddr', ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerBattleEndScript',      ptrType: TRAINER_PARAM_LOAD_SCRIPT_RET_ADDR },
];

const sContinueScriptBattleParams: TrainerBattleParameter[] = [
  { varKey: 'sTrainerBattleMode',           ptrType: TRAINER_PARAM_LOAD_VAL_8BIT },
  { varKey: 'gTrainerBattleOpponent_A',     ptrType: TRAINER_PARAM_LOAD_VAL_16BIT },
  { varKey: 'sTrainerObjectEventLocalId',   ptrType: TRAINER_PARAM_LOAD_VAL_16BIT },
  { varKey: 'sTrainerAIntroSpeech',         ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerADefeatSpeech',        ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerVictorySpeech',        ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerCannotBattleSpeech',   ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerABattleScriptRetAddr', ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerBattleEndScript',      ptrType: TRAINER_PARAM_LOAD_SCRIPT_RET_ADDR },
];

const sDoubleBattleParams: TrainerBattleParameter[] = [
  { varKey: 'sTrainerBattleMode',           ptrType: TRAINER_PARAM_LOAD_VAL_8BIT },
  { varKey: 'gTrainerBattleOpponent_A',     ptrType: TRAINER_PARAM_LOAD_VAL_16BIT },
  { varKey: 'sTrainerObjectEventLocalId',   ptrType: TRAINER_PARAM_LOAD_VAL_16BIT },
  { varKey: 'sTrainerAIntroSpeech',         ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerADefeatSpeech',        ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerVictorySpeech',        ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerCannotBattleSpeech',   ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerABattleScriptRetAddr', ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerBattleEndScript',      ptrType: TRAINER_PARAM_LOAD_SCRIPT_RET_ADDR },
];

const sOrdinaryNoIntroBattleParams: TrainerBattleParameter[] = [
  { varKey: 'sTrainerBattleMode',           ptrType: TRAINER_PARAM_LOAD_VAL_8BIT },
  { varKey: 'gTrainerBattleOpponent_A',     ptrType: TRAINER_PARAM_LOAD_VAL_16BIT },
  { varKey: 'sTrainerObjectEventLocalId',   ptrType: TRAINER_PARAM_LOAD_VAL_16BIT },
  { varKey: 'sTrainerAIntroSpeech',         ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerADefeatSpeech',        ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerVictorySpeech',        ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerCannotBattleSpeech',   ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerABattleScriptRetAddr', ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerBattleEndScript',      ptrType: TRAINER_PARAM_LOAD_SCRIPT_RET_ADDR },
];

const sContinueScriptDoubleBattleParams: TrainerBattleParameter[] = [
  { varKey: 'sTrainerBattleMode',           ptrType: TRAINER_PARAM_LOAD_VAL_8BIT },
  { varKey: 'gTrainerBattleOpponent_A',     ptrType: TRAINER_PARAM_LOAD_VAL_16BIT },
  { varKey: 'sTrainerObjectEventLocalId',   ptrType: TRAINER_PARAM_LOAD_VAL_16BIT },
  { varKey: 'sTrainerAIntroSpeech',         ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerADefeatSpeech',        ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerVictorySpeech',        ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerCannotBattleSpeech',   ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerABattleScriptRetAddr', ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerBattleEndScript',      ptrType: TRAINER_PARAM_LOAD_SCRIPT_RET_ADDR },
];

const sTrainerBOrdinaryBattleParams: TrainerBattleParameter[] = [
  { varKey: 'sTrainerBattleMode',           ptrType: TRAINER_PARAM_LOAD_VAL_8BIT },
  { varKey: 'gTrainerBattleOpponent_B',     ptrType: TRAINER_PARAM_LOAD_VAL_16BIT },
  { varKey: 'sTrainerObjectEventLocalId',   ptrType: TRAINER_PARAM_LOAD_VAL_16BIT },
  { varKey: 'sTrainerBIntroSpeech',         ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerBDefeatSpeech',        ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerVictorySpeech',        ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerCannotBattleSpeech',   ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerBBattleScriptRetAddr', ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerBattleEndScript',      ptrType: TRAINER_PARAM_LOAD_SCRIPT_RET_ADDR },
];

const sTrainerBContinueScriptBattleParams: TrainerBattleParameter[] = [
  { varKey: 'sTrainerBattleMode',           ptrType: TRAINER_PARAM_LOAD_VAL_8BIT },
  { varKey: 'gTrainerBattleOpponent_B',     ptrType: TRAINER_PARAM_LOAD_VAL_16BIT },
  { varKey: 'sTrainerObjectEventLocalId',   ptrType: TRAINER_PARAM_LOAD_VAL_16BIT },
  { varKey: 'sTrainerBIntroSpeech',         ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerBDefeatSpeech',        ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerVictorySpeech',        ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerCannotBattleSpeech',   ptrType: TRAINER_PARAM_CLEAR_VAL_32BIT },
  { varKey: 'sTrainerBBattleScriptRetAddr', ptrType: TRAINER_PARAM_LOAD_VAL_32BIT },
  { varKey: 'sTrainerBattleEndScript',      ptrType: TRAINER_PARAM_LOAD_SCRIPT_RET_ADDR },
];

// ─── Args haut-niveau : valeur numérique vs label string ────────────────────

/** Le trainer arrive en 'TRAINER_XXX' (label) ou nombre ; les autres champs
 *  numériques en littéral. resolveTrainerNumId gère les deux pour l'opposant. */
function _argToU16(key: TrainerVarKey, raw: string | undefined): number {
  if (raw === undefined) return 0;
  if (key === 'gTrainerBattleOpponent_A' || key === 'gTrainerBattleOpponent_B') {
    return resolveTrainerNumId(raw) & 0xFFFF;
  }
  return parseValue(raw) & 0xFFFF;
}

/** 1:1 décomp `TrainerBattleLoadArgs(specs, data)` (battle_setup.c:1059-1092).
 *  `data` (byte-stream) = l'array d'args haut-niveau ; LOAD_* consomme un arg,
 *  CLEAR_* n'en consomme pas, LOAD_SCRIPT_RET_ADDR capture la position de
 *  reprise du script appelant (= l'adresse APRÈS les args) puis RETURN. */
function TrainerBattleLoadArgs(specs: TrainerBattleParameter[], args: string[], ctx: ScriptContext): void {
  let i = 0;
  for (const spec of specs) {
    switch (spec.ptrType) {
      case TRAINER_PARAM_LOAD_VAL_8BIT:
        SetU8(spec.varKey, parseValue(args[i] ?? '0') & 0xFF);
        i += 1;
        break;
      case TRAINER_PARAM_LOAD_VAL_16BIT:
        SetU16(spec.varKey, _argToU16(spec.varKey, args[i]));
        i += 1;
        break;
      case TRAINER_PARAM_LOAD_VAL_32BIT:
        // Les « u32 » sont des POINTEURS décomp = labels strings chez nous.
        SetPtr(spec.varKey, args[i] && args[i] !== '0' && args[i] !== 'NULL' ? args[i] : null);
        i += 1;
        break;
      case TRAINER_PARAM_CLEAR_VAL_8BIT:
        SetU8(spec.varKey, 0);
        break;
      case TRAINER_PARAM_CLEAR_VAL_16BIT:
        SetU16(spec.varKey, 0);
        break;
      case TRAINER_PARAM_CLEAR_VAL_32BIT:
        SetPtr(spec.varKey, null);
        break;
      case TRAINER_PARAM_LOAD_SCRIPT_RET_ADDR:
        // 1:1 :1087 SetPtr(varPtr, data) = la position du script de map APRÈS
        // l'opcode trainerbattle (scriptIdx est déjà avancé par le dispatcher).
        SetPtr(spec.varKey, ctx.scriptOpcodes ? { opcodes: ctx.scriptOpcodes, idx: ctx.scriptIdx } : null);
        return;
    }
  }
}

// ─── Helpers 1:1 ─────────────────────────────────────────────────────────────

/** 1:1 décomp `GetTrainerAFlag()` (battle_setup.c:984). */
function GetTrainerAFlag(): number { return TRAINER_FLAGS_START + _trainerBattleOpponentA; }
/** 1:1 décomp `GetTrainerBFlag()` (battle_setup.c:989). */
export function GetTrainerBFlag(): number { return TRAINER_FLAGS_START + gTrainerBattleOpponent_B; }

/** 1:1 décomp `IsPlayerDefeated(battleOutcome)` (battle_setup.c:994-1010). */
export function IsPlayerDefeated(battleOutcome: number): boolean {
  switch (battleOutcome) {
    case 2: /* B_OUTCOME_LOST */
    case 3: /* B_OUTCOME_DREW */
      return true;
    default:
      return false;
  }
}

/** 1:1 décomp `ResetTrainerOpponentIds()` (battle_setup.c:1012). */
export function ResetTrainerOpponentIds(): void {
  _setVar('gTrainerBattleOpponent_A', 0);
  _setVar('gTrainerBattleOpponent_B', 0);
}

/** 1:1 décomp `InitTrainerBattleVariables()` (battle_setup.c:1018-1037). */
function InitTrainerBattleVariables(): void {
  sTrainerBattleMode = 0;
  if (gApproachingTrainerId === 0) {
    sTrainerAIntroSpeech = null;
    sTrainerADefeatSpeech = null;
    sTrainerABattleScriptRetAddr = null;
  } else {
    sTrainerBIntroSpeech = null;
    sTrainerBDefeatSpeech = null;
    sTrainerBBattleScriptRetAddr = null;
  }
  sTrainerObjectEventLocalId = 0;
  sTrainerVictorySpeech = null;
  sTrainerCannotBattleSpeech = null;
  sTrainerBattleEndScript = null;
}

/** 1:1 décomp `SetMapVarsToTrainer()` (battle_setup.c:1094-1101).
 *  gSelectedObjectEvent (= GetObjectEventIdByLocalIdAndMap) : dette — le flux
 *  talk-direct pose déjà LastTalked ; on n'écrase que si un localId est fourni. */
function SetMapVarsToTrainer(): void {
  if (sTrainerObjectEventLocalId !== 0) {
    gSpecialVar.LastTalked = sTrainerObjectEventLocalId;
  }
}

/** 1:1 décomp `BattleSetup_ConfigureTrainerBattle(data)` (battle_setup.c:1103-1191).
 *  `data` = args haut-niveau (forme générique [mode, trainer, localId, ptr1…]).
 *  Retourne le LABEL du EventScript_* à exécuter (ou null pour SET_TRAINER_A/B). */
export function BattleSetup_ConfigureTrainerBattle(args: string[], ctx: ScriptContext): string | null {
  InitTrainerBattleVariables();
  sTrainerBattleMode = parseValue(args[0] ?? '0') & 0xFF;

  // Préchargement : gTrainers/parties (async) prêt avant dotrainerbattle.
  void ensureGTrainersLoaded().catch(() => { /* warn au boot si KO */ });

  switch (sTrainerBattleMode) {
    case TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT:
      TrainerBattleLoadArgs(sOrdinaryNoIntroBattleParams, args, ctx);
      return 'EventScript_DoNoIntroTrainerBattle';
    case TRAINER_BATTLE_DOUBLE:
      TrainerBattleLoadArgs(sDoubleBattleParams, args, ctx);
      SetMapVarsToTrainer();
      return 'EventScript_TryDoDoubleTrainerBattle';
    case TRAINER_BATTLE_CONTINUE_SCRIPT:
      if (gApproachingTrainerId === 0) {
        TrainerBattleLoadArgs(sContinueScriptBattleParams, args, ctx);
        SetMapVarsToTrainer();
      } else {
        TrainerBattleLoadArgs(sTrainerBContinueScriptBattleParams, args, ctx);
      }
      return 'EventScript_TryDoNormalTrainerBattle';
    case TRAINER_BATTLE_CONTINUE_SCRIPT_NO_MUSIC:
      TrainerBattleLoadArgs(sContinueScriptBattleParams, args, ctx);
      SetMapVarsToTrainer();
      return 'EventScript_TryDoNormalTrainerBattle';
    case TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE:
    case TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE_NO_MUSIC:
      TrainerBattleLoadArgs(sContinueScriptDoubleBattleParams, args, ctx);
      SetMapVarsToTrainer();
      return 'EventScript_TryDoDoubleTrainerBattle';
    case TRAINER_BATTLE_REMATCH_DOUBLE:
      TrainerBattleLoadArgs(sDoubleBattleParams, args, ctx);
      SetMapVarsToTrainer();
      // 1:1 :1140 gTrainerBattleOpponent_A = GetRematchTrainerId(gTrainerBattleOpponent_A).
      _setVar('gTrainerBattleOpponent_A', GetRematchTrainerId(_trainerBattleOpponentA));
      return 'EventScript_TryDoDoubleRematchBattle';
    case TRAINER_BATTLE_REMATCH:
      TrainerBattleLoadArgs(sOrdinaryBattleParams, args, ctx);
      SetMapVarsToTrainer();
      // 1:1 :1145 gTrainerBattleOpponent_A = GetRematchTrainerId(gTrainerBattleOpponent_A).
      _setVar('gTrainerBattleOpponent_A', GetRematchTrainerId(_trainerBattleOpponentA));
      return 'EventScript_TryDoRematchBattle';
    case TRAINER_BATTLE_SET_TRAINER_A:
      TrainerBattleLoadArgs(sOrdinaryBattleParams, args, ctx);
      return null;
    case TRAINER_BATTLE_SET_TRAINER_B:
      TrainerBattleLoadArgs(sTrainerBOrdinaryBattleParams, args, ctx);
      return null;
    // TRAINER_BATTLE_PYRAMID / TRAINER_BATTLE_HILL : frontier, dette T-C (:1147-1178).
    default:
      if (gApproachingTrainerId === 0) {
        TrainerBattleLoadArgs(sOrdinaryBattleParams, args, ctx);
        SetMapVarsToTrainer();
      } else {
        TrainerBattleLoadArgs(sTrainerBOrdinaryBattleParams, args, ctx);
      }
      return 'EventScript_TryDoNormalTrainerBattle';
  }
}

/** 1:1 décomp `GetTrainerBattleMode()` (battle_setup.c:1230). */
export function GetTrainerBattleMode(): number { return sTrainerBattleMode; }

/** 1:1 décomp `SetBattledTrainersFlags()` (battle_setup.c:1245-1250). */
export function SetBattledTrainersFlags(): void {
  if (gTrainerBattleOpponent_B !== 0) FlagSet(GetTrainerBFlag());
  FlagSet(GetTrainerAFlag());
}
// NON PORTÉ (volontaire) : `SetBattledTrainerFlag` (battle_setup.c:1252) est
// marqué UNUSED dans la décomp (hors graphe d'appels).

/** 1:1 décomp `HasTrainerBeenFought(trainerId)` (battle_setup.c:1257). */
export function HasTrainerBeenFought(trainerId: number): boolean {
  return !!FlagGet(TRAINER_FLAGS_START + trainerId);
}
/** 1:1 décomp `SetTrainerFlag(trainerId)` (battle_setup.c:1262). */
export function SetTrainerFlag(trainerId: number): void {
  FlagSet(TRAINER_FLAGS_START + trainerId);
}
/** 1:1 décomp `ClearTrainerFlag(trainerId)` (battle_setup.c:1267). */
export function ClearTrainerFlag(trainerId: number): void {
  const fc = (globalThis as Record<string, unknown>).__FlagClear as ((f: number) => void) | undefined;
  if (fc) fc(TRAINER_FLAGS_START + trainerId);
}

/** 1:1 décomp `DoTrainerBattle()` (battle_setup.c:459-465) :
 *  CreateBattleStartTask(GetTrainerBattleTransition(), 0) + stats + rematch update.
 *  Notre port : BattleSetup_StartTrainerBattle (battle-setup-helpers.ts:290, C5
 *  validé) = BATTLE_TYPE_TRAINER + sTrainerADefeatSpeech + bootDecompBattleLoop
 *  (transition + savedCallback retour OW). Stats/rematch = dette (cf. wild). */
export function DoTrainerBattle(): void {
  BattleSetup_StartTrainerBattle(sTrainerADefeatSpeech ?? undefined);
}

/** 1:1 décomp `CB2_EndTrainerBattle()` (battle_setup.c:1327-1349) — la partie
 *  POST-combat côté flags/match-call. Le retour OW + WhiteOut (defeated) sont
 *  gérés par le savedCallback du boot (battle-decomp-loop.ts:471-519, net-effect
 *  C4 committé) ; ici on applique le reste 1:1 : victoire (hors SECRET_BASE) →
 *  RegisterTrainerInMatchCall (dette T-B) + SetBattledTrainersFlags. */
export function CB2_EndTrainerBattle(): void {
  if (!IsPlayerDefeated(gBattleOutcome)) {
    // 1:1 :1345-1346 RegisterTrainerInMatchCall + SetBattledTrainersFlags.
    RegisterTrainerInMatchCall();
    SetBattledTrainersFlags();
  }
}

// ─── Speeches (battle_setup.c:1378-1438 + :1496-1540) ───────────────────────

/** 1:1 décomp `ReturnEmptyStringIfNull(string)` (battle_setup.c:1501-1508) :
 *  NULL → gText_EmptyString2 (le caller affiche une msgbox vide, pas de skip). */
function ReturnEmptyStringIfNull(label: string | null): string {
  return label === null ? 'gText_EmptyString2' : label;
}

/** 1:1 décomp `GetIntroSpeechOfApproachingTrainer()` (battle_setup.c:1509-1515) —
 *  hors trainer_see (=0) : speech A. (B = 2 approchants, dette trainer_see.) */
function GetIntroSpeechOfApproachingTrainer(): string {
  return gApproachingTrainerId === 0
    ? ReturnEmptyStringIfNull(sTrainerAIntroSpeech)
    : ReturnEmptyStringIfNull(sTrainerBIntroSpeech);
}

/** 1:1 décomp `GetTrainerCantBattleSpeech()` (battle_setup.c:1536 zone). */
function GetTrainerCantBattleSpeech(): string | null {
  return sTrainerCannotBattleSpeech;
}

/** 1:1 décomp `ShowTrainerIntroSpeech()` (battle_setup.c:1378-1402, chemin hors
 *  Pyramid/Hill) : ShowFieldMessage(GetIntroSpeechOfApproachingTrainer()). */
export function ShowTrainerIntroSpeech(): void {
  const label = GetIntroSpeechOfApproachingTrainer();
  const bytes = label ? getText(label) : undefined;
  if (bytes) ShowFieldMessage(bytes);
}

/** 1:1 décomp `ShowTrainerCantBattleSpeech()` (battle_setup.c:1435-1438). */
export function ShowTrainerCantBattleSpeech(): void {
  const label = GetTrainerCantBattleSpeech();
  const bytes = label ? getText(label) : undefined;
  if (bytes) ShowFieldMessage(bytes);
}

// ─── Post-battle scripts (battle_setup.c:1404-1433) ─────────────────────────

/** 1:1 décomp `BattleSetup_GetScriptAddrAfterBattle()` (battle_setup.c:1404-1410).
 *  Retourne la POSITION de reprise du script de map (sTrainerBattleEndScript) ;
 *  fallback EventScript_TestSignpostMsg (label). */
export function BattleSetup_GetScriptAddrAfterBattle(): ScriptPos | string {
  if (sTrainerBattleEndScript !== null) return sTrainerBattleEndScript;
  return 'EventScript_TestSignpostMsg';
}

/** 1:1 décomp `BattleSetup_GetTrainerPostBattleScript()` (battle_setup.c:1412-1433). */
export function BattleSetup_GetTrainerPostBattleScript(): string {
  if (sShouldCheckTrainerBScript) {
    sShouldCheckTrainerBScript = false;
    if (sTrainerBBattleScriptRetAddr !== null) {
      gWhichTrainerToFaceAfterBattle = 1;
      return sTrainerBBattleScriptRetAddr;
    }
  } else {
    if (sTrainerABattleScriptRetAddr !== null) {
      gWhichTrainerToFaceAfterBattle = 0;
      return sTrainerABattleScriptRetAddr;
    }
  }
  return 'EventScript_TryGetTrainerScript';
}

/** Partie 1:1 de `BattleSetup_StartTrainerBattle` (battle_setup.c:1313-1316) que
 *  notre boot (helpers) ne couvre pas : reset des compteurs trainer_see. Appelé
 *  par l'opcode dotrainerbattle avant le boot. */
export function _prepareTrainerBattleStart(): void {
  sNoOfPossibleTrainerRetScripts = gNoOfApproachingTrainers;
  void sNoOfPossibleTrainerRetScripts;
  sShouldCheckTrainerBScript = false;
  gWhichTrainerToFaceAfterBattle = 0;
}

// ─── Wires opcodes/scripts (consommés par script-opcodes-battle.ts) ─────────

/** Configure + jump vers le EventScript_* 1:1 (= `ctx->scriptPtr = Configure(...)`,
 *  scrcmd.c:1821-1825). Retourne false (le dispatcher continue sur le script jumpé). */
export function ScrCmd_trainerbattle(ctx: ScriptContext, rawArgs: string[]): boolean {
  const label = BattleSetup_ConfigureTrainerBattle(rawArgs, ctx);
  if (label) {
    const sc = getScript(label);
    if (sc) {
      ScriptJump(ctx, sc);
    } else {
      console.warn(`[battle_setup] script '${label}' introuvable — trainerbattle ignoré`);
    }
  }
  return false;
}

/** 1:1 décomp `ScrCmd_dotrainerbattle` (scrcmd.c:1827-1831) : DoTrainerBattle()
 *  + ScriptContext_Stop. Notre stop = SetupNativeScript qui poll la fin du combat
 *  (inBattle=false + outcome posé) PUIS applique CB2_EndTrainerBattle (flags). */
export function ScrCmd_dotrainerbattle(ctx: ScriptContext): boolean {
  setBattleOutcome(0);
  _prepareTrainerBattleStart();
  let booted = false;
  void ensureGTrainersLoaded().then(() => {
    DoTrainerBattle();
    booted = true;
  }).catch((e) => {
    console.warn('[battle_setup] gTrainers KO — combat dresseur annulé', e);
    booted = true;
  });
  SetupNativeScript(ctx, () => {
    if (!booted) return false;
    const inB = (globalThis as { __rt?: { gMain?: { inBattle?: boolean } } }).__rt?.gMain?.inBattle ?? false;
    if (inB || gBattleOutcome === 0) return false;
    CB2_EndTrainerBattle();
    return true;  // reprend le script (EventScript_DoTrainerBattle continue)
  });
  return true;
}

/** 1:1 décomp `ScrCmd_gotopostbattlescript` (scrcmd.c:1833-1837). */
export function ScrCmd_gotopostbattlescript(ctx: ScriptContext): boolean {
  const label = BattleSetup_GetTrainerPostBattleScript();
  const sc = getScript(label);
  if (sc) {
    ScriptJump(ctx, sc);
  } else {
    // EventScript_TryGetTrainerScript absent (std pas transpilé) → fin propre.
    StopScript(ctx);
  }
  return false;
}

/** 1:1 décomp `ScrCmd_gotobeatenscript` (scrcmd.c:1839-1843) : reprend le script
 *  de map à la position capturée (sTrainerBattleEndScript). */
export function ScrCmd_gotobeatenscript(ctx: ScriptContext): boolean {
  const r = BattleSetup_GetScriptAddrAfterBattle();
  if (typeof r === 'string') {
    const sc = getScript(r);
    if (sc) ScriptJump(ctx, sc);
    else StopScript(ctx);
  } else {
    ctx.scriptOpcodes = r.opcodes;
    ctx.scriptIdx = r.idx;
  }
  return false;
}

// ═════════════════════════════════════════════════════════════════════════════
// T-B REMATCHES — 1:1 battle_setup.c:253-346 (table) + :1351-1376 + :1546-1890.
// Déclenchement vanilla : per-step IncrementRematchStepCounter (overworld.c) +
// TryUpdateRandomTrainerRematches au chargement de map → trainerRematches[i]>0
// → scripts TRAINER_BATTLE_REMATCH (specialvar IsTrainerReadyForRematch +
// special BattleSetup_StartRematchBattle). Les fonctions et la table sont
// portées COMPLÈTES ; les 2 hooks OW sont exportés (câblage per-step/map-load
// = dette OW notée — sans eux les rematches ne s'arment jamais, comme un jeu
// sans badge 5 : chemin correct, gate fermée).
// ═════════════════════════════════════════════════════════════════════════════

import { gSaveBlock1Ptr } from '../engine/save/save-block-state';
import { MAX_REMATCH_ENTRIES } from '../engine/save/save-blocks';
import { Random } from '../engine/system/random';
import { ENUM_REMATCH_0 } from '../engine/decomp-data/include/constants/rematches-data';
import { TRAINER_REGISTERED_FLAGS_START } from '../engine/decomp-data/include/constants/flags-data';
import { MAP_CONSTANTS, MAP_GROUP, MAP_NUM } from '../engine/decomp-data/include/constants/map_groups-data';

/** 1:1 `REMATCHES_COUNT` (include/battle_setup.h:6). */
const REMATCHES_COUNT = 5;
/** 1:1 `REMATCH_TABLE_ENTRIES` (constants/rematches.h). */
const REMATCH_TABLE_ENTRIES = 78;
/** 1:1 `REMATCH_SPECIAL_TRAINER_START = REMATCH_WALLY_VR` (rematches.h). */
const REMATCH_SPECIAL_TRAINER_START = ENUM_REMATCH_0.REMATCH_WALLY_VR;
/** 1:1 `REMATCH_ELITE_FOUR_ENTRIES = REMATCH_SIDNEY` (rematches.h). */
const REMATCH_ELITE_FOUR_ENTRIES = ENUM_REMATCH_0.REMATCH_SIDNEY;
const REMATCH_WALLY_VR = ENUM_REMATCH_0.REMATCH_WALLY_VR;
/** 1:1 `STEP_COUNTER_MAX` (battle_setup.c:1795). */
const STEP_COUNTER_MAX = 255;

/** 1:1 `sBadgeFlags[NUM_BADGES]` (battle_setup.c:342-346). */
const sBadgeFlags: readonly string[] = [
  'FLAG_BADGE01_GET', 'FLAG_BADGE02_GET', 'FLAG_BADGE03_GET', 'FLAG_BADGE04_GET',
  'FLAG_BADGE05_GET', 'FLAG_BADGE06_GET', 'FLAG_BADGE07_GET', 'FLAG_BADGE08_GET',
];

/** 1:1 `struct RematchTrainer` (include/battle_setup.h) — labels décomp,
 *  résolus lazy en numérique (_rematchTable). */
interface RematchTrainerEntry { trainerIds: readonly string[]; map: string }

/** 1:1 `gRematchTable[REMATCH_TABLE_ENTRIES]` (battle_setup.c:260-339) —
 *  extraite par scripts/extract-rematch-table.cjs (78 entrées vérifiées). */
export const gRematchTable: readonly RematchTrainerEntry[] = [
  /* [REMATCH_ROSE] */ { trainerIds: ['TRAINER_ROSE_1', 'TRAINER_ROSE_2', 'TRAINER_ROSE_3', 'TRAINER_ROSE_4', 'TRAINER_ROSE_5'], map: 'MAP_ROUTE118' },
  /* [REMATCH_ANDRES] */ { trainerIds: ['TRAINER_ANDRES_1', 'TRAINER_ANDRES_2', 'TRAINER_ANDRES_3', 'TRAINER_ANDRES_4', 'TRAINER_ANDRES_5'], map: 'MAP_ROUTE105' },
  /* [REMATCH_DUSTY] */ { trainerIds: ['TRAINER_DUSTY_1', 'TRAINER_DUSTY_2', 'TRAINER_DUSTY_3', 'TRAINER_DUSTY_4', 'TRAINER_DUSTY_5'], map: 'MAP_ROUTE111' },
  /* [REMATCH_LOLA] */ { trainerIds: ['TRAINER_LOLA_1', 'TRAINER_LOLA_2', 'TRAINER_LOLA_3', 'TRAINER_LOLA_4', 'TRAINER_LOLA_5'], map: 'MAP_ROUTE109' },
  /* [REMATCH_RICKY] */ { trainerIds: ['TRAINER_RICKY_1', 'TRAINER_RICKY_2', 'TRAINER_RICKY_3', 'TRAINER_RICKY_4', 'TRAINER_RICKY_5'], map: 'MAP_ROUTE109' },
  /* [REMATCH_LILA_AND_ROY] */ { trainerIds: ['TRAINER_LILA_AND_ROY_1', 'TRAINER_LILA_AND_ROY_2', 'TRAINER_LILA_AND_ROY_3', 'TRAINER_LILA_AND_ROY_4', 'TRAINER_LILA_AND_ROY_5'], map: 'MAP_ROUTE124' },
  /* [REMATCH_CRISTIN] */ { trainerIds: ['TRAINER_CRISTIN_1', 'TRAINER_CRISTIN_2', 'TRAINER_CRISTIN_3', 'TRAINER_CRISTIN_4', 'TRAINER_CRISTIN_5'], map: 'MAP_ROUTE121' },
  /* [REMATCH_BROOKE] */ { trainerIds: ['TRAINER_BROOKE_1', 'TRAINER_BROOKE_2', 'TRAINER_BROOKE_3', 'TRAINER_BROOKE_4', 'TRAINER_BROOKE_5'], map: 'MAP_ROUTE111' },
  /* [REMATCH_WILTON] */ { trainerIds: ['TRAINER_WILTON_1', 'TRAINER_WILTON_2', 'TRAINER_WILTON_3', 'TRAINER_WILTON_4', 'TRAINER_WILTON_5'], map: 'MAP_ROUTE111' },
  /* [REMATCH_VALERIE] */ { trainerIds: ['TRAINER_VALERIE_1', 'TRAINER_VALERIE_2', 'TRAINER_VALERIE_3', 'TRAINER_VALERIE_4', 'TRAINER_VALERIE_5'], map: 'MAP_MT_PYRE_6F' },
  /* [REMATCH_CINDY] */ { trainerIds: ['TRAINER_CINDY_1', 'TRAINER_CINDY_3', 'TRAINER_CINDY_4', 'TRAINER_CINDY_5', 'TRAINER_CINDY_6'], map: 'MAP_ROUTE104' },
  /* [REMATCH_THALIA] */ { trainerIds: ['TRAINER_THALIA_1', 'TRAINER_THALIA_2', 'TRAINER_THALIA_3', 'TRAINER_THALIA_4', 'TRAINER_THALIA_5'], map: 'MAP_ABANDONED_SHIP_ROOMS_1F' },
  /* [REMATCH_JESSICA] */ { trainerIds: ['TRAINER_JESSICA_1', 'TRAINER_JESSICA_2', 'TRAINER_JESSICA_3', 'TRAINER_JESSICA_4', 'TRAINER_JESSICA_5'], map: 'MAP_ROUTE121' },
  /* [REMATCH_WINSTON] */ { trainerIds: ['TRAINER_WINSTON_1', 'TRAINER_WINSTON_2', 'TRAINER_WINSTON_3', 'TRAINER_WINSTON_4', 'TRAINER_WINSTON_5'], map: 'MAP_ROUTE104' },
  /* [REMATCH_STEVE] */ { trainerIds: ['TRAINER_STEVE_1', 'TRAINER_STEVE_2', 'TRAINER_STEVE_3', 'TRAINER_STEVE_4', 'TRAINER_STEVE_5'], map: 'MAP_ROUTE114' },
  /* [REMATCH_TONY] */ { trainerIds: ['TRAINER_TONY_1', 'TRAINER_TONY_2', 'TRAINER_TONY_3', 'TRAINER_TONY_4', 'TRAINER_TONY_5'], map: 'MAP_ROUTE107' },
  /* [REMATCH_NOB] */ { trainerIds: ['TRAINER_NOB_1', 'TRAINER_NOB_2', 'TRAINER_NOB_3', 'TRAINER_NOB_4', 'TRAINER_NOB_5'], map: 'MAP_ROUTE115' },
  /* [REMATCH_KOJI] */ { trainerIds: ['TRAINER_KOJI_1', 'TRAINER_KOJI_2', 'TRAINER_KOJI_3', 'TRAINER_KOJI_4', 'TRAINER_KOJI_5'], map: 'MAP_ROUTE127' },
  /* [REMATCH_FERNANDO] */ { trainerIds: ['TRAINER_FERNANDO_1', 'TRAINER_FERNANDO_2', 'TRAINER_FERNANDO_3', 'TRAINER_FERNANDO_4', 'TRAINER_FERNANDO_5'], map: 'MAP_ROUTE123' },
  /* [REMATCH_DALTON] */ { trainerIds: ['TRAINER_DALTON_1', 'TRAINER_DALTON_2', 'TRAINER_DALTON_3', 'TRAINER_DALTON_4', 'TRAINER_DALTON_5'], map: 'MAP_ROUTE118' },
  /* [REMATCH_BERNIE] */ { trainerIds: ['TRAINER_BERNIE_1', 'TRAINER_BERNIE_2', 'TRAINER_BERNIE_3', 'TRAINER_BERNIE_4', 'TRAINER_BERNIE_5'], map: 'MAP_ROUTE114' },
  /* [REMATCH_ETHAN] */ { trainerIds: ['TRAINER_ETHAN_1', 'TRAINER_ETHAN_2', 'TRAINER_ETHAN_3', 'TRAINER_ETHAN_4', 'TRAINER_ETHAN_5'], map: 'MAP_JAGGED_PASS' },
  /* [REMATCH_JOHN_AND_JAY] */ { trainerIds: ['TRAINER_JOHN_AND_JAY_1', 'TRAINER_JOHN_AND_JAY_2', 'TRAINER_JOHN_AND_JAY_3', 'TRAINER_JOHN_AND_JAY_4', 'TRAINER_JOHN_AND_JAY_5'], map: 'MAP_METEOR_FALLS_1F_2R' },
  /* [REMATCH_JEFFREY] */ { trainerIds: ['TRAINER_JEFFREY_1', 'TRAINER_JEFFREY_2', 'TRAINER_JEFFREY_3', 'TRAINER_JEFFREY_4', 'TRAINER_JEFFREY_5'], map: 'MAP_ROUTE120' },
  /* [REMATCH_CAMERON] */ { trainerIds: ['TRAINER_CAMERON_1', 'TRAINER_CAMERON_2', 'TRAINER_CAMERON_3', 'TRAINER_CAMERON_4', 'TRAINER_CAMERON_5'], map: 'MAP_ROUTE123' },
  /* [REMATCH_JACKI] */ { trainerIds: ['TRAINER_JACKI_1', 'TRAINER_JACKI_2', 'TRAINER_JACKI_3', 'TRAINER_JACKI_4', 'TRAINER_JACKI_5'], map: 'MAP_ROUTE123' },
  /* [REMATCH_WALTER] */ { trainerIds: ['TRAINER_WALTER_1', 'TRAINER_WALTER_2', 'TRAINER_WALTER_3', 'TRAINER_WALTER_4', 'TRAINER_WALTER_5'], map: 'MAP_ROUTE121' },
  /* [REMATCH_KAREN] */ { trainerIds: ['TRAINER_KAREN_1', 'TRAINER_KAREN_2', 'TRAINER_KAREN_3', 'TRAINER_KAREN_4', 'TRAINER_KAREN_5'], map: 'MAP_ROUTE116' },
  /* [REMATCH_JERRY] */ { trainerIds: ['TRAINER_JERRY_1', 'TRAINER_JERRY_2', 'TRAINER_JERRY_3', 'TRAINER_JERRY_4', 'TRAINER_JERRY_5'], map: 'MAP_ROUTE116' },
  /* [REMATCH_ANNA_AND_MEG] */ { trainerIds: ['TRAINER_ANNA_AND_MEG_1', 'TRAINER_ANNA_AND_MEG_2', 'TRAINER_ANNA_AND_MEG_3', 'TRAINER_ANNA_AND_MEG_4', 'TRAINER_ANNA_AND_MEG_5'], map: 'MAP_ROUTE117' },
  /* [REMATCH_ISABEL] */ { trainerIds: ['TRAINER_ISABEL_1', 'TRAINER_ISABEL_2', 'TRAINER_ISABEL_3', 'TRAINER_ISABEL_4', 'TRAINER_ISABEL_5'], map: 'MAP_ROUTE110' },
  /* [REMATCH_MIGUEL] */ { trainerIds: ['TRAINER_MIGUEL_1', 'TRAINER_MIGUEL_2', 'TRAINER_MIGUEL_3', 'TRAINER_MIGUEL_4', 'TRAINER_MIGUEL_5'], map: 'MAP_ROUTE103' },
  /* [REMATCH_TIMOTHY] */ { trainerIds: ['TRAINER_TIMOTHY_1', 'TRAINER_TIMOTHY_2', 'TRAINER_TIMOTHY_3', 'TRAINER_TIMOTHY_4', 'TRAINER_TIMOTHY_5'], map: 'MAP_ROUTE115' },
  /* [REMATCH_SHELBY] */ { trainerIds: ['TRAINER_SHELBY_1', 'TRAINER_SHELBY_2', 'TRAINER_SHELBY_3', 'TRAINER_SHELBY_4', 'TRAINER_SHELBY_5'], map: 'MAP_MT_CHIMNEY' },
  /* [REMATCH_CALVIN] */ { trainerIds: ['TRAINER_CALVIN_1', 'TRAINER_CALVIN_2', 'TRAINER_CALVIN_3', 'TRAINER_CALVIN_4', 'TRAINER_CALVIN_5'], map: 'MAP_ROUTE102' },
  /* [REMATCH_ELLIOT] */ { trainerIds: ['TRAINER_ELLIOT_1', 'TRAINER_ELLIOT_2', 'TRAINER_ELLIOT_3', 'TRAINER_ELLIOT_4', 'TRAINER_ELLIOT_5'], map: 'MAP_ROUTE106' },
  /* [REMATCH_ISAIAH] */ { trainerIds: ['TRAINER_ISAIAH_1', 'TRAINER_ISAIAH_2', 'TRAINER_ISAIAH_3', 'TRAINER_ISAIAH_4', 'TRAINER_ISAIAH_5'], map: 'MAP_ROUTE128' },
  /* [REMATCH_MARIA] */ { trainerIds: ['TRAINER_MARIA_1', 'TRAINER_MARIA_2', 'TRAINER_MARIA_3', 'TRAINER_MARIA_4', 'TRAINER_MARIA_5'], map: 'MAP_ROUTE117' },
  /* [REMATCH_ABIGAIL] */ { trainerIds: ['TRAINER_ABIGAIL_1', 'TRAINER_ABIGAIL_2', 'TRAINER_ABIGAIL_3', 'TRAINER_ABIGAIL_4', 'TRAINER_ABIGAIL_5'], map: 'MAP_ROUTE110' },
  /* [REMATCH_DYLAN] */ { trainerIds: ['TRAINER_DYLAN_1', 'TRAINER_DYLAN_2', 'TRAINER_DYLAN_3', 'TRAINER_DYLAN_4', 'TRAINER_DYLAN_5'], map: 'MAP_ROUTE117' },
  /* [REMATCH_KATELYN] */ { trainerIds: ['TRAINER_KATELYN_1', 'TRAINER_KATELYN_2', 'TRAINER_KATELYN_3', 'TRAINER_KATELYN_4', 'TRAINER_KATELYN_5'], map: 'MAP_ROUTE128' },
  /* [REMATCH_BENJAMIN] */ { trainerIds: ['TRAINER_BENJAMIN_1', 'TRAINER_BENJAMIN_2', 'TRAINER_BENJAMIN_3', 'TRAINER_BENJAMIN_4', 'TRAINER_BENJAMIN_5'], map: 'MAP_ROUTE110' },
  /* [REMATCH_PABLO] */ { trainerIds: ['TRAINER_PABLO_1', 'TRAINER_PABLO_2', 'TRAINER_PABLO_3', 'TRAINER_PABLO_4', 'TRAINER_PABLO_5'], map: 'MAP_ROUTE126' },
  /* [REMATCH_NICOLAS] */ { trainerIds: ['TRAINER_NICOLAS_1', 'TRAINER_NICOLAS_2', 'TRAINER_NICOLAS_3', 'TRAINER_NICOLAS_4', 'TRAINER_NICOLAS_5'], map: 'MAP_METEOR_FALLS_1F_2R' },
  /* [REMATCH_ROBERT] */ { trainerIds: ['TRAINER_ROBERT_1', 'TRAINER_ROBERT_2', 'TRAINER_ROBERT_3', 'TRAINER_ROBERT_4', 'TRAINER_ROBERT_5'], map: 'MAP_ROUTE120' },
  /* [REMATCH_LAO] */ { trainerIds: ['TRAINER_LAO_1', 'TRAINER_LAO_2', 'TRAINER_LAO_3', 'TRAINER_LAO_4', 'TRAINER_LAO_5'], map: 'MAP_ROUTE113' },
  /* [REMATCH_CYNDY] */ { trainerIds: ['TRAINER_CYNDY_1', 'TRAINER_CYNDY_2', 'TRAINER_CYNDY_3', 'TRAINER_CYNDY_4', 'TRAINER_CYNDY_5'], map: 'MAP_ROUTE115' },
  /* [REMATCH_MADELINE] */ { trainerIds: ['TRAINER_MADELINE_1', 'TRAINER_MADELINE_2', 'TRAINER_MADELINE_3', 'TRAINER_MADELINE_4', 'TRAINER_MADELINE_5'], map: 'MAP_ROUTE113' },
  /* [REMATCH_JENNY] */ { trainerIds: ['TRAINER_JENNY_1', 'TRAINER_JENNY_2', 'TRAINER_JENNY_3', 'TRAINER_JENNY_4', 'TRAINER_JENNY_5'], map: 'MAP_ROUTE124' },
  /* [REMATCH_DIANA] */ { trainerIds: ['TRAINER_DIANA_1', 'TRAINER_DIANA_2', 'TRAINER_DIANA_3', 'TRAINER_DIANA_4', 'TRAINER_DIANA_5'], map: 'MAP_JAGGED_PASS' },
  /* [REMATCH_AMY_AND_LIV] */ { trainerIds: ['TRAINER_AMY_AND_LIV_1', 'TRAINER_AMY_AND_LIV_2', 'TRAINER_AMY_AND_LIV_4', 'TRAINER_AMY_AND_LIV_5', 'TRAINER_AMY_AND_LIV_6'], map: 'MAP_ROUTE103' },
  /* [REMATCH_ERNEST] */ { trainerIds: ['TRAINER_ERNEST_1', 'TRAINER_ERNEST_2', 'TRAINER_ERNEST_3', 'TRAINER_ERNEST_4', 'TRAINER_ERNEST_5'], map: 'MAP_ROUTE125' },
  /* [REMATCH_CORY] */ { trainerIds: ['TRAINER_CORY_1', 'TRAINER_CORY_2', 'TRAINER_CORY_3', 'TRAINER_CORY_4', 'TRAINER_CORY_5'], map: 'MAP_ROUTE108' },
  /* [REMATCH_EDWIN] */ { trainerIds: ['TRAINER_EDWIN_1', 'TRAINER_EDWIN_2', 'TRAINER_EDWIN_3', 'TRAINER_EDWIN_4', 'TRAINER_EDWIN_5'], map: 'MAP_ROUTE110' },
  /* [REMATCH_LYDIA] */ { trainerIds: ['TRAINER_LYDIA_1', 'TRAINER_LYDIA_2', 'TRAINER_LYDIA_3', 'TRAINER_LYDIA_4', 'TRAINER_LYDIA_5'], map: 'MAP_ROUTE117' },
  /* [REMATCH_ISAAC] */ { trainerIds: ['TRAINER_ISAAC_1', 'TRAINER_ISAAC_2', 'TRAINER_ISAAC_3', 'TRAINER_ISAAC_4', 'TRAINER_ISAAC_5'], map: 'MAP_ROUTE117' },
  /* [REMATCH_GABRIELLE] */ { trainerIds: ['TRAINER_GABRIELLE_1', 'TRAINER_GABRIELLE_2', 'TRAINER_GABRIELLE_3', 'TRAINER_GABRIELLE_4', 'TRAINER_GABRIELLE_5'], map: 'MAP_MT_PYRE_3F' },
  /* [REMATCH_CATHERINE] */ { trainerIds: ['TRAINER_CATHERINE_1', 'TRAINER_CATHERINE_2', 'TRAINER_CATHERINE_3', 'TRAINER_CATHERINE_4', 'TRAINER_CATHERINE_5'], map: 'MAP_ROUTE119' },
  /* [REMATCH_JACKSON] */ { trainerIds: ['TRAINER_JACKSON_1', 'TRAINER_JACKSON_2', 'TRAINER_JACKSON_3', 'TRAINER_JACKSON_4', 'TRAINER_JACKSON_5'], map: 'MAP_ROUTE119' },
  /* [REMATCH_HALEY] */ { trainerIds: ['TRAINER_HALEY_1', 'TRAINER_HALEY_2', 'TRAINER_HALEY_3', 'TRAINER_HALEY_4', 'TRAINER_HALEY_5'], map: 'MAP_ROUTE104' },
  /* [REMATCH_JAMES] */ { trainerIds: ['TRAINER_JAMES_1', 'TRAINER_JAMES_2', 'TRAINER_JAMES_3', 'TRAINER_JAMES_4', 'TRAINER_JAMES_5'], map: 'MAP_PETALBURG_WOODS' },
  /* [REMATCH_TRENT] */ { trainerIds: ['TRAINER_TRENT_1', 'TRAINER_TRENT_2', 'TRAINER_TRENT_3', 'TRAINER_TRENT_4', 'TRAINER_TRENT_5'], map: 'MAP_ROUTE112' },
  /* [REMATCH_SAWYER] */ { trainerIds: ['TRAINER_SAWYER_1', 'TRAINER_SAWYER_2', 'TRAINER_SAWYER_3', 'TRAINER_SAWYER_4', 'TRAINER_SAWYER_5'], map: 'MAP_MT_CHIMNEY' },
  /* [REMATCH_KIRA_AND_DAN] */ { trainerIds: ['TRAINER_KIRA_AND_DAN_1', 'TRAINER_KIRA_AND_DAN_2', 'TRAINER_KIRA_AND_DAN_3', 'TRAINER_KIRA_AND_DAN_4', 'TRAINER_KIRA_AND_DAN_5'], map: 'MAP_ABANDONED_SHIP_ROOMS2_1F' },
  /* [REMATCH_WALLY_VR] */ { trainerIds: ['TRAINER_WALLY_VR_2', 'TRAINER_WALLY_VR_3', 'TRAINER_WALLY_VR_4', 'TRAINER_WALLY_VR_5', 'TRAINER_WALLY_VR_5'], map: 'MAP_VICTORY_ROAD_1F' },
  /* [REMATCH_ROXANNE] */ { trainerIds: ['TRAINER_ROXANNE_1', 'TRAINER_ROXANNE_2', 'TRAINER_ROXANNE_3', 'TRAINER_ROXANNE_4', 'TRAINER_ROXANNE_5'], map: 'MAP_RUSTBORO_CITY' },
  /* [REMATCH_BRAWLY] */ { trainerIds: ['TRAINER_BRAWLY_1', 'TRAINER_BRAWLY_2', 'TRAINER_BRAWLY_3', 'TRAINER_BRAWLY_4', 'TRAINER_BRAWLY_5'], map: 'MAP_DEWFORD_TOWN' },
  /* [REMATCH_WATTSON] */ { trainerIds: ['TRAINER_WATTSON_1', 'TRAINER_WATTSON_2', 'TRAINER_WATTSON_3', 'TRAINER_WATTSON_4', 'TRAINER_WATTSON_5'], map: 'MAP_MAUVILLE_CITY' },
  /* [REMATCH_FLANNERY] */ { trainerIds: ['TRAINER_FLANNERY_1', 'TRAINER_FLANNERY_2', 'TRAINER_FLANNERY_3', 'TRAINER_FLANNERY_4', 'TRAINER_FLANNERY_5'], map: 'MAP_LAVARIDGE_TOWN' },
  /* [REMATCH_NORMAN] */ { trainerIds: ['TRAINER_NORMAN_1', 'TRAINER_NORMAN_2', 'TRAINER_NORMAN_3', 'TRAINER_NORMAN_4', 'TRAINER_NORMAN_5'], map: 'MAP_PETALBURG_CITY' },
  /* [REMATCH_WINONA] */ { trainerIds: ['TRAINER_WINONA_1', 'TRAINER_WINONA_2', 'TRAINER_WINONA_3', 'TRAINER_WINONA_4', 'TRAINER_WINONA_5'], map: 'MAP_FORTREE_CITY' },
  /* [REMATCH_TATE_AND_LIZA] */ { trainerIds: ['TRAINER_TATE_AND_LIZA_1', 'TRAINER_TATE_AND_LIZA_2', 'TRAINER_TATE_AND_LIZA_3', 'TRAINER_TATE_AND_LIZA_4', 'TRAINER_TATE_AND_LIZA_5'], map: 'MAP_MOSSDEEP_CITY' },
  /* [REMATCH_JUAN] */ { trainerIds: ['TRAINER_JUAN_1', 'TRAINER_JUAN_2', 'TRAINER_JUAN_3', 'TRAINER_JUAN_4', 'TRAINER_JUAN_5'], map: 'MAP_SOOTOPOLIS_CITY' },
  /* [REMATCH_SIDNEY] */ { trainerIds: ['TRAINER_SIDNEY', 'TRAINER_SIDNEY', 'TRAINER_SIDNEY', 'TRAINER_SIDNEY', 'TRAINER_SIDNEY'], map: 'MAP_EVER_GRANDE_CITY' },
  /* [REMATCH_PHOEBE] */ { trainerIds: ['TRAINER_PHOEBE', 'TRAINER_PHOEBE', 'TRAINER_PHOEBE', 'TRAINER_PHOEBE', 'TRAINER_PHOEBE'], map: 'MAP_EVER_GRANDE_CITY' },
  /* [REMATCH_GLACIA] */ { trainerIds: ['TRAINER_GLACIA', 'TRAINER_GLACIA', 'TRAINER_GLACIA', 'TRAINER_GLACIA', 'TRAINER_GLACIA'], map: 'MAP_EVER_GRANDE_CITY' },
  /* [REMATCH_DRAKE] */ { trainerIds: ['TRAINER_DRAKE', 'TRAINER_DRAKE', 'TRAINER_DRAKE', 'TRAINER_DRAKE', 'TRAINER_DRAKE'], map: 'MAP_EVER_GRANDE_CITY' },
  /* [REMATCH_WALLACE] */ { trainerIds: ['TRAINER_WALLACE', 'TRAINER_WALLACE', 'TRAINER_WALLACE', 'TRAINER_WALLACE', 'TRAINER_WALLACE'], map: 'MAP_EVER_GRANDE_CITY' },
];

/** Entrée résolue en numérique (trainerIds via resolveTrainerNumId, map via
 *  MAP_CONSTANTS → group/num 1:1 MAP_GROUP/MAP_NUM). */
interface ResolvedRematch { trainerIds: number[]; mapGroup: number; mapNum: number }
let _rematchResolvedCache: ResolvedRematch[] | null = null;
function _rematchTable(): ResolvedRematch[] {
  if (_rematchResolvedCache) return _rematchResolvedCache;
  _rematchResolvedCache = gRematchTable.map((e) => {
    const mapConst = MAP_CONSTANTS[e.map] ?? 0xFFFF;
    return {
      trainerIds: e.trainerIds.map((t) => resolveTrainerNumId(t) & 0xFFFF),
      mapGroup: MAP_GROUP(mapConst),
      mapNum: MAP_NUM(mapConst),
    };
  });
  return _rematchResolvedCache;
}

/** 1:1 décomp `FirstBattleTrainerIdToRematchTableId(table, trainerId)` (:1546-1558). */
function FirstBattleTrainerIdToRematchTableId(table: ResolvedRematch[], trainerId: number): number {
  for (let i = 0; i < REMATCH_TABLE_ENTRIES; i++) {
    if (table[i].trainerIds[0] === trainerId) return i;
  }
  return -1;
}

/** 1:1 décomp `TrainerIdToRematchTableId(table, trainerId)` (:1559-1577). */
function TrainerIdToRematchTableId(table: ResolvedRematch[], trainerId: number): number {
  for (let i = 0; i < REMATCH_TABLE_ENTRIES; i++) {
    for (let j = 0; j < REMATCHES_COUNT; j++) {
      if (table[i].trainerIds[j] === 0) break;
      if (table[i].trainerIds[j] === trainerId) return i;
    }
  }
  return -1;
}

/** 1:1 décomp `IsRematchForbidden(rematchTableId)` (:1578-1587) — Elite Four
 *  toujours interdits ; Wally VR tant que FLAG_DEFEATED_WALLY_VICTORY_ROAD=0. */
function IsRematchForbidden(rematchTableId: number): boolean {
  if (rematchTableId >= REMATCH_ELITE_FOUR_ENTRIES) return true;
  if (rematchTableId === REMATCH_WALLY_VR) return !FlagGet('FLAG_DEFEATED_WALLY_VICTORY_ROAD');
  return false;
}

/** 1:1 décomp `SetRematchIdForTrainer(table, tableId)` (:1588-1604) — quirk
 *  vanilla : i sort de boucle à la 1re équipe non battue (ou id 0) et c'est CE
 *  i (1..5) qui est stocké. */
function SetRematchIdForTrainer(table: ResolvedRematch[], tableId: number): void {
  let i = 1;
  for (; i < REMATCHES_COUNT; i++) {
    const trainerId = table[tableId].trainerIds[i];
    if (trainerId === 0) break;
    if (!HasTrainerBeenFought(trainerId)) break;
  }
  gSaveBlock1Ptr.trainerRematches[tableId] = i;
}

/** 1:1 décomp `UpdateRandomTrainerRematches(table, mapGroup, mapNum)` (:1605-1630).
 *  Quirk vanilla : `<= REMATCH_SPECIAL_TRAINER_START` (inclut Wally VR) et
 *  `(Random() % 100) <= 30` = 31 % de chance. */
function UpdateRandomTrainerRematches(table: ResolvedRematch[], mapGroup: number, mapNum: number): boolean {
  let ret = false;
  for (let i = 0; i <= REMATCH_SPECIAL_TRAINER_START; i++) {
    if (table[i].mapGroup === mapGroup && table[i].mapNum === mapNum && !IsRematchForbidden(i)) {
      if (gSaveBlock1Ptr.trainerRematches[i] !== 0) {
        ret = true;
      } else if (FlagGet(TRAINER_REGISTERED_FLAGS_START + i) && (Random() % 100) <= 30) {
        SetRematchIdForTrainer(table, i);
        ret = true;
      }
    }
  }
  return ret;
}

/** 1:1 décomp `UpdateRematchIfDefeated(rematchTableId)` (:1631-1636). */
export function UpdateRematchIfDefeated(rematchTableId: number): void {
  if (HasTrainerBeenFought(_rematchTable()[rematchTableId].trainerIds[0])) {
    SetRematchIdForTrainer(_rematchTable(), rematchTableId);
  }
}

/** 1:1 décomp `DoesSomeoneWantRematchIn_(table, mapGroup, mapNum)` (:1637-1649). */
function DoesSomeoneWantRematchIn_(table: ResolvedRematch[], mapGroup: number, mapNum: number): boolean {
  for (let i = 0; i < REMATCH_TABLE_ENTRIES; i++) {
    if (table[i].mapGroup === mapGroup && table[i].mapNum === mapNum && gSaveBlock1Ptr.trainerRematches[i] !== 0) return true;
  }
  return false;
}

/** 1:1 décomp `IsRematchTrainerIn_(table, mapGroup, mapNum)` (:1650-1662). */
function IsRematchTrainerIn_(table: ResolvedRematch[], mapGroup: number, mapNum: number): boolean {
  for (let i = 0; i < REMATCH_TABLE_ENTRIES; i++) {
    if (table[i].mapGroup === mapGroup && table[i].mapNum === mapNum) return true;
  }
  return false;
}

/** 1:1 décomp `IsFirstTrainerIdReadyForRematch(table, firstBattleTrainerId)` (:1664-1675). */
function IsFirstTrainerIdReadyForRematch(table: ResolvedRematch[], firstBattleTrainerId: number): boolean {
  const tableId = FirstBattleTrainerIdToRematchTableId(table, firstBattleTrainerId);
  if (tableId === -1) return false;
  if (tableId >= MAX_REMATCH_ENTRIES) return false;
  if (gSaveBlock1Ptr.trainerRematches[tableId] === 0) return false;
  return true;
}

/** 1:1 décomp `IsTrainerReadyForRematch_(table, trainerId)` (:1677-1690). */
function IsTrainerReadyForRematch_(table: ResolvedRematch[], trainerId: number): boolean {
  const tableId = TrainerIdToRematchTableId(table, trainerId);
  if (tableId === -1) return false;
  if (tableId >= MAX_REMATCH_ENTRIES) return false;
  if (gSaveBlock1Ptr.trainerRematches[tableId] === 0) return false;
  return true;
}

/** 1:1 décomp `GetRematchTrainerIdFromTable(table, firstBattleTrainerId)` (:1691-1711) —
 *  quirk vanilla : retourne FALSE (=0) si pas d'entrée. */
function GetRematchTrainerIdFromTable(table: ResolvedRematch[], firstBattleTrainerId: number): number {
  const tableId = FirstBattleTrainerIdToRematchTableId(table, firstBattleTrainerId);
  if (tableId === -1) return 0;
  const trainerEntry = table[tableId];
  for (let i = 1; i < REMATCHES_COUNT; i++) {
    if (trainerEntry.trainerIds[i] === 0) return trainerEntry.trainerIds[i - 1];
    if (!HasTrainerBeenFought(trainerEntry.trainerIds[i])) return trainerEntry.trainerIds[i];
  }
  return trainerEntry.trainerIds[REMATCHES_COUNT - 1];
}

/** 1:1 décomp `GetLastBeatenRematchTrainerIdFromTable(table, firstBattleTrainerId)`
 *  (:1712-1732) — diffère du précédent : retourne ids[i-1] aussi quand ids[i]
 *  n'est PAS battu. */
function GetLastBeatenRematchTrainerIdFromTable(table: ResolvedRematch[], firstBattleTrainerId: number): number {
  const tableId = FirstBattleTrainerIdToRematchTableId(table, firstBattleTrainerId);
  if (tableId === -1) return 0;
  const trainerEntry = table[tableId];
  for (let i = 1; i < REMATCHES_COUNT; i++) {
    if (trainerEntry.trainerIds[i] === 0) return trainerEntry.trainerIds[i - 1];
    if (!HasTrainerBeenFought(trainerEntry.trainerIds[i])) return trainerEntry.trainerIds[i - 1];
  }
  return trainerEntry.trainerIds[REMATCHES_COUNT - 1];
}

/** 1:1 décomp `ClearTrainerWantRematchState(table, firstBattleTrainerId)` (:1733-1740). */
function ClearTrainerWantRematchState(table: ResolvedRematch[], firstBattleTrainerId: number): void {
  const tableId = TrainerIdToRematchTableId(table, firstBattleTrainerId);
  if (tableId !== -1) gSaveBlock1Ptr.trainerRematches[tableId] = 0;
}

/** 1:1 décomp `GetTrainerMatchCallFlag(trainerId)` (:1741-1753). */
function GetTrainerMatchCallFlag(trainerId: number): number {
  const table = _rematchTable();
  for (let i = 0; i < REMATCH_TABLE_ENTRIES; i++) {
    if (table[i].trainerIds[0] === trainerId) return TRAINER_REGISTERED_FLAGS_START + i;
  }
  return 0xFFFF;
}

/** 1:1 décomp `RegisterTrainerInMatchCall()` (:1754-1763). */
function RegisterTrainerInMatchCall(): void {
  if (FlagGet('FLAG_HAS_MATCH_CALL')) {
    const matchCallFlagId = GetTrainerMatchCallFlag(_trainerBattleOpponentA);
    if (matchCallFlagId !== 0xFFFF) FlagSet(matchCallFlagId);
  }
}

/** 1:1 décomp `WasSecondRematchWon(table, firstBattleTrainerId)` (:1765-1774). */
function WasSecondRematchWon(table: ResolvedRematch[], firstBattleTrainerId: number): boolean {
  const tableId = FirstBattleTrainerIdToRematchTableId(table, firstBattleTrainerId);
  if (tableId === -1) return false;
  if (!HasTrainerBeenFought(table[tableId].trainerIds[1])) return false;
  return true;
}

/** 1:1 décomp `HasAtLeastFiveBadges()` (:1776-1793). */
function HasAtLeastFiveBadges(): boolean {
  let count = 0;
  for (let i = 0; i < sBadgeFlags.length; i++) {
    if (FlagGet(sBadgeFlags[i])) {
      if (++count >= 5) return true;
    }
  }
  return false;
}

/** 1:1 décomp `IncrementRematchStepCounter()` (:1797-1807). Appelant décomp =
 *  overworld.c per-step — hook OW exporté (dette câblage per-step). */
export function IncrementRematchStepCounter(): void {
  if (HasAtLeastFiveBadges()) {
    if (gSaveBlock1Ptr.trainerRematchStepCounter >= STEP_COUNTER_MAX) {
      gSaveBlock1Ptr.trainerRematchStepCounter = STEP_COUNTER_MAX;
    } else {
      gSaveBlock1Ptr.trainerRematchStepCounter++;
    }
  }
}

/** 1:1 décomp `IsRematchStepCounterMaxed()` (:1805-1812). */
function IsRematchStepCounterMaxed(): boolean {
  return HasAtLeastFiveBadges() && gSaveBlock1Ptr.trainerRematchStepCounter >= STEP_COUNTER_MAX;
}

/** 1:1 décomp `TryUpdateRandomTrainerRematches(mapGroup, mapNum)` (:1813-1818).
 *  Appelant décomp = overworld.c au chargement de map — hook OW exporté. */
export function TryUpdateRandomTrainerRematches(mapGroup: number, mapNum: number): void {
  if (IsRematchStepCounterMaxed() && UpdateRandomTrainerRematches(_rematchTable(), mapGroup, mapNum)) {
    gSaveBlock1Ptr.trainerRematchStepCounter = 0;
  }
}

/** 1:1 décomp `DoesSomeoneWantRematchIn(mapGroup, mapNum)` (:1819-1823). */
export function DoesSomeoneWantRematchIn(mapGroup: number, mapNum: number): boolean {
  return DoesSomeoneWantRematchIn_(_rematchTable(), mapGroup, mapNum);
}

/** 1:1 décomp `IsRematchTrainerIn(mapGroup, mapNum)` (:1824-1828). */
export function IsRematchTrainerIn(mapGroup: number, mapNum: number): boolean {
  return IsRematchTrainerIn_(_rematchTable(), mapGroup, mapNum);
}

/** 1:1 décomp `GetRematchTrainerId(trainerId)` (:1829-1833). */
function GetRematchTrainerId(trainerId: number): number {
  return GetRematchTrainerIdFromTable(_rematchTable(), trainerId);
}

/** 1:1 décomp `GetLastBeatenRematchTrainerId(trainerId)` (:1834-1838) —
 *  consommé par match_call.c (Pokénav). */
export function GetLastBeatenRematchTrainerId(trainerId: number): number {
  return GetLastBeatenRematchTrainerIdFromTable(_rematchTable(), trainerId);
}

/** 1:1 décomp `ShouldTryRematchBattle()` (:1840-1846). */
export function ShouldTryRematchBattle(): boolean {
  if (IsFirstTrainerIdReadyForRematch(_rematchTable(), _trainerBattleOpponentA)) return true;
  return WasSecondRematchWon(_rematchTable(), _trainerBattleOpponentA);
}

/** 1:1 décomp `IsTrainerReadyForRematch()` (:1848-1851). */
export function IsTrainerReadyForRematch(): boolean {
  return IsTrainerReadyForRematch_(_rematchTable(), _trainerBattleOpponentA);
}

/** 1:1 décomp `HandleRematchVarsOnBattleEnd()` (:1852-1857) — quirk vanilla :
 *  SetBattledTrainersFlags est appelé ICI alors que CB2_EndRematchBattle l'a
 *  DÉJÀ appelé juste avant (flags posés deux fois, sans effet — reproduit). */
function HandleRematchVarsOnBattleEnd(): void {
  ClearTrainerWantRematchState(_rematchTable(), _trainerBattleOpponentA);
  SetBattledTrainersFlags();
}

/** 1:1 décomp `ShouldTryGetTrainerScript()` (:1859-1872). */
export function ShouldTryGetTrainerScript(): void {
  if (sNoOfPossibleTrainerRetScripts > 1) {
    sNoOfPossibleTrainerRetScripts = 0;
    sShouldCheckTrainerBScript = true;
    gSpecialVar.Result = 1;
  } else {
    sShouldCheckTrainerBScript = false;
    gSpecialVar.Result = 0;
  }
}

/** 1:1 décomp `CountBattledRematchTeams(trainerId)` (:1873-1890) — consommé
 *  par match_call.c. Quirk vanilla : trainerId indexe la TABLE (pas un trainer). */
export function CountBattledRematchTeams(trainerId: number): number {
  const table = _rematchTable();
  if (!HasTrainerBeenFought(table[trainerId].trainerIds[0])) return 0;
  let i = 1;
  for (; i < REMATCHES_COUNT; i++) {
    if (table[trainerId].trainerIds[i] === 0) break;
    if (!HasTrainerBeenFought(table[trainerId].trainerIds[i])) break;
  }
  return i;
}

/** 1:1 décomp `CB2_EndRematchBattle()` (battle_setup.c:1351-1369) — comme
 *  CB2_EndTrainerBattle, la partie retour-OW/WhiteOut vit dans le savedCallback
 *  du boot ; ici le reste 1:1 : victoire → match call + flags + rematch vars. */
export function CB2_EndRematchBattle(): void {
  if (!IsPlayerDefeated(gBattleOutcome)) {
    RegisterTrainerInMatchCall();
    SetBattledTrainersFlags();
    HandleRematchVarsOnBattleEnd();
  }
}

/** 1:1 décomp `BattleSetup_StartRematchBattle()` (battle_setup.c:1371-1376) :
 *  BATTLE_TYPE_TRAINER + savedCallback=CB2_EndRematchBattle + DoTrainerBattle +
 *  ScriptContext_Stop. Notre équivalent du Stop = le poll retourné (consommé
 *  par l'interception de l'opcode `special` → SetupNativeScript, qui suspend le
 *  script et le reprend à la fin du combat — 1:1 ContinueScript). */
export function _bootRematchBattleForScript(): () => boolean {
  setBattleOutcome(0);
  _prepareTrainerBattleStart();
  let booted = false;
  void ensureGTrainersLoaded().then(() => {
    DoTrainerBattle();
    booted = true;
  }).catch((e) => {
    console.warn('[battle_setup] gTrainers KO — rematch annulé', e);
    booted = true;
  });
  return () => {
    if (!booted) return false;
    const inB = (globalThis as { __rt?: { gMain?: { inBattle?: boolean } } }).__rt?.gMain?.inBattle ?? false;
    if (inB || gBattleOutcome === 0) return false;
    CB2_EndRematchBattle();
    return true;
  };
}

// ─── Specials 1:1 (remplacent les stubs de specials-registry) ───────────────

registerSpecial('GetTrainerBattleMode', () => GetTrainerBattleMode());
registerSpecial('ShowTrainerIntroSpeech', () => { ShowTrainerIntroSpeech(); });
registerSpecial('ShowTrainerCantBattleSpeech', () => { ShowTrainerCantBattleSpeech(); });
// 1:1 trainer_see.c TryPrepareSecondApproachingTrainer : trainer_see non porté
// (gNoOfApproachingTrainers=0) → FALSE (dette T-C).
registerSpecial('TryPrepareSecondApproachingTrainer', () => 0);
// T-B rematches (remplacent les stubs `() => 0` de specials-registry).
registerSpecial('IsTrainerReadyForRematch', () => (IsTrainerReadyForRematch() ? 1 : 0));
registerSpecial('ShouldTryRematchBattle', () => (ShouldTryRematchBattle() ? 1 : 0));
registerSpecial('ShouldTryGetTrainerScript', () => { ShouldTryGetTrainerScript(); });
// `BattleSetup_StartRematchBattle` = intercepté par l'opcode `special`
// (script-opcodes-special.ts) car il doit SUSPENDRE le script (ScriptContext_Stop)
// → consomme _bootRematchBattleForScript() via la surface __battleSetup.

// Devtools/debug. (__runEventScript = lancer un script de map par label, pour
// les A/B du flux dresseur sans marcher jusqu'au NPC.)
import { RunScriptImmediately as _RunScriptImmediately } from '../engine/script/script-runtime';
(globalThis as Record<string, unknown>).__runEventScript = (label: string): void => _RunScriptImmediately(label);
(globalThis as Record<string, unknown>).__battleSetup = {
  BattleSetup_ConfigureTrainerBattle, GetTrainerBattleMode, HasTrainerBeenFought,
  SetBattledTrainersFlags, BattleSetup_GetTrainerPostBattleScript,
  // T-B rematches (consommés par l'interception opcode special + match_call + OW hooks).
  _bootRematchBattleForScript, IsTrainerReadyForRematch, ShouldTryRematchBattle,
  DoesSomeoneWantRematchIn, IsRematchTrainerIn, GetLastBeatenRematchTrainerId,
  CountBattledRematchTeams, UpdateRematchIfDefeated,
  IncrementRematchStepCounter, TryUpdateRandomTrainerRematches,
  get sTrainerBattleMode() { return sTrainerBattleMode; },
  get sTrainerAIntroSpeech() { return sTrainerAIntroSpeech; },
  get sTrainerADefeatSpeech() { return sTrainerADefeatSpeech; },
  get sTrainerABattleScriptRetAddr() { return sTrainerABattleScriptRetAddr; },
  get sTrainerBattleEndScript() { return sTrainerBattleEndScript; },
  get opponentA() { return _trainerBattleOpponentA; },
};
