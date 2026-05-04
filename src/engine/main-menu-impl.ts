/**
 * main-menu-impl.ts
 * ------------------
 * Helpers 1:1 décomp `src/main_menu.c` qui complètent le state machine
 * auto-transpilé `main_menu-callbacks-auto.ts`. Toute l'architecture rendu
 * passe par notre engine GBA-style.
 *
 * Phase C audit session 83 : extrait depuis `gba-menu-system.ts` (= split
 * pour respecter la directive #1 "foundations unifiées + 1:1 décomp"). Le
 * fichier `gba-menu-system.ts` reste pour les helpers menu génériques
 * (Yes/No menu cursor input, gSaveBlock2Ptr proxy). Tout ce qui est
 * spécifique main_menu.c vit ici.
 *
 * Pattern analogue à `option-menu-impl.ts` (= 1 module impl par scene
 * importante). Évite d'avoir un mega-file gba-menu-system de 600 lignes
 * qui mélange genericité + scene-specific.
 *
 * Architecture :
 *   - InitMainMenu (= 1:1 décomp main_menu.c:558-615 statique)
 *   - HandleMainMenuInput / Task_HandleMainMenu* via auto file
 *   - HighlightSelectedMainMenuItem (= WIN0 cursor highlight)
 *   - LoadMainMenuWindowFrameTiles (= partagé avec option_menu via gba-text-window)
 *   - DrawMainMenuWindowBorder / ClearMainMenuWindowTilemap (= 1:1 décomp tilemap helpers)
 *   - NewGameBirchSpeech_* stubs (8 fonctions, à implémenter Phase D)
 *   - sBirch* templates (= placeholders extraits via main-menu-data Phase D)
 */
import { getRuntime, assetCache } from './decomp-globals';
import { GetWindowFrameTilesPal } from './gba-text-window';
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
  ResetPaletteFade,
  ScanlineEffect_Stop,
  ResetTasks,
  FreeAllSpritePalettes,
  EnableInterrupts,
  LoadBgTiles,
  PlaySE,
  DmaFill16, DmaFill32,
  VRAM, VRAM_SIZE, OAM, OAM_SIZE, PLTT, PLTT_SIZE,
} from './decomp-globals';
import {
  FillBgTilemapBufferRect,
  CopyBgTilemapBufferToVram,
} from './gba-window-system';
import {
  BG_PLTT_ID,
  REG_OFFSET_DISPCNT,
  REG_OFFSET_BG0CNT, REG_OFFSET_BG1CNT, REG_OFFSET_BG2CNT,
  REG_OFFSET_BG0HOFS, REG_OFFSET_BG0VOFS,
  REG_OFFSET_BG1HOFS, REG_OFFSET_BG1VOFS,
  REG_OFFSET_BG2HOFS, REG_OFFSET_BG2VOFS,
  REG_OFFSET_WIN0H, REG_OFFSET_WIN0V, REG_OFFSET_WININ, REG_OFFSET_WINOUT,
  REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDY,
  DISPCNT_WIN0_ON, DISPCNT_OBJ_ON, DISPCNT_OBJ_1D_MAP,
} from './decomp-runtime';
import { PLTT_SIZE_4BPP, WIN_RANGE } from './decomp-helpers';
import { sMainMenuBgTemplates, sWindowTemplates_MainMenu, sNewGameBirchSpeechTextWindows, MAIN_MENU_BORDER_TILE, ENUM_HAS_0 } from './decomp-data/main-menu-data';
import {
  Task_MainMenuCheckSaveFile,
  CB2_MainMenu,
  Task_HandleMainMenuAPressed,
  Task_HandleMainMenuBPressed,
  Task_NewGameBirchSpeech_FadeInTarget1OutTarget2,
  Task_NewGameBirchSpeech_FadeOutTarget1InTarget2,
  Task_NewGameBirchSpeech_FadePlatformIn,
  Task_NewGameBirchSpeech_FadePlatformOut,
} from './decomp-data/auto/src/main_menu-callbacks-auto';
import {
  A_BUTTON, B_BUTTON, DPAD_UP, DPAD_DOWN,
  IsWirelessAdapterConnected,
  CreateYesNoMenu,
  Menu_ProcessInputNoWrapClearOnChoose,
  InitMenuInUpperLeftCornerNormal,
  gSaveBlock2Ptr,
} from './gba-menu-system';
import { CreateWindowTemplate, FillWindowPixelBuffer, FillWindowPixelRect, PutWindowTilemap, CopyWindowToVram } from './gba-window-system';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import { getString } from './gba-strings';

// 1:1 décomp include/constants/songs.h:11 → SE_SELECT = 5.
const SE_SELECT = 5;
const HAS_MYSTERY_EVENTS = ENUM_HAS_0.HAS_MYSTERY_EVENTS;

// ─── Mutable globals utilisés par les auto callbacks ─────────────────────────

export let sCurrItemAndOptionMenuCheck = 0;
export let sBirchSpeechMainTaskId = 0;
export let sStartedPokeBallTask = false;

(globalThis as Record<string, unknown>).sCurrItemAndOptionMenuCheck = sCurrItemAndOptionMenuCheck;
(globalThis as Record<string, unknown>).sBirchSpeechMainTaskId = sBirchSpeechMainTaskId;
(globalThis as Record<string, unknown>).sStartedPokeBallTask = sStartedPokeBallTask;

