/**
 * menu.ts — miroir 1:1 de `decomp/src/menu.c` (2147 l.), porté PAR VAGUES.
 *
 * VAGUE 1 (text-speed / run) : `sTextSpeedFrameDelays` + `GetPlayerTextSpeed` +
 * `GetPlayerTextSpeedDelay` + `RunTextPrintersAndIsPrinter0Active`. Relocalisés
 * depuis `engine/ui/gba-text-system` (où ils étaient temporairement) vers leur
 * FOYER 1:1 décomp. Le HW (RunTextPrinters tick, gSaveBlock2/gTextFlags) reste
 * fourni par engine, importé.
 *
 * Cycle `menu.ts ↔ text.ts` (menu utilise IsTextPrinterActive ; text/RenderText
 * utilise GetPlayerTextSpeed pour le scroll) = 1:1 décomp (text.c appelle
 * GetPlayerTextSpeed de menu.c). Runtime-safe (usages dans des fonctions).
 *
 * RESTE de menu.c (vagues suivantes) : AddTextPrinterParameterized2/3/4 +
 * AddTextPrinterForMessage* (chaîne AddTextPrinter, text.c:271) ; window frames
 * (DrawDialogueFrame/WindowFunc_* — HW tilemap) ; YesNo menus ; Menu_* ; start menu.
 */
import { gSaveBlock2Ptr } from '../engine/save/save-block-state';
import { RunTextPrinters } from '../engine/ui/gba-text-system';
import { gTextFlags, TEXT_COLOR, type TextPrinter } from '../engine/ui/gba-text-printer';
import {
  IsTextPrinterActive, AddTextPrinter, AddTextPrinterParameterized, GetFontAttribute,
  GetMenuCursorDimensionByFont, FONT_NORMAL, TEXT_SKIP_DRAW,
  FONTATTR_LETTER_SPACING, FONTATTR_LINE_SPACING, DeactivateAllTextPrinters,
  FONTATTR_MAX_LETTER_WIDTH, FONTATTR_MAX_LETTER_HEIGHT,
  FONTATTR_COLOR_FOREGROUND, FONTATTR_COLOR_BACKGROUND, FONTATTR_COLOR_SHADOW,
} from './text';
import { gStringVar4 } from './include/string_util';
import {
  CallWindowFunction, FillWindowPixelBuffer, FillWindowPixelRect, PutWindowTilemap, ClearWindowTilemap,
  CopyWindowToVram, FillBgTilemapBufferRect, GetWindowAttribute, WINDOW_PALETTE_NUM,
  AddWindow, RemoveWindow, InitWindows, FreeAllWindowBuffers, ChangeBgX, ChangeBgY,
  COPYWIN_FULL, COPYWIN_GFX, type WindowTemplate,
} from '../engine/ui/gba-window-system';
import { LoadPalette, getAsset, JOY_NEW, JOY_REPEAT, PlaySE } from '../engine/system/decomp-globals';
import { BG_PLTT_ID } from '../engine/system/decomp-runtime';
import { LoadMessageBoxGfx, LoadUserWindowBorderGfx } from './text_window';
import { getString } from '../engine/ui/gba-strings';
import {
  A_BUTTON, B_BUTTON, DPAD_UP, DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT,
} from '../engine/decomp-data/include/gba/io_reg-data';
import { MENU_NOTHING_CHOSEN, MENU_B_PRESSED, MENU_CURSOR_DELTA_NONE } from '../engine/decomp-data/include/menu-data';
import { SE_SELECT } from '../engine/decomp-data/include/constants/songs-data';
import { MENU_L_PRESSED, MENU_R_PRESSED } from '../engine/decomp-data/include/menu_helpers-data';

// 1:1 décomp `include/constants/options.h` (valeurs de optionsTextSpeed).
const OPTIONS_TEXT_SPEED_SLOW = 0;
const OPTIONS_TEXT_SPEED_MID = 1;
const OPTIONS_TEXT_SPEED_FAST = 2;

/** 1:1 décomp `src/menu.c:77 sTextSpeedFrameDelays[]` — frames/char par vitesse
 *  (SLOW=8, MID=4, FAST=1). Indexé par OPTIONS_TEXT_SPEED_*. */
const sTextSpeedFrameDelays: readonly number[] = [
  /* [SLOW] */ 8,
  /* [MID]  */ 4,
  /* [FAST] */ 1,
];

/** 1:1 décomp `src/menu.c:474 GetPlayerTextSpeed(void)` : `forceMidTextSpeed` →
 *  MID, sinon l'option joueur `gSaveBlock2Ptr->optionsTextSpeed`. */
export function GetPlayerTextSpeed(): number {
  if (gTextFlags.forceMidTextSpeed) return OPTIONS_TEXT_SPEED_MID;
  return ((gSaveBlock2Ptr.optionsTextSpeed as number | undefined) ?? OPTIONS_TEXT_SPEED_MID) | 0;
}

/** 1:1 décomp `src/menu.c:481 GetPlayerTextSpeedDelay(void)` : clamp l'option si
 *  > FAST (→ MID), puis `sTextSpeedFrameDelays[GetPlayerTextSpeed()]`. */
export function GetPlayerTextSpeedDelay(): number {
  if (((gSaveBlock2Ptr.optionsTextSpeed as number | undefined) ?? OPTIONS_TEXT_SPEED_MID) > OPTIONS_TEXT_SPEED_FAST)
    gSaveBlock2Ptr.optionsTextSpeed = OPTIONS_TEXT_SPEED_MID;
  const speed = GetPlayerTextSpeed();
  return sTextSpeedFrameDelays[speed] ?? sTextSpeedFrameDelays[OPTIONS_TEXT_SPEED_MID];
}

/** 1:1 décomp `src/menu.c:163 RunTextPrintersAndIsPrinter0Active(void)` :
 *  `RunTextPrinters(); return IsTextPrinterActive(0);`. */
export function RunTextPrintersAndIsPrinter0Active(): boolean {
  RunTextPrinters();
  return IsTextPrinterActive(0);
}

// ─── VAGUE 2 : chaîne AddTextPrinter (menu.c) ────────────────────────────────
// P2/P3/P4 remplissent un `struct TextPrinterTemplate` + appellent `AddTextPrinter`
// (text.c:271, cœur dans le miroir text.ts). ForMessage* = P2 sur window 0 / gStringVar4.

/** 1:1 décomp `src/menu.c:169 AddTextPrinterParameterized2`. */
export function AddTextPrinterParameterized2(
  windowId: number, fontId: number, str: string | Uint8Array, speed: number,
  callback: ((printer: TextPrinter, lastByte: number) => void) | null,
  fgColor: number, bgColor: number, shadowColor: number,
): boolean {
  gTextFlags.useAlternateDownArrow = false;
  return AddTextPrinter(
    { str, windowId, fontId, x: 0, y: 1, letterSpacing: 0, lineSpacing: 0, fgColor, bgColor, shadowColor },
    speed, callback,
  );
}

/** 1:1 décomp `src/menu.c:1917 AddTextPrinterParameterized3` : letterSpacing/lineSpacing
 *  = GetFontAttribute ; `color` = [bg, fg, shadow]. ⚠️ `speed < 0` = option joueur
 *  (extension pour notre field-message-box ; le décomp passe un speed concret). */
export function AddTextPrinterParameterized3(
  windowId: number, fontId: number, left: number, top: number,
  color: readonly number[], speed: number, str: string | Uint8Array,
): boolean {
  return AddTextPrinter(
    {
      str, windowId, fontId, x: left, y: top,
      letterSpacing: GetFontAttribute(fontId, FONTATTR_LETTER_SPACING),
      lineSpacing: GetFontAttribute(fontId, FONTATTR_LINE_SPACING),
      fgColor: color[1] ?? 2, bgColor: color[0] ?? 1, shadowColor: color[2] ?? 3,
    },
    speed < 0 ? GetPlayerTextSpeedDelay() : speed, null,
  );
}

/** 1:1 décomp `src/menu.c:1938 AddTextPrinterParameterized4` : letterSpacing/lineSpacing
 *  EXPLICITES (list_menu.c passe template.lettersSpacing). */
