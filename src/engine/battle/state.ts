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

/** 1:1 décomp `gBattlerPartyIndexes[MAX_BATTLERS_COUNT]` (battle.c).
 *  Indique quel slot de la party (0..PARTY_SIZE-1) chaque battler occupe.
 *  Pour single battle : [0, 0, 0, 0] (= chaque side a son mon en slot 0).
 *  Pour double battle : [0, 0, 1, 1] (= deux mons par side, slots 0 + 1).
 *  Note : `gBattlerPositions` est défini dans util.ts (= legacy, à migrer
 *  un jour ici). */
export const gBattlerPartyIndexes: number[] = [0, 0, 0, 0];

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

/** 1:1 décomp `gBattleStruct->dynamicMoveType` — type dynamique pour Hidden
 *  Power / Weather Ball / Magnitude. Avec flags F_DYNAMIC_TYPE_SET (1<<7) +
 *  F_DYNAMIC_TYPE_IGNORE_PHYSICALITY (1<<6) en bits hauts. */
export let gDynamicMoveType = 0;

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

/** 1:1 décomp `gCurrentActionFuncId` (battle_main.c:162). Current action handler
 *  index (B_ACTION_*) — set par Cmd_finishaction/Cmd_finishturn etc. */
export let gCurrentActionFuncId = 0;

/** 1:1 décomp `gCurrentTurnActionNumber` (battle_main.c:162). Compteur de
 *  battler ayant agi ce tour. Incrémenté à chaque action terminée. */
export let gCurrentTurnActionNumber = 0;

/** 1:1 décomp `struct DisableStruct` (include/battle.h:70-102). Tracks per-battler
 *  effects que les moves doivent consulter (= disabled move, encored move,
 *  taunt, perish counter, etc.). */
export interface DisableStruct {
  transformedMonPersonality: number;  // u32
  disabledMove: number;               // u16
  encoredMove: number;                // u16
  protectUses: number;                // u8
  stockpileCounter: number;           // u8
  substituteHP: number;               // u8
  disableTimer: number;               // u8:4
  disableTimerStartValue: number;     // u8:4
  encoredMovePos: number;             // u8
  filler_D: number;                   // u8 unused
  encoreTimer: number;                // u8:4
  encoreTimerStartValue: number;      // u8:4
  perishSongTimer: number;            // u8:4
  perishSongTimerStartValue: number;  // u8:4
  furyCutterCounter: number;          // u8
  rolloutTimer: number;               // u8:4
  rolloutTimerStartValue: number;     // u8:4
  chargeTimer: number;                // u8:4
  chargeTimerStartValue: number;      // u8:4
  tauntTimer: number;                 // u8:4
  tauntTimer2: number;                // u8:4
  battlerPreventingEscape: number;    // u8
  battlerWithSureHit: number;         // u8
  isFirstTurn: number;                // u8
  filler_17: number;                  // u8 unused
  truantCounter: number;              // u8:1
  truantSwitchInHack: number;         // u8:1
  filler_18_2: number;                // u8:2 unused
  mimickedMoves: number;              // u8:4
  rechargeTimer: number;              // u8
}

function _makeBlankDisableStruct(): DisableStruct {
  return {
    transformedMonPersonality: 0, disabledMove: 0, encoredMove: 0,
    protectUses: 0, stockpileCounter: 0, substituteHP: 0,
    disableTimer: 0, disableTimerStartValue: 0,
    encoredMovePos: 0, filler_D: 0,
    encoreTimer: 0, encoreTimerStartValue: 0,
    perishSongTimer: 0, perishSongTimerStartValue: 0,
    furyCutterCounter: 0,
    rolloutTimer: 0, rolloutTimerStartValue: 0,
    chargeTimer: 0, chargeTimerStartValue: 0,
    tauntTimer: 0, tauntTimer2: 0,
    battlerPreventingEscape: 0, battlerWithSureHit: 0,
    isFirstTurn: 0, filler_17: 0,
    truantCounter: 0, truantSwitchInHack: 0, filler_18_2: 0,
    mimickedMoves: 0, rechargeTimer: 0,
  };
}

export const gDisableStructs: DisableStruct[] = [
  _makeBlankDisableStruct(), _makeBlankDisableStruct(),
  _makeBlankDisableStruct(), _makeBlankDisableStruct(),
];

