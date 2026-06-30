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
 *   - sBirch* templates (= placeholders Birch, à porter 1:1 Phase D)
 */
import { getRuntime, assetCache } from '../harness/runtime/decomp-globals';
import { IndexOfSpritePaletteTag, GetSpriteTileStartByTag, ResetSpriteData, DestroySprite, AllocOamMatrix, FreeOamMatrix } from './sprite';
import { registerAffineAnim, registerAffineAnimTable } from './engine/decomp-impls/sprite-affine-extras';
import { SetPlayerName, GetPlayerNameString } from '../include/text';
import { GetWindowFrameTilesPal } from './text_window';
import { EXT_CTRL_CODE_PAUSE } from '../include/constants/characters';
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
  LoadSpritePalette,
  LoadCompressedSpriteSheet,
} from '../harness/runtime/decomp-globals';
import {
  FillBgTilemapBufferRect,
  CopyBgTilemapBufferToVram,
  type BgTemplate,
} from './window';
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
} from '../harness/runtime/decomp-runtime';
import { PLTT_SIZE_4BPP, WIN_RANGE } from '../harness/runtime/decomp-helpers';
// ─── Données 1:1 main_menu.c (déplacées depuis le scaffold main-menu-data, retiré) ───
// enum type de menu principal selon l'état save (main_menu.c:512). Local (seul main_menu.ts l'utilise).
const ENUM_HAS_0 = {
  HAS_NO_SAVED_GAME: 0,
  HAS_SAVED_GAME: 1,
  HAS_MYSTERY_GIFT: 2,
  HAS_MYSTERY_EVENTS: 3,
} as const;
// #define main_menu.c:530-531 (exportés : utilisés par main_menu-callbacks-auto via decomp-globals).
export const MAIN_MENU_BORDER_TILE = 0x1D5;   // 469
export const BIRCH_DLG_BASE_TILE_NUM = 0xFC;  // 252
// 1:1 décomp `static const struct WindowTemplate sWindowTemplates_MainMenu[]` (main_menu.c:288)
// — 8 fenêtres du menu principal (CONTINUE/NEW GAME/OPTION + variantes Mystery Gift/Events).
export const sWindowTemplates_MainMenu = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 26, height: 2, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 5, width: 26, height: 2, paletteNum: 15, baseBlock: 53 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 26, height: 6, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 9, width: 26, height: 2, paletteNum: 15, baseBlock: 157 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 13, width: 26, height: 2, paletteNum: 15, baseBlock: 209 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 17, width: 26, height: 2, paletteNum: 15, baseBlock: 261 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 21, width: 26, height: 2, paletteNum: 15, baseBlock: 313 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 15, baseBlock: 365 },
] as const;
// 1:1 décomp `static const struct WindowTemplate sNewGameBirchSpeechTextWindows[]` (main_menu.c:375)
// — 3 fenêtres de l'intro Birch (dialogue + genre + nom).
export const sNewGameBirchSpeechTextWindows = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 3, tilemapTop: 5, width: 6, height: 4, paletteNum: 15, baseBlock: 109 },
  { bg: 0, tilemapLeft: 3, tilemapTop: 2, width: 9, height: 10, paletteNum: 15, baseBlock: 133 },
] as const;
// (state machine main_menu.c fusionnée plus bas dans ce fichier — ex-import callbacks-auto retiré)
// Imports requis par la state machine fusionnée (ex-imports du callbacks-auto, paths réécrits).
import { CreatePokeballSpriteToReleaseMon } from './pokeball';
import type { DecompRuntime, DecompSprite, DecompTask } from '../harness/runtime/decomp-runtime';
import { BG_SCREEN_ADDR, BLDCNT_TGT1_BG0, DISPLAY_WIDTH } from '../harness/runtime/decomp-runtime';
import { BLDALPHA_BLEND, PLTT_SIZEOF, PaletteBuffer, RGB, RGB_BLACK, RGB_WHITE, RGB_WHITEALPHA, ST_OAM_AFFINE_NORMAL, ST_OAM_AFFINE_OFF, ST_OAM_OBJ_BLEND, ST_OAM_OBJ_NORMAL } from '../harness/runtime/decomp-helpers';
import { AddTextPrinterForMessage, AddTextPrinterWithCallbackForMessage, AnimateSprites, BuildOamBuffer, ClearWindowTilemap, FEMALE, FadeOutBGM, FillBgTilemapBufferRect_Palette0, FreeAllWindowBuffers, InitBgFromTemplate, InitSpriteAffineAnim, IsMysteryGiftEnabled, IsTextPrinterActive, JOY_NEW, LZ77UnCompVram, LoadMessageBoxGfx, MALE, Menu_GetCursorPos, PALETTES_BG, PIXEL_FILL, PlayBGM, RtcGetErrorStatus, RunTasks, RunTextPrinters, RunTextPrintersAndIsPrinter0Active, SpriteCallbackDummy, StringExpandPlaceholders, UpdatePaletteFade, WININ_WIN0_OBJ, WINOUT_WIN01_CLR, WINOUT_WIN01_OBJ, gMain, gPlttBufferUnfaded, gSaveFileStatus, gStringVar4, sTextColor_Headers } from '../harness/runtime/decomp-globals';
import { CB2_InitTitleScreen } from './title_screen';
import { CB2_ContinueSavedGame, CB2_NewGame } from './overworld';
import { CB2_InitOptionMenu } from './option_menu';
import { gbaIoRegs } from '../harness/runtime/gba-io-regs';
import { CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose, Menu_ProcessInputNoWrap, InitMenuInUpperLeftCornerNormal } from './menu';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { A_BUTTON, B_BUTTON, DPAD_UP, DPAD_DOWN } from '../include/gba/io_reg';
import { IsWirelessAdapterConnected } from './link';
import { CreateWindowTemplate, FillWindowPixelBuffer, FillWindowPixelRect, PutWindowTilemap, CopyWindowToVram, ClearStdWindowAndFrame } from './window';
import { GetStringRightAlignXOffset, sTextColor_MenuInfo } from './text';
import { AddTextPrinterParameterized3 } from './menu';
import { getString } from './engine/ui/gba-strings';
import { FlagGet } from './engine/script/script-vars';
import { SE_SELECT as _SE_SELECT } from '../include/constants/songs';

// 1:1 décomp include/constants/songs.h:11 → SE_SELECT = 5.
// Migré vers import decomp-data songs-data.ts (cleanup B7).
const SE_SELECT = _SE_SELECT;
const HAS_MYSTERY_EVENTS = ENUM_HAS_0.HAS_MYSTERY_EVENTS;

// A2 fix : 1:1 décomp `include/bg.h:24-28` enum BG_COORD_*. Utilisés par
// HandleMainMenuInput pour ChangeBgY(bg, value, mode). Ancien code utilisait
// littéraux `1` et `0` avec commentaires inversés → scroll dans mauvais sens.
const BG_COORD_SET = 0;
const BG_COORD_ADD = 1;
const BG_COORD_SUB = 2;
// ts-prune appease : SET référence non utilisée pour l'instant mais on garde
// l'enum complet pour cohérence.
void BG_COORD_SET;

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
// TODO Phase D : porter ces structs Birch 1:1 dans ce fichier (= main_menu.c) depuis
// le décomp (LZ77 gfx/tilemap/palette + affine anim table player-shrink).
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

/** 1:1 décomp main_menu.c:451 sSpriteAffineAnimTable_PlayerShrink — nom de table affine
 *  (player shrink = 1 frame xScale=-2/yScale=-2/duration=48 → rétrécit sur 48 frames).
 *  Relocalisé du registre auto sprite-system.ts vers le registre EXTRA (dissolution
 *  decomp-data : sprite-system.ts perd SPRITE_AFFINE_ANIMS/TABLES). getAffineAnim le lit ici. */
registerAffineAnim('sSpriteAffineAnim_PlayerShrink', { frames: [{ xScale: -2, yScale: -2, rotation: 0, duration: 48 }], terminator: 'END' });
registerAffineAnimTable('sSpriteAffineAnimTable_PlayerShrink', { affineAnims: ['sSpriteAffineAnim_PlayerShrink'] });
export const sSpriteAffineAnimTable_PlayerShrink = 'sSpriteAffineAnimTable_PlayerShrink';
(globalThis as Record<string, unknown>).sSpriteAffineAnimTable_PlayerShrink = sSpriteAffineAnimTable_PlayerShrink;

// 1:1 décomp main_menu.c:413-432 `static const struct BgTemplate sMainMenuBgTemplates[]`.
// BG0 = dialog box (charBase=2, mapBase=30, priority=0, front) ; BG1 = forest scene
// (charBase=0, mapBase=7, priority=3, back). Typé BgTemplate[] (≠ `as const`) → passable
// direct à InitBgsFromTemplates(readonly BgTemplate[]) sans cast.
export const sMainMenuBgTemplates: BgTemplate[] = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 7, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
];

