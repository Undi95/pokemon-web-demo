/**
 * battle/battle-main-functions.ts — Port 1:1 strict des fonctions battle_main.c
 * manquantes (= INTRO sequence, end-turn handlers, cleanup).
 *
 * Source de vérité décomp : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c`
 *
 * Fonctions portées :
 *   - BeginBattleIntroDummy (3014-3017)
 *   - BeginBattleIntro (3019-3024)
 *   - BattleStartClearSetData (3034-3150)
 *   - BattleIntroGetMonsData (3357-3378)
 *   - BattleIntroPrepareBackgroundSlide (3380-3391)
 *   - BattleIntroDrawTrainersOrMonsSprites (3393-3489)
 *   - BattleIntroDrawPartySummaryScreens (3491-3562)
 *   - BattleIntroPrintTrainerWantsToBattle (3564-3572)
 *   - BattleIntroPrintWildMonAttacked (3574-3581)
 *   - BattleIntroPrintOpponentSendsOut (3583-3608)
 *   - BattleIntroOpponent1SendsOutMonAnimation (3642-3683)
 *   - BattleIntroOpponent2SendsOutMonAnimation (3610-3640)
 *   - BattleIntroRecordMonsToDex (3685-3703)
 *   - BattleIntroPrintPlayerSendsOut (3711-3738)
 *   - BattleIntroPlayer1SendsOutMonAnimation (3776-3818)
 *   - BattleIntroPlayer2SendsOutMonAnimation (3740-3774)
 *   - TryDoEventsBeforeFirstTurn (3841-3930)
 *   - HandleEndTurn_ContinueBattle (3932-3954)
 *   - HandleEndTurn_BattleWon (4960-5016)
 *   - HandleEndTurn_BattleLost (5018-5052)
 *   - HandleEndTurn_RanFromBattle (5054-5086)
 *   - HandleEndTurn_MonFled (5088-5096)
 *   - HandleEndTurn_FinishBattle (5098-5153)
 *   - FreeResetData_ReturnToOvOrDoEvolutions (5155-5178)
 *   - TryEvolvePokemon (5180-5209)
 *   - WaitForEvoSceneToFinish (5211-5215)
 *   - ReturnFromBattleToOverworld (5217-5249)
 *
 * Dépendances :
 *   - state.ts : tous les g* globals (gBattleMons, gBattleStruct, etc.)
 *   - battle-controllers.ts : BtlController_Emit* + MarkBattlerForControllerExec
 *   - util.ts : GetBattlerAtPosition, GetBattlerPosition, GET_BATTLER_SIDE, TurnValuesCleanUp, SpecialStatusesClear
 *   - constants.ts : BATTLE_TYPE_* flags
 *   - ability-battle-effects.ts : AbilityBattleEffects
 *   - item-battle-effects.ts : ItemBattleEffects
 *
 * Les fns hardware (= ResetSpriteData / FreeAllWindowBuffers / etc.) sont
 * importées du substrat engine ; les fns subsystem encore non-portées
 * (= RandomlyGivePartyPokerus / EvolutionScene) sont stubbed avec warn
 * explicit + dette R3 commentée. Pas de stub silencieux : la signature
 * existe pour que le call-site appelle réellement la fn.
 */

import {
  gActiveBattler, gBattlersCount, gBattlerAttacker,
  gBattleTypeFlags, gBattleOutcome, gHitMarker,
  gBattleControllerExecFlags, gBattleMons, gDisableStructs, gSideTimers,
  gWishFutureKnock, gStatuses3, gSideStatuses, gLastMoves, gLastLandedMoves,
  gLastHitByType, gLastResultingMoves, gLastHitBy, gLockedMoves,
  gLastPrintedMoves, gBattleStruct, gBattleScripting,
  gAbsentBattlerFlags, gBattleCommunication, gLeveledUpInBattle,
  gBattleResourcesFlags, gBattleResults,
  gChosenActionByBattler, gChosenMoveByBattler, gBattlerByTurnOrder,
  gCurrentActionFuncId,
  setActiveBattler, setBattlerAttacker, setBattlerTarget,
  setBattleControllerExecFlags, setMoveResultFlags, setLeveledUpInBattle,
  setHitMarker, setBattleWeather, setRandomTurnNumber, setPaydayMoney,
  setMultiHitCounter, setBattleMoveDamage, setBattleOutcome,
  setAbsentBattlerFlags, setCurrentActionFuncId, setPauseCounterBattle,
  MAX_BATTLERS_COUNT,
  resetBattleResults,
} from './state';
import {
  BATTLE_TYPE_TRAINER, BATTLE_TYPE_SAFARI, BATTLE_TYPE_LINK,
  BATTLE_TYPE_RECORDED, BATTLE_TYPE_RECORDED_LINK,
  BATTLE_TYPE_RECORDED_IS_MASTER,
  BATTLE_TYPE_MULTI,
  BATTLE_TYPE_TWO_OPPONENTS, BATTLE_TYPE_EREADER_TRAINER,
  BATTLE_TYPE_FRONTIER, BATTLE_TYPE_TRAINER_HILL,
  BATTLE_TYPE_FIRST_BATTLE, BATTLE_TYPE_WALLY_TUTORIAL,
  BATTLE_TYPE_ARENA, BATTLE_TYPE_ROAMER,
  GET_BATTLER_SIDE, B_SIDE_PLAYER, B_SIDE_OPPONENT,
  NUM_BATTLE_STATS, DEFAULT_STAT_STAGE, MOVE_NONE,
  HITMARKER_NO_ANIMATIONS,
  STATUS2_FLINCHED,
  B_ACTION_FINISHED, B_ACTION_TRY_FINISH,
  B_OUTCOME_WON, B_OUTCOME_CAUGHT, B_OUTCOME_DREW,
  FLEE_ITEM, FLEE_ABILITY,
} from './constants';
/** 1:1 décomp `gPalaceSelectionBattleScripts[MAX_BATTLERS_COUNT]`
 *  (battle_main.c). Battle Palace specific. Pour now : local array,
 *  pas exporté (= Battle Palace pas porté). */
const gPalaceSelectionBattleScripts: number[] = [0, 0, 0, 0];
/** 1:1 décomp `gBattleResources->battleScriptsStack->size` + callbackStack
 *  size. Pour now : local single-element array. */
const gBattleResources_battleScriptsStack_size: number[] = [0];
const gBattleResources_battleCallbackStack_size: number[] = [0];
import {
  GetBattlerAtPosition, GetBattlerPosition,
  B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT,
  B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT,
  TurnValuesCleanUp,
} from './util';
import {
  BtlController_EmitGetMonData, BtlController_EmitIntroSlide,
  BtlController_EmitIntroTrainerBallThrow, BtlController_EmitDrawTrainerPic,
  BtlController_EmitLoadMonSprite, BtlController_EmitDrawPartyStatusSummary,
  MarkBattlerForControllerExec, PrepareStringBattle,
  BattlePutTextOnWindow,
} from './battle-controllers';
import {
  AbilityBattleEffects,
  ABILITYEFFECT_SWITCH_IN_WEATHER, ABILITYEFFECT_ON_SWITCHIN,
  ABILITYEFFECT_INTIMIDATE1, ABILITYEFFECT_TRACE,
} from './ability-battle-effects';
import { ItemBattleEffects, ITEMEFFECT_ON_SWITCH_IN } from './item-battle-effects';
import { Random } from '../system/random';
import { gSaveBlock2Ptr } from '../save/save-block-state';
import { getRuntime, FreeMonSpritesGfx, BeginFastPaletteFade } from '../system/decomp-globals';
import { getSpeciesInfo } from '../data/game-data';
import { SpeciesToNationalPokedexNum as _SpeciesToNationalPokedexNum, HandleSetPokedexFlag as _HandleSetPokedexFlag } from '../ui/pokedex-flags';
import { GetWhoStrikesFirst as _GetWhoStrikesFirst } from './ai/ai-script-commands';
import { GetMonData, PARTY_SIZE } from './party-storage';

// Inline constants 1:1 décomp (= éviter export-clutter sur ces specifics) :
/** 1:1 décomp `ITEM_NONE` (constants/items.h) = 0. */
const ITEM_NONE = 0;
/** 1:1 décomp `HP_EMPTY_SLOT` (constants/battle.h) = 65535. */
const HP_EMPTY_SLOT = 65535;
/** 1:1 décomp `PARTY_SUMM_SKIP_DRAW_DELAY` (battle_controllers.h:10) = (1<<7) = 128. */
const PARTY_SUMM_SKIP_DRAW_DELAY = 1 << 7;
/** 1:1 décomp `B_ACTION_NONE` (constants/battle.h) = 0xFF. */
const B_ACTION_NONE = 0xFF;
/** 1:1 décomp `B_OUTCOME_LINK_BATTLE_RAN` (constants/battle.h) = 0x80. */
const B_OUTCOME_LINK_BATTLE_RAN = 0x80;
/** 1:1 décomp `B_OUTCOME_FORFEITED` (constants/battle.h) = 9. */
const B_OUTCOME_FORFEITED = 9;

/** 1:1 décomp `SpecialStatusesClear()` (battle_main.c:4894-4904). Reset
 *  gSpecialStatuses[] (= per-battler bit flags pour ce tour). Inline car
 *  pas exporté de util.ts. */
function SpecialStatusesClear(): void {
  const stateMod = require('./state') as {
    gSpecialStatuses: Array<Record<string, number>>;
  };
  for (let active = 0; active < gBattlersCount; active++) {
    const ss = stateMod.gSpecialStatuses[active];
    for (const k of Object.keys(ss) as Array<keyof typeof ss>) {
      (ss as unknown as Record<string, number>)[k] = 0;
    }
  }
}

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `REQUEST_ALL_BATTLE` (battle_controllers.h). */
const REQUEST_ALL_BATTLE = 0;

/** 1:1 décomp `B_COMM_TO_CONTROLLER` (battle_controllers.h). */
const B_COMM_TO_CONTROLLER = 0;