// ─── Birch speech templates / palette placeholders ──────────────────────────
//
// ⚠️ PHASE D PLACEHOLDERS — à remplacer lors implémentation Birch flow.
//
// Source décomp : `src/main_menu.c` data-section :
//   - sScrollArrowsTemplate_MainMenu (= ScrollArrowParams struct)
//   - sBirchBgTemplate (= BgTemplate struct, BG3 charBase/mapBase pour BG Birch)
//   - sBirchSpeechBgPals / sBirchSpeechBgGradientPal[3] (= palettes)
//   - sBirchSpeechPlatformBlackPal (= palette 11-frame fade transition)
//   - sBirchSpeechBgMap (= LZ77 compressed BG tilemap, à charger via LZ77UnCompVram)
//   - sSpriteAffineAnimTable_PlayerShrink (= affine anim table, player shrink fx)
//
// TODO Phase D : étendre `scripts/extract-main-menu-data.mjs` (à créer) pour
// parser ces structs depuis le décomp + générer dans `decomp-data/auto/src/main_menu-data.ts`.
//
// Pour l'instant : valeurs string-symbol (= matchent le getAsset() pattern) ou
// zero-init structs. Le code Birch ne sera jamais déclenché tant qu'on n'a
// pas implémenté Task_NewGameBirchSpeech_*, donc ces placeholders ne crashent
// pas le boot mais signalent clairement leur statut.

export const sScrollArrowsTemplate_MainMenu = {
  firstArrowType: 0, firstX: 0, firstY: 0, secondArrowType: 1, secondX: 0, secondY: 0,
  fullyOutOfBoundsValue: 0, tileTag: 0, palTag: 0, palNum: 0,
};
(globalThis as Record<string, unknown>).sScrollArrowsTemplate_MainMenu = sScrollArrowsTemplate_MainMenu;

/** 1:1 décomp main_menu.c:451 sSpriteAffineAnimTable_PlayerShrink — string-symbol
 *  pour lookup dans `SPRITE_AFFINE_ANIM_TABLES` (= auto-data sprite-system.ts:469).
 *  Cette table contient `sSpriteAffineAnim_PlayerShrink` (= 1 frame xScale=-2,
 *  yScale=-2, rotation=0, duration=48 → player shrink sur 48 frames). */
export const sSpriteAffineAnimTable_PlayerShrink = 'sSpriteAffineAnimTable_PlayerShrink';
(globalThis as Record<string, unknown>).sSpriteAffineAnimTable_PlayerShrink = sSpriteAffineAnimTable_PlayerShrink;

// 1:1 décomp main_menu.c sBirchBgTemplate — BG3 256-color, charBase=3, mapBase=30,
// priority=0 (= au fond derrière BG0/BG1/BG2). Valeurs réelles depuis décomp.
export const sBirchBgTemplate = {
  bg: 0,
  charBaseIndex: 3,
  mapBaseIndex: 30,
  screenSize: 0,
  paletteMode: 0,
  priority: 0,
  baseTile: 0,
};
(globalThis as Record<string, unknown>).sBirchBgTemplate = sBirchBgTemplate;

// Asset symbol-name strings (= keys vers assetCache, à fetcher avant Phase D Birch).
export const sBirchSpeechShadowGfx = 'sBirchSpeechShadowGfx';
(globalThis as Record<string, unknown>).sBirchSpeechShadowGfx = sBirchSpeechShadowGfx;
export const sBirchSpeechBgMap = 'sBirchSpeechBgMap';
(globalThis as Record<string, unknown>).sBirchSpeechBgMap = sBirchSpeechBgMap;
export const sBirchSpeechBgPals = 'sBirchSpeechBgPals';
(globalThis as Record<string, unknown>).sBirchSpeechBgPals = sBirchSpeechBgPals;
export const sBirchSpeechPlatformBlackPal = 'sBirchSpeechPlatformBlackPal';
(globalThis as Record<string, unknown>).sBirchSpeechPlatformBlackPal = sBirchSpeechPlatformBlackPal;
// 1:1 décomp main_menu.c:257 sBirchSpeechBgGradientPal — single u16 buffer
// (= bg2.pal preloaded comme Uint16Array via preloadBirchSpeechAssets).
// Le décomp accède via pointer arithmetic `sBirchSpeechBgGradientPal[i]` qui
// est en fait `arr + i` (= sub-buffer à partir de l'offset i).
//
// Le auto file `Task_NewGameBirchSpeech_FadePlatformIn` fait
// `LoadPalette(sBirchSpeechBgGradientPal[task.data[1]], BG_PLTT_ID(0) + 1, PLTT_SIZEOF(8))`
// = load 8 colors à partir de l'offset task.data[1] (0..8). On utilise un Proxy
// qui retourne subarray(i, i+8) du Uint16Array cached.
export const sBirchSpeechBgGradientPal = new Proxy({} as Record<number, Uint16Array>, {
  get(_target, prop) {
    const idx = Number(prop);
    if (Number.isInteger(idx) && idx >= 0) {
      const cached = assetCache.get('sBirchSpeechBgGradientPal');
      if (cached instanceof Uint16Array) {
        return cached.subarray(idx, idx + 8);
      }
      return new Uint16Array(8);  // fallback empty (= asset pas chargé yet).
    }
    return undefined;
  },
});
(globalThis as Record<string, unknown>).sBirchSpeechBgGradientPal = sBirchSpeechBgGradientPal;

