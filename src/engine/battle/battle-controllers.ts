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
 * Pour Niveau 4 MVP (= backing infrastructure pas wired au gameplay) :
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
 *  futur. Appelé par tickBattleControllers MVP. */
export function clearBattlerExecFlag(battlerId: number): void {
  setBattleControllerExecFlags(gBattleControllerExecFlags & ~gBitTable[battlerId]);
}

/** Tick (= clear all exec flags) pour simuler les controllers finis instantané.
 *  TODO : remplacer par real per-controller tick une fois wired au framework
 *  UI. Pour MVP backing, clear tout = scripts s'avancent sans wait. */
export function tickBattleControllers(): void {
  setBattleControllerExecFlags(0);
}

// ─── BtlController_Emit* stubs ──────────────────────────────────────────────

/** 1:1 signature décomp `BtlController_EmitMoveAnimation` (battle_controllers.c).
 *  Pour MVP : no-op (anim n'est pas rendue, mais Mark+execflags fait le sync). */
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
  // TODO : émettre command anim au framework. MVP = no-op.
}

/** 1:1 signature décomp `BtlController_EmitPrintString` (battle_controllers.c).
 *  Source utilisé par `PrepareStringBattle`. Pour MVP : no-op. */
export function BtlController_EmitPrintString(_bufferId: number, _stringId: number): void {
  // TODO : émettre command print au framework. MVP = no-op.
}

/** 1:1 signature décomp `BtlController_EmitYesNoBox` n'existe pas — yesnobox
 *  est implémenté direct par Cmd_yesnobox via le state machine
 *  gBattleCommunication[0]. Le helper PlaySE/JOY_NEW est stubbé séparément. */

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
 *  Décomp construit/clear un rect window dans BG tilemap. MVP = no-op. */
export function HandleBattleWindow(
  _xStart: number, _yStart: number, _xEnd: number, _yEnd: number, _flags: number,
): void {
  // TODO : draw/clear window au framework UI. MVP = no-op.
}

/** 1:1 signature décomp `BattlePutTextOnWindow(text, windowId)`. MVP = no-op. */
export function BattlePutTextOnWindow(_text: number | string, _windowId: number): void {
  // TODO : print text to battle window via gBattleScripting.windowsType
  //        + sBattleTextOnWindowsInfo. MVP = no-op.
}

/** 1:1 signature décomp `BattleCreateYesNoCursorAt(cursorPosition)`. MVP = no-op. */
export function BattleCreateYesNoCursorAt(_cursorPosition: number): void {
  // TODO : draw yes/no cursor sprite. MVP = no-op.
}

/** 1:1 signature décomp `BattleDestroyYesNoCursorAt(cursorPosition)`. MVP = no-op. */
export function BattleDestroyYesNoCursorAt(_cursorPosition: number): void {
  // TODO : remove yes/no cursor sprite. MVP = no-op.
}

/** 1:1 signature décomp `PlaySE(seId)`. MVP = no-op (= SE channel not wired). */
export function PlaySE(_seId: number): void {
  // TODO : trigger SE via audio engine. MVP = no-op.
}

/** 1:1 signature décomp `JOY_NEW(button)` (= io_reg.h macro). Returns true si
 *  le bouton vient d'être pressé ce frame. MVP : pas d'input wired, return false.
 *  Pour yesnobox MVP : on auto-confirme YES (= cursor=0) via auto-press hack en
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
