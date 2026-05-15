/**
 * battle/state.ts — 1:1 décomp battle global state (ewram).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:160-250`
 * (= `EWRAM_DATA` declarations). Notre port stocke ces vars dans un module
 * singleton accessible via `battleState`. Les opcodes lisent/écrivent directement
 * dessus (= 1:1 décomp pattern, pas d'abstraction).
 *
 * Pour Phase 1 niveau 1 (= damage flow basic), seuls les states utilisés par
 * Cmd_attackcanceler/accuracycheck/ppreduce/critcalc/damagecalc/typecalc/
 * adjustnormaldamage/healthbarupdate/datahpupdate/tryfaintmon/moveend sont
 * définis. Les autres seront ajoutés au fur et à mesure que les opcodes
 * Niveau 2+ sont portés.
 *
 * Cf. `D:/Projet 1/pokemon-web-demo/memory/SESSION-132-BACKING-SYSTEMS.md`
 * pour la roadmap complète Phase 1.
 */

import type { BattleMon } from './script-interpreter';

// 1:1 décomp `MAX_BATTLERS_COUNT` (include/constants/battle.h:9) = 4.
// 2 single battle + 2 partners en double battle.
export const MAX_BATTLERS_COUNT = 4;

/** 1:1 décomp `struct BattleScripting` (include/battle.h:489-518). */
export interface BattleScripting {
  painSplitHp: number;          // s32
  bideDmg: number;              // s32
  multihitString: number[];     // u8[6]
  dmgMultiplier: number;        // u8
  twoTurnsMoveStringId: number; // u8
  animArg1: number;             // u8
  animArg2: number;             // u8
  tripleKickPower: number;      // u16
  moveendState: number;         // u8
  battlerWithAbility: number;   // u8
  multihitMoveEffect: number;   // u8
  battler: number;              // u8 (= scratch)
  animTurn: number;             // u8
  animTargetsHit: number;       // u8
  statChanger: number;          // u8 (= stat id | (delta<<4))
  statAnimPlayed: number;       // bool8
  getexpState: number;          // u8
  battleStyle: number;          // u8
  drawlvlupboxState: number;    // u8
  learnMoveState: number;       // u8
  pursuitDoublesAttacker: number; // u8
  reshowMainState: number;      // u8
  reshowHelperState: number;    // u8
  levelUpHP: number;            // u8
  windowsType: number;          // u8 — B_WIN_TYPE_*
  multiplayerId: number;        // u8
  specialTrainerBattleType: number; // u8
}

function _makeBlankMon(): BattleMon {
  return {
    species: 0,
    attack: 0, defense: 0, speed: 0, spAttack: 0, spDefense: 0,
    moves: [0, 0, 0, 0],
    hpIV: 0, attackIV: 0, defenseIV: 0,
    speedIV: 0, spAttackIV: 0, spDefenseIV: 0,
    isEgg: false, abilityNum: 0,
    statStages: [0, 0, 0, 0, 0, 0, 0],
    ability: 0,
    type1: 0, type2: 0,
    pp: [0, 0, 0, 0],
    hp: 0, level: 0, friendship: 0,
    maxHP: 0, item: 0,
    nickname: '',
    ppBonuses: 0,
    otName: '',
    experience: 0,
    personality: 0,
    status1: 0, status2: 0,
    otId: 0,
  };
}

function _makeBlankScripting(): BattleScripting {
  return {
    painSplitHp: 0, bideDmg: 0,
    multihitString: [0, 0, 0, 0, 0, 0],
    dmgMultiplier: 1, twoTurnsMoveStringId: 0,
    animArg1: 0, animArg2: 0, tripleKickPower: 0,
    moveendState: 0, battlerWithAbility: 0, multihitMoveEffect: 0, battler: 0,
    animTurn: 0, animTargetsHit: 0,
    statChanger: 0, statAnimPlayed: 0,
    getexpState: 0, battleStyle: 0, drawlvlupboxState: 0,
    learnMoveState: 0, pursuitDoublesAttacker: 0,
    reshowMainState: 0, reshowHelperState: 0, levelUpHP: 0,
    windowsType: 0, multiplayerId: 0, specialTrainerBattleType: 0,
  };
}

