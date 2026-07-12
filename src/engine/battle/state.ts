/**
 * battle/state.ts — 1:1 décomp battle global state (ewram).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:160-250`
 * (= `EWRAM_DATA` declarations). Notre port stocke ces vars dans un module
 * singleton accessible via `battleState`. Les opcodes lisent/écrivent directement
 * dessus (= 1:1 décomp pattern, pas d'abstraction).
 *
 * Pour Phase 1 Batch 01 (= damage flow basic), seuls les states utilisés par
 * Cmd_attackcanceler/accuracycheck/ppreduce/critcalc/damagecalc/typecalc/
 * adjustnormaldamage/healthbarupdate/datahpupdate/tryfaintmon/moveend sont
 * définis. Les autres seront ajoutés au fur et à mesure que les opcodes
 * Batch 02+ sont portés.
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
    // 1:1 décomp : NUM_BATTLE_STATS = 8 (HP, ATK, DEF, SPEED, SPATK, SPDEF, ACC, EVASION).
    // STAT_EVASION = 7 → l'array DOIT avoir 8 slots, sinon statStages[7] = undefined →
    // NaN dans ChangeStatBuffs (Mimi-Queue/Reflet cassés + corrompt l'accuracy).
    statStages: [0, 0, 0, 0, 0, 0, 0, 0],
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
/** 1:1 décomp `gBattlerInMenuId` (battle.h). Battler qui interagit avec le menu
 *  bag/party — set par battle_controller_player avant ouverture menus, et lu
 *  par PokemonUseItemEffects pour identifier le mon ciblé. Aussi set par
 *  Cmd_useitemonopponent = gBattlerAttacker. */
export let gBattlerInMenuId = 0;

/** 1:1 décomp `gBattlersCount` (= 2 single, 4 double). */
export let gBattlersCount = 2;

/** 1:1 décomp `EWRAM_DATA bool8 gDoingBattleAnim` (battle_main.c). Flag global
 *  posé pendant une anim de combat bloquante (send-out ball / capture) : TRUE par
 *  DoPokeballSendOutAnimation, FALSE par HandleBallAnimEnd. Lu comme garde. */
export let gDoingBattleAnim = false;

/** 1:1 décomp `void (*gBattlerControllerFuncs[MAX_BATTLERS_COUNT])(void)`
 *  (battle_main.c). TABLE PARTAGÉE unique : `BattleMainCB1` la tick chaque
 *  frame (`gBattlerControllerFuncs[i]()`), et chaque controller (player/
 *  opponent/setup) y installe sa func via `setBattlerControllerFunc`.
 *
 *  Auparavant fragmentée en 3 copies locales (player/opponent-noop/setup) ;
 *  unifiée ici (= le décomp n'a qu'UNE table globale). Init null (≈
 *  BattleControllerDummy, posé par SetUpBattleVarsAndBirchZigzagoon). */
export const gBattlerControllerFuncs: Array<(() => void) | null> = [null, null, null, null];

/** 1:1 décomp `gBattlerControllerFuncs[battler]` read. */
export function getBattlerControllerFunc(battler: number): (() => void) | null {
  return gBattlerControllerFuncs[battler];
}

/** 1:1 décomp `gBattlerControllerFuncs[battler] = fn` write. */
export function setBattlerControllerFunc(battler: number, fn: (() => void) | null): void {
  gBattlerControllerFuncs[battler] = fn;
}

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
  knockedOffMons: number[];       // u8[NUM_BATTLE_SIDES] bitfield per battler
}

export const gWishFutureKnock: WishFutureKnock = {
  futureSightCounter: [0, 0, 0, 0],
  futureSightAttacker: [0, 0, 0, 0],
  futureSightDmg: [0, 0, 0, 0],
  futureSightMove: [0, 0, 0, 0],
  wishCounter: [0, 0, 0, 0],
  wishMonId: [0, 0, 0, 0],
  weatherDuration: 0,
  knockedOffMons: [0, 0],
};

/** `gBattlescriptCurrInstr` dans le décomp est un pointer ; ici c'est l'offset
 *  dans le bytecode (= `BattleScriptContext.scriptPtr` du runtime). Maintenu
 *  synchrone par le runBattleScript loop. */

/** 1:1 décomp `gBattleScripting`. */
export const gBattleScripting: BattleScripting = _makeBlankScripting();

// ─── gBattleResults (1:1 décomp `struct BattleResults` battle.h:234-258) ─

/** 1:1 décomp `struct BattleResults` (battle.h:234-258). Post-battle stats
 *  tracker (= save block 1 field, sauvegardé entre combats). */
export interface BattleResults {
  playerFaintCounter: number;     // u8 - mons player perdu
  opponentFaintCounter: number;   // u8 - mons opponent KO
  playerSwitchesCounter: number;  // u8 - nb switches manuels
  numHealingItemsUsed: number;    // u8
  numRevivesUsed: number;         // u8
  // u8 packed bits (= byte 5).
  playerMonWasDamaged: number;    // u8:1 - true si player mon a subi des dégâts
  usedMasterBall: number;         // u8:1
  caughtMonBall: number;          // u8:4
  shinyWildMon: number;           // u8:1
  // ----
  playerMon1Species: number;      // u16 - species du premier mon player sent in
  playerMon1Name: number[];       // u8[11] (POKEMON_NAME_LENGTH + 1)
  battleTurnCounter: number;      // u8
  playerMon2Name: number[];       // u8[11]
  pokeblockThrows: number;        // u8 - safari/contest
  lastOpponentSpecies: number;    // u16
  lastUsedMovePlayer: number;     // u16
  lastUsedMoveOpponent: number;   // u16
  playerMon2Species: number;      // u16
  caughtMonSpecies: number;       // u16
  caughtMonNick: number[];        // u8[11]
  filler35: number;               // u8
  catchAttempts: number[];        // u8[POKEBALL_COUNT - 1] = u8[11]
}

