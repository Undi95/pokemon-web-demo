/**
 * option-menu-impl.ts
 * --------------------
 * Helpers 1:1 décomp `src/option_menu.c` qui complètent le state machine
 * auto-transpilé `option_menu-callbacks-auto.ts`. Toute l'architecture rendu
 * passe par notre engine GBA-style (LoadBgTiles / FillBgTilemapBufferRect /
 * AddTextPrinterParameterized3 / SetGpuReg). ZÉRO Phaser-canvas hack ici (vs
 * legacy `OptionMenuScene.ts` qui composait du PNG côté Phaser).
 *
 * Architecture :
 *   - WIN_HEADER : BG1, 26×2 tiles, baseBlock=2, palette=1 (= "OPTIONS" header)
 *   - WIN_OPTIONS : BG0, 26×14 tiles, baseBlock=0x36, palette=1 (= 7 lines)
 *   - Frame tiles : 9 tiles loaded à VRAM offset 0x1A2 sur BG1 charBase=1
 *     (= LoadBgTiles(1, gFrameXTiles, 0x120, 0x1A2)).
 *   - Highlight : SetGpuReg WIN0H/V → BG0 darken via BLDY=4 dans la fenêtre.
 *
 * Dépendances :
 *   - `gTextWindowFrameN_Gfx/Pal` cached (= preloadOptionMenuAssets).
 *   - `gSaveBlock2Ptr` augmenté avec optionsTextSpeed/Sound/etc.
 *   - Helpers exposés sur globalThis pour l'auto file (= ts-nocheck eval scope).
 */
import { getRuntime as _getRt, getAsset, assetCache } from './decomp-globals';
import {
  LoadBgTiles, LoadPalette, FillBgTilemapBufferRect, CopyWindowToVram, PutWindowTilemap,
  AddTextPrinterParameterized3, FillWindowPixelBuffer,
} from './decomp-globals';
import { FillWindowPixelRect } from './gba-window-system';
import { GetStringRightAlignXOffset } from './gba-text-system';
import { WINDOW_FRAMES_COUNT, GetWindowFrameTilesPal, preloadTextWindowFrames } from './gba-text-window';
import { BG_PLTT_ID, REG_OFFSET_WIN0H, REG_OFFSET_WIN0V } from './decomp-runtime';
import { PLTT_SIZE_4BPP, WIN_RANGE } from './decomp-helpers';
import { JOY_NEW } from './decomp-globals';
import { gSaveBlock2Ptr } from './gba-menu-system';
import { loadGbaPal } from './gba/png-loader';

// ─── State globals ───────────────────────────────────────────────────────────

/** 1:1 décomp `EWRAM_DATA bool8 sArrowPressed`. Set par *_ProcessInput,
 *  consumé par Task_OptionMenuProcessInput pour CopyWindowToVram. */
let sArrowPressed = false;
export function getSArrowPressed(): boolean { return sArrowPressed; }
export function setSArrowPressed(v: boolean): void { sArrowPressed = v; }

// ─── Const layout (1:1 décomp option_menu.c:90-111 + helpers) ───────────────

const A_BUTTON = 1;
const B_BUTTON = 2;
const DPAD_LEFT = 0x20;
const DPAD_RIGHT = 0x10;
const WIN_HEADER = 0;
const WIN_OPTIONS = 1;

// WINDOW_FRAMES_COUNT importé depuis gba-text-window (= foundation partagée).

// 1:1 décomp option_menu.c YPOS macros = MENUITEM * 16
const Y_TEXTSPEED = 0;
const Y_BATTLESCENE = 1 * 16;
const Y_BATTLESTYLE = 2 * 16;
const Y_SOUND = 3 * 16;
const Y_BUTTONMODE = 4 * 16;
const Y_FRAMETYPE = 5 * 16;