export function AddTextPrinterParameterized4(
  windowId: number, fontId: number, left: number, top: number,
  letterSpacing: number, lineSpacing: number,
  color: readonly number[], speed: number, str: string | Uint8Array,
): boolean {
  return AddTextPrinter(
    {
      str, windowId, fontId, x: left, y: top, letterSpacing, lineSpacing,
      fgColor: color[1] ?? 2, bgColor: color[0] ?? 1, shadowColor: color[2] ?? 3,
    },
    speed < 0 ? GetPlayerTextSpeedDelay() : speed, null,
  );
}

/** 1:1 décomp `src/menu.c:191 AddTextPrinterForMessage` : window 0, gStringVar4,
 *  vitesse = option joueur, couleurs dialogue (DARK_GRAY/WHITE/LIGHT_GRAY). */
export function AddTextPrinterForMessage(allowSkippingDelayWithButtonPress: boolean): void {
  gTextFlags.canABSpeedUpPrint = allowSkippingDelayWithButtonPress;
  AddTextPrinterParameterized2(0, FONT_NORMAL, gStringVar4, GetPlayerTextSpeedDelay(), null,
    TEXT_COLOR.DARK_GRAY, TEXT_COLOR.WHITE, TEXT_COLOR.LIGHT_GRAY);
}

/** 1:1 décomp `src/menu.c:198 AddTextPrinterForMessage_2` (idem, callback NULL). */
export function AddTextPrinterForMessage_2(allowSkippingDelayWithButtonPress: boolean): void {
  gTextFlags.canABSpeedUpPrint = allowSkippingDelayWithButtonPress;
  AddTextPrinterParameterized2(0, FONT_NORMAL, gStringVar4, GetPlayerTextSpeedDelay(), null,
    TEXT_COLOR.DARK_GRAY, TEXT_COLOR.WHITE, TEXT_COLOR.LIGHT_GRAY);
}

/** 1:1 décomp `src/menu.c:204 AddTextPrinterWithCustomSpeedForMessage`. */
export function AddTextPrinterWithCustomSpeedForMessage(allowSkippingDelayWithButtonPress: boolean, speed: number): void {
  gTextFlags.canABSpeedUpPrint = allowSkippingDelayWithButtonPress;
  AddTextPrinterParameterized2(0, FONT_NORMAL, gStringVar4, speed, null,
    TEXT_COLOR.DARK_GRAY, TEXT_COLOR.WHITE, TEXT_COLOR.LIGHT_GRAY);
}

/** Variante per-char (sync Birch sur EXT_CTRL_CODE_PAUSE) — EXTENSION (pas une fn
 *  décomp menu.c distincte) : P2 sur window 0 avec un callback per-char. */
export function AddTextPrinterWithCallbackForMessage(
  allowSkippingDelayWithButtonPress: boolean,
  callback: (printer: TextPrinter, lastByte: number) => void,
): void {
  gTextFlags.canABSpeedUpPrint = allowSkippingDelayWithButtonPress;
  AddTextPrinterParameterized2(0, FONT_NORMAL, gStringVar4, GetPlayerTextSpeedDelay(), callback,
    TEXT_COLOR.DARK_GRAY, TEXT_COLOR.WHITE, TEXT_COLOR.LIGHT_GRAY);
}

// ─── VAGUE 3 : window frames (menu.c:23-455 + 555-782) ───────────────────────
// La famille Draw*Frame/Clear*Frame compose les tiles de bordure d'une fenêtre
// dans le BG tilemap (via CallWindowFunction → WindowFunc_*) + remplit le pixel
// buffer + flush VRAM. Relocalisée depuis engine/ui/gba-window-system (où elle
// vivait temporairement) vers son FOYER 1:1 décomp. Le HW (FillBgTilemapBufferRect,
// FillWindowPixelBuffer, CopyWindowToVram, InitWindows…) reste fourni par engine.
//
// Constantes 1:1 décomp `menu.c:23-27` (#define locaux au fichier). Les bases de
// tuiles (0x200/0x214) = layout VRAM décomp EXACT : le sStandardTextBox window
// (baseBlock 0x194, 27×4=108 tiles) finit pile à 0x200 → la bordure dialog se
// loge juste après, contiguë (cf. field-message-box). 32KB/BG les héberge.

// Exportés (le hub gba-window-system les ré-expose pour field-message-box /
// start-menu / bedroom-pc qui les importaient depuis l'engine).
export const DLG_WINDOW_PALETTE_NUM = 15;
export const DLG_WINDOW_BASE_TILE_NUM = 0x200;
const STD_WINDOW_PALETTE_NUM = 14;
/** 1:1 `PLTT_SIZEOF(n)` (palette.h) = n couleurs × sizeof(u16). */
const STD_WINDOW_PALETTE_SIZE = 10 * 2;
const STD_WINDOW_BASE_TILE_NUM = 0x214;

/** 1:1 `blit.h PIXEL_FILL(n)` = `((n) | ((n) << 4))` (les 2 nibbles d'un byte). */
const PIXEL_FILL = (n: number): number => (n | (n << 4)) & 0xFF;
/** 1:1 `bg.h BG_TILE_V_FLIP(n)` = `((n) | (1 << 11))` (bit vflip de l'entry tilemap). */
const BG_TILE_V_FLIP = (n: number): number => n | (1 << 11);
/** 1:1 `bg.h` — mode "set" (vs ADD/SUB) pour ChangeBgX/ChangeBgY. */
const BG_COORD_SET = 0;
/** 1:1 `window.h WINDOW_NONE`. */
const WINDOW_NONE = 0xFF;
/** 1:1 `window.h DUMMY_WIN_TEMPLATE` (sentinelle bg=0xFF de fin de tableau). */
const DUMMY_WIN_TEMPLATE: WindowTemplate = {
  bg: 0xFF, tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0,
};

// 1:1 décomp `menu.c:66-67` — side-channel statics pour passer tile/palette aux
// WindowFunc_*WithCustomTileAndPalette (signature CallWindowFunction figée à 6 args).
let sTileNum = 0;
let sPaletteNum = 0;
// 1:1 décomp `menu.c:63-64` — IDs de fenêtres OW (posés par InitStandardTextBoxWindows ;
// consommés par le start menu / map-name popup en vagues suivantes).
let sStartMenuWindowId = WINDOW_NONE;
let sMapNamePopupWindowId = WINDOW_NONE;
void sStartMenuWindowId; void sMapNamePopupWindowId; // (lus en V4)

/** 1:1 décomp `menu.c:84 sStandardTextBox_WindowTemplates[]` : le dialog box OW
 *  standard (BG0, (2,15), 27×4, palette 15, baseBlock 0x194) + DUMMY de fin. */
const sStandardTextBox_WindowTemplates: readonly WindowTemplate[] = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 0x194 },
  DUMMY_WIN_TEMPLATE,
];

/** 1:1 décomp `menu.c:98 sYesNo_WindowTemplates` (BG0, (21,9), 5×4, palette 15,
 *  baseBlock 0x125). Consommé par CreateYesNoMenu* (vague 4). */
export const sYesNo_WindowTemplates: WindowTemplate =
  { bg: 0, tilemapLeft: 21, tilemapTop: 9, width: 5, height: 4, paletteNum: 15, baseBlock: 0x125 };
void sYesNo_WindowTemplates;

/** 1:1 décomp `menu.c:75 gStandardMenuPalette[] = INCGFX_U16("graphics/interface/std_menu.pal")`.
 *  Donnée compilée → résolue depuis l'assetCache (mécanisme engine pour les INCGFX).
 *  Préchargée par `preloadStdMenuPalette` (pont asset). */
function gStandardMenuPalette(): Uint16Array {
  return (getAsset('gStandardMenuPalette') as Uint16Array | undefined) ?? new Uint16Array(16);
}

// ─── Init textbox windows (menu.c:143-161) ───────────────────────────────────

/** 1:1 décomp `menu.c:143 InitStandardTextBoxWindows(void)`. */
export function InitStandardTextBoxWindows(): void {
  InitWindows(sStandardTextBox_WindowTemplates);
  sStartMenuWindowId = WINDOW_NONE;
  sMapNamePopupWindowId = WINDOW_NONE;
}

/** 1:1 décomp `menu.c:150 FreeAllOverworldWindowBuffers(void)`. */
export function FreeAllOverworldWindowBuffers(): void {
  FreeAllWindowBuffers();
}

