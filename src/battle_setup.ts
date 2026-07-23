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
  getText,
  getScriptImage, ScriptContext_SetupScript, LockPlayerFieldControls,
  type Opcode,
} from './script';
import { registerSpecial, makeByteVmTrainerArgSourceFromCursor } from './scrcmd';
import {
  TRAINER_ENCOUNTER_MUSIC_MALE, TRAINER_ENCOUNTER_MUSIC_FEMALE, TRAINER_ENCOUNTER_MUSIC_GIRL,
  TRAINER_ENCOUNTER_MUSIC_INTENSE, TRAINER_ENCOUNTER_MUSIC_COOL, TRAINER_ENCOUNTER_MUSIC_AQUA,
  TRAINER_ENCOUNTER_MUSIC_MAGMA, TRAINER_ENCOUNTER_MUSIC_SWIMMER, TRAINER_ENCOUNTER_MUSIC_TWINS,
  TRAINER_ENCOUNTER_MUSIC_ELITE_FOUR, TRAINER_ENCOUNTER_MUSIC_HIKER, TRAINER_ENCOUNTER_MUSIC_INTERVIEWER,
  TRAINER_ENCOUNTER_MUSIC_RICH,
} from '../include/constants/trainers';
import {
  MUS_ENCOUNTER_MALE, MUS_ENCOUNTER_FEMALE, MUS_ENCOUNTER_GIRL, MUS_ENCOUNTER_INTENSE,
  MUS_ENCOUNTER_COOL, MUS_ENCOUNTER_AQUA, MUS_ENCOUNTER_MAGMA, MUS_ENCOUNTER_SWIMMER,
  MUS_ENCOUNTER_TWINS, MUS_ENCOUNTER_ELITE_FOUR, MUS_ENCOUNTER_HIKER, MUS_ENCOUNTER_INTERVIEWER,
  MUS_ENCOUNTER_RICH, MUS_ENCOUNTER_SUSPICIOUS,
} from '../include/constants/songs';
import { FlagSet, FlagClear, FlagGet, gSpecialVar, gSelectedObjectEvent } from './engine/script/script-vars';
import { parseValue } from './scrcmd';
import { ShowFieldMessage } from './field_message_box';
import { resolveTrainerNumId, ensureGTrainersLoaded } from './engine/battle/battle-trainer-data-bridge';
import {
  setTrainerBattleOpponentA, setTrainerBattleOpponentB, setBattleOutcome, gBattleOutcome,
} from './engine/battle/state';
import { IncrementGameStat, GetGameStat } from './field_player_avatar';
import { GAME_STAT_TOTAL_BATTLES, GAME_STAT_WILD_BATTLES, GAME_STAT_TRAINER_BATTLES } from '../include/constants/game_stat';
import { UpdateGymLeaderRematch } from './gym_leader_rematch';

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
// Contexte de script PARSÉ — scaffolding trainer_see LOCAL à ce module (résidu du moteur
// parsé : makeStringArgSource capture la position {opcodes, idx} du script appelant). Le
// `ScriptContext` 1:1 (forme byte-VM scriptPtr) vit dans script.ts ; celui-ci est distinct.
type ScriptContext = { scriptOpcodes: Opcode[] | null; scriptIdx: number };
/** Pointeur de continuation côté byte-VM (curseur image globale {buf, off}).
 *  sTrainerBattleEndScript / *BattleScriptRetAddr peuvent tenir CETTE forme (byte-VM)
 *  OU ScriptPos (moteur parsé) OU string (label) — un seul moteur actif à la fois. */
type BvScriptPtr = { buf: Uint8Array; off: number };
type TrainerContinuation = string | ScriptPos | BvScriptPtr | null;
type TrainerVarKey =
  | 'sTrainerBattleMode' | 'gTrainerBattleOpponent_A' | 'gTrainerBattleOpponent_B'
  | 'sTrainerObjectEventLocalId'
  | 'sTrainerAIntroSpeech' | 'sTrainerBIntroSpeech'
  | 'sTrainerADefeatSpeech' | 'sTrainerBDefeatSpeech'
  | 'sTrainerVictorySpeech' | 'sTrainerCannotBattleSpeech'
  | 'sTrainerABattleScriptRetAddr' | 'sTrainerBBattleScriptRetAddr'
  | 'sTrainerBattleEndScript';

let sTrainerBattleMode = 0;
/** 1:1 décomp `gPartnerTrainerId` (battle_setup.c:97) — multi/partner, dette. */
export let gPartnerTrainerId = 0;
let sTrainerObjectEventLocalId = 0;
let sTrainerAIntroSpeech: string | null = null;
let sTrainerBIntroSpeech: string | null = null;
let sTrainerADefeatSpeech: string | null = null;
let sTrainerBDefeatSpeech: string | null = null;
let sTrainerVictorySpeech: string | null = null;
let sTrainerCannotBattleSpeech: string | null = null;
let sTrainerBattleEndScript: TrainerContinuation = null;
let sTrainerABattleScriptRetAddr: TrainerContinuation = null;
let sTrainerBBattleScriptRetAddr: TrainerContinuation = null;
let sShouldCheckTrainerBScript = false;
let sNoOfPossibleTrainerRetScripts = 0;
/** Pont trainer_see (module propriétaire de gApproachingTrainers/gApproachingTrainerId/
 *  gNoOfApproachingTrainers/gWhichTrainerToFaceAfterBattle). Posé par trainer_see au
 *  chargement (import trainer_see→battle_setup ; le sens inverse passe par ce pont
 *  globalThis pour casser le cycle ESM). */
interface TrainerSeeBridge {
  GetNoOfApproachingTrainers(): number;
  GetApproachingTrainerId(): number;
  GetApproachingTrainerObjectEventId(i: number): number;
  GetApproachingTrainerScriptOff(i: number): number;
  DidTrainerApproachPlayer(): boolean;
  SetWhichTrainerToFaceAfterBattle(v: number): void;
}
function _trainerSee(): TrainerSeeBridge | undefined {
  return (globalThis as { __trainerSee?: TrainerSeeBridge }).__trainerSee;
}
/** 1:1 décomp `gApproachingTrainerId` (trainer_see.c). Lu via le pont (0 tant que
 *  trainer_see n'a rien peuplé). */
function gApproachingTrainerId_(): number { return _trainerSee()?.GetApproachingTrainerId() ?? 0; }
/** 1:1 décomp `gNoOfApproachingTrainers` (trainer_see.c). */
function gNoOfApproachingTrainers_(): number { return _trainerSee()?.GetNoOfApproachingTrainers() ?? 0; }
/** 1:1 décomp `gWhichTrainerToFaceAfterBattle` (trainer_see.c:56 = module propriétaire).
 *  battle_setup l'ÉCRIT (comme la décomp) via le pont ; trainer_see le lit dans
 *  PlayerFaceTrainerAfterBattle. */
function setWhichTrainerToFaceAfterBattle_(v: number): void {
  _trainerSee()?.SetWhichTrainerToFaceAfterBattle(v);
}

/** Miroir local de gTrainerBattleOpponent_A (la canonique vit dans state.ts via
 *  setTrainerBattleOpponentA — GetTrainerFlag de specials-registry la lit par
 *  __battleStateMutators). On garde une copie lisible ici pour GetTrainerAFlag. */
let _trainerBattleOpponentA = 0;
/** Miroir local de gTrainerBattleOpponent_B (canonique = state.ts, écrite via
 *  setTrainerBattleOpponentB). Copie lisible ici pour GetTrainerBFlag /
 *  SetBattledTrainersFlags — même schéma que _A (1:1 : ces 2 globals vivent
 *  ensemble dans battle_setup.c ; le moteur combat lit state.ts). */
let _trainerBattleOpponentB = 0;

// ─── SetU8/SetU16/SetU32/SetPtr 1:1 décomp :1039-1057 (varPtr → varKey) ─────
function SetU8(key: TrainerVarKey, value: number): void { _setVar(key, value & 0xFF); }
function SetU16(key: TrainerVarKey, value: number): void { _setVar(key, value & 0xFFFF); }
function SetU32(key: TrainerVarKey, value: number): void { _setVar(key, value >>> 0); }
function SetPtr(key: TrainerVarKey, value: TrainerContinuation): void { _setVar(key, value); }