// 1:1 décomp main_menu.c:434 sBirchBgTemplate.
//
// IMPORTANT — comprendre le layout BG Birch (= 2 layers cooperants) :
//   sMainMenuBgTemplates[]  → BG0 charBase=2 mapBase=30 priority=0 (= dialog box, front)
//                             BG1 charBase=0 mapBase=7  priority=3 (= forest scene, back)
//   sBirchBgTemplate        → override BG0 charBase=3 mapBase=30 priority=0 (= dialog)
// Donc BG0 = dialog text/box, BG1 = forest scene.
// LZ77UnCompVram(sBirchSpeechShadowGfx, VRAM) → tiles à offset 0 = BG1 charBase=0 ✅
// LZ77UnCompVram(sBirchSpeechBgMap, BG_SCREEN_ADDR(7)) → tilemap à 0x3800 = BG1 mapBase=7 ✅
// Dialog glyphs sur BG0 baseBlock=1 → offset 0xC020 (charBase=3) = pas de conflit avec BG1.
//
// Notre fix précédent (charBase=0/mapBase=7 sur sBirchBgTemplate) cassait le dialog
// rendering (= dialog glyphs écrasaient les forest tiles à offset 32+). Revert au
// 1:1 décomp original. Le bug "BG forest invisible" vient d'ailleurs (= probablement
// BG1 ShowBg(1) pas correctement appelé OU sMainMenuBgTemplates pas initialisé avant
// sBirchBgTemplate). À investiguer.
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
  const task = rt.gTasks[taskId];
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
      // A2 fix : 1:1 décomp main_menu.c:908-921 + bg.h:24-28 enum
      //   { BG_COORD_SET=0, BG_COORD_ADD=1, BG_COORD_SUB=2 }.
      // DPAD_UP = scrolling vers entry du haut → décomp utilise BG_COORD_SUB.
      // Ancien littéral `1` était BG_COORD_ADD (= scroll dans le mauvais sens).
      ChangeBgY(0, 0x2000, BG_COORD_SUB);
      ChangeBgY(1, 0x2000, BG_COORD_SUB);
      const arrowTask = rt.gTasks[data[13]];
      if (arrowTask) arrowTask.data[15] = 0;
      data[14] = 0;
    }
    data[1]--;
    sCurrItemAndOptionMenuCheck = data[1];
    (globalThis as any).sCurrItemAndOptionMenuCheck = data[1];
    return true;
  } else if ((newKeys & DPAD_DOWN) && data[1] < data[12] - 1) {
    if (data[0] === HAS_MYSTERY_EVENTS && data[1] === 3 && data[14] === 0) {
      // A2 fix : DPAD_DOWN = scrolling vers entry du bas → décomp utilise
      // BG_COORD_ADD. Ancien littéral `0` était BG_COORD_SET (= reset BG Y,
      // pas un add). Cf. bg.h:24-28.
      ChangeBgY(0, 0x2000, BG_COORD_ADD);
      ChangeBgY(1, 0x2000, BG_COORD_ADD);
      const arrowTask = rt.gTasks[data[13]];
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

/** 1:1 décomp `MainMenu_FormatSavegameText` (main_menu.c:2132-2138) +
 *  4 sous-fonctions (Player/Time/Pokedex/Badges). Affiche le contenu de la
 *  fenêtre Continue (= window 2) avec :
 *
 *    [JOUEUR  Brendan]   [DUREE JEU  12h45]
 *    [POKéDEX  XX]       [BADGES  X]
 *
 *  Layout 1:1 décomp :
 *    - Player label (x=0, y=17) + name right-aligned vers x=100
 *    - Time label (x=0x6C=108, y=17) + HH:MM right-aligned vers x=0xD0=208
 *    - Pokedex label (x=0, y=33) + count right-aligned vers x=100
 *      (only si FLAG_SYS_POKEDEX_GET)
 *    - Badges label (x=0x6C=108, y=33) + count right-aligned vers x=0xD0=208
 *
 *  Strings FR (= strings.c:1363-1366) : "JOUEUR", "DUREE JEU", "POKéDEX", "BADGES".
 *  NUM_BADGES = 8 (FLAG_BADGE01..08). */
export function MainMenu_FormatSavegameText(): void {
  // 1:1 décomp : lit gSaveBlock2Ptr (= déjà importé statiquement plus haut),
  // FlagGet (= script-vars), GetStringRightAlignXOffset (= gba-text-system).
  // Tous imports ESM statiques (pas de require() — bug session 122 fix).
  const sb2 = gSaveBlock2Ptr as Record<string, unknown>;
  const playerName = GetPlayerNameString() || '???';
  const playTimeHours = Number(sb2.playTimeHours ?? 0);
  const playTimeMinutes = Number(sb2.playTimeMinutes ?? 0);

  // 1:1 décomp main_menu.c:411 sTextColor_MenuInfo = [TEXT_DYNAMIC_COLOR_1=0xA,
  // TEXT_COLOR_WHITE=0x1, TEXT_DYNAMIC_COLOR_3=0xC] = [10, 1, 12]. Imported
  // depuis gba-text-system (= source unique). NE JAMAIS approximer [1,2,3] ←
  // était mon bug : palette[15*16+1] est chargée dynamiquement avec BLUE par
  // le cursor highlight, donc bg derrière le texte rendait BLEU au lieu du
  // white attendu.
  const colorMenuInfo = sTextColor_MenuInfo as unknown as readonly number[];
  const FONT_NORMAL = 1;
  const TEXT_SKIP_DRAW = 255;
  const WIN_CONTINUE = 2;

  // (1) Player line — JOUEUR <nom>
  // Label at x=0, name right-aligned vers x=100.
  AddTextPrinterParameterized3(WIN_CONTINUE, FONT_NORMAL, 0, 17, colorMenuInfo, TEXT_SKIP_DRAW, 'JOUEUR');
  AddTextPrinterParameterized3(
    WIN_CONTINUE, FONT_NORMAL,
    GetStringRightAlignXOffset(playerName, 100), 17,
    colorMenuInfo, TEXT_SKIP_DRAW, playerName,
  );

  // (2) Time line — DUREE JEU HH:MM
  // Label at x=0x6C=108, time right-aligned vers x=0xD0=208.
  // Format : `<H>:<MM>` (= 1:1 décomp ConvertIntToDecimalStringN with 0xF0 separator = ":").
  const timeStr = `${playTimeHours}:${String(playTimeMinutes).padStart(2, '0')}`;
  AddTextPrinterParameterized3(WIN_CONTINUE, FONT_NORMAL, 0x6C, 17, colorMenuInfo, TEXT_SKIP_DRAW, 'DUREE JEU');
  AddTextPrinterParameterized3(
    WIN_CONTINUE, FONT_NORMAL,
    GetStringRightAlignXOffset(timeStr, 0xD0), 17,
    colorMenuInfo, TEXT_SKIP_DRAW, timeStr,
  );

  // (3) Pokedex line (conditional sur FLAG_SYS_POKEDEX_GET)
  if (FlagGet('FLAG_SYS_POKEDEX_GET')) {
    const dexCount = _countCaughtPokedexFlags(FlagGet);
    const dexStr = String(dexCount);
    AddTextPrinterParameterized3(WIN_CONTINUE, FONT_NORMAL, 0, 33, colorMenuInfo, TEXT_SKIP_DRAW, getString('gText_ContinueMenuPokedex'));
    AddTextPrinterParameterized3(
      WIN_CONTINUE, FONT_NORMAL,
      GetStringRightAlignXOffset(dexStr, 100), 33,
      colorMenuInfo, TEXT_SKIP_DRAW, dexStr,
    );
  }

  // (4) Badges line — BADGES X
  // 1:1 décomp : `for (i = FLAG_BADGE01_GET; i < FLAG_BADGE01_GET + NUM_BADGES; i++) if (FlagGet(i)) badgeCount++`.
  const badgeFlagNames = ['FLAG_BADGE01_GET','FLAG_BADGE02_GET','FLAG_BADGE03_GET','FLAG_BADGE04_GET',
                          'FLAG_BADGE05_GET','FLAG_BADGE06_GET','FLAG_BADGE07_GET','FLAG_BADGE08_GET'];
  let badgeCount = 0;
  for (const fname of badgeFlagNames) if (FlagGet(fname)) badgeCount++;
  const badgeStr = String(badgeCount);
  AddTextPrinterParameterized3(WIN_CONTINUE, FONT_NORMAL, 0x6C, 33, colorMenuInfo, TEXT_SKIP_DRAW, 'BADGES');
  AddTextPrinterParameterized3(
    WIN_CONTINUE, FONT_NORMAL,
    GetStringRightAlignXOffset(badgeStr, 0xD0), 33,
    colorMenuInfo, TEXT_SKIP_DRAW, badgeStr,
  );
}

/** Compte les Pokémon attrapés dans le pokedex via les flags FLAG_SYS_DEX_FLAGS_X.
 *  1:1 décomp `GetHoennPokedexCount(FLAG_GET_CAUGHT)` / `GetNationalPokedexCount`.
 *  Implémentation simplifiée : itère les flags `FLAG_SYS_POKEDEX_FLAG_<id>` set. */
function _countCaughtPokedexFlags(flagGet: (name: string) => boolean): number {
  // Pour une démo Phase 1 : on retourne 0 (= pokedex pas encore implémenté).
  // TODO Phase 4+ : itérer sur les NUM_SPECIES flags caught/seen.
  void flagGet;
  return 0;
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

/** 1:1 décomp main_menu.c:2280 NewGameBirchSpeech_CreateDialogueWindowBorder.
 *  Place les 14 frame tiles (= corners + edges) du dialog box autour de la
 *  fenêtre window via 13 FillBgTilemapBufferRect calls. Les tiles ont été
 *  loadées en VRAM via LoadMessageBoxGfx(0, BIRCH_DLG_BASE_TILE_NUM, BG_PLTT_ID(15)).
 *
 *  Layout (= 1:1 décomp main_menu.c:2280-2295) :
 *  - Top row    : tile 1 (corner), tile 3 (extend), tile 4 (top edge×width), tile 5 (R-extend), tile 6 (R-corner)
 *  - Side rows  : tile 7 (left edge), tile 9 (interior fill×width+1), tile 10 (right edge)
 *  - Bottom row : V_FLIP variants of top tiles (= bit 11 set in tilemap entry).
 *
 *  Tiles indices = BIRCH_DLG_BASE_TILE_NUM (= 0xFC = 252) + offset. */
function NewGameBirchSpeech_CreateDialogueWindowBorder(
  bg: number, x: number, y: number, width: number, height: number, palNum: number,
): void {
  const BIRCH_DLG = 0xFC;
  // Top row (1 row above window).
  FillBgTilemapBufferRect(bg, BIRCH_DLG +  1, x - 2,         y - 1, 1,         1, palNum);
  FillBgTilemapBufferRect(bg, BIRCH_DLG +  3, x - 1,         y - 1, 1,         1, palNum);
  FillBgTilemapBufferRect(bg, BIRCH_DLG +  4, x,             y - 1, width,     1, palNum);
  FillBgTilemapBufferRect(bg, BIRCH_DLG +  5, x + width - 1, y - 1, 1,         1, palNum);
  FillBgTilemapBufferRect(bg, BIRCH_DLG +  6, x + width,     y - 1, 1,         1, palNum);
  // Middle rows (= window content area).
  FillBgTilemapBufferRect(bg, BIRCH_DLG +  7, x - 2,         y,     1,         5, palNum);
  FillBgTilemapBufferRect(bg, BIRCH_DLG +  9, x - 1,         y,     width + 1, 5, palNum);
  FillBgTilemapBufferRect(bg, BIRCH_DLG + 10, x + width,     y,     1,         5, palNum);
  // Bottom row (V_FLIP = bit 11 set).
  const VFLIP = 0x800;
  FillBgTilemapBufferRect(bg, (BIRCH_DLG +  1) | VFLIP, x - 2,         y + height, 1,         1, palNum);
  FillBgTilemapBufferRect(bg, (BIRCH_DLG +  3) | VFLIP, x - 1,         y + height, 1,         1, palNum);
  FillBgTilemapBufferRect(bg, (BIRCH_DLG +  4) | VFLIP, x,             y + height, width - 1, 1, palNum);
  FillBgTilemapBufferRect(bg, (BIRCH_DLG +  5) | VFLIP, x + width - 1, y + height, 1,         1, palNum);
  FillBgTilemapBufferRect(bg, (BIRCH_DLG +  6) | VFLIP, x + width,     y + height, 1,         1, palNum);
}

/** 1:1 décomp main_menu.c:2271 NewGameBirchSpeech_ShowDialogueWindow.
 *    CallWindowFunction(NewGameBirchSpeech_CreateDialogueWindowBorder);
 *    FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
 *    PutWindowTilemap(windowId);
 *    if (copyToVram) CopyWindowToVram(windowId, COPYWIN_FULL); */
export function NewGameBirchSpeech_ShowDialogueWindow(windowId: number, copyToVram: boolean): void {
  // 1:1 décomp ligne 2273 : CallWindowFunction(windowId, fn) appelle
  // fn(bg, tilemapLeft, tilemapTop, width, height, paletteNum) avec les
  // params extraits du WindowTemplate du windowId.
  const tpl = sNewGameBirchSpeechTextWindows[windowId];
  if (tpl) {
    NewGameBirchSpeech_CreateDialogueWindowBorder(
      tpl.bg, tpl.tilemapLeft, tpl.tilemapTop, tpl.width, tpl.height, tpl.paletteNum,
    );
  }
  // Fill avec PIXEL_FILL(1) = idx 1 dans 2 nibbles = 0x11.
  FillWindowPixelBuffer(windowId, 0x11);
  PutWindowTilemap(windowId);
  if (copyToVram) {
    CopyWindowToVram(windowId, 3);  // COPYWIN_FULL = 3
  }
}

/** 1:1 décomp main_menu.c:2233-2240 NewGameBirchSpeech_ClearGenderWindow.
 *    CallWindowFunction(windowId, ClearStdWindowAndFrameToTransparent);
 *    FillWindowPixelBuffer(windowId, PIXEL_FILL(0));
 *    ClearWindowTilemap(windowId);
 *    if (copyToVram == TRUE) CopyWindowToVram(windowId, COPYWIN_GFX);
 *
 *  Bug session 89 fix : avant on clearait juste le pixel buffer → le frame
 *  border BG tilemap entries restaient visibles → "boite vide" leftover après
 *  gender select. Maintenant ClearStdWindowAndFrame clear ET le frame border
 *  BG tilemap ET le pixel buffer (cf. gba-window-system.ts:437). */
export function NewGameBirchSpeech_ClearGenderWindow(windowId: number, copyToVram: boolean): void {
  // 1:1 décomp ligne 2235 : CallWindowFunction(windowId, ClearStdWindowAndFrameToTransparent).
  // Notre ClearStdWindowAndFrame fait fill pixel buffer 0 + clear BG tilemap rect frame.
  ClearStdWindowAndFrame(windowId, true);
  // 1:1 décomp ligne 2236-2237 : FillWindowPixelBuffer + ClearWindowTilemap (déjà fait
  // par ClearStdWindowAndFrame). Re-fill explicite pour 1:1 fidélité.
  FillWindowPixelBuffer(windowId, 0x00);  // PIXEL_FILL(0) = transparent.
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
 *  Retourne 0=GARÇON, 1=FILLE, -1=B pressed (no-op for Birch), -2=still processing.
 *
 *  Bug fix session 122 : avant on appelait Menu_ProcessInputNoWrapClearOnChoose
 *  qui efface le YesNo window sur A/B → mais le gender menu N'EST PAS un YesNo
 *  window. EraseYesNoWindow effaçait random state + B press faisait freeze le
 *  jeu (menu disparaissait + tâche Birch attendait selection).
 *  1:1 décomp utilise Menu_ProcessInputNoWrap (= sans clear) — le caller
 *  Task_ChooseGender ignore B (= switch ne match pas), reste dans le task.
 *  Cursor cleanup est géré par notre _processMenuInput core sur A/B (ne touche
 *  plus au window). */
export function NewGameBirchSpeech_ProcessGenderMenuInput(): number {
  return Menu_ProcessInputNoWrap();
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
 *
 *  Bug fix session 122 : l'auto file (main_menu-callbacks-auto.ts:77) déclare
 *  `NUM_PRESET_NAMES = _UNDEFINED = 0` (= macro non-résolue par le transpileur),
 *  donc `Math.random() % 0 = NaN` arrive ici comme nameId. Si invalide,
 *  utiliser `Random() % 20` 1:1 décomp (= NUM_PRESET_NAMES réel = 20).
 *
 *  Aussi 1:1 décomp : le décomp utilise `Random()` (= seed=0 reproductible),
 *  pas Math.random(). On override le rng ici aussi pour 1:1 fidélité. */
export function NewGameBirchSpeech_SetDefaultPlayerName(nameId: number): void {
  // 1:1 décomp NUM_PRESET_NAMES = 20.
  const NUM_PRESET_NAMES = 20;
  let validIdx = nameId;
  if (!Number.isInteger(validIdx) || validIdx < 0 || validIdx >= NUM_PRESET_NAMES) {
    // Fallback : Random() % 20 (= 1:1 décomp main_menu.c:1604).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    void import('./random').then(({ Random }) => {
      validIdx = Random() % NUM_PRESET_NAMES;
      _applyPresetName(validIdx);
    });
    // Apply temporary fallback synchronously to avoid empty playerName
    // pendant que l'async import résout (= deterministic seed=0 → idx 0).
    validIdx = 0;
  }
  _applyPresetName(validIdx);
}

function _applyPresetName(nameId: number): void {
  const MALE = 0;
  const presetSymbol = gSaveBlock2Ptr.playerGender === MALE
    ? sMalePresetNames[nameId]
    : sFemalePresetNames[nameId];
  if (!presetSymbol) return;
  const name = getString(presetSymbol);
  if (name.startsWith('[MISSING:')) return;  // safety, ne jamais set un missing
  SetPlayerName(name);
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

// 1:1 décomp include/data.h:10-12 — TRAINER_PIC_WIDTH/HEIGHT = 64, _SIZE = 2048.
// Sprite 64x64 4bpp = 64 tiles × 32 bytes = 2048 bytes per frame.
const TRAINER_PIC_SIZE_BYTES = 64 * 64 / 2;
// Mon front pic with 2 frames (= anim_front.png 64×128). 1:1 décomp
// `MON_PIC_SIZE * 2` for species that have 2-frame animation
// (= sMonHasTwoFramesAnimationTable[species] == TRUE, true for most Gen 3 mons).
const MON_PIC_2FRAME_SIZE_BYTES = TRAINER_PIC_SIZE_BYTES * 2;
// 1:1 décomp src/field_effect.c:336 — sSpritePalette_NewGameBirch.tag = 0x1006.
const TAG_BIRCH_PALETTE = 0x1006;
// Tag string keys (= spriteSheetTagToTileStart map keys) pour les sprites Birch.
// 1:1 décomp : chaque pic a un trainerSpriteID unique (= picId index dans
// gTrainerFrontPicTable). Ici on utilise des string tags stables.
const TAG_BIRCH_SHEET = 'NewGameBirch';
const TAG_BRENDAN_FRONT = 'TrainerFrontPic_Brendan';
const TAG_MAY_FRONT = 'TrainerFrontPic_May';
const TAG_LOTAD_FRONT = 'MonFrontPic_Lotad';

/** 1:1 décomp `field_effect.c:909 AddNewGameBirchObject(x, y, subpriority)`.
 *  → LoadSpritePalette(sSpritePalette_NewGameBirch) + CreateSprite(sSpriteTemplate_NewGameBirch).
 *  Sprite 64x64 4bpp, palette tag 0x1006. */
function AddNewGameBirchObject(x: number, y: number, subpriority: number): number {
  void subpriority;  // notre engine n'expose pas subpriority dans CreateSpriteAtOam (= layer ordering géré via priority OAM)
  const rt = getRuntime();
  if (!rt) return -1;
  // 1:1 décomp : LoadSpritePalette(&sSpritePalette_NewGameBirch).
  LoadSpritePalette({ data: 'sNewGameBirch_Pal', tag: TAG_BIRCH_PALETTE });
  // 1:1 décomp : sSpriteTemplate_NewGameBirch utilise images=sPicTable_NewGameBirch
  // (= obj_frame_tiles(sNewGameBirch_Gfx)), pas un tileTag. Notre engine veut
  // un tileTag via LoadCompressedSpriteSheet. On charge sous TAG_BIRCH_SHEET.
  LoadCompressedSpriteSheet({ data: 'sNewGameBirch_Gfx', size: TRAINER_PIC_SIZE_BYTES, tag: TAG_BIRCH_SHEET });
  // 1:1 STRICT lecture array primary (sprite.c:1542 + :1637).
  const tileBaseRaw = GetSpriteTileStartByTag(TAG_BIRCH_SHEET);
  const palSlotRaw = IndexOfSpritePaletteTag(TAG_BIRCH_PALETTE);
  const tileBase = tileBaseRaw === 0xFFFF ? 0 : tileBaseRaw;
  const palSlot = palSlotRaw === 0xFF ? 0 : palSlotRaw;
  // sOam_64x64 → shape=0 (square), size=3 (64x64), priority=0.
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: tileBase, paletteBank: palSlot, x, y,
    shape: 0, size: 3, priority: 0,
  });
  return spriteId;
}

/** 1:1 décomp `field_effect.c:888 CreateTrainerSprite(picId, x, y, subpriority, buffer)`.
 *  → LoadCompressedSpritePalette + LoadCompressedSpriteSheet for the trainer
 *  pic data, then CreateSprite with sOam_64x64 template.
 *  Notre version : prend les noms de symbols décomp (gTrainerFrontPic_X +
 *  gTrainerPalette_X) directement au lieu de l'index picId. */
function CreateTrainerSprite(gfxSymbol: string, palSymbol: string, tag: string, palTag: number, x: number, y: number, subpriority: number): number {
  void subpriority;
  const rt = getRuntime();
  if (!rt) return -1;
  LoadSpritePalette({ data: palSymbol, tag: palTag });
  LoadCompressedSpriteSheet({ data: gfxSymbol, size: TRAINER_PIC_SIZE_BYTES, tag });
  // 1:1 STRICT lecture array primary (sprite.c:1542 + :1637).
  const tileBaseRaw = GetSpriteTileStartByTag(tag);
  const palSlotRaw = IndexOfSpritePaletteTag(palTag);
  const tileBase = tileBaseRaw === 0xFFFF ? 0 : tileBaseRaw;
  const palSlot = palSlotRaw === 0xFF ? 0 : palSlotRaw;
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: tileBase, paletteBank: palSlot, x, y,
    shape: 0, size: 3, priority: 0,
  });
  return spriteId;
}