// ─── Main Menu Frame Tiles (= partagé avec option_menu via gba-text-window) ──

/** 1:1 décomp src/main_menu.c:2195 LoadMainMenuWindowFrameTiles :
 *    LoadBgTiles(bgId, GetWindowFrameTilesPal(...)->tiles, 0x120, tileOffset);
 *    LoadPalette(GetWindowFrameTilesPal(...)->pal, BG_PLTT_ID(2), PLTT_SIZE_4BPP);
 *
 *  Frame style = `gSaveBlock2Ptr->optionsWindowFrameType` (= 0-19). Asset
 *  préchargés par `preloadTextWindowFrames()` (cf. gba-text-window.ts). */
export function LoadMainMenuWindowFrameTiles(bgId: number, tileOffset: number): void {
  const fp = GetWindowFrameTilesPal(gSaveBlock2Ptr.optionsWindowFrameType ?? 0);
  LoadBgTiles(bgId, fp.tiles, 0x120, tileOffset);
  LoadPalette(fp.pal, BG_PLTT_ID(2), PLTT_SIZE_4BPP);
}

// ─── Tilemap helpers ─────────────────────────────────────────────────────────

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

// ─── HandleMainMenuInput (= 1:1 décomp main_menu.c:885-929) ─────────────────

export function HandleMainMenuInput(taskId: number): boolean {
  const rt = getRuntime();
  if (!rt) return false;
  const newKeys = rt.gMain.newKeys ?? 0;
  const task = rt.gTasks.get(taskId);
  if (!task) return false;
  const data = task.data;
  if (newKeys & A_BUTTON) {
    PlaySE(SE_SELECT);
    // 1:1 décomp main_menu.c:892 — debug call (= IsWirelessAdapterConnected
    // checked here même si Task_HandleMainMenuAPressed re-check ; le décomp
    // commente "why bother calling this here? debug?"). Phase C audit session 83.
    IsWirelessAdapterConnected();
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
    sCurrItemAndOptionMenuCheck = data[1];
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
    sCurrItemAndOptionMenuCheck = data[1];
    (globalThis as any).sCurrItemAndOptionMenuCheck = data[1];
    return true;
  }
  return false;
}

// ─── HighlightSelectedMainMenuItem (= WIN0 cursor highlight) ────────────────

export function HighlightSelectedMainMenuItem(
  menuType: number,
  cursorPos: number,
  isScrolled: boolean,
): void {
  const rt = getRuntime();
  if (!rt) return;

  const winH = WIN_RANGE(9, 231);
  rt.SetGpuReg(REG_OFFSET_WIN0H, winH);

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
    case 0:
    default:
      winV = vCoords[cursorPos] ?? vCoords[0];
      break;
    case 1:
      winV = vCoords[cursorPos + 2] ?? vCoords[2];
      break;
    case 2:
      winV = vCoords[cursorPos + 2] ?? vCoords[2];
      break;
    case 3:
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

// ─── Misc main menu stubs ────────────────────────────────────────────────────

export function MainMenu_FormatSavegameText(): void {
  // TODO Phase D : formater le texte de la sauvegarde (player name, badges, play time)
}

/** 1:1 décomp main_menu.c:2121-2130 CreateMainMenuErrorWindow.
 *  Affiche une fenêtre d'erreur (= save corrupt, battery dry, etc.) dans
 *  window 7 avec WIN0 visible. */
export function CreateMainMenuErrorWindow(text: string): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp : window 7 (= dernier window de sWindowTemplates_MainMenu).
  FillWindowPixelBuffer(7, 0x11);  // PIXEL_FILL(1) = bg blanc
  // Print text via FONT_NORMAL avec colorArray standard
  AddTextPrinterParameterized3(7, 1, 0, 1, [1, 2, 3], 0, text);
  PutWindowTilemap(7);
  CopyWindowToVram(7, 2);  // COPYWIN_GFX
  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[7], MAIN_MENU_BORDER_TILE);
  // 1:1 décomp : SetGpuReg WIN0H/WIN0V pour révéler la zone error window
  rt.SetGpuReg(0x040, (9 << 8) | (240 - 9));   // WIN0H = WIN_RANGE(9, DISPLAY_WIDTH - 9)
  rt.SetGpuReg(0x044, (113 << 8) | (160 - 1));  // WIN0V = WIN_RANGE(113, DISPLAY_HEIGHT - 1)
}

// ─── Birch Speech helpers stubs (Phase D — à implémenter pour Birch flow) ────

/** 1:1 décomp main_menu.c:2242 NewGameBirchSpeech_ClearWindow.
 *  FillWindowPixelRect(windowId, bgColor, 0, 0, maxCharWidth * winWidth, maxCharHeight * winHeight)
 *  + CopyWindowToVram. Phase E Step 4 fix : real impl pour clear le window
 *  entre 2 pages de dialogue (= sinon le texte précédent reste visible). */
