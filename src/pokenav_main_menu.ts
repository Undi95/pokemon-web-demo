// @ts-nocheck — transpilé brut (types stricts au câblage fin ; wire-transpiled.cjs)
/**
 * pokenav_main_menu.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/pokenav_main_menu.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/pokenav_main_menu.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { CpuCopy16 } from '../harness/runtime/decomp-bridge';
import { BlendPalettes, CpuFill16, GetDecompressedDataSize, LoadCompressedSpriteSheet, LoadPalette, SpriteCallbackDummy, getRuntime } from '../harness/runtime/decomp-globals';
import { loadTileBin, extractPngPlte, loadTilemapBin, loadGbaPal } from '../harness/gba/png-loader';
import { RGB_BLACK, ST_OAM_4BPP, ST_OAM_OBJ_NORMAL } from '../harness/runtime/decomp-helpers';
import { TEXT_COLOR_DARK_GRAY, TEXT_COLOR_RED, TEXT_COLOR_WHITE } from '../include/constants/characters';
import { SE_POKENAV_OFF } from '../include/constants/songs';
import { DISPCNT_OBJ_1D_MAP, DISPCNT_OBJ_ON, REG_OFFSET_DISPCNT } from '../include/gba/io_reg';
import { ST_OAM_AFFINE_OFF } from '../include/sprite';
import { FONT_NORMAL } from '../include/text';
import { IsDma3ManagerBusyWithBgCopy } from './battle_bg';
import { PlaySE } from './battle_controllers';
import { DUMMY_WIN_TEMPLATE, PIXEL_FILL, ChangeBgX, ChangeBgY } from './window';
import { getString } from '../harness/runtime/decomp-strings';
import { SetGpuReg } from './gpu_regs';
import { AddTextPrinterParameterized3 } from './menu';
import { BG_PLTT_ID, BeginNormalPaletteFade, GET_B, GET_G, GET_R, OBJ_PLTT_ID, PALETTES_ALL, RGB2, gPaletteFade, gPlttBufferFaded, gPlttBufferUnfaded } from './palette';
import { ANIMCMD_FRAME, ANIMCMD_JUMP, AllocSpritePalette, CreateSprite, DestroySprite, FreeAllSpritePalettes, FreeSpritePaletteByTag, FreeSpriteTilesByTag, GetSpriteTileStartByTag, IndexOfSpritePaletteTag, PLTT_SIZE_4BPP, ResetSpriteData, gDummySpriteAffineAnimTable, gDummySpriteAnimTable, gSprites } from './sprite';
import { COPYWIN_FULL, ChangeBgY, CopyBgTilemapBufferToVram, CopyToBgTilemapBuffer, CopyWindowToVram, FillWindowPixelBuffer, FillWindowPixelRect, FreeAllWindowBuffers, InitBgFromTemplate, InitBgsFromTemplates, InitWindows, PutWindowTilemap, ResetBgsAndClearDma3BusyFlags, ResetTempTileDataBuffers, ShowBg } from './window';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import type {  SpriteTemplate } from './sprite';
import type { BgTemplate } from './window';

// ═══ wire-transpiled (auto) : imports résolus par l'index + sentinelles ═══
import type { OamData } from '../include/gba/types';
import { __wireTodo } from './engine/wire-todo';
// ─── WIRE-TODO : symboles transpilés SANS foyer dans le repo (throw à l'appel) ───
import { AllocSubstruct } from './pokenav_resources'; // câblé (ex-__wireTodo)
import { CreateLoopedTask } from './pokenav_looped_task'; // câblé (ex-__wireTodo)
/** 1:1 `bg.c DecompressAndCopyTileDataToVram(bg, src, size, offset, mode)` — ADAPTATION MOTEUR
 *  (template mail.ts:1060) : l'asset est déjà décompressé (raw 4bpp) → copy direct en VRAM @
 *  charBase*0x4000 du BG. `src == null` (asset pas encore wiré) = no-op. */
export function DecompressAndCopyTileDataToVram(bg: number, src: Uint8Array | Uint16Array | null, _size: number, _offset: number, mode: number): void {
  if (!src) return;
  const rt = getRuntime();
  if (!rt) return;
  if (!mode) {
    // mode 0 = TUILES → char VRAM au charBase DU bg (lu depuis SON config posé par InitBgFromTemplate).
    // AVANT (bug) : `gPokenavMainMenuBgTemplates[bg]` n'a que le bg 0 (bandeau) → undefined sur bg 1/2/3
    // (message/device/dots du menu-handler) → return no-op → tuiles JAMAIS uploadées = couleurs fausses.
    const cfg = rt.gba.bg(bg as 0 | 1 | 2 | 3).config;
    const dest = (cfg.charBaseIndex ?? 0) * 0x4000;
    const bytes = src as Uint8Array;
    rt.gba.vram.set(bytes.subarray(0, Math.min(bytes.length, rt.gba.vram.length - dest)), dest);
  } else {
    // mode != 0 = TILEMAP → buffer tilemap du bg (1:1 comme CopyToBgTilemapBuffer, lu par le compositor).
    CopyToBgTilemapBuffer(bg, src as Uint16Array, 0, 0);
  }
}
// FreeMenuHandlerSubstruct2 = 1:1 pokenav_menu_handler_gfx.c:430 (déjà porté+exporté dans _gfx).
// Importé depuis _gfx (arête runtime : appelé seulement par WaitForPokenavShutdownFade au shutdown,
// jamais au module-init → pas de TDZ). Remplace le stub __wireTodo qui faisait throw la SORTIE.
import { FreeMenuHandlerSubstruct2, ResetBldCnt_ } from './pokenav_menu_handler_gfx';
/** 1:1 `bg.c FreeTempTileDataBuffersIfPossible()` — ADAPTATION MOTEUR (mail.ts:1050) : upload
 *  synchrone (pas de defer queue) → toujours « done » → FALSE. */
export function FreeTempTileDataBuffersIfPossible(): boolean {
  return false;
}
/** 1:1 `u32 GetBgY(u8 bg)` (bg.c:GetBgY, renvoie `sGpuBgConfigs2[bg].bg_y` en Q_8_8).
 *  Adaptation moteur : le port stocke `vofs = bg_y >> 8` dans `cfg.vofs` (cf. ChangeBgY window.ts:875)
 *  → on reconstitue `bg_y` par `<<8` (exact pour le seul appelant, SpriteCB_SpinningPokenav, qui fait `/256`). */