/** 1:1 décomp `menu.c:155 InitTextBoxGfxAndPrinters(void)`. */
export function InitTextBoxGfxAndPrinters(): void {
  ChangeBgX(0, 0, BG_COORD_SET);
  ChangeBgY(0, 0, BG_COORD_SET);
  DeactivateAllTextPrinters();
  LoadMessageBoxAndBorderGfx();
}

/** 1:1 décomp `menu.c:210 LoadMessageBoxAndBorderGfx(void)`. */
export function LoadMessageBoxAndBorderGfx(): void {
  LoadMessageBoxGfx(0, DLG_WINDOW_BASE_TILE_NUM, BG_PLTT_ID(DLG_WINDOW_PALETTE_NUM));
  LoadUserWindowBorderGfx(0, STD_WINDOW_BASE_TILE_NUM, BG_PLTT_ID(STD_WINDOW_PALETTE_NUM));
}

// ─── Draw / Clear frame (menu.c:216-422) ─────────────────────────────────────

/** 1:1 décomp `menu.c:216 DrawDialogueFrame(u8 windowId, bool8 copyToVram)`. */
export function DrawDialogueFrame(windowId: number, copyToVram: boolean): void {
  CallWindowFunction(windowId, WindowFunc_DrawDialogueFrame);
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  PutWindowTilemap(windowId);
  if (copyToVram === true)
    CopyWindowToVram(windowId, COPYWIN_FULL);
}

/** 1:1 décomp `menu.c:225 DrawStdWindowFrame(u8 windowId, bool8 copyToVram)`. */
export function DrawStdWindowFrame(windowId: number, copyToVram: boolean): void {
  CallWindowFunction(windowId, WindowFunc_DrawStandardFrame);
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  PutWindowTilemap(windowId);
  if (copyToVram === true)
    CopyWindowToVram(windowId, COPYWIN_FULL);
}

/** 1:1 décomp `menu.c:234 ClearDialogWindowAndFrame(u8 windowId, bool8 copyToVram)`. */
export function ClearDialogWindowAndFrame(windowId: number, copyToVram: boolean): void {
  CallWindowFunction(windowId, WindowFunc_ClearDialogWindowAndFrame);
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  ClearWindowTilemap(windowId);
  if (copyToVram === true)
    CopyWindowToVram(windowId, COPYWIN_FULL);
}

/** 1:1 décomp `menu.c:243 ClearStdWindowAndFrame(u8 windowId, bool8 copyToVram)`. */
export function ClearStdWindowAndFrame(windowId: number, copyToVram: boolean): void {
  CallWindowFunction(windowId, WindowFunc_ClearStdWindowAndFrame);
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  ClearWindowTilemap(windowId);
  if (copyToVram === true)
    CopyWindowToVram(windowId, COPYWIN_FULL);
}

/** 1:1 décomp `menu.c:252 WindowFunc_DrawStandardFrame` (9 tiles : 4 coins + 4 bords). */
function WindowFunc_DrawStandardFrame(bg: number, tilemapLeft: number, tilemapTop: number, width: number, height: number, _paletteNum: number): void {
  FillBgTilemapBufferRect(bg, STD_WINDOW_BASE_TILE_NUM + 0, tilemapLeft - 1, tilemapTop - 1, 1, 1, STD_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, STD_WINDOW_BASE_TILE_NUM + 1, tilemapLeft, tilemapTop - 1, width, 1, STD_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, STD_WINDOW_BASE_TILE_NUM + 2, tilemapLeft + width, tilemapTop - 1, 1, 1, STD_WINDOW_PALETTE_NUM);
  for (let i = tilemapTop; i < tilemapTop + height; i++) {
    FillBgTilemapBufferRect(bg, STD_WINDOW_BASE_TILE_NUM + 3, tilemapLeft - 1, i, 1, 1, STD_WINDOW_PALETTE_NUM);
    FillBgTilemapBufferRect(bg, STD_WINDOW_BASE_TILE_NUM + 5, tilemapLeft + width, i, 1, 1, STD_WINDOW_PALETTE_NUM);
  }
  FillBgTilemapBufferRect(bg, STD_WINDOW_BASE_TILE_NUM + 6, tilemapLeft - 1, tilemapTop + height, 1, 1, STD_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, STD_WINDOW_BASE_TILE_NUM + 7, tilemapLeft, tilemapTop + height, width, 1, STD_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, STD_WINDOW_BASE_TILE_NUM + 8, tilemapLeft + width, tilemapTop + height, 1, 1, STD_WINDOW_PALETTE_NUM);
}

/** 1:1 décomp `menu.c:319 WindowFunc_DrawDialogueFrame` (bordure dialog, top+bottom v-flippé). */
function WindowFunc_DrawDialogueFrame(bg: number, tilemapLeft: number, tilemapTop: number, width: number, height: number, _paletteNum: number): void {
  FillBgTilemapBufferRect(bg, DLG_WINDOW_BASE_TILE_NUM + 1, tilemapLeft - 2, tilemapTop - 1, 1, 1, DLG_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, DLG_WINDOW_BASE_TILE_NUM + 3, tilemapLeft - 1, tilemapTop - 1, 1, 1, DLG_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, DLG_WINDOW_BASE_TILE_NUM + 4, tilemapLeft, tilemapTop - 1, width - 1, 1, DLG_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, DLG_WINDOW_BASE_TILE_NUM + 5, tilemapLeft + width - 1, tilemapTop - 1, 1, 1, DLG_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, DLG_WINDOW_BASE_TILE_NUM + 6, tilemapLeft + width, tilemapTop - 1, 1, 1, DLG_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, DLG_WINDOW_BASE_TILE_NUM + 7, tilemapLeft - 2, tilemapTop, 1, 5, DLG_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, DLG_WINDOW_BASE_TILE_NUM + 9, tilemapLeft - 1, tilemapTop, width + 1, 5, DLG_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, DLG_WINDOW_BASE_TILE_NUM + 10, tilemapLeft + width, tilemapTop, 1, 5, DLG_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, BG_TILE_V_FLIP(DLG_WINDOW_BASE_TILE_NUM + 1), tilemapLeft - 2, tilemapTop + height, 1, 1, DLG_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, BG_TILE_V_FLIP(DLG_WINDOW_BASE_TILE_NUM + 3), tilemapLeft - 1, tilemapTop + height, 1, 1, DLG_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, BG_TILE_V_FLIP(DLG_WINDOW_BASE_TILE_NUM + 4), tilemapLeft, tilemapTop + height, width - 1, 1, DLG_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, BG_TILE_V_FLIP(DLG_WINDOW_BASE_TILE_NUM + 5), tilemapLeft + width - 1, tilemapTop + height, 1, 1, DLG_WINDOW_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, BG_TILE_V_FLIP(DLG_WINDOW_BASE_TILE_NUM + 6), tilemapLeft + width, tilemapTop + height, 1, 1, DLG_WINDOW_PALETTE_NUM);
}

/** 1:1 décomp `menu.c:414 WindowFunc_ClearStdWindowAndFrame`. */
function WindowFunc_ClearStdWindowAndFrame(bg: number, tilemapLeft: number, tilemapTop: number, width: number, height: number, _paletteNum: number): void {
  FillBgTilemapBufferRect(bg, 0, tilemapLeft - 1, tilemapTop - 1, width + 2, height + 2, STD_WINDOW_PALETTE_NUM);
}

/** 1:1 décomp `menu.c:419 WindowFunc_ClearDialogWindowAndFrame`. */
function WindowFunc_ClearDialogWindowAndFrame(bg: number, tilemapLeft: number, tilemapTop: number, width: number, height: number, _paletteNum: number): void {
  FillBgTilemapBufferRect(bg, 0, tilemapLeft - 3, tilemapTop - 1, width + 6, height + 2, STD_WINDOW_PALETTE_NUM);
}

// ─── Custom tile/palette variants (menu.c:424-432, 555-782) ──────────────────

/** 1:1 décomp `menu.c:424 SetStandardWindowBorderStyle(u8 windowId, bool8 copyToVram)`. */
export function SetStandardWindowBorderStyle(windowId: number, copyToVram: boolean): void {
  DrawStdFrameWithCustomTileAndPalette(windowId, copyToVram, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM);
}

/** 1:1 décomp `menu.c:429 LoadMessageBoxAndFrameGfx(u8 windowId, bool8 copyToVram)`. */
export function LoadMessageBoxAndFrameGfx(windowId: number, copyToVram: boolean): void {
  LoadMessageBoxGfx(windowId, DLG_WINDOW_BASE_TILE_NUM, BG_PLTT_ID(DLG_WINDOW_PALETTE_NUM));
  DrawDialogFrameWithCustomTileAndPalette(windowId, copyToVram, DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM);
}