/** 1:1 décomp `main_menu.c:1878 NewGameBirchSpeech_CreateLotadSprite(x, y)`.
 *  → CreateMonPicSprite_Affine(SPECIES_LOTAD, SHINY_ODDS, 0, MON_PIC_AFFINE_FRONT, x, y, 14, TAG_NONE).
 *  Sprite 64×64 affine front Pokemon pic.
 *
 *  Audit V2 fix : 1:1 décomp `sOamData_Affine` (trainer_pokemon_sprites.c:38)
 *  has `affineMode = ST_OAM_AFFINE_NORMAL` set from creation. Avant on créait
 *  avec affineMode=0 (default), puis SetUpForReleaseAffineAnim retroactively
 *  fixait → 1-frame race où oam.affineParamIndex = matrixNum mais
 *  oam.affineMode=0 (= compositor renders sans affine, sprite normal).
 *
 *  Match decomp : create with affineMode=NORMAL + pre-alloc matrix slot.
 *  InitSpriteAffineAnim is implicitly called by CreateSprite when
 *  affineMode & ST_OAM_AFFINE_ON_MASK (sprite.c:582-583). */
function NewGameBirchSpeech_CreateLotadSprite(x: number, y: number): number {
  const rt = getRuntime();
  if (!rt) return -1;
  // paletteSlot=14 (= 1:1 décomp main_menu.c:1880, slot 14 in OBJ palette area).
  const LOTAD_PAL_TAG = 0x1014;  // unique tag pour palette Lotad (slot 14 reserved)
  LoadSpritePalette({ data: 'gMonPalette_Lotad', tag: LOTAD_PAL_TAG });
  // Session 91 fix : load 2-frame anim_front (= 4096 bytes = 128 tiles).
  // Frame 0 (tiles 0-63) = idle pose. Frame 1 (tiles 64-127) = breath/blink pose.
  // Switched between via `LaunchAnimationTaskForFrontSprite` writing oam.tileId
  // = tileBase + (animFrame * 64). 1:1 décomp `gMonFrontPicTable[SPECIES_LOTAD]`
  // points at `INCBIN_U32("graphics/pokemon/lotad/anim_front.4bpp.lz")`.
  LoadCompressedSpriteSheet({ data: 'gMonFrontPic_Lotad', size: MON_PIC_2FRAME_SIZE_BYTES, tag: TAG_LOTAD_FRONT });
  // 1:1 STRICT lecture array primary (sprite.c:1542 + :1637).
  const tileBaseRaw = GetSpriteTileStartByTag(TAG_LOTAD_FRONT);
  const palSlotRaw = IndexOfSpritePaletteTag(LOTAD_PAL_TAG);
  const tileBase = tileBaseRaw === 0xFFFF ? 0 : tileBaseRaw;
  const palSlot = palSlotRaw === 0xFF ? 0 : palSlotRaw;
  // Audit V2 : affineMode=1 (NORMAL) at creation = 1:1 décomp sOamData_Affine.
  // CreateSpriteAtOam doesn't auto-alloc matrix on its own; we need to alloc
  // here to match decomp's InitSpriteAffineAnim path.
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: tileBase, paletteBank: palSlot, x, y,
    shape: 0, size: 3, priority: 0,
    affineMode: 1,  // ST_OAM_AFFINE_NORMAL
  });
  // 1:1 décomp src/sprite.c:582-583 : if affineMode & AFFINE_ON_MASK,
  // InitSpriteAffineAnim → AllocOamMatrix + matrixNum set on sprite/oam.
  // Session 91 fix : also write `sprite.tileBase` so that downstream consumers
  // (= LaunchAnimationTaskForFrontSprite frame switching, FreeAndDestroyMonPicSprite
  // teardown) can compute frame N tile offset = tileBase + N * tilesPerFrame.
  // Without this, sprite.tileBase stayed at 0 (= initialized default), causing
  // the breath anim to point at the WRONG tile region.
  if (spriteId >= 0) {
    const sprite = rt.gSprites[spriteId];
    if (sprite) sprite.tileBase = tileBase;
    const matrixNum = AllocOamMatrix();
    if (matrixNum > 0) {
      if (sprite) sprite.matrixNum = matrixNum;
      const oam = rt.gba.oam[rt.gSprites[spriteId]!.oamIndex];
      if (oam) oam.affineParamIndex = matrixNum;
    }
  }
  return spriteId;
}

/** 1:1 décomp `main_menu.c:1883 AddBirchSpeechObjects(taskId)`.
 *  Crée 4 sprites (Birch + Lotad + Brendan + May), tous invisibles, OAM
 *  priority 0, callback=SpriteCB_Null. Stocke les spriteIds dans
 *  task.data[8..11] (= tBirchSpriteId/tLotadSpriteId/tBrendanSpriteId/tMaySpriteId). */
export function AddBirchSpeechObjects(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const task = rt.gTasks[taskId];
  if (!task) return;

  // Birch (= 0x88, 0x3C = 136, 60).
  const birchSpriteId = AddNewGameBirchObject(0x88, 0x3C, 1);
  if (birchSpriteId !== -1) {
    const s = rt.gSprites[birchSpriteId];
    if (s) { s.callback = null; s.invisible = true; }
    rt.gba.oam[rt.gSprites[birchSpriteId]!.oamIndex].priority = 0;
  }
  task.data[8] = birchSpriteId;  // tBirchSpriteId

  // Lotad (= 100, 0x4B = 100, 75).
  const lotadSpriteId = NewGameBirchSpeech_CreateLotadSprite(100, 0x4B);
  if (lotadSpriteId !== -1) {
    const s = rt.gSprites[lotadSpriteId];
    if (s) { s.callback = null; s.invisible = true; }
    rt.gba.oam[rt.gSprites[lotadSpriteId]!.oamIndex].priority = 0;
  }
  task.data[9] = lotadSpriteId;  // tLotadSpriteId

  // Brendan (= 120, 60). picId = TRAINER_PIC_BRENDAN = FACILITY_CLASS_BRENDAN
  // index dans gTrainerFrontPicTable. Notre version utilise les symbols directs.
  const brendanSpriteId = CreateTrainerSprite('gTrainerFrontPic_Brendan', 'gTrainerPalette_Brendan', TAG_BRENDAN_FRONT, 0x1010, 120, 60, 0);
  if (brendanSpriteId !== -1) {
    const s = rt.gSprites[brendanSpriteId];
    if (s) { s.callback = null; s.invisible = true; }
    rt.gba.oam[rt.gSprites[brendanSpriteId]!.oamIndex].priority = 0;
  }
  task.data[10] = brendanSpriteId;  // tBrendanSpriteId

  // May (= 120, 60).
  const maySpriteId = CreateTrainerSprite('gTrainerFrontPic_May', 'gTrainerPalette_May', TAG_MAY_FRONT, 0x1011, 120, 60, 0);
  if (maySpriteId !== -1) {
    const s = rt.gSprites[maySpriteId];
    if (s) { s.callback = null; s.invisible = true; }
    rt.gba.oam[rt.gSprites[maySpriteId]!.oamIndex].priority = 0;
  }
  task.data[11] = maySpriteId;  // tMaySpriteId
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
  const mainTask = rt.gTasks[taskId];
  if (mainTask) mainTask.data[5] = 0;  // tIsDoneFadingSprites = 0 (animation en cours).
  const subTaskId = rt.CreateTask((t) => Task_NewGameBirchSpeech_FadeInTarget1OutTarget2(t, rt), 0);
  const subTask = rt.gTasks[subTaskId];
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
  const mainTask = rt.gTasks[taskId];
  if (mainTask) mainTask.data[5] = 0;
  const subTaskId = rt.CreateTask((t) => Task_NewGameBirchSpeech_FadeOutTarget1InTarget2(t, rt), 0);
  const subTask = rt.gTasks[subTaskId];
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
  const subTask = rt.gTasks[subTaskId];
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
  const subTask = rt.gTasks[subTaskId];
  if (subTask) {
    subTask.data[0] = taskId;
    subTask.data[1] = 8;            // tPalIndex (= start at 8, descend vers 0)
    subTask.data[2] = 8;            // tDelayBefore
    subTask.data[3] = delay;
    subTask.data[4] = delay;
  }
}

