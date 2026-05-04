/**
 * gba-menu-system.ts
 * ------------------
 * Couche d'adaptation menu.c + stubs divers pour le runtime décomp.
 * Gère l'input menu, les Yes/No menus, et les fonctions utilitaires
 * appelées par les callbacks auto-générés.
 */
import { getRuntime, getAsset } from './decomp-globals';
import { GetWindowFrameTilesPal } from './gba-text-window';
import { JOY_NEW } from './decomp-globals';
import {
  ResetBgsAndClearDma3BusyFlags,
  InitBgsFromTemplates,
  ChangeBgX,
  ChangeBgY,
  InitWindows,
  DeactivateAllTextPrinters,
  LoadPalette,
  ShowBg,
  HideBg,
  FreeAllWindowBuffers,
  ResetPaletteFade,
  ScanlineEffect_Stop,
  ResetTasks,
  FreeAllSpritePalettes,
  PALETTES_ALL,
  EnableInterrupts,
  LoadBgTiles,
  PlaySE,
} from './decomp-globals';
import {
  FillBgTilemapBufferRect,
  CopyBgTilemapBufferToVram,
} from './gba-window-system';
import { BG_PLTT_ID, REG_OFFSET_WIN0H, REG_OFFSET_WIN0V } from './decomp-runtime';
import { PLTT_SIZE_4BPP, WIN_RANGE } from './decomp-helpers';
import { sMainMenuBgTemplates, sWindowTemplates_MainMenu, MAIN_MENU_BORDER_TILE, ENUM_HAS_0 } from './decomp-data/main-menu-data';
import {
  Task_MainMenuCheckSaveFile,
  CB2_MainMenu,
  Task_HandleMainMenuAPressed,
  Task_HandleMainMenuBPressed,
} from './decomp-data/auto/src/main_menu-callbacks-auto';

// ─── Menu input state ────────────────────────────────────────────────────────

let menuCursorPos = 0;
let menuNumItems = 0;
let menuActive = false;
let menuWindowId = 0;
let menuCallback: (() => void) | null = null;

// 1:1 décomp include/constants/songs.h:11 → SE_SELECT = 5 (= se_select dans
// song_table.inc:14). Avant : placeholder = 1 (= se_use_item) → mauvais son.
const SE_SELECT = 5;
const HAS_MYSTERY_EVENTS = ENUM_HAS_0.HAS_MYSTERY_EVENTS;

// ─── Global vars used by auto-generated main_menu callbacks ──────────────────

export let sCurrItemAndOptionMenuCheck = 0;
export let sBirchSpeechMainTaskId = 0;
export let sStartedPokeBallTask = false;

// Expose on globalThis for auto-generated callback compatibility
(globalThis as Record<string, unknown>).sCurrItemAndOptionMenuCheck = sCurrItemAndOptionMenuCheck;
(globalThis as Record<string, unknown>).sBirchSpeechMainTaskId = sBirchSpeechMainTaskId;
(globalThis as Record<string, unknown>).sStartedPokeBallTask = sStartedPokeBallTask;

export const sScrollArrowsTemplate_MainMenu = {} as any;
(globalThis as Record<string, unknown>).sScrollArrowsTemplate_MainMenu = sScrollArrowsTemplate_MainMenu;

export const sSpriteAffineAnimTable_PlayerShrink = {} as any;
(globalThis as Record<string, unknown>).sSpriteAffineAnimTable_PlayerShrink = sSpriteAffineAnimTable_PlayerShrink;

// Birch speech stubs (prevent ReferenceError if reached)
export const sBirchBgTemplate = { bg: 0, charBaseIndex: 3, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 };
(globalThis as Record<string, unknown>).sBirchBgTemplate = sBirchBgTemplate;
export const sBirchSpeechBgMap = 'sBirchSpeechBgMap';
(globalThis as Record<string, unknown>).sBirchSpeechBgMap = sBirchSpeechBgMap;
export const sBirchSpeechBgPals = 'sBirchSpeechBgPals';
(globalThis as Record<string, unknown>).sBirchSpeechBgPals = sBirchSpeechBgPals;
export const sBirchSpeechPlatformBlackPal = 'sBirchSpeechPlatformBlackPal';
(globalThis as Record<string, unknown>).sBirchSpeechPlatformBlackPal = sBirchSpeechPlatformBlackPal;
export const sBirchSpeechBgGradientPal = ['', ''];
(globalThis as Record<string, unknown>).sBirchSpeechBgGradientPal = sBirchSpeechBgGradientPal;