export function NewGameBirchSpeech_ClearWindow(windowId: number): void {
  // bgColor = 1 (= PIXEL_FILL(1) match ShowDialogueWindow). maxCharWidth = 8,
  // maxCharHeight = 16 pour FONT_NORMAL standard.
  // Window 0 dimension : 27x4 tiles = 216x32 pixels (cf. sNewGameBirchSpeechTextWindows[0]).
  // On fill avec bgColor=1 toute la zone.
  FillWindowPixelRect(windowId, 1, 0, 0, 216, 32);
  CopyWindowToVram(windowId, 2);  // COPYWIN_GFX = 2
}

/** 1:1 décomp main_menu.c:2271 NewGameBirchSpeech_ShowDialogueWindow.
 *    CallWindowFunction(NewGameBirchSpeech_CreateDialogueWindowBorder);
 *    FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
 *    PutWindowTilemap(windowId);
 *    if (copyToVram) CopyWindowToVram(windowId, COPYWIN_FULL);
 *
 *  Phase E Step 4 fix : real impl. MVP : skip le custom dialogue border (= 9
 *  tiles décoratifs spécifiques Birch via NewGameBirchSpeech_CreateDialogueWindowBorder),
 *  juste fill le window pixel buffer en blanc + put tilemap + copy.
 *  TODO Phase E.2 : draw le custom dialogue border 1:1 décomp main_menu.c:2280-2294. */
export function NewGameBirchSpeech_ShowDialogueWindow(windowId: number, copyToVram: boolean): void {
  // Fill avec PIXEL_FILL(1) = idx 1 dans 2 nibbles = 0x11.
  FillWindowPixelBuffer(windowId, 0x11);
  PutWindowTilemap(windowId);
  if (copyToVram) {
    CopyWindowToVram(windowId, 3);  // COPYWIN_FULL = 3
  }
}

/** 1:1 décomp main_menu.c:2233-2240 NewGameBirchSpeech_ClearGenderWindow.
 *  Clear le window pixel buffer + tilemap (= dispose le menu OUI/NON gender). */
export function NewGameBirchSpeech_ClearGenderWindow(windowId: number, copyToVram: boolean): void {
  // 1:1 décomp : FillWindowPixelBuffer(windowId, PIXEL_FILL(0)) + ClearWindowTilemap.
  FillWindowPixelBuffer(windowId, 0x00);  // PIXEL_FILL(0) = transparent.
  // Note : décomp call CallWindowFunction(ClearStdWindowAndFrameToTransparent) avant
  // qui dessine le 0-tile sur tout le frame. Notre runtime efface le pixel buffer
  // (= pixels transparent), suffit pour MVP.
  if (copyToVram) {
    CopyWindowToVram(windowId, 2);  // COPYWIN_GFX
  }
}

/** 1:1 décomp main_menu.c:2092 NewGameBirchSpeech_ShowGenderMenu.
 *  Affiche dans le window 1 (= sNewGameBirchSpeechTextWindows[1]) le menu
 *  "GARÇON / FILLE" via TextPrinter + InitMenu cursor.
 *  Phase E Step 5 audit session 84 : real impl. */
export function NewGameBirchSpeech_ShowGenderMenu(): void {
  // 1:1 décomp ligne 2094 — DrawMainMenuWindowBorder(sNewGameBirchSpeechTextWindows[1], 0xF3)
  DrawMainMenuWindowBorder(sNewGameBirchSpeechTextWindows[1], 0xF3);
  // 1:1 décomp ligne 2095 — FillWindowPixelBuffer(1, PIXEL_FILL(1))
  FillWindowPixelBuffer(1, 0x11);  // PIXEL_FILL(1)
  // 1:1 décomp ligne 2096 — PrintMenuTable(1, ARRAY_COUNT(sMenuActions_Gender), sMenuActions_Gender)
  // sMenuActions_Gender = [{name: gText_BirchBoy}, {name: gText_BirchGirl}].
  // Notre version utilise AddTextPrinterParameterized3 directement sur "GARÇON\nFILLE".
  const boy = getString('gText_BirchBoy');    // "GARÇON"
  const girl = getString('gText_BirchGirl');  // "FILLE"
  AddTextPrinterParameterized3(
    1,  // windowId = 1
    1,  // FONT_NORMAL
    8, 1,  // x, y depuis bord du window
    [1, 2, 3],  // [bgColor, fgColor, shadowColor]
    255,  // TEXT_SKIP_DRAW
    `${boy}\n${girl}`,
  );
  // 1:1 décomp ligne 2097 — InitMenuInUpperLeftCornerNormal(1, 2, 0)
  InitMenuInUpperLeftCornerNormal(1, 2, 0);
  // 1:1 décomp ligne 2098-2099
  PutWindowTilemap(1);
  CopyWindowToVram(1, 3);  // COPYWIN_FULL = 3
}

/** 1:1 décomp main_menu.c:2102 NewGameBirchSpeech_ProcessGenderMenuInput.
 *  Retourne 0=GARÇON, 1=FILLE, -1=B pressed (cancel). */
export function NewGameBirchSpeech_ProcessGenderMenuInput(): number {
  // 1:1 décomp ligne 2104 — return Menu_ProcessInputNoWrap().
  // Notre helper Menu_ProcessInputNoWrapClearOnChoose retourne :
  //  - menuCursorPos (0/1) si A_BUTTON
  //  - -1 si B_BUTTON
  //  - -2 si still processing (≠ décomp qui retourne MENU_NOTHING_CHOSEN=-2 pareil)
  return Menu_ProcessInputNoWrapClearOnChoose();
}

