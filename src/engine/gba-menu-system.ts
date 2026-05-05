/**
 * gba-menu-system.ts
 * ------------------
 * Helpers menu GENERIQUES + persistence saveBlock. Tout ce qui est
 * spécifique main_menu.c vit dans `main-menu-impl.ts` (= split Phase C
 * audit session 83 pour respecter directive #1 "foundations unifiées").
 *
 * Architecture :
 *   - Constantes input keys (A_BUTTON, B_BUTTON, DPAD_*) — partagées
 *   - Menu cursor input générique (Menu_ProcessInputNoWrapClearOnChoose,
 *     Menu_GetCursorPos, InitMenuInUpperLeftCornerNormal)
 *   - Yes/No menu stubs (CreateYesNoMenuParameterized, CreateYesNoMenu)
 *   - Misc generic stubs (IsWirelessAdapterConnected, IsMysteryGiftEnabled,
 *     CanResetRTC, RtcGetErrorStatus, PlayBGM bridge)
 *   - gSaveBlock1Ptr / gSaveBlock2Ptr Proxy auto-persistant localStorage
 *   - gSaveFileStatus mutable global
 */
import { getRuntime, m4aSongNumStart, PlaySE } from './decomp-globals';
import { AddWindow, DrawStdFrameWithCustomTileAndPalette, FillWindowPixelRect, CopyWindowToVram, type WindowTemplate } from './gba-window-system';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import { getString } from './gba-strings';

// 1:1 décomp include/constants/songs.h:11 : SE_SELECT = 5.
const SE_SELECT_KEY = 5;
// 1:1 décomp src/menu.c:945 : `gText_SelectorArrow3 = _("▶")` — cursor glyph.
const CURSOR_CHAR = '▶';
// Constantes layout cursor :
//   x = 0 : aligné sur bord gauche du window (= 1:1 décomp sMenu.left).
//   yPerRow = 16 : LINE_HEIGHT (14) + 2 (= 1:1 décomp menu.c:945 maxLetterHeight + 2).
//   width/height = 8 / 16 : taille du glyph cursor à clear.
const CURSOR_X = 0;
const CURSOR_Y_PER_ROW = 16;
const CURSOR_WIDTH = 8;
const CURSOR_HEIGHT = 16;

// ─── Menu cursor state ───────────────────────────────────────────────────────

let menuCursorPos = 0;
let menuNumItems = 0;
let menuActive = false;
let menuWindowId = -1;  // -1 = no menu active. Utilisé par drawMenuCursor/clearMenuCursor.

// ─── Input keys (= shared with main-menu-impl.ts) ────────────────────────────

export const A_BUTTON = 0x01;
export const B_BUTTON = 0x02;
export const DPAD_UP = 0x40;
export const DPAD_DOWN = 0x80;

// ─── Menu_ProcessInputNoWrapClearOnChoose + helpers ──────────────────────────

export function Menu_ProcessInputNoWrapClearOnChoose(): number {
  if (!menuActive) return -1;
  const newKeys = getRuntime()?.gMain.newKeys ?? 0;

  if (newKeys & A_BUTTON) {
    menuActive = false;
    clearMenuCursor();
    EraseYesNoWindow();  // 1:1 décomp menu.c:1219 (= clear + remove window)
    return menuCursorPos;
  }
  if (newKeys & B_BUTTON) {
    menuActive = false;
    clearMenuCursor();
    EraseYesNoWindow();  // 1:1 décomp menu.c:1219
    return -1; // MENU_B_PRESSED
  }
  if (newKeys & DPAD_UP) {
    if (menuCursorPos > 0) {
      // 1:1 décomp menu.c:945 ChangeListMenuPos → erase old + draw new + SE_SELECT.
      clearMenuCursor();
      menuCursorPos--;
      drawMenuCursor();
      PlaySE(SE_SELECT_KEY);
    }
  }
  if (newKeys & DPAD_DOWN) {
    if (menuCursorPos < menuNumItems - 1) {
      clearMenuCursor();
      menuCursorPos++;
      drawMenuCursor();
      PlaySE(SE_SELECT_KEY);
    }
  }
  return -2; // still processing
}

/** 1:1 décomp src/menu.c:945 Menu_PrintCursor (FONT_NORMAL, gText_SelectorArrow3="▶").
 *  Draws ▶ glyph dans le window au row courant. Couleur identique au texte
 *  (= [bgColor=1, fgColor=2, shadowColor=3] standard FONT_NORMAL). */
function drawMenuCursor(): void {
  if (menuWindowId < 0) return;
  AddTextPrinterParameterized3(
    menuWindowId,
    1,  // FONT_NORMAL
    CURSOR_X, 1 + menuCursorPos * CURSOR_Y_PER_ROW,
    [1, 2, 3],
    255,  // TEXT_SKIP_DRAW = sync render finished=true
    CURSOR_CHAR,
  );
  CopyWindowToVram(menuWindowId, 2);  // COPYWIN_GFX → flush pixel buffer.
}

