/**
 * battle/battle-event-queue.ts — Queue d'événements UI émis par les
 * `BtlController_Emit*` fns 1:1 décomp `src/battle_controllers.c:1080-1500`.
 *
 * Architecture 1:1 strict :
 *   - Le décomp utilise un IPC buffer (`sBattleBuffersTransferData`) + un
 *     handler côté controller (= `BufferStringBattle`/`PrintString` etc.) pour
 *     consumer le buffer. Le bytecode pause via `Cmd_waitmessage`/`waitanimation`.
 *   - Notre port n'a pas d'IPC multi-CPU. À la place, on enqueue des events
 *     typés dans `gBattleEventQueue`. Le bytecode tourne en fastForward et
 *     produit la liste complète d'events. Le code UI (= battle-flow.ts ou
 *     battle-renderer post wire) consume la queue séquentiellement en jouant
 *     chaque event avec ses anims/text/delays.
 *
 * Types d'events 1:1 décomp `include/battle_controllers.h:7-80` (CONTROLLER_*) :
 *   - CONTROLLER_PRINTSTRING : afficher un msg via `BufferStringBattle(stringId)`.
 *   - CONTROLLER_PRINTSTRING_PLAYER_ONLY : variant player-side only.
 *   - CONTROLLER_MOVE_ANIMATION : jouer move anim (= move sprite particles).
 *   - CONTROLLER_HEALTHBARUPDATE : tween la HP bar value → new value.
 *   - CONTROLLER_HITANIMATION : flash sprite + nudge.
 *   - CONTROLLER_FAINT_ANIMATION : fade-down sprite.
 *   - CONTROLLER_STATUSICONUPDATE : update poison/burn/sleep icon overlay.
 *   - CONTROLLER_STATUS_ANIMATION : status anim (= shake + tint + status SE).
 *   - CONTROLLER_RETURN_MON_TO_BALL : recall anim + Pokéball.
 *   - CONTROLLER_SPRITE_INVISIBILITY : toggle invisible (= Substitute/Snatch).
 *   - CONTROLLER_BATTLE_ANIMATION : generic battle anim (stat change, etc.).
 *   - CONTROLLER_DRAWPARTYSTATUSSUMMARY : mini row party icons.
 *   - CONTROLLER_HIDEPARTYSTATUSSUMMARY.
 *   - CONTROLLER_TRAINER_SLIDE / TRAINER_SLIDE_BACK : trainer sprite anim.
 *   - CONTROLLER_BALLTHROWANIM : ball throw anim 6 cases.
 *   - CONTROLLER_EXPUPDATE : XP bar fill anim.
 *   - CONTROLLER_CHOOSEPOKEMON : open party menu.
 *   - CONTROLLER_LINKSTANDBYMSG : "Communicating..." link.
 *   - CONTROLLER_CANTSWITCH : "Can't switch out" msg.
 *   - CONTROLLER_YESNOBOX : YES/NO prompt.
 *   - CONTROLLER_SWITCHINANIM : sprite slide-in for swap.
 *   - CONTROLLER_RESETACTIONMOVESELECTION : reset cursor.
 *   - CONTROLLER_PLAYSE / CONTROLLER_PLAYFANFAREORBGM / CONTROLLER_FAINTINGCRY :
 *     audio events.
 *   - CONTROLLER_BATTLEANIMATION : alias = générique.
 *   - CONTROLLER_ENDLINKBATTLE : end of link battle anim.
 *
 * Phase 1.4 work : wire chaque Emit fn pour enqueue + consume côté battle-flow.
 */

import type { DisableStruct } from './state';

// ─── Controller op enum (1:1 décomp include/battle_controllers.h:7-50) ─────