/** 1:1 décomp `struct SideTimer gSideTimers[2]` (battle.h:418-432). Per-side
 *  active turn counters pour reflect/lightscreen/mist/safeguard/spikes/etc. */
export interface SideTimer {
  reflectTimer: number;
  reflectBattlerId: number;
  lightscreenTimer: number;
  lightscreenBattlerId: number;
  mistTimer: number;
  mistBattlerId: number;
  safeguardTimer: number;
  safeguardBattlerId: number;
  followmeTimer: number;
  followmeTarget: number;
  spikesAmount: number;
  fieldB: number;
}

function _makeBlankSideTimer(): SideTimer {
  return {
    reflectTimer: 0, reflectBattlerId: 0,
    lightscreenTimer: 0, lightscreenBattlerId: 0,
    mistTimer: 0, mistBattlerId: 0,
    safeguardTimer: 0, safeguardBattlerId: 0,
    followmeTimer: 0, followmeTarget: 0,
    spikesAmount: 0, fieldB: 0,
  };
}

export const gSideTimers: SideTimer[] = [_makeBlankSideTimer(), _makeBlankSideTimer()];

/** 1:1 décomp `struct ProtectStruct gProtectStructs[MAX_BATTLERS_COUNT]`
 *  (include/battle.h:104-130). Reset à chaque turn. Bit fields représentés
 *  en bool/number ici. */
export interface ProtectStruct {
  protected: number;            // u32:1
  endured: number;              // u32:1
  noValidMoves: number;         // u32:1
  helpingHand: number;          // u32:1
  bounceMove: number;           // u32:1
  stealMove: number;            // u32:1
  flag0Unknown: number;         // u32:1
  prlzImmobility: number;       // u32:1
  confusionSelfDmg: number;     // u32:1
  targetNotAffected: number;    // u32:1
  chargingTurn: number;         // u32:1
  fleeType: number;             // u32:2 — 0:Normal, 1:FLEE_ITEM, 2:FLEE_ABILITY
  usedImprisonedMove: number;   // u32:1
  loveImmobility: number;       // u32:1
  usedDisabledMove: number;     // u32:1
  usedTauntedMove: number;      // u32:1
  flag2Unknown: number;         // u32:1
  flinchImmobility: number;     // u32:1
  notFirstStrike: number;       // u32:1
  palaceUnableToUseMove: number; // u32:1
  physicalDmg: number;          // u32
  specialDmg: number;           // u32
  physicalBattlerId: number;    // u8
  specialBattlerId: number;     // u8
}

function _makeBlankProtectStruct(): ProtectStruct {
  return {
    protected: 0, endured: 0, noValidMoves: 0, helpingHand: 0,
    bounceMove: 0, stealMove: 0, flag0Unknown: 0,
    prlzImmobility: 0, confusionSelfDmg: 0, targetNotAffected: 0,
    chargingTurn: 0, fleeType: 0,
    usedImprisonedMove: 0, loveImmobility: 0,
    usedDisabledMove: 0, usedTauntedMove: 0, flag2Unknown: 0,
    flinchImmobility: 0, notFirstStrike: 0, palaceUnableToUseMove: 0,
    physicalDmg: 0, specialDmg: 0,
    physicalBattlerId: 0, specialBattlerId: 0,
  };
}

export const gProtectStructs: ProtectStruct[] = [
  _makeBlankProtectStruct(), _makeBlankProtectStruct(),
  _makeBlankProtectStruct(), _makeBlankProtectStruct(),
];

/** 1:1 décomp `struct SpecialStatus gSpecialStatuses[MAX_BATTLERS_COUNT]`
 *  (include/battle.h:132-147). */
export interface SpecialStatus {
  statLowered: number;              // u32:1
  lightningRodRedirected: number;   // u32:1
  restoredBattlerSprite: number;    // u32:1
  intimidatedMon: number;           // u32:1
  traced: number;                   // u32:1
  ppNotAffectedByPressure: number;  // u32:1
  faintedHasReplacement: number;    // u32:1
  focusBanded: number;              // u32:1
  shellBellDmg: number;             // s32
  physicalDmg: number;              // s32
  specialDmg: number;               // s32
  physicalBattlerId: number;        // u8
  specialBattlerId: number;         // u8
}