/** 1:1 décomp `menu.c:555 DrawDialogFrameWithCustomTileAndPalette`. */
export function DrawDialogFrameWithCustomTileAndPalette(windowId: number, copyToVram: boolean, tileNum: number, paletteNum: number): void {
  sTileNum = tileNum;
  sPaletteNum = paletteNum;
  CallWindowFunction(windowId, WindowFunc_DrawDialogFrameWithCustomTileAndPalette);
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  PutWindowTilemap(windowId);
  if (copyToVram === true)
    CopyWindowToVram(windowId, COPYWIN_FULL);
}

/** 1:1 décomp `menu.c:566 DrawDialogFrameWithCustomTile` (UNUSED). */
function DrawDialogFrameWithCustomTile(windowId: number, copyToVram: boolean, tileNum: number): void {
  sTileNum = tileNum;
  sPaletteNum = GetWindowAttribute(windowId, WINDOW_PALETTE_NUM);
  CallWindowFunction(windowId, WindowFunc_DrawDialogFrameWithCustomTileAndPalette);
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  PutWindowTilemap(windowId);
  if (copyToVram === true)
    CopyWindowToVram(windowId, COPYWIN_FULL);
}
void DrawDialogFrameWithCustomTile;

/** 1:1 décomp `menu.c:577 WindowFunc_DrawDialogFrameWithCustomTileAndPalette`. */
function WindowFunc_DrawDialogFrameWithCustomTileAndPalette(bg: number, tilemapLeft: number, tilemapTop: number, width: number, height: number, _paletteNum: number): void {
  FillBgTilemapBufferRect(bg, sTileNum + 1, tilemapLeft - 2, tilemapTop - 1, 1, 1, sPaletteNum);
  FillBgTilemapBufferRect(bg, sTileNum + 3, tilemapLeft - 1, tilemapTop - 1, 1, 1, sPaletteNum);
  FillBgTilemapBufferRect(bg, sTileNum + 4, tilemapLeft, tilemapTop - 1, width - 1, 1, sPaletteNum);
  FillBgTilemapBufferRect(bg, sTileNum + 5, tilemapLeft + width - 1, tilemapTop - 1, 1, 1, sPaletteNum);
  FillBgTilemapBufferRect(bg, sTileNum + 6, tilemapLeft + width, tilemapTop - 1, 1, 1, sPaletteNum);
  FillBgTilemapBufferRect(bg, sTileNum + 7, tilemapLeft - 2, tilemapTop, 1, 5, sPaletteNum);
  FillBgTilemapBufferRect(bg, sTileNum + 9, tilemapLeft - 1, tilemapTop, width + 1, 5, sPaletteNum);
  FillBgTilemapBufferRect(bg, sTileNum + 10, tilemapLeft + width, tilemapTop, 1, 5, sPaletteNum);
  FillBgTilemapBufferRect(bg, BG_TILE_V_FLIP(sTileNum + 1), tilemapLeft - 2, tilemapTop + height, 1, 1, sPaletteNum);
  FillBgTilemapBufferRect(bg, BG_TILE_V_FLIP(sTileNum + 3), tilemapLeft - 1, tilemapTop + height, 1, 1, sPaletteNum);
  FillBgTilemapBufferRect(bg, BG_TILE_V_FLIP(sTileNum + 4), tilemapLeft, tilemapTop + height, width - 1, 1, sPaletteNum);
  FillBgTilemapBufferRect(bg, BG_TILE_V_FLIP(sTileNum + 5), tilemapLeft + width - 1, tilemapTop + height, 1, 1, sPaletteNum);
  FillBgTilemapBufferRect(bg, BG_TILE_V_FLIP(sTileNum + 6), tilemapLeft + width, tilemapTop + height, 1, 1, sPaletteNum);
}

/** 1:1 décomp `menu.c:672 ClearDialogWindowAndFrameToTransparent`. */
export function ClearDialogWindowAndFrameToTransparent(windowId: number, copyToVram: boolean): void {
  CallWindowFunction(windowId, WindowFunc_ClearDialogWindowAndFrameNullPalette);
  FillWindowPixelBuffer(windowId, PIXEL_FILL(0));
  ClearWindowTilemap(windowId);
  if (copyToVram === true)
    CopyWindowToVram(windowId, COPYWIN_FULL);
}

/** 1:1 décomp `menu.c:682 WindowFunc_ClearDialogWindowAndFrameNullPalette` (palette 0). */
function WindowFunc_ClearDialogWindowAndFrameNullPalette(bg: number, tilemapLeft: number, tilemapTop: number, width: number, height: number, _paletteNum: number): void {
  FillBgTilemapBufferRect(bg, 0, tilemapLeft - 3, tilemapTop - 1, width + 6, height + 2, 0);
}

/** 1:1 décomp `menu.c:687 DrawStdFrameWithCustomTileAndPalette`. */
export function DrawStdFrameWithCustomTileAndPalette(windowId: number, copyToVram: boolean, baseTileNum: number, paletteNum: number): void {
  sTileNum = baseTileNum;
  sPaletteNum = paletteNum;
  CallWindowFunction(windowId, WindowFunc_DrawStdFrameWithCustomTileAndPalette);
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  PutWindowTilemap(windowId);
  if (copyToVram === true)
    CopyWindowToVram(windowId, COPYWIN_FULL);
}

/** 1:1 décomp `menu.c:699 DrawStdFrameWithCustomTile` (UNUSED). */
function DrawStdFrameWithCustomTile(windowId: number, copyToVram: boolean, baseTileNum: number): void {
  sTileNum = baseTileNum;
  sPaletteNum = GetWindowAttribute(windowId, WINDOW_PALETTE_NUM);
  CallWindowFunction(windowId, WindowFunc_DrawStdFrameWithCustomTileAndPalette);
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  PutWindowTilemap(windowId);
  if (copyToVram === true)
    CopyWindowToVram(windowId, COPYWIN_FULL);
}
void DrawStdFrameWithCustomTile;

/** 1:1 décomp `menu.c:710 WindowFunc_DrawStdFrameWithCustomTileAndPalette`. */
function WindowFunc_DrawStdFrameWithCustomTileAndPalette(bg: number, tilemapLeft: number, tilemapTop: number, width: number, height: number, _paletteNum: number): void {
  FillBgTilemapBufferRect(bg, sTileNum + 0, tilemapLeft - 1, tilemapTop - 1, 1, 1, sPaletteNum);
  FillBgTilemapBufferRect(bg, sTileNum + 1, tilemapLeft, tilemapTop - 1, width, 1, sPaletteNum);
  FillBgTilemapBufferRect(bg, sTileNum + 2, tilemapLeft + width, tilemapTop - 1, 1, 1, sPaletteNum);
  FillBgTilemapBufferRect(bg, sTileNum + 3, tilemapLeft - 1, tilemapTop, 1, height, sPaletteNum);
  FillBgTilemapBufferRect(bg, sTileNum + 5, tilemapLeft + width, tilemapTop, 1, height, sPaletteNum);
  FillBgTilemapBufferRect(bg, sTileNum + 6, tilemapLeft - 1, tilemapTop + height, 1, 1, sPaletteNum);
  FillBgTilemapBufferRect(bg, sTileNum + 7, tilemapLeft, tilemapTop + height, width, 1, sPaletteNum);
  FillBgTilemapBufferRect(bg, sTileNum + 8, tilemapLeft + width, tilemapTop + height, 1, 1, sPaletteNum);
}

/** 1:1 décomp `menu.c:770 ClearStdWindowAndFrameToTransparent`. */
export function ClearStdWindowAndFrameToTransparent(windowId: number, copyToVram: boolean): void {
  CallWindowFunction(windowId, WindowFunc_ClearStdWindowAndFrameToTransparent);
  FillWindowPixelBuffer(windowId, PIXEL_FILL(0));
  ClearWindowTilemap(windowId);
  if (copyToVram === true)
    CopyWindowToVram(windowId, COPYWIN_FULL);
}