function GetBgY(bg: number): number {
  const rt = getRuntime();
  if (!rt) return 0;
  const cfg = rt.gba.bg(bg as 0 | 1 | 2 | 3).config;
  return ((cfg.vofs ?? 0) & 0x1ff) << 8;
}
import { GetSubstructPtr } from './pokenav_resources'; // câblé (ex-__wireTodo)
import { IsLoopedTaskActive } from './pokenav_looped_task'; // câblé (ex-__wireTodo)
const LZ77UnCompWram: any = __wireTodo('LZ77UnCompWram');
const RequestDma3Copy: any = __wireTodo('RequestDma3Copy');
/** 1:1 `void ResetBgPositions(void)` (menu.c:1898) : remet les 4 BG à (0,0). BG_COORD_SET défini + bas. */
function ResetBgPositions(): void {
  ChangeBgX(0, 0, BG_COORD_SET); ChangeBgX(1, 0, BG_COORD_SET); ChangeBgX(2, 0, BG_COORD_SET); ChangeBgX(3, 0, BG_COORD_SET);
  ChangeBgY(0, 0, BG_COORD_SET); ChangeBgY(1, 0, BG_COORD_SET); ChangeBgY(2, 0, BG_COORD_SET); ChangeBgY(3, 0, BG_COORD_SET);
}
/** 1:1 `bg.c SetBgTilemapBuffer(bg, buffer)` — ADAPTATION MOTEUR (mail.ts:1018) : le buffer tilemap
 *  du BG est géré direct par le moteur (copy via CopyBgTilemapBufferToVram), donc no-op (équiv 1:1,
 *  pas de pointer-stash). */
export function SetBgTilemapBuffer(_bg: number, _buffer: Uint8Array): void {
  /* no-op */
}
const gDecompressionBuffer: any = __wireTodo('gDecompressionBuffer');
// ─── Assets du bandeau (graphics/pokenav/header.png + header.bin) — ADAPTATION MOTEUR : la ROM a
//     les données inline (INCGFX) ; le web les charge async depuis /decomp/em/pokenav/ (servis) puis
//     LoopedTask_InitPokenavMenu case 1 attend le gate `_pokenavHeaderLoaded` (cf. mail.ts). ───────
let gPokenavHeader_Gfx: Uint8Array | null = null;      // header.png .4bpp (décompressé)
let gPokenavHeader_Pal: Uint16Array | null = null;     // header.png .gbapal (palette PLTE)
let gPokenavHeader_Tilemap: Uint16Array | null = null; // header.bin (tilemap)
let _pokenavHeaderLoaded = false;

/** Charge les 3 assets du bandeau (async, une fois). Le gate est relâché même en cas d'échec
 *  (fallback = pas de fond, jamais de freeze — Règle 3). */
function _pokenavLoadHeaderGraphics(): void {
  if (_pokenavHeaderLoaded) return;
  void (async () => {
    try {
      const [gfx, pal, tilemap, navGfx, navPal, hoennGfx, lhPal, mmGfx, cGfx, rGfx, mcGfx] = await Promise.all([
        loadTileBin('/decomp/em/pokenav/header.png', 4),
        extractPngPlte('/decomp/em/pokenav/header.png'),
        loadTilemapBin('/decomp/em/pokenav/header.bin'),
        loadTileBin('/decomp/em/pokenav/nav_icon.png', 4),           // sSpinningPokenav_Gfx
        extractPngPlte('/decomp/em/pokenav/nav_icon.png'),           // sSpinningPokenav_Pal
        loadTileBin('/decomp/em/pokenav/left_headers/hoenn_map.png', 4), // gPokenavLeftHeaderHoennMap_Gfx (1re entête)
        loadGbaPal('/decomp/em/pokenav/left_headers/palette.pal'),   // gPokenavLeftHeader_Pal (palette partagée)
        loadTileBin('/decomp/em/pokenav/left_headers/main_menu.png', 4),  // gPokenavLeftHeaderMainMenu_Gfx
        loadTileBin('/decomp/em/pokenav/left_headers/condition.png', 4),  // gPokenavLeftHeaderCondition_Gfx
        loadTileBin('/decomp/em/pokenav/left_headers/ribbons.png', 4),    // gPokenavLeftHeaderRibbons_Gfx
        loadTileBin('/decomp/em/pokenav/left_headers/match_call.png', 4), // gPokenavLeftHeaderMatchCall_Gfx
      ]);
      gPokenavHeader_Gfx = gfx;
      gPokenavHeader_Pal = pal;
      gPokenavHeader_Tilemap = tilemap;
      // ── icône « spinning pokenav » (nav_icon.png) : les const arrays capturaient null au module-load ──
      sSpinningPokenav_Gfx = navGfx;
      sSpinningPokenav_Pal = navPal;
      sSpinningPokenavSpriteSheet[0].data = navGfx;
      (sSpinningNavgearPalettes[0] as { data: unknown }).data = navPal;
      // ── left-header « Hoenn map » (1re entête listée) + palette partagée ──
      gPokenavLeftHeaderHoennMap_Gfx = hoennGfx;
      gPokenavLeftHeader_Pal = lhPal;
      sMenuLeftHeaderSpriteSheet.data = hoennGfx;
      // bandeaux catégorie : globals + repeupler .data de la table (avait capturé null au module-load)
      gPokenavLeftHeaderMainMenu_Gfx = mmGfx;
      gPokenavLeftHeaderCondition_Gfx = cGfx;
      gPokenavLeftHeaderRibbons_Gfx = rGfx;
      gPokenavLeftHeaderMatchCall_Gfx = mcGfx;
      sMenuLeftHeaderSpriteSheets[0].data = mmGfx;    // POKENAV_GFX_MAIN_MENU
      sMenuLeftHeaderSpriteSheets[1].data = cGfx;     // POKENAV_GFX_CONDITION_MENU
      sMenuLeftHeaderSpriteSheets[2].data = rGfx;     // POKENAV_GFX_RIBBONS_MENU
      sMenuLeftHeaderSpriteSheets[3].data = mcGfx;    // POKENAV_GFX_MATCH_CALL_MENU
      sMenuLeftHeaderSpriteSheets[4].data = hoennGfx; // POKENAV_GFX_MAP_MENU_ZOOMED_OUT
      sMenuLeftHeaderSpriteSheets[5].data = hoennGfx; // POKENAV_GFX_MAP_MENU_ZOOMED_IN
    } catch (e) {
      console.error('[pokenav header gfx load]', e);
    } finally {
      _pokenavHeaderLoaded = true;
    }
  })();
}
// ← left_headers/hoenn_map.png + left_headers/palette.pal (chargés async par _pokenavLoadHeaderGraphics).
let gPokenavLeftHeaderHoennMap_Gfx: any = null;
let gPokenavLeftHeader_Pal: any = null;
// left_headers/{main_menu,condition,ribbons,match_call}.png (bandeaux catégorie, chargés async par
// _pokenavLoadHeaderGraphics) — null au module-load, le .data de sMenuLeftHeaderSpriteSheets est repeuplé au load.
let gPokenavLeftHeaderMainMenu_Gfx: any = null;
let gPokenavLeftHeaderCondition_Gfx: any = null;
let gPokenavLeftHeaderRibbons_Gfx: any = null;
let gPokenavLeftHeaderMatchCall_Gfx: any = null;

