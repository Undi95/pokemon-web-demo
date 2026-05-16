/**
 * battle/battle-controllers.ts — minimal stubs pour battle controllers async.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_controllers.c` (~2300 lignes,
 *     les `BtlController_Emit*` fns + dispatch via gBattlerControllerFuncs[])
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c` (= helpers comme
 *     `MarkBattlerForControllerExec`, `PrepareStringBattle`)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/util.c:7` (= `gBitTable[]`)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/battle.h:9` (= MAX_BATTLERS_COUNT=4)
 *
 * Rationale : les opcodes Niveau 4 (attackanimation/printstring/waitmessage/etc.)
 * appellent `BtlController_Emit*` puis `MarkBattlerForControllerExec`. Cela set
 * un bit dans `gBattleControllerExecFlags`. Les opcodes `waitanimation` et
 * `waitmessage` pause jusqu'à ce que le flag soit 0.
 *
 * Pour Phase 1 (= backing infrastructure pas wired au gameplay) :
 *   - `MarkBattlerForControllerExec` 1:1 décomp (set bit).
 *   - `BtlController_Emit*` = stubs vides (= aucune anim/text rendu).
 *   - `tickBattleControllers()` clear le flag (= simule les controllers finis
 *     instantané). Appelé entre les handler calls par runBattleScript loop.
 *
 * Quand on wirera ce battle interpreter au gameplay, ces stubs seront remplacés
 * par de vraies fonctions qui :
 *   1. Émettent les commandes UI au framework graphique (anim, text, fade, etc.)
 *   2. Le framework appelle un callback "controller done" qui clear le bit.
 *
 * Cf. session 134 dans `D:/Projet 1/pokemon-web-demo/memory/`.
 */

import { MAX_BATTLERS_COUNT, gBattleScripting, setBattleControllerExecFlags, gBattleControllerExecFlags, setActiveBattler } from './state';
import type { BattleScriptContext } from './script-interpreter';

// ─── gBitTable[] (util.c:7) — 1:1 décomp ─────────────────────────────────────
// `const u32 gBitTable[] = { 1<<0, 1<<1, ..., 1<<31 }`. Indexé par battler id.
export const gBitTable: number[] = (() => {
  const t = new Array(32);
  for (let i = 0; i < 32; i++) t[i] = 1 << i;
  return t;
})();

// ─── Controller exec flags helpers ──────────────────────────────────────────

/** 1:1 décomp `MarkBattlerForControllerExec(battlerId)` (battle_util.c).
 *  Set bit `battlerId` dans gBattleControllerExecFlags. (Link battle shift
 *  par 28 — pas implémenté ici, gameplay offline only). */
export function MarkBattlerForControllerExec(battlerId: number): void {
  setBattleControllerExecFlags(gBattleControllerExecFlags | gBitTable[battlerId]);
}

/** Clear exec flag pour battler donné (= controller signal "I'm done").
 *  Pas une fonction 1:1 décomp en soi (= dans le décomp c'est implicit par le
 *  controller qui termine son state machine), mais nécessaire pour le wire
 *  futur. Appelé par tickBattleControllers (= Phase 1 stub clear immédiat). */
export function clearBattlerExecFlag(battlerId: number): void {
  setBattleControllerExecFlags(gBattleControllerExecFlags & ~gBitTable[battlerId]);
}

/** Tick (= clear all exec flags) pour simuler les controllers finis instantané.
 *  Phase 1.4 : remplacer par real per-controller tick une fois wired au framework
 *  UI. Pour Phase 1, clear tout = scripts s'avancent sans wait.
 *
 *  Reset aussi `gBattleCommunication[MSG_DISPLAY]` (= 0) car le décomp utilise
 *  cette flag pour signaler "text print en cours". Sans wire UI text, on
 *  simule "fini instantanément" en clearing ici. Sinon `Cmd_waitmessage`
 *  loop infiniment (= 497/639 scripts stuck post wire avant fix).
 *
 *  Note : MSG_DISPLAY = 0 (= constant in battle.h:84). On utilise direct
 *  index pour éviter circular imports. */