/** 1:1 décomp `menu.c:779 WindowFunc_ClearStdWindowAndFrameToTransparent` (palette 0). */
function WindowFunc_ClearStdWindowAndFrameToTransparent(bg: number, tilemapLeft: number, tilemapTop: number, width: number, height: number, _paletteNum: number): void {
  FillBgTilemapBufferRect(bg, 0, tilemapLeft - 1, tilemapTop - 1, width + 2, height + 2, 0);
}

// ─── Palette std menu (menu.c:435-455) ───────────────────────────────────────

/** 1:1 décomp `menu.c:435 Menu_LoadStdPal(void)`. */
export function Menu_LoadStdPal(): void {
  LoadPalette('gStandardMenuPalette', BG_PLTT_ID(STD_WINDOW_PALETTE_NUM), STD_WINDOW_PALETTE_SIZE);
}

/** 1:1 décomp `menu.c:440 Menu_LoadStdPalAt(u16 offset)`. */
export function Menu_LoadStdPalAt(offset: number): void {
  LoadPalette('gStandardMenuPalette', offset, STD_WINDOW_PALETTE_SIZE);
}

/** 1:1 décomp `menu.c:445 Menu_GetStdPal(void)` (UNUSED). */
function Menu_GetStdPal(): Uint16Array {
  return gStandardMenuPalette();
}
void Menu_GetStdPal;

/** 1:1 décomp `menu.c:450 Menu_GetStdPalColor(u8 colorNum)` (UNUSED). */
function Menu_GetStdPalColor(colorNum: number): number {
  if (colorNum > 15) colorNum = 0;
  return gStandardMenuPalette()[colorNum] ?? 0;
}
void Menu_GetStdPalColor;

// ─── Pont asset (hors décomp) ────────────────────────────────────────────────

/** Pré-charge `graphics/interface/std_menu.pal` dans l'assetCache sous le symbole
 *  `gStandardMenuPalette` (résolu par Menu_LoadStdPal* via LoadPalette). À appeler
 *  au boot OW. Idempotent. */
export async function preloadStdMenuPalette(): Promise<void> {
  if (getAsset('gStandardMenuPalette')) return;
  const { loadGbaPal } = await import('../../harness/gba/png-loader');
  const { assetCache } = await import('../engine/system/decomp-globals');
  try {
    const pal = await loadGbaPal('/decomp/em/interface/std_menu.pal');
    assetCache.set('gStandardMenuPalette', pal);
  } catch (e) {
    console.warn('[menu] std_menu.pal load failed:', e);
  }
}

// ─── VAGUE 4 : système Menu générique (curseur) + YesNo (menu.c) ─────────────
// `sMenu` (struct Menu, menu.c:36) + InitMenu*/Menu_MoveCursor*/Menu_ProcessInput*
// + le menu OUI/NON. Relocalisé depuis `gba-window-system`/`gba-menu-system`
// (version simplifiée `menuCursorPos`/`menuNumItems`) vers le foyer 1:1 décomp,
// REMONTÉ au vrai `sMenu` (min/maxCursorPos, wrap-around, APressMuted). HW (input
// `JOY_NEW`/`JOY_REPEAT`, FillWindowPixelRect, AddTextPrinter) fourni par engine.

/** 1:1 `bg.h DPAD_ANY` = somme des 4 directions. */
const DPAD_ANY = DPAD_UP | DPAD_DOWN | DPAD_LEFT | DPAD_RIGHT;

/** 1:1 décomp `menu.c:945 gText_SelectorArrow3 = _("▶")` — glyphe curseur. */
const gText_SelectorArrow3 = '▶';

/** 1:1 décomp `struct Menu` (menu.c:36) — état du menu courant (singleton `sMenu`). */
interface Menu {
  left: number;
  top: number;
  cursorPos: number;
  minCursorPos: number;
  maxCursorPos: number;
  windowId: number;
  fontId: number;
  optionWidth: number;
  optionHeight: number;
  columns: number;
  rows: number;
  APressMuted: boolean;
}

/** 1:1 décomp `static EWRAM_DATA struct Menu sMenu = {0}` (menu.c:65). */
const sMenu: Menu = {
  left: 0, top: 0, cursorPos: 0, minCursorPos: 0, maxCursorPos: 0,
  windowId: 0, fontId: 0, optionWidth: 0, optionHeight: 0, columns: 0, rows: 0, APressMuted: false,
};

// ─── Curseur + Init (menu.c:902-978, 1557-1584) ──────────────────────────────

/** 1:1 décomp `menu.c:902 InitMenu` (static). */
function InitMenu(windowId: number, fontId: number, left: number, top: number, cursorHeight: number, numChoices: number, initialCursorPos: number, muteAPress: boolean): number {
  sMenu.left = left;
  sMenu.top = top;
  sMenu.minCursorPos = 0;
  sMenu.maxCursorPos = numChoices - 1;
  sMenu.windowId = windowId;
  sMenu.fontId = fontId;
  sMenu.optionHeight = cursorHeight;
  sMenu.APressMuted = muteAPress;

  const pos = initialCursorPos;
  if (pos < 0 || pos > sMenu.maxCursorPos)
    sMenu.cursorPos = 0;
  else
    sMenu.cursorPos = pos;

  Menu_MoveCursor(0);
  return sMenu.cursorPos;
}

/** 1:1 décomp `menu.c:927 InitMenuNormal`. */
export function InitMenuNormal(windowId: number, fontId: number, left: number, top: number, cursorHeight: number, numChoices: number, initialCursorPos: number): number {
  return InitMenu(windowId, fontId, left, top, cursorHeight, numChoices, initialCursorPos, false);
}

/** 1:1 décomp `menu.c:938 RedrawMenuCursor` : efface l'ancien curseur (FillWindowPixelRect
 *  PIXEL_FILL(1)) + redessine `gText_SelectorArrow3` à la nouvelle position. */
export function RedrawMenuCursor(oldPos: number, newPos: number): void {
  const width = GetMenuCursorDimensionByFont(sMenu.fontId, 0);
  const height = GetMenuCursorDimensionByFont(sMenu.fontId, 1);
  FillWindowPixelRect(sMenu.windowId, PIXEL_FILL(1), sMenu.left, sMenu.optionHeight * oldPos + sMenu.top, width, height);
  AddTextPrinterParameterized(sMenu.windowId, sMenu.fontId, gText_SelectorArrow3, sMenu.left, sMenu.optionHeight * newPos + sMenu.top, 0, null);
}

/** 1:1 décomp `menu.c:948 Menu_MoveCursor` (wrap-around). */
export function Menu_MoveCursor(cursorDelta: number): number {
  const oldPos = sMenu.cursorPos;
  const newPos = sMenu.cursorPos + cursorDelta;
  if (newPos < sMenu.minCursorPos)
    sMenu.cursorPos = sMenu.maxCursorPos;
  else if (newPos > sMenu.maxCursorPos)
    sMenu.cursorPos = sMenu.minCursorPos;
  else
    sMenu.cursorPos += cursorDelta;
  RedrawMenuCursor(oldPos, sMenu.cursorPos);
  return sMenu.cursorPos;
}

/** 1:1 décomp `menu.c:964 Menu_MoveCursorNoWrapAround` (clamp). */
export function Menu_MoveCursorNoWrapAround(cursorDelta: number): number {
  const oldPos = sMenu.cursorPos;
  const newPos = sMenu.cursorPos + cursorDelta;
  if (newPos < sMenu.minCursorPos)
    sMenu.cursorPos = sMenu.minCursorPos;
  else if (newPos > sMenu.maxCursorPos)
    sMenu.cursorPos = sMenu.maxCursorPos;
  else
    sMenu.cursorPos += cursorDelta;
  RedrawMenuCursor(oldPos, sMenu.cursorPos);
  return sMenu.cursorPos;
}

/** 1:1 décomp `menu.c:980 Menu_GetCursorPos`. */
export function Menu_GetCursorPos(): number {
  return sMenu.cursorPos;
}

/** 1:1 décomp `menu.c:985 Menu_ProcessInput` (wrap-around, JOY_NEW). */
export function Menu_ProcessInput(): number {
  if (JOY_NEW(A_BUTTON)) {
    if (!sMenu.APressMuted) PlaySE(SE_SELECT);
    return sMenu.cursorPos;
  } else if (JOY_NEW(B_BUTTON)) {
    return MENU_B_PRESSED;
  } else if (JOY_NEW(DPAD_UP)) {
    PlaySE(SE_SELECT);
    Menu_MoveCursor(-1);
    return MENU_NOTHING_CHOSEN;
  } else if (JOY_NEW(DPAD_DOWN)) {
    PlaySE(SE_SELECT);
    Menu_MoveCursor(1);
    return MENU_NOTHING_CHOSEN;
  }
  return MENU_NOTHING_CHOSEN;
}