function _setVar(key: TrainerVarKey, value: number | TrainerContinuation): void {
  switch (key) {
    case 'sTrainerBattleMode': sTrainerBattleMode = value as number; break;
    case 'gTrainerBattleOpponent_A':
      _trainerBattleOpponentA = value as number;
      setTrainerBattleOpponentA(value as number);
      break;
    case 'gTrainerBattleOpponent_B':
      _trainerBattleOpponentB = value as number;
      setTrainerBattleOpponentB(value as number);
      break;
    case 'sTrainerObjectEventLocalId': sTrainerObjectEventLocalId = value as number; break;
    case 'sTrainerAIntroSpeech': sTrainerAIntroSpeech = value as string | null; break;
    case 'sTrainerBIntroSpeech': sTrainerBIntroSpeech = value as string | null; break;
    case 'sTrainerADefeatSpeech': sTrainerADefeatSpeech = value as string | null; break;
    case 'sTrainerBDefeatSpeech': sTrainerBDefeatSpeech = value as string | null; break;
    case 'sTrainerVictorySpeech': sTrainerVictorySpeech = value as string | null; break;
    case 'sTrainerCannotBattleSpeech': sTrainerCannotBattleSpeech = value as string | null; break;
    case 'sTrainerABattleScriptRetAddr': sTrainerABattleScriptRetAddr = value as TrainerContinuation; break;
    case 'sTrainerBBattleScriptRetAddr': sTrainerBBattleScriptRetAddr = value as TrainerContinuation; break;
    case 'sTrainerBattleEndScript': sTrainerBattleEndScript = value as TrainerContinuation; break;
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

/** Source d'args trainerbattle (VOIE A) : abstrait le flux d'args pour que LE MOTEUR
 *  PARSÉ (string[]) ET LE BYTE-VM (curseur binaire) partagent les MÊMES tables byType
 *  + le MÊME switch de modes. u8/u16 consomment une valeur ; ptr32 = speech (label) ou
 *  ret-addr-script (continuation) selon la clé ; retAddr capture la reprise sans consommer. */
export interface TrainerArgSource {
  u8(): number;
  u16(key: TrainerVarKey): number;
  ptr32(key: TrainerVarKey): TrainerContinuation;
  retAddr(): TrainerContinuation;
}

/** 1:1 décomp `TrainerBattleLoadArgs(specs, data)` (battle_setup.c:1059-1092).
 *  LOAD_* consomme une valeur de la source, CLEAR_* n'en consomme pas,
 *  LOAD_SCRIPT_RET_ADDR capture la position de reprise puis RETURN. */
function TrainerBattleLoadArgs(specs: TrainerBattleParameter[], src: TrainerArgSource): void {
  for (const spec of specs) {
    switch (spec.ptrType) {
      case TRAINER_PARAM_LOAD_VAL_8BIT:  SetU8(spec.varKey, src.u8() & 0xFF); break;
      case TRAINER_PARAM_LOAD_VAL_16BIT: SetU16(spec.varKey, src.u16(spec.varKey)); break;
      case TRAINER_PARAM_LOAD_VAL_32BIT: SetPtr(spec.varKey, src.ptr32(spec.varKey)); break;
      case TRAINER_PARAM_CLEAR_VAL_8BIT:  SetU8(spec.varKey, 0); break;
      case TRAINER_PARAM_CLEAR_VAL_16BIT: SetU16(spec.varKey, 0); break;
      case TRAINER_PARAM_CLEAR_VAL_32BIT: SetPtr(spec.varKey, null); break;
      case TRAINER_PARAM_LOAD_SCRIPT_RET_ADDR: SetPtr(spec.varKey, src.retAddr()); return;
    }
  }
}

/** Source string[] (moteur parsé) — 1:1 de l'ancien comportement (resolveTrainerNumId
 *  pour l'opposant, labels strings pour les ptr, {opcodes,idx} pour la reprise). */
function makeStringArgSource(args: string[], ctx: ScriptContext): TrainerArgSource {
  let i = 0;
  return {
    u8: () => parseValue(args[i++] ?? '0') & 0xFF,
    u16: (key) => (key === 'gTrainerBattleOpponent_A' || key === 'gTrainerBattleOpponent_B')
      ? resolveTrainerNumId(args[i++] ?? '0') & 0xFFFF
      : parseValue(args[i++] ?? '0') & 0xFFFF,
    ptr32: () => { const a = args[i++]; return a && a !== '0' && a !== 'NULL' ? a : null; },
    retAddr: () => (ctx.scriptOpcodes ? { opcodes: ctx.scriptOpcodes, idx: ctx.scriptIdx } : null),
  };
}

// ─── Helpers 1:1 ─────────────────────────────────────────────────────────────

/** 1:1 décomp `GetTrainerAFlag()` (battle_setup.c:984). */
function GetTrainerAFlag(): number { return TRAINER_FLAGS_START + _trainerBattleOpponentA; }
/** 1:1 décomp `GetTrainerBFlag()` (battle_setup.c:989). */
export function GetTrainerBFlag(): number { return TRAINER_FLAGS_START + _trainerBattleOpponentB; }

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
  if (gApproachingTrainerId_() === 0) {
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
 *  Retourne le LABEL du EventScript_* à exécuter (ou null pour SET_TRAINER_A/B).
 *  @body-parity-ok wrapper vers configureTrainerBattleCore (:389), switch modes complet */
export function BattleSetup_ConfigureTrainerBattle(args: string[], ctx: ScriptContext): string | null {
  return configureTrainerBattleCore(parseValue(args[0] ?? '0') & 0xFF, makeStringArgSource(args, ctx));
}

/** Cœur 1:1 `BattleSetup_ConfigureTrainerBattle` (battle_setup.c:1103) — VOIE A :
 *  prend le MODE (déjà peeké) + une TrainerArgSource (string[] parsé OU curseur byte-VM).
 *  Renvoie le LABEL du EventScript_* à exécuter (ou null pour SET_TRAINER_A/B). */
export function configureTrainerBattleCore(mode: number, src: TrainerArgSource): string | null {
  InitTrainerBattleVariables();
  sTrainerBattleMode = mode;

  // Préchargement : gTrainers/parties (async) prêt avant dotrainerbattle.
  void ensureGTrainersLoaded().catch(() => { /* warn au boot si KO */ });

  switch (sTrainerBattleMode) {
    case TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT:
      TrainerBattleLoadArgs(sOrdinaryNoIntroBattleParams, src);
      return 'EventScript_DoNoIntroTrainerBattle';
    case TRAINER_BATTLE_DOUBLE:
      TrainerBattleLoadArgs(sDoubleBattleParams, src);
      SetMapVarsToTrainer();
      return 'EventScript_TryDoDoubleTrainerBattle';
    case TRAINER_BATTLE_CONTINUE_SCRIPT:
      if (gApproachingTrainerId_() === 0) {
        TrainerBattleLoadArgs(sContinueScriptBattleParams, src);
        SetMapVarsToTrainer();
      } else {
        TrainerBattleLoadArgs(sTrainerBContinueScriptBattleParams, src);
      }
      return 'EventScript_TryDoNormalTrainerBattle';
    case TRAINER_BATTLE_CONTINUE_SCRIPT_NO_MUSIC:
      TrainerBattleLoadArgs(sContinueScriptBattleParams, src);
      SetMapVarsToTrainer();
      return 'EventScript_TryDoNormalTrainerBattle';
    case TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE:
    case TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE_NO_MUSIC:
      TrainerBattleLoadArgs(sContinueScriptDoubleBattleParams, src);
      SetMapVarsToTrainer();
      return 'EventScript_TryDoDoubleTrainerBattle';
    case TRAINER_BATTLE_REMATCH_DOUBLE:
      TrainerBattleLoadArgs(sDoubleBattleParams, src);
      SetMapVarsToTrainer();
      // 1:1 :1140 gTrainerBattleOpponent_A = GetRematchTrainerId(gTrainerBattleOpponent_A).
      _setVar('gTrainerBattleOpponent_A', GetRematchTrainerId(_trainerBattleOpponentA));
      return 'EventScript_TryDoDoubleRematchBattle';
    case TRAINER_BATTLE_REMATCH:
      TrainerBattleLoadArgs(sOrdinaryBattleParams, src);
      SetMapVarsToTrainer();
      // 1:1 :1145 gTrainerBattleOpponent_A = GetRematchTrainerId(gTrainerBattleOpponent_A).
      _setVar('gTrainerBattleOpponent_A', GetRematchTrainerId(_trainerBattleOpponentA));
      return 'EventScript_TryDoRematchBattle';
    case TRAINER_BATTLE_SET_TRAINER_A:
      TrainerBattleLoadArgs(sOrdinaryBattleParams, src);
      return null;
    case TRAINER_BATTLE_SET_TRAINER_B:
      TrainerBattleLoadArgs(sTrainerBOrdinaryBattleParams, src);
      return null;
    // TRAINER_BATTLE_PYRAMID / TRAINER_BATTLE_HILL : frontier, dette T-C (:1147-1178).
    default:
      if (gApproachingTrainerId_() === 0) {
        TrainerBattleLoadArgs(sOrdinaryBattleParams, src);
        SetMapVarsToTrainer();
      } else {
        TrainerBattleLoadArgs(sTrainerBOrdinaryBattleParams, src);
      }
      return 'EventScript_TryDoNormalTrainerBattle';
  }
}

/** 1:1 décomp `GetTrainerBattleMode()` (battle_setup.c:1230). */
export function GetTrainerBattleMode(): number { return sTrainerBattleMode; }

/** 1:1 décomp `SetBattledTrainersFlags()` (battle_setup.c:1245-1250). */
export function SetBattledTrainersFlags(): void {
  if (_trainerBattleOpponentB !== 0) FlagSet(GetTrainerBFlag());
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
/** 1:1 décomp `ClearTrainerFlag(trainerId)` (battle_setup.c:1267) :
 *    `FlagClear(TRAINER_FLAGS_START + trainerId);`
 *  FIX : utilisait un hook `__FlagClear` JAMAIS câblé → `if (fc)` no-op silencieux
 *  (le flag dresseur n'était jamais effacé, ≠ SetTrainerFlag qui marche via FlagSet).
 *  Maintenant FlagClear importé (même module que FlagSet), cohérent + 1:1. */
export function ClearTrainerFlag(trainerId: number): void {
  FlagClear(TRAINER_FLAGS_START + trainerId);
}

/** 1:1 décomp `static void TryUpdateGymLeaderRematchFromWild(void)` (battle_setup.c:956-960). */
export function TryUpdateGymLeaderRematchFromWild(): void {
  if (GetGameStat(GAME_STAT_WILD_BATTLES) % 60 === 0)
    UpdateGymLeaderRematch();
}

/** Hook stats+rematch des combats sauvages (1:1 battle_setup.c:415-418/:495-498 :
 *  IncrementGameStat TOTAL/WILD + TryUpdateGymLeaderRematchFromWild). Pont
 *  globalThis : battle-setup-helpers/wild_encounter ne peuvent pas importer
 *  battle_setup (cycle scrcmd ⇄ battle_setup, cf. leçon P2.3).
 *  IncrementDailyWildBattles = 1:1 :417 (dette TV soldée). */
export function WildBattleStatsHook(): void {
  IncrementGameStat(GAME_STAT_TOTAL_BATTLES);
  IncrementGameStat(GAME_STAT_WILD_BATTLES);
  IncrementDailyWildBattles();
  TryUpdateGymLeaderRematchFromWild();
}
(globalThis as Record<string, unknown>).__WildBattleStatsHook = WildBattleStatsHook;

/** 1:1 décomp `static void TryUpdateGymLeaderRematchFromTrainer(void)` (battle_setup.c:962-966). */
export function TryUpdateGymLeaderRematchFromTrainer(): void {
  if (GetGameStat(GAME_STAT_TRAINER_BATTLES) % 20 === 0)
    UpdateGymLeaderRematch();
}

/** 1:1 décomp `DoTrainerBattle()` (battle_setup.c:459-465) :
 *  CreateBattleStartTask(GetTrainerBattleTransition(), 0) + stats + rematch update.
 *  Notre port : BattleSetup_StartTrainerBattle (battle-setup-helpers.ts:290, C5
 *  validé) = BATTLE_TYPE_TRAINER + sTrainerADefeatSpeech + bootDecompBattleLoop
 *  (transition + savedCallback retour OW). Stats + rematch payés 1:1 (:462-464). */
export function DoTrainerBattle(): void {
  BattleSetup_StartTrainerBattle(sTrainerADefeatSpeech ?? undefined);
  IncrementGameStat(GAME_STAT_TOTAL_BATTLES);
  IncrementGameStat(GAME_STAT_TRAINER_BATTLES);
  TryUpdateGymLeaderRematchFromTrainer();
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
  return gApproachingTrainerId_() === 0
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
export function BattleSetup_GetScriptAddrAfterBattle(): string | ScriptPos | BvScriptPtr {
  if (sTrainerBattleEndScript !== null) return sTrainerBattleEndScript;
  return 'EventScript_TestSignpostMsg';
}

/** 1:1 décomp `BattleSetup_GetTrainerPostBattleScript()` (battle_setup.c:1412-1433). */
export function BattleSetup_GetTrainerPostBattleScript(): string | ScriptPos | BvScriptPtr {
  if (sShouldCheckTrainerBScript) {
    sShouldCheckTrainerBScript = false;
    if (sTrainerBBattleScriptRetAddr !== null) {
      setWhichTrainerToFaceAfterBattle_(1);
      return sTrainerBBattleScriptRetAddr;
    }
  } else {
    if (sTrainerABattleScriptRetAddr !== null) {
      setWhichTrainerToFaceAfterBattle_(0);
      return sTrainerABattleScriptRetAddr;
    }
  }
  return 'EventScript_TryGetTrainerScript';
}

/** Partie 1:1 de `BattleSetup_StartTrainerBattle` (battle_setup.c:1313-1316) que
 *  notre boot (helpers) ne couvre pas : reset des compteurs trainer_see. Appelé
 *  par l'opcode dotrainerbattle avant le boot. */
export function _prepareTrainerBattleStart(): void {
  sNoOfPossibleTrainerRetScripts = gNoOfApproachingTrainers_();
  void sNoOfPossibleTrainerRetScripts;
  sShouldCheckTrainerBScript = false;
  setWhichTrainerToFaceAfterBattle_(0);
}

// ─── Lancement combat dresseur (voie A, partagé avec le byte-VM) ────────────

/** VOIE A : lancement combat dresseur partagé. Lance DoTrainerBattle (async, après
 *  ensureGTrainersLoaded) et renvoie le poll natif (true = combat fini + CB2_EndTrainerBattle
 *  appliqué). Le byte-VM l'enveloppe dans son SetupNativeScript (cf scrcmd_bytevm.ts). */
export function startTrainerBattleAndGetPoll(): () => boolean {
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
  return () => {
    if (!booted) return false;
    const inB = (globalThis as { __rt?: { gMain?: { inBattle?: boolean } } }).__rt?.gMain?.inBattle ?? false;
    if (inB || gBattleOutcome === 0) return false;
    CB2_EndTrainerBattle();
    return true;  // reprend le script (EventScript_DoTrainerBattle continue)
  };
}

// (handlers parsés ScrCmd_dotrainerbattle/gotopostbattlescript/gotobeatenscript
//  retirés au clean byte-VM — le byte-VM a les siens dans scrcmd_bytevm.ts ; les
//  accesseurs partagés BattleSetup_GetTrainerPostBattleScript / GetScriptAddrAfterBattle
//  restent, lus par le byte-VM.)

// ─── T-C : approche dresseur (callers = trainer_see.c, non porté) ───────────

/** Lit `gObjectEvents[id].localId` via le pont globalThis (évite un import direct
 *  event_object_movement → battle_setup, réservé au flux talk). */
function _objectEventLocalId(id: number): number {
  const arr = (globalThis as { __gObjectEvents?: Array<{ localId: number }> }).__gObjectEvents;
  return arr?.[id]?.localId ?? id;
}

/** Curseur binaire sur l'image de scripts positionné sur l'opcode `trainerbattle`
 *  d'un dresseur (= le pointeur ROM `trainerScript` décomp). `+1` saute l'opcode
 *  pour atteindre le mode (= `trainerScript + 1` décomp que BattleSetup_ConfigureTrainerBattle
 *  reçoit). L'offset -1 (script absent) → source vide → mode 0. */
function _configureTrainerBattleFromScriptOffset(scriptOff: number): string | null {
  const img = getScriptImage();
  if (scriptOff < 0) return configureTrainerBattleCore(0, makeByteVmTrainerArgSourceFromCursor({ buf: img, off: img.length }));
  const mode = img[scriptOff + 1]; // peek mode (= *(trainerScript + 1))
  // Curseur sur les args : APRÈS le mode byte (LoadArgs consomme mode via u8() en premier).
  return configureTrainerBattleCore(mode, makeByteVmTrainerArgSourceFromCursor({ buf: img, off: scriptOff + 1 }));
}

/** 1:1 décomp `ConfigureAndSetUpOneTrainerBattle(trainerObjEventId, trainerScript)`
 *  (battle_setup.c:1193-1200). Forme byte-VM : `trainerScript` = offset de l'opcode
 *  `trainerbattle` dans l'image. Configure le combat + arme EventScript_StartTrainerApproach
 *  + verrouille les contrôles field (= le dresseur approche puis engage). */
export function ConfigureAndSetUpOneTrainerBattle(trainerObjEventId: number, scriptOff: number): void {
  gSelectedObjectEvent.index = trainerObjEventId;
  gSpecialVar.LastTalked = _objectEventLocalId(trainerObjEventId);
  _configureTrainerBattleFromScriptOffset(scriptOff);
  ScriptContext_SetupScript('EventScript_StartTrainerApproach');
  LockPlayerFieldControls();
}

/** 1:1 décomp `ConfigureTwoTrainersBattle(trainerObjEventId, trainerScript)`
 *  (battle_setup.c:1202-1208). Forme byte-VM (offset image). */
export function ConfigureTwoTrainersBattle(trainerObjEventId: number, scriptOff: number): void {
  gSelectedObjectEvent.index = trainerObjEventId;
  gSpecialVar.LastTalked = _objectEventLocalId(trainerObjEventId);
  _configureTrainerBattleFromScriptOffset(scriptOff);
}

/** 1:1 décomp `SetUpTwoTrainersBattle()` (battle_setup.c:1209-1214) :
 *  ScriptContext_SetupScript(EventScript_StartTrainerApproach) + lock. */
export function SetUpTwoTrainersBattle(): void {
  ScriptContext_SetupScript('EventScript_StartTrainerApproach');
  LockPlayerFieldControls();
}

// Pont anti-cycle (P2.3) : trainer_see appelle ces 4 setups d'aggro au RUNTIME uniquement.
// L'import statique trainer_see→battle_setup tirait tout le sous-arbre combat/shop/mail dans
// l'init précoce de decomp-globals (via field_effect→trainer_see) → TDZ en cascade
// (MALE, RGB_WHITE…). battle_setup reste chargé au boot (field_control_avatar l'importe),
// donc ce pont est posé avant tout appel runtime. Arrows → fns hoistées.
(globalThis as Record<string, unknown>).__battleSetupAggro = {
  ResetTrainerOpponentIds: () => ResetTrainerOpponentIds(),
  ConfigureAndSetUpOneTrainerBattle: (o: number, s: number) => ConfigureAndSetUpOneTrainerBattle(o, s),
  ConfigureTwoTrainersBattle: (o: number, s: number) => ConfigureTwoTrainersBattle(o, s),
  SetUpTwoTrainersBattle: () => SetUpTwoTrainersBattle(),
};

/** 1:1 décomp `GetTrainerFlagFromScriptPointer(data)` (battle_setup.c:1215-1223) :
 *  `TrainerBattleLoadArg16(data + 2)` = trainer u16 à off+2 (opcode+mode) → flag battu.
 *  Forme byte-VM (offset image). */
export function GetTrainerFlagFromScriptPointer(scriptOff: number): boolean {
  if (scriptOff < 0) return false;
  const img = getScriptImage();
  const flag = (img[scriptOff + 2] | (img[scriptOff + 3] << 8)) & 0xFFFF;
  return FlagGet(TRAINER_FLAGS_START + flag);
}

/** 1:1 décomp `PlayTrainerEncounterMusic(void)` (battle_setup.c:1440). Route la
 *  musique de rencontre selon `GetTrainerEncounterMusicId` (= encounterMusic_gender &
 *  0x7F du dresseur). PlayNewMapMusic via le pont globalThis (sound.ts). */
export function PlayTrainerEncounterMusic(): void {
  const trainerId = gApproachingTrainerId_() === 0 ? _trainerBattleOpponentA : _trainerBattleOpponentB;

  if (sTrainerBattleMode !== TRAINER_BATTLE_CONTINUE_SCRIPT_NO_MUSIC
   && sTrainerBattleMode !== TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE_NO_MUSIC) {
    let music: number;
    switch (_GetTrainerEncounterMusicId(trainerId)) {
      case TRAINER_ENCOUNTER_MUSIC_MALE:        music = MUS_ENCOUNTER_MALE; break;
      case TRAINER_ENCOUNTER_MUSIC_FEMALE:      music = MUS_ENCOUNTER_FEMALE; break;
      case TRAINER_ENCOUNTER_MUSIC_GIRL:        music = MUS_ENCOUNTER_GIRL; break;
      case TRAINER_ENCOUNTER_MUSIC_INTENSE:     music = MUS_ENCOUNTER_INTENSE; break;
      case TRAINER_ENCOUNTER_MUSIC_COOL:        music = MUS_ENCOUNTER_COOL; break;
      case TRAINER_ENCOUNTER_MUSIC_AQUA:        music = MUS_ENCOUNTER_AQUA; break;
      case TRAINER_ENCOUNTER_MUSIC_MAGMA:       music = MUS_ENCOUNTER_MAGMA; break;
      case TRAINER_ENCOUNTER_MUSIC_SWIMMER:     music = MUS_ENCOUNTER_SWIMMER; break;
      case TRAINER_ENCOUNTER_MUSIC_TWINS:       music = MUS_ENCOUNTER_TWINS; break;
      case TRAINER_ENCOUNTER_MUSIC_ELITE_FOUR:  music = MUS_ENCOUNTER_ELITE_FOUR; break;
      case TRAINER_ENCOUNTER_MUSIC_HIKER:       music = MUS_ENCOUNTER_HIKER; break;
      case TRAINER_ENCOUNTER_MUSIC_INTERVIEWER: music = MUS_ENCOUNTER_INTERVIEWER; break;
      case TRAINER_ENCOUNTER_MUSIC_RICH:        music = MUS_ENCOUNTER_RICH; break;
      default:                                  music = MUS_ENCOUNTER_SUSPICIOUS;
    }
    const g = globalThis as { PlayNewMapMusic?: (songNum: number) => void };
    g.PlayNewMapMusic?.(music);
  }
}

/** 1:1 décomp `GetTrainerEncounterMusicId(trainerId)` (pokemon.c:5855) = branche
 *  `TRAINER_ENCOUNTER_MUSIC(trainerId)` = `gTrainers[id].encounterMusic_gender & 0x7F`
 *  (hors Pyramid/Hill). Lit __gTrainers (battle-trainer-data-bridge).
 *  ⚠️ DÉPENDANCE : le bridge ne peuple actuellement que le bit gender (0x80) de
 *  encounterMusic_gender, pas l'id de musique (bits 0-6) → renvoie 0 (MALE) pour tous
 *  tant que le bridge n'aura pas mappé la string encounterMusic → id. Le routage
 *  ci-dessus est 1:1 ; la valeur exacte suivra l'enrichissement du bridge. */
function _GetTrainerEncounterMusicId(trainerId: number): number {
  const t = (globalThis as { __gTrainers?: Record<number, { encounterMusic_gender: number }> }).__gTrainers?.[trainerId];
  return (t?.encounterMusic_gender ?? 0) & 0x7F;
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

import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { MAX_REMATCH_ENTRIES } from './engine/save/save-blocks';
import { Random } from './random';
import { ENUM_REMATCH_0 } from '../include/constants/rematches';
import { TRAINER_REGISTERED_FLAGS_START } from '../include/constants/flags';
import { MAP_CONSTANTS, MAP_GROUP, MAP_NUM } from '../include/constants/map_groups';

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
 *  MAP_CONSTANTS → group/num 1:1 MAP_GROUP/MAP_NUM). Exporté pour les autres
 *  consommateurs de gRematchTable (gym_leader_rematch.ts). */
interface ResolvedRematch { trainerIds: number[]; mapGroup: number; mapNum: number }
let _rematchResolvedCache: ResolvedRematch[] | null = null;
export function _rematchTable(): ResolvedRematch[] {
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
// 1:1 battle_setup.c:1440 PlayTrainerEncounterMusic — porté (routage song table).
registerSpecial('PlayTrainerEncounterMusic', () => { PlayTrainerEncounterMusic(); });
// 1:1 trainer_see.c:666 TryPrepareSecondApproachingTrainer — porté (trainer_see.ts),
// routé via le pont globalThis (cycle ESM trainer_see↔battle_setup).
registerSpecial('TryPrepareSecondApproachingTrainer', () => {
  (globalThis as { __trainerSee?: { TryPrepareSecondApproachingTrainer?: () => void } })
    .__trainerSee?.TryPrepareSecondApproachingTrainer?.();
  return 0;
});
// T-B rematches (remplacent les stubs `() => 0` de specials-registry).
registerSpecial('IsTrainerReadyForRematch', () => (IsTrainerReadyForRematch() ? 1 : 0));
registerSpecial('ShouldTryRematchBattle', () => (ShouldTryRematchBattle() ? 1 : 0));
registerSpecial('ShouldTryGetTrainerScript', () => { ShouldTryGetTrainerScript(); });
// `BattleSetup_StartRematchBattle` = intercepté par l'opcode `special`
// (script-opcodes-special.ts) car il doit SUSPENDRE le script (ScriptContext_Stop)
// → consomme _bootRematchBattleForScript() via la surface __battleSetup.

// Devtools/debug. (__runEventScript = lancer un script de map par label, pour
// les A/B du flux dresseur sans marcher jusqu'au NPC.)
import { RunScriptImmediately as _RunScriptImmediately } from './script';
import { IncrementDailyWildBattles } from './tv';
(globalThis as Record<string, unknown>).__runEventScript = (label: string): void => _RunScriptImmediately(label);
(globalThis as Record<string, unknown>).__battleSetup = {
  BattleSetup_ConfigureTrainerBattle, GetTrainerBattleMode, HasTrainerBeenFought,
  SetBattledTrainersFlags, BattleSetup_GetTrainerPostBattleScript,
  // T-C approche dresseur (callers trainer_see = dette).
  ConfigureTwoTrainersBattle, SetUpTwoTrainersBattle, GetTrainerFlagFromScriptPointer,
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


// ─── Ex-engine/battle/battle-setup-helpers.ts (unification lot 8b) ──────────
// Tout ce bloc = battle_setup.c 1:1 (CreateScriptedWildMon :243, StartScripted
// WildBattle :489, CB2_StartFirstBattle :930, StartTrainerBattle :1272,
// GetTrainerALoseText :1517, GetEnvironmentId :636, transitions :696-861).
import { setBattleTypeFlags as _setBattleTypeFlags_BSH } from './engine/battle/state';
import {
  BATTLE_TYPE_FIRST_BATTLE as _BATTLE_TYPE_FIRST_BATTLE_BSH,
  BATTLE_TYPE_TRAINER as _BATTLE_TYPE_TRAINER_BSH,
} from '../include/battle';
import {
  MetatileBehavior_IsTallGrass as _MB_IsTallGrass_BSH,
  MetatileBehavior_IsLongGrass as _MB_IsLongGrass_BSH,
  MetatileBehavior_IsSandOrDeepSand as _MB_IsSandOrDeepSand_BSH,
  MetatileBehavior_IsIndoorEncounter as _MB_IsIndoorEncounter_BSH,
  MetatileBehavior_IsSurfableWaterOrUnderwater as _MB_IsSurfableWaterOrUnderwater_BSH,
  MetatileBehavior_IsDeepOrOceanWater as _MB_IsDeepOrOceanWater_BSH,
  MetatileBehavior_IsMountain as _MB_IsMountain_BSH,
  MetatileBehavior_GetBridgeType as _MB_GetBridgeType_BSH,
  MetatileBehavior_IsBridgeOverWater as _MB_IsBridgeOverWater_BSH,
} from './metatile_behavior';
import { TestPlayerAvatarFlags as _TestPlayerAvatarFlags_BSH } from './field_player_avatar';
import { PLAYER_AVATAR_FLAG_SURFING as _PLAYER_AVATAR_FLAG_SURFING_BSH } from '../include/global.fieldmap';
import { GetSavedWeather as _GetSavedWeather_BSH } from './field_weather_effect';
import { WEATHER_SANDSTORM as _WEATHER_SANDSTORM_BSH } from '../include/constants/weather';
import {
  GetMonData as _GetMonData_BSH, SetMonData as _SetMonData_BSH,
  createEmptyPokemon as _createEmptyPokemon_BSH, CreateMon as _CreateMon_BSH,
  gPlayerParty as _gPlayerParty_BSH, gEnemyParty as _gEnemyParty_BSH,
  PARTY_SIZE as _PARTY_SIZE_BSH, setupEnemyPartyForBattle as _setupEnemyPartyForBattle_BSH,
} from './engine/battle/party-storage';
import { resolveDecompConstant as _resolveDecompConstant_BSH } from '../harness/runtime/decomp-constants';
import { bootDecompBattleLoop as _bootDecompBattleLoop_BSH } from './engine/battle/battle-decomp-loop';
import { StringExpandPlaceholders as _StringExpandPlaceholders_BSH } from './string_util';
import { getText as _getText_BSH } from './script';
import { ENUM_B_1 as _B_TRANSITION_BSH } from '../include/battle_transition';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

// (SPECIES_ZIGZAGOON importé du leaf species-data ci-dessus = 288. L'ancien
//  hardcode local `= 287` était FAUX : 287 = SPECIES_MIGHTYENA → la tuto Birch
//  spawnait un Médhyéna au lieu d'un Zigzaton. Décomp species.h:294 = 288.)

/** 1:1 décomp `OT_ID_PLAYER_ID` = 0 (= utilise gSaveBlock2Ptr->playerTrainerId). */
const OT_ID_PLAYER_ID = 0;

/** 1:1 décomp `USE_RANDOM_IVS` (pokemon.c) = MAX_PER_STAT_IVS + 1 = 32. */
const USE_RANDOM_IVS = 32;

/** 1:1 décomp `BATTLE_ENVIRONMENT_*` (constants/battle.h). */
export const BATTLE_ENVIRONMENT_GRASS = 0;
export const BATTLE_ENVIRONMENT_LONG_GRASS = 1;
export const BATTLE_ENVIRONMENT_SAND = 2;
export const BATTLE_ENVIRONMENT_UNDERWATER = 3;
export const BATTLE_ENVIRONMENT_WATER = 4;
export const BATTLE_ENVIRONMENT_POND = 5;
export const BATTLE_ENVIRONMENT_MOUNTAIN = 6;
export const BATTLE_ENVIRONMENT_CAVE = 7;
export const BATTLE_ENVIRONMENT_BUILDING = 8;
export const BATTLE_ENVIRONMENT_PLAIN = 9;

/** 1:1 décomp `MAP_TYPE_*` (constants/map_types.h). */
const MAP_TYPE_TOWN = 1;
const MAP_TYPE_CITY = 2;
const MAP_TYPE_ROUTE = 3;
const MAP_TYPE_UNDERGROUND = 4;
const MAP_TYPE_UNDERWATER = 5;
const MAP_TYPE_OCEAN_ROUTE = 6;
const MAP_TYPE_UNKNOWN = 7;
const MAP_TYPE_INDOOR = 8;
const MAP_TYPE_SECRET_BASE = 9;

/** 1:1 décomp `MON_DATA_HELD_ITEM` = 22. */
const MON_DATA_HELD_ITEM = 22;

// ─── Scripted wild battle (battle_setup.c + scrcmd.c) — DORMANT (#suppr voie V) ──
// Port strict 1:1 des entrees scripted-wild de la voie L. DORMANT : pas encore
// cable aux opcodes setwildbattle/dowildbattle (le flip + A/B = etape suivante,
// cf. [[voie-v-suppression-plan]] GAP-3). Additif -> 0 regression.

/** 1:1 décomp `CreateScriptedWildMon(u16 species, u8 level, u16 item)` (battle_setup.c).
 *  ZeroEnemyPartyMons + CreateMon(&_gEnemyParty_BSH[0], species, level, USE_RANDOM_IVS,...) +
 *  (si item) SetMonData(MON_DATA_HELD_ITEM, item). Notre port : `setupEnemyPartyForBattle`
 *  zéro gEnemyParty puis remplit le slot 0 avec un mon PLEIN (createPokemonInstance =
 *  CreateMon 1:1, stats/moves/IVs réels — PAS le _CreateMon simplifié de Birch).
 *  Appelé par ScrCmd_setwildbattle (scrcmd.c:1869). */
export function CreateScriptedWildMon(species: number, level: number, item: number): void {
  // 1:1 décomp : ZeroEnemyPartyMons + CreateMon(&_gEnemyParty_BSH[0], species, level, USE_RANDOM_IVS,
  // FALSE, 0, OT_ID_PLAYER_ID, 0) + (si item) SetMonData(MON_DATA_HELD_ITEM, item). species/item
  // sont déjà NUMÉRIQUES (u16) → CreateMon numérique direct, plus de détour PokemonInstance.
  const mon = _createEmptyPokemon_BSH();
  _CreateMon_BSH(mon, species, level, 32 /* USE_RANDOM_IVS */, false, 0, 0 /* OT_ID_PLAYER_ID */, 0);
  if (item) _SetMonData_BSH(mon, MON_DATA_HELD_ITEM, item);
  _setupEnemyPartyForBattle_BSH([mon]);
}

/** 1:1 décomp `BattleSetup_StartScriptedWildBattle(void)` (battle_setup.c:489-499).
 *  LockPlayerFieldControls + `gMain.savedCallback = CB2_EndScriptedWildBattle` +
 *  `gBattleTypeFlags = 0` + `CreateBattleStartTask(GetWildBattleTransition(), 0)` +
 *  IncrementGameStat(TOTAL/WILD) + IncrementDailyWildBattles + TryUpdateGymLeaderRematchFromWild.
 *  Notre port : `_bootDecompBattleLoop_BSH(true)` = CreateBattleStartTask (transition d'entrée)
 *  + PlayBattleBGM + swap CB2_InitBattle + retour OW (= équivalent du savedCallback). La
 *  CONTINUATION du script (CB2_EndScriptedWildBattle → CB2_ReturnToFieldContinueScript) est
 *  assurée par le poll `SetupNativeScript` du caller ScrCmd_dowildbattle (qui reprend le
 *  script quand la scène combat rend la main), 1:1 le `ScriptContext_Stop()` de scrcmd.c:1882.
 *  Appelé par ScrCmd_dowildbattle (scrcmd.c:1879). _gEnemyParty_BSH[0] déjà posé par CreateScriptedWildMon. */
export function BattleSetup_StartScriptedWildBattle(): void {
  // 1:1 décomp l.493 : `gBattleTypeFlags = 0` (overwrite — combat sauvage scripté pur).
  _setBattleTypeFlags_BSH(0);
  // 1:1 décomp l.494 : CreateBattleStartTask(GetWildBattleTransition(), 0) + (l.407 modèle)
  // gMain.savedCallback = retour OW. _bootDecompBattleLoop_BSH(true) encapsule les deux (1:1 CreateWildMon).
  _bootDecompBattleLoop_BSH(true);
  // 1:1 l.495-498 : stats TOTAL/WILD + TryUpdateGymLeaderRematchFromWild — pont
  // globalThis posé par battle_setup.ts (cycle scrcmd ⇄ battle_setup interdit).
  // (IncrementDailyWildBattles = dette TV wave.)
  ((globalThis as Record<string, unknown>).__WildBattleStatsHook as (() => void) | undefined)?.();
}

/** 1:1 décomp `CB2_StartFirstBattle` (battle_setup.c:930-948) — entrée du 1er combat
 *  (tutoriel Birch, Zigzagoon Lv2). `gBattleTypeFlags = BATTLE_TYPE_FIRST_BATTLE` +
 *  `gMain.savedCallback = CB2_EndFirstBattle` + `SetMainCallback2(CB2_InitBattle)`.
 *  L'ennemi Zigzagoon est spawné par SetUpBattleVarsAndBirchZigzagoon (appelé dans le boot
 *  CB2_InitBattleInternal, gate FIRST_BATTLE). Notre port : setBattleTypeFlags +
 *  _bootDecompBattleLoop_BSH(true) (= CreateBattleStartTask + swap CB2_InitBattle + retour OW).
 *  Remplace la voie V `startBirchTutorialBattle` (suppression voie V). DETTE 1:1 : la
 *  transition décomp est B_TRANSITION_BLUR (CB2_GiveStarter) ; bootDecompBattleLoop fait
 *  un fallback SLICE (transitions visuelles pas toutes portées). */
export function StartFirstBattle(): void {
  _setBattleTypeFlags_BSH(_BATTLE_TYPE_FIRST_BATTLE_BSH >>> 0);
  _bootDecompBattleLoop_BSH(true);
}

/** 1:1 décomp `BattleSetup_StartTrainerBattle` (battle_setup.c:1272-1325) — single, hors
 *  frontier/hill. `gBattleTypeFlags = BATTLE_TYPE_TRAINER` + `gMain.savedCallback =
 *  CB2_EndTrainerBattle` + `DoTrainerBattle` (459 = CreateBattleStartTask(GetTrainerBattleTransition,0))
 *  + `ScriptContext_Stop`. Voie L : `gTrainerBattleOpponent_A` déjà posé par le caller ;
 *  `CreateNPCTrainerParty` est appelé À L'INIT (CB2_InitBattleInternal, battle_main.ts:836) →
 *  peuple gEnemyParty. `_bootDecompBattleLoop_BSH(true)` = CreateBattleStartTask + swap CB2_InitBattle
 *  + retour OW. DETTE 1:1 : IncrementGameStat(TOTAL/TRAINER_BATTLES) + TryUpdateGymLeaderRematchFromTrainer
 *  (stats) + GetTrainerBattleTransition (transition spécifique → fallback SLICE) — non portés. */
// 1:1 décomp battle_setup.c:102 (EWRAM `sTrainerADefeatSpeech`) — lose_text du macro
// trainerbattle (bytes charmap, deja encodes). NULL -> "" (gText_EmptyString2).
// Adaptation : le LABEL (string du macro trainerbattle) vit dans
// sTrainerADefeatSpeech (:121, système TrainerBattleLoadArgs) ; ICI = les BYTES
// charmap résolus au start (décomp : une seule var `const u8 *`, fusion = dette).
let sTrainerADefeatSpeechBytes: Uint8Array | null = null;
export function setTrainerADefeatSpeech(s: Uint8Array | null): void { sTrainerADefeatSpeechBytes = s; }
export function getTrainerADefeatSpeech(): Uint8Array | null { return sTrainerADefeatSpeechBytes; }

/** 1:1 décomp `GetTrainerALoseText` (battle_setup.c:1517-1528, hors SECRET_BASE non géré voie L) :
 *  `string = sTrainerADefeatSpeech; StringExpandPlaceholders(gStringVar4, string); return gStringVar4;`
 *  ⚠️ StringExpandPlaceholders ECRIT dans `out` et RETOURNE le pointeur AVANCE (pas le buffer) ->
 *  on retourne `out` (= gStringVar4), pas le retour de l'appel. */
export function GetTrainerALoseText(): Uint8Array {
  const out = new Uint8Array(256);
  _StringExpandPlaceholders_BSH(out, sTrainerADefeatSpeechBytes ?? new Uint8Array([0xFF]));
  return out;
}

export function BattleSetup_StartTrainerBattle(defeatTextLabel?: string): void {
  _setBattleTypeFlags_BSH(_BATTLE_TYPE_TRAINER_BSH >>> 0);
  // 1:1 battle_setup.c:168 (TrainerBattleLoadArgs charge sTrainerADefeatSpeech depuis le lose_text
  // du macro). getText(label) = bytes charmap, undefined si absent -> null.
  setTrainerADefeatSpeech(defeatTextLabel ? (_getText_BSH(defeatTextLabel) ?? null) : null);
  _bootDecompBattleLoop_BSH(true);
}

// ─── BattleSetup_GetEnvironmentId (battle_setup.c:636) ─────────────────────

/** E1 wire 1:1 strict : `PlayerGetDestCoords` (field_player_avatar.c) lit
 *  gObjectEvents[playerObjId].currentCoords (= coords INTERNAL avec MAP_OFFSET).
 *  Lazy lookup via globalThis.__gObjectEvents pour éviter cycle ESM avec
 *  player-avatar/object-events (= hubs field). */
function _PlayerGetDestCoords(): { x: number; y: number } {
  const oes = (globalThis as { __gObjectEvents?: Array<{ active?: boolean; isPlayer?: boolean; currentCoordsX?: number; currentCoordsY?: number }> }).__gObjectEvents;
  if (oes) {
    // gObjectEvents[0] = player en single. Cherche le 1er actif isPlayer pour robustesse.
    for (const oe of oes) {
      if (oe?.active && oe.isPlayer) {
        return { x: oe.currentCoordsX ?? 0, y: oe.currentCoordsY ?? 0 };
      }
    }
    // Fallback slot 0.
    const p = oes[0];
    if (p) return { x: p.currentCoordsX ?? 0, y: p.currentCoordsY ?? 0 };
  }
  return { x: 0, y: 0 };
}

/** E1 wire : `MapGridGetMetatileBehaviorAt(x, y)` (map-loader.ts:1721) exposé
 *  global. Prend coords INTERNAL. */
function _MapGridGetMetatileBehaviorAt(x: number, y: number): number {
  const fn = (globalThis as { MapGridGetMetatileBehaviorAt?: (x: number, y: number) => number }).MapGridGetMetatileBehaviorAt;
  return fn ? fn(x, y) : 0;
}

/** E1 wire : `gMapHeader.mapType` (= STRING "MAP_TYPE_ROUTE" dans notre port)
 *  → number 1:1 décomp enum. */
const _MAP_TYPE_STR_TO_NUM: Record<string, number> = {
  MAP_TYPE_TOWN: MAP_TYPE_TOWN, MAP_TYPE_CITY: MAP_TYPE_CITY,
  MAP_TYPE_ROUTE: MAP_TYPE_ROUTE, MAP_TYPE_UNDERGROUND: MAP_TYPE_UNDERGROUND,
  MAP_TYPE_UNDERWATER: MAP_TYPE_UNDERWATER, MAP_TYPE_OCEAN_ROUTE: MAP_TYPE_OCEAN_ROUTE,
  MAP_TYPE_UNKNOWN: MAP_TYPE_UNKNOWN, MAP_TYPE_INDOOR: MAP_TYPE_INDOOR,
  MAP_TYPE_SECRET_BASE: MAP_TYPE_SECRET_BASE,
};
function _getMapType(): number {
  const mh = (globalThis as { gMapHeader?: { mapType?: number | string } }).gMapHeader;
  const mt = mh?.mapType;
  if (typeof mt === 'number') return mt;
  if (typeof mt === 'string') return _MAP_TYPE_STR_TO_NUM[mt] ?? MAP_TYPE_TOWN;
  return MAP_TYPE_TOWN;
}

/** 1:1 décomp `BattleSetup_GetEnvironmentId()` (battle_setup.c:636-).
 *  Returns le BATTLE_ENVIRONMENT_* depuis metatile behavior + map type. */
export function BattleSetup_GetEnvironmentId(): number {
  const { x, y } = _PlayerGetDestCoords();
  const tileBehavior = _MapGridGetMetatileBehaviorAt(x, y);

  if (_MB_IsTallGrass_BSH(tileBehavior)) return BATTLE_ENVIRONMENT_GRASS;
  if (_MB_IsLongGrass_BSH(tileBehavior)) return BATTLE_ENVIRONMENT_LONG_GRASS;
  if (_MB_IsSandOrDeepSand_BSH(tileBehavior)) return BATTLE_ENVIRONMENT_SAND;

  const mapType = _getMapType();
  switch (mapType) {
    case MAP_TYPE_TOWN:
    case MAP_TYPE_CITY:
    case MAP_TYPE_ROUTE:
      break;
    case MAP_TYPE_UNDERGROUND:
      if (_MB_IsIndoorEncounter_BSH(tileBehavior)) return BATTLE_ENVIRONMENT_BUILDING;
      if (_MB_IsSurfableWaterOrUnderwater_BSH(tileBehavior)) return BATTLE_ENVIRONMENT_POND;
      return BATTLE_ENVIRONMENT_CAVE;
    case MAP_TYPE_INDOOR:
    case MAP_TYPE_SECRET_BASE:
      return BATTLE_ENVIRONMENT_BUILDING;
    case MAP_TYPE_UNDERWATER:
      return BATTLE_ENVIRONMENT_UNDERWATER;
    case MAP_TYPE_OCEAN_ROUTE:
      if (_MB_IsSurfableWaterOrUnderwater_BSH(tileBehavior)) return BATTLE_ENVIRONMENT_WATER;
      return BATTLE_ENVIRONMENT_PLAIN;
  }

  if (_MB_IsDeepOrOceanWater_BSH(tileBehavior)) return BATTLE_ENVIRONMENT_WATER;
  if (_MB_IsSurfableWaterOrUnderwater_BSH(tileBehavior)) return BATTLE_ENVIRONMENT_POND;
  if (_MB_IsMountain_BSH(tileBehavior)) return BATTLE_ENVIRONMENT_MOUNTAIN;
  // 1:1 décomp battle_setup.c:680-693 (queue manquante = POUS-6, mauvais fond
  // sur surf-pont / Route 113 cendre / tempête de sable).
  if (_TestPlayerAvatarFlags_BSH(_PLAYER_AVATAR_FLAG_SURFING_BSH)) {
    // Is BRIDGE_TYPE_POND_*? (BRIDGE_TYPE_OCEAN = 0, cf. metatile_behavior.c).
    const BRIDGE_TYPE_OCEAN = 0;
    if (_MB_GetBridgeType_BSH(tileBehavior) !== BRIDGE_TYPE_OCEAN)
      return BATTLE_ENVIRONMENT_POND;
    if (_MB_IsBridgeOverWater_BSH(tileBehavior) === true)
      return BATTLE_ENVIRONMENT_WATER;
  }
  // 1:1 : `gSaveBlock1Ptr->location.mapGroup/mapNum == MAP_GROUP/NUM(MAP_ROUTE113)`.
  if (gSaveBlock1Ptr.location.mapGroup === MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE113)
   && gSaveBlock1Ptr.location.mapNum === MAP_NUM(MAP_CONSTANTS.MAP_ROUTE113))
    return BATTLE_ENVIRONMENT_SAND;
  if (_GetSavedWeather_BSH() === _WEATHER_SANDSTORM_BSH)
    return BATTLE_ENVIRONMENT_SAND;

  return BATTLE_ENVIRONMENT_PLAIN;
}

// ─── Sélection de transition de combat (battle_setup.c:696-861) ─────────────
//
// 1:1 strict. Le décomp choisit le TYPE de transition (B_TRANSITION_*) à passer à
// `CreateBattleStartTask(transition, song)` selon : type de zone (normal/grotte/flash/
// eau) × difficulté (ennemi plus faible que le joueur ? table[0] : table[1]).
// L'exécuteur (battle-decomp-loop.ts `_makeBattleStartTransitionCB2`) consomme l'ID
// et fait un fallback gracieux vers SLICE pour les transitions pas encore implémentées
// (= 100% des non-SLICE = chantier VISUEL/A/B). Ici = la LOGIQUE déterministe « chaque cas ».

/** 1:1 décomp `MON_DATA_SPECIES_OR_EGG` (pokemon.h enum) = 65. */
const MON_DATA_SPECIES_OR_EGG = 65;
/** 1:1 décomp `MON_DATA_HP` = 39. */
const MON_DATA_HP = 39;
/** 1:1 décomp `MON_DATA_LEVEL` = 56. */
const MON_DATA_LEVEL = 56;
/** 1:1 décomp `SPECIES_NONE` = 0 / `SPECIES_EGG` = 412. */
const SPECIES_NONE = 0;
const SPECIES_EGG = 412;

// 1:1 décomp battle_setup.c:51-56 — enum anonyme file-local (type de transition
// → index dans sBattleTransitionTable_*).
const TRANSITION_TYPE_NORMAL = 0;
const TRANSITION_TYPE_CAVE = 1;
const TRANSITION_TYPE_FLASH = 2;
const TRANSITION_TYPE_WATER = 3;

/** 1:1 décomp `sBattleTransitionTable_Wild[][2]` (battle_setup.c:114-120). La 1re
 *  transition est utilisée si l'ennemi est de niveau INFÉRIEUR au joueur, sinon la 2e.
 *  (static const array — non auto-extrait ; transcrit 1:1 avec constantes ENUM_B_1.) */
const sBattleTransitionTable_Wild: Record<number, [number, number]> = {
  [TRANSITION_TYPE_NORMAL]: [_B_TRANSITION_BSH.B_TRANSITION_SLICE,          _B_TRANSITION_BSH.B_TRANSITION_WHITE_BARS_FADE],
  [TRANSITION_TYPE_CAVE]:   [_B_TRANSITION_BSH.B_TRANSITION_CLOCKWISE_WIPE, _B_TRANSITION_BSH.B_TRANSITION_GRID_SQUARES],
  [TRANSITION_TYPE_FLASH]:  [_B_TRANSITION_BSH.B_TRANSITION_BLUR,           _B_TRANSITION_BSH.B_TRANSITION_GRID_SQUARES],
  [TRANSITION_TYPE_WATER]:  [_B_TRANSITION_BSH.B_TRANSITION_WAVE,           _B_TRANSITION_BSH.B_TRANSITION_RIPPLE],
};

/** 1:1 décomp `GetFlashLevel()` (overworld.c:988) : `return gSaveBlock1Ptr->flashLevel`.
 *  FIX (Bug 5) : lecture DIRECTE de la source de vérité `gSaveBlock1Ptr.flashLevel` (posée par
 *  SetDefaultFlashLevel/SetFlashLevel au map load) au lieu de `globalThis.GetFlashLevel` — ce
 *  pont n'était PAS toujours armé en voie L (field_screen_effect pas chargé) → fallback 0 → une
 *  grotte à Flash ratait la transition FLASH et tombait en NORMAL (WHITE_BARS_FADE blanche).
 *  `gSaveBlock1Ptr` est toujours disponible (importé ci-dessus, singleton) → plus de fallback. */
function _GetFlashLevel(): number {
  return gSaveBlock1Ptr.flashLevel & 0xF;
}

/** 1:1 décomp `GetBattleTransitionTypeByMap()` (battle_setup.c:696-719). */
export function GetBattleTransitionTypeByMap(): number {
  const { x, y } = _PlayerGetDestCoords();
  const tileBehavior = _MapGridGetMetatileBehaviorAt(x, y);

  if (_GetFlashLevel()) return TRANSITION_TYPE_FLASH;
  if (_MB_IsSurfableWaterOrUnderwater_BSH(tileBehavior)) return TRANSITION_TYPE_WATER;

  const mapType = _getMapType();
  let result: number;
  switch (mapType) {
    case MAP_TYPE_UNDERGROUND: result = TRANSITION_TYPE_CAVE;   break;
    case MAP_TYPE_UNDERWATER:  result = TRANSITION_TYPE_WATER;  break;
    default:                   result = TRANSITION_TYPE_NORMAL; break;
  }
  // FIX (Bug 5) — garde HURLANTE : NORMAL (→ WHITE_BARS_FADE blanche) alors que le header courant
  // est une grotte/souterrain/sous-marin = le mapType a été mal résolu (header stale/non chargé au
  // moment de l'encounter, ou string non reconnue → fallback MAP_TYPE_TOWN de `_getMapType`). On le
  // signale au lead avec toutes les valeurs pour re-diagnostiquer si la transition re-blanchit.
  if (result === TRANSITION_TYPE_NORMAL) {
    const rawMt = (globalThis as { gMapHeader?: { mapType?: number | string } }).gMapHeader?.mapType;
    if (rawMt === 'MAP_TYPE_UNDERGROUND' || rawMt === MAP_TYPE_UNDERGROUND
      || rawMt === 'MAP_TYPE_UNDERWATER' || rawMt === MAP_TYPE_UNDERWATER) {
      console.error('[battle_setup] GetBattleTransitionTypeByMap=NORMAL (transition blanche) alors que '
        + 'gMapHeader.mapType=' + String(rawMt) + ' (grotte/sous-marin) — mapType résolu=' + mapType
        + ', flashLevel=' + _GetFlashLevel() + ', tileBehavior=0x' + tileBehavior.toString(16));
    }
  }
  return result;
}

/** 1:1 décomp `GetSumOfPlayerPartyLevel(numMons)` (battle_setup.c:721-738). Somme
 *  les niveaux des `numMons` premiers mons joueur non-œuf, non-K.O. */
export function GetSumOfPlayerPartyLevel(numMons: number): number {
  let sum = 0;
  let remaining = numMons;
  for (let i = 0; i < _PARTY_SIZE_BSH; i++) {
    const mon = _gPlayerParty_BSH[i] as never;
    const species = _GetMonData_BSH(mon, MON_DATA_SPECIES_OR_EGG) as number;
    if (species !== SPECIES_EGG && species !== SPECIES_NONE && (_GetMonData_BSH(mon, MON_DATA_HP) as number) !== 0) {
      sum += _GetMonData_BSH(mon, MON_DATA_LEVEL) as number;
      if (--remaining === 0) break;
    }
  }
  return sum;
}

/** 1:1 décomp `GetWildBattleTransition()` (battle_setup.c:790-810). Retourne le
 *  `B_TRANSITION_*` pour une rencontre sauvage selon zone × niveau.
 *  (Branche `CurrentBattlePyramidLocation()` omise : Pyramide = Battle Frontier hors
 *  scope → équivaut toujours à PYRAMID_LOCATION_NONE.) */
export function GetWildBattleTransition(): number {
  const transitionType = GetBattleTransitionTypeByMap();
  const enemyLevel = _GetMonData_BSH(_gEnemyParty_BSH[0] as never, MON_DATA_LEVEL) as number;
  const playerLevel = GetSumOfPlayerPartyLevel(1);

  const row = sBattleTransitionTable_Wild[transitionType] ?? sBattleTransitionTable_Wild[TRANSITION_TYPE_NORMAL];
  return (enemyLevel < playerLevel) ? row[0] : row[1];
}

/** 1:1 décomp `sBattleTransitionTable_Trainer[][2]` (battle_setup.c:121-127).
 *  ⚠️ Valeurs par l'ENUM (les littéraux initiaux avaient 3 erreurs : 10≠ANGLED_
 *  WIPES(11), 6≠GRID_SQUARES(10), 7≠RIPPLE(6) — leçon hardcode re-payée). */
const sBattleTransitionTable_Trainer: ReadonlyArray<readonly [number, number]> = [
  /* NORMAL */ [_B_TRANSITION_BSH.B_TRANSITION_POKEBALLS_TRAIL, _B_TRANSITION_BSH.B_TRANSITION_ANGLED_WIPES],
  /* CAVE   */ [_B_TRANSITION_BSH.B_TRANSITION_SHUFFLE, _B_TRANSITION_BSH.B_TRANSITION_BIG_POKEBALL],
  /* FLASH  */ [_B_TRANSITION_BSH.B_TRANSITION_BLUR, _B_TRANSITION_BSH.B_TRANSITION_GRID_SQUARES],
  /* WATER  */ [_B_TRANSITION_BSH.B_TRANSITION_SWIRL, _B_TRANSITION_BSH.B_TRANSITION_RIPPLE],
];

/** 1:1 décomp `GetSumOfEnemyPartyLevel(opponentId, numMons)` (battle_setup.c:740-788,
 *  branche dresseur normal — frontier omis). Lit les levels de gTrainers[id].party
 *  (les 4 unions partagent le champ level). */
export function GetSumOfEnemyPartyLevel(opponentId: number, numMons: number): number {
  const trainers = (globalThis as { __gTrainers?: Record<number, { party?: unknown }> }).__gTrainers;
  const t = trainers?.[opponentId];
  if (!t?.party) return 0;
  // Deux formes possibles : le bridge JSON expose `party` en ARRAY direct
  // (JsonTrainerMember[], battle-trainer-data-bridge.ts:47) ; la forme struct
  // décomp (TrainerPartyData) a les 4 unions. (Le 1er jet ne lisait que les
  // unions → 0 → la transition dresseur tombait toujours sur row[0].)
  type _Mon = { lvl?: number; level?: number };
  const p = t.party as Record<string, _Mon[]> | _Mon[];
  const arr: _Mon[] = Array.isArray(p)
    ? p
    : (p.NoItemDefaultMoves ?? p.NoItemCustomMoves ?? p.ItemDefaultMoves ?? p.ItemCustomMoves ?? []);
  let sum = 0;
  // 1:1 struct .c : le champ s'appelle `lvl` (TrainerMonNoItemDefaultMoves) —
  // `level` en fallback (forme JSON brute du bridge).
  for (let i = 0; i < Math.min(numMons, arr.length); i++) sum += arr[i]?.lvl ?? arr[i]?.level ?? 0;
  return sum;
}

/** 1:1 décomp `GetTrainerBattleTransition()` (battle_setup.c:812-862).
 *  Branches SECRET_BASE / Elite Four / Champion / Magma / Aqua incluses
 *  (classes résolues par constante — inatteignables en démo, exactes quand même). */
export function GetTrainerBattleTransition(): number {
  const g = globalThis as {
    __battleSetup?: { opponentA?: number };
    __gTrainers?: Record<number, { trainerClass?: number; doubleBattle?: boolean }>;
  };
  const opponentA = g.__battleSetup?.opponentA ?? 0;
  const t = g.__gTrainers?.[opponentA];
  const cls = t?.trainerClass ?? -1;
  const C = (name: string): number => (_resolveDecompConstant_BSH(name) as number | undefined) ?? -2;
  // ⚠️ Valeurs par l'ENUM — les littéraux initiaux étaient TOUS décalés
  // (SIDNEY 13≠12, CHAMPION 17≠16, AQUA 11(!)=ANGLED_WIPES, MAGMA 12=SIDNEY).
  if (cls === C('TRAINER_CLASS_ELITE_FOUR')) {
    if (opponentA === C('TRAINER_SIDNEY')) return _B_TRANSITION_BSH.B_TRANSITION_SIDNEY;
    if (opponentA === C('TRAINER_PHOEBE')) return _B_TRANSITION_BSH.B_TRANSITION_PHOEBE;
    if (opponentA === C('TRAINER_GLACIA')) return _B_TRANSITION_BSH.B_TRANSITION_GLACIA;
    if (opponentA === C('TRAINER_DRAKE')) return _B_TRANSITION_BSH.B_TRANSITION_DRAKE;
    return _B_TRANSITION_BSH.B_TRANSITION_CHAMPION;
  }
  if (cls === C('TRAINER_CLASS_CHAMPION')) return _B_TRANSITION_BSH.B_TRANSITION_CHAMPION;
  if (cls === C('TRAINER_CLASS_TEAM_MAGMA') || cls === C('TRAINER_CLASS_MAGMA_LEADER') || cls === C('TRAINER_CLASS_MAGMA_ADMIN')) return _B_TRANSITION_BSH.B_TRANSITION_MAGMA;
  if (cls === C('TRAINER_CLASS_TEAM_AQUA') || cls === C('TRAINER_CLASS_AQUA_LEADER') || cls === C('TRAINER_CLASS_AQUA_ADMIN')) return _B_TRANSITION_BSH.B_TRANSITION_AQUA;
  const minPartyCount = t?.doubleBattle ? 2 : 1;
  const transitionType = GetBattleTransitionTypeByMap();
  const enemyLevel = GetSumOfEnemyPartyLevel(opponentA, minPartyCount);
  const playerLevel = GetSumOfPlayerPartyLevel(minPartyCount);
  const row = sBattleTransitionTable_Trainer[transitionType] ?? sBattleTransitionTable_Trainer[0];
  return (enemyLevel < playerLevel) ? row[0] : row[1];
}

// ─── Devtools expose ───────────────────────────────────────────────────────

Object.assign(((globalThis as Record<string, unknown>).__battleSetupHelpers ??= {}) as object, {
  BattleSetup_GetEnvironmentId,
  BATTLE_ENVIRONMENT_GRASS, BATTLE_ENVIRONMENT_LONG_GRASS,
  BATTLE_ENVIRONMENT_SAND, BATTLE_ENVIRONMENT_UNDERWATER,
  BATTLE_ENVIRONMENT_WATER, BATTLE_ENVIRONMENT_POND,
  BATTLE_ENVIRONMENT_MOUNTAIN, BATTLE_ENVIRONMENT_CAVE,
  BATTLE_ENVIRONMENT_BUILDING, BATTLE_ENVIRONMENT_PLAIN,
  // Sélection de transition (Phase 4) — exposé pour vérif harness déterministe.
  GetWildBattleTransition, GetBattleTransitionTypeByMap, GetSumOfPlayerPartyLevel,
  GetTrainerBattleTransition, GetSumOfEnemyPartyLevel,
});

void MAP_TYPE_UNKNOWN;