export const CONTROLLER_GETMONDATA                  = 0x00;
export const CONTROLLER_GETRAWMONDATA               = 0x01;
export const CONTROLLER_SETMONDATA                  = 0x02;
export const CONTROLLER_SETRAWMONDATA               = 0x03;
export const CONTROLLER_LOADMONSPRITE               = 0x04;
export const CONTROLLER_SWITCHINANIM                = 0x05;
export const CONTROLLER_RETURNMONTOBALL             = 0x06;
export const CONTROLLER_DRAWTRAINERPIC              = 0x07;
export const CONTROLLER_TRAINERSLIDE                = 0x08;
export const CONTROLLER_TRAINERSLIDEBACK            = 0x09;
export const CONTROLLER_FAINTANIMATION              = 0x0A;
export const CONTROLLER_PALETTEFADE                 = 0x0B;
export const CONTROLLER_SUCCESSBALLTHROWANIM        = 0x0C;
export const CONTROLLER_BALLTHROWANIM               = 0x0D;
export const CONTROLLER_PAUSE                       = 0x0E;
export const CONTROLLER_MOVEANIMATION               = 0x0F;
export const CONTROLLER_PRINTSTRING                 = 0x10;
export const CONTROLLER_PRINTSTRINGPLAYERONLY       = 0x11;
export const CONTROLLER_CHOOSEACTION                = 0x12;
export const CONTROLLER_UNKNOWNYESNOBOX             = 0x13;
export const CONTROLLER_CHOOSEMOVE                  = 0x14;
export const CONTROLLER_OPENBAG                     = 0x15;
export const CONTROLLER_CHOOSEPOKEMON               = 0x16;
export const CONTROLLER_23                          = 0x17;
export const CONTROLLER_HEALTHBARUPDATE             = 0x18;
export const CONTROLLER_EXPUPDATE                   = 0x19;
export const CONTROLLER_STATUSICONUPDATE            = 0x1A;
export const CONTROLLER_STATUSANIMATION             = 0x1B;
export const CONTROLLER_STATUSXOR                   = 0x1C;
export const CONTROLLER_DATATRANSFER                = 0x1D;
export const CONTROLLER_DMA3TRANSFER                = 0x1E;
export const CONTROLLER_PLAYBGM                     = 0x1F;
export const CONTROLLER_32                          = 0x20;
export const CONTROLLER_TWORETURNVALUES             = 0x21;
export const CONTROLLER_CHOSENMONRETURNVALUE        = 0x22;
export const CONTROLLER_ONERETURNVALUE              = 0x23;
export const CONTROLLER_ONERETURNVALUE_DUPLICATE    = 0x24;
export const CONTROLLER_CLEARUNKVAR                 = 0x25;
export const CONTROLLER_SETUNKVAR                   = 0x26;
export const CONTROLLER_CLEARUNKFLAG                = 0x27;
export const CONTROLLER_TOGGLEUNKFLAG               = 0x28;
export const CONTROLLER_HITANIMATION                = 0x29;
export const CONTROLLER_CANTSWITCH                  = 0x2A;
export const CONTROLLER_PLAYSE                      = 0x2B;
export const CONTROLLER_PLAYFANFAREORBGM            = 0x2C;
export const CONTROLLER_FAINTINGCRY                 = 0x2D;
export const CONTROLLER_INTROSLIDE                  = 0x2E;
export const CONTROLLER_INTROTRAINERBALLTHROW       = 0x2F;
export const CONTROLLER_DRAWPARTYSTATUSSUMMARY      = 0x30;
export const CONTROLLER_HIDEPARTYSTATUSSUMMARY      = 0x31;
export const CONTROLLER_ENDBOUNCE                   = 0x32;
export const CONTROLLER_SPRITEINVISIBILITY          = 0x33;
export const CONTROLLER_BATTLEANIMATION             = 0x34;
export const CONTROLLER_LINKSTANDBYMSG              = 0x35;
export const CONTROLLER_RESETACTIONMOVESELECTION    = 0x36;
export const CONTROLLER_ENDLINKBATTLE               = 0x37;

// ─── Payload structs (1:1 décomp battle_controllers.c sBattleBuffersTransferData
//     params + battle_message.h struct BattleMsgData) ────────────────────────

/** 1:1 décomp `struct BattleMsgData` (battle_message.h:14-39).
 *  Le PrintString event embarque ces données pour le decoder côté UI. */
export interface BattleMsgData {
  currentMove: number;
  originallyUsedMove: number;
  lastItem: number;
  lastAbility: number;
  scrActive: number;
  bakScriptPartyIdx: number;
  hpScale: number;
  itemEffectBattler: number;
  moveType: number;
  abilities: number[];           // = MAX_BATTLERS_COUNT length, source = gBattleMons[i].ability
  textBuffs: [Uint8Array, Uint8Array, Uint8Array];  // = copy de gBattleTextBuff1/2/3
}

// ─── Discriminated union des events 1:1 décomp ────────────────────────────

export interface BattleEvent_PrintString {
  type: typeof CONTROLLER_PRINTSTRING;
  battler: number;         // = gActiveBattler au moment de l'emit
  outcome: number;         // = gBattleOutcome au moment de l'emit
  stringId: number;
  msgData: BattleMsgData;
}

export interface BattleEvent_PrintStringPlayerOnly {
  type: typeof CONTROLLER_PRINTSTRINGPLAYERONLY;
  battler: number;
  stringId: number;
  msgData: BattleMsgData;
}