// 1:1 décomp option_menu.c:374-378 HighlightOptionMenuItem
const HIGHLIGHT_X_LEFT = 16;
const HIGHLIGHT_X_RIGHT = 240 - 16;
const HIGHLIGHT_Y_OFFSET = 40;
const HIGHLIGHT_ROW_HEIGHT = 16;

// 1:1 décomp option_menu.c:380-396 DrawOptionMenuChoice color codes
const TEXT_COLOR_TRANSPARENT = 0;
const TEXT_COLOR_DARK_GRAY = 2;
const TEXT_COLOR_WHITE = 1;
const TEXT_COLOR_LIGHT_GRAY = 3;
const TEXT_COLOR_RED = 4;
const TEXT_COLOR_LIGHT_RED = 5;

/** 1:1 décomp option_menu.c FONT_NORMAL default :
 *  [bgColor, fgColor, shadowColor] = [WHITE, DARK_GRAY, LIGHT_GRAY] = [1, 2, 3]
 *  (cf. text.c:131 sFontInfos[FONT_NORMAL]).
 *
 *  ⚠️ IMPORTANT : bgColor=WHITE (1), pas TRANSPARENT (0). Sinon les pixels idx 3
 *  des glyphs (= "BOX_FILL" autour du glyph) s'affichent en TRANSPARENT →
 *  fall-through au backdrop (= lavender) → "boîtes lavender visibles autour de
 *  chaque glyph". Avec bg=WHITE, idx 3 = WHITE = matche FillWindowPixelBuffer(1)
 *  → invisible (= pas de boîtes). Cf. décomp utilise `AddTextPrinterParameterized`
 *  (sans 3) dans option_menu, qui prend bgColor=1 du FONT_NORMAL default. */
const TEXT_COLOR_NORMAL: readonly number[] = [TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY];
/** Highlight (red) variant — used when style=1 in DrawOptionMenuChoice. */
const TEXT_COLOR_HIGHLIGHT: readonly number[] = [TEXT_COLOR_WHITE, TEXT_COLOR_RED, TEXT_COLOR_LIGHT_RED];

// 1:1 décomp option_menu.c:79-88 sOptionMenuItemsNames
const ITEM_LABEL_KEYS = [
  'gText_TextSpeed',         // 0 MENUITEM_TEXTSPEED
  'gText_BattleScene',       // 1 MENUITEM_BATTLESCENE
  'gText_BattleStyle',       // 2 MENUITEM_BATTLESTYLE
  'gText_Sound',             // 3 MENUITEM_SOUND
  'gText_ButtonMode',        // 4 MENUITEM_BUTTONMODE
  'gText_Frame',             // 5 MENUITEM_FRAMETYPE
  'gText_OptionMenuCancel',  // 6 MENUITEM_CANCEL
];

// ─── Asset preload ───────────────────────────────────────────────────────────

/** Pré-charge les assets spécifiques au option menu (= juste la palette texte
 *  à part des frame tiles partagées). Les 20 frames sont chargées via
 *  preloadTextWindowFrames() (= foundation partagée gba-text-window). */
export async function preloadOptionMenuAssets(): Promise<void> {
  const tasks: Promise<void>[] = [];
  // sOptionMenuText_Pal (= 16 colors RGB15) — spécifique option menu.
  if (!assetCache.has('sOptionMenuText_Pal')) {
    tasks.push(
      loadGbaPal('/decomp/em/ui/interface/option_menu_text.pal').then(p => {
        assetCache.set('sOptionMenuText_Pal', p);
      }).catch(e => console.warn('[option-menu] sOptionMenuText_Pal load failed:', e))
    );
  }
  // Frame tiles partagés (= main menu, dialogues, etc. l'utilisent aussi).
  tasks.push(preloadTextWindowFrames());
  await Promise.all(tasks);
}

// ─── Helpers de rendu ────────────────────────────────────────────────────────