function _makeBlankBattleResults(): BattleResults {
  return {
    playerFaintCounter: 0, opponentFaintCounter: 0, playerSwitchesCounter: 0,
    numHealingItemsUsed: 0, numRevivesUsed: 0,
    playerMonWasDamaged: 0, usedMasterBall: 0, caughtMonBall: 0, shinyWildMon: 0,
    playerMon1Species: 0,
    playerMon1Name: new Array(11).fill(0),
    battleTurnCounter: 0,
    playerMon2Name: new Array(11).fill(0),
    pokeblockThrows: 0,
    lastOpponentSpecies: 0,
    lastUsedMovePlayer: 0, lastUsedMoveOpponent: 0,
    playerMon2Species: 0, caughtMonSpecies: 0,
    caughtMonNick: new Array(11).fill(0),
    filler35: 0,
    catchAttempts: new Array(11).fill(0),
  };
}

/** 1:1 décomp `extern struct BattleResults gBattleResults` (battle.h:724).
 *  Post-battle stats (= save block 1 field). Reset au battle start. */
export const gBattleResults: BattleResults = _makeBlankBattleResults();

export function resetBattleResults(): void {
  Object.assign(gBattleResults, _makeBlankBattleResults());
}

// ─── gBattleStruct (1:1 décomp `struct BattleStruct` battle.h:354-447) ─────

/** Pour `gBattleStruct->multiBuffer.linkBattlerHeader` — link battle header info. */
export interface LinkBattlerHeader {
  versionSignatureLo: number;       // u8
  versionSignatureHi: number;       // u8
  vsScreenHealthFlagsLo: number;    // u8
  vsScreenHealthFlagsHi: number;    // u8
  // (le décomp a struct + champs sub à charge link multi battle)
}

/** 1:1 décomp `struct BattleTvMovePoints` (battle.h:340) : s16 points[2][PARTY_SIZE*4]. */
export interface BattleTvMovePoints {
  points: number[][];               // s16[2][24]
}

/** 1:1 décomp `struct BattleTv_Side` (battle.h:260-291) — bitfields u32 → champs number. */
export interface BattleTvSide {
  spikesMonId: number; reflectMonId: number; lightScreenMonId: number;
  safeguardMonId: number; mistMonId: number; futureSightMonId: number;
  doomDesireMonId: number; perishSongMonId: number; wishMonId: number;
  grudgeMonId: number; usedMoveSlot: number; spikesMoveSlot: number;
  reflectMoveSlot: number; lightScreenMoveSlot: number; safeguardMoveSlot: number;
  mistMoveSlot: number; futureSightMoveSlot: number; doomDesireMoveSlot: number;
  perishSongMoveSlot: number; wishMoveSlot: number; grudgeMoveSlot: number;
  destinyBondMonId: number; destinyBondMoveSlot: number; faintCause: number;
  faintCauseMonId: number; explosion: number | boolean; explosionMoveSlot: number;
  explosionMonId: number; perishSong: number | boolean;
}

/** 1:1 décomp `struct BattleTv_Position` (battle.h:293-315). */
export interface BattleTvPosition {
  curseMonId: number; leechSeedMonId: number; nightmareMonId: number;
  wrapMonId: number; attractMonId: number; confusionMonId: number;
  curseMoveSlot: number; leechSeedMoveSlot: number; nightmareMoveSlot: number;
  wrapMoveSlot: number; attractMoveSlot: number; confusionMoveSlot: number;
  waterSportMoveSlot: number; waterSportMonId: number; mudSportMonId: number;
  mudSportMoveSlot: number; ingrainMonId: number; ingrainMoveSlot: number;
  attackedByMonId: number; attackedByMoveSlot: number;
}

/** 1:1 décomp `struct BattleTv_Mon` (battle.h:317-331). */
export interface BattleTvMon {
  psnMonId: number; badPsnMonId: number; brnMonId: number; prlzMonId: number;
  slpMonId: number; frzMonId: number; psnMoveSlot: number; badPsnMoveSlot: number;
  brnMoveSlot: number; prlzMoveSlot: number; slpMoveSlot: number; frzMoveSlot: number;
}

/** 1:1 décomp `struct BattleTv` (battle.h:333-338) :
 *  mon[2][PARTY_SIZE] · pos[2][2] (side, flank) · side[2]. */
export interface BattleTv {
  mon: BattleTvMon[][];
  pos: BattleTvPosition[][];
  side: BattleTvSide[];
}

function _makeBlankBattleTvMon(): BattleTvMon {
  return {
    psnMonId: 0, badPsnMonId: 0, brnMonId: 0, prlzMonId: 0, slpMonId: 0, frzMonId: 0,
    psnMoveSlot: 0, badPsnMoveSlot: 0, brnMoveSlot: 0, prlzMoveSlot: 0, slpMoveSlot: 0, frzMoveSlot: 0,
  };
}

function _makeBlankBattleTvPosition(): BattleTvPosition {
  return {
    curseMonId: 0, leechSeedMonId: 0, nightmareMonId: 0, wrapMonId: 0, attractMonId: 0,
    confusionMonId: 0, curseMoveSlot: 0, leechSeedMoveSlot: 0, nightmareMoveSlot: 0,
    wrapMoveSlot: 0, attractMoveSlot: 0, confusionMoveSlot: 0, waterSportMoveSlot: 0,
    waterSportMonId: 0, mudSportMonId: 0, mudSportMoveSlot: 0, ingrainMonId: 0,
    ingrainMoveSlot: 0, attackedByMonId: 0, attackedByMoveSlot: 0,
  };
}