/** Clear le glyph cursor à la position actuelle via FillWindowPixelRect.
 *  bgColor=1 (= 1:1 décomp PIXEL_FILL(1) standard menu fill). */
function clearMenuCursor(): void {
  if (menuWindowId < 0) return;
  FillWindowPixelRect(
    menuWindowId,
    1,  // bgColor
    CURSOR_X, 1 + menuCursorPos * CURSOR_Y_PER_ROW,
    CURSOR_WIDTH, CURSOR_HEIGHT,
  );
  CopyWindowToVram(menuWindowId, 2);  // COPYWIN_GFX = 2
}

/** 1:1 décomp src/menu.c:1219 EraseYesNoWindow.
 *    ClearStdWindowAndFrameToTransparent(sYesNoWindowId, TRUE);
 *    RemoveWindow(sYesNoWindowId);
 *  Appelé après Menu_ProcessInputNoWrapClearOnChoose pour vider le window
 *  et le retirer du registry. Sans ça → OUI/NON reste visible après choix. */
function EraseYesNoWindow(): void {
  if (sYesNoWindowId < 0) return;
  // ClearStdWindowAndFrameToTransparent : fill pixels avec idx 0 (= transparent)
  // + clear tilemap entries (= AddWindow utilise un baseBlock spécifique).
  void import('./gba-window-system').then(({ ClearStdWindowAndFrame, RemoveWindow }) => {
    ClearStdWindowAndFrame(sYesNoWindowId, true);
    RemoveWindow(sYesNoWindowId);
    sYesNoWindowId = -1;
  });
}

export function Menu_GetCursorPos(): number {
  return menuCursorPos;
}

/** 1:1 décomp src/menu.c:1577 InitMenuInUpperLeftCornerNormal.
 *    InitMenu(menuStruct, windowId, ...);
 *    Menu_PrintCursor(0, FONT_NORMAL);   // ← draw initial ▶ cursor
 *  Sans le draw initial → menu sans curseur visible (= bug session 89 OUI/NON
 *  + GARÇON/FILLE silent without highlight). */
export function InitMenuInUpperLeftCornerNormal(windowId: number, numItems: number, cursorPos: number): void {
  menuWindowId = windowId;
  menuNumItems = numItems;
  menuCursorPos = cursorPos;
  menuActive = true;
  drawMenuCursor();  // 1:1 décomp ligne 1583 : Menu_PrintCursor(0, FONT_NORMAL) — auto-VRAM-copy.
}

// ─── Yes/No Menu (= 1:1 décomp src/menu.c:1623) ──────────────────────────────
//
// Phase E Step 1 : real impl 1:1 décomp. Le menu Yes/No est un window standard
// (4 cells de large, 2 lines de haut) avec un frame border + texte "OUI/NON" +
// cursor highlight via InitMenuInUpperLeftCornerNormal.
//
// Lecture input via Menu_ProcessInputNoWrapClearOnChoose() → retourne 0=OUI,
// 1=NON, -1=B pressed (cancel).

let sYesNoWindowId = -1;

/** 1:1 décomp `menu.c:1623 CreateYesNoMenu(window, baseTileNum, paletteNum, initialCursorPos)`.
 *  Affiche un window standard avec frame + texte "OUI/NON" + cursor à `initialCursorPos`. */
export function CreateYesNoMenu(
  window: WindowTemplate,
  baseTileNum: number,
  paletteNum: number,
  initialCursorPos: number,
): void {
  sYesNoWindowId = AddWindow(window);
  DrawStdFrameWithCustomTileAndPalette(sYesNoWindowId, true, baseTileNum, paletteNum);

  // 1:1 décomp printer setup : x=8, y=1 (= offset depuis le bord du window).
  // colorArray = [bgColor, fgColor, shadowColor]. PIXEL_FILL(1) du DrawStdFrame
  // remplit le pixel buffer avec idx 1, donc bgColor=1, fg=2, shadow=3 = pattern
  // standard FONT_NORMAL.
  const yesNoText = getString('gText_YesNo');  // "OUI\nNON" en FR
  AddTextPrinterParameterized3(
    sYesNoWindowId,
    1,  // FONT_NORMAL
    8, 1,  // x, y depuis bord du window
    [1, 2, 3],  // [bgColor, fgColor, shadowColor]
    255,  // TEXT_SKIP_DRAW = render synchronously, finished=true
    yesNoText,
  );

  // 1:1 décomp ligne 1645 : InitMenuInUpperLeftCornerNormal(sYesNoWindowId, 2, initialCursorPos).
  // 2 = numItems (OUI + NON).
  InitMenuInUpperLeftCornerNormal(sYesNoWindowId, 2, initialCursorPos);
}