// ─── constantes décomp inlinées (headers pas encore dans include/) ───
const POKENAV_SUBSTRUCT_MAIN_MENU = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const LT_INC_AND_CONTINUE = 1; // 1:1 include/pokenav.h:59 (à consolider dans include/)
const LT_INC_AND_PAUSE = 0; // 1:1 include/pokenav.h:58 (à consolider dans include/)
const LT_PAUSE = 2; // 1:1 include/pokenav.h:60 (à consolider dans include/)
const LT_FINISH = 4; // 1:1 include/pokenav.h:62 (à consolider dans include/)
const BG_COORD_ADD = 1; // 1:1 include/bg.h:0 (à consolider dans include/)
const BG_COORD_SET = 0; // 1:1 include/bg.h:0 (à consolider dans include/)
const BG_COORD_SUB = 2; // 1:1 include/bg.h:0 (à consolider dans include/)
const POKENAV_FADE_TO_BLACK = 0; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_FADE_FROM_BLACK = 1; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_FADE_TO_BLACK_ALL = 2; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_FADE_FROM_BLACK_ALL = 3; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_GFX_SUBMENUS_START = 6; // 1:1 include/pokenav.h:114 (à consolider dans include/)
const POKENAV_GFX_MAP_MENU_ZOOMED_OUT = 4; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const OBJ_VRAM0 = 100728832; // 1:1 include/gba/defines.h:54 (à consolider dans include/)
const POKENAV_GFX_MENUS_END = 13; // 1:1 include/pokenav.h:0 (à consolider dans include/)
const POKENAV_GFX_PARTY_MENU = 6; // 1:1 include/pokenav.h:0 (à consolider dans include/)

/** 1:1 `struct Pokenav_MainMenu` (pokenav_main_menu.c:16). */
interface Pokenav_MainMenu {
  loopTask: ((...args: any[]) => any) | null;
  isLoopTaskActiveFunc: ((...args: any[]) => any) | null;
  unused: number;
  currentTaskId: number;
  helpBarWindowId: number;
  palettes: number;
  spinningPokenav: DecompSprite | null;
  leftHeaderSprites: (DecompSprite | null)[];      // 1:1 `struct Sprite *leftHeaderSprites[2]` (bug transpileur « arrays dim 1 »)
  submenuLeftHeaderSprites: (DecompSprite | null)[]; // 1:1 `struct Sprite *submenuLeftHeaderSprites[2]`
  tilemapBuffer: Uint8Array;
}

// This struct uses a 32bit tag, and doesn't have a size field.

// Needed to match LoadLeftHeaderGfxForSubMenu.

/** 1:1 `struct CompressedSpriteSheetNoSize` (pokenav_main_menu.c:32). */
interface CompressedSpriteSheetNoSize {
  data: Uint32Array;
  tag: number;
}

// TRANSPILER-TODO INCGFX : sSpinningPokenav_Pal ← graphics/pokenav/nav_icon.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sSpinningPokenav_Pal: any = null;

// TRANSPILER-TODO INCGFX : sSpinningPokenav_Gfx ← graphics/pokenav/nav_icon.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sSpinningPokenav_Gfx: any = null;

// TRANSPILER-TODO INCGFX : sBlueLightCopy ← graphics/pokenav/blue_light.png (pipeline assets : loadTileBin/loadGbaPal('/decomp/em/…'))
let sBlueLightCopy: any = null;

// Unused copy of sMatchCallBlueLightTiles

/** 1:1 (pokenav_main_menu.c:60) */
export const gPokenavMainMenuBgTemplates = [
  {
    bg: 0, /* :2 */
    charBaseIndex: 0, /* :2 */
    mapBaseIndex: 5, /* :5 */
    screenSize: 0, /* :2 */
    paletteMode: 0, /* :1 */
    priority: 0, /* :2 */
    baseTile: 0, /* :10 */
  },
];

/** 1:1 (pokenav_main_menu.c:73) */
// 1:1 `static const struct WindowTemplate sHelpBarWindowTemplate[]` — corrige un mangling transpileur
// (le tableau était devenu un objet aux clés `bg`/`tilemapLeft`). = 1 fenêtre + terminateur DUMMY.
const sHelpBarWindowTemplate = [
  { bg: 0, tilemapLeft: 1, tilemapTop: 22, width: 16, height: 2, paletteNum: 0, baseBlock: 0x36 },
  DUMMY_WIN_TEMPLATE,
];

/** 1:1 (pokenav_main_menu.c:87) */
// 1:1 tableau de POINTEURS string (pokenav_main_menu.c:87) — pas des octets ; `Uint8Array.from`
// coerçait chaque string en NaN→0 (help bar vide). Tableau JS simple.
const sHelpBarTexts = [
  getString('gText_Pokenav_ClearButtonList'), // [HELPBAR_NONE]
  getString('gText_PokenavMap_ZoomedOutButtons'), // [HELPBAR_MAP_ZOOMED_OUT]
  getString('gText_PokenavMap_ZoomedInButtons'), // [HELPBAR_MAP_ZOOMED_IN]
  getString('gText_PokenavCondition_MonListButtons'), // [HELPBAR_CONDITION_MON_LIST]
  getString('gText_PokenavCondition_MonStatusButtons'), // [HELPBAR_CONDITION_MON_STATUS]
  getString('gText_PokenavCondition_MarkingButtons'), // [HELPBAR_CONDITION_MARKINGS]
  getString('gText_PokenavMatchCall_TrainerListButtons'), // [HELPBAR_MC_TRAINER_LIST]
  getString('gText_PokenavMatchCall_CallMenuButtons'), // [HELPBAR_MC_CALL_MENU]
  getString('gText_PokenavMatchCall_CheckTrainerButtons'), // [HELPBAR_MC_CHECK_PAGE]
  getString('gText_PokenavRibbons_MonListButtons'), // [HELPBAR_RIBBONS_MON_LIST]
  getString('gText_PokenavRibbons_RibbonListButtons'), // [HELPBAR_RIBBONS_LIST]
  getString('gText_PokenavRibbons_RibbonCheckButtons'), // [HELPBAR_RIBBONS_CHECK]
];

/** 1:1 (pokenav_main_menu.c:103) */
const sHelpBarTextColors = Uint8Array.from([
  TEXT_COLOR_RED,
  TEXT_COLOR_WHITE,
  TEXT_COLOR_DARK_GRAY,
]);

/** 1:1 (pokenav_main_menu.c:108) */
const sSpinningPokenavSpriteSheet = [
  {
    data: sSpinningPokenav_Gfx,
    size: 0x1000,
    tag: 0 },
];

/** 1:1 (pokenav_main_menu.c:117) */
const sSpinningNavgearPalettes = [
  {
    data: sSpinningPokenav_Pal,
    tag: 0 },
  [

  ],
];

/** 1:1 (pokenav_main_menu.c:126) */
const sMenuLeftHeaderSpriteSheet = {
  data: gPokenavLeftHeaderHoennMap_Gfx,
  // Hoenn map is the first of the headers listed
  size: 0xC00,
  tag: 2 };

