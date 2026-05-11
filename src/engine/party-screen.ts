/**
 * party-screen.ts — Écran POKéMON (= menu d'équipe) 1:1 décomp `src/party_menu.c`.
 *
 * Architecture : CB2 swap (= même pattern que bag-screen / trainer-card-screen).
 * L'OW arrête de tick pendant l'écran. Retour via `gMain.savedCallback =
 * CB2_ReturnToFieldWithOpenMenu_Manual`.
 *
 * BG layout 1:1 décomp `sPartyMenuBgTemplates` (party_menu.h:1) :
 *   - BG0 charBase=0 mapBase=31 priority=1 → text windows (= slots + msg)
 *   - BG1 charBase=0 mapBase=30 priority=2 → reserved (= cursor/decoration)
 *   - BG2 charBase=0 mapBase=28 priority=0 screenSize=1 → bg.bin background
 *
 * Window templates 1:1 décomp `sSinglePartyMenuWindowTemplate` (party_menu.h:123) :
 *   - Slot 0 (= big left)  : (1, 3), 10×7, palette 3, baseBlock 0x63
 *   - Slot 1..5 (= right)  : (12, 1+3*N), 18×3, palette 4..8, baseBlock 0xA9+
 *   - WIN_MSG (= bottom)   : bg=2, (1, 15), 28×4, palette 14, baseBlock 0x1DF
 *
 * MVP scope (= 1ère itération, polish à venir) :
 *   - 6 slots avec text rendering (nickname, Lv, HP)
 *   - Pokémon icon OAM per slot (16×16, animated front)
 *   - Bottom dialog "Choisir un PKMN ou annuler"
 *   - SORTIR button (= text, polish icon plus tard)
 *   - A/B/START close
 *
 * Future polish :
 *   - HP bar tilemap (= rendre la barre verte/jaune/rouge)
 *   - Gender symbol ♂/♀
 *   - Status icon (= PSN/PAR/etc.)
 *   - Held item icon (hold_icons.png)
 *   - Cursor highlight (= ROM utilise palette swap par slot)
 *   - Action menu (RESUME / OBJET / RETOUR au press A)
 *   - Stats pages flip (= INFOS / APTITU / CAPACITES)
 */

import {
  InitWindows, AddWindow, FillWindowPixelBuffer, FillWindowPixelRect,
  PutWindowTilemap, CopyWindowToVram,
  BlitBitmapToWindow,
  DrawStdFrameWithCustomTileAndPalette,
  RemoveWindow, ShowBg, HideBg,
  type WindowTemplate,
} from './gba-window-system';
import { LoadUserWindowBorderGfx } from './gba-text-window';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import { gameState } from './game-state';
import { getMonGenderSymbol, MON_MALE, MON_FEMALE } from './pokemon';
import {
  PlaySE, LoadPalette, getRuntime, OBJ_PLTT_ID,
  BlendPalettes, ResetPaletteFade, ResetTasks, gMain,
} from './decomp-globals';
import { ResetSpriteData } from './decomp-bridge';
import { CB2_ReturnToFieldWithOpenMenu_Manual } from './option-menu-return';
import { FadeScreen, FADE_FROM_BLACK } from './fade-screen';
import { loadIndexedPngStrict, loadGbaPal, loadTilemapBin, loadTileBin } from './gba/png-loader';
import { OpenSummaryScreen } from './summary-screen';
import { getString } from './gba-strings';
import type { DecompTask } from './decomp-runtime';
import type { PokemonInstance } from './pokemon';

const FONT_NORMAL = 1;
const FONT_SMALL = 0;  // 1:1 décomp party_menu uses FONT_SMALL for nickname/level/HP
const TEXT_SKIP_DRAW = 255;
const STD_FRAME_TILE = 0x214;
const STD_FRAME_PAL = 14;
/** 1:1 décomp `sFontColorTable[0]` (party_menu.h:115) :
 *  [BG=TRANSPARENT, FG=LIGHT_GRAY, SHADOW=DARK_GRAY] = [0, 3, 2]. */
const COLOR_TEXT: [number, number, number] = [0, 3, 2];
const COLOR_HP: [number, number, number] = [0, 3, 2];
/** 1:1 décomp `sFontColorTable[2]` (party_menu.h:117) gender symbol :
 *  [TRANSPARENT, TEXT_DYNAMIC_COLOR_2 (=0xB), TEXT_DYNAMIC_COLOR_3 (=0xC)].
 *  Les dynamic colors aux positions 11/12 dans la sub-pal sont patched
 *  runtime selon le gender via sGenderMalePalIds [59,60] (rouge ♂) ou
 *  sGenderFemalePalIds [75,76] (bleu ♀) — cf. _loadGenderColors. */
const COLOR_GENDER: [number, number, number] = [0, 0xB, 0xC];
const sGenderMalePalIds   = [59, 60];
const sGenderFemalePalIds = [75, 76];

/** 1:1 décomp `#define PARTY_PAL_*` (party_menu.c:150). */
const PARTY_PAL_SELECTED    = 1 << 0;
const PARTY_PAL_FAINTED     = 1 << 1;
const PARTY_PAL_TO_SWITCH   = 1 << 2;
const PARTY_PAL_MULTI_ALT   = 1 << 3;
const PARTY_PAL_SWITCHING   = 1 << 4;
const PARTY_PAL_TO_SOFTBOIL = 1 << 5;
const PARTY_PAL_NO_MON      = 1 << 6;

/** 1:1 décomp palette offset arrays (party_menu.h:574..596).
 *  *PalIds = indices dans le bg.pal global (176 entries) à copier dans la sub-pal du window slot.
 *  *PalOffsets = positions cibles dans la sub-pal (0-15). */
const sPartyBoxPalOffsets1     = [4, 5, 6];
const sPartyBoxPalOffsets2     = [1, 7, 8];
const sPartyBoxNoMonPalOffsets = [1, 11, 12];

const sPartyBoxEmptySlotPalIds1       = [52, 53, 54];
const sPartyBoxEmptySlotPalIds2       = [49, 55, 56];
const sPartyBoxCurrSelectionPalIds1   = [116, 117, 118];
const sPartyBoxCurrSelectionPalIds2   = [97, 103, 104];
const sPartyBoxFaintedPalIds1         = [84, 85, 86];
const sPartyBoxFaintedPalIds2         = [81, 87, 88];
const sPartyBoxCurrSelectionFaintedPalIds = [148, 149, 150];
const sPartyBoxSelectedForActionPalIds1   = [100, 101, 102];
const sPartyBoxSelectedForActionPalIds2   = [161, 167, 168];
const sPartyBoxMultiPalIds1               = [68, 69, 70];
const sPartyBoxMultiPalIds2               = [65, 71, 72];
const sPartyBoxCurrSelectionMultiPalIds   = [132, 133, 134];
const sPartyBoxNoMonPalIds                = [17, 27, 28];

/** 1:1 décomp HP bar palette ids (party_menu.h:573, 581-583). */
const sHPBarPalOffsets    = [9, 10];
const sHPBarGreenPalIds   = [57, 58];
const sHPBarYellowPalIds  = [73, 74];
const sHPBarRedPalIds     = [89, 90];

/** 1:1 décomp `sPartyBoxInfoRects` dimensions[20-22] = HP bar position
 *  (x, y, width). PARTY_BOX_LEFT_COLUMN (slot 0) : (24, 35, 48).
 *  PARTY_BOX_RIGHT_COLUMN (slots 1-5) : (88, 10, 48). */
const HP_BAR_RECT_LEFT:  [number, number, number] = [24, 35, 48];
const HP_BAR_RECT_RIGHT: [number, number, number] = [88, 10, 48];

/** 1:1 décomp `sPartyMenuBgTemplates` (party_menu.h:1) :
 *  BG0 mapBase=31 priority=1 → windows (= slot frames + text + msg)
 *  BG1 mapBase=30 priority=2 → bg.bin background (= yellow stripes décor)
 *  BG2 mapBase=28 priority=0 screenSize=1 → empty overlay (= laisse BG0+BG1 transparaitre)
 *
 *  ⚠️ `AllocPartyMenuBg` (party_menu.c:719) fait `SetBgTilemapBuffer(1, ...)`
 *  et `AllocPartyMenuBgGfx` (party_menu.c:744) fait `LZDecompressWram(gPartyMenuBg_Tilemap, buf)` →
 *  bg.bin va à BG1, pas BG2. */