/** 1:1 décomp main_menu.c:2254 NewGameBirchSpeech_WaitForThisIsPokemonText.
 *  Callback called by AddTextPrinterWithCallbackForMessage on each char rendered.
 *  Quand le `lastByte` est EXT_CTRL_CODE_PAUSE (= `{PAUSE 96}` dans le texte
 *  "Voici ce qu'on appelle un POKéMON.{PAUSE 96}\\p"), spawn la sub-Task qui
 *  active Lotad + déclenche Pokeball release.
 *
 *  ⚠️ Engine NOTE : sync import + try/catch wrap autour du call de la sub-task
 *  → fix bug session 84 où le lambda async `void import(...).then(...)` tournait
 *  en zombie (= reassignment de task.func vers WaitForLotad jamais appliqué car
 *  l'inner throwait silently sur asset load race condition). Direct sync ref +
 *  log explicite si erreur. */
export function NewGameBirchSpeech_WaitForThisIsPokemonText(_printer: unknown, lastByte: number): void {
  // EXT_CTRL_CODE_PAUSE = 8 (1:1 characters.h ; source unifiée characters-data,
  // VAGUE 2c-prep — était hardcodé 0x09 = valeur décalée de l'ancien gba-text-printer).
  if (lastByte !== EXT_CTRL_CODE_PAUSE) return;
  // sStartedPokeBallTask flag (= 1:1 décomp main_menu.c:204) prevents double-spawn.
  const started = (globalThis as Record<string, unknown>).sStartedPokeBallTask;
  if (started) return;
  (globalThis as Record<string, unknown>).sStartedPokeBallTask = true;
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp main_menu.c:2261 : CreateTask(Task_NewGameBirchSpeechSub_InitPokeBall, 0).
  // Sub-task spawned inside the text-printer per-char callback. Lambda wrap
  // converte signature TaskCallback (task, rt) → décomp signature (task) du runtime.
  rt.CreateTask((t) => {
    try {
      Task_NewGameBirchSpeechSub_InitPokeBall(t, rt);
    } catch (e) {
      console.error('[BirchSpeech_WaitForThisIsPokemonText] InitPokeBall threw:', e);
    }
  }, 0);
}

(globalThis as Record<string, unknown>).NewGameBirchSpeech_WaitForThisIsPokemonText = NewGameBirchSpeech_WaitForThisIsPokemonText;

/** 1:1 décomp `naming_screen.c:396` :
 *  `void DoNamingScreen(u8 templateNum, u8 *destBuffer, u16 monSpecies, u16 monGender, u32 monPersonality, MainCallback returnCallback)`.
 *
 *  Phase 3 : real impl via naming-screen-impl.ts. Délègue tout le rendering +
 *  state machine au module dédié (= keyboard FR, sprite cursor, OK/Back, etc.).
 *
 *  ⚠️ Session 94 fix : preserve decomp arg order. Previously this bridge
 *  swapped `monSpecies` / `monGender` — the auto-callback main_menu.c:1606
 *  calls `DoNamingScreen(NAMING_SCREEN_PLAYER, playerName, playerGender, 0, 0, ...)`
 *  where the 3rd arg slot is `monSpecies` per decomp signature. The decomp
 *  REUSES the monSpecies field as `gender` for PLAYER context (cf.
 *  NamingScreen_CreatePlayerIcon line 1402 which reads `sNamingScreen->monSpecies`
 *  as the gender param to GetRivalAvatarGraphicsIdByStateIdAndGender). The
 *  previous swap caused gender to land in the `monGender` field of our struct,
 *  not `monSpecies` → CreatePlayerIcon always read 0 → always male trainer. */
export function DoNamingScreen(
  type: number,
  dest: unknown,
  monSpecies: number,
  monGender: number,
  monPersonality: number,
  callback: () => void,
): void {
  // Lazy import pour éviter circular dep : naming-screen-impl importe depuis decomp-globals
  // qui peut éventuellement importer main-menu-impl (= chain d'import).
  void import('./naming_screen').then((mod) => {
    mod.DoNamingScreen(
      type, dest as number[], monSpecies, monGender, monPersonality, callback as any,
    );
  });
}

// ─── Sprite helpers (= bridges vers DestroySprite) ──────────────────────────

/** 1:1 décomp src/trainer_pokemon_sprites.c FreeAndDestroyMonPicSprite — frees
 *  the sprite tiles + palette + affine matrix slot AND destroys the sprite.
 *
 *  Audit V2 fix : avant on appelait juste DestroySprite, ce qui ne libérait
 *  PAS le matrix slot. Si la scène re-create un sprite affine après, l'alloc
 *  retournait un slot encore "owned" (= leak). Now we call FreeOamMatrix +
 *  StopMonFrontSpriteAnimation explicitly. */
export function FreeAndDestroyMonPicSprite(spriteId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const sprite = rt.gSprites[spriteId];
  if (sprite) {
    // 1:1 décomp src/sprite.c FreeSpriteOamMatrix : if affine, free matrix.
    if (sprite.matrixNum > 0) {
      FreeOamMatrix(sprite.matrixNum);
      sprite.matrixNum = 0;
    }
    // Stop idle animation if active (= clean up controller).
    // Lazy import to avoid circular dep with pokemon-animation.
    const stop = (globalThis as Record<string, unknown>).__StopMonFrontSpriteAnimation;
    if (typeof stop === 'function') (stop as (rt: unknown, id: number) => void)(rt, spriteId);
  }
  DestroySprite(spriteId);
}

export function ResetAllPicSprites(): void {
  // 1:1 décomp src/trainer_pokemon_sprites.c:ResetAllPicSprites — clears the
  // sSpritePics[] table. We don't have that table, but we DO need to clear
  // any pending mon idle animations (= prevents stale sprites referencing
  // matrix slots that were freed externally).
  const reset = (globalThis as Record<string, unknown>).__ResetAllMonAnimations;
  if (typeof reset === 'function') (reset as () => void)();
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
  ResetSpriteData();
  FreeAllSpritePalettes();
  // 1:1 décomp main_menu.c:585-587 — fade IN (startY=0x10 → endY=0).
  rt.BeginNormalPaletteFade('PALETTES_ALL', 0, 0x10, 0,
    returningFromOptionsMenu ? 'RGB_BLACK' : 'RGB_WHITEALPHA');
  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(0, sMainMenuBgTemplates, sMainMenuBgTemplates.length);
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
  // Diagnostic : log gSaveFileStatus juste avant que Task_MainMenuCheckSaveFile
  // le lise (= devrait être 1 = SAVE_STATUS_OK si une save existe).
  // Lecture via 2 paths : (a) import direct gba-menu-system, (b) globalThis
  // (utilisé par les auto-callbacks). Les 2 doivent matcher.
  try {
    // Eviter cycle d'import : lecture via globalThis (= via defineProperty
    // getter installé par gba-menu-system au load).
    const viaGlobal = (globalThis as { gSaveFileStatus?: number }).gSaveFileStatus;
    console.log(`[main-menu-impl] InitMainMenu : globalThis.gSaveFileStatus=${viaGlobal} (= 1 → Continue, 0 → New Game only)`);
  } catch { /* ignore */ }
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

// ═════════════════════════════════════════════════════════════════════════
// State machine 1:1 décomp main_menu.c — CB2_InitMainMenu/CB2_MainMenu +
// Task_MainMenu* + toute la séquence Task_NewGameBirchSpeech_* + SpriteCB_*.
// Fusionnée ici ce commit depuis l'ex-`decomp-data/src/main_menu-callbacks-auto.ts`
// (@ts-nocheck) → maintenant TYPÉE. Helpers de rendu (InitMainMenu, DrawMainMenu*,
// NewGameBirchSpeech_* etc.) définis plus haut dans CE module → références directes.
// Les strings gText_* sont résolues via globalThis au runtime (chargées par
// initStringsFromDecomp) → `declare const` ci-dessous satisfait tsc sans changer
// le runtime (1:1 avec l'ancien body transpilé). Constantes déjà présentes dans
// main_menu.ts dédupées (retirées : A_BUTTON, B_BUTTON, BG_COORD_ADD, BG_COORD_SET, HAS_MYSTERY_EVENTS, SE_SELECT).
// ═════════════════════════════════════════════════════════════════════════

// gText_* / gJPText_* : symboles globaux (globalThis) chargés depuis la décomp.
declare const gJPText_No1MSubCircuit: string;
declare const gText_BatteryRunDry: string;
declare const gText_Birch_AndYouAre: string;
declare const gText_Birch_AreYouReady: string;
declare const gText_Birch_BoyOrGirl: string;
declare const gText_Birch_MainSpeech: string;
declare const gText_Birch_SoItsPlayer: string;
declare const gText_Birch_Welcome: string;
declare const gText_Birch_WhatsYourName: string;
declare const gText_Birch_YourePlayer: string;
declare const gText_MainMenuContinue: string;
declare const gText_MainMenuMysteryEvents: string;
declare const gText_MainMenuMysteryGift: string;
declare const gText_MainMenuMysteryGift2: string;
declare const gText_MainMenuNewGame: string;
declare const gText_MainMenuOption: string;
declare const gText_MysteryEventsCantUse: string;
declare const gText_MysteryGiftCantUse: string;
declare const gText_SaveFileCorrupted: string;
declare const gText_SaveFileErased: string;
declare const gText_ThisIsAPokemon: string;
declare const gText_WirelessNotConnected: string;

// Constants resolved from decomp #defines / enums / TS data modules :
const ACTION_CONTINUE = 1;
const ACTION_EREADER = 5;
const ACTION_INVALID = 6;
const ACTION_MYSTERY_EVENTS = 4;
const ACTION_MYSTERY_GIFT = 3;
const ACTION_NEW_GAME = 0;
const ACTION_OPTION = 2;
const BLDCNT_EFFECT_DARKEN = 192;
const COPYWIN_FULL = 3;
const COPYWIN_GFX = 2;
const DISPLAY_TILE_HEIGHT = 20;
const DISPLAY_TILE_WIDTH = 30;
const FONT_NORMAL = 1;
const HAS_MYSTERY_GIFT = 2;
const HAS_NO_SAVED_GAME = 0;
const HAS_SAVED_GAME = 1;
const MENU_B_PRESSED = -1;
const MUS_ROUTE122 = 374;
const NAMING_SCREEN_PLAYER = 0;
const OPTION_MENU_FLAG = 32768;
const PALETTES_OBJECTS = 4294901760;
const RTC_ERR_FLAG_MASK = 4080;
const SAVE_STATUS_CORRUPT = 2;
const SAVE_STATUS_EMPTY = 0;
const SAVE_STATUS_ERROR = 255;
const SAVE_STATUS_NO_FLASH = 4;
const SAVE_STATUS_OK = 1;
const SPECIES_LOTAD = 295;
const SPRITE_NONE = 255;
const TEXT_SKIP_DRAW = 255;
const WININ_WIN0_BG0 = 1;
const WINOUT_WIN01_BG0 = 1;
// Unresolved constants (auto-stub at 0; replace with real values when needed) :
const _UNDEFINED = 0;
// B3 fix MANUAL OVERRIDE : 1:1 décomp main_menu.c:509
//   #define NUM_PRESET_NAMES min(ARRAY_COUNT(sMalePresetNames), ARRAY_COUNT(sFemalePresetNames))
// sMalePresetNames + sFemalePresetNames ont chacun 20 entrées FR confirmées
// (cf. preset names dans main-menu-data.ts). Auto-transpiler ne résolvait pas le
// macro `min(...)` au compile-time → fallback _UNDEFINED=0 → `Math.random() % 0 = NaN`
// → preset name toujours [0] (STEF/AGNES). Hardcode à 20 pour fix le random.
// Si l'auto-transpiler est re-run, garder ce const explicite (= ne pas écraser).
const NUM_PRESET_NAMES = 20;

export type SpriteCallback = (sprite: DecompSprite, rt: DecompRuntime) => void;
export type TaskCallback = (task: DecompTask, rt: DecompRuntime) => void;
export type CB2Callback = (rt: DecompRuntime) => void;

const _emptySprite: any = { data: new Array(16).fill(0), invisible: false, x: 0, y: 0, x2: 0, y2: 0, oamIndex: 0, spriteId: -1 };
const _emptyTask: any = { data: new Array(16).fill(0), func: null, taskId: -1 };
function _gs(rt: DecompRuntime, id: number): DecompSprite { return (rt.gSprites[id] as DecompSprite) ?? _emptySprite; }
function _gt(rt: DecompRuntime, id: number): DecompTask { return (rt.gTasks[id] as DecompTask) ?? _emptyTask; }
function _palView(buf: PaletteBuffer, base: number): ArrayLike<number> {
  return new Proxy({ length: 512 }, { get(t, k) { if (k === 'length') return 512; const i = Number(k); return Number.isFinite(i) ? buf.get(base + i) : undefined; } }) as ArrayLike<number>;
}

/** Source: main_menu.c → SpriteCB_MovePlayerDownWhileShrinking */
export const SpriteCB_MovePlayerDownWhileShrinking: SpriteCallback = (sprite, rt) => {
  let y = 0;

      y = (sprite.y << 16) + sprite.data[0] + 0xC000;
      sprite.y = y >> 16;
      sprite.data[0] = y;
};

/** Source: main_menu.c (failed: empty bodyC) */
export const SpriteCB_Null: SpriteCallback = (_sprite, _rt) => { /* TODO empty bodyC */ };

/** Source: main_menu.c → Task_MainMenuCheckSaveFile */
export const Task_MainMenuCheckSaveFile: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  const data = task.data;

      if (!rt.gPaletteFade.active)
      {
          rt.SetGpuReg(REG_OFFSET_WIN0H, 0);
          rt.SetGpuReg(REG_OFFSET_WIN0V, 0);
          rt.SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG0 | WININ_WIN0_OBJ);
          rt.SetGpuReg(REG_OFFSET_WINOUT, WINOUT_WIN01_BG0 | WINOUT_WIN01_OBJ | WINOUT_WIN01_CLR);
          rt.SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_EFFECT_DARKEN | BLDCNT_TGT1_BG0);
          rt.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
          rt.SetGpuReg(REG_OFFSET_BLDY, 7);

          if (IsWirelessAdapterConnected())
              data[15] = 1;
          switch (gSaveFileStatus)
          {
              case SAVE_STATUS_OK:
                  data[0] = HAS_SAVED_GAME;
                  if (IsMysteryGiftEnabled())
                      data[0]++;
                  task.func = (t) => Task_MainMenuCheckBattery(t, rt);
                  break;
              case SAVE_STATUS_CORRUPT:
                  CreateMainMenuErrorWindow(gText_SaveFileErased);
                  data[0] = HAS_NO_SAVED_GAME;
                  task.func = (t) => Task_WaitForSaveFileErrorWindow(t, rt);
                  break;
              case SAVE_STATUS_ERROR:
                  CreateMainMenuErrorWindow(gText_SaveFileCorrupted);
                  task.func = (t) => Task_WaitForSaveFileErrorWindow(t, rt);
                  data[0] = HAS_SAVED_GAME;
                  if (IsMysteryGiftEnabled() == true)
                      data[0]++;
                  break;
              case SAVE_STATUS_EMPTY:
              default:
                  data[0] = HAS_NO_SAVED_GAME;
                  task.func = (t) => Task_MainMenuCheckBattery(t, rt);
                  break;
              case SAVE_STATUS_NO_FLASH:
                  CreateMainMenuErrorWindow(gJPText_No1MSubCircuit);
                  task.data[0] = HAS_NO_SAVED_GAME;
                  task.func = (t) => Task_WaitForSaveFileErrorWindow(t, rt);
                  break;
          }
          if ((globalThis as any).sCurrItemAndOptionMenuCheck & OPTION_MENU_FLAG)    
          {
              switch (data[0])   
              {
                  case HAS_NO_SAVED_GAME:
                  case HAS_SAVED_GAME:
                      (globalThis as any).sCurrItemAndOptionMenuCheck = data[0] + 1;
                      break;
                  case HAS_MYSTERY_GIFT:
                      (globalThis as any).sCurrItemAndOptionMenuCheck = 3;
                      break;
                  case HAS_MYSTERY_EVENTS:
                      (globalThis as any).sCurrItemAndOptionMenuCheck = 4;
                      break;
              }
          }
          (globalThis as any).sCurrItemAndOptionMenuCheck &= ~OPTION_MENU_FLAG;   
          data[1] = (globalThis as any).sCurrItemAndOptionMenuCheck;
          data[12] = data[0] + 2;
      }
};