/** 1:1 (pokenav_main_menu.c:133) */
// 1:1 (pokenav_main_menu.c:133) — indexé par menuGfxId. `.size` = nb de TILES (offset du 2e sprite,
// pas des octets), `.tag` = sous-index palette dans gPokenavLeftHeader_Pal. `.data` = tuiles BRUTES
// (peuplées par _pokenavLoadHeaderGraphics ; null au module-load, d'où le repeuplement au load).
const sMenuLeftHeaderSpriteSheets: any[] = [
  { data: gPokenavLeftHeaderMainMenu_Gfx, size: 0x20, tag: 3 },   // [POKENAV_GFX_MAIN_MENU]
  { data: gPokenavLeftHeaderCondition_Gfx, size: 0x20, tag: 1 },  // [POKENAV_GFX_CONDITION_MENU]
  { data: gPokenavLeftHeaderRibbons_Gfx, size: 0x20, tag: 2 },    // [POKENAV_GFX_RIBBONS_MENU]
  { data: gPokenavLeftHeaderMatchCall_Gfx, size: 0x20, tag: 4 },  // [POKENAV_GFX_MATCH_CALL_MENU]
  { data: gPokenavLeftHeaderHoennMap_Gfx, size: 0x20, tag: 0 },   // [POKENAV_GFX_MAP_MENU_ZOOMED_OUT]
  { data: gPokenavLeftHeaderHoennMap_Gfx, size: 0x40, tag: 0 },   // [POKENAV_GFX_MAP_MENU_ZOOMED_IN]
];

/** 1:1 (pokenav_main_menu.c:167) */
const sPokenavSubMenuLeftHeaderSpriteSheets = {
  /* TRANSPILER-TODO [POKENAV_GFX_PARTY_MENU - POKENAV_GFX_SUBMENUS_STA */
  /* TRANSPILER-TODO [POKENAV_GFX_SEARCH_MENU - POKENAV_GFX_SUBMENUS_ST */
  /* TRANSPILER-TODO [POKENAV_GFX_COOL_MENU - POKENAV_GFX_SUBMENUS_STAR */
  /* TRANSPILER-TODO [POKENAV_GFX_BEAUTY_MENU - POKENAV_GFX_SUBMENUS_ST */
  /* TRANSPILER-TODO [POKENAV_GFX_CUTE_MENU - POKENAV_GFX_SUBMENUS_STAR */
  /* TRANSPILER-TODO [POKENAV_GFX_SMART_MENU - POKENAV_GFX_SUBMENUS_STA */
  /* TRANSPILER-TODO [POKENAV_GFX_TOUGH_MENU - POKENAV_GFX_SUBMENUS_STA */
};

/** 1:1 (pokenav_main_menu.c:199) */
const sSpinningPokenavSpriteOam = {
  y: 0, /* :8 */
  affineMode: ST_OAM_AFFINE_OFF, /* :2 */
  objMode: ST_OAM_OBJ_NORMAL, /* :2 */
  bpp: ST_OAM_4BPP, /* :1 */
  shape: 0, /* :2 */
  /* SPRITE_SHAPE(32x32) */
  x: 0, /* :9 */
  size: 2, /* :2 */
  /* SPRITE_SIZE(32x32) */
  tileNum: 0, /* :10 */
  priority: 0, /* :2 */
  paletteNum: 0, /* :4 */
};

/** 1:1 (pokenav_main_menu.c:213) */
const sSpinningPokenavAnims = {
  type: ANIMCMD_FRAME(0, 8),
  frame: ANIMCMD_FRAME(16, 8),
  loop: ANIMCMD_FRAME(32, 8),
  jump: ANIMCMD_FRAME(48, 8),
  f100: ANIMCMD_FRAME(64, 8), /* TRANSPILER-TODO champ */
  f101: ANIMCMD_FRAME(80, 8), /* TRANSPILER-TODO champ */
  f102: ANIMCMD_FRAME(96, 8), /* TRANSPILER-TODO champ */
  f103: ANIMCMD_FRAME(112, 8), /* TRANSPILER-TODO champ */
  f104: ANIMCMD_JUMP(0), /* TRANSPILER-TODO champ */
};

/** 1:1 (pokenav_main_menu.c:226) */
const sSpinningPokenavAnimTable = [
  sSpinningPokenavAnims,
];

/** 1:1 (pokenav_main_menu.c:231) */
const sSpinningPokenavSpriteTemplate = {
  tileTag: 0,
  paletteTag: 0,
  oam: sSpinningPokenavSpriteOam,
  anims: sSpinningPokenavAnimTable,
  images: null,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCB_SpinningPokenav };

/** 1:1 (pokenav_main_menu.c:242) */
const sOamData_LeftHeader = {
  y: 0, /* :8 */
  affineMode: ST_OAM_AFFINE_OFF, /* :2 */
  objMode: ST_OAM_OBJ_NORMAL, /* :2 */
  bpp: ST_OAM_4BPP, /* :1 */
  shape: 1, /* :2 */
  /* SPRITE_SHAPE(64x32) */
  x: 0, /* :9 */
  size: 3, /* :2 */
  /* SPRITE_SIZE(64x32) */
  tileNum: 0, /* :10 */
  priority: 1, /* :2 */
  paletteNum: 0, /* :4 */
};

/** 1:1 (pokenav_main_menu.c:256) */
const sOamData_SubmenuLeftHeader = {
  y: 0, /* :8 */
  affineMode: ST_OAM_AFFINE_OFF, /* :2 */
  objMode: ST_OAM_OBJ_NORMAL, /* :2 */
  bpp: ST_OAM_4BPP, /* :1 */
  shape: 1, /* :2 */
  /* SPRITE_SHAPE(32x16) */
  x: 0, /* :9 */
  matrixNum: 0, /* :5 */
  size: 2, /* :2 */
  /* SPRITE_SIZE(32x16) */
  tileNum: 0, /* :10 */
  priority: 1, /* :2 */
  paletteNum: 0, /* :4 */
};

/** 1:1 (pokenav_main_menu.c:271) */
const sLeftHeaderSpriteTemplate = {
  tileTag: 2,
  paletteTag: 1,
  oam: sOamData_LeftHeader,
  anims: gDummySpriteAnimTable,
  images: null,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCallbackDummy };

/** 1:1 (pokenav_main_menu.c:282) */
const sSubmenuLeftHeaderSpriteTemplate = {
  tileTag: 2,
  paletteTag: 2,
  oam: sOamData_SubmenuLeftHeader,
  anims: gDummySpriteAnimTable,
  images: null,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCallbackDummy };

/** 1:1 `bool32 InitPokenavMainMenu(void)` (pokenav_main_menu.c:293-305). */
export function InitPokenavMainMenu(): boolean {
  let menu: any = null;
  menu = AllocSubstruct(POKENAV_SUBSTRUCT_MAIN_MENU, 0 /* TRANSPILER-TODO sizeof(struct Pokenav_MainMenu) */);
  if (menu == null)
    return false;
  ResetSpriteData();
  FreeAllSpritePalettes();
  _pokenavLoadHeaderGraphics(); // ADAPTATION MOTEUR : lance le chargement async des assets bandeau.
  menu.currentTaskId = CreateLoopedTask(LoopedTask_InitPokenavMenu, 1);
  return true;
}

/** 1:1 `u32 PokenavMainMenuLoopedTaskIsActive(void)` (pokenav_main_menu.c:307-311). */
export function PokenavMainMenuLoopedTaskIsActive(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  return IsLoopedTaskActive(menu.currentTaskId);
}