const PARTY_TILES_CHAR_BASE = 0;
const PARTY_WIN_MAP_BASE = 31;     // BG0 windows
const PARTY_BG_MAP_BASE = 30;      // BG1 bg.bin
const PARTY_OVERLAY_MAP_BASE = 28; // BG2 empty

/** OAM offsets. */
const ICON_OBJ_PAL_BASE = 5;       // palette 5..7 (= per icon pal index)
const ICON_OBJ_TILE_OFFSET = 0;    // OBJ VRAM offset 0 = base for icons
/** 1:1 décomp pokemon_icon.png 32×64 = 2 frames empilées verticalement.
 *  Chaque frame 32×32 = 16 tiles 4bpp. On réserve 32 tiles par slot (= 6 slots
 *  × 32 = 192 tiles VRAM, fit avant POKEBALL_TILE_BASE=256). */
const ICON_TILES_PER_FRAME = 16;
const ICON_TILES_PER_SLOT  = 32;  // 2 frames × 16 tiles

/** 1:1 décomp `sSinglePartyMenuWindowTemplate` (party_menu.h:123) :
 *  Each slot has unique paletteNum + baseBlock pour color variation par row. */
const SLOT_WINDOW_TEMPLATES: WindowTemplate[] = [
  { bg: 0, tilemapLeft: 1,  tilemapTop: 3,  width: 10, height: 7, paletteNum: 3, baseBlock: 0x63  },  // mon 1 big
  { bg: 0, tilemapLeft: 12, tilemapTop: 1,  width: 18, height: 3, paletteNum: 4, baseBlock: 0xA9  },  // mon 2
  { bg: 0, tilemapLeft: 12, tilemapTop: 4,  width: 18, height: 3, paletteNum: 5, baseBlock: 0xDF  },  // mon 3
  { bg: 0, tilemapLeft: 12, tilemapTop: 7,  width: 18, height: 3, paletteNum: 6, baseBlock: 0x115 },  // mon 4
  { bg: 0, tilemapLeft: 12, tilemapTop: 10, width: 18, height: 3, paletteNum: 7, baseBlock: 0x14B },  // mon 5
  { bg: 0, tilemapLeft: 12, tilemapTop: 13, width: 18, height: 3, paletteNum: 8, baseBlock: 0x181 },  // mon 6
];

/** WIN_MSG : bottom dialog "Choisir un PKMN ou annuler" + SORTIR. */
const MSG_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 28, height: 4, paletteNum: 15, baseBlock: 0x1DF,
};

/** Pokémon icon sprite coords 1:1 décomp `sPartyMenuSpriteCoords[PARTY_LAYOUT_SINGLE]`
 *  (party_menu.h:68) — (iconX, iconY) per slot. */
const ICON_COORDS: Array<[number, number]> = [
  [16,  40],  // slot 0 (big left)
  [104, 18],  // slot 1
  [104, 42],  // slot 2
  [104, 66],  // slot 3
  [104, 90],  // slot 4
  [104, 114], // slot 5
];

interface PartyAssets {
  bgTiles: Uint8Array;
  bgTilemap: Uint16Array;
  bgPalette: Uint16Array;
  /** 1:1 décomp `sSlotTilemap_Main` (party_menu.h:565) :
   *  70 bytes u8, stride=10, layout 10×7 (= window slot 0 size). */
  slotMainTilemap: Uint8Array;
  /** 1:1 décomp `sSlotTilemap_Wide` (party_menu.h:567) :
   *  54 bytes u8, stride=18, layout 18×3 (= window slots 1-5 size). */
  slotWideTilemap: Uint8Array;
  /** 1:1 décomp `sSlotTilemap_WideEmpty` (party_menu.h:569) :
   *  Used by `DrawEmptySlot` for slots with no Pokémon. */
  slotWideEmptyTilemap: Uint8Array;
  // Pokémon icons : loaded lazy per slot below.
}

let _isOpen = false;
let _phase: 'idle' | 'open' | 'action_menu' | 'fading_out' = 'idle';
/** Action menu state : sub-cursor pos + spawned window id. 1:1 décomp
 *  sPartyMenuInternal->actions / numActions / windowId[0]. */
let _actionCursor = 0;
let _actionWindowId = -1;
let _actionList: number[] = [];  // MENU_SUMMARY=0, MENU_ITEM=3, MENU_CANCEL1=2 (= notre order)
let _assets: PartyAssets | null = null;
let _assetsLoading: Promise<PartyAssets> | null = null;
let _slotWindowIds: number[] = [];
let _msgWid = -1;
let _inputTaskId = -1;
let _bounceTaskId = -1;
/** Indexed par slot index (0..5). -1 = pas de mon dans ce slot. */
let _iconOamBySlot: number[] = [-1, -1, -1, -1, -1, -1];
let _iconBaseY: number[] = [0, 0, 0, 0, 0, 0];
let _cancelButtonOamId = -1;
let _bounceCounter = 0;
/** 1:1 décomp `gPartyMenu.slotId` (= currently highlighted slot).
 *  Valeurs : 0..5 (mons), 6 = Confirm (unused single layout), 7 = Cancel button. */
let _slotId = 0;
let _lastSelectedSlot = 0;
let _graphicsReady = false;
let _graphicsLoading = false;
let _windowsReady = false;
let _windowsLoading = false;

async function _loadAssets(): Promise<PartyAssets> {
  if (_assets) return _assets;
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    // 1:1 décomp `LoadCompressedPalette(gPartyMenuBg_Pal, BG_PLTT_ID(0),
    // 11 * PLTT_SIZE_4BPP)` (party_menu.c:749) : load 11 sub-palettes (= 176
    // entries). Le bg.gbapal extrait par extract-all-tile-bins.mjs contient
    // les 11 sub-palettes (= 352 bytes). loadIndexedPngStrict ne retourne
    // que la PLTE chunk PNG (= 16 entries first sub-pal seul) → palette 1+
    // restent vides → bg.bin entries paletteNum=1..10 rendent BLACK.
    const fetchU8 = async (url: string) => new Uint8Array(
      await fetch(url).then(r => {
        if (!r.ok) throw new Error(`fetch failed ${url} → ${r.status}`);
        return r.arrayBuffer();
      })
    );
    const [bgTilesRaw, bgTilemapBin, bgPalFull, slotMain, slotWide, slotWideEmpty] = await Promise.all([
      loadTileBin('/decomp/em/party_menu/bg.png', 4),
      loadTilemapBin('/decomp/em/party_menu/bg.bin'),
      // 1:1 décomp FR `gPartyMenuBg_Pal` = bg.pal JASC text 176 entries
      // (= 11 sub-palettes). Le PLTE chunk PNG ne contient que 16 entries
      // (= sub-pal 0 only) — cf. doc loadIndexedPngStrict pour le pattern.
      loadGbaPal('/decomp/em/party_menu/bg.pal'),
      // 1:1 décomp `sSlotTilemap_Main/_Wide/_WideEmpty` (party_menu.h:565-569).
      // Stride encoded dans `BlitBitmapToPartyWindow_LeftColumn` (= width arg).
      fetchU8('/decomp/em/party_menu/slot_main.bin'),
      fetchU8('/decomp/em/party_menu/slot_wide.bin'),
      fetchU8('/decomp/em/party_menu/slot_wide_empty.bin'),
    ]);
    _assets = {
      bgTiles: bgTilesRaw,
      bgTilemap: bgTilemapBin,
      bgPalette: bgPalFull,  // 176 entries = palettes 0..10
      slotMainTilemap: slotMain,
      slotWideTilemap: slotWide,
      slotWideEmptyTilemap: slotWideEmpty,
    };
    return _assets;
  })();
  return _assetsLoading;
}