/** Helper pour les callers qui veulent l'ID du window Yes/No (= cleanup,
 *  ClearStdWindowAndFrame après fermeture). */
export function GetYesNoWindowId(): number {
  return sYesNoWindowId;
}

// ─── Misc generic stubs ──────────────────────────────────────────────────────

/** 1:1 décomp src/link.c IsWirelessAdapterConnected. Notre engine web : pas
 *  de wireless adapter (= toujours false). Utilisé par main_menu.c pour les
 *  Mystery Gift / Mystery Events checks. */
export function IsWirelessAdapterConnected(): boolean {
  return false;
}

export function IsMysteryGiftEnabled(): boolean {
  return false;
}

export function CanResetRTC(): boolean {
  return false;
}

export function RtcGetErrorStatus(): number {
  return 0;
}

/** 1:1 décomp `sound.c PlayBGM(songNum)` — bridge vers m4aSongNumStart avec loop=true.
 *  Utilisé par Birch (MUS_ROUTE122) et autres scenes. */
export function PlayBGM(songNum: number): void {
  m4aSongNumStart(songNum, true);  // BGM = loop
}

// ─── Save block + persistence (= localStorage proxy) ─────────────────────────
//
// 1:1 décomp : gSaveBlock2Ptr est un struct EWRAM qui contient les options
// joueur (textSpeed, sound, frame style…) + identité player (gender, name).
// Décomp persiste via flash mem sur GBA. Notre engine : localStorage.
//
// Mécanique : `_saveBlock2Storage` est l'objet runtime. `gSaveBlock2Ptr` est
// un Proxy qui auto-persist toute écriture vers localStorage. Charge depuis
// localStorage au boot (= options préservées au refresh).

const SAVEBLOCK2_LSKEY = 'pokemon-web-demo:saveBlock2';

const _saveBlock2Defaults: Record<string, unknown> = {
  playerGender: 0,
  playerName: 'PLAYER',
  // Options (= 1:1 décomp save_data.c init values)
  optionsTextSpeed: 1,        // OPTIONS_TEXT_SPEED_MID
  optionsBattleSceneOff: 0,   // OPTIONS_BATTLE_SCENE_ON
  optionsBattleStyle: 0,      // OPTIONS_BATTLE_STYLE_SHIFT
  optionsSound: 0,            // OPTIONS_SOUND_MONO
  optionsButtonMode: 0,       // OPTIONS_BUTTON_MODE_NORMAL
  optionsWindowFrameType: 0,  // frame 1 (= classic blue rounded)
};

/** Charge depuis localStorage si dispo, sinon defaults. */
function _loadSaveBlock2(): Record<string, unknown> {
  const obj = { ..._saveBlock2Defaults };
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SAVEBLOCK2_LSKEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      Object.assign(obj, parsed);
    }
  } catch (e) {
    console.warn('[gSaveBlock2Ptr] failed to load from localStorage:', e);
  }
  return obj;
}

const _saveBlock2Storage: Record<string, unknown> = _loadSaveBlock2();

/** Persist le storage actuel vers localStorage. */
function _persistSaveBlock2(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SAVEBLOCK2_LSKEY, JSON.stringify(_saveBlock2Storage));
    }
  } catch (e) {
    console.warn('[gSaveBlock2Ptr] failed to persist to localStorage:', e);
  }
}

export const gSaveBlock1Ptr = {} as any;

/** 1:1 décomp `gSaveBlock2Ptr` — Proxy auto-persistent vers localStorage.
 *  Toute écriture (e.g. `gSaveBlock2Ptr.optionsTextSpeed = 2` dans
 *  Task_OptionMenuSave) écrit immédiatement dans localStorage → préserve les
 *  options au refresh. */
export const gSaveBlock2Ptr: any = new Proxy(_saveBlock2Storage, {
  get(target, prop: string | symbol) {
    return target[prop as string];
  },
  set(target, prop: string | symbol, value: unknown) {
    target[prop as string] = value;
    _persistSaveBlock2();
    return true;
  },
});

export let gSaveFileStatus = 0; // SAVE_STATUS_EMPTY

export function SetSaveFileStatus(status: number): void {
  gSaveFileStatus = status;
}

// Synchronise gSaveFileStatus mutable export sur globalThis pour les
// callbacks auto-générés (= eval scope @ts-nocheck).
if (!('gSaveFileStatus' in globalThis)) {
  Object.defineProperty(globalThis, 'gSaveFileStatus', {
    get: () => gSaveFileStatus,
    set: (v) => { gSaveFileStatus = v as number; },
    enumerable: true,
    configurable: true,
  });
}