/** 1:1 décomp option_menu.c:621-626 DrawHeaderText. */
export function DrawHeaderText(): void {
  // FillWindowPixelBuffer(WIN_HEADER, PIXEL_FILL(1)) — fill window BG color 1
  FillWindowPixelBuffer(WIN_HEADER, 0x11); // PIXEL_FILL(1) = (1<<4)|1 = 0x11 (4bpp packed)
  const text = String((globalThis as any).gText_Option ?? 'OPTIONS');
  AddTextPrinterParameterized3(WIN_HEADER, 0, 8, 1, TEXT_COLOR_NORMAL, 255, text);
  PutWindowTilemap(WIN_HEADER);
  CopyWindowToVram(WIN_HEADER, 3);
}

/** 1:1 décomp option_menu.c:628-636 DrawOptionMenuTexts.
 *  Render les 7 labels en colonne gauche (= ITEM_LABEL_X=8). */
export function DrawOptionMenuTexts(): void {
  // FillWindowPixelBuffer(WIN_OPTIONS, PIXEL_FILL(1))
  FillWindowPixelBuffer(WIN_OPTIONS, 0x11);
  for (let i = 0; i < ITEM_LABEL_KEYS.length; i++) {
    const labelText = String((globalThis as any)[ITEM_LABEL_KEYS[i]] ?? ITEM_LABEL_KEYS[i]);
    AddTextPrinterParameterized3(WIN_OPTIONS, 0, 8, i * 16 + 1, TEXT_COLOR_NORMAL, 255, labelText);
  }
  CopyWindowToVram(WIN_OPTIONS, 3);
}

/** 1:1 décomp option_menu.c:647-671 DrawBgWindowFrames.
 *  Pose 9 border tiles (TL/T/TR/L/R/BL/B/BR) sur BG1 tilemap pour HEADER + OPTIONS. */
export function DrawBgWindowFrames(): void {
  // Tiles indices : 0x1A2-0x1AA (= 418-426). LoadBgTiles a placé 9 tiles à
  // ces indices dans BG1 charBase=1. Maintenant on rempli BG1 tilemap (= mapBase=30)
  // avec ces tile IDs.
  const TL = 0x1A2, T = 0x1A3, TR = 0x1A4;
  const L  = 0x1A5,           R  = 0x1A7;
  const BL = 0x1A8, B = 0x1A9, BR = 0x1AA;
  // Palette bank 7 (= où GetWindowFrameTilesPal()->pal a été loaded).
  const PAL = 7;
  const BG1 = 1;

  // Frame HEADER : tiles (1,0)-(28,3), inner (2,1)-(27,2)
  // Frame OPTIONS : tiles (1,4)-(28,19), inner (2,5)-(27,18)
  const headers = [
    { tileL: 1, tileT: 0,  tileR: 28, tileB: 3  },
    { tileL: 1, tileT: 4,  tileR: 28, tileB: 19 },
  ];
  for (const f of headers) {
    const innerW = (f.tileR - f.tileL - 1);
    const innerH = (f.tileB - f.tileT - 1);
    // Top row
    FillBgTilemapBufferRect(BG1, TL, f.tileL,         f.tileT, 1, 1, PAL);
    FillBgTilemapBufferRect(BG1, T,  f.tileL + 1,     f.tileT, innerW, 1, PAL);
    FillBgTilemapBufferRect(BG1, TR, f.tileL + innerW + 1, f.tileT, 1, 1, PAL);
    // Middle rows (left + right edges)
    FillBgTilemapBufferRect(BG1, L,  f.tileL,                 f.tileT + 1, 1, innerH, PAL);
    FillBgTilemapBufferRect(BG1, R,  f.tileL + innerW + 1,    f.tileT + 1, 1, innerH, PAL);
    // Bottom row
    FillBgTilemapBufferRect(BG1, BL, f.tileL,                 f.tileB, 1, 1, PAL);
    FillBgTilemapBufferRect(BG1, B,  f.tileL + 1,             f.tileB, innerW, 1, PAL);
    FillBgTilemapBufferRect(BG1, BR, f.tileL + innerW + 1,    f.tileB, 1, 1, PAL);
  }
  // CopyBgTilemapBufferToVram pour BG1 — pour l'instant, écriture directe via
  // FillBgTilemapBufferRect (pas de buffer intermédiaire).
}