export function tickBattleControllers(): void {
  setBattleControllerExecFlags(0);
  // 1:1 décomp simulate "text print done" instantané.
  // MSG_DISPLAY = 7 (= constants.ts:458 from battle.h).
  const bs = (globalThis as { __battleState?: { gBattleCommunication?: number[] } })
    .__battleState;
  if (bs?.gBattleCommunication) {
    bs.gBattleCommunication[7] = 0;  // MSG_DISPLAY = 7.
  }
}

// ─── BtlController_Emit* stubs ──────────────────────────────────────────────

/** 1:1 signature décomp `BtlController_EmitMoveAnimation` (battle_controllers.c).
 *  Phase 1 stub : no-op (anim n'est pas rendue, mais Mark+execflags fait le sync). */
export function BtlController_EmitMoveAnimation(
  _bufferId: number,
  _move: number,
  _turnOfMove: number,
  _movePower: number,
  _dmg: number,
  _friendship: number,
  _disableStructPtr: unknown,
  _multihit: number,
): void {
  // Phase 1.4 UI : émettre command anim au framework.
}

/** 1:1 signature décomp `BtlController_EmitPrintString` (battle_controllers.c).
 *  Source utilisé par `PrepareStringBattle`. Phase 1 stub : no-op. */
export function BtlController_EmitPrintString(_bufferId: number, _stringId: number): void {
  // Phase 1.4 UI : émettre command print au framework.
}

/** 1:1 signature décomp `BtlController_EmitPlaySE(bufferId, songId)`
 *  (battle_controllers.c). Émet command PlaySE via le controller du battler.
 *  Distinct de PlaySE direct (= audio engine path). Phase 1 stub : no-op. */
export function BtlController_EmitPlaySE(_bufferId: number, _songId: number): void {
  // Phase 1.4 UI : émettre PlaySE via controller queue au framework UI.
}

/** 1:1 signature décomp `BtlController_EmitPlayFanfareOrBGM(buf, songId, isBGM)`
 *  (battle_controllers.c). Phase 1 stub : no-op. */
export function BtlController_EmitPlayFanfareOrBGM(_bufferId: number, _songId: number, _isBGM: boolean): void {
  // Phase 1.4 UI : émettre fanfare/BGM via controller queue.
}

/** 1:1 signature décomp `BtlController_EmitFaintingCry(buf)`. Phase 1 stub : no-op. */
export function BtlController_EmitFaintingCry(_bufferId: number): void {
  // Phase 1.4 UI : émettre cry du Pokémon évanoui.
}

/** 1:1 signature décomp `BtlController_EmitHitAnimation(buf)`. Phase 1 stub : no-op. */
export function BtlController_EmitHitAnimation(_bufferId: number): void {
  // Phase 1.4 UI : émettre hit anim (sprite flash + nudge).
}

/** 1:1 signature décomp `BtlController_EmitFaintAnimation(buf)`. Phase 1 stub : no-op. */
export function BtlController_EmitFaintAnimation(_bufferId: number): void {
  // Phase 1.4 UI : émettre faint anim (sprite fade).
}

/** 1:1 signature décomp `BtlController_EmitReturnMonToBall(buf, doFadeOut)`.
 *  Phase 1 stub : no-op. */
export function BtlController_EmitReturnMonToBall(_bufferId: number, _doFadeOut: boolean): void {
  // Phase 1.4 UI : émettre recall anim + Pokéball.
}

/** 1:1 signature décomp `BtlController_EmitSpriteInvisibility(buf, isInvisible)`.
 *  Phase 1 stub : no-op. */
export function BtlController_EmitSpriteInvisibility(_bufferId: number, _isInvisible: boolean): void {
  // Phase 1.4 UI : toggle sprite visibility.
}