// 1:1 décomp main_menu.c:461-505 sMalePresetNames / sFemalePresetNames.
// 20 noms preset par genre. Symbol-name lookup via gText_DefaultNameX strings.
const sMalePresetNames = [
  'gText_DefaultNameStu', 'gText_DefaultNameMilton', 'gText_DefaultNameTom',
  'gText_DefaultNameKenny', 'gText_DefaultNameReid', 'gText_DefaultNameJude',
  'gText_DefaultNameJaxson', 'gText_DefaultNameEaston', 'gText_DefaultNameWalker',
  'gText_DefaultNameTeru', 'gText_DefaultNameJohnny', 'gText_DefaultNameBrett',
  'gText_DefaultNameSeth', 'gText_DefaultNameTerry', 'gText_DefaultNameCasey',
  'gText_DefaultNameDarren', 'gText_DefaultNameLandon', 'gText_DefaultNameCollin',
  'gText_DefaultNameStanley', 'gText_DefaultNameQuincy',
];
const sFemalePresetNames = [
  'gText_DefaultNameKimmy', 'gText_DefaultNameTiara', 'gText_DefaultNameBella',
  'gText_DefaultNameJayla', 'gText_DefaultNameAllie', 'gText_DefaultNameLianna',
  'gText_DefaultNameSara', 'gText_DefaultNameMonica', 'gText_DefaultNameCamila',
  'gText_DefaultNameAubree', 'gText_DefaultNameRuthie', 'gText_DefaultNameHazel',
  'gText_DefaultNameNadine', 'gText_DefaultNameTanja', 'gText_DefaultNameYasmin',
  'gText_DefaultNameNicola', 'gText_DefaultNameLillie', 'gText_DefaultNameTerra',
  'gText_DefaultNameLucy', 'gText_DefaultNameHalie',
];

/** 1:1 décomp main_menu.c:2107 NewGameBirchSpeech_SetDefaultPlayerName(nameId).
 *  Set gSaveBlock2Ptr.playerName depuis sMalePresetNames[nameId] ou
 *  sFemalePresetNames[nameId] selon le gender.
 *  Phase E Step 5 : real impl. */
export function NewGameBirchSpeech_SetDefaultPlayerName(nameId: number): void {
  const MALE = 0;
  const presetSymbol = gSaveBlock2Ptr.playerGender === MALE
    ? sMalePresetNames[nameId % 20]
    : sFemalePresetNames[nameId % 20];
  const name = getString(presetSymbol);
  gSaveBlock2Ptr.playerName = name;
}

export function NewGameBirchSpeech_CreateNameYesNo(_windowId: number): void {
  // TODO Phase D : créer le menu Yes/No pour le nom.
}

/** 1:1 décomp `main_menu.c:2265 CreateYesNoMenuParameterized(x, y, baseTileNum,
 *  baseBlock, yesNoPalNum, winPalNum)`. Wrapper qui crée un WindowTemplate
 *  (5×4 cells, BG0, position x+1/y+1) puis appelle CreateYesNoMenu.
 *  Phase E Step 1 audit session 84 (= real impl). */
export function CreateYesNoMenuParameterized(
  x: number,
  y: number,
  baseTileNum: number,
  baseBlock: number,
  yesNoPalNum: number,
  winPalNum: number,
): void {
  // 1:1 décomp main_menu.c:2267 — bg=0, x+1, y+1, width=5, height=4.
  const template = CreateWindowTemplate(0, x + 1, y + 1, 5, 4, winPalNum, baseBlock);
  // 1:1 décomp main_menu.c:2268 — initialCursorPos=0 (= OUI sélectionné par défaut).
  CreateYesNoMenu(template, baseTileNum, yesNoPalNum, 0);
}

// Phase D-cleanup audit session 83 : stubs déplacés depuis decomp-globals.ts
// (= ils étaient hors-scope là-bas car scene-Birch-specific). Tous /* TODO */
// stubs en attendant Phase D Birch implementation.

/** 1:1 décomp main_menu.c AddBirchSpeechObjects — créé Birch sprite + Lotad
 *  + player (boy + girl) + platform sprites. Phase E partial : assigne des
 *  spriteId invisibles aux task.data[8..11] pour que les Tasks suivantes
 *  (WaitToShowBirch etc.) ne crashent pas sur `_gs(rt, spriteId).x = X`.
 *
 *  TODO Phase E.2 : 1:1 décomp full impl quand les sBirch* assets seront
 *  extraits + LoadCompressedSpriteSheet sBirchSpeechBirchSpriteTemplate. */
export function AddBirchSpeechObjects(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const task = rt.gTasks.get(taskId);
  if (!task) return;
  // Crée 4 sprites invisibles pour Birch / Lotad / boy player / girl player.
  // Le décomp utilise CreateSprite avec sBirchSpeechObjectTemplate qui a un
  // shape/size particulier, mais notre stub évite juste les crash en assignant
  // des slots OAM valides.
  const birchId = rt.CreateSpriteAtOam({
    tileId: 0, paletteBank: 0, x: 0, y: 0,
    shape: 0, size: 0, priority: 0,
  }).spriteId;
  rt.gSprites.get(birchId)!.invisible = true;
  task.data[8] = birchId;   // Birch sprite
  task.data[9] = birchId;   // Lotad (= dummy même sprite)
  task.data[10] = birchId;  // Boy player
  task.data[11] = birchId;  // Girl player
}

