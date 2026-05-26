/**
 * battle/battle-levelup-box.ts — Port 1:1 strict du level-up box state machine.
 *
 * Source de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c:5927-6026`
 *     (Cmd_drawlvlupbox + DrawLevelUpWindow1/2 + LevelUpBanner helpers).
 *   - `D:/Projet 1/decomps/pokeemeraude/src/menu_specialized.c`
 *     (DrawLevelUpWindowPg1/Pg2 + GetMonLevelUpWindowStats).
 *
 * Fonctions portées 1:1 :
 *   - Cmd_drawlvlupbox (5927-6026) — state machine 0..10
 *   - DrawLevelUpWindow1 / DrawLevelUpWindow2 — page draw helpers
 *   - InitLevelUpBanner / SlideInLevelUpBanner / SlideOutLevelUpBanner
 *
 * State machine 0..10 :
 *   0 : entry → branch sur IsMonGettingExpSentOut (= 3 si in-battle, sinon 1)
 *   1 : init banner (BG2 attribute + InitLevelUpBanner)
 *   2 : slide-in wait (SlideInLevelUpBanner → 3)
 *   3 : init level up box (BG attributes + HandleBattleWindow)
 *   4 : draw page 1 (DrawLevelUpWindow1 + PutWindowTilemap + CopyWindowToVram)
 *   5 : wait BG copy → 6
 *   6 : wait input (newKeys != 0 → PlaySE + DrawLevelUpWindow2 → 7)
 *   7 : wait BG copy → 8
 *   8 : wait input (close box via HandleBattleWindow CLEAR → 9)
 *   9 : slide-out banner wait → 10
 *  10 : final BG restore + advance instr
 *
 * Note : c'est UI-lourd, cascade vers gba-window-system + sprite system.
 * Le squelette structure 1:1 strict est porté, les helpers visuels (=
 * HandleBattleWindow / DrawLevelUpWindowPg* / SlideIn/Out banner) sont
 * dette R3 explicite.
 *
 * Dépendances :
 *   - state.ts : gBattleScripting, gBattleStruct (= expGetterMonId)
 *   - gba-window-system.ts : ShowBg, AddWindow
 *   - decomp-globals.ts : getRuntime gMain.newKeys
 */

import { gBattleScripting, gBattleStruct } from './state';
import { getRuntime } from '../system/decomp-globals';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `B_WIN_LEVEL_UP_BOX` (battle.h). Window index dans gWindows. */
const B_WIN_LEVEL_UP_BOX = 13;
/** 1:1 décomp `B_WIN_LEVEL_UP_BANNER`. */
const B_WIN_LEVEL_UP_BANNER = 14;

/** 1:1 décomp `SE_SELECT` = 5 (constants/songs.h). */
const SE_SELECT = 5;

/** 1:1 décomp `NUM_STATS` = 6 (HP/Atk/Def/Spe/SpA/SpD). */
const NUM_STATS = 6;

/** 1:1 décomp `LEVEL_UP_BANNER_START` etc. (= scrolling positions). */
const LEVEL_UP_BANNER_END = -32;  // off-screen left

/** 1:1 décomp `WINDOW_BG1 / WINDOW_CLEAR` flags. */
const WINDOW_BG1 = 0;
const WINDOW_CLEAR = 1 << 0;

// ─── State globals 1:1 décomp ──────────────────────────────────────────────

/** 1:1 décomp `gBattle_BG1_X/Y` + `gBattle_BG2_X/Y`. */
let _gBattle_BG1_X = 0;
let _gBattle_BG1_Y = 0;
let _gBattle_BG2_Y = 0;

function _setBgScroll(bgId: number, x: number, y: number): void {
  if (bgId === 1) { _gBattle_BG1_X = x; _gBattle_BG1_Y = y; }
  if (bgId === 2) { _gBattle_BG2_Y = y; }
  // Dette R3 : wire vers runtime BG scroll registers.
  void x; void y;
}

// ─── Helpers stubs (= dette R3 documentée) ─────────────────────────────────

/** 1:1 décomp `IsMonGettingExpSentOut()` (battle_script_commands.c, helper). */
function IsMonGettingExpSentOut(): boolean {
  // 1:1 décomp : check gBattleStruct->expGetterMonId == active battler.
  // Si le mon qui gain l'XP est celui qui combat → skip banner (déjà visible).
  const expGetterMonId = gBattleStruct.expGetterMonId ?? 0;
  // Dette R3 : full check via gBattlerPartyIndexes.
  return expGetterMonId === 0;  // assume current mon for now
}

/** 1:1 décomp `InitLevelUpBanner()` (battle_script_commands.c:6044+). */
function InitLevelUpBanner(): void {
  // Dette R3 : full BG2 banner setup avec LoadPalette + LoadCompressedSpriteSheet
  // pour le banner pokémon icon + name.
  _setBgScroll(2, 0, 0);
}