/** 1:1 signature décomp `BtlController_EmitSetMonData(buf, requestId, monIdx,
 *  bytes, data)` (battle_controllers.c).
 *
 *  Le décomp utilise un buffer link/inter-cpu : le caller a déjà write
 *  gBattleMons[gActiveBattler].X, puis cet emit notifie le controller-side
 *  pour persist le change au party-side (= gPlayerParty/gEnemyParty Pokemon
 *  struct via SetMonData).
 *
 *  Notre port : flush direct via SetMonData sur le party slot correspondant.
 *  Couvre les cas usuels en battle : HP, status, PP, held item, level, exp.
 *
 *  Note importante : monIdx est typiquement 0 (= "current battler") ou un
 *  bitmask (= sur Emit de plusieurs mons). Pour single mon, on flush via
 *  gActiveBattler. Pour bitmask, on itère. */
export function BtlController_EmitSetMonData(
  _bufferId: number, requestId: number, _monToCheck: number, _bytes: number, data: unknown,
): void {
  // Lazy import pour éviter circular deps via party-storage → state.
  const ps = (globalThis as { __batPSetMonByActive?: (req: number, data: unknown) => void })
    .__batPSetMonByActive;
  if (ps) ps(requestId, data);
}

/** 1:1 signature décomp `BtlController_EmitPrintSelectionString(buf, stringId)`.
 *  Phase 1 stub : no-op (= selection screen text). */
export function BtlController_EmitPrintSelectionString(_bufferId: number, _stringId: number): void {
  // Phase 1.4 UI : print selection string au framework UI.
}

/** 1:1 signature décomp `BtlController_EmitEndLinkBattle(buf, outcome)`.
 *  Phase 1 stub : no-op. */
export function BtlController_EmitEndLinkBattle(_bufferId: number, _outcome: number): void {
  // Phase 1.4 UI : émettre end-link au framework (= return to overworld).
}

/** 1:1 signature décomp `BtlController_EmitBattleAnimation(buf, anim, arg)`.
 *  Animation séparée de move animation. Phase 1 stub : no-op. */
export function BtlController_EmitBattleAnimation(_bufferId: number, _animationId: number, _argument: number): void {
  // Phase 1.4 UI : émettre battle anim (stat change, snatch, substitute fade, etc.).
}

/** 1:1 signature décomp `BtlController_EmitStatusIconUpdate(buf, status1, status2)`.
 *  Phase 1 stub : no-op. */
export function BtlController_EmitStatusIconUpdate(_bufferId: number, _status1: number, _status2: number): void {
  // Phase 1.4 UI : update sprite status icon (poison/burn/sleep overlay).
}

/** 1:1 signature décomp `BtlController_EmitHealthBarUpdate(buf, healthValue)`.
 *  Phase 1 stub : no-op. */
export function BtlController_EmitHealthBarUpdate(_bufferId: number, _healthValue: number): void {
  // Phase 1.4 UI : update HP bar animation.
}

/** 1:1 signature décomp `BtlController_EmitStatusAnimation(buf, status2anim, status)`.
 *  status2anim = TRUE pour STATUS2_*, FALSE pour STATUS1_*. */
export function BtlController_EmitStatusAnimation(_bufferId: number, _isStatus2: boolean, _status: number): void {
  // Phase 1.4 UI : status anim (sprite shake + tint + status sound).
}

/** 1:1 signature décomp `BtlController_EmitDrawPartyStatusSummary(buf, hpStatuses, isBattleStart)`. */
export function BtlController_EmitDrawPartyStatusSummary(_bufferId: number, _hpStatuses: unknown, _arg2: number): void {
  // Phase 1.4 UI : render mini-icons row showing party HP/status (= top of screen).
}

/** 1:1 signature décomp `BtlController_EmitHidePartyStatusSummary(buf)`. */
export function BtlController_EmitHidePartyStatusSummary(_bufferId: number): void {
  // Phase 1.4 UI : hide party status row.
}

/** 1:1 signature décomp `BtlController_EmitTrainerSlideBack(buf)`. */
export function BtlController_EmitTrainerSlideBack(_bufferId: number): void {
  // Phase 1.4 UI : trainer sprite slide-out anim.
}