/** 1:1 `void ShutdownPokenav(void)` (pokenav_main_menu.c:313-318). */
export function ShutdownPokenav(): void {
  PlaySE(SE_POKENAV_OFF);
  ResetBldCnt_();
  BeginNormalPaletteFade(PALETTES_ALL, -1, 0, 16, RGB_BLACK);
}

/** 1:1 `bool32 WaitForPokenavShutdownFade(void)` (pokenav_main_menu.c:320-331). */
export function WaitForPokenavShutdownFade(): boolean {
  if (!gPaletteFade.active)
  {
    FreeMenuHandlerSubstruct2();
    CleanupPokenavMainMenuResources();
    FreeAllWindowBuffers();
    return false;
  }
  return true;
}

/** 1:1 `static u32 LoopedTask_InitPokenavMenu(s32 state)` (pokenav_main_menu.c:333-372). */
function LoopedTask_InitPokenavMenu(state: number): number {
  let menu: any = null;
  switch (state) {
    case 0:
      SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
      FreeAllWindowBuffers();
      ResetBgsAndClearDma3BusyFlags(0);
      InitBgsFromTemplates(0, gPokenavMainMenuBgTemplates, gPokenavMainMenuBgTemplates.length);
      ResetBgPositions();
      ResetTempTileDataBuffers();
      return LT_INC_AND_CONTINUE;
    case 1:
      // ADAPTATION MOTEUR : attendre le chargement async des assets bandeau (la ROM les a inline).
      if (!_pokenavHeaderLoaded) return LT_PAUSE;
      menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
      DecompressAndCopyTileDataToVram(0, gPokenavHeader_Gfx, 0, 0, 0);
      SetBgTilemapBuffer(0, menu.tilemapBuffer);
      CopyToBgTilemapBuffer(0, gPokenavHeader_Tilemap, 0, 0);
      CopyPaletteIntoBufferUnfaded(gPokenavHeader_Pal, BG_PLTT_ID(0), PLTT_SIZE_4BPP);
      CopyBgTilemapBufferToVram(0);
      return LT_INC_AND_PAUSE;
    case 2:
      if (FreeTempTileDataBuffersIfPossible())
        return LT_PAUSE;
      InitHelpBar();
      return LT_INC_AND_PAUSE;
    case 3:
      if (IsDma3ManagerBusyWithBgCopy())
        return LT_PAUSE;
      InitPokenavMainMenuResources();
      CreateLeftHeaderSprites();
      ShowBg(0);
      return LT_FINISH;
    default:
      return LT_FINISH;
  }
}

/** 1:1 `void SetActiveMenuLoopTasks(void *createLoopTask, void *isLoopTaskActive)` (pokenav_main_menu.c:374-380). */
export function SetActiveMenuLoopTasks(createLoopTask: any, isLoopTaskActive: any): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  menu.loopTask = createLoopTask;
  menu.isLoopTaskActiveFunc = isLoopTaskActive;
  menu.unused = 0;
}

/** 1:1 `void RunMainMenuLoopedTask(u32 state)` (pokenav_main_menu.c:382-387). */
export function RunMainMenuLoopedTask(state: number): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  menu.unused = 0;
  menu.loopTask(state);
}

/** 1:1 `u32 IsActiveMenuLoopTaskActive(void)` (pokenav_main_menu.c:389-393). */
export function IsActiveMenuLoopTaskActive(): number {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  return menu.isLoopTaskActiveFunc();
}

/** 1:1 `void SlideMenuHeaderUp(void)` (pokenav_main_menu.c:395-399). */
export function SlideMenuHeaderUp(): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  menu.currentTaskId = CreateLoopedTask(LoopedTask_SlideMenuHeaderUp, 4);
}

/** 1:1 `void SlideMenuHeaderDown(void)` (pokenav_main_menu.c:401-405). */
export function SlideMenuHeaderDown(): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  menu.currentTaskId = CreateLoopedTask(LoopedTask_SlideMenuHeaderDown, 4);
}

/** 1:1 `bool32 MainMenuLoopedTaskIsBusy(void)` (pokenav_main_menu.c:407-411). */
export function MainMenuLoopedTaskIsBusy(): boolean {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  return IsLoopedTaskActive(menu.currentTaskId);
}

/** 1:1 `static u32 LoopedTask_SlideMenuHeaderUp(s32 state)` (pokenav_main_menu.c:413-432). */
function LoopedTask_SlideMenuHeaderUp(state: number): number {
  switch (state) {
    default:
      return LT_FINISH;
    case 1:
      return LT_INC_AND_PAUSE;
    case 0:
      return LT_INC_AND_PAUSE;
    case 2:
      if (ChangeBgY(0, 384, BG_COORD_ADD) >= 0x2000)
      {
        ChangeBgY(0, 0x2000, BG_COORD_SET);
        return LT_FINISH;
      }
      return LT_PAUSE;
  }
}

/** 1:1 `static u32 LoopedTask_SlideMenuHeaderDown(s32 state)` (pokenav_main_menu.c:434-442). */
function LoopedTask_SlideMenuHeaderDown(state: number): number {
  if (ChangeBgY(0, 384, BG_COORD_SUB) <= 0)
  {
    ChangeBgY(0, 0, BG_COORD_SET);
    return LT_FINISH;
  }
  return LT_PAUSE;
}

/** 1:1 `void CopyPaletteIntoBufferUnfaded(const u16 *palette, u32 bufferOffset, u32 size)` (pokenav_main_menu.c:444-447). */
export function CopyPaletteIntoBufferUnfaded(palette: Uint16Array, bufferOffset: number, size: number): void {
  // 1:1 décomp `CpuCopy16(palette, &gPlttBufferUnfaded[bufferOffset], size)`. Le transpileur avait rendu
  // `&gPlttBufferUnfaded[offset]` (POINTEUR destination) en `gPlttBufferUnfaded[offset]` (SCALAIRE = valeur)
  // → CpuCopy16 écrivait dans le vide → AUCUNE palette bg pokénav ne chargeait (bandeau/device/dots stale).
  // gPlttBufferUnfaded est un Proxy : on écrit via `.set(i, v)` comme LoadPalette (decomp-globals:315). size=OCTETS.
  const rt = getRuntime();
  if (!rt || !palette) return;
  const n = size >> 1;
  for (let i = 0; i < n && i < palette.length; i++)
    rt.gPlttBufferUnfaded.set(bufferOffset + i, palette[i]);
}

/** 1:1 `void Pokenav_AllocAndLoadPalettes(const struct SpritePalette *palettes)` (pokenav_main_menu.c:449-467). */
export function Pokenav_AllocAndLoadPalettes(palettes: any): void {
  let index = 0;
  // 1:1 `for (current = palettes; current->data != NULL; current++)` — le décomp itère un
  // tableau de SpritePalette null-terminé. Côté JS `palettes` EST le tableau ; la transcription
  // littérale (`current = palettes; current.data`) lisait `tableau.data` = undefined → boucle
  // jamais entrée → AUCUNE palette allouée (IndexOfSpritePaletteTag = 0xFF, sprites en pal 255).
  // On itère par index ; le terminateur décomp `{}` est ici l'élément vide `[]` (data undefined → break).
  for (let i = 0; i < palettes.length; i++)
  {
    const current = palettes[i];
    if (current == null || current.data == null)
    {
      break;
    }
    index = AllocSpritePalette(current.tag);
    if (index == 0xFF)
    {
      break;
    }
    else
    {
      index = OBJ_PLTT_ID(index);
      CopyPaletteIntoBufferUnfaded(current.data, index, PLTT_SIZE_4BPP);
    }
  }
}