function _makeBlankSpecialStatus(): SpecialStatus {
  return {
    statLowered: 0, lightningRodRedirected: 0,
    restoredBattlerSprite: 0, intimidatedMon: 0,
    traced: 0, ppNotAffectedByPressure: 0,
    faintedHasReplacement: 0, focusBanded: 0,
    shellBellDmg: 0, physicalDmg: 0, specialDmg: 0,
    physicalBattlerId: 0, specialBattlerId: 0,
  };
}

export const gSpecialStatuses: SpecialStatus[] = [
  _makeBlankSpecialStatus(), _makeBlankSpecialStatus(),
  _makeBlankSpecialStatus(), _makeBlankSpecialStatus(),
];

/** 1:1 décomp `gAbsentBattlerFlags` (battle_main.c). Bitmask: bit `i` est set
 *  si battler `i` est absent (= fainted ou pas encore envoyé). */
export let gAbsentBattlerFlags = 0;
export function setAbsentBattlerFlags(v: number) { gAbsentBattlerFlags = v; }

/** 1:1 décomp `gBattleEnvironment` (battle_main.c). BATTLE_ENVIRONMENT_*
 *  enum 0..9 set par battle setup en fonction du terrain (= grass, sand,
 *  water, cave...). Lu par Cmd_getsecretpowereffect / Cmd_settypetoenvironment /
 *  Cmd_callenvironmentattack. */
export let gBattleEnvironment = 0;
export function setBattleEnvironment(v: number) { gBattleEnvironment = v; }

/** 1:1 décomp `gPaydayMoney` (battle_main.c). Compteur du money accumulé par
 *  Pay Day pour le combat courant. */
export let gPaydayMoney = 0;
export function setPaydayMoney(v: number) { gPaydayMoney = v; }

/** 1:1 décomp `struct WishFutureKnock gWishFutureKnock` (battle.h:401-413). */
export interface WishFutureKnock {
  futureSightCounter: number[];   // u8[4]
  futureSightAttacker: number[];  // u8[4]
  futureSightDmg: number[];       // s32[4]
  futureSightMove: number[];      // u16[4]
  wishCounter: number[];          // u8[4]
  wishMonId: number[];            // u8[4]
  weatherDuration: number;        // u8
  knockedOffMons: number;         // u8 bitfield per battler
}

export const gWishFutureKnock: WishFutureKnock = {
  futureSightCounter: [0, 0, 0, 0],
  futureSightAttacker: [0, 0, 0, 0],
  futureSightDmg: [0, 0, 0, 0],
  futureSightMove: [0, 0, 0, 0],
  wishCounter: [0, 0, 0, 0],
  wishMonId: [0, 0, 0, 0],
  weatherDuration: 0,
  knockedOffMons: 0,
};

/** `gBattlescriptCurrInstr` dans le décomp est un pointer ; ici c'est l'offset
 *  dans le bytecode (= `BattleScriptContext.scriptPtr` du runtime). Maintenu
 *  synchrone par le runBattleScript loop. */

/** 1:1 décomp `gBattleScripting`. */
export const gBattleScripting: BattleScripting = _makeBlankScripting();

/** Side statuses (= reflect/light_screen/safeguard/mist per side). */
export const gSideStatuses: number[] = [0, 0];

/** Status3 per battler (= longer-term statuses : leech_seed, perish_song, etc.). */
export const gStatuses3: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gLockedMoves[MAX_BATTLERS_COUNT]` (battle_main.c). Set par
 *  CancelMultiTurnMoves cleanup quand Rollout / Bide / Uproar enchaînent. */
export const gLockedMoves: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBideDmg[MAX_BATTLERS_COUNT]` (battle_main.c). Accumulé pendant
 *  les turns Bide, retourné × 2 quand Bide se déclenche. */
export const gBideDmg: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBideTarget[MAX_BATTLERS_COUNT]` (battle_main.c). Target id
 *  sauvegardé pour le retour de Bide. */
export const gBideTarget: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBattleStruct->usedHeldItems[MAX_BATTLERS_COUNT]` (battle.h
 *  BattleStruct). Item utilisé/perdu pendant le combat, restauré par Recycle
 *  ou à la fin du combat. */