/** 1:1 signature décomp `BtlController_EmitTrainerSlide(buf)` (= slide in). */
export function BtlController_EmitTrainerSlide(_bufferId: number): void {
  // Phase 1.4 UI : trainer sprite slide-in anim.
}

/** 1:1 signature décomp `BtlController_EmitBallThrowAnim(buf, caseId)`
 *  (battle_controllers.c:1089-1094). caseId :
 *  0 = BALL_NO_SHAKES, 1..3 = BALL_*_SHAKES_FAIL, 4 = BALL_3_SHAKES_SUCCESS,
 *  5 = BALL_TRAINER_BLOCK, 6 = BALL_WALLY_SUCCESS_HACK. Phase 1.4 UI = anim. */
export function BtlController_EmitBallThrowAnim(_bufferId: number, _caseId: number): void {
  // Phase 1.4 UI : ball throw anim sprite.
}

/** 1:1 signature décomp `BtlController_EmitExpUpdate(buf, partyId, expPoints)`
 *  (battle_controllers.c:1275-1281). Émet l'XP gain anim sur le party icon. */
export function BtlController_EmitExpUpdate(_bufferId: number, _partyId: number, _expPoints: number): void {
  // Phase 1.4 UI : XP bar fill anim.
}

/** 1:1 signature décomp `BtlController_EmitChoosePokemon(buf, caseId,
 *  monToSwitchIntoId_partner, ability, partyOrder)`. */
export function BtlController_EmitChoosePokemon(
  _bufferId: number, _caseId: number, _monToSwitchIntoId: number, _ability: number, _partyOrder: number,
): void {
  // Phase 1.4 UI : open party menu UI.
}

/** 1:1 signature décomp `BtlController_EmitLinkStandbyMsg(buf, mode, frame)`. */
export function BtlController_EmitLinkStandbyMsg(_bufferId: number, _mode: number, _frame: boolean): void {
  // Phase 1.4 UI : link standby message (= multi link battle).
}

/** 1:1 signature décomp `BtlController_EmitCantSwitch(buf)`. */
export function BtlController_EmitCantSwitch(_bufferId: number): void {
  // Phase 1.4 UI : show "Can't switch out" message.
}

/** 1:1 signature décomp `BtlController_EmitYesNoBox(buf)`. */
export function BtlController_EmitYesNoBox(_bufferId: number): void {
  // Phase 1.4 UI : show YES/NO box UI.
}

/** 1:1 signature décomp `BtlController_EmitSwitchInAnim(buf, partyId, dontClear)`. */
export function BtlController_EmitSwitchInAnim(_bufferId: number, _partyId: number, _dontClear: number): void {
  // Phase 1.4 UI : sprite slide-in animation for swap.
}

/** 1:1 signature décomp `BtlController_EmitGetMonData(buf, requestId, monBitFlags)`. */
export function BtlController_EmitGetMonData(_bufferId: number, _requestId: number, _monBitFlags: number): void {
  // Phase 1.4 UI : read mon data via controller. Notre port lit directement gBattleMons.
}

/** 1:1 signature décomp `BtlController_EmitResetActionMoveSelection(buf, caseId)`. */
export function BtlController_EmitResetActionMoveSelection(_bufferId: number, _caseId: number): void {
  // Phase 1.4 UI : reset action/move selection cursor (= Transform-style).
}

/** 1:1 signature décomp `BtlController_EmitYesNoBox` n'existe pas — yesnobox
 *  est implémenté direct par Cmd_yesnobox via le state machine
 *  gBattleCommunication[0]. */

// ─── PrepareStringBattle (battle_util.c) — 1:1 décomp ──────────────────────

/** 1:1 décomp `PrepareStringBattle` (battle_util.c). */
export function PrepareStringBattle(stringId: number, battler: number): void {
  setActiveBattler(battler);
  BtlController_EmitPrintString(0 /* B_COMM_TO_CONTROLLER */, stringId);
  MarkBattlerForControllerExec(battler);
}

// ─── BattleScript stack helpers (battle_util.c) — 1:1 décomp ───────────────