/** Source: main_menu.c → Task_WaitForSaveFileErrorWindow */
export const Task_WaitForSaveFileErrorWindow: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  RunTextPrinters();
      if (!IsTextPrinterActive(7) && (JOY_NEW(A_BUTTON)))
      {
          ClearWindowTilemap(7);
          ClearMainMenuWindowTilemap(sWindowTemplates_MainMenu[7]);
          task.func = (t) => Task_MainMenuCheckBattery(t, rt);
      }
};

/** Source: main_menu.c → Task_MainMenuCheckBattery */
export const Task_MainMenuCheckBattery: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (!rt.gPaletteFade.active)
      {
          rt.SetGpuReg(REG_OFFSET_WIN0H, 0);
          rt.SetGpuReg(REG_OFFSET_WIN0V, 0);
          rt.SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG0 | WININ_WIN0_OBJ);
          rt.SetGpuReg(REG_OFFSET_WINOUT, WINOUT_WIN01_BG0 | WINOUT_WIN01_OBJ | WINOUT_WIN01_CLR);
          rt.SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_EFFECT_DARKEN | BLDCNT_TGT1_BG0);
          rt.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
          rt.SetGpuReg(REG_OFFSET_BLDY, 7);

          if (!(RtcGetErrorStatus() & RTC_ERR_FLAG_MASK))
          {
              task.func = (t) => Task_DisplayMainMenu(t, rt);
          }
          else
          {
              CreateMainMenuErrorWindow(gText_BatteryRunDry);
              task.func = (t) => Task_WaitForBatteryDryErrorWindow(t, rt);
          }
      }
};

/** Source: main_menu.c → Task_WaitForBatteryDryErrorWindow */
export const Task_WaitForBatteryDryErrorWindow: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  RunTextPrinters();
      if (!IsTextPrinterActive(7) && (JOY_NEW(A_BUTTON)))
      {
          ClearWindowTilemap(7);
          ClearMainMenuWindowTilemap(sWindowTemplates_MainMenu[7]);
          task.func = (t) => Task_DisplayMainMenu(t, rt);
      }
};

/** Source: main_menu.c → Task_DisplayMainMenu */
export const Task_DisplayMainMenu: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  const data = task.data;
      let palette = 0;

      if (!rt.gPaletteFade.active)
      {
          rt.SetGpuReg(REG_OFFSET_WIN0H, 0);
          rt.SetGpuReg(REG_OFFSET_WIN0V, 0);
          rt.SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG0 | WININ_WIN0_OBJ);
          rt.SetGpuReg(REG_OFFSET_WINOUT, WINOUT_WIN01_BG0 | WINOUT_WIN01_OBJ | WINOUT_WIN01_CLR);
          rt.SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_EFFECT_DARKEN | BLDCNT_TGT1_BG0);
          rt.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
          rt.SetGpuReg(REG_OFFSET_BLDY, 7);

          palette = RGB_BLACK;
          LoadPalette(palette, BG_PLTT_ID(15) + 14, PLTT_SIZEOF(1));

          palette = RGB_WHITE;
          LoadPalette(palette, BG_PLTT_ID(15) + 10, PLTT_SIZEOF(1));

          palette = RGB(12, 12, 12);
          LoadPalette(palette, BG_PLTT_ID(15) + 11, PLTT_SIZEOF(1));

          palette = RGB(26, 26, 25);
          LoadPalette(palette, BG_PLTT_ID(15) + 12, PLTT_SIZEOF(1));

           
           
          if (gSaveBlock2Ptr.playerGender == MALE)
          {
              palette = RGB(4, 16, 31);
              LoadPalette(palette, BG_PLTT_ID(15) + 1, PLTT_SIZEOF(1));
          }
          else
          {
              palette = RGB(31, 3, 21);
              LoadPalette(palette, BG_PLTT_ID(15) + 1, PLTT_SIZEOF(1));
          }

          switch (task.data[0])
          {
              case HAS_NO_SAVED_GAME:
              default:
                  FillWindowPixelBuffer(0, PIXEL_FILL(0xA));
                  FillWindowPixelBuffer(1, PIXEL_FILL(0xA));
                  AddTextPrinterParameterized3(0, FONT_NORMAL, 0, 1, sTextColor_Headers, TEXT_SKIP_DRAW, gText_MainMenuNewGame);
                  AddTextPrinterParameterized3(1, FONT_NORMAL, 0, 1, sTextColor_Headers, TEXT_SKIP_DRAW, gText_MainMenuOption);
                  PutWindowTilemap(0);
                  PutWindowTilemap(1);
                  CopyWindowToVram(0, COPYWIN_GFX);
                  CopyWindowToVram(1, COPYWIN_GFX);
                  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[0], MAIN_MENU_BORDER_TILE);
                  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[1], MAIN_MENU_BORDER_TILE);
                  break;
              case HAS_SAVED_GAME:
                  FillWindowPixelBuffer(2, PIXEL_FILL(0xA));
                  FillWindowPixelBuffer(3, PIXEL_FILL(0xA));
                  FillWindowPixelBuffer(4, PIXEL_FILL(0xA));
                  AddTextPrinterParameterized3(2, FONT_NORMAL, 0, 1, sTextColor_Headers, TEXT_SKIP_DRAW, gText_MainMenuContinue);
                  AddTextPrinterParameterized3(3, FONT_NORMAL, 0, 1, sTextColor_Headers, TEXT_SKIP_DRAW, gText_MainMenuNewGame);
                  AddTextPrinterParameterized3(4, FONT_NORMAL, 0, 1, sTextColor_Headers, TEXT_SKIP_DRAW, gText_MainMenuOption);
                  MainMenu_FormatSavegameText();
                  PutWindowTilemap(2);
                  PutWindowTilemap(3);
                  PutWindowTilemap(4);
                  CopyWindowToVram(2, COPYWIN_GFX);
                  CopyWindowToVram(3, COPYWIN_GFX);
                  CopyWindowToVram(4, COPYWIN_GFX);
                  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[2], MAIN_MENU_BORDER_TILE);
                  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[3], MAIN_MENU_BORDER_TILE);
                  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[4], MAIN_MENU_BORDER_TILE);
                  break;
              case HAS_MYSTERY_GIFT:
                  FillWindowPixelBuffer(2, PIXEL_FILL(0xA));
                  FillWindowPixelBuffer(3, PIXEL_FILL(0xA));
                  FillWindowPixelBuffer(4, PIXEL_FILL(0xA));
                  FillWindowPixelBuffer(5, PIXEL_FILL(0xA));
                  AddTextPrinterParameterized3(2, FONT_NORMAL, 0, 1, sTextColor_Headers, TEXT_SKIP_DRAW, gText_MainMenuContinue);
                  AddTextPrinterParameterized3(3, FONT_NORMAL, 0, 1, sTextColor_Headers, TEXT_SKIP_DRAW, gText_MainMenuNewGame);
                  AddTextPrinterParameterized3(4, FONT_NORMAL, 0, 1, sTextColor_Headers, TEXT_SKIP_DRAW, gText_MainMenuMysteryGift);
                  AddTextPrinterParameterized3(5, FONT_NORMAL, 0, 1, sTextColor_Headers, TEXT_SKIP_DRAW, gText_MainMenuOption);
                  MainMenu_FormatSavegameText();
                  PutWindowTilemap(2);
                  PutWindowTilemap(3);
                  PutWindowTilemap(4);
                  PutWindowTilemap(5);
                  CopyWindowToVram(2, COPYWIN_GFX);
                  CopyWindowToVram(3, COPYWIN_GFX);
                  CopyWindowToVram(4, COPYWIN_GFX);
                  CopyWindowToVram(5, COPYWIN_GFX);
                  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[2], MAIN_MENU_BORDER_TILE);
                  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[3], MAIN_MENU_BORDER_TILE);
                  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[4], MAIN_MENU_BORDER_TILE);
                  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[5], MAIN_MENU_BORDER_TILE);
                  break;
              case HAS_MYSTERY_EVENTS:
                  FillWindowPixelBuffer(2, PIXEL_FILL(0xA));
                  FillWindowPixelBuffer(3, PIXEL_FILL(0xA));
                  FillWindowPixelBuffer(4, PIXEL_FILL(0xA));
                  FillWindowPixelBuffer(5, PIXEL_FILL(0xA));
                  FillWindowPixelBuffer(6, PIXEL_FILL(0xA));
                  AddTextPrinterParameterized3(2, FONT_NORMAL, 0, 1, sTextColor_Headers, TEXT_SKIP_DRAW, gText_MainMenuContinue);
                  AddTextPrinterParameterized3(3, FONT_NORMAL, 0, 1, sTextColor_Headers, TEXT_SKIP_DRAW, gText_MainMenuNewGame);
                  AddTextPrinterParameterized3(4, FONT_NORMAL, 0, 1, sTextColor_Headers, TEXT_SKIP_DRAW, gText_MainMenuMysteryGift2);
                  AddTextPrinterParameterized3(5, FONT_NORMAL, 0, 1, sTextColor_Headers, TEXT_SKIP_DRAW, gText_MainMenuMysteryEvents);
                  AddTextPrinterParameterized3(6, FONT_NORMAL, 0, 1, sTextColor_Headers, TEXT_SKIP_DRAW, gText_MainMenuOption);
                  MainMenu_FormatSavegameText();
                  PutWindowTilemap(2);
                  PutWindowTilemap(3);
                  PutWindowTilemap(4);
                  PutWindowTilemap(5);
                  PutWindowTilemap(6);
                  CopyWindowToVram(2, COPYWIN_GFX);
                  CopyWindowToVram(3, COPYWIN_GFX);
                  CopyWindowToVram(4, COPYWIN_GFX);
                  CopyWindowToVram(5, COPYWIN_GFX);
                  CopyWindowToVram(6, COPYWIN_GFX);
                  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[2], MAIN_MENU_BORDER_TILE);
                  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[3], MAIN_MENU_BORDER_TILE);
                  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[4], MAIN_MENU_BORDER_TILE);
                  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[5], MAIN_MENU_BORDER_TILE);
                  DrawMainMenuWindowBorder(sWindowTemplates_MainMenu[6], MAIN_MENU_BORDER_TILE);
                  data[13] = AddScrollIndicatorArrowPair(sScrollArrowsTemplate_MainMenu, (globalThis as any).sCurrItemAndOptionMenuCheck);
                  _gt(rt, data[13]).func = (t) => Task_ScrollIndicatorArrowPairOnMainMenu(t, rt);
                  if ((globalThis as any).sCurrItemAndOptionMenuCheck == 4)
                  {
                      ChangeBgY(0, 0x2000, BG_COORD_ADD);
                      ChangeBgY(1, 0x2000, BG_COORD_ADD);
                      data[14] = 1;
                      _gt(rt, data[13]).data[15] = 1;
                  }
                  break;
          }
          task.func = (t) => Task_HighlightSelectedMainMenuItem(t, rt);
      }
};