function _makeBlankBattleTvSide(): BattleTvSide {
  return {
    spikesMonId: 0, reflectMonId: 0, lightScreenMonId: 0, safeguardMonId: 0, mistMonId: 0,
    futureSightMonId: 0, doomDesireMonId: 0, perishSongMonId: 0, wishMonId: 0, grudgeMonId: 0,
    usedMoveSlot: 0, spikesMoveSlot: 0, reflectMoveSlot: 0, lightScreenMoveSlot: 0,
    safeguardMoveSlot: 0, mistMoveSlot: 0, futureSightMoveSlot: 0, doomDesireMoveSlot: 0,
    perishSongMoveSlot: 0, wishMoveSlot: 0, grudgeMoveSlot: 0, destinyBondMonId: 0,
    destinyBondMoveSlot: 0, faintCause: 0, faintCauseMonId: 0, explosion: 0,
    explosionMoveSlot: 0, explosionMonId: 0, perishSong: 0,
  };
}

function _makeBlankLinkBattlerHeader(): LinkBattlerHeader {
  return {
    versionSignatureLo: 0, versionSignatureHi: 0,
    vsScreenHealthFlagsLo: 0, vsScreenHealthFlagsHi: 0,
  };
}

function _makeBlankBattleTvMovePoints(): BattleTvMovePoints {
  // 1:1 s16 points[2][PARTY_SIZE * 4] (battle.h:342).
  return { points: Array.from({ length: 2 }, () => new Array(24).fill(0)) };
}

function _makeBlankBattleTv(): BattleTv {
  // 1:1 mon[2][PARTY_SIZE] · pos[2][2] · side[2] (battle.h:333-338).
  return {
    mon: Array.from({ length: 2 }, () => Array.from({ length: 6 }, _makeBlankBattleTvMon)),
    pos: Array.from({ length: 2 }, () => Array.from({ length: 2 }, _makeBlankBattleTvPosition)),
    side: Array.from({ length: 2 }, _makeBlankBattleTvSide),
  };
}

/** 1:1 décomp `struct BattleStruct` (battle.h:354-447). */
export interface BattleStruct {
  // Turn / state machines.
  turnEffectsTracker: number;                // u8
  turnEffectsBattlerId: number;              // u8
  unused_0: number;                          // u8
  turnCountersTracker: number;               // u8
  // Wrap / Bind tracking.
  wrappedMove: number[];                     // u8[MAX_BATTLERS_COUNT * 2] = u16[4] in décomp
  moveTarget: number[];                      // u8[MAX_BATTLERS_COUNT]
  expGetterMonId: number;                    // u8
  unused_1: number;                          // u8
  wildVictorySong: number;                   // u8
  dynamicMoveType: number;                   // u8
  wrappedBy: number[];                       // u8[MAX_BATTLERS_COUNT]
  assistPossibleMoves: number[];             // u16[PARTY_SIZE * MAX_MON_MOVES] = u16[24]
  focusPunchBattlerId: number;               // u8
  battlerPreventingSwitchout: number;        // u8
  moneyMultiplier: number;                   // u8
  savedTurnActionNumber: number;             // u8
  switchInAbilitiesCounter: number;          // u8
  faintedActionsState: number;               // u8
  faintedActionsBattlerId: number;           // u8
  expValue: number;                          // u16
  scriptPartyIdx: number;                    // u8
  sentInPokes: number;                       // u8
  selectionScriptFinished: number[];         // bool8[MAX_BATTLERS_COUNT]
  battlerPartyIndexes: number[];             // u8[MAX_BATTLERS_COUNT]
  monToSwitchIntoId: number[];               // u8[MAX_BATTLERS_COUNT]
  battlerPartyOrders: number[][];            // u8[MAX_BATTLERS_COUNT][PARTY_SIZE / 2] = u8[4][3]
  runTries: number;                          // u8
  caughtMonNick: number[];                   // u8[POKEMON_NAME_LENGTH + 1] = u8[11]
  unused_2: number;                          // u8
  safariGoNearCounter: number;               // u8
  safariPkblThrowCounter: number;            // u8
  safariEscapeFactor: number;                // u8
  safariCatchFactor: number;                 // u8
  linkBattleVsSpriteId_V: number;            // u8
  linkBattleVsSpriteId_S: number;            // u8
  formToChangeInto: number;                  // u8
  chosenMovePositions: number[];             // u8[MAX_BATTLERS_COUNT]
  stateIdAfterSelScript: number[];           // u8[MAX_BATTLERS_COUNT]
  unused_3: number[];                        // u8[3]
  prevSelectedPartySlot: number;             // u8
  unused_4: number[];                        // u8[2]
  stringMoveType: number;                    // u8
  expGetterBattlerId: number;                // u8
  unused_5: number;                          // u8
  absentBattlerFlags: number;                // u8 (= persistent battle-wide flag)
  palaceFlags: number;                       // u8
  field_93: number;                          // u8 (related to choosing pokemon?)
  wallyBattleState: number;                  // u8
  wallyMovesState: number;                   // u8
  wallyWaitFrames: number;                   // u8
  wallyMoveFrames: number;                   // u8
  lastTakenMove: number[];                   // u8[MAX_BATTLERS_COUNT * 2 * 2] = u8[16]
  hpOnSwitchout: number[];                   // u16[NUM_BATTLE_SIDES] = u16[2]
  savedBattleTypeFlags: number;              // u32
  abilityPreventingSwitchout: number;        // u8
  hpScale: number;                           // u8
  synchronizeMoveEffect: number;             // u8
  anyMonHasTransformed: number;              // bool8
  savedCallback: (() => void) | null;        // void (*)(void)
  usedHeldItems: number[];                   // u16[MAX_BATTLERS_COUNT]
  chosenItem: number[];                      // u8[MAX_BATTLERS_COUNT]
  AI_itemType: number[];                     // u8[2]
  AI_itemFlags: number[];                    // u8[2]
  choicedMove: number[];                     // u16[MAX_BATTLERS_COUNT]
  changedItems: number[];                    // u16[MAX_BATTLERS_COUNT]
  intimidateBattler: number;                 // u8
  switchInItemsCounter: number;              // u8
  arenaTurnCounter: number;                  // u8
  turnSideTracker: number;                   // u8
  unused_6: number[];                        // u8[3]
  givenExpMons: number;                      // u8
  lastTakenMoveFrom: number[];               // u8[MAX_BATTLERS_COUNT*MAX_BATTLERS_COUNT*2] = u8[32]
  castformPalette: number[][];               // u16[NUM_CASTFORM_FORMS][16] = u16[4][16]
  multiBuffer: {
    linkBattlerHeader: LinkBattlerHeader;
    battleVideo: number[];                   // u32[2]
  };
  wishPerishSongState: number;               // u8
  wishPerishSongBattlerId: number;           // u8
  overworldWeatherDone: number;              // bool8
  atkCancelerTracker: number;                // u8
  tvMovePoints: BattleTvMovePoints;
  tv: BattleTv;
  unused_7: number[];                        // u8[0x28]
  AI_monToSwitchIntoId: number[];            // u8[MAX_BATTLERS_COUNT]
  arenaMindPoints: number[];                 // s8[2]
  arenaSkillPoints: number[];                // s8[2]
  arenaStartHp: number[];                    // u16[2]
  arenaLostPlayerMons: number;               // u8
  arenaLostOpponentMons: number;             // u8
  alreadyStatusedMoveAttempt: number;        // u8 bitfield per battler
}