/** 1:1 décomp `SlideInLevelUpBanner()`. Returns true si toujours en cours. */
function SlideInLevelUpBanner(): boolean {
  // Dette R3 : banner slide horizontal (= BG2_X scroll).
  // Pour now : completes immediately.
  return false;
}

/** 1:1 décomp `SlideOutLevelUpBanner()`. */
function SlideOutLevelUpBanner(): boolean {
  // Dette R3 : banner slide vers off-screen.
  return false;
}

/** 1:1 décomp `SetBgAttribute(bgId, attribute, value)` (bg.c). */
function _SetBgAttribute(bgId: number, attribute: number, value: number): void {
  // Dette R3 : BG attribute setter (priority / screen size / etc.).
  void bgId; void attribute; void value;
}

/** 1:1 décomp `ShowBg(bgId)`. */
function _ShowBg(_bgId: number): void {
  // Dette R3 : wire vers gba-window-system.ShowBg.
}

/** 1:1 décomp `HandleBattleWindow(xStart, yStart, xEnd, yEnd, flags)`. */
function HandleBattleWindow(_xStart: number, _yStart: number, _xEnd: number, _yEnd: number, _flags: number): void {
  // Dette R3 : full battle window draw/clear (= tilemap manipulation).
}

/** 1:1 décomp `IsDma3ManagerBusyWithBgCopy()`. Returns true si DMA copy en cours. */
function IsDma3ManagerBusyWithBgCopy(): boolean {
  // Dette R3 : DMA queue tracker. Pour now : assume done.
  return false;
}

/** 1:1 décomp `PutWindowTilemap(windowId)`. */
function _PutWindowTilemap(_windowId: number): void {
  // Dette R3 : tilemap write.
}

/** 1:1 décomp `CopyWindowToVram(windowId, mode)`. */
function _CopyWindowToVram(_windowId: number, _mode: number): void {
  // Dette R3 : VRAM copy via DMA.
}

/** 1:1 décomp `ClearWindowTilemap(windowId)`. */
function _ClearWindowTilemap(_windowId: number): void {
  // Dette R3 : window clear.
}

/** 1:1 décomp `PlaySE(songId)`. */
function _PlaySE(_songId: number): void {
  // Dette R3 : sound effect trigger.
}

/** 1:1 décomp `DrawLevelUpWindowPg1` / `DrawLevelUpWindowPg2` (menu_specialized.c).
 *  Draw stats page 1 (HP/Atk/Def) ou 2 (Spe/SpA/SpD) avec before/after delta. */
function DrawLevelUpWindowPg1(_winId: number, _statsBefore: number[], _statsCurr: number[]): void {
  // Dette R3 : full stat display avec colors TEXT_DYNAMIC_COLOR_*.
}

function DrawLevelUpWindowPg2(_winId: number, _statsCurr: number[]): void {
  // Dette R3 : page 2 stats display.
}

/** 1:1 décomp `GetMonLevelUpWindowStats(mon, currStats)`. Fill currStats[6]
 *  depuis mon data (= HP/Atk/Def/Spe/SpA/SpD). */
function GetMonLevelUpWindowStats(_mon: unknown, currStats: number[]): void {
  // Dette R3 : full mon stats read via GetMonData.
  for (let i = 0; i < NUM_STATS; i++) currStats[i] = 0;
}

// ─── DrawLevelUpWindow1 / DrawLevelUpWindow2 (5928-6042) — 1:1 décomp ──────

/** 1:1 décomp `DrawLevelUpWindow1()` (battle_script_commands.c:6028-6034). */
export function DrawLevelUpWindow1(): void {
  const currStats: number[] = new Array(NUM_STATS).fill(0);
  const playerParty = ((globalThis as { gSaveBlock1Ptr?: { playerParty?: unknown[] } }).gSaveBlock1Ptr?.playerParty) ?? [];
  const expGetterMonId = gBattleStruct.expGetterMonId ?? 0;
  GetMonLevelUpWindowStats(playerParty[expGetterMonId], currStats);
  // 1:1 décomp : gBattleResources->beforeLvlUp->stats (= snapshot pre-levelup).
  // Dette R3 : beforeLvlUp tracker.
  const beforeLvlUp: number[] = new Array(NUM_STATS).fill(0);
  DrawLevelUpWindowPg1(B_WIN_LEVEL_UP_BOX, beforeLvlUp, currStats);
}

/** 1:1 décomp `DrawLevelUpWindow2()` (battle_script_commands.c:6036-6042). */
export function DrawLevelUpWindow2(): void {
  const currStats: number[] = new Array(NUM_STATS).fill(0);
  const playerParty = ((globalThis as { gSaveBlock1Ptr?: { playerParty?: unknown[] } }).gSaveBlock1Ptr?.playerParty) ?? [];
  const expGetterMonId = gBattleStruct.expGetterMonId ?? 0;
  GetMonLevelUpWindowStats(playerParty[expGetterMonId], currStats);
  DrawLevelUpWindowPg2(B_WIN_LEVEL_UP_BOX, currStats);
}