// Expose InitMainMenu / VBlankCB_MainMenu for auto-generated callbacks (avoid ES module cycle)
(globalThis as Record<string, unknown>).InitMainMenu = InitMainMenu;
(globalThis as Record<string, unknown>).VBlankCB_MainMenu = VBlankCB_MainMenu;

// ─── Menu_ProcessInputNoWrapClearOnChoose ────────────────────────────────────

const A_BUTTON = 0x01;
const B_BUTTON = 0x02;
const DPAD_UP = 0x40;
const DPAD_DOWN = 0x80;

export function Menu_ProcessInputNoWrapClearOnChoose(): number {
  if (!menuActive) return -1;
  const held = getRuntime()?.gMain.heldKeys ?? 0;
  const newKeys = getRuntime()?.gMain.newKeys ?? 0;

  if (newKeys & A_BUTTON) {
    menuActive = false;
    return menuCursorPos;
  }
  if (newKeys & B_BUTTON) {
    menuActive = false;
    return -1; // MENU_B_PRESSED
  }
  if (newKeys & DPAD_UP) {
    if (menuCursorPos > 0) menuCursorPos--;
  }
  if (newKeys & DPAD_DOWN) {
    if (menuCursorPos < menuNumItems - 1) menuCursorPos++;
  }
  return -2; // still processing
}

export function Menu_GetCursorPos(): number {
  return menuCursorPos;
}

export function InitMenuInUpperLeftCornerNormal(windowId: number, numItems: number, cursorPos: number): void {
  menuWindowId = windowId;
  menuNumItems = numItems;
  menuCursorPos = cursorPos;
  menuActive = true;
}

// ─── Yes/No Menu stubs ───────────────────────────────────────────────────────

export function CreateYesNoMenuParameterized(
  _windowId: number,
  _fontId: number,
  _frameTile: number,
  _cursorTile: number,
  _x: number,
  _y: number,
): void {
  // TODO: implementer le vrai Yes/No menu
  menuNumItems = 2;
  menuCursorPos = 0;
  menuActive = true;
}

export function CreateYesNoMenu(
  _x: number,
  _y: number,
  _windowId: number,
): void {
  menuNumItems = 2;
  menuCursorPos = 0;
  menuActive = true;
}

// ─── Main Menu helpers stubs ─────────────────────────────────────────────────

export function HandleMainMenuInput(taskId: number): boolean {
  const rt = getRuntime();
  if (!rt) return false;
  const newKeys = rt.gMain.newKeys ?? 0;
  const task = rt.gTasks.get(taskId);
  if (!task) return false;
  const data = task.data;
  if (newKeys & A_BUTTON) {
    PlaySE(SE_SELECT);
    rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0, 0x10, 'RGB_BLACK');
    task.func = (t: any) => Task_HandleMainMenuAPressed(t, rt);
  } else if (newKeys & B_BUTTON) {
    PlaySE(SE_SELECT);
    rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0, 0x10, 'RGB_WHITEALPHA');
    rt.SetGpuReg(REG_OFFSET_WIN0H, WIN_RANGE(0, 240));
    rt.SetGpuReg(REG_OFFSET_WIN0V, WIN_RANGE(0, 160));
    task.func = (t: any) => Task_HandleMainMenuBPressed(t, rt);
  } else if ((newKeys & DPAD_UP) && data[1] > 0) {
    if (data[0] === HAS_MYSTERY_EVENTS && data[14] === 1 && data[1] === 1) {
      ChangeBgY(0, 0x2000, 1); // BG_COORD_SUB
      ChangeBgY(1, 0x2000, 1);
      const arrowTask = rt.gTasks.get(data[13]);
      if (arrowTask) arrowTask.data[15] = 0;
      data[14] = 0;
    }
    data[1]--;
    (globalThis as any).sCurrItemAndOptionMenuCheck = data[1];
    return true;
  } else if ((newKeys & DPAD_DOWN) && data[1] < data[12] - 1) {
    if (data[0] === HAS_MYSTERY_EVENTS && data[1] === 3 && data[14] === 0) {
      ChangeBgY(0, 0x2000, 0); // BG_COORD_ADD
      ChangeBgY(1, 0x2000, 0);
      const arrowTask = rt.gTasks.get(data[13]);
      if (arrowTask) arrowTask.data[15] = 1;
      data[14] = 1;
    }
    data[1]++;
    (globalThis as any).sCurrItemAndOptionMenuCheck = data[1];
    return true;
  }
  return false;
}

