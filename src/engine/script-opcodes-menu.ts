/**
 * script-opcodes-menu.ts — opcodes menu UI 1:1 décomp `menu.c` + `script_menu.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` :
 *   `ScrCmd_yesnobox`         (l. 1337-1351) : ScriptMenu_YesNo(left, top).
 *   `ScrCmd_multichoice`      (l. 1353-1369) : ScriptMenu_Multichoice(...).
 *   `ScrCmd_multichoicedefault` (l. 1371-1388) : Multichoice avec defaultChoice.
 *   `ScrCmd_multichoicegrid`  (l. 1401-1418) : Grille NxM (perRow).
 *   `ScrCmd_drawbox`/`erasebox`/`drawboxtext` (l. 1390-1444) : RS-era no-op dans Em.
 *   `ScrCmd_showmonpic`       (l. 1446-1454) : ScriptMenu_ShowPokemonPic(species, x, y).
 *   `ScrCmd_hidemonpic`       (l. 1456-1466) : ScriptMenu_HidePokemonPic.
 *   `ScrCmd_addelevmenuitem`  (l. 2110-2119) : stubbed dans Em.
 *   `ScrCmd_showelevmenu`     (l. 2121-2127) : stubbed dans Em.
 *
 * Le `_spawnYesNoMenu` helper est EXPORTÉ pour que `script-opcodes-message.ts`
 * puisse l'utiliser dans le state machine `msgbox` (= MSGBOX_YESNO).
 */

import { registerOpcode, SetupNativeScript } from './script-runtime';
import { VarGet, gSpecialVar } from './script-vars';
import {
  CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose, GetYesNoWindowId,
  InitMenuInUpperLeftCornerNormal,
} from './gba-menu-system';
import type { WindowTemplate } from './gba-window-system';
import {
  ClearStdWindowAndFrame, RemoveWindow, AddWindow, PutWindowTilemap,
  CopyWindowToVram, DrawStdFrameWithCustomTileAndPalette,
} from './gba-window-system';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import { getMultichoiceList } from './multichoice-data';
import { parseValue } from './script-opcodes-helpers';

// ─── Multichoice menus 1:1 décomp `script_menu.c` ──────────────────────────
// Audit session 126 LOT D2 : avant stubs `VAR_RESULT = 0` → maintenant vraie
// UI window verticale + cursor + A/B input. Data depuis `multichoice-data.ts`
// (= extraite de `src/data/script_menu.h` via `extract-multichoice-lists.mjs`).

let _multichoiceWindowId = -1;

function _spawnMultichoiceMenu(left: number, top: number, items: string[], cursorPos: number): void {
  const count = items.length;
  if (count === 0) return;
  // Estimate width : max len of items * 0.5 tile + 2 tiles margin (= rough).
  // 1:1 décomp utilise `DisplayTextAndGetWidth` + `ConvertPixelWidthToTileWidth`.
  let maxChars = 4;
  for (const t of items) {
    const len = (t ?? '').length;
    if (len > maxChars) maxChars = len;
  }
  const width = Math.max(5, Math.min(28, Math.ceil(maxChars * 0.7) + 2));
  const tmpl: WindowTemplate = {
    bg: 0,
    tilemapLeft: left,
    tilemapTop: top,
    width,
    height: count * 2,
    paletteNum: 15,
    baseBlock: 0x125,
  };
  _multichoiceWindowId = AddWindow(tmpl);
  DrawStdFrameWithCustomTileAndPalette(_multichoiceWindowId, true, 0x214, 14);
  // Print each item sur ligne i (= y = 1 + i * 16).
  for (let i = 0; i < count; i++) {
    AddTextPrinterParameterized3(
      _multichoiceWindowId, 1, 8, 1 + i * 16, [1, 2, 3], 255, items[i] ?? '',
    );
  }
  PutWindowTilemap(_multichoiceWindowId);
  CopyWindowToVram(_multichoiceWindowId, 3 /* COPYWIN_FULL */);
  // 1:1 décomp `InitMenuInUpperLeftCornerNormal(windowId, count, cursorPos)`.
  InitMenuInUpperLeftCornerNormal(_multichoiceWindowId, count, cursorPos);
}

function _cleanupMultichoiceMenu(): void {
  if (_multichoiceWindowId >= 0) {
    ClearStdWindowAndFrame(_multichoiceWindowId, true);
    RemoveWindow(_multichoiceWindowId);
    _multichoiceWindowId = -1;
  }
}

/** 1:1 décomp `ScrCmd_multichoice(left, top, multichoiceId, ignoreBPress)` :
 *    ScriptMenu_Multichoice(...) → spawn menu + waitstate.
 *    User picks → VAR_RESULT = cursor pos (0..N-1) ou MULTI_B_PRESSED (= 0x7F)
 *    si B pressed et !ignoreBPress, ou cursor pos final si ignoreBPress. */