// ─── Global state (= ewram vars) ────────────────────────────────────────────

/** 1:1 décomp `gBattleMons[MAX_BATTLERS_COUNT]` (battle_main.c:164). */
export const gBattleMons: BattleMon[] = [
  _makeBlankMon(), _makeBlankMon(), _makeBlankMon(), _makeBlankMon(),
];

/** Index dans gBattleMons[]. 0=player single, 1=opponent single,
 *  2/3=partners en double. Set par battle_main loop selon turn order. */
export let gBattlerAttacker = 0;
export let gBattlerTarget = 0;
export let gActiveBattler = 0;
export let gEffectBattler = 0;
export let gBattlerFainted = 0;
export let gPotentialItemEffectBattler = 0;

/** 1:1 décomp `gBattlersCount` (= 2 single, 4 double). */
export let gBattlersCount = 2;

/** 1:1 décomp `gCurrentMove` (= MOVE_XXX id 0..354). */
export let gCurrentMove = 0;
export let gChosenMove = 0;
export let gCalledMove = 0;

/** Index 0..3 dans gBattleMons[attacker].moves[]. */
export let gCurrMovePos = 0;
export let gChosenMovePos = 0;

/** 1:1 décomp `gBattleMoveDamage` (= s32, peut être négatif pour heal). */
export let gBattleMoveDamage = 0;

/** 1:1 décomp `gHpDealt`. */
export let gHpDealt = 0;

/** 1:1 décomp `gCritMultiplier` (= 1 ou 2). Set par Cmd_critcalc. */
export let gCritMultiplier = 1;

/** 1:1 décomp `gMultiHitCounter`. */
export let gMultiHitCounter = 0;

/** Bitflags MOVE_RESULT_* (= include/constants/battle.h). */
export let gMoveResultFlags = 0;

/** Bitflags HITMARKER_*. */
export let gHitMarker = 0;

/** B_OUTCOME_* (1=WIN, 2=LOST, 3=DRAW, 4=RAN, 5=PLAYER_TELEPORTED, etc.). */
export let gBattleOutcome = 0;

/** BATTLE_TYPE_* bitflags (= type de combat : wild, trainer, first, tutorial). */
export let gBattleTypeFlags = 0;

/** Bitflags WEATHER_*. */
export let gBattleWeather = 0;

/** Power dynamique override (= certains moves recalc power). */
export let gDynamicBasePower = 0;

/** 1:1 décomp `gBattleMovePower` (= power du move courant après dynamic adj). */
export let gBattleMovePower = 0;

/** 1:1 décomp `gBattleControllerExecFlags` (battle_main.c). Bitmask : bit `i`
 *  signifie que battler `i` a une commande controller en cours. Battle scripts
 *  block sur ce flag (= waitstate, waitanimation, waitmessage). Set par
 *  `MarkBattlerForControllerExec`, cleared par les controllers une fois leur
 *  job done. */
export let gBattleControllerExecFlags = 0;

/** 1:1 décomp `gPauseCounterBattle` (battle_main.c). Frame counter utilisé par
 *  Cmd_waitmessage + Cmd_pause pour timing message display. */
export let gPauseCounterBattle = 0;

/** 1:1 décomp `struct DisableStruct gDisableStructs[MAX_BATTLERS_COUNT]`
 *  (battle.h:438-468). Tracks per-battler effects que les moves doivent
 *  consulter (= disabled move, encored move, taunt, perish counter, etc.).
 *  Minimal set Niveau 4 (only what attackanimation reads via
 *  BtlController_EmitMoveAnimation = passed by pointer). */