/** Source: main_menu.c → Task_HighlightSelectedMainMenuItem */
export const Task_HighlightSelectedMainMenuItem: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  HighlightSelectedMainMenuItem(task.data[0], task.data[1], !!task.data[14]);
      task.func = (t) => Task_HandleMainMenuInput(t, rt);
};

/** Source: main_menu.c → Task_HandleMainMenuInput */
export const Task_HandleMainMenuInput: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (HandleMainMenuInput(taskId))
          task.func = (t) => Task_HighlightSelectedMainMenuItem(t, rt);
};

/** Source: main_menu.c → Task_HandleMainMenuAPressed */
export const Task_HandleMainMenuAPressed: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  let wirelessAdapterConnected = false;
      let action = 0;

      if (!rt.gPaletteFade.active)
      {
          if (task.data[0] == HAS_MYSTERY_EVENTS)
              RemoveScrollIndicatorArrowPair(task.data[13]);
          ClearStdWindowAndFrame(0, true);
          ClearStdWindowAndFrame(1, true);
          ClearStdWindowAndFrame(2, true);
          ClearStdWindowAndFrame(3, true);
          ClearStdWindowAndFrame(4, true);
          ClearStdWindowAndFrame(5, true);
          ClearStdWindowAndFrame(6, true);
          ClearStdWindowAndFrame(7, true);
          wirelessAdapterConnected = IsWirelessAdapterConnected();
          switch (task.data[0])
          {
              case HAS_NO_SAVED_GAME:
              default:
                  switch (task.data[1])
                  {
                      case 0:
                      default:
                          action = ACTION_NEW_GAME;
                          break;
                      case 1:
                          action = ACTION_OPTION;
                          break;
                  }
                  break;
              case HAS_SAVED_GAME:
                  switch (task.data[1])
                  {
                      case 0:
                      default:
                          action = ACTION_CONTINUE;
                          break;
                      case 1:
                          action = ACTION_NEW_GAME;
                          break;
                      case 2:
                          action = ACTION_OPTION;
                          break;
                  }
                  break;
              case HAS_MYSTERY_GIFT:
                  switch (task.data[1])
                  {
                      case 0:
                      default:
                          action = ACTION_CONTINUE;
                          break;
                      case 1:
                          action = ACTION_NEW_GAME;
                          break;
                      case 2:
                          action = ACTION_MYSTERY_GIFT;
                          if (!wirelessAdapterConnected)
                          {
                              action = ACTION_INVALID;
                              task.data[0] = HAS_NO_SAVED_GAME;
                          }
                          break;
                      case 3:
                          action = ACTION_OPTION;
                          break;
                  }
                  break;
              case HAS_MYSTERY_EVENTS:
                  switch (task.data[1])
                  {
                      case 0:
                      default:
                          action = ACTION_CONTINUE;
                          break;
                      case 1:
                          action = ACTION_NEW_GAME;
                          break;
                      case 2:
                          if (task.data[15])
                          {
                              action = ACTION_MYSTERY_GIFT;
                              if (!wirelessAdapterConnected)
                              {
                                  action = ACTION_INVALID;
                                  task.data[0] = HAS_NO_SAVED_GAME;
                              }
                          }
                          else if (wirelessAdapterConnected)
                          {
                              action = ACTION_INVALID;
                              task.data[0] = HAS_SAVED_GAME;
                          }
                          else
                          {
                              action = ACTION_EREADER;
                          }
                          break;
                      case 3:
                          if (wirelessAdapterConnected)
                          {
                              action = ACTION_INVALID;
                              task.data[0] = HAS_MYSTERY_GIFT;
                          }
                          else
                          {
                              action = ACTION_MYSTERY_EVENTS;
                          }
                          break;
                      case 4:
                          action = ACTION_OPTION;
                          break;
                  }
                  break;
          }
          ChangeBgY(0, 0, BG_COORD_SET);
          ChangeBgY(1, 0, BG_COORD_SET);
          switch (action)
          {
              case ACTION_NEW_GAME:
              default:
                  rt.gPlttBufferUnfaded.set(0, RGB_BLACK);
                  rt.gPlttBufferFaded.set(0, RGB_BLACK);
                  task.func = (t) => Task_NewGameBirchSpeech_Init(t, rt);
                  break;
              case ACTION_CONTINUE:
                  rt.gPlttBufferUnfaded.set(0, RGB_BLACK);
                  rt.gPlttBufferFaded.set(0, RGB_BLACK);
                  rt.SetMainCallback2(CB2_ContinueSavedGame);
                  rt.DestroyTask(taskId);
                  break;
              case ACTION_OPTION:
                  gMain.savedCallback = CB2_ReinitMainMenu;
                  rt.SetMainCallback2(CB2_InitOptionMenu);
                  rt.DestroyTask(taskId);
                  break;
              case ACTION_MYSTERY_GIFT:
                  // ✅ FIX session 83 audit : action gated par IsWirelessAdapterConnected(false).
                  console.warn('[main_menu] Mystery Gift unreachable (no wireless adapter in web build)');
                  rt.DestroyTask(taskId);
                  break;
              case ACTION_MYSTERY_EVENTS:
                  // ✅ FIX session 83 audit : action gated par IsWirelessAdapterConnected(false).
                  console.warn('[main_menu] Mystery Events unreachable (no wireless adapter in web build)');
                  rt.DestroyTask(taskId);
                  break;
              case ACTION_EREADER:
                  // ✅ FIX session 83 audit : action gated par IsWirelessAdapterConnected(false).
                  console.warn('[main_menu] EReader unreachable (no e-Reader cartridge in web build)');
                  rt.DestroyTask(taskId);
                  break;
              case ACTION_INVALID:
                  task.data[1] = 0;
                  task.func = (t) => Task_DisplayMainMenuInvalidActionError(t, rt);
                  rt.gPlttBufferUnfaded.set(BG_PLTT_ID(15) + 1, RGB_WHITE);
                  rt.gPlttBufferFaded.set(BG_PLTT_ID(15) + 1, RGB_WHITE);
                  rt.SetGpuReg(REG_OFFSET_BG2HOFS, 0);
                  rt.SetGpuReg(REG_OFFSET_BG2VOFS, 0);
                  rt.SetGpuReg(REG_OFFSET_BG1HOFS, 0);
                  rt.SetGpuReg(REG_OFFSET_BG1VOFS, 0);
                  rt.SetGpuReg(REG_OFFSET_BG0HOFS, 0);
                  rt.SetGpuReg(REG_OFFSET_BG0VOFS, 0);
                  rt.BeginNormalPaletteFade("PALETTES_ALL", 0, 16, 0, "RGB_BLACK");
                  return;
          }
          FreeAllWindowBuffers();
          if (action != ACTION_OPTION)
              (globalThis as any).sCurrItemAndOptionMenuCheck = 0;
          else
              (globalThis as any).sCurrItemAndOptionMenuCheck |= OPTION_MENU_FLAG;   
      }
};

/** Source: main_menu.c → Task_HandleMainMenuBPressed */
export const Task_HandleMainMenuBPressed: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (!rt.gPaletteFade.active)
      {
          if (task.data[0] == HAS_MYSTERY_EVENTS)
              RemoveScrollIndicatorArrowPair(task.data[13]);
          (globalThis as any).sCurrItemAndOptionMenuCheck = 0;
          FreeAllWindowBuffers();
          rt.SetMainCallback2(CB2_InitTitleScreen);
          rt.DestroyTask(taskId);
      }
};