/** 1:1 `void PokenavFillPalette(u32 palIndex, u16 fillValue)` (pokenav_main_menu.c:469-472). */
export function PokenavFillPalette(palIndex: number, fillValue: number): void {
  CpuFill16(fillValue, gPlttBufferFaded[OBJ_PLTT_ID(palIndex)] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, PLTT_SIZE_4BPP);
}

/** 1:1 `void PokenavCopyPalette(const u16 *src, const u16 *dest, int size, int a3, int a4, u16 *palette)` (pokenav_main_menu.c:474-508). */
export function PokenavCopyPalette(src: { v: number }, dest: { v: number }, size: number, a3: number, a4: number, palette: { v: number }): void {
  if (a4 == 0)
  {
    CpuCopy16(src.v, palette.v, size * 2);
  }
  else if (a4 >= a3)
  {
    CpuCopy16(dest.v, palette.v, size * 2);
  }
  else
  {
    let r = 0;
    let g = 0;
    let b = 0;
    let r1 = 0;
    let g1 = 0;
    let b1 = 0;
    while (size--)
    {
      r = GET_R(src.v);
      g = GET_G(src.v);
      b = GET_B(src.v);
      r1 = ((Math.trunc(((GET_R(dest.v) << 8) - (r << 8)) / a3)) * a4) >> 8;
      g1 = ((Math.trunc(((GET_G(dest.v) << 8) - (g << 8)) / a3)) * a4) >> 8;
      b1 = ((Math.trunc(((GET_B(dest.v) << 8) - (b << 8)) / a3)) * a4) >> 8;
      r = (r + r1) & 0x1F;
      //_RGB(r + r1, g + g1, b + b1); doesn't match
      g = (g + g1) & 0x1F;
      b = (b + b1) & 0x1F;
      palette.v = RGB2(r, g, b);
      (src.v++, dest.v++);
      palette.v++;
    }
  }
}

/** 1:1 `void PokenavFadeScreen(s32 fadeType)` (pokenav_main_menu.c:510-529). */
export function PokenavFadeScreen(fadeType: number): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  switch (fadeType) {
    case POKENAV_FADE_TO_BLACK:
      BeginNormalPaletteFade(menu.palettes, -2, 0, 16, RGB_BLACK);
      break;
    case POKENAV_FADE_FROM_BLACK:
      BeginNormalPaletteFade(menu.palettes, -2, 16, 0, RGB_BLACK);
      break;
    case POKENAV_FADE_TO_BLACK_ALL:
      BeginNormalPaletteFade(PALETTES_ALL, -2, 0, 16, RGB_BLACK);
      break;
    case POKENAV_FADE_FROM_BLACK_ALL:
      BeginNormalPaletteFade(PALETTES_ALL, -2, 16, 0, RGB_BLACK);
      break;
  }
}

/** 1:1 `bool32 IsPaletteFadeActive(void)` (pokenav_main_menu.c:531-534). */
export function IsPaletteFadeActive(): boolean {
  return gPaletteFade.active;
}

// Excludes the first obj and bg palettes

/** 1:1 `void FadeToBlackExceptPrimary(void)` (pokenav_main_menu.c:537-540). */
export function FadeToBlackExceptPrimary(): void {
  BlendPalettes(PALETTES_ALL & ~(1 << 16 | 1), 16, RGB_BLACK);
}

/** 1:1 `void InitBgTemplates(const struct BgTemplate *templates, int count)` (pokenav_main_menu.c:542-548). */
export function InitBgTemplates(templates: BgTemplate[], count: number): void {
  let i = 0;
  for (i = 0; i < count; i++)
    InitBgFromTemplate(templates[i]); // 1:1 décomp `InitBgFromTemplate(templates++)` = i-ème template (fix bug transpileur ptr-arith)
}

/** 1:1 `static void InitHelpBar(void)` (pokenav_main_menu.c:550-559). */
function InitHelpBar(): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  InitWindows(sHelpBarWindowTemplate);
  menu.helpBarWindowId = 0;
  DrawHelpBar(menu.helpBarWindowId);
  PutWindowTilemap(menu.helpBarWindowId);
  CopyWindowToVram(menu.helpBarWindowId, COPYWIN_FULL);
}

/** 1:1 `void PrintHelpBarText(u32 textId)` (pokenav_main_menu.c:561-567). */
export function PrintHelpBarText(textId: number): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  DrawHelpBar(menu.helpBarWindowId);
  AddTextPrinterParameterized3(menu.helpBarWindowId, FONT_NORMAL, 0, 1, sHelpBarTextColors, 0, sHelpBarTexts[textId]);
}

/** 1:1 `bool32 WaitForHelpBar(void)` (pokenav_main_menu.c:569-572). */
export function WaitForHelpBar(): boolean {
  return IsDma3ManagerBusyWithBgCopy();
}

/** 1:1 `static void DrawHelpBar(u32 windowId)` (pokenav_main_menu.c:574-578). */
function DrawHelpBar(windowId: number): void {
  FillWindowPixelBuffer(windowId, PIXEL_FILL(4));
  FillWindowPixelRect(windowId, PIXEL_FILL(5), 0, 0, 0x80, 1);
}

// ─── ADAPTATION MOTEUR : le modèle sprite du port est PLAT (pas de `sprite.oam` nested) ───
// Le décomp fait `sprite->oam.tileNum`/`->oam.priority` ; chez nous ces champs sont plats
// (`tileBase`/`sheetTileStart` + la tuile OAM via `oamIndex`), cf. `_oamTileNumAdd` (battle_anim_*)
// et la note « .oam.paletteNum via oamIndex ». Ces 3 helpers reproduisent l'écriture 1:1.
function _spriteOamTileNumAdd(sprite: any, n: number): void {
  if (!sprite || !n) return;
  const oam = getRuntime()?.gba?.oam?.[sprite.oamIndex ?? -1];
  if (oam && typeof oam.tileId === 'number') oam.tileId += n;
  if (typeof sprite.tileBase === 'number') sprite.tileBase += n;
  if (typeof sprite.sheetTileStart === 'number') sprite.sheetTileStart += n;
}
function _spriteOamTileNumSet(sprite: any, v: number): void {
  if (!sprite) return;
  const oam = getRuntime()?.gba?.oam?.[sprite.oamIndex ?? -1];
  if (oam) oam.tileId = v;
  sprite.tileBase = v;
  sprite.sheetTileStart = v;
}
function _spriteOamPrioritySet(sprite: any, p: number): void {
  if (!sprite) return;
  const oam = getRuntime()?.gba?.oam?.[sprite.oamIndex ?? -1];
  if (oam) oam.priority = p;
}