export const gUsedHeldItems: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBattleStruct->intimidateBattler` — set par AbilityBattleEffects
 *  pour signaler quel battler doit déclencher Intimidate. */
export let gIntimidateBattler = 0;
export function setIntimidateBattler(v: number) { gIntimidateBattler = v; }

/** 1:1 décomp `gBattleStruct->formToChangeInto` — Castform/Cherrim. */
export let gFormToChangeInto = 0;
export function setFormToChangeInto(v: number) { gFormToChangeInto = v; }

/** 1:1 décomp `gBattleStruct->synchronizeMoveEffect` — Synchronize ability
 *  reflect status1 (poison/burn/paralysis/toxic) back to attacker. */
export let gSynchronizeMoveEffect = 0;
export function setSynchronizeMoveEffect(v: number) { gSynchronizeMoveEffect = v; }

/** 1:1 décomp `gBattleStruct->hpScale` — résultat de Cmd_hpthresholds /
 *  Cmd_hpthresholds2. Valeur 0..3 utilisée pour choisir un message de bataille
 *  selon les % HP restants du target adverse. */
export let gHpScale = 0;
export function setHpScale(v: number) { gHpScale = v; }

/** 1:1 décomp `gBattleStruct->hpOnSwitchout[2]` — HP du Pokémon précédent à la
 *  switch-out, par side (0=player, 1=opponent). Lu par Cmd_hpthresholds2 pour
 *  calculer le % de dégâts depuis la switch. */
export const gHpOnSwitchout: number[] = [0, 0];

/** 1:1 décomp `gTrainerBattleOpponent_A/B` (battle_setup.c). Trainer ID
 *  opponent — déterminé au battle setup, lu par Cmd_getmoneyreward pour
 *  GetTrainerMoneyToGive(). */
export let gTrainerBattleOpponent_A = 0;
export let gTrainerBattleOpponent_B = 0;
export function setTrainerBattleOpponentA(v: number) { gTrainerBattleOpponent_A = v; }
export function setTrainerBattleOpponentB(v: number) { gTrainerBattleOpponent_B = v; }

/** 1:1 décomp `gBattleStruct->wrappedBy[MAX_BATTLERS_COUNT]` — battler ID qui
 *  a wrapped chaque battler (= utilisé par Rapid Spin pour BattleScript_WrapFree). */
export const gWrappedBy: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBattleStruct->wrappedMove[MAX_BATTLERS_COUNT*2]` — u16 move id
 *  per battler (= BIND / WRAP / FIRE_SPIN / etc.). */
export const gWrappedMove: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gLastPrintedMoves[MAX_BATTLERS_COUNT]` (battle_main.c). Dernier
 *  move dont le nom a été print (= différent de gLastMoves : printed = move
 *  qui a réussi à être déclaré, last = move attempted). Utilisé par Sketch
 *  (Cmd_copymovepermanently) pour copier le move successfully announced. */
export const gLastPrintedMoves: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBattleStruct->lastTakenMove[MAX_BATTLERS_COUNT]` — dernier
 *  move subi par chaque battler (= utilisé par Mirror Move). */
export const gLastTakenMove: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBattleStruct->lastTakenMoveFrom[4*4]` — dernier move subi par
 *  battler X depuis battler Y. Flat array index = X*4 + Y. */
export const gLastTakenMoveFrom: number[] = new Array(16).fill(0);

/** 1:1 décomp `gBattleStruct->moveTarget[MAX_BATTLERS_COUNT]` — target id
 *  chosen by each battler ce turn (= Pursuit switch tracking). */
export const gMoveTarget: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBattleStruct->chosenMovePositions[MAX_BATTLERS_COUNT]` —
 *  position 0..3 du move choisi (= slot dans gBattleMons.moves). */
export const gChosenMovePositions: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBattleStruct->choicedMove[MAX_BATTLERS_COUNT]` (battle.h
 *  BattleStruct). Move locked-in par Choice Band, conservé jusqu'à switch-out.
 *  Lu/écrit par MOVEEND_CHOICE_MOVE et Cmd_jumpifcantselectchoiced. */
export const gBattleStructChoicedMove: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBattleStruct->changedItems[MAX_BATTLERS_COUNT]` (battle.h
 *  BattleStruct). Item donné par Trick/Switcheroo, appliqué à la fin du move
 *  via MOVEEND_CHANGED_ITEMS. ITEM_NONE = pas de change. */