/** Source: main_menu.c → Task_DisplayMainMenuInvalidActionError */
export const Task_DisplayMainMenuInvalidActionError: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  switch (task.data[1])
      {
          case 0:
              FillBgTilemapBufferRect_Palette0(0, 0, 0, 0, DISPLAY_TILE_WIDTH, DISPLAY_TILE_HEIGHT);
              switch (task.data[0])
              {
                  case 0:
                      CreateMainMenuErrorWindow(gText_WirelessNotConnected);
                      break;
                  case 1:
                      CreateMainMenuErrorWindow(gText_MysteryGiftCantUse);
                      break;
                  case 2:
                      CreateMainMenuErrorWindow(gText_MysteryEventsCantUse);
                      break;
              }
              task.data[1]++;
              break;
          case 1:
              if (!rt.gPaletteFade.active)
                  task.data[1]++;
              break;
          case 2:
              RunTextPrinters();
              if (!IsTextPrinterActive(7))
                  task.data[1]++;
              break;
          case 3:
              if (JOY_NEW(A_BUTTON | B_BUTTON))
              {
                  PlaySE(SE_SELECT);
                  rt.BeginNormalPaletteFade("PALETTES_ALL", 0, 0, 16, "RGB_BLACK");
                  task.func = (t) => Task_HandleMainMenuBPressed(t, rt);
              }
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_Init */
export const Task_NewGameBirchSpeech_Init: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  rt.SetGpuReg(REG_OFFSET_DISPCNT, 0);
      rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
      InitBgFromTemplate(sBirchBgTemplate);
      rt.SetGpuReg(REG_OFFSET_WIN0H, 0);
      rt.SetGpuReg(REG_OFFSET_WIN0V, 0);
      rt.SetGpuReg(REG_OFFSET_WININ, 0);
      rt.SetGpuReg(REG_OFFSET_WINOUT, 0);
      rt.SetGpuReg(REG_OFFSET_BLDCNT, 0);
      rt.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
      rt.SetGpuReg(REG_OFFSET_BLDY, 0);

      LZ77UnCompVram(sBirchSpeechShadowGfx, VRAM);
      LZ77UnCompVram(sBirchSpeechBgMap, (BG_SCREEN_ADDR(7)));
      LoadPalette(sBirchSpeechBgPals, BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP);
      LoadPalette(sBirchSpeechPlatformBlackPal, BG_PLTT_ID(0) + 1, PLTT_SIZEOF(8));
      ScanlineEffect_Stop();
      ResetSpriteData();
      FreeAllSpritePalettes();
      ResetAllPicSprites();
      AddBirchSpeechObjects(taskId);
      rt.BeginNormalPaletteFade("PALETTES_ALL", 0, 16, 0, "RGB_BLACK");
      task.data[4] = 0;
      task.func = (t) => Task_NewGameBirchSpeech_WaitToShowBirch(t, rt);
      task.data[2] = SPRITE_NONE;
      task.data[3] = 0xFF;
      task.data[7] = 0xD8;
      PlayBGM(MUS_ROUTE122);
      ShowBg(0);
      ShowBg(1);
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_WaitToShowBirch */
export const Task_NewGameBirchSpeech_WaitToShowBirch: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  let spriteId = 0;

      if (task.data[7])
      {
          task.data[7]--;
      }
      else
      {
          spriteId = task.data[8];
          _gs(rt, spriteId).x = 136;
          _gs(rt, spriteId).y = 60;
          _gs(rt, spriteId).invisible = false;
          rt.gba.oam[_gs(rt, spriteId).oamIndex].objMode = ST_OAM_OBJ_BLEND;
          NewGameBirchSpeech_StartFadeInTarget1OutTarget2(taskId, 10);
          NewGameBirchSpeech_StartFadePlatformOut(taskId, 20);
          task.data[7] = 80;
          task.func = (t) => Task_NewGameBirchSpeech_WaitForSpriteFadeInWelcome(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_WaitForSpriteFadeInWelcome */
export const Task_NewGameBirchSpeech_WaitForSpriteFadeInWelcome: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (task.data[5])
      {
          rt.gba.oam[_gs(rt, task.data[8]).oamIndex].objMode = ST_OAM_OBJ_NORMAL;
          if (task.data[7])
          {
              task.data[7]--;
          }
          else
          {
              InitWindows(sNewGameBirchSpeechTextWindows);
              LoadMainMenuWindowFrameTiles(0, 0xF3);
              LoadMessageBoxGfx(0, BIRCH_DLG_BASE_TILE_NUM, BG_PLTT_ID(15));
              NewGameBirchSpeech_ShowDialogueWindow(0, true);
              PutWindowTilemap(0);
              CopyWindowToVram(0, COPYWIN_GFX);
              NewGameBirchSpeech_ClearWindow(0);
              StringExpandPlaceholders(gStringVar4, gText_Birch_Welcome);
              AddTextPrinterForMessage(true);
              task.func = (t) => Task_NewGameBirchSpeech_ThisIsAPokemon(t, rt);
          }
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_ThisIsAPokemon */
export const Task_NewGameBirchSpeech_ThisIsAPokemon: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (!rt.gPaletteFade.active && !RunTextPrintersAndIsPrinter0Active())
      {
          task.func = (t) => Task_NewGameBirchSpeech_MainSpeech(t, rt);
          StringExpandPlaceholders(gStringVar4, gText_ThisIsAPokemon);
          AddTextPrinterWithCallbackForMessage(true, NewGameBirchSpeech_WaitForThisIsPokemonText);
          (globalThis as any).sBirchSpeechMainTaskId = taskId;
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_MainSpeech */
export const Task_NewGameBirchSpeech_MainSpeech: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (!RunTextPrintersAndIsPrinter0Active())
      {
          StringExpandPlaceholders(gStringVar4, gText_Birch_MainSpeech);
          AddTextPrinterForMessage(true);
          task.func = (t) => Task_NewGameBirchSpeech_AndYouAre(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeechSub_InitPokeBall */
export const Task_NewGameBirchSpeechSub_InitPokeBall: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  let spriteId = _gt(rt, (globalThis as any).sBirchSpeechMainTaskId).data[9];

      _gs(rt, spriteId).x = 100;
      _gs(rt, spriteId).y = 75;
      _gs(rt, spriteId).invisible = false;
      _gs(rt, spriteId).data[0] = 0;

      CreatePokeballSpriteToReleaseMon(spriteId, rt.gba.oam[_gs(rt, spriteId).oamIndex].paletteBank, 112, 58, 0, 0, 32, PALETTES_BG, SPECIES_LOTAD);
      task.func = (t) => Task_NewGameBirchSpeechSub_WaitForLotad(t, rt);
      _gt(rt, (globalThis as any).sBirchSpeechMainTaskId).data[7] = 0;
};

/** Source: main_menu.c → Task_NewGameBirchSpeechSub_WaitForLotad */
export const Task_NewGameBirchSpeechSub_WaitForLotad: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  const data = task.data;
      let sprite: any = _gs(rt, _gt(rt, (globalThis as any).sBirchSpeechMainTaskId).data[9]);

      switch (data[0])
      {
          case 0:
              if (sprite.callback != SpriteCallbackDummy)
                  return;
              rt.gba.oam[sprite.oamIndex].affineMode = ST_OAM_AFFINE_OFF;
              break;
          case 1:
              if (_gt(rt, (globalThis as any).sBirchSpeechMainTaskId).data[7] >= 96)
              {
                  rt.DestroyTask(taskId);
                  if (_gt(rt, (globalThis as any).sBirchSpeechMainTaskId).data[7] < 0x4000)
                      _gt(rt, (globalThis as any).sBirchSpeechMainTaskId).data[7]++;
              }
              return;
      }
      data[0]++;
      if (_gt(rt, (globalThis as any).sBirchSpeechMainTaskId).data[7] < 0x4000)
          _gt(rt, (globalThis as any).sBirchSpeechMainTaskId).data[7]++;
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_AndYouAre */
export const Task_NewGameBirchSpeech_AndYouAre: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (!RunTextPrintersAndIsPrinter0Active())
      {
          (globalThis as any).sStartedPokeBallTask = false;
          StringExpandPlaceholders(gStringVar4, gText_Birch_AndYouAre);
          AddTextPrinterForMessage(true);
          task.func = (t) => Task_NewGameBirchSpeech_StartBirchLotadPlatformFade(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_StartBirchLotadPlatformFade */
export const Task_NewGameBirchSpeech_StartBirchLotadPlatformFade: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (!RunTextPrintersAndIsPrinter0Active())
      {
          rt.gba.oam[_gs(rt, task.data[8]).oamIndex].objMode = ST_OAM_OBJ_BLEND;
          rt.gba.oam[_gs(rt, task.data[9]).oamIndex].objMode = ST_OAM_OBJ_BLEND;
          NewGameBirchSpeech_StartFadeOutTarget1InTarget2(taskId, 2);
          NewGameBirchSpeech_StartFadePlatformIn(taskId, 1);
          task.data[7] = 64;
          task.func = (t) => Task_NewGameBirchSpeech_SlidePlatformAway(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_SlidePlatformAway */
export const Task_NewGameBirchSpeech_SlidePlatformAway: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (task.data[4] != -60)
      {
          task.data[4] -= 2;
          rt.SetGpuReg(REG_OFFSET_BG1HOFS, task.data[4]);
      }
      else
      {
          task.data[4] = -60;
          task.func = (t) => Task_NewGameBirchSpeech_StartPlayerFadeIn(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_StartPlayerFadeIn */
export const Task_NewGameBirchSpeech_StartPlayerFadeIn: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (task.data[5])
      {
          _gs(rt, task.data[8]).invisible = true;
          _gs(rt, task.data[9]).invisible = true;
          if (task.data[7])
          {
              task.data[7]--;
          }
          else
          {
              let spriteId = task.data[10];

              _gs(rt, spriteId).x = 180;
              _gs(rt, spriteId).y = 60;
              _gs(rt, spriteId).invisible = false;
              rt.gba.oam[_gs(rt, spriteId).oamIndex].objMode = ST_OAM_OBJ_BLEND;
              task.data[2] = spriteId;
              task.data[6] = MALE;
              NewGameBirchSpeech_StartFadeInTarget1OutTarget2(taskId, 2);
              NewGameBirchSpeech_StartFadePlatformOut(taskId, 1);
              task.func = (t) => Task_NewGameBirchSpeech_WaitForPlayerFadeIn(t, rt);
          }
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_WaitForPlayerFadeIn */
export const Task_NewGameBirchSpeech_WaitForPlayerFadeIn: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (task.data[5])
      {
          rt.gba.oam[_gs(rt, task.data[2]).oamIndex].objMode = ST_OAM_OBJ_NORMAL;
          task.func = (t) => Task_NewGameBirchSpeech_BoyOrGirl(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_BoyOrGirl */
export const Task_NewGameBirchSpeech_BoyOrGirl: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  NewGameBirchSpeech_ClearWindow(0);
      StringExpandPlaceholders(gStringVar4, gText_Birch_BoyOrGirl);
      AddTextPrinterForMessage(true);
      task.func = (t) => Task_NewGameBirchSpeech_WaitToShowGenderMenu(t, rt);
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_WaitToShowGenderMenu */
export const Task_NewGameBirchSpeech_WaitToShowGenderMenu: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (!RunTextPrintersAndIsPrinter0Active())
      {
          NewGameBirchSpeech_ShowGenderMenu();
          task.func = (t) => Task_NewGameBirchSpeech_ChooseGender(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_ChooseGender */
export const Task_NewGameBirchSpeech_ChooseGender: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  let gender = NewGameBirchSpeech_ProcessGenderMenuInput();
      let gender2 = 0;

      switch (gender)
      {
          case MALE:
              PlaySE(SE_SELECT);
              gSaveBlock2Ptr.playerGender = gender;
              NewGameBirchSpeech_ClearGenderWindow(1, true);
              task.func = (t) => Task_NewGameBirchSpeech_WhatsYourName(t, rt);
              break;
          case FEMALE:
              PlaySE(SE_SELECT);
              gSaveBlock2Ptr.playerGender = gender;
              NewGameBirchSpeech_ClearGenderWindow(1, true);
              task.func = (t) => Task_NewGameBirchSpeech_WhatsYourName(t, rt);
              break;
      }
      gender2 = Menu_GetCursorPos();
      if (gender2 != task.data[6])
      {
          task.data[6] = gender2;
          rt.gba.oam[_gs(rt, task.data[2]).oamIndex].objMode = ST_OAM_OBJ_BLEND;
          NewGameBirchSpeech_StartFadeOutTarget1InTarget2(taskId, 0);
          task.func = (t) => Task_NewGameBirchSpeech_SlideOutOldGenderSprite(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_SlideOutOldGenderSprite */
export const Task_NewGameBirchSpeech_SlideOutOldGenderSprite: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  let spriteId = task.data[2];
      if (task.data[5] == 0)
      {
          _gs(rt, spriteId).x += 4;
      }
      else
      {
          _gs(rt, spriteId).invisible = true;
          if (task.data[6] != MALE)
              spriteId = task.data[11];
          else
              spriteId = task.data[10];
          _gs(rt, spriteId).x = DISPLAY_WIDTH;
          _gs(rt, spriteId).y = 60;
          _gs(rt, spriteId).invisible = false;
          task.data[2] = spriteId;
          rt.gba.oam[_gs(rt, spriteId).oamIndex].objMode = ST_OAM_OBJ_BLEND;
          NewGameBirchSpeech_StartFadeInTarget1OutTarget2(taskId, 0);
          task.func = (t) => Task_NewGameBirchSpeech_SlideInNewGenderSprite(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_SlideInNewGenderSprite */
export const Task_NewGameBirchSpeech_SlideInNewGenderSprite: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  let spriteId = task.data[2];

      if (_gs(rt, spriteId).x > 180)
      {
          _gs(rt, spriteId).x -= 4;
      }
      else
      {
          _gs(rt, spriteId).x = 180;
          if (task.data[5])
          {
              rt.gba.oam[_gs(rt, spriteId).oamIndex].objMode = ST_OAM_OBJ_NORMAL;
              task.func = (t) => Task_NewGameBirchSpeech_ChooseGender(t, rt);
          }
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_WhatsYourName */
export const Task_NewGameBirchSpeech_WhatsYourName: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  NewGameBirchSpeech_ClearWindow(0);
      StringExpandPlaceholders(gStringVar4, gText_Birch_WhatsYourName);
      AddTextPrinterForMessage(true);
      task.func = (t) => Task_NewGameBirchSpeech_WaitForWhatsYourNameToPrint(t, rt);
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_WaitForWhatsYourNameToPrint */
export const Task_NewGameBirchSpeech_WaitForWhatsYourNameToPrint: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (!RunTextPrintersAndIsPrinter0Active())
          task.func = (t) => Task_NewGameBirchSpeech_WaitPressBeforeNameChoice(t, rt);
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_WaitPressBeforeNameChoice */
export const Task_NewGameBirchSpeech_WaitPressBeforeNameChoice: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if ((JOY_NEW(A_BUTTON)) || (JOY_NEW(B_BUTTON)))
      {
          rt.BeginNormalPaletteFade("PALETTES_ALL", 0, 0, 16, "RGB_BLACK");
          task.func = (t) => Task_NewGameBirchSpeech_StartNamingScreen(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_StartNamingScreen */
export const Task_NewGameBirchSpeech_StartNamingScreen: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (!rt.gPaletteFade.active)
      {
          FreeAllWindowBuffers();
          FreeAndDestroyMonPicSprite(task.data[9]);
          NewGameBirchSpeech_SetDefaultPlayerName(Math.floor(Math.random() * 0x10000) % NUM_PRESET_NAMES);
          rt.DestroyTask(taskId);
          DoNamingScreen(NAMING_SCREEN_PLAYER, GetPlayerNameString(), gSaveBlock2Ptr.playerGender, 0, 0, CB2_NewGameBirchSpeech_ReturnFromNamingScreen as unknown as () => void);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_SoItsPlayerName */
export const Task_NewGameBirchSpeech_SoItsPlayerName: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  NewGameBirchSpeech_ClearWindow(0);
      StringExpandPlaceholders(gStringVar4, gText_Birch_SoItsPlayer);
      AddTextPrinterForMessage(true);
      task.func = (t) => Task_NewGameBirchSpeech_CreateNameYesNo(t, rt);
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_CreateNameYesNo */
export const Task_NewGameBirchSpeech_CreateNameYesNo: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (!RunTextPrintersAndIsPrinter0Active())
      {
          CreateYesNoMenuParameterized(2, 1, 0xF3, 0xDF, 2, 15);
          task.func = (t) => Task_NewGameBirchSpeech_ProcessNameYesNoMenu(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_ProcessNameYesNoMenu */
export const Task_NewGameBirchSpeech_ProcessNameYesNoMenu: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  switch (Menu_ProcessInputNoWrapClearOnChoose())
      {
          case 0:
              PlaySE(SE_SELECT);
              rt.gba.oam[_gs(rt, task.data[2]).oamIndex].objMode = ST_OAM_OBJ_BLEND;
              NewGameBirchSpeech_StartFadeOutTarget1InTarget2(taskId, 2);
              NewGameBirchSpeech_StartFadePlatformIn(taskId, 1);
              task.func = (t) => Task_NewGameBirchSpeech_SlidePlatformAway2(t, rt);
              break;
          case MENU_B_PRESSED:
          case 1:
              PlaySE(SE_SELECT);
              task.func = (t) => Task_NewGameBirchSpeech_BoyOrGirl(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_SlidePlatformAway2 */
export const Task_NewGameBirchSpeech_SlidePlatformAway2: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (task.data[4])
      {
          task.data[4] += 2;
          rt.SetGpuReg(REG_OFFSET_BG1HOFS, task.data[4]);
      }
      else
      {
          task.func = (t) => Task_NewGameBirchSpeech_ReshowBirchLotad(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_ReshowBirchLotad */
export const Task_NewGameBirchSpeech_ReshowBirchLotad: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  let spriteId = 0;

      if (task.data[5])
      {
          _gs(rt, task.data[10]).invisible = true;
          _gs(rt, task.data[11]).invisible = true;
          spriteId = task.data[8];
          _gs(rt, spriteId).x = 136;
          _gs(rt, spriteId).y = 60;
          _gs(rt, spriteId).invisible = false;
          rt.gba.oam[_gs(rt, spriteId).oamIndex].objMode = ST_OAM_OBJ_BLEND;
          spriteId = task.data[9];
          _gs(rt, spriteId).x = 100;
          _gs(rt, spriteId).y = 75;
          _gs(rt, spriteId).invisible = false;
          rt.gba.oam[_gs(rt, spriteId).oamIndex].objMode = ST_OAM_OBJ_BLEND;
          NewGameBirchSpeech_StartFadeInTarget1OutTarget2(taskId, 2);
          NewGameBirchSpeech_StartFadePlatformOut(taskId, 1);
          NewGameBirchSpeech_ClearWindow(0);
          StringExpandPlaceholders(gStringVar4, gText_Birch_YourePlayer);
          AddTextPrinterForMessage(true);
          task.func = (t) => Task_NewGameBirchSpeech_WaitForSpriteFadeInAndTextPrinter(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_WaitForSpriteFadeInAndTextPrinter */
export const Task_NewGameBirchSpeech_WaitForSpriteFadeInAndTextPrinter: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (task.data[5])
      {
          rt.gba.oam[_gs(rt, task.data[8]).oamIndex].objMode = ST_OAM_OBJ_NORMAL;
          rt.gba.oam[_gs(rt, task.data[9]).oamIndex].objMode = ST_OAM_OBJ_NORMAL;
          if (!RunTextPrintersAndIsPrinter0Active())
          {
              rt.gba.oam[_gs(rt, task.data[8]).oamIndex].objMode = ST_OAM_OBJ_BLEND;
              rt.gba.oam[_gs(rt, task.data[9]).oamIndex].objMode = ST_OAM_OBJ_BLEND;
              NewGameBirchSpeech_StartFadeOutTarget1InTarget2(taskId, 2);
              NewGameBirchSpeech_StartFadePlatformIn(taskId, 1);
              task.data[7] = 64;
              task.func = (t) => Task_NewGameBirchSpeech_AreYouReady(t, rt);
          }
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_AreYouReady */
export const Task_NewGameBirchSpeech_AreYouReady: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  let spriteId = 0;

      if (task.data[5])
      {
          _gs(rt, task.data[8]).invisible = true;
          _gs(rt, task.data[9]).invisible = true;
          if (task.data[7])
          {
              task.data[7]--;
              return;
          }
          if (gSaveBlock2Ptr.playerGender != MALE)
              spriteId = task.data[11];
          else
              spriteId = task.data[10];
          _gs(rt, spriteId).x = 120;
          _gs(rt, spriteId).y = 60;
          _gs(rt, spriteId).invisible = false;
          rt.gba.oam[_gs(rt, spriteId).oamIndex].objMode = ST_OAM_OBJ_BLEND;
          task.data[2] = spriteId;
          NewGameBirchSpeech_StartFadeInTarget1OutTarget2(taskId, 2);
          NewGameBirchSpeech_StartFadePlatformOut(taskId, 1);
          StringExpandPlaceholders(gStringVar4, gText_Birch_AreYouReady);
          AddTextPrinterForMessage(true);
          task.func = (t) => Task_NewGameBirchSpeech_ShrinkPlayer(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_ShrinkPlayer */
export const Task_NewGameBirchSpeech_ShrinkPlayer: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  let spriteId = 0;

      if (task.data[5])
      {
          rt.gba.oam[_gs(rt, task.data[2]).oamIndex].objMode = ST_OAM_OBJ_NORMAL;
          if (!RunTextPrintersAndIsPrinter0Active())
          {
              spriteId = task.data[2];
              rt.gba.oam[_gs(rt, spriteId).oamIndex].affineMode = ST_OAM_AFFINE_NORMAL;
              _gs(rt, spriteId).affineAnimsTableName = sSpriteAffineAnimTable_PlayerShrink;
              InitSpriteAffineAnim(_gs(rt, spriteId));
              rt.StartSpriteAffineAnim(spriteId, 0);
              rt.setSpriteCallback(spriteId, SpriteCB_MovePlayerDownWhileShrinking);
              rt.BeginNormalPaletteFade("PALETTES_BG", 0, 0, 16, "RGB_BLACK");
              FadeOutBGM(4);
              task.func = (t) => Task_NewGameBirchSpeech_WaitForPlayerShrink(t, rt);
          }
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_WaitForPlayerShrink */
export const Task_NewGameBirchSpeech_WaitForPlayerShrink: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  let spriteId = task.data[2];

      if (_gs(rt, spriteId).affineAnimEnded)
          task.func = (t) => Task_NewGameBirchSpeech_FadePlayerToWhite(t, rt);
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_FadePlayerToWhite */
export const Task_NewGameBirchSpeech_FadePlayerToWhite: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  let spriteId = 0;

      if (!rt.gPaletteFade.active)
      {
          spriteId = task.data[2];
          rt.setSpriteCallback(spriteId, SpriteCB_Null);
          rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
          rt.BeginNormalPaletteFade("PALETTES_OBJECTS", 0, 0, 16, "RGB_WHITEALPHA");
          task.func = (t) => Task_NewGameBirchSpeech_Cleanup(t, rt);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_Cleanup */
export const Task_NewGameBirchSpeech_Cleanup: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (!rt.gPaletteFade.active)
      {
          FreeAllWindowBuffers();
          FreeAndDestroyMonPicSprite(task.data[9]);
          ResetAllPicSprites();
          rt.SetMainCallback2(CB2_NewGame);
          rt.DestroyTask(taskId);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_FadeOutTarget1InTarget2 */
export const Task_NewGameBirchSpeech_FadeOutTarget1InTarget2: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  let alphaCoeff2 = 0;

      if (task.data[1] == 0)
      {
          _gt(rt, task.data[0]).data[5] = 1;
          rt.DestroyTask(taskId);
      }
      else if (task.data[4])
      {
          task.data[4]--;
      }
      else
      {
          task.data[4] = task.data[3];
          task.data[1]--;
          task.data[2]++;
          alphaCoeff2 = task.data[2] << 8;
          rt.SetGpuReg(REG_OFFSET_BLDALPHA, task.data[1] + alphaCoeff2);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_FadeInTarget1OutTarget2 */
export const Task_NewGameBirchSpeech_FadeInTarget1OutTarget2: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  let alphaCoeff2 = 0;

      if (task.data[1] == 16)
      {
          _gt(rt, task.data[0]).data[5] = 1;
          rt.DestroyTask(taskId);
      }
      else if (task.data[4])
      {
          task.data[4]--;
      }
      else
      {
          task.data[4] = task.data[3];
          task.data[1]++;
          task.data[2]--;
          alphaCoeff2 = task.data[2] << 8;
          rt.SetGpuReg(REG_OFFSET_BLDALPHA, task.data[1] + alphaCoeff2);
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_FadePlatformIn */
export const Task_NewGameBirchSpeech_FadePlatformIn: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (task.data[2])
      {
          task.data[2]--;
      }
      else if (task.data[1] == 8)
      {
          rt.DestroyTask(taskId);
      }
      else if (task.data[4])
      {
          task.data[4]--;
      }
      else
      {
          task.data[4] = task.data[3];
          task.data[1]++;
          LoadPalette(sBirchSpeechBgGradientPal[task.data[1]], BG_PLTT_ID(0) + 1, PLTT_SIZEOF(8));
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_FadePlatformOut */
export const Task_NewGameBirchSpeech_FadePlatformOut: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (task.data[2])
      {
          task.data[2]--;
      }
      else if (task.data[1] == 0)
      {
          rt.DestroyTask(taskId);
      }
      else if (task.data[4])
      {
          task.data[4]--;
      }
      else
      {
          task.data[4] = task.data[3];
          task.data[1]--;
          LoadPalette(sBirchSpeechBgGradientPal[task.data[1]], BG_PLTT_ID(0) + 1, PLTT_SIZEOF(8));
      }
};

/** Source: main_menu.c → Task_NewGameBirchSpeech_ReturnFromNamingScreenShowTextbox */
export const Task_NewGameBirchSpeech_ReturnFromNamingScreenShowTextbox: TaskCallback = (task, rt) => {
  const taskId = task.taskId;
  if (task.data[7]-- <= 0)
      {
          NewGameBirchSpeech_ShowDialogueWindow(0, true);
          task.func = (t) => Task_NewGameBirchSpeech_SoItsPlayerName(t, rt);
      }
};

/** Source: main_menu.c → CB2_MainMenu */
export const CB2_MainMenu: CB2Callback = (rt) => {
  RunTasks();
      AnimateSprites();
      BuildOamBuffer();
      UpdatePaletteFade();
};

/** Source: main_menu.c → CB2_InitMainMenu */
export const CB2_InitMainMenu: CB2Callback = (rt) => {
    InitMainMenu(false);
};

/** Source: main_menu.c → CB2_ReinitMainMenu */
export const CB2_ReinitMainMenu: CB2Callback = (rt) => {
  InitMainMenu(true);
};

/** Source: main_menu.c → CB2_NewGameBirchSpeech_ReturnFromNamingScreen */
export const CB2_NewGameBirchSpeech_ReturnFromNamingScreen: CB2Callback = (rt) => {
  let taskId = 0;
      let spriteId = 0;
      let savedIme = 0;

      ResetBgsAndClearDma3BusyFlags(0);
      rt.SetGpuReg(REG_OFFSET_DISPCNT, 0);
      rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
      InitBgsFromTemplates(0, sMainMenuBgTemplates, ((sMainMenuBgTemplates)?.length ?? 0));
      InitBgFromTemplate(sBirchBgTemplate);
      rt.SetVBlankCallback(VBlankCB);
      rt.SetGpuReg(REG_OFFSET_BG2CNT, 0);
      rt.SetGpuReg(REG_OFFSET_BG1CNT, 0);
      rt.SetGpuReg(REG_OFFSET_BG0CNT, 0);
      rt.SetGpuReg(REG_OFFSET_BG2HOFS, 0);
      rt.SetGpuReg(REG_OFFSET_BG2VOFS, 0);
      rt.SetGpuReg(REG_OFFSET_BG1HOFS, 0);
      rt.SetGpuReg(REG_OFFSET_BG1VOFS, 0);
      rt.SetGpuReg(REG_OFFSET_BG0HOFS, 0);
      rt.SetGpuReg(REG_OFFSET_BG0VOFS, 0);
      DmaFill16(3, 0, VRAM, VRAM_SIZE);
      DmaFill32(3, 0, OAM, OAM_SIZE);
      DmaFill16(3, 0, PLTT, PLTT_SIZE);
      ResetPaletteFade();
      LZ77UnCompVram(sBirchSpeechShadowGfx, VRAM);
      LZ77UnCompVram(sBirchSpeechBgMap, (BG_SCREEN_ADDR(7)));
      LoadPalette(sBirchSpeechBgPals, BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP);
      LoadPalette(sBirchSpeechBgGradientPal[1], BG_PLTT_ID(0) + 1, PLTT_SIZEOF(8));
      ResetTasks();
      taskId = rt.CreateTask((t) => Task_NewGameBirchSpeech_ReturnFromNamingScreenShowTextbox(t, rt), 0);
      // ✅ FIX session Phase E : `task` undefined dans CB2 scope → use _gt helper (analogue PATCH O1).
      const task = _gt(rt, taskId);
      task.data[7] = 5;
      task.data[4] = -60;
      ScanlineEffect_Stop();
      ResetSpriteData();
      FreeAllSpritePalettes();
      ResetAllPicSprites();
      AddBirchSpeechObjects(taskId);
      if (gSaveBlock2Ptr.playerGender != MALE)
      {
          task.data[6] = FEMALE;
          spriteId = task.data[11];
      }
      else
      {
          task.data[6] = MALE;
          spriteId = task.data[10];
      }
      _gs(rt, spriteId).x = 180;
      _gs(rt, spriteId).y = 60;
      _gs(rt, spriteId).invisible = false;
      task.data[2] = spriteId;
      rt.SetGpuReg(REG_OFFSET_BG1HOFS, -60);
      rt.BeginNormalPaletteFade("PALETTES_ALL", 0, 16, 0, "RGB_BLACK");
      rt.SetGpuReg(REG_OFFSET_WIN0H, 0);
      rt.SetGpuReg(REG_OFFSET_WIN0V, 0);
      rt.SetGpuReg(REG_OFFSET_WININ, 0);
      rt.SetGpuReg(REG_OFFSET_WINOUT, 0);
      rt.SetGpuReg(REG_OFFSET_BLDCNT, 0);
      rt.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
      rt.SetGpuReg(REG_OFFSET_BLDY, 0);
      ShowBg(0);
      ShowBg(1);
      savedIme = gbaIoRegs.REG_IME;
      gbaIoRegs.REG_IME = 0;
      gbaIoRegs.REG_IE |= 1;
      gbaIoRegs.REG_IME = savedIme;
      rt.SetVBlankCallback(VBlankCB);
      rt.SetMainCallback2(CB2_MainMenu);
      InitWindows(sNewGameBirchSpeechTextWindows);
      LoadMainMenuWindowFrameTiles(0, 0xF3);
      LoadMessageBoxGfx(0, BIRCH_DLG_BASE_TILE_NUM, BG_PLTT_ID(15));
      PutWindowTilemap(0);
      CopyWindowToVram(0, COPYWIN_FULL);
};

/** ⚠️ Generic patch (post-transpile-patches.mjs) — VBlankCB no-op.
 *  Notre runtime call TransferPlttBuffer auto si vblankCallback non-null,
 *  donc le scene-side VBlankCB est essentiellement un marqueur "transfer ON". */
const VBlankCB: () => void = () => { /* no-op */ };
