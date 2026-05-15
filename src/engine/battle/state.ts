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

/** 1:1 décomp `struct BattleScripting` (battle.h). Subset utilisé Niveau 1. */
export interface BattleScripting {
  painSplitHp: number;
  bideDmg: number;
  multihitMoveEffect: number;
  saveBattler: number;
  multiplayerId: number;
  specialTrainerBattleType: number;
  bcDxAnimationsKickedIn: number;
  statChanger: number;
  statAnimPlayed: number;
  atk49_state: number;          // moveend state
  battlerWithAbility: number;
  battler: number;              // generic scratch battler index
  multihitString: number[];
  dmgMultiplier: number;        // damage multiplier (typically 1, set by certain effects)
  twoTurnsMoveStringId: number;
  animArg1: number;
  animArg2: number;
  tripleKickPower: number;
  moveendState: number;
  battlerSavedHealth: number;
  field_23: number;
  windowsType: number;
  multiplayerId_2: number;
  specialTrainerBattleType_2: number;
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
    painSplitHp: 0, bideDmg: 0, multihitMoveEffect: 0,
    saveBattler: 0, multiplayerId: 0, specialTrainerBattleType: 0,
    bcDxAnimationsKickedIn: 0, statChanger: 0, statAnimPlayed: 0,
    atk49_state: 0, battlerWithAbility: 0, battler: 0,
    multihitString: [0, 0, 0, 0, 0, 0],
    dmgMultiplier: 1, twoTurnsMoveStringId: 0,
    animArg1: 0, animArg2: 0, tripleKickPower: 0, moveendState: 0,
    battlerSavedHealth: 0, field_23: 0, windowsType: 0,
    multiplayerId_2: 0, specialTrainerBattleType_2: 0,
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