/** 1:1 décomp `InitBgs` party_menu.c:715. */
function _initPartyBgs(rt: ReturnType<typeof getRuntime>): void {
  if (!rt) return;
  rt.SetGpuReg(0x00, 0);  // DISPCNT
  rt.SetGpuReg(0x08, 0); rt.SetGpuReg(0x0A, 0); rt.SetGpuReg(0x0C, 0); rt.SetGpuReg(0x0E, 0);
  rt.gba.vram.fill(0);
  for (let i = 0; i < rt.gba.oam.length; i++) {
    const oam = rt.gba.oam[i];
    oam.visible = false; oam.x = 0; oam.y = 0;
    oam.tileId = 0; oam.paletteBank = 0; oam.affineMode = 0;
  }
  for (let i = 0; i < 512; i++) {
    rt.gPlttBufferUnfaded.set(i, 0);
    rt.gPlttBufferFaded.set(i, 0);
  }
  // Direct PLTT clear (bypass bufferTransferDisabled).
  for (let i = 0; i < 256; i++) rt.gba.palette.loadBgRange(i, [0]);
  for (let i = 0; i < 256; i++) rt.gba.palette.loadObjRange(i, [0]);
  // 1:1 décomp BG templates (= party_menu.h:1).
  const bg0c = rt.gba.bg(0).config;
  bg0c.charBaseIndex = PARTY_TILES_CHAR_BASE; bg0c.mapBaseIndex = PARTY_WIN_MAP_BASE;
  bg0c.screenSize = 0; bg0c.paletteMode = 0; bg0c.priority = 1; bg0c.visible = true;
  bg0c.hofs = 0; bg0c.vofs = 0;
  const bg1c = rt.gba.bg(1).config;
  bg1c.charBaseIndex = PARTY_TILES_CHAR_BASE; bg1c.mapBaseIndex = PARTY_BG_MAP_BASE;
  bg1c.screenSize = 0; bg1c.paletteMode = 0; bg1c.priority = 2; bg1c.visible = true;
  bg1c.hofs = 0; bg1c.vofs = 0;
  const bg2c = rt.gba.bg(2).config;
  bg2c.charBaseIndex = PARTY_TILES_CHAR_BASE; bg2c.mapBaseIndex = PARTY_OVERLAY_MAP_BASE;
  bg2c.screenSize = 0; bg2c.paletteMode = 0; bg2c.priority = 0; bg2c.visible = true;
  bg2c.hofs = 0; bg2c.vofs = 0;
  rt.gba.bg(3).config.visible = false;
  rt.SetGpuReg(0x10, 0); rt.SetGpuReg(0x12, 0);
  rt.SetGpuReg(0x14, 0); rt.SetGpuReg(0x16, 0);
  rt.SetGpuReg(0x18, 0); rt.SetGpuReg(0x1A, 0);
  rt.SetGpuReg(0x00, 0x1000 | 0x40 | 0x100 | 0x200 | 0x400);
  rt.SetGpuReg(0x50, 0);
  ShowBg(0); ShowBg(1); ShowBg(2); HideBg(3);
}

function _loadPartyGraphicsCb2(rt: ReturnType<typeof getRuntime>): boolean {
  if (!rt) return false;
  if (_graphicsReady) return true;
  if (_graphicsLoading) return false;
  _graphicsLoading = true;
  void _loadAssets().then((assets) => {
    const r = getRuntime();
    if (!r) { _graphicsLoading = false; return; }
    // Load tiles à charBase=0.
    const charOff = PARTY_TILES_CHAR_BASE * 0x4000;
    r.gba.vram.set(assets.bgTiles, charOff);
    // 1:1 décomp `LZDecompressWram(gPartyMenuBg_Tilemap, sPartyBgTilemapBuffer)` +
    // `SetBgTilemapBuffer(1, ...)` (party_menu.c:719,744) : bg.bin va à BG1
    // mapBase=30, PAS BG2 mapBase=28. BG2 reste vide (= laisse BG0+BG1 transparaitre).
    const bgMapOff = PARTY_BG_MAP_BASE * 0x800;
    const bgBytes = new Uint8Array(
      assets.bgTilemap.buffer, assets.bgTilemap.byteOffset, assets.bgTilemap.byteLength,
    );
    r.gba.vram.set(bgBytes, bgMapOff);
    // 1:1 décomp `LoadCompressedPalette(gPartyMenuBg_Pal, BG_PLTT_ID(0),
    // 11 * PLTT_SIZE_4BPP)` (party_menu.c:749) — load 11 sub-palettes (= 176 entries).
    LoadPalette(assets.bgPalette, 0, assets.bgPalette.length * 2);
    // 1:1 décomp `PartyPaletteBufferCopy(palNum)` (party_menu.c:779) : COPIE
    // palette 3 (= la sub-pal "base" du slot 0 big) vers palettes 4..8 (=
    // les slots wide 1-5). SANS ce step, palettes 4-8 utilisent les sub-pals
    // 4-8 du bg.pal (= des couleurs différentes/roses) au lieu de la même
    // sub-pal base que slot 0. Appelé pour palNum=4..8 sequentially.
    for (let palNum = 4; palNum <= 8; palNum++) {
      const src = new Uint16Array(16);
      for (let k = 0; k < 16; k++) src[k] = assets.bgPalette[3 * 16 + k];
      LoadPalette(src, palNum * 16, 32);
    }
    _graphicsReady = true;
    _graphicsLoading = false;
  }).catch((e) => {
    console.error('[party-screen] graphics load failed:', e);
    _graphicsLoading = false;
  });
  return false;
}

async function _loadPartyWindowsCb2(rt: ReturnType<typeof getRuntime>): Promise<void> {
  if (!rt) return;
  // InitWindows pour 6 slots + msg.
  const ids = InitWindows([...SLOT_WINDOW_TEMPLATES, MSG_WINDOW_TEMPLATE]);
  _slotWindowIds = ids.slice(0, 6);
  _msgWid = ids[6];
  // Load std frame palette pour le frame border autour de WIN_MSG.
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);
  // Load gStandardMenuPalette à BG_PLTT_ID(15) pour text std colors.
  const stdMenuPal = await loadGbaPal('/decomp/em/interface/std_menu.pal');
  LoadPalette(stdMenuPal, 15 * 16, 32);
  // Initial fill transparent + put tilemap.
  for (const wid of _slotWindowIds) {
    FillWindowPixelBuffer(wid, 0x00);
    PutWindowTilemap(wid);
  }
  FillWindowPixelBuffer(_msgWid, 0x11);  // = palette 15 idx 1 = white
  PutWindowTilemap(_msgWid);
}

/** 1:1 décomp `BlitBitmapToPartyWindow` (party_menu.c:2150).
 *  Stamp un tilemap u8 (chaque entry = tile index dans bg.png char data) dans
 *  le window pixel buffer via lookup tiles raw 4bpp depuis `assets.bgTiles`.
 *  Le décomp pattern :
 *    pixels = AllocZeroed(height * width * 32);
 *    for (i, j) : CpuCopy16(GetPartyMenuBgTile(b[x+j + (y+i)*stride]), &pixels[(i*width + j)*32], 32)
 *    BlitBitmapToWindow(wid, pixels, x*8, y*8, width*8, height*8)
 */
function _blitSlotFrame(
  windowId: number,
  tilemap: Uint8Array, stride: number,
  rx: number, ry: number, rw: number, rh: number,
): void {
  if (!_assets) return;
  const pixels = new Uint8Array(rw * rh * 32);
  for (let i = 0; i < rh; i++) {
    for (let j = 0; j < rw; j++) {
      const tileIdx = tilemap[(rx + j) + (ry + i) * stride];
      const srcOff = tileIdx * 32;
      pixels.set(_assets.bgTiles.subarray(srcOff, srcOff + 32), (i * rw + j) * 32);
    }
  }
  BlitBitmapToWindow(windowId, pixels, rx * 8, ry * 8, rw * 8, rh * 8, rw * 8);
}