export interface DisableStruct {
  transformedMonPersonality: number;
  disabledMove: number;
  disableTimer: number;       // s16 (low 4 bits)
  disableTimerStartValue: number; // s16 (high 4 bits)
  encoredMove: number;
  protectUses: number;
  stockpileCounter: number;
  substituteHP: number;
  disableTimerXX: number;
  encoreTimer: number;        // (low 4 bits)
  encoreTimerStartValue: number;
  perishSongTimer: number;    // (low 4 bits)
  perishSongTimerStartValue: number;
  furyCutterCounter: number;
  rolloutTimer: number;       // (low 4 bits)
  rolloutTimerStartValue: number;
  chargeTimer: number;        // (low 4 bits)
  chargeTimerStartValue: number;
  tauntTimer: number;         // (low 4 bits)
  tauntTimer2: number;        // (high 4 bits)
  battlerPreventingEscape: number;
  battlerWithSureHit: number;
  isFirstTurn: number;
  unused1: number;
  truantCounter: number;      // (1 bit)
  truantUnknownBit: number;   // (1 bit)
  unused2: number;
  mimickedMoves: number;      // u8 bitfield (4 bits)
  rechargeCounter: number;
  unused3: number;
}

function _makeBlankDisableStruct(): DisableStruct {
  return {
    transformedMonPersonality: 0, disabledMove: 0,
    disableTimer: 0, disableTimerStartValue: 0,
    encoredMove: 0, protectUses: 0,
    stockpileCounter: 0, substituteHP: 0,
    disableTimerXX: 0, encoreTimer: 0, encoreTimerStartValue: 0,
    perishSongTimer: 0, perishSongTimerStartValue: 0,
    furyCutterCounter: 0,
    rolloutTimer: 0, rolloutTimerStartValue: 0,
    chargeTimer: 0, chargeTimerStartValue: 0,
    tauntTimer: 0, tauntTimer2: 0,
    battlerPreventingEscape: 0, battlerWithSureHit: 0,
    isFirstTurn: 0, unused1: 0,
    truantCounter: 0, truantUnknownBit: 0, unused2: 0,
    mimickedMoves: 0, rechargeCounter: 0, unused3: 0,
  };
}

export const gDisableStructs: DisableStruct[] = [
  _makeBlankDisableStruct(), _makeBlankDisableStruct(),
  _makeBlankDisableStruct(), _makeBlankDisableStruct(),
];

/** `gBattlescriptCurrInstr` dans le décomp est un pointer ; ici c'est l'offset
 *  dans le bytecode (= `BattleScriptContext.scriptPtr` du runtime). Maintenu
 *  synchrone par le runBattleScript loop. */

/** 1:1 décomp `gBattleScripting`. */
export const gBattleScripting: BattleScripting = _makeBlankScripting();

/** Side statuses (= reflect/light_screen/safeguard/mist per side). */
export const gSideStatuses: number[] = [0, 0];

/** Status3 per battler (= longer-term statuses : leech_seed, perish_song, etc.). */
export const gStatuses3: number[] = [0, 0, 0, 0];

/** Last move used per battler (= for Mirror Move). */
export const gLastMoves: number[] = [0, 0, 0, 0];
export const gLastLandedMoves: number[] = [0, 0, 0, 0];
export const gLastHitByType: number[] = [0, 0, 0, 0];
export const gLastResultingMoves: number[] = [0, 0, 0, 0];
export const gLastUsedMove: number[] = [0, 0, 0, 0];
export let gLastUsedAbility = 0;
export let gLastUsedItem = 0;

/** Last hit by battler index per battler. */
export const gLastHitBy: number[] = [0, 0, 0, 0];

/** Battler turn order : gBattlerByTurnOrder[i] = battler index qui agit i-ième. */
export const gBattlerByTurnOrder: number[] = [0, 0, 0, 0];

/** Communication channel (= used for MISS_TYPE etc. inter-script). */
export const gBattleCommunication: number[] = new Array(16).fill(0);

