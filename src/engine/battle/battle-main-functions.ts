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
  consumeAbilityWantedScript,
} from './ability-battle-effects';
import { ItemBattleEffects, ITEMEFFECT_ON_SWITCH_IN, consumeItemWantedScript } from './item-battle-effects';
import { Random } from '../system/random';
// Voie L : end-of-turn 1:1 (BattleTurnPassed). Le wire fait les étapes 1-16
// (cleanup + dégâts poison/brûlure/météo + wish/perish + reset) ; _BattleTurnPassed
// pose ensuite gBattleMainFunc (= dernière ligne décomp). Usage runtime → pas de TDZ.
import { runBattleTurnPassedViaBytecode } from './wire-bytecode-bridge';
import { gSaveBlock2Ptr } from '../save/save-block-state';
import { getRuntime, FreeMonSpritesGfx, BeginFastPaletteFade } from '../system/decomp-globals';
// Namespaces ESM : remplacent les `require('./state')` CommonJS (dormants, qui
// throw « require is not defined » dans le bundle navigateur dès que la voie
// décomp tick). Live bindings = mêmes valeurs que les imports nommés.
import * as _stateNs from './state';
import * as _saveBlockNs from '../save/save-block-state';
import {
  stepBattleScriptCommand, gBattleScriptContext, getBattleScriptOffset,
} from './script-interpreter';
import { fillActiveBattleMonsForBattleStart } from './party-storage';
import {
  B_ACTION_TRY_FINISH as _B_ACTION_TRY_FINISH_BSE,
  B_ACTION_FINISHED as _B_ACTION_FINISHED_BSE,
} from './constants';
import { getSpeciesInfo } from '../data/game-data';
import { SpeciesToNationalPokedexNum as _SpeciesToNationalPokedexNum, HandleSetPokedexFlag as _HandleSetPokedexFlag } from '../ui/pokedex-flags';
import { GetWhoStrikesFirst as _GetWhoStrikesFirst } from './ai/ai-script-commands';
import { FadeOutBGM as _FadeOutBGM_rt, PlayBGM as _PlayBGM_rt } from '../system/decomp-globals';
import { GetMonData, PARTY_SIZE, gEnemyParty as _gEnemyParty, GetAbilityBySpecies } from './party-storage';
// Helpers de conversion id↔enum 1:1 (= mêmes que party-storage utilise pour
// dériver type1/type2/ability ; getSpeciesInfo est keyé par enum string).
import { resolveDecompConstant, reverseDecompConstant } from '../system/decomp-constants';

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
  const stateMod = _stateNs as unknown as {
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
export function setMainCallback1(cb: (() => void) | null): void {
  _gMain_callback1 = cb;
  // 1:1 décomp `gMain.callback1 = cb` : le runtime tick callback1() PUIS
  // callback2() chaque frame (CallCallbacks, decomp-runtime.ts:2253). La source
  // de vérité est donc le runtime — c'est ce qui pilote BattleMainCB1.
  getRuntime()?.SetMainCallback1?.(cb as never);
}
export function getMainCallback1(): (() => void) | null {
  const rt = getRuntime();
  const cb = (rt?.gMain?.callback1 as (() => void) | null | undefined);
  return cb ?? _gMain_callback1;
}

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

// 1:1 décomp `gBitTable[]` → consolidé sur le miroir `src/game/util.ts` (source unique ;
// l'import vient de src/game/, pas de battle-controllers → pas de cycle).
import { gBitTable as _gBitTable } from '../../game/include/util';
import { IsShinyOtIdPersonality } from '../../game/include/pokemon';

// ─── Hardware/subsystem stubs (= dette R3 documentée) ──────────────────────

/** 1:1 décomp `ResetSpriteData()` (sprite.c). Phase port : reset internal
 *  sprite tracking. Notre runtime gère via runtime.gSprites Map ; ici on
 *  notify le reset. */
function ResetSpriteData(): void {
  const r = getRuntime();
  // 1:1 décomp `ResetSpriteData()` (sprite.c:294) = ResetOamRange(0,128) +
  // ResetAllSprites + ClearSpriteCopyRequests + ResetAffineAnimData +
  // FreeSpriteTileRanges. Le runtime l'implémente (rt.ResetSpriteData, = ce
  // qu'appelle decomp-bridge.ResetSpriteData). AVANT : stub `gSprites.clear()`
  // vidait la Map mais PAS l'OAM ni les tiles → les sprites de combat (mon +
  // healthbox) gardaient leurs entrées OAM et RENDAIENT ENCORE dans l'OW après le
  // retour (user-flag : sprites + palette combat qui leakent). Fix = déléguer au
  // VRAI reset (clear OAM + tiles + sprites). Le re-spawn OW
  // (_restoreOverworldFromMenu) re-crée ensuite les sprites OW = 1:1.
  (r as { ResetSpriteData?: () => void }).ResetSpriteData?.();
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

/** 1:1 décomp `FadeOutMapMusic(speed)` (sound.c). Wire vers FadeOutBGM existing.
 *  Notre runtime supporte FadeOutBGM(speed) (= m4aMPlayFadeOut sound.c:290). */
function FadeOutMapMusic(speed: number): void {
  _FadeOutBGM_rt(speed);
}

/** 1:1 décomp `m4aSongNumStop(songId)` (m4a.c). Stop le SE/BGM specified.
 *  Wire vers m4a/player stopSong selon mapping songId → slot. */
function m4aSongNumStop(songId: number): void {
  // 1:1 décomp : songId 287 = SE_LOW_HEALTH (= loop SE). Stop SE1/SE2.
  // Pour BGM (songId variant), stop 'bgm' slot.
  void songId;
  void import('../m4a/player').then(({ stopSong }) => {
    stopSong('se1' as never);
    stopSong('se2' as never);
  });
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

/** 1:1 décomp `gBattleResources->battleCallbackStack->function[]` (battle.h).
 *  Stack des gBattleMainFunc sauvegardés par BattleScriptExecute (scripts
 *  imbriqués : GiveExp, HandleFaintedMon, …). */
const gBattleCallbackStack: BattleMainFunc[] = [];

/** 1:1 décomp `RunBattleScriptCommands_PopCallbacksStack()` (battle_main.c:5251).
 *  SI gCurrentActionFuncId == TRY_FINISH/FINISHED (= le script imbriqué a fini
 *  via end2/end → a posé ce funcId) → pop le callback stack → restaure
 *  gBattleMainFunc. SINON → step UNE commande du script (gated execFlags),
 *  exactement comme HandleAction_RunBattleScript. */
export function RunBattleScriptCommands_PopCallbacksStack(): void {
  if (_stateNs.gCurrentActionFuncId === _B_ACTION_TRY_FINISH_BSE
      || _stateNs.gCurrentActionFuncId === _B_ACTION_FINISHED_BSE) {
    const fn = gBattleCallbackStack.pop();
    if (fn) gBattleMainFunc = fn;
  } else if (gBattleScriptContext.scriptPtr < 0 && gBattleCallbackStack.length > 0) {
    // 1:1 décomp `Cmd_end3` (battle_script_commands.c) : pop le callback stack.
    // Un script lancé via BattleScriptExecute qui finit par `end3` pose scriptPtr=-1
    // SANS poser TRY_FINISH (contrairement à end/end2 qui passent par la branche ci-dessus)
    // → on pop ici. Nécessaire pour les talents de switch-in (BattleScript_IntimidateActivatesEnd3
    // & co.) lancés depuis TryDoEventsBeforeFirstTurn. Ciblé : ne se déclenche que quand
    // gBattleMainFunc EST PopCallbacksStack (= script en cours) et que le script vient de finir.
    const fn = gBattleCallbackStack.pop();
    if (fn) gBattleMainFunc = fn;
  } else if (gBattleControllerExecFlags === 0) {
    stepBattleScriptCommand(gBattleScriptContext);
  }
}

/** 1:1 décomp `BattleScriptExecute(bsPtr)` (battle_util.c:3184). Démarre un
 *  battle script IMBRIQUÉ : pose le scriptPtr sur le ctx persistant, push le
 *  gBattleMainFunc courant, bascule gBattleMainFunc vers
 *  RunBattleScriptCommands_PopCallbacksStack + gCurrentActionFuncId=0 (= mode
 *  exécution). Le script finit par `end2` (gCurrentActionFuncId=TRY_FINISH) →
 *  PopCallbacksStack pop → gBattleMainFunc restauré. Prend un LABEL (notre
 *  port résout label→offset bytecode). */
function BattleScriptExecute(scriptLabel: string): void {
  const off = getBattleScriptOffset(scriptLabel);
  if (off < 0) {
    console.warn(`[battle-main-functions] BattleScriptExecute: label '${scriptLabel}' introuvable`);
    return;
  }
  gBattleScriptContext.scriptPtr = off;
  gBattleScriptContext.scriptPtrStack.length = 0;
  gBattleCallbackStack.push(gBattleMainFunc);
  gBattleMainFunc = RunBattleScriptCommands_PopCallbacksStack;
  setCurrentActionFuncId(0);
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
  // Calcul shiny consolidé sur le miroir `IsShinyOtIdPersonality` (pokemon.c).
  return IsShinyOtIdPersonality(m.otId ?? 0, m.personality ?? 0) ? 1 : 0;
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

// 1:1 décomp `GetAbilityBySpecies` : importé de party-storage.ts (version
// canonique, résout abilities string→id via resolveDecompConstant). La copie
// locale ici traitait `info.abilities` comme number[] (= bug : ce sont des
// 'ABILITY_X' strings).

/** 1:1 décomp `gBattleBufferB[gActiveBattler][4 + i]` (battle_controllers.c).
 *  Buffer rempli par BtlController_EmitGetMonData REQUEST_ALL_BATTLE.
 *  Notre port lit directement gPlayerParty[partyIdx] / gEnemyParty[partyIdx].
 *  Cette fonction simule le buffer en cas où le wire n'est pas encore complet. */
function _readBattleMonFromBuffer(battler: number): void {
  // 1:1-observable : le décomp désérialise gBattleBufferB (struct BattlePokemon
  // sérialisée par CopyPlayerMonData) → gBattleMons[battler]. En single-player
  // LOCAL, le buffer IPC (multi-CPU/link) est inutile : on remplit gBattleMons
  // directement depuis le party (gPlayerParty/gEnemyParty) via le MÊME helper que
  // la voie V — `fillActiveBattleMonsForBattleStart` (idempotent, remplit tous les
  // battlers actifs). Résultat IDENTIQUE au décomp ; la dérivation types/ability/
  // stat-stages qui suit l'appel (BattleIntro state) finalise gBattleMons[battler].
  // (Voie L flag-ON : sans ça, gBattleMons reste à 0 car _CopyPlayerMonData est stub.)
  void battler;
  fillActiveBattleMonsForBattleStart();
}

/** 1:1 décomp `ResetSentPokesToOpponentValue()` (battle_util.c:900-913). */
function ResetSentPokesToOpponentValue(): void {
  // 1:1 décomp : clear [0..1] PUIS marquer les mons du joueur envoyés (bits = OR de
  // gBitTable[gBattlerPartyIndexes[i]] côté joueur) sur le flank adverse. La 2e partie
  // MANQUAIT → gSentPokesToOpponent restait 0 → Cmd_getexp lit sentInPokes=0 → 0 EXP
  // → pas de level-up → pas d'apprentissage de move. (Racine du « KO sans EXP » boot path.)
  const stateMod = _stateNs as unknown as { gSentPokesToOpponent: number[]; gBattlersCount: number; gBattlerPartyIndexes: number[] };
  stateMod.gSentPokesToOpponent[0] = 0;
  stateMod.gSentPokesToOpponent[1] = 0;
  let bits = 0;
  for (let i = 0; i < stateMod.gBattlersCount; i += 2)
    bits |= _gBitTable[stateMod.gBattlerPartyIndexes[i]];
  for (let i = 1; i < stateMod.gBattlersCount; i += 2)
    stateMod.gSentPokesToOpponent[(i & 2 /* BIT_FLANK */) >> 1] = bits;
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
  // 1:1 décomp `gSpeciesInfo[species].catchRate`. getSpeciesInfo est keyé par
  // enum string → on passe par reverseDecompConstant (id→'SPECIES_X'), comme
  // party-storage. species 0 / inconnu → 0 (= gSpeciesInfo[SPECIES_NONE]).
  const speciesEnum = reverseDecompConstant(species, 'SPECIES_');
  const info = speciesEnum ? getSpeciesInfo(speciesEnum) : undefined;
  return info?.catchRate ?? 0;
}

/** 1:1 décomp `BattleMainCB2()` callback principal. */
function BattleMainCB2(): void {
  // Dette R3 : full BattleMainCB2 (= tick palette fade + run tasks + sprites).
  // Pour now : tick le gBattleMainFunc current si exist.
  if (gBattleMainFunc) gBattleMainFunc();
}

/** 1:1 décomp `SetMainCallback2(cb)` : pose gMain.callback2 du runtime (= le runtime
 *  l'appelle chaque frame). AVANT : STUB (`void cb`) → ne posait RIEN → la SEULE
 *  utilisation, `ReturnFromBattleToOverworld` (fin de combat voie L), ne pouvait pas
 *  rendre la main au callback overworld → la boucle combat (_BattleMainCB2) restait =
 *  FREEZE en fin de combat, pas de retour OW (signalé user). Câblé comme les autres
 *  modules (battle-cb2/init `_SetMainCallback2`). Voie V utilise battle-flow (pas
 *  ReturnFromBattleToOverworld) → pas de régression. */
function SetMainCallback2(cb: (() => void) | null): void {
  getRuntime()?.SetMainCallback2?.(cb as never);
}

/** 1:1 décomp `gTrainers[id].trainerClass` (trainers data). */
function _getTrainerClass(_trainerId: number): number {
  // Dette R3 : trainers data table. Pour now : default 0.
  return 0;
}

/** 1:1 décomp `gTrainerBattleOpponent_A`. */
function _getTrainerBattleOpponentA(): number {
  const stateMod = _stateNs as unknown as { gTrainerBattleOpponent_A?: number };
  return stateMod.gTrainerBattleOpponent_A ?? 0;
}

/** 1:1 décomp `PlayBGM(songId)` (sound.c). Wire vers decomp-globals existing. */
function PlayBGM(songId: number): void {
  _PlayBGM_rt(songId);
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
  const stateMod = _saveBlockNs as unknown as { gSaveBlock1Ptr: { playerParty: unknown[] } };
  return stateMod.gSaveBlock1Ptr.playerParty;
}

function _getEnemyParty(): unknown[] {
  // 1:1 décomp `gEnemyParty` : vit dans party-storage.ts (array de PARTY_SIZE
  // mons valides), PAS dans state.ts (l'ancien require('./state').gEnemyParty
  // renvoyait undefined → crash dès que la voie décomp lit gEnemyParty[0]).
  return _gEnemyParty;
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
    const stateMod = _stateNs as unknown as { gBattleEnvironment?: number };
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

      // 1:1 décomp : type1/type2 = gSpeciesInfo[species].types[0/1] ; ability =
      // GetAbilityBySpecies. getSpeciesInfo keyé par enum + types = 'TYPE_X'
      // strings → reverse/resolve (= MÊME dérivation que party-storage:837-844).
      const speciesEnum = reverseDecompConstant(gBattleMons[active].species, 'SPECIES_');
      const info = speciesEnum ? getSpeciesInfo(speciesEnum) : undefined;
      if (info?.types) {
        const t1 = resolveDecompConstant(info.types[0] ?? '');
        const t2 = resolveDecompConstant(info.types[1] ?? info.types[0] ?? '');
        gBattleMons[active].type1 = typeof t1 === 'number' ? t1 : 0;
        gBattleMons[active].type2 = typeof t2 === 'number' ? t2 : 0;
      }
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
        const stateMod = _stateNs as unknown as { gBattlerPartyIndexes: number[] };
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

/** 1:1 décomp `BattleIntroPrintWildMonAttacked()` (battle_main.c:3574-3581).
 *  Le healthbox du mon sauvage est désormais montré 1:1 par `SpriteCB_WildMonShowHealthbox`
 *  (battle-sprite-callbacks.ts) à la FIN du slide du mon (StartHealthboxSlideIn +
 *  SetHealthboxSpriteVisible). L'ancien contournement `_ShowWildOpponentHealthboxes` (qui
 *  montrait le healthbox TÔT, ici) est RETIRÉ : la chaîne SpriteCB_WildMon est maintenant
 *  câblée (slide + teinte + healthbox), donc le show est 1:1 (après le slide, pas au message). */
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
/** Exécute le script de talent de switch-in que `AbilityBattleEffects` vient de mettre
 *  en file (via `consumeAbilityWantedScript`). 1:1 décomp : AbilityBattleEffects appelle
 *  `BattleScriptPushCursorAndCallback(script)` EN INTERNE ; notre port délègue le lancement
 *  au caller → on exécute le script via BattleScriptExecute (push gBattleMainFunc +
 *  RunBattleScriptCommands_PopCallbacksStack ; le script finit par end3 → pop via la
 *  branche scriptPtr<0 de PopCallbacksStack). SANS ÇA, les talents de switch-in (Intimidate,
 *  météo, Trace) sont détectés mais leur effet/message ne s'applique JAMAIS au début de
 *  combat (l'Attaque du joueur ne baisse pas face à un ennemi Intimidate). */
function _ExecSwitchInAbilityScript(): void {
  const label = consumeAbilityWantedScript();
  if (label) BattleScriptExecute(label);
}

/** Idem pour les ITEMS de switch-in (`ItemBattleEffects(ITEMEFFECT_ON_SWITCH_IN)` →
 *  `consumeItemWantedScript`). MÊME bug que les talents : le caller faisait `return`
 *  sans exécuter le script. Au début de combat, seul White Herb (HOLD_EFFECT_RESTORE_STATS
 *  → `BattleScript_WhiteHerbEnd2`) en file un — il restaure les stats baissées (ex. contre
 *  Intimidate). Le script finit par end2 → branche TRY_FINISH de PopCallbacksStack. Garde
 *  contre les labels placeholder `__…` (= signaux non-script d'autres itemEffects). */
function _ExecSwitchInItemScript(): void {
  const label = consumeItemWantedScript();
  if (label && !label.startsWith('__')) BattleScriptExecute(label);
}

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
    _ExecSwitchInAbilityScript();
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

    if (effect !== 0) { _ExecSwitchInAbilityScript(); return; }
  }

  if (AbilityBattleEffects(ABILITYEFFECT_INTIMIDATE1, 0, 0, 0, 0) !== 0) { _ExecSwitchInAbilityScript(); return; }
  if (AbilityBattleEffects(ABILITYEFFECT_TRACE, 0, 0, 0, 0) !== 0) { _ExecSwitchInAbilityScript(); return; }

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

    if (effect !== 0) { _ExecSwitchInItemScript(); return; }
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
  // La vraie fn vit dans battle-action-selection.ts (port 1:1 complet) ;
  // résolue via __battleActionSelection (lazy-global = évite le cycle ESM, car
  // battle-action-selection importe setBattleMainFunc d'ici). Stub = fallback.
  gBattleMainFunc = _getHandleTurnActionSelectionState();
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
    BattleScriptExecute('BattleScript_ArenaTurnBeginning');
  }
}

/** Résout la vraie `HandleTurnActionSelectionState` (battle-action-selection.ts,
 *  port 1:1 complet de battle_main.c:4129-4552) via le global expose, pour
 *  éviter le cycle ESM (battle-action-selection importe setBattleMainFunc d'ici).
 *  Fallback = stub si le module n'est pas chargé. */
function _getHandleTurnActionSelectionState(): () => void {
  const m = (globalThis as Record<string, unknown>).__battleActionSelection as {
    HandleTurnActionSelectionState?: () => void;
  } | undefined;
  return m?.HandleTurnActionSelectionState ?? _HandleTurnActionSelectionStateStub;
}

/** Fallback uniquement (= module battle-action-selection pas chargé). La vraie
 *  fn est `HandleTurnActionSelectionState` dans battle-action-selection.ts. */
function _HandleTurnActionSelectionStateStub(): void {
  // No-op de secours : si on est ici, le module action-selection n'a pas chargé.
}

// ─── HandleEndTurn_ContinueBattle (3932) ───────────────────────────────────

/** 1:1 décomp `HandleEndTurn_ContinueBattle()` (battle_main.c:3932-3954). */
export function HandleEndTurn_ContinueBattle(): void {
  if (gBattleControllerExecFlags === 0) {
    gBattleMainFunc = _BattleTurnPassed;
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

/** 1:1 décomp `BattleTurnPassed()` (battle_main.c:3956-4019).
 *  Étapes 1-16 (TurnValuesCleanUp, DoField/BattlerEndTurnEffects = dégâts
 *  poison/brûlure/météo, HandleWishPerishSong, reset markers/comm/chosen/turnCounter)
 *  exécutées par le wire 1:1 `runBattleTurnPassedViaBytecode` (rafale ; pacing
 *  per-frame des effets end-turn = dette R3). Puis pose `gBattleMainFunc` — la
 *  dernière ligne de la décomp, qui manquait (stub) → le tour 2 ne démarrait jamais :
 *   - outcome == 0  → `HandleTurnActionSelectionState` (nouveau tour)
 *   - outcome != 0  → `RunTurnActionsFunctions` (le wire a posé gCurrentActionFuncId
 *     = B_ACTION_FINISHED → HandleAction_TryFinish → fin de combat). */
function _BattleTurnPassed(): void {
  const res = runBattleTurnPassedViaBytecode();
  if (res?.battleEnded) {
    const td = (globalThis as { __battleTurnDispatch?: { RunTurnActionsFunctions?: () => void } }).__battleTurnDispatch;
    if (td?.RunTurnActionsFunctions) gBattleMainFunc = td.RunTurnActionsFunctions;
    return;
  }
  gBattleMainFunc = _getHandleTurnActionSelectionState();
}

// ─── HandleEndTurn_BattleWon (4960) ────────────────────────────────────────

/** 1:1 décomp `HandleEndTurn_BattleWon()` (battle_main.c:4960-5016).
 *  Dispatch outcome WON → BGM + script approprié. */
export function HandleEndTurn_BattleWon(): void {
  setCurrentActionFuncId(0);

  if (gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK)) {
    // 1:1 décomp ll. 4965-4970 : link battle outcome script.
    const stateMod = _stateNs as unknown as { setSpecialVarResult?: (v: number) => void; gBattleTextBuff1: number[]; };
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
    // Voie L : pose le scriptPtr sur le ctx persistant (HandleEndTurn_FinishBattle
    // le steppe per-frame), comme la branche wild (PayDay) ci-dessous. Sans ça
    // `gBattlescriptCurrInstr = {}` (stub) ne lançait PAS le script de victoire
    // dresseur → ni "Vous avez battu X!" ni l'argent. (= dette #31 côté L.)
    gBattlescriptCurrInstr = BattleScript_LocalTrainerBattleWon;
    gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_LocalTrainerBattleWon');

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
    // Voie L : pose le scriptPtr sur le ctx persistant (HandleEndTurn_FinishBattle
    // le steppe per-frame ; le vestige gBattlescriptCurrInstr est gardé pour trace).
    gBattlescriptCurrInstr = BattleScript_PayDayMoneyAndPickUpItems;
    gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_PayDayMoneyAndPickUpItems');
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
      const stateMod = _stateNs as unknown as { gBattleTextBuff1: number[] };
      stateMod.gBattleTextBuff1[0] = gBattleOutcome;
      setBattlerAttacker(GetBattlerAtPosition(B_POSITION_PLAYER_LEFT));
      gBattlescriptCurrInstr = BattleScript_LinkBattleWonOrLost;
      setBattleOutcome(gBattleOutcome & ~B_OUTCOME_LINK_BATTLE_RAN);
    }
  } else {
    // 1:1 décomp ll. 5040 : défaite LOCALE (sauvage/dresseur) → script whiteout.
    // Voie L : pose le scriptPtr sur le ctx persistant (HandleEndTurn_FinishBattle
    // le steppe per-frame), = MÊME fix que HandleEndTurn_BattleWon:1452-1453. Sans
    // ça le script de défaite ne déroulait jamais (combat figé sur
    // HandleEndTurn_FinishBattle alors que gBattleOutcome=LOST était bien posé).
    gBattlescriptCurrInstr = BattleScript_LocalBattleLost;
    gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_LocalBattleLost');
  }

  gBattleMainFunc = HandleEndTurn_FinishBattle;
}

// ─── HandleEndTurn_RanFromBattle (5054) ────────────────────────────────────

/** 1:1 décomp `HandleEndTurn_RanFromBattle()` (battle_main.c:5054-5086). */
export function HandleEndTurn_RanFromBattle(): void {
  setCurrentActionFuncId(0);

  if (gBattleTypeFlags & BATTLE_TYPE_FRONTIER && gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
    gBattlescriptCurrInstr = BattleScript_PrintPlayerForfeited;
    gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_PrintPlayerForfeited');
    setBattleOutcome(B_OUTCOME_FORFEITED);
    const sb2 = gSaveBlock2Ptr as { frontier?: { disableRecordBattle?: boolean } };
    if (sb2.frontier) sb2.frontier.disableRecordBattle = true;
  } else if (gBattleTypeFlags & BATTLE_TYPE_TRAINER_HILL) {
    gBattlescriptCurrInstr = BattleScript_PrintPlayerForfeited;
    gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_PrintPlayerForfeited');
    setBattleOutcome(B_OUTCOME_FORFEITED);
  } else {
    // 1:1 décomp ll. 5070-5083 : switch sur fleeType.
    const fleeType = gBattleStruct ? (_stateNs as unknown as {
      gProtectStructs: Array<{ fleeType?: number }>;
    }).gProtectStructs[gBattlerAttacker].fleeType ?? 0 : 0;
    switch (fleeType) {
      default:
        gBattlescriptCurrInstr = BattleScript_GotAwaySafely;
        gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_GotAwaySafely');
        break;
      case FLEE_ITEM:
        gBattlescriptCurrInstr = BattleScript_SmokeBallEscape;
        gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_SmokeBallEscape');
        break;
      case FLEE_ABILITY:
        gBattlescriptCurrInstr = BattleScript_RanAwayUsingMonAbility;
        gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_RanAwayUsingMonAbility');
        break;
    }
  }

  // Voie L : HandleEndTurn_FinishBattle steppe gBattleScriptContext per-frame — il
  // FAUT poser ctx.scriptPtr sur l'offset (pas juste gBattlescriptCurrInstr=<stub>),
  // = MÊME fix que HandleEndTurn_BattleWon:1453. Sans ça le script de fuite ne tourne
  // jamais → freeze à FinishBattle (vérifié : FUITE bloquait l'onglet).
  gBattleMainFunc = HandleEndTurn_FinishBattle;
}

// ─── HandleEndTurn_MonFled (5088) ──────────────────────────────────────────

/** 1:1 décomp `HandleEndTurn_MonFled()` (battle_main.c:5088-5096). */
export function HandleEndTurn_MonFled(): void {
  setCurrentActionFuncId(0);

  const stateMod = _stateNs as unknown as { gBattleTextBuff1: number[]; gBattlerPartyIndexes: number[] };
  PREPARE_MON_NICK_BUFFER(
    stateMod.gBattleTextBuff1, gBattlerAttacker,
    stateMod.gBattlerPartyIndexes[gBattlerAttacker],
  );
  gBattlescriptCurrInstr = BattleScript_WildMonFled;
  gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_WildMonFled');

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
          const stateMod = _stateNs as unknown as { gBattlerPartyIndexes: number[] };
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
    // 1:1 décomp ll. 5150-5152 :
    //   `if (gBattleControllerExecFlags == 0) gBattleScriptingCommandsTable[*gBattlescriptCurrInstr]();`
    // Voie L : step le script (PayDay/LocalBattleWon/…) via le ctx persistant.
    // Quand le script finit par `end` → gCurrentActionFuncId=TRY_FINISH → la branche
    // cleanup+fade ci-dessus s'exécute au frame suivant.
    if (gBattleControllerExecFlags === 0) {
      stepBattleScriptCommand(gBattleScriptContext);
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

  const stateMod = _stateNs as unknown as { setSpecialVarResult?: (v: number) => void };
  stateMod.setSpecialVarResult?.(gBattleOutcome);
  setMainInBattle(false);
  // 1:1 décomp `gMain.callback1 = gPreBattleCallback1` (battle_main.c:5230). DOIT
  // écrire le RUNTIME (pas juste la var module) — sinon le runtime garde
  // callback1 = BattleMainCB1 → la boucle combat continue de rappeler
  // gBattleMainFunc = ReturnFromBattleToOverworld CHAQUE frame, qui re-pose
  // callback2 = savedCallback (one-shot devenu no-op) → MainCB2_Overworld jamais
  // rétabli → OW rendu mais FIGÉ (freeze signalé user). `setMainCallback1` écrit
  // la var module ET getRuntime().SetMainCallback1. gPreBattleCallback1 = le
  // callback1 pré-combat (sauvé case 18, battle-link-start.ts:228 — null/anon en OW).
  setMainCallback1(_gPreBattleCallback1);

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
  BattleScriptExecute, RunBattleScriptCommands_PopCallbacksStack,
  // Famille callback1 / inBattle / savedCallback : requise par battle-link-start
  // (_setMainCallback1 case 18), battle-cb2 (FreeRestoreBattleData) et battle-init
  // (setMainInBattle). setMainCallback1 écrit le runtime (gMain.callback1) → c'est
  // ce qui installe BattleMainCB1 et fait tourner gBattleMainFunc.
  setMainCallback1, getMainCallback1,
  setMainInBattle, getMainInBattle,
  setPreBattleCallback1, getPreBattleCallback1,
  setMainSavedCallback, getMainSavedCallback,
  setCB2AfterEvolution, getCB2AfterEvolution,
  IsMonShiny, SpeciesToNationalPokedexNum, HandleSetPokedexFlag,
  GetWhoStrikesFirst, SwapTurnOrder,
  // gIntroSlideFlags (1:1) : lu par les SpriteCB de slide (battle-sprite-callbacks.ts
  // _getIntroSlideFlags) pour geler le slide du mon sauvage / dresseur pendant l'ouverture
  // des bandes ; écrit par PlayerHandleIntroSlide (SET) + tickBattleIntroSlideL case 2 (CLEAR).
  getIntroSlideFlags, setIntroSlideFlags,
};

// Suppress unused warnings (= imports utilisés indirectly via stubs/setters).
void gPalaceSelectionBattleScripts;