/** 1:1 décomp option_menu.c:374-378 HighlightOptionMenuItem.
 *  WIN0H = (16, 224), WIN0V = (idx*16+40, idx*16+56). */
export function HighlightOptionMenuItem(idx: number): void {
  const r = _getRt();
  if (!r) return;
  r.SetGpuReg(REG_OFFSET_WIN0H, WIN_RANGE(HIGHLIGHT_X_LEFT, HIGHLIGHT_X_RIGHT));
  r.SetGpuReg(REG_OFFSET_WIN0V, WIN_RANGE(idx * HIGHLIGHT_ROW_HEIGHT + HIGHLIGHT_Y_OFFSET, idx * HIGHLIGHT_ROW_HEIGHT + HIGHLIGHT_Y_OFFSET + HIGHLIGHT_ROW_HEIGHT));
}

/** 1:1 décomp option_menu.c:380-396 DrawOptionMenuChoice.
 *  Décomp logic : recopie le text byte-par-byte dans un buffer dst[16], puis
 *  si style==1 patch dst[2]=TEXT_COLOR_RED et dst[5]=TEXT_COLOR_LIGHT_RED.
 *  Cela suppose que le text commence par `[FC, 01, COLOR, FC, 03, SHADOW, …]`
 *  (= prefix `{COLOR X}{SHADOW Y}` 6 bytes encodés).
 *
 *  Notre version : on travaille avec strings non-encodées, donc on string-replace
 *  `{COLOR X}{SHADOW Y}` vers `{COLOR RED}{SHADOW LIGHT_RED}` quand style=1.
 *  Effet visuel identique (= les inline codes overrident le colorArray du printer). */
export function DrawOptionMenuChoice(text: string, x: number, y: number, style: number): void {
  let renderText = text;
  if (style === 1) {
    // Patch les premiers {COLOR …}/{SHADOW …} pour passer en RED/LIGHT_RED.
    renderText = renderText
      .replace(/\{COLOR\s+\w+\}/, '{COLOR RED}')
      .replace(/\{SHADOW\s+\w+\}/, '{SHADOW LIGHT_RED}');
  }
  AddTextPrinterParameterized3(WIN_OPTIONS, 0, x, y + 1, TEXT_COLOR_NORMAL, 255, renderText);
}

// ─── Per-option Draw + Process helpers ──────────────────────────────────────

/** Helper : récupère la string décomp depuis le globalThis populé par initStringsFromDecomp. */
function gs(key: string): string {
  return String((globalThis as any)[key] ?? key);
}

// Phase B audit session 83 : delégation à GetStringRightAlignXOffset (=
// vraie pixel width via glyphWidths chargés depuis font-widths.json) au lieu
// de l'ancienne approximation `~6px/char`. Élimine le décalage visuel sur
// strings type "STÉRÉO" / "L=A" / "FAST" qui sont +/- larges qu'attendu.
//
// Wrapper local pour rester proche du signature du décomp (= GetStringRightAlignXOffset
// prend FONT_NORMAL implicite ; nous n'avons que FONT_NORMAL pour l'instant).
function rightAlignX(text: string, rightX: number): number {
  return GetStringRightAlignXOffset(text, rightX);
}

