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
  InitWindows, FillWindowPixelBuffer, PutWindowTilemap, CopyWindowToVram,
  BlitBitmapToWindow,
  RemoveWindow, ShowBg, HideBg,
  type WindowTemplate,
} from './gba-window-system';
import { LoadUserWindowBorderGfx } from './gba-text-window';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import { gameState } from './game-state';
import {
  PlaySE, LoadPalette, getRuntime, OBJ_PLTT_ID,
  BlendPalettes, ResetPaletteFade, ResetTasks, gMain,
} from './decomp-globals';
import { ResetSpriteData } from './decomp-bridge';
import { CB2_ReturnToFieldWithOpenMenu_Manual } from './option-menu-return';
import { FadeScreen, FADE_FROM_BLACK } from './fade-screen';
import { loadIndexedPngStrict, loadGbaPal, loadTilemapBin, loadTileBin } from './gba/png-loader';
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
let _phase: 'idle' | 'open' | 'fading_out' = 'idle';
let _assets: PartyAssets | null = null;
let _assetsLoading: Promise<PartyAssets> | null = null;
let _slotWindowIds: number[] = [];
let _msgWid = -1;
let _inputTaskId = -1;
let _iconOamIds: number[] = [];
let _cursorPos = 0;
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
  if (slotIdx === 0) {
    // 1:1 décomp PARTY_BOX_LEFT_COLUMN :
    //   Nickname (24, 11) — width=40
    //   Level    (32, 20) — "N.X"
    //   HP       (38, 37)
    //   MaxHP    (53, 37)
    AddTextPrinterParameterized3(wid, FONT_NORMAL, 24, 11, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
    AddTextPrinterParameterized3(wid, FONT_SMALL,  32, 20, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
    AddTextPrinterParameterized3(wid, FONT_SMALL,  38, 37, COLOR_HP,   TEXT_SKIP_DRAW, `${mon.currentHp}/`);
    AddTextPrinterParameterized3(wid, FONT_SMALL,  53, 37, COLOR_HP,   TEXT_SKIP_DRAW, `${mon.maxHp}`);
  } else {
    // 1:1 décomp PARTY_BOX_RIGHT_COLUMN :
    //   Nickname (22, 3) — width=40
    //   Level    (30, 12)
    //   HP       (102, 12)
    //   MaxHP    (117, 12)
    AddTextPrinterParameterized3(wid, FONT_NORMAL, 22,  3, COLOR_TEXT, TEXT_SKIP_DRAW, mon.nickname);
    AddTextPrinterParameterized3(wid, FONT_SMALL,  30, 12, COLOR_TEXT, TEXT_SKIP_DRAW, `N.${mon.level}`);
    AddTextPrinterParameterized3(wid, FONT_SMALL, 102, 12, COLOR_HP,   TEXT_SKIP_DRAW, `${mon.currentHp}/`);
    AddTextPrinterParameterized3(wid, FONT_SMALL, 117, 12, COLOR_HP,   TEXT_SKIP_DRAW, `${mon.maxHp}`);
  }
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

function _drawMsg(): void {
  if (_msgWid < 0) return;
  FillWindowPixelBuffer(_msgWid, 0x11);
  AddTextPrinterParameterized3(_msgWid, FONT_NORMAL, 8, 8, [1, 2, 3], TEXT_SKIP_DRAW, 'Choisir un PKMN ou annuler.');
  CopyWindowToVram(_msgWid, 3);
}

/** Spawn Pokémon icon OAM per slot. MVP : just placeholders (= no actual
 *  icon load). Future : load /decomp/em/pokemon/<dexid>/icon.png + .pal. */
async function _spawnIconOams(): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  _iconOamIds = [];
  const party = gameState.party as PokemonInstance[];
  for (let i = 0; i < 6; i++) {
    const mon = party[i];
    if (!mon) continue;
    // Load icon depuis /decomp/em/pokemon/<dexid>/icon.png
    const dexId = mon.speciesEnum.replace(/^SPECIES_/, '').toLowerCase();
    try {
      const iconPng = await loadIndexedPngStrict(`/decomp/em/pokemon/${dexId}/icon.png`, 4);
      // icon.png = 32×64 sheet (4 frames 32×32) OU 16×32 (= 2 frames 16×16).
      // Première frame = top du sheet, 16 tiles 8×8 par frame 32×32.
      // Write tile data à OBJ VRAM offset (= ICON_OBJ_TILE_OFFSET + i * frame_tiles).
      const tilesPerFrame = (iconPng.widthTiles ?? 4) * (iconPng.heightTiles ?? 8) / 4;  // = 8 tiles pour 32×32 frame
      const bytesPerFrame = tilesPerFrame * 32;  // 4bpp = 32 bytes/tile
      const slotOffset = ICON_OBJ_TILE_OFFSET + i * bytesPerFrame;
      rt.gba.objVram.set(iconPng.charData.slice(0, bytesPerFrame), slotOffset);
      // Load icon palette (= normal.pal).
      const iconPal = await loadGbaPal(`/decomp/em/pokemon/${dexId}/normal.pal`);
      const palBank = ICON_OBJ_PAL_BASE + i;
      rt.LoadPaletteObj(iconPal, OBJ_PLTT_ID(palBank));
      // Spawn OAM 32×32 à coords ICON_COORDS[i].
      const [x, y] = ICON_COORDS[i];
      const spr = rt.CreateSpriteAtOam({
        x: x + 16,  // center adjust (= CalcCenterToCornerVec 32×32 = -16)
        y: y + 16,
        shape: 0, size: 2,  // 32×32
        tileId: slotOffset / 32,
        paletteBank: palBank,
        priority: 1,
      });
      _iconOamIds.push(spr.spriteId);
    } catch (e) {
      console.warn(`[party-screen] icon load failed for ${dexId}:`, e);
    }
  }
}

function _freePartyMenu(): void {
  const rt = getRuntime();
  for (const id of _iconOamIds) {
    if (rt) {
      const spr = rt.gSprites.get(id);
      if (spr) { spr.inUse = false; const oam = rt.gba.oam[spr.oamIndex]; if (oam) oam.visible = false; }
      rt.gSprites.delete(id);
    }
  }
  _iconOamIds = [];
  for (const wid of _slotWindowIds) if (wid >= 0) RemoveWindow(wid);
  _slotWindowIds = [];
  if (_msgWid >= 0) { RemoveWindow(_msgWid); _msgWid = -1; }
  _isOpen = false;
  _phase = 'idle';
  _cursorPos = 0;
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

/** Input handler 1:1 décomp `Task_HandleChooseMonInput` :
 *    A → action menu (RESUME/OBJET/RETOUR) [TODO]
 *    B / START → exit
 *    UP/DOWN/LEFT/RIGHT → navigate cursor [TODO] */
function Task_PartyMenu_HandleInput(_task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = rt.gMain.newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002, KEY_START = 0x0008;
  if (_phase !== 'open') return;
  if (newKeys & (KEY_B | KEY_START)) {
    PlaySE(5);
    ClosePartyScreen();
  }
  // TODO : cursor nav + A action menu
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
      rt.gMain.state++; break;
    case 13:
      // Spawn icon OAMs async, advance immédiatement (= icons appear quand load).
      void _spawnIconOams();
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