function _makeBlankBattleStruct(): BattleStruct {
  return {
    turnEffectsTracker: 0, turnEffectsBattlerId: 0, unused_0: 0, turnCountersTracker: 0,
    wrappedMove: [0, 0, 0, 0, 0, 0, 0, 0],
    moveTarget: [0, 0, 0, 0],
    expGetterMonId: 0, unused_1: 0, wildVictorySong: 0, dynamicMoveType: 0,
    wrappedBy: [0, 0, 0, 0],
    assistPossibleMoves: new Array(24).fill(0),
    focusPunchBattlerId: 0, battlerPreventingSwitchout: 0, moneyMultiplier: 0,
    savedTurnActionNumber: 0, switchInAbilitiesCounter: 0,
    faintedActionsState: 0, faintedActionsBattlerId: 0,
    expValue: 0, scriptPartyIdx: 0, sentInPokes: 0,
    selectionScriptFinished: [0, 0, 0, 0],
    battlerPartyIndexes: [0, 0, 0, 0],
    monToSwitchIntoId: [0, 0, 0, 0],
    battlerPartyOrders: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
    runTries: 0,
    caughtMonNick: new Array(11).fill(0),
    unused_2: 0, safariGoNearCounter: 0, safariPkblThrowCounter: 0,
    safariEscapeFactor: 0, safariCatchFactor: 0,
    linkBattleVsSpriteId_V: 0, linkBattleVsSpriteId_S: 0,
    formToChangeInto: 0,
    chosenMovePositions: [0, 0, 0, 0],
    stateIdAfterSelScript: [0, 0, 0, 0],
    unused_3: [0, 0, 0],
    prevSelectedPartySlot: 0,
    unused_4: [0, 0],
    stringMoveType: 0,
    expGetterBattlerId: 0, unused_5: 0,
    absentBattlerFlags: 0, palaceFlags: 0,
    field_93: 0,
    wallyBattleState: 0, wallyMovesState: 0, wallyWaitFrames: 0, wallyMoveFrames: 0,
    lastTakenMove: new Array(16).fill(0),
    hpOnSwitchout: [0, 0],
    savedBattleTypeFlags: 0,
    abilityPreventingSwitchout: 0,
    hpScale: 0, synchronizeMoveEffect: 0,
    anyMonHasTransformed: 0,
    savedCallback: null,
    usedHeldItems: [0, 0, 0, 0],
    chosenItem: [0, 0, 0, 0],
    AI_itemType: [0, 0],
    AI_itemFlags: [0, 0],
    choicedMove: [0, 0, 0, 0],
    changedItems: [0, 0, 0, 0],
    intimidateBattler: 0,
    switchInItemsCounter: 0,
    arenaTurnCounter: 0,
    turnSideTracker: 0,
    unused_6: [0, 0, 0],
    givenExpMons: 0,
    lastTakenMoveFrom: new Array(32).fill(0),
    castformPalette: [new Array(16).fill(0), new Array(16).fill(0), new Array(16).fill(0), new Array(16).fill(0)],
    multiBuffer: {
      linkBattlerHeader: _makeBlankLinkBattlerHeader(),
      battleVideo: [0, 0],
    },
    wishPerishSongState: 0, wishPerishSongBattlerId: 0,
    overworldWeatherDone: 0, atkCancelerTracker: 0,
    tvMovePoints: _makeBlankBattleTvMovePoints(),
    tv: _makeBlankBattleTv(),
    unused_7: new Array(0x28).fill(0),
    AI_monToSwitchIntoId: [0, 0, 0, 0],
    arenaMindPoints: [0, 0], arenaSkillPoints: [0, 0], arenaStartHp: [0, 0],
    arenaLostPlayerMons: 0, arenaLostOpponentMons: 0,
    alreadyStatusedMoveAttempt: 0,
  };
}

/** 1:1 décomp `struct BattleStruct *gBattleStruct` (battle.h:703).
 *  Single source of truth pour tous les fields BattleStruct (Phase 1.1 C refactor).
 *
 *  **Stratégie de migration** : les anciens exports `gXXX` épars (= gIntimidateBattler,
 *  gFormToChangeInto, etc.) sont conservés temporairement comme aliases. Les
 *  setters écrivent dans `gBattleStruct.X` (= source unique) ET propagent à
 *  l'ancien export pour live-binding compat. Phase 1.1 C step 2 = migrer les
 *  call-sites pour lire `gBattleStruct.X` directement, puis step 3 = supprimer
 *  les anciens exports. */