/** 1:1 décomp option_menu.c:421-442 TextSpeed_DrawChoices. */
export function TextSpeed_DrawChoices(selection: number): void {
  const styles = [0, 0, 0]; styles[selection] = 1;
  const slow = gs('gText_TextSpeedSlow');
  const mid  = gs('gText_TextSpeedMid');
  const fast = gs('gText_TextSpeedFast');
  DrawOptionMenuChoice(slow, 104, Y_TEXTSPEED, styles[0]);
  // xMid : decomp `(widthSlow - (widthMid - 94) - widthFast) / 2 + 104`.
  // Approximation : entre slow et fast, centré.
  DrawOptionMenuChoice(mid, 152, Y_TEXTSPEED, styles[1]);
  DrawOptionMenuChoice(fast, rightAlignX(fast, 198), Y_TEXTSPEED, styles[2]);
}

/** 1:1 décomp option_menu.c:455-465 BattleScene_DrawChoices. */
export function BattleScene_DrawChoices(selection: number): void {
  const styles = [0, 0]; styles[selection] = 1;
  const on = gs('gText_BattleSceneOn');
  const off = gs('gText_BattleSceneOff');
  DrawOptionMenuChoice(on,  104, Y_BATTLESCENE, styles[0]);
  DrawOptionMenuChoice(off, rightAlignX(off, 198), Y_BATTLESCENE, styles[1]);
}

/** 1:1 décomp option_menu.c:478-488 BattleStyle_DrawChoices. */
export function BattleStyle_DrawChoices(selection: number): void {
  const styles = [0, 0]; styles[selection] = 1;
  const shift = gs('gText_BattleStyleShift');
  const set = gs('gText_BattleStyleSet');
  DrawOptionMenuChoice(shift, 104, Y_BATTLESTYLE, styles[0]);
  DrawOptionMenuChoice(set, rightAlignX(set, 198), Y_BATTLESTYLE, styles[1]);
}

/** 1:1 décomp option_menu.c:502-512 Sound_DrawChoices. */
export function Sound_DrawChoices(selection: number): void {
  const styles = [0, 0]; styles[selection] = 1;
  const mono = gs('gText_SoundMono');
  const stereo = gs('gText_SoundStereo');
  DrawOptionMenuChoice(mono,   104, Y_SOUND, styles[0]);
  DrawOptionMenuChoice(stereo, rightAlignX(stereo, 198), Y_SOUND, styles[1]);
}

/** 1:1 décomp option_menu.c:598-619 ButtonMode_DrawChoices. */
export function ButtonMode_DrawChoices(selection: number): void {
  const styles = [0, 0, 0]; styles[selection] = 1;
  const normal = gs('gText_ButtonTypeNormal');
  const lr = gs('gText_ButtonTypeLR');
  const lea = gs('gText_ButtonTypeLEqualsA');
  DrawOptionMenuChoice(normal, 104, Y_BUTTONMODE, styles[0]);
  DrawOptionMenuChoice(lr,     156, Y_BUTTONMODE, styles[1]);
  DrawOptionMenuChoice(lea,    rightAlignX(lea, 198), Y_BUTTONMODE, styles[2]);
}

/** 1:1 décomp option_menu.c:541-573 FrameType_DrawChoices.
 *  Affiche "TYPE " (style 0) + "N" ou "NN" (style 1).
 *
 *  ⚠️ Décomp utilise `CHAR_SPACER (0x77) = "Empty space"` comme pad pour les
 *  numéros < 10 ; ce glyph FILL le tile avec bgColor donc efface le digit
 *  précédent. Notre charmap mappe " " ASCII → 0 (transparent, pas de fill).
 *  Solution : on clear le pixel buffer rect du num AVANT de redraw, indépendant
 *  du char encoding. */
export function FrameType_DrawChoices(selection: number): void {
  const label = gs('gText_FrameType');               // = "TYPE "
  const numberPrefix = gs('gText_FrameTypeNumber');  // = "" (juste les COLOR codes)
  const n = selection + 1;
  const digits = n >= 10 ? `${Math.floor(n / 10)}${n % 10}` : `${n}`;
  const numText = numberPrefix + digits;
  const numX = 32 + 107;
  // Clear le rect num AVANT redraw : couvre h=16 (= ligne complète, sinon le
  // bas du "0" dépasse) et w=20 (= 2 chars × ~10 px max). Couleur 1 =
  // PIXEL_FILL(1) du window init.
  FillWindowPixelRect(WIN_OPTIONS, 1, numX, Y_FRAMETYPE, 20, 16);
  // Label style=0 (= GREEN normal), num style=1 (= RED highlight).
  DrawOptionMenuChoice(label, 104, Y_FRAMETYPE, 0);
  DrawOptionMenuChoice(numText, numX, Y_FRAMETYPE, 1);
}