/** Blit slot frame 1:1 décomp `BlitBitmapToPartyWindow_LeftColumn/RightColumn`. */
function _drawSlotFrame(slotIdx: number): void {
  if (!_assets) return;
  const wid = _slotWindowIds[slotIdx];
  if (wid === undefined) return;
  const mon = (gameState.party as PokemonInstance[])[slotIdx];
  if (slotIdx === 0) {
    // Slot 0 = LeftColumn : slot_main 10×7.
    _blitSlotFrame(wid, _assets.slotMainTilemap, 10, 0, 0, 10, 7);
  } else {
    // Slots 1-5 = RightColumn : slot_wide (occupé) ou slot_wide_empty (vide).
    const tm = mon ? _assets.slotWideTilemap : _assets.slotWideEmptyTilemap;
    _blitSlotFrame(wid, tm, 18, 0, 0, 18, 3);
  }
}

/** Render text for slot N. Positions 1:1 décomp `sPartyBoxInfoRects`
 *  (party_menu.h:32) — Nickname/Level/HP/MaxHP fixed coords per box layout. */
function _drawSlot(slotIdx: number): void {
  if (_slotWindowIds[slotIdx] === undefined) return;
  const wid = _slotWindowIds[slotIdx];
  const mon = (gameState.party as PokemonInstance[])[slotIdx];
  if (!mon) {
    // Slot vide : no text (= just empty frame déjà blit).
    CopyWindowToVram(wid, 3);
    return;
  }
  // 1:1 décomp DisplayPartyPokemonGender (party_menu.c:2333) : symbol "♂"/"♀"
  // affiché à (64, 20) slot 0 left column ou (62, 12) slot 1-5 right column,
  // AVEC palette swap genderMale/Female aux positions TEXT_DYNAMIC_COLOR_2/3
  // de la sub-pal du slot. Color triple stays [0, 0xB, 0xC] for both genders.
  const gSym = getMonGenderSymbol(mon);
  const genderStr = gSym === 'M' ? '♂' : gSym === 'F' ? '♀' : '';
  if (genderStr) {
    const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum ?? 3;
    _loadGenderColors(slotPalNum, gSym === 'M');
  }
  if (slotIdx === 0) {
    // 1:1 décomp PARTY_BOX_LEFT_COLUMN (party_menu.h:32) :
    //   Nickname (24, 11) — width=40
    //   Level    (32, 20) — "N.X"
    //   Gender   (64, 20) — width 8x8
    //   HP       (38, 37)
    //   MaxHP    (53, 37)
    AddTextPrinterParameterized3(wid, FONT_NORMAL, 24, 11, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
    AddTextPrinterParameterized3(wid, FONT_SMALL,  32, 20, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
    if (genderStr) {
      AddTextPrinterParameterized3(wid, FONT_NORMAL, 64, 20, COLOR_GENDER, TEXT_SKIP_DRAW, genderStr);
    }
    AddTextPrinterParameterized3(wid, FONT_SMALL,  38, 37, COLOR_HP,   TEXT_SKIP_DRAW, `${mon.currentHp}/`);
    AddTextPrinterParameterized3(wid, FONT_SMALL,  53, 37, COLOR_HP,   TEXT_SKIP_DRAW, `${mon.maxHp}`);
  } else {
    // 1:1 décomp PARTY_BOX_RIGHT_COLUMN :
    //   Nickname (22, 3) — width=40
    //   Level    (30, 12)
    //   Gender   (62, 12)
    //   HP       (102, 12)
    //   MaxHP    (117, 12)
    AddTextPrinterParameterized3(wid, FONT_NORMAL, 22,  3, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
    AddTextPrinterParameterized3(wid, FONT_SMALL,  30, 12, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
    if (genderStr) {
      AddTextPrinterParameterized3(wid, FONT_NORMAL, 62, 12, COLOR_GENDER, TEXT_SKIP_DRAW, genderStr);
    }
    AddTextPrinterParameterized3(wid, FONT_SMALL, 102, 12, COLOR_HP,   TEXT_SKIP_DRAW, `${mon.currentHp}/`);
    AddTextPrinterParameterized3(wid, FONT_SMALL, 117, 12, COLOR_HP,   TEXT_SKIP_DRAW, `${mon.maxHp}`);
  }
  void MON_MALE; void MON_FEMALE;  // referenced via getMonGenderSymbol
  // 1:1 décomp DisplayPartyPokemonHPBar : draw colored bar fill (green/yellow/
  // red selon HP fraction) avec palette swap aux positions 9-10 de la sub-pal.
  _drawHpBar(slotIdx, mon);
  CopyWindowToVram(wid, 3);
}

function _drawAllSlots(): void {
  // 1:1 décomp order : blit frame d'abord, puis text overlay (= AddTextPrinter
  // écrit dans le même window pixel buffer, par-dessus le frame).
  for (let i = 0; i < 6; i++) {
    _drawSlotFrame(i);
    _drawSlot(i);
  }
}

/** 1:1 décomp `GetHPBarLevel(hp, maxhp)` (battle_interface.c:2527).
 *  Returns 'GREEN' / 'YELLOW' / 'RED' / 'EMPTY' / 'FULL' selon fraction. */
function _getHpBarLevel(hp: number, maxhp: number): 'FULL' | 'GREEN' | 'YELLOW' | 'RED' | 'EMPTY' {
  if (hp === maxhp) return 'FULL';
  const fraction = hp / maxhp;
  if (fraction > 0.5) return 'GREEN';
  if (fraction > 0.2) return 'YELLOW';
  if (fraction > 0) return 'RED';
  return 'EMPTY';
}

/** 1:1 décomp `DisplayPartyPokemonHPBar` (party_menu.c:2402) :
 *  - Load palette colors aux positions [9, 10] avec sHPBar(Green/Yellow/Red)PalIds
 *  - FillWindowPixelRect avec palette idx 9 (top row 1px) + 10 (bottom 2 rows)
 *  - Pour la partie vide (empty), fill avec idx 0x0D et 0x02 (= alternating
 *    fill pattern du décomp). */
function _drawHpBar(slotIdx: number, mon: PokemonInstance): void {
  if (!_assets) return;
  const wid = _slotWindowIds[slotIdx];
  if (wid === undefined) return;
  const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum;
  if (slotPalNum === undefined) return;

  // Load HP bar palette colors selon le level.
  const level = _getHpBarLevel(mon.currentHp, mon.maxHp);
  const palIds =
    (level === 'FULL' || level === 'GREEN') ? sHPBarGreenPalIds
    : level === 'YELLOW' ? sHPBarYellowPalIds
    : sHPBarRedPalIds;
  for (let i = 0; i < 2; i++) {
    const src = new Uint16Array(1);
    src[0] = _assets.bgPalette[palIds[i]];
    LoadPalette(src, slotPalNum * 16 + sHPBarPalOffsets[i], 2);
  }

  // Position de la bar HP : (x, y, w) selon slot layout.
  const [x, y, w] = slotIdx === 0 ? HP_BAR_RECT_LEFT : HP_BAR_RECT_RIGHT;
  // 1:1 décomp GetScaledHPFraction : ratio * width arrondi.
  const hpFraction = Math.floor((mon.currentHp / mon.maxHp) * w);

  // 1:1 décomp FillWindowPixelRect :
  //   row 1 (haut) = palette idx 9 (= sHPBarPalOffsets[0])
  //   row 2-3 (bas) = palette idx 10 (= sHPBarPalOffsets[1])
  FillWindowPixelRect(wid, sHPBarPalOffsets[0], x, y,     hpFraction, 1);
  FillWindowPixelRect(wid, sHPBarPalOffsets[1], x, y + 1, hpFraction, 2);
  // Partie vide alternating fill 0x0D (light gray) + 0x02 (dark gray).
  if (hpFraction !== w) {
    FillWindowPixelRect(wid, 0x0D, x + hpFraction, y,     w - hpFraction, 1);
    FillWindowPixelRect(wid, 0x02, x + hpFraction, y + 1, w - hpFraction, 2);
  }
}

/** 1:1 décomp swap gender colors aux positions TEXT_DYNAMIC_COLOR_2 (=0xB)
 *  et TEXT_DYNAMIC_COLOR_3 (=0xC) dans la sub-pal du slot. Avant de render
 *  le ♂/♀ symbol, le décomp write `bgPalette[sGenderMale/FemalePalIds[i]]`
 *  vers ces positions, puis render avec color triple [0, 0xB, 0xC]. */
function _loadGenderColors(slotPalNum: number, isMale: boolean): void {
  if (!_assets) return;
  const ids = isMale ? sGenderMalePalIds : sGenderFemalePalIds;
  for (let i = 0; i < 2; i++) {
    const src = new Uint16Array(1);
    src[0] = _assets.bgPalette[ids[i]];
    // Position dans la sub-pal = 0xB + i (= TEXT_DYNAMIC_COLOR_2 + offset).
    LoadPalette(src, slotPalNum * 16 + 0xB + i, 2);
  }
}

/** 1:1 décomp `LOAD_PARTY_BOX_PAL` macro (party_menu.c:2198) :
 *  Pour chaque (palId, palOffset) dans les arrays 3-element, copie 1 RGB15 color
 *  depuis `bgPalette[palId]` (= snapshot des 11 sub-pals via PartyMenuInternal->palBuffer)
 *  vers la sub-pal du window slot à position `palOffset + BG_PLTT_ID(slot_pal_num)`. */
function _loadPartyBoxPalSet(slotPalNum: number, palIds: readonly number[], palOffsets: readonly number[]): void {
  if (!_assets) return;
  for (let i = 0; i < 3; i++) {
    const src = new Uint16Array(1);
    src[0] = _assets.bgPalette[palIds[i]];
    LoadPalette(src, slotPalNum * 16 + palOffsets[i], 2);
  }
}

/** 1:1 décomp `LoadPartyBoxPalette` (party_menu.c:2205) :
 *  Sélectionne le palette set selon palFlags + applique 6 color swap (2 sets de 3). */
function _loadPartyBoxPalette(slotIdx: number, palFlags: number): void {
  // Slot palette num = paletteNum du window template (= 3 pour slot 0, 4-8 pour slots 1-5).
  const slotPalNum = SLOT_WINDOW_TEMPLATES[slotIdx]?.paletteNum;
  if (slotPalNum === undefined) return;
  if (palFlags & PARTY_PAL_NO_MON) {
    _loadPartyBoxPalSet(slotPalNum, sPartyBoxNoMonPalIds, sPartyBoxNoMonPalOffsets);
    return;
  }
  if (palFlags & PARTY_PAL_TO_SOFTBOIL) {
    _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds1, sPartyBoxPalOffsets1);
    if (palFlags & PARTY_PAL_SELECTED)
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
    else
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds2, sPartyBoxPalOffsets2);
    return;
  }
  if (palFlags & PARTY_PAL_SWITCHING) {
    _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds1, sPartyBoxPalOffsets1);
    _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds2, sPartyBoxPalOffsets2);
    return;
  }
  if (palFlags & PARTY_PAL_TO_SWITCH) {
    _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds1, sPartyBoxPalOffsets1);
    if (palFlags & PARTY_PAL_SELECTED)
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
    else
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxSelectedForActionPalIds2, sPartyBoxPalOffsets2);
    return;
  }
  if (palFlags & PARTY_PAL_FAINTED) {
    if (palFlags & PARTY_PAL_SELECTED) {
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionFaintedPalIds, sPartyBoxPalOffsets1);
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
    } else {
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxFaintedPalIds1, sPartyBoxPalOffsets1);
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxFaintedPalIds2, sPartyBoxPalOffsets2);
    }
    return;
  }
  if (palFlags & PARTY_PAL_MULTI_ALT) {
    if (palFlags & PARTY_PAL_SELECTED) {
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionMultiPalIds, sPartyBoxPalOffsets1);
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
    } else {
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxMultiPalIds1, sPartyBoxPalOffsets1);
      _loadPartyBoxPalSet(slotPalNum, sPartyBoxMultiPalIds2, sPartyBoxPalOffsets2);
    }
    return;
  }
  if (palFlags & PARTY_PAL_SELECTED) {
    _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds1, sPartyBoxPalOffsets1);
    _loadPartyBoxPalSet(slotPalNum, sPartyBoxCurrSelectionPalIds2, sPartyBoxPalOffsets2);
    return;
  }
  // Default (= non-selected mon slot).
  _loadPartyBoxPalSet(slotPalNum, sPartyBoxEmptySlotPalIds1, sPartyBoxPalOffsets1);
  _loadPartyBoxPalSet(slotPalNum, sPartyBoxEmptySlotPalIds2, sPartyBoxPalOffsets2);
}