export interface BattleEvent_MoveAnimation {
  type: typeof CONTROLLER_MOVEANIMATION;
  battler: number;
  move: number;
  turnOfMove: number;
  movePower: number;
  dmg: number;
  friendship: number;
  multihit: number;
  weather: number;          // = gBattleWeather au moment de l'emit (si WEATHER_HAS_EFFECT)
  disableStruct: DisableStruct;
}

export interface BattleEvent_HealthBarUpdate {
  type: typeof CONTROLLER_HEALTHBARUPDATE;
  battler: number;
  healthValue: number;      // = nouvelle HP (signed s32 dans le décomp, mais le tween calcule diff)
}

export interface BattleEvent_HitAnimation {
  type: typeof CONTROLLER_HITANIMATION;
  battler: number;
}

export interface BattleEvent_FaintAnimation {
  type: typeof CONTROLLER_FAINTANIMATION;
  battler: number;
}

export interface BattleEvent_StatusIconUpdate {
  type: typeof CONTROLLER_STATUSICONUPDATE;
  battler: number;
  status1: number;          // = gBattleMons[battler].status1
  status2: number;          // = gBattleMons[battler].status2
}

export interface BattleEvent_StatusAnimation {
  type: typeof CONTROLLER_STATUSANIMATION;
  battler: number;
  isStatus2: boolean;
  status: number;
}

export interface BattleEvent_BattleAnimation {
  type: typeof CONTROLLER_BATTLEANIMATION;
  battler: number;
  animationId: number;
  argument: number;
}

export interface BattleEvent_PlaySE {
  type: typeof CONTROLLER_PLAYSE;
  battler: number;
  songId: number;
}

export interface BattleEvent_PlayFanfareOrBGM {
  type: typeof CONTROLLER_PLAYFANFAREORBGM;
  battler: number;
  songId: number;
  isBGM: boolean;
}

export interface BattleEvent_FaintingCry {
  type: typeof CONTROLLER_FAINTINGCRY;
  battler: number;
}

export interface BattleEvent_ReturnMonToBall {
  type: typeof CONTROLLER_RETURNMONTOBALL;
  battler: number;
  doFadeOut: boolean;
}

export interface BattleEvent_SpriteInvisibility {
  type: typeof CONTROLLER_SPRITEINVISIBILITY;
  battler: number;
  isInvisible: boolean;
}

export interface BattleEvent_SwitchInAnim {
  type: typeof CONTROLLER_SWITCHINANIM;
  battler: number;
  partyId: number;
  dontClear: number;
}

export interface BattleEvent_DrawPartyStatusSummary {
  type: typeof CONTROLLER_DRAWPARTYSTATUSSUMMARY;
  battler: number;
  hpStatuses: number[];     // tableau de [species, hp, status1] par mon
  arg2: number;             // = isBattleStart flag (1:1 décomp)
}

export interface BattleEvent_HidePartyStatusSummary {
  type: typeof CONTROLLER_HIDEPARTYSTATUSSUMMARY;
  battler: number;
}

export interface BattleEvent_TrainerSlide {
  type: typeof CONTROLLER_TRAINERSLIDE;
  battler: number;
}

export interface BattleEvent_TrainerSlideBack {
  type: typeof CONTROLLER_TRAINERSLIDEBACK;
  battler: number;
}

export interface BattleEvent_BallThrowAnim {
  type: typeof CONTROLLER_BALLTHROWANIM;
  battler: number;
  caseId: number;
}

export interface BattleEvent_ExpUpdate {
  type: typeof CONTROLLER_EXPUPDATE;
  battler: number;
  partyId: number;
  expPoints: number;
}

export interface BattleEvent_ChoosePokemon {
  type: typeof CONTROLLER_CHOOSEPOKEMON;
  battler: number;
  caseId: number;
  monToSwitchIntoId: number;
  ability: number;
  partyOrder: number;
}

export interface BattleEvent_LinkStandbyMsg {
  type: typeof CONTROLLER_LINKSTANDBYMSG;
  battler: number;
  mode: number;
  frame: boolean;
}

export interface BattleEvent_CantSwitch {
  type: typeof CONTROLLER_CANTSWITCH;
  battler: number;
}

export interface BattleEvent_YesNoBox {
  type: typeof CONTROLLER_UNKNOWNYESNOBOX;
  battler: number;
}

export interface BattleEvent_ResetActionMoveSelection {
  type: typeof CONTROLLER_RESETACTIONMOVESELECTION;
  battler: number;
  caseId: number;
}