/** Helpers pour set les vars (= les exports `let` sont read-only en TS modules). */
export function setBattlerAttacker(v: number) { gBattlerAttacker = v; }
export function setBattlerTarget(v: number) { gBattlerTarget = v; }
export function setActiveBattler(v: number) { gActiveBattler = v; }
export function setEffectBattler(v: number) { gEffectBattler = v; }
export function setBattlerFainted(v: number) { gBattlerFainted = v; }
export function setPotentialItemEffectBattler(v: number) { gPotentialItemEffectBattler = v; }
export function setBattlersCount(v: number) { gBattlersCount = v; }
export function setCurrentMove(v: number) { gCurrentMove = v; }
export function setChosenMove(v: number) { gChosenMove = v; }
export function setCurrMovePos(v: number) { gCurrMovePos = v; }
export function setBattleMoveDamage(v: number) { gBattleMoveDamage = v; }
export function setHpDealt(v: number) { gHpDealt = v; }
export function setCritMultiplier(v: number) { gCritMultiplier = v; }
export function setMultiHitCounter(v: number) { gMultiHitCounter = v; }
export function setMoveResultFlags(v: number) { gMoveResultFlags = v; }
export function setHitMarker(v: number) { gHitMarker = v; }
export function setBattleOutcome(v: number) { gBattleOutcome = v; }
export function setBattleTypeFlags(v: number) { gBattleTypeFlags = v; }
export function setBattleWeather(v: number) { gBattleWeather = v; }
export function setDynamicBasePower(v: number) { gDynamicBasePower = v; }
export function setBattleMovePower(v: number) { gBattleMovePower = v; }
export function setBattleControllerExecFlags(v: number) { gBattleControllerExecFlags = v; }
export function setPauseCounterBattle(v: number) { gPauseCounterBattle = v; }
export function setLastUsedAbility(v: number) { gLastUsedAbility = v; }
export function setLastUsedItem(v: number) { gLastUsedItem = v; }

/** Reset complet du state battle (= appelé au début de chaque battle, 1:1
 *  décomp `BattleStruct_Free` + reinit ewram). */
export function resetBattleState(): void {
  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
    Object.assign(gBattleMons[i], _makeBlankMon());
    gSideStatuses[i & 1] = 0;
    gStatuses3[i] = 0;
    gLastMoves[i] = 0;
    gLastLandedMoves[i] = 0;
    gLastHitByType[i] = 0;
    gLastResultingMoves[i] = 0;
    gLastUsedMove[i] = 0;
    gLastHitBy[i] = 0;
    gBattlerByTurnOrder[i] = 0;
  }
  Object.assign(gBattleScripting, _makeBlankScripting());
  for (let i = 0; i < gBattleCommunication.length; i++) gBattleCommunication[i] = 0;
  gBattlerAttacker = 0;
  gBattlerTarget = 0;
  gActiveBattler = 0;
  gEffectBattler = 0;
  gBattlerFainted = 0;
  gPotentialItemEffectBattler = 0;
  gBattlersCount = 2;
  gCurrentMove = 0;
  gChosenMove = 0;
  gCalledMove = 0;
  gCurrMovePos = 0;
  gChosenMovePos = 0;
  gBattleMoveDamage = 0;
  gHpDealt = 0;
  gCritMultiplier = 1;
  gMultiHitCounter = 0;
  gMoveResultFlags = 0;
  gHitMarker = 0;
  gBattleOutcome = 0;
  gBattleTypeFlags = 0;
  gBattleWeather = 0;
  gDynamicBasePower = 0;
  gLastUsedAbility = 0;
  gLastUsedItem = 0;
  gBattleMovePower = 0;
  gBattleControllerExecFlags = 0;
  gPauseCounterBattle = 0;
  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
    Object.assign(gDisableStructs[i], _makeBlankDisableStruct());
  }
}

// Expose pour devtools / debug.
(globalThis as Record<string, unknown>).__battleState = {
  gBattleMons,
  getAttacker: () => gBattlerAttacker,
  getTarget: () => gBattlerTarget,
  getCurrentMove: () => gCurrentMove,
  getBattleMoveDamage: () => gBattleMoveDamage,
  getCritMultiplier: () => gCritMultiplier,
  getMoveResultFlags: () => gMoveResultFlags,
  getHitMarker: () => gHitMarker,
  getBattleOutcome: () => gBattleOutcome,
  gBattleScripting,
  resetBattleState,
};