/** 1:1 décomp `GetPartyBoxPaletteFlags` (party_menu.c:1165).
 *  Pour notre MVP single-layout sans switching/softboil, juste SELECTED + FAINTED. */
function _getPartyBoxPaletteFlags(slotIdx: number, animNum: number): number {
  let palFlags = 0;
  if (animNum === 1) palFlags |= PARTY_PAL_SELECTED;
  const mon = (gameState.party as PokemonInstance[])[slotIdx];
  if (mon && mon.currentHp === 0) palFlags |= PARTY_PAL_FAINTED;
  return palFlags;
}

/** 1:1 décomp `AnimatePartySlot` (party_menu.c:1120).
 *  animNum=0 = not selected (default), animNum=1 = selected (cursor here). */
function AnimatePartySlot(slotIdx: number, animNum: number): void {
  const PARTY_SIZE = 6, CANCEL = PARTY_SIZE + 1;
  if (slotIdx < PARTY_SIZE) {
    const mon = (gameState.party as PokemonInstance[])[slotIdx];
    if (mon) {
      _loadPartyBoxPalette(slotIdx, _getPartyBoxPaletteFlags(slotIdx, animNum));
    }
    return;
  }
  if (slotIdx === CANCEL) {
    // Cancel button OAM frame swap : animNum=0 → frame Closed, animNum=1 → frame Open.
    // 1:1 décomp PartyMenuStartSpriteAnim. Frame 0 = tile 0..15, frame 1 = tile 16..31.
    const rt = getRuntime();
    if (!rt || _cancelButtonOamId < 0) return;
    const spr = rt.gSprites.get(_cancelButtonOamId);
    if (!spr) return;
    const oam = rt.gba.oam[spr.oamIndex];
    if (!oam) return;
    const POKEBALL_TILE_BASE = 256;
    oam.tileId = POKEBALL_TILE_BASE + (animNum === 1 ? 16 : 0);
  }
}

/** 1:1 décomp `DisplayPartyMenuStdMessage(PARTY_MSG_CHOOSE_MON)` (party_menu.c:2459).
 *  Le message stringId dépend de :
 *    - chooseHalf (= false en single layout) → PARTY_MSG_CHOOSE_MON_AND_CONFIRM
 *    - ShouldUseChooseMonText() = numAliveMons > 1 || PARTY_ACTION_SEND_OUT
 *    - Si >1 alive mons : PARTY_MSG_CHOOSE_MON → "Choisir un POKéMON."
 *    - Si ≤1 alive mons : PARTY_MSG_CHOOSE_MON_OR_CANCEL → "Choisir un PKMN ou annuler."
 *  Strings depuis strings.json FR : gText_ChoosePokemon / gText_ChoosePokemonCancel. */
function _drawMsg(): void {
  if (_msgWid < 0) return;
  FillWindowPixelBuffer(_msgWid, 0x11);
  // 1:1 décomp ShouldUseChooseMonText : count alive mons.
  const party = gameState.party as PokemonInstance[];
  let numAlive = 0;
  for (const m of party) {
    if (m && m.currentHp > 0) numAlive++;
    if (numAlive > 1) break;
  }
  const useChooseMon = numAlive > 1;
  const msg = useChooseMon ? getString('gText_ChoosePokemon') : getString('gText_ChoosePokemonCancel');
  AddTextPrinterParameterized3(_msgWid, FONT_NORMAL, 8, 8, [1, 2, 3], TEXT_SKIP_DRAW, msg);
  CopyWindowToVram(_msgWid, 3);
}

/** Spawn the "SORTIR" cancel button OAM (= big pokeball with text gravé)
 *  1:1 décomp `CreatePokeballButtonSprite(198, 148)` (party_menu.c:4138)
 *  → sprite 32×32 sSpriteTemplate_MenuPokeball, priority=2. */