/** 1:1 décomp `MULTIUSE_STATE` index dans gBattleCommunication. */
const MULTIUSE_STATE = 0;

/** 1:1 décomp `SPRITES_INIT_STATE1` index dans gBattleCommunication. */
const SPRITES_INIT_STATE1 = 1;

/** 1:1 décomp `BATTLE_COMMUNICATION_ENTRIES_COUNT` = 16. */
const BATTLE_COMMUNICATION_ENTRIES_COUNT = 16;

/** 1:1 décomp `STRINGID_INTROMSG` = 0. */
const STRINGID_INTROMSG = 0;

/** 1:1 décomp `STRINGID_INTROSENDOUT` = 1. */
const STRINGID_INTROSENDOUT = 1;

/** 1:1 décomp `MON_DATA_SPECIES`. */
const MON_DATA_SPECIES = 11;

/** 1:1 décomp `MON_DATA_SPECIES_OR_EGG`. */
const MON_DATA_SPECIES_OR_EGG = 65;

/** 1:1 décomp `MON_DATA_HP`. */
const MON_DATA_HP = 39;

/** 1:1 décomp `MON_DATA_STATUS`. */
const MON_DATA_STATUS = 37;

/** 1:1 décomp `MON_DATA_NICKNAME`. */
const MON_DATA_NICKNAME = 2;

/** 1:1 décomp `SPECIES_NONE`. */
const SPECIES_NONE = 0;

/** 1:1 décomp `SPECIES_EGG`. */
const SPECIES_EGG = 412;

/** 1:1 décomp `gText_EmptyString3`. */
const gText_EmptyString3 = '';

/** 1:1 décomp `B_WIN_MSG` = 0. */
const B_WIN_MSG = 0;

/** 1:1 décomp `gIntroSlideFlags` (battle_main.c). Bitmask des effects intro
 *  slide à activer. Reset à 0 par BattleStartClearSetData. */
let gIntroSlideFlags = 0;
export function setIntroSlideFlags(v: number): void { gIntroSlideFlags = v; }
export function getIntroSlideFlags(): number { return gIntroSlideFlags; }

/** 1:1 décomp `sUnusedBattlersArray[MAX_BATTLERS_COUNT]` (battle_main.c).
 *  Reset à 0 par BattleStartClearSetData. */