/** 1:1 décomp option_menu.c:404-419 TextSpeed_ProcessInput. Cycle 0-2. */
export function TextSpeed_ProcessInput(selection: number): number {
  if (JOY_NEW(DPAD_RIGHT)) {
    selection = selection === 2 ? 0 : selection + 1;
    sArrowPressed = true;
  } else if (JOY_NEW(DPAD_LEFT)) {
    selection = selection === 0 ? 2 : selection - 1;
    sArrowPressed = true;
  }
  return selection;
}

/** 1:1 décomp option_menu.c:444-453 BattleScene_ProcessInput. Cycle 0-1. */
export function BattleScene_ProcessInput(selection: number): number {
  if (JOY_NEW(DPAD_RIGHT) || JOY_NEW(DPAD_LEFT)) {
    selection = selection ^ 1;
    sArrowPressed = true;
  }
  return selection;
}

/** 1:1 décomp option_menu.c:467-476 BattleStyle_ProcessInput. */
export function BattleStyle_ProcessInput(selection: number): number {
  if (JOY_NEW(DPAD_RIGHT) || JOY_NEW(DPAD_LEFT)) {
    selection = selection ^ 1;
    sArrowPressed = true;
  }
  return selection;
}

/** 1:1 décomp option_menu.c:490-500 Sound_ProcessInput. */
export function Sound_ProcessInput(selection: number): number {
  if (JOY_NEW(DPAD_RIGHT) || JOY_NEW(DPAD_LEFT)) {
    selection = selection ^ 1;
    sArrowPressed = true;
  }
  return selection;
}

/** 1:1 décomp option_menu.c:580-596 ButtonMode_ProcessInput. Cycle 0-2. */
export function ButtonMode_ProcessInput(selection: number): number {
  if (JOY_NEW(DPAD_RIGHT)) {
    selection = selection === 2 ? 0 : selection + 1;
    sArrowPressed = true;
  } else if (JOY_NEW(DPAD_LEFT)) {
    selection = selection === 0 ? 2 : selection - 1;
    sArrowPressed = true;
  }
  return selection;
}

/** 1:1 décomp option_menu.c:514-539 FrameType_ProcessInput. Cycle 0-19 +
 *  re-load tiles + palette pour preview live. */
export function FrameType_ProcessInput(selection: number): number {
  if (JOY_NEW(DPAD_RIGHT)) {
    selection = selection < WINDOW_FRAMES_COUNT - 1 ? selection + 1 : 0;
    const fp = GetWindowFrameTilesPal(selection);
    LoadBgTiles(1, fp.tiles, 0x120, 0x1A2);
    LoadPalette(fp.pal as unknown as Uint16Array, BG_PLTT_ID(7), PLTT_SIZE_4BPP);
    sArrowPressed = true;
  } else if (JOY_NEW(DPAD_LEFT)) {
    selection = selection !== 0 ? selection - 1 : WINDOW_FRAMES_COUNT - 1;
    const fp = GetWindowFrameTilesPal(selection);
    LoadBgTiles(1, fp.tiles, 0x120, 0x1A2);
    LoadPalette(fp.pal as unknown as Uint16Array, BG_PLTT_ID(7), PLTT_SIZE_4BPP);
    sArrowPressed = true;
  }
  return selection;
}

// ─── Bg + text palette helpers ─────────────────────────────────────────────