async function _spawnCancelButtonOam(): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  try {
    // 1:1 décomp gPartyMenuPokeball_Gfx size 0x400 (= 1024 bytes = 32 tiles 4bpp).
    // pokeball.png = 32×32 sprite × 2 anim frames (Closed/Open) = 16+16 = 32 tiles.
    const tiles = await loadTileBin('/decomp/em/party_menu/pokeball.png', 4);
    const pal = await loadGbaPal('/decomp/em/party_menu/pokeball.gbapal');
    // 1:1 décomp gPartyMenuPokeball_Gfx size 0x400 (= 1024 bytes = 32 tiles 4bpp).
    // pokeball.png = 32×32 sprite × 2 anim frames (Closed/Open) = 16+16 = 32 tiles.
    // Write tile data à OBJ VRAM offset 256 (= après les icons aux offsets 0..255).
    // Charge LES DEUX frames (= tiles 256..271 closed, tiles 272..287 open) sinon
    // AnimatePartySlot(CANCEL, 1) montre des garbage tiles pour frame 1.
    const POKEBALL_TILE_BASE = 256;
    rt.gba.objVram.set(tiles.slice(0, 32 * 32), POKEBALL_TILE_BASE * 32);
    // Load palette à OBJ bank 9 (= sépare des icon banks 5-7).
    const POKEBALL_PAL_BANK = 9;
    rt.LoadPaletteObj(pal, OBJ_PLTT_ID(POKEBALL_PAL_BANK));
    // 1:1 décomp `CreateSprite(template, 198, 148, 8)` : sprite center coords.
    const spr = rt.CreateSpriteAtOam({
      x: 198, y: 148,
      shape: 0, size: 2,  // SPRITE_SHAPE(32x32) + SPRITE_SIZE(32x32)
      tileId: POKEBALL_TILE_BASE,
      paletteBank: POKEBALL_PAL_BANK,
      priority: 1,
    });
    _cancelButtonOamId = spr.spriteId;
  } catch (e) {
    console.warn('[party-screen] cancel button load failed:', e);
  }
}

/** Spawn Pokémon icon OAM per slot. MVP : just placeholders (= no actual
 *  icon load). Future : load /decomp/em/pokemon/<dexid>/icon.png + .pal. */
async function _spawnIconOams(): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  _iconOamBySlot = [-1, -1, -1, -1, -1, -1];
  _iconBaseY = [0, 0, 0, 0, 0, 0];
  const party = gameState.party as PokemonInstance[];
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (!mon) continue;
    // Load icon depuis /decomp/em/pokemon/<dexid>/icon.png
    const dexId = mon.speciesEnum.replace(/^SPECIES_/, '').toLowerCase();
    try {
      const iconPng = await loadIndexedPngStrict(`/decomp/em/pokemon/${dexId}/icon.png`, 4);
      // 1:1 décomp pokemon_icon.png = 32×64 sheet vertical stack de 2 anim frames
      // 32×32. Une frame = 4×4 tiles = 16 tiles = 512 bytes 4bpp.
      // Charge LES DEUX frames (= 32 tiles = 1024 bytes) pour idle anim toggle.
      const BYTES_PER_FRAME = ICON_TILES_PER_FRAME * 32;  // 512
      const BYTES_PER_SLOT  = ICON_TILES_PER_SLOT  * 32;  // 1024
      const slotTileBase = ICON_OBJ_TILE_OFFSET / 32 + i * ICON_TILES_PER_SLOT;
      const slotByteOffset = slotTileBase * 32;
      // Frames stockées contiguës : tiles [slotTileBase..+15] = frame 0,
      //   [slotTileBase+16..+31] = frame 1.
      rt.gba.objVram.set(iconPng.charData.slice(0, BYTES_PER_SLOT), slotByteOffset);
      void BYTES_PER_FRAME;
      // Load icon palette (= normal.pal).
      const iconPal = await loadGbaPal(`/decomp/em/pokemon/${dexId}/normal.pal`);
      const palBank = ICON_OBJ_PAL_BASE + i;
      rt.LoadPaletteObj(iconPal, OBJ_PLTT_ID(palBank));
      // 1:1 décomp `CreateMonIconSprite(template, x, y, ...)` (= sprite center
      // coords in pixels). Notre `CreateSpriteAtOam` engine applique
      // CalcCenterToCornerVec INTERNE via le sprite.centerToCornerVec stocké
      // au create. Passer les coords DÉCOMP direct (= sprite center).
      const [x, y] = ICON_COORDS[i];
      const oamY = y;
      const spr = rt.CreateSpriteAtOam({
        x, y,
        shape: 0, size: 2,  // SPRITE_SHAPE(32x32) + SPRITE_SIZE(32x32)
        tileId: slotTileBase,
        paletteBank: palBank,
        priority: 1,
      });
      _iconOamBySlot[i] = spr.spriteId;
      _iconBaseY[i] = oamY;
    } catch (e) {
      console.warn(`[party-screen] icon load failed for ${dexId}:`, e);
    }
  }
}

function _freePartyMenu(): void {
  const rt = getRuntime();
  const freeOam = (id: number) => {
    if (!rt || id < 0) return;
    const spr = rt.gSprites.get(id);
    if (spr) { spr.inUse = false; const oam = rt.gba.oam[spr.oamIndex]; if (oam) oam.visible = false; }
    rt.gSprites.delete(id);
  };
  for (const id of _iconOamBySlot) freeOam(id);
  _iconOamBySlot = [-1, -1, -1, -1, -1, -1];
  _iconBaseY = [0, 0, 0, 0, 0, 0];
  freeOam(_cancelButtonOamId);
  _cancelButtonOamId = -1;
  if (rt && _bounceTaskId >= 0) {
    rt.DestroyTask(_bounceTaskId);
    _bounceTaskId = -1;
  }
  for (const wid of _slotWindowIds) if (wid >= 0) RemoveWindow(wid);
  _slotWindowIds = [];
  if (_msgWid >= 0) { RemoveWindow(_msgWid); _msgWid = -1; }
  if (_actionWindowId >= 0) { RemoveWindow(_actionWindowId); _actionWindowId = -1; }
  _actionList = [];
  _actionCursor = 0;
  _isOpen = false;
  _phase = 'idle';
  _slotId = 0;
  _lastSelectedSlot = 0;
  _graphicsReady = false;
  _graphicsLoading = false;
  _windowsReady = false;
  _windowsLoading = false;
}

function Task_FadeAndClosePartyMenu(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  FadeScreen(1 /* FADE_TO_BLACK */, 0);
  task.func = Task_ClosePartyMenu;
}

function Task_ClosePartyMenu(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  _freePartyMenu();
  const exitCb = rt.gMain.savedCallback;
  if (exitCb) rt.SetMainCallback2(exitCb);
  else rt.SetMainCallback2(null);
  rt.DestroyTask(task.taskId);
  _inputTaskId = -1;
}

/** 1:1 décomp `UpdatePartySelectionSingleLayout` (party_menu.c:1523).
 *  Layout single (= notre cas) : slotId values 0..5 (mons), 7 (Cancel).
 *  Confirm (slot 6) pas utilisé en single layout (= chooseHalf=false). */
function _updateSlotIdSingle(dir: number): void {
  const partyCount = (gameState.party as PokemonInstance[]).length;
  const PARTY_SIZE = 6;
  const CANCEL = PARTY_SIZE + 1;  // = 7
  switch (dir) {
    case MENU_DIR_UP:
      if (_slotId === 0) _slotId = CANCEL;
      else if (_slotId === CANCEL) _slotId = partyCount - 1;
      else _slotId--;
      break;
    case MENU_DIR_DOWN:
      if (_slotId === CANCEL) _slotId = 0;
      else if (_slotId === partyCount - 1) _slotId = CANCEL;
      else _slotId++;
      break;
    case MENU_DIR_RIGHT:
      if (partyCount !== 1 && _slotId === 0) {
        _slotId = _lastSelectedSlot === 0 ? 1 : _lastSelectedSlot;
      }
      break;
    case MENU_DIR_LEFT:
      if (_slotId !== 0 && _slotId !== PARTY_SIZE && _slotId !== CANCEL) {
        _lastSelectedSlot = _slotId;
        _slotId = 0;
      }
      break;
  }
}