export const gBattleStruct: BattleStruct = _makeBlankBattleStruct();

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
/** ALIAS legacy : préférer `gBattleStruct.usedHeldItems` (= 1:1 décomp). */
export const gUsedHeldItems: number[] = gBattleStruct.usedHeldItems;

/** 1:1 décomp `gTrainerBattleOpponent_A/B` (battle_setup.c). Trainer ID
 *  opponent — déterminé au battle setup, lu par Cmd_getmoneyreward pour
 *  GetTrainerMoneyToGive(). */
export let gTrainerBattleOpponent_A = 0;
export let gTrainerBattleOpponent_B = 0;
export function setTrainerBattleOpponentA(v: number) { gTrainerBattleOpponent_A = v; }
export function setTrainerBattleOpponentB(v: number) { gTrainerBattleOpponent_B = v; }

/** 1:1 décomp `gLastPrintedMoves[MAX_BATTLERS_COUNT]` (battle_main.c). Dernier
 *  move dont le nom a été print (= différent de gLastMoves : printed = move
 *  qui a réussi à être déclaré, last = move attempted). Utilisé par Sketch
 *  (Cmd_copymovepermanently) pour copier le move successfully announced. */
export const gLastPrintedMoves: number[] = [0, 0, 0, 0];

/** 1:1 décomp `EWRAM_DATA u16 gRandomTurnNumber` (battle_main.c). Roll RNG
 *  fixé une fois par tour (= SetActionsAndBattlersTurnOrder), lu par
 *  GetWhoStrikesFirst pour Quick Claw. Default 0 jusqu'à câblage end-turn. */
export let gRandomTurnNumber = 0;
export function setRandomTurnNumber(v: number): void { gRandomTurnNumber = v & 0xFFFF; }

/** 1:1 décomp `struct ResourceFlags { u32 flags[MAX_BATTLERS_COUNT] }`
 *  (battle.h:63-66). Per-battler bitfield (= RESOURCE_FLAG_FLASH_FIRE bit 0).
 *  Accédé via `gBattleResources->flags->flags[battler]` dans le décomp. */
export const gBattleResourcesFlags: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gActionSelectionCursor[MAX_BATTLERS_COUNT]` (battle_main.c). UI
 *  cursor position dans le menu action (FIGHT/BAG/POKEMON/RUN). Reset à 0 sur
 *  faint et à chaque turn pour ce battler. */
export const gActionSelectionCursor: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gMoveSelectionCursor[MAX_BATTLERS_COUNT]` (battle_main.c). UI
 *  cursor position dans le menu move (0..3). Reset à 0 sur faint. */