/** 1:1 décomp `menu.c:1013 Menu_ProcessInputNoWrap` (clamp, son seulement si bouge). */
export function Menu_ProcessInputNoWrap(): number {
  const oldPos = sMenu.cursorPos;
  if (JOY_NEW(A_BUTTON)) {
    if (!sMenu.APressMuted) PlaySE(SE_SELECT);
    return sMenu.cursorPos;
  } else if (JOY_NEW(B_BUTTON)) {
    return MENU_B_PRESSED;
  } else if (JOY_NEW(DPAD_UP)) {
    if (oldPos !== Menu_MoveCursorNoWrapAround(-1)) PlaySE(SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  } else if (JOY_NEW(DPAD_DOWN)) {
    if (oldPos !== Menu_MoveCursorNoWrapAround(1)) PlaySE(SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  return MENU_NOTHING_CHOSEN;
}

/** 1:1 décomp `menu.c:1043 ProcessMenuInput_other` (wrap, JOY_REPEAT). */
export function ProcessMenuInput_other(): number {
  if (JOY_NEW(A_BUTTON)) {
    if (!sMenu.APressMuted) PlaySE(SE_SELECT);
    return sMenu.cursorPos;
  } else if (JOY_NEW(B_BUTTON)) {
    return MENU_B_PRESSED;
  } else if (JOY_REPEAT(DPAD_ANY) === DPAD_UP) {
    PlaySE(SE_SELECT);
    Menu_MoveCursor(-1);
    return MENU_NOTHING_CHOSEN;
  } else if (JOY_REPEAT(DPAD_ANY) === DPAD_DOWN) {
    PlaySE(SE_SELECT);
    Menu_MoveCursor(1);
    return MENU_NOTHING_CHOSEN;
  }
  return MENU_NOTHING_CHOSEN;
}

/** 1:1 décomp `menu.c:1071 Menu_ProcessInputNoWrapAround_other` (clamp, JOY_REPEAT). */
export function Menu_ProcessInputNoWrapAround_other(): number {
  const oldPos = sMenu.cursorPos;
  if (JOY_NEW(A_BUTTON)) {
    if (!sMenu.APressMuted) PlaySE(SE_SELECT);
    return sMenu.cursorPos;
  } else if (JOY_NEW(B_BUTTON)) {
    return MENU_B_PRESSED;
  } else if (JOY_REPEAT(DPAD_ANY) === DPAD_UP) {
    if (oldPos !== Menu_MoveCursorNoWrapAround(-1)) PlaySE(SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  } else if (JOY_REPEAT(DPAD_ANY) === DPAD_DOWN) {
    if (oldPos !== Menu_MoveCursorNoWrapAround(1)) PlaySE(SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  return MENU_NOTHING_CHOSEN;
}

/** 1:1 décomp `menu.c:1557 InitMenuInUpperLeftCorner`. */
export function InitMenuInUpperLeftCorner(windowId: number, itemCount: number, initialCursorPos: number, APressMuted: boolean): number {
  sMenu.left = 0;
  sMenu.top = 1;
  sMenu.minCursorPos = 0;
  sMenu.maxCursorPos = itemCount - 1;
  sMenu.windowId = windowId;
  sMenu.fontId = FONT_NORMAL;
  sMenu.optionHeight = 16;
  sMenu.APressMuted = APressMuted;

  const pos = initialCursorPos;
  if (pos < 0 || pos > sMenu.maxCursorPos)
    sMenu.cursorPos = 0;
  else
    sMenu.cursorPos = pos;

  return Menu_MoveCursor(0);
}

/** 1:1 décomp `menu.c:1581 InitMenuInUpperLeftCornerNormal`. */
export function InitMenuInUpperLeftCornerNormal(windowId: number, itemCount: number, initialCursorPos: number): number {
  return InitMenuInUpperLeftCorner(windowId, itemCount, initialCursorPos, false);
}

// ─── Menu OUI/NON (menu.c:464-471, 1179-1223, 1623-1646) ─────────────────────

// ⚠️ Glue ENGINE transitoire : le décomp init `static u8 sYesNoWindowId = 0`
// (menu.c:68) et gate la création du menu via les ÉTATS DE TASK de start_menu.c.
// Notre `start-menu.ts` (PAS encore mirroré) gate sur `GetYesNoWindowId() < 0`
// (start-menu.ts:856/901) → on conserve le SENTINEL engine `-1` (= "aucune
// fenêtre") en init + reset dans EraseYesNoWindow, jusqu'à ce que start_menu.c
// soit porté 1:1 (les window IDs engine sont monotones ≥ 0, donc -1 = libre).
let sYesNoWindowId = -1;

/** 1:1 décomp `menu.c:1623 CreateYesNoMenu(window, baseTileNum, paletteNum, initialCursorPos)`. */
export function CreateYesNoMenu(window: WindowTemplate, baseTileNum: number, paletteNum: number, initialCursorPos: number): void {
  sYesNoWindowId = AddWindow(window);
  DrawStdFrameWithCustomTileAndPalette(sYesNoWindowId, true, baseTileNum, paletteNum);

  AddTextPrinter(
    {
      str: getString('gText_YesNo'), windowId: sYesNoWindowId, fontId: FONT_NORMAL,
      x: 8, y: 1, letterSpacing: 0, lineSpacing: 0,
      fgColor: GetFontAttribute(FONT_NORMAL, FONTATTR_COLOR_FOREGROUND),
      bgColor: GetFontAttribute(FONT_NORMAL, FONTATTR_COLOR_BACKGROUND),
      shadowColor: GetFontAttribute(FONT_NORMAL, FONTATTR_COLOR_SHADOW),
    },
    TEXT_SKIP_DRAW, null,
  );
  InitMenuInUpperLeftCornerNormal(sYesNoWindowId, 2, initialCursorPos);
}

/** 1:1 décomp `menu.c:1180 CreateYesNoMenuAtPos` (static — position paramétrée). */
function CreateYesNoMenuAtPos(window: WindowTemplate, fontId: number, left: number, top: number, baseTileNum: number, paletteNum: number, initialCursorPos: number): void {
  sYesNoWindowId = AddWindow(window);
  DrawStdFrameWithCustomTileAndPalette(sYesNoWindowId, true, baseTileNum, paletteNum);

  AddTextPrinter(
    {
      str: getString('gText_YesNo'), windowId: sYesNoWindowId, fontId,
      x: GetFontAttribute(fontId, FONTATTR_MAX_LETTER_WIDTH) + left, y: top,
      letterSpacing: GetFontAttribute(fontId, FONTATTR_LETTER_SPACING),
      lineSpacing: GetFontAttribute(fontId, FONTATTR_LINE_SPACING),
      fgColor: GetFontAttribute(fontId, FONTATTR_COLOR_FOREGROUND),
      bgColor: GetFontAttribute(fontId, FONTATTR_COLOR_BACKGROUND),
      shadowColor: GetFontAttribute(fontId, FONTATTR_COLOR_SHADOW),
    },
    TEXT_SKIP_DRAW, null,
  );
  InitMenuNormal(sYesNoWindowId, fontId, left, top, GetFontAttribute(fontId, FONTATTR_MAX_LETTER_HEIGHT), 2, initialCursorPos);
}

/** 1:1 décomp `menu.c:1206 CreateYesNoMenuInTopLeft` (UNUSED). */
function CreateYesNoMenuInTopLeft(window: WindowTemplate, fontId: number, baseTileNum: number, paletteNum: number): void {
  CreateYesNoMenuAtPos(window, fontId, 0, 1, baseTileNum, paletteNum, 0);
}
void CreateYesNoMenuInTopLeft;

/** 1:1 décomp `menu.c:464 DisplayYesNoMenuDefaultYes`. */
export function DisplayYesNoMenuDefaultYes(): void {
  CreateYesNoMenu(sYesNo_WindowTemplates, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM, 0);
}

/** 1:1 décomp `menu.c:469 DisplayYesNoMenuWithDefault`. */
export function DisplayYesNoMenuWithDefault(initialCursorPos: number): void {
  CreateYesNoMenu(sYesNo_WindowTemplates, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM, initialCursorPos);
}

/** 1:1 décomp `menu.c:1211 Menu_ProcessInputNoWrapClearOnChoose` : sélection + Erase. */
export function Menu_ProcessInputNoWrapClearOnChoose(): number {
  const result = Menu_ProcessInputNoWrap();
  if (result !== MENU_NOTHING_CHOSEN)
    EraseYesNoWindow();
  return result;
}

/** 1:1 décomp `menu.c:1219 EraseYesNoWindow` (2 lignes). Le `sYesNoWindowId = -1`
 *  final = glue ENGINE (cf. sYesNoWindowId) : ré-arme le sentinel pour que le
 *  start-menu non-porté puisse re-créer le YesNo au save suivant. À retirer
 *  quand start_menu.c sera mirroré (gating par task-state, pas par `< 0`). */
export function EraseYesNoWindow(): void {
  ClearStdWindowAndFrameToTransparent(sYesNoWindowId, true);
  RemoveWindow(sYesNoWindowId);
  sYesNoWindowId = -1;
}

/** Helper (hors décomp, conservé pour les appelants engine) : ID du window OUI/NON. */
export function GetYesNoWindowId(): number {
  return sYesNoWindowId;
}

// ─── VAGUE 4-bis : MenuAction printers + grid cursor (menu.c) ────────────────
// Primitives génériques pour dessiner des listes/grilles d'actions de menu +
// naviguer une grille. ADDITIF (aucun équivalent engine). HW = AddTextPrinter*
// / FillWindowPixelRect / CopyWindowToVram engine. Consommés par start_menu.c /
// option_menu.c / autres au fur et à mesure de leurs ports.

/** 1:1 décomp `struct MenuAction` (menu.h) : `{ const u8 *text; union {…} func; }`.
 *  Les printers n'utilisent QUE `.text` ; `func` (dispatch) typé souplement. */
export interface MenuAction {
  text: string | Uint8Array;
  func?: unknown;
}

/** 1:1 décomp `menu.c:1101 PrintMenuActionTextsAtPos`. */
export function PrintMenuActionTextsAtPos(windowId: number, fontId: number, left: number, top: number, lineHeight: number, itemCount: number, menuActions: readonly MenuAction[]): void {
  for (let i = 0; i < itemCount; i++)
    AddTextPrinterParameterized(windowId, fontId, menuActions[i].text, left, (lineHeight * i) + top, TEXT_SKIP_DRAW, null);
  CopyWindowToVram(windowId, COPYWIN_GFX);
}

/** 1:1 décomp `menu.c:1122 PrintMenuActionTexts` (par `actionIds` + letterSpacing). */
export function PrintMenuActionTexts(windowId: number, fontId: number, left: number, top: number, letterSpacing: number, lineHeight: number, itemCount: number, menuActions: readonly MenuAction[], actionIds: readonly number[]): void {
  for (let i = 0; i < itemCount; i++) {
    AddTextPrinter(
      {
        str: menuActions[actionIds[i]].text, windowId, fontId, x: left, y: (lineHeight * i) + top,
        letterSpacing, lineSpacing: GetFontAttribute(fontId, FONTATTR_LINE_SPACING),
        fgColor: GetFontAttribute(fontId, FONTATTR_COLOR_FOREGROUND),
        bgColor: GetFontAttribute(fontId, FONTATTR_COLOR_BACKGROUND),
        shadowColor: GetFontAttribute(fontId, FONTATTR_COLOR_SHADOW),
      },
      TEXT_SKIP_DRAW, null,
    );
  }
  CopyWindowToVram(windowId, COPYWIN_GFX);
}

/** 1:1 décomp `menu.c:1586 PrintMenuTable`. */
export function PrintMenuTable(windowId: number, itemCount: number, menuActions: readonly MenuAction[]): void {
  for (let i = 0; i < itemCount; i++)
    AddTextPrinterParameterized(windowId, 1, menuActions[i].text, 8, (i * 16) + 1, TEXT_SKIP_DRAW, null);
  CopyWindowToVram(windowId, COPYWIN_GFX);
}

/** 1:1 décomp `menu.c:1596 PrintMenuActionTextsInUpperLeftCorner` (par `actionIds`). */
export function PrintMenuActionTextsInUpperLeftCorner(windowId: number, itemCount: number, menuActions: readonly MenuAction[], actionIds: readonly number[]): void {
  for (let i = 0; i < itemCount; i++) {
    AddTextPrinter(
      {
        str: menuActions[actionIds[i]].text, windowId, fontId: FONT_NORMAL, x: 8, y: (i * 16) + 1,
        letterSpacing: 0, lineSpacing: 0,
        fgColor: GetFontAttribute(FONT_NORMAL, FONTATTR_COLOR_FOREGROUND),
        bgColor: GetFontAttribute(FONT_NORMAL, FONTATTR_COLOR_BACKGROUND),
        shadowColor: GetFontAttribute(FONT_NORMAL, FONTATTR_COLOR_SHADOW),
      },
      TEXT_SKIP_DRAW, null,
    );
  }
  CopyWindowToVram(windowId, COPYWIN_GFX);
}

// ⚠️ `PrintMenuActionTextsWithSpacing` (menu.c:1109, UNUSED) DIFFÉRÉ : dépend de
//    `AddTextPrinterParameterized5` (text.c, pas encore porté).

/** 1:1 décomp `menu.c:1225 PrintMenuActionGridText` (static). */
function PrintMenuActionGridText(windowId: number, fontId: number, left: number, top: number, width: number, height: number, columns: number, rows: number, menuActions: readonly MenuAction[]): void {
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < columns; j++)
      AddTextPrinterParameterized(windowId, fontId, menuActions[(i * columns) + j].text, (width * j) + left, (height * i) + top, TEXT_SKIP_DRAW, null);
  CopyWindowToVram(windowId, COPYWIN_GFX);
}
void PrintMenuActionGridText;

/** 1:1 décomp `menu.c:1242 PrintMenuActionGrid` (par `actionIds`). */
export function PrintMenuActionGrid(windowId: number, fontId: number, left: number, top: number, optionWidth: number, horizontalCount: number, verticalCount: number, menuActions: readonly MenuAction[], actionIds: readonly number[]): void {
  for (let i = 0; i < verticalCount; i++) {
    for (let j = 0; j < horizontalCount; j++) {
      AddTextPrinter(
        {
          str: menuActions[actionIds[(horizontalCount * i) + j]].text, windowId, fontId,
          x: (optionWidth * j) + left, y: (GetFontAttribute(fontId, FONTATTR_MAX_LETTER_HEIGHT) * i) + top,
          letterSpacing: GetFontAttribute(fontId, FONTATTR_LETTER_SPACING),
          lineSpacing: GetFontAttribute(fontId, FONTATTR_LINE_SPACING),
          fgColor: GetFontAttribute(fontId, FONTATTR_COLOR_FOREGROUND),
          bgColor: GetFontAttribute(fontId, FONTATTR_COLOR_BACKGROUND),
          shadowColor: GetFontAttribute(fontId, FONTATTR_COLOR_SHADOW),
        },
        TEXT_SKIP_DRAW, null,
      );
    }
  }
  CopyWindowToVram(windowId, COPYWIN_GFX);
}

/** 1:1 décomp `menu.c:1648 PrintMenuGridTable`. */
export function PrintMenuGridTable(windowId: number, optionWidth: number, columns: number, rows: number, menuActions: readonly MenuAction[]): void {
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < columns; j++)
      AddTextPrinterParameterized(windowId, 1, menuActions[(i * columns) + j].text, (optionWidth * j) + 8, (i * 16) + 1, TEXT_SKIP_DRAW, null);
  CopyWindowToVram(windowId, COPYWIN_GFX);
}

// ─── Grille : init + curseur (menu.c:1278-1395, 1691) ────────────────────────

/** 1:1 décomp `menu.c:1278 InitMenuGrid` (static). */
function InitMenuGrid(windowId: number, fontId: number, left: number, top: number, optionWidth: number, optionHeight: number, columns: number, rows: number, numChoices: number, cursorPos: number): number {
  sMenu.left = left;
  sMenu.top = top;
  sMenu.minCursorPos = 0;
  sMenu.maxCursorPos = numChoices - 1;
  sMenu.windowId = windowId;
  sMenu.fontId = fontId;
  sMenu.optionWidth = optionWidth;
  sMenu.optionHeight = optionHeight;
  sMenu.columns = columns;
  sMenu.rows = rows;

  const pos = cursorPos;
  if (pos < 0 || pos > sMenu.maxCursorPos)
    sMenu.cursorPos = 0;
  else
    sMenu.cursorPos = pos;

  ChangeMenuGridCursorPosition(MENU_CURSOR_DELTA_NONE, MENU_CURSOR_DELTA_NONE);
  return sMenu.cursorPos;
}
void InitMenuGrid;

/** 1:1 décomp `menu.c:1313 MoveMenuGridCursor` (static) : efface l'ancien curseur, dessine le nouveau. */
function MoveMenuGridCursor(oldCursorPos: number, newCursorPos: number): void {
  const cursorWidth = GetMenuCursorDimensionByFont(sMenu.fontId, 0);
  const cursorHeight = GetMenuCursorDimensionByFont(sMenu.fontId, 1);

  let xPos = (oldCursorPos % sMenu.columns) * sMenu.optionWidth + sMenu.left;
  let yPos = Math.floor(oldCursorPos / sMenu.columns) * sMenu.optionHeight + sMenu.top;
  FillWindowPixelRect(sMenu.windowId, PIXEL_FILL(1), xPos, yPos, cursorWidth, cursorHeight);

  xPos = (newCursorPos % sMenu.columns) * sMenu.optionWidth + sMenu.left;
  yPos = Math.floor(newCursorPos / sMenu.columns) * sMenu.optionHeight + sMenu.top;
  AddTextPrinterParameterized(sMenu.windowId, sMenu.fontId, gText_SelectorArrow3, xPos, yPos, 0, null);
}

/** 1:1 décomp `menu.c:1327 ChangeMenuGridCursorPosition` (wrap par ligne/colonne). */
export function ChangeMenuGridCursorPosition(deltaX: number, deltaY: number): number {
  const oldPos = sMenu.cursorPos;

  if (deltaX !== 0) {
    if ((sMenu.cursorPos % sMenu.columns) + deltaX < 0)
      sMenu.cursorPos += sMenu.columns - 1;
    else if ((sMenu.cursorPos % sMenu.columns) + deltaX >= sMenu.columns)
      sMenu.cursorPos = Math.floor(sMenu.cursorPos / sMenu.columns) * sMenu.columns;
    else
      sMenu.cursorPos += deltaX;
  }

  if (deltaY !== 0) {
    if (Math.floor(sMenu.cursorPos / sMenu.columns) + deltaY < 0)
      sMenu.cursorPos += sMenu.columns * (sMenu.rows - 1);
    else if (Math.floor(sMenu.cursorPos / sMenu.columns) + deltaY >= sMenu.rows)
      sMenu.cursorPos -= sMenu.columns * (sMenu.rows - 1);
    else
      sMenu.cursorPos += (sMenu.columns * deltaY);
  }

  if (sMenu.cursorPos > sMenu.maxCursorPos) {
    sMenu.cursorPos = oldPos;
    return sMenu.cursorPos;
  } else {
    MoveMenuGridCursor(oldPos, sMenu.cursorPos);
    return sMenu.cursorPos;
  }
}

/** 1:1 décomp `menu.c:1363 ChangeGridMenuCursorPosition` (clamp, sans wrap). */
export function ChangeGridMenuCursorPosition(deltaX: number, deltaY: number): number {
  const oldPos = sMenu.cursorPos;

  if (deltaX !== 0) {
    if (((sMenu.cursorPos % sMenu.columns) + deltaX >= 0) && ((sMenu.cursorPos % sMenu.columns) + deltaX < sMenu.columns))
      sMenu.cursorPos += deltaX;
  }

  if (deltaY !== 0) {
    if ((Math.floor(sMenu.cursorPos / sMenu.columns) + deltaY >= 0) && (Math.floor(sMenu.cursorPos / sMenu.columns) + deltaY < sMenu.rows))
      sMenu.cursorPos += (sMenu.columns * deltaY);
  }

  if (sMenu.cursorPos > sMenu.maxCursorPos) {
    sMenu.cursorPos = oldPos;
    return sMenu.cursorPos;
  } else {
    MoveMenuGridCursor(oldPos, sMenu.cursorPos);
    return sMenu.cursorPos;
  }
}

// `GetLRKeysPressed` (1:1 menu_helpers.c:252) en import DIFFÉRÉ : un import STATIQUE
// de `menu_helpers` forcerait l'évaluation de sa chaîne (mail-data → save/pokemon)
// PENDANT l'init du `menu.ts` foundational (tiré par les hubs gba-*-system) → casse
// l'ordre d'init ESM (boot sans canvas). Le dynamic import éval menu_helpers APRÈS
// la phase sync du boot (comme bag-menu/mail le font), bindings prêtes. Le grid
// input tourne au runtime (≫ après résolution) ; avant résolution, L/R inactif.
let _GetLRKeysPressed: (() => number) | null = null;
void import('./menu_helpers').then((m) => { _GetLRKeysPressed = m.GetLRKeysPressed; });

/** 1:1 décomp `menu.c:1436 Menu_ProcessGridInput`. */
export function Menu_ProcessGridInput(): number {
  const oldPos = sMenu.cursorPos;
  if (JOY_NEW(A_BUTTON)) {
    PlaySE(SE_SELECT);
    return sMenu.cursorPos;
  } else if (JOY_NEW(B_BUTTON)) {
    return MENU_B_PRESSED;
  } else if (JOY_NEW(DPAD_UP)) {
    if (oldPos !== ChangeGridMenuCursorPosition(0, -1)) PlaySE(SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  } else if (JOY_NEW(DPAD_DOWN)) {
    if (oldPos !== ChangeGridMenuCursorPosition(0, 1)) PlaySE(SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  } else if (JOY_NEW(DPAD_LEFT) || _GetLRKeysPressed?.() === MENU_L_PRESSED) {
    if (oldPos !== ChangeGridMenuCursorPosition(-1, 0)) PlaySE(SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  } else if (JOY_NEW(DPAD_RIGHT) || _GetLRKeysPressed?.() === MENU_R_PRESSED) {
    if (oldPos !== ChangeGridMenuCursorPosition(1, 0)) PlaySE(SE_SELECT);
    return MENU_NOTHING_CHOSEN;
  }
  return MENU_NOTHING_CHOSEN;
}

/** 1:1 décomp `menu.c:1691 InitMenuActionGrid`. */
export function InitMenuActionGrid(windowId: number, optionWidth: number, columns: number, rows: number, initialCursorPos: number): number {
  sMenu.left = 0;
  sMenu.top = 1;
  sMenu.minCursorPos = 0;
  sMenu.maxCursorPos = (columns * rows) - 1;
  sMenu.windowId = windowId;
  sMenu.fontId = FONT_NORMAL;
  sMenu.optionWidth = optionWidth;
  sMenu.optionHeight = 16;
  sMenu.columns = columns;
  sMenu.rows = rows;

  const pos = initialCursorPos;
  if (pos < 0 || pos > sMenu.maxCursorPos)
    sMenu.cursorPos = 0;
  else
    sMenu.cursorPos = pos;

  ChangeMenuGridCursorPosition(MENU_CURSOR_DELTA_NONE, MENU_CURSOR_DELTA_NONE);
  return sMenu.cursorPos;
}

// ─── Helpers WindowTemplate (menu.c:1154-1177) ───────────────────────────────

/** 1:1 décomp `menu.c:1154 SetWindowTemplateFields`. */
export function SetWindowTemplateFields(template: WindowTemplate, bg: number, left: number, top: number, width: number, height: number, paletteNum: number, baseBlock: number): void {
  template.bg = bg;
  template.tilemapLeft = left;
  template.tilemapTop = top;
  template.width = width;
  template.height = height;
  template.paletteNum = paletteNum;
  template.baseBlock = baseBlock;
}

/** 1:1 décomp `menu.c:1172 AddWindowParameterized`. */
export function AddWindowParameterized(bg: number, left: number, top: number, width: number, height: number, paletteNum: number, baseBlock: number): number {
  const template: WindowTemplate = { bg, tilemapLeft: left, tilemapTop: top, width, height, paletteNum, baseBlock };
  return AddWindow(template);
}