// ─── Birch fade animations (= 1:1 décomp main_menu.c:1988-2084) ─────────────
//
// Pattern : chaque StartFade* fait 2 choses :
//   1. Setup hardware BLDCNT/BLDALPHA/BLDY pour le blend mode désiré
//   2. Crée une SOUS-TASK qui anime BLDALPHA progressivement frame-par-frame.
//      Quand l'animation termine, la sous-task set `_gt(rt, mainTaskId).data[5] = true`
//      (= tIsDoneFadingSprites macro) ce qui débloque la Task main Birch.
//
// Layout sub-Task data :
//   data[0] = mainTaskId (= taskId de la Task Birch principale)
//   data[1] = alphaCoeff1 (= eva BLDALPHA, target1 blend coeff 0-16)
//   data[2] = alphaCoeff2 OU tDelayBefore selon le fade
//   data[3] = tDelay (= frames entre 2 steps d'animation)
//   data[4] = tDelayTimer (= compte à rebours, reset à tDelay à chaque step)

/** 1:1 décomp main_menu.c:1988-2002 NewGameBirchSpeech_StartFadeInTarget1OutTarget2.
 *  Cross-fade BG1 (Birch) ↔ OBJ (player) via BLDCNT/BLDALPHA. */
export function NewGameBirchSpeech_StartFadeInTarget1OutTarget2(taskId: number, delay: number): void {
  const rt = getRuntime();
  if (!rt) return;
  // BLDCNT = BLDCNT_TGT2_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT1_OBJ = 0x0250.
  rt.SetGpuReg(0x050, 0x0250);
  // BLDALPHA_BLEND(0, 16) = eva=0 + evb=16 (= start full target2 blend).
  rt.SetGpuReg(0x052, (0 << 0) | (16 << 8));
  rt.SetGpuReg(0x054, 0);
  const mainTask = rt.gTasks.get(taskId);
  if (mainTask) mainTask.data[5] = 0;  // tIsDoneFadingSprites = 0 (animation en cours).
  const subTaskId = rt.CreateTask((t) => Task_NewGameBirchSpeech_FadeInTarget1OutTarget2(t, rt), 0);
  const subTask = rt.gTasks.get(subTaskId);
  if (subTask) {
    subTask.data[0] = taskId;     // tMainTask
    subTask.data[1] = 0;           // tAlphaCoeff1 (eva)
    subTask.data[2] = 16;          // tAlphaCoeff2 (evb)
    subTask.data[3] = delay;       // tDelay
    subTask.data[4] = delay;       // tDelayTimer
  }
}

/** 1:1 décomp main_menu.c:2014-2027 NewGameBirchSpeech_StartFadeOutTarget1InTarget2.
 *  Inverse cross-fade : OBJ (player) ↔ BG1 (Birch). */
export function NewGameBirchSpeech_StartFadeOutTarget1InTarget2(taskId: number, delay: number): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.SetGpuReg(0x050, 0x0250);  // Same BLDCNT
  rt.SetGpuReg(0x052, (16 << 0) | (0 << 8));  // BLDALPHA_BLEND(16, 0) = eva=16, evb=0 (= start full target1).
  rt.SetGpuReg(0x054, 0);
  const mainTask = rt.gTasks.get(taskId);
  if (mainTask) mainTask.data[5] = 0;
  const subTaskId = rt.CreateTask((t) => Task_NewGameBirchSpeech_FadeOutTarget1InTarget2(t, rt), 0);
  const subTask = rt.gTasks.get(subTaskId);
  if (subTask) {
    subTask.data[0] = taskId;
    subTask.data[1] = 16;          // tAlphaCoeff1 (eva start)
    subTask.data[2] = 0;            // tAlphaCoeff2 (evb start)
    subTask.data[3] = delay;
    subTask.data[4] = delay;
  }
}

/** 1:1 décomp main_menu.c:2040-2050 NewGameBirchSpeech_StartFadePlatformIn.
 *  Anime sBirchSpeechBgGradientPal[0..7] vers full visible (= platform apparaît).
 *  data[1] = palIndex 0..8, data[2] = tDelayBefore=8 (= attente avant anim). */
export function NewGameBirchSpeech_StartFadePlatformIn(taskId: number, delay: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const subTaskId = rt.CreateTask((t) => Task_NewGameBirchSpeech_FadePlatformIn(t, rt), 0);
  const subTask = rt.gTasks.get(subTaskId);
  if (subTask) {
    subTask.data[0] = taskId;
    subTask.data[1] = 0;            // tPalIndex (= 1:1 décomp main_menu.c:2046)
    subTask.data[2] = 8;            // tDelayBefore
    subTask.data[3] = delay;
    subTask.data[4] = delay;
  }
}

/** 1:1 décomp main_menu.c:2074-2084 NewGameBirchSpeech_StartFadePlatformOut.
 *  Anime sBirchSpeechBgGradientPal[8..0] vers black (= platform disparaît).
 *  data[1] = palIndex 8 (= start), data[2] = tDelayBefore=8. */