export function HighlightSelectedMainMenuItem(
  menuType: number,
  cursorPos: number,
  isScrolled: boolean,
): void {
  const rt = getRuntime();
  if (!rt) return;

  // Horizontal window coords are constant for main menu
  const winH = WIN_RANGE(9, 231);
  rt.SetGpuReg(REG_OFFSET_WIN0H, winH);

  // Vertical coords depend on selected item
  const vCoords: number[] = [
    WIN_RANGE(1, 31),   // WIN0
    WIN_RANGE(33, 63),  // WIN1
    WIN_RANGE(1, 63),   // WIN2
    WIN_RANGE(65, 95),  // WIN3
    WIN_RANGE(97, 127), // WIN4
    WIN_RANGE(129, 159),// WIN5
    WIN_RANGE(161, 191),// WIN6
  ];
  const scrollShift = WIN_RANGE(32, 32);

  let winV = 0;
  switch (menuType) {
    case 0: // HAS_NO_SAVED_GAME
    default:
      winV = vCoords[cursorPos] ?? vCoords[0];
      break;
    case 1: // HAS_SAVED_GAME
      winV = vCoords[cursorPos + 2] ?? vCoords[2];
      break;
    case 2: // HAS_MYSTERY_GIFT
      winV = vCoords[cursorPos + 2] ?? vCoords[2];
      break;
    case 3: // HAS_MYSTERY_EVENTS
      winV = vCoords[cursorPos + 2] ?? vCoords[2];
      if (isScrolled && cursorPos >= 1 && cursorPos <= 3) {
        winV -= scrollShift;
      }
      if (cursorPos === 4) {
        winV = vCoords[6] - scrollShift;
      }
      break;
  }
  rt.SetGpuReg(REG_OFFSET_WIN0V, winV);
}

export function MainMenu_FormatSavegameText(): void {
  // TODO: formater le texte de la sauvegarde (player name, badges, play time)
}

export function CreateMainMenuErrorWindow(_text: string): void {
  // TODO: afficher une fenêtre d'erreur
  console.warn('[gba-menu-system] CreateMainMenuErrorWindow:', _text);
}

// ─── Birch Speech helpers stubs ──────────────────────────────────────────────

export function NewGameBirchSpeech_ClearWindow(_windowId: number): void {
  // TODO: effacer la fenêtre dialogue
}

export function NewGameBirchSpeech_ShowDialogueWindow(_windowId: number, _copyToVram: boolean): void {
  // TODO: afficher la fenêtre dialogue
}

export function NewGameBirchSpeech_ClearGenderWindow(_windowId: number, _copyToVram: boolean): void {
  // TODO: effacer la fenêtre genre
}

export function NewGameBirchSpeech_ShowGenderMenu(): void {
  // TODO: afficher le menu genre
  menuNumItems = 2;
  menuCursorPos = 0;
  menuActive = true;
}

export function NewGameBirchSpeech_ProcessGenderMenuInput(): number {
  if (!menuActive) return -1;
  const newKeys = getRuntime()?.gMain.newKeys ?? 0;
  if (newKeys & A_BUTTON) {
    menuActive = false;
    return menuCursorPos; // 0 = male, 1 = female
  }
  if (newKeys & DPAD_UP && menuCursorPos > 0) menuCursorPos--;
  if (newKeys & DPAD_DOWN && menuCursorPos < 1) menuCursorPos++;
  return -1;
}

export function NewGameBirchSpeech_SetDefaultPlayerName(_presetIndex: number): void {
  // TODO: définir le nom par défaut du joueur
}

export function NewGameBirchSpeech_CreateNameYesNo(_windowId: number): void {
  // TODO: créer le menu Yes/No pour le nom
  menuNumItems = 2;
  menuCursorPos = 0;
  menuActive = true;
}

// ─── Scroll indicator stubs ──────────────────────────────────────────────────

export function AddScrollIndicatorArrowPair(_params: unknown, _taskFunc: unknown): number {
  return 0;
}

export function RemoveScrollIndicatorArrowPair(_taskId: number): void {
  // no-op
}

export function Task_ScrollIndicatorArrowPairOnMainMenu(_task: unknown, _rt: unknown): void {
  // no-op
}