export const gMoveSelectionCursor: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gPlayerDpadHoldFrames` (battle_main.c). Counter incrementé
 *  pendant que DPAD est held + OPTIONS_BUTTON_MODE_L_EQUALS_A actif. Sert
 *  de "long-hold to cancel" pour HandleInputChooseAction/Move (= si > 59
 *  frames, équivalent appui B_BUTTON). Reset à 0 sur SetControllerToPlayer. */
export let gPlayerDpadHoldFrames = 0;
export function setPlayerDpadHoldFrames(v: number): void { gPlayerDpadHoldFrames = v; }
export function incPlayerDpadHoldFrames(): void { gPlayerDpadHoldFrames++; }

/** 1:1 décomp `gNumberOfMovesToChoose` (battle_main.c). Counter du nombre de
 *  moves !=MOVE_NONE dans la party UI. Setup par MoveSelectionDisplayMoveNames
 *  + utilisé par HandleInputChooseMove pour clamp DPAD navigation. */
export let gNumberOfMovesToChoose = 0;
export function setNumberOfMovesToChoose(v: number): void { gNumberOfMovesToChoose = v; }

/** 1:1 décomp `gMultiUsePlayerCursor` (battle_main.c). Cursor secondaire utilisé
 *  par HandleInputChooseMove (target select / move switching) + YesNo input. */
export let gMultiUsePlayerCursor = 0;
export function setMultiUsePlayerCursor(v: number): void { gMultiUsePlayerCursor = v; }

/** 1:1 décomp `gBattleStruct->lastTakenMove[MAX_BATTLERS_COUNT]` — dernier
 *  move subi par chaque battler (= utilisé par Mirror Move).
 *  Note : ce field map sur les premiers 4 entries de `gBattleStruct.lastTakenMove`
 *  (= u8[16] côté décomp, accédé comme u16 par battler).
 *  Pour Phase 1.1 C, on garde l'array séparé temporairement — migration via
 *  setLastTakenMove() à venir. */
export const gLastTakenMove: number[] = [0, 0, 0, 0];

/** 1:1 décomp `gBattleStruct->lastTakenMoveFrom[4*4]` — dernier move subi par
 *  battler X depuis battler Y. Flat array index = X*4 + Y.
 *  Note : pour Phase 1.1 C on garde un array séparé (décomp u8[32] tandis qu'ici
 *  on a u8[16] flat 4×4 — migration full vers `gBattleStruct.lastTakenMoveFrom`
 *  nécessite un audit des indexers actuels). */
export const gLastTakenMoveFrom: number[] = new Array(16).fill(0);

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

/** 1:1 décomp `EWRAM_DATA u16 gMoveToLearn` (battle_main.c:237).
 *  Move qu'un Pokémon est sur le point d'apprendre (post-level-up). */
export let gMoveToLearn = 0;

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
export function setGDoingBattleAnim(v: boolean) { gDoingBattleAnim = v; }
export function setEffectBattler(v: number) { gEffectBattler = v; }
export function setBattlerFainted(v: number) { gBattlerFainted = v; }
export function setPotentialItemEffectBattler(v: number) { gPotentialItemEffectBattler = v; }
export function setBattlerInMenuId(v: number) { gBattlerInMenuId = v; }
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
// Getter live du résultat de combat, pour le special GetBattleOutcome (field_specials.c:922)
// qui vit dans specials-registry (cycle-unsafe à importer battle/state). La closure
// capture le binding `let` → reflète toujours la valeur courante. Avant : le special
// lisait `__gBattleOutcome` (JAMAIS écrit) → renvoyait toujours WIN. [[gotcha-special-vs-specialvar-varresult]]
(globalThis as Record<string, unknown>).__getBattleOutcome = () => gBattleOutcome;
export function setBattleTypeFlags(v: number) { gBattleTypeFlags = v; }
export function setBattleWeather(v: number) { gBattleWeather = v; }
export function setSideStatus(sideIdx: number, v: number) { gSideStatuses[sideIdx] = v; }
export function setDynamicBasePower(v: number) { gDynamicBasePower = v; }
export function setDynamicMoveType(v: number) { gDynamicMoveType = v; }
export function setBattleMovePower(v: number) { gBattleMovePower = v; }
export function setBattleControllerExecFlags(v: number) { gBattleControllerExecFlags = v; }
export function setPauseCounterBattle(v: number) { gPauseCounterBattle = v; }
export function setCurrentActionFuncId(v: number) {
  // ── SONDE bug switch double (gated __probeSwitch) — retirer après diag ──────
  // Log quand on met USE_MOVE(0) pendant un slot de switch (actionN < 2) = anomalie.
  if ((globalThis as Record<string, unknown>).__probeSwitch && v === 0 && gCurrentTurnActionNumber < 2) {
    console.log('[probe:setfuncid=0] @actionN=', gCurrentTurnActionNumber,
      '| actions=', [gActionsByTurnOrder[0], gActionsByTurnOrder[1], gActionsByTurnOrder[2], gActionsByTurnOrder[3]],
      '\n' + (new Error().stack?.split('\n').slice(2, 8).join('\n') ?? '?'));
  }
  gCurrentActionFuncId = v;
}
export function setCurrentTurnActionNumber(v: number) { gCurrentTurnActionNumber = v; }
export function setLastUsedAbility(v: number) { gLastUsedAbility = v; }
export function setLastUsedItem(v: number) { gLastUsedItem = v; }
export function setMoveToLearn(v: number) { gMoveToLearn = v; }

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
    gBattleStruct.usedHeldItems[i] = 0;
    gLastLandedMoves[i] = 0;
    gLastHitByType[i] = 0;
    gLastResultingMoves[i] = 0;
    gLastUsedMove[i] = 0;
    gLastHitBy[i] = 0;
    gBattlerByTurnOrder[i] = 0;
    gChosenActionByBattler[i] = 0;
    gChosenMoveByBattler[i] = 0;
    gActionsByTurnOrder[i] = 0;
    gBattleStruct.choicedMove[i] = 0;
    gBattleStruct.changedItems[i] = 0;
  }
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
  gDoingBattleAnim = false;
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
  // 1:1 strict : `BattleStartClearSetData` (battle_main.c) ne reset PAS gBattleEnvironment
  // (grep décomp : gBattleEnvironment seulement décl.147 + CB2_InitBattleInternal:672/674 +
  // EmitIntroSlide:3385). Le reset ici (non-1:1) ÉCRASAIT l'env posé par
  // setBattleEnvironment(BattleSetup_GetEnvironmentId()) à l'init → le slide/terrain
  // retombaient toujours sur GRASS(0) même en ville/PLAIN. L'env est posé per-combat à
  // CB2_InitBattleInternal ; pas besoin de reset ici.
  gPaydayMoney = 0;
  gBattleStruct.intimidateBattler = 0;
  gBattleStruct.formToChangeInto = 0;
  gBattleStruct.synchronizeMoveEffect = 0;
  gBattleStruct.hpScale = 0;
  gTrainerBattleOpponent_A = 0;
  gTrainerBattleOpponent_B = 0;
  // Reset gBattleStruct non-array number fields (les arrays sont déjà reset
  // in-place via les aliases ci-dessus + boucles plus haut).
  gBattleStruct.turnEffectsTracker = 0;
  gBattleStruct.turnEffectsBattlerId = 0;
  gBattleStruct.turnCountersTracker = 0;
  gBattleStruct.expGetterMonId = 0;
  gBattleStruct.dynamicMoveType = 0;
  gBattleStruct.wildVictorySong = 0;
  gBattleStruct.focusPunchBattlerId = 0;
  gBattleStruct.battlerPreventingSwitchout = 0;
  gBattleStruct.moneyMultiplier = 0;
  gBattleStruct.savedTurnActionNumber = 0;
  gBattleStruct.switchInAbilitiesCounter = 0;
  gBattleStruct.faintedActionsState = 0;
  gBattleStruct.faintedActionsBattlerId = 0;
  gBattleStruct.expValue = 0;
  gBattleStruct.scriptPartyIdx = 0;
  gBattleStruct.sentInPokes = 0;
  gBattleStruct.runTries = 0;
  gBattleStruct.safariGoNearCounter = 0;
  gBattleStruct.safariPkblThrowCounter = 0;
  gBattleStruct.safariEscapeFactor = 0;
  gBattleStruct.safariCatchFactor = 0;
  gBattleStruct.linkBattleVsSpriteId_V = 0;
  gBattleStruct.linkBattleVsSpriteId_S = 0;
  gBattleStruct.prevSelectedPartySlot = 0;
  gBattleStruct.stringMoveType = 0;
  gBattleStruct.expGetterBattlerId = 0;
  gBattleStruct.absentBattlerFlags = 0;
  gBattleStruct.palaceFlags = 0;
  gBattleStruct.field_93 = 0;
  gBattleStruct.wallyBattleState = 0;
  gBattleStruct.wallyMovesState = 0;
  gBattleStruct.wallyWaitFrames = 0;
  gBattleStruct.wallyMoveFrames = 0;
  gBattleStruct.savedBattleTypeFlags = 0;
  gBattleStruct.abilityPreventingSwitchout = 0;
  gBattleStruct.anyMonHasTransformed = 0;
  gBattleStruct.savedCallback = null;
  gBattleStruct.switchInItemsCounter = 0;
  gBattleStruct.arenaTurnCounter = 0;
  gBattleStruct.turnSideTracker = 0;
  gBattleStruct.givenExpMons = 0;
  gBattleStruct.wishPerishSongState = 0;
  gBattleStruct.wishPerishSongBattlerId = 0;
  gBattleStruct.overworldWeatherDone = 0;
  gBattleStruct.atkCancelerTracker = 0;
  gBattleStruct.arenaLostPlayerMons = 0;
  gBattleStruct.arenaLostOpponentMons = 0;
  gBattleStruct.alreadyStatusedMoveAttempt = 0;
  gBattleStruct.hpOnSwitchout[0] = 0;
  gBattleStruct.hpOnSwitchout[1] = 0;
  // Reset arrays non-aliased.
  for (let i = 0; i < gBattleStruct.lastTakenMove.length; i++) gBattleStruct.lastTakenMove[i] = 0;
  for (let i = 0; i < gBattleStruct.lastTakenMoveFrom.length; i++) gBattleStruct.lastTakenMoveFrom[i] = 0;
  for (let i = 0; i < gBattleStruct.assistPossibleMoves.length; i++) gBattleStruct.assistPossibleMoves[i] = 0;
  for (let i = 0; i < gBattleStruct.selectionScriptFinished.length; i++) gBattleStruct.selectionScriptFinished[i] = 0;
  for (let i = 0; i < gBattleStruct.battlerPartyIndexes.length; i++) gBattleStruct.battlerPartyIndexes[i] = 0;
  for (let i = 0; i < gBattleStruct.monToSwitchIntoId.length; i++) gBattleStruct.monToSwitchIntoId[i] = 0;
  for (let i = 0; i < gBattleStruct.stateIdAfterSelScript.length; i++) gBattleStruct.stateIdAfterSelScript[i] = 0;
  for (let i = 0; i < gBattleStruct.caughtMonNick.length; i++) gBattleStruct.caughtMonNick[i] = 0;
  for (let i = 0; i < gBattleStruct.usedHeldItems.length; i++) gBattleStruct.usedHeldItems[i] = 0;
  for (let i = 0; i < gBattleStruct.chosenItem.length; i++) gBattleStruct.chosenItem[i] = 0;
  for (let i = 0; i < gBattleStruct.AI_itemType.length; i++) gBattleStruct.AI_itemType[i] = 0;
  for (let i = 0; i < gBattleStruct.AI_itemFlags.length; i++) gBattleStruct.AI_itemFlags[i] = 0;
  for (let i = 0; i < gBattleStruct.AI_monToSwitchIntoId.length; i++) gBattleStruct.AI_monToSwitchIntoId[i] = 0;
  for (let i = 0; i < gBattleStruct.arenaMindPoints.length; i++) gBattleStruct.arenaMindPoints[i] = 0;
  for (let i = 0; i < gBattleStruct.arenaSkillPoints.length; i++) gBattleStruct.arenaSkillPoints[i] = 0;
  for (let i = 0; i < gBattleStruct.arenaStartHp.length; i++) gBattleStruct.arenaStartHp[i] = 0;
  for (let r = 0; r < gBattleStruct.battlerPartyOrders.length; r++) {
    for (let c = 0; c < gBattleStruct.battlerPartyOrders[r].length; c++) gBattleStruct.battlerPartyOrders[r][c] = 0;
  }
  for (let r = 0; r < gBattleStruct.castformPalette.length; r++) {
    for (let c = 0; c < gBattleStruct.castformPalette[r].length; c++) gBattleStruct.castformPalette[r][c] = 0;
  }
  gBattleStruct.multiBuffer.linkBattlerHeader.versionSignatureLo = 0;
  gBattleStruct.multiBuffer.linkBattlerHeader.versionSignatureHi = 0;
  gBattleStruct.multiBuffer.linkBattlerHeader.vsScreenHealthFlagsLo = 0;
  gBattleStruct.multiBuffer.linkBattlerHeader.vsScreenHealthFlagsHi = 0;
  gBattleStruct.multiBuffer.battleVideo[0] = 0;
  gBattleStruct.multiBuffer.battleVideo[1] = 0;
  gWishFutureKnock.futureSightCounter = [0, 0, 0, 0];
  gWishFutureKnock.futureSightAttacker = [0, 0, 0, 0];
  gWishFutureKnock.futureSightDmg = [0, 0, 0, 0];
  gWishFutureKnock.futureSightMove = [0, 0, 0, 0];
  gWishFutureKnock.wishCounter = [0, 0, 0, 0];
  gWishFutureKnock.wishMonId = [0, 0, 0, 0];
  gWishFutureKnock.weatherDuration = 0;
  gWishFutureKnock.knockedOffMons[0] = 0;
  gWishFutureKnock.knockedOffMons[1] = 0;
}

// Expose pour devtools / debug + intra-module access (= éviter circular dep).
// AUDIT BUG FIX : guard contre overwrite par instances ESM dup. La 1ère
// instance qui charge state.ts définit __battleState (= ses gBattleMons +
// closures). Instances ESM ultérieures (= dynamic imports) skipperaient.
// Garantit que __battleState pointe TOUJOURS sur l'instance canonical utilisée
// par les imports statiques (cmd-niveau-*.ts au boot).
if (!(globalThis as Record<string, unknown>).__battleState) {
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
  // Getters pour fields read-only depuis util.ts GetDefaultMoveTarget etc.
  get gBattleTypeFlags() { return gBattleTypeFlags; },
  get gAbsentBattlerFlags() { return gAbsentBattlerFlags; },
  get gBattlersCount() { return gBattlersCount; },
  // Trainer B (= 2-opponent doubles) : lu par battle-string-decoder
  // (_getTrainerOpponentB → B_TXT_TRAINER2 name/class). Store canonique unique
  // (battle_setup propage via setTrainerBattleOpponentB).
  get gTrainerBattleOpponent_B() { return gTrainerBattleOpponent_B; },
  // Pour _GetImprisonedMovesCount lookup (move-limitations.ts).
  gStatuses3,
  // Pour memory-map.ts accessors (cMULTISTRING_CHOOSER, cMISS_TYPE, etc.).
  gBattleCommunication,
  gBattlerPartyIndexes,
  // Pour devtools test (= TurnValuesCleanUp / end-turn effects inspection).
  gDisableStructs,
  gProtectStructs,
  gSideTimers,
  gSideStatuses,
  gWishFutureKnock,
  gBattleStruct,
  gBattlerByTurnOrder,
  gHitMarker,
  // L1 UI input cursor + dpad state (= battle-controller-player tests).
  gActionSelectionCursor,
  gMoveSelectionCursor,
  get gPlayerDpadHoldFrames() { return gPlayerDpadHoldFrames; },
  setPlayerDpadHoldFrames,
  incPlayerDpadHoldFrames,
  get gNumberOfMovesToChoose() { return gNumberOfMovesToChoose; },
  setNumberOfMovesToChoose,
  get gMultiUsePlayerCursor() { return gMultiUsePlayerCursor; },
  setMultiUsePlayerCursor,
  get gActiveBattler() { return gActiveBattler; },
  setActiveBattler,
  // Debug protocole controllers (diagnostic soft-lock action-selection 2026-06-12).
  get gBattleControllerExecFlags() { return gBattleControllerExecFlags; },
  gBattlerControllerFuncs,
  // Setters pour memory-map writes (= opcodes natifs setbyte/addbyte/orbyte).
  setBattlerTarget,
  setBattlerAttacker,
  setHitMarker,
  setMoveResultFlags,
  setBattleMoveDamage,
  setBattleOutcome,
  setCritMultiplier,
  setChosenMove,
  setCurrentMove,
};
}  // end of if-not-set guard for __battleState

// Aliases globaux pour memory-map (= éviter circular imports + ESM live-binding
// issues si plusieurs instances state.ts existent via HMR/dynamic import).
// Le memory-map utilise __battleStateMutators.setBattlerTarget(v) etc., qui
// pointe TOUJOURS sur les setters réels de la version courante.
// AUDIT BUG FIX : guard contre overwrite par instances ESM dup.
if (!(globalThis as Record<string, unknown>).__battleStateMutators) {
(globalThis as Record<string, unknown>).__battleStateMutators = {
  getTarget: () => gBattlerTarget,
  setTarget: (v: number) => { gBattlerTarget = v & 0xFF; },
  getAttacker: () => gBattlerAttacker,
  setAttacker: (v: number) => { gBattlerAttacker = v & 0xFF; },
  getHitMarker: () => gHitMarker,
  setHitMarker: (v: number) => { gHitMarker = v >>> 0; },
  getMoveResultFlags: () => gMoveResultFlags,
  setMoveResultFlags: (v: number) => { gMoveResultFlags = v >>> 0; },
  getBattleMoveDamage: () => gBattleMoveDamage,
  setBattleMoveDamage: (v: number) => { gBattleMoveDamage = v | 0; },
  getCritMultiplier: () => gCritMultiplier,
  setCritMultiplier: (v: number) => { gCritMultiplier = v & 0xFF; },
  getBattleOutcome: () => gBattleOutcome,
  setBattleOutcome: (v: number) => { gBattleOutcome = v & 0xFF; },
  getChosenMove: () => gChosenMove,
  setChosenMove: (v: number) => { gChosenMove = v & 0xFFFF; },
  getCurrentMove: () => gCurrentMove,
  setCurrentMove: (v: number) => { gCurrentMove = v & 0xFFFF; },
  getBattleWeather: () => gBattleWeather,
  setBattleWeather: (v: number) => { gBattleWeather = v & 0xFFFF; },
  getBattleTypeFlags: () => gBattleTypeFlags,
  setBattleTypeFlags: (v: number) => { gBattleTypeFlags = v >>> 0; },
  getLastUsedItem: () => gLastUsedItem,
  setLastUsedItem: (v: number) => { gLastUsedItem = v & 0xFFFF; },
  getTrainerBattleOpponent_A: () => gTrainerBattleOpponent_A,
  setTrainerBattleOpponent_A: (v: number) => { gTrainerBattleOpponent_A = v & 0xFFFF; },
  getNumSafariBalls: () => 0,
  setNumSafariBalls: () => { /* gNumSafariBalls pas encore déclaré (= Safari Frontier scope) */ },
  getMoveToLearn: () => gMoveToLearn,
  setMoveToLearn: (v: number) => { gMoveToLearn = v & 0xFFFF; },
};
}  // end of if-not-set guard for __battleStateMutators

// Devtool harness : lecture LIVE de l'état combat depuis la console. Les sondes
// eval reçoivent une instance de module SÉPARÉE (leçon module-identity) — ce
// pont expose l'instance du JEU (guard if-not-set : la 1re évaluation gagne,
// même pattern que __battleStateMutators ci-dessus).
if (!(globalThis as Record<string, unknown>).__getBattleState) {
  (globalThis as Record<string, unknown>).__getBattleState = () => ({
    gBattleStruct, gBattleMons, gBattlerAttacker, gBattlerTarget,
  });
}