export function NewGameBirchSpeech_StartFadePlatformOut(taskId: number, delay: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const subTaskId = rt.CreateTask((t) => Task_NewGameBirchSpeech_FadePlatformOut(t, rt), 0);
  const subTask = rt.gTasks.get(subTaskId);
  if (subTask) {
    subTask.data[0] = taskId;
    subTask.data[1] = 8;            // tPalIndex (= start at 8, descend vers 0)
    subTask.data[2] = 8;            // tDelayBefore
    subTask.data[3] = delay;
    subTask.data[4] = delay;
  }
}

/** 1:1 décomp main_menu.c NewGameBirchSpeech_WaitForThisIsPokemonText —
 *  callback called by AddTextPrinterWithCallbackForMessage on each char rendered.
 *  Le décomp avance la sBirchSpeechMainTaskId Task quand `lastByte` indique fin de
 *  page (CHAR_PROMPT_CLEAR/SCROLL ou EOS). Phase E MVP : no-op (= la Task
 *  parente avancera via le check `IsTextPrinterActive(0) === false`). */
export function NewGameBirchSpeech_WaitForThisIsPokemonText(_printer: unknown, _lastByte: number): void {
  // TODO Phase E.2 : real impl 1:1 décomp si necessaire.
}

(globalThis as Record<string, unknown>).NewGameBirchSpeech_WaitForThisIsPokemonText = NewGameBirchSpeech_WaitForThisIsPokemonText;

/** 1:1 décomp `naming_screen.c DoNamingScreen(type, dest, gender, monSpecies, monPersonality, callback)`.
 *  Phase E Step 7 MVP : skip la naming scene complète (= 1:1 décomp future, gros
 *  scope avec ~10 Tasks dans src/naming_screen.c). À la place, set un default
 *  name aléatoire selon gender (= NewGameBirchSpeech_SetDefaultPlayerName(0))
 *  et call le callback directement pour reprendre le flow Birch.
 *
 *  TODO Phase E.6 : transpiler `src/naming_screen.c` en 1:1 décomp (= permet au
 *  joueur de saisir son nom via un keyboard on-screen 1:1 ROM). */
export function DoNamingScreen(
  type: number,
  _dest: unknown,
  gender: number,
  _monSpecies: number,
  _monPersonality: number,
  callback: () => void,
): void {
  void type;  // NAMING_SCREEN_PLAYER = 0, NAMING_SCREEN_BOX = 1, NAMING_SCREEN_NICKNAME = 2.
  const rt = getRuntime();
  if (!rt) return;
  // MVP : force gender (= déjà set via gSaveBlock2Ptr.playerGender) puis pick
  // sMalePresetNames[0] = "STEF" / sFemalePresetNames[0] = "AGNES".
  const MALE = 0;
  gSaveBlock2Ptr.playerGender = gender;
  const presetSymbol = gender === MALE ? sMalePresetNames[0] : sFemalePresetNames[0];
  gSaveBlock2Ptr.playerName = getString(presetSymbol);
  console.warn(`[main-menu-impl] DoNamingScreen MVP : default name "${gSaveBlock2Ptr.playerName}" (TODO Phase E.6 = real naming screen).`);
  // Call le callback immédiatement (= simulate retour de la naming scene).
  // Pour main_menu : callback = CB2_NewGameBirchSpeech_ReturnFromNamingScreen.
  rt.SetMainCallback2(callback as any);
}

// ─── Sprite helpers (= bridges vers DestroySprite) ──────────────────────────

export function FreeAndDestroyMonPicSprite(_spriteId: number): void {
  const rt = getRuntime();
  if (rt) rt.DestroySprite(_spriteId);
}

export function ResetAllPicSprites(): void {
  // no-op — notre runtime gère les sprites différemment.
}

// ─── Scroll indicator stubs (= Phase D Birch flow) ──────────────────────────

export function AddScrollIndicatorArrowPair(_params: unknown, _taskFunc: unknown): number {
  // TODO Phase D : créer la paire de flèches scroll arrow.
  return 0;
}

export function RemoveScrollIndicatorArrowPair(_taskId: number): void {
  // no-op stub.
}

export function Task_ScrollIndicatorArrowPairOnMainMenu(_task: unknown, _rt: unknown): void {
  // no-op stub.
}

// ─── InitMainMenu — 1:1 décomp src/main_menu.c:558-615 ─────────────────────

/** 1:1 décomp main_menu.c:558 InitMainMenu(bool8 returningFromOptionsMenu).
 *  Phase A audit session 83 : foundations unifiées (REG_OFFSET_*, DISPCNT_*,
 *  DmaFill16/32). Phase C audit session 83 : extracted vers ce module dédié. */
