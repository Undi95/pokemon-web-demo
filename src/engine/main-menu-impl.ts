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
import { getRuntime, getAsset } from './decomp-globals';
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
import { sMainMenuBgTemplates, sWindowTemplates_MainMenu, MAIN_MENU_BORDER_TILE, ENUM_HAS_0 } from './decomp-data/main-menu-data';
import {
  Task_MainMenuCheckSaveFile,
  CB2_MainMenu,
  Task_HandleMainMenuAPressed,
  Task_HandleMainMenuBPressed,
} from './decomp-data/auto/src/main_menu-callbacks-auto';
import {
  A_BUTTON, B_BUTTON, DPAD_UP, DPAD_DOWN,
  IsWirelessAdapterConnected,
  gSaveBlock2Ptr,
} from './gba-menu-system';

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

export const sSpriteAffineAnimTable_PlayerShrink: unknown[] = [];
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
export const sBirchSpeechBgMap = 'sBirchSpeechBgMap';
(globalThis as Record<string, unknown>).sBirchSpeechBgMap = sBirchSpeechBgMap;
export const sBirchSpeechBgPals = 'sBirchSpeechBgPals';
(globalThis as Record<string, unknown>).sBirchSpeechBgPals = sBirchSpeechBgPals;
export const sBirchSpeechPlatformBlackPal = 'sBirchSpeechPlatformBlackPal';
(globalThis as Record<string, unknown>).sBirchSpeechPlatformBlackPal = sBirchSpeechPlatformBlackPal;
// 1:1 décomp sBirchSpeechBgGradientPal[3] — 3 gradient palettes alternatives.
// String-symbol pour chaque (= asset cache lookup).
export const sBirchSpeechBgGradientPal = [
  'sBirchSpeechBgGradientPal_0',
  'sBirchSpeechBgGradientPal_1',
  'sBirchSpeechBgGradientPal_2',
];
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

export function CreateMainMenuErrorWindow(_text: string): void {
  // TODO Phase D : afficher une fenêtre d'erreur avec _text.
  console.warn('[main-menu-impl] CreateMainMenuErrorWindow:', _text);
}

// ─── Birch Speech helpers stubs (Phase D — à implémenter pour Birch flow) ────

export function NewGameBirchSpeech_ClearWindow(_windowId: number): void {
  // TODO Phase D : effacer la fenêtre dialogue.
}

export function NewGameBirchSpeech_ShowDialogueWindow(_windowId: number, _copyToVram: boolean): void {
  // TODO Phase D : afficher la fenêtre dialogue.
}

export function NewGameBirchSpeech_ClearGenderWindow(_windowId: number, _copyToVram: boolean): void {
  // TODO Phase D : effacer la fenêtre genre.
}

export function NewGameBirchSpeech_ShowGenderMenu(): void {
  // TODO Phase D : afficher le menu genre via CreateYesNoMenu pattern.
}

export function NewGameBirchSpeech_ProcessGenderMenuInput(): number {
  // TODO Phase D : process input du menu genre. Pour l'instant return -1
  // (= still processing) pour ne pas avancer le flow tant que pas implémenté.
  return -1;
}

export function NewGameBirchSpeech_SetDefaultPlayerName(_presetIndex: number): void {
  // TODO Phase D : définir le nom par défaut du joueur via gSaveBlock2Ptr.playerName.
}

export function NewGameBirchSpeech_CreateNameYesNo(_windowId: number): void {
  // TODO Phase D : créer le menu Yes/No pour le nom.
}

// Phase D-cleanup audit session 83 : stubs déplacés depuis decomp-globals.ts
// (= ils étaient hors-scope là-bas car scene-Birch-specific). Tous /* TODO */
// stubs en attendant Phase D Birch implementation.

/** 1:1 décomp main_menu.c AddBirchSpeechObjects — créé Birch sprite + Lotad
 *  + player + platform sprites. TODO Phase D. */
export function AddBirchSpeechObjects(_taskId: number): void { /* TODO Phase D */ }

/** 1:1 décomp main_menu.c NewGameBirchSpeech_StartFadeInTarget1OutTarget2 —
 *  cross-fade BG1 (Birch) ↔ BG0 (player) via BLDCNT. TODO Phase D. */
export function NewGameBirchSpeech_StartFadeInTarget1OutTarget2(_taskId: number, _delay: number): void { /* TODO Phase D */ }

/** Inverse de StartFadeInTarget1OutTarget2 (= cross-fade dans l'autre sens). */
export function NewGameBirchSpeech_StartFadeOutTarget1InTarget2(_taskId: number, _delay: number): void { /* TODO Phase D */ }

/** Fade-in du platform sprite (= ombre sous Birch/Lotad). */
export function NewGameBirchSpeech_StartFadePlatformIn(_taskId: number, _delay: number): void { /* TODO Phase D */ }

/** Fade-out du platform sprite. */
export function NewGameBirchSpeech_StartFadePlatformOut(_taskId: number, _delay: number): void { /* TODO Phase D */ }

export function DoNamingScreen(_type: number, _dest: unknown, _gender: number): void {
  // TODO Phase D : transition vers l'écran de nom (= naming_screen scene).
  console.warn('[main-menu-impl] DoNamingScreen not implemented');
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
  // Load menu palettes (= AVANT le fade pour que les couleurs soient dans
  // gPlttBufferUnfaded au moment où le fade commence).
  const bgPal = getAsset('sMainMenuBgPal');
  const textPal = getAsset('sMainMenuTextPal');
  console.log('[InitMainMenu] sMainMenuBgPal cached?', !!bgPal, 'len', bgPal?.length ?? 0);
  console.log('[InitMainMenu] sMainMenuTextPal cached?', !!textPal, 'len', textPal?.length ?? 0);
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