/** 1:1 décomp option_menu.c:50 sOptionMenuBg_Pal = inline RGB(17,18,31).
 *  Comme c'est inline (pas un fichier), on reconstruit la palette ici. */
export const sOptionMenuBg_Pal: Uint16Array = (() => {
  const pal = new Uint16Array(16);
  // Décomp `INCBIN_U16("graphics/interface/option_menu_bg.gbapal")` ou inline.
  // option_menu_data.ts dit : sOptionMenuBg_Pal_COLORS = [{r:136,g:144,b:248}]
  // RGB(136,144,248) en RGB15 = ((248>>3)<<10) | ((144>>3)<<5) | (136>>3)
  const r = 136 >> 3, g = 144 >> 3, b = 248 >> 3;
  pal[0] = (b << 10) | (g << 5) | r; // RGB15 little-endian
  return pal;
})();

/** sOptionMenuText_Pal helper (= access cached). */
export function getOptionMenuTextPal(): Uint16Array {
  return (getAsset('sOptionMenuText_Pal') as Uint16Array | undefined) ?? new Uint16Array(16);
}

// ─── DMA helpers (= vraies fonctions 1:1 décomp depuis decomp-globals) ──────
// Phase D-cleanup audit session 83 : retiré les stubs no-op locaux qui
// dupliquaient (en cassant la sémantique) les vrais DmaClearLarge16/DmaClear32
// de decomp-globals.ts. Ces helpers font le bon dispatch sur VRAM/OAM/PLTT.
import { DmaClearLarge16, DmaClear32 } from './decomp-globals';

// Import templates depuis option_menu-data.ts (auto-générés)
import { sOptionMenuBgTemplates, sOptionMenuWinTemplates } from './decomp-data/auto/src/option_menu-data';

// ─── Globals exposure (auto file uses globalThis scope) ─────────────────────

const _globals: Record<string, unknown> = {
  // Templates auto file (= references via bare identifier)
  sOptionMenuBgTemplates,
  sOptionMenuWinTemplates,
  // DMA helpers (= 1:1 décomp depuis decomp-globals, dispatch VRAM/OAM/PLTT)
  DmaClearLarge16, DmaClear32,
  // State
  sArrowPressed: undefined,  // Will be re-defined below as getter/setter
  // Helpers (GetWindowFrameTilesPal exposé via gba-text-window.ts foundation)
  DrawHeaderText, DrawOptionMenuTexts, DrawBgWindowFrames,
  HighlightOptionMenuItem, DrawOptionMenuChoice,
  TextSpeed_DrawChoices, BattleScene_DrawChoices, BattleStyle_DrawChoices,
  Sound_DrawChoices, ButtonMode_DrawChoices, FrameType_DrawChoices,
  TextSpeed_ProcessInput, BattleScene_ProcessInput, BattleStyle_ProcessInput,
  Sound_ProcessInput, ButtonMode_ProcessInput, FrameType_ProcessInput,
  // Data (inline pal + cached pal accessor pattern)
  sOptionMenuBg_Pal,
  // Constants the auto file uses with `BG_PLTT_ID(0)` etc. — already provided
  // via gba-global-scope, but we make sure
};
for (const [k, v] of Object.entries(_globals)) {
  (globalThis as Record<string, unknown>)[k] = v;
}
// sArrowPressed is mutable from the auto file → use getter/setter on globalThis
Object.defineProperty(globalThis, 'sArrowPressed', {
  get: () => sArrowPressed,
  set: (v: boolean) => { sArrowPressed = v; },
  enumerable: true, configurable: true,
});

// sOptionMenuText_Pal as a dynamic getter (= cached at fetch time).
Object.defineProperty(globalThis, 'sOptionMenuText_Pal', {
  get: () => getOptionMenuTextPal(),
  enumerable: true, configurable: true,
});

// gSaveBlock2Ptr fields options* + persistence localStorage : cf.
// `gba-menu-system.ts` (= source unique pour save block + Proxy auto-persist).