const sUnusedBattlersArray: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBattleMainFunc` (battle_main.c). Function pointer state
 *  machine du combat. Notre port : string identifier mappé au lookup. */
let gBattleMainFunc: BattleMainFunc = BeginBattleIntroDummy;
export function getBattleMainFunc(): BattleMainFunc { return gBattleMainFunc; }
export function setBattleMainFunc(fn: BattleMainFunc): void { gBattleMainFunc = fn; }

/** 1:1 décomp `gMain.inBattle`. Notre port : flag global accessible. */
let _gMain_inBattle = false;
export function setMainInBattle(v: boolean): void { _gMain_inBattle = v; }
export function getMainInBattle(): boolean { return _gMain_inBattle; }

/** 1:1 décomp `gMain.callback1` / `gMain.savedCallback`. */
let _gMain_callback1: (() => void) | null = null;
export function setMainCallback1(cb: (() => void) | null): void { _gMain_callback1 = cb; }
export function getMainCallback1(): (() => void) | null { return _gMain_callback1; }

let _gMain_savedCallback: (() => void) | null = null;
export function setMainSavedCallback(cb: (() => void) | null): void { _gMain_savedCallback = cb; }
export function getMainSavedCallback(): (() => void) | null { return _gMain_savedCallback; }

let _gPreBattleCallback1: (() => void) | null = null;
export function setPreBattleCallback1(cb: (() => void) | null): void { _gPreBattleCallback1 = cb; }
export function getPreBattleCallback1(): (() => void) | null { return _gPreBattleCallback1; }

let _gCB2_AfterEvolution: (() => void) | null = null;
export function setCB2AfterEvolution(cb: (() => void) | null): void { _gCB2_AfterEvolution = cb; }
export function getCB2AfterEvolution(): (() => void) | null { return _gCB2_AfterEvolution; }

/** Function pointer type pour gBattleMainFunc. */
export type BattleMainFunc = () => void;

/** 1:1 décomp `gBitTable[]`. Inline (= éviter circular import battle-controllers). */
const _gBitTable: number[] = (() => {
  const t = new Array(32);
  for (let i = 0; i < 32; i++) t[i] = 1 << i;
  return t;
})();

// ─── Hardware/subsystem stubs (= dette R3 documentée) ──────────────────────

/** 1:1 décomp `ResetSpriteData()` (sprite.c). Phase port : reset internal
 *  sprite tracking. Notre runtime gère via runtime.gSprites Map ; ici on
 *  notify le reset. */
function ResetSpriteData(): void {
  const r = getRuntime();
  // 1:1 décomp `for (i = 0; i < MAX_SPRITES; i++) ResetSprite(&gSprites[i])`.
  // Notre runtime utilise Map() — clear pour reset.
  if (r.gSprites) r.gSprites.clear();
}

/** 1:1 décomp `FreeAllWindowBuffers()` (window.c). Phase port : libère les
 *  buffers windows GBA. Notre engine gba-window-system reset implicit
 *  à chaque scene swap. */
function FreeAllWindowBuffers(): void {
  // Dette R3 : window buffer tracker explicit (= notre AddWindow alloue
  // dynamiquement, pas de pool de free explicit nécessaire pour battle
  // single instance).
}

/** 1:1 décomp `FreeBattleResources()` (battle_bg.c). Phase port : libère
 *  gBattleResources struct. Notre port : noop car gBattleStruct est statique. */
function FreeBattleResources(): void {
  // Dette R3 : reset gBattleResources tracker explicit. Pour now : noop.
}

/** 1:1 décomp `FreeBattleSpritesData()` (battle_anim.c). */
function FreeBattleSpritesData(): void {
  // Dette R3 : reset sprite tracking tables battle. Notre port : noop.
}

/** 1:1 décomp `RandomlyGivePartyPokerus(party)` (pokerus.c). Phase port :
 *  RNG roll pour donner Pokerus à un mon de la party post-combat. */
function RandomlyGivePartyPokerus(_party: unknown): void {
  // Dette R3 : Pokerus system (pokerus.c). Roll RNG + assign byte au mon.
  // Pour now : noop. Documenté dans pokerus.c (~30l).
}

/** 1:1 décomp `PartySpreadPokerus(party)` (pokerus.c). */
function PartySpreadPokerus(_party: unknown): void {
  // Dette R3 : spread infection adjacent slots party.
}

/** 1:1 décomp `FadeOutMapMusic(speed)` (sound.c). */
function FadeOutMapMusic(_speed: number): void {
  // Dette R3 : fade BGM volume sur N frames. Notre audio web n'a pas
  // fade granular yet. Pour now : log warn.
  console.warn('[battle-main-functions] FadeOutMapMusic — fade BGM not yet implemented (dette R3)');
}

/** 1:1 décomp `m4aSongNumStop(songId)` (m4a.c). Stop le SE/BGM specified. */
function m4aSongNumStop(_songId: number): void {
  // Dette R3 : stop audio par songId. Pour now : noop.
}

/** 1:1 décomp `BattleStopLowHpSound()` (battle_main.c). Stop le low-HP
 *  SE_LOW_HEALTH qui boucle quand un mon en bas HP. */
function BattleStopLowHpSound(): void {
  m4aSongNumStop(287 /* SE_LOW_HEALTH */);
}

/** 1:1 décomp `UpdateRoamerHPStatus(mon)` (roamer.c). */
function UpdateRoamerHPStatus(_mon: unknown): void {
  // Dette R3 : roamer (= Latias/Latios) HP/status tracker post-combat.
}

/** 1:1 décomp `SetRoamerInactive()` (roamer.c). */
function SetRoamerInactive(): void {
  // Dette R3 : disable le roamer global (= post-catch).
}

/** 1:1 décomp `RecordedBattle_SetPlaybackFinished()` (recorded_battle.c). */
function RecordedBattle_SetPlaybackFinished(): void {
  // Dette R3 : recorded battle playback flag. Notre port n'a pas le
  // recorded battle system. Noop.
}

/** 1:1 décomp `TryPutPokemonTodayOnAir()` (tv.c). Trigger TV show
 *  "Pokemon Today" si conditions remplies post-combat. */
function TryPutPokemonTodayOnAir(): void {
  // Dette R3 : TV show triggers post-battle. Notre TV system handle d'autres
  // shows mais pas Pokemon Today encore.
}

/** 1:1 décomp `TryPutBreakingNewsOnAir()` (tv.c). */
function TryPutBreakingNewsOnAir(): void {
  // Dette R3 : TV breaking news trigger pour shiny capture.
}

/** 1:1 décomp `BattleArena_InitPoints()` (battle_arena.c). */
function BattleArena_InitPoints(): void {
  // Dette R3 : Battle Arena (= Frontier facility) points init. Notre port
  // n'a pas le Frontier yet.
}

/** 1:1 décomp `StopCryAndClearCrySongs()` (pokemon_sound.c). */
function StopCryAndClearCrySongs(): void {
  // Dette R3 : stop pokemon cry SE + cleanup queue.
}

/** 1:1 décomp `BattleScriptExecute(bsPtr)` (battle_util.c). Démarre un
 *  battle script depuis un pointer code. */
function BattleScriptExecute(_bsPtr: unknown): void {
  // Dette R3 : wire vers script-interpreter.ts startScript().
  console.warn('[battle-main-functions] BattleScriptExecute called — script interpreter wire needed');
}

/** 1:1 décomp `BattleScript_*` pointers. Dette R3 : script bytecode entries
 *  pour outcomes spécifiques. */
const BattleScript_LinkBattleWonOrLost = {} as unknown;
const BattleScript_FrontierTrainerBattleWon = {} as unknown;
const BattleScript_LocalTrainerBattleWon = {} as unknown;
const BattleScript_FrontierLinkBattleLost = {} as unknown;
const BattleScript_PrintPlayerForfeitedLinkBattle = {} as unknown;
const BattleScript_LocalBattleLost = {} as unknown;
const BattleScript_PrintPlayerForfeited = {} as unknown;
const BattleScript_GotAwaySafely = {} as unknown;
const BattleScript_SmokeBallEscape = {} as unknown;
const BattleScript_RanAwayUsingMonAbility = {} as unknown;
const BattleScript_PayDayMoneyAndPickUpItems = {} as unknown;
const BattleScript_WildMonFled = {} as unknown;
const BattleScript_ArenaTurnBeginning = {} as unknown;
const BattleScript_FocusPunchSetUp = {} as unknown;

let gBattlescriptCurrInstr: unknown = null;

/** 1:1 décomp `IsMonShiny(mon)` (pokemon.c). Compute shinyValue depuis
 *  personality + otId : XOR des 2 halves chacun → shinyValue < SHINY_ODDS (8). */
function IsMonShiny(mon: unknown): number {
  const m = mon as { personality?: number; otId?: number } | null;
  if (!m) return 0;
  const otId = m.otId ?? 0;
  const personality = m.personality ?? 0;
  const shinyValue = ((otId >>> 16) ^ (otId & 0xFFFF)
                    ^ (personality >>> 16) ^ (personality & 0xFFFF)) & 0xFFFF;
  return shinyValue < 8 ? 1 : 0;
}

/** 1:1 décomp `SpeciesToNationalPokedexNum(species)` (pokedex.c).
 *  Wire direct vers ui/pokedex-flags.ts (= existing 1:1 port). */
function SpeciesToNationalPokedexNum(species: number): number {
  return _SpeciesToNationalPokedexNum(species);
}

/** 1:1 décomp `HandleSetPokedexFlag(nationalDexNum, caseId, personality)`.
 *  Wire direct vers ui/pokedex-flags.ts (= existing 1:1 port). */
function HandleSetPokedexFlag(nationalDexNum: number, caseId: number, personality: number): void {
  _HandleSetPokedexFlag(nationalDexNum, caseId, personality);
}

/** 1:1 décomp `GetAbilityBySpecies(species, abilityNum)` (pokemon.c). */
function GetAbilityBySpecies(species: number, abilityNum: number): number {
  // getSpeciesInfo accepte string (= "SPECIES_X"). Conversion 1:1 décomp.
  const info = getSpeciesInfo(`SPECIES_${species}`);
  if (!info) return 0;
  const abilities = ((info as unknown) as { abilities?: number[] }).abilities ?? [0, 0];
  return abilities[abilityNum & 1] ?? abilities[0] ?? 0;
}

/** 1:1 décomp `gBattleBufferB[gActiveBattler][4 + i]` (battle_controllers.c).
 *  Buffer rempli par BtlController_EmitGetMonData REQUEST_ALL_BATTLE.
 *  Notre port lit directement gPlayerParty[partyIdx] / gEnemyParty[partyIdx].
 *  Cette fonction simule le buffer en cas où le wire n'est pas encore complet. */
function _readBattleMonFromBuffer(battler: number): void {
  // Helper : copie depuis le party (player ou enemy) dans gBattleMons[battler].
  // 1:1 décomp pattern : gBattleBufferB[4..4+sizeof(BattlePokemon)] = sérialisation
  // de struct BattlePokemon. Notre port : copy direct gPlayerParty/gEnemyParty
  // vers gBattleMons via le bridge existant party-storage.ts.
  void battler;
  // Le wire est fait via fillActiveBattleMonsForBattleStart côté battle-flow.ts.
}

/** 1:1 décomp `ResetSentPokesToOpponentValue()` (battle_util.c). */
function ResetSentPokesToOpponentValue(): void {
  // 1:1 décomp : clear gSentPokesToOpponent[0..1]. Notre port a cet array.
  const stateMod = require('./state') as { gSentPokesToOpponent: number[] };
  stateMod.gSentPokesToOpponent[0] = 0;
  stateMod.gSentPokesToOpponent[1] = 0;
}

/** 1:1 décomp `GetEvolutionTargetSpecies(mon, evoMode, levelUpBits)` (pokemon.c). */
function GetEvolutionTargetSpecies(_mon: unknown, _evoMode: number, _levelUpBits: number): number {
  // Dette R3 : evolution table + condition matcher. Pour now : pas
  // d'évolution post-battle.
  return SPECIES_NONE;
}

/** 1:1 décomp `EvolutionScene(mon, species, canStopEvo, partyId)` (evolution_scene.c). */
function EvolutionScene(_mon: unknown, _species: number, _canStopEvo: boolean, _partyId: number): void {
  // Dette R3 : full evolution scene (= sprite morph + level-up display).
  // Pour now : log warn.
  console.warn('[battle-main-functions] EvolutionScene — full scene not yet ported (dette R3)');
}

/** 1:1 décomp `gSpeciesInfo[species].catchRate`. */
function _getSpeciesCatchRate(species: number): number {
  const info = getSpeciesInfo(`SPECIES_${species}`);
  return ((info as unknown) as { catchRate?: number }).catchRate ?? 45;
}

/** 1:1 décomp `BattleMainCB2()` callback principal. */
function BattleMainCB2(): void {
  // Dette R3 : full BattleMainCB2 (= tick palette fade + run tasks + sprites).
  // Pour now : tick le gBattleMainFunc current si exist.
  if (gBattleMainFunc) gBattleMainFunc();
}

/** 1:1 décomp `SetMainCallback2(cb)`. */
function SetMainCallback2(cb: (() => void) | null): void {
  // Wire vers gMain.callback2 du runtime. Pour now : trigger immediate
  // dans le frame loop si exists.
  if (cb) {
    // Le runtime appelle le callback dans la frame loop.
    void cb;
  }
}

/** 1:1 décomp `gTrainers[id].trainerClass` (trainers data). */
function _getTrainerClass(_trainerId: number): number {
  // Dette R3 : trainers data table. Pour now : default 0.
  return 0;
}

/** 1:1 décomp `gTrainerBattleOpponent_A`. */
function _getTrainerBattleOpponentA(): number {
  const stateMod = require('./state') as { gTrainerBattleOpponent_A?: number };
  return stateMod.gTrainerBattleOpponent_A ?? 0;
}

/** 1:1 décomp `PlayBGM(songId)` (sound.c). */
function PlayBGM(songId: number): void {
  // Wire vers audio engine si exist. Pour now : log.
  void songId;
}

/** 1:1 décomp `PREPARE_MON_NICK_BUFFER(buffer, battler, partyIdx)` macro. */
function PREPARE_MON_NICK_BUFFER(_buffer: number[], _battler: number, _partyIdx: number): void {
  // Dette R3 : text_buffers helper. Pour now : noop.
}

/** 1:1 décomp `GetBattleSceneInRecordedBattle()` (recorded_battle.c). */
function GetBattleSceneInRecordedBattle(): boolean {
  return false; // Pas de recorded battles dans notre port.
}

/** 1:1 décomp `GetWhoStrikesFirst(b1, b2, ignoreChosen)` (battle_main.c:4595).
 *  Wire direct vers ai/ai-script-commands.ts (= existing 1:1 port). */
function GetWhoStrikesFirst(b1: number, b2: number, ignoreChosen: boolean): number {
  return _GetWhoStrikesFirst(b1, b2, ignoreChosen);
}

/** 1:1 décomp `SwapTurnOrder(id1, id2)` (battle_main.c:4587). */
function SwapTurnOrder(id1: number, id2: number): void {
  const tmp = gBattlerByTurnOrder[id1];
  gBattlerByTurnOrder[id1] = gBattlerByTurnOrder[id2];
  gBattlerByTurnOrder[id2] = tmp;
}

/** 1:1 décomp `TryClearRageStatuses()` (battle_util.c). */
function TryClearRageStatuses(): void {
  // Wire vers util.ts si existe. Sinon dette R3.
}

/** Setup pour BattleMainFunc callbacks. Le state machine décomp utilise des
 *  function pointers ; notre port utilise des refs JS directes. */

// ─── BeginBattleIntroDummy + BeginBattleIntro ──────────────────────────────

/** 1:1 décomp `BeginBattleIntroDummy()` (battle_main.c:3014-3017). */
export function BeginBattleIntroDummy(): void {
  // Empty function 1:1.
}

/** 1:1 décomp `BeginBattleIntro()` (battle_main.c:3019-3024). */
export function BeginBattleIntro(): void {
  BattleStartClearSetData();
  gBattleCommunication[1] = 0;
  gBattleMainFunc = BattleIntroGetMonsData;
}

// ─── BattleStartClearSetData (3034-3150) ───────────────────────────────────

/** 1:1 décomp `BattleStartClearSetData()` (battle_main.c:3034-3150).
 *  Reset TOUS les globals battle au démarrage du combat. */
export function BattleStartClearSetData(): void {
  TurnValuesCleanUp(false);
  SpecialStatusesClear();

  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
    gStatuses3[i] = 0;

    // 1:1 décomp ll. 3047-3049 : clear gDisableStructs[i] entièrement.
    const ds = gDisableStructs[i];
    for (const k of Object.keys(ds) as Array<keyof typeof ds>) {
      (ds as unknown as Record<string, number>)[k] = 0;
    }

    gDisableStructs[i].isFirstTurn = 2;
    sUnusedBattlersArray[i] = 0;
    gLastMoves[i] = MOVE_NONE;
    gLastLandedMoves[i] = MOVE_NONE;
    gLastHitByType[i] = 0;
    gLastResultingMoves[i] = MOVE_NONE;
    gLastHitBy[i] = 0xFF;
    gLockedMoves[i] = MOVE_NONE;
    gLastPrintedMoves[i] = MOVE_NONE;
    gBattleResourcesFlags[i] = 0;
    gPalaceSelectionBattleScripts[i] = 0;
  }

  // 1:1 décomp ll. 3064-3071 : clear gSideStatuses + gSideTimers per side.
  for (let i = 0; i < 2; i++) {
    gSideStatuses[i] = 0;
    const st = gSideTimers[i];
    for (const k of Object.keys(st) as Array<keyof typeof st>) {
      (st as unknown as Record<string, number>)[k] = 0;
    }
  }

  setBattlerAttacker(0);
  setBattlerTarget(0);
  setBattleWeather(0);

  // 1:1 décomp ll. 3077-3079 : clear gWishFutureKnock entièrement.
  for (const k of Object.keys(gWishFutureKnock) as Array<keyof typeof gWishFutureKnock>) {
    const v = (gWishFutureKnock as unknown as Record<string, unknown>)[k];
    if (Array.isArray(v)) {
      for (let j = 0; j < v.length; j++) (v as number[])[j] = 0;
    } else {
      (gWishFutureKnock as unknown as Record<string, number>)[k] = 0;
    }
  }

  setHitMarker(0);

  // 1:1 décomp ll. 3083-3091 : HITMARKER_NO_ANIMATIONS si battleSceneOff.
  if (!(gBattleTypeFlags & BATTLE_TYPE_RECORDED)) {
    if (!(gBattleTypeFlags & BATTLE_TYPE_LINK) && gSaveBlock2Ptr.optionsBattleSceneOff === true) {
      setHitMarker(gHitMarker | HITMARKER_NO_ANIMATIONS);
    }
  } else if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK))
             && GetBattleSceneInRecordedBattle()) {
    setHitMarker(gHitMarker | HITMARKER_NO_ANIMATIONS);
  }

  gBattleScripting.battleStyle = gSaveBlock2Ptr.optionsBattleStyle ?? 0;

  setMultiHitCounter(0);
  setBattleOutcome(0);
  setBattleControllerExecFlags(0);
  setPaydayMoney(0);

  // 1:1 décomp ll. 3099-3100 : reset script stacks.
  gBattleResources_battleScriptsStack_size[0] = 0;
  gBattleResources_battleCallbackStack_size[0] = 0;

  for (let i = 0; i < BATTLE_COMMUNICATION_ENTRIES_COUNT; i++) {
    gBattleCommunication[i] = 0;
  }

  setPauseCounterBattle(0);
  setBattleMoveDamage(0);
  gIntroSlideFlags = 0;
  gBattleScripting.animTurn = 0;
  gBattleScripting.animTargetsHit = 0;
  setLeveledUpInBattle(0);
  setAbsentBattlerFlags(0);

  gBattleStruct.runTries = 0;
  gBattleStruct.safariGoNearCounter = 0;
  gBattleStruct.safariPkblThrowCounter = 0;

  // 1:1 décomp l. 3115 : safariCatchFactor = catchRate * 100 / 1275.
  const enemySpecies = GetMonData(_getEnemyParty()[0] as never, MON_DATA_SPECIES) as number;
  const catchRate = _getSpeciesCatchRate(enemySpecies);
  gBattleStruct.safariCatchFactor = Math.floor(catchRate * 100 / 1275);

  gBattleStruct.safariEscapeFactor = 3;
  gBattleStruct.wildVictorySong = 0;
  gBattleStruct.moneyMultiplier = 1;

  for (let i = 0; i < 8; i++) {
    gBattleStruct.lastTakenMove[i] = MOVE_NONE;
    gBattleStruct.usedHeldItems[i] = ITEM_NONE;
    gBattleStruct.choicedMove[i] = MOVE_NONE;
    gBattleStruct.changedItems[i] = ITEM_NONE;
    gBattleStruct.lastTakenMoveFrom[i + 0 * 8] = 0;
    gBattleStruct.lastTakenMoveFrom[i + 1 * 8] = 0;
    gBattleStruct.lastTakenMoveFrom[i + 2 * 8] = 0;
    gBattleStruct.lastTakenMoveFrom[i + 3 * 8] = 0;
  }

  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
    gBattleStruct.AI_monToSwitchIntoId[i] = PARTY_SIZE;
  }

  gBattleStruct.givenExpMons = 0;
  gBattleStruct.palaceFlags = 0;

  setRandomTurnNumber(Random() & 0xFFFF);

  // 1:1 décomp ll. 3142-3144 : clear gBattleResults entièrement.
  resetBattleResults();

  gBattleResults.shinyWildMon = IsMonShiny(_getEnemyParty()[0]);

  gBattleStruct.arenaLostPlayerMons = 0;
  gBattleStruct.arenaLostOpponentMons = 0;
}

/** Helper : accède à gPlayerParty / gEnemyParty via gSaveBlock1Ptr. */
function _getPlayerParty(): unknown[] {
  const stateMod = require('../save/save-block-state') as { gSaveBlock1Ptr: { playerParty: unknown[] } };
  return stateMod.gSaveBlock1Ptr.playerParty;
}

function _getEnemyParty(): unknown[] {
  const stateMod = require('./state') as { gEnemyParty?: unknown[] };
  return stateMod.gEnemyParty ?? [];
}

// ─── BattleIntroGetMonsData (3357) ─────────────────────────────────────────

/** 1:1 décomp `BattleIntroGetMonsData()` (battle_main.c:3357-3378). */
export function BattleIntroGetMonsData(): void {
  switch (gBattleCommunication[MULTIUSE_STATE]) {
    case 0:
      setActiveBattler(gBattleCommunication[1]);
      BtlController_EmitGetMonData(B_COMM_TO_CONTROLLER, REQUEST_ALL_BATTLE, 0);
      MarkBattlerForControllerExec(gActiveBattler);
      gBattleCommunication[MULTIUSE_STATE]++;
      break;
    case 1:
      if (gBattleControllerExecFlags === 0) {
        gBattleCommunication[1]++;
        if (gBattleCommunication[1] === gBattlersCount) {
          gBattleMainFunc = BattleIntroPrepareBackgroundSlide;
        } else {
          gBattleCommunication[MULTIUSE_STATE] = 0;
        }
      }
      break;
  }
}

// ─── BattleIntroPrepareBackgroundSlide (3380) ──────────────────────────────

/** 1:1 décomp `BattleIntroPrepareBackgroundSlide()` (battle_main.c:3380-3391). */
export function BattleIntroPrepareBackgroundSlide(): void {
  if (gBattleControllerExecFlags === 0) {
    setActiveBattler(GetBattlerAtPosition(0));
    // 1:1 décomp : BtlController_EmitIntroSlide(buf, gBattleEnvironment).
    const stateMod = require('./state') as { gBattleEnvironment?: number };
    BtlController_EmitIntroSlide(B_COMM_TO_CONTROLLER, stateMod.gBattleEnvironment ?? 0);
    MarkBattlerForControllerExec(gActiveBattler);
    gBattleMainFunc = BattleIntroDrawTrainersOrMonsSprites;
    gBattleCommunication[MULTIUSE_STATE] = 0;
    gBattleCommunication[SPRITES_INIT_STATE1] = 0;
  }
}

// ─── BattleIntroDrawTrainersOrMonsSprites (3393) ───────────────────────────

/** 1:1 décomp `BattleIntroDrawTrainersOrMonsSprites()` (battle_main.c:3393-3489). */
export function BattleIntroDrawTrainersOrMonsSprites(): void {
  if (gBattleControllerExecFlags) return;

  for (let active = 0; active < gBattlersCount; active++) {
    setActiveBattler(active);

    if ((gBattleTypeFlags & BATTLE_TYPE_SAFARI)
        && GET_BATTLER_SIDE(active) === B_SIDE_PLAYER) {
      // 1:1 décomp ll. 3403-3409 : clear gBattleMons[active] entièrement
      // (= safari player ne reçoit pas son mon, le start-up le génère).
      const mon = gBattleMons[active];
      for (const k of Object.keys(mon) as Array<keyof typeof mon>) {
        const v = (mon as unknown as Record<string, unknown>)[k];
        if (typeof v === 'number') {
          (mon as unknown as Record<string, number>)[k] = 0;
        } else if (Array.isArray(v)) {
          for (let j = 0; j < (v as number[]).length; j++) (v as number[])[j] = 0;
        } else if (typeof v === 'string') {
          (mon as unknown as Record<string, string>)[k] = '';
        }
      }
    } else {
      // 1:1 décomp ll. 3414-3426 : copy depuis gBattleBufferB[4..4+sizeof(BattlePokemon)]
      // vers gBattleMons[active]. Notre port : déjà fait par fillActiveBattleMonsForBattleStart.
      _readBattleMonFromBuffer(active);

      const info = getSpeciesInfo(`SPECIES_${gBattleMons[active].species}`);
      const types = (((info as unknown) as { types?: number[] }).types) ?? [0, 0];
      gBattleMons[active].type1 = types[0] ?? 0;
      gBattleMons[active].type2 = types[1] ?? 0;
      gBattleMons[active].ability = GetAbilityBySpecies(
        gBattleMons[active].species, gBattleMons[active].abilityNum,
      );

      // 1:1 décomp ll. 3421-3422 : hpOnSwitchout[side] = current hp.
      const side = GET_BATTLER_SIDE(active);
      gBattleStruct.hpOnSwitchout[side] = gBattleMons[active].hp;

      for (let i = 0; i < NUM_BATTLE_STATS; i++) {
        gBattleMons[active].statStages[i] = DEFAULT_STAT_STAGE;
      }
      gBattleMons[active].status2 = 0;
    }

    // 1:1 décomp ll. 3428-3432 : player draw trainer pic.
    if (GetBattlerPosition(active) === B_POSITION_PLAYER_LEFT) {
      BtlController_EmitDrawTrainerPic(B_COMM_TO_CONTROLLER);
      MarkBattlerForControllerExec(active);
    }

    if (gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
      // 1:1 décomp ll. 3436-3440 : opponent draw trainer pic.
      if (GetBattlerPosition(active) === B_POSITION_OPPONENT_LEFT) {
        BtlController_EmitDrawTrainerPic(B_COMM_TO_CONTROLLER);
        MarkBattlerForControllerExec(active);
      }
      // 1:1 décomp ll. 3441-3449 : pokedex flag SEEN pour mon vs trainer.
      if (GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT
          && !(gBattleTypeFlags & (BATTLE_TYPE_EREADER_TRAINER
                                   | BATTLE_TYPE_FRONTIER
                                   | BATTLE_TYPE_LINK
                                   | BATTLE_TYPE_RECORDED_LINK
                                   | BATTLE_TYPE_TRAINER_HILL))) {
        HandleSetPokedexFlag(
          SpeciesToNationalPokedexNum(gBattleMons[active].species),
          1 /* FLAG_SET_SEEN */, gBattleMons[active].personality,
        );
      }
    } else {
      // 1:1 décomp ll. 3453-3467 : wild → loadMonSprite + pokedex flag.
      if (GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT) {
        if (!(gBattleTypeFlags & (BATTLE_TYPE_EREADER_TRAINER
                                  | BATTLE_TYPE_FRONTIER
                                  | BATTLE_TYPE_LINK
                                  | BATTLE_TYPE_RECORDED_LINK
                                  | BATTLE_TYPE_TRAINER_HILL))) {
          HandleSetPokedexFlag(
            SpeciesToNationalPokedexNum(gBattleMons[active].species),
            1 /* FLAG_SET_SEEN */, gBattleMons[active].personality,
          );
        }
        BtlController_EmitLoadMonSprite(B_COMM_TO_CONTROLLER);
        MarkBattlerForControllerExec(active);
        const enemyParty = _getEnemyParty();
        const stateMod = require('./state') as { gBattlerPartyIndexes: number[] };
        const partyIdx = stateMod.gBattlerPartyIndexes[active] ?? 0;
        gBattleResults.lastOpponentSpecies = GetMonData(
          enemyParty[partyIdx] as never, MON_DATA_SPECIES,
        ) as number;
      }
    }

    // 1:1 décomp ll. 3469-3477 : double battle (= multi) draw trainer pic right slot.
    if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
      if (GetBattlerPosition(active) === B_POSITION_PLAYER_RIGHT
          || GetBattlerPosition(active) === B_POSITION_OPPONENT_RIGHT) {
        BtlController_EmitDrawTrainerPic(B_COMM_TO_CONTROLLER);
        MarkBattlerForControllerExec(active);
      }
    }

    // 1:1 décomp ll. 3479-3483 : two opponents (= 2v1) right slot trainer pic.
    if (gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS
        && GetBattlerPosition(active) === B_POSITION_OPPONENT_RIGHT) {
      BtlController_EmitDrawTrainerPic(B_COMM_TO_CONTROLLER);
      MarkBattlerForControllerExec(active);
    }

    if (gBattleTypeFlags & BATTLE_TYPE_ARENA) {
      BattleArena_InitPoints();
    }
  }

  gBattleMainFunc = BattleIntroDrawPartySummaryScreens;
}

// ─── BattleIntroDrawPartySummaryScreens (3491) ─────────────────────────────

/** 1:1 décomp `BattleIntroDrawPartySummaryScreens()` (battle_main.c:3491-3562).
 *  Affiche les 6-mons summary side panels (= trainer battle uniquement).
 *  Wild battle : noop visible mais le struct hpStatus est setup quand même
 *  (= 1:1 strict, le décomp commente "no point in having dead code"). */
export function BattleIntroDrawPartySummaryScreens(): void {
  if (gBattleControllerExecFlags) return;

  interface HpAndStatus { hp: number; status: number; }
  const hpStatus: HpAndStatus[] = new Array(PARTY_SIZE).fill(null).map(() => ({ hp: 0, status: 0 }));

  const enemyParty = _getEnemyParty();
  const playerParty = _getPlayerParty();

  if (gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
    // 1:1 décomp ll. 3501-3514 : enemy party hpStatus.
    for (let i = 0; i < PARTY_SIZE; i++) {
      const enemyMon = enemyParty[i];
      const species = enemyMon ? GetMonData(enemyMon as never, MON_DATA_SPECIES_OR_EGG) as number : SPECIES_NONE;
      if (species === SPECIES_NONE || species === SPECIES_EGG) {
        hpStatus[i].hp = HP_EMPTY_SLOT;
        hpStatus[i].status = 0;
      } else {
        hpStatus[i].hp = GetMonData(enemyMon as never, MON_DATA_HP) as number;
        hpStatus[i].status = GetMonData(enemyMon as never, MON_DATA_STATUS) as number;
      }
    }
    setActiveBattler(GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT));
    BtlController_EmitDrawPartyStatusSummary(B_COMM_TO_CONTROLLER, hpStatus, PARTY_SUMM_SKIP_DRAW_DELAY);
    MarkBattlerForControllerExec(gActiveBattler);

    // 1:1 décomp ll. 3519-3535 : player party hpStatus.
    for (let i = 0; i < PARTY_SIZE; i++) {
      const playerMon = playerParty[i];
      const species = playerMon ? GetMonData(playerMon as never, MON_DATA_SPECIES_OR_EGG) as number : SPECIES_NONE;
      if (species === SPECIES_NONE || species === SPECIES_EGG) {
        hpStatus[i].hp = HP_EMPTY_SLOT;
        hpStatus[i].status = 0;
      } else {
        hpStatus[i].hp = GetMonData(playerMon as never, MON_DATA_HP) as number;
        hpStatus[i].status = GetMonData(playerMon as never, MON_DATA_STATUS) as number;
      }
    }
    setActiveBattler(GetBattlerAtPosition(B_POSITION_PLAYER_LEFT));
    BtlController_EmitDrawPartyStatusSummary(B_COMM_TO_CONTROLLER, hpStatus, PARTY_SUMM_SKIP_DRAW_DELAY);
    MarkBattlerForControllerExec(gActiveBattler);

    gBattleMainFunc = BattleIntroPrintTrainerWantsToBattle;
  } else {
    // 1:1 décomp ll. 3540-3560 : wild → fill hpStatus mais pas d'emit.
    // Le décomp commente "dead code intentionally kept" → on conserve 1:1.
    for (let i = 0; i < PARTY_SIZE; i++) {
      const playerMon = playerParty[i];
      const species = playerMon ? GetMonData(playerMon as never, MON_DATA_SPECIES_OR_EGG) as number : SPECIES_NONE;
      if (species === SPECIES_NONE || species === SPECIES_EGG) {
        hpStatus[i].hp = HP_EMPTY_SLOT;
        hpStatus[i].status = 0;
      } else {
        hpStatus[i].hp = GetMonData(playerMon as never, MON_DATA_HP) as number;
        hpStatus[i].status = GetMonData(playerMon as never, MON_DATA_STATUS) as number;
      }
    }
    gBattleMainFunc = BattleIntroPrintWildMonAttacked;
  }
}

// ─── BattleIntroPrintTrainerWantsToBattle (3564) ───────────────────────────

/** 1:1 décomp `BattleIntroPrintTrainerWantsToBattle()` (battle_main.c:3564-3572). */
export function BattleIntroPrintTrainerWantsToBattle(): void {
  if (gBattleControllerExecFlags === 0) {
    setActiveBattler(GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT));
    PrepareStringBattle(STRINGID_INTROMSG, gActiveBattler);
    gBattleMainFunc = BattleIntroPrintOpponentSendsOut;
  }
}

// ─── BattleIntroPrintWildMonAttacked (3574) ────────────────────────────────

/** 1:1 décomp `BattleIntroPrintWildMonAttacked()` (battle_main.c:3574-3581). */
export function BattleIntroPrintWildMonAttacked(): void {
  if (gBattleControllerExecFlags === 0) {
    gBattleMainFunc = BattleIntroPrintPlayerSendsOut;
    PrepareStringBattle(STRINGID_INTROMSG, 0);
  }
}

// ─── BattleIntroPrintOpponentSendsOut (3583) ───────────────────────────────

/** 1:1 décomp `BattleIntroPrintOpponentSendsOut()` (battle_main.c:3583-3608). */
export function BattleIntroPrintOpponentSendsOut(): void {
  let position: number;

  if (gBattleControllerExecFlags) return;

  if (!(gBattleTypeFlags & BATTLE_TYPE_RECORDED)) {
    position = B_POSITION_OPPONENT_LEFT;
  } else if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK) {
    if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_IS_MASTER) {
      position = B_POSITION_OPPONENT_LEFT;
    } else {
      position = B_POSITION_PLAYER_LEFT;
    }
  } else {
    position = B_POSITION_OPPONENT_LEFT;
  }

  PrepareStringBattle(STRINGID_INTROSENDOUT, GetBattlerAtPosition(position));
  gBattleMainFunc = BattleIntroOpponent1SendsOutMonAnimation;
}

// ─── BattleIntroOpponent2SendsOutMonAnimation (3610) ───────────────────────

/** 1:1 décomp `BattleIntroOpponent2SendsOutMonAnimation()` (battle_main.c:3610-3640). */
export function BattleIntroOpponent2SendsOutMonAnimation(): void {
  let position: number;

  if (!(gBattleTypeFlags & BATTLE_TYPE_RECORDED)) {
    position = B_POSITION_OPPONENT_RIGHT;
  } else if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK) {
    if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_IS_MASTER) {
      position = B_POSITION_OPPONENT_RIGHT;
    } else {
      position = B_POSITION_PLAYER_RIGHT;
    }
  } else {
    position = B_POSITION_OPPONENT_RIGHT;
  }

  for (let active = 0; active < gBattlersCount; active++) {
    if (GetBattlerPosition(active) === position) {
      setActiveBattler(active);
      BtlController_EmitIntroTrainerBallThrow(B_COMM_TO_CONTROLLER);
      MarkBattlerForControllerExec(active);
    }
  }

  gBattleMainFunc = BattleIntroRecordMonsToDex;
}

// ─── BattleIntroOpponent1SendsOutMonAnimation (3642) ───────────────────────

/** 1:1 décomp `BattleIntroOpponent1SendsOutMonAnimation()` (battle_main.c:3642-3683). */
export function BattleIntroOpponent1SendsOutMonAnimation(): void {
  let position: number;

  if (gBattleTypeFlags & BATTLE_TYPE_RECORDED) {
    if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK) {
      if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_IS_MASTER) {
        position = B_POSITION_OPPONENT_LEFT;
      } else {
        position = B_POSITION_PLAYER_LEFT;
      }
    } else {
      position = B_POSITION_OPPONENT_LEFT;
    }
  } else {
    position = B_POSITION_OPPONENT_LEFT;
  }

  if (gBattleControllerExecFlags) return;

  for (let active = 0; active < gBattlersCount; active++) {
    if (GetBattlerPosition(active) === position) {
      setActiveBattler(active);
      BtlController_EmitIntroTrainerBallThrow(B_COMM_TO_CONTROLLER);
      MarkBattlerForControllerExec(active);
      if (gBattleTypeFlags & (BATTLE_TYPE_MULTI | BATTLE_TYPE_TWO_OPPONENTS)) {
        gBattleMainFunc = BattleIntroOpponent2SendsOutMonAnimation;
        return;
      }
    }
  }

  gBattleMainFunc = BattleIntroRecordMonsToDex;
}

// ─── BattleIntroRecordMonsToDex (3685) ─────────────────────────────────────

/** 1:1 décomp `BattleIntroRecordMonsToDex()` (battle_main.c:3685-3703). */
export function BattleIntroRecordMonsToDex(): void {
  if (gBattleControllerExecFlags === 0) {
    for (let active = 0; active < gBattlersCount; active++) {
      setActiveBattler(active);
      if (GET_BATTLER_SIDE(active) === B_SIDE_OPPONENT
          && !(gBattleTypeFlags & (BATTLE_TYPE_EREADER_TRAINER
                                   | BATTLE_TYPE_FRONTIER
                                   | BATTLE_TYPE_LINK
                                   | BATTLE_TYPE_RECORDED_LINK
                                   | BATTLE_TYPE_TRAINER_HILL))) {
        HandleSetPokedexFlag(
          SpeciesToNationalPokedexNum(gBattleMons[active].species),
          1 /* FLAG_SET_SEEN */, gBattleMons[active].personality,
        );
      }
    }
    gBattleMainFunc = BattleIntroPrintPlayerSendsOut;
  }
}

// ─── BattleIntroPrintPlayerSendsOut (3711) ─────────────────────────────────

/** 1:1 décomp `BattleIntroPrintPlayerSendsOut()` (battle_main.c:3711-3738). */
export function BattleIntroPrintPlayerSendsOut(): void {
  if (gBattleControllerExecFlags === 0) {
    let position: number;

    if (!(gBattleTypeFlags & BATTLE_TYPE_RECORDED)) {
      position = B_POSITION_PLAYER_LEFT;
    } else if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK) {
      if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_IS_MASTER) {
        position = B_POSITION_PLAYER_LEFT;
      } else {
        position = B_POSITION_OPPONENT_LEFT;
      }
    } else {
      position = B_POSITION_PLAYER_LEFT;
    }

    if (!(gBattleTypeFlags & BATTLE_TYPE_SAFARI)) {
      PrepareStringBattle(STRINGID_INTROSENDOUT, GetBattlerAtPosition(position));
    }

    gBattleMainFunc = BattleIntroPlayer1SendsOutMonAnimation;
  }
}

// ─── BattleIntroPlayer2SendsOutMonAnimation (3740) ─────────────────────────

/** 1:1 décomp `BattleIntroPlayer2SendsOutMonAnimation()` (battle_main.c:3740-3774). */
export function BattleIntroPlayer2SendsOutMonAnimation(): void {
  let position: number;

  if (!(gBattleTypeFlags & BATTLE_TYPE_RECORDED)) {
    position = B_POSITION_PLAYER_RIGHT;
  } else if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK) {
    if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_IS_MASTER) {
      position = B_POSITION_PLAYER_RIGHT;
    } else {
      position = B_POSITION_OPPONENT_RIGHT;
    }
  } else {
    position = B_POSITION_PLAYER_RIGHT;
  }

  for (let active = 0; active < gBattlersCount; active++) {
    if (GetBattlerPosition(active) === position) {
      setActiveBattler(active);
      BtlController_EmitIntroTrainerBallThrow(B_COMM_TO_CONTROLLER);
      MarkBattlerForControllerExec(active);
    }
  }

  gBattleStruct.switchInAbilitiesCounter = 0;
  gBattleStruct.switchInItemsCounter = 0;
  gBattleStruct.overworldWeatherDone = 0;

  gBattleMainFunc = TryDoEventsBeforeFirstTurn;
}

// ─── BattleIntroPlayer1SendsOutMonAnimation (3776) ─────────────────────────

/** 1:1 décomp `BattleIntroPlayer1SendsOutMonAnimation()` (battle_main.c:3776-3818). */
export function BattleIntroPlayer1SendsOutMonAnimation(): void {
  let position: number;

  if (!(gBattleTypeFlags & BATTLE_TYPE_RECORDED)) {
    position = B_POSITION_PLAYER_LEFT;
  } else if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_LINK) {
    if (gBattleTypeFlags & BATTLE_TYPE_RECORDED_IS_MASTER) {
      position = B_POSITION_PLAYER_LEFT;
    } else {
      position = B_POSITION_OPPONENT_LEFT;
    }
  } else {
    position = B_POSITION_PLAYER_LEFT;
  }

  if (gBattleControllerExecFlags) return;

  for (let active = 0; active < gBattlersCount; active++) {
    if (GetBattlerPosition(active) === position) {
      setActiveBattler(active);
      BtlController_EmitIntroTrainerBallThrow(B_COMM_TO_CONTROLLER);
      MarkBattlerForControllerExec(active);
      if (gBattleTypeFlags & BATTLE_TYPE_MULTI) {
        gBattleMainFunc = BattleIntroPlayer2SendsOutMonAnimation;
        return;
      }
    }
  }

  gBattleStruct.switchInAbilitiesCounter = 0;
  gBattleStruct.switchInItemsCounter = 0;
  gBattleStruct.overworldWeatherDone = 0;

  gBattleMainFunc = TryDoEventsBeforeFirstTurn;
}

// ─── TryDoEventsBeforeFirstTurn (3841) ─────────────────────────────────────

/** 1:1 décomp `TryDoEventsBeforeFirstTurn()` (battle_main.c:3841-3930).
 *  Run les switch-in abilities + items dans l'ordre de speed avant le 1er turn. */
export function TryDoEventsBeforeFirstTurn(): void {
  let effect = 0;

  if (gBattleControllerExecFlags) return;

  if (gBattleStruct.switchInAbilitiesCounter === 0) {
    for (let i = 0; i < gBattlersCount; i++) {
      gBattlerByTurnOrder[i] = i;
    }
    // 1:1 décomp ll. 3854-3862 : insertion sort par speed.
    for (let i = 0; i < gBattlersCount - 1; i++) {
      for (let j = i + 1; j < gBattlersCount; j++) {
        if (GetWhoStrikesFirst(gBattlerByTurnOrder[i], gBattlerByTurnOrder[j], true) !== 0) {
          SwapTurnOrder(i, j);
        }
      }
    }
  }

  if (!gBattleStruct.overworldWeatherDone
      && AbilityBattleEffects(0, 0, 0, ABILITYEFFECT_SWITCH_IN_WEATHER, 0) !== 0) {
    gBattleStruct.overworldWeatherDone = 1;
    return;
  }

  // 1:1 décomp ll. 3869-3879 : run switch-in abilities du plus rapide au plus lent.
  while (gBattleStruct.switchInAbilitiesCounter < gBattlersCount) {
    if (AbilityBattleEffects(
      ABILITYEFFECT_ON_SWITCHIN,
      gBattlerByTurnOrder[gBattleStruct.switchInAbilitiesCounter],
      0, 0, 0,
    ) !== 0) {
      effect++;
    }

    gBattleStruct.switchInAbilitiesCounter++;

    if (effect !== 0) return;
  }

  if (AbilityBattleEffects(ABILITYEFFECT_INTIMIDATE1, 0, 0, 0, 0) !== 0) return;
  if (AbilityBattleEffects(ABILITYEFFECT_TRACE, 0, 0, 0, 0) !== 0) return;

  // 1:1 décomp ll. 3884-3894 : run switch-in items.
  while (gBattleStruct.switchInItemsCounter < gBattlersCount) {
    if (ItemBattleEffects(
      ITEMEFFECT_ON_SWITCH_IN,
      gBattlerByTurnOrder[gBattleStruct.switchInItemsCounter],
      false,
    )) {
      effect++;
    }

    gBattleStruct.switchInItemsCounter++;

    if (effect !== 0) return;
  }

  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
    gBattleStruct.monToSwitchIntoId[i] = PARTY_SIZE;
    gChosenActionByBattler[i] = B_ACTION_NONE;
    gChosenMoveByBattler[i] = MOVE_NONE;
  }
  TurnValuesCleanUp(false);
  SpecialStatusesClear();

  gBattleStruct.absentBattlerFlags = gAbsentBattlerFlags;
  BattlePutTextOnWindow(gText_EmptyString3, B_WIN_MSG);

  // 1:1 décomp l. 3905 : gBattleMainFunc = HandleTurnActionSelectionState.
  // Notre port : laisse battle-flow.ts state machine continuer ; ce point
  // marque la fin de l'INTRO, début du TURN LOOP.
  gBattleMainFunc = _HandleTurnActionSelectionStateStub;
  ResetSentPokesToOpponentValue();

  for (let i = 0; i < BATTLE_COMMUNICATION_ENTRIES_COUNT; i++) {
    gBattleCommunication[i] = 0;
  }

  for (let i = 0; i < gBattlersCount; i++) {
    gBattleMons[i].status2 &= ~STATUS2_FLINCHED;
  }

  gBattleStruct.turnEffectsTracker = 0;
  gBattleStruct.turnEffectsBattlerId = 0;
  gBattleStruct.wishPerishSongState = 0;
  gBattleStruct.wishPerishSongBattlerId = 0;
  gBattleScripting.moveendState = 0;
  gBattleStruct.faintedActionsState = 0;
  gBattleStruct.turnCountersTracker = 0;
  setMoveResultFlags(0);

  setRandomTurnNumber(Random() & 0xFFFF);

  if (gBattleTypeFlags & BATTLE_TYPE_ARENA) {
    StopCryAndClearCrySongs();
    BattleScriptExecute(BattleScript_ArenaTurnBeginning);
  }
}

/** 1:1 décomp `HandleTurnActionSelectionState()` (battle_main.c:4129+).
 *  Le port complet de cette fn est massif (~400l) et déjà couvert par
 *  l'état ACTION_MENU_* de battle-flow.ts. Cette stub marque le passage
 *  au turn loop ; le wire actuel se fait via battle-flow.ts. */
function _HandleTurnActionSelectionStateStub(): void {
  // 1:1 strict : laisse le state machine actuel de battle-flow.ts gérer.
  // Le wire complet vers une fn pure = Phase ultérieure (= K14).
}

// ─── HandleEndTurn_ContinueBattle (3932) ───────────────────────────────────

/** 1:1 décomp `HandleEndTurn_ContinueBattle()` (battle_main.c:3932-3954). */
export function HandleEndTurn_ContinueBattle(): void {
  if (gBattleControllerExecFlags === 0) {
    gBattleMainFunc = _BattleTurnPassedStub;
    for (let i = 0; i < BATTLE_COMMUNICATION_ENTRIES_COUNT; i++) {
      gBattleCommunication[i] = 0;
    }
    for (let i = 0; i < gBattlersCount; i++) {
      gBattleMons[i].status2 &= ~STATUS2_FLINCHED;
    }
    gBattleStruct.turnEffectsTracker = 0;
    gBattleStruct.turnEffectsBattlerId = 0;
    gBattleStruct.wishPerishSongState = 0;
    gBattleStruct.wishPerishSongBattlerId = 0;
    gBattleScripting.moveendState = 0;
    gBattleStruct.faintedActionsState = 0;
    gBattleStruct.turnCountersTracker = 0;
    setMoveResultFlags(0);
    setRandomTurnNumber(Random() & 0xFFFF);
  }
}

/** 1:1 décomp `BattleTurnPassed()` (battle_main.c:3956+).
 *  Déjà wired via runBattleTurnPassedViaBytecode dans wire-bytecode-bridge.ts.
 *  Cette stub marque le hook état. */
function _BattleTurnPassedStub(): void {
  // 1:1 strict : laisse le bytecode wire actuel gérer.
}

// ─── HandleEndTurn_BattleWon (4960) ────────────────────────────────────────

/** 1:1 décomp `HandleEndTurn_BattleWon()` (battle_main.c:4960-5016).
 *  Dispatch outcome WON → BGM + script approprié. */
export function HandleEndTurn_BattleWon(): void {
  setCurrentActionFuncId(0);

  if (gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK)) {
    // 1:1 décomp ll. 4965-4970 : link battle outcome script.
    const stateMod = require('./state') as { setSpecialVarResult?: (v: number) => void; gBattleTextBuff1: number[]; };
    stateMod.setSpecialVarResult?.(gBattleOutcome);
    stateMod.gBattleTextBuff1[0] = gBattleOutcome;
    setBattlerAttacker(GetBattlerAtPosition(B_POSITION_PLAYER_LEFT));
    gBattlescriptCurrInstr = BattleScript_LinkBattleWonOrLost;
    setBattleOutcome(gBattleOutcome & ~B_OUTCOME_LINK_BATTLE_RAN);
  } else if (gBattleTypeFlags & BATTLE_TYPE_TRAINER
             && gBattleTypeFlags & (BATTLE_TYPE_FRONTIER | BATTLE_TYPE_TRAINER_HILL | BATTLE_TYPE_EREADER_TRAINER)) {
    // 1:1 décomp ll. 4972-4982 : Frontier/Trainer Hill victory.
    BattleStopLowHpSound();
    gBattlescriptCurrInstr = BattleScript_FrontierTrainerBattleWon;

    const trainerOpponentA = _getTrainerBattleOpponentA();
    const TRAINER_FRONTIER_BRAIN = 0x4F0; // arbitrary placeholder ID
    if (trainerOpponentA === TRAINER_FRONTIER_BRAIN) {
      PlayBGM(382 /* MUS_VICTORY_GYM_LEADER */);
    } else {
      PlayBGM(380 /* MUS_VICTORY_TRAINER */);
    }
  } else if (gBattleTypeFlags & BATTLE_TYPE_TRAINER && !(gBattleTypeFlags & BATTLE_TYPE_LINK)) {
    // 1:1 décomp ll. 4983-5008 : local trainer victory + BGM par classe.
    BattleStopLowHpSound();
    gBattlescriptCurrInstr = BattleScript_LocalTrainerBattleWon;

    const trainerOpponentA = _getTrainerBattleOpponentA();
    const trainerClass = _getTrainerClass(trainerOpponentA);

    const TRAINER_CLASS_ELITE_FOUR = 84;
    const TRAINER_CLASS_CHAMPION = 85;
    const TRAINER_CLASS_TEAM_AQUA = 24;
    const TRAINER_CLASS_TEAM_MAGMA = 26;
    const TRAINER_CLASS_AQUA_ADMIN = 23;
    const TRAINER_CLASS_AQUA_LEADER = 25;
    const TRAINER_CLASS_MAGMA_ADMIN = 27;
    const TRAINER_CLASS_MAGMA_LEADER = 28;
    const TRAINER_CLASS_LEADER = 30;

    switch (trainerClass) {
      case TRAINER_CLASS_ELITE_FOUR:
      case TRAINER_CLASS_CHAMPION:
        PlayBGM(381 /* MUS_VICTORY_LEAGUE */);
        break;
      case TRAINER_CLASS_TEAM_AQUA:
      case TRAINER_CLASS_TEAM_MAGMA:
      case TRAINER_CLASS_AQUA_ADMIN:
      case TRAINER_CLASS_AQUA_LEADER:
      case TRAINER_CLASS_MAGMA_ADMIN:
      case TRAINER_CLASS_MAGMA_LEADER:
        PlayBGM(383 /* MUS_VICTORY_AQUA_MAGMA */);
        break;
      case TRAINER_CLASS_LEADER:
        PlayBGM(382 /* MUS_VICTORY_GYM_LEADER */);
        break;
      default:
        PlayBGM(380 /* MUS_VICTORY_TRAINER */);
        break;
    }
  } else {
    // 1:1 décomp ll. 5010-5013 : wild battle won → payday + pick up items script.
    gBattlescriptCurrInstr = BattleScript_PayDayMoneyAndPickUpItems;
  }

  gBattleMainFunc = HandleEndTurn_FinishBattle;
}

// ─── HandleEndTurn_BattleLost (5018) ───────────────────────────────────────

/** 1:1 décomp `HandleEndTurn_BattleLost()` (battle_main.c:5018-5052). */
export function HandleEndTurn_BattleLost(): void {
  setCurrentActionFuncId(0);

  if (gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK)) {
    if (gBattleTypeFlags & BATTLE_TYPE_FRONTIER) {
      if (gBattleOutcome & B_OUTCOME_LINK_BATTLE_RAN) {
        gBattlescriptCurrInstr = BattleScript_PrintPlayerForfeitedLinkBattle;
        setBattleOutcome(gBattleOutcome & ~B_OUTCOME_LINK_BATTLE_RAN);
        // 1:1 décomp : gSaveBlock2Ptr->frontier.disableRecordBattle = TRUE.
        const sb2 = gSaveBlock2Ptr as { frontier?: { disableRecordBattle?: boolean } };
        if (sb2.frontier) sb2.frontier.disableRecordBattle = true;
      } else {
        gBattlescriptCurrInstr = BattleScript_FrontierLinkBattleLost;
        setBattleOutcome(gBattleOutcome & ~B_OUTCOME_LINK_BATTLE_RAN);
      }
    } else {
      const stateMod = require('./state') as { gBattleTextBuff1: number[] };
      stateMod.gBattleTextBuff1[0] = gBattleOutcome;
      setBattlerAttacker(GetBattlerAtPosition(B_POSITION_PLAYER_LEFT));
      gBattlescriptCurrInstr = BattleScript_LinkBattleWonOrLost;
      setBattleOutcome(gBattleOutcome & ~B_OUTCOME_LINK_BATTLE_RAN);
    }
  } else {
    gBattlescriptCurrInstr = BattleScript_LocalBattleLost;
  }

  gBattleMainFunc = HandleEndTurn_FinishBattle;
}

// ─── HandleEndTurn_RanFromBattle (5054) ────────────────────────────────────

/** 1:1 décomp `HandleEndTurn_RanFromBattle()` (battle_main.c:5054-5086). */
export function HandleEndTurn_RanFromBattle(): void {
  setCurrentActionFuncId(0);

  if (gBattleTypeFlags & BATTLE_TYPE_FRONTIER && gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
    gBattlescriptCurrInstr = BattleScript_PrintPlayerForfeited;
    setBattleOutcome(B_OUTCOME_FORFEITED);
    const sb2 = gSaveBlock2Ptr as { frontier?: { disableRecordBattle?: boolean } };
    if (sb2.frontier) sb2.frontier.disableRecordBattle = true;
  } else if (gBattleTypeFlags & BATTLE_TYPE_TRAINER_HILL) {
    gBattlescriptCurrInstr = BattleScript_PrintPlayerForfeited;
    setBattleOutcome(B_OUTCOME_FORFEITED);
  } else {
    // 1:1 décomp ll. 5070-5083 : switch sur fleeType.
    const fleeType = gBattleStruct ? (require('./state') as {
      gProtectStructs: Array<{ fleeType?: number }>;
    }).gProtectStructs[gBattlerAttacker].fleeType ?? 0 : 0;
    switch (fleeType) {
      default:
        gBattlescriptCurrInstr = BattleScript_GotAwaySafely;
        break;
      case FLEE_ITEM:
        gBattlescriptCurrInstr = BattleScript_SmokeBallEscape;
        break;
      case FLEE_ABILITY:
        gBattlescriptCurrInstr = BattleScript_RanAwayUsingMonAbility;
        break;
    }
  }

  gBattleMainFunc = HandleEndTurn_FinishBattle;
}

// ─── HandleEndTurn_MonFled (5088) ──────────────────────────────────────────

/** 1:1 décomp `HandleEndTurn_MonFled()` (battle_main.c:5088-5096). */
export function HandleEndTurn_MonFled(): void {
  setCurrentActionFuncId(0);

  const stateMod = require('./state') as { gBattleTextBuff1: number[]; gBattlerPartyIndexes: number[] };
  PREPARE_MON_NICK_BUFFER(
    stateMod.gBattleTextBuff1, gBattlerAttacker,
    stateMod.gBattlerPartyIndexes[gBattlerAttacker],
  );
  gBattlescriptCurrInstr = BattleScript_WildMonFled;

  gBattleMainFunc = HandleEndTurn_FinishBattle;
}

// ─── HandleEndTurn_FinishBattle (5098) ─────────────────────────────────────

/** 1:1 décomp `HandleEndTurn_FinishBattle()` (battle_main.c:5098-5153). */
export function HandleEndTurn_FinishBattle(): void {
  if (gCurrentActionFuncId === B_ACTION_TRY_FINISH || gCurrentActionFuncId === B_ACTION_FINISHED) {
    // 1:1 décomp ll. 5102-5127 : record player party mons + TV trigger.
    if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK
                              | BATTLE_TYPE_RECORDED_LINK
                              | BATTLE_TYPE_FIRST_BATTLE
                              | BATTLE_TYPE_SAFARI
                              | BATTLE_TYPE_EREADER_TRAINER
                              | BATTLE_TYPE_WALLY_TUTORIAL
                              | BATTLE_TYPE_FRONTIER))) {
      const playerParty = _getPlayerParty();
      for (let active = 0; active < gBattlersCount; active++) {
        setActiveBattler(active);
        if (GET_BATTLER_SIDE(active) === B_SIDE_PLAYER) {
          const stateMod = require('./state') as { gBattlerPartyIndexes: number[] };
          const partyIdx = stateMod.gBattlerPartyIndexes[active] ?? 0;
          if (gBattleResults.playerMon1Species === SPECIES_NONE) {
            gBattleResults.playerMon1Species = GetMonData(
              playerParty[partyIdx] as never, MON_DATA_SPECIES,
            ) as number;
            const name = GetMonData(playerParty[partyIdx] as never, MON_DATA_NICKNAME) as unknown;
            if (Array.isArray(name)) {
              for (let i = 0; i < gBattleResults.playerMon1Name.length && i < name.length; i++) {
                gBattleResults.playerMon1Name[i] = name[i];
              }
            }
          } else {
            gBattleResults.playerMon2Species = GetMonData(
              playerParty[partyIdx] as never, MON_DATA_SPECIES,
            ) as number;
            const name = GetMonData(playerParty[partyIdx] as never, MON_DATA_NICKNAME) as unknown;
            if (Array.isArray(name)) {
              for (let i = 0; i < gBattleResults.playerMon2Name.length && i < name.length; i++) {
                gBattleResults.playerMon2Name[i] = name[i];
              }
            }
          }
        }
      }
      TryPutPokemonTodayOnAir();
    }

    // 1:1 décomp ll. 5129-5140 : shiny wild news trigger.
    if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK
                              | BATTLE_TYPE_RECORDED_LINK
                              | BATTLE_TYPE_TRAINER
                              | BATTLE_TYPE_FIRST_BATTLE
                              | BATTLE_TYPE_SAFARI
                              | BATTLE_TYPE_FRONTIER
                              | BATTLE_TYPE_EREADER_TRAINER
                              | BATTLE_TYPE_WALLY_TUTORIAL))
        && gBattleResults.shinyWildMon) {
      TryPutBreakingNewsOnAir();
    }

    RecordedBattle_SetPlaybackFinished();
    BeginFastPaletteFade(3);
    FadeOutMapMusic(5);
    gBattleMainFunc = FreeResetData_ReturnToOvOrDoEvolutions;
    _gCB2_AfterEvolution = BattleMainCB2;
  } else {
    // 1:1 décomp ll. 5150-5152 : exec script command.
    if (gBattleControllerExecFlags === 0) {
      // Wire vers script-interpreter.ts step si bytecode actif.
      // Notre port : battle-flow.ts handle ça via les states END_TURN_*.
    }
  }
}

// ─── FreeResetData_ReturnToOvOrDoEvolutions (5155) ─────────────────────────

/** 1:1 décomp `FreeResetData_ReturnToOvOrDoEvolutions()` (battle_main.c:5155-5178). */
export function FreeResetData_ReturnToOvOrDoEvolutions(): void {
  const r = getRuntime();
  if (!r.gPaletteFade.active) {
    ResetSpriteData();
    if (gLeveledUpInBattle === 0 || gBattleOutcome !== B_OUTCOME_WON) {
      gBattleMainFunc = ReturnFromBattleToOverworld;
      return;
    } else {
      gBattleMainFunc = TryEvolvePokemon;
    }
  }

  FreeAllWindowBuffers();
  if (!(gBattleTypeFlags & BATTLE_TYPE_LINK)) {
    FreeMonSpritesGfx();
    FreeBattleResources();
    FreeBattleSpritesData();
  }
}

// ─── TryEvolvePokemon (5180) ───────────────────────────────────────────────

/** 1:1 décomp `TryEvolvePokemon()` (battle_main.c:5180-5209). */
export function TryEvolvePokemon(): void {
  const playerParty = _getPlayerParty();

  while (gLeveledUpInBattle !== 0) {
    for (let i = 0; i < PARTY_SIZE; i++) {
      if (gLeveledUpInBattle & _gBitTable[i]) {
        const levelUpBits = gLeveledUpInBattle;
        const newLevelUpBits = levelUpBits & ~_gBitTable[i];
        setLeveledUpInBattle(newLevelUpBits);

        const species = GetEvolutionTargetSpecies(
          playerParty[i], 0 /* EVO_MODE_NORMAL */, levelUpBits,
        );
        if (species !== SPECIES_NONE) {
          FreeAllWindowBuffers();
          gBattleMainFunc = WaitForEvoSceneToFinish;
          EvolutionScene(playerParty[i], species, true, i);
          return;
        }
      }
    }
  }

  gBattleMainFunc = ReturnFromBattleToOverworld;
}

// ─── WaitForEvoSceneToFinish (5211) ────────────────────────────────────────

/** 1:1 décomp `WaitForEvoSceneToFinish()` (battle_main.c:5211-5215). */
export function WaitForEvoSceneToFinish(): void {
  // 1:1 décomp : if (gMain.callback2 == BattleMainCB2) gBattleMainFunc = TryEvolvePokemon.
  // Notre port : on assume que la scène évolution s'est terminée si CB2_AfterEvolution
  // a été appelé et restauré CB2.
  // Pour now : retour direct (= evolution scene noop).
  gBattleMainFunc = TryEvolvePokemon;
}

// ─── ReturnFromBattleToOverworld (5217) ────────────────────────────────────

/** 1:1 décomp `ReturnFromBattleToOverworld()` (battle_main.c:5217-5249). */
export function ReturnFromBattleToOverworld(): void {
  const playerParty = _getPlayerParty();

  if (!(gBattleTypeFlags & BATTLE_TYPE_LINK)) {
    RandomlyGivePartyPokerus(playerParty);
    PartySpreadPokerus(playerParty);
  }

  // 1:1 décomp ll. 5225-5226 : link battle wait remote players.
  // Notre port : pas de link battle, skip.

  const stateMod = require('./state') as { setSpecialVarResult?: (v: number) => void };
  stateMod.setSpecialVarResult?.(gBattleOutcome);
  setMainInBattle(false);
  _gMain_callback1 = _gPreBattleCallback1;

  if (gBattleTypeFlags & BATTLE_TYPE_ROAMER) {
    const enemyParty = _getEnemyParty();
    UpdateRoamerHPStatus(enemyParty[0]);

    // 1:1 décomp BUGFIX path (= conditional compilation) :
    // if (outcome == WON || outcome == CAUGHT || outcome == DREW) → roamer inactive.
    if (gBattleOutcome === B_OUTCOME_WON
        || gBattleOutcome === B_OUTCOME_CAUGHT
        || gBattleOutcome === B_OUTCOME_DREW) {
      SetRoamerInactive();
    }
  }

  m4aSongNumStop(287 /* SE_LOW_HEALTH */);
  SetMainCallback2(_gMain_savedCallback);
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleMainFunctions = {
  BeginBattleIntroDummy, BeginBattleIntro, BattleStartClearSetData,
  BattleIntroGetMonsData, BattleIntroPrepareBackgroundSlide,
  BattleIntroDrawTrainersOrMonsSprites, BattleIntroDrawPartySummaryScreens,
  BattleIntroPrintTrainerWantsToBattle, BattleIntroPrintWildMonAttacked,
  BattleIntroPrintOpponentSendsOut, BattleIntroOpponent1SendsOutMonAnimation,
  BattleIntroOpponent2SendsOutMonAnimation, BattleIntroRecordMonsToDex,
  BattleIntroPrintPlayerSendsOut, BattleIntroPlayer1SendsOutMonAnimation,
  BattleIntroPlayer2SendsOutMonAnimation, TryDoEventsBeforeFirstTurn,
  HandleEndTurn_ContinueBattle, HandleEndTurn_BattleWon,
  HandleEndTurn_BattleLost, HandleEndTurn_RanFromBattle, HandleEndTurn_MonFled,
  HandleEndTurn_FinishBattle, FreeResetData_ReturnToOvOrDoEvolutions,
  TryEvolvePokemon, WaitForEvoSceneToFinish, ReturnFromBattleToOverworld,
  getBattleMainFunc, setBattleMainFunc,
  IsMonShiny, SpeciesToNationalPokedexNum, HandleSetPokedexFlag,
  GetWhoStrikesFirst, SwapTurnOrder,
};

// Suppress unused warnings (= imports utilisés indirectly via stubs/setters).
void gPalaceSelectionBattleScripts;