/** 1:1 décomp `PartyMenuButtonHandler` (party_menu.c:1455).
 *  Reads gMain.newAndRepeatedKeys for DPAD, JOY_NEW for A/B/START.
 *  Returns A_BUTTON / B_BUTTON / START_BUTTON / 0. */
const MENU_DIR_UP = -1, MENU_DIR_DOWN = 1, MENU_DIR_LEFT = -2, MENU_DIR_RIGHT = 2;
function _partyMenuButtonHandler(rt: ReturnType<typeof getRuntime>): number {
  if (!rt) return 0;
  const PARTY_SIZE = 6, CANCEL = PARTY_SIZE + 1;
  const newRepKeys = rt.gMain.newAndRepeatedKeys ?? rt.gMain.newKeys;
  const newKeys = rt.gMain.newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002, KEY_START = 0x0008;
  const DPAD_UP = 0x40, DPAD_DOWN = 0x80, DPAD_LEFT = 0x20, DPAD_RIGHT = 0x10;
  let dir = 0;
  switch (newRepKeys & (DPAD_UP | DPAD_DOWN | DPAD_LEFT | DPAD_RIGHT)) {
    case DPAD_UP:    dir = MENU_DIR_UP;    break;
    case DPAD_DOWN:  dir = MENU_DIR_DOWN;  break;
    case DPAD_LEFT:  dir = MENU_DIR_LEFT;  break;
    case DPAD_RIGHT: dir = MENU_DIR_RIGHT; break;
  }
  if (newKeys & KEY_START) return KEY_START;
  if (dir !== 0) {
    const prev = _slotId;
    _updateSlotIdSingle(dir);
    if (_slotId !== prev) {
      PlaySE(5);  // SE_SELECT
      // 1:1 décomp UpdateCurrentPartySelection (party_menu.c:1505) :
      // AnimatePartySlot(oldSlot, 0); AnimatePartySlot(newSlot, 1);
      AnimatePartySlot(prev, 0);
      AnimatePartySlot(_slotId, 1);
    }
    return 0;
  }
  // Pressed A on Cancel = treat as B (= close)
  if ((newKeys & KEY_A) && _slotId === CANCEL) return KEY_B;
  return newKeys & (KEY_A | KEY_B);
}

/** 1:1 décomp `SpriteCB_BouncePartyMonIcon` (party_menu.c:4003) + idle anim
 *  via `SpriteCB_UpdatePartyMonIcon` qui cycle entre frame 0 et frame 1 du
 *  icon.png. Le décomp tick `UpdateMonIconFrame(sprite)` qui retourne un
 *  animCmd. Notre engine émule le frame cycle via un counter manuel +
 *  toggle tileId entre frame 0 (= base) et frame 1 (= base+16). */
function Task_PartyMenu_BounceIcon(_task: DecompTask): void {
  if (!_isOpen) return;
  // Run l'animation même dans action_menu state (= icons continuent à idle).
  if (_phase !== 'open' && _phase !== 'action_menu') return;
  _bounceCounter++;
  const rt = getRuntime();
  if (!rt) return;
  // Bounce phase : toggle toutes les ~8 frames pour selected. Match le décomp.
  const bouncePhase = (_bounceCounter >> 3) & 1;
  const bounceY = bouncePhase ? -3 : 1;
  // Idle anim frame phase : toggle toutes les ~32 frames (= 1.9 Hz, lent
  // breathing). Le décomp tick selon sAnimCmds qui varient par species.
  const animFrame = (_bounceCounter >> 5) & 1;  // 0 or 1
  for (let i = 0; i < 6; i++) {
    const id = _iconOamBySlot[i];
    if (id < 0) continue;
    const spr = rt.gSprites.get(id);
    if (!spr) continue;
    const oam = rt.gba.oam[spr.oamIndex];
    if (!oam) continue;
    const base = _iconBaseY[i];
    // Selected slot bounces, autres slots stationary base y.
    oam.y = (i === _slotId) ? base + bounceY : base;
    // Frame swap pour idle anim sur TOUS les slots.
    const slotTileBase = ICON_OBJ_TILE_OFFSET / 32 + i * ICON_TILES_PER_SLOT;
    oam.tileId = slotTileBase + animFrame * ICON_TILES_PER_FRAME;
  }
}

/** 1:1 décomp `DisplaySelectionWindow` SELECTWINDOW_ACTIONS (party_menu.c:2533) :
 *    bg=2, tilemapLeft=19, tilemapTop=(19 - numActions*2), width=10,
 *    height=(numActions*2), paletteNum=14, baseBlock=0x2E9.
 *  Spawn action window à droite + cursor à (cursorDimension, 1 + i*16).
 *  Strings 1:1 décomp FR :
 *    MENU_SUMMARY (= "RESUME") - gText_Summary5
 *    MENU_ITEM    (= "OBJET")  - gText_Item
 *    MENU_CANCEL1 (= "RETOUR") - gText_Cancel2 */
const ACTION_MENU_STRINGS_FR: Record<number, string> = {
  0: 'RESUME',  // MENU_SUMMARY index in our action list
  1: 'OBJET',   // MENU_ITEM
  2: 'RETOUR',  // MENU_CANCEL1
};

/** Re-render action menu contents (= called au open + après cursor move).
 *  Le cursor "▶" est blit devant l'item selected. 1:1 décomp pattern
 *  Menu_MoveCursor + InitMenuInUpperLeftCorner. */
function _renderActionMenuContents(): void {
  if (_actionWindowId < 0) return;
  const numActions = _actionList.length;
  FillWindowPixelBuffer(_actionWindowId, 0x11);  // = palette idx 1 (= white bg)
  PutWindowTilemap(_actionWindowId);
  for (let i = 0; i < numActions; i++) {
    const str = ACTION_MENU_STRINGS_FR[_actionList[i]] ?? '';
    const isSelected = i === _actionCursor;
    // Cursor arrow ▶ devant le selected item à x=0, text à x=8 (= cursorDim).
    if (isSelected) {
      AddTextPrinterParameterized3(
        _actionWindowId, FONT_NORMAL, 0, i * 16 + 1,
        [1, 2, 3] as [number, number, number],
        TEXT_SKIP_DRAW, '▶',
      );
    }
    // sFontColorTable[3] = [WHITE, DARK_GRAY, LIGHT_GRAY] pour actions selection.
    AddTextPrinterParameterized3(
      _actionWindowId, FONT_NORMAL, 8, i * 16 + 1,
      [1, 2, 3] as [number, number, number],
      TEXT_SKIP_DRAW, str,
    );
  }
  CopyWindowToVram(_actionWindowId, 3);
}

function _openActionMenu(rt: ReturnType<typeof getRuntime>): void {
  if (!rt) return;
  PlaySE(5);  // SE_SELECT
  _actionList = [0, 1, 2];  // RESUME, OBJET, RETOUR (= 3 actions field menu)
  _actionCursor = 0;
  const numActions = _actionList.length;
  // 1:1 décomp window template : bg=2 width=10 height=(numActions*2).
  // ⚠️ AddWindow (= 1:1 decomp AddWindow), PAS InitWindows qui wipe tous les
  // windows existants (= bug screen-noir si on l'utilisait ici).
  const tilemapTop = 19 - numActions * 2;
  _actionWindowId = AddWindow({
    bg: 2, tilemapLeft: 19, tilemapTop, width: 10, height: numActions * 2,
    paletteNum: 14, baseBlock: 0x2E9,
  });
  // 1:1 décomp DrawStdFrameWithCustomTileAndPalette(wid, FALSE, 0x4F, 13) :
  // load user window frame tiles à baseTile 0x4F + apply palette 13 + blit
  // frame border tilemap autour du window (= 8 tiles : 4 corners + 4 edges).
  LoadUserWindowBorderGfx(0, 0x4F, 13 * 16);
  DrawStdFrameWithCustomTileAndPalette(_actionWindowId, false, 0x4F, 13);
  _renderActionMenuContents();
  _phase = 'action_menu';
}

function _closeActionMenu(): void {
  if (_actionWindowId >= 0) {
    RemoveWindow(_actionWindowId);
    _actionWindowId = -1;
  }
  _actionList = [];
  _actionCursor = 0;
  _phase = 'open';
}