export const gBattleStructChangedItems: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBattleStruct->absentBattlerFlags` (battle.h BattleStruct).
 *  Bitmask : flags battlers absents (= fainted) pendant le combat. Distinct de
 *  `gAbsentBattlerFlags` (= global tracker, reset à chaque turn). */
export let gBattleStructAbsentBattlerFlags = 0;
export function setBattleStructAbsentBattlerFlags(v: number) { gBattleStructAbsentBattlerFlags = v; }

/** 1:1 décomp `gBattleStruct->atkCancelerTracker` (battle.h:436). État de la
 *  state machine `AtkCanceler_UnableToUseMove` qui check sleep/freeze/flinch/
 *  confuse/paralyze/etc. au début de chaque move. Reset à 0 avant chaque attaque. */
export let gBattleStructAtkCancelerTracker = 0;
export function setBattleStructAtkCancelerTracker(v: number) { gBattleStructAtkCancelerTracker = v; }

/** 1:1 décomp `gBattleStruct->expValue` (battle.h). XP calculé per-mon par
 *  Cmd_getexp à distribuer aux participants. */
export let gBattleStructExpValue = 0;
export function setBattleStructExpValue(v: number) { gBattleStructExpValue = v; }

/** 1:1 décomp `gBattleStruct->expGetterMonId` (battle.h). Index 0..5 du mon
 *  party courant en cours de distribution XP. */
export let gBattleStructExpGetterMonId = 0;
export function setBattleStructExpGetterMonId(v: number) { gBattleStructExpGetterMonId = v; }

/** 1:1 décomp `gBattleStruct->expGetterBattlerId` (battle.h). Battler ID
 *  (0..3) qui reçoit l'XP — utilisé pour Emit + display. */
export let gBattleStructExpGetterBattlerId = 0;
export function setBattleStructExpGetterBattlerId(v: number) { gBattleStructExpGetterBattlerId = v; }

/** 1:1 décomp `gBattleStruct->sentInPokes` (battle.h). Bitmask des mons sentIn
 *  (= participaient au combat = éligibles à l'XP). Shifté à chaque mon. */
export let gBattleStructSentInPokes = 0;
export function setBattleStructSentInPokes(v: number) { gBattleStructSentInPokes = v; }

/** 1:1 décomp `gBattleStruct->wildVictorySong` (battle.h). Flag 1-time pour
 *  switch BGM → MUS_VICTORY_WILD post-faint adversaire en wild battle. */
export let gBattleStructWildVictorySong = 0;
export function setBattleStructWildVictorySong(v: number) { gBattleStructWildVictorySong = v; }

/** 1:1 décomp `gBattleStruct->givenExpMons` (battle.h). Bitmask party indexes
 *  qui ont déjà reçu de l'XP ce combat (= pour eviter doublons). */
export let gBattleStructGivenExpMons = 0;
export function setBattleStructGivenExpMons(v: number) { gBattleStructGivenExpMons = v; }

/** 1:1 décomp `gSentPokesToOpponent[2]` (battle_main.c). Bitmask des mons qui
 *  ont été envoyés contre chaque opponent (= side 0=opponent left, 1=right).
 *  Utilisé par getexp pour identifier les mons éligibles. */
export const gSentPokesToOpponent: number[] = [0, 0];

/** 1:1 décomp `gExpShareExp` (battle_script_commands.c). XP partagé via Exp.Share
 *  hold item à distribuer à tous les non-participants équipés. */
export let gExpShareExp = 0;
export function setExpShareExp(v: number) { gExpShareExp = v; }

/** 1:1 décomp `gLeveledUpInBattle` (battle_main.c). Bitmask party indexes qui
 *  ont level-up pendant le combat. Utilisé par la post-combat learn move flow. */
export let gLeveledUpInBattle = 0;
export function setLeveledUpInBattle(v: number) { gLeveledUpInBattle = v; }

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

/** 1:1 décomp `gChosenActionByBattler[MAX_BATTLERS_COUNT]` (battle_main.c).
 *  Action chosen for the turn (B_ACTION_USE_MOVE / SWITCH / RUN / etc.). */
export const gChosenActionByBattler: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gChosenMoveByBattler[MAX_BATTLERS_COUNT]` (battle_main.c). */
export const gChosenMoveByBattler: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gActionsByTurnOrder[MAX_BATTLERS_COUNT]` (battle_main.c).
 *  Action queue triée par turn order. */
export const gActionsByTurnOrder: number[] = [0, 0, 0, 0];

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
export function setChosenMovePos(v: number) { gChosenMovePos = v; }
export function setCalledMove(v: number) { gCalledMove = v; }
export function setBattleMoveDamage(v: number) { gBattleMoveDamage = v; }
export function setHpDealt(v: number) { gHpDealt = v; }
export function setCritMultiplier(v: number) { gCritMultiplier = v; }
export function setMultiHitCounter(v: number) { gMultiHitCounter = v; }
export function setMoveResultFlags(v: number) { gMoveResultFlags = v; }
export function setHitMarker(v: number) { gHitMarker = v; }
export function setBattleOutcome(v: number) { gBattleOutcome = v; }
export function setBattleTypeFlags(v: number) { gBattleTypeFlags = v; }
export function setBattleWeather(v: number) { gBattleWeather = v; }
export function setSideStatus(sideIdx: number, v: number) { gSideStatuses[sideIdx] = v; }
export function setDynamicBasePower(v: number) { gDynamicBasePower = v; }
export function setDynamicMoveType(v: number) { gDynamicMoveType = v; }
export function setBattleMovePower(v: number) { gBattleMovePower = v; }
export function setBattleControllerExecFlags(v: number) { gBattleControllerExecFlags = v; }
export function setPauseCounterBattle(v: number) { gPauseCounterBattle = v; }
export function setCurrentActionFuncId(v: number) { gCurrentActionFuncId = v; }
export function setCurrentTurnActionNumber(v: number) { gCurrentTurnActionNumber = v; }
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
    gLockedMoves[i] = 0;
    gBideDmg[i] = 0;
    gBideTarget[i] = 0;
    gUsedHeldItems[i] = 0;
    gLastLandedMoves[i] = 0;
    gLastHitByType[i] = 0;
    gLastResultingMoves[i] = 0;
    gLastUsedMove[i] = 0;
    gLastHitBy[i] = 0;
    gBattlerByTurnOrder[i] = 0;
    gChosenActionByBattler[i] = 0;
    gChosenMoveByBattler[i] = 0;
    gActionsByTurnOrder[i] = 0;
    gBattleStructChoicedMove[i] = 0;
    gBattleStructChangedItems[i] = 0;
  }
  gBattleStructAbsentBattlerFlags = 0;
  gBattleStructAtkCancelerTracker = 0;
  gBattleStructExpValue = 0;
  gBattleStructExpGetterMonId = 0;
  gBattleStructExpGetterBattlerId = 0;
  gBattleStructSentInPokes = 0;
  gBattleStructWildVictorySong = 0;
  gBattleStructGivenExpMons = 0;
  gSentPokesToOpponent[0] = 0;
  gSentPokesToOpponent[1] = 0;
  gExpShareExp = 0;
  gLeveledUpInBattle = 0;
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
  gDynamicMoveType = 0;
  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
    Object.assign(gDisableStructs[i], _makeBlankDisableStruct());
  }
  Object.assign(gSideTimers[0], _makeBlankSideTimer());
  Object.assign(gSideTimers[1], _makeBlankSideTimer());
  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
    Object.assign(gProtectStructs[i], _makeBlankProtectStruct());
    Object.assign(gSpecialStatuses[i], _makeBlankSpecialStatus());
  }
  gAbsentBattlerFlags = 0;
  gBattleEnvironment = 0;
  gPaydayMoney = 0;
  gIntimidateBattler = 0;
  gFormToChangeInto = 0;
  gHpScale = 0;
  gHpOnSwitchout[0] = 0;
  gHpOnSwitchout[1] = 0;
  gTrainerBattleOpponent_A = 0;
  gTrainerBattleOpponent_B = 0;
  gWishFutureKnock.futureSightCounter = [0, 0, 0, 0];
  gWishFutureKnock.futureSightAttacker = [0, 0, 0, 0];
  gWishFutureKnock.futureSightDmg = [0, 0, 0, 0];
  gWishFutureKnock.futureSightMove = [0, 0, 0, 0];
  gWishFutureKnock.wishCounter = [0, 0, 0, 0];
  gWishFutureKnock.wishMonId = [0, 0, 0, 0];
  gWishFutureKnock.weatherDuration = 0;
  gWishFutureKnock.knockedOffMons = 0;
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