registerOpcode('multichoice', (ctx, args) => {
  const left = parseValue(args[0] ?? '0');
  const top = parseValue(args[1] ?? '0');
  const multichoiceId = VarGet(args[2] ?? '0');  // resolves MULTI_X → number
  const ignoreBPress = parseValue(args[3] ?? '0') !== 0;
  const items = getMultichoiceList(multichoiceId, args[2]);
  if (items.length === 0) {
    console.warn(`[opcode multichoice] no items for id=${args[2]} (${multichoiceId}) — fallback VAR_RESULT=0`);
    gSpecialVar.Result = 0;
    return false;
  }
  _spawnMultichoiceMenu(left, top, items, 0);
  let menuActive = true;
  const tick = (): boolean => {
    if (!menuActive) return true;
    const result = Menu_ProcessInputNoWrapClearOnChoose();
    if (result === -2) return false;  // MENU_NOTHING_CHOSEN
    if (result === -1) {
      // B pressed
      gSpecialVar.Result = ignoreBPress ? items.length - 1 : 0x7F /* MULTI_B_PRESSED */;
    } else {
      gSpecialVar.Result = result;
    }
    _cleanupMultichoiceMenu();
    menuActive = false;
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

/** 1:1 décomp `ScrCmd_multichoicedefault` : multichoice avec cursor à
 *  defaultChoice initial. */
registerOpcode('multichoicedefault', (ctx, args) => {
  const left = parseValue(args[0] ?? '0');
  const top = parseValue(args[1] ?? '0');
  const multichoiceId = VarGet(args[2] ?? '0');
  const defaultChoice = parseValue(args[3] ?? '0');
  const ignoreBPress = parseValue(args[4] ?? '0') !== 0;
  const items = getMultichoiceList(multichoiceId, args[2]);
  if (items.length === 0) {
    console.warn(`[opcode multichoicedefault] no items for id=${args[2]} (${multichoiceId}) — fallback VAR_RESULT=${defaultChoice}`);
    gSpecialVar.Result = defaultChoice;
    return false;
  }
  _spawnMultichoiceMenu(left, top, items, defaultChoice);
  let menuActive = true;
  const tick = (): boolean => {
    if (!menuActive) return true;
    const result = Menu_ProcessInputNoWrapClearOnChoose();
    if (result === -2) return false;
    if (result === -1) {
      gSpecialVar.Result = ignoreBPress ? items.length - 1 : 0x7F;
    } else {
      gSpecialVar.Result = result;
    }
    _cleanupMultichoiceMenu();
    menuActive = false;
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

/** 1:1 décomp `ScrCmd_multichoicegrid` (scrcmd.c:1401) :
 *    ScriptMenu_MultichoiceGrid(left, top, multichoiceId, ignoreBPress, numColumns)
 *  Dette R3 doc : ScriptMenu_MultichoiceGrid (script_menu.c) demande grid layout
 *  N×M rendu (= au lieu de vertical), cascade UI substrate. Non critique démo
 *  (= seulement utilisé Fortree gym puzzle + elevator menus). Notre port fallback
 *  vertical multichoice (= perRow ignoré → 1 colonne au lieu de N). */
registerOpcode('multichoicegrid', (ctx, args) => {
  const left = parseValue(args[0] ?? '0');
  const top = parseValue(args[1] ?? '0');
  const multichoiceId = VarGet(args[2] ?? '0');
  const perRow = parseValue(args[3] ?? '1');
  const ignoreBPress = parseValue(args[4] ?? '0') !== 0;
  void perRow;  // dette R3 doc grid layout (= ignored, fallback vertical)
  const items = getMultichoiceList(multichoiceId, args[2]);
  if (items.length === 0) {
    console.warn(`[opcode multichoicegrid] no items for id=${args[2]} (${multichoiceId}) — fallback VAR_RESULT=0`);
    gSpecialVar.Result = 0;
    return false;
  }
  _spawnMultichoiceMenu(left, top, items, 0);
  let menuActive = true;
  const tick = (): boolean => {
    if (!menuActive) return true;
    const result = Menu_ProcessInputNoWrapClearOnChoose();
    if (result === -2) return false;
    if (result === -1) {
      gSpecialVar.Result = ignoreBPress ? items.length - 1 : 0x7F;
    } else {
      gSpecialVar.Result = result;
    }
    _cleanupMultichoiceMenu();
    menuActive = false;
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

// ─── YesNo ──────────────────────────────────────────────────────────────────

// 1:1 décomp scrcmd.c:1337-1351 ScrCmd_yesnobox(left, top) :
//   ScriptMenu_YesNo(left, top) → returns TRUE → ScriptContext_Stop
//   Wait until Menu_ProcessInputNoWrapClearOnChoose returns choice :
//     0 (OUI) → VAR_RESULT = 1 (= YES enum)
//     1 (NON) / B_PRESSED → VAR_RESULT = 0 (= NO enum)
//
// Window template 1:1 décomp menu.c:98-107 sYesNo_WindowTemplates :
//   { bg: 0, tilemapLeft: ?, tilemapTop: ?, width: 5, height: 4,
//     paletteNum: 15, baseBlock: 0x125 }
export function spawnYesNoMenu(left: number, top: number): void {
  // 1:1 décomp menu.c:1623 CreateYesNoMenu(window, baseTileNum, paletteNum, initialCursorPos).
  // STD_WINDOW_BASE_TILE_NUM=0x214, STD_WINDOW_PALETTE_NUM=14 (= cf. menu.c:25-27).
  const tmpl: WindowTemplate = {
    bg: 0,
    tilemapLeft: left,
    tilemapTop: top,
    width: 5,
    height: 4,
    paletteNum: 15,    // DLG_WINDOW_PALETTE_NUM
    baseBlock: 0x125,
  };
  CreateYesNoMenu(tmpl, 0x214, 14, 0);
}

registerOpcode('yesnobox', (ctx, args) => {
  const left = parseValue(args[0]);
  const top = parseValue(args[1]);
  spawnYesNoMenu(left, top);
  let menuActive = true;
  const tick = (): boolean => {
    if (!menuActive) return true;
    const result = Menu_ProcessInputNoWrapClearOnChoose();
    if (result === -2 /* MENU_NOTHING_CHOSEN */) return false;
    // 1:1 décomp `script_menu.c:Task_HandleYesNoInput` :
    //   case 0 (OUI top) → VAR_RESULT = 1 (= YES enum, event.inc:1932)
    //   case 1 / B_PRESSED → VAR_RESULT = 0 (= NO enum)
    const yesNoResult = result === 0 ? 1 : 0;
    gSpecialVar.Result = yesNoResult;
    // Cleanup yesno window (= 1:1 décomp EraseYesNoWindow déjà fait par
    // Menu_ProcessInputNoWrapClearOnChoose en interne).
    const wid = GetYesNoWindowId();
    if (wid >= 0) {
      ClearStdWindowAndFrame(wid, true);
      RemoveWindow(wid);
    }
    menuActive = false;
    return true;
  };
  SetupNativeScript(ctx, tick);
  return true;
});

// ─── Mon pic (showmonpic/hidemonpic) ────────────────────────────────────────

/** 1:1 décomp `ScrCmd_showmonpic` (scrcmd.c:1446-1454) :
 *    ScriptMenu_ShowPokemonPic(species, x, y).
 *  Affiche un sprite Pokemon front dans une window. 10x usage in Birch lab +
 *  cinematic moments. Notre port : log + skip (= would integrate with
 *  starter-choose-flow style sprite). Dette : porter ScriptMenu_ShowPokemonPic. */
registerOpcode('showmonpic', (_ctx, args) => {
  console.log(`[opcode showmonpic] species=${args[0]} x=${args[1]} y=${args[2]} — dette R3 (cascade ScriptMenu_ShowPokemonPic U-tier sprite mon front)`);
  return false;
});

/** 1:1 décomp `ScrCmd_hidemonpic` (scrcmd.c:1456-1466) :
 *    func = ScriptMenu_HidePokemonPic();  // returns fn ptr
 *    if (func == NULL) return FALSE;
 *    SetupNativeScript(ctx, func); return TRUE.
 *  Notre port : pour l'instant le mon pic est fire-and-forget. Wait 8 frames
 *  (= petit délai pour fade out hypothétique). */
registerOpcode('hidemonpic', (ctx, _args) => {
  let framesWaited = 0;
  const poll = (): boolean => {
    framesWaited++;
    return framesWaited >= 8;
  };
  SetupNativeScript(ctx, poll);
  return true;
});

// ─── Drawbox / erasebox / drawboxtext (RS-era, removed in Emerald — all nop1) ─

registerOpcode('drawbox', (_ctx, _args) => false);
registerOpcode('erasebox', (_ctx, _args) => false);
registerOpcode('drawboxtext', (_ctx, _args) => false);

// ─── Elevator menu (addelevmenuitem / showelevmenu — stubbed in Em) ─────────

registerOpcode('addelevmenuitem', (_ctx, _args) => false);

registerOpcode('showelevmenu', (_ctx, _args) => false);