// ─── Misc stubs ──────────────────────────────────────────────────────────────

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

export function DoNamingScreen(_type: number, _dest: unknown, _gender: number): void {
  // TODO: transition vers l'écran de nom
  console.warn('[gba-menu-system] DoNamingScreen not implemented');
}

export function FreeAndDestroyMonPicSprite(_spriteId: number): void {
  const rt = getRuntime();
  if (rt) rt.DestroySprite(_spriteId);
}

export function ResetAllPicSprites(): void {
  // no-op
}

export function PlayBGM(_songNum: number): void {
  // TODO: bridge vers m4aSongNumStart
}

/** 1:1 décomp src/main_menu.c:2195 LoadMainMenuWindowFrameTiles :
 *    LoadBgTiles(bgId, GetWindowFrameTilesPal(...)->tiles, 0x120, tileOffset);
 *    LoadPalette(GetWindowFrameTilesPal(...)->pal, BG_PLTT_ID(2), PLTT_SIZE_4BPP);
 *
 *  Frame style = `gSaveBlock2Ptr->optionsWindowFrameType` (= 0-19). Asset
 *  préchargés par `preloadTextWindowFrames()` (cf. gba-text-window.ts).
 *  Notre `GetWindowFrameTilesPal` retourne des buffers vides si asset manquant
 *  (= warning console, pas crash). */
export function LoadMainMenuWindowFrameTiles(bgId: number, tileOffset: number): void {
  const fp = GetWindowFrameTilesPal(gSaveBlock2Ptr.optionsWindowFrameType ?? 0);
  LoadBgTiles(bgId, fp.tiles, 0x120, tileOffset);
  LoadPalette(fp.pal, BG_PLTT_ID(2), PLTT_SIZE_4BPP);
}

export function DrawMainMenuWindowBorder(template: any, baseTileNum: number): void {
  const r9  = 1 + baseTileNum;
  const r10 = 2 + baseTileNum;
  const sp18 = 3 + baseTileNum;
  const spC  = 5 + baseTileNum;
  const sp10 = 6 + baseTileNum;
  const sp14 = 7 + baseTileNum;
  const r6   = 8 + baseTileNum;

  FillBgTilemapBufferRect(template.bg, baseTileNum, template.tilemapLeft - 1, template.tilemapTop - 1, 1, 1, 2);
  FillBgTilemapBufferRect(template.bg, r9,         template.tilemapLeft,     template.tilemapTop - 1, template.width, 1, 2);
  FillBgTilemapBufferRect(template.bg, r10,        template.tilemapLeft + template.width, template.tilemapTop - 1, 1, 1, 2);
  FillBgTilemapBufferRect(template.bg, sp18,       template.tilemapLeft - 1, template.tilemapTop, 1, template.height, 2);
  FillBgTilemapBufferRect(template.bg, spC,        template.tilemapLeft + template.width, template.tilemapTop, 1, template.height, 2);
  FillBgTilemapBufferRect(template.bg, sp10,       template.tilemapLeft - 1, template.tilemapTop + template.height, 1, 1, 2);
  FillBgTilemapBufferRect(template.bg, sp14,       template.tilemapLeft,     template.tilemapTop + template.height, template.width, 1, 2);
  FillBgTilemapBufferRect(template.bg, r6,         template.tilemapLeft + template.width, template.tilemapTop + template.height, 1, 1, 2);
  CopyBgTilemapBufferToVram(template.bg);
}

export function ClearMainMenuWindowTilemap(template: any): void {
  FillBgTilemapBufferRect(template.bg, 0, template.tilemapLeft - 1, template.tilemapTop - 1, template.tilemapLeft + template.width + 1, template.tilemapTop + template.height + 1, 2);
  CopyBgTilemapBufferToVram(template.bg);
}

// ─── InitMainMenu (manuel — pas dans le fichier auto-généré) ────────────────