export function InitMainMenu(returningFromOptionsMenu: boolean): void {
  const rt = getRuntime();
  if (!rt) return;

  // 1:1 décomp main_menu.c:560 — désactive VBlankCB pendant init pour pas
  // de TransferPlttBuffer pendant les manipulations PLTT/VRAM (= anti-flash).
  rt.SetVBlankCallback(null);

  rt.SetGpuReg(REG_OFFSET_DISPCNT, 0);
  rt.SetGpuReg(REG_OFFSET_BG2CNT, 0);
  rt.SetGpuReg(REG_OFFSET_BG1CNT, 0);
  rt.SetGpuReg(REG_OFFSET_BG0CNT, 0);
  rt.SetGpuReg(REG_OFFSET_BG2HOFS, 0);
  rt.SetGpuReg(REG_OFFSET_BG2VOFS, 0);
  rt.SetGpuReg(REG_OFFSET_BG1HOFS, 0);
  rt.SetGpuReg(REG_OFFSET_BG1VOFS, 0);
  rt.SetGpuReg(REG_OFFSET_BG0HOFS, 0);
  rt.SetGpuReg(REG_OFFSET_BG0VOFS, 0);

  // 1:1 décomp main_menu.c:573-575 — VRAM/OAM/PLTT clear via DMA.
  // Notre DmaFill16/32 sont no-op (= préserve LZ77 char data déjà chargé).
  // Les buffers OAM/PLTT sont reset par ResetSpriteData/ResetPaletteFade ci-dessous.
  DmaFill16(3, 0, VRAM, VRAM_SIZE);
  DmaFill32(3, 0, OAM, OAM_SIZE);
  DmaFill16(3, 0, PLTT + 2, PLTT_SIZE - 2);

  ResetPaletteFade();
  // 1:1 décomp main_menu.c:578-579 — Load menu palettes AVANT le fade pour
  // que les couleurs soient dans gPlttBufferUnfaded au moment où le fade
  // commence. (`getAsset()` lookup pour confirmer que les assets sont chargés
  // est implicite via `LoadPalette` qui no-op si symbol non-cache.)
  LoadPalette('sMainMenuBgPal', BG_PLTT_ID(0), PLTT_SIZE_4BPP);
  LoadPalette('sMainMenuTextPal', BG_PLTT_ID(15), PLTT_SIZE_4BPP);
  ScanlineEffect_Stop();
  ResetTasks();
  rt.ResetSpriteData();
  FreeAllSpritePalettes();
  // 1:1 décomp main_menu.c:585-587 — fade IN (startY=0x10 → endY=0).
  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0x10, 0,
    returningFromOptionsMenu ? 'RGB_BLACK' : 'RGB_WHITEALPHA');
  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(0, sMainMenuBgTemplates as any, sMainMenuBgTemplates.length);
  ChangeBgX(0, 0, 0);
  ChangeBgY(0, 0, 0);
  ChangeBgX(1, 0, 0);
  ChangeBgY(1, 0, 0);

  InitWindows(sWindowTemplates_MainMenu as any);
  DeactivateAllTextPrinters();
  LoadMainMenuWindowFrameTiles(0, MAIN_MENU_BORDER_TILE);

  rt.SetGpuReg(REG_OFFSET_WIN0H, 0);
  rt.SetGpuReg(REG_OFFSET_WIN0V, 0);
  rt.SetGpuReg(REG_OFFSET_WININ, 0);
  rt.SetGpuReg(REG_OFFSET_WINOUT, 0);
  rt.SetGpuReg(REG_OFFSET_BLDCNT, 0);
  rt.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
  rt.SetGpuReg(REG_OFFSET_BLDY, 0);

  EnableInterrupts(1);
  rt.SetVBlankCallback(VBlankCB_MainMenu);
  rt.SetMainCallback2(CB2_MainMenu);
  // 1:1 décomp main_menu.c:609 — DISPCNT_WIN0_ON | DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP.
  // (BG0/BG1 sont activés implicitement par ShowBg(0)/HideBg(1) ci-dessous.)
  rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON | DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
  ShowBg(0);
  HideBg(1);
  rt.CreateTask((t) => Task_MainMenuCheckSaveFile(t, rt), 0);
}

export function VBlankCB_MainMenu(): void {
  // 1:1 décomp main_menu.c:VBlankCB_MainMenu — notre runtime drive
  // TransferPlttBuffer auto si vblankCallback non-null. La présence de cette
  // fonction (= non-null) suffit à activer le transfer dans runOneFrame.
}

// ─── Globals exposure pour auto callbacks (= eval scope @ts-nocheck) ────────

(globalThis as Record<string, unknown>).InitMainMenu = InitMainMenu;
(globalThis as Record<string, unknown>).VBlankCB_MainMenu = VBlankCB_MainMenu;
(globalThis as Record<string, unknown>).HandleMainMenuInput = HandleMainMenuInput;
(globalThis as Record<string, unknown>).HighlightSelectedMainMenuItem = HighlightSelectedMainMenuItem;
(globalThis as Record<string, unknown>).LoadMainMenuWindowFrameTiles = LoadMainMenuWindowFrameTiles;

// Synchronise les mutable exports sur globalThis pour les callbacks auto-générés.
const _mutableGlobalsMain: Record<string, { get: () => unknown; set: (v: unknown) => void }> = {
  sCurrItemAndOptionMenuCheck: { get: () => sCurrItemAndOptionMenuCheck, set: (v) => { sCurrItemAndOptionMenuCheck = v as number; } },
  sBirchSpeechMainTaskId: { get: () => sBirchSpeechMainTaskId, set: (v) => { sBirchSpeechMainTaskId = v as number; } },
  sStartedPokeBallTask: { get: () => sStartedPokeBallTask, set: (v) => { sStartedPokeBallTask = v as boolean; } },
};
for (const [k, d] of Object.entries(_mutableGlobalsMain)) {
  if (!(k in globalThis)) {
    Object.defineProperty(globalThis, k, { get: d.get, set: d.set, enumerable: true, configurable: true });
  }
}