/** 1:1 `static void InitPokenavMainMenuResources(void)` (pokenav_main_menu.c:580-593). */
function InitPokenavMainMenuResources(): void {
  let i = 0;
  let spriteId = 0;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  for (i = 0; i < sSpinningPokenavSpriteSheet.length; i++)
    LoadCompressedSpriteSheet(sSpinningPokenavSpriteSheet[i]);
  Pokenav_AllocAndLoadPalettes(sSpinningNavgearPalettes);
  menu.palettes = ~1 & ~(0x10000 << IndexOfSpritePaletteTag(0));
  spriteId = CreateSprite(sSpinningPokenavSpriteTemplate, 220, 12, 0);
  menu.spinningPokenav = gSprites[spriteId];
}

/** 1:1 `static void CleanupPokenavMainMenuResources(void)` (pokenav_main_menu.c:595-602). */
function CleanupPokenavMainMenuResources(): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  DestroySprite(menu.spinningPokenav);
  FreeSpriteTilesByTag(0);
  FreeSpritePaletteByTag(0);
}

/** 1:1 `static void SpriteCB_SpinningPokenav(struct Sprite *sprite)` (pokenav_main_menu.c:604-608). */
function SpriteCB_SpinningPokenav(sprite: DecompSprite): void {
  // If the background starts scrolling, follow it.
  sprite.y2 = (Math.trunc(GetBgY(0) / 256)) * -1;
}

/** 1:1 `struct Sprite *GetSpinningPokenavSprite(void)` (pokenav_main_menu.c:610-616). */
export function GetSpinningPokenavSprite(): DecompSprite | null {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  menu.spinningPokenav.callback = SpriteCallbackDummy;
  return menu.spinningPokenav;
}

/** 1:1 `void HideSpinningPokenavSprite(void)` (pokenav_main_menu.c:618-629). */
export function HideSpinningPokenavSprite(): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  // Move sprite so it's no longer visible
  menu.spinningPokenav.x = 220;
  menu.spinningPokenav.y = 12;
  menu.spinningPokenav.callback = SpriteCB_SpinningPokenav;
  menu.spinningPokenav.invisible = false;
  _spriteOamPrioritySet(menu.spinningPokenav, 0);
  menu.spinningPokenav.subpriority = 0;
}

/** 1:1 `static void CreateLeftHeaderSprites(void)` (pokenav_main_menu.c:631-655). */
function CreateLeftHeaderSprites(): void {
  let i = 0;
  let spriteId = 0;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  // Adaptation moteur : le substruct est alloué `{}` (AllocSubstruct, pas calloc) → les champs
  // arrays `struct Sprite *[2]` sont undefined ; on les initialise `[null,null]` comme le ferait
  // le zéro-init calloc du décomp (sinon `menu.leftHeaderSprites.length` → crash undefined.length).
  menu.leftHeaderSprites = [null, null];
  menu.submenuLeftHeaderSprites = [null, null];
  LoadCompressedSpriteSheet(sMenuLeftHeaderSpriteSheet);
  AllocSpritePalette(1);
  AllocSpritePalette(2);
  for (i = 0; i < (menu.leftHeaderSprites.length | 0); i++)
  {
    // Create main left header
    spriteId = CreateSprite(sLeftHeaderSpriteTemplate, 0, 0, 1);
    menu.leftHeaderSprites[i] = gSprites[spriteId];
    menu.leftHeaderSprites[i].invisible = true;
    menu.leftHeaderSprites[i].x2 = i * 64;
    // Create submenu left header
    spriteId = CreateSprite(sSubmenuLeftHeaderSpriteTemplate, 0, 0, 2);
    menu.submenuLeftHeaderSprites[i] = gSprites[spriteId];
    menu.submenuLeftHeaderSprites[i].invisible = true;
    menu.submenuLeftHeaderSprites[i].x2 = i * 32;
    menu.submenuLeftHeaderSprites[i].y2 = 18;
    _spriteOamTileNumAdd(menu.submenuLeftHeaderSprites[i], (i * 8) + 64);
  }
}

/** 1:1 `void LoadLeftHeaderGfxForIndex(u32 menuGfxId)` (pokenav_main_menu.c:657-663). */
export function LoadLeftHeaderGfxForIndex(menuGfxId: number): void {
  if (menuGfxId < POKENAV_GFX_SUBMENUS_START)
    LoadLeftHeaderGfxForMenu(menuGfxId);
  else
    LoadLeftHeaderGfxForSubMenu(menuGfxId - POKENAV_GFX_SUBMENUS_START);
}

/** 1:1 `void UpdateRegionMapRightHeaderTiles(u32 menuGfxId)` (pokenav_main_menu.c:665-673). */
export function UpdateRegionMapRightHeaderTiles(menuGfxId: number): void {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  if (menuGfxId == POKENAV_GFX_MAP_MENU_ZOOMED_OUT)
    _spriteOamTileNumSet(menu.leftHeaderSprites[1], GetSpriteTileStartByTag(2) + 32);
  else
    _spriteOamTileNumSet(menu.leftHeaderSprites[1], GetSpriteTileStartByTag(2) + 64);
}

/**
 * French Difference
*/

/** 1:1 `static void LoadLeftHeaderGfxForMenu(u32 menuGfxId)` (pokenav_main_menu.c:678-695). */
function LoadLeftHeaderGfxForMenu(menuGfxId: number): void {
  let menu: any = null;
  let size = 0;
  let tag = 0;
  if (menuGfxId >= POKENAV_GFX_SUBMENUS_START)
    return;
  const sheet = sMenuLeftHeaderSpriteSheets[menuGfxId];
  if (!sheet || !sheet.data)  // .data null tant que _pokenavLoadHeaderGraphics n'a pas fini (async)
    return;
  menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  tag = sheet.tag;
  size = GetDecompressedDataSize(sheet.data);
  LoadPalette(gPokenavLeftHeader_Pal.subarray(tag * 16), OBJ_PLTT_ID(IndexOfSpritePaletteTag(1)), PLTT_SIZE_4BPP);
  // ADAPTATION MOTEUR : `sheet.data` = tuiles BRUTES (PNG loadTileBin), pas LZ. Le décomp fait
  // LZ77UnCompWram(data, gDecompressionBuffer) + RequestDma3Copy(buffer, OBJ_VRAM0 + tileStart*32, size) ;
  // ici écriture directe des tuiles au tile-start du tag 2 (précédent = voie targetTileBase de
  // LoadCompressedSpriteSheet, decomp-globals : `r.gba.objVram.set(bytes, byteOffset)`).
  {
    const rt = getRuntime();
    const tileStart = GetSpriteTileStartByTag(2);
    if (rt && tileStart >= 0) {
      const d = sheet.data;
      const bytes: Uint8Array = d instanceof Uint16Array ? new Uint8Array(d.buffer, d.byteOffset, d.byteLength) : d;
      rt.gba.objVram.set(bytes.subarray(0, Math.min(size, bytes.length)), tileStart * 32);
    }
  }
  _spriteOamTileNumSet(menu.leftHeaderSprites[1], GetSpriteTileStartByTag(2) + sheet.size);
  menu.leftHeaderSprites[1].x2 = 64;
}