export function InitMainMenu(returningFromOptionsMenu: boolean): void {
  const rt = getRuntime();
  if (!rt) return;

  // Reset GPU
  rt.SetGpuReg(0x000, 0); // DISPCNT
  rt.SetGpuReg(0x008, 0); // BG0CNT
  rt.SetGpuReg(0x00A, 0); // BG1CNT
  rt.SetGpuReg(0x00C, 0); // BG2CNT
  rt.SetGpuReg(0x010, 0); // BG0HOFS
  rt.SetGpuReg(0x012, 0); // BG0VOFS
  rt.SetGpuReg(0x014, 0); // BG1HOFS
  rt.SetGpuReg(0x016, 0); // BG1VOFS

  // Clear VRAM / OAM / PLTT (simplified)
  rt.gba.vram.fill(0);
  rt.gba.objVram.fill(0);
  rt.gba.palette.reset();
  for (let i = 0; i < 128; i++) rt.gba.oam[i].visible = false;

  // Reset systems
  ResetPaletteFade();
  ScanlineEffect_Stop();
  ResetTasks();
  rt.ResetSpriteData();
  FreeAllSpritePalettes();
  FreeAllWindowBuffers();

  // Load menu palettes
  const bgPal = getAsset('sMainMenuBgPal');
  const textPal = getAsset('sMainMenuTextPal');
  console.log('[InitMainMenu] sMainMenuBgPal cached?', !!bgPal, 'len', bgPal?.length ?? 0);
  console.log('[InitMainMenu] sMainMenuTextPal cached?', !!textPal, 'len', textPal?.length ?? 0);
  LoadPalette('sMainMenuBgPal', BG_PLTT_ID(0), PLTT_SIZE_4BPP);
  LoadPalette('sMainMenuTextPal', BG_PLTT_ID(15), PLTT_SIZE_4BPP);

  // Palette fade
  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 16, 0, returningFromOptionsMenu ? 'RGB_BLACK' : 'RGB_WHITEALPHA');

  // BG init
  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(0, sMainMenuBgTemplates as any, sMainMenuBgTemplates.length);
  ChangeBgX(0, 0, 0);
  ChangeBgY(0, 0, 0);
  ChangeBgX(1, 0, 0);
  ChangeBgY(1, 0, 0);

  // Windows
  InitWindows(sWindowTemplates_MainMenu as any);
  DeactivateAllTextPrinters();
  LoadMainMenuWindowFrameTiles(0, MAIN_MENU_BORDER_TILE);

  // WIN / BLEND regs
  rt.SetGpuReg(0x040, 0); // WIN0H
  rt.SetGpuReg(0x044, 0); // WIN0V
  rt.SetGpuReg(0x048, 0); // WININ
  rt.SetGpuReg(0x04A, 0); // WINOUT
  rt.SetGpuReg(0x050, 0); // BLDCNT
  rt.SetGpuReg(0x052, 0); // BLDALPHA
  rt.SetGpuReg(0x054, 0); // BLDY

  // Enable interrupts (stub)
  EnableInterrupts(1);

  // Set callbacks
  rt.SetVBlankCallback(VBlankCB_MainMenu);
  rt.SetMainCallback2(CB2_MainMenu);

  // DISPCNT
  rt.SetGpuReg(0x000, 0x100 | 0x200 | 0x2000 | 0x40 | 0x1000); // BG0_ON | BG1_ON | WIN0_ON | OBJ_1D_MAP | OBJ_ON
  ShowBg(0);
  HideBg(1);

  // Create check save file task
  rt.CreateTask((t) => Task_MainMenuCheckSaveFile(t, rt), 0);
}

export function VBlankCB_MainMenu(): void {
  // TODO: Transfer palette / OAM if needed
}

// ─── Save block + persistence (= localStorage proxy) ────────────────────────
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

// Synchronise les mutable exports sur globalThis pour les callbacks auto-générés.
const _mutableGlobalsMenu: Record<string, { get: () => unknown; set: (v: unknown) => void }> = {
  sCurrItemAndOptionMenuCheck: { get: () => sCurrItemAndOptionMenuCheck, set: (v) => { sCurrItemAndOptionMenuCheck = v as number; } },
  sBirchSpeechMainTaskId: { get: () => sBirchSpeechMainTaskId, set: (v) => { sBirchSpeechMainTaskId = v as number; } },
  sStartedPokeBallTask: { get: () => sStartedPokeBallTask, set: (v) => { sStartedPokeBallTask = v as boolean; } },
  gSaveFileStatus: { get: () => gSaveFileStatus, set: (v) => { gSaveFileStatus = v as number; } },
};
for (const [k, d] of Object.entries(_mutableGlobalsMenu)) {
  if (!(k in globalThis)) {
    Object.defineProperty(globalThis, k, { get: d.get, set: d.set, enumerable: true, configurable: true });
  }
}