/** Action menu input handler 1:1 décomp `Task_HandleSelectionMenuInput`
 *  (party_menu.c:2740) : UP/DOWN navigate, A select, B = cancel (= action
 *  at index numActions-1 = RETOUR). */
function _handleActionMenuInput(rt: ReturnType<typeof getRuntime>): void {
  if (!rt) return;
  const newKeys = rt.gMain.newKeys;
  const newRepKeys = rt.gMain.newAndRepeatedKeys ?? newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002;
  const DPAD_UP = 0x40, DPAD_DOWN = 0x80;
  if (newRepKeys & DPAD_UP) {
    if (_actionCursor > 0) { _actionCursor--; PlaySE(5); _renderActionMenuContents(); }
  } else if (newRepKeys & DPAD_DOWN) {
    if (_actionCursor < _actionList.length - 1) { _actionCursor++; PlaySE(5); _renderActionMenuContents(); }
  } else if (newKeys & KEY_A) {
    PlaySE(5);
    const action = _actionList[_actionCursor];
    if (action === 2 /* RETOUR */) {
      _closeActionMenu();
    } else if (action === 0 /* RESUME */) {
      // 1:1 décomp `CursorCb_Summary` (party_menu.c:2770) → CB2 swap vers
      // pokemon summary screen avec le mon courant (= slot pointed by cursor).
      const mon = (gameState.party as PokemonInstance[])[_slotId];
      if (mon) {
        _closeActionMenu();
        // Fade to black + queue summary screen open. Same pattern as start-menu
        // → bag/options/trainer-card (= sPendingScreenAction).
        // For simplicity ici : direct OpenSummaryScreen qui fait CB2 swap.
        // savedCallback restera notre party screen ? Non, on perd la party
        // screen state. Pour vraie 1:1, le décomp utilise un CB2 chain
        // qui restore la party à la fermeture. MVP : open summary direct,
        // sa fermeture revient à overworld via savedCallback du party.
        OpenSummaryScreen(mon);
      } else {
        _closeActionMenu();
      }
    } else if (action === 1 /* OBJET */) {
      // TODO : ouvrir bag pour give/swap item
      console.log('[party-screen] TODO : OBJET → bag give/swap');
      _closeActionMenu();
    }
  } else if (newKeys & KEY_B) {
    PlaySE(5);
    _closeActionMenu();
  }
}

/** Input handler 1:1 décomp `Task_HandleChooseMonInput` (party_menu.c:1260) :
 *    A → if cancel slot: close, else: action menu (RESUME/OBJET/RETOUR)
 *    B → close
 *    START → MoveCursorToConfirm (= no-op si pas chooseHalf)
 *    DPAD → cursor nav */
function Task_PartyMenu_HandleInput(_task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  // Sub-state action menu : dispatcher différent.
  if (_phase === 'action_menu') { _handleActionMenuInput(rt); return; }
  if (_phase !== 'open') return;
  const result = _partyMenuButtonHandler(rt);
  const KEY_A = 0x0001, KEY_B = 0x0002;
  if (result === KEY_A) {
    // A sur slot mon → ouvre action menu. (A sur CANCEL est déjà mappé à B.)
    _openActionMenu(rt);
  } else if (result === KEY_B) {
    PlaySE(5);
    ClosePartyScreen();
  }
  // START: en single layout pas de Confirm → no-op
}

export function VBlankCB_PartyMenuRun(): void { /* transferts auto */ }
export function MainCB2_PartyMenuRun(): void { /* tasks/fade tick auto via runtime */ }

export function CB2_InitPartyMenu(): void {
  const rt = getRuntime();
  if (!rt) return;
  switch (rt.gMain.state) {
    case 0: rt.SetVBlankCallback(null); rt.gMain.state++; break;
    case 1: rt.gMain.state++; break;
    case 2: rt.gMain.state++; break;
    case 3:
      ResetPaletteFade();
      rt.gPaletteFade.bufferTransferDisabled = true;
      rt.gMain.state++; break;
    case 4: ResetSpriteData(); rt.gMain.state++; break;
    case 5: rt.gMain.state++; break;
    case 6: ResetTasks(); rt.gMain.state++; break;
    case 7:
      _initPartyBgs(rt);
      _graphicsReady = false; _graphicsLoading = false;
      _windowsReady = false; _windowsLoading = false;
      rt.gMain.state++; break;
    case 8:
      if (!_loadPartyGraphicsCb2(rt)) break;
      rt.gMain.state++; break;
    case 9:
      if (!_windowsReady) {
        if (!_windowsLoading) {
          _windowsLoading = true;
          void _loadPartyWindowsCb2(rt).then(() => {
            _windowsReady = true;
            _windowsLoading = false;
          });
        }
        break;
      }
      rt.gMain.state++; break;
    case 10: _phase = 'open'; rt.gMain.state++; break;
    case 11: _drawAllSlots(); _drawMsg(); rt.gMain.state++; break;
    case 12:
      _inputTaskId = rt.CreateTask(Task_PartyMenu_HandleInput, 0);
      // 1:1 décomp icon bounce anim task : oscillate y2 du selected mon icon.
      _bounceCounter = 0;
      _bounceTaskId = rt.CreateTask(Task_PartyMenu_BounceIcon, 1);
      rt.gMain.state++; break;
    case 13:
      // Spawn icon OAMs + cancel button async, advance immédiatement.
      void _spawnIconOams();
      void _spawnCancelButtonOam();
      rt.gMain.state++; break;
    case 14:
      // 1:1 décomp `AnimatePartySlot(gPartyMenu.slotId, 1)` (party_menu.c:1116) :
      // initial highlight du slot 0 + default unselected pour les autres mons.
      for (let i = 0; i < 6; i++) AnimatePartySlot(i, 0);
      AnimatePartySlot(_slotId, 1);
      rt.gMain.state++; break;
    case 14: rt.gMain.state++; break;
    case 15: rt.gMain.state++; break;
    case 16: rt.gMain.state++; break;
    case 17: rt.gMain.state++; break;
    case 18: rt.gMain.state++; break;
    case 19:
      BlendPalettes(0xFFFFFFFF, 16, 0);
      rt.gMain.state++; break;
    case 20:
      FadeScreen(FADE_FROM_BLACK, 0);
      rt.gPaletteFade.bufferTransferDisabled = false;
      PlaySE(6);
      rt.gMain.state++; break;
    default:
      rt.SetVBlankCallback(VBlankCB_PartyMenuRun);
      rt.SetMainCallback2(MainCB2_PartyMenuRun);
      _isOpen = true;
      return;
  }
}

export function IsPartyScreenOpen(): boolean {
  return _isOpen;
}

export function OpenPartyScreen(_onCloseLegacy?: () => void): void {
  if (_isOpen) return;
  void _onCloseLegacy;
  void _loadAssets().then(() => {
    const rt = getRuntime();
    if (!rt) return;
    rt.gMain.state = 0;
    rt.gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual;
    rt.SetMainCallback2(CB2_InitPartyMenu);
  }).catch((e) => {
    console.error('[party-screen] preload failed', e);
  });
}

export function ClosePartyScreen(): void {
  if (!_isOpen || _phase === 'fading_out') return;
  _phase = 'fading_out';
  const rt = getRuntime();
  if (!rt) return;
  if (_inputTaskId >= 0) {
    rt.DestroyTask(_inputTaskId);
    _inputTaskId = -1;
  }
  rt.CreateTask(Task_FadeAndClosePartyMenu, 0);
}

/** Stub kept pour start-menu sub-state compat. CB2 swap take over. */
export function TickPartyScreen(_newKeys: number): void {
  void _newKeys;
}

// Expose to globalThis.
{
  const _g: Record<string, unknown> = {
    CB2_InitPartyMenu, MainCB2_PartyMenuRun, VBlankCB_PartyMenuRun,
    Task_FadeAndClosePartyMenu, Task_ClosePartyMenu,
    OpenPartyScreen, ClosePartyScreen, IsPartyScreenOpen,
  };
  for (const [k, v] of Object.entries(_g)) {
    if (typeof (globalThis as Record<string, unknown>)[k] === 'undefined') {
      (globalThis as Record<string, unknown>)[k] = v;
    }
  }
}