export interface BattleEvent_PrintSelectionString {
  type: typeof CONTROLLER_PRINTSTRINGPLAYERONLY;
  battler: number;
  stringId: number;
  msgData: BattleMsgData;
  isSelection: true;
}

export interface BattleEvent_EndLinkBattle {
  type: typeof CONTROLLER_ENDLINKBATTLE;
  battler: number;
  outcome: number;
}

export type BattleEvent =
  | BattleEvent_PrintString
  | BattleEvent_MoveAnimation
  | BattleEvent_HealthBarUpdate
  | BattleEvent_HitAnimation
  | BattleEvent_FaintAnimation
  | BattleEvent_StatusIconUpdate
  | BattleEvent_StatusAnimation
  | BattleEvent_BattleAnimation
  | BattleEvent_PlaySE
  | BattleEvent_PlayFanfareOrBGM
  | BattleEvent_FaintingCry
  | BattleEvent_ReturnMonToBall
  | BattleEvent_SpriteInvisibility
  | BattleEvent_SwitchInAnim
  | BattleEvent_DrawPartyStatusSummary
  | BattleEvent_HidePartyStatusSummary
  | BattleEvent_TrainerSlide
  | BattleEvent_TrainerSlideBack
  | BattleEvent_BallThrowAnim
  | BattleEvent_ExpUpdate
  | BattleEvent_ChoosePokemon
  | BattleEvent_LinkStandbyMsg
  | BattleEvent_CantSwitch
  | BattleEvent_YesNoBox
  | BattleEvent_ResetActionMoveSelection
  | BattleEvent_PrintSelectionString
  | BattleEvent_EndLinkBattle;

// ─── Queue impl ─────────────────────────────────────────────────────────────

const _gBattleEventQueue: BattleEvent[] = [];

/** Add un event à la queue (= émit fn appelle ici).
 *  1:1 décomp : équivalent du `PrepareBufferDataTransfer` côté controller. */
export function enqueueBattleEvent(event: BattleEvent): void {
  _gBattleEventQueue.push(event);
}

/** Pop le prochain event de la queue (= UI consume ici).
 *  Returns undefined si queue vide. */
export function dequeueBattleEvent(): BattleEvent | undefined {
  return _gBattleEventQueue.shift();
}

/** Peek le prochain event sans le pop. */
export function peekBattleEvent(): BattleEvent | undefined {
  return _gBattleEventQueue[0];
}

/** Clear toute la queue (= reset cross-battle). */
export function clearBattleEventQueue(): void {
  _gBattleEventQueue.length = 0;
}

/** Size de la queue (= debug + condition consume). */
export function getBattleEventQueueSize(): number {
  return _gBattleEventQueue.length;
}

/** Snapshot read-only de toute la queue (= debug). */
export function getBattleEventQueueSnapshot(): readonly BattleEvent[] {
  return [..._gBattleEventQueue];
}

/** Helper : build BattleMsgData snapshot from current battle state.
 *  1:1 décomp `battle_controllers.c:1147-1166`. */
export function buildBattleMsgDataSnapshot(state: {
  gCurrentMove: number;
  gChosenMove: number;
  gLastUsedItem: number;
  gLastUsedAbility: number;
  gBattleScripting: { battler: number };
  gBattleStruct: { scriptPartyIdx: number; hpScale: number };
  gPotentialItemEffectBattler: number;
  gBattleMoveType: number;
  gBattleMons: Array<{ ability: number }>;
  gBattleTextBuff1: Uint8Array;
  gBattleTextBuff2: Uint8Array;
  gBattleTextBuff3: Uint8Array;
  maxBattlersCount: number;
}): BattleMsgData {
  const abilities = new Array(state.maxBattlersCount);
  for (let i = 0; i < state.maxBattlersCount; i++) {
    abilities[i] = state.gBattleMons[i]?.ability ?? 0;
  }
  return {
    currentMove: state.gCurrentMove,
    originallyUsedMove: state.gChosenMove,
    lastItem: state.gLastUsedItem,
    lastAbility: state.gLastUsedAbility,
    scrActive: state.gBattleScripting.battler,
    bakScriptPartyIdx: state.gBattleStruct.scriptPartyIdx,
    hpScale: state.gBattleStruct.hpScale,
    itemEffectBattler: state.gPotentialItemEffectBattler,
    moveType: state.gBattleMoveType,
    abilities,
    textBuffs: [
      new Uint8Array(state.gBattleTextBuff1),
      new Uint8Array(state.gBattleTextBuff2),
      new Uint8Array(state.gBattleTextBuff3),
    ],
  };
}