/** 1:1 décomp `BattleScriptPush(bsPtr)` (battle_util.c). Push offset dans le
 *  bytecode au stack de retour. Le décomp utilise gBattleResources->...->ptr[]
 *  mais notre port mappe ça au ctx.scriptPtrStack du runtime. */
export function BattleScriptPush(ctx: BattleScriptContext, bsPtr: number): void {
  ctx.scriptPtrStack.push(bsPtr);
}

/** 1:1 décomp `BattleScriptPop()` (battle_util.c). Pop offset retour stack. */
export function BattleScriptPop(ctx: BattleScriptContext): number {
  const v = ctx.scriptPtrStack.pop();
  return v === undefined ? -1 : v;
}

// ─── UI/Input stubs ─────────────────────────────────────────────────────────

/** 1:1 signature décomp `HandleBattleWindow(xStart, yStart, xEnd, yEnd, flags)`.
 *  Décomp construit/clear un rect window dans BG tilemap. Phase 1 stub : no-op. */
export function HandleBattleWindow(
  _xStart: number, _yStart: number, _xEnd: number, _yEnd: number, _flags: number,
): void {
  // Phase 1.4 UI : draw/clear window au framework UI.
}

/** 1:1 signature décomp `BattlePutTextOnWindow(text, windowId)`. Phase 1 stub. */
export function BattlePutTextOnWindow(_text: number | string, _windowId: number): void {
  //  Phase 1.4 UI : print text to battle window via gBattleScripting.windowsType
  //        + sBattleTextOnWindowsInfo.
}

/** 1:1 signature décomp `BattleCreateYesNoCursorAt(cursorPosition)`. Phase 1 stub. */
export function BattleCreateYesNoCursorAt(_cursorPosition: number): void {
  // Phase 1.4 UI : draw yes/no cursor sprite.
}

/** 1:1 signature décomp `BattleDestroyYesNoCursorAt(cursorPosition)`. Phase 1 stub. */
export function BattleDestroyYesNoCursorAt(_cursorPosition: number): void {
  // Phase 1.4 UI : remove yes/no cursor sprite.
}

/** 1:1 signature décomp `PlaySE(seId)`. Phase 1 stub (= SE channel not wired). */
export function PlaySE(_seId: number): void {
  // Phase 1.4 UI : trigger SE via audio engine.
}

/** 1:1 signature décomp `JOY_NEW(button)` (= io_reg.h macro). Returns true si
 *  le bouton vient d.être pressé ce frame. Phase 1 stub : pas d.input wired,
 *  return false. Pour yesnobox : on auto-confirme YES (= cursor=0) via auto-press hack en
 *  override de cette fonction (cf. cmd-niveau-4.ts Cmd_yesnobox). */
export function JOY_NEW(_button: number): boolean {
  return false;
}

// ─── Button constants (io_reg.h) — 1:1 décomp ──────────────────────────────
export const A_BUTTON      = 1 << 0;
export const B_BUTTON      = 1 << 1;
export const SELECT_BUTTON = 1 << 2;
export const START_BUTTON  = 1 << 3;
export const DPAD_RIGHT    = 1 << 4;
export const DPAD_LEFT     = 1 << 5;
export const DPAD_UP       = 1 << 6;
export const DPAD_DOWN     = 1 << 7;
export const R_BUTTON      = 1 << 8;
export const L_BUTTON      = 1 << 9;

// ─── SE_* constants (constants/songs.h) — subset utilisé Niveau 4 ──────────
export const SE_SELECT = 5; // 1:1 décomp constants/songs.h

// ─── Sanity check : MAX_BATTLERS_COUNT match ────────────────────────────────
if (MAX_BATTLERS_COUNT !== 4) {
  // Sanity check — gBitTable est indexé par battler id, jamais > 3.
  console.warn('[battle/battle-controllers] MAX_BATTLERS_COUNT mismatch:', MAX_BATTLERS_COUNT);
}

// gBattleScripting est ré-exporté pour les opcodes qui en ont besoin sans
// recharger le module state.
export { gBattleScripting };