// ─── Cmd_drawlvlupbox (5927-6026) — 1:1 strict décomp ──────────────────────

/** 1:1 décomp `Cmd_drawlvlupbox(void)` (battle_script_commands.c:5927-6026).
 *  State machine 0..10 pour afficher la level-up box (= 2 pages stats avec
 *  delta vs before-levelup) + banner slide-in/out. */
export function Cmd_drawlvlupbox(): void {
  const rt = getRuntime();
  const newKeys = (rt?.gMain?.newKeys) ?? 0;

  // 1:1 décomp ll. 5929-5938 : state 0 entry → branch.
  if (gBattleScripting.drawlvlupboxState === 0) {
    if (IsMonGettingExpSentOut()) {
      gBattleScripting.drawlvlupboxState = 3;
    } else {
      gBattleScripting.drawlvlupboxState = 1;
    }
  }

  switch (gBattleScripting.drawlvlupboxState) {
    case 1:
      // 1:1 décomp ll. 5942-5949 : start level up banner.
      _setBgScroll(2, 0, 96);
      _SetBgAttribute(2, 0 /* BG_ATTR_PRIORITY */, 0);
      _ShowBg(2);
      InitLevelUpBanner();
      gBattleScripting.drawlvlupboxState = 2;
      break;
    case 2:
      // 1:1 décomp ll. 5950-5953 : wait slide-in.
      if (!SlideInLevelUpBanner()) {
        gBattleScripting.drawlvlupboxState = 3;
      }
      break;
    case 3:
      // 1:1 décomp ll. 5954-5963 : init level up box.
      _setBgScroll(1, 0, 256);
      _SetBgAttribute(0, 0 /* BG_ATTR_PRIORITY */, 1);
      _SetBgAttribute(1, 0 /* BG_ATTR_PRIORITY */, 0);
      _ShowBg(0);
      _ShowBg(1);
      HandleBattleWindow(18, 7, 29, 19, WINDOW_BG1);
      gBattleScripting.drawlvlupboxState = 4;
      break;
    case 4:
      // 1:1 décomp ll. 5965-5970 : draw page 1.
      DrawLevelUpWindow1();
      _PutWindowTilemap(B_WIN_LEVEL_UP_BOX);
      _CopyWindowToVram(B_WIN_LEVEL_UP_BOX, 3 /* COPYWIN_FULL */);
      gBattleScripting.drawlvlupboxState++;
      break;
    case 5:
    case 7:
      // 1:1 décomp ll. 5972-5979 : wait DMA copy.
      if (!IsDma3ManagerBusyWithBgCopy()) {
        _setBgScroll(1, 0, 0);
        gBattleScripting.drawlvlupboxState++;
      }
      break;
    case 6:
      // 1:1 décomp ll. 5981-5989 : wait input → draw page 2.
      if (newKeys !== 0) {
        _PlaySE(SE_SELECT);
        DrawLevelUpWindow2();
        _CopyWindowToVram(B_WIN_LEVEL_UP_BOX, 1 /* COPYWIN_GFX */);
        gBattleScripting.drawlvlupboxState++;
      }
      break;
    case 8:
      // 1:1 décomp ll. 5991-5998 : wait input → close box.
      if (newKeys !== 0) {
        _PlaySE(SE_SELECT);
        HandleBattleWindow(18, 7, 29, 19, WINDOW_BG1 | WINDOW_CLEAR);
        gBattleScripting.drawlvlupboxState++;
      }
      break;
    case 9:
      // 1:1 décomp ll. 6000-6013 : wait slide-out banner.
      if (!SlideOutLevelUpBanner()) {
        _ClearWindowTilemap(B_WIN_LEVEL_UP_BANNER);
        _CopyWindowToVram(B_WIN_LEVEL_UP_BANNER, 2 /* COPYWIN_MAP */);
        _ClearWindowTilemap(B_WIN_LEVEL_UP_BOX);
        _CopyWindowToVram(B_WIN_LEVEL_UP_BOX, 2 /* COPYWIN_MAP */);
        _SetBgAttribute(2, 0, 2);
        _ShowBg(2);
        gBattleScripting.drawlvlupboxState = 10;
      }
      break;
    case 10:
      // 1:1 décomp ll. 6015-6023 : final BG restore + advance instr.
      if (!IsDma3ManagerBusyWithBgCopy()) {
        _SetBgAttribute(0, 0, 0);
        _SetBgAttribute(1, 0, 1);
        _ShowBg(0);
        _ShowBg(1);
        // Dette R3 : advance gBattlescriptCurrInstr (= caller bytecode interpreter).
      }
      break;
  }
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleLevelupBox = {
  Cmd_drawlvlupbox,
  DrawLevelUpWindow1, DrawLevelUpWindow2,
  IsMonGettingExpSentOut,
};

void LEVEL_UP_BANNER_END;