/** 1:1 `static void LoadLeftHeaderGfxForSubMenu(u32 menuGfxId)` (pokenav_main_menu.c:697-709). */
function LoadLeftHeaderGfxForSubMenu(menuGfxId: number): void {
  let size = 0;
  let tag = 0;
  if (menuGfxId >= POKENAV_GFX_MENUS_END - POKENAV_GFX_SUBMENUS_START)
    return;
  tag = sPokenavSubMenuLeftHeaderSpriteSheets[menuGfxId].tag;
  size = GetDecompressedDataSize(sPokenavSubMenuLeftHeaderSpriteSheets[menuGfxId].data);
  LoadPalette(gPokenavLeftHeader_Pal[tag * 16] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, OBJ_PLTT_ID(IndexOfSpritePaletteTag(2)), PLTT_SIZE_4BPP);
  LZ77UnCompWram(sPokenavSubMenuLeftHeaderSpriteSheets[menuGfxId].data, gDecompressionBuffer[0x1000] /* TRANSPILER-TODO &élément scalaire (out-param ?) */);
  RequestDma3Copy(gDecompressionBuffer[0x1000] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, OBJ_VRAM0 + 0x800 + (GetSpriteTileStartByTag(2) * 32), size, 1);
}

/** 1:1 `void ShowLeftHeaderGfx(u32 menuGfxId, bool32 isMain, bool32 isOnRightSide)` (pokenav_main_menu.c:711-724). */
export function ShowLeftHeaderGfx(menuGfxId: number, isMain: boolean, isOnRightSide: boolean): void {
  let tileTop = 0;
  if (!isMain)
    tileTop = 0x30;
  else
    tileTop = 0x10;
  if (menuGfxId < POKENAV_GFX_SUBMENUS_START)
    ShowLeftHeaderSprites(tileTop, isOnRightSide);
  else
    ShowLeftHeaderSubmenuSprites(tileTop, isOnRightSide);
}

/** 1:1 `void HideMainOrSubMenuLeftHeader(u32 id, bool32 onRightSide)` (pokenav_main_menu.c:726-732). */
export function HideMainOrSubMenuLeftHeader(id: number, onRightSide: boolean): void {
  if (id < POKENAV_GFX_PARTY_MENU)
    HideLeftHeaderSprites(onRightSide);
  else
    HideLeftHeaderSubmenuSprites(onRightSide);
}

/** 1:1 `void SetLeftHeaderSpritesInvisibility(void)` (pokenav_main_menu.c:734-744). */
export function SetLeftHeaderSpritesInvisibility(): void {
  let i = 0;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  for (i = 0; i < (menu.leftHeaderSprites.length | 0); i++)
  {
    menu.leftHeaderSprites[i].invisible = true;
    menu.submenuLeftHeaderSprites[i].invisible = true;
  }
}

/** 1:1 `bool32 AreLeftHeaderSpritesMoving(void)` (pokenav_main_menu.c:746-754). */
export function AreLeftHeaderSpritesMoving(): boolean {
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  if (menu.leftHeaderSprites[0].callback == SpriteCallbackDummy && menu.submenuLeftHeaderSprites[0].callback == SpriteCallbackDummy)
    return false;
  else
    return true;
}

/** 1:1 `static void ShowLeftHeaderSprites(u32 startY, bool32 isOnRightSide)` (pokenav_main_menu.c:756-771). */
function ShowLeftHeaderSprites(startY: number, isOnRightSide: boolean): void {
  let start = 0;
  let end = 0;
  let i = 0;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  if (!isOnRightSide)
    (start = -96, end = 32);
  else
    (start = 256, end = 144);
  //!< French Difference
  for (i = 0; i < (menu.leftHeaderSprites.length | 0); i++)
  {
    menu.leftHeaderSprites[i].y = startY;
    MoveLeftHeader(menu.leftHeaderSprites[i], start, end, 12);
  }
}

/** 1:1 `static void ShowLeftHeaderSubmenuSprites(u32 startY, bool32 isOnRightSide)` (pokenav_main_menu.c:773-788). */
function ShowLeftHeaderSubmenuSprites(startY: number, isOnRightSide: boolean): void {
  let start = 0;
  let end = 0;
  let i = 0;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  if (!isOnRightSide)
    (start = -96, end = 16);
  else
    (start = 256, end = 192);
  for (i = 0; i < (menu.submenuLeftHeaderSprites.length | 0); i++)
  {
    menu.submenuLeftHeaderSprites[i].y = startY;
    MoveLeftHeader(menu.submenuLeftHeaderSprites[i], start, end, 12);
  }
}

/** 1:1 `static void HideLeftHeaderSprites(bool32 isOnRightSide)` (pokenav_main_menu.c:790-804). */
function HideLeftHeaderSprites(isOnRightSide: boolean): void {
  let start = 0;
  let end = 0;
  let i = 0;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  if (!isOnRightSide)
    (start = 32, end = -96);
  else
    (start = 192, end = 256);
  for (i = 0; i < (menu.leftHeaderSprites.length | 0); i++)
  {
    MoveLeftHeader(menu.leftHeaderSprites[i], start, end, 12);
  }
}

/** 1:1 `static void HideLeftHeaderSubmenuSprites(bool32 isOnRightSide)` (pokenav_main_menu.c:806-820). */
function HideLeftHeaderSubmenuSprites(isOnRightSide: boolean): void {
  let start = 0;
  let end = 0;
  let i = 0;
  let menu = GetSubstructPtr(POKENAV_SUBSTRUCT_MAIN_MENU);
  if (!isOnRightSide)
    (start = 16, end = -96);
  else
    (start = 192, end = 256);
  for (i = 0; i < (menu.submenuLeftHeaderSprites.length | 0); i++)
  {
    MoveLeftHeader(menu.submenuLeftHeaderSprites[i], start, end, 12);
  }
}

/** 1:1 `static void MoveLeftHeader(struct Sprite *sprite, s32 startX, s32 endX, s32 duration)` (pokenav_main_menu.c:822-830). */
function MoveLeftHeader(sprite: DecompSprite, startX: number, endX: number, duration: number): void {
  sprite.x = startX;
  sprite.data[0] = startX * 16;
  sprite.data[1] = Math.trunc((endX - startX) * 16 / duration);
  sprite.data[2] = duration;
  sprite.data[7] = endX;
  sprite.callback = SpriteCB_MoveLeftHeader;
}

/** 1:1 `static void SpriteCB_MoveLeftHeader(struct Sprite *sprite)` (pokenav_main_menu.c:832-849). */
function SpriteCB_MoveLeftHeader(sprite: DecompSprite): void {
  if (sprite.data[2] != 0)
  {
    sprite.data[2]--;
    sprite.data[0] += sprite.data[1];
    sprite.x = sprite.data[0] >> 4;
    if (sprite.x < -16 || sprite.x > 256)
      sprite.invisible = true;
    else
      sprite.invisible = false;
  }
  else
  {
    sprite.x = sprite.data[7];
    sprite.callback = SpriteCallbackDummy;
  }
}
