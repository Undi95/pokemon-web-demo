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
import { getRuntime, assetCache } from '../harness/runtime/decomp-globals';
import { IndexOfSpritePaletteTag, GetSpriteTileStartByTag, ResetSpriteData, DestroySprite, AllocOamMatrix, FreeOamMatrix } from './sprite';
import { GetWindowFrameTilesPal } from './text_window';
import { EXT_CTRL_CODE_PAUSE } from './engine/decomp-data/include/constants/characters-data';
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
} from './engine/ui/gba-window-system';
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
import { sMainMenuBgTemplates, sWindowTemplates_MainMenu, sNewGameBirchSpeechTextWindows, MAIN_MENU_BORDER_TILE, ENUM_HAS_0 } from './engine/decomp-data/main-menu-data';
import {
  Task_MainMenuCheckSaveFile,
  CB2_MainMenu,
  Task_HandleMainMenuAPressed,
  Task_HandleMainMenuBPressed,
  Task_NewGameBirchSpeech_FadeInTarget1OutTarget2,
  Task_NewGameBirchSpeech_FadeOutTarget1InTarget2,
  Task_NewGameBirchSpeech_FadePlatformIn,
  Task_NewGameBirchSpeech_FadePlatformOut,
  Task_NewGameBirchSpeechSub_InitPokeBall,
} from './engine/decomp-data/src/main_menu-callbacks-auto';
import {
  A_BUTTON, B_BUTTON, DPAD_UP, DPAD_DOWN,
  IsWirelessAdapterConnected,
  CreateYesNoMenu,
  Menu_ProcessInputNoWrapClearOnChoose,
  Menu_ProcessInputNoWrap,
  InitMenuInUpperLeftCornerNormal,
  gSaveBlock2Ptr,
} from './engine/ui/gba-menu-system';
import { CreateWindowTemplate, FillWindowPixelBuffer, FillWindowPixelRect, PutWindowTilemap, CopyWindowToVram, ClearStdWindowAndFrame } from './engine/ui/gba-window-system';
import { AddTextPrinterParameterized3, GetStringRightAlignXOffset, sTextColor_MenuInfo } from './engine/ui/gba-text-system';
import { getString } from './engine/ui/gba-strings';
import { FlagGet } from './engine/script/script-vars';
import { SE_SELECT as _SE_SELECT } from './engine/decomp-data/include/constants/songs-data';

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
// TODO Phase D : étendre `scripts/extract-main-menu-data.mjs` (à créer) pour
// parser ces structs depuis le décomp + générer dans `decomp-data/src/main_menu-data.ts`.
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
      // A2 fix : 1:1 décomp main_menu.c:908-921 + bg.h:24-28 enum
      //   { BG_COORD_SET=0, BG_COORD_ADD=1, BG_COORD_SUB=2 }.
      // DPAD_UP = scrolling vers entry du haut → décomp utilise BG_COORD_SUB.
      // Ancien littéral `1` était BG_COORD_ADD (= scroll dans le mauvais sens).
      ChangeBgY(0, 0x2000, BG_COORD_SUB);
      ChangeBgY(1, 0x2000, BG_COORD_SUB);
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
      // A2 fix : DPAD_DOWN = scrolling vers entry du bas → décomp utilise
      // BG_COORD_ADD. Ancien littéral `0` était BG_COORD_SET (= reset BG Y,
      // pas un add). Cf. bg.h:24-28.
      ChangeBgY(0, 0x2000, BG_COORD_ADD);
      ChangeBgY(1, 0x2000, BG_COORD_ADD);
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
  const playerName = String(sb2.playerName ?? '???');
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
    AddTextPrinterParameterized3(WIN_CONTINUE, FONT_NORMAL, 0, 33, colorMenuInfo, TEXT_SKIP_DRAW, 'POKéDEX');
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
  const task = rt.gTasks.get(taskId);
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
  DestroySprite(rt, spriteId);
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
  ResetSpriteData(rt);
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
