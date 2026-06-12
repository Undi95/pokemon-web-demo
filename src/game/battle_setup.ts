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
      // DETTE T-B : gTrainerBattleOpponent_A = GetRematchTrainerId(...) (:1140).
      return 'EventScript_TryDoDoubleRematchBattle';
    case TRAINER_BATTLE_REMATCH:
      TrainerBattleLoadArgs(sOrdinaryBattleParams, args, ctx);
      SetMapVarsToTrainer();
      // DETTE T-B : gTrainerBattleOpponent_A = GetRematchTrainerId(...) (:1145).
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
    // DETTE T-B : RegisterTrainerInMatchCall() (battle_setup.c:1345).
    SetBattledTrainersFlags();
  }
}

// ─── Speeches (battle_setup.c:1378-1438 + :1496-1540) ───────────────────────

/** 1:1 décomp `GetIntroSpeechOfApproachingTrainer()` — hors trainer_see (=0) :
 *  speech A. (B = 2 approchants, dette trainer_see.) */
function GetIntroSpeechOfApproachingTrainer(): string | null {
  return gApproachingTrainerId === 0 ? sTrainerAIntroSpeech : sTrainerBIntroSpeech;
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

// ─── Specials 1:1 (remplacent les stubs de specials-registry) ───────────────

registerSpecial('GetTrainerBattleMode', () => GetTrainerBattleMode());
registerSpecial('ShowTrainerIntroSpeech', () => { ShowTrainerIntroSpeech(); });
registerSpecial('ShowTrainerCantBattleSpeech', () => { ShowTrainerCantBattleSpeech(); });
// 1:1 trainer_see.c TryPrepareSecondApproachingTrainer : trainer_see non porté
// (gNoOfApproachingTrainers=0) → FALSE (dette T-C).
registerSpecial('TryPrepareSecondApproachingTrainer', () => 0);

// Devtools/debug. (__runEventScript = lancer un script de map par label, pour
// les A/B du flux dresseur sans marcher jusqu'au NPC.)
import { RunScriptImmediately as _RunScriptImmediately } from '../engine/script/script-runtime';
(globalThis as Record<string, unknown>).__runEventScript = (label: string): void => _RunScriptImmediately(label);
(globalThis as Record<string, unknown>).__battleSetup = {
  BattleSetup_ConfigureTrainerBattle, GetTrainerBattleMode, HasTrainerBeenFought,
  SetBattledTrainersFlags, BattleSetup_GetTrainerPostBattleScript,
  get sTrainerBattleMode() { return sTrainerBattleMode; },
  get sTrainerAIntroSpeech() { return sTrainerAIntroSpeech; },
  get sTrainerADefeatSpeech() { return sTrainerADefeatSpeech; },
  get sTrainerABattleScriptRetAddr() { return sTrainerABattleScriptRetAddr; },
  get sTrainerBattleEndScript() { return sTrainerBattleEndScript; },
  get opponentA() { return _trainerBattleOpponentA; },
};
